# BeeMaster AI — Gelecek Özellikler (Future Features) v1.0

> **Amaç:** v2.0 ve sonrası için planlanan, araştırma aşamasındaki veya prototip hazırlanacak yenilikçi özellikler. Bu liste "backlog" niteliğindedir, önceliklendirme (RICE) ile sprint'lere alınır.

---

## 1. Özellik Havuzu (Feature Pool)

| # | Özellik | Kategori | Öncelik | Karmaşıklık | Bağımlılık | Tahmini Süre |
|---|---------|----------|---------|-------------|------------|--------------|
| 1 | IoT Kovan Sensörleri | IoT/Hardware | Yüksek | Çok Yüksek | Donanım seçimi, MQTT/LoRaWAN, Edge computing | 6-9 ay |
| 2 | Drone/UAV Entegrasyonu | Remote Sensing | Orta | Yüksek | DJI SDK, Görüntü işleme, GIS | 9-12 ay |
| 3 | AR Muayene | AR/Vision | Düşük | Çok Yüksek | WebXR, On-device CV (YOLO/RT-DETR) | 12+ ay |
| 4 | Ses Analizi (Arı Sesi) | Audio AI | Orta | Yüksek | Audio classification (AST, BEATs) | 6-9 ay |
| 5 | Genetik/İrk Analizi | Computer Vision | Düşük | Yüksek | CNN classifier, Büyük etiketli veri seti | 12+ ay |
| 6 | Otomatik Varroa Sayımı | Computer Vision | Yüksek | Yüksek | Object detection (YOLOv8/11), Segmentasyon | 6-9 ay |
| 7 | Akıllı Besleme Makinesi | IoT/Automation | Düşük | Orta | MQTT, Protokol standardizasyonu | 6-9 ay |
| 8 | Blockchain/Web3 İzlenebilirlik | Web3 | Düşük | Orta | IPFS, Smart contracts, Cüzdan entegrasyonu | 6-9 ay |
| 9 | Sesli Asistan | Voice AI | Orta | Yüksek | Wake word, STT, TTS, On-device (Whisper.cpp + Piper) | 9-12 ay |
| 10 | Çoklu Kovan Toplu İşlem | Productivity | Yüksek | Orta | Batch API, Background jobs | 3-4 ay |
| 11 | Federated Learning | AI/Privacy | Yüksek | Çok Yüksek | On-device training, Gradient sharing | 12+ ay |
| 12 | Neural-Symbolic AI | AI/Reasoning | Orta | Çok Yüksek | Rule engine + Neural net hibrit | 12+ ay |
| 13 | Climate Adaptation Scoring | Analytics | Orta | Yüksek | İklim modelleri (CMIP6), Senaryo analizi | 9-12 ay |
| 14 | Pollinator Network Analysis | Ecology | Düşük | Yüksek | Graph analytics, Co-foraging networks | 9-12 ay |
| 15 | Carbon Footprint Reporting | Sustainability | Orta | Orta | LCA metodolojisi, Verifikasyon standartları | 6-9 ay |

---

## 2. Detaylı Özellik Tanımları

### 2.1 IoT Kovan Sensörleri (IoT Hive Sensors) — **Yüksek Öncelik**

**Amaç:** Kovan altındaki sensörlerle (ağırlık, sıcaklık, nem, ses) gerçek zamanlı veri toplama, anomali tespiti, öngörücü bakım.

| Sensör Türü | Ölçüm | Kullanım Alanı | Frekans |
|-------------|-------|----------------|---------|
| **Ağırlık (Load Cell)** | Kovan toplam ağırlığı (kg) | Bal akışı, Kış beslenmesi, Sürgün takibi | 15 dk / 1 sa |
| **Sıcaklık (DS18B20/Temp)** | İç/ Dış kovan sıcaklığı | Kovan sağlığı, Yumurtalık ısısı, Kış geçirimi | 15 dk |
| **Nem (SHT3x/HDH)** | Bağıl nem % | Bal olgunlaşması, Külçe hastalıkları | 15 dk |
| **Ses (MEMS Mic)** | Buzun frekansı, Genlik | Kraliçe yok, Sürgün hazırı, Stres | Sürekli (DSP) |
| **CO2 / VOC** | Gaz konsantrasyonu | Kovan solunumu, Hastalık erken uyarısı | 1 sa |
| **Hareket (PIR/Accelerometer)** | Giriş/çıkış aktivitesi | Yara aktivitesi, Saldırı tespiti | Olay bazlı |

**Mimari:**
```
Sensör Node (ESP32/STM32 + LoRaWAN) 
    → LoRa Gateway (Raspberry Pi + Concentrator) 
    → MQTT Broker (Mosquitto/EMQX) 
    → Edge Processor (InfluxDB + Telegraf) 
    → Supabase Edge Function (Real-time sync) 
    → PWA (WebSocket/Realtime)
```

**Veri Modeli:**
```typescript
interface SensorReading {
  hiveId: string;
  sensorId: string;
  type: 'weight' | 'temperature' | 'humidity' | 'sound' | 'co2' | 'motion';
  value: number;
  unit: 'kg' | 'celsius' | 'percent' | 'db' | 'ppm' | 'count';
  timestamp: string; // ISO 8601
  metadata?: {
    batteryVoltage?: number;
    signalStrength?: number; // RSSI
    firmwareVersion?: string;
  };
}
```

**AI Kullanım Alanları:**
- **Bal Akışı Tespiti:** Ağırlık artışı hızı → "Bal akışı başladı, operkül kontrolü yapın"
- **Kış Geçirimi:** Sıcaklık stabilitesi + Ağırlık kaybı hızı → "Kış beslemesi yeterli mi?"
- **Sürgün Öngörüsü:** Ağırlık ani düşüş + Ses frekansı değişimi → "Sürgün riski yüksek"
- **Kraliçe Kaybı:** Sıcaklık dengesizliği + Ses deseni (Queenless roar) → "Kraliçe kontrolü"

---

### 2.2 Drone/UAV Entegrasyonu (Drone Integration) — **Orta Öncelik**

**Amaç:** Arı üssü haritalama, flora analizi, kovan sayımı, göç rotası planlaması.

| Kullanım Senaryosu | Sensör | Çıktı | Sıklık |
|-------------------|--------|-------|--------|
| **Üs Haritalama** | RGB + Multispectral | Ortomozaiik, DEM, NDVI | Sezon başı/sonu |
| **Flora Analizi** | Multispectral (RedEdge) | Çiçeklenme yoğunluğu, Nektar potansiyeli | Her 2 hafta |
| **Kovan Sayımı** | RGB (Yüksek çözünürlük) | Kovan konumları, Gölge analizi | Göç öncesi |
| **Su Kaynağı Tespiti** | Thermal + RGB | Su mesafesi, Erişilebilirlik | Sezon başı |
| **Göç Rotası Optimizasyonu** | GIS + Hava verisi | En iyi rota, Mesafe, Süre | Göç planlaması |

**Entegrasyon Noktaları:**
- DJI SDK (Mobile SDK / Payload SDK) → Uçuş planı gönderimi, Telemetri alma
- OpenDroneMap / Pix4D → İşleme pipeline'ı (Bulut/Edge)
- BeeMaster API → Üs/Kovan konumları, Flora takvimi, Sonuçları kaydetme

---

### 2.3 AR Muayene (AR Inspection) — **Düşük Öncelik (Araştırma)**

**Amaç:** Telefon kamerasıyla petek üzerine AR overlay: Yumurtalık alanı % hesaplama, Operkül oranı, Varroa sayımı, Larva/satır sayısı.

**Teknoloji Yığını:**
- **WebXR** (Tarayıcı tabanlı AR, iOS Safari destekli)
- **On-Device CV:** YOLOv8n / RT-DETR (TensorFlow.js / ONNX Runtime Web)
- **ARCore / ARKit** (Native bridge için Capacitor plugin)

**Kullanım Akışı:**
```
1. Kullanıcı "AR Muayene" başlatır
2. Kamera petek üzerine tutulur
3. Model real-time tespit eder:
   - Hücre tipleri (Yumurta, Larva, Kapalı, Bal, Polen)
   - Varroa (Arı üzerinde / Hücrede)
4. Overlay: Renkli kutular + Sayıcı
5. "Tamam" → Sonuçlar muayene formuna yazılır
```

**Zorluklar:**
- Işık koşulları (Güneş / Gölge / Kovan içi karanlık)
- Eldivenle dokunmatik kullanım
- Model boyutu < 10MB (Mobil için)
- Gecikme < 100ms (Real-time hissiyatı)

---

### 2.4 Ses Analizi (Bee Sound Analysis) — **Orta Öncelik**

**Amaç:** Kovan sesinden (mikrofonla) sağlık durumu çıkarımı.

| Ses Özelliği | Anlamı | Model |
|--------------|--------|-------|
| **Temel Frekans (200-300 Hz)** | Normal kovan gürültüsü | Baseline |
| **Yüksek Frekans (> 600 Hz)** | Sürgün hazırı / Kraliçe yok | AST / BEATs |
| **Düşük Frekans (< 150 Hz)** | Sıkışma / Saldırı / Soğuma | YAMNet |
| **Ritimik Dalgalanma** | Bal akışı / Beslenme | Custom CNN |
| **Anomali (Aniden sessizlik)** | Zehirlenme / Soğuma / Enkaz | Isolation Forest |

**Model Seçenekleri:**
- **AST (Audio Spectrogram Transformer)** — En iyi doğruluk, ~80MB
- **BEATs** — Self-supervised, transfer learning uygun
- **YAMNet** — Hafif (~5MB), MobileNet tabanlı, 521 sınıf
- **Custom CNN + MFCC** — En hafif (< 2MB), Özel sınıflar için eğitilebilir

**Veri Toplama Stratejisi:**
- Kullanıcı onayıyla (Opt-in) anonim ses parçaları topla
- Etiketleme: "Kraliçe var/yok", "Sürgün", "Normal", "Acil"
- Crowdsource + Uzman doğrulama → Sürekli iyileştirme

---

### 2.5 Otomatik Varroa Sayımı (Auto Varroa Counting) — **Yüksek Öncelik**

**Amaç:** Alkolden yıkanan / pudra şekeri yıkanan kase fotoğrafından varroa sayımı.

**Yöntem:**
1. Kullanıcı kaseyi aydınlatma kutusuna (Lightbox) koyar / Telefon kamerasıyla çeker
2. **YOLOv8/11-seg** → Varroa segmentasyonu (Sınıf: Varroa, Arı, Kirletici)
3. **Sayım + Sınıflandırma** → Ergin / Yarva / Ölü varroa ayrımı
4. **Sonuç:** "12 Varroa / 100 arı (%12 enfeksiyon) — KRİTİK"

**Model Eğitimi:**
- Veri seti: 10,000+ etiketli görüntü (Çeşitli ışık, arka plan, kase tipi)
- Veri artırma: Albumentations (Rotation, Brightness, Noise, Blur)
- Model: YOLOv8n-seg (3.2MB) → ONNX → TensorFlow.js / ONNX Runtime Web
- Doğruluk hedefi: **Precision > 0.90, Recall > 0.85**

**Entegrasyon:**
- Muayene sihirbazı Adım 3C (Fotoğraf) → "Varroa Say" butonu
- Sonuç → `varroa_count` + `varroa_method: 'photo_ai'` olarak kaydedilir
- AI Agent → Risk skoru + Tedavi önerisi

---

### 2.6 Federated Learning (Federe Öğrenme) — **Yüksek Öncelik (v2.0+)**

**Amaç:** Kullanıcı verileri cihazdan çıkmadan, lokal modelleri eğitip sadece gradyanları paylaşarak global modeli iyileştirme.

**Mimari:**
```
Client (PWA)                          Server (Aggregator)
    │                                      │
    ├── Local Data (Inspections)           │
    ├── Local Model (LoRA adapter)         │
    ├── Train 1 epoch (Local)              │
    ├── Compute Gradients (ΔW)             │
    ├── Encrypt + Sign (DP + SMPC)         │
    │                    ──ΔW──▶           │
    │                    ◀──W_global──     │
    ├── Update Local Model                 │
    └── Next Round                         │
```

**Gizlilik Korumaları:**
- **Differential Privacy:** Gradyanlara Gaussian gürültü
- **Secure Aggregation:** Şifreli toplam (Sunucu bireysel gradyan göremez)
- **Local Epochs:** 1-2 (Overfitting önleme)
- **Participation:** Minimum 100 cihaz / round

**Kullanım Alanları:**
- Varroa tespit modeli (Görsel)
- Ses sınıflandırma modeli
- Verim tahmin modeli (Tabular)
- Dil modelleri (Muayene özetleri)

---

### 2.7 Neural-Symbolic AI (Sinirsel-Sembolik AI) — **Orta Öncelik**

**Amaç:** Rule-based sistemin güvencesi + Neural net'in esnekliği.

**Mimari:**
```
User Input → Neural Encoder → Latent Representation
                    ↓
            Symbolic Reasoner (Rules/Knowledge Graph)
                    ↓
            Neural Decoder → Output + Explanation
```

**Kullanım Alanları:**
- **Tedavi Protokolü:** Sembolik kurallar (Sıcaklık 10-25°C, Yumurtalık az) + Neural (Bölge prevalansı, Kovan geçmişi) → Güvenli öneri
- **Risk Hesaplama:** Kurallar (Eşikler) + Neural (Trend, Korelasyon) → Kalibre edilmiş risk skoru
- **Planlama:** Sembolik planlayıcı (PDDL) + Neural heuristik → Optimal mevsim planı

**Araçlar:**
- **Logical Neural Networks (LNN)**
- **DeepProbLog** (Probabilistic logic)
- **Neuro-Symbolic Concept Learner (NS-CL)**
- **Custom: Rule Engine (TypeScript) + Embedding-based Retrieval**

---

### 2.8 Sesli Asistan (Voice Assistant) — **Orta Öncelik**

**Amaç:** "Hey BeeMaster, Kovan 12 nasıl?" → Anlık sesli cevap.

**Bileşenler:**
| Bileşen | Teknoloji | Not |
|---------|-----------|-----|
| **Wake Word** | Porcupine (Picovoice) / Custom | "Hey BeeMaster" / "Merhaba Arı" |
| **STT** | Whisper.cpp (tiny/base) | On-device, Türkçe destekli |
| **NLU** | Local LLM (Hermes-3-7B) + Function Calling | Intent: hive_status, inspection_start, treatment_plan |
| **Dialog Manager** | State machine + Context memory | Çok turulu konuşma |
| **TTS** | Piper (VITS) / Coqui TTS | Türkçe, Doğal ses, Hız kontrolü |
| **Action Executor** | App bridge (Navigation, Data fetch, Mutations) | "Muayene başlat" → Navigate + Mic aç |

**Kullanım Senaryoları:**
- "Kovan 12'de varroa kaçtı?" → "Son muayenede 12 varroa sayıldı, kritik seviye"
- "Bugün ne yapmalıyım?" → "3 kovanda varroa sayımı, 2 kovanda besleme, Kovan 5'te operkül kontrolü"
- "Yarın hava nasıl?" → "Yarın Eğil'de 28°C, güneşli, rüzgar 10 km/h. Bal akışı için iyi gün"
- "Kovan 5'te ana arı görmedim" → "Kaydediyorum. 3 gün sonra kontrol hatırlatması ekliyorum"

---

## 3. Önceliklendirme Matrisi (RICE Scoring)

| Özellik | Reach (1-5) | Impact (1-5) | Confidence (1-5) | Effort (Ay) | RICE Skoru | Öncelik |
|---------|-------------|--------------|------------------|-------------|------------|---------|
| Çoklu Kovan Toplu İşlem | 5 | 4 | 5 | 3 | **33.3** | P0 (v1.5) |
| Otomatik Varroa Sayımı | 4 | 5 | 4 | 6 | **13.3** | P1 (v1.5) |
| Sesli Asistan | 4 | 4 | 3 | 9 | **5.3** | P2 (v2.0) |
| IoT Kovan Sensörleri | 3 | 5 | 3 | 9 | **5.0** | P1 (v2.0) |
| Federated Learning | 3 | 5 | 2 | 12 | **2.5** | P2 (v2.5) |
| AR Muayene | 2 | 4 | 2 | 12 | **1.3** | P3 (v3.0+) |
| Drone Entegrasyonu | 2 | 4 | 3 | 9 | **2.7** | P2 (v2.5) |
| Ses Analizi | 3 | 4 | 3 | 9 | **4.0** | P2 (v2.0) |
| Blok Zinciri İzlenebilirlik | 1 | 3 | 3 | 9 | **1.0** | P3 (v3.0+) |
| Genetik/İrk Analizi | 1 | 4 | 2 | 12 | **0.7** | P3 (v3.0+) |

---

## 4. Araştırma ve Prototip Süreci (R&D Process)

### 4.1 Aşamalar

| Aşama | Süre | Çıktı | Başarı Kriteri |
|-------|------|-------|----------------|
| **Keşif (Discovery)** | 2 hafta | Literatur taraması, Rakipler, Veri setleri | Problem tanımlan doğrulanmış |
| **Prototip (PoC)** | 4-6 hafta | Çalışan demo (Jupyter/Colab + React Native Web) | Metrik hedefe ulaşıyor |
| **Entegrasyon (Integration)** | 4-8 hafta | PWA modülü, Offline destek, Test senaryoları | CI/CD geçiyor, QA onayı |
| **Beta** | 4 hafta | 10-20 kullanıcıyla test | NPS > 40, Hata oranı < %5 |
| **Lansman** | 2 hafta | Feature flag ile kademeli yayını | Metrikler takip ediliyor |

### 4.2 Veri Toplama Stratejileri (Özelliklere Özel)

| Özellik | Veri Kaynağı | Etiketleme | Hedef Miktar |
|---------|--------------|------------|--------------|
| **Otomatik Varroa** | Kullanıcı fotoğrafları (Opt-in) | Crowdsource + Uzman doğrulama | 10,000+ görüntü |
| **Ses Analizi** | Kullanıcı kayıtları (Opt-in) | Uzman etiketleme + Semi-supervised | 5,000+ kayıt |
| **AR Muayene** | Sentetik veri (Blender/Unity) + Gerçek | Otomatik (Simülasyondan) | 50,000+ sentetik |
| **Genetik/İrk** | İşbirliği (Üniversiteler) | Uzman (DNA + Foto eşleşmesi) | 1,000+ çift |
| **Federated Learning** | Kullanıcı cihazları (Opt-in) | Yerel (Self-supervised) | 100+ aktif cihaz |

---

## 5. Teknik Borç ve Riskler

| Risk | Etki | Olasılık | Azaltma |
|------|------|----------|---------|
| **Model boyutu mobilde büyük** | Yüksek | Orta | Quantization (INT4/INT8), Model pruning, Dynamic loading |
| **iOS Safari WebXR desteği sınırlı** | Orta | Yüksek | Native bridge (Capacitor), Fallback: Manuel form |
| **IoT sensör batarya ömrü** | Yüksek | Yüksek | Low-power LoRaWAN, Solar şarj, Sleep modları |
| **Veri gizliliği (Ses/Foto)** | Yüksek | Orta | On-device processing, Opt-in, Anonimleştirme |
| **Model hallucination (Tıbbi risk)** | Kritikal | Düşük | Rule-based guardrails, Human-in-the-loop, Şeffaf açıklama |
| **Federated learning convergence** | Orta | Orta | Server-side validation, Byzantine-robust aggregation |

---

## 6. İşbirliği ve Açık Kaynak Fırsatları

| Alan | Potansiyel Ortaklar | İşbirliği Türü |
|------|---------------------|----------------|
| **Arı Genetiği** | TÜBİTAK MAM, ÇOMÜ, Ondokuz Mayıs Ünv. | Veri paylaşımı, Ortak makale |
| **Varroa Biyolojisi** | COLOSS, Apimondia, Ulusal Arı Enstitüleri | Protokol standardizasyonu |
| **İklim/Flora Verisi** | MGM, FAO, WorldClim, NASA POWER | API entegrasyonu, Veri lisansı |
| **IoT Donanımı** | Türk teknoloji firmaları (Örn: Netcad, Argela) | Ortak R&D, Pilot dağıtım |
| **Ses/AR AI** | Akademik laboratuvarlar (Boğaziçi, ODTÜ, İTÜ) | Tez konuları, Model eğitimi |
| **Açık Kaynak** | HuggingFace, Papers with Code, GitHub | Model kartları, Dataset kartları |

---

## 7. Maliyet Tahminleri (Gelecek Yıllar)

| Yıl | R&D Bütçesi (USD) | Ana Kalemler |
|-----|-------------------|--------------|
| **2026 (v1.0-v1.5)** | $50K | AI modelleri, PWA, MCP, Beta |
| **2027 (v2.0)** | $200K | IoT, Marketplace, BeeMind Core, GPU cluster |
| **2028 (v2.5-v3.0)** | $500K | AR, Drone, Federated Learning, Uluslararası |
| **2029+ (v3.0+)** | $1M+ | Global ölçek, Akademik ortaklıklar, Sürdürülebilirlik |

---

## 8. Vizyon 2030: "Global Pollinator Intelligence Network"

> **2030 hedefi:** BeeMaster AI, sadece arıcılık uygulaması değil; **dünyanın en büyük arı sağlığı ve verimlilik veri ağı** olacak.

| Bileşen | 2030 Hedefi |
|---------|-------------|
| **Aktif Kovan** | 10M+ (Türkiye, Orta Doğu, Balkanlar, Orta Asya, Afrika) |
| **Veri Noktaları/Gün** | 50M+ (Muayene, Sensör, Hava, Flora, Pazar) |
| **AI Model Doğruluğu** | Varroa %95+, Verim tahmini R² > 0.85 |
| **Kullanıcı Dili** | 20+ dil (Türkçe, İngilizce, Arapça, Farsça, Rusça, İspanyolca, Fransızca, Almanca, Çince, vb.) |
| **Akademik İşbirlikleri** | 50+ üniversite/araştırma enstitüsü |
| **Politika Etkisi** | Ulusal arıcılık politikaları, KVKK uyumlu veri paylaşımı |
| **Sürdürülebilirlik** | Karbon negatif platform, Bestäuber koruma fonu |

---

*Bu belge canlıdır. Her sprint review'de, beta geri bildirimlerinde ve teknolojik gelişmelerde güncellenir. Öncelikler RICE skorları ve stratejik hedeflerle yeniden değerlendirilir.*

**Son Güncelleme:** 2026-07-19  
**Sahip:** Product Lead + Tech Lead + AI Lead