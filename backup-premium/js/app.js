/* ============================================================
   BeeMaster AI — App entry
   ============================================================ */

(function () {
  'use strict';

  // Wait for DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  function boot() {
    // First-run: seed with a sample apiary if empty
    if (window.BeeDb.listApiaries().length === 0) {
      seedSample();
    }

    // Init router
    window.  Router.init();
  // Hatırlatıcı badge'ini ilk yükleme ve periyodik olarak güncelle
  function updateRemindersBadge() {
    if (!window.BeeReminders) return;
    try {
      const active = window.BeeReminders.getActive();
      const badge = document.getElementById('reminders-badge');
      if (badge) {
        badge.textContent = active.length;
        badge.style.display = active.length > 0 ? 'inline-block' : 'none';
      }
    } catch (e) { /* swallow */ }
  }
  setTimeout(updateRemindersBadge, 100);
  setInterval(updateRemindersBadge, 5 * 60 * 1000);
  window.addEventListener('hashchange', updateRemindersBadge);

    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {
        // SW is optional; offline mode degrades gracefully
      });
    }
  }

  function seedSample() {
    const apiary = window.BeeDb.addApiary({
      name: 'Eğil / Diyarbakır Arılığı',
      location: { region: 'TR-Diyarbakır-Eğil', coordinates: { lat: 38.24, lon: 40.10 } },
      owner: 'Arıcı',
      notes: 'Eğil örnek verileri — flora modülü ile entegre.',
    });
    // Default region ayarla
    window.BeeDb.updateSettings({ region: 'TR-Diyarbakir-Egil' });

    const h17 = window.BeeDb.addHive({
      apiaryId: apiary.id,
      label: 'H-17 (Anadolu)',
      hiveType: 'Langstroth',
      frames: 10,
      queenSubspecies: 'Anadolu arısı',
      queenInstalled: '2026-04-12',
      queenMarking: 'green',
      queenOrigin: 'Yerel yetiştirici',
    });

    const h22 = window.BeeDb.addHive({
      apiaryId: apiary.id,
      label: 'H-22 (Kafkas)',
      hiveType: 'Dadant',
      frames: 10,
      queenSubspecies: 'Kafkas arısı',
      queenInstalled: '2025-08-20',
      queenMarking: 'red',
    });

    const today = new Date();
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    window.BeeDb.addInspection({
      apiaryId: apiary.id, hiveId: h17.id,
      date: monthAgo.toISOString().slice(0, 10),
      framesOfBrood: 6, framesOfBees: 8, framesOfStores: 4,
      varroaPer100: 1.2, broodPattern: 'solid',
      queenSeen: true, eggsSeen: true,
      notes: 'İlkbahar kontrolü; ana arı işaretli.',
    });

    window.BeeDb.addInspection({
      apiaryId: apiary.id, hiveId: h17.id,
      date: today.toISOString().slice(0, 10),
      framesOfBrood: 7, framesOfBees: 9, framesOfStores: 5,
      varroaPer100: 2.1, broodPattern: 'solid',
      queenSeen: true, eggsSeen: true,
      notes: 'Yaz kontrolü; süper eklendi.',
    });

    window.BeeDb.addInspection({
      apiaryId: apiary.id, hiveId: h22.id,
      date: monthAgo.toISOString().slice(0, 10),
      framesOfBrood: 4, framesOfBees: 6, framesOfStores: 6,
      varroaPer100: 0.8, broodPattern: 'solid',
      queenSeen: true, eggsSeen: true,
      notes: 'Kafkas kolonisi stabil.',
    });

    window.BeeDb.addInspection({
      apiaryId: apiary.id, hiveId: h22.id,
      date: today.toISOString().slice(0, 10),
      framesOfBrood: 5, framesOfBees: 7, framesOfStores: 4,
      varroaPer100: 1.5, broodPattern: 'scattered',
      queenSeen: false, eggsSeen: true,
      notes: 'Yavrular biraz dağınık — izlenmeli.',
    });

    window.BeeDb.addTreatment({
      apiaryId: apiary.id, hiveId: h17.id,
      date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      substance: 'Oksalik asit',
      form: 'buhar',
      dose: '2 g / kovan',
      ambientTemp: 14,
      outcome: 'success',
      notes: 'Broodless pencere; 14 gün sonra mite < 1.',
    });

    window.BeeDb.addHarvest({
      apiaryId: apiary.id, hiveId: h17.id,
      date: new Date(today.getFullYear(), 5, 30).toISOString().slice(0, 10),
      yieldKg: 18,
      honeyType: 'Yabani çiçek',
    });

    window.BeeDb.addHarvest({
      apiaryId: apiary.id, hiveId: h17.id,
      date: new Date(today.getFullYear(), 6, 30).toISOString().slice(0, 10),
      yieldKg: 12,
      honeyType: 'Ayçiçeği',
    });

    window.BeeDb.addHarvest({
      apiaryId: apiary.id, hiveId: h22.id,
      date: new Date(today.getFullYear(), 6, 30).toISOString().slice(0, 10),
      yieldKg: 14,
      honeyType: 'Karışık',
    });
  }
})();