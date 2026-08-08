(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var queensModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Ana Arı',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk *</span>
             <select class="select" name="strain" required>
               ${['anatolian','caucasian','carniolan','buckfast','carpathian','italian','cyprian','syrian','egyptian','hybrid','survivor'].map(s => `<option value="${s}">${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">İşaret Rengi</span>
             <select class="select" name="markedColor">
               ${['white','yellow','red','green','blue'].map(c => `<option value="${c}">${BM.T.color(c)}</option>`).join('')}
             </select></label>
         </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Doğum *</span>
              <input class="input" name="birthDate" type="date" required value="${BM.today()}"></label>
            <label class="field"><span class="field-label">Ana Arı Durumu</span>
              <select class="select" name="queenState">
                ${['laying','virgin','cell','mating','old'].map(st => `<option value="${st}">${BM.T.queenState(st)}</option>`).join('')}
              </select></label>
          </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Kaynak</span>
              <select class="select" name="source">
                ${['bred','purchased','swarm','supersedure','emergency'].map(s => `<option value="${s}">${BM.T.source(s)}</option>`).join('')}
              </select></label>
            <label class="field"><span class="field-label">Fiziksel Özellikler</span>
              <div style="display:flex;gap:12px;margin-top:6px">
                <label style="display:flex;align-items:center;gap:4px;font-size:13px"><input type="checkbox" name="isMarked" value="true" checked> 🎨 İşaretli</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:13px"><input type="checkbox" name="isClipped" value="true"> ✂️ Kanat Kesik</label>
              </div></label>
          </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Tedarikçi</span>
              <input class="input" name="supplier"></label>
            <label class="field"><span class="field-label">Maliyet (₺)</span>
              <input class="input" name="costTry" type="number" min="0" placeholder="0"></label>
          </div>
          <label class="field"><span class="field-label">Performans Skoru (0-100)</span>
            <input class="input" name="performanceScore" type="number" min="0" max="100" value="80"></label>
          <label class="field"><span class="field-label">Notlar</span>
            <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        async (d) => {
          d.performanceScore = Math.max(0, Math.min(1, parseInt(d.performanceScore || 80) / 100));
          if (d.costTry) d.costTry = parseFloat(d.costTry);
          d.isMarked = !!d.isMarked;
          d.isClipped = !!d.isClipped;
          const q = await BM.Storage.add('queens', { ...d, status: 'active' });
          const h = BM.Storage.get('hives', d.hiveId);
          if (h) BM.Storage.update('hives', h.id, { queenId: q.id });
          BM.Toast.show('Ana arı eklendi ✓', 'success');
          App.render('queens');
          return true;
        }
      );
    },

    edit(id) {
      const q = BM.Storage.get('queens', id);
      if (!q) return;
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === q.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Ana Arı Düzenle',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk</span>
             <select class="select" name="strain">
               ${['anatolian','caucasian','carniolan','buckfast','carpathian','italian','cyprian','syrian','egyptian','hybrid','survivor'].map(s => `<option value="${s}"${q.strain === s ? ' selected' : ''}>${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">İşaret</span>
             <select class="select" name="markedColor">
               ${['white','yellow','red','green','blue'].map(c => `<option value="${c}"${q.markedColor === c ? ' selected' : ''}>${BM.T.color(c)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Doğum</span>
             <input class="input" name="birthDate" type="date" required value="${q.birthDate}"></label>
           <label class="field"><span class="field-label">Kaynak</span>
             <select class="select" name="source">
               ${['bred','purchased','swarm','supersedure','emergency'].map(s => `<option value="${s}"${q.source === s ? ' selected' : ''}>${BM.T.source(s)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Tedarikçi</span>
             <input class="input" name="supplier" value="${BM.esc(q.supplier || '')}"></label>
           <label class="field"><span class="field-label">Maliyet (₺)</span>
             <input class="input" name="costTry" type="number" value="${q.costTry || ''}"></label>
         </div>
         <label class="field"><span class="field-label">Performans (0-100)</span>
           <input class="input" name="performanceScore" type="number" min="0" max="100" value="${(q.performanceScore * 100).toFixed(0)}"></label>
         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">
             ${['active','superseded','dead','sold','missing'].map(s => `<option value="${s}"${q.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(q.notes || '')}</textarea></label>`,
        (d) => {
          d.performanceScore = Math.max(0, Math.min(1, parseInt(d.performanceScore || 80) / 100));
          if (d.costTry) d.costTry = parseFloat(d.costTry);
          BM.Storage.update('queens', id, d);
          BM.Toast.show('Ana arı güncellendi ✓', 'success');
          App.render('queens');
          return true;
        }
      );
    },

    del(id) {
      BM.Modal.confirm('Bu ana arıyı silmek istiyor musunuz?', () => {
        BM.Storage.remove('queens', id);
        BM.Toast.show('Ana arı silindi', 'info');
        App.render('queens');
      });
    },

    render() {
      const list = BM.Storage.list('queens');
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Ana Arılar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} ana arı</div></div>
        <button class="btn btn--primary" onclick="BM.queens.add()">+ Yeni Ana Arı</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.queens}</div><div class="empty__title">Henüz ana arı kaydı yok</div><button class="btn btn--primary" onclick="BM.queens.add()">+ İlk Ana Arı</button></div></div>` :
      `<div class="grid-3">${list.map(q => {
        const h = BM.Storage.get('hives', q.hiveId);
        const age = ((Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5)).toFixed(1);
        return `<div class="card">
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-4)">
            <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--honey-400),var(--honey-600));display:flex;align-items:center;justify-content:center;font-size:26px">${BM.Icons.queens}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:15px;font-weight:700">${BM.esc(BM.T.strain(q.strain))}</div>
              <div style="font-size:12px;color:var(--text-secondary)">${BM.esc(h ? h.name : 'Atanmamış')} · <span class="badge ${BM.T.statusCls(q.status)}">${BM.T.status(q.status)}</span></div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2)">
            <div class="hive-card__metric"><div class="hive-card__metric-label">Yaş</div><div class="hive-card__metric-value">${age} yıl</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Performans</div><div class="hive-card__metric-value" style="color:${q.performanceScore >= 0.7 ? 'var(--success)' : q.performanceScore >= 0.5 ? 'var(--honey-500)' : 'var(--danger)'}">${(q.performanceScore * 100).toFixed(0)}%</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">İşaret</div><div class="hive-card__metric-value">${BM.T.color(q.markedColor)}</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Kaynak</div><div class="hive-card__metric-value">${BM.T.source(q.source)}</div></div>
          </div>
          <div class="hive-card__actions" style="margin-top:var(--space-4)">
            <button class="btn btn--sm" onclick="BM.queens.edit('${q.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.queens.del('${q.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div>`}`;
    }
  };

  // ============ HARVEST ============

  BM.queens = queensModule;
})(window);
