/* ===== js/modules/07_tasks.js ===== */
// ============================================================
// Tasks & Calendar Module — Operasyon & Takvim Takibi
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const tasksModule = {
    add(presetHiveId) {
      const hives = BM.Storage.list('hives');
      const apiaries = BM.Storage.list('apiaries');

      const hOpts = hives.map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      const apOpts = apiaries.map(a => `<option value="${a.id}">${BM.esc(a.name)}</option>`).join('');

      BM.Modal.open('Yeni Görev / Hatırlatıcı',
        `<label class="field"><span class="field-label">Görev Başlığı *</span>
           <input class="input" name="title" required placeholder="Örn: Kat atılacak veya 2L şurup verilecek"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Görev Türü *</span>
             <select class="select" name="type" required>
               <option value="feeding">🌾 Besleme</option>
               <option value="inspection">📋 Muayene</option>
               <option value="treatment">💊 Varroa / Tedavi</option>
               <option value="harvest">🍯 Hasat</option>
               <option value="queen">👑 Ana Arı Kontrolü</option>
               <option value="split">🐝 Kovan Bölme</option>
               <option value="supers">🪵 Kat Atma/Çıkarma</option>
               <option value="cleaning">🧹 Temizlik / Bakım</option>
               <option value="other">📌 Diğer</option>
             </select></label>
           <label class="field"><span class="field-label">Öncelik</span>
             <select class="select" name="priority">
               <option value="low">Düşük</option>
               <option value="normal" selected>Normal</option>
               <option value="high">Yüksek</option>
               <option value="urgent">🔥 Acil</option>
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Hedef Tarih *</span>
             <input class="input" name="dueDate" type="date" required value="${BM.today()}"></label>
           <label class="field"><span class="field-label">İlişkili Kovan</span>
             <select class="select" name="hiveId"><option value="">Tüm Kovanlar / Seçilmedi</option>${hOpts}</select></label>
         </div>
         <label class="field"><span class="field-label">İlişkili Arı Üssü</span>
           <select class="select" name="apiaryId"><option value="">Tüm Üsler / Seçilmedi</option>${apOpts}</select></label>
         <label class="field"><span class="field-label">Notlar / Açıklama</span>
           <textarea class="textarea" name="notes" rows="2" placeholder="Görev detayları..."></textarea></label>`,
        async (d) => {
          await BM.Storage.add('tasks', {
            ...d,
            status: 'pending',
            dueDate: d.dueDate || BM.today()
          });
          BM.Toast.show('Görev eklendi ✓', 'success');
          App.render('tasks');
          return true;
        }
      );
    },

    edit(id) {
      const task = BM.Storage.get('tasks', id);
      if (!task) return;

      const hives = BM.Storage.list('hives');
      const apiaries = BM.Storage.list('apiaries');

      const hOpts = hives.map(h => `<option value="${h.id}"${task.hiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      const apOpts = apiaries.map(a => `<option value="${a.id}"${task.apiaryId === a.id ? ' selected' : ''}>${BM.esc(a.name)}</option>`).join('');

      BM.Modal.open('Görev Düzenle',
        `<label class="field"><span class="field-label">Görev Başlığı *</span>
           <input class="input" name="title" required value="${BM.esc(task.title)}"></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Görev Türü *</span>
             <select class="select" name="type">
               ${['feeding','inspection','treatment','harvest','queen','split','supers','cleaning','other'].map(t => `<option value="${t}"${task.type === t ? ' selected' : ''}>${BM.T.taskType(t)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">Öncelik</span>
             <select class="select" name="priority">
               ${['low','normal','high','urgent'].map(p => `<option value="${p}"${task.priority === p ? ' selected' : ''}>${BM.T.taskPriority(p)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Hedef Tarih *</span>
             <input class="input" name="dueDate" type="date" required value="${task.dueDate}"></label>
           <label class="field"><span class="field-label">Durum</span>
             <select class="select" name="status">
               <option value="pending"${task.status === 'pending' ? ' selected' : ''}>Yapılacak</option>
               <option value="completed"${task.status === 'completed' ? ' selected' : ''}>Tamamlandı</option>
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Kovan</span>
             <select class="select" name="hiveId"><option value="">Tüm Kovanlar / Seçilmedi</option>${hOpts}</select></label>
           <label class="field"><span class="field-label">Arı Üssü</span>
             <select class="select" name="apiaryId"><option value="">Tüm Üsler / Seçilmedi</option>${apOpts}</select></label>
         </div>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(task.notes || '')}</textarea></label>`,
        async (d) => {
          await BM.Storage.update('tasks', id, d);
          BM.Toast.show('Görev güncellendi ✓', 'success');
          App.render('tasks');
          return true;
        }
      );
    },

    toggleStatus(id) {
      const task = BM.Storage.get('tasks', id);
      if (!task) return;
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      BM.Storage.update('tasks', id, { status: newStatus });
      BM.Toast.show(newStatus === 'completed' ? 'Görev tamamlandı ✓' : 'Görev yapılacaklara taşındı', 'info');
      App.render('tasks');
    },

    del(id) {
      BM.Modal.confirm('Bu görevi silmek istiyor musunuz?', () => {
        BM.Storage.remove('tasks', id);
        BM.Toast.show('Görev silindi', 'info');
        App.render('tasks');
      });
    },

    render() {
      const list = BM.Storage.list('tasks').sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
      const todayStr = BM.today();

      const pending = list.filter(t => t.status === 'pending');
      const overdue = list.filter(t => t.status === 'pending' && t.dueDate < todayStr);
      const completed = list.filter(t => t.status === 'completed');

      return `
        <div class="actions-bar">
          <div>
            <h2 style="font-size:18px;font-weight:700">📅 Görevler & Operasyon Takvimi</h2>
            <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">
              ${pending.length} yapılacak (${overdue.length} gecikmiş), ${completed.length} tamamlandı
            </div>
          </div>
          <button class="btn btn--primary" onclick="BM.tasks.add()">+ Yeni Görev</button>
        </div>

        ${!list.length ? `
          <div class="card">
            <div class="empty">
              <div class="empty__icon">📅</div>
              <div class="empty__title">Henüz planlanmış görev yok</div>
              <p style="color:var(--text-secondary);font-size:13px;margin-bottom:16px">Şurup beslemesi, kat atma, ilaçlama gibi işlerinizi takvime ekleyin.</p>
              <button class="btn btn--primary" onclick="BM.tasks.add()">+ İlk Görevi Ekle</button>
            </div>
          </div>
        ` : `
          <div class="grid-3" style="margin-bottom:var(--space-4)">
            <div class="stat"><div class="stat__icon stat__icon--warning">📋</div><div class="stat__label">Yapılacak</div><div class="stat__value">${pending.length}</div></div>
            <div class="stat"><div class="stat__icon stat__icon--danger">⏰</div><div class="stat__label">Gecikmiş</div><div class="stat__value">${overdue.length}</div></div>
            <div class="stat"><div class="stat__icon stat__icon--success">✓</div><div class="stat__label">Tamamlanan</div><div class="stat__value">${completed.length}</div></div>
          </div>

          <div class="card">
            <div class="card-head">
              <div class="card-title">Görev Listesi & Takvim</div>
            </div>
            <div class="row-list">
              ${list.map(t => {
                const hive = t.hiveId ? BM.Storage.get('hives', t.hiveId) : null;
                const apiary = t.apiaryId ? BM.Storage.get('apiaries', t.apiaryId) : null;
                const isOverdue = t.status === 'pending' && t.dueDate < todayStr;
                const isToday = t.dueDate === todayStr;

                return `
                  <div class="row-list__item" style="opacity:${t.status === 'completed' ? '0.6' : '1'};padding:12px;display:flex;align-items:center;gap:12px">
                    <input type="checkbox" style="width:20px;height:20px;cursor:pointer" ${t.status === 'completed' ? 'checked' : ''} onchange="BM.tasks.toggleStatus('${t.id}')">
                    
                    <div style="flex:1;min-width:0">
                      <div style="font-size:14px;font-weight:600;${t.status === 'completed' ? 'text-decoration:line-through;color:var(--text-muted)' : ''}">
                        ${BM.esc(t.title)}
                      </div>
                      <div style="font-size:12px;color:var(--text-secondary);margin-top:2px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                        <span>${BM.T.taskType(t.type)}</span>
                        ${hive ? `<span>· 🏠 ${BM.esc(hive.name)}</span>` : ''}
                        ${apiary ? `<span>· 📍 ${BM.esc(apiary.name)}</span>` : ''}
                        ${t.notes ? `<span>· 📝 ${BM.esc(t.notes)}</span>` : ''}
                      </div>
                    </div>

                    <div style="text-align:right">
                      <div style="font-size:12px;font-weight:700;color:${t.status === 'completed' ? 'var(--text-muted)' : isOverdue ? 'var(--danger)' : isToday ? 'var(--warning)' : 'var(--text-primary)'}">
                        ${isOverdue ? '⏰ Gecikti (' + BM.dateStr(t.dueDate) + ')' : isToday ? '⭐ BUGÜN' : BM.dateStr(t.dueDate)}
                      </div>
                      <div style="margin-top:4px">
                        <span class="badge ${t.priority === 'urgent' ? 'badge--danger' : t.priority === 'high' ? 'badge--warn' : 'badge--ok'}">${BM.T.taskPriority(t.priority)}</span>
                      </div>
                    </div>

                    <div style="display:flex;gap:4px">
                      <button class="btn btn--sm" onclick="BM.tasks.edit('${t.id}')">✏️</button>
                      <button class="btn btn--sm btn--danger" onclick="BM.tasks.del('${t.id}')">🗑</button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        `}
      `;
    }
  };

  BM.tasks = tasksModule;
})(window);
