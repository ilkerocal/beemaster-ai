(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const framesModule = {
  edit(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    const summary = BM.Storage.list('frames').filter(x => x.hiveId === hiveId).reduce((acc, x) => {
      const t = (x.frameType === 'empty' ? 'foundation' : x.frameType) || 'foundation';
      acc[t] = (acc[t] || 0) + 1; return acc;
    }, { brood: 0, honey: 0, pollen: 0, perga: 0, foundation: 0 });
    BM.Modal.open('Çerçeve #' + f.position + ' — Detay',
      `<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:var(--space-2);margin-bottom:var(--space-4)">
          <div style="background:rgba(249,115,22,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#f97316">${summary.brood || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Yumurtalık</div></div>
          <div style="background:rgba(245,158,11,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--honey-500)">${summary.honey || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Bal</div></div>
          <div style="background:rgba(168,85,247,0.12);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#a855f7">${summary.pollen || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Polen</div></div>
          <div style="background:rgba(180,83,9,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#b45309">${summary.perga || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Perga</div></div>
          <div style="background:var(--bg-tertiary);border:1px dashed var(--n-700);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--text-secondary)">${summary.foundation || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Ham Petek</div></div>
        </div>
        <label class="field"><span class="field-label">Tip</span>
          <select class="select" name="frameType">
            ${['brood','honey','pollen','perga','foundation'].map(t => `<option value="${t}"${f.frameType === t ? ' selected' : ''}>${({brood:'Yumurtalık',honey:'Bal',pollen:'Polen',perga:'Perga (Polen+Bal)',foundation:'Ham Petek'})[t]}</option>`).join('')}
          </select></label>
        <div class="field-row">
          <label class="field"><span class="field-label">Temel</span>
            <select class="select" name="foundationType">
              ${['wax','plastic','none'].map(t => `<option value="${t}"${f.foundationType === t ? ' selected' : ''}>${({wax:'Balmumu',plastic:'Plastik',none:'Ham Peteksiz'})[t]}</option>`).join('')}
            </select></label>
          <label class="field"><span class="field-label">Durum</span>
            <select class="select" name="status">
              ${['in_use','empty','storage','retired'].map(t => `<option value="${t}"${f.status === t ? ' selected' : ''}>${({in_use:'Kullanımda',empty:'Boş',storage:'Depoda',retired:'Emekli'})[t]}</option>`).join('')}
            </select></label>
        </div>
        <div class="field-row">
          <label class="field"><span class="field-label">Döngü Sayısı</span>
            <input class="input" name="cyclesCompleted" type="number" min="0" value="${f.cyclesCompleted || 0}"></label>
          <label class="field"><span class="field-label">Petek Yaşı (ay)</span>
            <input class="input" name="waxAgeMonths" type="number" min="0" value="${f.waxAgeMonths || 0}"></label>
        </div>
        <label class="field"><span class="field-label">Son Bal Süzme Tarihi</span>
          <input class="input" name="lastExtractedAt" type="date" value="${f.lastExtractedAt || ''}"></label>
        <label class="field"><span class="field-label">Notlar</span>
          <textarea class="textarea" name="notes" rows="2">${BM.esc(f.notes || '')}</textarea></label>`,
      (d) => {
        const parsed = {
          frameType: d.frameType,
          foundationType: d.foundationType,
          status: d.status,
          cyclesCompleted: parseInt(d.cyclesCompleted) || 0,
          waxAgeMonths: parseInt(d.waxAgeMonths) || 0,
          lastExtractedAt: d.lastExtractedAt || null,
          notes: d.notes || ''
        };
        BM.Storage.update('frames', frameId, parsed);
        BM.Toast.show('Çerçeve güncellendi ✓', 'success');
        BM.hives._renderTab(hiveId, 'frames');
        return true;
      }
    );
  },

  // FR-04: Petek yasi +1 ay
  ageWax(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    const newAge = (f.waxAgeMonths || 0) + 1;
    BM.Storage.update('frames', frameId, { waxAgeMonths: newAge });
    BM.Toast.show('Petek yasi +1 ay · Toplam: ' + newAge + ' ay', 'info');
    BM.hives._renderTab(hiveId, 'frames');
    const overlay = document.querySelector('.modal-overlay--active');
    if (overlay) BM.Modal.close();
  },

  // FR-05: Cerceve emekli et
  retire(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    BM.Modal.confirm('Bu cerceveyi emekli etmek istiyor musunuz? Emekli cerceveler tekrar kullanilmaz.', () => {
      BM.Storage.update('frames', frameId, { status: 'retired', frameType: 'empty' });
      BM.Toast.show('Cerceve emekli edildi', 'info');
      BM.hives._renderTab(hiveId, 'frames');
      const overlay = document.querySelector('.modal-overlay--active');
      if (overlay) BM.Modal.close();
    });
  }
};

  BM.frames = framesModule;
})(window);
