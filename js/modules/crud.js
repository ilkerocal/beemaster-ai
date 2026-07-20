// ============================================================
// CRUD modülleri — Queens, Harvest, Feeding, Treatments, Diseases, Inventory
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  // ============ QUEENS ============
  const queensModule = {
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Ana Arı',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" name="hiveId" required>${hOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk *</span>
             <select class="select" name="strain" required>
               ${['anatolian','caucasian','carniolan','italian','hybrid'].map(s => `<option value="${s}">${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">İşaret Rengi</span>
             <select class="select" name="markedColor">
               ${['white','yellow','red','green','blue'].map(c => `<option value="${c}">${BM.T.color(c)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Doğum *</span>
             <input class="input" name="birthDate" type="date" required value="${BM.today()}"></label>
           <label class="field"><span class="field-label">Kaynak</span>
             <select class="select" name="source">
               ${['bred','purchased','swarm','supersedure','emergency'].map(s => `<option value="${s}">${BM.T.source(s)}</option>`).join('')}
             </select></label>
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
        (d) => {
          d.performanceScore = Math.max(0, Math.min(1, parseInt(d.performanceScore || 80) / 100));
          if (d.costTry) d.costTry = parseFloat(d.costTry);
          const q = BM.Storage.add('queens', { ...d, status: 'active' });
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
               ${['anatolian','caucasian','carniolan','italian','hybrid'].map(s => `<option value="${s}"${q.strain === s ? ' selected' : ''}>${BM.T.strain(s)}</option>`).join('')}
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
  const harvestModule = {
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
          BM.Toast.show('Hasat kaydedildi ✓', 'success');
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
             <select class="select" name="quality">${['A','B','C'].map(q => `<option value="${q}"${h.quality === q ? ' selected' : ''}>${q}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Çerçeve</span>
             <input class="input" name="frames" type="number" value="${h.frames || 0}"></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(h.notes || '')}</textarea></label>`,
        (d) => { d.weight = parseFloat(d.weight) || 0; d.frames = parseInt(d.frames) || 0; BM.Storage.update('harvests', id, d); BM.Toast.show('Hasat güncellendi ✓', 'success'); App.render('harvest'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu hasat kaydını silmek istiyor musunuz?', () => {
        BM.Storage.remove('harvests', id);
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
  const feedingModule = {
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
             <select class="select" name="type" required>
               ${['sugar_syrup','fondant','pollen_patty','candy','honey_water'].map(t => `<option value="${t}">${BM.T.feedType(t)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Miktar (kg) *</span>
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
             <select class="select" name="type">${['sugar_syrup','fondant','pollen_patty','candy','honey_water'].map(t => `<option value="${t}"${f.type === t ? ' selected' : ''}>${BM.T.feedType(t)}</option>`).join('')}</select></label>
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
            <div class="timeline__title">${BM.esc(h ? h.name : '?')} · ${f.amountKg} kg ${BM.T.feedType(f.type)} <span class="badge ${BM.T.statusCls(f.status)}">${BM.T.status(f.status)}</span></div>
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
  const treatmentsModule = {
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
  const diseasesModule = {
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
             <select class="select" name="severity">${['low','medium','high'].map(s => `<option value="${s}"${d.severity === s ? ' selected' : ''}>${s}</option>`).join('')}</select></label>
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
  const inventoryModule = {
    add() {
      BM.Modal.open('Yeni Envanter Kalemi',
        `<label class="field"><span class="field-label">Malzeme *</span>
           <input class="input" name="name" required placeholder="Örn: Apivar şerit"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Kategori</span>
             <select class="select" name="category">${['medication','feed','equipment','consumable'].map(c => `<option value="${c}">${BM.T.invCat(c)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Birim</span>
             <select class="select" name="unit"><option>adet</option><option>kg</option><option>litre</option><option>paket</option><option>kutu</option></select></label>
         </div>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Miktar *</span>
             <input class="input" name="quantity" type="number" step="0.1" required value="1"></label>
           <label class="field"><span class="field-label">Min Stok</span>
             <input class="input" name="minStock" type="number" value="5"></label>
           <label class="field"><span class="field-label">Fiyat (₺)</span>
             <input class="input" name="costTry" type="number" step="0.01" value="0"></label>
         </div>
         <label class="field"><span class="field-label">Tedarikçi</span>
           <input class="input" name="supplier"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => { d.quantity = parseFloat(d.quantity) || 0; d.minStock = parseFloat(d.minStock) || 0; d.costTry = parseFloat(d.costTry) || 0; BM.Storage.add('inventory', d); BM.Toast.show('Envanter eklendi ✓', 'success'); App.render('inventory'); return true; }
      );
    },
    edit(id) {
      const i = BM.Storage.get('inventory', id); if (!i) return;
      BM.Modal.open('Envanter Düzenle',
        `<label class="field"><span class="field-label">Malzeme *</span>
           <input class="input" name="name" required value="${BM.esc(i.name)}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Kategori</span>
             <select class="select" name="category">${['medication','feed','equipment','consumable'].map(c => `<option value="${c}"${i.category === c ? ' selected' : ''}>${BM.T.invCat(c)}</option>`).join('')}</select></label>
           <label class="field"><span class="field-label">Birim</span>
             <select class="select" name="unit">${['adet','kg','litre','paket','kutu'].map(u => `<option${i.unit === u ? ' selected' : ''}>${u}</option>`).join('')}</select></label>
         </div>
         <div class="field-row--3">
           <label class="field"><span class="field-label">Miktar</span>
             <input class="input" name="quantity" type="number" step="0.1" value="${i.quantity}"></label>
           <label class="field"><span class="field-label">Min</span>
             <input class="input" name="minStock" type="number" value="${i.minStock || 0}"></label>
           <label class="field"><span class="field-label">Fiyat (₺)</span>
             <input class="input" name="costTry" type="number" step="0.01" value="${i.costTry || 0}"></label>
         </div>
         <label class="field"><span class="field-label">Tedarikçi</span>
           <input class="input" name="supplier" value="${BM.esc(i.supplier || '')}"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(i.notes || '')}</textarea></label>`,
        (d) => { d.quantity = parseFloat(d.quantity) || 0; d.minStock = parseFloat(d.minStock) || 0; d.costTry = parseFloat(d.costTry) || 0; BM.Storage.update('inventory', id, d); BM.Toast.show('Envanter güncellendi ✓', 'success'); App.render('inventory'); return true; }
      );
    },
    del(id) {
      BM.Modal.confirm('Bu kalemi silmek istiyor musunuz?', () => {
        BM.Storage.remove('inventory', id);
        BM.Toast.show('Silindi', 'info');
        App.render('inventory');
      });
    },
    render() {
      const list = BM.Storage.list('inventory');
      const lowStock = list.filter(i => i.quantity <= i.minStock);
      const totalValue = list.reduce((s, i) => s + (i.quantity * (i.costTry || 0)), 0);
      return `<div class="actions-bar">
        <div><h2 style="font-size:18px;font-weight:700">Envanter</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kalem · ₺${BM.fmt(totalValue, 0)} değer${lowStock.length ? ' · ' + lowStock.length + ' düşük stok' : ''}</div></div>
        <button class="btn btn--primary" onclick="BM.inventory.add()">+ Yeni Malzeme</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.inventory}</div><div class="empty__title">Envanter boş</div><button class="btn btn--primary" onclick="BM.inventory.add()">+ İlk Malzeme</button></div></div>` :
      `<div class="card"><div class="row-list">${list.map(i => {
        const low = i.quantity <= i.minStock;
        return `<div class="row-list__item" style="${low ? 'background:var(--danger-bg);margin:0 -18px;padding:11px 18px' : ''}">
          <div class="row-list__dot ${low ? 'row-list__dot--r' : 'row-list__dot--g'}"></div>
          <div class="row-list__main">
            <div class="row-list__name">${BM.esc(i.name)} <span class="badge badge--info">${BM.T.invCat(i.category)}</span>${low ? ' <span class="badge badge--danger">Düşük Stok</span>' : ''}</div>
            <div class="row-list__info">${i.quantity} ${i.unit} / min ${i.minStock} ${i.unit}${i.supplier ? ' · ' + BM.esc(i.supplier) : ''}${i.costTry ? ' · ₺' + BM.fmt(i.costTry, 2) + '/' + i.unit : ''}</div>
          </div>
          <div style="text-align:right;min-width:80px;flex-shrink:0">
            <div style="font-size:16px;font-weight:700">${i.quantity} ${i.unit}</div>
            <div style="font-size:10px;color:var(--text-secondary)">₺${BM.fmt(i.quantity * (i.costTry || 0), 0)}</div>
          </div>
          <div class="row-list__actions">
            <button class="btn btn--sm" onclick="BM.inventory.edit('${i.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.inventory.del('${i.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    }
  };

  BM.queens = queensModule;
  BM.harvest = harvestModule;
  BM.feeding = feedingModule;
  BM.treatments = treatmentsModule;
  BM.diseases = diseasesModule;
  BM.inventory = inventoryModule;
})(window);
