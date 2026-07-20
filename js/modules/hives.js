// ============================================================
// Hives Module — Spec 05_Modules/Hives.md + Frames.md
// HV-01..08: CRUD, detay, çerçeve haritası, taşıma, birleştirme
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const hivesModule = {
    add() {
      if (!BM.Storage.list('apiaries').length) {
        BM.Toast.show('Önce arı üssü ekleyin', 'error');
        return;
      }
      const apOpts = BM.Storage.list('apiaries').filter(a => !a.archived)
        .map(a => `<option value="${a.id}">${BM.esc(a.name)}</option>`).join('');
      BM.Modal.open('Yeni Kovan',
        `<label class="field"><span class="field-label">Kovan Adı *</span>
           <input class="input" name="name" required placeholder="Örn: Kovan-08"></label>
         <label class="field"><span class="field-label">Arı Üssü *</span>
           <select class="select" name="apiaryId" required>${apOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk</span>
             <select class="select" name="strain">
               <option value="anatolian">Anadolu</option>
               <option value="caucasian">Kafkas</option>
               <option value="carniolan">Karniyol</option>
               <option value="italian">İtalyan</option>
               <option value="hybrid">Hibrit</option>
             </select></label>
           <label class="field"><span class="field-label">Kutu Tipi</span>
             <select class="select" name="boxType">
               <option value="langstroth">Langstroth</option>
               <option value="dadant">Dadant</option>
               <option value="layens">Layens</option>
               <option value="flow">Flow</option>
               <option value="top_bar">Top-Bar</option>
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Çerçeve Sayısı</span>
             <input class="input" name="frameCount" type="number" min="1" max="20" value="10"></label>
           <label class="field"><span class="field-label">Pozisyon</span>
             <input class="input" name="positionInApiary" type="number" min="1" value="${BM.Storage.list('hives').length + 1}"></label>
         </div>
         <label class="field"><span class="field-label">NFC/QR Etiket</span>
           <input class="input" name="nfcTag" placeholder="Otomatik oluşturulur"></label>
         <label class="field"><span class="field-label">Kurulum Tarihi</span>
           <input class="input" name="installedAt" type="date" value="${BM.today()}"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => {
          const h = BM.Storage.add('hives', {
            ...d,
            status: 'active',
            queenId: null,
            nfcTag: d.nfcTag || ('BM-' + Date.now().toString(36).toUpperCase()),
            frameCount: parseInt(d.frameCount) || 10,
            positionInApiary: parseInt(d.positionInApiary) || 1
          });
          // Otomatik çerçeve oluştur
          const fc = h.frameCount;
          for (let p = 1; p <= fc; p++) {
            BM.Storage.add('frames', {
              hiveId: h.id, position: p,
              frameType: p <= 3 ? 'brood' : (p <= 6 ? 'honey' : 'foundation'),
              foundationType: 'wax', status: 'in_use',
              cyclesCompleted: 0, waxAgeMonths: 0
            });
          }
          BM.Toast.show('Kovan eklendi ✓', 'success');
          App.render('hives');
          return true;
        }
      );
    },

    edit(id) {
      const h = BM.Storage.get('hives', id);
      if (!h) return;
      const apOpts = BM.Storage.list('apiaries').map(a =>
        `<option value="${a.id}"${a.id === h.apiaryId ? ' selected' : ''}>${BM.esc(a.name)}</option>`).join('');
      BM.Modal.open('Kovan Düzenle — ' + h.name,
        `<label class="field"><span class="field-label">Kovan Adı *</span>
           <input class="input" name="name" required value="${BM.esc(h.name)}"></label>
         <label class="field"><span class="field-label">Arı Üssü *</span>
           <select class="select" name="apiaryId" required>${apOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk</span>
             <select class="select" name="strain">
               ${['anatolian','caucasian','carniolan','italian','hybrid'].map(s => `<option value="${s}"${h.strain === s ? ' selected' : ''}>${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Kutu Tipi</span>
             <select class="select" name="boxType">
               ${['langstroth','dadant','layens','flow','top_bar'].map(b => `<option value="${b}"${h.boxType === b ? ' selected' : ''}>${BM.T.box(b)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Çerçeve</span>
             <input class="input" name="frameCount" type="number" min="1" max="20" value="${h.frameCount}"></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status">
               ${['active','weak','dead','sold','merged'].map(s => `<option value="${s}"${h.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}
             </select></label>
         </div>
         <label class="field"><span class="field-label">NFC/QR Etiket</span>
           <input class="input" name="nfcTag" value="${BM.esc(h.nfcTag || '')}"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(h.notes || '')}</textarea></label>`,
        (d) => {
          d.frameCount = parseInt(d.frameCount) || 10;
          BM.Storage.update('hives', id, d);
          BM.Toast.show('Kovan güncellendi ✓', 'success');
          App.render('hives');
          return true;
        }
      );
    },

    del(id) {
      const h = BM.Storage.get('hives', id);
      if (!h) return;
      BM.Modal.confirm(`"${h.name}" kovanını silmek istiyor musunuz? Tüm muayene, hasat, besleme kayıtları da silinecek.`, () => {
        BM.Storage.cascadeDeleteHive(id);
        BM.Toast.show('Kovan silindi', 'info');
        App.render('hives');
      });
    },

    // HV-06: Kovanı birleştir
    merge(id) {
      const h = BM.Storage.get('hives', id);
      if (!h) return;
      const otherHives = BM.Storage.list('hives').filter(x => x.id !== id && x.apiaryId === h.apiaryId);
      if (!otherHives.length) {
        BM.Toast.show('Aynı üsde birleştirilecek başka kovan yok', 'error');
        return;
      }
      const opts = otherHives.map(x => `<option value="${x.id}">${BM.esc(x.name)} (${x.frameCount} çerçeve)</option>`).join('');
      BM.Modal.open('Kovan Birleştir — ' + h.name,
        `<div style="background:var(--warning-bg);padding:var(--space-3);border-radius:var(--radius-md);margin-bottom:var(--space-4);font-size:12px">
          ⚠️ Birleştirilen kovan silinir. Diğer kovan güçlenir.
         </div>
         <label class="field"><span class="field-label">Hedef Kovan (güçlenecek) *</span>
           <select class="select" name="targetHiveId" required>${opts}</select></label>
         <label class="field"><span class="field-label">Birleştirme Yöntemi</span>
           <select class="select" name="method">
             <option value="newspaper">Gazete kağıdı (önerilen)</option>
             <option value="queen_cage">Ana arı kafesi ile</option>
             <option value="direct">Doğrudan (riskli)</option>
           </select></label>`,
        (d) => {
          const target = BM.Storage.get('hives', d.targetHiveId);
          if (!target) { BM.Toast.show('Hedef kovan seçin', 'error'); return false; }
          // Target'in frameCount + h.frameCount
          BM.Storage.update('hives', target.id, { frameCount: target.frameCount + h.frameCount });
          // h'yi merged olarak işaretle
          BM.Storage.update('hives', h.id, { status: 'merged' });
          BM.Toast.show(`${h.name} → ${target.name} birleştirildi ✓`, 'success');
          App.render('hives');
          return true;
        }
      );
    },

    // HV-06: Kovanı taşı (hareket)
    moveHive(id) {
      const h = BM.Storage.get('hives', id);
      if (!h) return;
      const otherApiaries = BM.Storage.list('apiaries').filter(a => a.id !== h.apiaryId && !a.archived);
      if (!otherApiaries.length) { BM.Toast.show('Başka aktif üs yok', 'error'); return; }
      BM.Modal.open('Kovanı Taşı — ' + h.name,
        `<label class="field"><span class="field-label">Hedef Üs *</span>
           <select class="select" name="targetApiaryId" required>
             ${otherApiaries.map(a => `<option value="${a.id}">${BM.esc(a.name)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Taşıma Nedeni</span>
           <input class="input" name="reason" placeholder="Bal akışı, kış, vb."></label>`,
        (d) => {
          BM.Storage.update('hives', id, { apiaryId: d.targetApiaryId });
          BM.Toast.show('Kovan taşındı ✓', 'success');
          App.render('hives');
          return true;
        }
      );
    },

    // ============ DETAIL SAYFASI ============
    detail(id) {
      const h = BM.Storage.get('hives', id);
      if (!h) return;
      const apiary = BM.Storage.get('apiaries', h.apiaryId);
      const queen = BM.Storage.get('queens', h.queenId);
      const frames = BM.Storage.list('frames').filter(f => f.hiveId === id).sort((a, b) => a.position - b.position);
      const inspections = BM.Storage.list('inspections').filter(i => i.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
      const harvests = BM.Storage.list('harvests').filter(h => h.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
      const feedings = BM.Storage.list('feedings').filter(f => f.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
      const treatments = BM.Storage.list('treatments').filter(t => t.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
      const diseases = BM.Storage.list('diseases').filter(d => d.hiveId === id).sort((a, b) => b.date.localeCompare(a.date));
      const totalHoney = harvests.reduce((s, h) => s + h.weight, 0);
      const lastInsp = inspections[0];
      const varroa = lastInsp ? lastInsp.varroaCount : 0;
      const queenAge = queen ? ((Date.now() - new Date(queen.birthDate).getTime()) / (365 * 864e5)).toFixed(1) : '-';

      const html = `
        <div class="actions-bar">
          <div>
            <a class="link" style="color:var(--honey-500);font-weight:600;cursor:pointer" onclick="App.render('hives')">← Kovanlar</a>
            <h1 style="font-size:24px;font-weight:700;margin-top:6px">${BM.esc(h.name)}</h1>
            <div style="color:var(--text-secondary);font-size:13px">
              ${BM.esc(apiary ? apiary.name : 'Atanmamış')} · ${BM.T.strain(h.strain)} · ${BM.T.box(h.boxType)} · NFC: ${BM.esc(h.nfcTag || '-')}
            </div>
          </div>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
            <button class="btn btn--sm" onclick="BM.hives.moveHive('${id}')">🚚 Taşı</button>
            <button class="btn btn--sm" onclick="BM.hives.merge('${id}')">🔗 Birleştir</button>
            <button class="btn btn--sm" onclick="BM.inspections.add('${id}')">📋 Muayene</button>
            <button class="btn btn--sm" onclick="BM.hives.edit('${id}')">✏️ Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.hives.del('${id}')">🗑 Sil</button>
          </div>
        </div>
        <div class="stats-grid">
          <div class="stat"><div class="stat__icon stat__icon--honey">${BM.Icons.hives}</div><div class="stat__label">Çerçeve</div><div class="stat__value">${frames.length}</div><div class="stat__meta">${BM.T.box(h.boxType)}</div></div>
          <div class="stat"><div class="stat__icon stat__icon--success">${BM.Icons.honey}</div><div class="stat__label">Toplam Bal</div><div class="stat__value">${BM.fmt(totalHoney)} kg</div><div class="stat__meta">${harvests.length} hasat</div></div>
          <div class="stat"><div class="stat__icon stat__icon--${varroa >= 6 ? 'danger' : varroa >= 3 ? 'warning' : 'success'}">⚠️</div><div class="stat__label">Son Varroa</div><div class="stat__value">${varroa}</div><div class="stat__meta ${varroa >= 6 ? 'stat__meta--down' : ''}">${lastInsp ? BM.dateAgo(lastInsp.date) : '—'}</div></div>
          <div class="stat"><div class="stat__icon stat__icon--info">${BM.Icons.queens}</div><div class="stat__label">Ana Arı Yaşı</div><div class="stat__value">${queenAge}</div><div class="stat__meta">${queen ? BM.T.strain(queen.strain) : '—'}</div></div>
        </div>
        <div class="tabs" id="hive-tabs">
          <button type="button" class="tabs__item tabs__item--active" data-tab="frames">Çerçeveler (${frames.length})</button>
          <button type="button" class="tabs__item" data-tab="queen">Ana Arı</button>
          <button type="button" class="tabs__item" data-tab="history">Geçmiş (${inspections.length + harvests.length + feedings.length + treatments.length + diseases.length})</button>
        </div>
        <div class="tabs__content" id="hive-tab-content"></div>
      `;
      document.getElementById('view-hive-detail').innerHTML = html;
      document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
      document.querySelectorAll('[data-view]').forEach(n => n.classList.remove('nav-item--active', 'bottom-nav__item--active'));
      document.getElementById('view-hive-detail').classList.add('view--active');
      document.getElementById('page-title').textContent = h.name;
      document.getElementById('page-subtitle').textContent = apiary ? apiary.name : '';
      window.scrollTo(0, 0);

      // Tab event listeners
      const switchTab = (tabId) => {
        document.querySelectorAll('#hive-tabs .tabs__item').forEach(b => b.classList.toggle('tabs__item--active', b.dataset.tab === tabId));
        this._renderTab(id, tabId);
      };
      document.querySelectorAll('#hive-tabs .tabs__item').forEach(btn => {
        btn.onclick = () => switchTab(btn.dataset.tab);
      });
      switchTab('frames');
    },

    _renderTab(id, tabId) {
      const el = document.getElementById('hive-tab-content');
      if (tabId === 'frames') {
        const frames = BM.Storage.list('frames').filter(f => f.hiveId === id).sort((a, b) => a.position - b.position);
        const summary = {brood:0,honey:0,pollen:0,foundation:0,empty:0};
        frames.forEach(f => { if (summary[f.frameType] !== undefined) summary[f.frameType]++; });
        const frameIcon = t => ({brood:'🟠',honey:'🟡',pollen:'🟣',foundation:'⚪',empty:'⚫'}[t] || '⬜');
        const frameLabel = t => ({brood:'Yumurtalık',honey:'Bal',pollen:'Polen',foundation:'Perga',empty:'Boş'}[t] || t);

        el.innerHTML = `
          <div class="card">
            <div class="card-head">
              <div>
                <div class="card-title">Petek Döngüsü (${frames.length} çerçeve)</div>
                <div class="card-sub">Tıklayarak çerçeve tipini değiştir</div>
              </div>
              <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
                <select class="select" style="width:auto" id="bulk-type">
                  <option value="honey">Tümünü Bal yap</option>
                  <option value="brood">Tümünü Yavru yap</option>
                  <option value="empty">Tümünü Boşalt</option>
                  <option value="foundation">Perga olarak işaretle</option>
                </select>
                <button type="button" class="btn btn--sm" onclick="BM.hives.bulkMark('${id}', document.getElementById('bulk-type').value)">Uygula</button>
                <button type="button" class="btn btn--sm" onclick="BM.hives.resetSeason('${id}')">Sezon Sıfırla</button>
              </div>
            </div>
            <div class="frame-grid">
              ${frames.map(f => `<div class="frame frame--${f.frameType}${f.cyclesCompleted >= 5 ? ' frame--retired' : ''}" onclick="BM.frames.edit('${f.id}', '${id}')">
                <div class="frame__icon">${frameIcon(f.frameType)}</div>
                <div class="frame__num">#${f.position}</div>
                <div class="frame__cycle">×${f.cyclesCompleted}</div>
              </div>`).join('')}
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:var(--space-3);margin-top:var(--space-4);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);font-size:12px">
              <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:rgba(249,115,22,0.4)"></span>${summary.brood} Yumurtalık</div>
              <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:rgba(245,158,11,0.4)"></span>${summary.honey} Bal</div>
              <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:rgba(168,85,247,0.4)"></span>${summary.pollen} Polen</div>
              <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:var(--bg-card)"></span>${summary.foundation} Perga</div>
              <div style="display:flex;align-items:center;gap:6px"><span style="width:14px;height:14px;border-radius:3px;background:transparent;border:1px dashed var(--n-700)"></span>${summary.empty} Boş</div>
              <div style="display:flex;align-items:center;gap:6px;margin-left:auto;color:var(--danger)"><span style="width:14px;height:14px;border-radius:3px;background:var(--danger)"></span>🔴 Değişim gerekli (≥5 döngü)</div>
            </div>
          </div>
        `;
      } else if (tabId === 'queen') {
        const q = BM.Storage.get('queens', BM.Storage.get('hives', id).queenId);
        if (!q) {
          el.innerHTML = `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.queens}</div><div class="empty__title">Bu kovanda ana arı kaydı yok</div><button class="btn btn--primary" onclick="BM.queens.add('${id}')">Ana Arı Ekle</button></div></div>`;
          return;
        }
        const age = ((Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5)).toFixed(1);
        el.innerHTML = `
          <div class="grid-2">
            <div class="card">
              <div class="card-head"><div class="card-title">Ana Arı Bilgileri</div><button class="btn btn--sm" onclick="BM.queens.edit('${q.id}')">Düzenle</button></div>
              <div style="display:flex;align-items:center;gap:var(--space-4);margin-bottom:var(--space-4)">
                <div style="width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--honey-400),var(--honey-600));display:flex;align-items:center;justify-content:center;font-size:30px">${BM.Icons.queens}</div>
                <div>
                  <div style="font-size:16px;font-weight:700">${BM.esc(BM.T.strain(q.strain))}</div>
                  <div style="font-size:12px;color:var(--text-secondary)">İşaret: <strong>${BM.T.color(q.markedColor)}</strong> · Kaynak: ${BM.T.source(q.source)}</div>
                </div>
              </div>
              <div class="row-list">
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Doğum</div><div class="row-list__info">${BM.dateStr(q.birthDate)}</div></div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Yaş</div><div class="row-list__info">${age} yıl</div></div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Performans</div><div class="row-list__info">${(q.performanceScore * 100).toFixed(0)}%</div></div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Durum</div><div class="row-list__info">${BM.T.status(q.status)}</div></div></div>
                ${q.supplier ? `<div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Tedarikçi</div><div class="row-list__info">${BM.esc(q.supplier)}</div></div></div>` : ''}
              </div>
            </div>
            <div class="card">
              <div class="card-title">📊 Performans Skoru</div>
              <div style="margin-top:var(--space-4);padding:var(--space-5);background:var(--bg-tertiary);border-radius:var(--r-lg);text-align:center">
                <div style="font-size:48px;font-weight:800;color:${q.performanceScore >= 0.7 ? 'var(--success)' : q.performanceScore >= 0.5 ? 'var(--honey-500)' : 'var(--danger)'}">${(q.performanceScore * 100).toFixed(0)}%</div>
                <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">Mevcut Skor</div>
              </div>
            </div>
          </div>
        `;
      } else if (tabId === 'history') {
        const events = [];
        BM.Storage.list('inspections').filter(i => i.hiveId === id).forEach(i =>
          events.push({ date: i.date, icon: '📋', title: 'Muayene', sub: `Varroa: ${i.varroaCount} · ${BM.T.pop(i.population)}${i.notes ? ' · ' + BM.esc(i.notes) : ''}` }));
        BM.Storage.list('harvests').filter(h => h.hiveId === id).forEach(h =>
          events.push({ date: h.date, icon: '🍯', title: 'Bal Hasadı', sub: `${h.weight} kg · ${h.quality} kalite` }));
        BM.Storage.list('feedings').filter(f => f.hiveId === id).forEach(f =>
          events.push({ date: f.date, icon: '🌾', title: 'Besleme', sub: `${BM.T.feedType(f.type)} · ${f.amountKg} kg` }));
        BM.Storage.list('treatments').filter(t => t.hiveId === id).forEach(t =>
          events.push({ date: t.date, icon: '💊', title: 'Tedavi', sub: `${BM.esc(t.product)} · ${BM.esc(t.dosage || '-')}` }));
        BM.Storage.list('diseases').filter(d => d.hiveId === id).forEach(d =>
          events.push({ date: d.date, icon: '🦠', title: 'Hastalık', sub: `${BM.T.disease(d.disease)} · Şiddet: ${d.severity}` }));
        events.sort((a, b) => b.date.localeCompare(a.date));

        el.innerHTML = `<div class="card">
          <div class="card-head"><div class="card-title">Zaman Çizelgesi (${events.length} olay)</div></div>
          ${events.length ? `<div class="timeline">${events.map(e => `<div class="timeline__item">
            <div class="timeline__icon">${e.icon}</div>
            <div class="timeline__body">
              <div class="timeline__title">${BM.esc(e.title)}</div>
              <div class="timeline__meta">${BM.dateStr(e.date)} · ${BM.esc(e.sub)}</div>
            </div>
          </div>`).join('')}</div>` : '<div class="empty"><div class="empty__icon">📅</div><div class="empty__title">Henüz kayıt yok</div></div>'}
        </div>`;
      }
    },

    bulkMark(hiveId, type) {
      if (!confirm(`Tüm çerçeveleri "${type === 'brood' ? 'Yavru' : type === 'honey' ? 'Bal' : type === 'empty' ? 'Boş' : 'Perga'}" olarak işaretle?`)) return;
      BM.Storage.list('frames').filter(f => f.hiveId === hiveId).forEach(f => {
        BM.Storage.update('frames', f.id, { frameType: type });
      });
      BM.Toast.show('Tüm çerçeveler güncellendi ✓', 'success');
      this._renderTab(hiveId, 'frames');
    },

    resetSeason(hiveId) {
      if (!confirm('Yeni sezon: Tüm çerçeveler Perga, döngüler 0')) return;
      BM.Storage.list('frames').filter(f => f.hiveId === hiveId).forEach(f => {
        BM.Storage.update('frames', f.id, { frameType: 'foundation', cyclesCompleted: 0, waxAgeMonths: 0 });
      });
      BM.Toast.show('Sezon sıfırlandı ✓', 'success');
      this._renderTab(hiveId, 'frames');
    },

    // ============ LIST RENDER ============
    render() {
      const list = BM.Storage.list('hives');
      return `<div class="actions-bar">
        <div>
          <h2 style="font-size:18px;font-weight:700">Kovanlar</h2>
          <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kovan · ${BM.Storage.list('queens').length} ana arı · ${BM.Storage.list('frames').length} çerçeve</div>
        </div>
        <button class="btn btn--primary" onclick="BM.hives.add()">+ Yeni Kovan</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.hives}</div><div class="empty__title">Henüz kovan yok</div><button class="btn btn--primary" onclick="BM.hives.add()">+ Yeni Kovan</button></div></div>` :
      `<div class="grid-3">${list.map(h => {
        const apiary = BM.Storage.get('apiaries', h.apiaryId);
        const lastInsp = BM.Storage.list('inspections').filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
        const frameCount = BM.Storage.list('frames').filter(f => f.hiveId === h.id).length;
        const varroa = lastInsp ? lastInsp.varroaCount : 0;
        const aiBadge = lastInsp && lastInsp.aiAnomalies ? `<span class="badge badge--warn" style="position:absolute;top:12px;left:12px">🤖 ${lastInsp.aiAnomalies}</span>` : '';
        return `<div class="hive-card" onclick="BM.hives.detail('${h.id}')">
          ${aiBadge}
          <div class="hive-card__corner"><span class="badge ${BM.T.statusCls(h.status)}">${BM.T.status(h.status)}</span></div>
          <div class="hive-card__head">
            <div class="hive-card__icon">${BM.Icons.hives}</div>
            <div>
              <div class="hive-card__title">${BM.esc(h.name)}</div>
              <div class="hive-card__sub">${BM.esc(apiary ? apiary.name : 'Atanmamış')}</div>
            </div>
          </div>
          <div class="hive-card__metrics">
            <div class="hive-card__metric"><div class="hive-card__metric-label">Irk</div><div class="hive-card__metric-value">${BM.T.strain(h.strain)}</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Çerçeve</div><div class="hive-card__metric-value">${frameCount}</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Kutu</div><div class="hive-card__metric-value">${BM.T.box(h.boxType)}</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Varroa</div><div class="hive-card__metric-value" style="color:${varroa >= 6 ? 'var(--danger)' : varroa >= 3 ? 'var(--warning)' : 'var(--success)'}">${varroa}</div></div>
          </div>
          <div class="hive-card__actions">
            <button class="btn btn--sm" onclick="event.stopPropagation();BM.inspections.add('${h.id}')">📋 Muayene</button>
            <button class="btn btn--sm" onclick="event.stopPropagation();BM.hives.edit('${h.id}')">Düzenle</button>
          </div>
        </div>`;
      }).join('')}</div>`}`;
    }
  };

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
          <div style="background:rgba(168,85,247,0.15);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:#a855f7">${summary.pollen || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Polen</div></div>
          <div style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--text-secondary)">${summary.foundation || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Perga</div></div>
          <div style="background:transparent;border:1px dashed var(--n-700);padding:var(--space-3);border-radius:var(--radius-md);text-align:center"><div style="font-size:18px;font-weight:800;color:var(--text-muted)">${summary.empty || 0}</div><div style="font-size:10px;color:var(--text-secondary)">Boş</div></div>
        </div>
        <label class="field"><span class="field-label">Tip</span>
          <select class="select" name="frameType">
            ${['brood','honey','pollen','foundation','empty'].map(t => `<option value="${t}"${f.frameType === t ? ' selected' : ''}>${({brood:'Yumurtalık',honey:'Bal',pollen:'Polen',foundation:'Perga',empty:'Boş'})[t]}</option>`).join('')}
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
              ${['in_use','extracted','cleaning','stored','retired'].map(s => `<option value="${s}"${f.status === s ? ' selected' : ''}>${s}</option>`).join('')}
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
          <textarea class="textarea" name="notes" rows="2">${BM.esc(f.notes || '')}</textarea></label>`,
        (d) => {
          d.cyclesCompleted = parseInt(d.cyclesCompleted) || 0;
          d.waxAgeMonths = parseInt(d.waxAgeMonths) || 0;
          BM.Storage.update('frames', frameId, d);
          BM.Toast.show('Çerçeve güncellendi ✓', 'success');
          BM.hives._renderTab(hiveId, 'frames');
          return true;
        }
      );
    }
  };

  BM.hives = hivesModule;
  BM.frames = framesModule;
})(window);
