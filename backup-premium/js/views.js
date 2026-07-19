/* ============================================================
   BeeMaster AI — Views
   Renders route templates + handles UI interactions.
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
    return String(s || '')
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

  // ===========================================================
  // Dashboard route
  // ===========================================================

  function renderDashboard(outlet) {
    const tpl = $('#tpl-dashboard').content.cloneNode(true);
    outlet.appendChild(tpl);

    const apiary = Db.getActiveApiaryId() ? Db.getApiary(Db.getActiveApiaryId()) : null;
    const hives = Db.listHives();
    const stats = Db.getApiaryStats();
    const risks = hives.map((h) => {
      const lastIns = Db.listInspections(h.id)[0];
      return Risk.compute(h, lastIns);
    });
    const aggRisk = Risk.aggregate(risks) || { disease: 0, swarm: 0, starvation: 0, queenFailure: 0, honeyProduction: 60, winterSurvival: 60 };

    // Header summary
    $('[data-bind="apiary-summary"]', outlet).textContent = apiary
      ? `${apiary.name} • ${apiary.location?.region || ''} • ${hives.length} kovan`
      : 'Arılık seçin veya yeni bir arılık oluşturun.';

    // Risk grid (6 axes)
    const axes = [
      { key: 'disease', label: 'Hastalık', icon: '🦠' },
      { key: 'swarm', label: 'Oğul', icon: '🐝' },
      { key: 'starvation', label: 'Açlık', icon: '🍯' },
      { key: 'queenFailure', label: 'Ana arı', icon: '👑' },
      { key: 'honeyProduction', label: 'Bal üretimi', icon: '🍯', invert: true },
      { key: 'winterSurvival', label: 'Kış sağ kalım', icon: '❄️', invert: true },
    ];
    const riskHtml = axes.map((a) => {
      const v = aggRisk[a.key] ?? 0;
      const color = Risk.riskColor(v, a.invert);
      return `
        <div class="risk-card" style="--risk-pct: ${v}%; --risk-color: ${color};">
          <div class="risk-label">${a.icon} ${a.label}</div>
          <div class="risk-value">${v}%</div>
          <div class="risk-meta">${a.invert ? 'yüksek = iyi' : 'yüksek = riskli'}</div>
        </div>
      `;
    }).join('');
    $('[data-bind="risk-grid"]', outlet).innerHTML = riskHtml;

    // Stats row
    const statsHtml = `
      <div class="stat-card">
        <div class="stat-label">Kovan</div>
        <div class="stat-value">${stats.hiveCount}</div>
        <div class="stat-meta">aktif</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Muayene</div>
        <div class="stat-value">${stats.inspectionCount}</div>
        <div class="stat-meta">toplam</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Tedavi</div>
        <div class="stat-value">${stats.treatmentCount}</div>
        <div class="stat-meta">uygulanan</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Toplam bal</div>
        <div class="stat-value">${stats.totalYieldKg.toFixed(1)} <span style="font-size:0.875rem; color:var(--c-text-muted);">kg</span></div>
        <div class="stat-meta">tüm zamanlar</div>
      </div>
    `;
    $('[data-bind="stats-row"]', outlet).innerHTML = statsHtml;

    // Frame stats — son 30 günde verilen/alınan çerçeveler
    const allIns = Db.listInspections();
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
    const recentFrameIns = allIns.filter(i => i.date && new Date(i.date) >= thirtyDaysAgo);

    const frameTotals = {
      'foundation-given': 0,
      'processed-given': 0,
      'capped-brood': 0,
      'open-brood': 0,
      'honey': 0,
      'pollen': 0,
      'honey-pollen': 0,
      'empty': 0,
      'queen-cell': 0,
    };
    recentFrameIns.forEach(ins => {
      if (ins.frameMovements && Array.isArray(ins.frameMovements)) {
        ins.frameMovements.forEach(m => {
          if (frameTotals.hasOwnProperty(m.type)) {
            frameTotals[m.type] += m.count;
          }
        });
      }
    });

    const frameLabels = {
      'foundation-given': '🟫 Ham petek',
      'processed-given': '⬛ İşlenmiş',
      'capped-brood': '🔵 Kapalı yavru',
      'open-brood': '🟢 Açık yavru',
      'honey': '🟡 Ballı',
      'pollen': '🟠 Polenli',
      'honey-pollen': '🟨 Bal+polen',
      'empty': '⚪ Boş',
      'queen-cell': '👑 Ana hücreli',
    };

    const frameStatsHtml = `
      <div class="card" style="margin-top: 16px;">
        <div class="card-head">
          <h3>📦 Çerçeve hareketleri (son 30 gün)</h3>
          <a href="#/inspections" class="card-link">Tüm muayeneler →</a>
        </div>
        ${recentFrameIns.length === 0
          ? '<div class="empty">Son 30 günde muayene yapılmadı.</div>'
          : `<div class="frame-stats-grid">${Object.entries(frameTotals)
              .filter(([k, v]) => v !== 0)
              .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
              .map(([k, v]) => {
                const isNegative = v < 0;
                return `<div class="frame-stat-tile ${isNegative ? 'is-negative' : ''}">
                  <div class="frame-stat-icon">${frameLabels[k]?.split(' ')[0] || '·'}</div>
                  <div class="frame-stat-info">
                    <div class="frame-stat-label">${frameLabels[k]?.split(' ').slice(1).join(' ') || k}</div>
                    <div class="frame-stat-value">${v > 0 ? '+' : ''}${v}</div>
                  </div>
                </div>`;
              }).join('')}</div>`}
      </div>
    `;
    const fsEl = $('[data-bind="frame-stats"]', outlet);
    if (fsEl) fsEl.innerHTML = frameStatsHtml;

    // Recent events
    const recentIns = Db.listInspections().slice(0, 5);
    const recentHtml = recentIns.length === 0
      ? '<div class="empty">Henüz muayene yok.</div>'
      : `<ul class="event-list">${recentIns.map((i) => {
          const hive = Db.getHive(i.hiveId);
          return `<li class="event-item">
            <span class="event-date">${fmtDate(i.date)}</span>
            <span class="event-title">${escapeHtml(hive?.label || '?')} — yavru: ${i.framesOfBrood || '?'}, mite: ${i.varroaPer100 || '?'}/100</span>
            <span class="event-meta">${escapeHtml(i.notes?.slice(0, 40) || '')}</span>
          </li>`;
        }).join('')}</ul>`;
    $('[data-bind="recent-events"]', outlet).innerHTML = recentHtml;

    // Upcoming tasks (simple: hives overdue for inspection)
    const tasks = [];
    hives.forEach((h) => {
      const ins = Db.listInspections(h.id)[0];
      const lastDate = ins ? new Date(ins.date) : null;
      const daysSince = lastDate ? Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24)) : 999;
      if (daysSince > 14) {
        tasks.push({
          hive: h.label,
          task: daysSince === 999 ? 'İlk muayene' : `${daysSince} gündür muayene yok`,
          priority: daysSince > 30 ? 'high' : 'medium',
        });
      }
      // High mite
      if (ins && (ins.varroaPer100 || 0) > 3) {
        tasks.push({ hive: h.label, task: `Mite yüksek: ${ins.varroaPer100}/100`, priority: 'high' });
      }
    });
    const tasksHtml = tasks.length === 0
      ? '<div class="empty">Yaklaşan görev yok.</div>'
      : tasks.slice(0, 6).map((t) => `
        <div class="task-item">
          <span class="task-priority ${t.priority}"></span>
          <span><strong>${escapeHtml(t.hive)}</strong> — ${escapeHtml(t.task)}</span>
        </div>
      `).join('');
    $('[data-bind="upcoming-tasks"]', outlet).innerHTML = tasksHtml;

    // Hive grid
    $('[data-bind="hive-grid"]', outlet).innerHTML = hives.length === 0
      ? '<div class="empty" style="grid-column: 1/-1;">Henüz kovan yok. + Yeni kovan ile başlayın.</div>'
      : hives.map((h) => renderHiveCard(h)).join('');

    $$('.hive-card', outlet).forEach((el) => {
      el.addEventListener('click', () => {
        location.hash = `#/hives/${el.dataset.hiveId}`;
      });
    });

    $('[data-action="quick-inspection"]', outlet).addEventListener('click', () => openInspectionModal());
    $('[data-action="ask-advisor"]', outlet).addEventListener('click', () => location.hash = '#/advisor');
  }

  function renderHiveCard(h) {
    const ins = Db.listInspections(h.id)[0];
    const risk = Risk.compute(h, ins);
    const strength = (ins?.framesOfBees || 0) >= 7 ? 'strong' : (ins?.framesOfBees || 0) >= 4 ? 'medium' : 'weak';
    const strengthLabel = { strong: 'güçlü', medium: 'orta', weak: 'zayıf' }[strength];
    const queenAge = Risk.queenAgeInMonths(h, new Date());
    const queenColor = queenAge < 12 ? '#10b981' : queenAge < 24 ? '#f59e0b' : '#f43f5e';
    const qPerf = Risk.queenPerformance(h, Db.listInspections(h.id));
    const qPerfBadge = qPerf ? `<span class="queen-perf-badge queen-perf-${qPerf.level}" title="Ana arı performansı: ${qPerf.score}/100">👑 ${qPerf.label}</span>` : '';
    return `
      <div class="hive-card" data-hive-id="${h.id}">
        <div class="hive-card-head">
          <div class="hive-id">${escapeHtml(h.label)}</div>
          <div class="hive-strength strength-${strength}">${strengthLabel}</div>
        </div>
        <div class="hive-meta">
          <div class="hive-meta-cell">
            <strong>${ins?.framesOfBrood ?? '—'}</strong>
            <span>yavru</span>
          </div>
          <div class="hive-meta-cell">
            <strong>${ins?.framesOfBees ?? '—'}</strong>
            <span>arı</span>
          </div>
          <div class="hive-meta-cell">
            <strong>${ins?.varroaPer100 ?? '—'}</strong>
            <span>mite/100</span>
          </div>
        </div>
        <div class="hive-footer">
          <span><span class="hive-queen-dot" style="background:${queenColor};"></span>ana arı ${queenAge} ay · ${qPerfBadge}</span>
          <span>${ins ? fmtDate(ins.date) : 'muayene yok'}</span>
        </div>
        <div class="hive-actions">
          <button class="hive-action-btn" data-edit-hive="${h.id}" title="Düzenle">✏️ Düzenle</button>
          <button class="hive-action-btn hive-action-danger" data-delete-hive="${h.id}" title="Sil">🗑️ Sil</button>
        </div>
      </div>
    `;
  }

  // ===========================================================
  // Hives route
  // ===========================================================

  function renderHives(outlet) {
    const tpl = $('#tpl-hives').content.cloneNode(true);
    outlet.appendChild(tpl);
    const hives = Db.listHives();
    $('[data-bind="hive-grid-full"]', outlet).innerHTML = hives.length === 0
      ? '<div class="empty" style="grid-column: 1/-1;">Henüz kovan yok.</div>'
      : hives.map((h) => renderHiveCard(h)).join('');
    $$('.hive-card', outlet).forEach((el) => {
      el.addEventListener('click', () => location.hash = `#/hives/${el.dataset.hiveId}`);
    });
    $$('[data-edit-hive]', outlet).forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        openHiveModal(b.dataset.editHive);
      });
    });
    $$('[data-delete-hive]', outlet).forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = b.dataset.deleteHive;
        const hive = Db.getHive(id);
        if (confirm((hive ? hive.label : 'Bu kovan') + ' silinecek. Tüm muayeneleri de silinir. Emin misin?')) {
          Db.deleteHive(id);
          toast('Kovan silindi', 'success');
          renderHives(outlet);
        }
      });
    });
    $('[data-action="add-hive"]', outlet).addEventListener('click', () => openHiveModal());
  }

  // ===========================================================
  // Inspections route
  // ===========================================================


  function renderFrameMovementsBadges(movements) {
    if (!movements || !movements.length) return '';
    var labels = {
      'foundation-given': '🟫 Ham verildi',
      'processed-given': '⬛ İşlenmiş verildi',
      'capped-brood': '🔵 Kapalı yavrulu',
      'open-brood': '🟢 Açık yavrulu',
      'honey': '🟡 Ballı',
      'pollen': '🟠 Polenli',
      'honey-pollen': '🟨 Ballı+polenli',
      'empty': '⚪ Boş alındı',
      'queen-cell': '👑 Ana hücreli',
    };
    var html = '<div class="frame-movement-badges">';
    movements.forEach(function(m) {
      var prefix = m.count > 0 ? '+' : '';
      html += '<span class="frame-badge" data-count="' + m.count + '">';
      html += (labels[m.type] || m.type) + ': ';
      html += '<strong>' + prefix + m.count + '</strong>';
      html += '</span>';
    });
    html += '</div>';
    return html;
  }

  function renderInspections(outlet) {
    const tpl = $('#tpl-inspections').content.cloneNode(true);
    outlet.appendChild(tpl);
    const list = Db.listInspections();
    const html = list.length === 0
      ? '<div class="empty">Henüz muayene kaydı yok.</div>'
      : list.map((i) => {
        const hive = Db.getHive(i.hiveId);
        return `
          <div class="record-card">
            <div class="record-date">${fmtDate(i.date)}</div>
            <div>
              <div class="record-title">${escapeHtml(hive?.label || '?')}</div>
              <div class="record-meta">
                yavru: ${i.framesOfBrood || '?'} çer. •
                arı: ${i.framesOfBees || '?'} çer. •
                bal: ${i.framesOfStores || '?'} çer. •
                mite: ${i.varroaPer100 || '?'}/100 •
                yavru deseni: ${i.broodPattern || '—'}
                ${i.notes ? `<br>📝 ${escapeHtml(i.notes)}` : ''}
              </div>
            </div>
            <div class="record-actions">
              <button class="btn-ghost-sm" data-del-ins="${i.id}">Sil</button>
            </div>
          </div>
        `;
      }).join('');
    $('[data-bind="inspection-list"]', outlet).innerHTML = html;
    $$('[data-del-ins]', outlet).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Bu muayeneyi sil?')) {
          Db.deleteInspection(btn.dataset.delIns);
          Router.go('#/inspections');
        }
      });
    });
    $('[data-action="add-inspection"]', outlet).addEventListener('click', () => openInspectionModal());
  }

  // ===========================================================
  // Treatments route
  // ===========================================================

  function renderTreatments(outlet) {
    const tpl = $('#tpl-treatments').content.cloneNode(true);
    outlet.appendChild(tpl);
    const list = Db.listTreatments();
    const html = list.length === 0
      ? '<div class="empty">Henüz tedavi kaydı yok.</div>'
      : list.map((t) => {
        const hive = Db.getHive(t.hiveId);
        return `
          <div class="record-card">
            <div class="record-date">${fmtDate(t.date)}</div>
            <div>
              <div class="record-title">${escapeHtml(t.substance)} <span class="tag amber">${escapeHtml(hive?.label || '?')}</span></div>
              <div class="record-meta">
                form: ${t.form || '—'} •
                doz: ${t.dose || '—'} •
                sıcaklık: ${t.ambientTemp || '—'}°C •
                sonuç: <span class="tag ${t.outcome === 'success' ? 'green' : t.outcome === 'failed' ? 'red' : 'amber'}">${t.outcome || 'beklemede'}</span>
              </div>
            </div>
            <div class="record-actions">
              <button class="btn-ghost-sm" data-del-tr="${t.id}">Sil</button>
            </div>
          </div>
        `;
      }).join('');
    $('[data-bind="treatment-list"]', outlet).innerHTML = html;
    $$('[data-del-tr]', outlet).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Tedaviyi sil?')) {
          Db.deleteTreatment(btn.dataset.delTr);
          Router.go('#/treatments');
        }
      });
    });
    $('[data-action="add-treatment"]', outlet).addEventListener('click', () => openTreatmentModal());
  }

  // ===========================================================
  // Harvests route
  // ===========================================================

  function renderHarvests(outlet) {
    const tpl = $('#tpl-harvests').content.cloneNode(true);
    outlet.appendChild(tpl);
    const list = Db.listHarvests();
    const html = list.length === 0
      ? '<div class="empty">Henüz hasılat kaydı yok.</div>'
      : list.map((h) => {
        const hive = Db.getHive(h.hiveId);
        return `
          <div class="record-card">
            <div class="record-date">${fmtDate(h.date)}</div>
            <div>
              <div class="record-title">${h.yieldKg || 0} kg <span class="tag green">${escapeHtml(hive?.label || '?')}</span></div>
              <div class="record-meta">${escapeHtml(h.honeyType || '—')} ${h.notes ? '• ' + escapeHtml(h.notes) : ''}</div>
            </div>
            <div class="record-actions">
              <button class="btn-ghost-sm" data-del-ha="${h.id}">Sil</button>
            </div>
          </div>
        `;
      }).join('');
    $('[data-bind="harvest-list"]', outlet).innerHTML = html;
    $$('[data-del-ha]', outlet).forEach((btn) => {
      btn.addEventListener('click', () => {
        if (confirm('Hasadı sil?')) {
          Db.deleteHarvest(btn.dataset.delHa);
          Router.go('#/harvests');
        }
      });
    });
    $('[data-action="add-harvest"]', outlet).addEventListener('click', () => openHarvestModal());

    // Year chart
    const byYear = {};
    list.forEach((h) => {
      const y = (h.date || '').slice(0, 4);
      if (!y) return;
      byYear[y] = (byYear[y] || 0) + (Number(h.yieldKg) || 0);
    });
    const years = Object.keys(byYear).sort();
    const totals = years.map((y) => byYear[y]);
    const max = Math.max(...totals, 1);
    const chartHtml = years.length === 0
      ? '<div class="empty">Yıllık özet için hasılat kaydı girin.</div>'
      : `<div class="chart-container" style="display:flex;align-items:flex-end;gap:var(--sp-2);height:200px;">
          ${years.map((y, i) => {
            const h = Math.round((totals[i] / max) * 180);
            return `<div style="flex:1;text-align:center;">
              <div style="font-size:0.875rem;font-weight:600;color:var(--c-amber-900);">${totals[i].toFixed(1)} kg</div>
              <div style="height:${h}px;background:linear-gradient(180deg,var(--c-amber-400),var(--c-amber-600));border-radius:var(--r-sm) var(--r-sm) 0 0;margin-top:var(--sp-2);"></div>
              <div style="font-size:0.75rem;color:var(--c-text-muted);margin-top:var(--sp-2);">${y}</div>
            </div>`;
          }).join('')}
        </div>`;
    $('[data-bind="harvest-chart"]', outlet).innerHTML = chartHtml;
  }

  // ===========================================================
  // Advisor route
  // ===========================================================



  // ============================================================
  // Reminders (Hatırlatıcılar)
  // ============================================================

  function renderReminders(outlet) {
    setActiveNav('reminders');
    Reminders.clearOldDismissals();
    const all = Reminders.getAll();
    const active = Reminders.getActive();
    const settings = Db.getSettings();
    const interval = settings.inspectionIntervalDays || 14;
    const lead = settings.reminderLeadDays || 3;

    outlet.innerHTML = `
      <div class="route-header">
        <div>
          <h2>Hatırlatıcılar</h2>
          <p class="route-sub">Muayene zamanları ve sıklık ayarları</p>
        </div>
        <div class="route-actions">
          <button class="btn-secondary" id="btn-settings-page">⚙️ Sıklık ayarla</button>
          <button class="btn-primary" id="btn-add-inspection-from-reminder">+ Hızlı muayene</button>
        </div>
      </div>

      <div class="card" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-color: #f59e0b;">
        <div class="reminders-banner">
          <div>
            <div style="font-weight: 700; font-size: 18px; color: #78350f;">📋 ${active.length} aktif hatırlatıcı</div>
            <div style="font-size: 13px; color: #92400e; margin-top: 4px;">
              Mevcut sıklık: <strong>${interval} günde bir muayene</strong> ·
              Uyarı: <strong>${lead} gün önceden</strong>
            </div>
          </div>
          <button class="btn-secondary btn-sm" id="change-interval">Değiştir</button>
        </div>
      </div>

      ${all.length === 0 ? `
        <div class="card">
          <div class="empty-state">
            <div class="empty-icon">🐝</div>
            <div class="empty-title">Henüz kovan yok</div>
            <div class="empty-sub">Hatırlatıcılar kovan ekledikten sonra otomatik hesaplanır.</div>
            <a href="#/hives" class="btn-primary" style="margin-top: 16px;">+ İlk kovanı ekle</a>
          </div>
        </div>
      ` : `
        <div class="reminders-list">
          ${all.map(r => renderReminderCard(r)).join('')}
        </div>
      `}
    `;

    // Event bindings
    document.getElementById('change-interval')?.addEventListener('click', openIntervalSettings);
    document.getElementById('btn-settings-page')?.addEventListener('click', openIntervalSettings);
    document.getElementById('btn-add-inspection-from-reminder')?.addEventListener('click', () => openInspectionModal());

    document.querySelectorAll('[data-dismiss-reminder]').forEach(b => {
      b.addEventListener('click', () => {
        Reminders.dismissToday(b.dataset.dismissReminder);
        toast('Bugün için hatırlatıcı kapatıldı', 'success');
        renderReminders(outlet);
      });
    });

    document.querySelectorAll('[data-reminder-quick-inspection]').forEach(b => {
      b.addEventListener('click', () => {
        const hiveId = b.dataset.reminderQuickInspection;
        openInspectionModal();
        // Modal açıldıktan sonra kovan seçili olsun
        setTimeout(() => {
          const sel = document.getElementById('m-hive');
          if (sel) sel.value = hiveId;
        }, 50);
      });
    });
  }

  function renderReminderCard(r) {
    const info = Reminders.statusInfo(r.status);
    const daysText = r.status === 'overdue'
      ? `${Math.abs(r.daysUntilDue)} gün gecikme`
      : r.daysUntilDue === 0
        ? 'Bugün'
        : r.daysUntilDue === 1
          ? 'Yarın'
          : `${r.daysUntilDue} gün var`;
    const isUrgent = r.status === 'overdue' || r.status === 'due';

    return `
      <div class="reminder-card reminder-${r.status} ${r.isDismissed ? 'reminder-dismissed' : ''}">
        <div class="reminder-head">
          <div>
            <div class="reminder-hive">${escapeHtml(r.hive.label)}</div>
            <div class="reminder-meta">
              ${r.lastDate ? `Son muayene: <strong>${fmtDate(r.lastDate)}</strong>` : '<em>Hiç muayene yapılmamış</em>'}
            </div>
          </div>
          <span class="reminder-status reminder-status-${info.color}">${info.icon} ${info.label}</span>
        </div>
        <div class="reminder-body">
          <div class="reminder-due">
            <div class="reminder-due-label">Sıradaki muayene</div>
            <div class="reminder-due-date">${fmtDate(r.dueDate)}</div>
            <div class="reminder-days ${isUrgent ? 'reminder-days-urgent' : ''}">${daysText}</div>
          </div>
          <div class="reminder-actions">
            <button class="btn-primary btn-sm" data-reminder-quick-inspection="${r.hive.id}">📋 Muayene yap</button>
            ${!r.isDismissed ? `<button class="btn-secondary btn-sm" data-dismiss-reminder="${r.hive.id}">Bugün kapat</button>` : '<span class="reminder-dismissed-tag">✓ Bugün kapatıldı</span>'}
          </div>
        </div>
      </div>
    `;
  }

  function openIntervalSettings() {
    const settings = Db.getSettings();
    openModal(`
      <div class="modal-head">
        <h3>Muayene sıklığı ayarı</h3>
        <button class="modal-close" aria-label="Kapat">✕</button>
      </div>
      <div class="modal-body">
        <p style="color: #57534e; margin-bottom: 16px; font-size: 13px; line-height: 1.5;">
          Her kovan için muayene hatırlatıcıları bu sıklığa göre hesaplanır.
          İsterseniz her kovan için ayrı sıklık da ayarlayabilirsiniz.
        </p>
        <div class="form-row">
          <label class="form-label">Varsayılan sıklık (gün)</label>
          <input id="setting-interval" class="form-input" type="number" min="3" max="60" value="${settings.inspectionIntervalDays || 14}" />
          <small style="color: #78716c; font-size: 12px;">3-60 gün arası. Sık: 7 gün, Normal: 14 gün, Gevşek: 21-30 gün</small>
        </div>
        <div class="form-row">
          <label class="form-label">Kaç gün önceden uyar?</label>
          <input id="setting-lead" class="form-input" type="number" min="0" max="14" value="${settings.reminderLeadDays || 3}" />
          <small style="color: #78716c; font-size: 12px;">0-14 gün arası. Varsayılan: 3 gün</small>
        </div>

        <h4 style="margin-top: 20px; margin-bottom: 8px; font-size: 14px; color: #78350f;">Kovan başına sıklık (opsiyonel)</h4>
        <p style="color: #78716c; font-size: 12px; margin-bottom: 12px;">Boş bırakırsan yukarıdaki varsayılan kullanılır.</p>
        <div id="hive-interval-list">
          ${Db.listHives().map(h => `
            <div class="form-row" style="display: flex; align-items: center; gap: 8px;">
              <label class="form-label" style="flex: 1; margin: 0;">${escapeHtml(h.label)}</label>
              <input class="form-input" type="number" min="3" max="60" placeholder="${settings.inspectionIntervalDays || 14}"
                data-hive-interval="${h.id}" value="${h.inspectionIntervalDays || ''}" style="width: 80px;" />
              <span style="color: #78716c; font-size: 12px;">gün</span>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-secondary modal-close">İptal</button>
        <button class="btn-primary" id="save-interval">Kaydet</button>
      </div>
    `);

    document.getElementById('save-interval').addEventListener('click', () => {
      const interval = parseInt(document.getElementById('setting-interval').value) || 14;
      const lead = parseInt(document.getElementById('setting-lead').value) || 3;
      Db.updateSettings({
        inspectionIntervalDays: interval,
        reminderLeadDays: lead,
      });
      // Kovan başına sıklıkları kaydet
      document.querySelectorAll('[data-hive-interval]').forEach(inp => {
        const v = parseInt(inp.value);
        const hiveId = inp.dataset.hiveInterval;
        const hive = Db.getHive(hiveId);
        if (hive) {
          const patch = {};
          if (v && v > 0) patch.inspectionIntervalDays = v;
          else patch.inspectionIntervalDays = null;
          Db.updateHive(hiveId, patch);
        }
      });
      closeModal();
      toast('Sıklık ayarları kaydedildi', 'success');
      renderReminders(outlet);
    });

    $$('.modal-close', document.getElementById('modal-root')).forEach(b => b.addEventListener('click', closeModal));
  }
  function renderAdvisor(outlet) {
    const tpl = $('#tpl-advisor').content.cloneNode(true);
    outlet.appendChild(tpl);

    // Bölge seçici
    const regionSel = $('#advisor-region', outlet);
    const currentRegion = Db.getSettings().region || 'TR-Diyarbakir-Egil';
    regionSel.innerHTML = window.BeeRegion.list().map(r =>
      `<option value="${r.key}" ${r.key === currentRegion ? 'selected' : ''}>${escapeHtml(r.label)}</option>`
    ).join('');
    regionSel.addEventListener('change', () => {
      Db.updateSettings({ region: regionSel.value });
      updateRegionBanner();
      runLastAdvisor();
    });

    function updateRegionBanner() {
      const ctx = window.BeeRegion.context(regionSel.value);
      const banner = $('#region-banner', outlet);
      const urgencyClass = `urgency-${ctx.seasonal.urgency}`;
      banner.innerHTML = `
        <span class="region-label">📍 ${escapeHtml(ctx.region)}</span>
        <span class="region-climate">${escapeHtml(ctx.climate)}${ctx.coords ? ` · ${ctx.coords.lat.toFixed(2)}°N` : ''}</span>
        <span class="region-period ${urgencyClass}">${escapeHtml(ctx.seasonal.label)}</span>
        ${ctx.thresholds.varroaAutumnThreshold ? `<span class="region-climate" style="margin-left:0.5rem;">varroa eşik: ${ctx.thresholds.varroaAutumnThreshold}/100</span>` : ''}
      `;
    }
    updateRegionBanner();

    // Populate hive select
    const sel = $('#advisor-hive', outlet);
    const hives = Db.listHives();
    sel.innerHTML = '<option value="">— Kovan seç (opsiyonel) —</option>' +
      hives.map((h) => `<option value="${h.id}">${escapeHtml(h.label)}</option>`).join('');

    // Kovan seçilince medya listesi güncellenir
    sel.addEventListener('change', () => renderMediaList());

    // Son çıktıyı sakla (feedback için)
    let lastDecision = null;
    let lastInput = null;
    let lastScenario = null;
    let pendingAttachments = [];

    function renderMediaList() {
      const hiveId = sel.value;
      const list = window.BeeMedia.list(hiveId, null);
      const container = $('#advisor-media-list', outlet);
      if (list.length === 0) {
        container.innerHTML = '<div class="empty" style="padding:var(--sp-3);">Bu kovan için henüz medya yok.</div>';
        return;
      }
      container.innerHTML = list.slice(-6).map(m => {
        const dt = new Date(m.ts).toLocaleDateString('tr-TR');
        return `
          <div style="display:flex;align-items:center;gap:var(--sp-2);padding:var(--sp-2);background:var(--c-surface-2);border-radius:var(--r-sm);margin-bottom:var(--sp-1);font-size:0.75rem;">
            ${m.type === 'image'
              ? `<img src="${m.data}" style="width:36px;height:36px;object-fit:cover;border-radius:var(--r-sm);">`
              : `<div style="width:36px;height:36px;background:var(--c-amber-100);border-radius:var(--r-sm);display:grid;place-items:center;">▶</div>`}
            <div style="flex:1;min-width:0;">
              <div style="font-weight:600;color:var(--c-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(m.name)}</div>
              <div style="color:var(--c-text-muted);">${dt} · ${window.BeeMedia.formatSize(m.size)}</div>
            </div>
          </div>`;
      }).join('');
    }
    renderMediaList();

    // Medya yükleme
    $('#advisor-media-input', outlet).addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      for (const file of files) {
        try {
          const m = await window.BeeMedia.add(file, {
            hiveId: sel.value || null,
            context: 'advisor',
            notes: $('#advisor-input', outlet).value.slice(0, 200),
          });
          pendingAttachments.push(m);
          // Görsel analiz
          window.BeeMedia.analyze(m.id, $('#advisor-input', outlet).value);
        } catch (err) {
          toast(err.message, 'error');
        }
      }
      e.target.value = ''; // reset
      renderAttachments();
      renderMediaList();
    });

    function renderAttachments() {
      const box = $('#advisor-attachments', outlet);
      if (pendingAttachments.length === 0) {
        box.style.display = 'none';
        box.innerHTML = '';
        return;
      }
      box.style.display = 'flex';
      box.innerHTML = pendingAttachments.map(m => `
        <div class="media-thumb" data-media-id="${m.id}">
          ${m.type === 'image'
            ? `<img src="${m.data}" style="width:80px;height:80px;object-fit:cover;border-radius:8px;">`
            : `<video src="${m.data}" muted style="width:80px;height:80px;object-fit:cover;border-radius:8px;"></video>`}
          <button class="media-del" data-attach-del="${m.id}" title="Kaldır">✕</button>
        </div>
      `).join('');
      $$('[data-attach-del]', box).forEach(btn => {
        btn.addEventListener('click', () => {
          pendingAttachments = pendingAttachments.filter(m => m.id !== btn.dataset.attachDel);
          renderAttachments();
        });
      });
    }

    // Scenario buttons
    $$('.scenario-btn', outlet).forEach((btn) => {
      btn.addEventListener('click', () => {
        const scenario = btn.dataset.scenario;
        const hiveId = sel.value;
        const ctx = buildContext(hiveId, regionSel.value);
        let input = {};
        let result;
        switch (scenario) {
          case 'mite-count': {
            const v = prompt('Mite sayısı (100 arıda kaç mite)?', '3');
            if (v === null) return;
            input.matchCount = v;
            result = Advisor.handleScenario('mite-count', input, ctx);
            break;
          }
          case 'queenless': {
            const eggs = confirm('Yumurta var mı? (İptal = hayır)');
            const cells = prompt('Queen hücresi sayısı?', '0');
            input = { eggsPresent: eggs, queenCells: parseInt(cells) || 0 };
            result = Advisor.handleScenario('queenless', input, ctx);
            break;
          }
          case 'swarm': {
            const cells = prompt('Queen hücresi sayısı?', '5');
            input = { queenCells: parseInt(cells) || 0, queenCellType: 'swarm' };
            result = Advisor.handleScenario('swarm', input, ctx);
            break;
          }
          case 'feeding': {
            const stores = prompt('Mevcut bal çerçevesi sayısı?', '4');
            input = { framesOfStores: parseInt(stores) || 0 };
            result = Advisor.handleScenario('feeding', input, ctx);
            break;
          }
          case 'afb-suspect': {
            const sym = prompt('Gözlemlerinizi kısaca yazın:', 'Batan petek kapakları, ip çeken larva');
            if (!sym) return;
            input = { symptoms: sym };
            result = Advisor.handleScenario('afb-suspect', input, ctx);
            break;
          }
          case 'winter-prep': {
            const stores = prompt('Mevcut bal çerçevesi?', '6');
            const varroa = prompt('Mite / 100 arı?', '1');
            const bees = prompt('Arı çerçevesi sayısı?', '6');
            input = { framesOfStores: parseInt(stores) || 0, varroaPer100: parseFloat(varroa) || 0, framesOfBees: parseInt(bees) || 0 };
            result = Advisor.handleScenario('winter-prep', input, ctx);
            break;
          }
        }
        if (result) {
          lastDecision = result;
          lastInput = input;
          lastScenario = scenario;
          showDecision(result);
        }
      });
    });

    // Free-text advisor
    function runAdvisor() {
      const text = $('#advisor-input', outlet).value.trim();
      if (!text && pendingAttachments.length === 0) {
        alert('Lütfen sorunuzu yazın veya fotoğraf ekleyin.');
        return;
      }
      const hiveId = sel.value;
      const ctx = buildContext(hiveId, regionSel.value);
      // Medya bağlamı ekle
      if (pendingAttachments.length > 0) {
        ctx.mediaSubjects = pendingAttachments
          .map(m => m.analysis?.detectedSubjects)
          .filter(Boolean)
          .flat();
        ctx.mediaCount = pendingAttachments.length;
      }
      const result = Advisor.advise(text, ctx);
      lastDecision = result;
      lastInput = { text, media: pendingAttachments.map(m => m.id) };
      lastScenario = 'free-text';
      showDecision(result);
      // Medya temizle
      pendingAttachments = [];
      renderAttachments();
    }

    function runLastAdvisor() {
      if (lastDecision) {
        // Bölge değişti, son kararı yeni bölge ile yeniden değerlendir
        const hiveId = sel.value;
        const ctx = buildContext(hiveId, regionSel.value);
        if (lastScenario === 'free-text' && lastInput?.text) {
          const result = Advisor.advise(lastInput.text, ctx);
          lastDecision = result;
          showDecision(result);
        }
      }
    }

    function showDecision(result) {
      let decisionHtml = Advisor.renderDecision(result);
      // Frame alerts — son 30 gün çerçeve hareketlerinden otomatik uyarılar
      const ctx = buildContext($('#advisor-hive', outlet).value, regionSel.value);
      if (ctx.recentFrames) {
        const alerts = Advisor.frameAlerts({ recentFrames: ctx.recentFrames });
        if (alerts.length > 0) {
          decisionHtml += '<div style="margin-top: 16px;">' + alerts.map(function(a) {
            return '<div class="decision-warning ' + (a.level === 'critical' ? 'is-critical' : '') + '">' +
                   '<div class="decision-warning-head">' + escapeHtml(a.title) + '</div>' +
                   '<div>' + escapeHtml(a.message) + '</div></div>';
          }).join('') + '</div>';
        }
      }
      $('#advisor-output', outlet).innerHTML = decisionHtml;
      // Bölgesel ekleme
      const regionCtx = window.BeeRegion.context(regionSel.value);
      const regionBanner = `
        <div class="region-banner">
          <span class="region-label">📍 ${escapeHtml(regionCtx.region)}</span>
          <span class="region-period urgency-${regionCtx.seasonal.urgency}">${escapeHtml(regionCtx.seasonal.label)}</span>
        </div>
      `;
      // Feedback butonlarını göster
      $('#advisor-feedback', outlet).style.display = 'block';
      $('#advisor-forum-results', outlet).style.display = 'none';
      $('#advisor-pattern-form', outlet).style.display = 'none';

      // Learning güncelleme
      updateLearningSummary();
    }

    $('#btn-advisor-go', outlet).addEventListener('click', runAdvisor);
    $('#advisor-input', outlet).addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        runAdvisor();
      }
    });

    // Feedback
    $('#feedback-correct', outlet).addEventListener('click', () => {
      if (!lastDecision) return;
      window.BeeLearning.recordOutcome({
        decisionId: lastDecision._scenario || 'advisor',
        scenario: lastScenario || 'free-text',
        input: lastInput,
        decision: lastDecision,
        correct: true,
        notes: $('#advisor-input', outlet).value,
      });
      toast('✓ Geri bildirim kaydedildi', 'success');
      updateLearningSummary();
    });

    $('#feedback-wrong', outlet).addEventListener('click', () => {
      if (!lastDecision) return;
      const actual = prompt('Gerçekte ne oldu?', 'Örn: anasız çıktı');
      if (actual === null) return;
      window.BeeLearning.recordOutcome({
        decisionId: lastDecision._scenario || 'advisor',
        scenario: lastScenario || 'free-text',
        input: lastInput,
        decision: lastDecision,
        correct: false,
        actualOutcome: actual,
        notes: $('#advisor-input', outlet).value,
      });
      toast('✗ Geri bildirim kaydedildi', 'warning');
      updateLearningSummary();
    });

    $('#feedback-pattern', outlet).addEventListener('click', () => {
      $('#advisor-pattern-form', outlet).style.display = 'block';
      $('#advisor-pattern-form', outlet).scrollIntoView({ behavior: 'smooth' });
    });

    $('#pattern-cancel', outlet).addEventListener('click', () => {
      $('#advisor-pattern-form', outlet).style.display = 'none';
    });

    $('#pattern-save', outlet).addEventListener('click', () => {
      const obs = $('#pattern-observation', outlet).value.trim();
      if (!obs) { alert('Gözlem gerekli.'); return; }
      window.BeeLearning.recordPattern({
        type: $('#pattern-type', outlet).value,
        observation: obs,
        region: regionSel.value,
        hiveId: sel.value || null,
        season: window.BeeRegion.seasonal(regionSel.value).period,
        notes: $('#pattern-notes', outlet).value,
      });
      toast('📝 Pattern kaydedildi', 'success');
      $('#advisor-pattern-form', outlet).style.display = 'none';
      $('#pattern-observation', outlet).value = '';
      $('#pattern-notes', outlet).value = '';
      updateLearningSummary();
    });

    // Forum taraması
    $('#feedback-forum', outlet).addEventListener('click', () => {
      const text = $('#advisor-input', outlet).value.trim() || lastInput?.text || 'arıcılık';
      const links = window.BeeForumSearch.smart(text, regionSel.value.startsWith('TR') ? 'tr' : 'en');
      const container = $('#advisor-forum-results', outlet);
      container.style.display = 'block';
      container.innerHTML = window.BeeForumSearch.render(text, links);
      container.scrollIntoView({ behavior: 'smooth' });
    });

    // Learning summary güncelleme
    function updateLearningSummary() {
      const tips = window.BeeLearning.suggestLearnings();
      const patterns = window.BeeLearning.summarizePatterns({ region: regionSel.value }).slice(0, 5);
      const cal = window.BeeLearning.getCalibration();
      const container = $('#learning-summary', outlet);

      let html = '';
      if (tips.length === 0 && patterns.length === 0 && cal.total === 0) {
        html = '<div class="empty">Henüz öğrenme verisi yok. Danışmana soru sorup "✓ Doğru / ✗ Yanlış" butonlarını kullanın; gözlemlerinizi kaydedin.</div>';
      } else {
        if (cal.total > 0) {
          html += `<div class="learning-tip info">
            <span class="learning-tip-icon">🎯</span>
            <div><strong>Tanı hassasiyeti:</strong> %${cal.accuracy} (${cal.correctDiagnoses}/${cal.total})</div>
          </div>`;
        }
        tips.forEach(t => {
          html += `<div class="learning-tip ${t.level}">
            <span class="learning-tip-icon">${t.level === 'warning' ? '⚠️' : '💡'}</span>
            <div>${escapeHtml(t.text)}</div>
          </div>`;
        });
        if (patterns.length > 0) {
          html += `<h4 style="margin-top:var(--sp-3);margin-bottom:var(--sp-2);font-size:0.875rem;">Sık tekrarlanan gözlemleriniz</h4>`;
          patterns.forEach(p => {
            html += `<div class="learning-pattern-row">
              <span>${escapeHtml(p.key)}</span>
              <span class="learning-pattern-count">${p.count}×</span>
            </div>`;
          });
        }
      }
      container.innerHTML = html;
    }
    updateLearningSummary();
  }

  function buildContext(hiveId, regionKey) {
    const key = regionKey || Db.getSettings().region || 'TR-Diyarbakir-Egil';
    const regionCtx = window.BeeRegion.context(key);
    const ctx = {
      region: regionCtx.region,
      regionKey: key,
      date: new Date().toISOString().slice(0, 10),
      thresholds: regionCtx.thresholds,
      seasonal: regionCtx.seasonal,
      climate: regionCtx.climate,
    };
    if (hiveId) {
      const hive = Db.getHive(hiveId);
      const ins = Db.listInspections(hiveId)[0];
      if (hive) ctx.queenAge = Risk.queenAgeInMonths(hive, new Date());
      if (ins) {
        ctx.broodless = false;
        ctx.framesOfBees = ins.framesOfBees;
        ctx.framesOfStores = ins.framesOfStores;
      }
      // Son 30 gün frame hareketleri (karar motoru uyarıları için)
      ctx.recentFrames = Advisor.collectFrameMovements(Db.listInspections(hiveId), 30);
    }
    return ctx;
  }

  // ===========================================================
  // Knowledge route
  // ===========================================================

  function renderKnowledge(outlet, moduleId) {
    const tpl = $('#tpl-knowledge').content.cloneNode(true);
    outlet.appendChild(tpl);

    $('[data-bind="kb-tree"]', outlet).innerHTML = Kb.renderTree();

    $$('[data-kb]', outlet).forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        location.hash = `#/knowledge/${a.dataset.kb}`;
      });
    });

    if (moduleId) {
      $('[data-bind="kb-viewer"]', outlet).innerHTML = Kb.render(moduleId);
    }

    const search = $('#kb-search', outlet);
    if (search) {
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase();
        $$('[data-kb]', outlet).forEach((a) => {
          const txt = a.textContent.toLowerCase();
          a.parentElement.style.display = (!q || txt.includes(q)) ? '' : 'none';
        });
      });
    }
  }

  // ===========================================================
  // Reports route
  // ===========================================================

  function renderReports(outlet) {
    const tpl = $('#tpl-reports').content.cloneNode(true);
    outlet.appendChild(tpl);

    $$('.report-card', outlet).forEach((btn) => {
      btn.addEventListener('click', () => generateReport(btn.dataset.report));
    });
  }

  function generateReport(type) {
    const apiary = Db.getApiary(Db.getActiveApiaryId());
    const hives = Db.listHives();
    const ins = Db.listInspections();
    const treats = Db.listTreatments();
    const harv = Db.listHarvests();

    let content = '';
    const today = new Date().toISOString().slice(0, 10);

    if (type === 'apiary') {
      content = `# Arılık Raporu — ${apiary?.name || '—'}\nTarih: ${today}\n\n`;
      content += `## Genel\n- Kovan: ${hives.length}\n- Muayene: ${ins.length}\n- Tedavi: ${treats.length}\n- Hasat: ${harv.reduce((s, h) => s + (h.yieldKg || 0), 0)} kg\n\n`;
      content += `## Kovanlar\n${hives.map((h) => `- ${h.label} (${h.queenSubspecies || '—'})`).join('\n')}\n`;
    } else if (type === 'inspection') {
      const last = ins[0];
      if (!last) { alert('Muayene kaydı yok.'); return; }
      const hive = Db.getHive(last.hiveId);
      const risk = Risk.compute(hive, last);
      content = `# Muayene Raporu — ${hive?.label}\nTarih: ${last.date}\n\n`;
      content += `## Bulgular\n- Yavru: ${last.framesOfBrood} çer., ${last.broodPattern}\n- Arı: ${last.framesOfBees} çer.\n- Bal: ${last.framesOfStores} çer.\n- Mite: ${last.varroaPer100}/100\n\n`;
      content += `## Risk (6 eksen)\n- Hastalık: ${risk.disease}%\n- Oğul: ${risk.swarm}%\n- Açlık: ${risk.starvation}%\n- Ana arı: ${risk.queenFailure}%\n- Bal: ${risk.honeyProduction}%\n- Kış: ${risk.winterSurvival}%\n`;
    } else if (type === 'queen') {
      content = `# Ana Arı Raporu\nTarih: ${today}\n\n`;
      content += `## Kovan listesi ve ana arı durumu\n\n`;
      content += `| Kovan | Irk | Ana kurulum tarihi | Yaş (ay) |\n|---|---|---|---|\n`;
      hives.forEach((h) => {
        const age = Risk.queenAgeInMonths(h, new Date());
        content += `| ${h.label} | ${h.queenSubspecies || '—'} | ${h.queenInstalled || '—'} | ${age} |\n`;
      });
    } else if (type === 'disease') {
      const lastVarroa = treats.filter((t) => /varroa|oxalic|amitraz|formic/.test((t.substance || '').toLowerCase()));
      content = `# Hastalık Raporu\nTarih: ${today}\n\n`;
      content += `## Varroa tedavileri\n\n${lastVarroa.length ? lastVarroa.map((t) => `- ${t.date} — ${t.substance} (${t.dose})`).join('\n') : '—'}\n\n`;
      content += `## Son muayenelerdeki hastalık bulguları\n\n`;
      ins.slice(0, 10).forEach((i) => {
        const hive = Db.getHive(i.hiveId);
        content += `- ${i.date} — ${hive?.label}: yavru ${i.broodPattern}, mite ${i.varroaPer100}/100\n`;
      });
    } else if (type === 'treatment') {
      content = `# Tedavi Raporu\nTarih: ${today}\n\n`;
      content += `## Tedavi geçmişi\n\n| Tarih | Kovan | Madde | Doz | Sonuç |\n|---|---|---|---|---|\n`;
      treats.forEach((t) => {
        const hive = Db.getHive(t.hiveId);
        content += `| ${t.date} | ${hive?.label || '?'} | ${t.substance} | ${t.dose || '—'} | ${t.outcome || '—'} |\n`;
      });
    } else if (type === 'frame-cycle') {
      // Yıllık çerçeve döngüsü raporu
      const allIns = Db.listInspections();
      const monthNames = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
      const fmTypes = {
        'foundation-given': 'Ham petek verildi',
        'processed-given': 'İşlenmiş petek verildi',
        'capped-brood': 'Kapalı yavrulu',
        'open-brood': 'Açık yavrulu',
        'honey': 'Ballı',
        'pollen': 'Polenli',
        'honey-pollen': 'Bal+polenli',
        'empty': 'Boş alındı',
        'queen-cell': 'Ana hücreli',
      };
      const monthlyData = {};
      allIns.forEach(ins => {
        if (!ins.date || !ins.frameMovements) return;
        const monthKey = ins.date.slice(0, 7);
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {};
          Object.keys(fmTypes).forEach(k => { monthlyData[monthKey][k] = 0; });
        }
        ins.frameMovements.forEach(m => {
          if (monthlyData[monthKey].hasOwnProperty(m.type)) {
            monthlyData[monthKey][m.type] += m.count;
          }
        });
      });

      const sortedMonths = Object.keys(monthlyData).sort();
      content = `# Yıllık Çerçeve Döngüsü Raporu\nTarih: ${today()}\n\n`;
      content += `## Aylık çerçeve hareketleri\n\n`;
      content += `| Ay | ${Object.values(fmTypes).join(' | ')} |\n`;
      content += `|${'---|'.repeat(Object.keys(fmTypes).length + 1)}\n`;
      sortedMonths.forEach(month => {
        const monthLabel = monthNames[parseInt(month.slice(5, 7)) - 1] + ' ' + month.slice(0, 4);
        const cells = Object.keys(fmTypes).map(k => monthlyData[month][k] === 0 ? '-' : (monthlyData[month][k] > 0 ? '+' : '') + monthlyData[month][k]);
        content += `| ${monthLabel} | ${cells.join(' | ')} |\n`;
      });

      content += `\n## Yıllık toplam\n`;
      const yearly = {};
      Object.keys(fmTypes).forEach(k => { yearly[k] = 0; });
      Object.values(monthlyData).forEach(month => {
        Object.keys(yearly).forEach(k => { yearly[k] += month[k] || 0; });
      });
      Object.entries(yearly).forEach(([k, v]) => {
        if (v !== 0) content += `- ${fmTypes[k]}: ${v > 0 ? '+' : ''}${v}\n`;
      });
    } else if (type === 'annual') {
      const year = new Date().getFullYear();
      const yrHarv = harv.filter((h) => (h.date || '').startsWith(String(year)));
      const yrTreat = treats.filter((t) => (t.date || '').startsWith(String(year)));
      const yrIns = ins.filter((i) => (i.date || '').startsWith(String(year)));
      content = `# Yıllık Rapor — ${year}\nArılık: ${apiary?.name || '—'}\n\n`;
      content += `## Özet\n- Kovan: ${hives.length}\n- Muayene: ${yrIns.length}\n- Tedavi: ${yrTreat.length}\n- Hasat: ${yrHarv.reduce((s, h) => s + (h.yieldKg || 0), 0)} kg\n\n`;
      content += `## Hedefler gelecek yıl\n1. Varroa kontrolünü sürdür.\n2. Ana arı yaşlılığını takip et.\n3. Kış stokunu 8+ çerçevede tut.\n`;
    }

    // Open as text/markdown download OR print
    const w = window.open('', '_blank');
    if (!w) { alert('Lütfen pop-up\'lara izin verin.'); return; }
    w.document.write(`
      <!doctype html><html><head><meta charset="utf-8"><title>BeeMaster AI Rapor</title>
      <style>
        body { font-family: -apple-system, sans-serif; max-width: 720px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }
        h1 { color: #b45309; }
        h2 { color: #92400e; margin-top: 1.5rem; }
        table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
        th, td { border: 1px solid #d6d3d1; padding: 0.5rem; text-align: left; }
        th { background: #fef3c7; }
        pre { background: #fafaf9; padding: 1rem; border-radius: 8px; }
      </style></head><body>
      <pre>${escapeHtml(content)}</pre>
      <p style="margin-top:2rem;color:#78716c;font-size:0.875rem;">
        Bu rapor <strong>BeeMaster AI</strong> tarafından üretildi — ${today}<br>
        Yazdırmak için tarayıcınızın "PDF olarak yazdır" özelliğini kullanın.
      </p>
      <script>window.onload = () => window.print();</script>
      </body></html>
    `);
    w.document.close();
  }

  // ===========================================================
  // Modals
  // ===========================================================

  function openModal(html) {
    const root = $('#modal-root');
    root.innerHTML = `<div class="modal">${html}</div>`;
    root.classList.add('open');
    root.setAttribute('aria-hidden', 'false');
    $('.modal-close', root)?.addEventListener('click', closeModal);
    root.addEventListener('click', (e) => { if (e.target === root) closeModal(); });
  }

  function closeModal() {
    const root = $('#modal-root');
    root.classList.remove('open');
    root.innerHTML = '';
    root.setAttribute('aria-hidden', 'true');
  }

  function openApiaryModal() {
    openModal(`
      <div class="modal-head">
        <h3>Yeni arılık</h3>
        <button class="modal-close" aria-label="Kapat">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <label class="form-label">Ad</label>
          <input id="m-name" class="form-input" placeholder="Örn: Hatbi arılığı" />
        </div>
        <div class="form-row">
          <label class="form-label">Bölge</label>
          <input id="m-region" class="form-input" value="${escapeHtml(Db.getSettings().region)}" />
        </div>
        <div class="form-row">
          <label class="form-label">Sahibi</label>
          <input id="m-owner" class="form-input" />
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-secondary modal-close">İptal</button>
        <button class="btn-primary" id="m-save">Kaydet</button>
      </div>
    `);
    $('#m-save').addEventListener('click', () => {
      const apiary = Db.addApiary({
        name: $('#m-name').value || 'Yeni arılık',
        location: { region: $('#m-region').value },
        owner: $('#m-owner').value,
      });
      closeModal();
      toast('Arılık eklendi', 'success');
      Router.refreshApiarySelect();
      Router.go('#/dashboard');
    });
  }

  function openHiveModal(editId) {
    if (!Db.getActiveApiaryId()) { toast('Önce bir arılık seçin', 'warning'); return; }
    const editing = editId ? Db.getHive(editId) : null;
    const title = editing ? 'Kovanı düzenle' : 'Yeni kovan';
    const today = new Date().toISOString().slice(0, 10);
    const h = editing || {};

    openModal(`
      <div class="modal-head">
        <h3>${title}</h3>
        <button class="modal-close" aria-label="Kapat">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <label class="form-label">Etiket <span class="req">*</span></label>
          <input id="m-label" class="form-input" placeholder="H-17" value="${escapeHtml(h.label || '')}" />
        </div>
        <div class="form-grid">
          <div class="form-row">
            <label class="form-label">Tip</label>
            <select id="m-type" class="form-select">
              ${['Langstroth','Dadant','National','WBC','Top-bar'].map(t => `<option ${h.hiveType===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">Çerçeve sayısı</label>
            <input id="m-frames" class="form-input" type="number" value="${h.frames || 10}" min="1" />
          </div>
        </div>
        <div class="form-grid">
          <div class="form-row">
            <label class="form-label">Ana arı ırkı</label>
            <select id="m-subspecies" class="form-select">
              <optgroup label="🇹🇷 Türkiye yerli ırkları">
                <option ${h.queenSubspecies==='Anadolu'?'selected':''} value="Anadolu">Anadolu (A. m. anatoliaca)</option>
                <option ${h.queenSubspecies==='Kafkas'?'selected':''} value="Kafkas">Kafkas (A. m. caucasica)</option>
                <option ${h.queenSubspecies==='Karniyol'?'selected':''} value="Karniyol">Karniyol (A. m. carnica)</option>
                <option ${h.queenSubspecies==='Karpat'?'selected':''} value="Karpat">Karpat (A. m. carpatica)</option>
                <option ${h.queenSubspecies==='Sakarya'?'selected':''} value="Sakarya">Sakarya (melez)</option>
                <option ${h.queenSubspecies==='Muğla'?'selected':''} value="Muğla">Muğla (yerel ekotip)</option>
                <option ${h.queenSubspecies==='Yığılca'?'selected':''} value="Yığılca">Yığılca (B. Karadeniz)</option>
                <option ${h.queenSubspecies==='Kırklareli'?'selected':''} value="Kırklareli">Kırklareli (Trakya)</option>
                <option ${h.queenSubspecies==='Gökçeada'?'selected':''} value="Gökçeada">Gökçeada (ada ekotipi)</option>
              </optgroup>
              <optgroup label="🌍 Yabancı ırklar">
                <option ${h.queenSubspecies==='Buckfast'?'selected':''} value="Buckfast">Buckfast (melez)</option>
                <option ${h.queenSubspecies==='İtalyan'?'selected':''} value="İtalyan">İtalyan (A. m. ligustica)</option>
                <option ${h.queenSubspecies==='Kıbrıs'?'selected':''} value="Kıbrıs">Kıbrıs (A. m. cypria)</option>
                <option ${h.queenSubspecies==='Suriye'?'selected':''} value="Suriye">Suriye (A. m. syriaca)</option>
                <option ${h.queenSubspecies==='Mısır'?'selected':''} value="Mısır">Mısır (A. m. lamarckii)</option>
              </optgroup>
              <optgroup label="🔬 Diğer">
                <option ${h.queenSubspecies==='Yerel-Survivor'?'selected':''} value="Yerel-Survivor">Yerel survivor</option>
                <option ${h.queenSubspecies==='Hibrit-F1'?'selected':''} value="Hibrit-F1">Hibrit F1</option>
                <option ${h.queenSubspecies==='Bilinmiyor'?'selected':''} value="Bilinmiyor">Bilinmiyor</option>
              </optgroup>
            </select>
          </div>
          <div class="form-row">
            <label class="form-label">Ana kurulum tarihi</label>
            <input id="m-qdate" class="form-input" type="date" value="${h.queenInstalled || today}" />
          </div>
        </div>
        <div class="form-row">
          <label class="form-label">İşaret rengi (yıl kodu)</label>
          <select id="m-marking" class="form-select">
            <option value="" ${!h.queenMarking?'selected':''}>— işaretlenmemiş —</option>
            <option value="blue" ${h.queenMarking==='blue'?'selected':''}>mavi (0/5)</option>
            <option value="white" ${h.queenMarking==='white'?'selected':''}>beyaz (1/6)</option>
            <option value="yellow" ${h.queenMarking==='yellow'?'selected':''}>sarı (2/7)</option>
            <option value="red" ${h.queenMarking==='red'?'selected':''}>kırmızı (3/8)</option>
            <option value="green" ${h.queenMarking==='green'?'selected':''}>yeşil (4/9)</option>
          </select>
        </div>
        <div class="form-row">
          <label class="form-label">Muayene sıklığı (gün)</label>
          <input id="m-interval" class="form-input" type="number" min="3" max="60" value="${h.inspectionIntervalDays || ''}" placeholder="(varsayılan: 14)" />
          <small style="color: #78716c; font-size: 12px;">Boş bırakırsan ayarlardaki varsayılan kullanılır.</small>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-secondary modal-close">İptal</button>
        <button class="btn-primary" id="m-save">${editing ? 'Güncelle' : 'Kaydet'}</button>
      </div>
    `);

    $$('.modal-close', document.getElementById('modal-root')).forEach(b => b.addEventListener('click', closeModal));
    $('#m-save').addEventListener('click', () => {
      const label = $('#m-label').value.trim();
      if (!label) { toast('Etiket gerekli', 'warning'); return; }
      const data = {
        label: label,
        hiveType: $('#m-type').value,
        frames: parseInt($('#m-frames').value) || 10,
        queenSubspecies: $('#m-subspecies').value,
        queenInstalled: $('#m-qdate').value,
        queenMarking: $('#m-marking').value,
      };
      const intervalVal = parseInt($('#m-interval').value);
      if (intervalVal && intervalVal > 0) data.inspectionIntervalDays = intervalVal;
      if (editing) {
        Db.updateHive(editId, data);
        closeModal();
        toast('Kovan güncellendi', 'success');
      } else {
        Db.addHive(data);
        closeModal();
        toast('Kovan eklendi', 'success');
      }
      Router.refresh();
    });
  }

  function openInspectionModal() {
    const hives = Db.listHives();
    if (hives.length === 0) { toast('Önce bir kovan ekleyin', 'warning'); return; }
    const today = new Date().toISOString().slice(0, 10);
    openModal(`
      <div class="modal-head">
        <h3>Yeni muayene</h3>
        <button class="modal-close" aria-label="Kapat">✕</button>
      </div>
      <div class="modal-body">
        <div class="form-row">
          <label class="form-label">Kovan</label>
          <select id="m-hive" class="form-select">${hives.map((h) => `<option value="${h.id}">${escapeHtml(h.label)}</option>`).join('')}</select>
        </div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Tarih</label><input id="m-date" class="form-input" type="date" value="${today}" /></div>
          <div class="form-row"><label class="form-label">Hava</label><input id="m-weather" class="form-input" placeholder="28°C güneşli" /></div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Yavru çerçeve</label><input id="m-brood" class="form-input" type="number" min="0" /></div>
          <div class="form-row"><label class="form-label">Arı çerçeve</label><input id="m-bees" class="form-input" type="number" min="0" /></div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Bal çerçeve</label><input id="m-stores" class="form-input" type="number" min="0" /></div>
          <div class="form-row"><label class="form-label">Mite/100 arı</label><input id="m-mite" class="form-input" type="number" step="0.1" min="0" /></div>
        </div>
        <div class="form-row">
          <label class="form-label">Yavru deseni</label>
          <select id="m-pattern" class="form-select">
            <option value="solid">düzenli</option>
            <option value="scattered">dağınık</option>
            <option value="shotgun">saçma</option>
            <option value="none">yok</option>
          </select>
        </div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Ana arı görüldü</label><select id="m-queen" class="form-select"><option value="true">evet</option><option value="false">hayır</option></select></div>
          <div class="form-row"><label class="form-label">Yumurta</label><select id="m-eggs" class="form-select"><option value="true">evet</option><option value="false">hayır</option></select></div>
        </div>
        <div class="form-row">
          <label class="form-label">Notlar</label>
          <textarea id="m-notes" class="form-textarea" rows="3"></textarea>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn-secondary modal-close">İptal</button>
        <button class="btn-primary" id="m-save">Kaydet</button>
      </div>
    `);
    // Frame hareketi sayaçları
    const faState = {
      'foundation-given': 0,
      'processed-given': 0,
      'capped-brood': 0,
      'open-brood': 0,
      'honey': 0,
      'pollen': 0,
      'honey-pollen': 0,
      'empty': 0,
      'queen-cell': 0,
    };
    const faLabels = {
      'foundation-given': 'Ham petek verildi',
      'processed-given': 'İşlenmiş petek verildi',
      'capped-brood': 'Kapalı yavrulu',
      'open-brood': 'Açık yavrulu',
      'honey': 'Ballı',
      'pollen': 'Polenli',
      'honey-pollen': 'Hem ballı+polenli',
      'empty': 'Boş (alındı)',
      'queen-cell': 'Ana hücreli',
    };

    function updateFaSummary() {
      const total = Object.values(faState).reduce(function(s, n) { return s + Math.abs(n); }, 0);
      const totalEl = document.getElementById('frame-total');
      if (totalEl) totalEl.textContent = total;
    }

    document.querySelectorAll('[data-fa-inc]').forEach(function(b){
      b.addEventListener('click', function(){
        faState[b.dataset.faInc]++;
        var el = document.querySelector('[data-fa-val="' + b.dataset.faInc + '"]');
        if (el) { el.textContent = faState[b.dataset.faInc]; updateFaSummary(); }
      });
    });
    document.querySelectorAll('[data-fa-dec]').forEach(function(b){
      b.addEventListener('click', function(){
        faState[b.dataset.faDec]--;
        var el = document.querySelector('[data-fa-val="' + b.dataset.faDec + '"]');
        if (el) { el.textContent = faState[b.dataset.faDec]; updateFaSummary(); }
      });
    });

    $('#m-save').addEventListener('click', () => {
      const hiveId = $('#m-hive').value;
      // Frame hareketlerini diziye dönüştür
      const frameMovements = [];
      Object.keys(faState).forEach(function(key) {
        const count = faState[key];
        if (count !== 0) {
          frameMovements.push({
            type: key,
            count: count, // pozitif = verildi, negatif = alındı
            label: faLabels[key],
          });
        }
      });

      Db.addInspection({
        hiveId,
        apiaryId: Db.getActiveApiaryId(),
        date: $('#m-date').value,
        weather: $('#m-weather').value,
        framesOfBrood: parseInt($('#m-brood').value) || 0,
        framesOfBees: parseInt($('#m-bees').value) || 0,
        framesOfStores: parseInt($('#m-stores').value) || 0,
        varroaPer100: parseFloat($('#m-mite').value) || 0,
        broodPattern: $('#m-pattern').value,
        queenSeen: $('#m-queen').value === 'true',
        eggsSeen: $('#m-eggs').value === 'true',
        frameMovements: frameMovements,
        notes: $('#m-notes').value,
      });
      closeModal();
      const fmCount = frameMovements.length;
      toast(fmCount > 0 ? 'Muayene kaydedildi (' + fmCount + ' çerçeve hareketi)' : 'Muayene kaydedildi', 'success');
      Router.refresh();
    });
  }

  function openTreatmentModal() {
    const hives = Db.listHives();
    if (hives.length === 0) { toast('Önce bir kovan ekleyin', 'warning'); return; }
    const today = new Date().toISOString().slice(0, 10);
    openModal(`
      <div class="modal-head"><h3>Yeni tedavi</h3><button class="modal-close">✕</button></div>
      <div class="modal-body">
        <div class="form-row"><label class="form-label">Kovan</label><select id="m-hive" class="form-select">${hives.map((h) => `<option value="${h.id}">${escapeHtml(h.label)}</option>`).join('')}</select></div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Tarih</label><input id="m-date" class="form-input" type="date" value="${today}" /></div>
          <div class="form-row"><label class="form-label">Madde</label>
            <select id="m-substance" class="form-select">
              <option>Oksalik asit</option><option>Formik asit</option><option>Timol</option><option>Amitraz</option><option>Flumetrin</option><option>Fumagillin</option>
            </select>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Form</label><input id="m-form" class="form-input" placeholder="buhar / damla / ped" /></div>
          <div class="form-row"><label class="form-label">Doz</label><input id="m-dose" class="form-input" placeholder="2 g / kovan" /></div>
        </div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Sıcaklık (°C)</label><input id="m-temp" class="form-input" type="number" /></div>
          <div class="form-row"><label class="form-label">Sonuç</label>
            <select id="m-outcome" class="form-select"><option value="pending">beklemede</option><option value="success">başarılı</option><option value="partial">kısmi</option><option value="failed">başarısız</option></select>
          </div>
        </div>
        <div class="form-row"><label class="form-label">Notlar</label><textarea id="m-notes" class="form-textarea" rows="2"></textarea></div>
      </div>
      <div class="modal-foot"><button class="btn-secondary modal-close">İptal</button><button class="btn-primary" id="m-save">Kaydet</button></div>
    `);
    $('#m-save').addEventListener('click', () => {
      Db.addTreatment({
        hiveId: $('#m-hive').value,
        apiaryId: Db.getActiveApiaryId(),
        date: $('#m-date').value,
        substance: $('#m-substance').value,
        form: $('#m-form').value,
        dose: $('#m-dose').value,
        ambientTemp: parseFloat($('#m-temp').value) || null,
        outcome: $('#m-outcome').value,
        notes: $('#m-notes').value,
      });
      closeModal();
      toast('Tedavi kaydedildi', 'success');
      Router.refresh();
    });
  }

  function openHarvestModal() {
    const hives = Db.listHives();
    if (hives.length === 0) { toast('Önce bir kovan ekleyin', 'warning'); return; }
    const today = new Date().toISOString().slice(0, 10);
    openModal(`
      <div class="modal-head"><h3>Hasat kaydı</h3><button class="modal-close">✕</button></div>
      <div class="modal-body">
        <div class="form-row"><label class="form-label">Kovan</label><select id="m-hive" class="form-select">${hives.map((h) => `<option value="${h.id}">${escapeHtml(h.label)}</option>`).join('')}</select></div>
        <div class="form-grid">
          <div class="form-row"><label class="form-label">Tarih</label><input id="m-date" class="form-input" type="date" value="${today}" /></div>
          <div class="form-row"><label class="form-label">Verim (kg)</label><input id="m-yield" class="form-input" type="number" step="0.1" min="0" /></div>
        </div>
        <div class="form-row">
          <label class="form-label">Bal tipi</label>
          <select id="m-type" class="form-select">
            <option>Yabani çiçek</option><option>Ayçiçeği</option><option>Çam balı</option><option>Kekik</option><option>Akasya</option><option>Ihlamur</option><option>Karışık</option>
          </select>
        </div>
        <div class="form-row"><label class="form-label">Notlar</label><textarea id="m-notes" class="form-textarea" rows="2"></textarea></div>
      </div>
      <div class="modal-foot"><button class="btn-secondary modal-close">İptal</button><button class="btn-primary" id="m-save">Kaydet</button></div>
    `);
    $('#m-save').addEventListener('click', () => {
      Db.addHarvest({
        hiveId: $('#m-hive').value,
        apiaryId: Db.getActiveApiaryId(),
        date: $('#m-date').value,
        yieldKg: parseFloat($('#m-yield').value) || 0,
        honeyType: $('#m-type').value,
        notes: $('#m-notes').value,
      });
      closeModal();
      toast('Hasat kaydedildi', 'success');
      Router.refresh();
    });
  }

  // ===========================================================
  // Toast
  // ===========================================================

  function toast(msg, kind = '') {
    const root = $('#toast-root');
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = msg;
    root.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity 0.3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    }, 3000);
  }

  // ===========================================================
  // Public API
  // ===========================================================

  global.BeeViews = {
    renderDashboard,
    renderHives,
    renderInspections,
    renderTreatments,
    renderHarvests,
    renderAdvisor,
    renderKnowledge,
    renderReports,
    openHiveModal,
    openInspectionModal,
    openTreatmentModal,
    openHarvestModal,
    openApiaryModal,
    closeModal,
    toast,
  };
})(window);