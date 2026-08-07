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
      { id: 'orchestrator', emoji: '🎯', name: 'Orchestrator', role: 'Koordinatör', desc: 'Görevleri analiz eder, ajanlara dağıtır, sonuçları birleştirir.', color: 'linear-gradient(90deg,#f59e0b,#d97706)' },
      { id: 'planner', emoji: '📐', name: 'Planner', role: 'Planlayıcı', desc: 'Büyük görevleri alt adımlara böler, bağımlılıkları sıralar.', color: 'linear-gradient(90deg,#8b5cf6,#3b82f6)' },
      { id: 'architect', emoji: '🏛️', name: 'Architect', role: 'Mimar', desc: 'Teknik kararlar, BDS/BCL uygunluğu, kod inceleme.', color: 'linear-gradient(90deg,#10b981,#3b82f6)' }
    ],

    render() {
      const stats = this._stats();
      return `
        <div style="padding:24px;max-width:1200px;margin:0 auto;">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;margin-bottom:24px;">
            ${stats.map(s => `
              <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px 24px;position:relative;overflow:hidden;">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${s.color};border-radius:3px 3px 0 0;"></div>
                <div style="font-size:1.5rem;margin-bottom:8px;">${s.emoji}</div>
                <div style="font-size:1.8rem;font-weight:800;margin-bottom:4px;">${s.val}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">${s.label}</div>
              </div>
            `).join('')}
          </div>

          <!-- Agents -->
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">🤖 Çekirdek Ajanlar</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:14px;margin-bottom:32px;">
            ${this.agents.map(a => `
              <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px;position:relative;overflow:hidden;cursor:pointer;transition:all 0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.borderColor='var(--honey-500)'" onmouseout="this.style.transform='';this.style.borderColor='var(--n-800)'">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${a.color};border-radius:3px 3px 0 0;"></div>
                <div style="font-size:2rem;margin-bottom:8px;">${a.emoji}</div>
                <div style="font-size:1rem;font-weight:700;margin-bottom:2px;">${a.name}</div>
                <div style="font-size:0.68rem;color:var(--honey-500);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">${a.role}</div>
                <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;">${a.desc}</div>
              </div>
            `).join('')}
          </div>

          <!-- Task Form -->
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">📝 Görev Ekle (Supabase)</h3>
          <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px;">
            <form id="beeos-task-form" onsubmit="event.preventDefault(); BM.beeos.submitTask(); return false;" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;">
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:0.7rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Görev Adı *</label>
                <input type="text" id="beeos-task-name" placeholder="Örn: Kovan takip modülü" required style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;">
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:0.7rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Ajan</label>
                <select id="beeos-task-agent" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;">
                  <option value="orchestrator">🎯 Orchestrator</option>
                  <option value="planner">📐 Planner</option>
                  <option value="architect">🏛️ Architect</option>
                </select>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:0.7rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Öncelik</label>
                <select id="beeos-task-priority" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;">
                  <option value="high">🔴 Yüksek</option>
                  <option value="medium" selected>🟡 Orta</option>
                  <option value="low">🟢 Düşük</option>
                </select>
              </div>
              <div style="display:flex;flex-direction:column;gap:4px;">
                <label style="font-size:0.7rem;font-weight:600;color:var(--text-secondary);text-transform:uppercase;">Durum</label>
                <select id="beeos-task-status" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;">
                  <option value="pending">⏳ Bekliyor</option>
                  <option value="in_progress">🔄 Devam</option>
                  <option value="done">✅ Tamamlandı</option>
                </select>
              </div>
              <div style="grid-column:1/-1;display:flex;gap:10px;align-items:center;">
                <button type="submit" class="btn" style="background:var(--honey-600);color:#fff;border:none;font-weight:600;">💾 Kaydet</button>
                <span id="beeos-form-status" style="font-size:0.78rem;display:none;"></span>
              </div>
            </form>
          </div>

          <!-- Web Research -->
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">🔍 Web Araştırma (Firecrawl)</h3>
          <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:24px;margin-bottom:24px;">
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
              <input type="url" id="beeos-scrape-url" placeholder="https://hermes-agent.nousresearch.com/docs" style="flex:1;min-width:250px;background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;">
              <button class="btn" style="background:var(--honey-600);color:#fff;border:none;font-weight:600;" onclick="BM.beeos.scrapeUrl()">🔍 Araştır</button>
            </div>
            <div id="beeos-scrape-result" style="display:none;margin-top:16px;background:var(--bg-input);border-radius:var(--radius-sm);padding:16px;max-height:300px;overflow-y:auto;">
              <pre style="font-family:monospace;font-size:0.72rem;color:var(--text-secondary);white-space:pre-wrap;word-break:break-all;margin:0;"></pre>
            </div>
          </div>

          <!-- BDAOS Links -->
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:16px;display:flex;align-items:center;gap:8px;">📚 BDAOS — Geliştirme İşletim Sistemi</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;margin-bottom:24px;">
            ${[
              { icon:'📜', label:'Anayasa', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/00_MASTER_BLUEPRINT/BEEMASTER_CONSTITUTION.md' },
              { icon:'🎨', label:'Tasarım Sistemi', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/01_DESIGN_SYSTEM/BDS.md' },
              { icon:'🧩', label:'Bileşen Kütüphanesi', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/02_COMPONENT_LIBRARY/BCL.md' },
              { icon:'🧠', label:'HDOS', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/15_HERMES/HDOS.md' },
              { icon:'⬡', label:'BeeOS Ajanlar', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/tree/main/50_BEEOS' },
              { icon:'📊', label:'Dashboard', url:'https://ilkerocal.github.io/BeeMaster-AI-OS/' }
            ].map(l => `
              <a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:8px;padding:12px 16px;background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);font-size:0.8rem;font-weight:600;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--honey-500)'" onmouseout="this.style.borderColor='var(--n-800)'">
                ${l.icon} ${l.label} <span style="margin-left:auto;color:var(--text-muted);">↗</span>
              </a>
            `).join('')}
          </div>

          <p style="font-size:0.72rem;color:var(--text-muted);text-align:center;padding-top:16px;border-top:1px solid var(--n-800);">
            🐝 BeeOS v0.1 · AGENTS.md uyumlu · Hermes otomatik okur
          </p>
        </div>
      `;
    },

    _stats() {
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      return [
        { emoji:'🤖', val:3, label:'Aktif Ajan', color:'linear-gradient(90deg,#f59e0b,#fbbf24)' },
        { emoji:'📋', val:tasks.length, label:'Görev', color:'linear-gradient(90deg,#8b5cf6,#3b82f6)' },
        { emoji:'✅', val:tasks.filter(t=>t.status==='done').length, label:'Tamamlanan', color:'linear-gradient(90deg,#10b981,#059669)' },
        { emoji:'📄', val:10, label:'Dosya', color:'linear-gradient(90deg,#3b82f6,#6366f1)' }
      ];
    },

    async submitTask() {
      const statusEl = document.getElementById('beeos-form-status');
      const task = {
        id: 'task_' + Date.now().toString(36),
        name: document.getElementById('beeos-task-name').value.trim(),
        agent: document.getElementById('beeos-task-agent').value,
        priority: document.getElementById('beeos-task-priority').value,
        status: document.getElementById('beeos-task-status').value,
        created_at: new Date().toISOString()
      };

      // Local save
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      tasks.unshift(task);
      localStorage.setItem('beeos_tasks', JSON.stringify(tasks));

      // Supabase sync
      try {
        const SUPABASE_URL = 'https://assfwtjbvuuxclioqsih.supabase.co';
        const KEY = 'sb_publishable_3j7uCLoJRximHZjlAi4Frw_7HCwHm6M';
        await fetch(SUPABASE_URL + '/rest/v1/beeos_tasks', {
          method: 'POST',
          headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Prefer': 'return=minimal' },
          body: JSON.stringify(task)
        });
        statusEl.style.cssText = 'display:block;color:var(--success);';
        statusEl.textContent = '✅ Supabase\'e kaydedildi!';
      } catch(err) {
        statusEl.style.cssText = 'display:block;color:var(--warning);';
        statusEl.textContent = '⚠️ Yerel kaydedildi (Supabase: ' + err.message + ')';
      }

      document.getElementById('beeos-task-name').value = '';
      setTimeout(() => { statusEl.style.display = 'none'; }, 3000);
      return false;
    },

    async scrapeUrl() {
      const url = document.getElementById('beeos-scrape-url').value.trim();
      if (!url) return;
      const resultEl = document.getElementById('beeos-scrape-result');
      const pre = resultEl.querySelector('pre');
      resultEl.style.display = 'block';
      pre.textContent = '⏳ Araştırılıyor...';

      try {
        const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url);
        const res = await fetch(proxyUrl);
        const text = await res.text();
        pre.textContent = text.substring(0, 3000) + (text.length > 3000 ? '\n\n... (kısaltıldı)' : '');
      } catch(e) {
        pre.textContent = '❌ Hata: ' + e.message + '\n\nİpucu: Hermes içinde web_extract aracını kullanın.';
      }
    }
  };
})(window);

const App = {
    currentView: 'dashboard',
    viewParam: null,

    nav(view, param) {
      this.currentView = view;
      this.viewParam = param;

      // Close sidebar on mobile
      document.getElementById('app-sidebar').classList.remove('sidebar--open');

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
      bd.style.top = '56px';   /* header altından başla, butonları kapatma */
      bd.style.left = '260px';
      bd.style.right = '0';
      bd.style.bottom = '0';
      bd.style.zIndex = '199';
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
