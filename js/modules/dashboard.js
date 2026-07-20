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

  // ============ ANALYTICS ============
  const analyticsModule = {
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
  const reportsModule = {
    templates: [
      { id: 'monthly', icon: '📊', name: 'Aylık Performans', desc: 'Tüm kovanların aylık özeti' },
      { id: 'health', icon: '⚠️', name: 'Sağlık Raporu', desc: 'Varroa, hastalık ve tedavi durumu' },
      { id: 'queens', icon: '👑', name: 'Ana Arı Performans', desc: 'Tüm ana arıların karşılaştırması' },
      { id: 'inventory', icon: '📦', name: 'Envanter Raporu', desc: 'Stok durumu ve uyarılar' },
      { id: 'financial', icon: '💰', name: 'Gelir/Gider Analizi', desc: 'Maliyet ve verim özeti' },
      { id: 'seasonal', icon: '📅', name: 'Sezonluk Özet', desc: 'Tüm yılın performansı' }
    ],

    render() {
      return `<div class="actions-bar"><div><h2 style="font-size:18px;font-weight:700">Raporlar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">Modal önizleme + PDF export</div></div><button class="btn" onclick="App.exportData()">📥 JSON Yedek</button></div>
      <div class="grid-3">${this.templates.map(t => `<div class="card">
        <div style="text-align:center">
          <div style="font-size:42px;margin-bottom:var(--space-3)">${t.icon}</div>
          <div style="font-size:14px;font-weight:700;margin-bottom:var(--space-1)">${BM.esc(t.name)}</div>
          <div style="font-size:11.5px;color:var(--text-secondary);margin-bottom:var(--space-4)">${BM.esc(t.desc)}</div>
          <div style="display:flex;gap:var(--space-2);justify-content:center">
            <button class="btn btn--sm" onclick="BM.reports.show('${t.id}')">👁 Önizleme</button>
            <button class="btn btn--sm btn--primary" onclick="BM.reports.pdf('${t.id}')">📄 PDF</button>
          </div>
        </div>
      </div>`).join('')}</div>`;
    },

    show(id) {
      BM.Modal.showReport(this._renderReport(id));
    },

    pdf(id) {
      const html = this._renderReport(id);
      const w = window.open('', '_blank');
      if (!w) { BM.Toast.show('Pop-up engellendi', 'error'); return; }
      w.document.write(`<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><title>BeeMaster AI — Rapor</title>
        <style>body{font-family:system-ui,sans-serif;padding:30px;max-width:800px;margin:0 auto;color:#111}
        h1,h2{border-bottom:2px solid #F4B400;padding-bottom:6px}
        table{width:100%;border-collapse:collapse;margin:12px 0;font-size:13px}
        th,td{padding:8px;border:1px solid #ddd;text-align:left}
        th{background:#F4B400;color:#000;font-weight:700}
        .badge{display:inline-block;padding:2px 8px;border-radius:99px;font-size:11px;font-weight:600;background:#fffbeb;color:#92400e}
        .no-print{background:#F4B400;color:#000;border:none;padding:10px 20px;border-radius:6px;cursor:pointer;margin-bottom:20px;font-weight:600}
        @media print{body{padding:15px}}
        </style></head><body>
        <button class="no-print" onclick="window.print()">🖨 Yazdır / PDF Kaydet</button>
        ${html}
        </body></html>`);
      w.document.close();
    },

    _renderReport(id) {
      const s = BM.Storage.state;
      if (id === 'monthly') {
        const totalHoney = s.harvests.reduce((s, h) => s + h.weight, 0);
        return `<h1>📊 Aylık Performans Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <h2>Genel Özet</h2>
          <table>
            <tr><th>Aktif Kovan</th><td>${s.hives.length}</td></tr>
            <tr><th>Toplam Bal</th><td>${BM.fmt(totalHoney)} kg</td></tr>
            <tr><th>Muayene</th><td>${s.inspections.length}</td></tr>
            <tr><th>Aktif Tedavi</th><td>${s.treatments.filter(t => t.status === 'in_progress').length}</td></tr>
            <tr><th>Arı Üssü</th><td>${s.apiaries.length}</td></tr>
          </table>
          <h2>Üs Bazında Verim</h2>
          <table>
            <thead><tr><th>Üs</th><th>Kovan</th><th>Toplam Bal</th><th>Ortalama</th></tr></thead>
            <tbody>${s.apiaries.map(a => {
              const honey = s.harvests.filter(h => h.apiaryId === a.id).reduce((s, h) => s + h.weight, 0);
              const hc = s.hives.filter(h => h.apiaryId === a.id).length;
              return `<tr><td>${BM.esc(a.name)}</td><td>${hc}</td><td>${BM.fmt(honey)} kg</td><td>${hc > 0 ? (honey / hc).toFixed(1) : 0} kg</td></tr>`;
            }).join('')}</tbody>
          </table>`;
      }
      if (id === 'health') {
        const dangers = s.hives.filter(h => { const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0]; return last && last.varroaCount >= 6; });
        return `<h1>⚠️ Sağlık Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <h2>Kritik Kovanlar (Varroa ≥6)</h2>
          ${dangers.length ? `<table>
            <thead><tr><th>Kovan</th><th>Son Varroa</th><th>Tarih</th></tr></thead>
            <tbody>${dangers.map(h => {
              const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
              return `<tr><td>${BM.esc(h.name)}</td><td><span class="badge">${last.varroaCount}</span></td><td>${BM.dateStr(last.date)}</td></tr>`;
            }).join('')}</tbody>
          </table>` : '<p>Tüm kovanlar sağlıklı ✓</p>'}`;
      }
      if (id === 'queens') {
        return `<h1>👑 Ana Arı Performans Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <table>
            <thead><tr><th>Kovan</th><th>Irk</th><th>Yaş</th><th>Verim</th><th>Performans</th></tr></thead>
            <tbody>${s.queens.map(q => {
              const h = BM.Storage.get('hives', q.hiveId);
              const age = ((Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5)).toFixed(1);
              const honey = s.harvests.filter(hv => hv.hiveId === q.hiveId).reduce((s, hv) => s + hv.weight, 0);
              return `<tr><td>${BM.esc(h ? h.name : '?')}</td><td>${BM.esc(q.strain)}</td><td>${age} yıl</td><td>${BM.fmt(honey)} kg</td><td><span class="badge">${(q.performanceScore * 100).toFixed(0)}%</span></td></tr>`;
            }).join('')}</tbody>
          </table>`;
      }
      if (id === 'inventory') {
        const total = s.inventory.reduce((s, i) => s + (i.quantity * (i.costTry || 0)), 0);
        const low = s.inventory.filter(i => i.quantity <= i.minStock);
        return `<h1>📦 Envanter Raporu</h1>
          <p>Tarih: ${BM.dateStr(BM.today())} · Toplam Değer: ₺${BM.fmt(total, 0)}</p>
          ${low.length ? `<h2 style="color:#c00">⚠️ Düşük Stok</h2>
            <table><thead><tr><th>Malzeme</th><th>Mevcut</th><th>Min</th></tr></thead>
            <tbody>${low.map(i => `<tr><td>${BM.esc(i.name)}</td><td>${i.quantity} ${i.unit}</td><td>${i.minStock} ${i.unit}</td></tr>`).join('')}</tbody></table>` : ''}
          <h2>Tüm Stok</h2>
          <table><thead><tr><th>Malzeme</th><th>Kategori</th><th>Miktar</th><th>Değer</th></tr></thead>
          <tbody>${s.inventory.map(i => `<tr><td>${BM.esc(i.name)}</td><td>${BM.T.invCat(i.category)}</td><td>${i.quantity} ${i.unit}</td><td>₺${BM.fmt(i.quantity * (i.costTry || 0), 0)}</td></tr>`).join('')}</tbody></table>`;
      }
      if (id === 'financial') {
        const treatCost = s.treatments.length * 85;
        const feedCost = s.feedings.reduce((s, f) => s + f.amountKg * 12, 0);
        const honey = s.harvests.reduce((s, h) => s + h.weight, 0);
        const revenue = honey * 250;
        return `<h1>💰 Gelir/Gider Analizi</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <table>
            <thead><tr><th>Kalem</th><th>Miktar</th><th>Birim</th><th>Toplam</th></tr></thead>
            <tbody>
              <tr><td>🍯 Bal Hasadı</td><td>${BM.fmt(honey)} kg</td><td>₺250/kg</td><td style="color:#16a34a;font-weight:700">+₺${BM.fmt(revenue, 0)}</td></tr>
              <tr><td>💊 Tedavi</td><td>${s.treatments.length} işlem</td><td>₺85/işlem</td><td style="color:#dc2626;font-weight:700">-₺${BM.fmt(treatCost, 0)}</td></tr>
              <tr><td>🌾 Besleme</td><td>${BM.fmt(s.feedings.reduce((s, f) => s + f.amountKg, 0))} kg</td><td>₺12/kg</td><td style="color:#dc2626;font-weight:700">-₺${BM.fmt(feedCost, 0)}</td></tr>
              <tr style="background:#F4B400"><th>NET</th><th colspan="2"></th><th style="font-weight:700">₺${BM.fmt(revenue - treatCost - feedCost, 0)}</th></tr>
            </tbody>
          </table>`;
      }
      if (id === 'seasonal') {
        const totalHoney = s.harvests.reduce((s, h) => s + h.weight, 0);
        return `<h1>📅 Sezonluk Özet — 2026</h1>
          <p>Tarih: ${BM.dateStr(BM.today())}</p>
          <table>
            <tr><th>Toplam Bal</th><td>${BM.fmt(totalHoney)} kg</td></tr>
            <tr><th>Muayene</th><td>${s.inspections.length}</td></tr>
            <tr><th>Üs</th><td>${s.apiaries.length}</td></tr>
            <tr><th>Kovan</th><td>${s.hives.length}</td></tr>
          </table>`;
      }
      return '';
    }
  };

  // ============ SETTINGS ============
  const settingsModule = {
    render() {
      const items = [
        { icon: '👤', name: 'Kullanıcı', desc: 'İlker Öcal · Diyarbakır, Eğil' },
        { icon: '🔔', name: 'Bildirim Tercihleri', desc: 'Varroa, stok, ana arı uyarıları', fn: 'BM.notify.show()' },
        { icon: '📱', name: 'PWA Yükle', desc: 'Telefon/PC ana ekrana ekle', fn: 'BM.pwa.install()' },
        { icon: '🌍', name: 'Konum', desc: 'GPS ile otomatik konum', fn: 'BM.utils.useLocation()' },
        { icon: '🔄', name: 'Onboarding', desc: 'Tanıtım sihirbazını tekrar aç', fn: 'BM.onboarding.show()' },
        { icon: '🎨', name: 'Tema & Görünüm', desc: 'Koyu/Açık mod', fn: 'App.toggleTheme()' },
        { icon: '🔔', name: 'Bildirim Kontrolü', desc: 'Tüm aktif uyarıları şimdi kontrol et', fn: 'BM.notify.check()' },
        { icon: 'ℹ️', name: 'Hakkında', desc: 'BeeMaster AI v2.0 · Spec-Driven PWA' }
      ];
      return `<div class="actions-bar"><div><h2 style="font-size:18px;font-weight:700">Ayarlar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">Uygulama ve hesap</div></div></div>
      <div class="grid-3">${items.map(s => `<div class="card" style="cursor:pointer" onclick="${s.fn || 'void(0)'}">
        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <div style="width:42px;height:42px;border-radius:var(--r-lg);background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:20px">${s.icon}</div>
          <div><div style="font-size:14px;font-weight:700">${BM.esc(s.name)}</div><div style="font-size:11.5px;color:var(--text-secondary)">${BM.esc(s.desc)}</div></div>
        </div>
      </div>`).join('')}</div>
      <div class="card" style="margin-top:var(--space-4)">
        <div class="card-title">Veri Yönetimi</div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap">
          <button class="btn" onclick="App.exportData()">📥 JSON Dışa Aktar</button>
          <button class="btn" onclick="App.importData()">📤 JSON İçe Aktar</button>
          <button class="btn btn--danger" onclick="App.resetData()">🗑️ Tüm Veriyi Sıfırla</button>
        </div>
      </div>`;
    }
  };

  // ============ ONBOARDING ============
  const onboardingModule = {
    init() {
      if (localStorage.getItem('bm-onboarded')) return;
      setTimeout(() => this.show(), 500);
    },

    show() {
      BM.Modal.open('🐝 BeeMaster AI\'ye Hoş Geldiniz',
        `<div style="text-align:center;padding:var(--space-5) 0">
          <div style="font-size:64px;margin-bottom:var(--space-4)">🐝</div>
          <h2 style="margin-bottom:var(--space-2)">Arıcılık Yönetiminin Yeni Adı</h2>
          <p style="color:var(--text-secondary);font-size:13px;line-height:1.6;margin-bottom:var(--space-5)">
            BeeMaster AI ile kovanlarınızı, üslerinizi, muayenelerinizi ve hasadınızı tek yerden yönetin.<br>
            Offline çalışır, verileriniz cihazınızda güvenle saklanır.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);text-align:left">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">🏠</div><div style="font-size:12px;font-weight:600">Kovan Yönetimi</div><div style="font-size:10px;color:var(--text-secondary)">Çerçeve haritası, ana arı</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">🤖</div><div style="font-size:12px;font-weight:600">AI Önerileri</div><div style="font-size:10px;color:var(--text-secondary)">Varroa, besleme, hasat</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">📱</div><div style="font-size:12px;font-weight:600">Offline-First</div><div style="font-size:10px;color:var(--text-secondary)">İnternetsiz çalışır</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">📊</div><div style="font-size:12px;font-weight:600">Analitik</div><div style="font-size:10px;color:var(--text-secondary)">Üs performansı</div></div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-2);padding-top:var(--space-4);border-top:1px solid var(--n-800);margin-top:var(--space-4)">
          <button type="button" class="btn btn--ghost" onclick="BM.onboarding.skip()">Atla</button>
          <button type="button" class="btn btn--primary" onclick="BM.onboarding.step2()">İleri →</button>
        </div>`,
        () => true
      );
    },

    step2() {
      BM.Modal.open('🐝 İlk Üssünü Oluştur',
        `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:var(--space-4)">İlk arı üssünü oluşturarak başla. Konum eklemek haritada görünmesini sağlar.</p>
         <label class="field"><span class="field-label">Üs Adı *</span>
           <input class="input" name="name" required value="Eğil Merkez"></label>
         <label class="field"><span class="field-label">Konum *</span>
           <input class="input" name="location" required value="Eğil, Diyarbakır"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Enlem</span>
             <input class="input" name="lat" type="number" step="0.001" value="38.247"></label>
           <label class="field"><span class="field-label">Boylam</span>
             <input class="input" name="lng" type="number" step="0.001" value="40.135"></label>
         </div>
         <button type="button" class="btn" onclick="BM.onboarding.useLocation()" style="margin-top:var(--space-2);width:100%">📍 Konumumu Al</button>
         <label class="field" style="margin-top:var(--space-3)"><span class="field-label">Flora</span>
           <input class="input" name="flora" value="Geven, Kekik, Adaçayı"></label>
         <div style="display:flex;justify-content:space-between;gap:var(--space-2);padding-top:var(--space-4);border-top:1px solid var(--n-800);margin-top:var(--space-4)">
           <button type="button" class="btn btn--ghost" onclick="BM.onboarding.show()">← Geri</button>
           <button type="button" class="btn btn--primary" onclick="BM.onboarding.create()">Üs Oluştur ✓</button>
         </div>`,
        () => true
      );
    },

    useLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            document.querySelector('input[name="lat"]').value = pos.coords.latitude.toFixed(3);
            document.querySelector('input[name="lng"]').value = pos.coords.longitude.toFixed(3);
            BM.Toast.show('Konum alındı ✓', 'success');
          },
          err => BM.Toast.show('Konum alınamadı: ' + err.message, 'error')
        );
      }
    },

    create() {
      const get = sel => document.querySelector(sel);
      const name = get('input[name="name"]').value.trim();
      const location = get('input[name="location"]').value.trim();
      if (!name || !location) { BM.Toast.show('Ad ve konum gerekli', 'error'); return; }
      BM.Storage.add('apiaries', {
        name, location,
        lat: parseFloat(get('input[name="lat"]').value) || null,
        lng: parseFloat(get('input[name="lng"]').value) || null,
        flora: get('input[name="flora"]').value.trim(),
        notes: ''
      });
      localStorage.setItem('bm-onboarded', '1');
      BM.Toast.show('İlk üs oluşturuldu ✓', 'success');
      BM.Modal.close();
      App.render('apiaries');
    },

    skip() {
      localStorage.setItem('bm-onboarded', '1');
      BM.Modal.close();
    }
  };

  // ============ NOTIFY ============
  const notifyModule = {
    prefs: null,
    load() {
      try {
        const saved = localStorage.getItem('bm-notify');
        this.prefs = saved ? JSON.parse(saved) : { varroaHigh: true, lowStock: true, queenOld: true, harvestDue: true };
      } catch (e) { this.prefs = { varroaHigh: true, lowStock: true, queenOld: true, harvestDue: true }; }
    },
    save() { try { localStorage.setItem('bm-notify', JSON.stringify(this.prefs)); } catch (e) {} },

    check() {
      this.load();
      const s = BM.Storage.state;
      if (this.prefs.varroaHigh) {
        s.hives.forEach(h => {
          const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
          if (last && last.varroaCount >= 6) BM.Toast.show(`🔔 ${h.name}: Varroa ${last.varroaCount} (kritik)`, 'warn');
        });
      }
      if (this.prefs.lowStock) {
        s.inventory.filter(i => i.quantity <= i.minStock).slice(0, 2).forEach(i => {
          BM.Toast.show(`🔔 ${i.name}: Stok az (${i.quantity} ${i.unit})`, 'warn');
        });
      }
    },

    show() {
      this.load();
      const p = this.prefs;
      BM.Modal.open('🔔 Bildirim Tercihleri',
        `<label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np1"${p.varroaHigh ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">🦠 Yüksek Varroa</div><div style="font-size:11px;color:var(--text-secondary)">Kovanlarda varroa 6+ olduğunda</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np2"${p.lowStock ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">📦 Düşük Stok</div><div style="font-size:11px;color:var(--text-secondary)">Envanter minimuma düştüğünde</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np3"${p.queenOld ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">👑 Ana Arı Yaşı</div><div style="font-size:11px;color:var(--text-secondary)">Ana arı 3+ yıl olduğunda</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np4"${p.harvestDue ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">🍯 Hasat Zamanı</div><div style="font-size:11px;color:var(--text-secondary)">Son hasattan 30+ gün geçtiğinde</div></div></label>`,
        () => {
          this.prefs = {
            varroaHigh: document.getElementById('np1').checked,
            lowStock: document.getElementById('np2').checked,
            queenOld: document.getElementById('np3').checked,
            harvestDue: document.getElementById('np4').checked
          };
          this.save();
          BM.Toast.show('Bildirim tercihleri kaydedildi ✓', 'success');
          return true;
        }
      );
    }
  };

  // ============ PWA ============
  const pwaModule = {
    deferredPrompt: null,
    init() {
      window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.deferredPrompt = e; });
      window.addEventListener('appinstalled', () => BM.Toast.show('BeeMaster AI yüklendi! 🎉', 'success'));
    },
    install() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(r => {
          if (r.outcome === 'accepted') BM.Toast.show('Yükleme başladı...', 'info');
          this.deferredPrompt = null;
        });
      } else {
        BM.Toast.show('Tarayıcı yüklemeyi desteklemiyor veya zaten yüklü', 'info');
      }
    }
  };

  // ============ UTILS extension ============
  const utilsExt = {
    useLocation() {
      if (!navigator.geolocation) { BM.Toast.show('Tarayıcı desteklemiyor', 'error'); return; }
      navigator.geolocation.getCurrentPosition(
        pos => BM.Toast.show(`Konum: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`, 'success'),
        err => BM.Toast.show('Konum alınamadı', 'error')
      );
    }
  };

  BM.dashboard = dashboardModule;
  BM.analytics = analyticsModule;
  BM.reports = reportsModule;
  BM.settings = settingsModule;
  BM.onboarding = onboardingModule;
  BM.notify = notifyModule;
  BM.pwa = pwaModule;
  BM.utils = Object.assign(BM.utils || {}, utilsExt);
  pwaModule.init();
  notifyModule.load();
})(window);
