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
    ]}
  ];

  const App = {
    currentView: 'dashboard',
    viewParam: null,

    nav(view, param) {
      this.currentView = view;
      this.viewParam = param;

      // Close sidebar on mobile
      document.getElementById('sidebar').classList.remove('sidebar--open');

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
        dashboard: ['Dashboard', 'Genel bakış · Eğil, Diyarbakır'],
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
        settings: ['Ayarlar', 'Uygulama ve veri']
      };
      const t = titles[view] || [view, ''];
      document.getElementById('page-title').textContent = t[0];
      document.getElementById('page-subtitle').textContent = t[1];

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

    quickAdd() {
      BM.Modal.open('+ Hızlı Ekle',
        `<div style="display:grid;gap:var(--space-2)">
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.hives.add(),200)">🏠 Yeni Kovan</button>
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.apiaries.add(),200)">📍 Yeni Üs</button>
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.inspections.add(),200)">📋 Yeni Muayene</button>
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.harvest.add(),200)">🍯 Yeni Hasat</button>
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.feeding.add(),200)">🌾 Yeni Besleme</button>
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.treatments.add(),200)">💊 Yeni Tedavi</button>
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.queens.add(),200)">👑 Yeni Ana Arı</button>
          <button type="button" class="btn" onclick="BM.Modal.close();setTimeout(()=>BM.inventory.add(),200)">📦 Yeni Malzeme</button>
        </div>`,
        () => true
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

    resetData() {
      BM.Modal.confirm('⚠️ TÜM veriler silinecek ve örnek verilerle değiştirilecek. Bu işlem geri alınamaz!', () => {
        BM.Storage.reset();
        BM.Toast.show('Veriler sıfırlandı', 'info');
        App.nav('dashboard');
      });
    },

    buildLayout() {
      // Sidebar
      const sb = document.getElementById('sidebar');
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
          <div class="user-card" onclick="App.nav('settings')">
            <div class="user-card__avatar">İÖ</div>
            <div>
              <div class="user-card__name">İlker Öcal</div>
              <div class="user-card__role">Arıcı · Diyarbakır</div>
            </div>
          </div>
        </div>
      `;

      // Bottom nav (mobile)
      const bn = document.getElementById('bottom-nav');
      bn.innerHTML = `
        <button type="button" class="bottom-nav__item${App.currentView === 'dashboard' ? ' bottom-nav__item--active' : ''}" data-view="dashboard" onclick="App.nav('dashboard')">
          <span class="bottom-nav__icon">📊</span>Ana Sayfa
        </button>
        <button type="button" class="bottom-nav__item" data-view="apiaries" onclick="App.nav('apiaries')">
          <span class="bottom-nav__icon">📍</span>Üsler
        </button>
        <button type="button" class="bottom-nav__item" data-view="hives" onclick="App.nav('hives')">
          <span class="bottom-nav__icon">🏠</span>Kovan
        </button>
        <button type="button" class="bottom-nav__item" data-view="inspections" onclick="App.nav('inspections')">
          <span class="bottom-nav__icon">📋</span>Muayene
        </button>
        <button type="button" class="bottom-nav__item" data-view="harvest" onclick="App.nav('harvest')">
          <span class="bottom-nav__icon">🍯</span>Bal
        </button>
        <button type="button" class="bottom-nav__item" onclick="App.quickAdd()">
          <span class="bottom-nav__icon">➕</span>Ekle
        </button>
      `;
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

      // Service worker unregister (offline-first native)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
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

      // Onboarding (ilk kullanım)
      setTimeout(() => BM.onboarding.init(), 800);

      // Bildirim kontrolü (3 sn sonra)
      setTimeout(() => BM.notify.check(), 3000);

      console.log('[BeeMaster AI v3.0] Spec-driven PWA · 12 modules · clean architecture');
    }
  };

  BM.App = App;
  global.App = App;
})(window);
