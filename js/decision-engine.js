/* ============================================================
   BeeMaster AI — Decision Engine
   Implements core/workflow.md + workflows/decision-pipeline.md
   Works OFFLINE with rule-based diagnosis; can be enhanced by LLM.
   ============================================================ */

(function (global) {
  'use strict';

  const KB = global.BeeKb;

  // ===========================================================
  // Quick scenario handlers (one-click advisor buttons)
  // ===========================================================

  function scenario_miteCount(input, context) {
    const m = parseFloat(input.matchCount || 0);
    const date = context.date ? new Date(context.date) : new Date();
    const month = date.getMonth() + 1;
    let season = 'summer';
    if (month >= 3 && month <= 5) season = 'spring';
    else if (month >= 6 && month <= 8) season = 'summer';
    else if (month >= 9 && month <= 11) season = 'autumn';
    else season = 'winter';

    // Bölgesel override uygula (TR Eğil vb. için farklı eşikler)
    const regionKey = context.regionKey || (window.BeeDb && window.BeeDb.getSettings().region);
    const regionalThresholds = (regionKey && window.BeeRegion)
      ? {
          spring: window.BeeRegion.threshold(regionKey, 'varroaSpringThreshold', 2),
          summer: window.BeeRegion.threshold(regionKey, 'varroaAutumnThreshold', 3),
          autumn: window.BeeRegion.threshold(regionKey, 'varroaAutumnThreshold', 1),
          winter: window.BeeRegion.threshold(regionKey, 'varroaAutumnThreshold', 1),
        }
      : { spring: 2, summer: 3, autumn: 1, winter: 1 };
    const threshold = regionalThresholds[season] ?? 3;
    const above = m > threshold;

    return {
      situation: `${m} mite / 100 arı (${season}) — ${context.region || 'TR-Diyarbakir'}.`,
      evidence: [
        `Kullanıcı sayımı: ${m} mite / 100 arı.`,
        `Mevsim: ${season}. Eşik: ${threshold} mite / 100 arı (Bee Informed 2024 + FAO 2022).`,
        context.queenAge ? `Ana arı yaşı: ${context.queenAge} ay.` : null,
      ].filter(Boolean),
      diagnosis: above
        ? `${season} eşiğinin (${threshold}/100) üzerinde — tedavi gerekli.`
        : `Eşiğin altında (${threshold}/100) — rutin izleme yeterli.`,
      confidence: 'high',
      confidencePct: above ? 80 : 75,
      risk: above
        ? { disease: 70, swarm: 15, starvation: 20, queenFailure: 20, honeyProduction: 60, winterSurvival: 60 }
        : { disease: 25, swarm: 15, starvation: 20, queenFailure: 20, honeyProduction: 70, winterSurvival: 80 },
      priority: above ? 'high' : 'low',
      actions: above ? buildTreatmentPlan(season, m, context) : [
        'Aylık izlemeye devam edin.',
        `${addDays(14)} tarihinde yeniden sayım yapın.`,
      ],
      expectedResult: above
        ? 'Tedaviden 14 gün sonra mite sayısı < 1 / 100 arı.'
        : 'Mite seviyesi düşük kalırsa müdahale gerekmez.',
      verifyBy: `${addDays(14)} tarihinde 24 saatlik düşüş sayımı yapın.`,
      sources: [
        '[Bee Informed 2024 eşikleri](knowledge/scientific-library/bee-informed/varroa-2024.md)',
        '[FAO Varroa Control 2022](knowledge/scientific-library/fao/varroa-2022.md)',
      ],
    };
  }

  function buildTreatmentPlan(season, miteCount, context) {
    const plans = [];
    if (season === 'autumn' || season === 'winter' || context.broodless) {
      plans.push('1. **Oksalik asit buharı**: kovan başına 2 g, akşam saatlerinde (bal süperleri kapalı).');
      plans.push('2. Broodless pencere varsa 14 gün sonra tekrarlayın.');
    } else if (season === 'spring') {
      plans.push('1. **Formik asit** (Formic Pro / MAQS): kovan başına 1 ped, 7 gün, sıcaklık 10–29°C.');
      plans.push('2. Varsa drone comb tuzağı ile ek mite düşüşü sağlayın.');
    } else { // summer
      plans.push('1. **Formik asit** veya **timol** (ApiLife Var / Apiguard).');
      plans.push('2. Ballıkları çıkarın; süper varsa bal hasadı sonrası uygulayın.');
    }
    plans.push('3. 14 gün sonra alkol yıkama veya şeker silindiri ile yeniden sayım.');
    plans.push('4. 1 ay sonra ikinci tedavi gerekebilir (mevsim sonuna göre).');
    return plans;
  }

  function scenario_queenless(input, context) {
    return {
      situation: 'Kovan ana arısız görünüyor. Tanı koymak için yumurta kontrolü kritik.',
      evidence: [
        'Ana arı görülmedi.',
        input.eggsPresent ? 'Yumurta mevcut — ana arı son 3 gün içinde vardı.' : 'Yumurta yok.',
        input.queenCells ? `Queen hücresi var: ${input.queenCells} adet.` : 'Queen hücresi yok.',
      ].filter(Boolean),
      diagnosis: !input.eggsPresent && !input.queenCells
        ? 'Ana arısız, acil müdahale gerekli.'
        : !input.eggsPresent && input.queenCells
          ? 'Ana arısız, koloni kendisi yetiştiriyor (acil hücre).'
          : 'Ana arı muhtemelen mevcut (virgin veya yakın zamanda değişmiş).',
      confidence: input.eggsPresent ? 'medium' : 'high',
      confidencePct: input.eggsPresent ? 65 : 85,
      risk: { disease: 30, swarm: 25, starvation: 30, queenFailure: input.eggsPresent ? 30 : 80, honeyProduction: 50, winterSurvival: 50 },
      priority: input.eggsPresent ? 'medium' : 'high',
      actions: input.eggsPresent ? [
        '5–7 gün bekleyip yeniden kontrol edin.',
        'Ana arı görürseniz işaretleyin (yıl rengi).',
      ] : input.queenCells ? [
        'Acil hücreler varsa müdahale etmeyin — koloni karar versin.',
        '7 gün sonra kontrol edin; ana arı çıkışını gözleyin.',
      ] : [
        'Sağlıklı bir kovandan **yumurta çerçevesi** verin (4–5 gün sonra queen hücresi yapılırsa gerçekten anasız).',
        'Veya doğrudan **çiftleşmiş ana arı** (kafesli, şekerleme tıpası) verin.',
        '24 saat sonra kafesleri yerleştirin, 7 gün sonra yumurtayı kontrol edin.',
      ],
      expectedResult: 'Yumurtlama 7–14 gün içinde başlar (kabul edildiyse).',
      verifyBy: '7 gün sonra yumurtayı kontrol edin. Varsa kabul. Yoksa kafesleyin veya yenileyin.',
      sources: [
        '[Ana arı biyolojisi](experts/biology/queen.md)',
        '[Ana arı değiştirme](experts/queen-rearing/replacement.md)',
      ],
    };
  }

  function scenario_swarm(input, context) {
    const cells = parseInt(input.queenCells || 0);
    return {
      situation: `${cells} queen hücresi tespit edildi. Oğul riski değerlendirmesi.`,
      evidence: [
        `${cells} queen hücresi, konum: ${input.queenCellType || 'belirsiz'}.`,
        `Mevsim: ${context.season || 'bilinmiyor'}.`,
        input.queenAge ? `Ana arı yaşı: ${input.queenAge} ay.` : null,
      ].filter(Boolean),
      diagnosis: cells >= 5
        ? 'Oğul hücreleri — aktif oğul hazırlığı muhtemel.'
        : cells > 0
          ? 'Süpersedür veya erken oğul belirtisi.'
          : 'Oğul hücresi yok — düşük risk.',
      confidence: cells >= 5 ? 'high' : cells > 0 ? 'medium' : 'high',
      confidencePct: cells >= 5 ? 85 : 60,
      risk: {
        disease: 20,
        swarm: cells >= 5 ? 90 : cells > 0 ? 50 : 10,
        starvation: 20,
        queenFailure: 10,
        honeyProduction: cells >= 5 ? 30 : 70,
        winterSurvival: 60,
      },
      priority: cells >= 5 ? 'high' : cells > 0 ? 'medium' : 'low',
      actions: cells >= 5 ? [
        '**Yapay oğul (bölme)**: ana arı + 2 yavru + 2 ballık çerçeveyi yeni kovana alın, eski kovan yerinde yeni ana arı yetiştirir.',
        'Veya tüm oğul hücrelerini kesin (sadece 7 gün kazanır).',
        'Süper ekleyin, sıkışıklığı giderin.',
        'Ana arı yaşlıysa (2+ yıl) değiştirin.',
      ] : cells > 0 ? [
        'Hücreleri işaretleyin, 7 gün sonra tekrar kontrol edin.',
        'Süper ekleyerek yer açın.',
      ] : [
        'Rutin izlemeye devam edin (haftalık).',
        'Mayıs ayında sıkışıklık kontrolü öncelik.',
      ],
      expectedResult: cells >= 5 ? 'Bölme sonrası 7 gün içinde iki ayrı koloni, 14 gün içinde yeni ana arı yumurtası.' : 'Müdahale gerekmiyor.',
      verifyBy: '7 gün sonra hücreleri tekrar sayın.',
      sources: [
        '[Oğul yönetimi](experts/apiary/hive_management.md)',
        '[Ana arı hücreleri](experts/queen-rearing/queen_cells.md)',
      ],
    };
  }

  function scenario_feeding(input, context) {
    const stores = parseInt(input.framesOfStores || 0);
    const date = context.date ? new Date(context.date) : new Date();
    const month = date.getMonth() + 1;
    const isWinter = month <= 2 || month === 12;

    return {
      situation: `Stok: ${stores} çerçeve bal. Mevsim: ${isWinter ? 'kış' : 'diğer'}.`,
      evidence: [
        `Mevcut bal çerçevesi: ${stores}.`,
        isWinter ? 'Kış dönemi — yüksek tüketim.' : 'Aktif dönem — tüketim orta.',
        context.region ? `Bölge: ${context.region}.` : null,
      ].filter(Boolean),
      diagnosis: stores < 3
        ? 'Stok kritik — acil besleme gerekli.'
        : stores < 5
          ? 'Stok düşük — destekleyici besleme önerilir.'
          : 'Stok yeterli.',
      confidence: 'high',
      confidencePct: 80,
      risk: {
        disease: 20,
        swarm: 10,
        starvation: stores < 3 ? 80 : stores < 5 ? 40 : 10,
        queenFailure: 15,
        honeyProduction: 50,
        winterSurvival: stores < 5 ? 50 : 80,
      },
      priority: stores < 3 ? 'high' : stores < 5 ? 'medium' : 'low',
      actions: stores < 3 ? (isWinter ? [
        '**Acil**: kovan üst çubuklarına 1–2 kg fondan (powder sugar + az su) yerleştirin.',
        'Besleme kesilene kadar haftalık kontrol.',
      ] : [
        '**2:1 şerbet** (2 kg şeker / 1 L su): kovan başına 5 L, 2–4 L porsiyonlar halinde.',
        'İç besleyici kullanın (giriş besleyicisi yağmacılığı tetikler).',
      ]) : stores < 5 ? [
        '**1:1 şerbet** ile uyarıcı besleme (ilkbahar) veya **2:1** (sonbahar).',
        'Haftada 2 L, akşam saatlerinde.',
      ] : [
        'Besleme gerekmiyor.',
        'Ayda bir stok kontrolü yeterli.',
      ],
      expectedResult: stores < 3 ? '2 hafta içinde stok 5+ çerçeveye çıkar.' : 'Stok korunur.',
      verifyBy: '7 gün sonra çerçeve sayımı tekrar.',
      sources: [
        '[Besleme](experts/nutrition/feeding.md)',
        '[Şeker şerbeti](experts/nutrition/syrup.md)',
      ],
    };
  }

  function scenario_afbSuspect(input, context) {
    return {
      situation: 'AFB şüphesi — acil değerlendirme gerekli.',
      evidence: [
        'Gözlemler: ' + (input.symptoms || 'belirtilmemiş'),
        'AFB (Paenibacillus larvae) Türkiye\'de ve AB\'de bildirimi zorunlu.',
      ],
      diagnosis: 'AFB şüphesi — doğrulama için lab testi şart.',
      confidence: 'medium',
      confidencePct: 60,
      risk: { disease: 95, swarm: 5, starvation: 10, queenFailure: 10, honeyProduction: 20, winterSurvival: 30 },
      priority: 'high',
      actions: [
        '⛔ **DURUN**: ekipman, bal, çerçeve taşımayın.',
        'Field testleri yapın: ropy test (çubukla çekip 1 cm+ ip), koku testi (yapışkan koku).',
        '**Yerel Tarım Müdürlüğü + Veteriner Lab**\'a bildirin (TR mevzuatı zorunlu).',
        'Fotoğraf çekin, semptom tarihini not edin.',
        'Kesin tanı sonrası: yetkili kararına göre yakma veya sallama (shook swarm).',
      ],
      expectedResult: 'Bildirim sonrası lab doğrulaması 3–7 gün içinde.',
      verifyBy: 'Yerel otorite talimatlarını bekleyin.',
      sources: [
        '[AFB modülü](experts/diseases/afb.md)',
        '[TR mevzuatı](knowledge/references/regulations-tr.md)',
        '[Core safety](core/safety.md)',
      ],
    };
  }

  function scenario_winterPrep(input, context) {
    return {
      situation: 'Kış hazırlığı değerlendirmesi.',
      evidence: [
        `Stok: ${input.framesOfStores || '?'} çerçeve bal. Hedef: 8+ çerçeve.`,
        `Varroa: ${input.varroaPer100 || '?'} mite / 100 arı. Hedef: < 1.`,
        `Arı nüfusu: ${input.framesOfBees || '?'} çerçeve. Hedef: 6+.`,
      ],
      diagnosis: 'Kış hazırlığı için kontrol listesi.',
      confidence: 'high',
      confidencePct: 85,
      risk: {
        disease: (input.varroaPer100 || 0) > 2 ? 70 : 20,
        swarm: 10,
        starvation: (input.framesOfStores || 0) < 6 ? 70 : 20,
        queenFailure: 20,
        honeyProduction: 50,
        winterSurvival: computeWinterSurvival(input),
      },
      priority: 'high',
      actions: [
        '**Varroa tedavisi**: sonbaharda oksalik asit (broodless pencere varsa ideal).',
        '**Stok kontrolü**: 8+ çerçeve bal hedefleyin; eksikse 2:1 şerbetle besleyin.',
        '**Küçük alan**: giriş daraltıcı + fare koruyucu (8 mm açıklık).',
        '**İzolasyon**: soğuk iklimde üst izolasyon (köpük).',
        '**Üst havalandırma**: nem çıkışı için üst delik/giriş.',
        '**Sonbahar arıları**: geç larva döneminde yeterli polen + bal stoğu.',
      ],
      expectedResult: 'Kış çıkışında %80+ sağ kalım.',
      verifyBy: 'Şubat başında dış kontrol (ölü böcek taraması, havalandırma).',
      sources: [
        '[Mevsimsel yönetim](experts/apiary/seasonal_management.md)',
        '[Varroa](experts/diseases/varroa.md)',
      ],
    };
  }

  function computeWinterSurvival(input) {
    let s = 80;
    if ((input.varroaPer100 || 0) > 2) s -= 30;
    if ((input.framesOfStores || 0) < 6) s -= 25;
    if ((input.framesOfBees || 0) < 6) s -= 20;
    return Math.max(0, Math.min(100, s));
  }

  // ===========================================================
  // Free-text advisor — keyword + heuristic matcher
  // ===========================================================

  function freeTextAdvisor(text, context) {
    const t = (text || '').toLowerCase();
    const ctx = Object.assign({}, context);
    // Bölgesel context ekle (yoksa settings'den çek)
    if (!ctx.regionKey && window.BeeDb && window.BeeRegion) {
      const key = window.BeeDb.getSettings().region;
      const regionCtx = window.BeeRegion.context(key);
      ctx.regionKey = key;
      ctx.thresholds = regionCtx.thresholds;
      ctx.seasonal = regionCtx.seasonal;
    }

    // Mite count?
    const m = t.match(/(\d+(?:[.,]\d+)?)\s*mite/);
    if (m) ctx.matchCount = m[1].replace(',', '.');

    // Queen cells?
    const qc = t.match(/(\d+)\s*(?:queen\s*hücre|meme|cell)/);
    if (qc) ctx.queenCells = parseInt(qc[1]);

    // Queen age?
    const qa = t.match(/(\d+)\s*(?:aylık|ay|month)/);
    if (qa) ctx.queenAge = parseInt(qa[1]);

    // Frames of stores?
    const fs = t.match(/(\d+)\s*(?:çerçeve|frame)/);
    if (fs) ctx.framesOfStores = parseInt(fs[1]);

    // Eggs?
    if (/yumurt|egg/.test(t)) ctx.eggsPresent = /yok|no|bulunmuyor/.test(t) ? false : true;

    // Now dispatch
    if (/varroa|mite/.test(t)) return scenario_miteCount({ matchCount: ctx.matchCount || 0 }, ctx);
    if (/an[aá]\s*ar[ıi]|queenless|anas[ıi]z/.test(t)) return scenario_queenless({ eggsPresent: ctx.eggsPresent, queenCells: ctx.queenCells }, ctx);
    if (/o[ğg]ul|swarm/.test(t)) return scenario_swarm({ queenCells: ctx.queenCells || 0, queenCellType: 'swarm' }, ctx);
    if (/besle|feed|şerbet|syrup|kek|fondan/.test(t)) return scenario_feeding({ framesOfStores: ctx.framesOfStores || 0 }, ctx);
    if (/afb|yavru çür|amerikan foul/.test(t)) return scenario_afbSuspect({ symptoms: text }, ctx);
    if (/kış|winter|kışla/.test(t)) return scenario_winterPrep({ framesOfStores: ctx.framesOfStores || 0, framesOfBees: 5, varroaPer100: ctx.matchCount || 0 }, ctx);

    // Generic fallback — return a coaching response
    return {
      situation: 'Sorunuzu analiz ediyorum.',
      evidence: [
        `Girdi: "${text}"`,
        'Bölge: ' + (ctx.region || 'TR-Diyarbakir'),
      ],
      diagnosis: 'Spesifik senaryo tespit edilmedi. Daha fazla bilgi gerekli.',
      confidence: 'low',
      confidencePct: 30,
      risk: { disease: 30, swarm: 20, starvation: 20, queenFailure: 20, honeyProduction: 60, winterSurvival: 60 },
      priority: 'medium',
      actions: [
        'Lütfen şunları belirtin:',
        '  - Bölge / mevsim',
        '  - Son muayene bulguları (yavru, ana arı, mite)',
        '  - Endişeniz (hastalık, stok, ana arı, vs.)',
        '',
        'Veya sol menüdeki "Hızlı senaryolar" butonlarını kullanın.',
      ],
      expectedResult: 'Net bilgi sonrası spesifik öneri.',
      verifyBy: 'Yeni muayene ile doğrulama.',
      sources: ['[Karar motoru docs](workflows/decision-pipeline.md)'],
    };
  }

  // ===========================================================
  // Helpers
  // ===========================================================

  function addDays(days, base) {
    const d = base ? new Date(base) : new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function renderDecision(d) {
    const riskAxes = [
      { key: 'disease', label: 'Hastalık riski', invert: false },
      { key: 'swarm', label: 'Oğul riski', invert: false },
      { key: 'starvation', label: 'Açlık riski', invert: false },
      { key: 'queenFailure', label: 'Ana arı başarısızlığı', invert: false },
      { key: 'honeyProduction', label: 'Bal üretimi', invert: true },
      { key: 'winterSurvival', label: 'Kış sağ kalımı', invert: true },
    ];

    const riskRows = riskAxes.map((a) => {
      const v = d.risk[a.key] ?? 0;
      const color = global.BeeRisk.riskColor(v, a.invert);
      return `<tr>
        <td>${a.label}</td>
        <td>
          <span class="risk-bar"><span class="risk-bar-fill" style="width: ${v}%; background: ${color};"></span></span>
        </td>
        <td style="color: ${color};">${v}%</td>
      </tr>`;
    }).join('');

    const sourcesHtml = (d.sources || []).map((s) => {
      // Convert plain text links to markdown-like
      return `<li>${s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')}</li>`;
    }).join('');

    return `
      <div class="decision-output">
        <div class="decision-section situation">
          <h4>Durum</h4>
          <p>${escapeHtml(d.situation)}</p>
        </div>
        <div class="decision-section">
          <h4>Kanıt</h4>
          <ul>${(d.evidence || []).map((e) => `<li>${escapeHtml(e)}</li>`).join('')}</ul>
        </div>
        <div class="decision-section diagnosis">
          <h4>Tanı
            <span class="decision-confidence ${d.confidence}">${d.confidence} (${d.confidencePct}%)</span>
            <span class="decision-priority ${d.priority}">Öncelik: ${d.priority}</span>
          </h4>
          <p>${escapeHtml(d.diagnosis)}</p>
        </div>
        <div class="decision-section risk">
          <h4>Risk (6 eksen)</h4>
          <table class="risk-table">${riskRows}</table>
        </div>
        <div class="decision-section action">
          <h4>Eylem planı</h4>
          <ul>${(d.actions || []).map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>
          <p style="margin-top: var(--sp-3);"><strong>Beklenen sonuç:</strong> ${escapeHtml(d.expectedResult)}</p>
        </div>
        <div class="decision-section verify">
          <h4>Doğrulama</h4>
          <p>${escapeHtml(d.verifyBy)}</p>
        </div>
        <div class="decision-section">
          <h4>Kaynaklar</h4>
          <ul class="decision-sources">${sourcesHtml}</ul>
        </div>
      </div>
    `;
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ===========================================================
  // Public API
  // ===========================================================

  global.BeeAdvisor = {
    // Scenarios
    handleScenario(name, input, context) {
      const fn = {
        'mite-count': scenario_miteCount,
        'queenless': scenario_queenless,
        'swarm': scenario_swarm,
        'feeding': scenario_feeding,
        'afb-suspect': scenario_afbSuspect,
        'winter-prep': scenario_winterPrep,
      }[name];
      if (!fn) return null;
      return fn(input || {}, context || {});
    },

    // Free text
    advise(text, context) {
      return freeTextAdvisor(text, context || {});
    },



    renderDecision,
  };



  // ============================================================
  // Frame Alerts — global scope
  // ============================================================

  function frameAlerts(ctx) {
    const alerts = [];
    if (!ctx || !ctx.recentFrames) return alerts;
    const f = ctx.recentFrames;

    if (f.honey < -3) {
      alerts.push({
        level: 'critical',
        title: '⚠️ Bal stoğu düşüyor',
        message: 'Son muayenelerde toplam ' + Math.abs(f.honey) + ' ballı çerçeve aldınız. Eğer ana nektar akımı bittiyse besleme gerekebilir.',
      });
    }

    if ((f['foundation-given'] + f['processed-given']) > 5 && f['capped-brood'] === 0 && f['open-brood'] === 0) {
      alerts.push({
        level: 'warning',
        title: '🐝 Yavru gelişimi yavaş',
        message: (f['foundation-given'] + f['processed-given']) + ' çerçeve petek verildi ama henüz yavrulu çerçeve gözlemlenmedi. Ana arı performansını veya koloni gücünü kontrol edin.',
      });
    }

    if (f['queen-cell'] < -2) {
      alerts.push({
        level: 'warning',
        title: '👑 Oğul riski',
        message: 'Son muayenelerde ' + Math.abs(f['queen-cell']) + ' ana arı hücresi kırıldı. Oğul eğilimi yüksek — sık kontrol önerilir.',
      });
    }

    if (f.pollen < 0 && f['capped-brood'] > 5) {
      alerts.push({
        level: 'warning',
        title: '🌸 Polen stoğu azalıyor',
        message: Math.abs(f.pollen) + ' polenli çerçeve alındı ama ' + f['capped-brood'] + ' kapalı yavrulu çerçeve var. Yavru gelişimi için polen yetersiz kalabilir.',
      });
    }

    if (f['foundation-given'] > 0 && f['capped-brood'] > 3 && f['open-brood'] > 2) {
      alerts.push({
        level: 'info',
        title: '✅ Sağlıklı büyüme',
        message: 'Ham petek örülüyor (' + f['foundation-given'] + ' çer.), ' + f['capped-brood'] + ' kapalı + ' + f['open-brood'] + ' açık yavrulu çerçeve mevcut.',
      });
    }

    if (f.empty > 3) {
      alerts.push({
        level: 'info',
        title: '📦 Çerçeve geri çekildi',
        message: f.empty + ' boş çerçeve kovandan alındı. Koloni muhtemelen küçülüyor — ana arı ve yavru durumunu kontrol edin.',
      });
    }

    return alerts;
  }

  function collectFrameMovements(inspections, days) {
    days = days || 30;
    const cutoff = new Date(Date.now() - days * 86400000);
    const totals = {
      'foundation-given': 0,
      'processed-given': 0,
      'capped-brood': 0,
      'open-brood': 0,
      'honey': 0,
      'pollen': 0,
      'honey-pollen': 0,
      'empty': 0,
      'queen-cell': 0,
    };
    inspections.forEach(function(ins) {
      if (!ins.date || new Date(ins.date) < cutoff) return;
      if (!ins.frameMovements) return;
      ins.frameMovements.forEach(function(m) {
        if (totals.hasOwnProperty(m.type)) totals[m.type] += m.count;
      });
    });
    return totals;
  }

})(window);