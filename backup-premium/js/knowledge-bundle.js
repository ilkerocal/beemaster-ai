/* ============================================================
   BeeMaster AI — Knowledge Bundle (offline KB for dashboard)
   Mirrors structure of /experts and /knowledge modules.
   ============================================================ */

(function (global) {
  'use strict';

  const KB = {
    // Decision-pipeline summary for advisor
    pipeline: {
      situation: 'Problemi 1–3 cümlede yeniden ifade et',
      evidence: 'Ne biliyoruz, ne varsayıyoruz',
      diagnosis: 'En olası tanı + alternatifler',
      confidence: 'high / medium / low + yüzde',
      risk: '6 eksen: hastalık / oğul / açlık / ana arı / bal / kış',
      priority: 'high / medium / low',
      action: 'Spesifik, numaralı adımlar',
      expectedResult: 'Başarı nasıl görünür',
      verifyBy: 'Doğrulama tarihi + kontrol',
    },

    // Tree of modules for the KB viewer
    tree: [
      {
        group: 'V1 — Çekirdek Zekâ',
        items: [
          { id: 'skills', title: 'Beceri kayıt defteri' },
          { id: 'identity', title: 'Kimlik' },
          { id: 'principles', title: 'İlkeler' },
          { id: 'workflow', title: 'İş akışı' },
          { id: 'reasoning', title: 'Akıl yürütme' },
          { id: 'communication', title: 'İletişim' },
          { id: 'memory', title: 'Bellek' },
          { id: 'safety', title: 'Güvenlik' },
        ],
      },
      {
        group: 'V2 — Arılık Yönetimi',
        items: [
          { id: 'apiary', title: 'Arılık yönetimi' },
          { id: 'inspection', title: 'Muayene' },
          { id: 'hive_management', title: 'Kovan yönetimi' },
          { id: 'seasonal_management', title: 'Mevsimsel yönetim' },
          { id: 'migration', title: 'Göçer arıcılık' },
        ],
      },
      {
        group: 'V3 — Koloni Biyolojisi',
        items: [
          { id: 'queen', title: 'Ana arı' },
          { id: 'workers', title: 'İşçi arılar' },
          { id: 'drones', title: 'Erkek arılar' },
          { id: 'brood', title: 'Yavru' },
          { id: 'pheromones', title: 'Feromonlar' },
          { id: 'genetics', title: 'Genetik' },
        ],
      },
      {
        group: 'V4 — Hastalıklar',
        items: [
          { id: 'varroa', title: 'Varroa' },
          { id: 'nosema', title: 'Nosema' },
          { id: 'afb', title: 'Amerikan Yavru Çürüklüğü (AFB)' },
          { id: 'efb', title: 'Avrupa Yavru Çürüklüğü (EFB)' },
          { id: 'chalkbrood', title: 'Kireç hastalığı' },
          { id: 'stonebrood', title: 'Taş hastalığı' },
          { id: 'viruses', title: 'Virüsler' },
          { id: 'pests', title: 'Zararlılar' },
        ],
      },
      {
        group: 'V5 — Beslenme',
        items: [
          { id: 'feeding', title: 'Besleme' },
          { id: 'protein', title: 'Protein' },
          { id: 'syrup', title: 'Şeker şerbeti' },
          { id: 'pollen', title: 'Polen' },
          { id: 'supplements', title: 'Ek besinler' },
        ],
      },
      {
        group: 'V6 — Bal Üretimi',
        items: [
          { id: 'nectar', title: 'Nektar' },
          { id: 'flora', title: 'Flora' },
          { id: 'honey', title: 'Bal' },
          { id: 'frames', title: 'Çerçeveler' },
          { id: 'harvest', title: 'Hasat' },
          { id: 'storage', title: 'Depolama' },
        ],
      },
      {
        group: 'V7 — Ana Arı Yetiştirme',
        items: [
          { id: 'queen_cells', title: 'Ana arı hücreleri' },
          { id: 'mating', title: 'Çiftleşme' },
          { id: 'selection', title: 'Seçim' },
          { id: 'breeding', title: 'Islah' },
          { id: 'replacement', title: 'Değiştirme' },
        ],
      },
      {
        group: 'V9–V14 — Karar Motoru',
        items: [
          { id: 'decision_pipeline', title: 'Karar hattı' },
          { id: 'situation_assessment', title: 'Durum değerlendirmesi' },
          { id: 'evidence_weighing', title: 'Kanıt tartımı' },
          { id: 'risk_engine', title: 'Risk motoru' },
          { id: 'image_analysis', title: 'Görsel analiz' },
          { id: 'self_learning', title: 'Kendi kendine öğrenme' },
          { id: 'coaching_flow', title: 'Koçluk akışı' },
        ],
      },
      {
        group: 'Referanslar',
        items: [
          { id: 'regulations_tr', title: 'TR mevzuatı' },
          { id: 'regulations_eu', title: 'AB mevzuatı' },
          { id: 'regulations_us', title: 'ABD mevzuatı' },
          { id: 'climate_zones', title: 'İklim bölgeleri' },
        ],
      },
    ],

    // Compact module summaries (rendered when user clicks a node)
    // Full text is in the repo files; these are offline summaries.
    summaries: {
      'varroa': {
        title: 'Varroa (Varroa destructor)',
        sections: [
          { h: 'Tanım', p: 'Arıların en yıkıcı paraziti. Tedavi edilmezse 1–3 yılda koloni çöker.' },
          { h: 'Eşik değerler (sonbahar, ılıman iklim)', p: '>3 mite/100 arı → tedavi. İlkbahar >2, yaz >3.' },
          { h: 'Ölçüm', p: 'Alkol yıkama (altın standart), şeker silindirme (daha kolay), 24 saat yapışkan tabla (trend).' },
          { h: 'Tedavi seçenekleri', p: 'Broodless ise **oksalik asit** (2 g buhar). Yavru varsa **formik asit** veya **timol**. Amitraz/flumetrin direnç riski ile.' },
          { h: 'IPM', p: 'Ayda bir izle, drone comb tuzağı, yıllık comb rotasyonu, soft + sert kimyasal rotasyonu.' },
          { h: 'Kaynak', p: '[Bee Informed 2024](knowledge/scientific-library/bee-informed/varroa-2024.md) + [FAO 2022](knowledge/scientific-library/fao/varroa-2022.md)' },
        ],
      },
      'queen': {
        title: 'Ana Arı Biyolojisi',
        sections: [
          { h: 'Ömür', p: '2–4 yıl. 2 yıldan sonra verim düşer. Yıllık değiştirme önerilir.' },
          { h: 'Çiftleşme', p: '12–24 günlük virgin queen, 10–20 drone ile 5–40 m yükseklikte (DCA).' },
          { h: 'Yumurtlama', p: 'Günde 1500–2000 yumurta (yazın). 21 günde işçi, 24 günde erkek, 16 günde ana arı çıkar.' },
          { h: 'Feromon', p: '9-ODA mandibular + footprint. Koloniyi düzenler, ana arı yetiştirmeyi baskılar.' },
          { h: 'İşaretleme', p: 'Uluslararası yıl rengi: 0/5=mavi, 1/6=beyaz, 2/7=sarı, 3/8=kırmızı, 4/9=yeşil.' },
          { h: 'Kaynak', p: '[Ana arı modülü](experts/biology/queen.md)' },
        ],
      },
      'afb': {
        title: 'Amerikan Yavru Çürüklüğü (AFB)',
        sections: [
          { h: 'Etken', p: 'Paenibacillus larvae. Çok dayanıklı sporlar (onlarca yıl).' },
          { h: 'Belirtiler', p: 'Batan karartılmış petek kapakları, ip çeker larva (ropy test), yapışkan koku.' },
          { h: 'Tedavi', p: '⛔ Yoktur. Yakma + ekipman imhası (çoğu ülke). Sallama (shook swarm) bazı ülkelerde izinli.' },
          { h: 'Bildirim', p: 'TR, AB, ABD, AU, NZ\'de **zorunlu**. Yerel Tarım Müdürlüğü + Veteriner Lab.' },
          { h: 'Önleme', p: 'Şüpheli bal yedirmeyin, ekipman dezenfekte etmeyin (etkisiz), yeni kolonileri karantinaya alın.' },
          { h: 'Kaynak', p: '[AFB modülü](experts/diseases/afb.md)' },
        ],
      },
      'feeding': {
        title: 'Besleme',
        sections: [
          { h: '1:1 şerbet', p: '1 kg şeker / 1 L su. İlkbahar uyarıcı.' },
          { h: '2:1 şerbet', p: '2 kg şeker / 1 L su. Sonbahar stok.' },
          { h: 'Fondan / şeker bloğu', p: 'Kış acil. Powdered sugar + az su.' },
          { h: 'Polen patties', p: 'Polen yokluğunda protein kaynağı. İlkbahar + geç sonbahar.' },
          { h: 'Yapma', p: 'Kahverengi şeker / pekmez kullanma (disentri yapar). Bal kaynağı belirsizse verme (AFB riski).' },
          { h: 'Kaynak', p: '[Besleme modülü](experts/nutrition/feeding.md)' },
        ],
      },
      'seasonal_management': {
        title: 'Mevsimsel Yönetim (TR-Diyarbakır örneği)',
        sections: [
          { h: 'Şubat–Mart', p: 'İlk muayene; ana arı kontrolü; gerekirse polen patty.' },
          { h: 'Nisan–Mayıs', p: 'Oğul kontrolü (haftalık muayene); süper ekleme.' },
          { h: 'Haziran–Temmuz', p: 'Ana akım; bal hasadı; ana arı yetiştirme.' },
          { h: 'Ağustos', p: '**Varroa kontrolü + tedavi** (kritik pencere).' },
          { h: 'Eylül–Ekim', p: 'Kış beslemesi (2:1 şerbet); 15+ kg stok hedefi.' },
          { h: 'Kasım', p: 'Fare koruyucu, giriş daraltıcı, üst izolasyon.' },
          { h: 'Kaynak', p: '[Mevsimsel yönetim](experts/apiary/seasonal_management.md)' },
        ],
      },
      'regulations_tr': {
        title: 'Türkiye Arıcılık Mevzuatı',
        sections: [
          { h: 'Arıcılık Kayıt Sistemi (AKS)', p: 'Tüm arılıklar kayıtlı olmalı.' },
          { h: 'Bildirimi zorunlu hastalıklar', p: 'AFB, EFB, SHB, Tropilaelaps.' },
          { h: 'İlaç kullanımı', p: 'Bal hasadı döneminde yasak. Reçetesiz antibiyotik yasak.' },
          { h: 'Nakil', p: 'Veteriner sağlık raporu zorunlu.' },
          { h: 'Desteklemeler', p: 'Kovan başına yıllık destek, organik + ana arı yetiştirme ek destek.' },
          { h: 'Kaynak', p: '[TR mevzuatı](knowledge/references/regulations-tr.md)' },
        ],
      },
      'regulations_eu': {
        title: 'AB Arıcılık Mevzuatı',
        sections: [
          { h: 'Bal tebliği (2001/110/EC)', p: 'Nem ≤%20, HMF ≤40 mg/kg, diasaz ≥8.' },
          { h: 'Hayvan sağlığı (2016/429)', p: 'AFB, EFB, SHB, Tropilaelaps bildirimi zorunlu.' },
          { h: 'Etiketleme', p: 'Menşe ülke belirtilmeli. Çoklu menşe ise tüm ülkeler.' },
          { h: 'Üye ülke hareketi', p: 'TRACES sertifikası + resmi veteriner sağlık raporu.' },
          { h: 'Pestisit', p: 'Neonikotinoidler açık alanda yasak (2018).' },
          { h: 'Kaynak', p: '[AB mevzuatı](knowledge/references/regulations-eu.md)' },
        ],
      },
      'regulations_us': {
        title: 'ABD Arıcılık Mevzuatı',
        sections: [
          { h: 'Arılık kaydı', p: 'Eyalete göre değişir. CA, FL, TX, NY zorunlu.' },
          { h: 'Eyaletler arası nakil', p: 'Sağlık sertifikası + son 30 gün muayene.' },
          { h: 'Bildirimi zorunlu', p: 'AFB (NY, FL, TX), EFB (bazı), SHB, Tropilaelaps.' },
          { h: 'Balm standardı', p: 'FDA Codex tanımını kullanır. Infant uyarısı.' },
          { h: 'Antibiyotik', p: 'Yasal ama sıkı kurallar; kalıntı taraması.' },
          { h: 'Kaynak', p: '[ABD mevzuatı](knowledge/references/regulations-us.md)' },
        ],
      },
      'climate_zones': {
        title: 'İklim Bölgeleri',
        sections: [
          { h: 'TR-Diyarbakır (Csa/BSh)', p: 'Karasal Akdeniz / yarı kurak. Kış -5…-15°C, yaz 35–42°C.' },
          { h: 'Akdeniz (TR, GR, IT, ES)', p: 'Ilık kış, sıcak yaz. Çam balı (TR Muğla).' },
          { h: 'Ilıman okyanusal (UK, NL, DE)', p: 'Hafif kış, serin yaz. Linden, heather.' },
          { h: 'Karasal soğuk (PL, US kuzey)', p: 'Sert kış, geç ilkbahar. Ağır besleme + izolasyon.' },
          { h: 'Tropikal (BR, KE, IN)', p: 'Yıl boyu yavru, SHB var.' },
          { h: 'Kaynak', p: '[İklim bölgeleri](knowledge/references/climate-zones.md)' },
        ],
      },
      'workflow': {
        title: 'İş Akışı (4 Aşama)',
        sections: [
          { h: '1. Çerçeve (Frame)', p: 'Sorunu, bölgeyi, kovanı, gözlemleri anla. 3–5 cümle.' },
          { h: '2. Akıl Yürütme (Reason)', p: 'Karar hattını yürüt: Durum → Kanıt → Tanı → Güven → Risk → Öncelik → Eylem → Beklenen Sonuç → Doğrulama.' },
          { h: '3. Yanıt (Answer)', p: 'Eylemle başla. Spesifik sayılar + tarihler. Kaynaklar mutlaka belirt.' },
          { h: '4. Yansıtma (Reflect)', p: 'Belleğe yaz, bilgi adayı aç, kalibrasyonu güncelle.' },
          { h: 'Kaynak', p: '[İş akışı](core/workflow.md)' },
        ],
      },
      'decision_pipeline': {
        title: 'Karar Hattı (8 Aşama)',
        sections: [
          { h: 'Durum → Kanıt → Tanı → Güven', p: 'İlk dört: gözlem + çıkarım.' },
          { h: 'Risk → Öncelik → Eylem → Beklenen Sonuç', p: 'Son dört: aksiyon.' },
          { h: 'Doğrulama (verify by)', p: 'Her çıktı tarih + 3–5 spesifik kontrol ile biter.' },
          { h: 'Kaynak', p: '[Karar hattı](workflows/decision-pipeline.md)' },
        ],
      },
      'risk_engine': {
        title: 'Risk Motoru (6 Eksen)',
        sections: [
          { h: 'Hastalık', p: 'Mite sayısı + yavru deseni + mevsim.' },
          { h: 'Oğul', p: 'Queen hücresi + sıkışıklık + ana yaşı.' },
          { h: 'Açlık', p: 'Stok + tüketim + mevsim.' },
          { h: 'Ana arı başarısızlığı', p: 'Yumurta yok + ana yaşlı + saçma yavru.' },
          { h: 'Bal üretimi', p: 'Aktif akış + koloni gücü + süper.' },
          { h: 'Kış sağ kalımı', p: 'Mite + stok + ana + küme büyüklüğü.' },
          { h: 'Kaynak', p: '[Risk motoru](workflows/risk-engine.md)' },
        ],
      },
    },

    // Markdown-lite renderer (handles h1-h3, tables, lists, code, blockquote)
    render(moduleId) {
      const m = this.summaries[moduleId];
      if (!m) return `<p>Modül bulunamadı: ${moduleId}. Tam içerik için GitHub deposuna bakın.</p>`;
      return `
        <div class="kb-viewer-content">
          <h1>${m.title}</h1>
          ${m.sections.map((s) => {
            const p = s.p
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
              .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
              .replace(/`([^`]+)`/g, '<code>$1</code>');
            return `<h3>${s.h}</h3><p>${p}</p>`;
          }).join('')}
        </div>
      `;
    },

    // Render tree HTML
    renderTree() {
      return `
        <ul class="kb-tree">
          ${this.tree.map((g) => `
            <li>
              <div class="kb-tree-group">${g.group}</div>
              <ul style="list-style:none; padding-left:0;">
                ${g.items.map((it) => `<li><a href="#/knowledge/${it.id}" data-kb="${it.id}">${it.title}</a></li>`).join('')}
              </ul>
            </li>
          `).join('')}
        </ul>
      `;
    },
  };

  global.BeeKb = KB;
})(window);