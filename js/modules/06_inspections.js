/* ===== js/modules/inspections.js ===== */
// ============================================================
// Inspections Module — Spec 05_Modules/Hive_Inspections.md
// IN-01..08: Multi-step wizard, AI anomali, ses/foto, karşılaştırma
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

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
      if (d.queenSeen === 'absent' && prevInsp && (prevInsp.queenSeen === true || prevInsp.queenSeen === 'seen' || prevInsp.queenSeen === 'cell' || prevInsp.queenSeen === 'new')) {
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
        BM.Toast.show('Önce kovan ekleyin. Yönlendiriliyor...', 'info');
        setTimeout(() => BM.hives.add(), 800);
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
          label: 'Kovan & Tarih',
          render: (s) => {
            if (!s.date) s.date = BM.today();
            const hOpts = BM.Storage.list('hives').map(h =>
              `<option value="${h.id}"${h.id === s.hiveId ? ' selected' : ''}>${BM.esc(h.name)} — ${BM.esc(BM.T.strain(h.strain))}</option>`
            ).join('');
            return `
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
            <label class="field"><span class="field-label">Hızlı Şablon (opsiyonel)</span>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-2)">
                <button type="button" class="btn btn--tpl" onclick="BM.inspections.applyTemplate('varroa')">
                  <div class="btn-icon">🔬</div><div class="btn-label">Varroa</div>
                </button>
                <button type="button" class="btn btn--tpl" onclick="BM.inspections.applyTemplate('winter')">
                  <div class="btn-icon">❄️</div><div class="btn-label">Kış</div>
                </button>
                <button type="button" class="btn btn--tpl" onclick="BM.inspections.applyTemplate('spring')">
                  <div class="btn-icon">🌸</div><div class="btn-label">Bahar</div>
                </button>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:6px">Şablon seçince aşağıdaki alanlar otomatik dolar</div>
            </label>
          `;
          },
          onNext: (s) => {
            const get = id => document.getElementById(id);
            s.hiveId = get('w-hiveId').value;
            s.date = get('w-date').value;
            s.weather = get('w-weather').value;
          },
          validate: (s) => {
            if (!s.hiveId) {
              BM.Toast.show('Lütfen listeden kovan seçin', 'error');
              return false;
            }
            return true;
          }
        },
        {
          label: 'Muayene Formu',
          render: (s) => `
            <div style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-md);margin-bottom:var(--space-3);font-size:12px;color:var(--text-secondary)">
              📋 Zorunlu muayene verileri — bunlar kayıt için gereklidir
            </div>
            <label class="field"><span class="field-label">Güç (5 seviye) *</span>
              <select class="select" id="w-population">
                ${['very_strong','strong','medium','weak','very_weak'].map(p => `<option value="${p}"${s.population === p ? ' selected' : ''}>${BM.T.pop(p)} ${'●'.repeat({very_strong:5,strong:4,medium:3,weak:2,very_weak:1}[p])}</option>`).join('')}
              </select></label>
            <label class="field"><span class="field-label">Ana Arı *</span>
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
              <input class="input" id="w-varroaCount" type="number" min="0" value="${s.varroaCount}" required></label>
            <label class="field"><span class="field-label">Yumurta Düzeni</span>
              <select class="select" id="w-eggsPattern">
                <option value="regular"${s.eggsPattern === 'regular' ? ' selected' : ''}>Düzenli</option>
                <option value="irregular"${s.eggsPattern === 'irregular' ? ' selected' : ''}>Düzensiz</option>
                <option value="absent"${s.eggsPattern === 'absent' ? ' selected' : ''}>Yok</option>
              </select></label>
            <label class="field"><span class="field-label">Notlar</span>
              <textarea class="textarea" id="w-notes" rows="2" placeholder="Ek notlar...">${BM.esc(s.notes)}</textarea></label>
          `,
          onNext: (s) => {
            const get = id => document.getElementById(id);
            s.population = get('w-population').value;
            s.queenSeen = get('w-queenSeen').value;
            s.broodFrames = parseInt(get('w-broodFrames').value) || 0;
            s.honeyFrames = parseInt(get('w-honeyFrames').value) || 0;
            s.pollenFrames = parseInt(get('w-pollenFrames').value) || 0;
            s.varroaCount = parseInt(get('w-varroaCount').value) || 0;
            s.eggsPattern = get('w-eggsPattern').value;
            s.notes = get('w-notes').value;
          },
          validate: (s) => {
            if (s.varroaCount === undefined || s.varroaCount === null || isNaN(s.varroaCount)) {
              BM.Toast.show('Varroa sayısı gerekli', 'error');
              return false;
            }
            return true;
          }
        },
        {
          label: 'Ek Medya (opsiyonel)',
          render: (s) => {
            const hasPhotos = (s.photos && s.photos.length > 0);
            const hasAudio = !!s.audioData;
            return `
            <div style="background:var(--bg-tertiary);padding:var(--space-3);border-radius:var(--radius-md);margin-bottom:var(--space-3);font-size:12px;color:var(--text-secondary)">
              💡 Bu adım isteğe bağlıdır. Fotoğraf ve/veya sesli not ekleyebilirsiniz — hiçbir şey eklemeden de geçebilirsiniz.
            </div>
            <div class="media-toggle-row">
              <button type="button" class="btn btn--media ${hasPhotos ? 'btn--primary' : ''}" onclick="BM.inspections.togglePhotos()">
                <div class="btn-icon">📷</div>
                <div class="btn-label">${hasPhotos ? '✓ ' + s.photos.length + ' Fotoğraf' : 'Fotoğraf Ekle'}</div>
              </button>
              <button type="button" class="btn btn--media ${hasAudio ? 'btn--primary' : ''}" onclick="BM.inspections.toggleAudio()">
                <div class="btn-icon">🎙</div>
                <div class="btn-label">${hasAudio ? '✓ Ses Kaydı' : 'Sesli Not Ekle'}</div>
              </button>
            </div>
            <div id="photo-area" style="display:${hasPhotos ? 'block' : 'none'}">
              <div class="photo-upload" onclick="document.getElementById('w-photos').click()">
                <div class="photo-upload__icon">📷</div>
                <div class="photo-upload__text">Fotoğraf eklemek için tıklayın</div>
                <div class="photo-upload__hint">JPG, PNG · Max 5 fotoğraf</div>
              </div>
              <input type="file" accept="image/*" multiple capture="environment" id="w-photos" onchange="BM.inspections.handlePhotos(event)" style="display:none">
              <div id="photo-preview" class="photo-preview">
                ${(s.photos || []).map((p, i) => `<div class="photo-preview__item"><img src="${p}" alt=""><button type="button" class="photo-preview__remove" onclick="BM.inspections.removePhoto(${i})">×</button></div>`).join('')}
              </div>
              <label class="field" style="margin-top:var(--space-3)"><span class="field-label">Fotoğraf Etiketi</span>
                <input class="input" id="w-photo-tag" placeholder="petek, ana arı, hastalık..." value="${BM.esc(s.photoTag || '')}"></label>
            </div>
            <div id="audio-area" style="display:${hasAudio ? 'block' : 'none'}">
              <div style="background:var(--bg-tertiary);padding:var(--space-5);border-radius:var(--radius-lg);text-align:center">
                <button type="button" class="btn btn--primary" id="rec-btn" onclick="BM.inspections.toggleRecord()" style="width:80px;height:80px;border-radius:50%;font-size:32px;padding:0">${s.audioData ? '✓' : '🎙'}</button>
                <div id="rec-status" style="margin-top:var(--space-3);font-size:12px;color:${s.audioData ? 'var(--success)' : 'var(--text-secondary)'}">${s.audioData ? '✓ Kayıt tamamlandı' : 'Kayıt için tıklayın'}</div>
                <div id="rec-audio" style="margin-top:var(--space-2)">${s.audioData ? '<audio controls src="' + s.audioData + '" style="width:100%"></audio>' : ''}</div>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:8px;text-align:center">
                ${s.audioData ? '✓ Ses kaydedildi — İsterseniz tekrar kaydedin' : '60 saniyeye kadar kayıt yapabilirsiniz'}
              </div>
            </div>
          `;
          },
          onNext: () => {
            // Optional step - always passes
            const tagEl = document.getElementById('w-photo-tag');
            if (tagEl && window.BM && BM.inspections && BM.inspections._state) {
              BM.inspections._state.photoTag = tagEl.value;
            }
          },
          validate: () => true
        },
        {
          label: 'AI Analiz',
          render: (s) => {
            const anomalies = this.detectAnomalies(s);
            const hive = BM.Storage.get('hives', s.hiveId);
            const photoCount = (s.photos || []).length;
            const hasAudio = !!s.audioData;
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
                <div class="row-list__item"><div class="row-list__main"><div class="row-list__name">Ek Medya</div></div><div>${photoCount > 0 ? '📷 ' + photoCount + ' fotoğraf' : ''}${photoCount > 0 && hasAudio ? ' · ' : ''}${hasAudio ? '🎙 Ses kaydı' : ''}${photoCount === 0 && !hasAudio ? '—' : ''}</div></div>
              </div>
            </div>`;
          }
        }
      ];

      BM.Wizard.open('🔬 Muayene Sihirbazı', steps, async (s) => {
        // queenSeen değerini koru — boolean'a çevirme!
        if (s.queenSeen === 'cell' || s.queenSeen === 'new') s.queenSeen = 'seen';
        // AI anomalileri tespit et ve JSON olarak kaydet
        const anomalies = this.detectAnomalies(s);
        s.aiAnomalies = JSON.stringify(anomalies);
        s.aiAnomaliesCount = anomalies.length;
        // Fotograflari ve ses kaydini state'den al
        s.photos = this._state.photos || [];
        s.audioData = this._state.audioData || null;
        s.mode = this._state.mode || 'form';
        s.photoTag = this._state.photoTag || '';
        await BM.Storage.add('inspections', s);
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
      }, state);

      // Hooks for wizard buttons
      this._state = state;
    },

    applyTemplate(name) {
      const s = this._state;
      if (!s) return;
      if (name === 'varroa') { s.varroaCount = 0; s.population = 'strong'; s.notes = 'Varroa sayımı muayenesi'; }
      if (name === 'winter') { s.varroaCount = 2; s.population = 'medium'; s.broodFrames = 3; s.honeyFrames = 8; s.notes = 'Kış hazırlığı kontrolü'; }
      if (name === 'spring') { s.population = 'strong'; s.broodFrames = 5; s.eggsPattern = 'regular'; s.notes = 'Bahar kontrol'; }
      s.template = name;
      // Sadece state'i guncelle, wizard'i yeniden acma. Goruntuyu yenile.
      const templateLabels = { varroa: 'Varroa', winter: 'Kış', spring: 'Bahar' };
      BM.Toast.show('Şablon uygulandı: ' + (templateLabels[name] || name), 'success');
      // Wizard body's ilgili alanlarini yeniden render etmek icin modal body's icindeki inputlara set et
      const notesEl = document.getElementById('w-notes');
      if (notesEl) notesEl.value = s.notes;
      const vEl = document.getElementById('w-varroaCount');
      if (vEl) vEl.value = s.varroaCount;
      const pEl = document.getElementById('w-population');
      if (pEl) pEl.value = s.population;
      const bEl = document.getElementById('w-broodFrames');
      if (bEl) bEl.value = s.broodFrames;
      const hEl = document.getElementById('w-honeyFrames');
      if (hEl) hEl.value = s.honeyFrames;
    },

    setMode(mode) {
      if (!this._state) return;
      this._state.mode = mode;
      // Sadece wizard body'sini yeniden render et, modal'i yeniden ACMA
      const wizard = document.querySelector('.wizard');
      const body = document.getElementById('wizard-body');
      if (wizard && body) {
        // Butonlarin active class'ini guncelle
        const btns = wizard.querySelectorAll('button[onclick*="setMode"]');
        btns.forEach(b => {
          if (b.getAttribute('onclick').includes(`'${mode}'`)) {
            b.classList.add('btn--primary');
          } else {
            b.classList.remove('btn--primary');
          }
        });
      }
      BM.Toast.show('Mod değiştirildi: ' + (mode === 'form' ? 'Form' : mode === 'voice' ? 'Sesli' : 'Fotoğraf'), 'info');
    },

    toggleRecord() {
      const btn = document.getElementById('rec-btn');
      const status = document.getElementById('rec-status');
      if (!btn) return;
      if (!this._state) this._state = {};
      if (this._state._recorder && this._state._recorder.state === 'recording') {
        // Durdur
        this._state._recorder.stop();
        return;
      }
      btn.dataset.state = 'rec';
      btn.textContent = '⏹';
      status.textContent = '🔴 Kayıt yapılıyor...';
      status.style.color = 'var(--danger)';
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        status.textContent = '⚠️ Tarayıcı mikrofonu desteklemiyor';
        status.style.color = 'var(--warning)';
        btn.dataset.state = 'idle';
        btn.textContent = '🎙';
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
        const rec = new MediaRecorder(stream);
        const chunks = [];
        rec.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
        rec.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          const reader = new FileReader();
          reader.onload = e => {
            // DataURL olarak state'e kaydet
            this._state.audioData = e.target.result;
            this._state.audioBlob = blob;
            // Audio player goster
            const url = URL.createObjectURL(blob);
            const audioDiv = document.getElementById('rec-audio');
            if (audioDiv) audioDiv.innerHTML = '<audio controls src="' + url + '" style="width:100%;margin-top:var(--space-2)"></audio>';
            stream.getTracks().forEach(t => t.stop());
          };
          reader.readAsDataURL(blob);
        };
        rec.start();
        this._state._recorder = rec;
        // Durdurma
        btn.onclick = () => {
          if (rec.state === 'recording') {
            rec.stop();
            btn.dataset.state = 'idle';
            btn.textContent = '🎙';
            status.textContent = '✓ Kayıt tamamlandı';
            status.style.color = 'var(--success)';
          }
        };
      }).catch(err => {
        status.textContent = '⚠️ Mikrofon erişimi reddedildi: ' + (err.message || err.name);
        status.style.color = 'var(--warning)';
        btn.dataset.state = 'idle';
        btn.textContent = '🎙';
      });
    },

    handlePhotos(e) {
      const files = Array.from((e && e.target && e.target.files) || []).slice(0, 5);
      if (!files.length) return;
      if (!this._state.photos) this._state.photos = [];
      let pending = files.length;
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = ev => {
          if (this._state.photos.length < 5) {
            this._state.photos.push(ev.target.result);
          }
          pending--;
          if (pending === 0) {
            // Tum fotograflar islendi, sadece wizard body'sini yenile (wizard'i yeniden ACMA)
            this.refreshWizardStep();
            BM.Toast.show(files.length + ' fotoğraf eklendi ✓', 'success');
          }
        };
        reader.readAsDataURL(f);
      });
    },

    refreshWizardStep() {
      // Wizard'i yeniden acmadan, sadece mevcut step'in renderini yenile
      const s = this._state;
      const step3 = document.getElementById('wizard-body');
      if (!step3 || !s) return;
      const preview = document.getElementById('photo-preview');
      if (preview) {
        preview.innerHTML = (s.photos || []).map((p, i) => `<div class="photo-preview__item"><img src="${p}" alt=""><button type="button" class="photo-preview__remove" onclick="BM.inspections.removePhoto(${i})">×</button></div>`).join('');
      }
    },

    togglePhotos() {
      if (!this._state) return;
      const photoArea = document.getElementById('photo-area');
      const audioArea = document.getElementById('audio-area');
      const isShowing = photoArea && photoArea.style.display !== 'none';
      // Goster/gizle
      if (photoArea) photoArea.style.display = isShowing ? 'none' : 'block';
      // Photos array'i koru (gizlesek bile), kullanici tekrar acabilsin
      BM.Toast.show(isShowing ? 'Fotoğraf bölümü gizlendi' : 'Fotoğraf bölümü açıldı', 'info');
    },

    toggleAudio() {
      if (!this._state) return;
      const audioArea = document.getElementById('audio-area');
      const isShowing = audioArea && audioArea.style.display !== 'none';
      if (audioArea) audioArea.style.display = isShowing ? 'none' : 'block';
      BM.Toast.show(isShowing ? 'Ses kaydı gizlendi' : 'Ses kaydı açıldı', 'info');
    },

    removePhoto(i) {
      if (this._state && this._state.photos) {
        this._state.photos.splice(i, 1);
        this.refreshWizardStep();
        BM.Toast.show('Fotoğraf silindi', 'info');
      }
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
        ['Ana Arı', ['Görüldü', 'Yok', 'Bilinmiyor'].includes(a.queenSeen) ? 'Görüldü' : ['seen','cell','new'].includes(a.queenSeen) ? 'Görüldü' : 'Yok', ['seen','cell','new'].includes(b.queenSeen) ? 'Görüldü' : b.queenSeen === 'absent' ? 'Yok' : 'Bilinmiyor', null],
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
        const aiBadge = (() => {
          if (!i.aiAnomalies) return '';
          if (typeof i.aiAnomalies === 'string' && i.aiAnomalies !== '0') {
            try { const arr = JSON.parse(i.aiAnomalies); if (arr.length) return `<span class="badge badge--warn">🤖 ${arr.length}</span>`; } catch(e) {}
          } else if (typeof i.aiAnomalies === 'number' && i.aiAnomalies > 0) {
            return `<span class="badge badge--warn">🤖 ${i.aiAnomalies}</span>`;
          }
          return '';
        })();
        const modeIcon = i.mode === 'voice' ? ' 🎙' : i.mode === 'photo' ? ' 📷' : '';
        const photoCount = i.photos ? i.photos.length : 0;
        const hasAudio = i.audio ? true : false;
        return `<div class="timeline__item" data-id="${i.id}">
          <div class="timeline__icon">📋</div>
          <div class="timeline__body" style="flex:1;min-width:0">
            <div class="timeline__title">${BM.esc(h ? h.name : '?')}${modeIcon} <span class="badge ${BM.T.statusCls(i.varroaCount >= 6 ? 'danger' : i.varroaCount >= 3 ? 'warning' : 'good')}">Varroa: ${i.varroaCount}</span>${aiBadge}</div>
            <div class="timeline__meta">${BM.dateStr(i.date)} · ${BM.T.pop(i.population)} · Yavru: ${i.broodFrames} ç · Bal: ${i.honeyFrames} ç · Polen: ${i.pollenFrames} ç${i.template ? ' · 📋 ' + i.template : ''}</div>
            ${i.notes ? `<div class="timeline__meta" style="margin-top:4px;color:var(--text-secondary);font-size:12px">"${BM.esc(i.notes)}"</div>` : ''}
            <div class="timeline__meta" style="margin-top:4px;font-size:11px;color:var(--text-muted)">
              ${i.queenSeen === 'seen' ? '👑 Görüldü' : i.queenSeen === 'absent' ? '👑 YOK' : '👑 ?'}
              ${i.eggsPattern === 'regular' ? ' · 🥚 Düzenli' : i.eggsPattern === 'irregular' ? ' · 🥚 Düzensiz' : ' · 🥚 Yok'}
              ${i.weather ? ' · 🌤 ' + BM.T.weather(i.weather) : ''}
              ${photoCount > 0 ? ` · 📷 ${photoCount}` : ''}
              ${hasAudio ? ' · 🎙' : ''}
            </div>
          </div>
          <div class="timeline__actions" style="display:flex;gap:var(--space-1);flex-wrap:wrap">
            <button class="btn btn--sm" onclick="BM.inspections.detail('${i.id}')" title="Detay Görüntüle">👁</button>
            <button class="btn btn--sm" onclick="BM.inspections.compare('${i.hiveId}')" title="Karşılaştır">🔄</button>
            <button class="btn btn--sm" onclick="BM.inspections.edit('${i.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.inspections.del('${i.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div></div>`}`;
    },

    // Muayene detay görüntüle — ne yapıldı, neler ölçüldü, ne bulundu
    detail(id) {
      const i = BM.Storage.get('inspections', id);
      if (!i) return BM.Toast.show('Muayene bulunamadı', 'error');
      const h = BM.Storage.get('hives', i.hiveId);
      const prevInsp = BM.Storage.list('inspections')
        .filter(x => x.hiveId === i.hiveId && x.id !== id)
        .sort((a, b) => b.date.localeCompare(a.date))[0];
      const photoHtml = i.photos && i.photos.length ? i.photos.map(p =>
        `<img src="${p}" style="max-width:120px;border-radius:8px;margin:4px;box-shadow:0 2px 8px #0005;cursor:pointer" onclick="window.open('${p}','_blank')" title="Büyütmek için tıkla">`
      ).join('') : '<span style="color:var(--text-muted);font-size:12px">Fotoğraf eklenmedi</span>';
      const audioHtml = i.audio ? `<audio controls src="${i.audio}" style="width:100%;margin-top:8px"></audio>` : '';
      const aiRaw = i.aiAnomalies;
      let anomalies = [];
      if (aiRaw) {
        if (typeof aiRaw === 'string') {
          try { anomalies = JSON.parse(aiRaw); } catch(e) { anomalies = []; }
        } else if (Array.isArray(aiRaw)) {
          anomalies = aiRaw;
        } else if (typeof aiRaw === 'number' && aiRaw > 0) {
          // Eski veri: sadece sayı var, içerik bilinmiyor
          anomalies = [{ icon: '🤖', severity: 'medium', title: aiRaw + ' anomali tespit edildi', explanation: 'Önceki muayenede AI analizi yapıldı', why: 'Detaylı bilgi için yeni muayene yapın' }];
        }
      }
      const anomalyHtml = anomalies.length ? anomalies.map(a =>
        `<div style="background:${a.severity === 'high' ? 'rgba(239,68,68,0.15)' : a.severity === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'};border-left:3px solid ${a.severity === 'high' ? 'var(--danger)' : a.severity === 'medium' ? 'var(--warning)' : 'var(--success)'};padding:var(--space-3);margin:var(--space-2) 0;border-radius:6px">
          <div style="display:flex;gap:var(--space-2);align-items:flex-start">
            <span style="font-size:18px">${a.icon}</span>
            <div style="flex:1">
              <div style="font-weight:600;font-size:13px">${BM.esc(a.title)}</div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${BM.esc(a.explanation)}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:4px;font-style:italic">💡 ${BM.esc(a.why)}</div>
            </div>
          </div>
        </div>`
      ).join('') : '<div style="color:var(--success);padding:var(--space-3);background:rgba(16,185,129,0.1);border-radius:8px;font-size:13px">✅ AI anomali tespit edilmedi — her şey yolunda</div>';
      const comparisonHtml = prevInsp ? `
        <div style="margin-top:var(--space-4);padding-top:var(--space-4);border-top:1px solid var(--n-800)">
          <h4 style="margin-bottom:var(--space-3);font-size:14px">📊 Önceki Muayene ile Karşılaştırma (${BM.dateStr(prevInsp.date)})</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);font-size:12px">
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Koloni Gücü:</strong><br>${BM.T.pop(prevInsp.population)} → <span style="color:${prevInsp.population === i.population ? 'var(--text-secondary)' : 'var(--warning)'};font-weight:600">${BM.T.pop(i.population)}</span></div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Varroa:</strong><br>${prevInsp.varroaCount} → <span style="color:${i.varroaCount > prevInsp.varroaCount ? 'var(--danger)' : i.varroaCount < prevInsp.varroaCount ? 'var(--success)' : 'var(--text-secondary)'};font-weight:700">${i.varroaCount}</span> ${i.varroaCount > prevInsp.varroaCount ? '↑' : i.varroaCount < prevInsp.varroaCount ? '↓' : '→'}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Yavru Ç.:</strong> ${prevInsp.broodFrames} → ${i.broodFrames}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Bal Ç.:</strong> ${prevInsp.honeyFrames} → ${i.honeyFrames}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Polen Ç.:</strong> ${prevInsp.pollenFrames} → ${i.pollenFrames}</div>
            <div style="padding:var(--space-2);background:var(--bg-tertiary);border-radius:6px"><strong>Yumurta:</strong> ${({regular:'Düzenli',irregular:'Düzensiz',absent:'Yok'})[prevInsp.eggsPattern]} → ${({regular:'Düzenli',irregular:'Düzensiz',absent:'Yok'})[i.eggsPattern]}</div>
          </div>
        </div>` : '';
      const modeLabel = i.mode === 'voice' ? '🎙 Ses Kaydı' : i.mode === 'photo' ? '📷 Fotoğraf' : i.mode === 'wizard' ? '🧙 Sihirbaz' : '📝 Form';
      BM.Modal.open(`${BM.esc(h ? h.name : 'Kovan')} — Muayene Detayı`,
        `<div style="max-height:70vh;overflow:auto;padding:var(--space-2)">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-4)">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">📅 TARİH</div><div style="font-weight:600">${BM.dateStr(i.date)}</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">📝 MOD</div><div style="font-weight:600">${modeLabel}</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">🌤 HAVA</div><div style="font-weight:600">${i.weather ? BM.T.weather(i.weather) : '—'}</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><div style="font-size:11px;color:var(--text-secondary);margin-bottom:4px">🐝 KOLONİ GÜCÜ</div><span class="badge ${BM.T.statusCls(i.population === 'very_weak' || i.population === 'weak' ? 'danger' : i.population === 'medium' ? 'warning' : 'good')}">${BM.T.pop(i.population)}</span></div>
          </div>
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">📊 YAPILAN ÖLÇÜMLER</h4>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-2);margin-bottom:var(--space-4)">
            <div style="padding:var(--space-3);background:rgba(249,115,22,0.15);border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Yavru Ç.</div><div style="font-size:24px;font-weight:800;color:var(--orange)">${i.broodFrames}</div></div>
            <div style="padding:var(--space-3);background:rgba(245,158,11,0.15);border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Bal Ç.</div><div style="font-size:24px;font-weight:800;color:var(--honey-500)">${i.honeyFrames}</div></div>
            <div style="padding:var(--space-3);background:rgba(168,85,247,0.12);border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Polen Ç.</div><div style="font-size:24px;font-weight:800;color:#a855f7">${i.pollenFrames}</div></div>
            <div style="padding:var(--space-3);background:${i.varroaCount >= 6 ? 'rgba(239,68,68,0.2)' : i.varroaCount >= 3 ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.15)'};border-radius:8px;text-align:center"><div style="font-size:11px;color:var(--text-secondary)">Varroa</div><div style="font-size:24px;font-weight:800;color:${i.varroaCount >= 6 ? 'var(--danger)' : i.varroaCount >= 3 ? 'var(--warning)' : 'var(--success)'};font-weight:700">${i.varroaCount}</div></div>
          </div>
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">🔍 GÖZLEMLER</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);margin-bottom:var(--space-4);font-size:13px">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><strong>👑 Ana Arı:</strong> ${i.queenSeen === 'seen' ? '✅ Görüldü' : i.queenSeen === 'absent' ? '❌ YOK' : '❓ Bilinmiyor'}</div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px"><strong>🥚 Yumurta:</strong> ${i.eggsPattern === 'regular' ? '✅ Düzenli' : i.eggsPattern === 'irregular' ? '⚠️ Düzensiz' : '❌ Yok'}</div>
          </div>
          ${i.notes ? `
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">📝 NOTLAR</h4>
          <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:8px;margin-bottom:var(--space-4);white-space:pre-wrap;font-size:13px">${BM.esc(i.notes)}</div>
          ` : ''}
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">📷 FOTOĞRAFLAR (${i.photos ? i.photos.length : 0})</h4>
          <div style="margin-bottom:var(--space-4)">${photoHtml}</div>
          ${audioHtml ? `<h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">🎙 SES KAYDI</h4>${audioHtml}` : ''}
          <h4 style="font-size:13px;margin-bottom:var(--space-2);color:var(--text-secondary)">🤖 AI ANOMALİ TESPİTİ</h4>
          ${anomalyHtml}
          ${comparisonHtml}
        </div>`,
        () => {}
      );
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

  };

  BM.inspections = inspectionsModule;
})(window);

