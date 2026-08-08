// ============================================================
// SUPABASE CONFIG (injected inline to bypass CDN cache)
// ============================================================
window.__SUPABASE_URL__ = 'https://assfwtjbvuuxclioqsih.supabase.co';
window.__SUPABASE_ANON_KEY__ = 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M';

/* BeeMaster AI v3.0 - Bundled JS (order: utils, db, ui, modules/*, app) */

/* ===== js/utils.js ===== */
// ============================================================
// Utils — Spec 03, 14 — Global namespace pattern
// ============================================================
(function (global) {
  'use strict';

  const BM = global.BM = global.BM || {};

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const uid = () => 'id_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

  const esc = (s) => {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  };

  const fmt = (n, d = 1) => Number(n || 0).toFixed(d);
  const today = () => new Date().toISOString().slice(0, 10);

  const dateStr = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch (e) { return d; }
  };

  const dateAgo = (d) => {
    if (!d) return '-';
    const days = Math.floor((Date.now() - new Date(d).getTime()) / 864e5);
    if (days === 0) return 'bugün';
    if (days === 1) return 'dün';
    if (days < 30) return days + ' gün önce';
    if (days < 365) return Math.floor(days / 30) + ' ay önce';
    return Math.floor(days / 365) + ' yıl önce';
  };

  // Icon registry — Lucide alternatifi (emoji, Spec 03 §2.5)
  const Icons = {
    dashboard: '📊', apiaries: '📍', hives: '🏠', inspections: '📋',
    queens: '👑', honey: '🍯', feeding: '🌾', treatments: '💊',
    diseases: '🦠', inventory: '📦', analytics: '📈', reports: '📄',
    settings: '⚙️', edit: '✏️', delete: '🗑', plus: '+', search: '🔍',
    bell: '🔔', sun: '☀️', moon: '🌙', check: '✓', close: '×',
    warn: '⚠️', info: 'ℹ️', home: '🏠', map: '🗺', list: '📋',
    bee: '🐝', flask: '🧪', shield: '🛡', drop: '💧',
    varroa: '🦠', nosema: '🦠', foulbrood: '⚠️', chalkbrood: '⚪',
    sacbrood: '⚠️', beetle: '🪲',
  };

  // Transforms / Labels
  const T = {
    strain: s => ({anatolian:'Anadolu',caucasian:'Kafkas',carniolan:'Karniyol',buckfast:'Buckfast',carpathian:'Karpat',italian:'İtalyan',cyprian:'Kıbrıs',syrian:'Suriye',egyptian:'Mısır',hybrid:'Hibrit',survivor:'Survivor',unknown:'Bilinmiyor'}[s] || s),
    box: s => ({langstroth:'Langstroth',dadant:'Dadant',layens:'Layens',flow:'Flow',top_bar:'Top-Bar',wooden:'Ahşap Kovan',plastic:'Plastik Kovan',styrofoam:'Strafor Kovan',log:'Kütük Kovan',traditional:'Geleneksel Kütük',observation:'Gözlem Kovanı',queen_rearing:'Ana Arı Yetiştirme Kovanı'}[s] || s),
    pop: s => ({very_strong:'Çok Güçlü',strong:'Güçlü',medium:'Orta',weak:'Zayıf',very_weak:'Çok Zayıf'}[s] || s),
    temperament: s => ({calm:'Sakin 🟢',nervous:'Huzursuz / Sinirli 🟡',aggressive:'Agresif 🔴',very_aggressive:'Çok Saldırgan ☣️'}[s] || s),
    purpose: s => ({honey_production:'🍯 Bal Üretimi',bee_breeding:'🐝 Arı Yetiştiriciliği',queen_rearing:'👑 Ana Arı Yetiştiriciliği',pollination:'🌻 Polinasyon (Tozlaşma)',observation:'👁️ Gözlem / Eğitim',breeding:'🧬 Genetik & Islah'}[s] || s),
    hiveSource: s => ({created_nucleus:'Suni Bölme',swarm:'Oğul',purchased:'Satın Alındı',captured:'Yakalandı',merged:'Birleştirildi'}[s] || s),
    taskType: s => ({feeding:'🌾 Besleme',inspection:'📋 Muayene',treatment:'💊 Varroa/Tedavi',harvest:'🍯 Hasat',queen:'👑 Ana Arı Kontrolü',split:'🐝 Kovan Bölme',supers:'🪵 Kat Atma/Çıkarma',cleaning:'🧹 Temizlik/Bakım',other:'📌 Diğer'}[s] || s),
    taskPriority: s => ({low:'Düşük',normal:'Normal',high:'Yüksek',urgent:'🔥 Acil'}[s] || s),
    queenState: s => ({laying:'Yumurtluyor (Aktif)',virgin:'Bakire',cell:'Yüksükte',mating:'Çiftleşmede',old:'Yaşlı/Zayıf',replaced:'Değiştirildi'}[s] || s),
    color: s => ({white:'Beyaz',yellow:'Sarı',red:'Kırmızı',green:'Yeşil',blue:'Mavi'}[s] || s),
    source: s => ({bred:'Kendi Yetiştirdiğim',purchased:'Satın Alındı',swarm:'Oğul Memesi',supersedure:'Doğal Yenileme',emergency:'Acil Hücre'}[s] || s),
    feedType: s => ({
      sugar_syrup: {tr:'Şeker Şurubu (2:1)', unit:'L', density:1.3},
      sugar_syrup_1to1: {tr:'Şeker Şurubu (1:1)', unit:'L', density:1.2},
      fondant: {tr:'Fondant (Kek)', unit:'kg', density:1},
      pollen_patty: {tr:'Polen Keçi', unit:'kg', density:1},
      candy: {tr:'Yemlik Kek', unit:'kg', density:1},
      honey_water: {tr:'Bal+Su', unit:'L', density:1.05},
      invert_syrup: {tr:'İnvert Şurubu', unit:'L', density:1.3},
      protein_patty: {tr:'Protein Keçi', unit:'kg', density:1}
    }[s] || {tr:s, unit:'kg', density:1}),
    reason: s => ({weak_colony:'Zayıf koloni',winter_prep:'Kış hazırlığı',drought:'Kuraklık',supplement:'Ek besin',stimulative:'Teşvik'}[s] || s),
    disease: s => ({varroosis:'Varroosis',nosemosis:'Nosema',foulbrood:'Yavru Çürüğü',chalkbrood:'Kireç Hastalığı',sacbrood:'Torba Hastalığı',small_hive_beetle:'KKB'}[s] || s),
    invCat: s => ({medication:'İlaç',feed:'Yem',equipment:'Ekipman',consumable:'Sarf'}[s] || s),
    weather: s => ({sunny:'☀️ Güneşli',cloudy:'☁️ Bulutlu',rainy:'🌧 Yağmurlu',snowy:'❄️ Karlı',windy:'💨 Rüzgarlı',stormy:'⛈ Fırtınalı',partly_cloudy:'⛅ Parçalı Bulutlu',hot:'🔥 Sıcak',cold:'🥶 Soğuk'}[s] || s),
    status: s => ({active:'Aktif',weak:'Zayıf',dead:'Ölü',sold:'Satıldı',merged:'Birleşti',treating:'Tedavide',planned:'Planlı',completed:'Tamamlandı',in_progress:'Sürüyor',resolved:'Çözüldü',superseded:'Değiştirildi',missing:'Kayıp',ok:'İYİ',good:'İYİ',warning:'DİKKAT',danger:'ACİL'}[s] || s),
    statusCls: s => ['good','ok','active','completed','resolved'].includes(s) ? 'badge--ok' : ['danger','dead'].includes(s) ? 'badge--danger' : 'badge--warn',
    statusDot: s => ['good','ok','active','completed','resolved'].includes(s) ? 'row-list__dot--g' : ['danger','dead'].includes(s) ? 'row-list__dot--r' : 'row-list__dot--y',
  };

  // EventBus
  const Bus = {
    handlers: {},
    on(event, fn) { (this.handlers[event] = this.handlers[event] || []).push(fn); return () => this.off(event, fn); },
    off(event, fn) { this.handlers[event] = (this.handlers[event] || []).filter(f => f !== fn); },
    emit(event, data) { (this.handlers[event] || []).forEach(fn => fn(data)); }
  };

  Object.assign(BM, { $, $$, uid, esc, fmt, today, dateStr, dateAgo, Icons, T, Bus });
})(window);

