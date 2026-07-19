/* ============================================================
   BeeMaster AI — Reminders Engine
   Muayene hatırlatıcıları, sonraki tarih hesaplama, durumlar
   ============================================================ */

(function (global) {
  'use strict';

  const Db = global.BeeDb;
  const Region = global.BeeRegion;

  /**
   * Hatırlatıcı durumunu hesapla.
   * Durumlar:
   *  - 'overdue'    : vakti geçmiş (negatif gün)
   *  - 'due'        : bugün muayene günü
   *  - 'soon'       : 3 gün içinde
   *  - 'upcoming'   : 7 gün içinde
   *  - 'scheduled'  : 7+ gün var
   *  - 'never'      : hiç muayene yapılmamış (leadDays kadar önceden uyarı)
   */
  function computeReminder(hiveId) {
    const settings = Db.getSettings();
    const intervalDays = settings.inspectionIntervalDays || 14;
    const leadDays = settings.reminderLeadDays || 3;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inspections = Db.listInspections(hiveId);
    const last = inspections[0]; // en yeni muayene

    let dueDate;
    let lastDate;

    if (last && last.date) {
      lastDate = new Date(last.date);
      lastDate.setHours(0, 0, 0, 0);
      dueDate = new Date(lastDate);
      dueDate.setDate(dueDate.getDate() + intervalDays);
    } else {
      // Hiç muayene yapılmamış — kovan eklenme tarihini kullan
      const hive = Db.getHive(hiveId);
      const startDate = hive && hive.createdAt
        ? new Date(hive.createdAt)
        : new Date(today.getTime() - 7 * 86400000); // 7 gün önce
      startDate.setHours(0, 0, 0, 0);
      lastDate = null;
      dueDate = startDate; // zaten vakti gelmiş sayılır
    }

    const diffMs = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / 86400000);

    let status;
    let priority; // 1=kritik, 2=yüksek, 3=orta, 4=düşük
    if (diffDays < 0) {
      status = 'overdue';
      priority = 1;
    } else if (diffDays === 0) {
      status = 'due';
      priority = 1;
    } else if (diffDays <= leadDays) {
      status = 'soon';
      priority = 2;
    } else if (diffDays <= 7) {
      status = 'upcoming';
      priority = 3;
    } else {
      status = 'scheduled';
      priority = 4;
    }

    // Bugün dismiss edildi mi?
    const dismissed = settings.reminderDismissed || {};
    const todayKey = today.toISOString().slice(0, 10);
    const isDismissed = dismissed[hiveId] === todayKey;

    return {
      hiveId,
      lastDate: lastDate ? lastDate.toISOString().slice(0, 10) : null,
      dueDate: dueDate.toISOString().slice(0, 10),
      daysUntilDue: diffDays,
      status,
      priority,
      isDismissed,
      intervalDays,
      lastInspectionId: last ? last.id : null,
    };
  }

  /**
   * Tüm kovanlar için hatırlatıcı listesi.
   * Öncelik sırasına göre (overdue > due > soon > upcoming > scheduled).
   */
  function getAll() {
    const hives = Db.listHives();
    return hives
      .map((h) => ({ hive: h, ...computeReminder(h.id) }))
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.daysUntilDue - b.daysUntilDue;
      });
  }

  /**
   * Aktif hatırlatıcılar (dismissed olmayan + overdue/due/soon).
   */
  function getActive() {
    return getAll().filter((r) =>
      !r.isDismissed && (r.status === 'overdue' || r.status === 'due' || r.status === 'soon')
    );
  }

  /**
   * Bugün dismiss et.
   */
  function dismissToday(hiveId) {
    const settings = Db.getSettings();
    const today = new Date().toISOString().slice(0, 10);
    settings.reminderDismissed = settings.reminderDismissed || {};
    settings.reminderDismissed[hiveId] = today;
    Db.updateSettings({ reminderDismissed: settings.reminderDismissed });
  }

  /**
   * Dismiss'leri temizle (yeni gün).
   */
  function clearOldDismissals() {
    const settings = Db.getSettings();
    const today = new Date().toISOString().slice(0, 10);
    if (!settings.reminderDismissed) return;
    let changed = false;
    Object.keys(settings.reminderDismissed).forEach((hiveId) => {
      if (settings.reminderDismissed[hiveId] !== today) {
        delete settings.reminderDismissed[hiveId];
        changed = true;
      }
    });
    if (changed) Db.updateSettings({ reminderDismissed: settings.reminderDismissed });
  }

  /**
   * Tüm kovanlar için muayene tamamlandı.
   */
  function completeInspection(hiveId) {
    dismissToday(hiveId); // bugün hatırlatmaya gerek yok
  }

  /**
   * Sonraki muayene tarihi (string YYYY-MM-DD).
   */
  function nextDueDate(hiveId) {
    const r = computeReminder(hiveId);
    return r.dueDate;
  }

  /**
   * Görsel durum bilgisi (etiket + renk).
   */
  function statusInfo(status) {
    const map = {
      overdue: { label: 'Vakti geçti', color: 'red', icon: '🔴' },
      due: { label: 'Bugün', color: 'red', icon: '🟠' },
      soon: { label: 'Yaklaşıyor', color: 'amber', icon: '🟡' },
      upcoming: { label: 'Bu hafta', color: 'blue', icon: '🔵' },
      scheduled: { label: 'Planlı', color: 'gray', icon: '⚪' },
    };
    return map[status] || { label: status, color: 'gray', icon: '⚪' };
  }

  global.BeeReminders = {
    computeReminder,
    getAll,
    getActive,
    dismissToday,
    clearOldDismissals,
    completeInspection,
    nextDueDate,
    statusInfo,
  };
})(window);