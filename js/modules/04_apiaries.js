/* ===== js/modules/apiaries.js ===== */
// ============================================================
// Apiaries Module — Spec 05_Modules/Apiaries.md
// P0: CRUD + harita + üs bazlı özet
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const apiariesModule = {
    // ============ CRUD ============
    add() {
      BM.Modal.open('Yeni Arı Üssü',
        `<label class="field"><span class="field-label">Üs Adı *</span>
          <input class="input" name="name" required placeholder="Örn: Çınar Üssü"></label>
         <label class="field"><span class="field-label">Konum / Bölge</span>
          <input class="input" id="ap-loc-input" name="location" placeholder="Örn: Eğil, Diyarbakır (veya koordinat yapıştırın)" oninput="BM.apiaries.onLocationInput(this.value)">
         </label>
         
         <div style="background:var(--bg-tertiary);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3)">
           <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
             <span style="font-size:12px;font-weight:600;color:var(--text-primary)">📍 Koordinatlar (Elle girilebilir / Opsiyonel)</span>
             <button type="button" id="ap-gps-btn" class="btn btn--sm btn--primary" onclick="BM.apiaries.gpsCapture()" style="font-size:11px;padding:4px 10px" title="Cihaz GPS'i ile otomatik al">📍 GPS ile Al</button>
           </div>
           <div class="field-row" style="margin-bottom:0">
             <label class="field" style="margin-bottom:0"><span class="field-label" style="font-size:11px">Enlem (Latitude)</span>
               <input class="input" id="ap-lat-input" name="lat" type="text" inputmode="decimal" placeholder="Örn: 38.247123" oninput="BM.apiaries.cleanCoordInput(this)"></label>
             <label class="field" style="margin-bottom:0"><span class="field-label" style="font-size:11px">Boylam (Longitude)</span>
               <input class="input" id="ap-lng-input" name="lng" type="text" inputmode="decimal" placeholder="Örn: 40.135456" oninput="BM.apiaries.cleanCoordInput(this)"></label>
           </div>
           <div style="font-size:10px;color:var(--text-muted);margin-top:6px">💡 Koordinat veya konum girdiğinizde yapay zeka bölge florasını otomatik çıkaracaktır.</div>
         </div>

         <label class="field">
           <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
             <span class="field-label" style="margin-bottom:0">Flora & Mera Bitkileri</span>
             <button type="button" class="btn btn--sm btn--ghost" onclick="BM.apiaries.triggerFloraAI()" style="font-size:11px;color:var(--honey-500);padding:2px 8px;border:1px solid rgba(245,158,11,0.3);border-radius:4px" title="Yapay zeka ile konuma göre florayı otomatik çıkar">✨ AI Flora Analizi</button>
           </div>
           <input class="input" id="ap-flora-input" name="flora" placeholder="Geven, Kekik, Pamuk, Adaçayı">
           <div id="ap-flora-badge" style="font-size:11px;color:var(--honey-400);margin-top:5px;display:none;background:rgba(245,158,11,0.08);padding:6px 10px;border-radius:6px;border:1px dashed rgba(245,158,11,0.3);line-height:1.4"></div>
         </label>
         <label class="field"><span class="field-label">Notlar</span>
          <textarea class="textarea" name="notes" rows="2" placeholder="Üs hakkında genel notlar..."></textarea></label>`,
        (d) => {
          let lat = d.lat ? parseFloat(String(d.lat).replace(',', '.')) : null;
          let lng = d.lng ? parseFloat(String(d.lng).replace(',', '.')) : null;
          if (isNaN(lat)) lat = null;
          if (isNaN(lng)) lng = null;
          d.lat = lat;
          d.lng = lng;
          if (!d.location || !d.location.trim()) {
            if (lat && lng) {
              d.location = lat.toFixed(4) + ', ' + lng.toFixed(4);
            } else {
              d.location = d.name || 'Konum belirtilmedi';
            }
          }
          BM.Storage.add('apiaries', d);
          BM.Toast.show('Üs eklendi ✓', 'success');
          App.render('apiaries');
          return true;
        }
      );
    },

    edit(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      BM.Modal.open('Üs Düzenle — ' + a.name,
        `<label class="field"><span class="field-label">Üs Adı *</span>
           <input class="input" name="name" required value="${BM.esc(a.name)}"></label>
         <label class="field"><span class="field-label">Konum / Bölge</span>
           <input class="input" id="ap-loc-input" name="location" value="${BM.esc(a.location || '')}" placeholder="Örn: Çınar, Diyarbakır" oninput="BM.apiaries.onLocationInput(this.value)">
         </label>

         <div style="background:var(--bg-tertiary);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3)">
           <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--space-2)">
             <span style="font-size:12px;font-weight:600;color:var(--text-primary)">📍 Koordinatlar (Elle girilebilir / Opsiyonel)</span>
             <button type="button" id="ap-gps-btn" class="btn btn--sm btn--primary" onclick="BM.apiaries.gpsCapture()" style="font-size:11px;padding:4px 10px">📍 GPS ile Al</button>
           </div>
           <div class="field-row" style="margin-bottom:0">
             <label class="field" style="margin-bottom:0"><span class="field-label" style="font-size:11px">Enlem (Latitude)</span>
               <input class="input" id="ap-lat-input" name="lat" type="text" inputmode="decimal" value="${a.lat !== undefined && a.lat !== null ? a.lat : ''}" placeholder="Örn: 38.247123" oninput="BM.apiaries.cleanCoordInput(this)"></label>
             <label class="field" style="margin-bottom:0"><span class="field-label" style="font-size:11px">Boylam (Longitude)</span>
               <input class="input" id="ap-lng-input" name="lng" type="text" inputmode="decimal" value="${a.lng !== undefined && a.lng !== null ? a.lng : ''}" placeholder="Örn: 40.135456" oninput="BM.apiaries.cleanCoordInput(this)"></label>
           </div>
         </div>

         <label class="field">
           <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
             <span class="field-label" style="margin-bottom:0">Flora & Mera Bitkileri</span>
             <button type="button" class="btn btn--sm btn--ghost" onclick="BM.apiaries.triggerFloraAI()" style="font-size:11px;color:var(--honey-500);padding:2px 8px;border:1px solid rgba(245,158,11,0.3);border-radius:4px" title="Yapay zeka ile konuma göre florayı otomatik çıkar">✨ AI Flora Analizi</button>
           </div>
           <input class="input" id="ap-flora-input" name="flora" value="${BM.esc(a.flora || '')}">
           <div id="ap-flora-badge" style="font-size:11px;color:var(--honey-400);margin-top:5px;display:none;background:rgba(245,158,11,0.08);padding:6px 10px;border-radius:6px;border:1px dashed rgba(245,158,11,0.3);line-height:1.4"></div>
         </label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(a.notes || '')}</textarea></label>`,
        (d) => {
          let lat = d.lat ? parseFloat(String(d.lat).replace(',', '.')) : null;
          let lng = d.lng ? parseFloat(String(d.lng).replace(',', '.')) : null;
          if (isNaN(lat)) lat = null;
          if (isNaN(lng)) lng = null;
          d.lat = lat;
          d.lng = lng;
          if (!d.location || !d.location.trim()) {
            if (lat && lng) {
              d.location = lat.toFixed(4) + ', ' + lng.toFixed(4);
            } else {
              d.location = d.name || 'Konum belirtilmedi';
            }
          }
          BM.Storage.update('apiaries', id, d);
          BM.Toast.show('Üs güncellendi ✓', 'success');
          App.render('apiaries');
          return true;
        }
      );
    },

    // AI Flora Motorunu tetikleme ve otomatik doldurma
    autoDetectFlora(silent = false) {
      const latInput = document.getElementById('ap-lat-input');
      const lngInput = document.getElementById('ap-lng-input');
      const locInput = document.getElementById('ap-loc-input');
      const floraInput = document.getElementById('ap-flora-input');
      const badge = document.getElementById('ap-flora-badge');

      if (!floraInput) return;

      const rawLat = latInput ? latInput.value : '';
      const rawLng = lngInput ? lngInput.value : '';
      const locText = locInput ? locInput.value : '';

      let lat = rawLat ? parseFloat(String(rawLat).replace(',', '.')) : null;
      let lng = rawLng ? parseFloat(String(rawLng).replace(',', '.')) : null;
      if (isNaN(lat)) lat = null;
      if (isNaN(lng)) lng = null;

      if (!lat && !lng && !locText.trim()) return;

      const pred = BM.Flora.predict(lat, lng, locText);
      if (pred && pred.flora) {
        floraInput.value = pred.flora;
        if (badge) {
          badge.style.display = 'block';
          badge.innerHTML = `🌿 <b>${pred.name} Florası:</b> ${pred.nectarFlow}`;
        }
        if (!silent) {
          BM.Toast.show(`🌿 AI Flora: ${pred.name} tespit edildi`, 'success');
        }
      }
    },

    triggerFloraAI() {
      this.autoDetectFlora(false);
    },

    // Koordinat yapıştırma & ayrıştırma yardımcısı
    onLocationInput(val) {
      if (!val) return;
      const trimmed = val.trim();
      // Örnek: "38.247123, 40.135456" veya "38,247123, 40,135456" veya "38.247123 40.135456"
      const match = trimmed.match(/^([-+]?\d+[.,]?\d*)[,\s]+([-+]?\d+[.,]?\d*)$/);
      if (match) {
        const lat = parseFloat(match[1].replace(',', '.'));
        const lng = parseFloat(match[2].replace(',', '.'));
        if (!isNaN(lat) && !isNaN(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
          const latInput = document.getElementById('ap-lat-input');
          const lngInput = document.getElementById('ap-lng-input');
          if (latInput) latInput.value = lat.toFixed(6);
          if (lngInput) lngInput.value = lng.toFixed(6);
          BM.Toast.show('Koordinatlar algılandı: ' + lat.toFixed(4) + ', ' + lng.toFixed(4), 'info');
        }
      }
      clearTimeout(this._floraDebounce);
      this._floraDebounce = setTimeout(() => this.autoDetectFlora(true), 350);
    },

    cleanCoordInput(el) {
      if (!el || !el.value) return;
      const val = el.value.trim();
      // Eğer kullanıcı iki koordinatı birden aynı kutucuğa yapıştırdıysa (örn "38.24, 40.13")
      if (val.includes(',') && val.split(',').length === 2 && !val.match(/^[-+]?\d+,\d+$/)) {
        const parts = val.split(',');
        const lat = parseFloat(parts[0].trim().replace(',', '.'));
        const lng = parseFloat(parts[1].trim().replace(',', '.'));
        if (!isNaN(lat) && !isNaN(lng)) {
          const latInput = document.getElementById('ap-lat-input');
          const lngInput = document.getElementById('ap-lng-input');
          if (latInput) latInput.value = lat;
          if (lngInput) lngInput.value = lng;
        }
      }
      clearTimeout(this._floraDebounce);
      this._floraDebounce = setTimeout(() => this.autoDetectFlora(true), 350);
    },

    // GPS ile otomatik konum yakala (OPSİYONEL)
    gpsCapture() {
      const btn = document.getElementById('ap-gps-btn');
      if (btn) { btn.disabled = true; btn.textContent = '⏳ Alınıyor...'; }
      if (!navigator.geolocation) {
        BM.Toast.show('Tarayıcı GPS desteklemiyor. Lütfen koordinatları elle giriniz.', 'error');
        if (btn) { btn.disabled = false; btn.textContent = '📍 GPS ile Al'; }
        return;
      }
      BM.Toast.show('GPS sinyali aranıyor...', 'info');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy);
          const latInput = document.getElementById('ap-lat-input');
          const lngInput = document.getElementById('ap-lng-input');
          const locInput = document.getElementById('ap-loc-input');
          if (latInput) latInput.value = lat.toFixed(6);
          if (lngInput) lngInput.value = lng.toFixed(6);
          fetch('https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&accept-language=tr')
            .then(r => r.json())
            .then(data => {
              const addr = data.address || {};
              const parts = [addr.village || addr.town || addr.city_district || addr.county || addr.city, addr.city || addr.state, addr.country].filter(Boolean);
              const loc = parts.join(', ') || (lat.toFixed(4) + ', ' + lng.toFixed(4));
              if (locInput && (!locInput.value || locInput.value.includes(',') || locInput.value.startsWith('3') || locInput.value.startsWith('4'))) {
                locInput.value = loc;
              }
              BM.Toast.show('GPS: ' + loc + ' (±' + acc + 'm)', 'success');
              BM.apiaries.autoDetectFlora(false);
            })
            .catch(() => {
              if (locInput && !locInput.value) locInput.value = lat.toFixed(4) + ', ' + lng.toFixed(4);
              BM.Toast.show('GPS koordinatı alındı (±' + acc + 'm)', 'success');
              BM.apiaries.autoDetectFlora(false);
            });
          if (btn) { btn.disabled = false; btn.textContent = '✅ GPS Alındı'; }
        },
        (err) => {
          let msg = 'GPS alınamadı';
          if (err.code === 1) msg = 'GPS izni verilmedi (koordinatları elle girebilirsiniz)';
          else if (err.code === 2) msg = 'GPS sinyali bulunamadı (elle girebilirsiniz)';
          else if (err.code === 3) msg = 'GPS zaman aşımı (elle girebilirsiniz)';
          BM.Toast.show(msg, 'info');
          if (btn) { btn.disabled = false; btn.textContent = '📍 GPS ile Al'; }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    },

    del(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      const hiveCount = BM.Storage.list('hives').filter(h => h.apiaryId === id).length;
      if (hiveCount > 0) {
        BM.Toast.show(`Bu üsde ${hiveCount} kovan var. Önce kovanları taşıyın/silin.`, 'error');
        return;
      }
      BM.Modal.confirm(`"${a.name}" üssünü silmek istiyor musunuz?`, () => {
        BM.Storage.remove('apiaries', id);
        BM.Toast.show('Üs silindi', 'info');
        App.render('apiaries');
      });
    },

    archive(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      const newStatus = !a.archived;
      BM.Modal.confirm(`"${a.name}" üssünü ${newStatus ? 'arşivlemek' : 'arşivden çıkarmak'} istiyor musunuz?`, () => {
        BM.Storage.update('apiaries', id, { archived: newStatus });
        BM.Toast.show(newStatus ? 'Üs arşivlendi' : 'Üs arşivden çıkarıldı', 'info');
        App.render('apiaries');
      });
    },

    // AP-03: Kovan tasima
    move(id) {
      const a = BM.Storage.get('apiaries', id);
      if (!a) return;
      const hives = BM.Storage.list('hives').filter(h => h.apiaryId === id);
      if (!hives.length) { BM.Toast.show('Bu üsde kovan yok', 'error'); return; }
      const otherApiaries = BM.Storage.list('apiaries').filter(x => x.id !== id && !x.archived);
      if (!otherApiaries.length) { BM.Toast.show('Başka aktif üs yok', 'error'); return; }

      BM.Modal.open('🚚 Kovan Taşı — ' + a.name,
        `<label class="field"><span class="field-label">Hedef Üs *</span>
           <select class="select" name="targetApiaryId" required>
             ${otherApiaries.map(x => `<option value="${x.id}">${BM.esc(x.name)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Taşınacak Kovanlar</span>
           <div style="max-height:200px;overflow-y:auto;background:var(--bg-tertiary);padding:var(--space-2);border-radius:var(--radius-md)">
             ${hives.map(h => `<label style="display:flex;align-items:center;gap:var(--space-2);padding:6px;cursor:pointer"><input type="checkbox" name="hiveIds" value="${h.id}" checked>${BM.esc(h.name)} <span style="font-size:11px;color:var(--text-secondary)">(${h.frameCount} çerçeve)</span></label>`).join('')}
           </div></label>
         <label class="field"><span class="field-label">Taşıma Notu</span>
           <textarea class="textarea" name="note" rows="2" placeholder="Mesafe, süre, kontrol listesi..."></textarea></label>`,
        (d) => {
          const ids = Array.isArray(d.hiveIds) ? d.hiveIds : (d.hiveIds ? [d.hiveIds] : []);
          const target = BM.Storage.get('apiaries', d.targetApiaryId);
          if (!target || !ids.length) { BM.Toast.show('En az bir kovan seçin', 'error'); return false; }
          ids.forEach(hid => {
            BM.Storage.update('hives', hid, { apiaryId: target.id });
          });
          BM.Toast.show(ids.length + ' kovan ' + target.name + ' üssüne taşındı ✓', 'success');
          App.render('apiaries');
          return true;
        }
      );
    },

    // ============ RENDER ============
    render(view = 'list') {
      this._currentView = view;
      const list = BM.Storage.list('apiaries');
      const withCoords = list.filter(a => a.lat && a.lng);
      const totalHives = BM.Storage.list('hives').length;
      const totalHoney = BM.Storage.list('harvests').reduce((s, h) => s + h.weight, 0);
      const lowStock = BM.Storage.list('inventory').filter(i => i.quantity <= i.minStock).length;

      const header = `
        <div class="actions-bar">
          <div>
            <h2 style="font-size:18px;font-weight:700">Arı Üsleri</h2>
            <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} üs · ${totalHives} kovan · ${BM.fmt(totalHoney)} kg bal</div>
          </div>
          <div style="display:flex;gap:var(--space-2)">
            <div class="view-toggle">
              <button type="button" class="view-toggle__btn ${view === 'list' ? 'view-toggle__btn--active' : ''}" onclick="App.render('apiaries', 'list')">📋 Liste</button>
              <button type="button" class="view-toggle__btn ${view === 'map' ? 'view-toggle__btn--active' : ''}" onclick="App.render('apiaries', 'map')">🗺 Harita</button>
            </div>
            <button class="btn btn--primary" onclick="BM.apiaries.add()">+ Yeni Üs</button>
          </div>
        </div>
      `;

      const stats = `
        <div class="stats-grid">
          <div class="stat">
            <div class="stat__icon stat__icon--honey">${BM.Icons.apiaries}</div>
            <div class="stat__label">Toplam Üs</div>
            <div class="stat__value">${list.length}</div>
            <div class="stat__meta">${withCoords.length} GPS'li</div>
          </div>
          <div class="stat">
            <div class="stat__icon stat__icon--success">${BM.Icons.hives}</div>
            <div class="stat__label">Toplam Kovan</div>
            <div class="stat__value">${totalHives}</div>
            <div class="stat__meta">${list.filter(a => !a.archived).length} aktif üste</div>
          </div>
          <div class="stat">
            <div class="stat__icon stat__icon--info">${BM.Icons.honey}</div>
            <div class="stat__label">Toplam Bal</div>
            <div class="stat__value">${BM.fmt(totalHoney)} kg</div>
            <div class="stat__meta">Üs bazlı</div>
          </div>
          <div class="stat">
            <div class="stat__icon stat__icon--warning">${BM.Icons.inventory}</div>
            <div class="stat__label">Stok Uyarısı</div>
            <div class="stat__value">${lowStock}</div>
            <div class="stat__meta ${lowStock > 0 ? 'stat__meta--down' : ''}">${lowStock > 0 ? 'Sipariş ver' : 'Tam'}</div>
          </div>
        </div>
      `;

      if (view === 'map') {
        setTimeout(() => this._initMap(), 100);
        return header + `<div id="ap-map" class="map-container"></div>` + stats +
          this._renderList();
      }

      return header + stats + this._renderList();
    },

    _renderList() {
      const list = BM.Storage.list('apiaries');
      if (!list.length) {
        return `<div class="card" style="margin-top:var(--space-4)">
          <div class="empty">
            <div class="empty__icon">${BM.Icons.apiaries}</div>
            <div class="empty__title">Henüz üs yok</div>
            <div class="empty__sub">İlk üssünü ekleyerek başla</div>
            <button class="btn btn--primary" onclick="BM.apiaries.add()">+ Yeni Üs</button>
          </div>
        </div>`;
      }
      return `<div style="display:flex;flex-direction:column;gap:var(--space-3);margin-top:var(--space-4)">${list.map(a => {
        const hc = BM.Storage.list('hives').filter(h => h.apiaryId === a.id).length;
        const totalHoney = BM.Storage.list('harvests').filter(h => h.apiaryId === a.id).reduce((s, h) => s + h.weight, 0);
        const avgHoney = hc > 0 ? (totalHoney / hc).toFixed(1) : 0;
        const recentInsp = BM.Storage.list('inspections').filter(i => {
          const hive = BM.Storage.get('hives', i.hiveId);
          return hive && hive.apiaryId === a.id;
        }).sort((a, b) => b.date.localeCompare(a.date))[0];
        const alerts = BM.Storage.list('inspections').filter(i => {
          const hive = BM.Storage.get('hives', i.hiveId);
          return hive && hive.apiaryId === a.id && i.varroaCount >= 6;
        }).length;
        return `<div class="card">
          <div class="row-list__item" style="border:none">
            <div class="row-list__dot ${a.archived ? 'row-list__dot--y' : 'row-list__dot--g'}"></div>
            <div class="row-list__main">
              <div class="row-list__name">
                ${BM.esc(a.name)}
                ${a.archived ? '<span class="badge badge--warn">Arşiv</span>' : ''}
                <span class="badge badge--info">${hc} kovan</span>
                ${alerts ? `<span class="badge badge--danger">${alerts} uyarı</span>` : ''}
              </div>
              <div class="row-list__info">
                📍 ${BM.esc(a.location)}${a.lat && a.lng ? ` · GPS: ${Number(a.lat).toFixed(3)}, ${Number(a.lng).toFixed(3)}` : ''}${a.flora ? ` · 🌸 ${BM.esc(a.flora)}` : ''}
              </div>
              ${a.notes ? `<div class="row-list__info" style="font-style:italic;margin-top:2px">"${BM.esc(a.notes)}"</div>` : ''}
            </div>
            <div style="text-align:right;min-width:110px;flex-shrink:0">
              <div style="font-size:16px;font-weight:700;color:var(--honey-500)">${BM.fmt(totalHoney)} kg</div>
              <div style="font-size:10px;color:var(--text-secondary)">${hc > 0 ? avgHoney + ' kg/kovan ort.' : 'kovan yok'}</div>
              ${recentInsp ? `<div style="font-size:10px;color:var(--text-muted);margin-top:2px">Son muayene: ${BM.dateAgo(recentInsp.date)}</div>` : ''}
            </div>
            <div class="row-list__actions">
              <button class="btn btn--sm" onclick="BM.apiaries.move('${a.id}')" title="Kovan Taşı">🚚</button>
              <button class="btn btn--sm" onclick="BM.apiaries.archive('${a.id}')" title="${a.archived ? 'Arşivden Çıkar' : 'Arşivle'}">📦</button>
              <button class="btn btn--sm" onclick="BM.apiaries.edit('${a.id}')">Düzenle</button>
              <button class="btn btn--sm btn--danger" onclick="BM.apiaries.del('${a.id}')">Sil</button>
            </div>
          </div>
        </div>`;
      }).join('')}</div>`;
    },

    // AP-01: Leaflet harita
    _initMap() {
      const el = document.getElementById('ap-map');
      if (!el) return;
      if (!window.L) {
        el.innerHTML = '<div class="empty"><div class="empty__icon">🗺</div><div class="empty__title">Harita yüklenemedi</div><div class="empty__sub">İnternet bağlantısını kontrol et</div></div>';
        return;
      }
      // Onceki haritayi temizle
      if (this._mapInstance) {
        this._mapInstance.remove();
        this._mapInstance = null;
      }
      const withCoords = BM.Storage.list('apiaries').filter(a => a.lat && a.lng);
      if (!withCoords.length) {
        el.innerHTML = '<div class="empty"><div class="empty__icon">📍</div><div class="empty__title">Koordinatlı üs yok</div><div class="empty__sub">Üs eklerken Enlem/Boylam girersen haritada görünür</div></div>';
        return;
      }
      const center = [withCoords[0].lat, withCoords[0].lng];
      this._mapInstance = L.map(el, { zoomControl: true }).setView(center, 11);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18
      }).addTo(this._mapInstance);
      withCoords.forEach(a => {
        const hc = BM.Storage.list('hives').filter(h => h.apiaryId === a.id).length;
        const honey = BM.Storage.list('harvests').filter(h => h.apiaryId === a.id).reduce((s, h) => s + h.weight, 0);
        const marker = L.marker([a.lat, a.lng]).addTo(this._mapInstance);
        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:200px">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px">📍 ${BM.esc(a.name)}</div>
            <div style="font-size:12px;color:#666;margin-bottom:8px">${BM.esc(a.location)}</div>
            <div style="font-size:11px">${hc} kovan · ${BM.fmt(honey)} kg bal</div>
            <div style="margin-top:8px;display:flex;gap:4px">
              <button onclick="App.render('hives');BM.apiaries.closeMap()" style="padding:6px 10px;background:#f59e0b;color:#000;border:none;border-radius:4px;cursor:pointer;font-size:11px;font-weight:600">Kovanlar</button>
              <button onclick="BM.apiaries.edit('${a.id}');BM.apiaries.closeMap()" style="padding:6px 10px;background:#262626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:11px">Düzenle</button>
            </div>
          </div>
        `);
      });
      if (withCoords.length > 1) {
        const bounds = L.latLngBounds(withCoords.map(a => [a.lat, a.lng]));
        this._mapInstance.fitBounds(bounds, { padding: [40, 40] });
      }
    },

    closeMap() {
      if (this._mapInstance) {
        this._mapInstance.remove();
        this._mapInstance = null;
      }
    }
  };

  // ============================================================
  // Flora & Climate AI Engine — Obsidian / NotebookLM Expert Model
  // ============================================================
  const FloraEngine = {
    regions: [
      {
        id: 'egil_diyarbakir',
        name: 'Diyarbakır (Eğil & Fırat Vadisi)',
        keywords: ['eğil', 'egil', 'dicle', 'hani', 'beyaztoprak', 'selman', 'kayaş', 'kalkan'],
        center: { lat: 38.25, lng: 40.14 },
        bounds: { minLat: 38.05, maxLat: 38.55, minLng: 39.85, maxLng: 40.50 },
        flora: 'Geven (Astragalus), Dağ Kekiği (Thymus), Adaçayı, Badem, Kayısı, Kenger, Yabani Hardal',
        nectarFlow: 'Mayıs sonu - Haziran Geven zirvesi, Temmuz Kekik aromatik nektar akımı',
        icon: '🌸'
      },
      {
        id: 'diyarbakir_sur_cinar',
        name: 'Diyarbakır (Sur, Çınar & Karacadağ Bozkırı)',
        keywords: ['diyarbakır', 'diyarbakir', 'sur', 'çınar', 'cinar', 'ergani', 'bismil', 'silvan', 'karacadağ', 'karacadag', 'bağlar', 'kayapınar', 'yenişehir'],
        center: { lat: 37.91, lng: 40.23 },
        bounds: { minLat: 37.40, maxLat: 38.70, minLng: 39.40, maxLng: 41.30 },
        flora: 'Geven, Dağ Kekiği, Pamuk, Ayçiçeği, Kenger, Devedikeni, Yabani Fiğ',
        nectarFlow: 'Haziran-Temmuz Geven & Bozkır Çiçekleri, Ağustos Pamuk (3km dikkat)',
        icon: '🌾'
      },
      {
        id: 'batman_siirt_mardin',
        name: 'Güneydoğu Toros & Mezopotamya (Siirt, Batman, Mardin)',
        keywords: ['siirt', 'pervari', 'batman', 'sason', 'mardin', 'midyat', 'nusaybin', 'şırnak', 'sirnak', 'cizre', 'derik'],
        center: { lat: 37.93, lng: 41.94 },
        bounds: { minLat: 36.90, maxLat: 38.50, minLng: 40.50, maxLng: 43.50 },
        flora: 'Pervari Yüksek Dağ Florası, Geven, Meşe Salgısı, Menengiç, Dağ Kekiği, Badem',
        nectarFlow: 'Haziran-Temmuz Yüksek Yayla Geveni & Pervari Balı Akımı',
        icon: '🏔️'
      },
      {
        id: 'mugla_ege_cam',
        name: 'Muğla & Ege Çam Florası',
        keywords: ['muğla', 'mugla', 'marmaris', 'köyceğiz', 'koycegiz', 'milas', 'datça', 'datca', 'fethiye', 'ula', 'bodrum', 'yatağan', 'aydın', 'aydin', 'kuşadası'],
        center: { lat: 37.21, lng: 28.36 },
        bounds: { minLat: 36.50, maxLat: 37.80, minLng: 27.10, maxLng: 29.70 },
        flora: 'Çam Balı (Marchalina hellenica / Basra), Püren (Funda), Hayıt, Dağ Kekiği, Sandal Ağacı, Narenciye, Keçiboynuzu',
        nectarFlow: 'Ağustos-Ekim Basra Çam Salgısı Zirve, Mart-Nisan Narenciye, Sonbahar Püren',
        icon: '🌲'
      },
      {
        id: 'rize_artvin_anzer',
        name: 'Doğu Karadeniz & Anzer Yaylası Florası',
        keywords: ['rize', 'anzer', 'artvin', 'macahel', 'ikizdere', 'çamlıhemşin', 'camlihemsin', 'şavşat', 'savsat', 'ayder', 'yusufeli', 'trabzon', 'of', 'çaykara'],
        center: { lat: 40.98, lng: 40.52 },
        bounds: { minLat: 40.40, maxLat: 41.60, minLng: 39.50, maxLng: 42.40 },
        flora: 'Anzer Yayla Çiçekleri (450+ Tür), Kestane, Ormangülü (Komar), Ihlamur, Karakovan Çiçek Balı, Yabani Yabanmersini',
        nectarFlow: 'Haziran Kestane & Ihlamur, Temmuz Anzer Yayla Çiçekleri Zirve',
        icon: '🐝'
      },
      {
        id: 'antalya_mersin_akdeniz',
        name: 'Batı & Orta Akdeniz Florası',
        keywords: ['antalya', 'mersin', 'alanya', 'manavgat', 'kumluca', 'finike', 'anamur', 'silifke', 'tarsus', 'kaş', 'kas', 'kemer', 'gazipaşa', 'serik'],
        center: { lat: 36.88, lng: 30.70 },
        bounds: { minLat: 35.90, maxLat: 37.40, minLng: 29.20, maxLng: 35.20 },
        flora: 'Narenciye (Portakal/Limon Çiçeği), Toros Sedir Balı, Keçiboynuzu (Harnup), Dağ Kekiği, Sandal, Adaçayı, Okaliptüs',
        nectarFlow: 'Mart-Nisan Narenciye Akımı, Temmuz Toros Kekiği, Eylül-Ekim Keçiboynuzu & Sandal',
        icon: '🍊'
      },
      {
        id: 'trakya_marmara',
        name: 'Trakya & Marmara Ayçiçeği-Meşe Florası',
        keywords: ['edirne', 'tekirdağ', 'tekirdag', 'kırklareli', 'kirklareli', 'çorlu', 'corlu', 'keşan', 'kesan', 'lüleburgaz', 'ıstranca', 'bursa', 'yalova', 'balıkesir', 'çanakkale'],
        center: { lat: 41.67, lng: 26.55 },
        bounds: { minLat: 39.80, maxLat: 42.15, minLng: 25.80, maxLng: 29.50 },
        flora: 'Ayçiçeği (Helianthus), Kanola, Akasya, Meşe Salgısı (Istranca), Hardal, Kestane, Çayır Üçgülü',
        nectarFlow: 'Mayıs Kanola & Akasya, Temmuz-Ağustos Ayçiçeği Ana Akımı, Ağustos Meşe Salgısı',
        icon: '🌻'
      },
      {
        id: 'sivas_erzurum_kars',
        name: 'Doğu Anadolu Yüksek Yayla Florası',
        keywords: ['sivas', 'zara', 'erzurum', 'kars', 'ardahan', 'göle', 'ağrı', 'agri', 'van', 'bitlis', 'bingöl', 'bingol', 'hakkari', 'muş', 'mus', 'erzincan', 'malatya'],
        center: { lat: 39.75, lng: 37.01 },
        bounds: { minLat: 38.20, maxLat: 41.50, minLng: 36.00, maxLng: 44.60 },
        flora: 'Yüksek Yayla Geveni (Astragalus), Korunga, Dağ Kekiği, Çayır Üçgülü, Ballıbaba, Peygamber Çiçeği',
        nectarFlow: 'Haziran sonu - Temmuz Yüksek Rakım (1800-2400m) Kristal Çiçek Balı Akımı',
        icon: '🌺'
      },
      {
        id: 'isparta_burdur_lavanta',
        name: 'Göller Yöresi & Lavanta-Gül Florası',
        keywords: ['isparta', 'burdur', 'kuyucak', 'keçiborlu', 'keciborlu', 'eğirdir', 'egirdir', 'yalvaç', 'dinar', 'bucak'],
        center: { lat: 37.76, lng: 30.55 },
        bounds: { minLat: 37.20, maxLat: 38.60, minLng: 29.50, maxLng: 31.80 },
        flora: 'Lavanta (Lavandula), Yağ Gülü (Rosa damascena), Dağ Kekiği, Geven, Korunga, Meyve Bahçeleri',
        nectarFlow: 'Mayıs Gül Çiçeklenmesi, Temmuz Lavanta Monofloral Bal Akımı',
        icon: '💜'
      },
      {
        id: 'ic_anadolu_bozkir',
        name: 'İç Anadolu Bozkır & Geven Florası',
        keywords: ['konya', 'ankara', 'eskişehir', 'eskisehir', 'kayseri', 'aksaray', 'karaman', 'kırşehir', 'kirsehir', 'nevşehir', 'nevsehir', 'yozgat', 'niğde', 'nigde', 'çankırı'],
        center: { lat: 39.92, lng: 32.85 },
        bounds: { minLat: 37.00, maxLat: 40.80, minLng: 30.00, maxLng: 36.50 },
        flora: 'Bozkır Geveni, Korunga, Yonca, Ayçiçeği, Taş Yoncası, Çörek Otu, Papatya, Yabani Hardal',
        nectarFlow: 'Haziran Geven & Korunga Zirve, Temmuz Yonca & Ayçiçeği',
        icon: '🌾'
      },
      {
        id: 'bati_karadeniz_kestane',
        name: 'Batı Karadeniz Kestane & Ihlamur Florası',
        keywords: ['zonguldak', 'bartın', 'bartin', 'kastamonu', 'sinop', 'düzce', 'duzce', 'bolu', 'karabük', 'cide', 'inebolu', 'giresun', 'ordu', 'samsun'],
        center: { lat: 41.45, lng: 31.79 },
        bounds: { minLat: 40.50, maxLat: 42.10, minLng: 30.80, maxLng: 38.50 },
        flora: 'Kestane, Ihlamur, Orman Gülü, Meşe Balı, Böğürtlen, Yaban Mersini',
        nectarFlow: 'Haziran Kestane Zirvesi (Koyu, Enzim zengini), Temmuz Ihlamur',
        icon: '🌰'
      },
      {
        id: 'cukurova_guney',
        name: 'Çukurova & Doğu Akdeniz Florası',
        keywords: ['adana', 'hatay', 'osmaniye', 'iskenderun', 'antakya', 'ceyhan', 'kozan', 'kadirli', 'dörtyol'],
        center: { lat: 37.00, lng: 35.32 },
        bounds: { minLat: 35.80, maxLat: 37.80, minLng: 35.00, maxLng: 36.80 },
        flora: 'Narenciye, Pamuk, Okaliptüs, Geven, Dağ Kekiği, Defne, Çemen',
        nectarFlow: 'Mart-Nisan Narenciye Erken Gelişim, Ağustos Pamuk',
        icon: '🌿'
      }
    ],

    predict(lat, lng, locText) {
      const text = (locText || '').toLowerCase();
      // 1. Keyword search in location text
      if (text) {
        for (const reg of this.regions) {
          for (const kw of reg.keywords) {
            if (text.includes(kw)) {
              return { ...reg, matchType: 'location_keyword' };
            }
          }
        }
      }

      // 2. Coordinate search (Bounding Box)
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        for (const reg of this.regions) {
          if (lat >= reg.bounds.minLat && lat <= reg.bounds.maxLat &&
              lng >= reg.bounds.minLng && lng <= reg.bounds.maxLng) {
            return { ...reg, matchType: 'coordinate_bounds' };
          }
        }

        // 3. Nearest Center Distance
        let nearest = null;
        let minDist = Infinity;
        for (const reg of this.regions) {
          const dLat = lat - reg.center.lat;
          const dLng = lng - reg.center.lng;
          const dist = Math.sqrt(dLat * dLat + dLng * dLng);
          if (dist < minDist) {
            minDist = dist;
            nearest = reg;
          }
        }
        if (nearest && minDist < 3.5) {
          return { ...nearest, matchType: 'coordinate_distance' };
        }
      }

      // 4. Default Fallback
      return {
        id: 'default_anatolian',
        name: 'Anadolu Genel Florası',
        flora: 'Geven, Dağ Kekiği, Korunga, Üçgül, Yabani Bozkır Çiçekleri',
        nectarFlow: 'Mayıs-Temmuz Genel Nektar Akımı',
        icon: '🌸',
        matchType: 'default'
      };
    }
  };

  BM.Flora = FloraEngine;
  BM.apiaries = apiariesModule;
})(window);

