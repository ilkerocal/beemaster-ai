/* ============================================================
   BeeMaster AI — Local DB (localStorage wrapper)
   Schema mirrors schemas/apiary-memory.schema.json
   ============================================================ */

(function (global) {
  'use strict';

  const STORAGE_KEY = 'beemaster:db:v1';
  const SESSION_KEY = 'beemaster:session:v1';

  const emptyDb = () => ({
    version: 1,
    activeApiaryId: null,
    apiaries: [],
    hives: [],
    inspections: [],
    treatments: [],
    harvests: [],
    queenEvents: [],
    notes: [],
    settings: {
      theme: 'auto',
      region: 'TR-Diyarbakir',
      climateZone: 'Csa/BSh',
      locale: 'tr-TR',
      inspectionIntervalDays: 14,  // varsayılan muayene sıklığı (gün)
      reminderLeadDays: 3,         // kaç gün önceden hatırlat
      reminderDismissed: {},       // {hiveId: 'YYYY-MM-DD'} - bugün için hatırlatmasın
    },
  });

  function loadDb() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return emptyDb();
      const parsed = JSON.parse(raw);
      // Merge missing defaults
      return Object.assign(emptyDb(), parsed);
    } catch (e) {
      console.error('DB load error', e);
      return emptyDb();
    }
  }

  function saveDb(db) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error('DB save error', e);
      return false;
    }
  }

  // Simple event bus
  const listeners = new Set();
  function emit(event, data) {
    listeners.forEach((fn) => {
      try { fn(event, data); } catch (e) { console.error(e); }
    });
  }
  function on(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  // CRUD helpers
  function uid(prefix) {
    return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  }

  const Db = {
    STORAGE_KEY,
    SESSION_KEY,
    state: loadDb(),

    // Persistence
    save() {
      saveDb(this.state);
      emit('db:save', this.state);
    },

    reset() {
      this.state = emptyDb();
      this.save();
    },

    // Apiaries
    listApiaries() { return this.state.apiaries.slice(); },
    getApiary(id) { return this.state.apiaries.find((a) => a.id === id) || null; },
    addApiary(data) {
      const apiary = {
        id: uid('A'),
        name: data.name || 'Yeni arılık',
        location: data.location || { region: this.state.settings.region },
        established: data.established || new Date().toISOString().slice(0, 10),
        owner: data.owner || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
      };
      this.state.apiaries.push(apiary);
      if (!this.state.activeApiaryId) this.state.activeApiaryId = apiary.id;
      this.save();
      emit('apiary:add', apiary);
      return apiary;
    },
    updateApiary(id, patch) {
      const idx = this.state.apiaries.findIndex((a) => a.id === id);
      if (idx < 0) return null;
      Object.assign(this.state.apiaries[idx], patch);
      this.save();
      emit('apiary:update', this.state.apiaries[idx]);
      return this.state.apiaries[idx];
    },
    deleteApiary(id) {
      this.state.apiaries = this.state.apiaries.filter((a) => a.id !== id);
      // Cascade delete hives etc
      this.state.hives = this.state.hives.filter((h) => h.apiaryId !== id);
      this.state.inspections = this.state.inspections.filter((i) => i.apiaryId !== id);
      this.state.treatments = this.state.treatments.filter((t) => t.apiaryId !== id);
      this.state.harvests = this.state.harvests.filter((h) => h.apiaryId !== id);
      if (this.state.activeApiaryId === id) {
        this.state.activeApiaryId = this.state.apiaries[0]?.id || null;
      }
      this.save();
      emit('apiary:delete', { id });
    },
    setActiveApiary(id) {
      this.state.activeApiaryId = id;
      this.save();
      emit('apiary:active', id);
    },
    getActiveApiaryId() { return this.state.activeApiaryId; },

    // Hives
    listHives(apiaryId) {
      const id = apiaryId || this.state.activeApiaryId;
      return this.state.hives.filter((h) => h.apiaryId === id);
    },
    getHive(id) { return this.state.hives.find((h) => h.id === id) || null; },
    addHive(data) {
      const hive = {
        id: uid('H'),
        apiaryId: data.apiaryId || this.state.activeApiaryId,
        label: data.label || 'Yeni kovan',
        hiveType: data.hiveType || 'Langstroth',
        queenId: data.queenId || null,
        queenMarking: data.queenMarking || '',
        queenSubspecies: data.queenSubspecies || 'Anadolu arısı',
        queenInstalled: data.queenInstalled || new Date().toISOString().slice(0, 10),
        queenOrigin: data.queenOrigin || '',
        frames: data.frames || 10,
        status: data.status || 'active',
        createdAt: new Date().toISOString(),
      };
      this.state.hives.push(hive);
      this.save();
      emit('hive:add', hive);
      return hive;
    },
    updateHive(id, patch) {
      const idx = this.state.hives.findIndex((h) => h.id === id);
      if (idx < 0) return null;
      Object.assign(this.state.hives[idx], patch);
      this.save();
      emit('hive:update', this.state.hives[idx]);
      return this.state.hives[idx];
    },
    deleteHive(id) {
      this.state.hives = this.state.hives.filter((h) => h.id !== id);
      this.state.inspections = this.state.inspections.filter((i) => i.hiveId !== id);
      this.state.treatments = this.state.treatments.filter((t) => t.hiveId !== id);
      this.state.harvests = this.state.harvests.filter((h) => h.hiveId !== id);
      this.save();
      emit('hive:delete', { id });
    },

    // Inspections
    listInspections(hiveId) {
      return this.state.inspections
        .filter((i) => !hiveId || i.hiveId === hiveId)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    addInspection(data) {
      const ins = Object.assign({
        id: uid('I'),
        createdAt: new Date().toISOString(),
      }, data);
      this.state.inspections.push(ins);
      this.save();
      emit('inspection:add', ins);
      return ins;
    },
    deleteInspection(id) {
      this.state.inspections = this.state.inspections.filter((i) => i.id !== id);
      this.save();
      emit('inspection:delete', { id });
    },

    // Treatments
    listTreatments(hiveId) {
      return this.state.treatments
        .filter((t) => !hiveId || t.hiveId === hiveId)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    addTreatment(data) {
      const t = Object.assign({
        id: uid('T'),
        createdAt: new Date().toISOString(),
      }, data);
      this.state.treatments.push(t);
      this.save();
      emit('treatment:add', t);
      return t;
    },
    deleteTreatment(id) {
      this.state.treatments = this.state.treatments.filter((t) => t.id !== id);
      this.save();
    },

    // Harvests
    listHarvests(hiveId) {
      return this.state.harvests
        .filter((h) => !hiveId || h.hiveId === hiveId)
        .sort((a, b) => b.date.localeCompare(a.date));
    },
    addHarvest(data) {
      const h = Object.assign({
        id: uid('HA'),
        createdAt: new Date().toISOString(),
      }, data);
      this.state.harvests.push(h);
      this.save();
      emit('harvest:add', h);
      return h;
    },
    deleteHarvest(id) {
      this.state.harvests = this.state.harvests.filter((h) => h.id !== id);
      this.save();
    },

    // Stats / summaries
    getApiaryStats(apiaryId) {
      const id = apiaryId || this.state.activeApiaryId;
      const hives = this.listHives(id);
      const insps = this.state.inspections.filter((i) => i.apiaryId === id);
      const treats = this.state.treatments.filter((t) => t.apiaryId === id);
      const harv = this.state.harvests.filter((h) => h.apiaryId === id);
      const totalYield = harv.reduce((s, h) => s + (Number(h.yieldKg) || 0), 0);
      const lastInspection = insps.sort((a, b) => b.date.localeCompare(a.date))[0];
      return {
        hiveCount: hives.length,
        inspectionCount: insps.length,
        treatmentCount: treats.length,
        totalYieldKg: totalYield,
        lastInspectionDate: lastInspection?.date || null,
      };
    },

    // Settings
    getSettings() { return Object.assign({}, this.state.settings); },
    updateSettings(patch) {
      Object.assign(this.state.settings, patch);
      this.save();
    },

    // Import / Export
    exportJson() {
      return JSON.stringify(this.state, null, 2);
    },
    importJson(json) {
      const parsed = JSON.parse(json);
      this.state = Object.assign(emptyDb(), parsed);
      this.save();
      emit('db:import', this.state);
    },

    // Events
    on,
  };

  global.BeeDb = Db;
})(window);