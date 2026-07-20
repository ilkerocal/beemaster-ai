const inspectionsModule = {
    // AI anomali tespiti (IN-03)
    detectAnomalies(d) {
      const out = [];
      const hive = BM.Storage.get('hives', d.hiveId);
      if (!hive) return out;
      const prevInsp = BM.Storage.list('inspections')
        .filter(i => i.hiveId === hive.id)
        .sort((a, b) => b.date.localeCompare(a.date))[0];

      if (prevInsp && d.varroaCount > prevInsp.varroaCount) {
        const inc = ((d.varroaCount - prevInsp.varroaCount) / Math.max(prevInsp.varroaCount, 1) * 100).toFixed(0);
        if (inc >= 50) {
          out.push({
            icon: '⚠️', severity: 'high',
            title: 'Varroa artışı: %' + inc,
            explanation: `Varroa ${prevInsp.varroaCount} → ${d.varroaCount}`,
            why: 'Önceki muayenede ' + prevInsp.varroaCount + ' idi. Tedavi gerekebilir.'
          });
        }
      }
      if (d.varroaCount >= 6) {
        out.push({ icon: '🦠', severity: 'high', title: 'Kritik Varroa (≥6)', explanation: `${d.varroaCount} adet varroa`, why: 'Apivar veya Oksalik asit ile acil tedavi önerilir.' });
      } else if (d.varroaCount >= 3) {
        out.push({ icon: '⚡', severity: 'medium', title: 'Varroa takibi', explanation: `${d.varroaCount} adet varroa`, why: 'İzleme önerilir, eşik 6.' });
      }
      if (d.queenSeen === 'absent' && prevInsp && prevInsp.queenSeen === true) {
        out.push({ icon: '👑', severity: 'high', title: 'Ana arı kaybı riski', explanation: 'Önceki muayenede görülüyordu, şimdi yok', why: '2 hafta içinde kontrol etmezsen topluluk söner.' });
      }
      const power = { very_strong: 5, strong: 4, medium: 3, weak: 2, very_weak: 1 };
      if (prevInsp && power[d.population] < power[prevInsp.population]) {
        out.push({ icon: '📉', severity: 'medium', title: 'Koloni gücü düştü', explanation: `${BM.T.pop(prevInsp.population)} → ${BM.T.pop(d.population)}`, why: 'Besleme ve ana arı kontrolü önerilir.' });
      }
      if (d.eggsPattern === 'absent') {
        out.push({ icon: '⚠️', severity: 'high', title: 'Yumurta yok', explanation: 'Yumurtlama durmuş', why: 'Ana arı sorunu olabilir, acil kontrol.' });
      } else if (d.eggsPattern === 'irregular') {
        out.push({ icon: '🥚', severity: 'medium', title: 'Düzensiz yumurta', explanation: 'Yumurta düzeni bozuk', why: 'Ana arı yaşlı veya parazit etkisi olabilir.' });
      }
      return out;
    },

    // Multi-step wizard (IN-01)
    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) {
        BM.Toast.show('Önce kovan ekleyin', 'error');
        return;
      }
      const state = {
        hiveId: presetHiveId || (BM.Storage.list('hives')[0] && BM.Storage.list('hives')[0].id),
        date: BM.today(), varroaCount: 0, broodFrames: 0, honeyFrames: 0, pollenFrames: 0,
        population: 'strong', eggsPattern: 'regular', queenSeen: 'seen',
        weather: 'sunny', notes: '', mode: 'form', template: null
      };

      const hOpts = BM.Storage.list('hives').map(h =>
        `<option value="${h.id}"${h.id === state.hiveId ? ' selected' : ''}>${BM.esc(h.name)} — ${BM.esc(BM.T.strain(h.strain))}</option>`
      ).join('');

      const steps = [
        {
          label: 'Yöntem Seç',
          render: (s) => `
            <div style="margin-bottom:var(--space-4)">
              <div style="font-size:12px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;margin-bottom:var(--space-2)">Hızlı Şablon</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)">
                <button type="button" class="btn" onclick="BM.inspections.applyTemplate('varroa')" style="padding:var(--space-3);flex-direction:column"><div style="font-size:24px;margin-bottom:4px">🔬</div><div style="font-size:11px;font-weight:600">Varroa</div></button>
                <button type="button" class="btn" onclick="BM.inspections.applyTemplate('winter')" style="padding:var(--space-3);flex-direction:column"><div style="font-size:24px;margin-bottom:4px">❄️</div><div style="font-size:11px;font-weight:600">Kış</div></button>
                <button type="button" class="btn" onclick="BM.inspections.applyTemplate('spring')" style="padding:var(--space-3);flex-direction:column"><div style="font-size:24px;margin-bottom:4px">🌸</div><div style="font-size:11px;font-weight:600">Bahar</div></button>
              </div>
            </div>
            <div style="border-top:1px solid var(--n-800);padding-top:var(--space-4)">
              <div style="font-size:12px;color:var(--text-secondary);font-weight:600;text-transform:uppercase;margin-bottom:var(--space-2)">Giriş Yöntemi</div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-3)">
                <button type="button" class="btn ${s.mode === 'form' ? 'btn--primary' : ''}" onclick="BM.inspections.setMode('form')" style="padding:var(--space-5);flex-direction:column"><div style="font-size:32px;margin-bottom:6px">📝</div><div style="font-weight:600">Form</div><div style="font-size:10px;opacity:.7">Yapılandırılmış</div></button>
                <button type="button" class="btn ${s.mode === 'voice' ? 'btn--primary' : ''}" onclick="BM.inspections.setMode('voice')" style="padding:var(--space-5);flex-direction:column"><div style="font-size:32px;margin-bottom:6px">🎙</div><div style="font-weight:600">Sesli</div><div style="font-size:10px;opacity:.7">Mikrofon</div></button>
                <button type="button" class="btn ${s.mode === 'photo' ? 'btn--primary' : ''}" onclick="BM.inspections.setMode('photo')" style="padding:var(--space-5);flex-direction:column"><div style="font-size:32px;margin-bottom:6px">📷</div><div style="font-weight:600">Foto</div><div style="font-size:10px;opacity:.7">Görsel kanıt</div></button>
              </div>
            </div>
          `,
          validate: () => true
        },
        {
          label: 'Kovan & Tarih',
          render: (s) => `
            <label class="field"><span class="field-label">Kovan *</span>
              <select class="select" id="w-hiveId">${hOpts}</select></label>
            <label class="field"><span class="field-label">Tarih *</span>
              <input class="input" id="w-date" type="date" required value="${s.date}"></label>
            <label class="field"><span class="field-label">Hava</span>
              <select class="select" id="w-weather">
                <option value="sunny"${s.weather === 'sunny' ? ' selected' : ''}>☀️ Güneşli</option>
                <option value="cloudy"${s.weather === 'cloudy' ? ' selected' : ''}>⛅ Bulutlu</option>
                <option value="rainy"${s.weather === 'rainy' ? ' selected' : ''}>🌧 Yağmurlu</option>
                <option value="windy"${s.weather === 'windy' ? ' selected' : ''}>💨 Rüzgarlı</option>
              </select></label>
          `,
          onNext: (s) => {
            const get = id => document.getElementById(id);
            s.hiveId = get('w-hiveId').value;
            s.date = get('w-date').value;
            s.weather = get('w-weather').value;
          },
          validate: (s) => s.hiveId ? true : (BM.Toast.show('Kovan seçin', 'error'), false)
        },
        {
          label: 'Detaylar',
          render: (s) => {
            if (s.mode === 'form') {
              return `<label class="field"><span class="field-label">Güç (5 seviye)</span>
                <select class="select" id="w-population">
                  ${['very_strong','strong','medium','weak','very_weak'].map(p => `<option value="${p}"${s.population === p ? ' selected' : ''}>${BM.T.pop(p)} ${'●'.repeat({very_strong:5,strong:4,medium:3,weak:2,very_weak:1}[p])}</option>`).join('')}
                </select></label>
                <label class="field"><span class="field-label">Ana Arı</span>
                  <select class="select" id="w-queenSeen">
                    <option value="seen"${s.queenSeen === 'seen' ? ' selected' : ''}>👑 Gördüm</option>
                    <option value="cell"${s.queenSeen === 'cell' ? ' selected' : ''}>Yavru Hücresi</option>
                    <option value="new"${s.queenSeen === 'new' ? ' selected' : ''}>Yeni Ana Arı</option>
                    <option value="absent"${s.queenSeen === 'absent' ? ' selected' : ''}>Yok</option>
                  </select></label>
                <div class="field-row">
                  <label class="field"><span class="field-label">Yavru Çerçeve</span>
                    <input class="input" id="w-broodFrames" type="number" min="0" value="${s.broodFrames}"></label>
                  <label class="field"><span class="field-label">Bal Çerçeve</span>
                    <input class="input" id="w-honeyFrames" type="number" min="0" value="${s.honeyFrames}"></label>
                  <label class="field"><span class="field-label">Polen</span>
                    <input class="input" id="w-pollenFrames" type="number" min="0" value="${s.pollenFrames}"></label>
                </div>
                <label class="field"><span class="field-label">Varroa (adet) *</span>
                  <input class="input" id="w-varroaCount" type="number" min="0" value="${s.varroaCount}"></label>
                <label class="field"><span class="field-label">Yumurta Düzeni</span>
                  <select class="select" id="w-eggsPattern">
                    <option value="regular"${s.eggsPattern === 'regular' ? ' selected' : ''}>Düzenli</option>
                    <option value="irregular"${s.eggsPattern === 'irregular' ? ' selected' : ''}>Düzensiz</option>
                    <option value="absent"${s.eggsPattern === 'absent' ? ' selected' : ''}>Yok</option>
                  </select></label>
                <label class="field"><span class="field-label">Genel Not</span>
                  <textarea class="textarea" id="w-notes" rows="3">${BM.esc(s.notes)}</textarea></label>`;
            }
            if (s.mode === 'voice') {
              return `<label class="field"><span class="field-label">🎙 Sesli Not (60 sn)</span>
                <div style="background:var(--bg-tertiary);padding:var(--space-5);border-radius:var(--r-lg);text-align:center">
                  <button type="button" class="btn btn--primary" id="rec-btn" onclick="BM.inspections.toggleRecord()" style="width:80px;height:80px;border-radius:50%;font-size:32px;padding:0">🎙</button>
                  <div id="rec-status" style="margin-top:var(--space-3);font-size:12px;color:var(--text-secondary)">Kayıt için tıkla</div>
                  <div id="rec-audio" style="margin-top:var(--space-2)"></div>
                </div>
                <textarea class="textarea" id="w-notes" placeholder="veya doğrudan yaz..." rows="2" style="margin-top:var(--space-3)">${BM.esc(s.notes)}</textarea></label>`;
            }
            if (s.mode === 'photo') {
              return `<label class="field"><span class="field-label">📷 Fotoğraflar (Max 5)</span>
                <input type="file" accept="image/*" multiple capture="environment" id="w-photos" onchange="BM.inspections.handlePhotos(event)" style="margin-top:var(--space-2)">
                <div id="photo-preview" style="display:flex;gap:var(--space-2);flex-wrap:wrap;margin-top:var(--space-3)">
                  ${(s.photos || []).map((p, i) => `<div style="width:60px;height:60px;background:url(${p}) center/cover;border-radius:var(--radius-md);border:1px solid var(--n-800);position:relative"><button type="button" onclick="BM.inspections.removePhoto(${i})" style="position:absolute;top:-6px;right:-6px;background:var(--danger);color:#fff;border:none;border-radius:50%;width:18px;height:18px;font-size:10px;cursor:pointer">×</button></div>`).join('')}
                </div></label>
                <label class="field" style="margin-top:var(--space-3)"><span class="field-label">Etiket</span>
                  <input class="input" id="w-photo-tag" placeholder="petek, ana arı, hastalık..."></label>`;
            }
          },
          onNext: (s) => {
            const get = id => document.getElementById(id);
            if (s.mode === 'form') {
              s.population = get('w-population').value;
              s.queenSeen = get('w-queenSeen').value;
              s.broodFrames = parseInt(get('w-broodFrames').value) || 0;
              s.honeyFrames = parseInt(get('w-honeyFrames').value) || 0;
              s.pollenFrames = parseInt(get('w-pollenFrames').value) || 0;
              s.varroaCount = parseInt(get('w-varroaCount').value) || 0;
              s.eggsPattern = get('w-eggsPattern').value;
              s.notes = get('w-notes').value;
            } else if (s.mode === 'voice' || s.mode === 'photo') {
              s.notes = get('w-notes').value;
              s.photoTag = get('w-photo-tag') ? get('w-photo-tag').value : '';
            }
          }
        },
        {
          label: 'AI Analiz',
          render: (s) => {
            const anomalies = this.detectAnomalies(s);
            const hive = BM.Storage.get('hives', s.hiveId);
            return `<div class="ai-card card" style="margin-bottom:var(--space-4)">
              <div style="font-size:13px;font-weight:700;margin-bottom:var(--space-2);display:flex;align-items:center;gap:var(--space-2)">🤖 AI Analiz Sonucu</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-3)">
                ${BM.esc(hive ? hive.name : '?')} kovanı analiz edildi. <strong>${anomalies.length} anomali</strong>, <strong>${anomalies.filter(a => a.severity === 'high').length} yüksek risk</strong>.
              </div>
              ${anomalies.length ? anomalies.map(a => `
                <div class="ai-item" style="border-left:3px solid ${a.severity === 'high' ? 'var(--danger)' : a.severity === 'medium' ? 'var(--warning)' : 'var(--info)'}">
                  <div class="ai-item__icon">${a.icon}</div>
                  <div class="ai-item__title">${BM.esc(a.title)}</div>
                  <div class="ai-item__sub">${BM.esc(a.explanation)}</div>
                  <div class="ai-item__why">${BM.esc(a.why)}</div>
                </div>
              `).join('') : '<div style="font-size:12px;color:var(--success)">✓ Anomali tespit edilmedi</div>'}
            </div>
            <div class="card" style="background:var(--bg-tertiary)">
              <div style="font-size:12px;font-weight:700;margin-bottom:var(--space-2)">📋 Özet</div>
              <div class="row-list">
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Kovan</div></div><div style="font-weight:600">${BM.esc(hive ? hive.name : '?')}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Tarih</div></div><div>${BM.dateStr(s.date)}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Güç</div></div><div>${BM.T.pop(s.population)}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Varroa</div></div><div style="color:${s.varroaCount >= 6 ? 'var(--danger)' : s.varroaCount >= 3 ? 'var(--warning)' : 'var(--success)'};font-weight:700">${s.varroaCount}</div></div>
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Çerçeve</div></div><div>Y:${s.broodFrames} B:${s.honeyFrames} P:${s.pollenFrames}</div></div>
              </div>
            </div>`;
          }
        }
      ];

      BM.Wizard.open('🔬 Muayene Sihirbazı', steps, (s) => {
        s.queenSeen = s.queenSeen === 'seen' || s.queenSeen === 'cell' || s.queenSeen === 'new';
        s.aiAnomalies = this.detectAnomalies(s).length;
        s.photos = this._state.photos || []; BM.Storage.add('inspections', s);
        const anomalies = this.detectAnomalies(s);
        if (anomalies.filter(a => a.severity === 'high').length > 0) {
          BM.Toast.show(`Muayene kaydedildi. ${anomalies.length} anomali!`, 'warn');
        } else {
          BM.Toast.show('Muayene kaydedildi ✓', 'success');
        }
        if (s.varroaCount >= 6) {
          setTimeout(() => {
            BM.Modal.confirm('⚠️ Yüksek varroa tespit edildi. Tedavi kaydı oluşturulsun mu?', () => {
              BM.treatments.add(s.hiveId);
            });
          }, 500);
        }
        App.render('inspections');
      });

      // Hooks for wizard buttons
      this._state = state;
    },

    applyTemplate(name) {
      const s = this._state;
      if (name === 'varroa') { s.varroaCount = 0; s.population = 'strong'; s.notes = 'Varroa sayımı muayenesi'; }
      if (name === 'winter') { s.varroaCount = 2; s.population = 'medium'; s.broodFrames = 3; s.honeyFrames = 8; s.notes = 'Kış hazırlığı kontrolü'; }
      if (name === 'spring') { s.population = 'strong'; s.broodFrames = 5; s.eggsPattern = 'regular'; s.notes = 'Bahar kontrol'; }
      s.template = name;
      App.render(); // refresh
      this.add(s.hiveId);
    },

    setMode(mode) {
      this._state.mode = mode;
      App.render();
      this.add(this._state.hiveId);
    },

    toggleRecord() {
      const btn = document.getElementById('rec-btn');
      const status = document.getElementById('rec-status');
      if (btn.dataset.state === 'rec') {
        btn.dataset.state = 'idle';
        btn.textContent = '🎙';
        status.textContent = 'Kayıt tamamlandı ✓';
        status.style.color = 'var(--success)';
      } else {
        btn.dataset.state = 'rec';
        btn.textContent = '⏹';
        status.textContent = '🔴 Kayıt yapılıyor...';
        status.style.color = 'var(--danger)';
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            const rec = new MediaRecorder(stream);
            const chunks = [];
            rec.ondataavailable = e => chunks.push(e.data);
            rec.onstop = () => {
              const blob = new Blob(chunks, { type: 'audio/webm' });
              const url = URL.createObjectURL(blob);
              document.getElementById('rec-audio').innerHTML = '<audio controls src="' + url + '" style="width:100%;margin-top:var(--space-2)"></audio>';
              stream.getTracks().forEach(t => t.stop());
            };
            rec.start();
            btn.onclick = () => rec.stop();
          }).catch(err => {
            status.textContent = '⚠️ Mikrofon erişimi reddedildi';
            status.style.color = 'var(--warning)';
          });
        }
      }
    },

    handlePhotos(e) {
      const files = Array.from(e.target.files).slice(0, 5);
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = ev => {
          if (!this._state.photos) this._state.photos = [];
          if (this._state.photos.length < 5) this._state.photos.push(ev.target.result);
          App.render();
          this.add(this._state.hiveId);
        };
        reader.readAsDataURL(f);
      });
    },

    removePhoto(i) {
      this._state.photos.splice(i, 1);
      App.render();
      this.add(this._state.hiveId);
    },

    edit(id) {
      const i = BM.Storage.get('inspections', id);
      if (!i) return;
      BM.Modal.open('Muayene Düzenle',
        `<label class="field"><span class="field-label">Kovan</span>
           <select class="select" name="hiveId">${BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === i.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('')}</select></label>
         <label class="field"><span class="field-label">Tarih</span>
           <input class="input" name="date" type="date" required value="${i.date}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Varroa</span>
             <input class="input" name="varroaCount" type="number" min="0" value="${i.varroaCount}"></label>
           <label class="field"><span class="field-label">Yavru Çerçeve</span>
             <input class="input" name="broodFrames" type="number" min="0" value="${i.broodFrames}"></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="3">${BM.esc(i.notes || '')}</textarea></label>`,
        (d) => {
          d.varroaCount = parseInt(d.varroaCount) || 0;
          d.broodFrames = parseInt(d.broodFrames) || 0;
          BM.Storage.update('inspections', id, d);
          BM.Toast.show('Muayene güncellendi ✓', 'success');
          App.render('inspections');
          return true;
        }
      );
    },

    del(id) {
      BM.Modal.confirm('Bu muayeneyi silmek istiyor musunuz?', () => {
        BM.Storage.remove('inspections', id);
        BM.Toast.show('Muayene silindi', 'info');
        App.render('inspections');
      });
    },

    // IN-05: İki muayene yan yana karşılaştırma
    compare(hiveId) {
      const list = BM.Storage.list('inspections').filter(i => i.hiveId === hiveId).sort((a, b) => b.date.localeCompare(a.date));
      if (list.length < 2) { BM.Toast.show('Karşılaştırma için en az 2 muayene gerekli', 'error'); return; }
      const [a, b] = list;
      const items = [
        ['Tarih', BM.dateStr(a.date), BM.dateStr(b.date), null],
        ['Varroa', a.varroaCount, b.varroaCount, a.varroaCount - b.varroaCount],
        ['Yavru Çerçeve', a.broodFrames, b.broodFrames, a.broodFrames - b.broodFrames],
        ['Bal Çerçeve', a.honeyFrames, b.honeyFrames, a.honeyFrames - b.honeyFrames],
        ['Popülasyon', BM.T.pop(a.population), BM.T.pop(b.population), null],
        ['Yumurta', a.eggsPattern || '-', b.eggsPattern || '-', null],
        ['Ana Arı', a.queenSeen ? 'Görüldü' : 'Görülmedi', b.queenSeen ? 'Görüldü' : 'Görülmedi', null],
        ['Notlar', BM.esc(a.notes || '-'), BM.esc(b.notes || '-'), null]
      ];
      const html = `
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-4);text-align:center">
          Son iki muayene yan yana — Değişim olan satırlar renkli
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:var(--bg-tertiary)">
              <th style="padding:var(--space-3);text-align:left;font-weight:600;width:30%">Alan</th>
              <th style="padding:var(--space-3);text-align:left;font-weight:600">${BM.dateStr(a.date)}<br><span style="font-size:10px;color:var(--text-muted);font-weight:400">${BM.dateAgo(a.date)}</span></th>
              <th style="padding:var(--space-3);text-align:left;font-weight:600">${BM.dateStr(b.date)}<br><span style="font-size:10px;color:var(--text-muted);font-weight:400">${BM.dateAgo(b.date)}</span></th>
              <th style="padding:var(--space-3);text-align:center;font-weight:600">Δ</th>
            </tr>
          </thead>
          <tbody>${items.map(it => {
            const changed = JSON.stringify(it[1]) !== JSON.stringify(it[2]);
            const diff = it[3];
            const color = diff > 0 ? 'var(--success)' : diff < 0 ? 'var(--danger)' : '';
            return `<tr style="border-bottom:1px solid var(--n-800);${changed ? 'background:rgba(245,158,11,0.05)' : ''}">
              <td style="padding:var(--space-3);font-weight:600">${it[0]}</td>
              <td style="padding:var(--space-3)">${it[1]}</td>
              <td style="padding:var(--space-3)">${it[2]}</td>
              <td style="padding:var(--space-3);text-align:center;font-weight:700;color:${color}">${diff !== null ? (diff > 0 ? '+' : '') + diff : ''}</td>
            </tr>`;
          }).join('')}</tbody>
        </table>
      `;
      BM.Modal.showReport(html);
    },

    render() {
      const list = BM.Storage.list('inspections').sort((a, b) => b.date.localeCompare(a.date));
      return `<div class="actions-bar">
        <div>
          <h2 style="font-size:18px;font-weight:700">Muayeneler</h2>
          <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} kayıt · AI anomali tespiti aktif</div>
        </div>
        <button class="btn btn--primary" onclick="BM.inspections.add()">🔬 Yeni Muayene (Sihirbaz)</button>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.inspections}</div><div class="empty__title">Henüz muayene yok</div><button class="btn btn--primary" onclick="BM.inspections.add()">🔬 İlk Muayeneyi Başlat</button></div></div>` :
      `<div class="card"><div class="timeline">${list.map(i => {
        const h = BM.Storage.get('hives', i.hiveId);
        const aiBadge = i.aiAnomalies ? `<span class="badge badge--warn">🤖 ${i.aiAnomalies}</span>` : '';
        const modeIcon = i.mode === 'voice' ? ' 🎙' : i.mode === 'photo' ? ' 📷' : '';
        return `<div class="timeline__item">
          <div class="timeline__icon">📋</div>
          <div class="timeline__body">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')}${modeIcon} <span class="badge ${BM.T.statusCls(i.varroaCount >= 6 ? 'danger' : i.varroaCount >= 3 ? 'warning' : 'good')}">Varroa: ${i.varroaCount}</span>${aiBadge}</div>
            <div class="timeline__meta">${BM.dateStr(i.date)} · ${BM.T.pop(i.population)} · Yavru: ${i.broodFrames} çerçeve · Bal: ${i.honeyFrames} çerçeve${i.template ? ' · 📋 ' + i.template : ''}</div>
            ${i.notes ? `<div class="timeline__meta" style="margin-top:4px;color:var(--text-secondary)">"${BM.esc(i.notes)}"</div>` : ''}
          </div>
          <div class="timeline__body" style="display:flex;gap:var(--space-1);align-items:flex-start">
            <button class="btn btn--sm" onclick="BM.inspections.compare('${i.hiveId}')" title="Karşılaştır">🔄</button>
            <button class="btn btn--sm" onclick="BM.inspections.edit('${i.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.inspections.del('${i.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    },
    handlePhotos(event) {
      const files = Array.from(event.target.files || []);
      const s = this._state;
      if (!s.photos) s.photos = [];
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = e => {
          s.photos.push(e.target.result);
          App.render();
        };
        reader.readAsDataURL(f);
      });
    },

    removePhoto(i) {
      const s = this._state;
      if (s.photos && s.photos[i]) {
        s.photos.splice(i, 1);
        App.render();
      }
    },

  }