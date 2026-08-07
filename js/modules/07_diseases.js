(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var diseasesModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Hastalık Kaydı',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Hastalık *</span>
             <select class="select" name="disease" required>
               ${['varroosis','nosemosis','foulbrood','chalkbrood','sacbrood','small_hive_beetle'].map(d => `<option value="${d}">${BM.T.disease(d)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Şiddet *</span>
             <select class="select" name="severity" required>
               <option value="low">Düşük</option>
               <option value="medium" selected>Orta</option>
               <option value="high">Yüksek</option>
             </select></label>
         </div>
         <label class="field"><span class="field-label">Tedavi</span>
           <input class="input" name="treatment" placeholder="Uygulanan tedavi"></label>
         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">
             <option value="active">Aktif</option>
             <option value="treating" selected>Tedavide</option>
             <option value="resolved">Çözüldü</option>
           </select></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { BM.Storage.add('diseases', d); BM.Toast.show('Hastalık kaydı eklendi ✓', 'success'); App.render('diseases'); return true; }
      );
    },
    edit(id) {
      const d = BM.Storage.get('diseases', id); if (!d) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === d.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Hastalık Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${d.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Hastalık</span>
             <select class="select" name="disease">${['varroosis','nosemosis','foulbrood','chalkbrood','sacbrood','small_hive_beetle'].map(x => `<option value="${x}"${d.disease === x ? ' selected' : ''}>${BM.T.disease(x)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Şiddet</span>
             <select class="select" name="severity">${[
                {v:'low', l:'Düşük'},
                {v:'medium', l:'Orta'},
                {v:'high', l:'Yüksek'}
              ].map(o => `<option value="${o.v}"${d.severity === o.v ? ' selected' : ''}>${o.l}</option>`).join('')}</select></label>
         </div>
         <label class="field"><span class="field-label">Tedavi</span>
           <input class="input" name="treatment" value="${BM.esc(d.treatment || '')}"></label>
         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">${['active','treating','resolved'].map(s => `<option value="${s}"${d.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}</select></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(d.notes || '')}</textarea></label>`,
        (d) => { BM.Storage.update('diseases', id, d); BM.Toast.show('Hastalık güncellendi ✓', 'success'); App.render('diseases'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu hastalık kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('diseases', id);
        BM.Toast.show('Kayıt silindi', 'info');
        App.render('diseases');
      });
    },
    render() {
      const list = BM.Storage.list('diseases').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Hastalıklar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.diseases.add()">+ Yeni Kayıt</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.diseases}</div><div class="empty__title">Aktif hastalık yok 🎉</div><button class="btn btn--primary" onclick="BM.diseases.add()">+ Kayıt Ekle</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(d => {
        const h = BM.Storage.get('hives', d.hiveId);
        const sev = d.severity === 'high' ? 'danger' : d.severity === 'medium' ? 'warn' : 'info';
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:var(--danger-bg);color:var(--danger)">🦠</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')} · ${BM.T.disease(d.disease)} <span class="badge badge--${sev}">${d.severity}</span></div>
            <div class="timeline__meta">${BM.dateStr(d.date)} · <span class="badge ${BM.T.statusCls(d.status)}">${BM.T.status(d.status)}</span>${d.treatment ? ' · Tedavi: ' + BM.esc(d.treatment) : ''}</div>
            ${d.notes ? `<div class="timeline__meta" style="margin-top:4px;color:var(--text-secondary)">${BM.esc(d.notes)}</div>` : ''}
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.diseases.edit('${d.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.diseases.del('${d.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ INVENTORY ============

  BM.diseases = diseasesModule;
})(window);
