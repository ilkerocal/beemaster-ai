(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var notifyModule = {
    prefs: null,
    load() {
      try {
        const saved = localStorage.getItem('bm-notify');
        this.prefs = saved ? JSON.parse(saved) : { varroaHigh: true, lowStock: true, queenOld: true, harvestDue: true };
      } catch (e) { this.prefs = { varroaHigh: true, lowStock: true, queenOld: true, harvestDue: true }; }
    },
    save() { try { localStorage.setItem('bm-notify', JSON.stringify(this.prefs)); } catch (e) {} },

    check() {
      this.load();
      const s = BM.Storage.state;
      if (this.prefs.varroaHigh) {
        s.hives.forEach(h => {
          const last = s.inspections.filter(i => i.hiveId === h.id).sort((a, b) => b.date.localeCompare(a.date))[0];
          if (last && last.varroaCount >= 6) BM.Toast.show(`🔔 ${h.name}: Varroa ${last.varroaCount} (kritik)`, 'warn');
        });
      }
      if (this.prefs.lowStock) {
        s.inventory.filter(i => i.quantity <= i.minStock).slice(0, 2).forEach(i => {
          BM.Toast.show(`🔔 ${i.name}: Stok az (${i.quantity} ${i.unit})`, 'warn');
        });
      }
    },

    show() {
      this.load();
      const p = this.prefs;
      BM.Modal.open('🔔 Bildirim Tercihleri',
        `<label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np1"${p.varroaHigh ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">🦠 Yüksek Varroa</div><div style="font-size:11px;color:var(--text-secondary)">Kovanlarda varroa 6+ olduğunda</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np2"${p.lowStock ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">📦 Düşük Stok</div><div style="font-size:11px;color:var(--text-secondary)">Envanter minimuma düştüğünde</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np3"${p.queenOld ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">👑 Ana Arı Yaşı</div><div style="font-size:11px;color:var(--text-secondary)">Ana arı 3+ yıl olduğunda</div></div></label>
         <label style="display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--radius-md);margin-bottom:var(--space-2);cursor:pointer"><input type="checkbox" id="np4"${p.harvestDue ? ' checked' : ''} style="width:auto"><div><div style="font-size:13px;font-weight:600">🍯 Hasat Zamanı</div><div style="font-size:11px;color:var(--text-secondary)">Son hasattan 30+ gün geçtiğinde</div></div></label>`,
        () => {
          this.prefs = {
            varroaHigh: document.getElementById('np1').checked,
            lowStock: document.getElementById('np2').checked,
            queenOld: document.getElementById('np3').checked,
            harvestDue: document.getElementById('np4').checked
          };
          this.save();
          BM.Toast.show('Bildirim tercihleri kaydedildi ✓', 'success');
          return true;
        }
      );
    }
  };

  // ============ PWA ============

  BM.notify = notifyModule;
})(window);
