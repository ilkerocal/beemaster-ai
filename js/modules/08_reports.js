(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var reportsModule = {
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

  BM.reports = reportsModule;
})(window);
