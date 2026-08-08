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