(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var inventoryModule = {
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

  BM.inventory = inventoryModule;
})(window);
