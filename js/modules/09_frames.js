/* ===== js/modules/frames.js ===== */
// ============ FRAMES ============
const framesModule = {
  edit(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    const summary = BM.Storage.list('frames').filter(x => x.hiveId === hiveId).reduce((acc, x) => {
      acc[x.frameType] = (acc[x.frameType] || 0) + 1; return acc;
    }, {});
    BM.Modal.open('Çerçeve #' + f.position + ' — Detay',
      `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(70px,1fr));gap:var(--space-2);margin-bottom:var(--space-4)">
          <div style="background:rgba(249,115,22,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--orange)">${summary.brood || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Yumurtalık</div></div>
          <div style="background:rgba(245,158,11,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--honey-500)">${summary.honey || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Bal</div></div>
          <div style="background:rgba(168,85,247,0.12);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#a855f7">${summary.pollen || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Polen</div></div>
          <div style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--text-secondary)">${summary.foundation || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Perga</div></div>
          <div style="background:transparent;border:1px dashed var(--n-700);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--text-muted)">${summary.empty || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Boş</div></div>
        </div>
        <label class="field"><span class="field-label">Tip</span>
          <select class="select" name="frameType">
            ${['brood','honey','pollen','perga','foundation'].map(t => `<option value="${t}"${f.frameType === t ? ' selected' : ''}>${({brood:'Yumurtalık',honey:'Bal',pollen:'Polen',perga:'Perga (Polen+Bal)',foundation:'Ham Petek'})[t]}</option>`).join('')}
          </select></label>
        <div class="field-row">
          <label class="field"><span class="field-label">Temel</span>
            <select class="select" name="foundationType">
              <option value="wax"${f.foundationType === 'wax' ? ' selected' : ''}>Mum</option>
              <option value="plastic"${f.foundationType === 'plastic' ? ' selected' : ''}>Plastik</option>
              <option value="foundationless"${f.foundationType === 'foundationless' ? ' selected' : ''}>Temesiz</option>
            </select></label>
          <label class="field"><span class="field-label">Durum</span>
            <select class="select" name="status">
              ${[
                {v:'in_use', l:'Kullanımda'},
                {v:'extracted', l:'Çıkarıldı'},
                {v:'cleaning', l:'Temizleniyor'},
                {v:'stored', l:'Depoda'},
                {v:'retired', l:'Emekli'}
              ].map(o => `<option value="${o.v}"${f.status === o.v ? ' selected' : ''}>${o.l}</option>`).join('')}
            </select></label>
        </div>
        <div class="field-row">
          <label class="field"><span class="field-label">Döngü</span>
            <input class="input" name="cyclesCompleted" type="number" min="0" value="${f.cyclesCompleted}"></label>
          <label class="field"><span class="field-label">Petek Yaşı (ay)</span>
            <input class="input" name="waxAgeMonths" type="number" min="0" value="${f.waxAgeMonths || 0}"></label>
        </div>
        <label class="field"><span class="field-label">Son Bal Alımı</span>
          <input class="input" name="lastExtractedAt" type="date" value="${f.lastExtractedAt || ''}"></label>
        <label class="field"><span class="field-label">Notlar</span>
          <textarea class="textarea" name="notes" rows="2">${BM.esc(f.notes || '')}</textarea></label>
        <div style="margin-top:var(--space-4);padding-top:var(--space-2);border-top:1px solid var(--n-800);display:flex;gap:var(--space-2);justify-content:flex-end;">
          <button type="button" class="btn btn--sm" onclick="BM.frames.upgradeCycle('${f.id}', '${hiveId}')">Döngü Tamamla (+1)</button>
          <button type="button" class="btn btn--sm" onclick="BM.frames.ageWax('${f.id}', '${hiveId}')">Petek Yaşı (+1 ay)</button>
          <button type="button" class="btn btn--danger btn--sm" onclick="BM.frames.retire('${f.id}', '${hiveId}')">Emekli Et</button>
        </div>`,
      (d) => {
        d.cyclesCompleted = parseInt(d.cyclesCompleted) || 0;
        d.waxAgeMonths = parseInt(d.waxAgeMonths) || 0;
        BM.Storage.update('frames', frameId, d);
        BM.Toast.show('Çerçeve güncellendi ✓', 'success');
        BM.hives._renderTab(hiveId, 'frames');
        return true;
      }
    );
  },

  // FR-04: Cerceve dongu tamamla (upgrade)
  upgradeCycle(frameId, hiveId) {
    const f = BM.Storage.get('frames', frameId);
    if (!f) return;
    const newCycles = (f.cyclesCompleted || 0) + 1;
    BM.Storage.update('frames', frameId, { cyclesCompleted: newCycles });
    BM.Toast.show('Don tamamlandi · Dongu sayisi: ' + newCycles, 'success');
    BM.hives._renderTab(hiveId, 'frames');
    const overlay = document.querySelector('.modal-overlay--active');
    if (overlay) BM.Modal.close();
  },

  // Petek yasi artir (aging)
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

