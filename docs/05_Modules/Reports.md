# BeeMaster AI — Reports (Raporlar) Modülü v1.0

> **Amaç:** Sezon sonu raporları, vergi/kooperatif beyanları, kovan performans raporları, finansal özetler. PDF/Excel/CSV formatlarında, şablon tabanlı, otomatik/manuel oluşturma.

---

## 1. Modül Özeti

| Özellik | Detay |
|---------|-------|
| **Rota** | `/reports` (Liste/Şablonlar), `/reports/new` (Oluştur), `/reports/:id` (Detay/İndir) |
| **Erişim** | Free: Temel raporlar (3/ay), Pro: Sınırsız, Enterprise: Özel şablonlar |
| **Veri Kaynağı** | IndexedDB + Supabase (Aggregated views) |
| **Offline** | Önbelleğe alınmış raporlar görüntülenebilir, yeni rapor online gerektirir |
| **Performans** | PDF oluşturma < 5s (1000+ kayıt), Excel < 3s |

---

## 2. Kullanıcı Hikayeleri

| ID | Hikaye | Öncelik |
|----|--------|---------|
| RP-01 | Sezon özeti raporu: Toplam hasat, kovan verimleri, maliyetler, kar/zarar | P0 |
| RP-02 | Vergi/Kooperatif beyanı: Resmi formatta (Excel), otomatik doldurulmuş | P0 |
| RP-03 | Kovan performans raporu: Her kovan için verim, hastalık, maliyet, notlar | P0 |
| RP-04 | Varroa/Tedavi raporu: Sayım trendi, tedavi etkinlikleri, ilaç kullanımı | P1 |
| RP-05 | Besleme maliyet raporu: Türlere göre, kovanlara göre, sezonluk toplam | P1 |
| RP-06 | Özel şablon ile rapor oluşturma (Drag-drop alanlar, koşullu içerik) | P2 |
| RP-07 | Zamanlanmış raporlar: Her Pazartesi özet, ay sonu finansal, sezon sonu | P2 |
| RP-08 | Rapor paylaşımı: WhatsApp, Email, Google Drive, Link (Salt okunur) | P1 |

---

## 3. UI Yapısı

### 3.1 Raporlar Ana Sayfası (/reports)

```
ReportsPage
├── Header: "Raporlar" + Plan Badge [Free: 3/ay] + [+ Rapor Oluştur]
├── Tabs: [Şablonlar] [Geçmişim] [Zamanlanmış] [Paylaşılan]
│
├── ŞABLONLAR SEKMESİ
│   ├── Kategori Filtre: [Genel] [Vergi] [Performans] [Finansal] [Özel]
│   └── TemplateGrid (Kartlar)
│       ├── Sezon Özeti (Free) 📊
│       ├── Vergi/Kooperatif Beyanı (Free) 📋
│       ├── Kovan Performansı (Pro) 📈
│       ├── Varroa/Tedavi Analizi (Pro) 🔬
│       ├── Besleme Maliyeti (Pro) 💰
│       ├── Finansal Özet (Pro) 💵
│       ├── Envanter Değeri (Pro) 📦
│       └── Özel Şablon Oluştur (Pro+) ➕
│
├── GEÇMİŞ SEKMESİ
│   ├── Filtre: Tarih, Şablon, Format, Durum
│   └── ReportHistoryList
│       │ Tarih │ Şablon │ Kapsam │ Format │ Boyut │ Durum │ Aksiyon │
│       │ 15 Tem│Sezon Özeti│Eğil Y.│PDF   │2.4MB │Hazır  │[⬇][🔗][🗑]│
│
├── ZAMANLANMIŞ SEKMESİ (Pro+)
│   ├── Liste: Şablon | Sıklık | Sonraki Çalıştırma | Durum
│   └── [+ Yeni Zamanlanmış Rapor]
│
└── PAYLAŞILAN SEKMESİ
    └── Link ile paylaşılan raporlar (Son 30 gün)
```

### 3.2 Rapor Oluşturma Sihirbazı (/reports/new)

```
ReportWizard
├── ADIM 1: Şablon Seç
│   ┌─────────────────────────────────────┐
│   │ [Sezon Özeti] [Vergi Beyanı]        │
│   │ [Kovan Performansı] [Varroa Raporu] │
│   │ [Besleme Maliyeti] [Finansal Özet]  │
│   │ [Özel Şablon] (Pro+)                │
│   └─────────────────────────────────────┘
│
├── ADIM 2: Kapsam (Veri Filtreleri)
│   ┌─────────────────────────────────────┐
│   │ Arı Üssü: [Tümü ▼] [Seçili...]      │
│   │ Dönem: [Bu Sezon ▼] [Özel Tarih]    │
│   │ Kovanlar: [Tümü] [Aktif] [Satılan]  │
│   │ İrk Filtresi: [Tümü ▼]              │
│   └─────────────────────────────────────┘
│
├── ADIM 3: Format
│   ┌─────────────────────────────────────┐
│   │ [PDF] [Excel] [CSV] [JSON]          │
│   │ PDF: [A4] [Letter] [Yatay/Dikey]    │
│   │ Excel: [Tek Sayfa] [Çoklu Sekme]    │
│   └─────────────────────────────────────┘
│
├── ADIM 4: İçerik Seçenekleri (Şablona göre dinamik)
│   ┌─────────────────────────────────────┐
│   │ ☑ Hasat Özeti                       │
│   │ ☑ Maliyet Analizi                   │
│   │ ☑ Varroa/Tedavi Raporu              │
│   │ ☑ Besleme Özeti                     │
│   │ ☑ Ana Arı Değişimleri               │
│   │ ☑ Envanter Özeti                    │
│   │ ☑ AI Özetleri ve Öneriler           │
│   │ ☑ Grafikler ve Tablolar             │
│   │ ☑ Kovan Bazlı Detay Tablosu         │
│   │ ☐ Fotoğraflar (PDF boyutu büyür)    │
│   └─────────────────────────────────────┘
│
├── ADIM 5: Görünüm ve Marka (Pro+)
│   ├── Logo: [Yükle] [Varsayılan BeeMaster]
│   ├── Renk Şeması: [Koyu] [Açık] [Marka]
│   ├── Altbilgi: [Sayfa No] [Tarih] [İmza Alanı]
│   └── Dil: [Türkçe] [English]
│
└── [ÖNİZLEME] [OLUŞTUR] → İş kuyruğuna alınır, bildirimle hazır
```

### 3.3 Rapor Detayı ve İndirme (/reports/:id)

```
ReportDetailPage
├── StickyHeader: Şablon Adı, Tarih, Format, 3-nokta Menü
├── Status Badge: [Hazırlanıyor] [Hazır] [Hatalı] [Süresi Doldu]
├── Özet Bilgiler
│   ├── Oluşturma: 15 Tem 2024, 14:32
│   ├── Kapsam: Eğil Yaylası • Bu Sezon • 24 Kovan
│   ├── Format: PDF (A4, 12 sayfa) • 2.4 MB
│   └── İçerik: Hasat, Maliyet, Varroa, Grafikler
├── Aksiyonlar
│   ├── [İndir] (Primary)
│   ├── [Paylaş] → Link kopyala / WhatsApp / Email / Drive
│   ├── [Yeniden Oluştur] (Aynı ayarlarla)
│   └── [Sil]
├── Önizleme (PDF.js / Excel.js)
│   └── Sayfa geçişli görüntüleyici
└── Geçmiş Sürümler (Yeniden oluşturulduysa)
```

---

## 4. Şablon Detayları

### 4.1 Sezon Özeti (Season Summary) — Free

| Bölüm | İçerik | Veri Kaynağı |
|-------|--------|--------------|
| **Kapak** | Arıcı adı, üs, sezon, tarih, logo | Profile + Apiary |
| **Yönetici Özeti** | AI üretilen 3-4 cümlelik özet | AI Agent (ForecastAgent) |
| **KPI Tablosu** | Toplam Kovan, Hasat (kg), Ort. Verim, Gelir, Maliyet, Kar | Harvests + Feedings + Treatments |
| **Hasat Detayı** | Aylık hasat grafiği, bal tipleri dağılımı, nem analizi | HoneyHarvests |
| **Kovan Performansı** | En iyi 5 / En kötü 5 kovan (Verim, Sağlık) | Inspections + Harvests |
| **Varroa ve Tedavi** | Sayım trendi, tedavi etkinlik tablosu, maliyet | Treatments |
| **Besleme Özeti** | Türlere göre miktar/maliyet, stok durumu | Feedings + Inventory |
| **Ana Arı Değişimleri** | Tablo: Kovan, Eski/Yeni, Tarih, Neden, Maliyet | Queens |
| **Envanter Değeri** | Toplam stok değeri, kritik öğeler | Inventory |
| **AI Önerileri** | Gelecek sezon için 3-5 aksiyon önerisi | ForecastAgent |
| **Ekler** | Ham veriler (CSV), Fotoğraflar (opsiyonel) | All |

### 4.2 Vergi/Kooperatif Beyanı (Tax/Coop Declaration) — Free

| Alan | Açıklama | Otomatik Doldurma |
|------|----------|-------------------|
| **Arıcı Bilgileri** | Ad, TC/VKN, Adres, Telefon | Profile |
| **Üs Bilgileri** | Üs adı, İl/İlçe, Koordinat, Kovan Sayısı | Apiary |
| **Hasat Beyanı** | Bal türü, Miktar (kg), Hasat Tarihi | Harvests (group by type) |
| **Satış Beyanı** | Satılan miktar, Birim fiyat, Toplam, Alıcı | Harvests.sold_amount |
| **Giderler** | Besleme, İlaç, Ekipman, İşçilik, Diğer | Feedings + Treatments + Inventory |
| **Net Kazanç** | Toplam Gelir - Toplam Gider | Hesaplanan |
| **İmza** | Dijital imza alanı + Tarih | Manual |

> **Format:** Excel (.xlsx) — Kooperatif/vergi dairesi şablonuna uygun sütunlar

### 4.3 Kovan Performans Raporu (Hive Performance) — Pro

| Kovan | Verim (kg) | Varroa Max | Tedavi Sayısı | Besleme Maliyeti | Net Kar | AI Skoru | Durum |
|-------|------------|------------|---------------|------------------|---------|----------|-------|
| K-12  | 45.2       | 12         | 2             | 120 TL           | 2,800   | 92/100   | 🟢 Mükemmel |
| K-05  | 12.1       | 25         | 3             | 200 TL           | -150    | 45/100   | 🔴 Riskli |

> **Detay Sayfası (Kovan başına 1 sayfa):** Muayene zaman çizelgesi, çerçeve döngüsü, ana arı pedigree, fotoğraflar

### 4.4 Varroa/Tedavi Analizi (Varroa Treatment Analysis) — Pro

- Bölgesel prevalans karşılaştırması
- Tedavi protokolü etkinlik matrisi (İlaç × Dozaj × Yöntem × Etkinlik%)
- Rezistans risk göstergeleri
- Maliyet/etkinlik optimizasyonu önerisi

### 4.5 Finansal Özet (Financial Summary) — Pro

| Kategori | Tutar (TL) | Önceki Yıl | Değişim |
|----------|------------|------------|---------|
| **GELİRLER** | | | |
| Bal Satışı | 185,000 | 160,000 | +15.6% |
| Ana Arı Satışı | 12,000 | 8,000 | +50% |
| Polen/Propolis | 5,500 | 3,200 | +71.8% |
| **Toplam Gelir** | **202,500** | **171,200** | **+18.3%** |
| **GİDERLER** | | | |
| Besleme (Şeker/Paté) | 28,000 | 25,000 | +12% |
| İlaç/Tedavi | 15,000 | 18,000 | -16.7% |
| Ekipman/Bakım | 22,000 | 15,000 | +46.7% |
| İşçilik | 18,000 | 12,000 | +50% |
| Lojistik/Seyahat | 8,500 | 7,000 | +21.4% |
| **Toplam Gider** | **91,500** | **77,000** | **+18.8%** |
| **NET KAR** | **111,000** | **94,200** | **+17.8%** |
| **KAR MARJİ** | **54.8%** | **55.0%** | -0.2pp |

---

## 5. Bileşen Detayları

### 5.1 ReportTemplateCard

```tsx
// components/report/ReportTemplateCard.tsx
export function ReportTemplateCard({ template, onSelect, userPlan }: ReportTemplateCardProps) {
  const isLocked = template.requiredPlan && !planIncludes(userPlan, template.requiredPlan);
  const usageThisMonth = getTemplateUsage(template.id);
  const limit = template.monthlyLimit || (userPlan === 'free' ? 3 : Infinity);
  const remaining = Math.max(0, limit - usageThisMonth);

  return (
    <Card 
      variant={isLocked ? 'bordered' : 'interactive'} 
      padding="md" 
      onClick={isLocked ? undefined : () => onSelect(template)}
      className={cn('relative', isLocked && 'opacity-60')}
    >
      {isLocked && (
        <div className="absolute inset-0 bg-neutral-950/80 rounded-xl flex items-center justify-center z-10">
          <Lock className="w-8 h-8 text-neutral-500" />
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="w-12 h-12 rounded-xl bg-honey-400/10 flex items-center justify-center">
          <template.icon className="w-6 h-6 text-honey-400" />
        </div>
        <Badge variant={template.category === 'tax' ? 'info' : template.category === 'performance' ? 'success' : 'default'}>
          {TEMPLATE_CATEGORY_LABELS[template.category]}
        </Badge>
      </div>

      <h3 className="font-semibold text-neutral-50 mb-1">{template.name}</h3>
      <p className="text-sm text-neutral-400 mb-3 line-clamp-2">{template.description}</p>

      <div className="flex items-center gap-2 text-xs text-neutral-500 mb-3">
        <span className="flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {template.formats.map(f => FORMAT_LABELS[f]).join(', ')}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          ~{template.estimated_pages} sayfa
        </span>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
        <div className="flex items-center gap-1 text-xs">
          {template.free_tier ? (
            <Badge variant="success" className="text-[9px]">Free</Badge>
          ) : (
            <Badge variant="warning" className="text-[9px]">Pro</Badge>
          )}
          {template.monthlyLimit && (
            <span className={cn('font-mono', remaining === 0 ? 'text-error' : 'text-neutral-400')}>
              {remaining}/{limit} bu ay
            </span>
          )}
        </div>
        
        {isLocked ? (
          <Button variant="ghost" size="sm" className="text-error" disabled>
            <Lock className="w-3.5 h-3.5 mr-1" /> Pro Gerekli
          </Button>
        ) : (
          <Button variant="primary" size="sm" fullWidth>
            Oluştur
          </Button>
        )}
      </div>
    </Card>
  );
}
```

### 5.2 ReportHistoryList

```tsx
// components/report/ReportHistoryList.tsx
export function ReportHistoryList({ reports, onDownload, onShare, onDelete, onRegenerate }: ReportHistoryListProps) {
  const formatIcons = { pdf: FileText, xlsx: Table, csv: FileSpreadsheet, json: Braces };

  return (
    <div className="space-y-2">
      {reports.length === 0 ? (
        <EmptyState 
          icon={FileText}
          title="Henüz Rapor Yok"
          description="İlk raporunuzu oluşturmak için şablonlardan birini seçin."
          action={{ label: 'Şablonları Gör', onClick: () => navigate('/reports?tab=templates') }}
        />
      ) : (
        reports.map(report => (
          <Card key={report.id} variant="bordered" padding="md" className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center flex-shrink-0">
              <formatIcons[report.format] className="w-6 h-6 text-honey-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-neutral-50 truncate">{report.template_name}</h4>
                <Badge variant={report.status === 'ready' ? 'success' : report.status === 'processing' ? 'info' : 'error'}>
                  {REPORT_STATUS_LABELS[report.status]}
                </Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-neutral-400 mt-1">
                <span>{format(new Date(report.created_at), 'dd MMM yyyy HH:mm', { locale: tr })}</span>
                <span>{report.scope_apiary || 'Tüm Üssler'}</span>
                <span>{report.format.toUpperCase()}</span>
                <span className="font-mono">{(report.file_size / 1024 / 1024).toFixed(1)} MB</span>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              {report.status === 'ready' && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => onDownload(report.id)} aria-label="İndir">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onShare(report.id)} aria-label="Paylaş">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </>
              }
              <Button variant="ghost" size="sm" onClick={() => onRegenerate(report.id)} aria-label="Yeniden Oluştur">
                <RotateCw className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm"><MoreHorizontal className="w-4 h-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {report.status === 'ready' && (
                    <DropdownMenuItem onClick={() => onDownload(report.id)}>
                      <Download className="w-4 h-4 mr-2" /> İndir
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onShare(report.id)}>
                    <Share2 className="w-4 h-4 mr-2" /> Paylaş
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onRegenerate(report.id)}>
                    <RotateCw className="w-4 h-4 mr-2" /> Yeniden Oluştur
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-error" onClick={() => onDelete(report.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Sil
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      )}
    </div>
  );
}
```

### 5.3 ScheduledReportForm (Zamanlanmış Rapor)

```tsx
// components/report/ScheduledReportForm.tsx
export function ScheduledReportForm({ onSave, onCancel, initialData }: ScheduledReportFormProps) {
  const [form, setForm] = useState({
    template_id: '',
    name: 'Haftalık Özet',
    frequency: 'weekly', // daily, weekly, monthly, seasonal
    day_of_week: 1, // 1=Pazartesi
    day_of_month: 1,
    time: '09:00',
    timezone: 'Europe/Istanbul',
    recipients: [], // [{ type: 'email', value: '...' }, { type: 'webhook', value: '...' }]
    format: 'pdf',
    scope: { apiaries: 'all', period: 'last_week' },
    enabled: true,
  });

  return (
    <Modal isOpen onClose={onCancel} title="Zamanlanmış Rapor" size="lg">
      <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-6">
        <FormField label="Rapor Adı">
          <Input value={form.name} onChange={v => setForm({...form, name: v})} placeholder="Örn: Haftalık Pazar Özeti" />
        </FormField>

        <FormField label="Şablon">
          <Select value={form.template_id} onChange={v => setForm({...form, template_id: v})}>
            {REPORT_TEMPLATES.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </Select>
        </FormField>

        <FormField label="Sıklık">
          <Select value={form.frequency} onChange={v => setForm({...form, frequency: v})}>
            <SelectItem value="daily">Günlük</SelectItem>
            <SelectItem value="weekly">Haftalık</SelectItem>
            <SelectItem value="monthly">Aylık</SelectItem>
            <SelectItem value="seasonal">Mevsimsel</SelectItem>
          </Select>
        </FormField>

        {form.frequency === 'weekly' && (
          <FormField label="Gün">
            <Select value={form.day_of_week} onChange={v => setForm({...form, day_of_week: parseInt(v)})}>
              <SelectItem value={1}>Pazartesi</SelectItem>
              <SelectItem value={2}>Salı</SelectItem>
              <SelectItem value={3}>Çarşamba</SelectItem>
              <SelectItem value={4}>Perşembe</SelectItem>
              <SelectItem value={5}>Cuma</SelectItem>
              <SelectItem value={6}>Cumartesi</SelectItem>
              <SelectItem value={0}>Pazar</SelectItem>
            </Select>
          </FormField>
        )}

        {form.frequency === 'monthly' && (
          <FormField label="Ayın Günü">
            <Input type="number" min={1} max={28} value={form.day_of_month} onChange={v => setForm({...form, day_of_month: parseInt(v)})} />
          </FormField>
        )}

        <FormField label="Saat">
          <Input type="time" value={form.time} onChange={v => setForm({...form, time: v})} />
        </FormField>

        <FormField label="Format">
          <Select value={form.format} onChange={v => setForm({...form, format: v})}>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="xlsx">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </Select>
        </FormField>

        <FormField label="Alıcılar (Opsiyonel)" hint="Email, Webhook, WhatsApp numarası">
          <RecipientList value={form.recipients} onChange={v => setForm({...form, recipients: v})} />
        </FormField>

        <FormField label="Veri Kapsamı">
          <ScopeSelector value={form.scope} onChange={v => setForm({...form, scope: v})} />
        </FormField>

        <label className="flex items-center gap-3 p-3 bg-neutral-800/50 rounded-xl cursor-pointer">
          <input type="checkbox" checked={form.enabled} onChange={e => setForm({...form, enabled: e.target.checked})} className="w-4 h-4 accent-honey-400" />
          <div>
            <p className="font-medium">Aktif</p>
            <p className="text-xs text-neutral-400">Rapor otomatik oluşturulup gönderilecek</p>
          </div>
        </label>

        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <Button variant="ghost" fullWidth onClick={onCancel}>İptal</Button>
          <Button variant="primary" fullWidth type="submit">Kaydet</Button>
        </div>
      </form>
    </Modal>
  );
}
```

---

## 6. Rapor Oluşturma Motoru (Backend)

```typescript
// lib/report/generator.ts
interface ReportGenerationJob {
  id: string;
  userId: string;
  templateId: string;
  scope: ReportScope;
  format: 'pdf' | 'xlsx' | 'csv' | 'json';
  options: ReportOptions;
  status: 'queued' | 'processing' | 'ready' | 'failed';
  progress: number; // 0-100
  resultUrl?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export async function generateReport(job: ReportGenerationJob): Promise<ReportResult> {
  const { templateId, scope, format, options } = job;
  const template = REPORT_TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error('Şablon bulunamadı');

  // 1. Veri toplama (Paralel)
  const data = await collectReportData(scope, template.requiredData);
  
  // 2. AI özetleri üret (Eğer seçiliyse)
  if (options.include_ai_summaries) {
    data.ai_summaries = await generateAIReportSummaries(data, scope);
  }

  // 3. Format'a göre render
  let output: Buffer;
  let filename: string;
  
  switch (format) {
    case 'pdf':
      output = await renderPDF(template, data, options);
      filename = `${template.name}_${scope.period}_${Date.now()}.pdf`;
      break;
    case 'xlsx':
      output = await renderExcel(template, data, options);
      filename = `${template.name}_${scope.period}_${Date.now()}.xlsx`;
      break;
    case 'csv':
      output = await renderCSV(template, data, options);
      filename = `${template.name}_${scope.period}_${Date.now()}.csv`;
      break;
    case 'json':
      output = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
      filename = `${template.name}_${scope.period}_${Date.now()}.json`;
      break;
  }

  // 4. Depoya yükle (Supabase Storage)
  const { url } = await uploadReport(output, filename, job.userId);
  
  // 5. Metadata kaydet
  await saveReportMetadata({
    jobId: job.id,
    filename,
    url,
    size: output.length,
    pageCount: format === 'pdf' ? await getPDFPageCount(output) : undefined,
  });

  return { url, filename, size: output.length };
}

// Veri Toplama (Optimize edilmiş sorgular)
async function collectReportData(scope: ReportScope, requiredData: string[]): Promise<ReportData> {
  const queries = [];
  
  if (requiredData.includes('harvests')) {
    queries.push(fetchHarvests(scope));
  }
  if (requiredData.includes('inspections')) {
    queries.push(fetchInspections(scope));
  }
  if (requiredData.includes('treatments')) {
    queries.push(fetchTreatments(scope));
  }
  if (requiredData.includes('feedings')) {
    queries.push(fetchFeedings(scope));
  }
  if (requiredData.includes('queens')) {
    queries.push(fetchQueens(scope));
  }
  if (requiredData.includes('inventory')) {
    queries.push(fetchInventory(scope));
  }
  if (requiredData.includes('frames')) {
    queries.push(fetchFrames(scope));
  }

  const results = await Promise.all(queries);
  return combineReportData(results, requiredData);
}
```

---

## 7. Offline ve Paylaşım

| Senaryo | Davranış |
|---------|----------|
| **Offline rapor görüntüleme** | Önbelleğe alınan son 5 rapor IndexedDB'de, PDF.js ile görüntülenebilir |
| **Rapor paylaşımı (Link)** | İmzalı URL (JWT, 7 gün geçerli), `GET /reports/shared/:token` → İndirme sayfası |
| **WhatsApp paylaşımı** | `whatsapp://send?text=${encodeURIComponent(url)}` |
| **Email paylaşımı** | `mailto:?subject=BeeMaster Raporu&body=${url}` |
| **Google Drive** | Pro+ özelliği: OAuth ile Drive API, klasör seçimi, otomatik senkron |

---

## 8. Erişilebilirlik

| Özellik | Uygulama |
|---------|----------|
| **PDF Etiketli** | PDF/UA uyumlu, başlık hiyerarşisi (H1-H3), alt metinler, tablo başlıkları |
| **Excel Yapılandırılmış** | Açık sütun başlıkları, veri doğrulama, dondurulmuş başlık satırı |
| **Renk Körlüğü** | Grafikler: Desen + Renk, veri etiketleri |
| **Ekran Okuyucu** | "Sezon özeti raporu hazır, 12 sayfa, 2.4 MB, indirmek için Enter" |

---

## 9. Test Senaryoları

| Senaryo | Beklenen |
|---------|----------|
| Free kullanıcı 4. rapor oluşturma | "Aylık limitiniz doldu (3/3). Pro'ya yükseltin" uyarısı |
| 500 kovan, 3 yıl veri → PDF | < 30 sn, < 10 MB, sayfa numaraları doğru |
| Vergi beyanı Excel → Kooperifte açılma | Sütunlar eşleşiyor, formüller bozulmamış |
| Zamanlanmış rapor (Haftalık Pazartesi) | Her Pazartesi 09:00'da tetiklenir, bildirim gönderilir |
| Paylaşım linki 7 gün sonra | 404 / "Link süresi doldu" |
| Rapor yeniden oluşturma | Yeni job kuyruğa alınır, eski dosya silinmez (geçmişe eklenir) |

---

## 10. Gelecek Geliştirmeler (v1.5+)

| Özellik | Açıklama |
|---------|----------|
| **Drag-Drop Şablon Editörü** | Alanları sürükle/bırak, koşullu görünürlük, döngüler, formüller |
| **Rapor Versiyonlama** | v1, v2, v3... Değişim günlüğü, geri alma |
| **Embedded Raporlar** | Web sitesinde/portalda iframe ile gömülü raporlar |
| **API Webhook** | Rapor hazır olduğunda POST webhook (Entégrasyon için) |
| **Çoklu Dil Rapor** | Türkçe/İngilizce/Arapça aynı veriden çoklu dil çıktısı |
| **İnteraktif Web Raporu** | Sadece PDF değil, filtrelenebilir/göz atılabilir web sayfası raporu |