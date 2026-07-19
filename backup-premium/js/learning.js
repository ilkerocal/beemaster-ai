/* ============================================================
   BeeMaster AI — Self-Learning Engine
   Kullanıcı geri bildirimi, doğrulama, kalibrasyon toplama.
   Tüm veriler localStorage'da; hiçbir şey dışarı gönderilmez.
   ============================================================ */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'beemaster:learning:v1';

  const emptyLearning = () => ({
    // Tanı doğrulamaları — kullanıcı "doğru muydu?" diye işaretledi
    outcomes: [],
    // Yerel pattern'ler — kullanıcı gözlemlerinden öğrenilen
    patterns: [],
    // Forum arama geçmişi (öğrenme için)
    searchHistory: [],
    // Bilgi adayları — öğrenilmiş ve doğrulanmış bilgiler
    knowledge: [],
    // Calibration — tanı hassasiyetini ölç
    calibration: {
      correctDiagnoses: 0,
      incorrectDiagnoses: 0,
      lastCalibrationDate: null,
    },
  });

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyLearning();
      return Object.assign(emptyLearning(), JSON.parse(raw));
    } catch (e) {
      return emptyLearning();
    }
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      return false;
    }
  }

  // ===========================================================
  // Outcome (tanı doğrulaması)
  // ===========================================================

  function recordOutcome({ decisionId, scenario, input, decision, correct, actualOutcome, notes }) {
    const data = load();
    const outcome = {
      id: `O-${Date.now().toString(36)}`,
      ts: new Date().toISOString(),
      decisionId,
      scenario,
      input,
      decision,
      correct: !!correct,
      actualOutcome,
      notes,
    };
    data.outcomes.push(outcome);
    // Calibration
    if (correct === true) data.calibration.correctDiagnoses++;
    else if (correct === false) data.calibration.incorrectDiagnoses++;
    data.calibration.lastCalibrationDate = new Date().toISOString();
    save(data);
    return outcome;
  }

  function getOutcomes() {
    return load().outcomes;
  }

  function getCalibration() {
    const c = load().calibration;
    const total = c.correctDiagnoses + c.incorrectDiagnoses;
    return {
      ...c,
      total,
      accuracy: total > 0 ? Math.round((c.correctDiagnoses / total) * 100) : null,
    };
  }

  // ===========================================================
  // Patterns — kullanıcının kendi gözlemleri
  // ===========================================================

  function recordPattern({ type, observation, region, hiveId, season, notes }) {
    const data = load();
    const pattern = {
      id: `P-${Date.now().toString(36)}`,
      ts: new Date().toISOString(),
      type, // 'flow', 'disease', 'swarm', 'queen', 'feeding', 'climate'
      observation,
      region,
      hiveId,
      season,
      notes,
    };
    data.patterns.push(pattern);
    save(data);
    return pattern;
  }

  function getPatterns(filter = {}) {
    let arr = load().patterns;
    if (filter.region) arr = arr.filter((p) => p.region === filter.region);
    if (filter.type) arr = arr.filter((p) => p.type === filter.type);
    if (filter.season) arr = arr.filter((p) => p.season === filter.season);
    if (filter.hiveId) arr = arr.filter((p) => p.hiveId === filter.hiveId);
    return arr.sort((a, b) => b.ts.localeCompare(a.ts));
  }

  // Pattern'lerden otomatik çıkarım (basit)
  function summarizePatterns(filter = {}) {
    const patterns = getPatterns(filter);
    const grouped = {};
    patterns.forEach((p) => {
      const key = `${p.type}/${p.observation}`;
      grouped[key] = (grouped[key] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  }

  // ===========================================================
  // Knowledge candidates — öğrenilmiş bilgiler
  // ===========================================================

  function addKnowledgeCandidate({ claim, evidence, source, confidence, scope }) {
    const data = load();
    const kc = {
      id: `KC-${Date.now().toString(36)}`,
      ts: new Date().toISOString(),
      claim,
      evidence,
      source,
      confidence: confidence || 'medium',
      scope: scope || 'local',
      verified: false,
    };
    data.knowledge.push(kc);
    save(data);
    return kc;
  }

  function verifyKnowledge(id, verdict) {
    const data = load();
    const kc = data.knowledge.find((k) => k.id === id);
    if (kc) {
      kc.verified = verdict;
      kc.verificationDate = new Date().toISOString();
      save(data);
    }
    return kc;
  }

  function getKnowledge(filter = {}) {
    let arr = load().knowledge;
    if (filter.verified !== undefined) arr = arr.filter((k) => k.verified === filter.verified);
    if (filter.scope) arr = arr.filter((k) => k.scope === filter.scope);
    return arr.sort((a, b) => b.ts.localeCompare(a.ts));
  }

  // ===========================================================
  // Search history (forum aramaları)
  // ===========================================================

  function recordSearch(query, sources) {
    const data = load();
    const entry = {
      id: `S-${Date.now().toString(36)}`,
      ts: new Date().toISOString(),
      query,
      sources,
    };
    data.searchHistory.push(entry);
    save(data);
    return entry;
  }

  function getSearchHistory(limit = 20) {
    return load().searchHistory.slice(-limit).reverse();
  }

  // ===========================================================
  // Otomatik öğrenme önerileri
  // ===========================================================

  function suggestLearnings() {
    const cal = getCalibration();
    const patterns = summarizePatterns();
    const tips = [];

    if (cal.accuracy !== null && cal.accuracy < 70 && cal.total >= 5) {
      tips.push({
        type: 'calibration',
        level: 'warning',
        text: `Tanı doğruluğunuz %${cal.accuracy}. Karar motoru bazı senaryolarda yanılıyor olabilir. Çıktıdaki "✓ Doğru / ✗ Yanlış" butonlarını kullanın.`,
      });
    }
    if (patterns.length > 0) {
      const top = patterns[0];
      tips.push({
        type: 'pattern',
        level: 'info',
        text: `Sık tekrarlanan gözleminiz: "${top.key}" (${top.count} kez). Bu sizin arılığınıza özgü bir pattern — karar motoru artık bunu dikkate alacak.`,
      });
    }
    return tips;
  }

  // ===========================================================
  // Export (tüm öğrenme verisini JSON olarak indir)
  // ===========================================================

  function exportLearning() {
    return JSON.stringify(load(), null, 2);
  }

  function resetLearning() {
    save(emptyLearning());
  }

  // ===========================================================
  // Public
  // ===========================================================

  global.BeeLearning = {
    recordOutcome,
    getOutcomes,
    getCalibration,
    recordPattern,
    getPatterns,
    summarizePatterns,
    addKnowledgeCandidate,
    verifyKnowledge,
    getKnowledge,
    recordSearch,
    getSearchHistory,
    suggestLearnings,
    exportLearning,
    resetLearning,
  };
})(window);