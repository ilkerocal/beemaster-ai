/* ============================================================
   BeeMaster AI — App Entry
   ============================================================ */

(function () {
  'use strict';

  const ROUTES_REQUIRING_BOTTOM = new Set(['hives', 'reminders', 'reports']);

  function boot() {
    // Default region
    if (!window.BeeDb.getSettings().region || window.BeeDb.getSettings().region === 'TR-Diyarbakir') {
      window.BeeDb.updateSettings({ region: 'TR-Diyarbakir-Egil' });
    }

    // Theme init
    initTheme();

    // First-run seed
    if (window.BeeDb.listApiaries().length === 0) seedSample();

    // Router
    window.Router.init();

    // Initialize Lucide icons
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }

    // Theme toggle
    document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

    // Region picker
    document.getElementById('btn-region-mobile')?.addEventListener('click', openRegionPicker);

    // Settings buttons
    document.getElementById('btn-settings')?.addEventListener('click', openSettingsModal);
    document.getElementById('btn-settings-desktop')?.addEventListener('click', openSettingsModal);

    // Export / Import
    document.getElementById('btn-export')?.addEventListener('click', exportData);
    document.getElementById('btn-import')?.addEventListener('click', importData);

    // Search
    document.getElementById('search-input')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.value.trim()) {
        const q = e.target.value.trim();
        window.BeeViews.openSearchResults(q);
      }
    });

    // Periodically refresh badges
    updateBadges();
    setInterval(updateBadges, 60 * 1000);

    // Re-initialize Lucide icons after each render (for dynamic content)
    hookLucideRefresh();
  }

  function initTheme() {
    const saved = localStorage.getItem('beemaster:theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    updateThemeIcon(saved);
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('beemaster:theme', next);
    updateThemeIcon(next);
    // Re-render to update Recharts colors
    window.Router.refresh();
  }

  function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (!icon) return;
    icon.setAttribute('data-lucide', theme === 'dark' ? 'sun' : 'moon');
    if (window.lucide) window.lucide.createIcons();
  }

  function hookLucideRefresh() {
    const outlet = document.getElementById('route-outlet');
    if (!outlet) return;
    const observer = new MutationObserver(() => {
      if (window.lucide && window.lucide.createIcons) {
        window.lucide.createIcons();
      }
    });
    observer.observe(outlet, { childList: true, subtree: true });
  }

  function updateBadges() {
    if (!window.BeeReminders) return;
    try {
      const active = window.BeeReminders.getActive();
      const hiveCount = window.BeeDb.listHives().length;
      setBadge('reminders-badge', active.length);
      setBadge('reminders-badge-mobile', active.length);
      setBadge('hives-badge', hiveCount);
      setBadge('hives-badge-mobile', hiveCount);
    } catch (e) {}
  }

  function setBadge(id, count) {
    const el = document.getElementById(id);
    if (!el) return;
    if (count > 0) {
      el.textContent = count;
      el.style.display = 'inline-flex';
    } else {
      el.style.display = 'none';
    }
  }

  function openRegionPicker() {
    if (!window.BeeRegion || !window.BeeViews) return;
    const regions = window.BeeRegion.list();
    const current = window.BeeDb.getSettings().region;
    const items = regions.map((r, i) => ({
      label: r.label + (r.key === current ? ' ✓' : ''),
      value: r.key,
    }));
    window.BeeViews.openChoiceModal('Bölge seç', items, (key) => {
      if (key) {
        window.BeeDb.updateSettings({ region: key });
        window.BeeViews.toast('Bölge güncellendi', 'success');
        window.Router.refresh();
      }
    });
  }

  function openSettingsModal() {
    if (!window.BeeViews) return;
    const settings = window.BeeDb.getSettings();
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">Ayarlar</h2>
        <button class="icon-btn" data-modal-close aria-label="Kapat"><i data-lucide="x"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label class="label">Tema</label>
          <select id="set-theme" class="select">
            <option value="dark" ${settings.theme === 'dark' || !settings.theme ? 'selected' : ''}>Koyu</option>
            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>Açık</option>
            <option value="auto" ${settings.theme === 'auto' ? 'selected' : ''}>Otomatik (sistem)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="label">Muayene sıklığı (gün)</label>
          <input id="set-interval" type="number" class="input" min="3" max="60" value="${settings.inspectionIntervalDays || 14}"/>
          <div class="input-help">Yeni hatırlatıcılar bu kadar günde bir hesaplanır.</div>
        </div>
        <div class="form-group">
          <label class="label">Uyarı lead time (gün)</label>
          <input id="set-lead" type="number" class="input" min="0" max="14" value="${settings.reminderLeadDays || 3}"/>
          <div class="input-help">Muayene tarihinden kaç gün önce uyarı verilsin.</div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-modal-close>İptal</button>
        <button class="btn btn-primary" id="set-save">Kaydet</button>
      </div>
    `;
    window.BeeViews.openModal(html);
    document.querySelectorAll('[data-modal-close]').forEach(b => b.addEventListener('click', () => window.BeeViews.closeModal()));
    document.getElementById('set-save').addEventListener('click', () => {
      const theme = document.getElementById('set-theme').value;
      const interval = parseInt(document.getElementById('set-interval').value) || 14;
      const lead = parseInt(document.getElementById('set-lead').value) || 3;
      window.BeeDb.updateSettings({ theme, inspectionIntervalDays: interval, reminderLeadDays: lead });
      if (theme !== 'auto') {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('beemaster:theme', theme);
        updateThemeIcon(theme);
      }
      window.BeeViews.closeModal();
      window.BeeViews.toast('Ayarlar kaydedildi', 'success');
      window.Router.refresh();
    });
    if (window.lucide) window.lucide.createIcons();
  }

  function exportData() {
    const json = window.BeeDb.exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beemaster-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.BeeViews.toast('Veri dışa aktarıldı', 'success');
  }

  function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          window.BeeDb.importJson(ev.target.result);
          updateBadges();
          window.BeeViews.toast('Veri içe aktarıldı', 'success');
          window.Router.refresh();
        } catch (err) {
          window.BeeViews.toast('Geçersiz JSON: ' + err.message, 'error');
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  function seedSample() {
    const apiary = window.BeeDb.addApiary({
      name: 'Eğil / Diyarbakır Arılığı',
      location: { region: 'TR-Diyarbakır-Eğil', coordinates: { lat: 38.24, lon: 40.10 } },
      owner: 'Arıcı',
      notes: 'Eğil örnek verileri.',
    });
    window.BeeDb.updateSettings({ region: 'TR-Diyarbakir-Egil' });
    window.BeeDb.addHive({
      apiaryId: apiary.id,
      label: 'H-17',
      hiveType: 'Langstroth',
      frames: 10,
      queenSubspecies: 'Anadolu',
      queenInstalled: new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10),
      queenMarking: 'green',
      queenOrigin: 'Yerel yetiştirici',
      inspectionIntervalDays: 14,
    });
    window.BeeDb.addHive({
      apiaryId: apiary.id,
      label: 'H-22',
      hiveType: 'Dadant',
      frames: 10,
      queenSubspecies: 'Karpat',
      queenInstalled: new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10),
      queenMarking: 'red',
      queenOrigin: 'Yerel yetiştirici',
      inspectionIntervalDays: 14,
    });
  }

  // Expose for Router
  window.AppHooks = { updateBadges };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
