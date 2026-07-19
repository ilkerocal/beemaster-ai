/* ============================================================
   BeeMaster AI — Hash-based Router
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
    document.querySelectorAll('.nav-link[data-route]').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
    document.querySelectorAll('.bottom-nav-link[data-route]').forEach((el) => {
      el.classList.toggle('active', el.dataset.route === route);
    });
  }

  function setPageTitle(route) {
    const titles = {
      dashboard: 'Pano',
      advisor: 'Danışman',
      reminders: 'Hatırlatıcılar',
      hives: 'Kovanlar',
      inspections: 'Muayeneler',
      treatments: 'Tedaviler',
      harvests: 'Hasat',
      knowledge: 'Bilgi Tabanı',
      reports: 'Raporlar',
    };
    const el = document.getElementById('page-title');
    if (el) el.textContent = titles[route] || 'BeeMaster AI';
  }

  function renderRoute(route, params) {
    const outlet = document.getElementById('route-outlet');
    if (!outlet) return;

    // Skeleton loader
    outlet.innerHTML = `
      <div class="skeleton skeleton-card" style="height:120px; margin-bottom:16px;"></div>
      <div class="stat-grid">
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
        <div class="skeleton skeleton-card"></div>
      </div>
    `;

    // Render after tiny delay for skeleton visibility
    setTimeout(() => {
      switch (route) {
        case 'dashboard': Views.renderDashboard(outlet); break;
        case 'hives': Views.renderHives(outlet); break;
        case 'inspections': Views.renderInspections(outlet); break;
        case 'treatments': Views.renderTreatments(outlet); break;
        case 'harvests': Views.renderHarvests(outlet); break;
        case 'advisor': Views.renderAdvisor(outlet); break;
        case 'knowledge': Views.renderKnowledge(outlet, params[0]); break;
        case 'reports': Views.renderReports(outlet); break;
        case 'reminders': Views.renderReminders(outlet); break;
        default: outlet.innerHTML = '<div class="empty"><div class="empty-illustration"><i data-lucide="alert-circle"></i></div><div class="empty-title">Sayfa bulunamadı</div><a href="#/dashboard" class="btn btn-secondary">Pano\'ya dön</a></div>';
      }
      // Re-initialize Lucide icons after render
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
      // Update badges
      if (window.AppHooks && window.AppHooks.updateBadges) {
        window.AppHooks.updateBadges();
      }
    }, 50);
  }

  function render() {
    const { route, params } = parseHash();
    setActiveLink(route);
    setPageTitle(route);
    renderRoute(route, params);
  }

  function go(hash) {
    location.hash = hash;
  }

  function refresh() {
    render();
  }

  function init() {
    window.addEventListener('hashchange', render);
    render();
  }

  global.Router = { init, go, refresh, renderRoute };
})(window);
