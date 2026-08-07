(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var pwaModule = {
    deferredPrompt: null,
    init() {
      window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); this.deferredPrompt = e; });
      window.addEventListener('appinstalled', () => BM.Toast.show('BeeMaster AI yüklendi! 🎉', 'success'));
    },
    install() {
      if (this.deferredPrompt) {
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then(r => {
          if (r.outcome === 'accepted') BM.Toast.show('Yükleme başladı...', 'info');
          this.deferredPrompt = null;
        });
      } else {
        BM.Toast.show('Tarayıcı yüklemeyi desteklemiyor veya zaten yüklü', 'info');
      }
    }
  };

  // ============ UTILS extension ============
  const utilsExt = {
    useLocation() {
      if (!navigator.geolocation) { BM.Toast.show('Tarayıcı desteklemiyor', 'error'); return; }
      navigator.geolocation.getCurrentPosition(
        pos => BM.Toast.show(`Konum: ${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`, 'success'),
        err => BM.Toast.show('Konum alınamadı', 'error')
      );
    }
  };

  BM.pwa = pwaModule;
})(window);
