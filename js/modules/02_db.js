/* ===== js/db.js ===== */
// ============================================================
// Storage — localStorage adapter (IndexedDB pattern, Spec 11)
// Spec 11 §3: Offline-first, IndexedDB primary, localStorage fallback
// ============================================================
(function (global) {
  'use strict';

  const BM = global.BM = global.BM || {};
  const KEY = 'beemaster-v4';
  const LEGACY_KEYS = ['beemaster-v1', 'beemaster-v2', 'beemaster-v3'];

  // Schema (Spec 08 — Database Architecture)
  const SCHEMA = ['apiaries','hives','queens','frames','inspections','harvests','feedings','treatments','diseases','inventory'];

  // Seed data — full Turkish context, realistic values
  const seedData = () => {
    const now = new Date().toISOString();
    const ago = d => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);

    const apiaries = [
      { id: 'ap_1', name: 'Eğil Merkez', location: 'Eğil, Diyarbakır', lat: 38.247, lng: 40.135, flora: 'Geven, Kekik, Adaçayı, Pamuk', notes: 'Yayla konumu', archived: false, createdAt: now, updatedAt: now },
      { id: 'ap_2', name: 'Surlar Üssü', location: 'Sur, Diyarbakır', lat: 37.915, lng: 40.230, flora: 'Pamuk, Ayçiçeği, Geven', notes: '', archived: false, createdAt: now, updatedAt: now }
    ];

    const hiveSeed = [
      { n: 'Kovan-01', ap: 'ap_1', strain: 'carniolan', box: 'langstroth', fc: 10, pop: 'very_strong', var: 1, qBreed: 'Karniyol F1', qAge: 2 },
      { n: 'Kovan-02', ap: 'ap_1', strain: 'caucasian', box: 'langstroth', fc: 10, pop: 'strong', var: 3, qBreed: 'Kafkas Saf', qAge: 3 },
      { n: 'Kovan-03', ap: 'ap_1', strain: 'anatolian', box: 'langstroth', fc: 10, pop: 'strong', var: 2, qBreed: 'Anadolu Yerli', qAge: 1 },
      { n: 'Kovan-04', ap: 'ap_1', strain: 'carniolan', box: 'langstroth', fc: 8, pop: 'strong', var: 2, qBreed: 'Karniyol', qAge: 2 },
      { n: 'Kovan-05', ap: 'ap_2', strain: 'caucasian', box: 'dadant', fc: 7, pop: 'weak', var: 8, qBreed: 'Kafkas', qAge: 4 },
      { n: 'Kovan-06', ap: 'ap_2', strain: 'anatolian', box: 'langstroth', fc: 10, pop: 'strong', var: 2, qBreed: 'Anadolu', qAge: 2 },
      { n: 'Kovan-07', ap: 'ap_2', strain: 'hybrid', box: 'layens', fc: 8, pop: 'medium', var: 4, qBreed: 'Hibrit', qAge: 2 }
    ];

    const hives = [];
    const queens = [];
    const frames = [];

    hiveSeed.forEach((s, i) => {
      const hid = 'hv_' + (i + 1);
      const qid = 'q_' + (i + 1);
      queens.push({
        id: qid, hiveId: hid, strain: s.strain,
        birthDate: new Date(Date.now() - s.qAge * 365 * 864e5).toISOString().slice(0, 10),
        source: 'bred', markedColor: ['white', 'yellow', 'red', 'green', 'blue'][(new Date().getFullYear() - s.qAge) % 5],
        status: 'active', performanceScore: Math.max(0.3, 1 - s.var * 0.08 - (s.pop === 'weak' ? 0.3 : 0)),
        notes: '', createdAt: now, updatedAt: now
      });
      hives.push({
        id: hid, apiaryId: s.ap, name: s.n, status: s.pop === 'weak' ? 'weak' : 'active',
        strain: s.strain, boxType: s.box, frameCount: s.fc, positionInApiary: i + 1,
        queenId: qid, nfcTag: 'BM-' + Date.now().toString(36).toUpperCase() + '-' + (i + 1),
        installedAt: ago((i + 1) * 30), notes: '', createdAt: now, updatedAt: now
      });
      const ftypes = ['brood', 'brood', 'brood', 'honey', 'honey', 'pollen', 'perga', 'foundation', 'empty'];
      for (let p = 1; p <= s.fc; p++) {
        frames.push({
          id: 'fr_' + hid + '_' + p, hiveId: hid, position: p,
          frameType: ftypes[(p - 1) % ftypes.length] || 'empty',
          foundationType: 'wax', status: 'in_use', cyclesCompleted: Math.floor(Math.random() * 4),
          waxAgeMonths: Math.floor(Math.random() * 24) + 1, notes: '',
          createdAt: now, updatedAt: now
        });
      }
    });

    const inspSeed = [
      { hi: 0, days: 3, var: 1, pop: 'very_strong', brood: 7, honey: 2, note: 'Sezon başı kontrol, her şey yolunda' },
      { hi: 1, days: 5, var: 3, pop: 'strong', brood: 5, honey: 3, note: 'Ana arı yumurtluyor, yavru düzenli' },
      { hi: 2, days: 2, var: 2, pop: 'strong', brood: 6, honey: 4, note: 'Yavru düzeni iyi, bal ekleniyor' },
      { hi: 3, days: 1, var: 2, pop: 'strong', brood: 5, honey: 3, note: 'Hızlı gelişme' },
      { hi: 4, days: 7, var: 8, pop: 'weak', brood: 2, honey: 1, note: 'ACİL: Varroa yüksek, tedavi gerekli' },
      { hi: 5, days: 4, var: 2, pop: 'strong', brood: 6, honey: 3, note: 'Normal kontrol' },
      { hi: 6, days: 6, var: 4, pop: 'medium', brood: 4, honey: 2, note: 'Çerçeve azaldı' }
    ];
    const inspections = inspSeed.map((s, i) => ({
      id: 'in_' + (i + 1), hiveId: hives[s.hi].id, date: ago(s.days),
      varroaCount: s.var, population: s.pop, eggsPattern: 'regular',
      broodFrames: s.brood, honeyFrames: s.honey, pollenFrames: 1, queenSeen: true,
      weather: 'sunny', notes: s.note, aiAnomalies: s.var >= 6 ? 2 : 0, createdAt: now
    }));

    const harvests = [
      { hiveId: hives[0].id, days: 90, w: 4.2 }, { hiveId: hives[1].id, days: 60, w: 6.5 },
      { hiveId: hives[2].id, days: 30, w: 8.8 }, { hiveId: hives[3].id, days: 15, w: 3.2 },
      { hiveId: hives[5].id, days: 25, w: 5.4 }, { hiveId: hives[6].id, days: 45, w: 4.1 }
    ].map((h, i) => ({
      id: 'hv_h' + (i + 1), hiveId: h.hiveId, apiaryId: hives.find(x => x.id === h.hiveId).apiaryId,
      date: ago(h.days), weight: h.w, quality: 'A', frames: Math.floor(h.w / 1.5),
      notes: '', createdAt: now
    }));

    const feedings = [
      { hiveId: hives[4].id, days: 2, type: 'sugar_syrup', amountKg: 2.5, reason: 'weak_colony', status: 'completed', notes: '1:1 şurup' },
      { hiveId: hives[6].id, days: 10, type: 'fondant', amountKg: 1, reason: 'winter_prep', status: 'planned', notes: 'Kışlık destek' }
    ].map((f, i) => ({
      id: 'fd_' + (i + 1), hiveId: f.hiveId, date: ago(f.days),
      type: f.type, amountKg: f.amountKg, reason: f.reason, status: f.status,
      notes: f.notes, createdAt: now
    }));

    const treatments = [{
      id: 'tr_1', hiveId: hives[4].id, date: ago(1), product: 'Apivar',
      dosage: '2 şerit', duration: '42 gün', varroaBefore: 8, varroaAfter: null,
      status: 'in_progress', notes: 'Varroa yüksek — acil tedavi', createdAt: now
    }];

    const diseases = [{
      id: 'ds_1', hiveId: hives[4].id, date: ago(1), disease: 'varroosis',
      severity: 'high', treatment: 'Apivar', status: 'treating',
      notes: 'Varroa destructor', createdAt: now
    }];

    const inventory = [
      { name: 'Apivar şerit', c: 'medication', q: 8, u: 'adet', m: 5, p: 85 },
      { name: 'Şeker (besleme)', c: 'feed', q: 25, u: 'kg', m: 10, p: 12 },
      { name: 'Çerçeve (boş)', c: 'equipment', q: 30, u: 'adet', m: 10, p: 35 },
      { name: 'Petek temeli', c: 'equipment', q: 50, u: 'adet', m: 20, p: 8 },
      { name: 'Ana arı kafesi', c: 'equipment', q: 3, u: 'adet', m: 2, p: 25 }
    ].map((i, idx) => ({
      id: 'in_' + (idx + 1), name: i.name, category: i.c, quantity: i.q,
      unit: i.u, minStock: i.m, costTry: i.p, supplier: '', notes: '',
      createdAt: now
    }));

    return { apiaries, hives, queens, frames, inspections, harvests, feedings, treatments, diseases, inventory };
  };

  // Storage API
  const Storage = {
    state: null,

    load() {
      let raw = localStorage.getItem(KEY);
      if (!raw) {
        for (const oldKey of LEGACY_KEYS) {
          const oldRaw = localStorage.getItem(oldKey);
          if (oldRaw) {
            try {
              this.state = this.migrate(JSON.parse(oldRaw));
              this.save();
              return true;
            } catch (e) {}
          }
        }
        return false;
      }
      try {
        this.state = JSON.parse(raw);
        SCHEMA.forEach(k => { if (!Array.isArray(this.state[k])) this.state[k] = []; });
        return true;
      } catch (e) { console.warn('Storage load failed', e); }
      return false;
    },
    migrate(oldState) {
      if (!oldState.apiaries) oldState.apiaries = [];
      if (!oldState.hives) oldState.hives = [];
      if (!oldState.queens) oldState.queens = [];
      if (!oldState.frames) oldState.frames = [];
      if (!oldState.inspections) oldState.inspections = [];
      if (!oldState.harvests) oldState.harvests = [];
      if (!oldState.feedings) oldState.feedings = [];
      if (!oldState.treatments) oldState.treatments = [];
      if (!oldState.diseases) oldState.diseases = [];
      if (!oldState.inventory) oldState.inventory = [];
      oldState.hives.forEach(h => { if (!h.strain) h.strain = 'anatolian'; if (!h.boxType) h.boxType = 'langstroth'; if (!h.status) h.status = 'active'; if (!h.frameCount) h.frameCount = 10; });
      oldState.queens.forEach(q => { if (!q.strain) q.strain = 'anatolian'; if (!q.status) q.status = 'active'; if (q.performanceScore === undefined) q.performanceScore = 0.5; });
      oldState.feedings.forEach(f => { if (!f.amountKg && f.amount) f.amountKg = f.amount; if (!f.type) f.type = 'sugar_syrup'; });
      oldState.frames.forEach(f => { if (f.cyclesCompleted === undefined) f.cyclesCompleted = 0; if (f.waxAgeMonths === undefined) f.waxAgeMonths = 0; if (!f.status) f.status = 'in_use'; if (!f.foundationType) f.foundationType = 'wax'; if (!f.frameType) f.frameType = 'foundation'; });
      SCHEMA.forEach(k => { if (!Array.isArray(oldState[k])) oldState[k] = []; });
      return oldState;
    },

    save() {
      try {
        localStorage.setItem(KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Storage save failed:', e);
        if (typeof BM !== 'undefined' && BM.Toast) BM.Toast.show('Kayıt hatası: ' + e.message, 'error');
      }
    },

    reset() {
      localStorage.removeItem(KEY);
      this.state = null;
      this.init();
    },

    init() {
      if (!this.load()) {
        // localStorage tamamen boş → seed data ile başla
        this.state = seedData();
        this.save();
      }
      // localStorage'ta veri varsa → ASLA üzerine yazma
    },

    // CRUD generic - with Supabase cloud sync
    list(coll) { return this.state[coll] || []; },
    get(coll, id) { return (this.state[coll] || []).find(x => x.id === id); },
    async add(coll, data) {
      const id = BM.uid();
      const now = new Date().toISOString();
      const obj = { id, createdAt: now, updatedAt: now, ...data };
      // Ensure collection array exists (sync durumlarında gerekli)
      if (!this.state[coll]) this.state[coll] = [];
      this.state[coll].push(obj);
      this.save();
      BM.Bus.emit('change:' + coll, obj);
      // Supabase cloud sync (awaited)
      await this._syncAdd(coll, obj);
      return obj;
    },
    async update(coll, id, data) {
      const idx = this.state[coll].findIndex(x => x.id === id);
      if (idx < 0) return null;
      this.state[coll][idx] = { ...this.state[coll][idx], ...data, updatedAt: new Date().toISOString() };
      this.save();
      BM.Bus.emit('change:' + coll, this.state[coll][idx]);
      // Supabase cloud sync (awaited)
      await this._syncUpdate(coll, this.state[coll][idx]);
      return this.state[coll][idx];
    },
    async remove(coll, id) {
      this.state[coll] = this.state[coll].filter(x => x.id !== id);
      this.save();
      BM.Bus.emit('change:' + coll, { id });
      // Supabase cloud sync (awaited)
      await this._syncRemove(coll, id);
    },

    // ---- Supabase Cloud Sync (internal) ----
    _userId() {
      return (BM.Auth && BM.Auth.getUser) ? (BM.Auth.getUser()?.id || null) : null;
    },
    _supabaseAvailable() {
      return !!(BM.Auth && BM.Auth.isConfigured && BM.Auth.isConfigured());
    },
    _mapToDb(coll, obj) {
      // Camel case → snake_case for DB
      const map = {
        apiaryId: 'apiary_id', hiveId: 'hive_id', queenId: 'queen_id',
        boxType: 'box_type', frameCount: 'frame_count', nfcTag: 'nfc_tag',
        installedAt: 'installed_at', birthDate: 'birth_date', markedColor: 'marked_color', markingColor: 'marked_color',
        performanceScore: 'performance_score', varroaCount: 'varroa_count',
        broodFrames: 'brood_frames', honeyFrames: 'honey_frames', pollenFrames: 'pollen_frames',
        queenSeen: 'queen_seen', eggsPattern: 'eggs_pattern',
        positionInApiary: 'position_in_apiary', amountKg: 'amount_kg',
        audioData: 'audio_data', apiaryName: 'apiary_name',
        costTry: 'cost_try', minStock: 'min_stock'
      };
      const out = {};
      // Queens: name + markingColor → marked_color birleştir
      let queenName = null, queenColor = null;
      // Frames: tip ve diger tum alanlari META olarak encode et
      let frameType = null;
      let frameTypeFromObj = null;
      // Supabase'de sadece bu kolonlar var (whitelist)
      const validCols = {
        queens: ['id','hive_id','marked_color','birth_date','notes','user_id'],
        inspections: ['id','hive_id','queen_seen','eggs_pattern','notes','date','user_id','brood_frames','honey_frames','pollen_frames','varroa_count','population','mode','weather'],
        frames: ['id','hive_id','position','notes','user_id'],
        feedings: ['id','hive_id','notes','date','user_id'],
        harvests: ['id','hive_id','weight','notes','date','user_id'],
        treatments: ['id','hive_id','notes','date','user_id'],
        diseases: ['id','hive_id','notes','date','user_id'],
      };
      for (const k of Object.keys(obj)) {
        const mapped = map[k] || k;
        if (mapped === 'apiary_id' && (coll === 'queens' || coll === 'inspections' || coll === 'feedings')) continue;
        if (mapped === 'amount' && coll === 'feedings') continue;
        if (mapped === 'unit' && coll === 'feedings') continue;
        if (coll === 'queens' && mapped === 'name') { queenName = obj[k]; continue; }
        if (coll === 'queens' && mapped === 'marked_color') { queenColor = obj[k]; continue; }
        if (coll === 'frames' && (mapped === 'type' || mapped === 'frameType')) { frameTypeFromObj = obj[k]; continue; }
        if (mapped === 'address') out['location'] = obj[k];
        else if (mapped === 'apiaryName') out['apiary_name'] = obj[k];
        else out[mapped] = obj[k];
      }
      if (coll === 'queens' && (queenName || queenColor)) {
        out['marked_color'] = (queenColor || '') + (queenName ? '|NAME:' + queenName : '');
      }
      // Frames: tum ekstra alanlari META olarak notes'a gom
      if (coll === 'frames') {
        var frMeta = {};
        var frameExtras = ['frameType','foundationType','status','cyclesCompleted','waxAgeMonths','lastExtractedAt'];
        for (var fre = 0; fre < frameExtras.length; fre++) {
          var frk = frameExtras[fre];
          if (obj[frk] !== undefined && obj[frk] !== null && obj[frk] !== '') frMeta[frk] = obj[frk];
        }
        if (frameTypeFromObj) frMeta['frameType'] = frameTypeFromObj;
        if (Object.keys(frMeta).length > 0) {
          var frBaseNotes = out['notes'] || '';
          out['notes'] = frBaseNotes + '|META:' + JSON.stringify(frMeta);
        }
      }
      const uid = this._userId();
      if (uid && coll !== 'profiles') out.user_id = uid;

      // === Ekstra alanları notes'a META olarak encode et ===
      // Queens: strain, status, source, performanceScore, costTry, supplier gibi alanları koru
      if (coll === 'queens') {
        var metaFields = {};
        var queenExtras = ['strain','status','source','performance_score','cost_try','supplier'];
        for (var qe = 0; qe < queenExtras.length; qe++) {
          var qk = queenExtras[qe];
          if (out[qk] !== undefined && out[qk] !== null && out[qk] !== '') metaFields[qk] = out[qk];
        }
        if (Object.keys(metaFields).length > 0) {
          var baseNotes = out['notes'] || '';
          out['notes'] = baseNotes + '|META:' + JSON.stringify(metaFields);
        }
      }
      // Treatments: product, dosage, duration, varroaBefore, varroaAfter, status
      if (coll === 'treatments') {
        var tMeta = {};
        var treatExtras = ['product','dosage','duration','varroa_before','varroaBefore','varroa_after','varroaAfter','status'];
        for (var te = 0; te < treatExtras.length; te++) {
          var tk = treatExtras[te];
          if (out[tk] !== undefined && out[tk] !== null && out[tk] !== '') tMeta[tk] = out[tk];
        }
        if (Object.keys(tMeta).length > 0) {
          var tBaseNotes = out['notes'] || '';
          out['notes'] = tBaseNotes + '|META:' + JSON.stringify(tMeta);
        }
      }
      // Diseases: disease, severity, treatment, status
      if (coll === 'diseases') {
        var dMeta = {};
        var diseaseExtras = ['disease','severity','treatment','status'];
        for (var de2 = 0; de2 < diseaseExtras.length; de2++) {
          var dk = diseaseExtras[de2];
          if (out[dk] !== undefined && out[dk] !== null && out[dk] !== '') dMeta[dk] = out[dk];
        }
        if (Object.keys(dMeta).length > 0) {
          var dBaseNotes = out['notes'] || '';
          out['notes'] = dBaseNotes + '|META:' + JSON.stringify(dMeta);
        }
      }
      // Inspections: aiAnomalies, aiAnomaliesCount, template, photoTag — photos/audioData büyük olabilir, sadece küçükleri
      if (coll === 'inspections') {
        var iMeta = {};
        var inspExtras = ['aiAnomalies','aiAnomaliesCount','template','photoTag'];
        for (var ie = 0; ie < inspExtras.length; ie++) {
          var ik = inspExtras[ie];
          if (out[ik] !== undefined && out[ik] !== null && out[ik] !== '') iMeta[ik] = out[ik];
        }
        if (Object.keys(iMeta).length > 0) {
          var iBaseNotes = out['notes'] || '';
          out['notes'] = iBaseNotes + '|META:' + JSON.stringify(iMeta);
        }
      }
      // Feedings: type, amountKg/amount_kg, reason, status
      if (coll === 'feedings') {
        var fMeta = {};
        var feedExtras = ['type','amount_kg','reason','status'];
        for (var fe = 0; fe < feedExtras.length; fe++) {
          var fk = feedExtras[fe];
          if (out[fk] !== undefined && out[fk] !== null && out[fk] !== '') fMeta[fk] = out[fk];
        }
        if (Object.keys(fMeta).length > 0) {
          var fBaseNotes = out['notes'] || '';
          out['notes'] = fBaseNotes + '|META:' + JSON.stringify(fMeta);
        }
      }
      // Harvests: weight zaten var; quality, frames, apiaryId
      if (coll === 'harvests') {
        var hMeta = {};
        var harvExtras = ['quality','frames','apiary_id'];
        for (var he = 0; he < harvExtras.length; he++) {
          var hk = harvExtras[he];
          if (out[hk] !== undefined && out[hk] !== null && out[hk] !== '') hMeta[hk] = out[hk];
        }
        if (Object.keys(hMeta).length > 0) {
          var hBaseNotes = out['notes'] || '';
          out['notes'] = hBaseNotes + '|META:' + JSON.stringify(hMeta);
        }
      }

      // === validCols whitelist ile filtrele — Supabase'de olmayan kolonları gönderme ===
      var whitelist = validCols[coll];
      if (whitelist) {
        var filtered = {};
        for (var wi = 0; wi < whitelist.length; wi++) {
          var wk = whitelist[wi];
          if (out[wk] !== undefined) filtered[wk] = out[wk];
        }
        return filtered;
      }
      return out;
    },
    _tableFor(coll) {
      // Map collection name to DB table
      const map = {
        apiaries: 'apiaries', hives: 'hives', queens: 'queens',
        inspections: 'inspections', frames: 'frames',
        harvests: 'harvests', feedings: 'feedings',
        treatments: 'treatments', diseases: 'diseases', inventory: 'inventory'
      };
      return map[coll];
    },
    async _syncAdd(coll, obj, retries) {
      if (retries === undefined) retries = 0;
      if (!this._supabaseAvailable()) return;
      const uid = this._userId();
      if (!uid) return;
      const client = BM.Auth.getClient();
      const table = this._tableFor(coll);
      if (!table) return;
      try {
        const payload = this._mapToDb(coll, obj);
        const { error } = await client.from(table).upsert(payload);
        if (error) {
          console.warn('[CloudSync] add error (' + coll + '):', error.message);
          // FK hatası ise 2sn bekle, tekrar dene (parent kayıt senkron olsun)
          if (error.message.includes('foreign key') && retries < 2) {
            await new Promise(function(r) { setTimeout(r, 2000); });
            return this._syncAdd(coll, obj, retries + 1);
          }
        }
      } catch (e) {
        console.warn('[CloudSync] add failed (' + coll + '):', e.message);
        if (retries < 2) {
          await new Promise(function(r) { setTimeout(r, 2000); });
          return this._syncAdd(coll, obj, retries + 1);
        }
      }
    },
    async _syncUpdate(coll, obj) {
      if (!this._supabaseAvailable()) return;
      const uid = this._userId();
      if (!uid) return;
      const client = BM.Auth.getClient();
      const table = this._tableFor(coll);
      if (!table) return;
      try {
        const payload = this._mapToDb(coll, obj);
        const { error } = await client.from(table).upsert(payload);
        if (error) console.warn('[CloudSync] update error (' + coll + '):', error.message);
      } catch (e) {
        console.warn('[CloudSync] update failed (' + coll + '):', e.message);
      }
    },
    async _syncRemove(coll, id) {
      if (!this._supabaseAvailable()) return;
      const uid = this._userId();
      if (!uid) return;
      const client = BM.Auth.getClient();
      const table = this._tableFor(coll);
      if (!table) return;
      try {
        const { error } = await client.from(table).delete().eq('id', id);
        if (error) console.warn('[CloudSync] remove error (' + coll + '):', error.message);
      } catch (e) {
        console.warn('[CloudSync] remove failed (' + coll + '):', e.message);
      }
    },

    // ---- Bulk fetch from Supabase on login (PARALEL optimize) ----
    // === SUPABASE CLOUD SYNC (Supabase = SOURCE OF TRUTH) ===
    // Strategy: Supabase is the real database. localStorage is a fast cache.
    // On login: ALWAYS fetch from Supabase and replace cache.
    // On save: Write to Supabase first, then cache in localStorage.
    async syncFromCloud() {
      if (!this._supabaseAvailable()) return false;
      var uid = this._userId();
      if (!uid) return false;
      var client = BM.Auth.getClient();
      var tables = ['apiaries', 'hives', 'queens', 'inspections', 'frames', 'harvests', 'feedings', 'treatments', 'diseases', 'inventory'];
      var reverseMap = {
        apiary_id: 'apiaryId', hive_id: 'hiveId', queen_id: 'queenId', user_id: 'userId',
        box_type: 'boxType', frame_count: 'frameCount', nfc_tag: 'nfcTag',
        installed_at: 'installedAt', created_at: 'createdAt', updated_at: 'updatedAt',
        birth_date: 'birthDate', marked_color: 'markedColor',
        performance_score: 'performanceScore', varroa_count: 'varroaCount',
        brood_frames: 'broodFrames', honey_frames: 'honeyFrames', pollen_frames: 'pollenFrames',
        queen_seen: 'queenSeen', eggs_pattern: 'eggsPattern',
        position_in_apiary: 'positionInApiary', amount_kg: 'amountKg',
        audio_data: 'audioData', apiary_name: 'apiaryName',
        cost_try: 'costTry', min_stock: 'minStock',
        honey_type: 'honeyType', treatment_status: 'treatmentStatus',
        location_lat: 'locationLat', location_lng: 'locationLng',
        varroa_before: 'varroaBefore', varroa_after: 'varroaAfter'
      };

      function fromDb(row) {
        var obj = {};
        for (var k in row) obj[reverseMap[k] || k] = row[k];
        if (row.marked_color && row.marked_color.indexOf('|NAME:') > -1) {
          var p = row.marked_color.split('|NAME:');
          obj.markedColor = p[0]; obj.name = p[1];
        }
        // |TYPE: decode (eski frame formatindan type -> frameType donusumu)
        if (row.notes && row.notes.indexOf('|TYPE:') > -1) {
          var tp = row.notes.split('|TYPE:');
          obj.notes = tp[0]; obj.frameType = tp[1];
          // TYPE'den sonra META olabilir
          if (obj.frameType && obj.frameType.indexOf('|META:') > -1) {
            var tm = obj.frameType.split('|META:');
            obj.frameType = tm[0];
            try { var mm = JSON.parse(tm[1]); for (var mk in mm) obj[reverseMap[mk] || mk] = mm[mk]; } catch(e) {}
          }
        }
        // |META: decode — notes alanındaki JSON meta verilerini geri yükle
        if (obj.notes && typeof obj.notes === 'string' && obj.notes.indexOf('|META:') > -1) {
          var mp = obj.notes.split('|META:');
          obj.notes = mp[0]; // orijinal notes
          try {
            var meta = JSON.parse(mp[1]);
            for (var metaKey in meta) {
              // snake_case ise camelCase'e çevir
              obj[reverseMap[metaKey] || metaKey] = meta[metaKey];
            }
          } catch(e) {
            // META parse hatası — notes'u olduğu gibi bırak
          }
        }
        return obj;
      }

      try {
        // TÜM tabloları paralel çek
        var results = await Promise.all(tables.map(function(t) {
          return client.from(t).select('*').eq('user_id', uid).then(function(r) {
            return { table: t, data: (r.data || []).map(fromDb) };
          }).catch(function() { return { table: t, data: [] }; });
        }));

        // localStorage'daki mevcut veriyi koru (merge)
        for (var ri = 0; ri < results.length; ri++) {
          var r = results[ri];
          var localData = this.state[r.table] || [];
          var localMap = {};
          localData.forEach(function(x) { localMap[x.id] = x; });

          // Cloud'dan gelenleri ekle/güncelle
          r.data.forEach(function(cloud) {
            if (localMap[cloud.id]) {
              // Cloud daha güncelse güncelle
              Object.assign(localMap[cloud.id], cloud);
            } else {
              localData.push(cloud);
            }
          });
          this.state[r.table] = localData;
        }
        this.save();
        if (typeof BM !== 'undefined' && BM.Bus) {
          BM.Bus.emit('change:frames', {});
        }
        if (typeof App !== 'undefined') {
          if (App.currentView === 'hive-detail' && App.currentHiveId) {
            BM.hives.detail(App.currentHiveId);
          } else if (App.render) {
            App.render(App.currentView || 'dashboard');
          }
        }
        return true;
      } catch(e) {
        console.warn('syncFromCloud:', e.message);
        return false;
      }
    },

    // Cascade delete
    cascadeDeleteHive(hiveId) {
      ['frames', 'inspections', 'harvests', 'feedings', 'treatments', 'diseases']
        .forEach(c => this.state[c] = this.state[c].filter(x => x.hiveId !== hiveId));
      this.state.queens = this.state.queens.filter(q => q.hiveId !== hiveId);
      this.remove('hives', hiveId);
    }
  };

  Storage.init();
  BM.Storage = Storage;
  BM.SCHEMA = SCHEMA;
})(window);

