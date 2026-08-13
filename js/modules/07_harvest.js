(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var harvestModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Hasat',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih *</span>
           <input class="input" name="date" type="date" required value="${BM.today()}"></label>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Ağırlık (kg) *</span>
             <input class="input" name="weight" type="number" step="0.1" min="0" required value="2.5"></label>
           <label class="field"><span class="field-label">Kalite</span>
             <select class="select" name="quality"><option value="A">A (Premium)</option><option value="B" selected>B (Standart)</option><option value="C">C (Endüstri)</option></select></label>
           <label class="field"><span class="field-label">Çerçeve</span>
             <input class="input" name="frames" type="number" min="0" value="2"></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => {
          d.weight = parseFloat(d.weight) || 0;
          d.frames = parseInt(d.frames) || 0;
          const h = BM.Storage.get('hives', d.hiveId);
          if (h) d.apiaryId = h.apiaryId;
          BM.Storage.add('harvests', d);
          if (BM.queens && BM.queens.recalculateForHive) {
            BM.queens.recalculateForHive(d.hiveId);
          }
          BM.Toast.show('Hasat kaydedildi ve Ana Arı verim skoru güncellendi ✓', 'success');
          App.render('harvest');
          return true;
        }
      );
    },
    edit(id) {
      const h = BM.Storage.get('harvests', id);
      if (!h) return;
      const hOpts = BM.Storage.list('hives').map(x => `<option value="${x.id}"${x.id === h.hiveId ? ' selected' : ''}>${BM.esc(x.name)}</option>`).join('');
      BM.Modal.open('Hasat Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${hOpts}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${h.date}"></label>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Ağırlık (kg) *</span>
             <input class="input" name="weight" type="number" step="0.1" required value="${h.weight}"></label>
           <label class="field"><span class="field-label">Kalite</span>
             <select class="select" name="quality">${[
                {v:'A', l:'A (Premium)'},
                {v:'B', l:'B (Standart)'},
                {v:'C', l:'C (Endüstri)'}
              ].map(o => `<option value="${o.v}"${h.quality === o.v ? ' selected' : ''}>${o.l}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Çerçeve</span>
             <input class="input" name="frames" type="number" value="${h.frames || 0}"></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(h.notes || '')}</textarea></label>`,
        (d) => {
          d.weight = parseFloat(d.weight) || 0;
          d.frames = parseInt(d.frames) || 0;
          BM.Storage.update('harvests', id, d);
          if (BM.queens && BM.queens.recalculateForHive) {
            BM.queens.recalculateForHive(d.hiveId || h.hiveId);
          }
          BM.Toast.show('Hasat güncellendi ✓', 'success');
          App.render('harvest');
          return true;
        }
      );
    },
    del(id) {
      const h = BM.Storage.get('harvests', id);
      BM.Modal.confirm('Bu hasat kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('harvests', id);
        if (h && BM.queens && BM.queens.recalculateForHive) {
          BM.queens.recalculateForHive(h.hiveId);
        }
        BM.Toast.show('Hasat silindi', 'info');
        App.render('harvest');
      });
    },
    render() {
      const list = BM.Storage.list('harvests').sort((a, b) => b.date.localeCompare(a.date));
      const total = list.reduce((s, h) => s + h.weight, 0);
      // Monthly chart
      const byMonth = {};
      list.forEach(h => { const m = h.date.slice(0, 7); byMonth[m] = (byMonth[m] || 0) + h.weight; });
      const months = Object.keys(byMonth).sort().slice(-6);
      const max = Math.max(...months.map(m => byMonth[m]), 1);
      const monthLabels = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];

      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Bal Hasadı</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${BM.fmt(total)} kg toplam · ${list.length} kayıt</div></div>
        <button class="btn btn--primary" onclick="BM.harvest.add()">+ Yeni Hasat</button>
      </div>
      <div class="card" style="margin-bottom:var(--space-4)">
        <div class="card-head"><div class="card-title">Aylık Hasat Trendi</div></div>
        <div class="chart">${months.length ? months.map(m => {
          const v = byMonth[m];
          const h = Math.max(4, (v / max) * 100);
          const label = monthLabels[parseInt(m.split('-')[1]) - 1];
          return `<div class="chart__col"><div class="chart__val">${BM.fmt(v)}kg</div><div class="chart__bar" style="height:${h}%"></div><div class="chart__label">${label}</div></div>`;
        }).join('') : '<div style="margin:auto;color:var(--text-secondary)">Veri yok</div>'}</div>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.honey}</div><div class="empty__title">Henüz hasat yok</div><button class="btn btn--primary" onclick="BM.harvest.add()">+ İlk Hasat</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(h => {
        const hive = BM.Storage.get('hives', h.hiveId);
        return `<div class="timeline__item">
          <div class="timeline__icon" style="background:rgba(245,158,11,0.15);color:var(--honey-500)">🍯</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(hive ? hive.name : '?')} · ${h.weight} kg <span class="badge badge--info">Kalite ${h.quality}</span></div>
            <div class="timeline__meta">${BM.dateStr(h.date)} · ${h.frames || 0} çerçeve${h.notes ? ' · ' + BM.esc(h.notes) : ''}</div>
          </div>
          <div style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.harvest.edit('${h.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.harvest.del('${h.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  // ============ FEEDING ============

  BM.harvest = harvestModule;
})(window);
