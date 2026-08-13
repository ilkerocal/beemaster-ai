(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var onboardingModule = {
    init() {
      if (localStorage.getItem('bm-onboarded')) return;
      setTimeout(() => this.show(), 500);
    },

    show() {
      BM.Modal.open('🐝 BeeMaster AI\'ye Hoş Geldiniz',
        `<div style="text-align:center;padding:var(--space-5) 0">
          <div style="font-size:64px;margin-bottom:var(--space-4)">🐝</div>
          <h2 style="margin-bottom:var(--space-2)">Arıcılık Yönetiminin Yeni Adı</h2>
          <p style="color:var(--text-secondary);font-size:13px;line-height:1.6;margin-bottom:var(--space-5)">
            BeeMaster AI ile kovanlarınızı, üslerinizi, muayenelerinizi ve hasadınızı tek yerden yönetin.<br>
            Offline çalışır, verileriniz cihazınızda güvenle saklanır.
          </p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);text-align:left">
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">🏠</div><div style="font-size:12px;font-weight:600">Kovan Yönetimi</div><div style="font-size:10px;color:var(--text-secondary)">Çerçeve haritası, ana arı</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">🤖</div><div style="font-size:12px;font-weight:600">AI Önerileri</div><div style="font-size:10px;color:var(--text-secondary)">Varroa, besleme, hasat</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">📱</div><div style="font-size:12px;font-weight:600">Offline-First</div><div style="font-size:10px;color:var(--text-secondary)">İnternetsiz çalışır</div></div>
            <div style="padding:var(--space-3);background:var(--bg-tertiary);border-radius:var(--r-lg)"><div style="font-size:20px;margin-bottom:4px">📊</div><div style="font-size:12px;font-weight:600">Analitik</div><div style="font-size:10px;color:var(--text-secondary)">Üs performansı</div></div>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:var(--space-2);padding-top:var(--space-4);border-top:1px solid var(--n-800);margin-top:var(--space-4)">
          <button type="button" class="btn btn--ghost" onclick="BM.onboarding.skip()">Atla</button>
          <button type="button" class="btn btn--primary" onclick="BM.onboarding.step2()">İleri →</button>
        </div>`,
        () => true
      );
    },

    step2() {
      BM.Modal.open('🐝 İlk Üssünü Oluştur',
        `<p style="font-size:13px;color:var(--text-secondary);margin-bottom:var(--space-4)">İlk arı üssünü oluşturarak başla. Konum eklemek haritada görünmesini sağlar.</p>
         <label class="field"><span class="field-label">Üs Adı *</span>
           <input class="input" name="name" required value="Eğil Merkez"></label>
         <label class="field"><span class="field-label">Konum *</span>
           <input class="input" name="location" required value="Eğil, Diyarbakır"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Enlem (Opsiyonel)</span>
             <input class="input" name="lat" type="text" inputmode="decimal" value="38.247"></label>
           <label class="field"><span class="field-label">Boylam (Opsiyonel)</span>
             <input class="input" name="lng" type="text" inputmode="decimal" value="40.135"></label>
         </div>
         <button type="button" class="btn" onclick="BM.onboarding.useLocation()" style="margin-top:var(--space-2);width:100%">📍 GPS ile Konumumu Al</button>
         <label class="field" style="margin-top:var(--space-3)"><span class="field-label">Flora</span>
           <input class="input" name="flora" value="Geven, Kekik, Adaçayı"></label>
         <div style="display:flex;justify-content:space-between;gap:var(--space-2);padding-top:var(--space-4);border-top:1px solid var(--n-800);margin-top:var(--space-4)">
           <button type="button" class="btn btn--ghost" onclick="BM.onboarding.show()">← Geri</button>
           <button type="button" class="btn btn--primary" onclick="BM.onboarding.create()">Üs Oluştur ✓</button>
         </div>`,
        () => true
      );
    },

    useLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            const latInput = document.querySelector('input[name="lat"]');
            const lngInput = document.querySelector('input[name="lng"]');
            const floraInput = document.querySelector('input[name="flora"]');
            if (latInput) latInput.value = lat.toFixed(6);
            if (lngInput) lngInput.value = lng.toFixed(6);
            if (BM.Flora && floraInput) {
              const pred = BM.Flora.predict(lat, lng, '');
              if (pred && pred.flora) floraInput.value = pred.flora;
            }
            BM.Toast.show('Konum ve AI Flora alındı ✓', 'success');
          },
          err => BM.Toast.show('Konum alınamadı (elle girebilirsiniz)', 'info')
        );
      }
    },

    create() {
      const get = sel => document.querySelector(sel);
      const name = get('input[name="name"]').value.trim();
      const location = get('input[name="location"]').value.trim();
      if (!name || !location) { BM.Toast.show('Ad ve konum gerekli', 'error'); return; }
      const rawLat = get('input[name="lat"]')?.value;
      const rawLng = get('input[name="lng"]')?.value;
      let lat = rawLat ? parseFloat(String(rawLat).replace(',', '.')) : null;
      let lng = rawLng ? parseFloat(String(rawLng).replace(',', '.')) : null;
      if (isNaN(lat)) lat = null;
      if (isNaN(lng)) lng = null;
      const newApiary = {
        name, location,
        lat, lng,
        flora: get('input[name="flora"]')?.value.trim() || '',
        notes: ''
      };
      const apiaryId = BM.Storage.add('apiaries', newApiary);
      BM.Storage.state.activeApiaryId = apiaryId;
      localStorage.setItem('bm-onboarded', '1');
      BM.Toast.show('İlk üs oluşturuldu ✓', 'success');
      BM.Modal.close();
      App.render('apiaries');
    },

    skip() {
      localStorage.setItem('bm-onboarded', '1');
      BM.Modal.close();
    }
  };

  // ============ NOTIFY ============

  BM.onboarding = onboardingModule;
})(window);
