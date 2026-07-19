/* ============================================================
   BeeMaster AI — Media (foto/video) yükleme + danışmana bağlama
   ============================================================ */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'beemaster:media:v1';
  const MAX_SIZE = 4 * 1024 * 1024; // 4 MB
  const MAX_VIDEO_SIZE = 12 * 1024 * 1024; // 12 MB

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAll(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      return false;
    }
  }

  function uid() {
    return `M-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  // ===========================================================
  // Dosya → base64
  // ===========================================================

  function readAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ===========================================================
  // Tek dosya kaydet
  // ===========================================================

  async function addFile(file, meta = {}) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const limit = isVideo ? MAX_VIDEO_SIZE : MAX_SIZE;
    if (file.size > limit) {
      throw new Error(`${isVideo ? 'Video' : 'Fotoğraf'} çok büyük (max ${Math.round(limit / 1024 / 1024)} MB).`);
    }
    if (!isImage && !isVideo) {
      throw new Error('Sadece fotoğraf ve video desteklenir.');
    }

    const dataUrl = await readAsDataUrl(file);
    const item = {
      id: uid(),
      type: isImage ? 'image' : 'video',
      mime: file.type,
      name: file.name || `${isImage ? 'image' : 'video'}-${Date.now()}`,
      size: file.size,
      data: dataUrl,
      hiveId: meta.hiveId || null,
      context: meta.context || 'inspection', // inspection, advisor, custom
      notes: meta.notes || '',
      ts: new Date().toISOString(),
      analysis: null, // karar motoru tarafından doldurulur
    };

    const all = loadAll();
    all.push(item);
    saveAll(all);
    return item;
  }

  function listFor(hiveId, context) {
    const all = loadAll();
    return all.filter((m) => {
      if (hiveId && m.hiveId !== hiveId) return false;
      if (context && m.context !== context) return false;
      return true;
    });
  }

  function listAll() {
    return loadAll();
  }

  function get(id) {
    return loadAll().find((m) => m.id === id) || null;
  }

  function remove(id) {
    const all = loadAll();
    const idx = all.findIndex((m) => m.id === id);
    if (idx >= 0) {
      all.splice(idx, 1);
      saveAll(all);
      return true;
    }
    return false;
  }

  // ===========================================================
  // Medya → danışmana bağlama
  // ===========================================================

  // Danışmana görsel gönderildiğinde analiz için
  function attachAnalysis(id, analysis) {
    const all = loadAll();
    const m = all.find((m) => m.id === id);
    if (m) {
      m.analysis = analysis;
      m.analysisDate = new Date().toISOString();
      saveAll(all);
    }
    return m;
  }

  // ===========================================================
  // Karar motoruna görsel bağlama — basit heuristic analiz
  // ===========================================================

  function analyzeForAdvisor(mediaId, userText) {
    const m = get(mediaId);
    if (!m) return null;

    const analysis = {
      type: m.type,
      userText: userText || '',
      detectedSubjects: [],
      confidence: 'low',
      reasoning: [],
      suggestion: '',
    };

    const text = (userText || '').toLowerCase();

    // Heuristic — basit anahtar kelime eşleştirmesi
    if (/yavru|brood|capping|petek/.test(text)) {
      analysis.detectedSubjects.push('brood');
      analysis.reasoning.push('Kullanıcı "yavru/petek" ifadesi kullandı.');
    }
    if (/mite|varroa/.test(text)) {
      analysis.detectedSubjects.push('varroa');
      analysis.reasoning.push('Varroa bağlamı tespit edildi.');
    }
    if (/ana arı|queen|kraliçe/.test(text)) {
      analysis.detectedSubjects.push('queen');
    }
    if (/ball|bal|honey|petek|kapak/.test(text)) {
      analysis.detectedSubjects.push('honey');
    }
    if (/oğul|swarm|meme/.test(text)) {
      analysis.detectedSubjects.push('swarm');
    }
    if (/hastalık|disease|çürük|para/.test(text)) {
      analysis.detectedSubjects.push('disease');
    }

    // Görsel ipuçları — sadece dosya adı/ipucu
    if (m.name) {
      if (/queen|kraliçe/i.test(m.name)) analysis.detectedSubjects.push('queen');
      if (/brood|yavru/i.test(m.name)) analysis.detectedSubjects.push('brood');
      if (/frame|çerçeve/i.test(m.name)) analysis.detectedSubjects.push('frame');
    }

    if (analysis.detectedSubjects.length > 0) {
      analysis.confidence = 'medium';
      analysis.suggestion = `Tespit edilen konular: ${analysis.detectedSubjects.join(', ')}. Bu görseli karar motoru bağlamıyla birlikte işleyin.`;
    } else {
      analysis.suggestion = 'Görselde konu tespit edilemedi. Lütfen metin açıklaması ekleyin.';
    }

    attachAnalysis(mediaId, analysis);
    return analysis;
  }

  // ===========================================================
  // UI render
  // ===========================================================

  function renderThumb(item, opts = {}) {
    const size = opts.size || 80;
    const media = item.type === 'video'
      ? `<video src="${item.data}" muted style="width:${size}px;height:${size}px;object-fit:cover;border-radius:8px;"></video>`
      : `<img src="${item.data}" alt="" style="width:${size}px;height:${size}px;object-fit:cover;border-radius:8px;">`;
    return `
      <div class="media-thumb" data-media-id="${item.id}">
        ${media}
        <button class="media-del" data-del-media="${item.id}" title="Sil">✕</button>
      </div>
    `;
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  // ===========================================================
  // Public
  // ===========================================================

  global.BeeMedia = {
    add: addFile,
    list: listFor,
    listAll,
    get,
    remove,
    analyze: analyzeForAdvisor,
    attachAnalysis,
    renderThumb,
    formatSize,
    MAX_SIZE,
    MAX_VIDEO_SIZE,
  };
})(window);