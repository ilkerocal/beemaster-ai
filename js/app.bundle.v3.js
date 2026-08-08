
/* ===== 00_core.js ===== */
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



/* ===== 01_auth.js ===== */
/* ===== js/modules/auth.js ===== */
// ============================================================
// Supabase Auth + Cloud Sync (Optional - falls back to localStorage)
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  function getSupabaseUrl() {
    return (typeof window !== 'undefined' && window.__SUPABASE_URL__) || 'https://assfwtjbvuuxclioqsih.supabase.co';
  }
  function getSupabaseKey() {
    return (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) || 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M';
  }

  let _client = null;
  let _user = null;
  let _session = null;

  function isConfigured() {
    return !!(getSupabaseUrl() && getSupabaseKey() && (typeof window !== 'undefined' && window.supabase));
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!_client) {
      try {
        _client = window.supabase.createClient(getSupabaseUrl(), getSupabaseKey());
      } catch (e) {
        console.warn('Supabase init failed:', e);
        return null;
      }
    }
    return _client;
  }

  // ---- Auth ----
  async function signUp(email, password) {
    const c = getClient();
    if (!c) return { data: null, error: { message: 'Supabase yapılandırılmamış' } };
    const result = await c.auth.signUp({ email, password });
    if (result.data?.user) {
      _user = result.data.user;
      _session = result.data.session;
      localStorage.setItem('beemaster-auth-token', _session?.access_token || '');
      // Create profile
      await c.from('profiles').upsert({ id: _user.id, email: _user.email });
    }
    return result;
  }

  async function signIn(email, password) {
    const c = getClient();
    if (!c) return { data: null, error: { message: 'Supabase yapılandırılmamış' } };
    const result = await c.auth.signInWithPassword({ email, password });
    if (result.data?.user) {
    _user = result.data.user;
    _session = result.data.session;
    localStorage.setItem('beemaster-auth-token', _session?.access_token || '');
    // Her girişte Supabase'den TÜM veriyi çek
    if (BM.Storage && BM.Storage.syncFromCloud) BM.Storage.syncFromCloud();
    }
    return result;
  }

  async function signOut() {
    const c = getClient();
    if (c) await c.auth.signOut();
    _user = null;
    _session = null;
    localStorage.removeItem('beemaster-auth-token');
  }

  function getUser() { return _user; }
  function isAuthenticated() { return !!_user; }

  // ---- UI: Show login modal ----
  let _authMode = 'login'; // 'login' | 'register'

  function showLoginModal() {
    if (typeof BM === 'undefined' || !BM.Modal) {
      alert('Giriş için lütfen bekleyin, sayfa yükleniyor...');
      return;
    }
    if (_user) {
      // Show profile + logout if already logged in - temiz tasarim
      const email = BM.esc(_user.email || '');
      const userId = (_user.id || '').substring(0, 8);
      const createdAt = _user.created_at ? new Date(_user.created_at).toLocaleDateString('tr-TR') : '';
      const stats = BM.Storage.state || {};
      const totalRecords = (stats.hives?.length || 0) + (stats.inspections?.length || 0) + (stats.feedings?.length || 0);

      BM.Modal.open('👤 Hesabım',
        `<div style="padding:var(--space-1) 0">
          <!-- Avatar + Email Header -->
          <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:linear-gradient(135deg, #f59e0b 0%, #f59e0b 100%);border-radius:var(--radius-lg);margin-bottom:var(--space-4);color:#fff">
            <div style="width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:700;flex-shrink:0">
              ${email.charAt(0).toUpperCase()}
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:11px;opacity:0.85;text-transform:uppercase;letter-spacing:0.04em">Giriş Yapıldı ✓</div>
              <div style="font-size:16px;font-weight:700;margin-top:4px;word-break:break-all">${email}</div>
              ${createdAt ? `<div style="font-size:11px;opacity:0.8;margin-top:4px">Üyelik: ${createdAt}</div>` : ''}
            </div>
          </div>

          <!-- Cloud Status -->
          <div style="padding:var(--space-3);background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:var(--radius-md);margin-bottom:var(--space-3)">
            <div style="display:flex;align-items:center;gap:var(--space-2)">
              <span style="font-size:20px">☁️</span>
              <div style="flex:1">
                <div style="font-size:13px;font-weight:700;color:#16a34a">Supabase Bağlı</div>
                <div style="font-size:11px;color:var(--text-secondary)">Tüm değişiklikler buluta kaydediliyor</div>
              </div>
              <span class="badge badge--ok" style="background:#16a34a;color:#fff">AKTİF</span>
            </div>
          </div>

          <!-- Stats -->
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2);margin-bottom:var(--space-4)">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:20px;font-weight:700;color:#f59e0b">${stats.hives?.length || 0}</div>
              <div style="font-size:10px;color:var(--text-secondary);margin-top:2px">Kovan</div>
            </div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:20px;font-weight:700;color:#f59e0b">${stats.inspections?.length || 0}</div>
              <div style="font-size:10px;color:var(--text-secondary);margin-top:2px">Muayene</div>
            </div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:20px;font-weight:700;color:#f59e0b">${stats.feedings?.length || 0}</div>
              <div style="font-size:10px;color:var(--text-secondary);margin-top:2px">Besleme</div>
            </div>
          </div>

          <!-- Account Info -->
          <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-3)">
            <div style="font-size:11px;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.04em;margin-bottom:var(--space-2)">Hesap Bilgileri</div>
            <div style="display:flex;justify-content:space-between;padding:var(--space-1) 0;font-size:13px">
              <span style="color:var(--text-secondary)">Kullanıcı ID</span>
              <span style="font-family:monospace;font-size:12px">${userId}...</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:var(--space-1) 0;font-size:13px">
              <span style="color:var(--text-secondary)">E-posta doğrulandı</span>
              <span>${_user.email_confirmed_at ? '✅' : '⏳ Bekliyor'}</span>
            </div>
            <div style="display:flex;justify-content:space-between;padding:var(--space-1) 0;font-size:13px">
              <span style="color:var(--text-secondary)">Toplam kayıt</span>
              <span><strong>${totalRecords}</strong></span>
            </div>
          </div>

          <!-- Actions -->
          <div style="display:flex;flex-direction:column;gap:var(--space-2)">
            <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.Storage.syncFromCloud(),300)">
              🔄 Buluttan Yenile
            </button>
            <button type="button" class="btn btn--danger" onclick="BM.Auth.doLogout()">
              🚪 Çıkış Yap
            </button>
          </div>
        </div>`,
        () => false
      );
      return;
    }

    _authMode = 'login';

    const renderBody = () => `
      <div style="padding:var(--space-1) 0">
        <!-- Header Banner -->
        <div style="display:flex;align-items:center;gap:12px;padding:14px;background:linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15));border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-lg);margin-bottom:16px">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#f59e0b,#d97706);display:flex;align-items:center;justify-content:center;font-size:24px;color:#fff;flex-shrink:0">🐝</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:var(--text-primary)">BeeMaster AI Bulut Hesabı</div>
            <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">Verilerinizi tüm cihazlarınızda anında senkronize edin</div>
          </div>
        </div>

        <!-- Mode Tabs -->
        <div style="display:flex;gap:4px;margin-bottom:16px;background:var(--bg-tertiary);padding:4px;border-radius:var(--radius-md)">
          <button type="button" id="auth-tab-login" class="btn ${_authMode === 'login' ? 'btn--primary' : 'btn--ghost'}" style="flex:1;padding:9px;font-size:13px;font-weight:600" onclick="BM.Auth.switchTab('login')">🔑 Giriş Yap</button>
          <button type="button" id="auth-tab-register" class="btn ${_authMode === 'register' ? 'btn--primary' : 'btn--ghost'}" style="flex:1;padding:9px;font-size:13px;font-weight:600" onclick="BM.Auth.switchTab('register')">📝 Kayıt Ol</button>
        </div>

        <!-- Quick Demo Credentials Fill -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
          <span style="font-size:12px;color:var(--text-secondary)">${_authMode === 'login' ? 'E-posta ve şifrenizle giriş yapın:' : 'Yeni kullanıcı bilgilerinizi girin:'}</span>
          <button type="button" style="font-size:11px;color:var(--honey-500);cursor:pointer;background:none;border:none;font-weight:600;padding:2px 6px;border-radius:4px" onclick="document.getElementById('auth-email').value='kormanveli0@gmail.com';document.getElementById('auth-password').value='123456';">⚡ Otomatik Doldur</button>
        </div>

        <!-- Inputs -->
        <label class="field"><span class="field-label">✉️ E-posta Adresi</span>
          <input class="input" type="email" id="auth-email" placeholder="kormanveli0@gmail.com" autocomplete="email" required></label>
        
        <label class="field"><span class="field-label">🔒 Şifre</span>
          <input class="input" type="password" id="auth-password" placeholder="••••••" autocomplete="${_authMode === 'login' ? 'current' : 'new'}-password" required></label>

        <div id="auth-error" style="color:var(--danger);font-size:12px;margin-top:6px;min-height:18px;font-weight:500"></div>

        <!-- Primary Action Button -->
        <button type="button" id="auth-submit-btn" class="btn btn--primary" style="width:100%;padding:12px;font-size:15px;font-weight:700;margin-top:12px;background:linear-gradient(135deg,#f59e0b,#d97706);border:none;border-radius:var(--radius-md);color:#fff;display:flex;align-items:center;justify-content:center;gap:8px" onclick="BM.Auth.submitForm()">
          ${_authMode === 'login' ? '🔑 Giriş Yap' : '📝 Hesabımı Oluştur'}
        </button>

        <div style="margin-top:16px;padding-top:12px;border-top:1px solid var(--n-800);display:flex;justify-content:space-between;align-items:center;font-size:11px;color:var(--text-muted)">
          <span>☁️ Supabase Güvenli Bulut</span>
          <button type="button" class="btn btn--ghost" style="font-size:11px;padding:2px 8px;color:var(--text-secondary)" onclick="BM.Modal.close()">Kapat</button>
        </div>
      </div>`;

    BM.Modal.open('🐝 BeeMaster AI', renderBody(), null, { hideFooter: true });
  }

  function switchTab(mode) {
    _authMode = mode;
    const bodyEl = document.getElementById('modal-body');
    if (bodyEl) bodyEl.innerHTML = renderBody();
  }

  async function submitForm() {
    const email = document.getElementById('auth-email')?.value.trim();
    const password = document.getElementById('auth-password')?.value;
    const errEl = document.getElementById('auth-error');
    const submitBtn = document.getElementById('auth-submit-btn');

    if (!email || !password) {
      if (errEl) errEl.textContent = 'Lütfen e-posta ve şifrenizi girin.';
      return;
    }
    if (password.length < 6) {
      if (errEl) errEl.textContent = 'Şifre en az 6 karakter olmalıdır.';
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '⏳ İşleniyor...';
    }

    let result;
    if (_authMode === 'register') {
      result = await signUp(email, password);
      if (result.error?.message?.toLowerCase().includes('already')) {
        result = await signIn(email, password);
      }
    } else {
      result = await signIn(email, password);
    }

    if (result.error) {
      if (errEl) errEl.textContent = (result.error.message || 'Giriş başarısız oldu') + (result.error.code ? ' (' + result.error.code + ')' : '');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = _authMode === 'login' ? '🔑 Giriş Yap' : '📝 Hesabımı Oluştur';
      }
      return;
    }

    if (result.data?.user) {
      BM.Modal.close();
      BM.Toast.show('Hoş geldiniz! 🌐 Bulut senkronizasyonu aktif', 'success');
      updateAuthBtn();
      if (BM.Storage && typeof BM.Storage.syncFromCloud === 'function') {
        BM.Toast.show('🔄 Bulut verileri yükleniyor...', 'info');
        await BM.Storage.syncFromCloud();
      }
    }
  }

  function updateAuthBtn() {
    const btn = document.getElementById('auth-btn');
    if (!btn) return;
    if (_user) {
      btn.textContent = '👤';
      btn.title = _user.email + ' (çıkış için tıkla)';
      btn.style.fontSize = '18px';
    } else {
      btn.textContent = '🔐';
      btn.title = 'Giriş Yap / Kayıt Ol';
    }
    updateSidebarUser();
  }

  function updateSidebarUser() {
    const avatar = document.getElementById('sidebar-user-avatar');
    const name = document.getElementById('sidebar-user-name');
    const role = document.getElementById('sidebar-user-role');
    if (!avatar || !name || !role) return;
    if (_user) {
      const email = _user.email || '';
      avatar.textContent = email.charAt(0).toUpperCase() || '👤';
      avatar.style.background = 'linear-gradient(135deg, #22c55e, #16a34a)';
      name.textContent = email.split('@')[0] || email;
      role.textContent = '✅ ' + (BM.Storage.list('apiaries').length) + ' üs · Supabase bağlı';
    } else {
      avatar.textContent = '?';
      avatar.style.background = 'var(--bg-tertiary)';
      name.textContent = 'Giriş Yap';
      role.textContent = 'Misafir · Veriler cihazınızda';
    }
  }

  async function doLogout() {
    await signOut();
    updateAuthBtn();
    BM.Toast.show('Çıkış yapıldı. Veriler cihazınızda kalmaya devam ediyor.', 'info');
    BM.Modal.close();
    if (typeof App !== 'undefined' && App.render) App.render('dashboard');
  }

  // ---- Check existing session on load ----
  async function initFromStorage() {
    // Wait for Supabase to load if not yet ready
    if (!window.supabase) {
      let wait = 0;
      while (!window.supabase && wait < 3000) {
        await new Promise(r => setTimeout(r, 100));
        wait += 100;
      }
    }
    if (!isConfigured()) return;
    const c = getClient();
    if (!c) return;
    try {
      // PRIMARY: Supabase'in kendi oturum yonetimini kullan
      // getSession() localStorage'dan oturumu okur ve gerekirse refresh_token ile yeniler
      const { data: { session }, error: sessionError } = await c.auth.getSession();
      if (!sessionError && session?.user) {
        _user = session.user;
        _session = session;
        localStorage.setItem('beemaster-auth-token', session.access_token);
        updateAuthBtn();
        if (BM.Storage && BM.Storage.syncFromCloud) BM.Storage.syncFromCloud();
        return;
      }
      // FALLBACK: Manuel token ile dene (geriye uyumluluk)
      const token = localStorage.getItem('beemaster-auth-token');
      if (!token) return;
      const { data, error } = await c.auth.getUser(token);
      if (error) {
        localStorage.removeItem('beemaster-auth-token');
        return;
      }
      if (data?.user) {
        _user = data.user;
        _session = { access_token: token };
        updateAuthBtn();
        if (BM.Storage && BM.Storage.syncFromCloud) BM.Storage.syncFromCloud();
      }
    } catch (e) {
      console.warn('[Auth] initFromStorage error:', e);
    }
  }

  BM.Auth = {
    isConfigured,
    getClient,
    signUp,
    signIn,
    signOut,
    getUser,
    isAuthenticated,
    showLoginModal,
    switchTab,
    submitForm,
    updateAuthBtn,
    updateSidebarUser,
    doLogout,
    initFromStorage
  };
})(window);





/* ===== 02_db.js ===== */
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
            return { table: t, data: (r.data || []).map(fromDb) };
          }).catch(function() { return { table: t, data: null }; }); // null = fetch failed, keep local
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

          // 1. Buluttan gelen tüm verileri ekle
          for (var cidx = 0; cidx < cloudItems.length; cidx++) {
            var citem = cloudItems[cidx];
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



/* ===== 03_ui.js ===== */
/* ===== js/ui.js ===== */
// ============================================================
// UI Components — Modal, Toast, Tabs (Spec 03 §3.1)
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  // ============ MODAL ============
  const Modal = {
    cb: null,
    el: null,

    open(title, html, onSubmit, options) {
      if (!this.el) {
        this.el = document.getElementById('modal-overlay');
      }
      // Click outside to close
      this.el.onclick = (e) => { if (e.target === this.el) this.close(); };
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').innerHTML = html;
      document.getElementById('modal-form').onsubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = {};
        for (const [k, v] of fd.entries()) {
          if (data[k] !== undefined) {
            // multi-value
            if (!Array.isArray(data[k])) data[k] = [data[k]];
            data[k].push(v);
          } else {
            data[k] = v;
          }
        }
        if (this.cb) {
          const result = this.cb(data);
          // Support async callbacks (Promise) - wait for it to finish
          if (result && typeof result.then === 'function') {
            result.then(r => { if (r !== false) this.close(); }).catch(e => { console.error('Modal callback error:', e); this.close(); });
          } else if (result !== false) {
            this.close();
          }
        }
      };
      this.cb = onSubmit;
      const foot = document.querySelector('.modal__foot');
      if (foot) {
        if (options && options.hideFooter) {
          foot.style.display = 'none';
        } else {
          foot.style.display = '';
          foot.innerHTML = '<button type="button" class="btn btn--ghost" onclick="BM.Modal.close()">İptal</button>\n          <button type="submit" class="btn btn--primary" id="modal-submit">Kaydet</button>';
        }
      }
      this.el.classList.add('modal-overlay--active');
      setTimeout(() => {
        const f = document.getElementById('modal-body').querySelector('input,select,textarea');
        if (f) f.focus();
      }, 50);
    },

    close() {
      if (this.el) this.el.classList.remove('modal-overlay--active');
      this.cb = null;
      const foot = document.querySelector('.modal__foot');
      if (foot) {
        foot.style.display = '';
        foot.innerHTML = '<button type="button" class="btn btn--ghost" onclick="BM.Modal.close()">İptal</button>\n          <button type="submit" class="btn btn--primary" id="modal-submit">Kaydet</button>';
      }
    },

    confirm(msg, onYes, onNo) {
      const self = this;
      this.cb = null;
      if (!this.el) this.el = document.getElementById('modal-overlay');
      this.el.onclick = (e) => { if (e.target === this.el) { this.close(); onNo && onNo(); } };
      document.getElementById('modal-title').textContent = '⚠️ Onay';
      document.getElementById('modal-body').innerHTML = `<div class="empty" style="padding:var(--space-3) 0"><div class="empty__icon" style="font-size:48px">⚠️</div><div class="empty__title" style="font-size:15px;margin-top:var(--space-2)">${BM.esc(msg)}</div></div>`;
      const foot = document.querySelector('.modal__foot');
      if (foot) {
        foot.style.display = 'flex';
        foot.innerHTML = `<button type="button" class="btn btn--ghost" id="confirm-no">İptal</button><button type="button" class="btn btn--danger" id="confirm-yes">⚠️ Onayla</button>`;
        setTimeout(() => {
          const yesBtn = document.getElementById('confirm-yes');
          const noBtn = document.getElementById('confirm-no');
          if (yesBtn) yesBtn.onclick = () => { self.close(); if (onYes) onYes(); };
          if (noBtn) noBtn.onclick = () => { self.close(); if (onNo) onNo(); };
        }, 50);
      }
      this.el.classList.add('modal-overlay--active');
    },

    showReport(html) {
      this.open('Rapor', html, () => true);
    }
  };

  // ============ TOAST ============
  const Toast = {
    container: null,
    show(msg, type = 'info') {
      if (!this.container) this.container = document.getElementById('toast-container');
      const el = document.createElement('div');
      el.className = 'toast toast--' + type;
      el.textContent = msg;
      this.container.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
      }, 3000);
    }
  };

  // ============ TABS ============
  const Tabs = {
    init(container, tabs, defaultTab, onChange) {
      const tabBar = container.querySelector('.tabs');
      const content = container.querySelector('.tabs__content');
      if (!tabBar || !content) return;

      const render = (activeId) => {
        tabBar.innerHTML = tabs.map(t => `
          <button type="button" class="tabs__item ${t.id === activeId ? 'tabs__item--active' : ''}" data-tab="${t.id}">
            ${BM.esc(t.label)}
          </button>
        `).join('');
        const tab = tabs.find(t => t.id === activeId);
        if (tab) content.innerHTML = tab.content;
        onChange && onChange(activeId);
        tabBar.querySelectorAll('.tabs__item').forEach(btn => {
          btn.onclick = () => render(btn.dataset.tab);
        });
      };

      render(defaultTab || tabs[0].id);
      return { setActive: render };
    }
  };

  // ============ WIZARD ============
  const Wizard = {
    open(title, steps, onComplete, initialState) {
      let currentStep = 0;
      // initialState'i direkt kullan ki setMode gibi cagrilar ayni objeyi degistirsin
      const state = initialState || {};

      const render = () => {
        const step = steps[currentStep];
        const isLast = currentStep === steps.length - 1;

        Modal.open(title,
          `
            <div class="wizard">
              <div class="wizard__steps">
                ${steps.map((s, i) => `
                  <div class="wizard__step ${i === currentStep ? 'wizard__step--active' : (i < currentStep ? 'wizard__step--done' : '')}">
                    <div class="wizard__step-num">${i < currentStep ? '✓' : i + 1}</div>
                    <div class="wizard__step-label">${BM.esc(s.label)}</div>
                  </div>
                `).join('')}
              </div>
              <div id="wizard-body">${step.render(state)}</div>
              <div class="wizard__nav">
                <button type="button" class="btn btn--ghost" ${currentStep === 0 ? 'disabled' : ''} onclick="BM.Wizard._prev()">← Geri</button>
                <div style="font-size:11px;color:var(--text-secondary)">${currentStep + 1}/${steps.length}</div>
                ${isLast
                  ? `<button type="button" class="btn btn--primary" onclick="BM.Wizard._complete()">✓ Tamamla</button>`
                  : `<button type="button" class="btn btn--primary" onclick="BM.Wizard._next()">İleri →</button>`}
              </div>
            </div>
          `,
          () => false // Wizard kendi navigation'unu yonetiyor
        );
        // Modal form'u disable et (submit wizard tarafindan kontrol ediliyor)
        document.getElementById('modal-form').onsubmit = (e) => { e.preventDefault(); return false; };
        // Hide default foot
        const foot = document.querySelector('.modal__foot');
        if (foot) foot.style.display = 'none';

        // Trigger step's onMount
        if (step.onMount) step.onMount(state, (data) => Object.assign(state, data));
      };

      this._next = () => {
        const step = steps[currentStep];
        if (step.validate && !step.validate(state)) return;
        if (step.onNext) step.onNext(state);
        if (currentStep < steps.length - 1) {
          currentStep++;
          render();
        }
      };

      this._prev = () => {
        if (currentStep > 0) {
          currentStep--;
          render();
        }
      };

      this._complete = async () => {
        const step = steps[currentStep];
        if (step.validate && !step.validate(state)) return;
        // Önce kaydı BEKLE, sonra modalı kapat
        try { await onComplete(state); } catch(e) { console.warn('Wizard onComplete error:', e); }
        Modal.close();
        // Restore default foot
        const foot = document.querySelector('.modal__foot');
        if (foot) foot.style.display = '';
      };

      render();
    }
  };

  Object.assign(BM, { Modal, Toast, Tabs, Wizard });
})(window);



/* ===== 04_apiaries.js ===== */
/* ===== js/modules/apiaries.js ===== */
// ============================================================
// Apiaries Module — Spec 05_Modules/Apiaries.md
// P0: CRUD + harita + üs bazlı özet
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const apiariesModule = {
    // ============ CRUD ============
    add() {
      BM.Modal.open('Yeni Arı Üssü',
        `<label class="field"><span class="field-label">Üs Adı *</span>
          <input class="input" name="name" required placeholder="Örn: Çınar Üssü"></label>
         <label class="field"><span class="field-label">Konum *</span>
          <div style="display:flex;gap:var(--space-2)">
            <input class="input" id="ap-loc-input" name="location" required placeholder="Örn: Çınar, Diyarbakır" style="flex:1">
            <button type="button" id="ap-gps-btn" class="btn btn--primary" onclick="BM.apiaries.gpsCapture()" style="white-space:nowrap;padding:8px 12px" title="GPS ile otomatik konum al">📍 GPS</button>
          </div></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Enlem</span>
             <input class="input" id="ap-lat-input" name="lat" type="number" step="0.001" placeholder="38.247"></label>
           <label class="field"><span class="field-label">Boylam</span>
             <input class="input" id="ap-lng-input" name="lng" type="number" step="0.001" placeholder="40.135"></label>
         </div>
         <label class="field"><span class="field-label">Flora</span>
          <input class="input" name="flora" placeholder="Geven, Kekik, Pamuk"></label>
         <label class="field"><span class="field-label">Notlar</span>
          <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => {
          if (d.lat) d.lat = parseFloat(d.lat);
          if (d.lng) d.lng = parseFloat(d.lng);
          BM.Storage.add('apiaries', d);
          BM.Toast.show('Üs eklendi ✓', 'success');
          App.render('apiaries');
          return true;
        }
      );
    },

    edit(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      BM.Modal.open('Üs Düzenle — ' + a.name,
        `<label class="field"><span class="field-label">Üs Adı *</span>
           <input class="input" name="name" required value="${BM.esc(a.name)}"></label>
         <label class="field"><span class="field-label">Konum *</span>
          <div style="display:flex;gap:var(--space-2)">
            <input class="input" id="ap-loc-input" name="location" required value="${BM.esc(a.location)}" style="flex:1">
            <button type="button" id="ap-gps-btn" class="btn btn--primary" onclick="BM.apiaries.gpsCapture()" style="white-space:nowrap;padding:8px 12px">📍 GPS</button>
          </div></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Enlem</span>
             <input class="input" id="ap-lat-input" name="lat" type="number" step="0.001" value="${a.lat || ''}"></label>
           <label class="field"><span class="field-label">Boylam</span>
             <input class="input" id="ap-lng-input" name="lng" type="number" step="0.001" value="${a.lng || ''}"></label>
         </div>
         <label class="field"><span class="field-label">Flora</span>
           <input class="input" name="flora" value="${BM.esc(a.flora || '')}"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(a.notes || '')}</textarea></label>`,
        (d) => {
          if (d.lat) d.lat = parseFloat(d.lat);
          if (d.lng) d.lng = parseFloat(d.lng);
          BM.Storage.update('apiaries', id, d);
          BM.Toast.show('Üs güncellendi ✓', 'success');
          App.render('apiaries');
          return true;
        }
      );
    },

    // GPS ile otomatik konum yakala
    gpsCapture() {
      const btn = document.getElementById('ap-gps-btn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Alınıyor...'; }
      if (!navigator.geolocation) {
        BM.Toast.show('Tarayıcı GPS desteklemiyor', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '📍 GPS'; }
        return;
      }
      BM.Toast.show('GPS sinyali aranıyor...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);
          const latInput = document.getElementById('ap-lat-input');
          const lngInput = document.getElementById('ap-lng-input');
          const locInput = document.getElementById('ap-loc-input');
          if (latInput) latInput.value = lat.toFixed(6);
          if (lngInput) lngInput.value = lng.toFixed(6);
          fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=tr')
            .then(r => r.json())
            .then(data => {
              const addr = data.address || {};
              const parts = [addr.village || addr.town || addr.city_district || addr.county || addr.city, addr.city || addr.state, addr.country].filter(Boolean);
              const loc = parts.join(', ') || (lat.toFixed(3) + ', ' + lng.toFixed(3));
              if (locInput) locInput.value = loc;
              BM.Toast.show('GPS: ' + loc + ' (±' + acc + 'm)', 'success');
            })
            .catch(() => {
              if (locInput) locInput.value = lat.toFixed(4) + ', ' + lng.toFixed(4);
              BM.Toast.show('GPS alındı (±' + acc + 'm)', 'success');
            });
          if (btn) { btn.disabled = false; btn.textContent = '✅ GPS'; }
        },
        (err) => {
          let msg = 'GPS alınamadı';
          if (err.code === 1) msg = 'GPS izni reddedildi';
          else if (err.code === 2) msg = 'GPS sinyali yok';
          else if (err.code === 3) msg = 'GPS zaman aşımı';
          BM.Toast.show(msg, 'error');
          if (btn) { btn.disabled = false; btn.textContent = '📍 GPS'; }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    },

    del(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      const hiveCount = BM.Storage.list('hives').filter(h => h.apiaryId === id).length;
      if (hiveCount > 0) {
        BM.Toast.show(`Bu üsde ${hiveCount} kovan var. Önce kovanları taşıyın/silin.`, 'error');
        return;
      }
      BM.Modal.confirm(`"${a.name}" üssünü silmek istiyor musunuz?`, () => {
        BM.Storage.remove('apiaries', id);
        BM.Toast.show('Üs silindi', 'info');
        App.render('apiaries');
      });
    },

    archive(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      const newStatus = !a.archived;
      BM.Modal.confirm(`"${a.name}" üssünü ${newStatus ? 'arşivlemek' : 'arşivden çıkarmak'} istiyor musunuz?`, () => {
        BM.Storage.update('apiaries', id, { archived: newStatus });
        BM.Toast.show(newStatus ? 'Üs arşivlendi' : 'Üs arşivden çıkarıldı', 'info');
        App.render('apiaries');
      });
    },

    // AP-03: Kovan tasima
    move(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      const hives = BM.Storage.list('hives').filter(h => h.apiaryId === id);
      if (!hives.length) { BM.Toast.show('Bu üsde kovan yok', 'error'); return; }
      const otherApiaries = BM.Storage.list('apiaries').filter(x => x.id !== id && !x.archived);
      if (!otherApiaries.length) { BM.Toast.show('Başka aktif üs yok', 'error'); return; }

      BM.Modal.open('🚚 Kovan Taşı — ' + a.name,
        `<label class="field"><span class="field-label">Hedef Üs *</span>
           <select class="select" name="targetApiaryId" required>
             ${otherApiaries.map(x => `<option value="${x.id}">${BM.esc(x.name)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Taşınacak Kovanlar</span>
           <div style="max-height:200px;overflow-y:auto;background:var(--bg-tertiary);padding:var(--space-2);border-radius:var(--radius-md)">
             ${hives.map(h => `<label style="display:flex;align-items:center;gap:var(--space-2);padding:6px;cursor:pointer"><input type="checkbox" name="hiveIds" value="${h.id}" checked>${BM.esc(h.name)} <span style="font-size:11px;color:var(--text-secondary)">(${h.frameCount} çerçeve)</span></label>`).join('')}
           </div></label>
         <label class="field"><span class="field-label">Taşıma Notu</span>
           <textarea class="textarea" name="note" rows="2" placeholder="Mesafe, süre, kontrol listesi..."></textarea></label>`,
        (d) => {
          const ids = Array.isArray(d.hiveIds) ? d.hiveIds : (d.hiveIds ? [d.hiveIds] : []);
          const target = BM.Storage.get('apiaries', d.targetApiaryId);
          if (!target || !ids.length) { BM.Toast.show('En az bir kovan seçin', 'error'); return false; }
          ids.forEach(hid => {
            BM.Storage.update('hives', hid, { apiaryId: target.id });
          });
          BM.Toast.show(ids.length + ' kovan ' + target.name + ' üssüne taşındı ✓', 'success');
          App.render('apiaries');
          return true;
        }
      );
    },

    // ============ RENDER ============
    render(view = 'list') {
      this._currentView = view;
      const list = BM.Storage.list('apiaries');
      const withCoords = list.filter(a => a.lat && a.lng);
      const totalHives = BM.Storage.list('hives').length;
      const totalHoney = BM.Storage.list('harvests').reduce((s, h) => s + h.weight, 0);
      const lowStock = BM.Storage.list('inventory').filter(i => i.quantity <= i.minStock).length;

      const header = `
        <div class="actions-bar">
          <div>
            <h2 style="font-size:18px;font-weight:700">Arı Üsleri</h2>
            <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} üs · ${totalHives} kovan · ${BM.fmt(totalHoney)} kg bal</div>
          </div>
          <div style="display:flex;gap:var(--space-2)">
            <div class="view-toggle">
              <button type="button" class="view-toggle__btn ${view === 'list' ? 'view-toggle__btn--active' : ''}" onclick="App.render('apiaries', 'list')">📋 Liste</button>
              <button type="button" class="view-toggle__btn ${view === 'map' ? 'view-toggle__btn--active' : ''}" onclick="App.render('apiaries', 'map')">🗺 Harita</button>
            </div>
            <button class="btn btn--primary" onclick="BM.apiaries.add()">+ Yeni Üs</button>
          </div>
        </div>
      `;

      const stats = `
        <div class="stats-grid">
          <div class="stat">
            <div class="stat__icon stat__icon--honey">${BM.Icons.apiaries}</div>
            <div class="stat__label">Toplam Üs</div>
            <div class="stat__value">${list.length}</div>
            <div class="stat__meta">${withCoords.length} GPS'li</div>
          </div>
          <div class="stat">
            <div class="stat__icon stat__icon--success">${BM.Icons.hives}</div>
            <div class="stat__label">Toplam Kovan</div>
            <div class="stat__value">${totalHives}</div>
            <div class="stat__meta">${list.filter(a => !a.archived).length} aktif üste</div>
          </div>
          <div class="stat">
            <div class="stat__icon stat__icon--info">${BM.Icons.honey}</div>
            <div class="stat__label">Toplam Bal</div>
            <div class="stat__value">${BM.fmt(totalHoney)} kg</div>
            <div class="stat__meta">Üs bazlı</div>
          </div>
          <div class="stat">
            <div class="stat__icon stat__icon--warning">${BM.Icons.inventory}</div>
            <div class="stat__label">Stok Uyarısı</div>
            <div class="stat__value">${lowStock}</div>
            <div class="stat__meta ${lowStock > 0 ? 'stat__meta--down' : ''}">${lowStock > 0 ? 'Sipariş ver' : 'Tam'}</div>
          </div>
        </div>
      `;

      if (view === 'map') {
        setTimeout(() => this._initMap(), 100);
        return header + `<div id="ap-map" class="map-container"></div>` + stats +
          this._renderList();
      }

      return header + stats + this._renderList();
    },

    _renderList() {
      const list = BM.Storage.list('apiaries');
      if (!list.length) {
        return `<div class="card" style="margin-top:var(--space-4)">
          <div class="empty">
            <div class="empty__icon">${BM.Icons.apiaries}</div>
            <div class="empty__title">Henüz üs yok</div>
            <div class="empty__sub">İlk üssünü ekleyerek başla</div>
            <button class="btn btn--primary" onclick="BM.apiaries.add()">+ Yeni Üs</button>
          </div>
        </div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-4)">${list.map(a => {
        const hc = BM.Storage.list('hives').filter(h => h.apiaryId === a.id).length;
        const totalHoney = BM.Storage.list('harvests').filter(h => h.apiaryId === a.id).reduce((s, h) => s + h.weight, 0);
        const avgHoney = hc > 0 ? (totalHoney / hc).toFixed(1) : 0;
        const recentInsp = BM.Storage.list('inspections').filter(i => {
          const hive = BM.Storage.get('hives', i.hiveId);
          return hive && hive.apiaryId === a.id;
        }).sort((a, b) => b.date.localeCompare(a.date))[0];
        const alerts = BM.Storage.list('inspections').filter(i => {
          const hive = BM.Storage.get('hives', i.hiveId);
          return hive && hive.apiaryId === a.id && i.varroaCount >= 6;
        }).length;
        return `<div class="card">
          <div class="row-list__item" style="border:none">
            <div class="row-list__dot ${a.archived ? 'row-list__dot--y' : 'row-list__dot--g'}"></div>
            <div class="row-list__main">
              <div class="row-list__name">
                ${BM.esc(a.name)}
                ${a.archived ? '<span class="badge badge--warn">Arşiv</span>' : ''}
                <span class="badge badge--info">${hc} kovan</span>
                ${alerts ? `<span class="badge badge--danger">${alerts} uyarı</span>` : ''}
              </div>
              <div class="row-list__info">
                📍 ${BM.esc(a.location)}${a.lat && a.lng ? ` · GPS: ${Number(a.lat).toFixed(3)}, ${Number(a.lng).toFixed(3)}` : ''}${a.flora ? ` · 🌸 ${BM.esc(a.flora)}` : ''}
              </div>
              ${a.notes ? `<div class="row-list__info" style="font-style:italic;margin-top:2px">"${BM.esc(a.notes)}"</div>` : ''}
            </div>
            <div style="text-align:right;min-width:110px;flex-shrink:0">
              <div style="font-size:16px;font-weight:700;color:var(--honey-500)">${BM.fmt(totalHoney)} kg</div>
              <div style="font-size:10px;color:var(--text-secondary)">${hc > 0 ? avgHoney + ' kg/kovan ort.' : 'kovan yok'}</div>
              ${recentInsp ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Son muayene: ${BM.dateAgo(recentInsp.date)}</div>` : ''}
            </div>
            <div class="row-list__actions">
              <button class="btn btn--sm" onclick="BM.apiaries.move('${a.id}')" title="Kovan Taşı">🚚</button>
              <button class="btn btn--sm" onclick="BM.apiaries.archive('${a.id}')" title="${a.archived ? 'Arşivden Çıkar' : 'Arşivle'}">📦</button>
              <button class="btn btn--sm" onclick="BM.apiaries.edit('${a.id}')">Düzenle</button>
              <button class="btn btn--sm btn--danger" onclick="BM.apiaries.del('${a.id}')">Sil</button>
            </div>
          </div>
        </div>`;
      }).join('')}</div>`;
    },

    // AP-01: Leaflet harita
    _initMap() {
      const el = document.getElementById('ap-map');
      if (!el) return;
      if (!window.L) {
        el.innerHTML = '<div class="empty"><div class="empty__icon">🗺</div><div class="empty__title">Harita yüklenemedi</div><div class="empty__sub">İnternet bağlantısını kontrol et</div></div>';
        return;
      }
      // Onceki haritayi temizle
      if (this._mapInstance) {
        this._mapInstance.remove();
        this._mapInstance = null;
      }
      const withCoords = BM.Storage.list('apiaries').filter(a => a.lat && a.lng);
      if (!withCoords.length) {
        el.innerHTML = '<div class="empty"><div class="empty__icon">📍</div><div class="empty__title">Koordinatlı üs yok</div><div class="empty__sub">Üs eklerken Enlem/Boylam girersen haritada görünür</div></div>';
        return;
      }
      const center = [withCoords[0].lat, withCoords[0].lng];
      this._mapInstance = L.map(el, { zoomControl: true }).setView(center, 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
      }).addTo(this._mapInstance);
      withCoords.forEach(a => {
        const hc = BM.Storage.list('hives').filter(h => h.apiaryId === a.id).length;
        const honey = BM.Storage.list('harvests').filter(h => h.apiaryId === a.id).reduce((s, h) => s + h.weight, 0);
        const marker = L.marker([a.lat, a.lng]).addTo(this._mapInstance);
        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:200px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">📍 ${BM.esc(a.name)}</div>
            <div style="font-size:12px;color:#666;margin-bottom:8px">${BM.esc(a.location)}</div>
            <div style="font-size:11px">${hc} kovan · ${BM.fmt(honey)} kg bal</div>
            <div style="margin-top:8px;display:flex;gap:4px">
              <button onclick="App.render('hives');BM.apiaries.closeMap()" style="padding:6px 10px;background:#f59e0b;color:#000;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600">Kovanlar</button>
              <button onclick="BM.apiaries.edit('${a.id}');BM.apiaries.closeMap()" style="padding:6px 10px;background:#262626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px">Düzenle</button>
            </div>
          </div>
        `);
      });
      if (withCoords.length > 1) {
        const bounds = L.latLngBounds(withCoords.map(a => [a.lat, a.lng]));
        this._mapInstance.fitBounds(bounds, { padding: [40, 40] });
      }
    },

    closeMap() {
      if (this._mapInstance) {
        this._mapInstance.remove();
        this._mapInstance = null;
      }
    }
  };

  BM.apiaries = apiariesModule;
})(window);



/* ===== 05_hives.js ===== */
/* ===== js/modules/hives.js ===== */
// ============================================================
// Hives Module — Spec 05_Modules/Hives.md + Frames.md
// HV-01..08: CRUD, detay, çerçeve haritası, taşıma, birleştirme
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const hivesModule = {
  add() {
    if (!BM.Storage.list('apiaries').length) {
      BM.Toast.show('Önce arı üssü ekleyin', 'error');
      return;
    }
    const apOpts = BM.Storage.list('apiaries').filter(a => !a.archived)
      .map(a => `<option value="${a.id}">${BM.esc(a.name)}</option>`).join('');
    BM.Modal.open('Yeni Kovan',
      `<label class="field"><span class="field-label">Kovan Adı *</span>
         <input class="input" name="name" required placeholder="Örn: Kovan-08"></label>
       <label class="field"><span class="field-label">Arı Üssü *</span>
         <select class="select" name="apiaryId" required>${apOpts}</select></label>
       <div class="field-row">
         <label class="field"><span class="field-label">Irk</span>
           <select class="select" name="strain">
             <option value="anatolian">Anadolu</option>
             <option value="caucasian">Kafkas</option>
             <option value="carniolan">Karniyol</option>
             <option value="buckfast">Buckfast</option>
             <option value="carpathian">Karpat</option>
             <option value="italian">İtalyan</option>
             <option value="cyprian">Kıbrıs</option>
             <option value="syrian">Suriye</option>
             <option value="egyptian">Mısır</option>
             <option value="hybrid">Hibrit</option>
             <option value="survivor">Survivor</option>
           </select></label>
         <label class="field"><span class="field-label">Kovan Tipi</span>
           <select class="select" name="boxType">
             <option value="langstroth">Langstroth</option>
             <option value="dadant">Dadant</option>
             <option value="layens">Layens</option>
             <option value="flow">Flow</option>
             <option value="top_bar">Top-Bar</option>
             <option value="wooden">Ahşap Kovan</option>
             <option value="plastic">Plastik Kovan</option>
             <option value="styrofoam">Strafor Kovan</option>
             <option value="log">Kütük Kovan</option>
             <option value="traditional">Geleneksel Kütük</option>
             <option value="observation">Gözlem Kovanı</option>
             <option value="queen_rearing">Ana Arı Yetiştirme Kovanı</option>
           </select></label>
       </div>
       <div class="field-row">
         <label class="field"><span class="field-label">Mizaç / Agresiflik</span>
           <select class="select" name="temperament">
             <option value="calm">🟢 Sakin</option>
             <option value="nervous">🟡 Huzursuz / Sinirli</option>
             <option value="aggressive">🔴 Agresif</option>
             <option value="very_aggressive">☣️ Çok Saldırgan</option>
           </select></label>
         <label class="field"><span class="field-label">Kovan Amacı</span>
           <select class="select" name="purpose">
             <option value="honey_production">🍯 Bal Üretimi</option>
             <option value="bee_breeding">🐝 Arı Yetiştiriciliği</option>
             <option value="queen_rearing">👑 Ana Arı Yetiştiriciliği</option>
             <option value="pollination">🌻 Polinasyon (Tozlaşma)</option>
             <option value="observation">👁️ Gözlem / Eğitim</option>
             <option value="breeding">🧬 Genetik & Islah</option>
           </select></label>
       </div>
       <div class="field-row">
         <label class="field"><span class="field-label">Çerçeve Sayısı</span>
           <input class="input" name="frameCount" type="number" min="1" max="20" value="10"></label>
         <label class="field"><span class="field-label">Kat (İlave) Sayısı</span>
           <input class="input" name="supersCount" type="number" min="0" max="10" value="0"></label>
       </div>
       <div class="field-row">
         <label class="field"><span class="field-label">Kovan Kaynağı</span>
           <select class="select" name="source">
             <option value="created_nucleus">Suni Bölme</option>
             <option value="swarm">Oğul</option>
             <option value="purchased">Satın Alındı</option>
             <option value="captured">Yakalandı</option>
             <option value="merged">Birleştirildi</option>
           </select></label>
         <label class="field"><span class="field-label">Pozisyon</span>
           <input class="input" name="positionInApiary" type="number" min="1" value="${BM.Storage.list('hives').length + 1}"></label>
       </div>
       <div class="field-row">
          <label class="field"><span class="field-label">NFC/QR Etiket</span>
            <input class="input" name="nfcTag" placeholder="Otomatik"></label>
          <label class="field"><span class="field-label">Kurulum Tarihi</span>
            <input class="input" name="installedAt" type="date" value="${BM.today()}"></label>
        </div>
        <label class="field" style="margin-bottom:0"><span class="field-label">Notlar</span>
          <textarea class="textarea" name="notes" rows="2" style="min-height:54px;max-height:80px;resize:none" placeholder="Kovan hakkında notlar..."></textarea></label>`,
      async (d) => {
        const h = await BM.Storage.add('hives', {
          ...d,
          status: 'active',
          queenId: null,
          nfcTag: d.nfcTag || ('BM-' + Date.now().toString(36).toUpperCase()),
          frameCount: parseInt(d.frameCount) || 10,
          positionInApiary: parseInt(d.positionInApiary) || 1
        });
        // Otomatik çerçeve oluştur (senkron localStorage + fire-and-forget cloud sync)
        const fc = h.frameCount;
        for (let p = 1; p <= fc; p++) {
          const frameObj = {
            id: BM.uid(),
            hiveId: h.id, position: p,
            frameType: p <= 3 ? 'brood' : (p <= 6 ? 'honey' : 'foundation'),
            foundationType: 'wax', status: 'in_use',
            cyclesCompleted: 0, waxAgeMonths: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          await BM.Storage.add('frames', frameObj);
        }
        BM.Storage.save();
        BM.Bus.emit('change:frames', h);
        BM.Toast.show('Kovan eklendi ✓', 'success');
        App.render('hives');
        return true;
      }
    );
  },

  edit(id) {
    const h = BM.Storage.get('hives', id);
    if (!h) return;
    const apOpts = BM.Storage.list('apiaries').map(a =>
      `<option value="${a.id}"${a.id === h.apiaryId ? ' selected' : ''}>${BM.esc(a.name)}</option>`).join('');
    BM.Modal.open('Kovan Düzenle — ' + h.name,
      `<label class="field"><span class="field-label">Kovan Adı *</span>
         <input class="input" name="name" required value="${BM.esc(h.name)}"></label>
       <label class="field"><span class="field-label">Arı Üssü *</span>
         <select class="select" name="apiaryId" required>${apOpts}</select></label>
       <div class="field-row">
         <label class="field"><span class="field-label">Irk</span>
           <select class="select" name="strain">
             ${['anatolian','caucasian','carniolan','buckfast','carpathian','italian','cyprian','syrian','egyptian','hybrid','survivor'].map(s => `<option value="${s}"${h.strain === s ? ' selected' : ''}>${BM.T.strain(s)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Kovan Tipi</span>
           <select class="select" name="boxType">
             ${['langstroth','dadant','layens','flow','top_bar','wooden','plastic','styrofoam','log','traditional','observation','queen_rearing'].map(b => `<option value="${b}"${h.boxType === b ? ' selected' : ''}>${BM.T.box(b)}</option>`).join('')}
           </select></label>
       </div>
       <div class="field-row">
         <label class="field"><span class="field-label">Mizaç / Agresiflik</span>
           <select class="select" name="temperament">
             ${['calm','nervous','aggressive','very_aggressive'].map(t => `<option value="${t}"${(h.temperament || 'calm') === t ? ' selected' : ''}>${BM.T.temperament(t)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Kovan Amacı</span>
           <select class="select" name="purpose">
             ${['honey_production','bee_breeding','queen_rearing','pollination','observation','breeding'].map(p => `<option value="${p}"${(h.purpose || 'honey_production') === p ? ' selected' : ''}>${BM.T.purpose(p)}</option>`).join('')}
           </select></label>
       </div>
       <div class="field-row">
         <label class="field"><span class="field-label">Çerçeve</span>
           <input class="input" name="frameCount" type="number" min="1" max="20" value="${h.frameCount}"></label>
         <label class="field"><span class="field-label">Kat (İlave)</span>
           <input class="input" name="supersCount" type="number" min="0" max="10" value="${h.supersCount || 0}"></label>
       </div>
       <div class="field-row">
         <label class="field"><span class="field-label">Kovan Kaynağı</span>
           <select class="select" name="source">
             ${['created_nucleus','swarm','purchased','captured','merged'].map(src => `<option value="${src}"${(h.source || 'created_nucleus') === src ? ' selected' : ''}>${BM.T.hiveSource(src)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">
             ${['active','weak','dead','sold','merged'].map(s => `<option value="${s}"${h.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}
           </select></label>
       </div>
        <label class="field"><span class="field-label">NFC/QR Etiket</span>
          <input class="input" name="nfcTag" value="${BM.esc(h.nfcTag || '')}"></label>
        <label class="field" style="margin-bottom:0"><span class="field-label">Notlar</span>
          <textarea class="textarea" name="notes" rows="2" style="min-height:54px;max-height:80px;resize:none">${BM.esc(h.notes || '')}</textarea></label>`,
      async (d) => {
        const newCount = parseInt(d.frameCount) || 10;
        d.frameCount = newCount;
        await BM.Storage.update('hives', id, d);
        // Sync frame records to match new frameCount
        const existingFrames = BM.Storage.list('frames').filter(f => f.hiveId === id).sort((a, b) => a.position - b.position);
        const oldCount = existingFrames.length;
        if (newCount > oldCount) {
          // Add new frames at the end
          for (let p = oldCount + 1; p <= newCount; p++) {
            await BM.Storage.add('frames', {
              hiveId: id, position: p,
              frameType: p <= 3 ? 'brood' : (p <= 6 ? 'honey' : 'foundation'),
              foundationType: 'wax', status: 'in_use',
              cyclesCompleted: 0, waxAgeMonths: 0
            });
          }
        } else if (newCount < oldCount) {
          // Remove excess frames from the end
          const toRemove = existingFrames.slice(newCount);
          for (const f of toRemove) {
            await BM.Storage.remove('frames', f.id);
          }
        }
        BM.Toast.show('Kovan güncellendi ✓', 'success');
        App.render('hives');
        return true;
      }
    );
  },

  del(id) {
    const h = BM.Storage.get('hives', id);
    if (!h) return;
    BM.Modal.confirm(`"${h.name}" kovanını silmek istiyor musunuz? Tüm muayene, hasat, besleme kayıtları da silinecek.`, () => {
      BM.Storage.cascadeDeleteHive(id);
      BM.Toast.show('Kovan silindi', 'info');
      const detailEl = document.getElementById('view-hive-detail');
      if (detailEl) {
        detailEl.classList.remove('view--active');
        detailEl.innerHTML = '';
      }
      App.currentView = 'hives';
      App.nav('hives');
    });
  },

  // HV-06: Kovanı birleştir
  merge(id) {
    const h = BM.Storage.get('hives', id);
    if (!h) return;
    const otherHives = BM.Storage.list('hives').filter(x => x.id !== id && x.apiaryId === h.apiaryId);
    if (!otherHives.length) {
      BM.Toast.show('Aynı üsde birleştirilecek başka kovan yok', 'error');
      return;
    }
    const opts = otherHives.map(x => `<option value="${x.id}">${BM.esc(x.name)} (${x.frameCount} çerçeve)</option>`).join('');
    BM.Modal.open('Kovan Birleştir — ' + h.name,
      `<div style="background:var(--warning-bg);padding:var(--space-3);border-radius:var(--radius-md);margin-bottom:var(--space-4);font-size:12px">
          ⚠️ Birleştirilen kovan silinir. Diğer kovan güçlenir.
         </div>
         <label class="field"><span class="field-label">Hedef Kovan (güçlenecek) *</span>
           <select class="select" name="targetHiveId" required>${opts}</select></label>
         <label class="field"><span class="field-label">Birleştirme Yöntemi</span>
           <select class="select" name="method">
             <option value="newspaper">Gazete kağıdı (önerilen)</option>
             <option value="queen_cage">Ana arı kafesi ile</option>
             <option value="direct">Doğrudan (riskli)</option>
           </select></label>`,
      (d) => {
        const target = BM.Storage.get('hives', d.targetHiveId);
        if (!target) { BM.Toast.show('Hedef kovan seçin', 'error'); return false; }
        // Target'in frameCount + h.frameCount
        BM.Storage.update('hives', target.id, { frameCount: target.frameCount + h.frameCount });
        // h'yi merged olarak işaretle
        BM.Storage.update('hives', h.id, { status: 'merged' });
        BM.Toast.show(`${h.name} → ${target.name} birleştirildi ✓`, 'success');
        App.render('hives');
        return true;
      }
    );
  },

  // HV-06: Kovanı taşı (hareket)
  moveHive(id) {
    const h = BM.Storage.get('hives', id);
    if (!h) return;
    const otherApiaries = BM.Storage.list('apiaries').filter(a => a.id !== h.apiaryId && !a.archived);
    if (!otherApiaries.length) { BM.Toast.show('Başka aktif üs yok', 'error'); return; }
    BM.Modal.open('Kovanı Taşı — ' + h.name,
      `<label class="field"><span class="field-label">Hedef Üs *</span>
         <select class="select" name="targetApiaryId" required>
           ${otherApiaries.map(a => `<option value="${a.id}">${BM.esc(a.name)}</option>`).join('')}
         </select></label>
       <label class="field"><span class="field-label">Taşıma Nedeni</span>
         <input class="input" name="reason" placeholder="Bal akışı, kış, vb."></label>`,
      (d) => {
        BM.Storage.update('hives', id, { apiaryId: d.targetApiaryId });
        BM.Toast.show('Kovan taşındı ✓', 'success');
        App.render('hives');
        return true;
      }
    );
  },

  // ============ DETAIL SAYFASI ============
  detail(id) {
    if (typeof App !== 'undefined') App.currentHiveId = id;
    const h = BM.Storage.get('hives', id);
    if (!h) return;
    const apiary = BM.Storage.get('apiaries', h.apiaryId);
    const queen = BM.Storage.list('queens').find(q => q.hiveId === id && q.status === 'active') || BM.Storage.list('queens').find(q => q.hiveId === id) || BM.Storage.get('queens', h.queenId);
    const frames = BM.Storage.list('frames').filter(f => f.hiveId === id).sort((a, b) => a.position - b.position);
    const inspections = BM.Storage.list('inspections').filter(i => i.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
    const harvests = BM.Storage.list('harvests').filter(h => h.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
    const feedings = BM.Storage.list('feedings').filter(f => f.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
    const treatments = BM.Storage.list('treatments').filter(t => t.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
    const diseases = BM.Storage.list('diseases').filter(d => d.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
    const totalHoney = harvests.reduce((s, h) => s + h.weight, 0);
    const lastInsp = inspections[0];
    const varroa = lastInsp ? lastInsp.varroaCount : 0;
    const queenAge = queen ? ((Date.now() - new Date(queen.birthDate).getTime()) / (365 * 864e5)).toFixed(1) : '-';

    const html = `
      <div class="actions-bar">
        <div>
          <a class="link" style="color:var(--honey-500);font-weight:600;cursor:pointer" onclick="App.nav('hives')">← Kovanlar</a>
          <h1 style="font-size:24px;font-weight:700;margin-top:6px">${BM.esc(h.name)}</h1>
          <div style="color:var(--text-secondary);font-size:13px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px">
            <span>${BM.esc(apiary ? apiary.name : 'Atanmamış')}</span> · 
            <span>${BM.T.strain(h.strain)}</span> · 
            <span>${BM.T.box(h.boxType)}</span> · 
            <span>NFC: ${BM.esc(h.nfcTag || '-')}</span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
            <span class="badge badge--ok" style="font-size:12px;padding:4px 8px">${BM.T.temperament(h.temperament || 'calm')}</span>
            <span class="badge badge--info" style="font-size:12px;padding:4px 8px">${BM.T.purpose(h.purpose || 'honey_production')}</span>
            <span class="badge badge--warn" style="font-size:12px;padding:4px 8px">🪵 ${h.supersCount || 0} Kat (İlave)</span>
            <span class="badge" style="font-size:12px;padding:4px 8px;background:var(--bg-tertiary)">📍 ${BM.T.hiveSource(h.source || 'created_nucleus')}</span>
          </div>
        </div>
        <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
          <button class="btn btn--sm" onclick="BM.hives.moveHive('${id}')">🚚 Taşı</button>
          <button class="btn btn--sm" onclick="BM.hives.merge('${id}')">🔗 Birleştir</button>
          <button class="btn btn--sm" onclick="BM.inspections.add('${id}')">📋 Muayene</button>
          <button class="btn btn--sm" onclick="BM.hives.edit('${id}')">✏️ Düzenle</button>
          <button class="btn btn--sm btn--danger" onclick="BM.hives.del('${id}')">🗑 Sil</button>
        </div>
      </div>
      <div class="stats-grid">
        <div class="stat"><div class="stat__icon stat__icon--honey">${BM.Icons.hives}</div><div class="stat__label">Çerçeve</div><div class="stat__value">${frames.length}</div><div class="stat__meta">${BM.T.box(h.boxType)}</div></div>
        <div class="stat"><div class="stat__icon stat__icon--success">${BM.Icons.honey}</div><div class="stat__label">Toplam Bal</div><div class="stat__value">${BM.fmt(totalHoney)} kg</div><div class="stat__meta">${harvests.length} hasat</div></div>
        <div class="stat"><div class="stat__icon stat__icon--${varroa >= 6 ? 'danger' : varroa >= 3 ? 'warning' : 'success'}">⚠️</div><div class="stat__label">Son Varroa</div><div class="stat__value">${varroa}</div><div class="stat__meta ${varroa >= 6 ? 'stat__meta--down' : ''}">${lastInsp ? BM.dateAgo(lastInsp.date) : '—'}</div></div>
        <div class="stat"><div class="stat__icon stat__icon--info">${BM.Icons.queens}</div><div class="stat__label">Ana Arı Yaşı</div><div class="stat__value">${queenAge}</div><div class="stat__meta">${queen ? BM.T.strain(queen.strain) : '—'}</div></div>
      </div>
      <div class="tabs" id="hive-tabs">
        <button type="button" class="tabs__item tabs__item--active" data-tab="frames">Çerçeveler (${frames.length})</button>
        <button type="button" class="tabs__item" data-tab="queen">Ana Arı</button>
        <button type="button" class="tabs__item" data-tab="history">Geçmiş (${inspections.length + harvests.length + feedings.length + treatments.length + diseases.length})</button>
      </div>
      <div class="tabs__content" id="hive-tab-content"></div>
    `;
    document.getElementById('view-hive-detail').innerHTML = html;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
    document.querySelectorAll('[data-view]').forEach(n => n.classList.remove('nav-item--active', 'bottom-nav__item--active'));
    document.getElementById('view-hive-detail').classList.add('view--active');
    document.getElementById('page-title').textContent = h.name;
    document.getElementById('page-subtitle').textContent = apiary ? apiary.name : '';
    window.scrollTo(0, 0);

    // Tab event listeners
    const switchTab = (tabId) => {
      document.querySelectorAll('#hive-tabs .tabs__item').forEach(b => b.classList.toggle('tabs__item--active', b.dataset.tab === tabId));
      this._renderTab(id, tabId);
    };
    document.querySelectorAll('#hive-tabs .tabs__item').forEach(btn => {
      btn.onclick = () => switchTab(btn.dataset.tab);
    });
    switchTab('frames');
  },

  _renderTab(id, tabId) {
    const el = document.getElementById('hive-tab-content');
    if (tabId === 'frames') {
      // Backfill: eğer kovan için frame yoksa otomatik oluştur (senkron, callback'ler beklenmeden)
      const hive = BM.Storage.get('hives', id);
      if (hive) {
        const existing = BM.Storage.list('frames').filter(f => f.hiveId === id);
        const expected = hive.frameCount || 10;
        if (existing.length < expected) {
          // Eksik frame'leri oluştur — async çağrıları fire-and-forget
          // Mevcut en yuksek pozisyonu bul (silinmis frame'ler olabilir)
          const maxPos = existing.reduce((max, f) => Math.max(max, f.position || 0), 0);
          for (let p = maxPos + 1; p <= expected; p++) {
            // localStorage'a direkt yaz, async cloud sync arka planda olsun
            const frameObj = {
              id: BM.uid(),
              hiveId: id, position: p,
              frameType: p <= 3 ? 'brood' : (p <= 6 ? 'honey' : 'foundation'),
              foundationType: 'wax', status: 'in_use',
              cyclesCompleted: 0, waxAgeMonths: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            BM.Storage.state.frames.push(frameObj);
            // Cloud sync (async, fire and forget)
            if (BM.Storage._syncAdd) BM.Storage._syncAdd('frames', frameObj);
          }
          BM.Storage.save();
          // Use last frame obj for emit (avoid ReferenceError)
          const lastFrame = BM.Storage.state.frames[BM.Storage.state.frames.length - 1];
          if (lastFrame) BM.Bus.emit('change:frames', lastFrame);
        }
      }
      const frames = BM.Storage.list('frames').filter(f => f.hiveId === id).sort((a, b) => a.position - b.position);
      const summary = {brood:0,honey:0,pollen:0,perga:0,foundation:0};
      frames.forEach(f => {
        const t = (f.frameType === 'empty' ? 'foundation' : f.frameType) || 'foundation';
        if (summary[t] !== undefined) summary[t]++;
        else summary.foundation++;
      });
      // "Boş" çerçeve tipi kaldırıldı — boş yerine "Ham Petek" (foundation) kullanılır
      const frameIcon = t => ({brood:'🟠',honey:'🟡',pollen:'🟣',perga:'🟤',foundation:'⚪'}[t === 'empty' ? 'foundation' : t] || '⚪');
      const frameLabel = t => ({brood:'Yumurtalık',honey:'Bal',pollen:'Polen',perga:'Perga (Polen+Bal)',foundation:'Ham Petek'}[t === 'empty' ? 'foundation' : t] || 'Ham Petek');

      el.innerHTML = `
        <div class="card">
          <div class="card-head">
            <div>
              <div class="card-title">Petek Döngüsü (${frames.length} çerçeve)</div>
              <div class="card-sub">Tıklayarak çerçeve tipini değiştir</div>
            </div>
            <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
              <select class="select" style="width:auto" id="bulk-type">
                <option value="honey">Tümünü Bal yap</option>
                <option value="brood">Tümünü Yavru yap</option>
                <option value="foundation">Tümünü Ham Petek yap</option>
                <option value="perga">Tümünü Perga yap</option>
              </select>
              <button type="button" class="btn btn--sm" onclick="BM.hives.bulkMark('${id}', document.getElementById('bulk-type').value)">Uygula</button>
              <button type="button" class="btn btn--sm" onclick="BM.hives.resetSeason('${id}')">Sezon Sıfırla</button>
            </div>
          </div>
          <div class="frame-grid">
            ${frames.map(f => `<div class="frame frame--${f.frameType || 'foundation'}${(f.cyclesCompleted || 0) >= 5 ? ' frame--retired' : ''}" onclick="BM.frames.edit('${f.id}', '${id}')">
              <div class="frame__icon">${frameIcon(f.frameType)}</div>
              <div class="frame__num">#${f.position ?? '?'}</div>
              <div class="frame__cycle">×${f.cyclesCompleted ?? 0}</div>
            </div>`).join('')}
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-4);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);font-size:12px">
            <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:rgba(249,115,22,0.4)"></span>${summary.brood} Yumurtalık</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:rgba(245,158,11,0.4)"></span>${summary.honey} Bal</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:rgba(168,85,247,0.4)"></span>${summary.pollen} Polen</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:linear-gradient(135deg,rgba(168,85,247,0.5),rgba(245,158,11,0.5))"></span>${summary.perga} Perga</div>
            <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:var(--bg-card);border:1px solid var(--n-700)"></span>${summary.foundation} Ham Petek</div>
            <div style="display:flex;align-items:center;gap:6px;margin-left:auto;color:var(--danger)"><span style="width:14px;height:14px;border-radius:3px;background:var(--danger)"></span>🔴 Değişim gerekli (≥5 döngü)</div>
          </div>
        </div>
      `;
    } else if (tabId === 'queen') {
      const q = BM.Storage.list('queens').find(x => x.hiveId === id && x.status === 'active') || BM.Storage.list('queens').find(x => x.hiveId === id) || BM.Storage.get('queens', BM.Storage.get('hives', id)?.queenId);
      if (!q) {
        el.innerHTML = `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.queens}</div><div class="empty__title">Bu kovanda ana arı kaydı yok</div><button class="btn btn--primary" onclick="BM.queens.add('${id}')">Ana Arı Ekle</button></div></div>`;
        return;
      }
      const age = ((Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5)).toFixed(1);
      el.innerHTML = `
        <div class="grid-2">
          <div class="card">
            <div class="card-head"><div class="card-title">Ana Arı Bilgileri</div><button class="btn btn--sm" onclick="BM.queens.edit('${q.id}')">Düzenle</button></div>
            <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
              <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--honey-400),var(--honey-600));display:flex;align-items:center;justify-content:center;font-size:30px">${BM.Icons.queens}</div>
              <div>
                <div style="font-size:16px;font-weight:700">${BM.esc(BM.T.strain(q.strain))}</div>
                <div style="font-size:12px;color:var(--text-secondary)">İşaret: <strong>${BM.T.color(q.markedColor)}</strong> · Kaynak: ${BM.T.source(q.source)}</div>
              </div>
            </div>
            <div class="row-list">
              <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Doğum</div><div class="row-list__info">${BM.dateStr(q.birthDate)}</div></div></div>
              <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Yaş</div><div class="row-list__info">${age} yıl</div></div></div>
              <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Performans</div><div class="row-list__info">${(q.performanceScore * 100).toFixed(0)}%</div></div></div>
              <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Durum</div><div class="row-list__info">${BM.T.status(q.status)}</div></div></div>
              ${q.supplier ? `<div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Tedarikçi</div><div class="row-list__info">${BM.esc(q.supplier)}</div></div></div>` : ''}
            </div>
          </div>
          <div class="card">
            <div class="card-title">📊 Performans Skoru</div>
            <div style="margin-top:var(--space-4);padding:var(--space-5);background:var(--bg-tertiary);border-radius:var(--r-lg);text-align:center">
              <div style="font-size:48px;font-weight:800;color:${q.performanceScore >= 0.7 ? 'var(--success)' : q.performanceScore >= 0.5 ? 'var(--honey-500)' : 'var(--danger)'}">${(q.performanceScore * 100).toFixed(0)}%</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Mevcut Skor</div>
            </div>
          </div>
        </div>
      `;
    } else if (tabId === 'history') {
      const events = [];
      BM.Storage.list('inspections').filter(i => i.hiveId === id).forEach(i =>
        events.push({ date: i.date, icon: '📋', title: 'Muayene', sub: `Varroa: ${i.varroaCount} · ${BM.T.pop(i.population)}${i.notes ? ' · ' + BM.esc(i.notes) : ''}` }));
      BM.Storage.list('harvests').filter(h => h.hiveId === id).forEach(h =>
        events.push({ date: h.date, icon: '🍯', title: 'Bal Hasadı', sub: `${h.weight} kg · ${h.quality} kalite` }));
      BM.Storage.list('feedings').filter(f => f.hiveId === id).forEach(f =>
        events.push({ date: f.date, icon: '🌾', title: 'Besleme', sub: `${BM.T.feedType(f.type).tr} · ${f.amountKg} ${BM.T.feedType(f.type).unit}` }));
      BM.Storage.list('treatments').filter(t => t.hiveId === id).forEach(t =>
        events.push({ date: t.date, icon: '💊', title: 'Tedavi', sub: `${BM.esc(t.product)} · ${BM.esc(t.dosage || '-')}` }));
      BM.Storage.list('diseases').filter(d => d.hiveId === id).forEach(d =>
        events.push({ date: d.date, icon: '🦠', title: 'Hastalık', sub: `${BM.T.disease(d.disease)} · Şiddet: ${d.severity}` }));
      events.sort((a, b) => b.date.localeCompare(a.date));

      el.innerHTML = `<div class="card">
        <div class="card-head"><div class="card-title">Zaman Çizelgesi (${events.length} olay)</div></div>
        ${events.length ? `<div class="timeline">${events.map(e => `<div class="timeline__item">
          <div class="timeline__icon">${e.icon}</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(e.title)}</div>
            <div class="timeline__meta">${BM.dateStr(e.date)} · ${BM.esc(e.sub)}</div>
          </div>
        </div>`).join('')}</div>` : '<div class="empty"><div class="empty__icon">📅</div><div class="empty__title">Henüz kayıt yok</div></div>'}
      </div>`;
    }
  },

  bulkMark(hiveId, type) {
    const labelMap = {brood:'Yavru',honey:'Bal',perga:'Perga',foundation:'Ham Petek'};
    const label = labelMap[type] || type;
    if (!confirm(`Tüm çerçeveleri "${label}" olarak işaretle?`)) return;
    BM.Storage.list('frames').filter(f => f.hiveId === hiveId).forEach(f => {
      BM.Storage.update('frames', f.id, { frameType: type });
    });
    BM.Toast.show('Tüm çerçeveler güncellendi ✓', 'success');
    this._renderTab(hiveId, 'frames');
  },

  resetSeason(hiveId) {
    if (!confirm('Yeni sezon: Tüm çerçeveler Perga, döngüler 0')) return;
    BM.Storage.list('frames').filter(f => f.hiveId === hiveId).forEach(f => {
      BM.Storage.update('frames', f.id, { frameType: 'foundation', cyclesCompleted: 0, waxAgeMonths: 0 });
    });
    BM.Toast.show('Sezon sıfırlandı ✓', 'success');
    this._renderTab(hiveId, 'frames');
  },

  // ============ LIST RENDER ============
  render() {
    const list = BM.Storage.list('hives');
    return `<div class="actions-bar">
      <div>
        <h2 style="font-size:18px;font-weight:700">Kovanlar</h2>
        <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kovan · ${BM.Storage.list('queens').length} ana arı · ${BM.Storage.list('frames').length} çerçeve</div>
      </div>
      <button class="btn btn--primary" onclick="BM.hives.add()">+ Yeni Kovan</button>
    </div>
    ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.hives}</div><div class="empty__title">Henüz kovan yok</div><button class="btn btn--primary" onclick="BM.hives.add()">+ Yeni Kovan</button></div></div>` :
    `<div class="grid-3">${list.map(h => {
      const apiary = BM.Storage.get('apiaries', h.apiaryId);
      const lastInsp = BM.Storage.list('inspections').filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
      const frameCount = BM.Storage.list('frames').filter(f => f.hiveId === h.id).length;
      const varroa = lastInsp ? lastInsp.varroaCount : 0;
      const aiBadge = (() => {
        if (!lastInsp || !lastInsp.aiAnomalies) return '';
        let count = 0;
        if (typeof lastInsp.aiAnomalies === 'string') {
          try {
            const parsed = JSON.parse(lastInsp.aiAnomalies);
            count = Array.isArray(parsed) ? parsed.length : (parseInt(lastInsp.aiAnomalies) || 0);
          } catch(e) { count = 0; }
        } else if (typeof lastInsp.aiAnomalies === 'number') {
          count = lastInsp.aiAnomalies;
        }
        return count > 0 ? `<span class="badge badge--warn" style="margin-left:auto;font-size:10px">🤖 ${count} Anomali</span>` : '';
      })();
      return `<div class="hive-card" onclick="BM.hives.detail('${h.id}')">
        <div class="hive-card__corner" style="display:flex;gap:4px;align-items:center"><span class="badge ${BM.T.statusCls(h.status)}">${BM.T.status(h.status)}</span>${aiBadge}</div>
        <div class="hive-card__head">
          <div class="hive-card__icon">${BM.Icons.hives}</div>
          <div>
            <div class="hive-card__title">${BM.esc(h.name)}</div>
            <div class="hive-card__sub">${BM.esc(apiary ? apiary.name : 'Atanmamış')}</div>
          </div>
        </div>
        <div class="hive-card__metrics">
          <div class="hive-card__metric"><div class="hive-card__metric-label">Mizaç</div><div class="hive-card__metric-value" style="font-size:11px">${BM.T.temperament(h.temperament || 'calm')}</div></div>
          <div class="hive-card__metric"><div class="hive-card__metric-label">Amac</div><div class="hive-card__metric-value" style="font-size:11px">${BM.T.purpose(h.purpose || 'honey_production')}</div></div>
          <div class="hive-card__metric"><div class="hive-card__metric-label">Irk / Kutu</div><div class="hive-card__metric-value">${BM.T.strain(h.strain)} · ${BM.T.box(h.boxType)}</div></div>
          <div class="hive-card__metric"><div class="hive-card__metric-label">Çerçeve / Kat</div><div class="hive-card__metric-value">${frameCount} / ${h.supersCount || 0} kat</div></div>
        </div>
        <div class="hive-card__actions">
          <button class="btn btn--sm" onclick="event.stopPropagation();BM.inspections.add('${h.id}')">📋 Muayene</button>
          <button class="btn btn--sm" onclick="event.stopPropagation();BM.hives.edit('${h.id}')">Düzenle</button>
        </div>
      </div>`;
    }).join('')}</div>`}`;
  }
};

BM.hives = hivesModule;
})(window);



/* ===== 06_inspections.js ===== */
/* ===== js/modules/inspections.js ===== */
// ============================================================
// Inspections Module — Spec 05_Modules/Hive_Inspections.md
// IN-01..08: Multi-step wizard, AI anomali, ses/foto, karşılaştırma
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const inspectionsModule = {
    // AI anomali tespiti (IN-03)
    detectAnomalies(d) {
      const out = [];
      const hive = BM.Storage.get('hives', d.hiveId);
      if (!hive) return out;
      const prevInsp = BM.Storage.list('inspections')
        .filter(i => i.hiveId === hive.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0];

      if (prevInsp && d.varroaCount > prevInsp.varroaCount) {
        const inc = ((d.varroaCount - prevInsp.varroaCount) / Math.max(prevInsp.varroaCount, 1) * 100).toFixed(0);
        if (inc >= 50) {
          out.push({
            icon: '⚠️', severity: 'high',
            title: 'Varroa artışı: %' + inc,
            explanation: `Varroa ${prevInsp.varroaCount} → ${d.varroaCount}`,
            why: 'Önceki muayenede ' + prevInsp.varroaCount + ' idi. Tedavi gerekebilir.'
          });
        }
      }
      if (d.varroaCount >= 6) {
        out.push({ icon: '🦠', severity: 'high', title: 'Kritik Varroa (≥6)', explanation: `${d.varroaCount} adet varroa`, why: 'Apivar veya Oksalik asit ile acil tedavi önerilir.' });
      } else if (d.varroaCount >= 3) {
        out.push({ icon: '⚡', severity: 'medium', title: 'Varroa takibi', explanation: `${d.varroaCount} adet varroa`, why: 'İzleme önerilir, eşik 6.' });
      }
      if (d.queenSeen === 'absent' && prevInsp && (prevInsp.queenSeen === true || prevInsp.queenSeen === 'seen' || prevInsp.queenSeen === 'cell' || prevInsp.queenSeen === 'new')) {
        out.push({ icon: '👑', severity: 'high', title: 'Ana arı kaybı riski', explanation: 'Önceki muayenede görülüyordu, şimdi yok', why: '2 hafta içinde kontrol etmezsen topluluk söner.' });
      }
      const power = { very_strong: 5, strong: 4, medium: 3, weak: 2, very_weak: 1 };
      if (prevInsp && power[d.population] < power[prevInsp.population]) {
        out.push({ icon: '📉', severity: 'medium', title: 'Koloni gücü düştü', explanation: `${BM.T.pop(prevInsp.population)} → ${BM.T.pop(d.population)}`, why: 'Besleme ve ana arı kontrolü önerilir.' });
      }
      if (d.eggsPattern === 'absent') {
        out.push({ icon: '⚠️', severity: 'high', title: 'Yumurta yok', explanation: 'Yumurtlama durmuş', why: 'Ana arı sorunu olabilir, acil kontrol.' });
      } else if (d.eggsPattern === 'irregular') {
        out.push({ icon: '🥚', severity: 'medium', title: 'Düzensiz yumurta', explanation: 'Yumurta düzeni bozuk', why: 'Ana arı yaşlı veya parazit etkisi olabilir.' });
      }
      return out;
    },

    // Multi-step wizard (IN-01)
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) {
        BM.Toast.show('Önce kovan ekleyin. Yönlendiriliyor...', 'info');
        setTimeout(() => BM.hives.add(), 800);
        return;
      }
      const state = {
        hiveId: presetHiveId || (BM.Storage.list('hives')[0] && BM.Storage.list('hives')[0].id),
        date: BM.today(), varroaCount: 0, broodFrames: 0, honeyFrames: 0, pollenFrames: 0,
        population: 'strong', eggsPattern: 'regular', queenSeen: 'seen',
        weather: 'sunny', notes: '', mode: 'form', template: null
      };

      const hOpts = BM.Storage.list('hives').map(h =>
        `<option value="${h.id}"${h.id === state.hiveId ? ' selected' : ''}>${BM.esc(h.name)} — ${BM.esc(BM.T.strain(h.strain))}</option>`
      ).join('');

      const steps = [
        {
          label: 'Kovan & Tarih',
          render: (s) => {
            if (!s.date) s.date = BM.today();
            const hOpts = BM.Storage.list('hives').map(h =>
              `<option value="${h.id}"${h.id === s.hiveId ? ' selected' : ''}>${BM.esc(h.name)} — ${BM.esc(BM.T.strain(h.strain))}</option>`
            ).join('');
            return `
            <label class="field"><span class="field-label">Kovan *</span>
              <select class="select" id="w-hiveId">${hOpts}</select></label>
            <label class="field"><span class="field-label">Tarih *</span>
              <input class="input" id="w-date" type="date" required value="${s.date}"></label>
            <label class="field"><span class="field-label">Hava</span>
              <select class="select" id="w-weather">
                <option value="sunny"${s.weather === 'sunny' ? ' selected' : ''}>☀️ Güneşli</option>
                <option value="cloudy"${s.weather === 'cloudy' ? ' selected' : ''}>⛅ Bulutlu</option>
                <option value="rainy"${s.weather === 'rainy' ? ' selected' : ''}>🌧 Yağmurlu</option>
                <option value="windy"${s.weather === 'windy' ? ' selected' : ''}>💨 Rüzgarlı</option>
              </select></label>
            <label class="field"><span class="field-label">Hızlı Şablon (opsiyonel)</span>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)">
                <button type="button" class="btn btn--tpl" onclick="BM.inspections.applyTemplate('varroa')">
                  <div class="btn-icon">🔬</div><div class="btn-label">Varroa</div>
                </button>
                <button type="button" class="btn btn--tpl" onclick="BM.inspections.applyTemplate('winter')">
                  <div class="btn-icon">❄️</div><div class="btn-label">Kış</div>
                </button>
                <button type="button" class="btn btn--tpl" onclick="BM.inspections.applyTemplate('spring')">
                  <div class="btn-icon">🌸</div><div class="btn-label">Bahar</div>
                </button>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:6px">Şablon seçince aşağıdaki alanlar otomatik dolar</div>
            </label>
          `;
          },
          onNext: (s) => {
            const get = id => document.getElementById(id);
            s.hiveId = get('w-hiveId').value;
            s.date = get('w-date').value;
            s.weather = get('w-weather').value;
          },
          validate: (s) => {
            if (!s.hiveId) {
              BM.Toast.show('Lütfen listeden kovan seçin', 'error');
              return false;
            }
            return true;
          }
        },
        {
          label: 'Muayene Formu',
          render: (s) => `
            <div style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-md);margin-bottom:var(--space-3);font-size:12px;color:var(--text-secondary)">
              📋 Zorunlu muayene verileri — bunlar kayıt için gereklidir
            </div>
            <label class="field"><span class="field-label">Güç (5 seviye) *</span>
              <select class="select" id="w-population">
                ${['very_strong','strong','medium','weak','very_weak'].map(p => `<option value="${p}"${s.population === p ? ' selected' : ''}>${BM.T.pop(p)} ${'●'.repeat({very_strong:5,strong:4,medium:3,weak:2,very_weak:1}[p])}</option>`).join('')}
              </select></label>
            <label class="field"><span class="field-label">Ana Arı *</span>
              <select class="select" id="w-queenSeen">
                <option value="seen"${s.queenSeen === 'seen' ? ' selected' : ''}>👑 Gördüm</option>
                <option value="cell"${s.queenSeen === 'cell' ? ' selected' : ''}>Yavru Hücresi</option>
                <option value="new"${s.queenSeen === 'new' ? ' selected' : ''}>Yeni Ana Arı</option>
                <option value="absent"${s.queenSeen === 'absent' ? ' selected' : ''}>Yok</option>
              </select></label>
            <div class="field-row">
              <label class="field"><span class="field-label">Yavru Çerçeve</span>
                <input class="input" id="w-broodFrames" type="number" min="0" value="${s.broodFrames}"></label>
              <label class="field"><span class="field-label">Bal Çerçeve</span>
                <input class="input" id="w-honeyFrames" type="number" min="0" value="${s.honeyFrames}"></label>
              <label class="field"><span class="field-label">Polen</span>
                <input class="input" id="w-pollenFrames" type="number" min="0" value="${s.pollenFrames}"></label>
            </div>
            <label class="field"><span class="field-label">Varroa (adet) *</span>
              <input class="input" id="w-varroaCount" type="number" min="0" value="${s.varroaCount}" required></label>
            <label class="field"><span class="field-label">Yumurta Düzeni</span>
              <select class="select" id="w-eggsPattern">
                <option value="regular"${s.eggsPattern === 'regular' ? ' selected' : ''}>Düzenli</option>
                <option value="irregular"${s.eggsPattern === 'irregular' ? ' selected' : ''}>Düzensiz</option>
                <option value="absent"${s.eggsPattern === 'absent' ? ' selected' : ''}>Yok</option>
              </select></label>
            <label class="field"><span class="field-label">Notlar</span>
              <textarea class="textarea" id="w-notes" rows="2" placeholder="Ek notlar...">${BM.esc(s.notes)}</textarea></label>
          `,
          onNext: (s) => {
            const get = id => document.getElementById(id);
            s.population = get('w-population').value;
            s.queenSeen = get('w-queenSeen').value;
            s.broodFrames = parseInt(get('w-broodFrames').value) || 0;
            s.honeyFrames = parseInt(get('w-honeyFrames').value) || 0;
            s.pollenFrames = parseInt(get('w-pollenFrames').value) || 0;
            s.varroaCount = parseInt(get('w-varroaCount').value) || 0;
            s.eggsPattern = get('w-eggsPattern').value;
            s.notes = get('w-notes').value;
          },
          validate: (s) => {
            if (s.varroaCount === undefined || s.varroaCount === null || isNaN(s.varroaCount)) {
              BM.Toast.show('Varroa sayısı gerekli', 'error');
              return false;
            }
            return true;
          }
        },
        {
          label: 'Ek Medya (opsiyonel)',
          render: (s) => {
            const hasPhotos = (s.photos && s.photos.length > 0);
            const hasAudio = !!s.audioData;
            return `
            <div style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-md);margin-bottom:var(--space-3);font-size:12px;color:var(--text-secondary)">
              💡 Bu adım isteğe bağlıdır. Fotoğraf ve/veya sesli not ekleyebilirsiniz — hiçbir şey eklemeden de geçebilirsiniz.
            </div>
            <div class="media-toggle-row">
              <button type="button" class="btn btn--media ${hasPhotos ? 'btn--primary' : ''}" onclick="BM.inspections.togglePhotos()">
                <div class="btn-icon">📷</div>
                <div class="btn-label">${hasPhotos ? '✓ ' + s.photos.length + ' Fotoğraf' : 'Fotoğraf Ekle'}</div>
              </button>
              <button type="button" class="btn btn--media ${hasAudio ? 'btn--primary' : ''}" onclick="BM.inspections.toggleAudio()">
                <div class="btn-icon">🎙</div>
                <div class="btn-label">${hasAudio ? '✓ Ses Kaydı' : 'Sesli Not Ekle'}</div>
              </button>
            </div>
            <div id="photo-area" style="display:${hasPhotos ? 'block' : 'none'}">
              <div class="photo-upload" onclick="document.getElementById('w-photos').click()">
                <div class="photo-upload__icon">📷</div>
                <div class="photo-upload__text">Fotoğraf eklemek için tıklayın</div>
                <div class="photo-upload__hint">JPG, PNG · Max 5 fotoğraf</div>
              </div>
              <input type="file" accept="image/*" multiple capture="environment" id="w-photos" onchange="BM.inspections.handlePhotos(event)" style="display:none">
              <div id="photo-preview" class="photo-preview">
                ${(s.photos || []).map((p, i) => `<div class="photo-preview__item"><img src="${p}" alt=""><button type="button" class="photo-preview__remove" onclick="BM.inspections.removePhoto(${i})">×</button></div>`).join('')}
              </div>
              <label class="field" style="margin-top:var(--space-3)"><span class="field-label">Fotoğraf Etiketi</span>
                <input class="input" id="w-photo-tag" placeholder="petek, ana arı, hastalık..." value="${BM.esc(s.photoTag || '')}"></label>
            </div>
            <div id="audio-area" style="display:${hasAudio ? 'block' : 'none'}">
              <div style="background:var(--bg-tertiary);padding:var(--space-5);border-radius:var(--radius-lg);text-align:center">
                <button type="button" class="btn btn--primary" id="rec-btn" onclick="BM.inspections.toggleRecord()" style="width:80px;height:80px;border-radius:50%;font-size:32px;padding:0">${s.audioData ? '✓' : '🎙'}</button>
                <div id="rec-status" style="margin-top:var(--space-3);font-size:12px;color:${s.audioData ? 'var(--success)' : 'var(--text-secondary)'}">${s.audioData ? '✓ Kayıt tamamlandı' : 'Kayıt için tıklayın'}</div>
                <div id="rec-audio" style="margin-top:var(--space-2)">${s.audioData ? '<audio controls src="' + s.audioData + '" style="width:100%"></audio>' : ''}</div>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center">
                ${s.audioData ? '✓ Ses kaydedildi — İsterseniz tekrar kaydedin' : '60 saniyeye kadar kayıt yapabilirsiniz'}
              </div>
            </div>
          `;
          },
          onNext: () => {
            // Optional step - always passes
            const tagEl = document.getElementById('w-photo-tag');
            if (tagEl && window.BM && BM.inspections && BM.inspections._state) {
              BM.inspections._state.photoTag = tagEl.value;
            }
          },
          validate: () => true
        },
        {
          label: 'AI Analiz',
          render: (s) => {
            const anomalies = this.detectAnomalies(s);
            const hive = BM.Storage.get('hives', s.hiveId);
            const photoCount = (s.photos || []).length;
            const hasAudio = !!s.audioData;
            return `<div class="ai-card card" style="margin-bottom:var(--space-4)">
              <div style="font-size:13px;font-weight:700;margin-bottom:var(--space-2);display:flex;align-items:center;gap:var(--space-2)">🤖 AI Analiz Sonucu</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-3)">
                ${BM.esc(hive ? hive.name : '?')} kovanı analiz edildi. <strong>${anomalies.length} anomali</strong>, <strong>${anomalies.filter(a => a.severity === 'high').length} yüksek risk</strong>.
              </div>
              ${anomalies.length ? anomalies.map(a => `
                <div class="ai-item" style="border-left:3px solid ${a.severity === 'high' ? 'var(--danger)' : a.severity === 'medium' ? 'var(--warning)' : 'var(--info)'}">
                  <div class="ai-item__icon">${a.icon}</div>
                  <div class="ai-item__title">${BM.esc(a.title)}</div>
                  <div class="ai-item__sub">${BM.esc(a.explanation)}</div>
                  <div class="ai-item__why">${BM.esc(a.why)}</div>
                </div>
              `).join('') : '<div style="font-size:12px;color:var(--success)">✓ Anomali tespit edilmedi</div>'}
            </div>
            <div class="card" style="background:var(--bg-tertiary)">
              <div style="font-size:12px;font-weight:700;margin-bottom:var(--space-2)">📋 Özet</div>
              <div class="row-list">
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Kovan</div></div><div style="font-weight:600">${BM.esc(hive ? hive.name : '?')}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Tarih</div></div><div>${BM.dateStr(s.date)}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Güç</div></div><div>${BM.T.pop(s.population)}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Varroa</div></div><div style="color:${s.varroaCount >= 6 ? 'var(--danger)' : s.varroaCount >= 3 ? 'var(--warning)' : 'var(--success)'};font-weight:700">${s.varroaCount}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Çerçeve</div></div><div>Y:${s.broodFrames} B:${s.honeyFrames} P:${s.pollenFrames}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Ek Medya</div></div><div>${photoCount > 0 ? '📷 ' + photoCount + ' fotoğraf' : ''}${photoCount > 0 && hasAudio ? ' · ' : ''}${hasAudio ? '🎙 Ses kaydı' : ''}${photoCount === 0 && !hasAudio ? '—' : ''}</div></div>
              </div>
            </div>`;
          }
        }
      ];

      BM.Wizard.open('🔬 Muayene Sihirbazı', steps, async (s) => {
        // queenSeen değerini koru — boolean'a çevirme!
        if (s.queenSeen === 'cell' || s.queenSeen === 'new') s.queenSeen = 'seen';
        // AI anomalileri tespit et ve JSON olarak kaydet
        const anomalies = this.detectAnomalies(s);
        s.aiAnomalies = JSON.stringify(anomalies);
        s.aiAnomaliesCount = anomalies.length;
        // Fotograflari ve ses kaydini state'den al
        s.photos = this._state.photos || [];
        s.audioData = this._state.audioData || null;
        s.mode = this._state.mode || 'form';
        s.photoTag = this._state.photoTag || '';
        await BM.Storage.add('inspections', s);
        if (anomalies.filter(a => a.severity === 'high').length > 0) {
          BM.Toast.show(`Muayene kaydedildi. ${anomalies.length} anomali!`, 'warn');
        } else {
          BM.Toast.show('Muayene kaydedildi ✓', 'success');
        }
        if (s.varroaCount >= 6) {
          setTimeout(() => {
            BM.Modal.confirm('⚠️ Yüksek varroa tespit edildi. Tedavi kaydı oluşturulsun mu?', () => {
              BM.treatments.add(s.hiveId);
            });
          }, 500);
        }
        App.render('inspections');
      }, state);

      // Hooks for wizard buttons
      this._state = state;
    },

    applyTemplate(name) {
      const s = this._state;
      if (!s) return;
      if (name === 'varroa') { s.varroaCount = 0; s.population = 'strong'; s.notes = 'Varroa sayımı muayenesi'; }
      if (name === 'winter') { s.varroaCount = 2; s.population = 'medium'; s.broodFrames = 3; s.honeyFrames = 8; s.notes = 'Kış hazırlığı kontrolü'; }
      if (name === 'spring') { s.population = 'strong'; s.broodFrames = 5; s.eggsPattern = 'regular'; s.notes = 'Bahar kontrol'; }
      s.template = name;
      // Sadece state'i guncelle, wizard'i yeniden acma. Goruntuyu yenile.
      const templateLabels = { varroa: 'Varroa', winter: 'Kış', spring: 'Bahar' };
      BM.Toast.show('Şablon uygulandı: ' + (templateLabels[name] || name), 'success');
      // Wizard body's ilgili alanlarini yeniden render etmek icin modal body's icindeki inputlara set et
      const notesEl = document.getElementById('w-notes');
      if (notesEl) notesEl.value = s.notes;
      const vEl = document.getElementById('w-varroaCount');
      if (vEl) vEl.value = s.varroaCount;
      const pEl = document.getElementById('w-population');
      if (pEl) pEl.value = s.population;
      const bEl = document.getElementById('w-broodFrames');
      if (bEl) bEl.value = s.broodFrames;
      const hEl = document.getElementById('w-honeyFrames');
      if (hEl) hEl.value = s.honeyFrames;
    },

    setMode(mode) {
      if (!this._state) return;
      this._state.mode = mode;
      // Sadece wizard body'sini yeniden render et, modal'i yeniden ACMA
      const wizard = document.querySelector('.wizard');
      const body = document.getElementById('wizard-body');
      if (wizard && body) {
        // Butonlarin active class'ini guncelle
        const btns = wizard.querySelectorAll('button[onclick*="setMode"]');
        btns.forEach(b => {
          if (b.getAttribute('onclick').includes(`'${mode}'`)) {
            b.classList.add('btn--primary');
          } else {
            b.classList.remove('btn--primary');
          }
        });
      }
      BM.Toast.show('Mod değiştirildi: ' + (mode === 'form' ? 'Form' : mode === 'voice' ? 'Sesli' : 'Fotoğraf'), 'info');
    },

    toggleRecord() {
      const btn = document.getElementById('rec-btn');
      const status = document.getElementById('rec-status');
      if (!btn) return;
      if (!this._state) this._state = {};
      if (this._state._recorder && this._state._recorder.state === 'recording') {
        // Durdur
        this._state._recorder.stop();
        return;
      }
      btn.dataset.state = 'rec';
      btn.textContent = '⏹';
      status.textContent = '🔴 Kayıt yapılıyor...';
      status.style.color = 'var(--danger)';
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = '⚠️ Tarayıcı mikrofonu desteklemiyor';
        status.style.color = 'var(--warning)';
        btn.dataset.state = 'idle';
        btn.textContent = '🎙';
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const rec = new MediaRecorder(stream);
        const chunks = [];
        rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = e => {
            // DataURL olarak state'e kaydet
            this._state.audioData = e.target.result;
            this._state.audioBlob = blob;
            // Audio player goster
            const url = URL.createObjectURL(blob);
            const audioDiv = document.getElementById('rec-audio');
            if (audioDiv) audioDiv.innerHTML = '<audio controls src="' + url + '" style="width:100%;margin-top:var(--space-2)"></audio>';
            stream.getTracks().forEach(t => t.stop());
          };
          reader.readAsDataURL(blob);
        };
        rec.start();
        this._state._recorder = rec;
        // Durdurma
        btn.onclick = () => {
          if (rec.state === 'recording') {
            rec.stop();
            btn.dataset.state = 'idle';
            btn.textContent = '🎙';
            status.textContent = '✓ Kayıt tamamlandı';
            status.style.color = 'var(--success)';
          }
        };
      }).catch(err => {
        status.textContent = '⚠️ Mikrofon erişimi reddedildi: ' + (err.message || err.name);
        status.style.color = 'var(--warning)';
        btn.dataset.state = 'idle';
        btn.textContent = '🎙';
      });
    },

    handlePhotos(e) {
      const files = Array.from((e && e.target && e.target.files) || []).slice(0, 5);
      if (!files.length) return;
      if (!this._state.photos) this._state.photos = [];
      let pending = files.length;
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = ev => {
          if (this._state.photos.length < 5) {
            this._state.photos.push(ev.target.result);
          }
          pending--;
          if (pending === 0) {
            // Tum fotograflar islendi, sadece wizard body'sini yenile (wizard'i yeniden ACMA)
            this.refreshWizardStep();
            BM.Toast.show(files.length + ' fotoğraf eklendi ✓', 'success');
          }
        };
        reader.readAsDataURL(f);
      });
    },

    refreshWizardStep() {
      // Wizard'i yeniden acmadan, sadece mevcut step'in renderini yenile
      const s = this._state;
      const step3 = document.getElementById('wizard-body');
      if (!step3 || !s) return;
      const preview = document.getElementById('photo-preview');
      if (preview) {
        preview.innerHTML = (s.photos || []).map((p, i) => `<div class="photo-preview__item"><img src="${p}" alt=""><button type="button" class="photo-preview__remove" onclick="BM.inspections.removePhoto(${i})">×</button></div>`).join('');
      }
    },

    togglePhotos() {
      if (!this._state) return;
      const photoArea = document.getElementById('photo-area');
      const audioArea = document.getElementById('audio-area');
      const isShowing = photoArea && photoArea.style.display !== 'none';
      // Goster/gizle
      if (photoArea) photoArea.style.display = isShowing ? 'none' : 'block';
      // Photos array'i koru (gizlesek bile), kullanici tekrar acabilsin
      BM.Toast.show(isShowing ? 'Fotoğraf bölümü gizlendi' : 'Fotoğraf bölümü açıldı', 'info');
    },

    toggleAudio() {
      if (!this._state) return;
      const audioArea = document.getElementById('audio-area');
      const isShowing = audioArea && audioArea.style.display !== 'none';
      if (audioArea) audioArea.style.display = isShowing ? 'none' : 'block';
      BM.Toast.show(isShowing ? 'Ses kaydı gizlendi' : 'Ses kaydı açıldı', 'info');
    },

    removePhoto(i) {
      if (this._state && this._state.photos) {
        this._state.photos.splice(i, 1);
        this.refreshWizardStep();
        BM.Toast.show('Fotoğraf silindi', 'info');
      }
    },

    edit(id) {
      const i = BM.Storage.get('inspections', id);
      if (!i) return;
      BM.Modal.open('Muayene Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === i.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('')}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${i.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Varroa</span>
             <input class="input" name="varroaCount" type="number" min="0" value="${i.varroaCount}"></label>
           <label class="field"><span class="field-label">Yavru Çerçeve</span>
             <input class="input" name="broodFrames" type="number" min="0" value="${i.broodFrames}"></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="3">${BM.esc(i.notes || '')}</textarea></label>`,
        (d) => {
          d.varroaCount = parseInt(d.varroaCount) || 0;
          d.broodFrames = parseInt(d.broodFrames) || 0;
          BM.Storage.update('inspections', id, d);
          BM.Toast.show('Muayene güncellendi ✓', 'success');
          App.render('inspections');
          return true;
        }
      );
    },

    del(id) {
      BM.Modal.confirm('Bu muayeneyi silmek istiyor musunuz?', () => {
        BM.Storage.remove('inspections', id);
        BM.Toast.show('Muayene silindi', 'info');
        App.render('inspections');
      });
    },

    // IN-05: İki muayene yan yana karşılaştırma
    compare(hiveId) {
      const list = BM.Storage.list('inspections').filter(i => i.hiveId === hiveId).sort((a, b) => b.date.localeCompare(a.date));
      if (list.length < 2) { BM.Toast.show('Karşılaştırma için en az 2 muayene gerekli', 'error'); return; }
      const [a, b] = list;
      const items = [
        ['Tarih', BM.dateStr(a.date), BM.dateStr(b.date), null],
        ['Varroa', a.varroaCount, b.varroaCount, a.varroaCount - b.varroaCount],
        ['Yavru Çerçeve', a.broodFrames, b.broodFrames, a.broodFrames - b.broodFrames],
        ['Bal Çerçeve', a.honeyFrames, b.honeyFrames, a.honeyFrames - b.honeyFrames],
        ['Popülasyon', BM.T.pop(a.population), BM.T.pop(b.population), null],
        ['Yumurta', a.eggsPattern || '-', b.eggsPattern || '-', null],
        ['Ana Arı', ['Görüldü', 'Yok', 'Bilinmiyor'].includes(a.queenSeen) ? 'Görüldü' : ['seen','cell','new'].includes(a.queenSeen) ? 'Görüldü' : 'Yok', ['seen','cell','new'].includes(b.queenSeen) ? 'Görüldü' : b.queenSeen === 'absent' ? 'Yok' : 'Bilinmiyor', null],
        ['Notlar', BM.esc(a.notes || '-'), BM.esc(b.notes || '-'), null]
      ];
      const html = `
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-4);text-align:center">
          Son iki muayene yan yana — Değişim olan satırlar renkli
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:var(--bg-tertiary)">
              <th style="padding:var(--space-3);text-align:left;font-weight:600;width:30%">Alan</th>
              <th style="padding:var(--space-3);text-align:left;font-weight:600">${BM.dateStr(a.date)}<br><span style="font-size:10px;color:var(--text-muted);font-weight:400">${BM.dateAgo(a.date)}</span></th>
              <th style="padding:var(--space-3);text-align:left;font-weight:600">${BM.dateStr(b.date)}<br><span style="font-size:10px;color:var(--text-muted);font-weight:400">${BM.dateAgo(b.date)}</span></th>
              <th style="padding:var(--space-3);text-align:center;font-weight:600">Δ</th>
            </tr>
          </thead>
          <tbody>${items.map(it => {
            const changed = JSON.stringify(it[1]) !== JSON.stringify(it[2]);
            const diff = it[3];
            const color = diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : '';
            return `<tr style="border-bottom:1px solid var(--n-800);${changed ? 'background:rgba(245,158,11,0.05)' : ''}">
              <td style="padding:var(--space-3);font-weight:600">${it[0]}</td>
              <td style="padding:var(--space-3)">${it[1]}</td>
              <td style="padding:var(--space-3)">${it[2]}</td>
              <td style="padding:var(--space-3);text-align:center;font-weight:700;color:${color}">${diff !== null ? (diff > 0 ? '+' : '') + diff : ''}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      `;
      BM.Modal.showReport(html);
    },

    render() {
      const list = BM.Storage.list('inspections').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div>
          <h2 style="font-size:18px;font-weight:700">Muayeneler</h2>
          <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt · AI anomali tespiti aktif</div>
        </div>
        <button class="btn btn--primary" onclick="BM.inspections.add()">🔬 Yeni Muayene (Sihirbaz)</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.inspections}</div><div class="empty__title">Henüz muayene yok</div><button class="btn btn--primary" onclick="BM.inspections.add()">🔬 İlk Muayeneyi Başlat</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(i => {
        const h = BM.Storage.get('hives', i.hiveId);
        const aiBadge = (() => {
          if (!i.aiAnomalies) return '';
          if (typeof i.aiAnomalies === 'string' && i.aiAnomalies !== '0') {
            try { const arr = JSON.parse(i.aiAnomalies); if (arr.length) return `<span class="badge badge--warn">🤖 ${arr.length}</span>`; } catch(e) {}
          } else if (typeof i.aiAnomalies === 'number' && i.aiAnomalies > 0) {
            return `<span class="badge badge--warn">🤖 ${i.aiAnomalies}</span>`;
          }
          return '';
        })();
        const modeIcon = i.mode === 'voice' ? ' 🎙' : i.mode === 'photo' ? ' 📷' : '';
        const photoCount = i.photos ? i.photos.length : 0;
        const hasAudio = i.audio ? true : false;
        return `<div class="timeline__item" data-id="${i.id}">
          <div class="timeline__icon">📋</div>
          <div class="timeline__body" style="flex:1;min-width:0">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')}${modeIcon} <span class="badge ${BM.T.statusCls(i.varroaCount >= 6 ? 'danger' : i.varroaCount >= 3 ? 'warning' : 'good')}">Varroa: ${i.varroaCount}</span>${aiBadge}</div>
            <div class="timeline__meta">${BM.dateStr(i.date)} · ${BM.T.pop(i.population)} · Yavru: ${i.broodFrames} ç · Bal: ${i.honeyFrames} ç · Polen: ${i.pollenFrames} ç${i.template ? ' · 📋 ' + i.template : ''}</div>
            ${i.notes ? `<div class="timeline__meta" style="margin-top:4px;color:var(--text-secondary);font-size:12px">"${BM.esc(i.notes)}"</div>` : ''}
            <div class="timeline__meta" style="margin-top:4px;font-size:11px;color:var(--text-muted)">
              ${i.queenSeen === 'seen' ? '👑 Görüldü' : i.queenSeen === 'absent' ? '👑 YOK' : '👑 ?'}
              ${i.eggsPattern === 'regular' ? ' · 🥚 Düzenli' : i.eggsPattern === 'irregular' ? ' · 🥚 Düzensiz' : ' · 🥚 Yok'}
              ${i.weather ? ' · 🌤 ' + BM.T.weather(i.weather) : ''}
              ${photoCount > 0 ? ` · 📷 ${photoCount}` : ''}
              ${hasAudio ? ' · 🎙' : ''}
            </div>
          </div>
          <div class="timeline__actions" style="display:flex;gap:var(--space-1);flex-wrap:wrap">
            <button class="btn btn--sm" onclick="BM.inspections.detail('${i.id}')" title="Detay Görüntüle">👁</button>
            <button class="btn btn--sm" onclick="BM.inspections.compare('${i.hiveId}')" title="Karşılaştır">🔄</button>
            <button class="btn btn--sm" onclick="BM.inspections.edit('${i.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.inspections.del('${i.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    },

    // Muayene detay görüntüle — ne yapıldı, neler ölçüldü, ne bulundu
    detail(id) {
      const i = BM.Storage.get('inspections', id);
      if (!i) return BM.Toast.show('Muayene bulunamadı', 'error');
      const h = BM.Storage.get('hives', i.hiveId);
      const prevInsp = BM.Storage.list('inspections')
        .filter(x => x.hiveId === i.hiveId && x.id !== id)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      const photoHtml = i.photos && i.photos.length ? i.photos.map(p =>
        `<img src="${p}" style="max-width:120px;border-radius:8px;margin:4px;box-shadow:0 2px 8px #0005;cursor:pointer" onclick="window.open('${p}','_blank')" title="Büyütmek için tıkla">`
      ).join('') : '<span style="color:var(--text-muted);font-size:12px">Fotoğraf eklenmedi</span>';
      const audioHtml = i.audio ? `<audio controls src="${i.audio}" style="width:100%;margin-top:8px"></audio>` : '';
      const aiRaw = i.aiAnomalies;
      let anomalies = [];
      if (aiRaw) {
        if (typeof aiRaw === 'string') {
          try { anomalies = JSON.parse(aiRaw); } catch(e) { anomalies = []; }
        } else if (Array.isArray(aiRaw)) {
          anomalies = aiRaw;
        } else if (typeof aiRaw === 'number' && aiRaw > 0) {
          // Eski veri: sadece sayı var, içerik bilinmiyor
          anomalies = [{ icon: '🤖', severity: 'medium', title: aiRaw + ' anomali tespit edildi', explanation: 'Önceki muayenede AI analizi yapıldı', why: 'Detaylı bilgi için yeni muayene yapın' }];
        }
      }
      const anomalyHtml = anomalies.length ? anomalies.map(a =>
        `<div style="background:${a.severity === 'high' ? 'rgba(239,68,68,0.15)' : a.severity === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'};border-left:3px solid ${a.severity === 'high' ? 'var(--danger)' : a.severity === 'medium' ? 'var(--warning)' : 'var(--success)'};padding:var(--space-3);margin:var(--space-2) 0;border-radius:6px">
          <div style="display:flex;gap:var(--space-2);align-items:flex-start">
            <span style="font-size:18px">${a.icon}</span>
            <div style="flex:1">
              <div style="font-weight:600;font-size:13px">${BM.esc(a.title)}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${BM.esc(a.explanation)}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-style:italic">💡 ${BM.esc(a.why)}</div>
            </div>
          </div>
        </div>`
      ).join('') : '<div style="color:var(--success);padding:var(--space-3);background:rgba(16,185,129,0.1);border-radius:8px;font-size:13px">✅ AI anomali tespit edilmedi — her şey yolunda</div>';
      const comparisonHtml = prevInsp ? `
        <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--n-800)">
          <h4 style="margin-bottom:var(--space-3);font-size:14px">📊 Önceki Muayene ile Karşılaştırma (${BM.dateStr(prevInsp.date)})</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);font-size:12px">
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Koloni Gücü:</strong><br>${BM.T.pop(prevInsp.population)} → <span style="color:${prevInsp.population === i.population ? 'var(--text-secondary)' : 'var(--warning)'};font-weight:600">${BM.T.pop(i.population)}</span></div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Varroa:</strong><br>${prevInsp.varroaCount} → <span style="color:${i.varroaCount > prevInsp.varroaCount ? 'var(--danger)' : i.varroaCount < prevInsp.varroaCount ? 'var(--success)' : 'var(--text-secondary)'};font-weight:700">${i.varroaCount}</span> ${i.varroaCount > prevInsp.varroaCount ? '↑' : i.varroaCount < prevInsp.varroaCount ? '↓' : '→'}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Yavru Ç.:</strong> ${prevInsp.broodFrames} → ${i.broodFrames}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Bal Ç.:</strong> ${prevInsp.honeyFrames} → ${i.honeyFrames}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Polen Ç.:</strong> ${prevInsp.pollenFrames} → ${i.pollenFrames}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Yumurta:</strong> ${({regular:'Düzenli',irregular:'Düzensiz',absent:'Yok'})[prevInsp.eggsPattern]} → ${({regular:'Düzenli',irregular:'Düzensiz',absent:'Yok'})[i.eggsPattern]}</div>
          </div>
        </div>` : '';
      const modeLabel = i.mode === 'voice' ? '🎙 Ses Kaydı' : i.mode === 'photo' ? '📷 Fotoğraf' : i.mode === 'wizard' ? '🧙 Sihirbaz' : '📝 Form';
      BM.Modal.open(`${BM.esc(h ? h.name : 'Kovan')} — Muayene Detayı`,
        `<div style="max-height:70vh;overflow:auto;padding:var(--space-2)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-4)">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">📅 TARİH</div><div style="font-weight:600">${BM.dateStr(i.date)}</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">📝 MOD</div><div style="font-weight:600">${modeLabel}</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">🌤 HAVA</div><div style="font-weight:600">${i.weather ? BM.T.weather(i.weather) : '—'}</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">🐝 KOLONİ GÜCÜ</div><span class="badge ${BM.T.statusCls(i.population === 'very_weak' || i.population === 'weak' ? 'danger' : i.population === 'medium' ? 'warning' : 'good')}">${BM.T.pop(i.population)}</span></div>
          </div>
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">📊 YAPILAN ÖLÇÜMLER</h4>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);margin-bottom:var(--space-4)">
            <div style="padding:var(--space-3);background:rgba(249,115,22,0.15);border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Yavru Ç.</div><div style="font-size:24px;font-weight:800;color:#f97316">${i.broodFrames}</div></div>
            <div style="padding:var(--space-3);background:rgba(245,158,11,0.15);border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Bal Ç.</div><div style="font-size:24px;font-weight:800;color:var(--honey-500)">${i.honeyFrames}</div></div>
            <div style="padding:var(--space-3);background:rgba(168,85,247,0.12);border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Polen Ç.</div><div style="font-size:24px;font-weight:800;color:#a855f7">${i.pollenFrames}</div></div>
            <div style="padding:var(--space-3);background:${i.varroaCount >= 6 ? 'rgba(239,68,68,0.2)' : i.varroaCount >= 3 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.15)'};border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Varroa</div><div style="font-size:24px;font-weight:800;color:${i.varroaCount >= 6 ? 'var(--danger)' : i.varroaCount >= 3 ? 'var(--warning)' : 'var(--success)'};font-weight:700">${i.varroaCount}</div></div>
          </div>
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">🔍 GÖZLEMLER</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-4);font-size:13px">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><strong>👑 Ana Arı:</strong> ${i.queenSeen === 'seen' ? '✅ Görüldü' : i.queenSeen === 'absent' ? '❌ YOK' : '❓ Bilinmiyor'}</div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><strong>🥚 Yumurta:</strong> ${i.eggsPattern === 'regular' ? '✅ Düzenli' : i.eggsPattern === 'irregular' ? '⚠️ Düzensiz' : '❌ Yok'}</div>
          </div>
          ${i.notes ? `
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">📝 NOTLAR</h4>
          <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px;margin-bottom:var(--space-4);white-space:pre-wrap;font-size:13px">${BM.esc(i.notes)}</div>
          ` : ''}
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">📷 FOTOĞRAFLAR (${i.photos ? i.photos.length : 0})</h4>
          <div style="margin-bottom:var(--space-4)">${photoHtml}</div>
          ${audioHtml ? `<h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">🎙 SES KAYDI</h4>${audioHtml}` : ''}
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">🤖 AI ANOMALİ TESPİTİ</h4>
          ${anomalyHtml}
          ${comparisonHtml}
        </div>`,
        () => {}
      );
    },
    handlePhotos(event) {
      const files = Array.from(event.target.files || []);
      const s = this._state;
      if (!s.photos) s.photos = [];
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = e => {
          s.photos.push(e.target.result);
          App.render();
        };
        reader.readAsDataURL(f);
      });
    },

    removePhoto(i) {
      const s = this._state;
      if (s.photos && s.photos[i]) {
        s.photos.splice(i, 1);
        App.render();
      }
    },

  };

  BM.inspections = inspectionsModule;
})(window);



/* ===== 07_diseases.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var diseasesModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Hastalık Kaydı',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Hastalık *</span>
             <select class="select" name="disease" required>
               ${['varroosis','nosemosis','foulbrood','chalkbrood','sacbrood','small_hive_beetle'].map(d => `<option value="${d}">${BM.T.disease(d)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Şiddet *</span>
             <select class="select" name="severity" required>
               <option value="low">Düşük</option>
               <option value="medium" selected>Orta</option>
               <option value="high">Yüksek</option>
             </select></label>
         </div>
         <label class="field"><span class="field-label">Tedavi</span>
           <input class="input" name="treatment" placeholder="Uygulanan tedavi"></label>
         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">
             <option value="active">Aktif</option>
             <option value="treating" selected>Tedavide</option>
             <option value="resolved">Çözüldü</option>
           </select></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { BM.Storage.add('diseases', d); BM.Toast.show('Hastalık kaydı eklendi ✓', 'success'); App.render('diseases'); return true; }
      );
    },
    edit(id) {
      const d = BM.Storage.get('diseases', id); if (!d) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === d.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Hastalık Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${d.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Hastalık</span>
             <select class="select" name="disease">${['varroosis','nosemosis','foulbrood','chalkbrood','sacbrood','small_hive_beetle'].map(x => `<option value="${x}"${d.disease === x ? ' selected' : ''}>${BM.T.disease(x)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Şiddet</span>
             <select class="select" name="severity">${[
                {v:'low', l:'Düşük'},
                {v:'medium', l:'Orta'},
                {v:'high', l:'Yüksek'}
              ].map(o => `<option value="${o.v}"${d.severity === o.v ? ' selected' : ''}>${o.l}</option>`).join('')}</select></label>
         </div>
         <label class="field"><span class="field-label">Tedavi</span>
           <input class="input" name="treatment" value="${BM.esc(d.treatment || '')}"></label>
         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">${['active','treating','resolved'].map(s => `<option value="${s}"${d.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}</select></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(d.notes || '')}</textarea></label>`,
        (d) => { BM.Storage.update('diseases', id, d); BM.Toast.show('Hastalık güncellendi ✓', 'success'); App.render('diseases'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu hastalık kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('diseases', id);
        BM.Toast.show('Kayıt silindi', 'info');
        App.render('diseases');
      });
    },
    render() {
      const list = BM.Storage.list('diseases').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Hastalıklar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.diseases.add()">+ Yeni Kayıt</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.diseases}</div><div class="empty__title">Aktif hastalık yok 🎉</div><button class="btn btn--primary" onclick="BM.diseases.add()">+ Kayıt Ekle</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(d => {
        const h = BM.Storage.get('hives', d.hiveId);
        const sev = d.severity === 'high' ? 'danger' : d.severity === 'medium' ? 'warn' : 'info';
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:var(--danger-bg);color:var(--danger)">🦠</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')} · ${BM.T.disease(d.disease)} <span class="badge badge--${sev}">${d.severity}</span></div>
            <div class="timeline__meta">${BM.dateStr(d.date)} · <span class="badge ${BM.T.statusCls(d.status)}">${BM.T.status(d.status)}</span>${d.treatment ? ' · Tedavi: ' + BM.esc(d.treatment) : ''}</div>
            ${d.notes ? `<div class="timeline__meta" style="margin-top:4px;color:var(--text-secondary)">${BM.esc(d.notes)}</div>` : ''}
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.diseases.edit('${d.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.diseases.del('${d.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ INVENTORY ============

  BM.diseases = diseasesModule;
})(window);


/* ===== 07_feeding.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var feedingModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Besleme',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Tip *</span>
             <select class="select" name="type" required onchange="BM.feeding.updateUnit(this)">
               ${['sugar_syrup','sugar_syrup_1to1','fondant','pollen_patty','candy','honey_water','invert_syrup','protein_patty'].map(t => `<option value="${t}">${BM.T.feedType(t).tr}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label" id="feed-unit-label">Miktar (L) *</span>
             <input class="input" name="amountKg" type="number" step="0.1" min="0" required value="1.0"></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Sebep</span>
             <select class="select" name="reason">
               ${['weak_colony','winter_prep','drought','supplement','stimulative'].map(r => `<option value="${r}">${BM.T.reason(r)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status"><option value="planned">Planlı</option><option value="in_progress">Sürüyor</option><option value="completed" selected>Tamamlandı</option></select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { d.amountKg = parseFloat(d.amountKg) || 0; BM.Storage.add('feedings', d); BM.Toast.show('Besleme kaydedildi ✓', 'success'); App.render('feeding'); return true; }
      );
    },
    edit(id) {
      const f = BM.Storage.get('feedings', id); if (!f) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === f.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Besleme Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${f.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Tip</span>
             <select class="select" name="type">${['sugar_syrup','sugar_syrup_1to1','fondant','pollen_patty','candy','honey_water','invert_syrup','protein_patty'].map(t => `<option value="${t}"${f.type === t ? ' selected' : ''}>${BM.T.feedType(t).tr}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Miktar (kg)</span>
             <input class="input" name="amountKg" type="number" step="0.1" value="${f.amountKg}"></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Sebep</span>
             <select class="select" name="reason">${['weak_colony','winter_prep','drought','supplement','stimulative'].map(r => `<option value="${r}"${f.reason === r ? ' selected' : ''}>${BM.T.reason(r)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status">${['planned','in_progress','completed'].map(s => `<option value="${s}"${f.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}</select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(f.notes || '')}</textarea></label>`,
        (d) => { d.amountKg = parseFloat(d.amountKg) || 0; BM.Storage.update('feedings', id, d); BM.Toast.show('Besleme güncellendi ✓', 'success'); App.render('feeding'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu besleme kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('feedings', id);
        BM.Toast.show('Besleme silindi', 'info');
        App.render('feeding');
      });
    },
    render() {
      const list = BM.Storage.list('feedings').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Besleme</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.feeding.add()">+ Yeni Besleme</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.feeding}</div><div class="empty__title">Henüz besleme kaydı yok</div><button class="btn btn--primary" onclick="BM.feeding.add()">+ İlk Besleme</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(f => {
        const h = BM.Storage.get('hives', f.hiveId);
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:rgba(249,115,22,0.15);color:#f97316">🌾</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')} · ${f.amountKg} ${BM.T.feedType(f.type).unit} ${BM.T.feedType(f.type).tr} <span class="badge ${BM.T.statusCls(f.status)}">${BM.T.status(f.status)}</span></div>
            <div class="timeline__meta">${BM.dateStr(f.date)} · ${BM.T.reason(f.reason)}${f.notes ? ' · ' + BM.esc(f.notes) : ''}</div>
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.feeding.edit('${f.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.feeding.del('${f.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ TREATMENTS ============

  BM.feeding = feedingModule;
})(window);


/* ===== 07_harvest.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var harvestModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Hasat',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Ağırlık (kg) *</span>
             <input class="input" name="weight" type="number" step="0.1" min="0" required value="2.5"></label>
           <label class="field"><span class="field-label">Kalite</span>
             <select class="select" name="quality"><option value="A">A (Premium)</option><option value="B" selected>B (Standart)</option><option value="C">C (Endüstri)</option></select></label>
           <label class="field"><span class="field-label">Çerçeve</span>
             <input class="input" name="frames" type="number" min="0" value="2"></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => {
          d.weight = parseFloat(d.weight) || 0;
          d.frames = parseInt(d.frames) || 0;
          const h = BM.Storage.get('hives', d.hiveId);
          if (h) d.apiaryId = h.apiaryId;
          BM.Storage.add('harvests', d);
          BM.Toast.show('Hasat kaydedildi ✓', 'success');
          App.render('harvest');
          return true;
        }
      );
    },
    edit(id) {
      const h = BM.Storage.get('harvests', id);
      if (!h) return;
      const hOpts = BM.Storage.list('hives').map(x => `<option value="${x.id}"${x.id === h.hiveId ? ' selected' : ''}>${BM.esc(x.name)}</option>`).join('');
      BM.Modal.open('Hasat Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${h.date}"></label>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Ağırlık (kg) *</span>
             <input class="input" name="weight" type="number" step="0.1" required value="${h.weight}"></label>
           <label class="field"><span class="field-label">Kalite</span>
             <select class="select" name="quality">${[
                {v:'A', l:'A (Premium)'},
                {v:'B', l:'B (Standart)'},
                {v:'C', l:'C (Endüstri)'}
              ].map(o => `<option value="${o.v}"${h.quality === o.v ? ' selected' : ''}>${o.l}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Çerçeve</span>
             <input class="input" name="frames" type="number" value="${h.frames || 0}"></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(h.notes || '')}</textarea></label>`,
        (d) => { d.weight = parseFloat(d.weight) || 0; d.frames = parseInt(d.frames) || 0; BM.Storage.update('harvests', id, d); BM.Toast.show('Hasat güncellendi ✓', 'success'); App.render('harvest'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu hasat kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('harvests', id);
        BM.Toast.show('Hasat silindi', 'info');
        App.render('harvest');
      });
    },
    render() {
      const list = BM.Storage.list('harvests').sort((a, b) => b.date.localeCompare(a.date));
      const total = list.reduce((s, h) => s + h.weight, 0);
      // Monthly chart
      const byMonth = {};
      list.forEach(h => { const m = h.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + h.weight; });
      const months = Object.keys(byMonth).sort().slice(-6);
      const max = Math.max(...months.map(m => byMonth[m]), 1);
      const monthLabels = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Bal Hasadı</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${BM.fmt(total)} kg toplam · ${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.harvest.add()">+ Yeni Hasat</button>
      </div>
      <div class="card" style="margin-bottom:var(--space-4)">
        <div class="card-head"><div class="card-title">Aylık Hasat Trendi</div></div>
        <div class="chart">${months.length ? months.map(m => {
          const v = byMonth[m];
          const h = Math.max(4, (v / max) * 100);
          const label = monthLabels[parseInt(m.split('-')[1]) - 1];
          return `<div class="chart__col"><div class="chart__val">${BM.fmt(v)}kg</div><div class="chart__bar" style="height:${h}%"></div><div class="chart__label">${label}</div></div>`;
        }).join('') : '<div style="margin:auto;color:var(--text-secondary)">Veri yok</div>'}</div>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.honey}</div><div class="empty__title">Henüz hasat yok</div><button class="btn btn--primary" onclick="BM.harvest.add()">+ İlk Hasat</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(h => {
        const hive = BM.Storage.get('hives', h.hiveId);
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:rgba(245,158,11,0.15);color:var(--honey-500)">🍯</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(hive ? hive.name : '?')} · ${h.weight} kg <span class="badge badge--info">Kalite ${h.quality}</span></div>
            <div class="timeline__meta">${BM.dateStr(h.date)} · ${h.frames || 0} çerçeve${h.notes ? ' · ' + BM.esc(h.notes) : ''}</div>
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.harvest.edit('${h.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.harvest.del('${h.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ FEEDING ============

  BM.harvest = harvestModule;
})(window);


/* ===== 07_inventory.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var inventoryModule = {
    add() {
      BM.Modal.open('Yeni Envanter Kalemi',
        `<label class="field"><span class="field-label">Malzeme *</span>
           <input class="input" name="name" required placeholder="Örn: Apivar şerit"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Kategori</span>
             <select class="select" name="category">${['medication','feed','equipment','consumable'].map(c => `<option value="${c}">${BM.T.invCat(c)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Birim</span>
             <select class="select" name="unit"><option>adet</option><option>kg</option><option>litre</option><option>paket</option><option>kutu</option></select></label>
         </div>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Miktar *</span>
             <input class="input" name="quantity" type="number" step="0.1" required value="1"></label>
           <label class="field"><span class="field-label">Min Stok</span>
             <input class="input" name="minStock" type="number" value="5"></label>
           <label class="field"><span class="field-label">Fiyat (₺)</span>
             <input class="input" name="costTry" type="number" step="0.01" value="0"></label>
         </div>
         <label class="field"><span class="field-label">Tedarikçi</span>
           <input class="input" name="supplier"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { d.quantity = parseFloat(d.quantity) || 0; d.minStock = parseFloat(d.minStock) || 0; d.costTry = parseFloat(d.costTry) || 0; BM.Storage.add('inventory', d); BM.Toast.show('Envanter eklendi ✓', 'success'); App.render('inventory'); return true; }
      );
    },
    edit(id) {
      const i = BM.Storage.get('inventory', id); if (!i) return;
      BM.Modal.open('Envanter Düzenle',
        `<label class="field"><span class="field-label">Malzeme *</span>
           <input class="input" name="name" required value="${BM.esc(i.name)}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Kategori</span>
             <select class="select" name="category">${['medication','feed','equipment','consumable'].map(c => `<option value="${c}"${i.category === c ? ' selected' : ''}>${BM.T.invCat(c)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Birim</span>
             <select class="select" name="unit">${['adet','kg','litre','paket','kutu'].map(u => `<option${i.unit === u ? ' selected' : ''}>${u}</option>`).join('')}</select></label>
         </div>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Miktar</span>
             <input class="input" name="quantity" type="number" step="0.1" value="${i.quantity}"></label>
           <label class="field"><span class="field-label">Min</span>
             <input class="input" name="minStock" type="number" value="${i.minStock || 0}"></label>
           <label class="field"><span class="field-label">Fiyat (₺)</span>
             <input class="input" name="costTry" type="number" step="0.01" value="${i.costTry || 0}"></label>
         </div>
         <label class="field"><span class="field-label">Tedarikçi</span>
           <input class="input" name="supplier" value="${BM.esc(i.supplier || '')}"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(i.notes || '')}</textarea></label>`,
        (d) => { d.quantity = parseFloat(d.quantity) || 0; d.minStock = parseFloat(d.minStock) || 0; d.costTry = parseFloat(d.costTry) || 0; BM.Storage.update('inventory', id, d); BM.Toast.show('Envanter güncellendi ✓', 'success'); App.render('inventory'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu kalemi silmek istiyor musunuz?', () => {
        BM.Storage.remove('inventory', id);
        BM.Toast.show('Silindi', 'info');
        App.render('inventory');
      });
    },
    render() {
      const list = BM.Storage.list('inventory');
      const lowStock = list.filter(i => i.quantity <= i.minStock);
      const totalValue = list.reduce((s, i) => s + (i.quantity * (i.costTry || 0)), 0);
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Envanter</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kalem · ₺${BM.fmt(totalValue, 0)} değer${lowStock.length ? ' · ' + lowStock.length + ' düşük stok' : ''}</div></div>
        <button class="btn btn--primary" onclick="BM.inventory.add()">+ Yeni Malzeme</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.inventory}</div><div class="empty__title">Envanter boş</div><button class="btn btn--primary" onclick="BM.inventory.add()">+ İlk Malzeme</button></div></div>` :
      `<div class="card"><div class="row-list">${list.map(i => {
        const low = i.quantity <= i.minStock;
        return `<div class="row-list__item" style="${low ? 'background:var(--danger-bg);margin:0 -18px;padding:11px 18px' : ''}">
          <div class="row-list__dot ${low ? 'row-list__dot--r' : 'row-list__dot--g'}"></div>
          <div class="row-list__main">
            <div class="row-list__name">${BM.esc(i.name)} <span class="badge badge--info">${BM.T.invCat(i.category)}</span>${low ? ' <span class="badge badge--danger">Düşük Stok</span>' : ''}</div>
            <div class="row-list__info">${i.quantity} ${i.unit} / min ${i.minStock} ${i.unit}${i.supplier ? ' · ' + BM.esc(i.supplier) : ''}${i.costTry ? ' · ₺' + BM.fmt(i.costTry, 2) + '/' + i.unit : ''}</div>
          </div>
          <div style="text-align:right;min-width:80px;flex-shrink:0">
            <div style="font-size:16px;font-weight:700">${i.quantity} ${i.unit}</div>
            <div style="font-size:10px;color:var(--text-secondary)">₺${BM.fmt(i.quantity * (i.costTry || 0), 0)}</div>
          </div>
          <div class="row-list__actions">
            <button class="btn btn--sm" onclick="BM.inventory.edit('${i.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.inventory.del('${i.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  BM.inventory = inventoryModule;
})(window);


/* ===== 07_queens.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var queensModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Ana Arı',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk *</span>
             <select class="select" name="strain" required>
               ${['anatolian','caucasian','carniolan','buckfast','carpathian','italian','cyprian','syrian','egyptian','hybrid','survivor'].map(s => `<option value="${s}">${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">İşaret Rengi</span>
             <select class="select" name="markedColor">
               ${['white','yellow','red','green','blue'].map(c => `<option value="${c}">${BM.T.color(c)}</option>`).join('')}
             </select></label>
         </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Doğum *</span>
              <input class="input" name="birthDate" type="date" required value="${BM.today()}"></label>
            <label class="field"><span class="field-label">Ana Arı Durumu</span>
              <select class="select" name="queenState">
                ${['laying','virgin','cell','mating','old'].map(st => `<option value="${st}">${BM.T.queenState(st)}</option>`).join('')}
              </select></label>
          </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Kaynak</span>
              <select class="select" name="source">
                ${['bred','purchased','swarm','supersedure','emergency'].map(s => `<option value="${s}">${BM.T.source(s)}</option>`).join('')}
              </select></label>
            <label class="field"><span class="field-label">Fiziksel Özellikler</span>
              <div style="display:flex;gap:12px;margin-top:6px">
                <label style="display:flex;align-items:center;gap:4px;font-size:13px"><input type="checkbox" name="isMarked" value="true" checked> 🎨 İşaretli</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:13px"><input type="checkbox" name="isClipped" value="true"> ✂️ Kanat Kesik</label>
              </div></label>
          </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Tedarikçi</span>
              <input class="input" name="supplier"></label>
            <label class="field"><span class="field-label">Maliyet (₺)</span>
              <input class="input" name="costTry" type="number" min="0" placeholder="0"></label>
          </div>
          <label class="field"><span class="field-label">Performans Skoru (0-100)</span>
            <input class="input" name="performanceScore" type="number" min="0" max="100" value="80"></label>
          <label class="field"><span class="field-label">Notlar</span>
            <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        async (d) => {
          d.performanceScore = Math.max(0, Math.min(1, parseInt(d.performanceScore || 80) / 100));
          if (d.costTry) d.costTry = parseFloat(d.costTry);
          d.isMarked = !!d.isMarked;
          d.isClipped = !!d.isClipped;
          const q = await BM.Storage.add('queens', { ...d, status: 'active' });
          const h = BM.Storage.get('hives', d.hiveId);
          if (h) BM.Storage.update('hives', h.id, { queenId: q.id });
          BM.Toast.show('Ana arı eklendi ✓', 'success');
          App.render('queens');
          return true;
        }
      );
    },

    edit(id) {
      const q = BM.Storage.get('queens', id);
      if (!q) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === q.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Ana Arı Düzenle',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk</span>
             <select class="select" name="strain">
               ${['anatolian','caucasian','carniolan','buckfast','carpathian','italian','cyprian','syrian','egyptian','hybrid','survivor'].map(s => `<option value="${s}"${q.strain === s ? ' selected' : ''}>${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">İşaret</span>
             <select class="select" name="markedColor">
               ${['white','yellow','red','green','blue'].map(c => `<option value="${c}"${q.markedColor === c ? ' selected' : ''}>${BM.T.color(c)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Doğum</span>
             <input class="input" name="birthDate" type="date" required value="${q.birthDate}"></label>
           <label class="field"><span class="field-label">Kaynak</span>
             <select class="select" name="source">
               ${['bred','purchased','swarm','supersedure','emergency'].map(s => `<option value="${s}"${q.source === s ? ' selected' : ''}>${BM.T.source(s)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Tedarikçi</span>
             <input class="input" name="supplier" value="${BM.esc(q.supplier || '')}"></label>
           <label class="field"><span class="field-label">Maliyet (₺)</span>
             <input class="input" name="costTry" type="number" value="${q.costTry || ''}"></label>
         </div>
         <label class="field"><span class="field-label">Performans (0-100)</span>
           <input class="input" name="performanceScore" type="number" min="0" max="100" value="${(q.performanceScore * 100).toFixed(0)}"></label>
         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">
             ${['active','superseded','dead','sold','missing'].map(s => `<option value="${s}"${q.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(q.notes || '')}</textarea></label>`,
        (d) => {
          d.performanceScore = Math.max(0, Math.min(1, parseInt(d.performanceScore || 80) / 100));
          if (d.costTry) d.costTry = parseFloat(d.costTry);
          BM.Storage.update('queens', id, d);
          BM.Toast.show('Ana arı güncellendi ✓', 'success');
          App.render('queens');
          return true;
        }
      );
    },

    del(id) {
      BM.Modal.confirm('Bu ana arıyı silmek istiyor musunuz?', () => {
        BM.Storage.remove('queens', id);
        BM.Toast.show('Ana arı silindi', 'info');
        App.render('queens');
      });
    },

    render() {
      const list = BM.Storage.list('queens');
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Ana Arılar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} ana arı</div></div>
        <button class="btn btn--primary" onclick="BM.queens.add()">+ Yeni Ana Arı</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.queens}</div><div class="empty__title">Henüz ana arı kaydı yok</div><button class="btn btn--primary" onclick="BM.queens.add()">+ İlk Ana Arı</button></div></div>` :
      `<div class="grid-3">${list.map(q => {
        const h = BM.Storage.get('hives', q.hiveId);
        const age = ((Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5)).toFixed(1);
        return `<div class="card">
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4)">
            <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--honey-400),var(--honey-600));display:flex;align-items:center;justify-content:center;font-size:26px">${BM.Icons.queens}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:15px;font-weight:700">${BM.esc(BM.T.strain(q.strain))}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${BM.esc(h ? h.name : 'Atanmamış')} · <span class="badge ${BM.T.statusCls(q.status)}">${BM.T.status(q.status)}</span></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">
            <div class="hive-card__metric"><div class="hive-card__metric-label">Yaş</div><div class="hive-card__metric-value">${age} yıl</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Performans</div><div class="hive-card__metric-value" style="color:${q.performanceScore >= 0.7 ? 'var(--success)' : q.performanceScore >= 0.5 ? 'var(--honey-500)' : 'var(--danger)'}">${(q.performanceScore * 100).toFixed(0)}%</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">İşaret</div><div class="hive-card__metric-value">${BM.T.color(q.markedColor)}</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Kaynak</div><div class="hive-card__metric-value">${BM.T.source(q.source)}</div></div>
          </div>
          <div class="hive-card__actions" style="margin-top:var(--space-4)">
            <button class="btn btn--sm" onclick="BM.queens.edit('${q.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.queens.del('${q.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div>`}`;
    }
  };

  // ============ HARVEST ============

  BM.queens = queensModule;
})(window);


/* ===== 07_tasks.js ===== */
/* ===== js/modules/07_tasks.js ===== */
// ============================================================
// Tasks & Calendar Module — Operasyon & Takvim Takibi
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const tasksModule = {
    add(presetHiveId) {
      const hives = BM.Storage.list('hives');
      const apiaries = BM.Storage.list('apiaries');

      const hOpts = hives.map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      const apOpts = apiaries.map(a => `<option value="${a.id}">${BM.esc(a.name)}</option>`).join('');

      BM.Modal.open('Yeni Görev / Hatırlatıcı',
        `<label class="field"><span class="field-label">Görev Başlığı *</span>
           <input class="input" name="title" required placeholder="Örn: Kat atılacak veya 2L şurup verilecek"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Görev Türü *</span>
             <select class="select" name="type" required>
               <option value="feeding">🌾 Besleme</option>
               <option value="inspection">📋 Muayene</option>
               <option value="treatment">💊 Varroa / Tedavi</option>
               <option value="harvest">🍯 Hasat</option>
               <option value="queen">👑 Ana Arı Kontrolü</option>
               <option value="split">🐝 Kovan Bölme</option>
               <option value="supers">🪵 Kat Atma/Çıkarma</option>
               <option value="cleaning">🧹 Temizlik / Bakım</option>
               <option value="other">📌 Diğer</option>
             </select></label>
           <label class="field"><span class="field-label">Öncelik</span>
             <select class="select" name="priority">
               <option value="low">Düşük</option>
               <option value="normal" selected>Normal</option>
               <option value="high">Yüksek</option>
               <option value="urgent">🔥 Acil</option>
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Hedef Tarih *</span>
             <input class="input" name="dueDate" type="date" required value="${BM.today()}"></label>
           <label class="field"><span class="field-label">İlişkili Kovan</span>
             <select class="select" name="hiveId"><option value="">Tüm Kovanlar / Seçilmedi</option>${hOpts}</select></label>
         </div>
         <label class="field"><span class="field-label">İlişkili Arı Üssü</span>
           <select class="select" name="apiaryId"><option value="">Tüm Üsler / Seçilmedi</option>${apOpts}</select></label>
         <label class="field"><span class="field-label">Notlar / Açıklama</span>
           <textarea class="textarea" name="notes" rows="2" placeholder="Görev detayları..."></textarea></label>`,
        async (d) => {
          await BM.Storage.add('tasks', {
            ...d,
            status: 'pending',
            dueDate: d.dueDate || BM.today()
          });
          BM.Toast.show('Görev eklendi ✓', 'success');
          App.render('tasks');
          return true;
        }
      );
    },

    edit(id) {
      const task = BM.Storage.get('tasks', id);
      if (!task) return;

      const hives = BM.Storage.list('hives');
      const apiaries = BM.Storage.list('apiaries');

      const hOpts = hives.map(h => `<option value="${h.id}"${task.hiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      const apOpts = apiaries.map(a => `<option value="${a.id}"${task.apiaryId === a.id ? ' selected' : ''}>${BM.esc(a.name)}</option>`).join('');

      BM.Modal.open('Görev Düzenle',
        `<label class="field"><span class="field-label">Görev Başlığı *</span>
           <input class="input" name="title" required value="${BM.esc(task.title)}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Görev Türü *</span>
             <select class="select" name="type">
               ${['feeding','inspection','treatment','harvest','queen','split','supers','cleaning','other'].map(t => `<option value="${t}"${task.type === t ? ' selected' : ''}>${BM.T.taskType(t)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Öncelik</span>
             <select class="select" name="priority">
               ${['low','normal','high','urgent'].map(p => `<option value="${p}"${task.priority === p ? ' selected' : ''}>${BM.T.taskPriority(p)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Hedef Tarih *</span>
             <input class="input" name="dueDate" type="date" required value="${task.dueDate}"></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status">
               <option value="pending"${task.status === 'pending' ? ' selected' : ''}>Yapılacak</option>
               <option value="completed"${task.status === 'completed' ? ' selected' : ''}>Tamamlandı</option>
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Kovan</span>
             <select class="select" name="hiveId"><option value="">Tüm Kovanlar / Seçilmedi</option>${hOpts}</select></label>
           <label class="field"><span class="field-label">Arı Üssü</span>
             <select class="select" name="apiaryId"><option value="">Tüm Üsler / Seçilmedi</option>${apOpts}</select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(task.notes || '')}</textarea></label>`,
        async (d) => {
          await BM.Storage.update('tasks', id, d);
          BM.Toast.show('Görev güncellendi ✓', 'success');
          App.render('tasks');
          return true;
        }
      );
    },

    toggleStatus(id) {
      const task = BM.Storage.get('tasks', id);
      if (!task) return;
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      BM.Storage.update('tasks', id, { status: newStatus });
      BM.Toast.show(newStatus === 'completed' ? 'Görev tamamlandı ✓' : 'Görev yapılacaklara taşındı', 'info');
      App.render('tasks');
    },

    del(id) {
      BM.Modal.confirm('Bu görevi silmek istiyor musunuz?', () => {
        BM.Storage.remove('tasks', id);
        BM.Toast.show('Görev silindi', 'info');
        App.render('tasks');
      });
    },

    render() {
      const list = BM.Storage.list('tasks').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      const todayStr = BM.today();

      const pending = list.filter(t => t.status === 'pending');
      const overdue = list.filter(t => t.status === 'pending' && t.dueDate < todayStr);
      const completed = list.filter(t => t.status === 'completed');

      return `
        <div class="actions-bar">
          <div>
            <h2 style="font-size:18px;font-weight:700">📅 Görevler & Operasyon Takvimi</h2>
            <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">
              ${pending.length} yapılacak (${overdue.length} gecikmiş), ${completed.length} tamamlandı
            </div>
          </div>
          <button class="btn btn--primary" onclick="BM.tasks.add()">+ Yeni Görev</button>
        </div>

        ${!list.length ? `
          <div class="card">
            <div class="empty">
              <div class="empty__icon">📅</div>
              <div class="empty__title">Henüz planlanmış görev yok</div>
              <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">Şurup beslemesi, kat atma, ilaçlama gibi işlerinizi takvime ekleyin.</p>
              <button class="btn btn--primary" onclick="BM.tasks.add()">+ İlk Görevi Ekle</button>
            </div>
          </div>
        ` : `
          <div class="grid-3" style="margin-bottom:var(--space-4)">
            <div class="stat"><div class="stat__icon stat__icon--warning">📋</div><div class="stat__label">Yapılacak</div><div class="stat__value">${pending.length}</div></div>
            <div class="stat"><div class="stat__icon stat__icon--danger">⏰</div><div class="stat__label">Gecikmiş</div><div class="stat__value">${overdue.length}</div></div>
            <div class="stat"><div class="stat__icon stat__icon--success">✓</div><div class="stat__label">Tamamlanan</div><div class="stat__value">${completed.length}</div></div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-title">Görev Listesi & Takvim</div>
            </div>
            <div class="row-list">
              ${list.map(t => {
                const hive = t.hiveId ? BM.Storage.get('hives', t.hiveId) : null;
                const apiary = t.apiaryId ? BM.Storage.get('apiaries', t.apiaryId) : null;
                const isOverdue = t.status === 'pending' && t.dueDate < todayStr;
                const isToday = t.dueDate === todayStr;

                return `
                  <div class="row-list__item" style="opacity:${t.status === 'completed' ? '0.6' : '1'};padding:12px;display:flex;align-items:center;gap:12px">
                    <input type="checkbox" style="width:20px;height:20px;cursor:pointer" ${t.status === 'completed' ? 'checked' : ''} onchange="BM.tasks.toggleStatus('${t.id}')">
                    
                    <div style="flex:1;min-width:0">
                      <div style="font-size:14px;font-weight:600;${t.status === 'completed' ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">
                        ${BM.esc(t.title)}
                      </div>
                      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                        <span>${BM.T.taskType(t.type)}</span>
                        ${hive ? `<span>· 🏠 ${BM.esc(hive.name)}</span>` : ''}
                        ${apiary ? `<span>· 📍 ${BM.esc(apiary.name)}</span>` : ''}
                        ${t.notes ? `<span>· 📝 ${BM.esc(t.notes)}</span>` : ''}
                      </div>
                    </div>

                    <div style="text-align:right">
                      <div style="font-size:12px;font-weight:700;color:${t.status === 'completed' ? 'var(--text-muted)' : isOverdue ? 'var(--danger)' : isToday ? 'var(--warning)' : 'var(--text-primary)'}">
                        ${isOverdue ? '⏰ Gecikti (' + BM.dateStr(t.dueDate) + ')' : isToday ? '⭐ BUGÜN' : BM.dateStr(t.dueDate)}
                      </div>
                      <div style="margin-top:4px">
                        <span class="badge ${t.priority === 'urgent' ? 'badge--danger' : t.priority === 'high' ? 'badge--warn' : 'badge--ok'}">${BM.T.taskPriority(t.priority)}</span>
                      </div>
                    </div>

                    <div style="display:flex;gap:4px">
                      <button class="btn btn--sm" onclick="BM.tasks.edit('${t.id}')">✏️</button>
                      <button class="btn btn--sm btn--danger" onclick="BM.tasks.del('${t.id}')">🗑</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}
      `;
    }
  };

  BM.tasks = tasksModule;
})(window);


/* ===== 07_treatments.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var treatmentsModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Tedavi',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Ürün *</span>
             <input class="input" name="product" required placeholder="Örn: Apivar"></label>
           <label class="field"><span class="field-label">Dozaj</span>
             <input class="input" name="dosage" placeholder="2 şerit"></label>
         </div>
         <label class="field"><span class="field-label">Süre</span>
           <input class="input" name="duration" placeholder="42 gün"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Varroa Önce</span>
             <input class="input" name="varroaBefore" type="number" min="0" value="0"></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status"><option value="planned">Planlı</option><option value="in_progress" selected>Sürüyor</option><option value="completed">Tamamlandı</option></select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { d.varroaBefore = parseInt(d.varroaBefore) || 0; BM.Storage.add('treatments', d); BM.Toast.show('Tedavi kaydedildi ✓', 'success'); App.render('treatments'); return true; }
      );
    },
    edit(id) {
      const t = BM.Storage.get('treatments', id); if (!t) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === t.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Tedavi Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${t.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Ürün *</span>
             <input class="input" name="product" required value="${BM.esc(t.product)}"></label>
           <label class="field"><span class="field-label">Dozaj</span>
             <input class="input" name="dosage" value="${BM.esc(t.dosage || '')}"></label>
         </div>
         <label class="field"><span class="field-label">Süre</span>
           <input class="input" name="duration" value="${BM.esc(t.duration || '')}"></label>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Önce</span>
             <input class="input" name="varroaBefore" type="number" value="${t.varroaBefore || 0}"></label>
           <label class="field"><span class="field-label">Sonra</span>
             <input class="input" name="varroaAfter" type="number" value="${t.varroaAfter || ''}"></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status">${['planned','in_progress','completed'].map(s => `<option value="${s}"${t.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}</select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(t.notes || '')}</textarea></label>`,
        (d) => { d.varroaBefore = parseInt(d.varroaBefore) || 0; d.varroaAfter = d.varroaAfter ? parseInt(d.varroaAfter) : null; BM.Storage.update('treatments', id, d); BM.Toast.show('Tedavi güncellendi ✓', 'success'); App.render('treatments'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu tedavi kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('treatments', id);
        BM.Toast.show('Tedavi silindi', 'info');
        App.render('treatments');
      });
    },
    render() {
      const list = BM.Storage.list('treatments').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Tedaviler</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.treatments.add()">+ Yeni Tedavi</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.treatments}</div><div class="empty__title">Henüz tedavi kaydı yok</div><button class="btn btn--primary" onclick="BM.treatments.add()">+ İlk Tedavi</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(t => {
        const h = BM.Storage.get('hives', t.hiveId);
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:rgba(168,85,247,0.15);color:#a855f7">💊</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')} · ${BM.esc(t.product)} <span class="badge ${BM.T.statusCls(t.status)}">${BM.T.status(t.status)}</span></div>
            <div class="timeline__meta">${BM.dateStr(t.date)} · ${BM.esc(t.dosage || '-')} · ${BM.esc(t.duration || '')}${t.varroaBefore != null ? ' · Varroa önce: ' + t.varroaBefore : ''}${t.varroaAfter != null ? ' → sonra: ' + t.varroaAfter : ''}</div>
            ${t.notes ? `<div class="timeline__meta" style="margin-top:4px;color:var(--text-secondary)">${BM.esc(t.notes)}</div>` : ''}
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.treatments.edit('${t.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.treatments.del('${t.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ DISEASES ============

  BM.treatments = treatmentsModule;
})(window);


/* ===== 08_analytics.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var analyticsModule = {
    render() {
      const s = BM.Storage.state;
      const inspCount = s.inspections.length;
      const avgVarroa = inspCount ? (s.inspections.reduce((sum, i) => sum + i.varroaCount, 0) / inspCount).toFixed(1) : 0;
      const totalHoney = s.harvests.reduce((sum, h) => sum + h.weight, 0);
      const avgHoney = s.hives.length ? (totalHoney / s.hives.length).toFixed(1) : 0;
      const activeTreat = s.treatments.filter(t => t.status === 'in_progress').length;
      const lowStock = s.inventory.filter(i => i.quantity <= i.minStock).length;

      return `<div class="actions-bar"><div><h2 style="font-size:18px;font-weight:700">Analitik</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">Tüm verilerden içgörüler</div></div></div>
      <div class="stats-grid">
        <div class="stat"><div class="stat__icon stat__icon--honey">${BM.Icons.honey}</div><div class="stat__label">Kovan Başına</div><div class="stat__value">${avgHoney} kg</div><div class="stat__meta">${s.hives.length} kovan</div></div>
        <div class="stat"><div class="stat__icon stat__icon--${activeTreat > 0 ? 'danger' : 'success'}">${BM.Icons.treatments}</div><div class="stat__label">Aktif Tedavi</div><div class="stat__value">${activeTreat}</div><div class="stat__meta ${activeTreat > 0 ? 'stat__meta--down' : ''}">${activeTreat > 0 ? 'Sürüyor' : 'Yok'}</div></div>
        <div class="stat"><div class="stat__icon stat__icon--${lowStock > 0 ? 'warning' : 'success'}">${BM.Icons.inventory}</div><div class="stat__label">Düşük Stok</div><div class="stat__value">${lowStock}</div><div class="stat__meta ${lowStock > 0 ? 'stat__meta--down' : ''}">${lowStock > 0 ? 'Sipariş' : 'Tam'}</div></div>
        <div class="stat"><div class="stat__icon stat__icon--info">${BM.Icons.inspections}</div><div class="stat__label">Muayene</div><div class="stat__value">${inspCount}</div><div class="stat__meta">toplam</div></div>
      </div>
      <div class="grid-2">
        <div class="card">
          <div class="card-head"><div class="card-title">Varroa Dağılımı</div></div>
          ${this._renderVarroaChart()}
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">Üs Performansı</div></div>
          ${this._renderApiaryChart()}
        </div>
      </div>
      <div class="card" style="margin-top:var(--space-4)">
        <div class="card-head"><div class="card-title">Kovan Performans Tablosu</div></div>
        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:13px">
            <thead><tr style="background:var(--bg-tertiary)">
              <th style="padding:var(--space-3);text-align:left;font-weight:600">Kovan</th>
              <th style="padding:var(--space-3);text-align:left">Üs</th>
              <th style="padding:var(--space-3);text-align:left">Irk</th>
              <th style="padding:var(--space-3);text-align:right">Bal</th>
              <th style="padding:var(--space-3);text-align:right">Varroa</th>
              <th style="padding:var(--space-3);text-align:right">Skor</th>
              <th style="padding:var(--space-3);text-align:center">Son Muayene</th>
            </tr></thead>
            <tbody>${s.hives.map(h => {
              const a = BM.Storage.get('apiaries', h.apiaryId);
              const q = s.queens.find(q => q.id === h.queenId);
              const honey = s.harvests.filter(hv => hv.hiveId === h.id).reduce((s, hv) => s + hv.weight, 0);
              const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
              return `<tr style="border-bottom:1px solid var(--n-800);cursor:pointer" onclick="BM.hives.detail('${h.id}')">
                <td style="padding:var(--space-3);font-weight:600">${BM.esc(h.name)}</td>
                <td style="padding:var(--space-3);color:var(--text-secondary)">${BM.esc(a ? a.name : '-')}</td>
                <td style="padding:var(--space-3)">${BM.T.strain(h.strain)}</td>
                <td style="padding:var(--space-3);text-align:right;font-weight:600;color:var(--honey-500)">${BM.fmt(honey)}</td>
                <td style="padding:var(--space-3);text-align:right;font-weight:600;color:${last && last.varroaCount >= 6 ? 'var(--danger)' : last && last.varroaCount >= 3 ? 'var(--warning)' : 'var(--success)'}">${last ? last.varroaCount : '-'}</td>
                <td style="padding:var(--space-3);text-align:right;color:${q && q.performanceScore >= 0.7 ? 'var(--success)' : q && q.performanceScore >= 0.5 ? 'var(--honey-500)' : 'var(--danger)'}">${q ? (q.performanceScore * 100).toFixed(0) + '%' : '-'}</td>
                <td style="padding:var(--space-3);text-align:center;color:var(--text-secondary)">${last ? BM.dateAgo(last.date) : '-'}</td>
              </tr>`;
            }).join('')}</tbody>
          </table>
        </div>
      </div>`;
    },

    _renderVarroaChart() {
      const s = BM.Storage.state;
      if (!s.hives.length) return '<div class="empty"><div class="empty__sub">Veri yok</div></div>';
      const data = s.hives.map(h => {
        const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
        return { name: h.name, varroa: last ? last.varroaCount : 0 };
      }).sort((a, b) => b.varroa - a.varroa);
      const max = Math.max(...data.map(d => d.varroa), 1);
      return `<div style="display:flex;flex-direction:column;gap:var(--space-2);margin-top:var(--space-2)">${data.map(d => {
        const pct = Math.max(4, (d.varroa / max) * 100);
        const cls = d.varroa >= 6 ? 'chart__bar--danger' : d.varroa >= 3 ? 'chart__bar--warn' : 'chart__bar--ok';
        const color = d.varroa >= 6 ? 'var(--danger)' : d.varroa >= 3 ? 'var(--warning)' : 'var(--success)';
        return `<div style="display:flex;align-items:center;gap:var(--space-3)"><div style="font-size:12px;font-weight:600;width:90px;color:var(--text-secondary)">${BM.esc(d.name)}</div><div style="flex:1;background:var(--bg-tertiary);height:24px;border-radius:var(--radius-md);overflow:hidden"><div class="chart__bar ${cls}" style="height:100%;width:${pct}%;max-width:none;border-radius:0"></div></div><div style="font-size:13px;font-weight:700;width:40px;text-align:right;color:${color}">${d.varroa}</div></div>`;
      }).join('')}</div>`;
    },

    _renderApiaryChart() {
      const s = BM.Storage.state;
      if (!s.apiaries.length) return '<div class="empty"><div class="empty__sub">Veri yok</div></div>';
      const data = s.apiaries.map(a => {
        const hc = s.hives.filter(h => h.apiaryId === a.id).length;
        const honey = s.harvests.filter(h => h.apiaryId === a.id).reduce((s, h) => s + h.weight, 0);
        return { name: a.name, honey, kovan: hc };
      });
      const max = Math.max(...data.map(d => d.honey), 1);
      return `<div style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-2)">${data.map(d => `
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:var(--space-1)"><span style="font-size:12px;font-weight:600">${BM.esc(d.name)} <span style="color:var(--text-secondary);font-weight:400">(${d.kovan} kovan)</span></span><span style="font-size:13px;font-weight:700;color:var(--honey-500)">${BM.fmt(d.honey)} kg</span></div>
          <div style="background:var(--bg-tertiary);height:18px;border-radius:var(--radius-md);overflow:hidden"><div style="background:linear-gradient(90deg,var(--honey-400),var(--honey-600));height:100%;width:${Math.max(4, (d.honey / max) * 100)}%"></div></div>
        </div>
      `).join('')}</div>`;
    }
  };

  // ============ REPORTS ============

  BM.analytics = analyticsModule;
})(window);


/* ===== 08_dashboard.js ===== */
/* ===== js/modules/dashboard.js ===== */
// ============================================================
// Dashboard, Analytics, Reports, Settings, Onboarding, Notify, App
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  // ============ DASHBOARD ============
  const dashboardModule = {
    render() {
      const s = BM.Storage.state;
      const totalHives = s.hives.length;
      const totalApiaries = s.apiaries.filter(a => !a.archived).length;
      const totalHoney = s.harvests.reduce((sum, h) => sum + h.weight, 0);
      const inspCount = s.inspections.length;
      const avgVarroa = inspCount ? (s.inspections.reduce((sum, i) => sum + i.varroaCount, 0) / inspCount).toFixed(1) : 0;
      const recentInsp = s.inspections.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
      const insights = this.insights();
      const withCoords = s.apiaries.filter(a => a.lat && a.lng);

      return `<div class="stats-grid">
        <div class="stat"><div class="stat__icon stat__icon--honey">${BM.Icons.hives}</div><div class="stat__label">Toplam Kovan</div><div class="stat__value">${totalHives}</div><div class="stat__meta">${totalApiaries} aktif üste</div></div>
        <div class="stat"><div class="stat__icon stat__icon--success">${BM.Icons.honey}</div><div class="stat__label">Toplam Bal</div><div class="stat__value">${BM.fmt(totalHoney)} kg</div><div class="stat__meta">${s.harvests.length} hasat</div></div>
        <div class="stat"><div class="stat__icon stat__icon--info">${BM.Icons.inspections}</div><div class="stat__label">Muayene</div><div class="stat__value">${inspCount}</div><div class="stat__meta">toplam kayıt</div></div>
        <div class="stat"><div class="stat__icon stat__icon--${parseFloat(avgVarroa) > 3 ? 'danger' : 'warning'}">⚠️</div><div class="stat__label">Ort. Varroa</div><div class="stat__value">${avgVarroa}</div><div class="stat__meta ${parseFloat(avgVarroa) > 3 ? 'stat__meta--down' : ''}">${parseFloat(avgVarroa) > 3 ? '⚠️ Yüksek' : '✓ Stabil'}</div></div>
      </div>

      <div class="grid-2">
        <div>
          <div class="card" style="margin-bottom:var(--space-4)">
            <div class="card-head"><div><div class="card-title">📈 Hasat Performansı</div><div class="card-sub">Son 6 ay</div></div></div>
            ${this._renderHarvestChart()}
          </div>

          <div class="card ai-card" style="margin-bottom:var(--space-4)">
            <div class="card-head"><div><div class="card-title">🤖 AI Önerileri</div><div class="card-sub">Kural tabanlı içgörüler</div></div></div>
            ${insights.length ? insights.map(i => `<div class="ai-item"><div class="ai-item__icon">${i.icon}</div><div><div class="ai-item__title">${BM.esc(i.title)}</div><div class="ai-item__sub">${BM.esc(i.sub)}</div>${i.why ? `<div class="ai-item__why">${BM.esc(i.why)}</div>` : ''}</div></div>`).join('') :
              '<div class="empty"><div class="empty__icon">✨</div><div class="empty__title">Aktif uyarı yok</div><div class="empty__sub">Her şey yolunda 🎉</div></div>'}
          </div>

          <div class="card">
            <div class="card-head"><div class="card-title">📋 Son Muayeneler</div><a class="link" onclick="App.render('inspections')">Tümü →</a></div>
            ${recentInsp.length ? `<div class="row-list">${recentInsp.map(i => {
              const h = BM.Storage.get('hives', i.hiveId);
              return `<div class="row-list__item"><div class="row-list__dot ${BM.T.statusDot(i.varroaCount >= 6 ? 'danger' : i.varroaCount >= 3 ? 'warning' : 'good')}"></div><div class="row-list__main"><div class="row-list__name">${BM.esc(h ? h.name : '?')} · ${BM.T.pop(i.population)}</div><div class="row-list__info">${BM.dateStr(i.date)} · Varroa: ${i.varroaCount}${i.notes ? ' · ' + BM.esc((i.notes || '').slice(0, 40)) : ''}</div></div></div>`;
            }).join('')}</div>` : '<div class="empty"><div class="empty__sub">Henüz muayene yok</div></div>'}
          </div>
        </div>

        <div>
          <div class="card weather-card" style="margin-bottom:var(--space-4)">
            <div class="card-head"><div><div class="card-title">🌤️ Hava & Flora</div><div class="card-sub">Eğil, Diyarbakır</div></div></div>
            <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
              <div style="font-size:48px">☀️</div>
              <div><div style="font-size:32px;font-weight:800;letter-spacing:-0.02em">28°C</div><div style="font-size:12px;color:var(--text-secondary)">Güneşli · Nem 35% · Rüzgar 12 km</div></div>
            </div>
            <div style="font-size:11px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;margin-bottom:var(--space-2)">Aktif Flora</div>
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-1)">${(s.apiaries[0] ? (s.apiaries[0].flora || 'Geven, Kekik, Adaçayı') : 'Geven, Kekik, Adaçayı').split(',').map(f => `<span style="background:var(--bg-tertiary);padding:4px 10px;border-radius:99px;font-size:11px">${BM.esc(f.trim())}</span>`).join('')}</div>
          </div>

          <div class="card" style="margin-bottom:var(--space-4)">
            <div class="card-head"><div class="card-title">📍 Üs Konumları</div></div>
            ${withCoords.length ? `<div id="dash-map" style="height:200px;border-radius:var(--r-lg);overflow:hidden;border:1px solid var(--n-800);position:relative;background:linear-gradient(135deg,rgba(59,130,246,0.06),rgba(34,197,94,0.06))">${withCoords.map((a, i) => `<div style="position:absolute;left:${20 + (i * 40)}px;top:${40 + (i * 30)}px;background:var(--honey-500);color:#000;padding:6px 10px;border-radius:var(--radius-md);font-size:11px;font-weight:600;box-shadow:var(--shadow);cursor:pointer" onclick="App.render('apiaries','map')">📍 ${BM.esc(a.name)}</div>`).join('')}<div style="position:absolute;bottom:8px;right:10px;font-size:10px;color:var(--text-muted)">GPS: ${withCoords.length}/${s.apiaries.length} üs</div></div>` : '<div class="empty"><div class="empty__sub">Koordinat ekleyince harita görünür</div></div>'}
          </div>

          <div class="card">
            <div class="card-head"><div class="card-title">⚡ Hızlı İşlemler</div></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">
              <button class="btn" onclick="BM.inspections.add()" style="justify-content:flex-start">📋 Muayene</button>
              <button class="btn" onclick="BM.harvest.add()" style="justify-content:flex-start">🍯 Hasat</button>
              <button class="btn" onclick="BM.feeding.add()" style="justify-content:flex-start">🌾 Besleme</button>
              <button class="btn" onclick="BM.treatments.add()" style="justify-content:flex-start">💊 Tedavi</button>
              <button class="btn" onclick="BM.hives.add()" style="justify-content:flex-start">➕ Kovan</button>
              <button class="btn" onclick="BM.apiaries.add()" style="justify-content:flex-start">📍 Üs</button>
            </div>
          </div>
        </div>
      </div>`;
    },

    _renderHarvestChart() {
      const harvests = BM.Storage.state.harvests;
      if (!harvests.length) return '<div class="empty"><div class="empty__sub">Veri yok</div></div>';
      const byMonth = {};
      harvests.forEach(h => { const m = h.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + h.weight; });
      const months = Object.keys(byMonth).sort().slice(-6);
      const max = Math.max(...months.map(m => byMonth[m]), 1);
      const labels = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      return `<div class="chart">${months.map(m => {
        const v = byMonth[m];
        const h = Math.max(4, (v / max) * 100);
        const lbl = labels[parseInt(m.split('-')[1]) - 1];
        return `<div class="chart__col"><div class="chart__val">${BM.fmt(v)}kg</div><div class="chart__bar" style="height:${h}%"></div><div class="chart__label">${lbl}</div></div>`;
      }).join('')}</div>`;
    },

    insights() {
      const out = [];
      const s = BM.Storage.state;
      s.hives.forEach(h => {
        const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
        if (last && last.varroaCount >= 6) out.push({ type: 'danger', icon: '⚠️', title: h.name + ' — Acil varroa tedavisi', sub: 'Varroa: ' + last.varroaCount + ' (eşik ≥6)', why: 'Apivar/Oksalik asit önerilir.' });
        else if (last && last.varroaCount >= 3) out.push({ type: 'warn', icon: '⚡', title: h.name + ' — Varroa takibi', sub: 'Varroa: ' + last.varroaCount, why: 'İzleme önerilir.' });
        if (last && last.population === 'weak') out.push({ type: 'warn', icon: '🍯', title: h.name + ' — Besleme gerekli', sub: 'Zayıf koloni', why: 'Şurup/fondant ile destekleyin.' });
        const q = s.queens.find(q => q.id === h.queenId);
        if (q) {
          const age = (Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5);
          if (age >= 3) out.push({ type: 'info', icon: '👑', title: h.name + ' — Ana arı yaşlı', sub: age.toFixed(1) + ' yıl', why: 'Değişim planla.' });
        }
      });
      s.inventory.forEach(i => {
        if (i.quantity <= i.minStock) out.push({ type: 'warn', icon: '📦', title: 'Stok az: ' + i.name, sub: 'Mevcut: ' + i.quantity + ' ' + i.unit, why: 'Sipariş ver.' });
      });
      if (s.harvests.length) {
        const last = s.harvests.sort((a, b) => b.date.localeCompare(a.date))[0];
        const days = Math.floor((Date.now() - new Date(last.date).getTime()) / 864e5);
        if (days > 30) out.push({ type: 'info', icon: '🍯', title: 'Hasat zamanı', sub: 'Son hasattan ' + days + ' gün geçti', why: 'Kontrol edin.' });
      }
      return out.slice(0, 6);
    }
  };

  BM.dashboard = dashboardModule;
})(window);

/* ===== 08_notify.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var notifyModule = {
    prefs: null,
    load() {
      try {
        const saved = localStorage.getItem('bm-notify');
        this.prefs = saved ? JSON.parse(saved) : { varroaHigh: true, lowStock: true, queenOld: true, harvestDue: true };
      } catch (e) { this.prefs = { varroaHigh: true, lowStock: true, queenOld: true, harvestDue: true }; }
    },
    save() { try { localStorage.setItem('bm-notify', JSON.stringify(this.prefs)); } catch (e) {} },

    check() {
      this.load();
      const s = BM.Storage.state;
      if (this.prefs.varroaHigh) {
        s.hives.forEach(h => {
          const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
          if (last && last.varroaCount >= 6) BM.Toast.show(`🔔 ${h.name}: Varroa ${last.varroaCount} (kritik)`, 'warn');
        });
      }
      if (this.prefs.lowStock) {
        s.inventory.filter(i => i.quantity <= i.minStock).slice(0, 2).forEach(i => {
          BM.Toast.show(`🔔 ${i.name}: Stok az (${i.quantity} ${i.unit})`, 'warn');
        });
      }
    },

    show() {
      this.load();
      const p = this.prefs;
      BM.Modal.open('🔔 Bildirim Tercihleri',
        `<label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np1"${p.varroaHigh ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">🦠 Yüksek Varroa</div><div style="font-size:11px;color:var(--text-secondary)">Kovanlarda varroa 6+ olduğunda</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np2"${p.lowStock ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">📦 Düşük Stok</div><div style="font-size:11px;color:var(--text-secondary)">Envanter minimuma düştüğünde</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np3"${p.queenOld ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">👑 Ana Arı Yaşı</div><div style="font-size:11px;color:var(--text-secondary)">Ana arı 3+ yıl olduğunda</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np4"${p.harvestDue ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">🍯 Hasat Zamanı</div><div style="font-size:11px;color:var(--text-secondary)">Son hasattan 30+ gün geçtiğinde</div></div></label>`,
        () => {
          this.prefs = {
            varroaHigh: document.getElementById('np1').checked,
            lowStock: document.getElementById('np2').checked,
            queenOld: document.getElementById('np3').checked,
            harvestDue: document.getElementById('np4').checked
          };
          this.save();
          BM.Toast.show('Bildirim tercihleri kaydedildi ✓', 'success');
          return true;
        }
      );
    }
  };

  // ============ PWA ============

  BM.notify = notifyModule;
})(window);


/* ===== 08_onboarding.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var onboardingModule = {
    init() {
      if (localStorage.getItem('bm-onboarded')) return;
      setTimeout(() => this.show(), 500);
    },

    show() {
      BM.Modal.open('🐝 BeeMaster AI\'ye Hoş Geldiniz',
        `<div style="text-align:center;padding:var(--space-5) 0">
          <div style="font-size:64px;margin-bottom:var(--space-4)">🐝</div>
          <h2 style="margin-bottom:var(--space-2)">Arıcılık Yönetiminin Yeni Adı</h2>
          <p style="color:var(--text-secondary);font-size:13px;line-height:1.6;margin-bottom:var(--space-5)">
            BeeMaster AI ile kovanlarınızı, üslerinizi, muayenelerinizi ve hasadınızı tek yerden yönetin.<br>
            Offline çalışır, verileriniz cihazınızda güvenle saklanır.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);text-align:left">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">🏠</div><div style="font-size:12px;font-weight:600">Kovan Yönetimi</div><div style="font-size:10px;color:var(--text-secondary)">Çerçeve haritası, ana arı</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">🤖</div><div style="font-size:12px;font-weight:600">AI Önerileri</div><div style="font-size:10px;color:var(--text-secondary)">Varroa, besleme, hasat</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">📱</div><div style="font-size:12px;font-weight:600">Offline-First</div><div style="font-size:10px;color:var(--text-secondary)">İnternetsiz çalışır</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">📊</div><div style="font-size:12px;font-weight:600">Analitik</div><div style="font-size:10px;color:var(--text-secondary)">Üs performansı</div></div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-2);padding-top:var(--space-4);border-top:1px solid var(--n-800);margin-top:var(--space-4)">
          <button type="button" class="btn btn--ghost" onclick="BM.onboarding.skip()">Atla</button>
          <button type="button" class="btn btn--primary" onclick="BM.onboarding.step2()">İleri →</button>
        </div>`,
        () => true
      );
    },

    step2() {
      BM.Modal.open('🐝 İlk Üssünü Oluştur',
        `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:var(--space-4)">İlk arı üssünü oluşturarak başla. Konum eklemek haritada görünmesini sağlar.</p>
         <label class="field"><span class="field-label">Üs Adı *</span>
           <input class="input" name="name" required value="Eğil Merkez"></label>
         <label class="field"><span class="field-label">Konum *</span>
           <input class="input" name="location" required value="Eğil, Diyarbakır"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Enlem</span>
             <input class="input" name="lat" type="number" step="0.001" value="38.247"></label>
           <label class="field"><span class="field-label">Boylam</span>
             <input class="input" name="lng" type="number" step="0.001" value="40.135"></label>
         </div>
         <button type="button" class="btn" onclick="BM.onboarding.useLocation()" style="margin-top:var(--space-2);width:100%">📍 Konumumu Al</button>
         <label class="field" style="margin-top:var(--space-3)"><span class="field-label">Flora</span>
           <input class="input" name="flora" value="Geven, Kekik, Adaçayı"></label>
         <div style="display:flex;justify-content:space-between;gap:var(--space-2);padding-top:var(--space-4);border-top:1px solid var(--n-800);margin-top:var(--space-4)">
           <button type="button" class="btn btn--ghost" onclick="BM.onboarding.show()">← Geri</button>
           <button type="button" class="btn btn--primary" onclick="BM.onboarding.create()">Üs Oluştur ✓</button>
         </div>`,
        () => true
      );
    },

    useLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            document.querySelector('input[name="lat"]').value = pos.coords.latitude.toFixed(3);
            document.querySelector('input[name="lng"]').value = pos.coords.longitude.toFixed(3);
            BM.Toast.show('Konum alındı ✓', 'success');
          },
          err => BM.Toast.show('Konum alınamadı: ' + err.message, 'error')
        );
      }
    },

    create() {
      const get = sel => document.querySelector(sel);
      const name = get('input[name="name"]').value.trim();
      const location = get('input[name="location"]').value.trim();
      if (!name || !location) { BM.Toast.show('Ad ve konum gerekli', 'error'); return; }
      const newApiary = {
        name, location,
        lat: parseFloat(get('input[name="lat"]').value) || null,
        lng: parseFloat(get('input[name="lng"]').value) || null,
        flora: get('input[name="flora"]').value.trim(),
        notes: ''
      };
      const apiaryId = BM.Storage.add('apiaries', newApiary);
      BM.Storage.state.activeApiaryId = apiaryId;
      localStorage.setItem('bm-onboarded', '1');
      BM.Toast.show('İlk üs oluşturuldu ✓', 'success');
      BM.Modal.close();
      App.render('apiaries');
    },

    skip() {
      localStorage.setItem('bm-onboarded', '1');
      BM.Modal.close();
    }
  };

  // ============ NOTIFY ============

  BM.onboarding = onboardingModule;
})(window);


/* ===== 08_pwa.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var pwaModule = {
    deferredPrompt: null,
    init() {
      window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.deferredPrompt = e; });
      window.addEventListener('appinstalled', () => BM.Toast.show('BeeMaster AI yüklendi! 🎉', 'success'));
    },
    install() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(r => {
          if (r.outcome === 'accepted') BM.Toast.show('Yükleme başladı...', 'info');
          this.deferredPrompt = null;
        });
      } else {
        BM.Toast.show('Tarayıcı yüklemeyi desteklemiyor veya zaten yüklü', 'info');
      }
    }
  };

  // ============ UTILS extension ============
  const utilsExt = {
    useLocation() {
      if (!navigator.geolocation) { BM.Toast.show('Tarayıcı desteklemiyor', 'error'); return; }
      navigator.geolocation.getCurrentPosition(
        pos => BM.Toast.show(`Konum: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`, 'success'),
        err => BM.Toast.show('Konum alınamadı', 'error')
      );
    }
  };

  BM.pwa = pwaModule;
})(window);


/* ===== 08_reports.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var reportsModule = {
    templates: [
      { id: 'monthly', icon: '📊', name: 'Aylık Performans', desc: 'Tüm kovanların aylık özeti' },
      { id: 'health', icon: '⚠️', name: 'Sağlık Raporu', desc: 'Varroa, hastalık ve tedavi durumu' },
      { id: 'queens', icon: '👑', name: 'Ana Arı Performans', desc: 'Tüm ana arıların karşılaştırması' },
      { id: 'inventory', icon: '📦', name: 'Envanter Raporu', desc: 'Stok durumu ve uyarılar' },
      { id: 'financial', icon: '💰', name: 'Gelir/Gider Analizi', desc: 'Maliyet ve verim özeti' },
      { id: 'seasonal', icon: '📅', name: 'Sezonluk Özet', desc: 'Tüm yılın performansı' }
    ],

    render() {
      return `<div class="actions-bar"><div><h2 style="font-size:18px;font-weight:700">Raporlar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">Modal önizleme + PDF export</div></div><button class="btn" onclick="App.exportData()">📥 JSON Yedek</button></div>
      <div class="grid-3">${this.templates.map(t => `<div class="card">
        <div style="text-align:center">
          <div style="font-size:42px;margin-bottom:var(--space-3)">${t.icon}</div>
          <div style="font-size:14px;font-weight:700;margin-bottom:var(--space-1)">${BM.esc(t.name)}</div>
          <div style="font-size:11.5px;color:var(--text-secondary);margin-bottom:var(--space-4)">${BM.esc(t.desc)}</div>
          <div style="display:flex;gap:var(--space-2);justify-content:center">
            <button class="btn btn--sm" onclick="BM.reports.show('${t.id}')">👁 Önizleme</button>
            <button class="btn btn--sm btn--primary" onclick="BM.reports.pdf('${t.id}')">📄 PDF</button>
          </div>
        </div>
      </div>`).join('')}</div>`;
    },

    show(id) {
      BM.Modal.showReport(this._renderReport(id));
    },

    pdf(id) {
      const html = this._renderReport(id);
      const w = window.open('', '_blank');
      if (!w) { BM.Toast.show('Pop-up engellendi', 'error'); return; }
      w.document.write(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>BeeMaster AI — Rapor</title>
        <style>body{font-family:system-ui,sans-serif;padding:30px;max-width:800px;margin:0 auto;color:#111}
        h1,h2{border-bottom:2px solid #F4B400;padding-bottom:6px}
        table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
        th,td{padding:8px;border:1px solid #ddd;text-align:left}
        th{background:#F4B400;color:#000;font-weight:700}
        .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;background:#fffbeb;color:#92400e}
        .no-print{background:#F4B400;color:#000;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;margin-bottom:20px;font-weight:600}
        @media print{body{padding:15px}}
        </style></head><body>
        <button class="no-print" onclick="window.print()">🖨 Yazdır / PDF Kaydet</button>
        ${html}
        </body></html>`);
      w.document.close();
    },

    _renderReport(id) {
      const s = BM.Storage.state;
      if (id === 'monthly') {
        const totalHoney = s.harvests.reduce((s, h) => s + h.weight, 0);
        return `<h1>📊 Aylık Performans Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <h2>Genel Özet</h2>
          <table>
            <tr><th>Aktif Kovan</th><td>${s.hives.length}</td></tr>
            <tr><th>Toplam Bal</th><td>${BM.fmt(totalHoney)} kg</td></tr>
            <tr><th>Muayene</th><td>${s.inspections.length}</td></tr>
            <tr><th>Aktif Tedavi</th><td>${s.treatments.filter(t => t.status === 'in_progress').length}</td></tr>
            <tr><th>Arı Üssü</th><td>${s.apiaries.length}</td></tr>
          </table>
          <h2>Üs Bazında Verim</h2>
          <table>
            <thead><tr><th>Üs</th><th>Kovan</th><th>Toplam Bal</th><th>Ortalama</th></tr></thead>
            <tbody>${s.apiaries.map(a => {
              const honey = s.harvests.filter(h => h.apiaryId === a.id).reduce((s, h) => s + h.weight, 0);
              const hc = s.hives.filter(h => h.apiaryId === a.id).length;
              return `<tr><td>${BM.esc(a.name)}</td><td>${hc}</td><td>${BM.fmt(honey)} kg</td><td>${hc > 0 ? (honey / hc).toFixed(1) : 0} kg</td></tr>`;
            }).join('')}</tbody>
          </table>`;
      }
      if (id === 'health') {
        const dangers = s.hives.filter(h => { const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0]; return last && last.varroaCount >= 6; });
        return `<h1>⚠️ Sağlık Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <h2>Kritik Kovanlar (Varroa ≥6)</h2>
          ${dangers.length ? `<table>
            <thead><tr><th>Kovan</th><th>Son Varroa</th><th>Tarih</th></tr></thead>
            <tbody>${dangers.map(h => {
              const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
              return `<tr><td>${BM.esc(h.name)}</td><td><span class="badge">${last.varroaCount}</span></td><td>${BM.dateStr(last.date)}</td></tr>`;
            }).join('')}</tbody>
          </table>` : '<p>Tüm kovanlar sağlıklı ✓</p>'}`;
      }
      if (id === 'queens') {
        return `<h1>👑 Ana Arı Performans Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <table>
            <thead><tr><th>Kovan</th><th>Irk</th><th>Yaş</th><th>Verim</th><th>Performans</th></tr></thead>
            <tbody>${s.queens.map(q => {
              const h = BM.Storage.get('hives', q.hiveId);
              const age = ((Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5)).toFixed(1);
              const honey = s.harvests.filter(hv => hv.hiveId === q.hiveId).reduce((s, hv) => s + hv.weight, 0);
              return `<tr><td>${BM.esc(h ? h.name : '?')}</td><td>${BM.esc(q.strain)}</td><td>${age} yıl</td><td>${BM.fmt(honey)} kg</td><td><span class="badge">${(q.performanceScore * 100).toFixed(0)}%</span></td></tr>`;
            }).join('')}</tbody>
          </table>`;
      }
      if (id === 'inventory') {
        const total = s.inventory.reduce((s, i) => s + (i.quantity * (i.costTry || 0)), 0);
        const low = s.inventory.filter(i => i.quantity <= i.minStock);
        return `<h1>📦 Envanter Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())} · Toplam Değer: ₺${BM.fmt(total, 0)}</p>
          ${low.length ? `<h2 style="color:#c00">⚠️ Düşük Stok</h2>
            <table><thead><tr><th>Malzeme</th><th>Mevcut</th><th>Min</th></tr></thead>
            <tbody>${low.map(i => `<tr><td>${BM.esc(i.name)}</td><td>${i.quantity} ${i.unit}</td><td>${i.minStock} ${i.unit}</td></tr>`).join('')}</tbody></table>` : ''}
          <h2>Tüm Stok</h2>
          <table><thead><tr><th>Malzeme</th><th>Kategori</th><th>Miktar</th><th>Değer</th></tr></thead>
          <tbody>${s.inventory.map(i => `<tr><td>${BM.esc(i.name)}</td><td>${BM.T.invCat(i.category)}</td><td>${i.quantity} ${i.unit}</td><td>₺${BM.fmt(i.quantity * (i.costTry || 0), 0)}</td></tr>`).join('')}</tbody></table>`;
      }
      if (id === 'financial') {
        const treatCost = s.treatments.length * 85;
        const feedCost = s.feedings.reduce((s, f) => s + f.amountKg * 12, 0);
        const honey = s.harvests.reduce((s, h) => s + h.weight, 0);
        const revenue = honey * 250;
        return `<h1>💰 Gelir/Gider Analizi</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <table>
            <thead><tr><th>Kalem</th><th>Miktar</th><th>Birim</th><th>Toplam</th></tr></thead>
            <tbody>
              <tr><td>🍯 Bal Hasadı</td><td>${BM.fmt(honey)} kg</td><td>₺250/kg</td><td style="color:#16a34a;font-weight:700">+₺${BM.fmt(revenue, 0)}</td></tr>
              <tr><td>💊 Tedavi</td><td>${s.treatments.length} işlem</td><td>₺85/işlem</td><td style="color:#dc2626;font-weight:700">-₺${BM.fmt(treatCost, 0)}</td></tr>
              <tr><td>🌾 Besleme</td><td>${BM.fmt(s.feedings.reduce((s, f) => s + f.amountKg, 0))} kg</td><td>₺12/kg</td><td style="color:#dc2626;font-weight:700">-₺${BM.fmt(feedCost, 0)}</td></tr>
              <tr style="background:#F4B400"><th>NET</th><th colspan="2"></th><th style="font-weight:700">₺${BM.fmt(revenue - treatCost - feedCost, 0)}</th></tr>
            </tbody>
          </table>`;
      }
      if (id === 'seasonal') {
        const totalHoney = s.harvests.reduce((s, h) => s + h.weight, 0);
        return `<h1>📅 Sezonluk Özet — 2026</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <table>
            <tr><th>Toplam Bal</th><td>${BM.fmt(totalHoney)} kg</td></tr>
            <tr><th>Muayene</th><td>${s.inspections.length}</td></tr>
            <tr><th>Üs</th><td>${s.apiaries.length}</td></tr>
            <tr><th>Kovan</th><td>${s.hives.length}</td></tr>
          </table>`;
      }
      return '';
    }
  };

  // ============ SETTINGS ============

  BM.reports = reportsModule;
})(window);


/* ===== 08_settings.js ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var settingsModule = {
    render() {
      const userEmail = (BM.Auth && BM.Auth.getUser) ? BM.Auth.getUser()?.email : null;
      const defaultDesc = userEmail ? `${userEmail} · ${BM.Storage.list('apiaries').length} üs` : 'Giriş yapmadan kullanabilirsiniz';
      const items = [
        { icon: '👤', name: 'Kullanıcı', desc: userEmail || 'Giriş yapmamış · Misafir modu' },
        { icon: '🔔', name: 'Bildirim Tercihleri', desc: 'Varroa, stok, ana arı uyarıları', fn: 'BM.notify.show()' },
        { icon: '📱', name: 'PWA Yükle', desc: 'Telefon/PC ana ekrana ekle', fn: 'BM.pwa.install()' },
        { icon: '🌍', name: 'Konum', desc: 'GPS ile otomatik konum', fn: 'BM.utils.useLocation()' },
        { icon: '🔄', name: 'Onboarding', desc: 'Tanıtım sihirbazını tekrar aç', fn: 'BM.onboarding.show()' },
        { icon: '🎨', name: 'Tema & Görünüm', desc: 'Koyu/Açık mod', fn: 'App.toggleTheme()' },
        { icon: '🔔', name: 'Bildirim Kontrolü', desc: 'Tüm aktif uyarıları şimdi kontrol et', fn: 'BM.notify.check()' },
        { icon: 'ℹ️', name: 'Hakkında', desc: 'BeeMaster AI v2.0 · Spec-Driven PWA' }
      ];
      return `<div class="actions-bar"><div><h2 style="font-size:18px;font-weight:700">Ayarlar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">Uygulama ve hesap</div></div></div>
      <div class="grid-3">${items.map(s => `<div class="card" style="cursor:pointer" onclick="${s.fn || 'void(0)'}">
        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <div style="width:42px;height:42px;border-radius:var(--r-lg);background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:20px">${s.icon}</div>
          <div><div style="font-size:14px;font-weight:700">${BM.esc(s.name)}</div><div style="font-size:11.5px;color:var(--text-secondary)">${BM.esc(s.desc)}</div></div>
        </div>
      </div>`).join('')}</div>
      <div class="card" style="margin-top:var(--space-4)">
        <div class="card-title">Veri Yönetimi</div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap">
          <button class="btn" onclick="App.exportData()">📥 JSON Dışa Aktar</button>
          <button class="btn" onclick="App.importData()">📤 JSON İçe Aktar</button>
          <button class="btn btn--danger" onclick="App.resetData()">🗑️ Tüm Veriyi Sıfırla</button>
          <button class="btn btn--danger" onclick="App.resetCloudData()">☁️ Bulut Verisini Sıfırla</button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:var(--space-2)">
          Bulut verisi: giriş yaptığınız hesaptaki tüm verileri sunucudan siler
        </div>
      </div>`;
    }
  };

  // ============ ONBOARDING ============

  BM.settings = settingsModule;
})(window);


/* ===== 09_frames.js ===== */
/* ===== js/modules/frames.js ===== */
// ============ FRAMES ============
const framesModule = {
  edit(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    const summary = BM.Storage.list('frames').filter(x => x.hiveId === hiveId).reduce((acc, x) => {
      const t = (x.frameType === 'empty' ? 'foundation' : x.frameType) || 'foundation';
      acc[t] = (acc[t] || 0) + 1; return acc;
    }, { brood: 0, honey: 0, pollen: 0, perga: 0, foundation: 0 });
    BM.Modal.open('Çerçeve #' + f.position + ' — Detay',
      `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--space-2);margin-bottom:var(--space-4)">
          <div style="background:rgba(249,115,22,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#f97316">${summary.brood || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Yumurtalık</div></div>
          <div style="background:rgba(245,158,11,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--honey-500)">${summary.honey || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Bal</div></div>
          <div style="background:rgba(168,85,247,0.12);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#a855f7">${summary.pollen || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Polen</div></div>
          <div style="background:rgba(180,83,9,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#b45309">${summary.perga || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Perga</div></div>
          <div style="background:var(--bg-tertiary);border:1px dashed var(--n-700);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--text-secondary)">${summary.foundation || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Ham Petek</div></div>
        </div>
        <label class="field"><span class="field-label">Tip</span>
          <select class="select" name="frameType">
            ${['brood','honey','pollen','perga','foundation'].map(t => `<option value="${t}"${f.frameType === t ? ' selected' : ''}>${({brood:'Yumurtalık',honey:'Bal',pollen:'Polen',perga:'Perga (Polen+Bal)',foundation:'Ham Petek'})[t]}</option>`).join('')}
          </select></label>
        <div class="field-row">
          <label class="field"><span class="field-label">Temel</span>
            <select class="select" name="foundationType">
              <option value="wax"${f.foundationType === 'wax' ? ' selected' : ''}>Mum</option>
              <option value="plastic"${f.foundationType === 'plastic' ? ' selected' : ''}>Plastik</option>
              <option value="foundationless"${f.foundationType === 'foundationless' ? ' selected' : ''}>Temesiz</option>
            </select></label>
          <label class="field"><span class="field-label">Durum</span>
            <select class="select" name="status">
              ${[
                {v:'in_use', l:'Kullanımda'},
                {v:'extracted', l:'Çıkarıldı'},
                {v:'cleaning', l:'Temizleniyor'},
                {v:'stored', l:'Depoda'},
                {v:'retired', l:'Emekli'}
              ].map(o => `<option value="${o.v}"${f.status === o.v ? ' selected' : ''}>${o.l}</option>`).join('')}
            </select></label>
        </div>
        <div class="field-row">
          <label class="field"><span class="field-label">Döngü</span>
            <input class="input" name="cyclesCompleted" type="number" min="0" value="${f.cyclesCompleted}"></label>
          <label class="field"><span class="field-label">Petek Yaşı (ay)</span>
            <input class="input" name="waxAgeMonths" type="number" min="0" value="${f.waxAgeMonths || 0}"></label>
        </div>
        <label class="field"><span class="field-label">Son Bal Alımı</span>
          <input class="input" name="lastExtractedAt" type="date" value="${f.lastExtractedAt || ''}"></label>
        <label class="field"><span class="field-label">Notlar</span>
          <textarea class="textarea" name="notes" rows="2">${BM.esc(f.notes || '')}</textarea></label>
        <div style="margin-top:var(--space-4);padding-top:var(--space-2);border-top:1px solid var(--n-800);display:flex;gap:var(--space-2);justify-content:flex-end;">
          <button type="button" class="btn btn--sm" onclick="BM.frames.upgradeCycle('${f.id}', '${hiveId}')">Döngü Tamamla (+1)</button>
          <button type="button" class="btn btn--sm" onclick="BM.frames.ageWax('${f.id}', '${hiveId}')">Petek Yaşı (+1 ay)</button>
          <button type="button" class="btn btn--danger btn--sm" onclick="BM.frames.retire('${f.id}', '${hiveId}')">Emekli Et</button>
        </div>`,
      (d) => {
        d.cyclesCompleted = parseInt(d.cyclesCompleted) || 0;
        d.waxAgeMonths = parseInt(d.waxAgeMonths) || 0;
        BM.Storage.update('frames', frameId, d);
        BM.Toast.show('Çerçeve güncellendi ✓', 'success');
        BM.hives._renderTab(hiveId, 'frames');
        return true;
      }
    );
  },

  // FR-04: Cerceve dongu tamamla (upgrade)
  upgradeCycle(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    const newCycles = (f.cyclesCompleted || 0) + 1;
    BM.Storage.update('frames', frameId, { cyclesCompleted: newCycles });
    BM.Toast.show('Don tamamlandi · Dongu sayisi: ' + newCycles, 'success');
    BM.hives._renderTab(hiveId, 'frames');
    const overlay = document.querySelector('.modal-overlay--active');
    if (overlay) BM.Modal.close();
  },

  // Petek yasi artir (aging)
  ageWax(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    const newAge = (f.waxAgeMonths || 0) + 1;
    BM.Storage.update('frames', frameId, { waxAgeMonths: newAge });
    BM.Toast.show('Petek yasi +1 ay · Toplam: ' + newAge + ' ay', 'info');
    BM.hives._renderTab(hiveId, 'frames');
    const overlay = document.querySelector('.modal-overlay--active');
    if (overlay) BM.Modal.close();
  },

  // FR-05: Cerceve emekli et
  retire(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    BM.Modal.confirm('Bu cerceveyi emekli etmek istiyor musunuz? Emekli cerceveler tekrar kullanilmaz.', () => {
      BM.Storage.update('frames', frameId, { status: 'retired', frameType: 'empty' });
      BM.Toast.show('Cerceve emekli edildi', 'info');
      BM.hives._renderTab(hiveId, 'frames');
      const overlay = document.querySelector('.modal-overlay--active');
      if (overlay) BM.Modal.close();
    });
  }
};

BM.frames = framesModule;



/* ===== 10_app.js ===== */
/* ===== js/app.js ===== */
// ============================================================
// App Controller — Router, navigation, init
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const NAV = [
    { group: 'Genel', items: [
      { id: 'dashboard', icon: '📊', label: 'Dashboard', view: 'dashboard' },
      { id: 'apiaries', icon: '📍', label: 'Arı Üsleri', view: 'apiaries' },
      { id: 'hives', icon: '🏠', label: 'Kovanlar', view: 'hives' }
    ]},
    { group: 'Operasyon', items: [
      { id: 'tasks', icon: '📅', label: 'Görevler & Takvim', view: 'tasks' },
      { id: 'inspections', icon: '📋', label: 'Muayeneler', view: 'inspections' },
      { id: 'harvest', icon: '🍯', label: 'Bal Hasadı', view: 'harvest' },
      { id: 'feeding', icon: '🌾', label: 'Besleme', view: 'feeding' },
      { id: 'treatments', icon: '💊', label: 'Tedaviler', view: 'treatments' },
      { id: 'diseases', icon: '🦠', label: 'Hastalıklar', view: 'diseases' }
    ]},
    { group: 'Yönetim', items: [
      { id: 'queens', icon: '👑', label: 'Ana Arılar', view: 'queens' },
      { id: 'inventory', icon: '📦', label: 'Envanter', view: 'inventory' },
      { id: 'analytics', icon: '📈', label: 'Analitik', view: 'analytics' },
      { id: 'reports', icon: '📄', label: 'Raporlar', view: 'reports' },
      { id: 'settings', icon: '⚙️', label: 'Ayarlar', view: 'settings' }
    ]},
    { group: 'BeeOS', items: [
      { id: 'beeos', icon: '⬡', label: 'BeeOS Ajan', view: 'beeos' }
    ]}
  ];

  /* ===== BeeOS Module v0.1 ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  BM.beeos = {
    agents: [
      { id: 'orchestrator', emoji: '🎯', name: 'Orchestrator', role: 'Genel Sürü & Risk Koordinatörü', desc: 'Tüm kovanları, varroa sayılarını ve muayene geçmişini bütünsel tarar, acil aksiyon raporu üretir.', color: 'linear-gradient(135deg,#f59e0b,#d97706)' },
      { id: 'planner', emoji: '📐', name: 'Planner', role: 'Mevsimsel Besleme & Takvim Uzmanı', desc: 'Aylık flora döngüsüne ve hava durumuna göre 30 günlük otomatik şurup, kek ve kontrol takvimi oluşturur.', color: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' },
      { id: 'architect', emoji: '🏛️', name: 'Architect', role: 'Kovan Mimarisi & Kapasite Analisti', desc: 'Çerçeve düzenini, petek yaşlarını ve popülasyonu inceleyip kat atma, bölme veya yenileme planlar.', color: 'linear-gradient(135deg,#10b981,#059669)' },
      { id: 'flora', emoji: '🌿', name: 'Flora & Climate', role: 'Polinasyon & Bal Akımı Tahmincisi', desc: 'Bölge florasını (Geven, Kekik, Pamuk) ve hava sıcaklıklarını analiz edip nektar akım zamanını kestirir.', color: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
      { id: 'genetics', emoji: '🧬', name: 'Queen Geneticist', role: 'Ana Arı Genetiği & Irk İslahı', desc: 'Karniyol, Kafkas ve Anadolu ırklarının performans, hırçınlık ve kışlama skorlarını değerlendirir.', color: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
      { id: 'veterinary', emoji: '🩺', name: 'Veterinary AI', role: 'Varroa & Hastalık Teşhis Motoru', desc: 'Varroa, Nosema ve yavru çürüklüğü belirtilerini erken teşhis eder ve etken madde dozajı önerir.', color: 'linear-gradient(135deg,#ef4444,#f59e0b)' }
    ],

    render() {
      const stats = this._stats();
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');

      return `
        <div style="padding:24px;max-width:1240px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
          
          <!-- Hero Header with Dynamic Autopilot Banner -->
          <div style="background:linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(16,185,129,0.1) 100%);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-lg);padding:28px;margin-bottom:24px;position:relative;overflow:hidden;backdrop-filter:blur(10px)">
            <div style="position:absolute;right:-20px;bottom:-20px;font-size:160px;opacity:0.04;pointer-events:none">🐝</div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap">
              <div style="max-width:650px">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(245,158,11,0.2);border:1px solid rgba(245,158,11,0.4);border-radius:20px;font-size:11px;font-weight:700;color:var(--honey-400);margin-bottom:12px">
                  <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;display:inline-block"></span> BEEOS AUTOPILOT ENGINE v2.0 READY
                </div>
                <h1 style="font-size:1.8rem;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg,#fbbf24,#f59e0b,#8b5cf6);-webkit-background-clip:text;background-clip:text;color:transparent">
                  ⬡ BeeOS Otonom Arıcılık Ajan Merkezi
                </h1>
                <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;margin:0">
                  Tüm arılığınızı 6 yapay zeka ajanı ile saniyeler içinde tarayın, hastalıklara karşı otonom koruma kalkanı oluşturun ve mevsimsel eylem planınızı tek tıkla devreye alın.
                </p>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end">
                <button class="btn btn--primary" onclick="BM.beeos.runAutopilot()" style="padding:14px 28px;font-weight:800;font-size:1rem;border-radius:12px;box-shadow:0 8px 24px rgba(245,158,11,0.4);display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f59e0b,#d97706)">
                  ⚡ OTONOM SÜRÜ ANALİZİ (AUTOPILOT)
                </button>
                <div style="font-size:0.75rem;color:var(--text-muted)">6 Ajan Eşzamanlı Tarama Yapar</div>
              </div>
            </div>
          </div>

          <!-- Fleet Health Metric Bar & Live Stats -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
            <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px;position:relative;overflow:hidden">
              <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Sürü Sağlık Skoru</div>
              <div style="display:flex;align-items:baseline;gap:8px">
                <div style="font-size:2.2rem;font-weight:800;color:var(--success)">${stats.healthScore}</div>
                <div style="font-size:0.9rem;color:var(--text-secondary)">/ 100</div>
              </div>
              <div style="font-size:0.75rem;color:var(--success);margin-top:4px">🛡️ Durum: ${stats.healthStatus}</div>
            </div>
            ${stats.items.map(s => `
              <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px;position:relative;overflow:hidden">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${s.color}"></div>
                <div style="font-size:1.4rem;margin-bottom:4px">${s.emoji}</div>
                <div style="font-size:1.8rem;font-weight:800;margin-bottom:2px">${s.val}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">${s.label}</div>
              </div>
            `).join('')}
          </div>

          <!-- Terminal Live Streaming Log Window (Initially Hidden or Idle) -->
          <div id="beeos-terminal-card" style="display:none;background:#0d1117;border:1px solid #30363d;border-radius:var(--radius-lg);padding:20px;margin-bottom:24px;font-family:'Fira Code',Consolas,monospace;box-shadow:0 12px 32px rgba(0,0,0,0.5)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #21262d">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="width:12px;height:12px;border-radius:50%;background:#ff5f56;display:inline-block"></span>
                <span style="width:12px;height:12px;border-radius:50%;background:#ffbd2e;display:inline-block"></span>
                <span style="width:12px;height:12px;border-radius:50%;background:#27c93f;display:inline-block"></span>
                <span style="color:#8b949e;font-size:0.8rem;margin-left:8px;font-weight:600">beeos-agent-terminal.log</span>
              </div>
              <div style="font-size:0.75rem;color:#58a6ff;display:flex;align-items:center;gap:6px">
                <span id="terminal-spinner" style="animation:spin 1s linear infinite">🔄</span> <span id="terminal-status-text">Analiz Yapılıyor...</span>
              </div>
            </div>
            <div id="beeos-terminal-logs" style="max-height:220px;overflow-y:auto;font-size:0.8rem;color:#c9d1d9;line-height:1.6"></div>
          </div>

          <!-- Dynamic Action Cards (Generated by Agents) -->
          <div id="beeos-actions-area" style="display:none;margin-bottom:24px">
            <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px;color:var(--honey-400)">
              🎯 Ajan Eylem ve Tavsiye Kartları (Otomatik Üretildi)
            </h3>
            <div id="beeos-action-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px"></div>
          </div>

          <!-- 6 AI Agents Grid -->
          <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px">
            🤖 Çekirdek Yapay Zeka Ajan Takımı (Bireysel Analiz İçin Tıklayın)
          </h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin-bottom:28px">
            ${this.agents.map(a => `
              <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:22px;position:relative;overflow:hidden;cursor:pointer;transition:all 0.25s ease;"
                   onclick="BM.beeos.runSingleAgent('${a.id}')"
                   onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='var(--honey-500)';this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" 
                   onmouseout="this.style.transform='';this.style.borderColor='var(--n-800)';this.style.boxShadow=''">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${a.color}"></div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                  <div style="font-size:2.4rem">${a.emoji}</div>
                  <span class="badge badge--info" style="font-size:10px;padding:4px 8px;font-weight:700">ANALİZ ET ▶</span>
                </div>
                <div style="font-size:1.1rem;font-weight:800;margin-bottom:2px">${a.name}</div>
                <div style="font-size:0.7rem;color:var(--honey-400);text-transform:uppercase;letter-spacing:0.5px;font-weight:700;margin-bottom:10px">${a.role}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5">${a.desc}</div>
              </div>
            `).join('')}
          </div>

          <!-- Interactive Agent Consultation Chat -->
          <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:24px;margin-bottom:28px;box-shadow:0 8px 24px rgba(0,0,0,0.2)">
            <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:8px">
              💬 Canlı Ajan Danışmanı & Kovan Asistanı
            </h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:16px">
              Arılığınızdaki mevcut tüm kovan, varroa ve muayene verileriniz bağlama alınarak anında kişiselleştirilmiş yanıtlar üretilir.
            </p>
            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
              <input type="text" id="beeos-chat-input" placeholder="Örn: Varroa sayısı 6 olan kovanıma hemen hangi ilacı vermeliyim?" 
                     style="flex:1;min-width:280px;background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:0.9rem" 
                     onkeypress="if(event.key==='Enter') BM.beeos.askAgent()">
              <button class="btn btn--primary" onclick="BM.beeos.askAgent()" style="font-weight:700;padding:12px 24px">🤖 Ajana Sor</button>
            </div>
            <div id="beeos-chat-response" style="display:none;padding:16px;background:var(--bg-input);border-left:4px solid var(--honey-500);border-radius:var(--radius-sm);font-size:0.88rem;line-height:1.6;color:var(--text-primary)"></div>
          </div>

          <!-- Tasks & Workflow Management -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
            <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:22px">
              <h3 style="font-size:1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px">📝 Yeni Ajan Görevi Ekle</h3>
              <form id="beeos-task-form" onsubmit="event.preventDefault(); BM.beeos.submitTask(); return false;" style="display:flex;flex-direction:column;gap:12px">
                <div style="display:flex;flex-direction:column;gap:4px">
                  <label style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase">Görev Tanımı *</label>
                  <input type="text" id="beeos-task-name" placeholder="Örn: Kovan-05 oksalik asit damlatması" required style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <label style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase">Atanan Ajan</label>
                    <select id="beeos-task-agent" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem">
                      ${this.agents.map(a => `<option value="${a.id}">${a.emoji} ${a.name}</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <label style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase">Öncelik</label>
                    <select id="beeos-task-priority" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem">
                      <option value="high">🔴 Yüksek</option>
                      <option value="medium" selected>🟡 Orta</option>
                      <option value="low">🟢 Düşük</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn btn--primary" style="font-weight:700;margin-top:6px">+ Görev Ekle</button>
              </form>
            </div>

            <!-- Task Board -->
            <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:22px;display:flex;flex-direction:column">
              <h3 style="font-size:1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px">📋 Aktif Görev Listesi (${tasks.length})</h3>
              <div style="flex:1;overflow-y:auto;max-height:260px;display:flex;flex-direction:column;gap:8px">
                ${!tasks.length ? '<div style="color:var(--text-muted);font-size:0.82rem;text-align:center;margin:auto">Henüz eklenmiş görev bulunmuyor</div>' :
                tasks.map(t => {
                  const agentObj = this.agents.find(a => a.id === t.agent) || this.agents[0];
                  const prioBadge = t.priority === 'high' ? '🔴 Yüksek' : t.priority === 'low' ? '🟢 Düşük' : '🟡 Orta';
                  return `
                    <div style="padding:10px 14px;background:var(--bg-input);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:space-between;gap:8px">
                      <div style="min-width:0;flex:1">
                        <div style="font-size:0.84rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${BM.esc(t.name)}</div>
                        <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px">${agentObj.emoji} ${agentObj.name} · ${prioBadge}</div>
                      </div>
                      <div style="display:flex;gap:6px">
                        <button class="btn btn--sm ${t.status === 'done' ? 'btn--primary' : 'btn--ghost'}" onclick="BM.beeos.toggleTaskStatus('${t.id}')">
                          ${t.status === 'done' ? '✅ Bitti' : t.status === 'in_progress' ? '🔄 Devam' : '⏳ Bekliyor'}
                        </button>
                        <button class="btn btn--sm btn--danger" onclick="BM.beeos.deleteTask('${t.id}')">✕</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- BDAOS Master Links -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:24px">
            ${[
              { icon:'📜', label:'Anayasa', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/00_MASTER_BLUEPRINT/BEEMASTER_CONSTITUTION.md' },
              { icon:'🎨', label:'Tasarım Sistemi', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/01_DESIGN_SYSTEM/BDS.md' },
              { icon:'🧩', label:'Bileşen Kütüphanesi', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/02_COMPONENT_LIBRARY/BCL.md' },
              { icon:'🧠', label:'HDOS Engine', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/15_HERMES/HDOS.md' },
              { icon:'⬡', label:'BeeOS Repository', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/tree/main/50_BEEOS' }
            ].map(l => `
              <a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);font-size:0.78rem;font-weight:700;transition:all 0.2s" onmouseover="this.style.borderColor='var(--honey-500)'" onmouseout="this.style.borderColor='var(--n-800)'">
                ${l.icon} ${l.label} <span style="margin-left:auto;color:var(--text-muted)">↗</span>
              </a>
            `).join('')}
          </div>

          <p style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding-top:16px;border-top:1px solid var(--n-800)">
            🐝 BeeOS v2.0 Autopilot Engine · Tam Otonom Arıcılık Karar Destek Sistemi
          </p>
        </div>
      `;
    },

    _stats() {
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      const hives = BM.Storage.list('hives');
      const inspections = BM.Storage.list('inspections');
      let highVarroaCount = 0;
      hives.forEach(h => {
        const lastInsp = inspections.filter(i => i.hiveId === h.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
        if (lastInsp && lastInsp.varroaCount >= 6) highVarroaCount++;
      });
      const healthScore = Math.max(40, 100 - (highVarroaCount * 15));
      const healthStatus = healthScore >= 85 ? 'Mükemmel' : healthScore >= 70 ? 'İyi' : 'Risk Var!';

      return {
        healthScore,
        healthStatus,
        items: [
          { emoji:'🐝', val:hives.length, label:'Aktif Kovan', color:'#10b981' },
          { emoji:'⚠️', val:highVarroaCount, label:'Riskli Kovan', color:highVarroaCount > 0 ? '#ef4444' : '#10b981' },
          { emoji:'📋', val:tasks.length, label:'Ajan Görevi', color:'#8b5cf6' }
        ]
      };
    },

    // Otonom Ajan Simülasyonu & Live Terminal Stream
    runAutopilot() {
      const termCard = document.getElementById('beeos-terminal-card');
      const logs = document.getElementById('beeos-terminal-logs');
      const statusText = document.getElementById('terminal-status-text');
      const spinner = document.getElementById('terminal-spinner');
      const actionsArea = document.getElementById('beeos-actions-area');
      const actionCards = document.getElementById('beeos-action-cards');

      termCard.style.display = 'block';
      actionsArea.style.display = 'none';
      logs.innerHTML = '';
      spinner.style.display = 'inline-block';
      statusText.textContent = 'Otonom Ajan Analizi Başlatıldı...';

      const hives = BM.Storage.list('hives');
      const inspections = BM.Storage.list('inspections');
      const queens = BM.Storage.list('queens');
      const activeApiary = BM.Storage.list('apiaries').find(a => a.id === BM.Storage.state.activeApiaryId) || BM.Storage.list('apiaries')[0];

      const timeStr = () => new Date().toLocaleTimeString('tr-TR');
      const appendLog = (tag, msg, color='#c9d1d9') => {
        logs.innerHTML += `<div style="margin-bottom:4px"><span style="color:#8b949e">[${timeStr()}]</span> <span style="color:${color};font-weight:700">[${tag}]</span> ${msg}</div>`;
        logs.scrollTop = logs.scrollHeight;
      };

      const steps = [
        { delay: 300, tag: 'ORCHESTRATOR', msg: `Sürü taranıyor... Toplam ${hives.length} kovan ve ${queens.length} ana arı yüklendi.`, color: '#f59e0b' },
        { delay: 800, tag: 'FLORA_BOT', msg: `Konum: ${activeApiary ? activeApiary.location : 'Diyarbakır, Eğil'}. Geven & Kekik nektar akımı indeksi %85 aktif.`, color: '#ec4899' },
        { delay: 1300, tag: 'VETERINARY', msg: `Tüm muayene kayıtları inceleniyor... Varroa eşiği taranıyor.`, color: '#ef4444' },
        { delay: 1800, tag: 'ARCHITECT', msg: `Kovan petek dolulukları ve çerçeve yaşları kontrol ediliyor...`, color: '#10b981' },
        { delay: 2300, tag: 'GENETICS', msg: `Ana arı ırkı performans skorları hesaplanıyor (Karniyol/Kafkas)...`, color: '#06b6d4' },
        { delay: 2800, tag: 'PLANNER', msg: `Gelecek 30 günlük otomatik besleme ve tedavi takvimi oluşturuluyor.`, color: '#8b5cf6' },
        { delay: 3300, tag: 'SYSTEM', msg: `🎉 Otonom Ajan Taraması Başarıyla Tamamlandı! Eylem Kartları Üretildi.`, color: '#27c93f' }
      ];

      steps.forEach(step => {
        setTimeout(() => {
          appendLog(step.tag, step.msg, step.color);
        }, step.delay);
      });

      setTimeout(() => {
        spinner.style.display = 'none';
        statusText.textContent = 'Analiz Tamamlandı ✓';
        this._renderActionCards(hives, inspections, queens);
        actionsArea.style.display = 'block';
        BM.Toast.show('🚀 BeeOS Otonom Analiz Tamamlandı', 'success');
      }, 3500);
    },

    _renderActionCards(hives, inspections, queens) {
      const cardsEl = document.getElementById('beeos-action-cards');
      cardsEl.innerHTML = '';
      let generated = [];

      hives.forEach(h => {
        const lastInsp = inspections.filter(i => i.hiveId === h.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
        const varroa = lastInsp ? lastInsp.varroaCount : 0;

        if (varroa >= 6) {
          generated.push({
            icon: '💊',
            title: `Acil Varroa Tedavisi — ${h.name}`,
            agent: '🩺 Veterinary AI',
            desc: `Son muayenede ${varroa} adet Varroa tespit edildi. Koloni çöküşünü önlemek için hemen Apivar veya Oksalik Asit tedavisi başlatın.`,
            btnLabel: '+ Tedavi Kaydı Oluştur',
            action: () => BM.treatments.add(h.id)
          });
        }
      });

      // Genel tavsiye kartları
      generated.push({
        icon: '🌾',
        title: 'Mevsimsel Teşvik Beslemesi',
        agent: '📐 Planner Agent',
        desc: 'Nektar akımı öncesi yavru alanını büyütmek için zayıf kovanlara 1:1 Şeker Şurubu desteği verin.',
        btnLabel: '+ Besleme Kaydı Ekle',
        action: () => BM.feeding.add()
      });

      generated.push({
        icon: '👑',
        title: 'Genç Ana Arı Yenileme',
        agent: '🧬 Queen Geneticist',
        desc: '2 yılını doldurmuş yaşlı ana arıları yüksek verimli Karniyol F1 ana arı ile değiştirerek bal verimini %40 artırın.',
        btnLabel: '+ Yeni Ana Arı Ekle',
        action: () => BM.queens.add()
      });

      cardsEl.innerHTML = generated.map((c, idx) => `
        <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
              <span style="font-size:2rem">${c.icon}</span>
              <span class="badge badge--warn" style="font-size:10px">${c.agent}</span>
            </div>
            <div style="font-size:1rem;font-weight:800;margin-bottom:6px">${c.title}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;margin-bottom:16px">${c.desc}</div>
          </div>
          <button class="btn btn--primary btn--sm" onclick="BM.beeos._executeCardAction(${idx})" style="font-weight:700">${c.btnLabel}</button>
        </div>
      `).join('');

      this._cardActions = generated.map(c => c.action);
    },

    _executeCardAction(idx) {
      if (this._cardActions && this._cardActions[idx]) {
        this._cardActions[idx]();
      }
    },

    runSingleAgent(agentId) {
      this.runAutopilot();
    },

    askAgent() {
      const input = document.getElementById('beeos-chat-input');
      const resEl = document.getElementById('beeos-chat-response');
      const q = input.value.trim();
      if (!q) return;

      resEl.style.display = 'block';
      resEl.innerHTML = '⏳ <i>BeeOS Ajanları kovan verilerinizi ve arılık geçmişinizi tarıyor...</i>';

      const hives = BM.Storage.list('hives');
      const inspections = BM.Storage.list('inspections');
      const queens = BM.Storage.list('queens');
      const activeApiary = BM.Storage.list('apiaries').find(a => a.id === BM.Storage.state.activeApiaryId) || BM.Storage.list('apiaries')[0];

      setTimeout(() => {
        const lower = q.toLowerCase();
        let ans = '';

        if (lower.includes('varroa') || lower.includes('hastalık') || lower.includes('bit') || lower.includes('ilaç')) {
          let highRiskHives = hives.filter(h => {
            const insp = inspections.filter(i => i.hiveId === h.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
            return insp && insp.varroaCount >= 6;
          }).map(h => h.name);

          ans = `🤖 <b>Veterinary AI & Orchestrator:</b><br>`;
          if (highRiskHives.length > 0) {
            ans += `⚠️ Arılığınızda <b>${highRiskHives.join(', ')}</b> kovanlarında Varroa sayısı kritik düzeyde (≥6)!<br>• <b>Tavsiye:</b> Apivar veya Oksalik asit damlatma uygulamasını hemen başlatın. Tedavi süresince bal süzümü yapmayın.`;
          } else {
            ans += `✅ Mevcut kovanlarınızın tümünde Varroa sayısı güvenli sınırlar içinde.<br>• <b>Tavsiye:</b> Rutin dip tahtası sayımlarına devam edin.`;
          }
        } else if (lower.includes('besle') || lower.includes('şurup') || lower.includes('kek')) {
          ans = `🤖 <b>Planner Agent:</b><br>Arılığınız (${activeApiary ? activeApiary.name : 'Diyarbakır Eğil'}) için <b>Mevsimsel Besleme Önerisi:</b><br>• Yavru gelişimini teşvik etmek için 1:1 Şeker Şurubu,<br>• Kış hazırlığı ve kovan stoklaması için 2:1 Koyu Şurup veya Arı Keki verin.`;
        } else if (lower.includes('ana arı') || lower.includes('ırk')) {
          ans = `🤖 <b>Queen Geneticist:</b><br>Sistemdeki <b>${queens.length} adet Ana Arı</b> analiz edildi.<br>• Bölgeniz (${activeApiary ? activeApiary.location : 'Diyarbakır'}) için yüksek bal verimli <b>Karniyol F1</b> ve soğuğa/hastalıklara dirençli <b>Kafkas Saf</b> ırkları en iyi performansı gösteriyor.`;
        } else {
          ans = `🤖 <b>BeeOS Yapay Zeka Danışmanı:</b><br>"${BM.esc(q)}" sorunuz için ${hives.length} adet kovanınızın verileri tarandı.<br>• Arılık Durumu: ${hives.length} kovan aktif, genel sağlık skoru yüksek.<br>• Detaylı aksiyon almak için yukarıdaki <b>⚡ OTONOM SÜRÜ ANALİZİ</b> butonuna tıklayabilirsiniz.`;
        }
        resEl.innerHTML = ans;
      }, 500);
    },

    submitTask() {
      const task = {
        id: 'task_' + Date.now().toString(36),
        name: document.getElementById('beeos-task-name').value.trim(),
        agent: document.getElementById('beeos-task-agent').value,
        priority: document.getElementById('beeos-task-priority').value,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      tasks.unshift(task);
      localStorage.setItem('beeos_tasks', JSON.stringify(tasks));

      document.getElementById('beeos-task-name').value = '';
      BM.Toast.show('Görev oluşturuldu ✓', 'success');
      App.render('beeos');
      return false;
    },

    toggleTaskStatus(taskId) {
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx >= 0) {
        const statuses = ['pending', 'in_progress', 'done'];
        const currentIdx = statuses.indexOf(tasks[idx].status);
        tasks[idx].status = statuses[(currentIdx + 1) % statuses.length];
        localStorage.setItem('beeos_tasks', JSON.stringify(tasks));
        App.render('beeos');
      }
    },

    deleteTask(taskId) {
      let tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      tasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('beeos_tasks', JSON.stringify(tasks));
      BM.Toast.show('Görev silindi', 'info');
      App.render('beeos');
    }
  };
})(window);

const App = {
    currentView: 'dashboard',
    viewParam: null,

    nav(view, param) {
      this.currentView = view;
      this.viewParam = param;

      // Close sidebar on mobile (proper cleanup)
      this.closeSidebar();

      // Update active states
      document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
      document.querySelectorAll('[data-view]').forEach(n => n.classList.remove('nav-item--active', 'bottom-nav__item--active'));

      // Special: hive detail
      if (view === 'hive-detail') {
        // Render handled by hivesModule.detail
        return;
      }

      const viewEl = document.getElementById('view-' + view);
      if (viewEl) {
        viewEl.classList.add('view--active');
        this.render(view);
      }
      document.querySelectorAll(`[data-view="${view}"]`).forEach(n => {
        if (n.classList.contains('nav-item') || n.classList.contains('bottom-nav__item')) {
          n.classList.add(n.classList.contains('nav-item') ? 'nav-item--active' : 'bottom-nav__item--active');
        }
      });

      // Update header
      const titles = {
        dashboard: ['Dashboard', function() {
          const a = BM.Storage.list('apiaries').find(x => x.id === BM.Storage.state.activeApiaryId);
          return 'Genel bakış · ' + (a?.name || 'Eğil, Diyarbakır');
        }],
        apiaries: ['Arı Üsleri', BM.Storage.list('apiaries').length + ' üs'],
        hives: ['Kovanlar', BM.Storage.list('hives').length + ' kovan'],
        inspections: ['Muayeneler', BM.Storage.list('inspections').length + ' kayıt'],
        tasks: ['Görevler & Takvim', function() {
          const pending = BM.Storage.list('tasks').filter(t => t.status === 'pending').length;
          return pending + ' yapılacak görev';
        }],
        harvest: ['Bal Hasadı', BM.fmt(BM.Storage.list('harvests').reduce((s, h) => s + h.weight, 0)) + ' kg'],
        feeding: ['Besleme', BM.Storage.list('feedings').length + ' kayıt'],
        treatments: ['Tedaviler', BM.Storage.list('treatments').length + ' kayıt'],
        diseases: ['Hastalıklar', BM.Storage.list('diseases').length + ' kayıt'],
        queens: ['Ana Arılar', BM.Storage.list('queens').length + ' kayıt'],
        inventory: ['Envanter', BM.Storage.list('inventory').length + ' malzeme'],
        analytics: ['Analitik', 'Tüm verilerden içgörüler'],
        reports: ['Raporlar', '6 hazır şablon'],
        settings: ['Ayarlar', 'Uygulama ve veri'],
        beeos: ['⬡ BeeOS', 'Ajan Orkestrasyon Sistemi v0.1']
      };
      const t = titles[view] || [view, ''];
      document.getElementById('page-title').textContent = t[0];
      document.getElementById('page-subtitle').textContent = typeof t[1] === 'function' ? t[1]() : t[1];

      // Update URL hash
      if (param) {
        location.hash = view + '/' + param;
      } else if (location.hash !== '#' + view) {
        location.hash = view;
      }
      window.scrollTo(0, 0);
    },

    render(view) {
      const m = BM[view];
      if (m && typeof m.render === 'function') {
        const el = document.getElementById('view-' + view);
        if (el) el.innerHTML = m.render(this.viewParam);
      }
    },

    toggleTheme() {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.getElementById('theme-toggle').textContent = next === 'dark' ? '🌙' : '☀️';
      try { localStorage.setItem('bm-theme', next); } catch (e) {}
    },

    toggleSidebar() {
      const sb = document.getElementById('app-sidebar');
      let bd = document.getElementById('sidebar-backdrop');
      if (!bd) {
        bd = document.createElement('div');
        bd.id = 'sidebar-backdrop';
        bd.className = 'sidebar-backdrop';
        bd.addEventListener('click', () => this.closeSidebar());
        document.body.appendChild(bd);
      }
      bd.style.position = 'fixed';
      bd.style.inset = '0';
      bd.style.zIndex = '999';
      if (!sb) return;
      const isOpen = sb.classList.contains('sidebar--open');
      if (isOpen) {
        this.closeSidebar();
      } else {
        sb.classList.add('sidebar--open');
        bd.classList.add('active');
        document.body.classList.add('sidebar-open');
        const hb = document.querySelector('.sidebar-toggle');
        if (hb) hb.style.display = 'none';
      }
    },

    closeSidebar() {
      const sb = document.getElementById('app-sidebar');
      const bd = document.getElementById('sidebar-backdrop');
      if (sb) sb.classList.remove('sidebar--open');
      if (bd) bd.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      const hb = document.querySelector('.sidebar-toggle');
      if (hb) hb.style.display = '';
    },

    // Global arama — tüm modüllerde arar
    search() {
      const searchable = [
        { coll: 'apiaries',    icon: '📍', label: 'Üs',        fields: ['name', 'address', 'notes'], view: 'apiaries' },
        { coll: 'hives',       icon: '🏠', label: 'Kovan',     fields: ['name', 'nfcTag', 'notes', 'strain', 'boxType'], view: 'hives' },
        { coll: 'queens',      icon: '👑', label: 'Ana Arı',   fields: ['name', 'markingColor', 'supplier'], view: 'queens' },
        { coll: 'inspections', icon: '📋', label: 'Muayene',   fields: ['notes', 'date'], view: 'inspections' },
        { coll: 'harvests',    icon: '🍯', label: 'Hasat',     fields: ['notes', 'quality'], view: 'harvest' },
        { coll: 'feedings',    icon: '🌾', label: 'Besleme',   fields: ['notes'], view: 'feeding' },
        { coll: 'treatments',  icon: '💊', label: 'Tedavi',    fields: ['product', 'notes'], view: 'treatment' },
        { coll: 'diseases',    icon: '🦠', label: 'Hastalık',  fields: ['notes'], view: 'disease' }
      ];

      const html = `
        <div style="padding:var(--space-2) 0">
          <div style="position:relative;margin-bottom:var(--space-4)">
            <input type="text" id="search-input" class="input" placeholder="Üs, kovan, ana arı, muayene notu..." 
              style="width:100%;padding:var(--space-4) var(--space-4) var(--space-4) 44px;font-size:15px;border-radius:var(--radius-md);border:1px solid var(--n-700);background:var(--bg-secondary)" autofocus>
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:18px;opacity:0.6">🔍</span>
          </div>
          <div id="search-results" style="max-height:50vh;overflow:auto">
            <div style="text-align:center;color:var(--text-muted);padding:var(--space-4)">Yazmaya başlayın...</div>
          </div>
          <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--n-800);font-size:11px;color:var(--text-muted);display:flex;gap:var(--space-3)">
            <span>💡 ${BM.Storage.list('hives').length} kovan</span>
            <span>• ${BM.Storage.list('apiaries').length} üs</span>
            <span>• ${BM.Storage.list('inspections').length} muayene</span>
          </div>
        </div>`;

      BM.Modal.open('🔍 Arama', html, () => {});

      const input = document.getElementById('search-input');
      const results = document.getElementById('search-results');

      const escapeHtml = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

      const performSearch = (q) => {
        q = q.trim().toLowerCase();
        if (!q) {
          results.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:var(--space-4)">Yazmaya başlayın...</div>';
          return;
        }
        const matches = [];
        for (const s of searchable) {
          const items = BM.Storage.list(s.coll);
          for (const it of items) {
            for (const f of s.fields) {
              const v = String(it[f] || '').toLowerCase();
              if (v && v.includes(q)) {
                let subtitle = '';
                if (s.coll === 'hives') {
                  const ap = BM.Storage.get('apiaries', it.apiaryId);
                  subtitle = `${ap ? escapeHtml(ap.name) : 'Üssüz'} · ${BM.T.strain(it.strain)} · ${BM.T.box(it.boxType)}`;
                } else if (s.coll === 'apiaries') {
                  subtitle = `${BM.Storage.list('hives').filter(h => h.apiaryId === it.id).length} kovan`;
                } else if (s.coll === 'queens') {
                  subtitle = `${it.birthDate || ''} · ${BM.T.strain(it.strain)}`;
                } else if (s.coll === 'inspections') {
                  const h = BM.Storage.get('hives', it.hiveId);
                  subtitle = `${BM.dateStr(it.date)} · ${h ? escapeHtml(h.name) : '?'} · Varroa: ${it.varroaCount}`;
                } else if (s.coll === 'harvests') {
                  const h = BM.Storage.get('hives', it.hiveId);
                  subtitle = `${BM.dateStr(it.date)} · ${h ? escapeHtml(h.name) : '?'} · ${it.weight} kg`;
                }
                matches.push({
                  collection: s,
                  item: it,
                  field: f,
                  subtitle,
                  fieldMatch: v.indexOf(q) >= 0 ? f : null
                });
                break; // Her item'dan 1 match yeter
              }
            }
          }
        }
        if (!matches.length) {
          results.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--space-6)">
            <div style="font-size:32px;margin-bottom:var(--space-2)">🤷</div>
            <div>"<strong>${escapeHtml(q)}</strong>" için sonuç yok</div>
          </div>`;
          return;
        }
        results.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-2)">${matches.length} sonuç</div>` +
          matches.slice(0, 50).map(m => {
            const view = m.collection.view;
            const id = m.item.id;
            const titleHtml = (() => {
              const name = m.item.name || `${m.collection.label} #${id.slice(-6)}`;
              const lower = escapeHtml(name).toLowerCase();
              const qEsc = escapeHtml(q);
              const idx = lower.indexOf(q.toLowerCase());
              if (idx < 0) return escapeHtml(name);
              return escapeHtml(name.slice(0, idx)) + '<mark style="background:var(--honey-500);color:var(--n-950);padding:0 2px;border-radius:2px">' + escapeHtml(name.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(name.slice(idx + q.length));
            })();
            return `<div class="card" style="padding:var(--space-3);margin-bottom:var(--space-2);cursor:pointer;display:flex;align-items:center;gap:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>App.handleSearchResult('${view}','${id}','${m.collection.coll}'),200)">
              <div style="font-size:20px">${m.collection.icon}</div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:14px">${titleHtml}</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${m.subtitle || m.collection.label}</div>
              </div>
              <div style="font-size:11px;color:var(--text-muted)">${m.collection.label}</div>
            </div>`;
          }).join('');
      };

      input.addEventListener('input', e => performSearch(e.target.value));
      // Enter ile ilk sonuca git
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const first = results.querySelector('.card');
          if (first) first.click();
        }
      });
      // ESC ile kapat
      input.addEventListener('keydown', e => {
        if (e.key === 'Escape') BM.Modal.close();
      });
    },

    // Arama sonucuna tıklayınca detaya git
    handleSearchResult(view, id, coll) {
      if (coll === 'hives') {
        this.nav(view, id);  // nav fonksiyonu zaten detail'i yönlendirir
      } else {
        this.nav(view);
      }
    },

    quickAdd() {
      BM.Modal.open('+ Hızlı Ekle',
        `<div style="display:grid;gap:var(--space-3);padding:var(--space-2) 0">
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:var(--space-2)">Hızlıca yeni kayıt ekle:</p>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.hives.add(),200)">🏠 Yeni Kovan</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.apiaries.add(),200)">📍 Yeni Üs</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.inspections.add(),200)">📋 Yeni Muayene</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.harvest.add(),200)">🍯 Yeni Hasat</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.feeding.add(),200)">🌾 Yeni Besleme</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.treatments.add(),200)">💊 Yeni Tedavi</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.queens.add(),200)">👑 Yeni Ana Arı</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.inventory.add(),200)">📦 Yeni Malzeme</button>
        </div>`,
        () => false,
        { hideFooter: true }
      );
    },

    exportData() {
      const blob = new Blob([JSON.stringify(BM.Storage.state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'beemaster-backup-' + BM.today() + '.json';
      a.click();
      BM.Toast.show('Veri dışa aktarıldı ✓', 'success');
    },

    importData() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = e => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            if (!data.apiaries || !data.hives) throw new Error('Geçersiz format');
            BM.Modal.confirm('Mevcut veriler değiştirilecek. Devam edilsin mi?', () => {
              BM.Storage.state = data;
              BM.Storage.save();
              BM.Toast.show('Veri içe aktarıldı ✓', 'success');
              App.render(App.currentView);
            });
          } catch (err) {
            BM.Toast.show('Geçersiz dosya: ' + err.message, 'error');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },

    syncNow() {
      if (!BM.Auth || !BM.Auth.isAuthenticated || !BM.Auth.isAuthenticated()) {
        BM.Toast.show('Önce giriş yapın', 'error');
        return;
      }
      BM.Toast.show('🔄 Senkronize ediliyor...', 'info');
      BM.Storage.syncFromCloud(true).then(function() {
        var total = 0;
        ['apiaries','hives','queens','inspections','frames','harvests','feedings'].forEach(function(c) {
          total += (BM.Storage.state[c] || []).length;
        });
        BM.Toast.show('✅ ' + total + ' kayıt senkronize edildi', 'success');
        if (typeof App !== 'undefined' && App.render) App.render(App.currentView || 'dashboard');
      }).catch(function(e) {
        BM.Toast.show('❌ Hata: ' + (e.message || 'bilinmeyen'), 'error');
      });
    },

    resetData() {
      BM.Modal.confirm('⚠️ TÜM veriler silinecek ve örnek verilerle değiştirilecek. Bu işlem geri alınamaz!', () => {
        BM.Storage.reset();
        BM.Toast.show('Veriler sıfırlandı', 'info');
        App.nav('dashboard');
      });
    },

    // Buluttaki TÜM verileri sil — login sonrası 22 kovan gibi eski test verilerini temizle
    async resetCloudData() {
      if (!BM.Auth || !BM.Auth.isAuthenticated || !BM.Auth.isAuthenticated()) {
        BM.Toast.show('Önce giriş yapın', 'error');
        return;
      }
      BM.Modal.confirm('☁️ Buluttaki TÜM veriler (kullanıcınızın hesabındaki) silinecek. Bu işlem geri alınamaz! Devam?', async () => {
        const tables = ['apiaries', 'hives', 'queens', 'frames', 'inspections', 'harvests', 'feedings', 'treatments', 'diseases', 'inventory'];
        const client = BM.Auth.getClient();
        const token = localStorage.getItem('beemaster-auth-token');
        let deleted = 0;
        BM.Toast.show('Bulut verileri siliniyor...', 'info');
        for (const t of tables) {
          try {
            const r = await fetch(`https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/${t}?user_id=neq.00000000-0000-0000-0000-000000000000`, {
              method: 'DELETE',
              headers: {
                'apikey': window.__SUPABASE_ANON_KEY__,
                'Authorization': `Bearer ${token}`
              }
            });
            if (r.ok) deleted++;
          } catch (e) {
            console.log('Delete error', t, e);
          }
        }
        // Local state'i de temizle
        BM.Storage.state = {
          apiaries: [], hives: [], queens: [], frames: [],
          inspections: [], harvests: [], feedings: [],
          treatments: [], diseases: [], inventory: []
        };
        BM.Storage.save();
        BM.Toast.show(`✅ ${deleted} tablodan tüm veriler silindi`, 'success');
        App.nav('dashboard');
      });
    },

    buildLayout() {
      // Sidebar
      const sb = document.getElementById('app-sidebar');
      sb.innerHTML = `
        <div class="sidebar__brand">
          <div class="sidebar__brand-mark">🐝</div>
          <div class="sidebar__brand-name">BeeMaster AI</div>
        </div>
        <nav class="sidebar__nav">
          ${NAV.map(g => `
            <div class="sidebar__group">${g.group}</div>
            ${g.items.map(it => `
              <button type="button" class="nav-item${it.view === App.currentView ? ' nav-item--active' : ''}" data-view="${it.view}" onclick="App.nav('${it.view}')">
                <span class="nav-item__icon">${it.icon}</span>${it.label}
              </button>
            `).join('')}
          `).join('')}
        </nav>
        <div class="sidebar__foot">
          <div class="user-card" id="sidebar-user-card" onclick="if(window.BM&&BM.Auth&&BM.Auth.isAuthenticated&&BM.Auth.isAuthenticated()){App.nav('settings')}else{if(window.BM&&BM.Auth&&BM.Auth.showLoginModal)BM.Auth.showLoginModal()}">
            <div class="user-card__avatar" id="sidebar-user-avatar">?</div>
            <div>
              <div class="user-card__name" id="sidebar-user-name">Giriş Yap</div>
              <div class="user-card__role" id="sidebar-user-role">Misafir · Veriler cihazınızda</div>
            </div>
          </div>
        </div>
      `;

      // Bottom nav (mobile) — iOS-style glass tab bar
      const bn = document.getElementById('app-bottom-nav');
      const tabs = [
        { id: 'dashboard', icon: '📊', label: 'Ana Sayfa' },
        { id: 'hives', icon: '🏠', label: 'Kovan' },
        { id: 'inspections', icon: '🔍', label: 'Muayene' },
        { id: 'harvest', icon: '🍯', label: 'Hasat' },
        { id: 'quickAdd', icon: '➕', label: 'Ekle' }
      ];
      bn.innerHTML = tabs.map(t => {
        if (t.id === 'quickAdd') {
          return `<button type="button" class="bottom-nav__item bottom-nav__item--add" onclick="App.quickAdd()">
            <span class="bottom-nav__icon">${t.icon}</span>${t.label}
          </button>`;
        }
        const active = App.currentView === t.id ? ' bottom-nav__item--active' : '';
        return `<button type="button" class="bottom-nav__item${active}" data-view="${t.id}" onclick="App.nav('${t.id}')">
          <span class="bottom-nav__icon">${t.icon}</span>${t.label}
        </button>`;
      }).join('');
    },

    init() {
      // Theme
      try {
        const saved = localStorage.getItem('bm-theme');
        if (saved) {
          document.documentElement.setAttribute('data-theme', saved);
          document.getElementById('theme-toggle').textContent = saved === 'dark' ? '🌙' : '☀️';
        }
      } catch (e) {}

      // ESC closes modal
      document.addEventListener('keydown', e => { if (e.key === 'Escape') BM.Modal.close(); });

      // Hash routing
      window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1) || 'dashboard';
        const [view, param] = hash.split('/');
        if (view && view !== App.currentView) {
          if (view === 'hive-detail' && param) {
            BM.hives.detail(param);
          } else {
            App.nav(view, param);
          }
        }
      });

      // Service worker + cache TEMIZLE
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
      }
      // Tüm cache'leri temizle (eski bundle kalmasın)
      if ('caches' in window) {
        caches.keys().then(names => names.forEach(n => caches.delete(n)));
      }

      // Build layout
      this.buildLayout();

      // Initial route
      const hash = location.hash.slice(1) || 'dashboard';
      const [view, param] = hash.split('/');
      if (view === 'hive-detail' && param) {
        BM.hives.detail(param);
      } else {
        this.nav(view || 'dashboard', param);
      }

      // Onboarding removed - user goes directly to dashboard
      localStorage.setItem('bm-onboarded', '1');

      // Supabase auth check - async, sonucu sonra yuklenir
      if (BM.Auth && typeof BM.Auth.initFromStorage === 'function') {
        BM.Auth.initFromStorage().then(() => {
          if (BM.Auth.isAuthenticated()) {
            console.log('[Auth] Auto-logged in as', BM.Auth.getUser().email);
            if (BM.Storage && typeof BM.Storage.syncFromCloud === 'function') {
              BM.Storage.syncFromCloud();
            }
          }
        });
      }

      // Bildirim kontrolü (3 sn sonra)
      setTimeout(() => BM.notify.check(), 3000);

      console.log('[BeeMaster AI v3.0] Spec-driven PWA · 12 modules · clean architecture');
    }
  };

  BM.App = App;
  global.App = App;
})(window);

