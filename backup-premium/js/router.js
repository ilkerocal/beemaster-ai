/* ============================================================
   BeeMaster AI — Hash-based router
   ============================================================ */

(function (global) {
  'use strict';

  const Db = global.BeeDb;
  const Views = global.BeeViews;

  function parseHash() {
    const h = (location.hash || '#/dashboard').replace(/^#/, '');
    const parts = h.split('/').filter(Boolean);
    return { route: parts[0] || 'dashboard', params: parts.slice(1) };
  }

  function setActiveLink(route) {
    document.querySelectorAll('.side-link').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  }

  function refreshApiarySelect() {
    const sel = document.getElementById('apiary-select');
    if (!sel) return;
    const apiaries = Db.listApiaries();
    const active = Db.getActiveApiaryId();
    sel.innerHTML = apiaries.length === 0
      ? '<option value="">— arılık yok —</option>'
      : apiaries.map((a) => `<option value="${a.id}" ${a.id === active ? 'selected' : ''}>${escapeHtml(a.name)}</option>`).join('');
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
  }

  function render() {
    const { route, params } = parseHash();
    const outlet = document.getElementById('route-outlet');
    if (!outlet) return;
    outlet.innerHTML = '';
    setActiveLink(route);

    switch (route) {
      case 'dashboard':
        Views.renderDashboard(outlet);
        break;
      case 'hives':
        if (params[0]) {
          // Single hive view — for now reuse hives grid + highlight
          Views.renderHives(outlet);
          const card = outlet.querySelector(`[data-hive-id="${params[0]}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.borderColor = 'var(--c-amber-500)';
          }
        } else {
          Views.renderHives(outlet);
        }
        break;
      case 'inspections':
        Views.renderInspections(outlet);
        break;
      case 'treatments':
        Views.renderTreatments(outlet);
        break;
      case 'harvests':
        Views.renderHarvests(outlet);
        break;
      case 'advisor':
        Views.renderAdvisor(outlet);
        break;
      case 'knowledge':
        Views.renderKnowledge(outlet, params[0]);
        if (params[0]) {
          // Highlight active
          requestAnimationFrame(() => {
            const a = outlet.querySelector(`[data-kb="${params[0]}"]`);
            if (a) a.classList.add('active');
          });
        }
        break;
      case 'reports':
        Views.renderReports(outlet);
        break;
      case 'reminders':
        Views.renderReminders(outlet);
        break;
      default:
        outlet.innerHTML = '<div class="empty">Sayfa bulunamadı.</div>';
    }
  }

  function go(hash) {
    location.hash = hash;
  }

  function refresh() {
    render();
  }

  function init() {
    refreshApiarySelect();
    window.addEventListener('hashchange', render);
    render();

    // Apiary select handler
    document.getElementById('apiary-select')?.addEventListener('change', (e) => {
      Db.setActiveApiary(e.target.value);
      render();
    });

    // Add apiary button
    document.getElementById('btn-add-apiary')?.addEventListener('click', () => {
      Views.openApiaryModal();
    });

    // Header buttons
    document.getElementById('btn-export')?.addEventListener('click', () => {
      const json = Db.exportJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beemaster-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Views.toast('Veri dışa aktarıldı', 'success');
    });

    document.getElementById('btn-import')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            Db.importJson(ev.target.result);
            refreshApiarySelect();
            render();
            Views.toast('Veri içe aktarıldı', 'success');
          } catch (err) {
            Views.toast('Geçersiz JSON: ' + err.message, 'error');
          }
        };
        reader.readAsText(file);
      });
      input.click();
    });

    document.getElementById('btn-search')?.addEventListener('click', () => {
      location.hash = '#/knowledge';
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      const regions = window.BeeRegion.list();
      const idx = prompt(
        'Bölge seç (numara):\n' + regions.map((r, i) => `${i + 1}. ${r.label}`).join('\n'),
        '1'
      );
      const i = parseInt(idx) - 1;
      if (regions[i]) {
        Db.updateSettings({ region: regions[i].key });
        Views.toast('Bölge güncellendi: ' + regions[i].label, 'success');
        render();
      }
    });

    // Mobil menü
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    function closeSidebar() {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('open');
    }
    function openSidebar() {
      sidebar?.classList.add('open');
      overlay?.classList.add('open');
    }
    mobileBtn?.addEventListener('click', () => {
      if (sidebar?.classList.contains('open')) closeSidebar();
      else openSidebar();
    });
    overlay?.addEventListener('click', closeSidebar);
    // Sidebar link tıklanınca mobilde kapat
    document.querySelectorAll('.side-link').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });
  }

  global.Router = { init, go, refresh, refreshApiarySelect };
})(window);