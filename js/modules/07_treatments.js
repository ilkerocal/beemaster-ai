(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var treatmentsModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Tedavi',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Ürün *</span>
             <input class="input" name="product" required placeholder="Örn: Apivar"></label>
           <label class="field"><span class="field-label">Dozaj</span>
             <input class="input" name="dosage" placeholder="2 şerit"></label>
         </div>
         <label class="field"><span class="field-label">Süre</span>
           <input class="input" name="duration" placeholder="42 gün"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Varroa Önce</span>
             <input class="input" name="varroaBefore" type="number" min="0" value="0"></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status"><option value="planned">Planlı</option><option value="in_progress" selected>Sürüyor</option><option value="completed">Tamamlandı</option></select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { d.varroaBefore = parseInt(d.varroaBefore) || 0; BM.Storage.add('treatments', d); BM.Toast.show('Tedavi kaydedildi ✓', 'success'); App.render('treatments'); return true; }
      );
    },
    edit(id) {
      const t = BM.Storage.get('treatments', id); if (!t) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === t.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Tedavi Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${t.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Ürün *</span>
             <input class="input" name="product" required value="${BM.esc(t.product)}"></label>
           <label class="field"><span class="field-label">Dozaj</span>
             <input class="input" name="dosage" value="${BM.esc(t.dosage || '')}"></label>
         </div>
         <label class="field"><span class="field-label">Süre</span>
           <input class="input" name="duration" value="${BM.esc(t.duration || '')}"></label>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Önce</span>
             <input class="input" name="varroaBefore" type="number" value="${t.varroaBefore || 0}"></label>
           <label class="field"><span class="field-label">Sonra</span>
             <input class="input" name="varroaAfter" type="number" value="${t.varroaAfter || ''}"></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status">${['planned','in_progress','completed'].map(s => `<option value="${s}"${t.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}</select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(t.notes || '')}</textarea></label>`,
        (d) => { d.varroaBefore = parseInt(d.varroaBefore) || 0; d.varroaAfter = d.varroaAfter ? parseInt(d.varroaAfter) : null; BM.Storage.update('treatments', id, d); BM.Toast.show('Tedavi güncellendi ✓', 'success'); App.render('treatments'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu tedavi kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('treatments', id);
        BM.Toast.show('Tedavi silindi', 'info');
        App.render('treatments');
      });
    },
    render() {
      const list = BM.Storage.list('treatments').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Tedaviler</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.treatments.add()">+ Yeni Tedavi</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.treatments}</div><div class="empty__title">Henüz tedavi kaydı yok</div><button class="btn btn--primary" onclick="BM.treatments.add()">+ İlk Tedavi</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(t => {
        const h = BM.Storage.get('hives', t.hiveId);
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:rgba(168,85,247,0.15);color:#a855f7">💊</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')} · ${BM.esc(t.product)} <span class="badge ${BM.T.statusCls(t.status)}">${BM.T.status(t.status)}</span></div>
            <div class="timeline__meta">${BM.dateStr(t.date)} · ${BM.esc(t.dosage || '-')} · ${BM.esc(t.duration || '')}${t.varroaBefore != null ? ' · Varroa önce: ' + t.varroaBefore : ''}${t.varroaAfter != null ? ' → sonra: ' + t.varroaAfter : ''}</div>
            ${t.notes ? `<div class="timeline__meta" style="margin-top:4px;color:var(--text-secondary)">${BM.esc(t.notes)}</div>` : ''}
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.treatments.edit('${t.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.treatments.del('${t.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ DISEASES ============

  BM.treatments = treatmentsModule;
})(window);
