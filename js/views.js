/* ============================================================
   BeeMaster AI — Views
   Renders route templates + handles UI interactions.
   Targets the current design system: tokens.css / components.css /
   layout.css / routes.css (glass cards, stat-grid, hive-card, etc.)
   ============================================================ */

(function (global) {
  'use strict';

  const Db = global.BeeDb;
  const Risk = global.BeeRisk;
  const Advisor = global.BeeAdvisor;
  const Kb = global.BeeKb;
  const Region = global.BeeRegion;
  const Learning = global.BeeLearning;
  const Forum = global.BeeForumSearch;
  const Media = global.BeeMedia;
  const Reminders = global.BeeReminders;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHtml(s) {
    return String(s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('tr-TR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function icon(name, extra = '') {
    return `<i data-lucide="${name}" ${extra}></i>`;
  }

  function riskTone(pct, invert = false) {
    // Returns { color, cls } using the current token palette.
    if (invert) {
      if (pct >= 75) return { color: 'var(--positive)', cls: 'positive' };
      if (pct >= 50) return { color: 'var(--warning)', cls: 'warning' };
      return { color: 'var(--danger)', cls: 'danger' };
    }
    if (pct < 35) return { color: 'var(--positive)', cls: 'positive' };
    if (pct < 65) return { color: 'var(--warning)', cls: 'warning' };
    return { color: 'var(--danger)', cls: 'danger' };
  }

  // ===========================================================
  // Toast
  // ===========================================================

  function toast(msg, kind = 'info') {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const iconMap = { success: 'check-circle', warning: 'alert-triangle', error: 'x-circle', info: 'info' };
    const el = document.createElement('div');
    el.className = `toast toast-${kind}`;
    el.innerHTML = `
      <span class="toast-icon">${icon(iconMap[kind] || 'info')}</span>
      <div class="toast-content">${escapeHtml(msg)}</div>
      <button class="toast-close" aria-label="Kapat">${icon('x')}</button>
    `;
    root.appendChild(el);
    if (window.lucide) window.lucide.createIcons();
    const remove = () => { el.style.opacity = '0'; setTimeout(() => el.remove(), 200); };
    el.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, 4000);
  }

  // ===========================================================
  // Modal
  // ===========================================================

  function openModal(innerHtml, size = '') {
    closeModal();
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.id = 'active-modal-backdrop';
    backdrop.innerHTML = `<div class="modal ${size}">${innerHtml}</div>`;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal();
    });
    document.getElementById('modal-root').appendChild(backdrop);
    if (window.lucide) window.lucide.createIcons();
    document.addEventListener('keydown', escCloseHandler);
  }

  function escCloseHandler(e) {
    if (e.key === 'Escape') closeModal();
  }

  function closeModal() {
    const el = document.getElementById('active-modal-backdrop');
    if (el) el.remove();
    document.removeEventListener('keydown', escCloseHandler);
  }

  function wireModalClose() {
    $$('[data-modal-close]').forEach((b) => b.addEventListener('click', () => closeModal()));
  }

  function openChoiceModal(title, items, onPick) {
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">${escapeHtml(title)}</h2>
        <button class="icon-btn" data-modal-close aria-label="Kapat">${icon('x')}</button>
      </div>
      <div class="modal-body" style="display:flex; flex-direction:column; gap:8px;">
        ${items.map((it) => `<button class="btn btn-secondary" style="justify-content:flex-start;" data-choice="${escapeHtml(it.value)}">${escapeHtml(it.label)}</button>`).join('')}
      </div>
    `;
    openModal(html);
    wireModalClose();
    $$('[data-choice]').forEach((b) => {
      b.addEventListener('click', () => {
        closeModal();
        onPick(b.dataset.choice);
      });
    });
  }

  function openSearchResults(query) {
    const results = Forum && Forum.smart ? Forum.smart(query) : [];
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">"${escapeHtml(query)}" için sonuçlar</h2>
        <button class="icon-btn" data-modal-close aria-label="Kapat">${icon('x')}</button>
      </div>
      <div class="modal-body">
        ${(!results || results.length === 0)
          ? '<div class="empty"><div class="empty-title">Sonuç bulunamadı</div><div class="empty-sub">Bilgi tabanında veya danışmanda arayın.</div></div>'
          : `<div class="task-list">${results.map((r) => `
              <a class="task-item" href="${r.url || '#'}" target="_blank" rel="noopener">
                <span class="task-priority low"></span>
                <span class="task-text"><span class="task-text-main">${escapeHtml(r.title || r.label || query)}</span><span class="task-text-meta">${escapeHtml(r.source || '')}</span></span>
              </a>`).join('')}</div>`}
      </div>
      <div class="modal-footer">
        <a class="btn btn-secondary" href="#/knowledge" data-modal-close>Bilgi tabanına git</a>
        <a class="btn btn-primary" href="#/advisor" data-modal-close>Danışmana sor</a>
      </div>
    `;
    openModal(html);
    wireModalClose();
  }

  // ===========================================================
  // Dashboard
  // ===========================================================

  function renderDashboard(outlet) {
    const apiary = Db.getActiveApiaryId() ? Db.getApiary(Db.getActiveApiaryId()) : null;
    const hives = Db.listHives();
    const stats = Db.getApiaryStats();
    const risks = hives.map((h) => Risk.compute(h, Db.listInspections(h.id)[0]));
    const aggRisk = Risk.aggregate(risks) || { disease: 0, swarm: 0, starvation: 0, queenFailure: 0, honeyProduction: 60, winterSurvival: 60 };
    const activeReminders = Reminders ? Reminders.getActive() : [];

    const statCards = [
      { label: 'Kovan', value: stats.hiveCount, meta: 'aktif', ic: 'hexagon' },
      { label: 'Muayene', value: stats.inspectionCount, meta: 'toplam', ic: 'clipboard-list' },
      { label: 'Tedavi', value: stats.treatmentCount, meta: 'uygulanan', ic: 'pill' },
      { label: 'Toplam bal', value: `${stats.totalYieldKg.toFixed(1)} kg`, meta: 'tüm zamanlar', ic: 'drumstick' },
    ];

    const axes = [
      { key: 'disease', label: 'Hastalık', ic: 'bug' },
      { key: 'swarm', label: 'Oğul', ic: 'wind' },
      { key: 'starvation', label: 'Açlık', ic: 'battery-warning' },
      { key: 'queenFailure', label: 'Ana arı', ic: 'crown' },
      { key: 'honeyProduction', label: 'Bal üretimi', ic: 'droplets', invert: true },
      { key: 'winterSurvival', label: 'Kış sağ kalım', ic: 'snowflake', invert: true },
    ];

    const recentIns = Db.listInspections().slice(0, 5);
    const tasks = [];
    hives.forEach((h) => {
      const ins = Db.listInspections(h.id)[0];
      const lastDate = ins ? new Date(ins.date) : null;
      const daysSince = lastDate ? Math.floor((Date.now() - lastDate.getTime()) / 86400000) : 999;
      if (daysSince > 14) {
        tasks.push({ hive: h.label, task: daysSince === 999 ? 'İlk muayene yapılmadı' : `${daysSince} gündür muayene yok`, priority: daysSince > 30 ? 'high' : 'medium' });
      }
      if (ins && (ins.varroaPer100 || 0) > 3) {
        tasks.push({ hive: h.label, task: `Mite yüksek: ${ins.varroaPer100}/100`, priority: 'high' });
      }
    });
    tasks.sort((a, b) => (a.priority === 'high' ? -1 : 1) - (b.priority === 'high' ? -1 : 1));

    outlet.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Pano</h1>
          <div class="page-head-sub">${apiary ? `${escapeHtml(apiary.name)} • ${escapeHtml(apiary.location?.region || '')} • ${hives.length} kovan` : 'Arılık seçin veya yeni bir arılık oluşturun.'}</div>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-secondary" data-action="quick-inspection">${icon('clipboard-list')} Muayene ekle</button>
          <button class="btn btn-primary" data-action="ask-advisor">${icon('sparkles')} Danışmana sor</button>
        </div>
      </div>

      <div class="stat-grid">
        ${statCards.map((s) => `
          <div class="stat-card">
            <div class="stat-header">
              <span class="stat-label">${s.label}</span>
              <span class="stat-icon">${icon(s.ic)}</span>
            </div>
            <div class="stat-value">${s.value}</div>
            <div class="stat-trend">${s.meta}</div>
          </div>
        `).join('')}
      </div>

      <div class="card" style="margin-top:16px;">
        <div class="card-head">
          <div>
            <div class="card-title">Risk özeti</div>
            <div class="card-sub">Arılık genelinde 6 eksen ortalaması</div>
          </div>
        </div>
        <div class="card-body">
          <div class="stat-grid">
            ${axes.map((a) => {
              const v = aggRisk[a.key] ?? 0;
              const tone = riskTone(v, a.invert);
              return `
                <div class="stat-card">
                  <div class="stat-header">
                    <span class="stat-label">${a.label}</span>
                    <span class="stat-icon">${icon(a.ic)}</span>
                  </div>
                  <div class="stat-value">${v}<span class="stat-value-suffix">%</span></div>
                  <div class="risk-meter">
                    <div class="risk-meter-track"><div class="risk-meter-fill" style="width:${v}%; background:${tone.color};"></div></div>
                  </div>
                  <div class="stat-trend">${a.invert ? 'yüksek = iyi' : 'yüksek = riskli'}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <div class="two-col" style="display:grid; grid-template-columns:1fr; gap:16px; margin-top:16px;">
        <div class="card">
          <div class="card-head">
            <div class="card-title">Yaklaşan görevler</div>
            <a href="#/reminders" class="btn btn-ghost btn-sm">Tümü</a>
          </div>
          <div class="card-body">
            <div class="task-list">
              ${tasks.length === 0
                ? '<div class="empty"><div class="empty-title">Yaklaşan görev yok</div><div class="empty-sub">Tüm kovanlar güncel görünüyor 🎉</div></div>'
                : tasks.slice(0, 6).map((t) => `
                  <div class="task-item">
                    <span class="task-priority ${t.priority}"></span>
                    <span class="task-text"><span class="task-text-main">${escapeHtml(t.hive)}</span><span class="task-text-meta">${escapeHtml(t.task)}</span></span>
                  </div>
                `).join('')}
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div class="card-title">Son muayeneler</div>
            <a href="#/inspections" class="btn btn-ghost btn-sm">Tümü</a>
          </div>
          <div class="card-body">
            <div class="task-list">
              ${recentIns.length === 0
                ? '<div class="empty"><div class="empty-title">Henüz muayene yok</div></div>'
                : recentIns.map((i) => {
                  const hive = Db.getHive(i.hiveId);
                  return `
                    <div class="task-item">
                      <span class="task-priority low"></span>
                      <span class="task-text"><span class="task-text-main">${escapeHtml(hive?.label || '?')} — ${fmtDate(i.date)}</span><span class="task-text-meta">yavru ${i.framesOfBrood ?? '?'} • mite ${i.varroaPer100 ?? '?'}/100${i.notes ? ' • ' + escapeHtml(i.notes.slice(0, 40)) : ''}</span></span>
                    </div>
                  `;
                }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="card" style="margin-top:16px;">
        <div class="card-head">
          <div class="card-title">Kovanlar</div>
          <button class="btn btn-primary btn-sm" data-action="add-hive">${icon('plus')} Yeni kovan</button>
        </div>
        <div class="card-body">
          <div class="hive-grid">
            ${hives.length === 0
              ? '<div class="empty" style="grid-column:1/-1;"><div class="empty-title">Henüz kovan yok</div><div class="empty-sub">+ Yeni kovan ile başlayın.</div></div>'
              : hives.map((h) => renderHiveCard(h)).join('')}
          </div>
        </div>
      </div>
    `;

    $$('.hive-card', outlet).forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-edit-hive],[data-delete-hive]')) return;
        location.hash = `#/hives/${el.dataset.hiveId}`;
      });
    });
    wireHiveCardActions(outlet, () => renderDashboard(outlet));

    $('[data-action="quick-inspection"]', outlet)?.addEventListener('click', () => openInspectionModal());
    $('[data-action="ask-advisor"]', outlet)?.addEventListener('click', () => { location.hash = '#/advisor'; });
    $('[data-action="add-hive"]', outlet)?.addEventListener('click', () => openHiveModal());
  }

  function renderHiveCard(h) {
    const ins = Db.listInspections(h.id)[0];
    const risk = Risk.compute(h, ins);
    const strength = (ins?.framesOfBees || 0) >= 7 ? 'positive' : (ins?.framesOfBees || 0) >= 4 ? 'warning' : 'danger';
    const strengthLabel = { positive: 'güçlü', warning: 'orta', danger: 'zayıf' }[strength];
    const queenAge = Risk.queenAgeInMonths(h, new Date());
    const qPerf = Risk.queenPerformance(h, Db.listInspections(h.id));
    return `
      <div class="hive-card" data-hive-id="${h.id}">
        <div class="hive-card-head">
          <div>
            <div class="hive-card-name">${escapeHtml(h.label)}</div>
            <div class="hive-card-subspecies">${escapeHtml(h.queenSubspecies || '—')}</div>
          </div>
          <span class="badge badge-${strength === 'positive' ? 'positive' : strength === 'warning' ? 'warning' : 'danger'}">${strengthLabel}</span>
        </div>
        <div class="hive-card-stats">
          <div class="hive-card-stat">
            <div class="hive-card-stat-value">${ins?.framesOfBrood ?? '—'}</div>
            <div class="hive-card-stat-label">yavru</div>
          </div>
          <div class="hive-card-stat">
            <div class="hive-card-stat-value">${ins?.framesOfBees ?? '—'}</div>
            <div class="hive-card-stat-label">arı</div>
          </div>
          <div class="hive-card-stat">
            <div class="hive-card-stat-value text-${(ins?.varroaPer100 || 0) > 3 ? 'danger' : 'muted'}">${ins?.varroaPer100 ?? '—'}</div>
            <div class="hive-card-stat-label">mite/100</div>
          </div>
        </div>
        <div class="hive-card-footer">
          <span class="hive-card-queen"><span class="queen-dot"></span>ana arı ${queenAge} ay${qPerf ? ` · ${escapeHtml(qPerf.label)}` : ''}</span>
          <span>${ins ? fmtDate(ins.date) : 'muayene yok'}</span>
        </div>
        <div class="hive-card-actions">
          <button class="btn btn-secondary btn-sm" data-edit-hive="${h.id}">${icon('pencil')} Düzenle</button>
          <button class="btn btn-danger btn-sm" data-delete-hive="${h.id}">${icon('trash-2')} Sil</button>
        </div>
      </div>
    `;
  }

  function wireHiveCardActions(outlet, onChange) {
    $$('[data-edit-hive]', outlet).forEach((b) => {
      b.addEventListener('click', (e) => { e.stopPropagation(); openHiveModal(b.dataset.editHive); });
    });
    $$('[data-delete-hive]', outlet).forEach((b) => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.dataset.deleteHive;
        const hive = Db.getHive(id);
        if (confirm(`${hive ? hive.label : 'Bu kovan'} silinecek. Tüm muayeneleri de silinir. Emin misin?`)) {
          Db.deleteHive(id);
          toast('Kovan silindi', 'success');
          onChange();
        }
      });
    });
  }

  // ===========================================================
  // Hives route
  // ===========================================================

  function renderHives(outlet) {
    const hives = Db.listHives();
    outlet.innerHTML = `
      <div class="page-head">
        <div><h1>Kovanlarım</h1><div class="page-head-sub">${hives.length} kovan</div></div>
        <div class="page-head-actions">
          <button class="btn btn-primary" data-action="add-hive">${icon('plus')} Yeni kovan</button>
        </div>
      </div>
      <div class="hive-grid">
        ${hives.length === 0
          ? '<div class="empty" style="grid-column:1/-1;"><div class="empty-title">Henüz kovan yok</div></div>'
          : hives.map((h) => renderHiveCard(h)).join('')}
      </div>
    `;
    $$('.hive-card', outlet).forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.closest('[data-edit-hive],[data-delete-hive]')) return;
        location.hash = `#/hives/${el.dataset.hiveId}`;
      });
    });
    wireHiveCardActions(outlet, () => renderHives(outlet));
    $('[data-action="add-hive"]', outlet).addEventListener('click', () => openHiveModal());
  }

  // ===========================================================
  // Inspections route
  // ===========================================================

  function renderInspections(outlet) {
    const list = Db.listInspections();
    outlet.innerHTML = `
      <div class="page-head">
        <div><h1>Muayeneler</h1><div class="page-head-sub">${list.length} kayıt</div></div>
        <div class="page-head-actions">
          <button class="btn btn-primary" data-action="add-inspection">${icon('plus')} Yeni muayene</button>
        </div>
      </div>
      <div class="card">
        <div class="card-body" style="padding:0;">
          <div class="table-wrap"><div class="table-scroll">
            <table class="table">
              <thead><tr><th>Tarih</th><th>Kovan</th><th>Yavru</th><th>Arı</th><th>Bal</th><th>Mite/100</th><th>Not</th><th></th></tr></thead>
              <tbody>
                ${list.length === 0 ? `<tr><td colspan="8"><div class="empty"><div class="empty-title">Henüz muayene kaydı yok</div></div></td></tr>` : list.map((i) => {
                  const hive = Db.getHive(i.hiveId);
                  return `<tr>
                    <td>${fmtDate(i.date)}</td>
                    <td>${escapeHtml(hive?.label || '?')}</td>
                    <td>${i.framesOfBrood ?? '—'}</td>
                    <td>${i.framesOfBees ?? '—'}</td>
                    <td>${i.framesOfStores ?? '—'}</td>
                    <td>${i.varroaPer100 ?? '—'}</td>
                    <td>${escapeHtml((i.notes || '').slice(0, 40))}</td>
                    <td><button class="btn btn-ghost btn-sm" data-del-ins="${i.id}">${icon('trash-2')}</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div></div>
        </div>
      </div>
    `;
    $$('[data-del-ins]', outlet).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Bu muayeneyi sil?')) {
          Db.deleteInspection(btn.dataset.delIns);
          toast('Muayene silindi', 'success');
          renderInspections(outlet);
        }
      });
    });
    $('[data-action="add-inspection"]', outlet).addEventListener('click', () => openInspectionModal());
  }

  // ===========================================================
  // Treatments route
  // ===========================================================

  function renderTreatments(outlet) {
    const list = Db.listTreatments();
    outlet.innerHTML = `
      <div class="page-head">
        <div><h1>Tedaviler</h1><div class="page-head-sub">${list.length} kayıt</div></div>
        <div class="page-head-actions">
          <button class="btn btn-primary" data-action="add-treatment">${icon('plus')} Yeni tedavi</button>
        </div>
      </div>
      <div class="card">
        <div class="card-body" style="padding:0;">
          <div class="table-wrap"><div class="table-scroll">
            <table class="table">
              <thead><tr><th>Tarih</th><th>Kovan</th><th>Madde</th><th>Doz</th><th>Sonuç</th><th></th></tr></thead>
              <tbody>
                ${list.length === 0 ? `<tr><td colspan="6"><div class="empty"><div class="empty-title">Henüz tedavi kaydı yok</div></div></td></tr>` : list.map((t) => {
                  const hive = Db.getHive(t.hiveId);
                  const outcomeCls = t.outcome === 'success' ? 'positive' : t.outcome === 'failed' ? 'danger' : 'warning';
                  return `<tr>
                    <td>${fmtDate(t.date)}</td>
                    <td>${escapeHtml(hive?.label || '?')}</td>
                    <td>${escapeHtml(t.substance || '—')}</td>
                    <td>${escapeHtml(t.dose || '—')}</td>
                    <td><span class="badge badge-${outcomeCls}">${escapeHtml(t.outcome || 'beklemede')}</span></td>
                    <td><button class="btn btn-ghost btn-sm" data-del-tr="${t.id}">${icon('trash-2')}</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div></div>
        </div>
      </div>
    `;
    $$('[data-del-tr]', outlet).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Tedaviyi sil?')) {
          Db.deleteTreatment(btn.dataset.delTr);
          toast('Tedavi silindi', 'success');
          renderTreatments(outlet);
        }
      });
    });
    $('[data-action="add-treatment"]', outlet).addEventListener('click', () => openTreatmentModal());
  }

  // ===========================================================
  // Harvests route
  // ===========================================================

  function renderHarvests(outlet) {
    const list = Db.listHarvests();
    const total = list.reduce((s, h) => s + (Number(h.yieldKg) || 0), 0);
    outlet.innerHTML = `
      <div class="page-head">
        <div><h1>Hasat</h1><div class="page-head-sub">${list.length} kayıt • ${total.toFixed(1)} kg toplam</div></div>
        <div class="page-head-actions">
          <button class="btn btn-primary" data-action="add-harvest">${icon('plus')} Yeni hasat</button>
        </div>
      </div>
      <div class="card">
        <div class="card-body" style="padding:0;">
          <div class="table-wrap"><div class="table-scroll">
            <table class="table">
              <thead><tr><th>Tarih</th><th>Kovan</th><th>Verim (kg)</th><th>Nem %</th><th>Flora</th><th></th></tr></thead>
              <tbody>
                ${list.length === 0 ? `<tr><td colspan="6"><div class="empty"><div class="empty-title">Henüz hasat kaydı yok</div></div></td></tr>` : list.map((h) => {
                  const hive = Db.getHive(h.hiveId);
                  return `<tr>
                    <td>${fmtDate(h.date)}</td>
                    <td>${escapeHtml(hive?.label || '?')}</td>
                    <td>${h.yieldKg ?? '—'}</td>
                    <td>${h.moisture ?? '—'}</td>
                    <td>${escapeHtml(h.flora || '—')}</td>
                    <td><button class="btn btn-ghost btn-sm" data-del-ha="${h.id}">${icon('trash-2')}</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div></div>
        </div>
      </div>
    `;
    $$('[data-del-ha]', outlet).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Hasat kaydını sil?')) {
          Db.deleteHarvest(btn.dataset.delHa);
          toast('Hasat silindi', 'success');
          renderHarvests(outlet);
        }
      });
    });
    $('[data-action="add-harvest"]', outlet).addEventListener('click', () => openHarvestModal());
  }

  // ===========================================================
  // Reminders route
  // ===========================================================

  function renderReminders(outlet) {
    const all = Reminders ? Reminders.getAll() : [];
    outlet.innerHTML = `
      <div class="page-head">
        <div><h1>Hatırlatıcılar</h1><div class="page-head-sub">${all.length} kovan izleniyor</div></div>
      </div>
      <div class="card"><div class="card-body">
        ${all.length === 0 ? '<div class="empty"><div class="empty-title">Henüz kovan yok</div></div>' : all.map((r) => {
          const info = Reminders.statusInfo(r.status);
          return `
            <div class="reminder-card ${r.status}">
              <div class="reminder-card-head">
                <span class="reminder-hive">${escapeHtml(r.hive.label)}</span>
                <span class="badge badge-${r.status === 'overdue' ? 'danger' : r.status === 'due' || r.status === 'soon' ? 'warning' : 'neutral'}">${escapeHtml(info.label)}</span>
              </div>
              <div class="reminder-due">
                <span class="reminder-due-date">${r.dueDate ? fmtDate(r.dueDate) : '—'}</span>
                <span class="reminder-days ${r.status === 'overdue' ? 'urgent' : ''}">${r.daysUntilDue > 0 ? `${r.daysUntilDue} gün kaldı` : r.daysUntilDue === 0 ? 'bugün' : `${Math.abs(r.daysUntilDue)} gün gecikti`}</span>
              </div>
              <div class="reminder-card-actions">
                <button class="btn btn-secondary btn-sm" data-dismiss="${r.hive.id}">Bugün gizle</button>
                <button class="btn btn-primary btn-sm" data-inspect="${r.hive.id}">${icon('clipboard-list')} Muayene yap</button>
              </div>
            </div>
          `;
        }).join('')}
      </div></div>
    `;
    $$('[data-dismiss]', outlet).forEach((b) => b.addEventListener('click', () => {
      Reminders.dismissToday(b.dataset.dismiss);
      toast('Bugün için gizlendi', 'success');
      renderReminders(outlet);
      if (window.AppHooks) window.AppHooks.updateBadges();
    }));
    $$('[data-inspect]', outlet).forEach((b) => b.addEventListener('click', () => openInspectionModal(b.dataset.inspect)));
  }

  // ===========================================================
  // Advisor route
  // ===========================================================

  function renderAdvisor(outlet) {
    const hives = Db.listHives();
    const scenarios = [
      { key: 'mite-count', label: 'Varroa sayımı', ic: 'bug' },
      { key: 'queenless', label: 'Ana arısız şüphesi', ic: 'crown' },
      { key: 'swarm', label: 'Oğul riski', ic: 'wind' },
      { key: 'feeding', label: 'Besleme kararı', ic: 'droplets' },
      { key: 'afb-suspect', label: 'AFB şüphesi', ic: 'alert-triangle' },
      { key: 'winter-prep', label: 'Kışa hazırlık', ic: 'snowflake' },
    ];
    outlet.innerHTML = `
      <div class="page-head">
        <div><h1>Danışman</h1><div class="page-head-sub">Bir senaryo seçin, kurallara dayalı öneri alın.</div></div>
      </div>
      <div class="advisor-grid">
        <div class="card">
          <div class="card-head"><div class="card-title">Hızlı senaryolar</div></div>
          <div class="card-body">
            <div class="form-group">
              <label class="label">Kovan</label>
              <select id="advisor-hive" class="select">
                <option value="">— genel —</option>
                ${hives.map((h) => `<option value="${h.id}">${escapeHtml(h.label)}</option>`).join('')}
              </select>
            </div>
            <div class="scenario-grid">
              ${scenarios.map((s) => `<button class="scenario-btn" data-scenario="${s.key}"><span class="scenario-btn-icon">${icon(s.ic)}</span>${s.label}</button>`).join('')}
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><div class="card-title">Sonuç</div></div>
          <div class="card-body" id="advisor-output">
            <div class="empty"><div class="empty-title">Bir senaryo seçin</div><div class="empty-sub">Sonuç burada görünecek.</div></div>
          </div>
        </div>
      </div>
    `;

    $$('[data-scenario]', outlet).forEach((btn) => {
      btn.addEventListener('click', () => runScenario(btn.dataset.scenario, outlet));
    });
  }

  function runScenario(key, outlet) {
    const out = $('#advisor-output', outlet);
    const hiveId = $('#advisor-hive', outlet)?.value;
    const hive = hiveId ? Db.getHive(hiveId) : null;
    const regionKey = Db.getSettings().region;

    const inputPrompts = {
      'mite-count': { label: '100 arı üzerinden mite sayısı', key: 'matchCount', def: '3' },
      'queenless': { label: 'Kaç gündür yumurta görülmüyor', key: 'daysSinceEggs', def: '10' },
      'swarm': { label: 'Kaç adet ana arı hücresi var', key: 'queenCells', def: '1' },
      'feeding': { label: 'Stok kaç çerçeve', key: 'framesOfStores', def: '3' },
      'afb-suspect': { label: 'Şüpheli semptom notu', key: 'symptom', def: 'çökük/delikli kapak' },
      'winter-prep': { label: 'Mevcut stok (çerçeve)', key: 'framesOfStores', def: '6' },
    };
    const p = inputPrompts[key];
    const val = prompt(p.label + ':', p.def);
    if (val === null) return;

    const input = { [p.key]: val };
    const context = {
      region: regionKey,
      regionKey,
      queenAge: hive ? Risk.queenAgeInMonths(hive, new Date()) : null,
      date: new Date().toISOString(),
    };

    let result;
    try {
      result = Advisor.handleScenario(key, input, context);
    } catch (e) {
      out.innerHTML = `<div class="empty"><div class="empty-title">Hesaplanamadı</div><div class="empty-sub">${escapeHtml(e.message)}</div></div>`;
      return;
    }
    out.innerHTML = renderDecisionCard(result);
    if (window.lucide) window.lucide.createIcons();
  }

  function renderDecisionCard(result) {
    if (!result) return '<div class="empty"><div class="empty-title">Sonuç yok</div></div>';
    const sections = [
      { key: 'situation', label: 'Durum', ic: 'info', text: result.situation },
      { key: 'evidence', label: 'Kanıt', ic: 'search', text: Array.isArray(result.evidence) ? result.evidence.join(' • ') : result.evidence },
      { key: 'diagnosis', label: 'Tanı', ic: 'stethoscope', text: result.diagnosis },
      { key: 'action', label: 'Aksiyon', ic: 'check-circle', text: Array.isArray(result.actions) ? result.actions.join(' • ') : result.actions },
    ];
    return `
      <div class="decision-card">
        <div class="decision-warning is-${result.priority === 'high' ? 'critical' : result.priority === 'medium' ? 'warning' : 'info'}">
          ${icon('alert-triangle')}
          <span>Öncelik: ${escapeHtml(result.priority || '—')} • Güven: ${escapeHtml(result.confidence || '—')} (${result.confidencePct ?? '—'}%)</span>
        </div>
        ${sections.filter((s) => s.text).map((s) => `
          <div class="decision-section">
            <div class="decision-section-icon ${s.key}">${icon(s.ic)}</div>
            <div class="decision-section-content">
              <div class="decision-section-label">${s.label}</div>
              <div class="decision-section-value">${escapeHtml(s.text)}</div>
            </div>
          </div>
        `).join('')}
        ${result.expectedResult ? `<div class="decision-section"><div class="decision-section-icon action">${icon('target')}</div><div class="decision-section-content"><div class="decision-section-label">Beklenen sonuç</div><div class="decision-section-value">${escapeHtml(result.expectedResult)}</div></div></div>` : ''}
      </div>
    `;
  }

  // ===========================================================
  // Knowledge route
  // ===========================================================

  function renderKnowledge(outlet, moduleId) {
    const tree = (Kb && Kb.tree) || [];
    outlet.innerHTML = `
      <div class="page-head"><div><h1>Bilgi Tabanı</h1><div class="page-head-sub">Kanıta dayalı arıcılık referansı</div></div></div>
      <div class="kb-layout">
        <div class="kb-tree">
          ${tree.map((g) => `
            <div style="margin-bottom:12px;">
              <div style="font-size:11px; font-weight:600; text-transform:uppercase; color:var(--text-tertiary); padding:4px 8px;">${escapeHtml(g.group)}</div>
              ${g.items.map((it) => `<a href="#/knowledge/${it.id}" class="kb-tree-item ${it.id === moduleId ? 'active' : ''}">${escapeHtml(it.title)}</a>`).join('')}
            </div>
          `).join('')}
        </div>
        <div class="kb-viewer">
          ${moduleId && Kb && Kb.render ? Kb.render(moduleId) : '<div class="empty"><div class="empty-title">Bir modül seçin</div><div class="empty-sub">Sol menüden bir başlık seçerek özet bilgiye ulaşın.</div></div>'}
        </div>
      </div>
    `;
  }

  // ===========================================================
  // Reports route
  // ===========================================================

  function renderReports(outlet) {
    const reports = [
      { key: 'apiary-summary', title: 'Arılık özeti', desc: 'Kovan sayısı, muayene ve verim özeti', ic: 'file-text' },
      { key: 'risk-overview', title: 'Risk raporu', desc: '6 eksen risk dağılımı', ic: 'shield-alert' },
      { key: 'harvest-report', title: 'Hasat raporu', desc: 'Toplam ve kovan başına verim', ic: 'drumstick' },
    ];
    outlet.innerHTML = `
      <div class="page-head"><div><h1>Raporlar</h1><div class="page-head-sub">Dışa aktarılabilir özetler</div></div></div>
      <div class="report-grid">
        ${reports.map((r) => `
          <div class="report-card" data-report="${r.key}">
            <div class="report-icon">${icon(r.ic)}</div>
            <div class="report-title">${r.title}</div>
            <div class="report-desc">${r.desc}</div>
          </div>
        `).join('')}
      </div>
      <div class="card" id="report-result" style="margin-top:16px; display:none;"><div class="card-body"></div></div>
    `;
    $$('[data-report]', outlet).forEach((c) => {
      c.addEventListener('click', () => generateReport(c.dataset.report, outlet));
    });
  }

  function generateReport(type, outlet) {
    const box = $('#report-result', outlet);
    const body = box.querySelector('.card-body');
    const stats = Db.getApiaryStats();
    if (type === 'apiary-summary') {
      body.innerHTML = `<div class="card-title">Arılık özeti</div><div class="stat-grid" style="margin-top:12px;">
        <div class="stat-card"><div class="stat-label">Kovan</div><div class="stat-value">${stats.hiveCount}</div></div>
        <div class="stat-card"><div class="stat-label">Muayene</div><div class="stat-value">${stats.inspectionCount}</div></div>
        <div class="stat-card"><div class="stat-label">Tedavi</div><div class="stat-value">${stats.treatmentCount}</div></div>
        <div class="stat-card"><div class="stat-label">Toplam bal</div><div class="stat-value">${stats.totalYieldKg.toFixed(1)} kg</div></div>
      </div>`;
    } else if (type === 'risk-overview') {
      const hives = Db.listHives();
      const risks = hives.map((h) => ({ hive: h, r: Risk.compute(h, Db.listInspections(h.id)[0]) }));
      body.innerHTML = `<div class="card-title">Risk raporu</div><div class="table-wrap" style="margin-top:12px;"><table class="table">
        <thead><tr><th>Kovan</th><th>Hastalık</th><th>Oğul</th><th>Açlık</th><th>Ana arı</th></tr></thead>
        <tbody>${risks.map((x) => `<tr><td>${escapeHtml(x.hive.label)}</td><td>${x.r.disease}%</td><td>${x.r.swarm}%</td><td>${x.r.starvation}%</td><td>${x.r.queenFailure}%</td></tr>`).join('') || '<tr><td colspan="5">Kovan yok</td></tr>'}</tbody>
      </table></div>`;
    } else {
      const harvests = Db.listHarvests();
      body.innerHTML = `<div class="card-title">Hasat raporu</div><div class="table-wrap" style="margin-top:12px;"><table class="table">
        <thead><tr><th>Tarih</th><th>Kovan</th><th>Verim (kg)</th></tr></thead>
        <tbody>${harvests.map((h) => `<tr><td>${fmtDate(h.date)}</td><td>${escapeHtml(Db.getHive(h.hiveId)?.label || '?')}</td><td>${h.yieldKg ?? '—'}</td></tr>`).join('') || '<tr><td colspan="3">Hasat yok</td></tr>'}</tbody>
      </table></div>`;
    }
    box.style.display = '';
  }

  // ===========================================================
  // Modals — Apiary / Hive / Inspection / Treatment / Harvest
  // ===========================================================

  function openApiaryModal() {
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">Yeni arılık</h2>
        <button class="icon-btn" data-modal-close>${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-group"><label class="label">Ad</label><input id="ap-name" class="input" placeholder="Arılık adı"/></div>
        <div class="form-group"><label class="label">Sahibi</label><input id="ap-owner" class="input" placeholder="Arıcı adı"/></div>
        <div class="form-group"><label class="label">Not</label><textarea id="ap-notes" class="textarea"></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-modal-close>İptal</button>
        <button class="btn btn-primary" id="ap-save">Kaydet</button>
      </div>
    `;
    openModal(html);
    wireModalClose();
    $('#ap-save').addEventListener('click', () => {
      const name = $('#ap-name').value.trim();
      if (!name) { toast('Ad gerekli', 'error'); return; }
      Db.addApiary({ name, owner: $('#ap-owner').value.trim(), notes: $('#ap-notes').value.trim() });
      closeModal();
      toast('Arılık eklendi', 'success');
      window.Router.refresh();
    });
  }

  function openHiveModal(editId) {
    const hive = editId ? Db.getHive(editId) : null;
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">${hive ? 'Kovanı düzenle' : 'Yeni kovan'}</h2>
        <button class="icon-btn" data-modal-close>${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="label">Etiket</label><input id="hv-label" class="input" value="${escapeHtml(hive?.label || '')}" placeholder="H-1"/></div>
          <div class="form-group"><label class="label">Tip</label><input id="hv-type" class="input" value="${escapeHtml(hive?.hiveType || 'Langstroth')}"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="label">Ana arı ırkı</label><input id="hv-race" class="input" value="${escapeHtml(hive?.queenSubspecies || 'Anadolu arısı')}"/></div>
          <div class="form-group"><label class="label">Ana arı yerleştirme tarihi</label><input id="hv-qdate" type="date" class="input" value="${hive?.queenInstalled || ''}"/></div>
        </div>
        <div class="form-group"><label class="label">Çerçeve sayısı</label><input id="hv-frames" type="number" class="input" value="${hive?.frames ?? 10}"/></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-modal-close>İptal</button>
        <button class="btn btn-primary" id="hv-save">Kaydet</button>
      </div>
    `;
    openModal(html);
    wireModalClose();
    $('#hv-save').addEventListener('click', () => {
      const label = $('#hv-label').value.trim();
      if (!label) { toast('Etiket gerekli', 'error'); return; }
      const data = {
        label,
        hiveType: $('#hv-type').value.trim(),
        queenSubspecies: $('#hv-race').value.trim(),
        queenInstalled: $('#hv-qdate').value || undefined,
        frames: parseInt($('#hv-frames').value) || 10,
      };
      if (hive) Db.updateHive(hive.id, data);
      else Db.addHive(data);
      closeModal();
      toast(hive ? 'Kovan güncellendi' : 'Kovan eklendi', 'success');
      window.Router.refresh();
    });
  }

  function openInspectionModal(preselectHiveId) {
    const hives = Db.listHives();
    if (hives.length === 0) { toast('Önce bir kovan ekleyin', 'warning'); openHiveModal(); return; }
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">Yeni muayene</h2>
        <button class="icon-btn" data-modal-close>${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="label">Kovan</label>
            <select id="in-hive" class="select">${hives.map((h) => `<option value="${h.id}" ${h.id === preselectHiveId ? 'selected' : ''}>${escapeHtml(h.label)}</option>`).join('')}</select>
          </div>
          <div class="form-group"><label class="label">Tarih</label><input id="in-date" type="date" class="input" value="${new Date().toISOString().slice(0, 10)}"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="label">Yavru çerçevesi</label><input id="in-brood" type="number" class="input" value="4"/></div>
          <div class="form-group"><label class="label">Arı çerçevesi</label><input id="in-bees" type="number" class="input" value="6"/></div>
          <div class="form-group"><label class="label">Bal/stok çerçevesi</label><input id="in-stores" type="number" class="input" value="3"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="label">Varroa (100 arıda)</label><input id="in-varroa" type="number" step="0.1" class="input" value="0"/></div>
          <div class="form-group"><label class="label">Yavru deseni</label>
            <select id="in-pattern" class="select">
              <option value="solid">Düzgün</option>
              <option value="scattered">Dağınık</option>
              <option value="shotgun">Saçma (shotgun)</option>
            </select>
          </div>
        </div>
        <div class="form-group"><label class="label">Not</label><textarea id="in-notes" class="textarea" placeholder="Gözlemler..."></textarea></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-modal-close>İptal</button>
        <button class="btn btn-primary" id="in-save">Kaydet</button>
      </div>
    `;
    openModal(html);
    wireModalClose();
    $('#in-save').addEventListener('click', () => {
      const hiveId = $('#in-hive').value;
      const hive = Db.getHive(hiveId);
      Db.addInspection({
        hiveId,
        apiaryId: hive?.apiaryId,
        date: $('#in-date').value || new Date().toISOString().slice(0, 10),
        framesOfBrood: parseFloat($('#in-brood').value) || 0,
        framesOfBees: parseFloat($('#in-bees').value) || 0,
        framesOfStores: parseFloat($('#in-stores').value) || 0,
        varroaPer100: parseFloat($('#in-varroa').value) || 0,
        broodPattern: $('#in-pattern').value,
        notes: $('#in-notes').value.trim(),
      });
      if (Reminders) Reminders.completeInspection(hiveId);
      closeModal();
      toast('Muayene kaydedildi', 'success');
      if (window.AppHooks) window.AppHooks.updateBadges();
      window.Router.refresh();
    });
  }

  function openTreatmentModal() {
    const hives = Db.listHives();
    if (hives.length === 0) { toast('Önce bir kovan ekleyin', 'warning'); openHiveModal(); return; }
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">Yeni tedavi</h2>
        <button class="icon-btn" data-modal-close>${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="label">Kovan</label><select id="tr-hive" class="select">${hives.map((h) => `<option value="${h.id}">${escapeHtml(h.label)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="label">Tarih</label><input id="tr-date" type="date" class="input" value="${new Date().toISOString().slice(0, 10)}"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="label">Madde</label><input id="tr-substance" class="input" placeholder="Oksalik asit, vb."/></div>
          <div class="form-group"><label class="label">Doz</label><input id="tr-dose" class="input" placeholder="ör. 35g/L"/></div>
        </div>
        <div class="form-group"><label class="label">Sonuç</label>
          <select id="tr-outcome" class="select">
            <option value="pending">Beklemede</option>
            <option value="success">Başarılı</option>
            <option value="failed">Başarısız</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-modal-close>İptal</button>
        <button class="btn btn-primary" id="tr-save">Kaydet</button>
      </div>
    `;
    openModal(html);
    wireModalClose();
    $('#tr-save').addEventListener('click', () => {
      const hiveId = $('#tr-hive').value;
      const hive = Db.getHive(hiveId);
      Db.addTreatment({
        hiveId,
        apiaryId: hive?.apiaryId,
        date: $('#tr-date').value,
        substance: $('#tr-substance').value.trim(),
        dose: $('#tr-dose').value.trim(),
        outcome: $('#tr-outcome').value,
      });
      closeModal();
      toast('Tedavi kaydedildi', 'success');
      window.Router.refresh();
    });
  }

  function openHarvestModal() {
    const hives = Db.listHives();
    if (hives.length === 0) { toast('Önce bir kovan ekleyin', 'warning'); openHiveModal(); return; }
    const html = `
      <div class="modal-header">
        <h2 class="modal-title">Yeni hasat</h2>
        <button class="icon-btn" data-modal-close>${icon('x')}</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <div class="form-group"><label class="label">Kovan</label><select id="ha-hive" class="select">${hives.map((h) => `<option value="${h.id}">${escapeHtml(h.label)}</option>`).join('')}</select></div>
          <div class="form-group"><label class="label">Tarih</label><input id="ha-date" type="date" class="input" value="${new Date().toISOString().slice(0, 10)}"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label class="label">Verim (kg)</label><input id="ha-yield" type="number" step="0.1" class="input" value="0"/></div>
          <div class="form-group"><label class="label">Nem (%)</label><input id="ha-moisture" type="number" step="0.1" class="input" value="18"/></div>
        </div>
        <div class="form-group"><label class="label">Flora</label><input id="ha-flora" class="input" placeholder="Kekik, geven, vb."/></div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" data-modal-close>İptal</button>
        <button class="btn btn-primary" id="ha-save">Kaydet</button>
      </div>
    `;
    openModal(html);
    wireModalClose();
    $('#ha-save').addEventListener('click', () => {
      const hiveId = $('#ha-hive').value;
      const hive = Db.getHive(hiveId);
      Db.addHarvest({
        hiveId,
        apiaryId: hive?.apiaryId,
        date: $('#ha-date').value,
        yieldKg: parseFloat($('#ha-yield').value) || 0,
        moisture: parseFloat($('#ha-moisture').value) || null,
        flora: $('#ha-flora').value.trim(),
      });
      closeModal();
      toast('Hasat kaydedildi', 'success');
      window.Router.refresh();
    });
  }

  global.BeeViews = {
    renderDashboard,
    renderHives,
    renderInspections,
    renderTreatments,
    renderHarvests,
    renderReminders,
    renderAdvisor,
    renderKnowledge,
    renderReports,
    openApiaryModal,
    openHiveModal,
    openInspectionModal,
    openTreatmentModal,
    openHarvestModal,
    openModal,
    closeModal,
    openChoiceModal,
    openSearchResults,
    toast,
  };
})(window);
