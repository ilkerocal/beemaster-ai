(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var feedingModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Besleme',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Tip *</span>
             <select class="select" name="type" required onchange="BM.feeding.updateUnit(this)">
               ${['sugar_syrup','sugar_syrup_1to1','fondant','pollen_patty','candy','honey_water','invert_syrup','protein_patty'].map(t => `<option value="${t}">${BM.T.feedType(t).tr}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label" id="feed-unit-label">Miktar (L) *</span>
             <input class="input" name="amountKg" type="number" step="0.1" min="0" required value="1.0"></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Sebep</span>
             <select class="select" name="reason">
               ${['weak_colony','winter_prep','drought','supplement','stimulative'].map(r => `<option value="${r}">${BM.T.reason(r)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status"><option value="planned">Planlı</option><option value="in_progress">Sürüyor</option><option value="completed" selected>Tamamlandı</option></select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { d.amountKg = parseFloat(d.amountKg) || 0; BM.Storage.add('feedings', d); BM.Toast.show('Besleme kaydedildi ✓', 'success'); App.render('feeding'); return true; }
      );
    },
    edit(id) {
      const f = BM.Storage.get('feedings', id); if (!f) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === f.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Besleme Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${f.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Tip</span>
             <select class="select" name="type">${['sugar_syrup','sugar_syrup_1to1','fondant','pollen_patty','candy','honey_water','invert_syrup','protein_patty'].map(t => `<option value="${t}"${f.type === t ? ' selected' : ''}>${BM.T.feedType(t).tr}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Miktar (kg)</span>
             <input class="input" name="amountKg" type="number" step="0.1" value="${f.amountKg}"></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Sebep</span>
             <select class="select" name="reason">${['weak_colony','winter_prep','drought','supplement','stimulative'].map(r => `<option value="${r}"${f.reason === r ? ' selected' : ''}>${BM.T.reason(r)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status">${['planned','in_progress','completed'].map(s => `<option value="${s}"${f.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}</select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(f.notes || '')}</textarea></label>`,
        (d) => { d.amountKg = parseFloat(d.amountKg) || 0; BM.Storage.update('feedings', id, d); BM.Toast.show('Besleme güncellendi ✓', 'success'); App.render('feeding'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu besleme kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('feedings', id);
        BM.Toast.show('Besleme silindi', 'info');
        App.render('feeding');
      });
    },
    render() {
      const list = BM.Storage.list('feedings').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Besleme</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.feeding.add()">+ Yeni Besleme</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.feeding}</div><div class="empty__title">Henüz besleme kaydı yok</div><button class="btn btn--primary" onclick="BM.feeding.add()">+ İlk Besleme</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(f => {
        const h = BM.Storage.get('hives', f.hiveId);
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:rgba(249,115,22,0.15);color:#f97316">🌾</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')} · ${f.amountKg} ${BM.T.feedType(f.type).unit} ${BM.T.feedType(f.type).tr} <span class="badge ${BM.T.statusCls(f.status)}">${BM.T.status(f.status)}</span></div>
            <div class="timeline__meta">${BM.dateStr(f.date)} · ${BM.T.reason(f.reason)}${f.notes ? ' · ' + BM.esc(f.notes) : ''}</div>
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.feeding.edit('${f.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.feeding.del('${f.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ TREATMENTS ============

  BM.feeding = feedingModule;
})(window);
