# BeeMaster AI — Güvenlik ve Gizlilik (Security & Privacy) v1.0

> **Amaç:** Veri koruma, kimlik doğrulama, yetkilendirme, şifreleme, uyumluluk (KVKK/GDPR), güvenlik testleri ve olay yanıtı prosedürleri.

---

## 1. Güvenlik Prensipleri

| Prensip | Uygulama |
|---------|----------|
| **Defense in Depth** | Ağ, uygulama, veri katmanlarında çoklu koruma |
| **Zero Trust** | Her istek doğrulanır, güven varsayılmaz |
| **Least Privilege** | Minimum gerekli yetki, RLS ile zorunlu kılınır |
| **Privacy by Design** | Gizlilik tasarım aşamasından itibaren entegre |
| **Local-First Privacy** | Hassas veriler cihazdan çıkmaz (Local AI) |
| **Audit Everything** | Her mutasyon `events` tablosuna loglanır |

---

## 2. Kimlik Doğrulama (Authentication)

### 2.1 Yöntemler

| Yöntem | Durum | Detay |
|--------|-------|-------|
| **Email + Şifre** | ✅ Aktif | bcrypt (cost 12), HaveIBeenPwned kontrolü |
| **Magic Link** | ✅ Aktif | 15 dk geçerli, tek kullanımlık, rate-limited |
| **OAuth (Google, Apple)** | ✅ Aktif | Supabase Auth, PKCE flow |
| **2FA (TOTP)** | 🔄 Planlı | Authenticator app, 8 yedek kod |
| **Passkeys (WebAuthn)** | 🔄 Planlı | Platform authenticator, cross-device sync |
| **Biometric (Mobile)** | 🔄 Planlı | FaceID/TouchID, Android BiometricPrompt |

### 2.2 Şifre Politikası

```typescript
// lib/auth/passwordPolicy.ts
export const PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommon: true, // HaveIBeenPwned top 100k
  preventPersonalInfo: true, // İsim, email, telefon
  maxAge: 365, // gün (opsiyonel zorunlu değiştirme)
  historyCount: 5, // Son 5 şifre tekrar edemez
  lockoutThreshold: 5, // 5 başarısız → 15 dk kilit
  lockoutDuration: 15 * 60 * 1000, // ms
};
```

### 2.3 Session Yönetimi

| Özellik | Değer |
|---------|-------|
| **Access Token (JWT)** | 1 saat (RS256, rotating keys) |
| **Refresh Token** | 30 gün (rotating, reuse detection) |
| **Session Tracking** | Device fingerprint, IP, User-Agent |
| **Concurrent Sessions** | Free: 3, Pro: 10, Enterprise: Sınırsız |
| **Revocation** | Anında (token blacklist + DB flag) |

---

## 3. Yetkilendirme (Authorization)

### 3.1 Row Level Security (RLS) - Supabase/PostgreSQL

```sql
-- Her tablo için standart RLS politikası
ALTER TABLE public.hives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own hives"
ON public.hives
FOR ALL
USING (auth.uid() = user_id);

-- Apiary üzerinden erişim (Join ile)
CREATE POLICY "Users can access hives in their apiaries"
ON public.hives
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.apiaries a
    WHERE a.id = hives.apiary_id AND a.user_id = auth.uid()
  )
);
```

### 3.2 Rol Tabanlı Erişim (RBAC) - Enterprise

| Rol | İzinler |
|-----|---------|
| **Owner** | Tüm işlemler, faturalandırma, üye yönetimi, silme |
| **Admin** | Kovan/Üs CRUD, raporlar, üye davet, ayarlar |
| **Manager** | Kovan/Üs CRUD, muayene, hasat, tedavi, besleme |
| **Worker** | Muayene, hasat, besleme, tedavi girişi (kendi atamaları) |
| **Viewer** | Salt okunur, rapor indirme |
| **Veterinarian/Consultant** | Atanan kovanlar: Muayene, tedavi, rapor (yazma) |

---

## 4. Veri Şifreleme (Encryption)

### 4.1 Aktarımda (In Transit)

| Protokol | Konfigürasyon |
|----------|---------------|
| **TLS** | 1.3 zorunlu, 1.2 minimum |
| **HSTS** | `max-age=31536000; includeSubDomains; preload` |
| **Certificate** | Let's Encrypt (auto-renew) / Custom CA (Enterprise) |
| **CSP** | `default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' wss://*.supabase.co https://*.supabase.co` |

### 4.2 Depolanırken (At Rest)

| Veri Türü | Şifreleme |
|-----------|-----------|
| **PostgreSQL (Supabase)** | AES-256 (Supabase yönetir, disk şifreleme) |
| **IndexedDB (Client)** | Web Crypto API (AES-GCM, 256-bit) - v1.5+ |
| **Object Storage (Supabase)** | SSE-S3 (AES-256) |
| **Secrets (API Keys)** | Supabase Vault (HSM-backed) |
| **AI Model Files** | AES-256 (Client-side, key from Vault) |

### 4.3 Uygulama Seviyesi Şifreleme (Client-Side)

```typescript
// lib/crypto/clientEncryption.ts
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

export async function encryptLocal(data: string, password: string): Promise<EncryptedData> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw', encoder.encode(password), 'PBKDF2', false, ['deriveKey']
  );
  
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ['encrypt', 'decrypt']
  );
  
  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoder.encode(data)
  );
  
  return { salt, iv, ciphertext: Array.from(new Uint8Array(ciphertext)) };
}
```

---

## 5. Gizlilik ve Veri Koruma (Privacy & Data Protection)

### 5.1 KVKK / GDPR Uyumu

| Hak | Uygulama |
|-----|----------|
| **Bilgilendirme** | Kayıt anında açıkça onay, `PrivacyPolicy` linki |
| **Erişim** | `/settings/privacy` → "Verilerimi İndir" (JSON/CSV) |
| **Düzeltme** | Profil, kovan, muayene düzenleme |
| **Silme** | Hesap silme → 30 gün iptal süresi → Anonimleştirme |
| **Taşınabilirlik** | JSON/CSV export, API erişimi (Pro+) |
| **İtiraz** | Analitik/ai paylaşımı kapatma toggle'ı |
| **Otomatik Karar** | Yok (AI sadece öneri, karar kullanıcıda) |

### 5.2 Veri Minimizasyonu

| Veri | Toplama Gerekçesi | Saklama Süresi |
|------|-------------------|----------------|
| **İsim, Email, Telefon** | Hesap, bildirim, fatura | Hesap açıkken + 30 gün |
| **Konum (GPS)** | Üs haritası, hava, flora | Hassas: Cihazda. Bulut: İl/İlçe |
| **Finansal (Fiyat, Maliyet)** | Kar/zarar, raporlama | 10 yıl (vergi mevzuatı) |
| **Muayene Verileri** | AI, trend, rapor | Hesap açıkken (silinebilir) |
| **Ses Kayıtları** | STT → Metin (anında silinir) | Metin kalır, ses opsiyonel |
| **Fotoğraflar** | Kanıt, AI görsel analizi | 1 yıl (configurable) |
| **AI Embeddings** | Semantic search, RAG | Hesap açıkken |

### 5.3 AI Gizliliği

```typescript
// lib/ai/privacy.ts
function sanitizeForAI(input: InspectionInput): SanitizedInput {
  return {
    ...input,
    // PII'yi kaldır/hashle
    hiveId: hashId(input.hiveId), // Deterministik hash
    apiaryId: hashId(input.apiaryId),
    userId: hashId(input.userId),
    location: null, // GPS asla gitmez
    apiaryName: null, // Üs adı gitmez
    // Sadece gerekli alanlar:
    strength: input.strength,
    varroaCount: input.varroaCount,
    queenStatus: input.queenStatus,
    frameDistribution: input.frameDistribution,
    // ...
  };
}

// Remote AI'ya giden veride:
const remotePayload = {
  ...sanitized,
  regionCode: getRegionCode(apiaryId), // "TR-21-EGIL" (Il/Ilce)
  strain: 'anatolian', // Genel ırk
  season: 'spring',
};
```

---

## 6. Güvenlik Testleri ve Doğrulama

### 6.1 Otomatik Testler (CI/CD)

| Test Türü | Araç | Sıklık | Kriter |
|-----------|------|--------|--------|
| **SAST** | GitHub CodeQL / SonarCloud | Her PR | Critical/High = 0 |
| **DAST** | OWASP ZAP | Nightly | Critical = 0 |
| **Dependency Scan** | npm audit / Snyk | Her PR / Günlük | Critical = 0 |
| **Container Scan** | Trivy | Her Release | Critical = 0 |
| **Secrets Scan** | TruffleHog / GitLeaks | Her Commit | 0 secret leak |
| **RLS Test** | Custom PG tests | Her Migration | Policy bypass = 0 |

### 6.2 Penetrasyon Testi

| Aralık | Kapsam | Yapıcı |
|--------|--------|--------|
| **Yıllık** | Full scope (Web, API, Mobile, Infra) | 3. taraf sertifikalı kurum |
| **Yarı Yıllık** | Critical paths (Auth, Payment, Sync) | Internal red team |
| **Sürekli** | Bug Bounty (HackerOne/Intigriti) | Topluluk |

### 6.3 Güvenlik Başlıkları ve Yapılandırma

```nginx
# nginx.conf security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(self), microphone=(self), camera=(self), payment=()" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' wss://*.supabase.co https://*.supabase.co https://api.openweathermap.org; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;
```

---

## 7. Olay Yanıtı (Incident Response)

### 7.1 Sınıflandırma

| Seviye | Tanım | SLA (İlk Yanıt) | SLA (Çözüm) | Bildirim |
|--------|-------|-----------------|-------------|----------|
| **P0 - Critical** | Veri sızıntısı, sistem çökmesi, fidye yazılımı | 15 dk | 4 saat | Tüm ekip + Yönetim + Müşteriler (24 sa) |
| **P1 - High** | Auth bypass, RLS bypass, API abuse | 1 saat | 24 saat | Güvenlik ekibi + Lead |
| **P2 - Medium** | XSS, CSRF, Info disclosure | 4 saat | 72 saat | Güvenlik ekibi |
| **P3 - Low** | Düşük riskli bulgular, config issues | 1 gün | 2 sprint | Backlog |

### 7.2 Yanıt Prosedürü

```
1. TESPİT → Alert (Sentry, Datadog, User report, Bug bounty)
   ↓
2. SINIFLANDIRMA → P0/P1/P2/P3 → On-call'e bildirim (PagerDuty)
   ↓
3. İZOLASYON → Etkilendiği sistem/endpoint'i kapat/kısıtla
   ↓
4. ANALİZ → Log review, forensic capture, root cause
   ↓
5. DÜZELTME → Hotfix / Config change / Deploy
   ↓
6. DOĞRULAMA → Test, monitoring artır
   ↓
7. BELGELEME → Postmortem (Blameless), timeline, action items
   ↓
8. BİLDİRİM → Etkilenen kullanıcılar, otoriteler (KVKK 72 saat)
```

### 7.3 Veri İhlali Bildirimi (KVKK Madde 12)

```typescript
// lib/security/breachNotification.ts
interface BreachNotification {
  occurredAt: Date;
  discoveredAt: Date;
  affectedDataCategories: string[]; // 'personal', 'financial', 'health', 'location'
  affectedUserCount: number;
  riskLevel: 'high' | 'medium' | 'low';
  description: string;
  measuresTaken: string[];
  dpoContact: string;
}

async function notifyBreach(breach: BreachNotification): Promise<void> {
  // 1. KVKK'ya bildirim (72 saat içinde)
  await kvkkApi.reportBreach(breach);
  
  // 2. Etkilenen kullanıcılara bildirim (E-posta + In-app)
  await notifyUsers(breach.affectedUserIds, {
    subject: 'Güvenlik Olayı Bildirimi',
    template: 'security-breach',
    data: { breach },
  });
  
  // 3. İç paydaşları bilgilendir
  await notifySlack('#security-incidents', breach);
}
```

---

## 8. Altyapı Güvenliği (Infrastructure Security)

### 8.1 Ağ ve Erişim

| Bileşen | Koruma |
|---------|--------|
| **Supabase** | Private IP, VPC, Security Groups |
| **Edge Functions** | Deno runtime, isolated, no filesystem |
| **CDN (Cloudflare/Netlify)** | WAF, DDoS protection, Bot management |
| **DNS** | DNSSEC, CAA records, DMARC/DKIM/SPF |
| **Secrets** | Supabase Vault (HSM), rotation policy |

### 8.2 İzleme ve Loglama

```typescript
// lib/security/auditLog.ts
interface AuditEvent {
  eventType: 'auth.login' | 'auth.logout' | 'data.export' | 'data.delete' | 'settings.change' | 'admin.action';
  userId: string;
  ip: string;
  userAgent: string;
  resourceType: string;
  resourceId: string;
  action: 'create' | 'read' | 'update' | 'delete';
  success: boolean;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// Tüm mutasyonlar events tablosuna + SIEM'e (Datadog/Sentry)
await Promise.all([
  supabase.from('events').insert(auditEvent),
  datadog.logs.send(auditEvent),
]);
```

---

## 9. Güvenli Geliştirme Yaşam Döngüsü (SDL)

| Aşap | Aktivite | Sorumlu |
|------|----------|---------|
| **Gereksinim** | Threat modeling (STRIDE), Privacy Impact Assessment (PIA) | PM + Security |
| **Tasarım** | Security design review, Crypto review | Lead + Security |
| **Geliştirme** | Secure coding standards, Code review (2 approval), SAST | Dev |
| **Test** | Unit/Integration + Security test cases, DAST | QA + Security |
| **Dağıtım** | Signed builds, SBOM, Vulnerability scan, Canary deploy | DevOps |
| **Bakım** | Dependency updates (Dependabot), Patch management, Log review | DevOps + Security |

---

## 10. Üçüncü Taraf Risk Yönetimi

| Sağlayıcı | Veri Türü | Sözleşme | Değerlendirme |
|-----------|-----------|----------|---------------|
| **Supabase** | PostgreSQL, Auth, Storage, Realtime, Edge | DPA + SCC | SOC 2 Type II, ISO 27001 |
| **Cloudflare/Netlify** | CDN, DNS, WAF | DPA | SOC 2, ISO 27001 |
| **OpenWeather/WeatherAPI** | Hava verisi (Konum bazlı) | DPA | GDPR ready |
| **MapTiler/Mapbox** | Harita haritalama | DPA | SOC 2 |
| **AI Providers (Anthropic/OpenAI)** | Anonimleştirilmiş muayene metni | DPA | SOC 2, No training on data |
| **Sentry** | Hata logları (PII scrubbed) | DPA | SOC 2, ISO 27001 |

---

## 11. Fiziksel ve Operasyonel Güvenlik

| Alan | Önlem |
|------|-------|
| **Geliştirme Ortamı** | MFA zorunlu, YubiKey, Encrypted disk |
| **CI/CD** | Signed commits, Provenance (SLSA), Artifact signing |
| **Destek/Ekip** | Background check, NDA, Security training (yıllık) |
| **Ofis/Agıl** | Screen lock, Clean desk, Visitor policy |

---

## 12. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Zero-Knowledge Encryption** | Kullanıcı şifresiyle şifrelenmiş veriler, sunucu çözemaz |
| **Hardware Security Module (HSM)** | Kendi anahtar yönetimi (Enterprise) |
| **Advanced Threat Protection** | ML tabanlı anomali tespiti (Login, API usage) |
| **Compliance Automation** | KVKK/GDPR raporları otomatik, Evidence collection |
| **Privacy Budget** | Differential privacy ile analitik paylaşımı |
| **Supply Chain Security** | SBOM (Software Bill of Materials) imzalama, SBOM taraması |