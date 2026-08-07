(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var settingsModule = {
    render() {
      const userEmail = (BM.Auth && BM.Auth.getUser) ? BM.Auth.getUser()?.email : null;
      const defaultDesc = userEmail ? `${userEmail} · ${BM.Storage.list('apiaries').length} üs` : 'Giriş yapmadan kullanabilirsiniz';
      const items = [
        { icon: '👤', name: 'Kullanıcı', desc: userEmail || 'Giriş yapmamış · Misafir modu' },
        { icon: '🔔', name: 'Bildirim Tercihleri', desc: 'Varroa, stok, ana arı uyarıları', fn: 'BM.notify.show()' },
        { icon: '📱', name: 'PWA Yükle', desc: 'Telefon/PC ana ekrana ekle', fn: 'BM.pwa.install()' },
        { icon: '🌍', name: 'Konum', desc: 'GPS ile otomatik konum', fn: 'BM.utils.useLocation()' },
        { icon: '🔄', name: 'Onboarding', desc: 'Tanıtım sihirbazını tekrar aç', fn: 'BM.onboarding.show()' },
        { icon: '🎨', name: 'Tema & Görünüm', desc: 'Koyu/Açık mod', fn: 'App.toggleTheme()' },
        { icon: '🔔', name: 'Bildirim Kontrolü', desc: 'Tüm aktif uyarıları şimdi kontrol et', fn: 'BM.notify.check()' },
        { icon: 'ℹ️', name: 'Hakkında', desc: 'BeeMaster AI v2.0 · Spec-Driven PWA' }
      ];
      return `<div class="actions-bar"><div><h2 style="font-size:18px;font-weight:700">Ayarlar</h2><div style="color:var(--text-secondary);font-size:12px;margin-top:2px">Uygulama ve hesap</div></div></div>
      <div class="grid-3">${items.map(s => `<div class="card" style="cursor:pointer" onclick="${s.fn || 'void(0)'}">
        <div style="display:flex;align-items:center;gap:var(--space-3)">
          <div style="width:42px;height:42px;border-radius:var(--r-lg);background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:20px">${s.icon}</div>
          <div><div style="font-size:14px;font-weight:700">${BM.esc(s.name)}</div><div style="font-size:11.5px;color:var(--text-secondary)">${BM.esc(s.desc)}</div></div>
        </div>
      </div>`).join('')}</div>
      <div class="card" style="margin-top:var(--space-4)">
        <div class="card-title">Veri Yönetimi</div>
        <div style="display:flex;gap:var(--space-2);margin-top:var(--space-3);flex-wrap:wrap">
          <button class="btn" onclick="App.exportData()">📥 JSON Dışa Aktar</button>
          <button class="btn" onclick="App.importData()">📤 JSON İçe Aktar</button>
          <button class="btn btn--danger" onclick="App.resetData()">🗑️ Tüm Veriyi Sıfırla</button>
          <button class="btn btn--danger" onclick="App.resetCloudData()">☁️ Bulut Verisini Sıfırla</button>
        </div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:var(--space-2)">
          Bulut verisi: giriş yaptığınız hesaptaki tüm verileri sunucudan siler
        </div>
      </div>`;
    }
  };

  // ============ ONBOARDING ============

  BM.settings = settingsModule;
})(window);
