/* ============================================================
   BeeMaster AI — Forum & Resource Search (etik)
   Sadece arama linkleri üretir; scrape etmez, veri çekmez.
   Kullanıcının bilgiye ulaşmasını sağlar.
   ============================================================ */

(function (global) {
  'use strict';

  // ===========================================================
  // Bilinen Türkçe arıcılık forumları ve kaynakları
  // ===========================================================

  const SOURCES = {
    'tr-forum': [
      {
        name: 'Facebook: Arıcılık Grubu (Türkiye)',
        url: 'https://www.facebook.com/groups/search/groups/?q=aricilik',
        icon: '📘',
        desc: 'En büyük Türk arıcı topluluğu.',
      },
      {
        name: 'Facebook: Anadolu Arısı Grubu',
        url: 'https://www.facebook.com/groups/search/groups/?q=anadolu%20ar%C4%B1s%C4%B1',
        icon: '📘',
        desc: 'Anadolu arısı yetiştiricileri.',
      },
      {
        name: 'Facebook: Diyarbakır Arıcılar',
        url: 'https://www.facebook.com/groups/search/groups/?q=diyarbak%C4%B1r%20ar%C4%B1c%C4%B1',
        icon: '📘',
        desc: 'Yerel arıcı paylaşımları.',
      },
      {
        name: 'Apiterapi (arı ürünleri)',
        url: 'https://www.facebook.com/groups/search/groups/?q=apiterapi',
        icon: '📘',
        desc: 'Apiterapi ve arı ürünleri.',
      },
    ],
    'tr-official': [
      {
        name: 'TAYMERBİR (Türkiye Arı Yetiştiricileri Merkez Birliği)',
        url: 'https://arimuhendisleri.org/',
        icon: '🏛️',
        desc: 'Resmi Türk arıcılık birliği.',
      },
      {
        name: 'Tarım ve Orman Bakanlığı — Arıcılık',
        url: 'https://www.tarimorman.gov.tr/Konular/Hayvancilik/Aricilik',
        icon: '🏛️',
        desc: 'Resmi mevzuat ve destekler.',
      },
      {
        name: 'Ege Tarımsal Araştırma — Arıcılık',
        url: 'https://arastirma.tarimorman.gov.tr/etae',
        icon: '🔬',
        desc: 'TR arıcılık araştırmaları.',
      },
    ],
    'youtube': [
      {
        name: 'YouTube: Arıcılık videoları',
        url: 'https://www.youtube.com/results?search_query=aricilik',
        icon: '▶️',
        desc: 'Görsel arıcılık dersleri.',
      },
      {
        name: 'YouTube: Varroa tedavi',
        url: 'https://www.youtube.com/results?search_query=varroa+tedavi',
        icon: '▶️',
        desc: 'Varroa ile mücadele videoları.',
      },
      {
        name: 'YouTube: Ana arı yetiştirme',
        url: 'https://www.youtube.com/results?search_query=ana+ar%C4%B1+yeti%C5%9Ftirme',
        icon: '▶️',
        desc: 'Ana arı üretimi.',
      },
    ],
    'en-forum': [
      {
        name: 'Reddit: r/Beekeeping',
        url: 'https://www.reddit.com/r/Beekeeping/',
        icon: '🌐',
        desc: 'İngilizce en aktif arıcılık forumu.',
      },
      {
        name: 'BeeSource Forums',
        url: 'https://www.beesource.com/forums/',
        icon: '🌐',
        desc: 'Klasik ABD arıcılık forumu.',
      },
      {
        name: 'International Beekeeping Forum',
        url: 'https://www.beekeepingforum.co.uk/',
        icon: '🌐',
        desc: 'İngiliz dilinde uluslararası forum.',
      },
    ],
    'scientific': [
      {
        name: 'PubMed — Arıcılık araştırmaları',
        url: 'https://pubmed.ncbi.nlm.nih.gov/?term=apis+mellifera',
        icon: '🔬',
        desc: 'Hakemli bilimsel makaleler.',
      },
      {
        name: 'Apimondia',
        url: 'https://www.apimondia.com/',
        icon: '🌍',
        desc: 'Uluslararası arıcılık federasyonu.',
      },
      {
        name: 'Bee Informed Partnership',
        url: 'https://beeinformed.org/',
        icon: '🔬',
        desc: 'ABD tabanlı arı sağlığı araştırma konsorsiyumu.',
      },
    ],
    'egil-local': [
      {
        name: 'Diyarbakır İl Tarım Müdürlüğü',
        url: 'https://diyarbakir.tarimorman.gov.tr/',
        icon: '🏛️',
        desc: 'Diyarbakır il tarım ve orman müdürlüğü.',
      },
      {
        name: 'GAP Bölge Kalkınma İdaresi',
        url: 'https://www.gap.gov.tr/',
        icon: '🏛️',
        desc: 'GAP bölgesi tarımsal destekler.',
      },
      {
        name: 'Dicle Üniversitesi Ziraat Fakültesi',
        url: 'https://www.dicle.edu.tr/',
        icon: '🎓',
        desc: 'Yerel üniversite araştırmaları.',
      },
    ],
  };

  // ===========================================================
  // Arama fonksiyonları
  // ===========================================================

  // Google'da arama linki üret
  function googleSearch(query, region = 'tr') {
    const lang = region === 'tr' ? 'tr' : 'en';
    const site = region === 'tr' ? 'google.com.tr' : 'google.com';
    return `https://www.${site}/search?q=${encodeURIComponent(query)}&hl=${lang}`;
  }

  // Tüm kaynaklardan arama linkleri topla
  function buildSearchLinks(query, options = {}) {
    const region = options.region || 'tr';
    const sources = options.sources || Object.keys(SOURCES);

    const links = [];

    sources.forEach((src) => {
      const list = SOURCES[src] || [];
      list.forEach((item) => {
        links.push({
          ...item,
          category: src,
          queryContext: query,
        });
      });
    });

    // Genel aramalar
    links.push({
      name: `Google: "${query}" (TR)`,
      url: googleSearch(query, 'tr'),
      icon: '🔍',
      desc: `Google'da "${query}" araması (Türkçe sonuçlar).`,
      category: 'general',
    });
    links.push({
      name: `Google: "${query}" (EN)`,
      url: googleSearch(query, 'en'),
      icon: '🔍',
      desc: `Google'da "${query}" araması (İngilizce sonuçlar).`,
      category: 'general',
    });

    // Learning'e kaydet
    if (global.BeeLearning) {
      global.BeeLearning.recordSearch(query, sources);
    }

    return links;
  }

  // Akıllı arama: sorguya göre kaynak seç
  function smartSearch(query, region = 'tr') {
    const q = query.toLowerCase();
    const sources = [];

    // Türkçe anahtar kelimeler
    if (/varroa|ilaç|tedavi|hastalık|kovan|besleme|şerbet|bal|petek|oğul|mum|kekik|geven/.test(q)) {
      sources.push('tr-forum', 'tr-official', 'youtube');
    }

    // Diyarbakır/Eğil özelinde
    if (/diyarbakır|eğil|fırat|gap|güneydoğu/.test(q)) {
      sources.push('egil-local', 'tr-forum');
    }

    // Bilimsel terimler
    if (/nosema|afb|efb|dwv|cbpv|apis|mellifera|varroa destructor|thymol|amitraz|oxalic/.test(q)) {
      sources.push('scientific', 'en-forum');
    }

    // İngilizce terimler
    if (/queen|swarm|hive|brood|comb|harvest|feeding|treatment/.test(q)) {
      sources.push('en-forum', 'scientific');
    }

    // Varsayılan: hepsi
    if (sources.length === 0) {
      Object.keys(SOURCES).forEach((k) => sources.push(k));
    }

    return buildSearchLinks(query, { region, sources: [...new Set(sources)] });
  }

  function listSources(category) {
    if (category) return SOURCES[category] || [];
    return SOURCES;
  }

  // ===========================================================
  // UI renderer
  // ===========================================================

  function renderSearchResults(query, links) {
    if (!query || !links || links.length === 0) {
      return '<div class="empty">Arama yapılmadı.</div>';
    }

    const grouped = {};
    links.forEach((link) => {
      if (!grouped[link.category]) grouped[link.category] = [];
      grouped[link.category].push(link);
    });

    const categoryLabels = {
      'tr-forum': '🇹🇷 Türkçe Forumlar',
      'tr-official': '🏛️ Türk Resmi Kaynakları',
      'youtube': '▶️ YouTube',
      'en-forum': '🌍 Uluslararası Forumlar',
      'scientific': '🔬 Bilimsel Kaynaklar',
      'egil-local': '📍 Eğil/Diyarbakır Yerel',
      'general': '🔍 Genel Arama',
    };

    let html = `<div class="search-results">`;
    html += `<div class="search-summary">"${escapeHtml(query)}" için ${links.length} kaynak:</div>`;
    Object.entries(grouped).forEach(([cat, items]) => {
      html += `<div class="search-category">`;
      html += `<h4>${categoryLabels[cat] || cat}</h4>`;
      html += `<ul class="search-list">`;
      items.forEach((link) => {
        html += `<li class="search-item">
          <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="search-link">
            <span class="search-icon">${link.icon || '🔗'}</span>
            <div>
              <div class="search-name">${escapeHtml(link.name)}</div>
              <div class="search-desc">${escapeHtml(link.desc || '')}</div>
            </div>
            <span class="search-arrow">↗</span>
          </a>
        </li>`;
      });
      html += `</ul></div>`;
    });
    html += `</div>`;
    return html;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
  }

  // ===========================================================
  // Public
  // ===========================================================

  global.BeeForumSearch = {
    sources: SOURCES,
    build: buildSearchLinks,
    smart: smartSearch,
    list: listSources,
    render: renderSearchResults,
    google: googleSearch,
  };
})(window);