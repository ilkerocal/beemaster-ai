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
    strain: s => ({anatolian:'Anadolu',caucasian:'Kafkas',carniolan:'Karniyol',italian:'İtalyan',hybrid:'Hibrit'}[s] || s),
    box: s => ({langstroth:'Langstroth',dadant:'Dadant',layens:'Layens',flow:'Flow',top_bar:'Top-Bar'}[s] || s),
    pop: s => ({very_strong:'Çok Güçlü',strong:'Güçlü',medium:'Orta',weak:'Zayıf',very_weak:'Çok Zayıf'}[s] || s),
    color: s => ({white:'Beyaz',yellow:'Sarı',red:'Kırmızı',green:'Yeşil',blue:'Mavi'}[s] || s),
    source: s => ({bred:'Yetiştirildi',purchased:'Satın alındı',swarm:'Oğul',supersedure:'Süpersedür',emergency:'Acil'}[s] || s),
    feedType: s => ({sugar_syrup:'Şeker Şurubu',fondant:'Fondant',pollen_patty:'Polen Keçi',candy:'Kek',honey_water:'Bal+Su'}[s] || s),
    reason: s => ({weak_colony:'Zayıf koloni',winter_prep:'Kış hazırlığı',drought:'Kuraklık',supplement:'Ek besin',stimulative:'Teşvik'}[s] || s),
    disease: s => ({varroosis:'Varroosis',nosemosis:'Nosema',foulbrood:'Yavru Çürüğü',chalkbrood:'Kireç Hastalığı',sacbrood:'Torba Hastalığı',small_hive_beetle:'KKB'}[s] || s),
    invCat: s => ({medication:'İlaç',feed:'Yem',equipment:'Ekipman',consumable:'Sarf'}[s] || s),
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
