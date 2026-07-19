/* ============================================================
   BeeMaster AI — Region & Flora override
   Eğil/Diyarbakır özel bölge seçici ve flora modülü entegrasyonu
   ============================================================ */

(function (global) {
  'use strict';

  const REGIONS = {
    'TR-Diyarbakir-Egil': {
      label: 'Eğil / Diyarbakır',
      coords: { lat: 38.24, lon: 40.10 },
      altitude_m: 850,
      climate: 'Csa/BSh (karasal Akdeniz)',
      floraModule: 'experts/honey/flora-tr-diyarbakir-egil.md',
      notes: 'Karasal Akdeniz; yaz çok sıcak, kış soğuk. Ana akım Mayıs-Haziran (geven + kekik).',
      overrides: {
        // Bölgesel override: bu eşikler globalden öncelikli
        varroaAutumnThreshold: 2, // TR direnci nedeniyle daha düşük
        varroaSpringThreshold: 1,
        winterStoresKg: 15,
        mainFlowStart: '2026-05-01',
        mainFlowEnd: '2026-06-30',
        dearthStart: '2026-07-15',
        dearthEnd: '2026-08-31',
      },
    },
    'TR-Diyarbakir-Merkez': {
      label: 'Diyarbakır Merkez',
      coords: { lat: 37.91, lon: 40.23 },
      altitude_m: 660,
      climate: 'Csa',
      floraModule: 'experts/honey/flora.md',
      notes: 'Diyarbakır merkez ili. Eğil\'e benzer flora; biraz daha alçak rakım.',
      overrides: {
        varroaAutumnThreshold: 2,
        varroaSpringThreshold: 1,
        winterStoresKg: 15,
        mainFlowStart: '2026-04-15',
        mainFlowEnd: '2026-06-30',
      },
    },
    'TR-Muğla': {
      label: 'Muğla (Çam balı)',
      coords: { lat: 37.21, lon: 28.36 },
      altitude_m: 600,
      climate: 'Csa (Akdeniz)',
      floraModule: 'experts/honey/flora.md',
      notes: 'Çam balı bölgesi. Ana akım Haziran-Eylül (Marchalina hellenica).',
      overrides: {
        varroaAutumnThreshold: 2,
        varroaSpringThreshold: 2,
        winterStoresKg: 12,
        mainFlowStart: '2026-06-01',
        mainFlowEnd: '2026-09-15',
      },
    },
    'TR-Rize': {
      label: 'Rize (Anzer)',
      coords: { lat: 41.02, lon: 40.52 },
      altitude_m: 1800,
      climate: 'Cfb (okyanusal)',
      floraModule: 'experts/honey/flora.md',
      notes: 'Anzer yaylası. Ana akım Temmuz (Anzer thyme). Premium monofloral.',
      overrides: {
        varroaAutumnThreshold: 2,
        varroaSpringThreshold: 1,
        winterStoresKg: 18,
        mainFlowStart: '2026-07-01',
        mainFlowEnd: '2026-08-15',
      },
    },
    'EU-Temperate': {
      label: 'Avrupa Ilıman',
      coords: null,
      climate: 'Cfb',
      floraModule: 'experts/honey/flora.md',
      overrides: {
        varroaAutumnThreshold: 3,
        varroaSpringThreshold: 2,
        winterStoresKg: 18,
      },
    },
    'US-Northeast': {
      label: 'ABD Kuzeydoğu',
      coords: null,
      climate: 'Dfb',
      floraModule: 'experts/honey/flora.md',
      overrides: {
        varroaAutumnThreshold: 3,
        varroaSpringThreshold: 2,
        winterStoresKg: 27, // 60 lb USDA önerisi
      },
    },
    'TR-Generic': {
      label: 'Türkiye (Genel)',
      coords: null,
      climate: '—',
      floraModule: 'experts/honey/flora.md',
      overrides: {
        varroaAutumnThreshold: 3,
        varroaSpringThreshold: 2,
        winterStoresKg: 15,
      },
    },
  };

  function getRegion(key) {
    return REGIONS[key] || REGIONS['TR-Generic'];
  }

  function listRegions() {
    return Object.entries(REGIONS).map(([key, val]) => ({ key, ...val }));
  }

  // Bölgesel override'lı threshold — karar motoru için
  function getThreshold(regionKey, thresholdName, fallback) {
    const r = getRegion(regionKey);
    return r.overrides[thresholdName] ?? fallback;
  }

  // Takvimsel bilgi: şu an hangi dönemdeyiz?
  function getSeasonalContext(regionKey, date) {
    const r = getRegion(regionKey);
    const d = date ? new Date(date) : new Date();
    const m = d.getMonth() + 1;
    const overrides = r.overrides;

    if (overrides.mainFlowStart && overrides.mainFlowEnd) {
      const start = new Date(overrides.mainFlowStart);
      const end = new Date(overrides.mainFlowEnd);
      if (d >= start && d <= end) {
        return { period: 'main_flow', label: 'Ana nektar akımı', urgency: 'low' };
      }
    }
    if (overrides.dearthStart && overrides.dearthEnd) {
      const ds = new Date(overrides.dearthStart);
      const de = new Date(overrides.dearthEnd);
      if (d >= ds && d <= de) {
        return { period: 'dearth', label: 'Açlık dönemi', urgency: 'high' };
      }
    }
    // Kış
    if (m <= 2 || m === 12) {
      return { period: 'winter', label: 'Kış dönemi', urgency: 'medium' };
    }
    // İlkbahar
    if (m >= 3 && m <= 4) {
      return { period: 'spring', label: 'İlkbahar gelişimi', urgency: 'low' };
    }
    // Geç sonbahar
    if (m >= 10 && m <= 11) {
      return { period: 'late_autumn', label: 'Kış hazırlığı', urgency: 'high' };
    }
    return { period: 'unknown', label: '—', urgency: 'low' };
  }

  // Karar motoru için: regional override'ları bir context objesine yaz
  function buildRegionalContext(regionKey) {
    const r = getRegion(regionKey);
    const seasonal = getSeasonalContext(regionKey);
    return {
      region: r.label,
      regionKey,
      climate: r.climate,
      coords: r.coords,
      thresholds: r.overrides,
      seasonal,
      notes: r.notes,
      floraModule: r.floraModule,
    };
  }

  global.BeeRegion = {
    list: listRegions,
    get: getRegion,
    threshold: getThreshold,
    seasonal: getSeasonalContext,
    context: buildRegionalContext,
  };
})(window);