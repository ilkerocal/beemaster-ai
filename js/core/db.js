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
        this.state = seedData();
        this.save();
      }
    },

    // CRUD generic - with Supabase cloud sync
    list(coll) { return this.state[coll] || []; },
    get(coll, id) { return (this.state[coll] || []).find(x => x.id === id); },
    async add(coll, data) {
      const id = BM.uid();
      const now = new Date().toISOString();
      const obj = { id, createdAt: now, updatedAt: now, ...data };
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
      // Supabase cloud sync
      await this._syncUpdate(coll, this.state[coll][idx]);
      return this.state[coll][idx];
    },
    async remove(coll, id) {
      this.state[coll] = this.state[coll].filter(x => x.id !== id);
      this.save();
      BM.Bus.emit('change:' + coll, { id });
      // Supabase cloud sync
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
        installedAt: 'installed_at', birthDate: 'birth_date', markedColor: 'marked_color',
        performanceScore: 'performance_score', varroaCount: 'varroa_count',
        broodFrames: 'brood_frames', honeyFrames: 'honey_frames', pollenFrames: 'pollen_frames',
        queenSeen: 'queen_seen', eggsPattern: 'eggs_pattern',
        positionInApiary: 'position_in_apiary', amountKg: 'amount_kg',
        audioData: 'audio_data', apiaryName: 'apiary_name'
      };
      const out = {};
      for (const k of Object.keys(obj)) {
        out[map[k] || k] = obj[k];
      }
      const uid = this._userId();
      if (uid && coll !== 'profiles') out.user_id = uid;
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
    async _syncAdd(coll, obj) {
      if (!this._supabaseAvailable()) return;
      const uid = this._userId();
      if (!uid) return;
      const client = BM.Auth.getClient();
      const table = this._tableFor(coll);
      if (!table) return;
      try {
        const payload = this._mapToDb(coll, obj);
        const { error } = await client.from(table).upsert(payload);
        if (error) console.warn('[CloudSync] add error (' + coll + '):', error.message);
      } catch (e) {
        console.warn('[CloudSync] add failed (' + coll + '):', e.message);
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

    // ---- Bulk fetch from Supabase on login ----
    async syncFromCloud(force) {
      if (force === undefined) force = false;
      if (!this._supabaseAvailable()) return false;
      const uid = this._userId();
      if (!uid) return false;
      const client = BM.Auth.getClient();
      if (!client) return false;
      const tables = ['apiaries','hives','queens','inspections','frames','harvests','feedings','treatments','diseases','inventory'];
      // TÜM tabloları çek ve localStorage'ı REPLACE et (merge değil)
      // Bu sayede Supabase'den silinen kayıtlar localStorage'a geri dönmez.
      for (const t of tables) {
        try {
          const res = await client.from(t).select('*').eq('user_id', uid);
          if (res.error) continue; // fetch failed, keep local
          const cloudItems = res.data || [];
          // Map cloud items to our camelCase format
          const map = {
            apiaryId: 'apiary_id', hiveId: 'hive_id', queenId: 'queen_id',
            boxType: 'box_type', frameCount: 'frame_count', nfcTag: 'nfc_tag',
            installedAt: 'installed_at', birthDate: 'birth_date', markedColor: 'marked_color',
            performanceScore: 'performance_score', varroaCount: 'varroa_count',
            broodFrames: 'brood_frames', honeyFrames: 'honey_frames', pollenFrames: 'pollen_frames',
            queenSeen: 'queen_seen', eggsPattern: 'eggs_pattern',
            positionInApiary: 'position_in_apiary', amountKg: 'amount_kg',
            audioData: 'audio_data', apiaryName: 'apiary_name'
          };
          const reverseMap = {};
          for (const [k, v] of Object.entries(map)) {
            reverseMap[v] = k;
          }
          // === SUPABASE = SOURCE OF TRUTH ===
          // Cloud veriyi camelCase'e çevir ve localStorage'ı tamamen replace et
          const cloudList = cloudItems.map(cloudItem => {
            const obj = {};
            for (const [dbKey, value] of Object.entries(cloudItem)) {
              const camelKey = reverseMap[dbKey] || dbKey;
              obj[camelKey] = value;
            }
            return obj;
          });
          this.state[t] = cloudList;
        } catch (e) {
          console.warn('[CloudSync] download error (' + t + '):', e.message);
        }
      }
      // Save replaced state to localStorage
      this.save();
      let total = 0;
      for (const t of tables) total += (this.state[t] || []).length;
      if (total > 0) BM.Toast.show('☁️ ' + total + ' kayıt buluttan yüklendi', 'success');
      if (typeof App !== 'undefined' && App.render) App.render(App.currentView || 'dashboard');
      return true;
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
