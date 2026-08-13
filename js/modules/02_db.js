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
  const SCHEMA = ['apiaries','hives','queens','frames','inspections','harvests','feedings','treatments','diseases','inventory','tasks'];

  // Seed data — Empty initial state (No demo data loaded)
  const seedData = () => {
    return {
      apiaries: [],
      hives: [],
      queens: [],
      frames: [],
      inspections: [],
      harvests: [],
      feedings: [],
      treatments: [],
      diseases: [],
      inventory: [],
      tasks: []
    };
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
      if (!oldState.tasks) oldState.tasks = [];
      oldState.hives.forEach(h => {
        if (!h.strain) h.strain = 'anatolian';
        if (!h.boxType) h.boxType = 'langstroth';
        if (!h.status) h.status = 'active';
        if (!h.frameCount) h.frameCount = 10;
        if (!h.temperament) h.temperament = 'calm';
        if (!h.purpose) h.purpose = 'honey_production';
        if (h.supersCount === undefined) h.supersCount = 0;
        if (!h.source) h.source = 'created_nucleus';
      });
      oldState.queens.forEach(q => {
        if (!q.strain) q.strain = 'anatolian';
        if (!q.status) q.status = 'active';
        if (!q.queenState) q.queenState = 'laying';
        if (q.isClipped === undefined) q.isClipped = false;
        if (q.isMarked === undefined) q.isMarked = true;
        if (q.performanceScore === undefined) q.performanceScore = 0.5;
      });
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
        // localStorage tamamen boş → temiz boş veritabanı ile başla
        this.state = seedData();
        this.save();
      }
      // Demo verilerini otomatik temizle
      this.cleanDemoData();
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
        apiaries: ['id','name','location','notes','archived','user_id'],
        hives: ['id','apiary_id','name','status','strain','box_type','frame_count','nfc_tag','installed_at','notes','user_id'],
        queens: ['id','hive_id','marked_color','birth_date','notes','user_id'],
        inspections: ['id','hive_id','queen_seen','eggs_pattern','notes','date','user_id','brood_frames','honey_frames','pollen_frames','varroa_count','population','mode','weather'],
        frames: ['id','hive_id','position','notes','user_id'],
        feedings: ['id','hive_id','notes','date','user_id'],
        harvests: ['id','hive_id','weight','notes','date','user_id'],
        treatments: ['id','hive_id','notes','date','user_id'],
        diseases: ['id','hive_id','notes','date','user_id'],
        inventory: ['id','name','category','quantity','unit','min_stock','cost_try','supplier','notes','user_id'],
        tasks: ['id','title','notes','due_date','status','type','priority','apiary_id','hive_id','user_id']
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
      // Apiaries: lat, lng, flora
      if (coll === 'apiaries') {
        var apMeta = {};
        var apExtras = ['lat','lng','flora'];
        for (var ape = 0; ape < apExtras.length; ape++) {
          var apk = apExtras[ape];
          if (obj[apk] !== undefined && obj[apk] !== null && obj[apk] !== '') apMeta[apk] = obj[apk];
        }
        if (Object.keys(apMeta).length > 0) {
          var apBaseNotes = out['notes'] || '';
          out['notes'] = apBaseNotes + '|META:' + JSON.stringify(apMeta);
        }
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
      // Hives: temperament, purpose, supersCount, source
      if (coll === 'hives') {
        var hfMeta = {};
        var hiveExtras = ['temperament','purpose','supersCount','supers_count','source'];
        for (var hfe = 0; hfe < hiveExtras.length; hfe++) {
          var hfk = hiveExtras[hfe];
          if (obj[hfk] !== undefined && obj[hfk] !== null && obj[hfk] !== '') hfMeta[hfk] = obj[hfk];
        }
        if (Object.keys(hfMeta).length > 0) {
          var hfBaseNotes = out['notes'] || '';
          out['notes'] = hfBaseNotes + '|META:' + JSON.stringify(hfMeta);
        }
      }
      // Queens: strain, status, source, performanceScore, costTry, supplier, queenState, isClipped, isMarked
      if (coll === 'queens') {
        var metaFields = {};
        var queenExtras = ['strain','status','source','performance_score','cost_try','supplier','queenState','queen_state','isClipped','is_clipped','isMarked','is_marked'];
        for (var qe = 0; qe < queenExtras.length; qe++) {
          var qk = queenExtras[qe];
          if (obj[qk] !== undefined && obj[qk] !== null && obj[qk] !== '') metaFields[qk] = obj[qk];
        }
        if (Object.keys(metaFields).length > 0) {
          var baseNotes = out['notes'] || '';
          out['notes'] = baseNotes + '|META:' + JSON.stringify(metaFields);
        }
      }
      // Tasks: title, type, priority, dueDate, status, apiaryId, hiveId
      if (coll === 'tasks') {
        var tskMeta = {};
        var taskExtras = ['title','type','priority','dueDate','due_date','status','apiaryId','apiary_id','hiveId','hive_id'];
        for (var tske = 0; tske < taskExtras.length; tske++) {
          var tskk = taskExtras[tske];
          if (obj[tskk] !== undefined && obj[tskk] !== null && obj[tskk] !== '') tskMeta[tskk] = obj[tskk];
        }
        if (Object.keys(tskMeta).length > 0) {
          var tskBaseNotes = out['notes'] || '';
          out['notes'] = tskBaseNotes + '|META:' + JSON.stringify(tskMeta);
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

      // === user_id alanını garanti et ===
      var uid = this._userId();
      if (uid && !out['user_id']) {
        out['user_id'] = uid;
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
        treatments: 'treatments', diseases: 'diseases', inventory: 'inventory',
        tasks: 'tasks'
      };
      return map[coll];
    },
    async _syncAdd(coll, obj, retries) {
      if (retries === undefined) retries = 0;
      if (!this._supabaseAvailable()) return;
      const uid = this._userId();
      if (!uid) return;

      // Parent bağımlılıkları kontrol et (Foreign Key hatalarını önle)
      if (coll === 'hives' && (obj.apiaryId || obj.apiary_id)) {
        var parentApId = obj.apiaryId || obj.apiary_id;
        var parentAp = (this.state.apiaries || []).find(function(a) { return a.id === parentApId; });
        if (parentAp) await this._syncAdd('apiaries', parentAp, 0);
      }
      if ((coll === 'queens' || coll === 'inspections' || coll === 'frames' || coll === 'feedings' || coll === 'harvests' || coll === 'treatments' || coll === 'diseases' || coll === 'tasks') && (obj.hiveId || obj.hive_id)) {
        var parentHiveId = obj.hiveId || obj.hive_id;
        var parentHv = (this.state.hives || []).find(function(h) { return h.id === parentHiveId; });
        if (parentHv) await this._syncAdd('hives', parentHv, 0);
      }

      const client = BM.Auth.getClient();
      const table = this._tableFor(coll);
      if (!table) return;
      try {
        const payload = this._mapToDb(coll, obj);
        const { error } = await client.from(table).upsert(payload);
        if (error) {
          console.warn('[CloudSync] add error (' + coll + '):', error.message);
          // FK hatası ise 1.5sn bekle, tekrar dene (parent kayıt senkron olsun)
          if (error.message.includes('foreign key') && retries < 2) {
            await new Promise(function(r) { setTimeout(r, 1500); });
            return this._syncAdd(coll, obj, retries + 1);
          }
        }
      } catch (e) {
        console.warn('[CloudSync] add failed (' + coll + '):', e.message);
        if (retries < 2) {
          await new Promise(function(r) { setTimeout(r, 1500); });
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
      var tables = ['apiaries', 'hives', 'queens', 'inspections', 'frames', 'harvests', 'feedings', 'treatments', 'diseases', 'inventory', 'tasks'];
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
        varroa_before: 'varroaBefore', varroa_after: 'varroaAfter',
        supers_count: 'supersCount', queen_state: 'queenState',
        is_clipped: 'isClipped', is_marked: 'isMarked', due_date: 'dueDate'
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
            if (r.error) {
              console.warn('[CloudSync] fetch error for ' + t + ':', r.error.message);
              return { table: t, data: null }; // Fetch hatası, yerel veriyi koru
            }
            return { table: t, data: (r.data || []).map(fromDb) };
          }).catch(function(err) {
            console.warn('[CloudSync] fetch exception for ' + t + ':', err);
            return { table: t, data: null };
          });
        }));

        // === SMART HYBRID MERGE (Yerel Veriyi Asla Silme, Eksik Yerel Veriyi Buluta Yükle) ===
        var self = this;
        for (var ri = 0; ri < results.length; ri++) {
          var r = results[ri];
          if (r.data === null) continue; // Fetch hatası, yerel veriyi koru

          var coll = r.table;
          var cloudItems = r.data || [];
          var localItems = self.state[coll] || [];
          
          var mergedList = [];
          var mergedMap = {};

          // 1. Buluttan gelen tüm verileri ekle (yereldeki koordinat vb. ekstra alanları koru)
          for (var cidx = 0; cidx < cloudItems.length; cidx++) {
            var citem = cloudItems[cidx];
            var existingLocal = localItems.find(function(l) { return l.id === citem.id; });
            if (existingLocal) {
              citem = Object.assign({}, existingLocal, citem);
            }
            mergedMap[citem.id] = citem;
            mergedList.push(citem);
          }

          // 2. Yerelde olup bulutta henüz olmayan verileri KORU ve Buluta PUSH et!
          for (var lidx = 0; lidx < localItems.length; lidx++) {
            var litem = localItems[lidx];
            if (!mergedMap[litem.id]) {
              mergedMap[litem.id] = litem;
              mergedList.push(litem);
              // Arka planda buluta gönder
              self._syncAdd(coll, litem);
            }
          }

          self.state[coll] = mergedList;
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
    },

    // Demo verilerini tamamen silme yardimci fonksiyonu
    cleanDemoData() {
      const demoIds = ['ap_1','ap_2','hv_1','hv_2','hv_3','hv_4','hv_5','hv_6','hv_7','q_1','q_2','q_3','q_4','q_5','q_6','q_7','tsk_1','tsk_2','tsk_3','tsk_4'];
      SCHEMA.forEach(coll => {
        if (Array.isArray(this.state[coll])) {
          const demoItems = this.state[coll].filter(x => demoIds.includes(x.id) || (x.id && String(x.id).startsWith('fr_hv_')));
          demoItems.forEach(x => this.remove(coll, x.id));
        }
      });
      this.save();
    }
  };

  Storage.init();
  BM.Storage = Storage;
  BM.SCHEMA = SCHEMA;
})(window);

