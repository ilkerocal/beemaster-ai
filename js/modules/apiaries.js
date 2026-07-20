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
         <label class="field"><span class="field-label">Konum *</span>
          <input class="input" name="location" required placeholder="Örn: Çınar, Diyarbakır"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Enlem</span>
             <input class="input" name="lat" type="number" step="0.001" placeholder="38.247"></label>
           <label class="field"><span class="field-label">Boylam</span>
             <input class="input" name="lng" type="number" step="0.001" placeholder="40.135"></label>
         </div>
         <label class="field"><span class="field-label">Flora</span>
           <input class="input" name="flora" placeholder="Geven, Kekik, Pamuk"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2"></textarea></label>`,
        (d) => {
          if (d.lat) d.lat = parseFloat(d.lat);
          if (d.lng) d.lng = parseFloat(d.lng);
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
         <label class="field"><span class="field-label">Konum *</span>
           <input class="input" name="location" required value="${BM.esc(a.location)}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Enlem</span>
             <input class="input" name="lat" type="number" step="0.001" value="${a.lat || ''}"></label>
           <label class="field"><span class="field-label">Boylam</span>
             <input class="input" name="lng" type="number" step="0.001" value="${a.lng || ''}"></label>
         </div>
         <label class="field"><span class="field-label">Flora</span>
           <input class="input" name="flora" value="${BM.esc(a.flora || '')}"></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(a.notes || '')}</textarea></label>`,
        (d) => {
          if (d.lat) d.lat = parseFloat(d.lat);
          if (d.lng) d.lng = parseFloat(d.lng);
          BM.Storage.update('apiaries', id, d);
          BM.Toast.show('Üs güncellendi ✓', 'success');
          App.render('apiaries');
          return true;
        }
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
                📍 ${BM.esc(a.location)}${a.lat && a.lng ? ` · GPS: ${a.lat.toFixed(3)}, ${a.lng.toFixed(3)}` : ''}${a.flora ? ` · 🌸 ${BM.esc(a.flora)}` : ''}
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

  BM.apiaries = apiariesModule;
})(window);
