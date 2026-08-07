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
