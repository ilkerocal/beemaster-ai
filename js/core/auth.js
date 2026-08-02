/* ===== js/modules/auth.js ===== */
// ============================================================
// Supabase Auth + Cloud Sync (Optional - falls back to localStorage)
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  // Config from Vercel env vars (injected at runtime) or hardcoded fallback
  const SUPABASE_URL = (typeof window !== 'undefined' && window.__SUPABASE_URL__) || null;
  const SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.__SUPABASE_ANON_KEY__) || null;

  let _client = null;
  let _user = null;
  let _session = null;

  function isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase);
  }

  function getClient() {
    if (!isConfigured()) return null;
    if (!_client) {
      try {
        _client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
          <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-4);background:linear-gradient(135deg, var(--primary-color) 0%, #f59e0b 100%);border-radius:var(--radius-lg);margin-bottom:var(--space-4);color:#fff">
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
              <div style="font-size:20px;font-weight:700;color:var(--primary-color)">${stats.hives?.length || 0}</div>
              <div style="font-size:10px;color:var(--text-secondary);margin-top:2px">Kovan</div>
            </div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:20px;font-weight:700;color:var(--primary-color)">${stats.inspections?.length || 0}</div>
              <div style="font-size:10px;color:var(--text-secondary);margin-top:2px">Muayene</div>
            </div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);text-align:center">
              <div style="font-size:20px;font-weight:700;color:var(--primary-color)">${stats.feedings?.length || 0}</div>
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
      <div style="padding:var(--space-2) 0">
        <div style="display:flex;gap:var(--space-1);margin-bottom:var(--space-4);background:var(--bg-tertiary);padding:4px;border-radius:var(--radius-md)">
          <button type="button" id="auth-tab-login" class="btn ${_authMode === 'login' ? 'btn--primary' : 'btn--ghost'}" style="flex:1;padding:8px" onclick="BM.Auth.switchTab('login')">🔑 Giriş Yap</button>
          <button type="button" id="auth-tab-register" class="btn ${_authMode === 'register' ? 'btn--primary' : 'btn--ghost'}" style="flex:1;padding:8px" onclick="BM.Auth.switchTab('register')">📝 Kayıt Ol</button>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-3)">
          ${_authMode === 'login' ? 'Hesabınızla giriş yapın — tüm verileriniz buluttan yüklenecek.' : 'Yeni hesap oluşturun — verileriniz Supabase bulutuna kaydedilecek.'}
        </p>
        <label class="field"><span class="field-label">E-posta</span>
          <input class="input" type="email" id="auth-email" placeholder="ornek@gmail.com" autocomplete="email"></label>
        <label class="field"><span class="field-label">Şifre (en az 6 karakter)</span>
          <input class="input" type="password" id="auth-password" placeholder="••••••" autocomplete="${_authMode === 'login' ? 'current' : 'new'}-password"></label>
        <div id="auth-error" style="color:var(--danger);font-size:12px;margin-top:var(--space-2);min-height:18px"></div>
        <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--n-800);font-size:11px;color:var(--text-muted)">
          💡 Giriş yapmadan da uygulamayı kullanabilirsiniz. Verileriniz cihazınızda (localStorage) saklanır. Giriş yaparsanız bulutla senkronize olur.
        </div>
      </div>`;

    BM.Modal.open('🐝 BeeMaster AI', renderBody(), async () => {
      const email = document.getElementById('auth-email')?.value.trim();
      const password = document.getElementById('auth-password')?.value;
      const errEl = document.getElementById('auth-error');
      if (!email || !password) {
        if (errEl) errEl.textContent = 'E-posta ve şifre gerekli';
        return false;
      }
      if (password.length < 6) {
        if (errEl) errEl.textContent = 'Şifre en az 6 karakter olmalı';
        return false;
      }
      let result;
      if (_authMode === 'register') {
        result = await signUp(email, password);
        if (result.error?.message?.toLowerCase().includes('already')) {
          // Kullanıcı zaten var, sign in dene
          result = await signIn(email, password);
        }
      } else {
        result = await signIn(email, password);
      }
      if (result.error) {
        if (errEl) errEl.textContent = (result.error.message || 'Giriş başarısız') + (result.error.code ? ' (' + result.error.code + ')' : '');
        return false;
      }
      if (result.data?.user) {
        BM.Toast.show('Hoş geldiniz! 🌐 Bulut senkronizasyonu aktif', 'success');
        updateAuthBtn();
        if (BM.CloudSync) BM.CloudSync.syncFromCloud();
        return true;
      }
      return false;
    });
  }

  function switchTab(mode) {
    _authMode = mode;
    document.getElementById('modal-body').innerHTML = renderBody();
  }

  function renderBody() {
    return `
      <div style="padding:var(--space-2) 0">
        <div style="display:flex;gap:var(--space-1);margin-bottom:var(--space-4);background:var(--bg-tertiary);padding:4px;border-radius:var(--radius-md)">
          <button type="button" id="auth-tab-login" class="btn ${_authMode === 'login' ? 'btn--primary' : 'btn--ghost'}" style="flex:1;padding:8px" onclick="BM.Auth.switchTab('login')">🔑 Giriş Yap</button>
          <button type="button" id="auth-tab-register" class="btn ${_authMode === 'register' ? 'btn--primary' : 'btn--ghost'}" style="flex:1;padding:8px" onclick="BM.Auth.switchTab('register')">📝 Kayıt Ol</button>
        </div>
        <p style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-3)">
          ${_authMode === 'login' ? 'Hesabınızla giriş yapın.' : 'Yeni hesap oluşturun.'}
        </p>
        <label class="field"><span class="field-label">E-posta</span>
          <input class="input" type="email" id="auth-email" placeholder="ornek@gmail.com" autocomplete="email"></label>
        <label class="field"><span class="field-label">Şifre (en az 6 karakter)</span>
          <input class="input" type="password" id="auth-password" placeholder="••••••" autocomplete="${_authMode === 'login' ? 'current' : 'new'}-password"></label>
        <div id="auth-error" style="color:var(--danger);font-size:12px;margin-top:var(--space-2);min-height:18px"></div>
        <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--n-800);font-size:11px;color:var(--text-muted)">
          💡 Giriş yapmadan da kullanabilirsiniz. Giriş = bulut senkronizasyonu.
        </div>
      </div>`;
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
    const token = localStorage.getItem('beemaster-auth-token');
    if (!token) return;
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
      const { data, error } = await c.auth.getUser(token);
      if (error) {
        // Token invalid - temizle
        localStorage.removeItem('beemaster-auth-token');
        return;
      }
      if (data?.user) {
        _user = data.user;
        _session = { access_token: token };
        updateAuthBtn();
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
    updateAuthBtn,
    updateSidebarUser,
    doLogout,
    initFromStorage
  };
})(window);
