/* ===== js/app.js ===== */
// ============================================================
// App Controller — Router, navigation, init
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  const NAV = [
    { group: 'Genel', items: [
      { id: 'dashboard', icon: '📊', label: 'Dashboard', view: 'dashboard' },
      { id: 'apiaries', icon: '📍', label: 'Arı Üsleri', view: 'apiaries' },
      { id: 'hives', icon: '🏠', label: 'Kovanlar', view: 'hives' }
    ]},
    { group: 'Operasyon', items: [
      { id: 'tasks', icon: '📅', label: 'Görevler & Takvim', view: 'tasks' },
      { id: 'inspections', icon: '📋', label: 'Muayeneler', view: 'inspections' },
      { id: 'harvest', icon: '🍯', label: 'Bal Hasadı', view: 'harvest' },
      { id: 'feeding', icon: '🌾', label: 'Besleme', view: 'feeding' },
      { id: 'treatments', icon: '💊', label: 'Tedaviler', view: 'treatments' },
      { id: 'diseases', icon: '🦠', label: 'Hastalıklar', view: 'diseases' }
    ]},
    { group: 'Yönetim', items: [
      { id: 'queens', icon: '👑', label: 'Ana Arılar', view: 'queens' },
      { id: 'inventory', icon: '📦', label: 'Envanter', view: 'inventory' },
      { id: 'analytics', icon: '📈', label: 'Analitik', view: 'analytics' },
      { id: 'reports', icon: '📄', label: 'Raporlar', view: 'reports' },
      { id: 'settings', icon: '⚙️', label: 'Ayarlar', view: 'settings' }
    ]},
    { group: 'BeeOS', items: [
      { id: 'beeos', icon: '⬡', label: 'BeeOS Ajan', view: 'beeos' }
    ]}
  ];

  /* ===== BeeOS Module v0.1 ===== */
(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  BM.beeos = {
    agents: [
      { id: 'orchestrator', emoji: '🎯', name: 'Orchestrator', role: 'Genel Sürü & Risk Koordinatörü', desc: 'Tüm kovanları, varroa sayılarını ve muayene geçmişini bütünsel tarar, acil aksiyon raporu üretir.', color: 'linear-gradient(135deg,#f59e0b,#d97706)' },
      { id: 'planner', emoji: '📐', name: 'Planner', role: 'Mevsimsel Besleme & Takvim Uzmanı', desc: 'Aylık flora döngüsüne ve hava durumuna göre 30 günlük otomatik şurup, kek ve kontrol takvimi oluşturur.', color: 'linear-gradient(135deg,#8b5cf6,#3b82f6)' },
      { id: 'architect', emoji: '🏛️', name: 'Architect', role: 'Kovan Mimarisi & Kapasite Analisti', desc: 'Çerçeve düzenini, petek yaşlarını ve popülasyonu inceleyip kat atma, bölme veya yenileme planlar.', color: 'linear-gradient(135deg,#10b981,#059669)' },
      { id: 'flora', emoji: '🌿', name: 'Flora & Climate', role: 'Polinasyon & Bal Akımı Tahmincisi', desc: 'Bölge florasını (Geven, Kekik, Pamuk) ve hava sıcaklıklarını analiz edip nektar akım zamanını kestirir.', color: 'linear-gradient(135deg,#ec4899,#8b5cf6)' },
      { id: 'genetics', emoji: '🧬', name: 'Queen Geneticist', role: 'Ana Arı Genetiği & Irk İslahı', desc: 'Karniyol, Kafkas ve Anadolu ırklarının performans, hırçınlık ve kışlama skorlarını değerlendirir.', color: 'linear-gradient(135deg,#06b6d4,#3b82f6)' },
      { id: 'veterinary', emoji: '🩺', name: 'Veterinary AI', role: 'Varroa & Hastalık Teşhis Motoru', desc: 'Varroa, Nosema ve yavru çürüklüğü belirtilerini erken teşhis eder ve etken madde dozajı önerir.', color: 'linear-gradient(135deg,#ef4444,#f59e0b)' }
    ],

    render() {
      const stats = this._stats();
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      const notes = this.getNotes();

      return `
        <div style="padding:24px;max-width:1240px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;">
          
          <!-- Hero Header with Dynamic Autopilot Banner -->
          <div style="background:linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(139,92,246,0.15) 50%, rgba(16,185,129,0.1) 100%);border:1px solid rgba(245,158,11,0.3);border-radius:var(--radius-lg);padding:28px;margin-bottom:24px;position:relative;overflow:hidden;backdrop-filter:blur(10px)">
            <div style="position:absolute;right:-20px;bottom:-20px;font-size:160px;opacity:0.04;pointer-events:none">🐝</div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap">
              <div style="max-width:650px">
                <div style="display:inline-flex;align-items:center;gap:8px;padding:4px 12px;background:rgba(245,158,11,0.2);border:1px solid rgba(245,158,11,0.4);border-radius:20px;font-size:11px;font-weight:700;color:var(--honey-400);margin-bottom:12px">
                  <span style="width:8px;height:8px;border-radius:50%;background:#22c55e;box-shadow:0 0 8px #22c55e;display:inline-block"></span> BEEOS AUTOPILOT ENGINE v2.5 READY
                </div>
                <h1 style="font-size:1.8rem;font-weight:800;margin-bottom:8px;background:linear-gradient(135deg,#fbbf24,#f59e0b,#8b5cf6);-webkit-background-clip:text;background-clip:text;color:transparent">
                  ⬡ BeeOS Otonom Arıcılık Ajan Merkezi
                </h1>
                <p style="font-size:0.88rem;color:var(--text-secondary);line-height:1.6;margin:0">
                  NotebookLM bilginizi ve kovan verilerinizi 6 uzman yapay zeka ajanı ile saniyeler içinde tarayın, otonom kararlar alın ve arılığınızı yapay zeka ile yönetin.
                </p>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-end">
                <button class="btn btn--primary" onclick="BM.beeos.runAutopilot()" style="padding:14px 28px;font-weight:800;font-size:1rem;border-radius:12px;box-shadow:0 8px 24px rgba(245,158,11,0.4);display:flex;align-items:center;gap:10px;background:linear-gradient(135deg,#f59e0b,#d97706)">
                  ⚡ OTONOM SÜRÜ ANALİZİ (AUTOPILOT)
                </button>
                <div style="font-size:0.75rem;color:var(--text-muted)">6 Ajan + NotebookLM Bilgi Tabanı Taranır</div>
              </div>
            </div>
          </div>

          <!-- Fleet Health Metric Bar & Live Stats -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
            <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px;position:relative;overflow:hidden">
              <div style="font-size:0.7rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px">Sürü Sağlık Skoru</div>
              <div style="display:flex;align-items:baseline;gap:8px">
                <div style="font-size:2.2rem;font-weight:800;color:var(--success)">${stats.healthScore}</div>
                <div style="font-size:0.9rem;color:var(--text-secondary)">/ 100</div>
              </div>
              <div style="font-size:0.75rem;color:var(--success);margin-top:4px">🛡️ Durum: ${stats.healthStatus}</div>
            </div>
            ${stats.items.map(s => `
              <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px;position:relative;overflow:hidden">
                <div style="position:absolute;top:0;left:0;right:0;height:3px;background:${s.color}"></div>
                <div style="font-size:1.4rem;margin-bottom:4px">${s.emoji}</div>
                <div style="font-size:1.8rem;font-weight:800;margin-bottom:2px">${s.val}</div>
                <div style="font-size:0.72rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px">${s.label}</div>
              </div>
            `).join('')}
          </div>

          <!-- NotebookLM & Bilgi Bankası (Knowledge Hub) Section -->
          <div style="background:linear-gradient(135deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9));border:1px solid rgba(139,92,246,0.3);border-radius:var(--radius-lg);padding:24px;margin-bottom:28px;box-shadow:0 8px 24px rgba(0,0,0,0.3)">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
              <div>
                <h3 style="font-size:1.1rem;font-weight:800;display:flex;align-items:center;gap:8px;color:#a78bfa;margin:0 0 4px 0">
                  📚 NotebookLM & Arıcılık Bilgi Bankası (Knowledge Base)
                </h3>
                <p style="font-size:0.82rem;color:var(--text-secondary);margin:0">
                  Google NotebookLM notlarınızı, saha deneyimlerinizi ve arıcılık makalelerinizi buraya ekleyin. Tüm Ajanlar çıkarımlarında bu notları referans alır.
                </p>
              </div>
              <button class="btn btn--primary btn--sm" onclick="BM.beeos.toggleNoteForm()" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);font-weight:700">
                + NotebookLM Notu Ekle
              </button>
            </div>

            <!-- New Note Form (Initially Hidden) -->
            <div id="notebooklm-form" style="display:none;background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:16px;margin-bottom:16px">
              <div style="display:flex;flex-direction:column;gap:10px">
                <input type="text" id="note-title" placeholder="Not Başlığı (Örn: Eğil Beyaztoprak Bol Yağışlı Sezon Notları)" style="background:var(--bg-primary);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem">
                <textarea id="note-content" rows="4" placeholder="NotebookLM'den veya notlarınızdan yapıştırın (Markdown desteklidir)..." style="background:var(--bg-primary);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem;resize:vertical"></textarea>
                <div style="display:flex;justify-content:flex-end;gap:10px">
                  <button class="btn btn--ghost btn--sm" onclick="BM.beeos.toggleNoteForm()">İptal</button>
                  <button class="btn btn--primary btn--sm" onclick="BM.beeos.saveNote()">Kaydet & Ajanlara Bağla</button>
                </div>
              </div>
            </div>

            <!-- Saved Notes List -->
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
              ${notes.map((n, i) => `
                <div style="background:rgba(15,23,42,0.6);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:14px;position:relative">
                  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px">
                    <div style="font-size:0.88rem;font-weight:700;color:var(--honey-400)">📌 ${BM.esc(n.title)}</div>
                    <button onclick="BM.beeos.deleteNote(${i})" style="color:var(--text-muted);font-size:12px;cursor:pointer" title="Sil">✕</button>
                  </div>
                  <div style="font-size:0.78rem;color:var(--text-secondary);line-height:1.5;max-height:80px;overflow-y:auto">${BM.esc(n.content)}</div>
                  <div style="font-size:0.68rem;color:var(--text-muted);margin-top:8px">📅 ${new Date(n.date).toLocaleDateString('tr-TR')} · Ajan Bağlamında Aktif</div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Terminal Live Streaming Log Window (Initially Hidden or Idle) -->
          <div id="beeos-terminal-card" style="display:none;background:#0d1117;border:1px solid #30363d;border-radius:var(--radius-lg);padding:20px;margin-bottom:24px;font-family:'Fira Code',Consolas,monospace;box-shadow:0 12px 32px rgba(0,0,0,0.5)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid #21262d">
              <div style="display:flex;align-items:center;gap:8px">
                <span style="width:12px;height:12px;border-radius:50%;background:#ff5f56;display:inline-block"></span>
                <span style="width:12px;height:12px;border-radius:50%;background:#ffbd2e;display:inline-block"></span>
                <span style="width:12px;height:12px;border-radius:50%;background:#27c93f;display:inline-block"></span>
                <span style="color:#8b949e;font-size:0.8rem;margin-left:8px;font-weight:600">beeos-agent-terminal.log</span>
              </div>
              <div style="font-size:0.75rem;color:#58a6ff;display:flex;align-items:center;gap:6px">
                <span id="terminal-spinner" style="animation:spin 1s linear infinite">🔄</span> <span id="terminal-status-text">Analiz Yapılıyor...</span>
              </div>
            </div>
            <div id="beeos-terminal-logs" style="max-height:220px;overflow-y:auto;font-size:0.8rem;color:#c9d1d9;line-height:1.6"></div>
          </div>

          <!-- Dynamic Action Cards (Generated by Agents) -->
          <div id="beeos-actions-area" style="display:none;margin-bottom:24px">
            <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px;color:var(--honey-400)">
              🎯 Ajan Eylem ve Tavsiye Kartları (Otomatik Üretildi)
            </h3>
            <div id="beeos-action-cards" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:16px"></div>
          </div>

          <!-- 6 AI Agents Grid -->
          <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px">
            🤖 Çekirdek Yapay Zeka Ajan Takımı (Bireysel Analiz İçin Tıklayın)
          </h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin-bottom:28px">
            ${this.agents.map(a => `
              <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:22px;position:relative;overflow:hidden;cursor:pointer;transition:all 0.25s ease;"
                   onclick="BM.beeos.runSingleAgent('${a.id}')"
                   onmouseover="this.style.transform='translateY(-3px)';this.style.borderColor='var(--honey-500)';this.style.boxShadow='0 8px 24px rgba(245,158,11,0.15)'" 
                   onmouseout="this.style.transform='';this.style.borderColor='var(--n-800)';this.style.boxShadow=''">
                <div style="position:absolute;top:0;left:0;right:0;height:4px;background:${a.color}"></div>
                <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
                  <div style="font-size:2.4rem">${a.emoji}</div>
                  <span class="badge badge--info" style="font-size:10px;padding:4px 8px;font-weight:700">ANALİZ ET ▶</span>
                </div>
                <div style="font-size:1.1rem;font-weight:800;margin-bottom:2px">${a.name}</div>
                <div style="font-size:0.7rem;color:var(--honey-400);text-transform:uppercase;letter-spacing:0.5px;font-weight:700;margin-bottom:10px">${a.role}</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5">${a.desc}</div>
              </div>
            `).join('')}
          </div>

          <!-- Interactive Agent Consultation Chat -->
          <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:24px;margin-bottom:28px;box-shadow:0 8px 24px rgba(0,0,0,0.2)">
            <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:6px;display:flex;align-items:center;gap:8px">
              💬 Canlı Ajan Danışmanı & Kovan Asistanı
            </h3>
            <p style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:16px">
              Kovan verileriniz ve NotebookLM notlarınız bağlama alınarak seçtiğiniz uzman ajan tarafından özel yanıt üretilir.
            </p>
            
            <div style="display:flex;gap:10px;margin-bottom:12px;flex-wrap:wrap">
              <label style="font-size:0.75rem;color:var(--text-muted);display:flex;align-items:center">Danışılacak Ajan:</label>
              <select id="beeos-chat-agent-select" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:6px 12px;color:var(--honey-400);font-weight:700;font-size:0.82rem">
                <option value="all">🎯 Tüm Ajan Takımı (Orchestrator)</option>
                ${this.agents.map(a => `<option value="${a.id}">${a.emoji} ${a.name} (${a.role.split('&')[0]})</option>`).join('')}
              </select>
            </div>

            <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:14px">
              <input type="text" id="beeos-chat-input" placeholder="Örn: Yağışlı geçen bu sezonda bal nektar akımı ne zamana kadar sürer?" 
                     style="flex:1;min-width:280px;background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:12px 16px;color:var(--text-primary);font-size:0.9rem" 
                     onkeypress="if(event.key==='Enter') BM.beeos.askAgent()">
              <button class="btn btn--primary" onclick="BM.beeos.askAgent()" style="font-weight:700;padding:12px 24px">🤖 Ajana Sor</button>
            </div>
            <div id="beeos-chat-response" style="display:none;padding:16px;background:var(--bg-input);border-left:4px solid var(--honey-500);border-radius:var(--radius-sm);font-size:0.88rem;line-height:1.6;color:var(--text-primary)"></div>
          </div>

          <!-- Tasks & Workflow Management -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:28px">
            <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:22px">
              <h3 style="font-size:1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px">📝 Yeni Ajan Görevi Ekle</h3>
              <form id="beeos-task-form" onsubmit="event.preventDefault(); BM.beeos.submitTask(); return false;" style="display:flex;flex-direction:column;gap:12px">
                <div style="display:flex;flex-direction:column;gap:4px">
                  <label style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase">Görev Tanımı *</label>
                  <input type="text" id="beeos-task-name" placeholder="Örn: Kovan-05 oksalik asit damlatması" required style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem">
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <label style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase">Atanan Ajan</label>
                    <select id="beeos-task-agent" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem">
                      ${this.agents.map(a => `<option value="${a.id}">${a.emoji} ${a.name}</option>`).join('')}
                    </select>
                  </div>
                  <div style="display:flex;flex-direction:column;gap:4px">
                    <label style="font-size:0.7rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase">Öncelik</label>
                    <select id="beeos-task-priority" style="background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);padding:10px 14px;color:var(--text-primary);font-size:0.85rem">
                      <option value="high">🔴 Yüksek</option>
                      <option value="medium" selected>🟡 Orta</option>
                      <option value="low">🟢 Düşük</option>
                    </select>
                  </div>
                </div>
                <button type="submit" class="btn btn--primary" style="font-weight:700;margin-top:6px">+ Görev Ekle</button>
              </form>
            </div>

            <!-- Task Board -->
            <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:22px;display:flex;flex-direction:column">
              <h3 style="font-size:1rem;font-weight:800;margin-bottom:14px;display:flex;align-items:center;gap:8px">📋 Aktif Görev Listesi (${tasks.length})</h3>
              <div style="flex:1;overflow-y:auto;max-height:260px;display:flex;flex-direction:column;gap:8px">
                ${!tasks.length ? '<div style="color:var(--text-muted);font-size:0.82rem;text-align:center;margin:auto">Henüz eklenmiş görev bulunmuyor</div>' :
                tasks.map(t => {
                  const agentObj = this.agents.find(a => a.id === t.agent) || this.agents[0];
                  const prioBadge = t.priority === 'high' ? '🔴 Yüksek' : t.priority === 'low' ? '🟢 Düşük' : '🟡 Orta';
                  return `
                    <div style="padding:10px 14px;background:var(--bg-input);border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:space-between;gap:8px">
                      <div style="min-width:0;flex:1">
                        <div style="font-size:0.84rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${BM.esc(t.name)}</div>
                        <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px">${agentObj.emoji} ${agentObj.name} · ${prioBadge}</div>
                      </div>
                      <div style="display:flex;gap:6px">
                        <button class="btn btn--sm ${t.status === 'done' ? 'btn--primary' : 'btn--ghost'}" onclick="BM.beeos.toggleTaskStatus('${t.id}')">
                          ${t.status === 'done' ? '✅ Bitti' : t.status === 'in_progress' ? '🔄 Devam' : '⏳ Bekliyor'}
                        </button>
                        <button class="btn btn--sm btn--danger" onclick="BM.beeos.deleteTask('${t.id}')">✕</button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- BDAOS Master Links -->
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin-bottom:24px">
            ${[
              { icon:'📜', label:'Anayasa', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/00_MASTER_BLUEPRINT/BEEMASTER_CONSTITUTION.md' },
              { icon:'🎨', label:'Tasarım Sistemi', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/01_DESIGN_SYSTEM/BDS.md' },
              { icon:'🧩', label:'Bileşen Kütüphanesi', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/02_COMPONENT_LIBRARY/BCL.md' },
              { icon:'🧠', label:'HDOS Engine', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/blob/main/15_HERMES/HDOS.md' },
              { icon:'⬡', label:'BeeOS Repository', url:'https://github.com/ilkerocal/BeeMaster-AI-OS/tree/main/50_BEEOS' }
            ].map(l => `
              <a href="${l.url}" target="_blank" style="display:flex;align-items:center;gap:8px;padding:12px 14px;background:var(--bg-input);border:1px solid var(--n-800);border-radius:var(--radius-sm);font-size:0.78rem;font-weight:700;transition:all 0.2s" onmouseover="this.style.borderColor='var(--honey-500)'" onmouseout="this.style.borderColor='var(--n-800)'">
                ${l.icon} ${l.label} <span style="margin-left:auto;color:var(--text-muted)">↗</span>
              </a>
            `).join('')}
          </div>

          <p style="font-size:0.75rem;color:var(--text-muted);text-align:center;padding-top:16px;border-top:1px solid var(--n-800)">
            🐝 BeeOS v2.5 Autopilot Engine · NotebookLM Knowledge Entegreli Otonom Karar Destek Sistemi
          </p>
        </div>
      `;
    },

    _stats() {
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      const hives = BM.Storage.list('hives');
      const inspections = BM.Storage.list('inspections');
      let highVarroaCount = 0;
      hives.forEach(h => {
        const lastInsp = inspections.filter(i => i.hiveId === h.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
        if (lastInsp && lastInsp.varroaCount >= 6) highVarroaCount++;
      });
      const healthScore = Math.max(40, 100 - (highVarroaCount * 15));
      const healthStatus = healthScore >= 85 ? 'Mükemmel' : healthScore >= 70 ? 'İyi' : 'Risk Var!';

      return {
        healthScore,
        healthStatus,
        items: [
          { emoji:'🐝', val:hives.length, label:'Aktif Kovan', color:'#10b981' },
          { emoji:'⚠️', val:highVarroaCount, label:'Riskli Kovan', color:highVarroaCount > 0 ? '#ef4444' : '#10b981' },
          { emoji:'📋', val:tasks.length, label:'Ajan Görevi', color:'#8b5cf6' }
        ]
      };
    },

    getNotes() {
      const stored = localStorage.getItem('beeos_notebooklm_notes');
      if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
      }
      const defaultNotes = [{
        title: 'Eğil Beyaztoprak Florası & Bol Yağışlı Sezon Notları (NotebookLM)',
        content: 'Yağışlı geçen ilkbahar sezonlarında Geven, Devedikeni ve Dağ Kekiği nektar salgılamaya Ağustos sonuna kadar devam eder. Varroa ilaçlamasında bal akımı sürüyorsa kimyasal yerine organik yöntemler veya sezon sonu Oksalik Asit tercih edilir.',
        date: new Date().toISOString()
      }];
      localStorage.setItem('beeos_notebooklm_notes', JSON.stringify(defaultNotes));
      return defaultNotes;
    },

    toggleNoteForm() {
      const form = document.getElementById('notebooklm-form');
      if (form) form.style.display = form.style.display === 'none' ? 'block' : 'none';
    },

    saveNote() {
      const titleEl = document.getElementById('note-title');
      const contentEl = document.getElementById('note-content');
      const title = titleEl ? titleEl.value.trim() : '';
      const content = contentEl ? contentEl.value.trim() : '';
      if (!title || !content) {
        BM.Toast.show('Lütfen başlık ve içerik alanlarını doldurun', 'warning');
        return;
      }
      const notes = this.getNotes();
      notes.unshift({ title, content, date: new Date().toISOString() });
      localStorage.setItem('beeos_notebooklm_notes', JSON.stringify(notes));
      BM.Toast.show('📚 NotebookLM Notu Kaydedildi & Ajanlara Bağlandı', 'success');
      App.render('beeos');
    },

    deleteNote(index) {
      const notes = this.getNotes();
      notes.splice(index, 1);
      localStorage.setItem('beeos_notebooklm_notes', JSON.stringify(notes));
      BM.Toast.show('Not silindi', 'info');
      App.render('beeos');
    },

    // Otonom Ajan Simülasyonu & Live Terminal Stream
    runAutopilot() {
      const termCard = document.getElementById('beeos-terminal-card');
      const logs = document.getElementById('beeos-terminal-logs');
      const statusText = document.getElementById('terminal-status-text');
      const spinner = document.getElementById('terminal-spinner');
      const actionsArea = document.getElementById('beeos-actions-area');
      const actionCards = document.getElementById('beeos-action-cards');

      termCard.style.display = 'block';
      actionsArea.style.display = 'none';
      logs.innerHTML = '';
      spinner.style.display = 'inline-block';
      statusText.textContent = 'Otonom Ajan Analizi Başlatıldı...';

      const hives = BM.Storage.list('hives');
      const inspections = BM.Storage.list('inspections');
      const queens = BM.Storage.list('queens');
      const activeApiary = BM.Storage.list('apiaries').find(a => a.id === BM.Storage.state.activeApiaryId) || BM.Storage.list('apiaries')[0];

      const timeStr = () => new Date().toLocaleTimeString('tr-TR');
      const appendLog = (tag, msg, color='#c9d1d9') => {
        logs.innerHTML += `<div style="margin-bottom:4px"><span style="color:#8b949e">[${timeStr()}]</span> <span style="color:${color};font-weight:700">[${tag}]</span> ${msg}</div>`;
        logs.scrollTop = logs.scrollHeight;
      };

      const steps = [
        { delay: 300, tag: 'ORCHESTRATOR', msg: `Sürü taranıyor... Toplam ${hives.length} kovan ve ${queens.length} ana arı yüklendi.`, color: '#f59e0b' },
        { delay: 700, tag: 'NOTEBOOKLM_KB', msg: `📚 NotebookLM Bilgi Bankası tarandı: ${this.getNotes().length} özel araştırma notu bağlama alındı.`, color: '#a78bfa' },
        { delay: 1100, tag: 'FLORA_BOT', msg: `Konum: ${activeApiary ? activeApiary.location : 'Diyarbakır, Eğil'}. Yağış endeksli nektar akımı aktif!`, color: '#ec4899' },
        { delay: 1500, tag: 'VETERINARY', msg: `Tüm muayene kayıtları inceleniyor... Varroa eşiği ve ilaçlama geçmişi taranıyor.`, color: '#ef4444' },
        { delay: 1900, tag: 'ARCHITECT', msg: `Kovan petek dolulukları ve çerçeve yaşları kontrol ediliyor...`, color: '#10b981' },
        { delay: 2300, tag: 'GENETICS', msg: `Ana arı ırkı performans skorları hesaplanıyor (Karniyol/Kafkas)...`, color: '#06b6d4' },
        { delay: 2700, tag: 'PLANNER', msg: `Gelecek 30 günlük otomatik besleme ve tedavi takvimi oluşturuluyor.`, color: '#8b5cf6' },
        { delay: 3200, tag: 'SYSTEM', msg: `🎉 Otonom Ajan Taraması Başarıyla Tamamlandı! NotebookLM Destekli Eylem Kartları Üretildi.`, color: '#27c93f' }
      ];

      steps.forEach(step => {
        setTimeout(() => {
          appendLog(step.tag, step.msg, step.color);
        }, step.delay);
      });

      setTimeout(() => {
        spinner.style.display = 'none';
        statusText.textContent = 'Analiz Tamamlandı ✓';
        this._renderActionCards(hives, inspections, queens);
        actionsArea.style.display = 'block';
        BM.Toast.show('🚀 BeeOS Otonom Analiz Tamamlandı', 'success');
      }, 3500);
    },

    _renderActionCards(hives, inspections, queens) {
      const cardsEl = document.getElementById('beeos-action-cards');
      cardsEl.innerHTML = '';
      let generated = [];

      hives.forEach(h => {
        const lastInsp = inspections.filter(i => i.hiveId === h.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
        const varroa = lastInsp ? lastInsp.varroaCount : 0;

        if (varroa >= 6) {
          generated.push({
            icon: '💊',
            title: `Acil Varroa Tedavisi — ${h.name}`,
            agent: '🩺 Veterinary AI',
            desc: `Son muayenede ${varroa} adet Varroa tespit edildi. Koloni çöküşünü önlemek için hemen Apivar veya Oksalik Asit tedavisi başlatın.`,
            btnLabel: '+ Tedavi Kaydı Oluştur',
            action: () => BM.treatments.add(h.id)
          });
        }
      });

      // 100% Otomatik 12 Aylık Mevsimsel Karar Motoru (NotebookLM & Takvim Entegreli)
      const now = new Date();
      const month = now.getMonth() + 1; // 1-12 (Tarih cihaz saatinden %100 otomatik alınır)
      const day = now.getDate();
      const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
      const curMonthStr = monthNames[now.getMonth()];

      let plannerTitle = `📐 Planner: ${day} ${curMonthStr} Otonom Planı`;
      let plannerDesc = '';
      let btnLabel = '+ İşlem Ekle';
      let btnAction = () => BM.feeding.add();

      if (month === 1 || month === 2) {
        // Ocak - Şubat (Kış Kuşatması)
        plannerTitle = `❄️ ${curMonthStr} Kış Salkımı & Dinlenme Dönemi (${day} ${curMonthStr})`;
        plannerDesc = `Kovan içi müdahale yapmayın! Uçuş deliği tıkanıklığını ve kovanın rüzgardan korunduğunu kontrol edin. Acil açlıkta sadece kuru şeker/fondan verin.`;
        btnLabel = '+ Muayene Kaydı';
        btnAction = () => BM.inspections.add();
      } else if (month === 3 || month === 4) {
        // Mart - Nisan (Erken Bahar / Badem & Kayısı Çiçeklenmesi)
        plannerTitle = `🌸 ${curMonthStr} Erken Bahar Gelişim Beslemesi (${day} ${curMonthStr})`;
        plannerDesc = `Badem ve kayısı çiçeklenmesi aktif. Kuluçka alanını büyütmek için zayıf kovanlara 1:1 Şeker Şurubu ve teşvik keki verin. Oğul kontrolü yapın.`;
        btnLabel = '+ Besleme Kaydı';
        btnAction = () => BM.feeding.add();
      } else if (month === 5 || month === 6) {
        // Mayıs - Haziran (Ana Bal Akımı Zirvesi / Geven & Kekik)
        plannerTitle = `🍯 ${curMonthStr} Ana Bal Akımı & Kat Atma Zirvesi (${day} ${curMonthStr})`;
        plannerDesc = `Geven, Kekik ve Adaçayı akımı başladı! Şerbetlemeyi tamamen durdurun. Güçlü kovanlara 2. veya 3. bal katını (süper) ilave edin.`;
        btnLabel = '+ Kovan Kataloğu';
        btnAction = () => App.nav('hives');
      } else if (month === 7 || month === 8) {
        // Temmuz - Ağustos (Geç Nektar Akımı / Hasat Dönemi - NotebookLM)
        plannerTitle = `☀️ ${curMonthStr} Bal Akımı & Hasat Dönemi (${day} ${curMonthStr})`;
        plannerDesc = `Yağışlı geçen sezonda Geven ve Devedikeni nektar salgılamaya devam eder. Şerbetleme YAPMAYIN, olgunlaşan bal çerçevelerini sağım için takip edin.`;
        btnLabel = '+ Bal Hasadı Kaydet';
        btnAction = () => BM.harvest.add();
      } else if (month === 9 || month === 10) {
        // Eylül - Ekim (Sonbahar & Varroa Tedavisi)
        plannerTitle = `🍂 ${curMonthStr} Sonbahar Bakımı & Varroa Tedavisi (${day} ${curMonthStr})`;
        plannerDesc = `Bal sağımı sonrası kış arısı popülasyonunu artırmak için 1:1 Şurup verin. Varroa çöküşünü önlemek için Oksalik Asit / Organik Varroasit uygulayın.`;
        btnLabel = '+ Tedavi Kaydı Ekle';
        btnAction = () => BM.treatments.add();
      } else {
        // Kasım - Aralık (Kış Hazırlığı)
        plannerTitle = `🌨️ ${curMonthStr} Kışlatma & İzolasyon Hazırlığı (${day} ${curMonthStr})`;
        plannerDesc = `Kovan kış stoklarını kontrol edin (2:1 Koyu şurup/kek). Kovanları güneydoğuya çevirin, rüzgarlık ve izolasyonu tamamlayın.`;
        btnLabel = '+ Besleme Kaydı';
        btnAction = () => BM.feeding.add();
      }

      generated.push({
        icon: '📐',
        title: plannerTitle,
        agent: '📐 Planner Agent (Otomatik Takvim)',
        desc: plannerDesc,
        btnLabel: btnLabel,
        action: btnAction
      });

      generated.push({
        icon: '👑',
        title: 'Genç Ana Arı Yenileme',
        agent: '🧬 Queen Geneticist',
        desc: '2 yılını doldurmuş yaşlı ana arıları yüksek verimli Karniyol F1 ana arı ile değiştirerek bal verimini %40 artırın.',
        btnLabel: '+ Yeni Ana Arı Ekle',
        action: () => BM.queens.add()
      });

      cardsEl.innerHTML = generated.map((c, idx) => `
        <div style="background:var(--bg-card);border:1px solid var(--n-800);border-radius:var(--radius-lg);padding:20px;display:flex;flex-direction:column;justify-content:space-between">
          <div>
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
              <span style="font-size:2rem">${c.icon}</span>
              <span class="badge badge--warn" style="font-size:10px">${c.agent}</span>
            </div>
            <div style="font-size:1rem;font-weight:800;margin-bottom:6px">${c.title}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);line-height:1.5;margin-bottom:16px">${c.desc}</div>
          </div>
          <button class="btn btn--primary btn--sm" onclick="BM.beeos._executeCardAction(${idx})" style="font-weight:700">${c.btnLabel}</button>
        </div>
      `).join('');

      this._cardActions = generated.map(c => c.action);
    },

    _executeCardAction(idx) {
      if (this._cardActions && this._cardActions[idx]) {
        this._cardActions[idx]();
      }
    },

    runSingleAgent(agentId) {
      this.runAutopilot();
    },

    askAgent() {
      const input = document.getElementById('beeos-chat-input');
      const resEl = document.getElementById('beeos-chat-response');
      const agentSelect = document.getElementById('beeos-chat-agent-select');
      const selectedAgentId = agentSelect ? agentSelect.value : 'all';
      const q = input ? input.value.trim() : '';
      if (!q) return;

      resEl.style.display = 'block';
      resEl.innerHTML = '⏳ <i>BeeOS Ajanları kovan verilerinizi ve NotebookLM notlarınızı tarıyor...</i>';

      const hives = BM.Storage.list('hives');
      const inspections = BM.Storage.list('inspections');
      const queens = BM.Storage.list('queens');
      const activeApiary = BM.Storage.list('apiaries').find(a => a.id === BM.Storage.state.activeApiaryId) || BM.Storage.list('apiaries')[0];
      const notes = this.getNotes();

      setTimeout(() => {
        const lower = q.toLowerCase();
        let ans = '';
        const agentObj = this.agents.find(a => a.id === selectedAgentId);
        const agentNameHeader = agentObj ? `${agentObj.emoji} <b>${agentObj.name} (${agentObj.role.split('&')[0]}):</b><br>` : `🎯 <b>Orchestrator & BeeOS Takımı:</b><br>`;

        // NotebookLM note integration check
        let matchedNote = notes.find(n => lower.split(' ').some(w => w.length > 3 && n.content.toLowerCase().includes(w) || n.title.toLowerCase().includes(w)));
        let noteContextMsg = matchedNote ? `<div style="margin-top:8px;padding:8px 12px;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.3);border-radius:6px;font-size:0.8rem">📚 <b>NotebookLM Bağlamı Kullanıldı:</b> "${BM.esc(matchedNote.title)}"</div>` : '';

        if (lower.includes('varroa') || lower.includes('hastalık') || lower.includes('bit') || lower.includes('ilaç')) {
          let highRiskHives = hives.filter(h => {
            const insp = inspections.filter(i => i.hiveId === h.id).sort((a,b)=>b.date.localeCompare(a.date))[0];
            return insp && insp.varroaCount >= 6;
          }).map(h => h.name);

          ans = agentNameHeader;
          if (highRiskHives.length > 0) {
            ans += `⚠️ Arılığınızda <b>${highRiskHives.join(', ')}</b> kovanlarında Varroa sayısı kritik düzeyde (≥6)!<br>• <b>Tavsiye:</b> Apivar veya Oksalik asit damlatma uygulamasını hemen başlatın. Nektar akımı sürüyorsa organik varroasit tercih edin.`;
          } else {
            ans += `✅ Mevcut kovanlarınızın tümünde Varroa sayısı güvenli sınırlar içinde.<br>• <b>Tavsiye:</b> Rutin dip tahtası sayımlarına ve kış öncesi kontrole devam edin.`;
          }
        } else if (lower.includes('bal') || lower.includes('yağmur') || lower.includes('akım') || lower.includes('flora') || lower.includes('nektar')) {
          ans = agentNameHeader + `🌸 <b>Flora & İklim Analizi:</b><br>Bol yağış alan sezonlarda Geven, Devedikeni ve Kekik gibi derin köklü bitkiler nektar salgılamaya <b>Ağustos sonuna kadar</b> devam eder.<br>• <b>Tavsiye:</b> Nektar akımı sürerken besleme yapmayın, kovan bal dolumunu haftalık takip edin.${noteContextMsg}`;
        } else if (lower.includes('besle') || lower.includes('şurup') || lower.includes('kek')) {
          ans = agentNameHeader + `🌾 <b>Mevsimsel Besleme Reçetesi:</b><br>Arılığınız (${activeApiary ? activeApiary.name : 'Diyarbakır Eğil'}) için:<br>• Nektar akımı varsa beslemeyi durdurun.<br>• Akım bitiminde kuluçkayı teşvik için 1:1 Şurup, kış stoku için 2:1 Koyu Şurup/Kek verin.`;
        } else if (lower.includes('ana arı') || lower.includes('ırk')) {
          ans = agentNameHeader + `🧬 <b>Ana Arı & Genetik İslah:</b><br>Sistemdeki <b>${queens.length} adet Ana Arı</b> analiz edildi.<br>• Bölgeniz (${activeApiary ? activeApiary.location : 'Diyarbakır'}) için yüksek bal verimli <b>Karniyol F1</b> ve soğuğa/hastalıklara dirençli <b>Kafkas Saf</b> ırkları önerilir.`;
        }
        resEl.innerHTML = ans;
      }, 500);
    },

    submitTask() {
      const task = {
        id: 'task_' + Date.now().toString(36),
        name: document.getElementById('beeos-task-name').value.trim(),
        agent: document.getElementById('beeos-task-agent').value,
        priority: document.getElementById('beeos-task-priority').value,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      tasks.unshift(task);
      localStorage.setItem('beeos_tasks', JSON.stringify(tasks));

      document.getElementById('beeos-task-name').value = '';
      BM.Toast.show('Görev oluşturuldu ✓', 'success');
      App.render('beeos');
      return false;
    },

    toggleTaskStatus(taskId) {
      const tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      const idx = tasks.findIndex(t => t.id === taskId);
      if (idx >= 0) {
        const statuses = ['pending', 'in_progress', 'done'];
        const currentIdx = statuses.indexOf(tasks[idx].status);
        tasks[idx].status = statuses[(currentIdx + 1) % statuses.length];
        localStorage.setItem('beeos_tasks', JSON.stringify(tasks));
        App.render('beeos');
      }
    },

    deleteTask(taskId) {
      let tasks = JSON.parse(localStorage.getItem('beeos_tasks') || '[]');
      tasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem('beeos_tasks', JSON.stringify(tasks));
      BM.Toast.show('Görev silindi', 'info');
      App.render('beeos');
    }
  };
})(window);

const App = {
    currentView: 'dashboard',
    viewParam: null,

    nav(view, param) {
      this.currentView = view;
      this.viewParam = param;

      // Close sidebar on mobile (proper cleanup)
      this.closeSidebar();

      // Update active states
      document.querySelectorAll('.view').forEach(v => v.classList.remove('view--active'));
      document.querySelectorAll('[data-view]').forEach(n => n.classList.remove('nav-item--active', 'bottom-nav__item--active'));

      // Special: hive detail
      if (view === 'hive-detail') {
        // Render handled by hivesModule.detail
        return;
      }

      const viewEl = document.getElementById('view-' + view);
      if (viewEl) {
        viewEl.classList.add('view--active');
        this.render(view);
      }
      document.querySelectorAll(`[data-view="${view}"]`).forEach(n => {
        if (n.classList.contains('nav-item') || n.classList.contains('bottom-nav__item')) {
          n.classList.add(n.classList.contains('nav-item') ? 'nav-item--active' : 'bottom-nav__item--active');
        }
      });

      // Update header
      const titles = {
        dashboard: ['Dashboard', function() {
          const a = BM.Storage.list('apiaries').find(x => x.id === BM.Storage.state.activeApiaryId);
          return 'Genel bakış · ' + (a?.name || 'Eğil, Diyarbakır');
        }],
        apiaries: ['Arı Üsleri', BM.Storage.list('apiaries').length + ' üs'],
        hives: ['Kovanlar', BM.Storage.list('hives').length + ' kovan'],
        inspections: ['Muayeneler', BM.Storage.list('inspections').length + ' kayıt'],
        tasks: ['Görevler & Takvim', function() {
          const pending = BM.Storage.list('tasks').filter(t => t.status === 'pending').length;
          return pending + ' yapılacak görev';
        }],
        harvest: ['Bal Hasadı', BM.fmt(BM.Storage.list('harvests').reduce((s, h) => s + h.weight, 0)) + ' kg'],
        feeding: ['Besleme', BM.Storage.list('feedings').length + ' kayıt'],
        treatments: ['Tedaviler', BM.Storage.list('treatments').length + ' kayıt'],
        diseases: ['Hastalıklar', BM.Storage.list('diseases').length + ' kayıt'],
        queens: ['Ana Arılar', BM.Storage.list('queens').length + ' kayıt'],
        inventory: ['Envanter', BM.Storage.list('inventory').length + ' malzeme'],
        analytics: ['Analitik', 'Tüm verilerden içgörüler'],
        reports: ['Raporlar', '6 hazır şablon'],
        settings: ['Ayarlar', 'Uygulama ve veri'],
        beeos: ['⬡ BeeOS', 'Ajan Orkestrasyon Sistemi v0.1']
      };
      const t = titles[view] || [view, ''];
      document.getElementById('page-title').textContent = t[0];
      document.getElementById('page-subtitle').textContent = typeof t[1] === 'function' ? t[1]() : t[1];

      // Update URL hash
      if (param) {
        location.hash = view + '/' + param;
      } else if (location.hash !== '#' + view) {
        location.hash = view;
      }
      window.scrollTo(0, 0);
    },

    render(view) {
      const m = BM[view];
      if (m && typeof m.render === 'function') {
        const el = document.getElementById('view-' + view);
        if (el) {
          el.innerHTML = m.render(this.viewParam);
          if (typeof m.afterRender === 'function') {
            m.afterRender();
          }
        }
      }
    },

    toggleTheme() {
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      document.getElementById('theme-toggle').textContent = next === 'dark' ? '🌙' : '☀️';
      try { localStorage.setItem('bm-theme', next); } catch (e) {}
    },

    toggleSidebar() {
      const sb = document.getElementById('app-sidebar');
      let bd = document.getElementById('sidebar-backdrop');
      if (!bd) {
        bd = document.createElement('div');
        bd.id = 'sidebar-backdrop';
        bd.className = 'sidebar-backdrop';
        bd.addEventListener('click', () => this.closeSidebar());
        document.body.appendChild(bd);
      }
      bd.style.position = 'fixed';
      bd.style.inset = '0';
      bd.style.zIndex = '999';
      if (!sb) return;
      const isOpen = sb.classList.contains('sidebar--open');
      if (isOpen) {
        this.closeSidebar();
      } else {
        sb.classList.add('sidebar--open');
        bd.classList.add('active');
        document.body.classList.add('sidebar-open');
        const hb = document.querySelector('.sidebar-toggle');
        if (hb) hb.style.display = 'none';
      }
    },

    closeSidebar() {
      const sb = document.getElementById('app-sidebar');
      const bd = document.getElementById('sidebar-backdrop');
      if (sb) sb.classList.remove('sidebar--open');
      if (bd) bd.classList.remove('active');
      document.body.classList.remove('sidebar-open');
      const hb = document.querySelector('.sidebar-toggle');
      if (hb) hb.style.display = '';
    },

    // Global arama — tüm modüllerde arar
    search() {
      const searchable = [
        { coll: 'apiaries',    icon: '📍', label: 'Üs',        fields: ['name', 'address', 'notes'], view: 'apiaries' },
        { coll: 'hives',       icon: '🏠', label: 'Kovan',     fields: ['name', 'nfcTag', 'notes', 'strain', 'boxType'], view: 'hives' },
        { coll: 'queens',      icon: '👑', label: 'Ana Arı',   fields: ['name', 'markingColor', 'supplier'], view: 'queens' },
        { coll: 'inspections', icon: '📋', label: 'Muayene',   fields: ['notes', 'date'], view: 'inspections' },
        { coll: 'harvests',    icon: '🍯', label: 'Hasat',     fields: ['notes', 'quality'], view: 'harvest' },
        { coll: 'feedings',    icon: '🌾', label: 'Besleme',   fields: ['notes'], view: 'feeding' },
        { coll: 'treatments',  icon: '💊', label: 'Tedavi',    fields: ['product', 'notes'], view: 'treatment' },
        { coll: 'diseases',    icon: '🦠', label: 'Hastalık',  fields: ['notes'], view: 'disease' }
      ];

      const html = `
        <div style="padding:var(--space-2) 0">
          <div style="position:relative;margin-bottom:var(--space-4)">
            <input type="text" id="search-input" class="input" placeholder="Üs, kovan, ana arı, muayene notu..." 
              style="width:100%;padding:var(--space-4) var(--space-4) var(--space-4) 44px;font-size:15px;border-radius:var(--radius-md);border:1px solid var(--n-700);background:var(--bg-secondary)" autofocus>
            <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:18px;opacity:0.6">🔍</span>
          </div>
          <div id="search-results" style="max-height:50vh;overflow:auto">
            <div style="text-align:center;color:var(--text-muted);padding:var(--space-4)">Yazmaya başlayın...</div>
          </div>
          <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--n-800);font-size:11px;color:var(--text-muted);display:flex;gap:var(--space-3)">
            <span>💡 ${BM.Storage.list('hives').length} kovan</span>
            <span>• ${BM.Storage.list('apiaries').length} üs</span>
            <span>• ${BM.Storage.list('inspections').length} muayene</span>
          </div>
        </div>`;

      BM.Modal.open('🔍 Arama', html, () => {});

      const input = document.getElementById('search-input');
      const results = document.getElementById('search-results');

      const escapeHtml = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

      const performSearch = (q) => {
        q = q.trim().toLowerCase();
        if (!q) {
          results.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:var(--space-4)">Yazmaya başlayın...</div>';
          return;
        }
        const matches = [];
        for (const s of searchable) {
          const items = BM.Storage.list(s.coll);
          for (const it of items) {
            for (const f of s.fields) {
              const v = String(it[f] || '').toLowerCase();
              if (v && v.includes(q)) {
                let subtitle = '';
                if (s.coll === 'hives') {
                  const ap = BM.Storage.get('apiaries', it.apiaryId);
                  subtitle = `${ap ? escapeHtml(ap.name) : 'Üssüz'} · ${BM.T.strain(it.strain)} · ${BM.T.box(it.boxType)}`;
                } else if (s.coll === 'apiaries') {
                  subtitle = `${BM.Storage.list('hives').filter(h => h.apiaryId === it.id).length} kovan`;
                } else if (s.coll === 'queens') {
                  subtitle = `${it.birthDate || ''} · ${BM.T.strain(it.strain)}`;
                } else if (s.coll === 'inspections') {
                  const h = BM.Storage.get('hives', it.hiveId);
                  subtitle = `${BM.dateStr(it.date)} · ${h ? escapeHtml(h.name) : '?'} · Varroa: ${it.varroaCount}`;
                } else if (s.coll === 'harvests') {
                  const h = BM.Storage.get('hives', it.hiveId);
                  subtitle = `${BM.dateStr(it.date)} · ${h ? escapeHtml(h.name) : '?'} · ${it.weight} kg`;
                }
                matches.push({
                  collection: s,
                  item: it,
                  field: f,
                  subtitle,
                  fieldMatch: v.indexOf(q) >= 0 ? f : null
                });
                break; // Her item'dan 1 match yeter
              }
            }
          }
        }
        if (!matches.length) {
          results.innerHTML = `<div style="text-align:center;color:var(--text-muted);padding:var(--space-6)">
            <div style="font-size:32px;margin-bottom:var(--space-2)">🤷</div>
            <div>"<strong>${escapeHtml(q)}</strong>" için sonuç yok</div>
          </div>`;
          return;
        }
        results.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);margin-bottom:var(--space-2)">${matches.length} sonuç</div>` +
          matches.slice(0, 50).map(m => {
            const view = m.collection.view;
            const id = m.item.id;
            const titleHtml = (() => {
              const name = m.item.name || `${m.collection.label} #${id.slice(-6)}`;
              const lower = escapeHtml(name).toLowerCase();
              const qEsc = escapeHtml(q);
              const idx = lower.indexOf(q.toLowerCase());
              if (idx < 0) return escapeHtml(name);
              return escapeHtml(name.slice(0, idx)) + '<mark style="background:var(--honey-500);color:var(--n-950);padding:0 2px;border-radius:2px">' + escapeHtml(name.slice(idx, idx + q.length)) + '</mark>' + escapeHtml(name.slice(idx + q.length));
            })();
            return `<div class="card" style="padding:var(--space-3);margin-bottom:var(--space-2);cursor:pointer;display:flex;align-items:center;gap:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>App.handleSearchResult('${view}','${id}','${m.collection.coll}'),200)">
              <div style="font-size:20px">${m.collection.icon}</div>
              <div style="flex:1;min-width:0">
                <div style="font-weight:600;font-size:14px">${titleHtml}</div>
                <div style="font-size:11px;color:var(--text-secondary);margin-top:2px">${m.subtitle || m.collection.label}</div>
              </div>
              <div style="font-size:11px;color:var(--text-muted)">${m.collection.label}</div>
            </div>`;
          }).join('');
      };

      input.addEventListener('input', e => performSearch(e.target.value));
      // Enter ile ilk sonuca git
      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          const first = results.querySelector('.card');
          if (first) first.click();
        }
      });
      // ESC ile kapat
      input.addEventListener('keydown', e => {
        if (e.key === 'Escape') BM.Modal.close();
      });
    },

    // Arama sonucuna tıklayınca detaya git
    handleSearchResult(view, id, coll) {
      if (coll === 'hives') {
        this.nav(view, id);  // nav fonksiyonu zaten detail'i yönlendirir
      } else {
        this.nav(view);
      }
    },

    quickAdd() {
      BM.Modal.open('+ Hızlı Ekle',
        `<div style="display:grid;gap:var(--space-3);padding:var(--space-2) 0">
          <p style="font-size:13px;color:var(--text-secondary);margin-bottom:var(--space-2)">Hızlıca yeni kayıt ekle:</p>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.hives.add(),200)">🏠 Yeni Kovan</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.apiaries.add(),200)">📍 Yeni Üs</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.inspections.add(),200)">📋 Yeni Muayene</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.harvest.add(),200)">🍯 Yeni Hasat</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.feeding.add(),200)">🌾 Yeni Besleme</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.treatments.add(),200)">💊 Yeni Tedavi</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.queens.add(),200)">👑 Yeni Ana Arı</button>
          <button type="button" class="btn btn--primary" style="justify-content:flex-start;padding:var(--space-3)" onclick="BM.Modal.close();setTimeout(()=>BM.inventory.add(),200)">📦 Yeni Malzeme</button>
        </div>`,
        () => false,
        { hideFooter: true }
      );
    },

    exportData() {
      const blob = new Blob([JSON.stringify(BM.Storage.state, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'beemaster-backup-' + BM.today() + '.json';
      a.click();
      BM.Toast.show('Veri dışa aktarıldı ✓', 'success');
    },

    importData() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';
      input.onchange = e => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
          try {
            const data = JSON.parse(ev.target.result);
            if (!data.apiaries || !data.hives) throw new Error('Geçersiz format');
            BM.Modal.confirm('Mevcut veriler değiştirilecek. Devam edilsin mi?', () => {
              BM.Storage.state = data;
              BM.Storage.save();
              BM.Toast.show('Veri içe aktarıldı ✓', 'success');
              App.render(App.currentView);
            });
          } catch (err) {
            BM.Toast.show('Geçersiz dosya: ' + err.message, 'error');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    },

    syncNow() {
      if (!BM.Auth || !BM.Auth.isAuthenticated || !BM.Auth.isAuthenticated()) {
        BM.Toast.show('Önce giriş yapın', 'error');
        return;
      }
      BM.Toast.show('🔄 Senkronize ediliyor...', 'info');
      BM.Storage.syncFromCloud(true).then(function() {
        var total = 0;
        ['apiaries','hives','queens','inspections','frames','harvests','feedings'].forEach(function(c) {
          total += (BM.Storage.state[c] || []).length;
        });
        BM.Toast.show('✅ ' + total + ' kayıt senkronize edildi', 'success');
        if (typeof App !== 'undefined' && App.render) App.render(App.currentView || 'dashboard');
      }).catch(function(e) {
        BM.Toast.show('❌ Hata: ' + (e.message || 'bilinmeyen'), 'error');
      });
    },

    resetData() {
      BM.Modal.confirm('⚠️ TÜM veriler silinecek ve örnek verilerle değiştirilecek. Bu işlem geri alınamaz!', () => {
        BM.Storage.reset();
        BM.Toast.show('Veriler sıfırlandı', 'info');
        App.nav('dashboard');
      });
    },

    // Buluttaki TÜM verileri sil — login sonrası 22 kovan gibi eski test verilerini temizle
    async resetCloudData() {
      if (!BM.Auth || !BM.Auth.isAuthenticated || !BM.Auth.isAuthenticated()) {
        BM.Toast.show('Önce giriş yapın', 'error');
        return;
      }
      BM.Modal.confirm('☁️ Buluttaki TÜM veriler (kullanıcınızın hesabındaki) silinecek. Bu işlem geri alınamaz! Devam?', async () => {
        const tables = ['apiaries', 'hives', 'queens', 'frames', 'inspections', 'harvests', 'feedings', 'treatments', 'diseases', 'inventory'];
        const client = BM.Auth.getClient();
        const token = localStorage.getItem('beemaster-auth-token');
        let deleted = 0;
        BM.Toast.show('Bulut verileri siliniyor...', 'info');
        for (const t of tables) {
          try {
            const r = await fetch(`https://assfwtjbvuuxclioqsih.supabase.co/rest/v1/${t}?user_id=neq.00000000-0000-0000-0000-000000000000`, {
              method: 'DELETE',
              headers: {
                'apikey': window.__SUPABASE_ANON_KEY__,
                'Authorization': `Bearer ${token}`
              }
            });
            if (r.ok) deleted++;
          } catch (e) {
            console.log('Delete error', t, e);
          }
        }
        // Local state'i de temizle
        BM.Storage.state = {
          apiaries: [], hives: [], queens: [], frames: [],
          inspections: [], harvests: [], feedings: [],
          treatments: [], diseases: [], inventory: []
        };
        BM.Storage.save();
        BM.Toast.show(`✅ ${deleted} tablodan tüm veriler silindi`, 'success');
        App.nav('dashboard');
      });
    },

    buildLayout() {
      // Sidebar
      const sb = document.getElementById('app-sidebar');
      sb.innerHTML = `
        <div class="sidebar__brand">
          <div class="sidebar__brand-mark">🐝</div>
          <div class="sidebar__brand-name">BeeMaster AI</div>
        </div>
        <nav class="sidebar__nav">
          ${NAV.map(g => `
            <div class="sidebar__group">${g.group}</div>
            ${g.items.map(it => `
              <button type="button" class="nav-item${it.view === App.currentView ? ' nav-item--active' : ''}" data-view="${it.view}" onclick="App.nav('${it.view}')">
                <span class="nav-item__icon">${it.icon}</span>${it.label}
              </button>
            `).join('')}
          `).join('')}
        </nav>
        <div class="sidebar__foot">
          <div class="user-card" id="sidebar-user-card" onclick="if(window.BM&&BM.Auth&&BM.Auth.isAuthenticated&&BM.Auth.isAuthenticated()){App.nav('settings')}else{if(window.BM&&BM.Auth&&BM.Auth.showLoginModal)BM.Auth.showLoginModal()}">
            <div class="user-card__avatar" id="sidebar-user-avatar">?</div>
            <div>
              <div class="user-card__name" id="sidebar-user-name">Giriş Yap</div>
              <div class="user-card__role" id="sidebar-user-role">Misafir · Veriler cihazınızda</div>
            </div>
          </div>
        </div>
      `;

      // Bottom nav (mobile) — iOS-style glass tab bar
      const bn = document.getElementById('app-bottom-nav');
      const tabs = [
        { id: 'dashboard', icon: '📊', label: 'Ana Sayfa' },
        { id: 'hives', icon: '🏠', label: 'Kovan' },
        { id: 'inspections', icon: '🔍', label: 'Muayene' },
        { id: 'harvest', icon: '🍯', label: 'Hasat' },
        { id: 'quickAdd', icon: '➕', label: 'Ekle' }
      ];
      bn.innerHTML = tabs.map(t => {
        if (t.id === 'quickAdd') {
          return `<button type="button" class="bottom-nav__item bottom-nav__item--add" onclick="App.quickAdd()">
            <span class="bottom-nav__icon">${t.icon}</span>${t.label}
          </button>`;
        }
        const active = App.currentView === t.id ? ' bottom-nav__item--active' : '';
        return `<button type="button" class="bottom-nav__item${active}" data-view="${t.id}" onclick="App.nav('${t.id}')">
          <span class="bottom-nav__icon">${t.icon}</span>${t.label}
        </button>`;
      }).join('');
    },

    init() {
      // Theme
      try {
        const saved = localStorage.getItem('bm-theme');
        if (saved) {
          document.documentElement.setAttribute('data-theme', saved);
          document.getElementById('theme-toggle').textContent = saved === 'dark' ? '🌙' : '☀️';
        }
      } catch (e) {}

      // ESC closes modal
      document.addEventListener('keydown', e => { if (e.key === 'Escape') BM.Modal.close(); });

      // Hash routing
      window.addEventListener('hashchange', () => {
        const hash = location.hash.slice(1) || 'dashboard';
        const [view, param] = hash.split('/');
        if (view && view !== App.currentView) {
          if (view === 'hive-detail' && param) {
            BM.hives.detail(param);
          } else {
            App.nav(view, param);
          }
        }
      });

      // Service worker + cache TEMIZLE
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
      }
      // Tüm cache'leri temizle (eski bundle kalmasın)
      if ('caches' in window) {
        caches.keys().then(names => names.forEach(n => caches.delete(n)));
      }

      // Build layout
      this.buildLayout();

      // Initial route
      const hash = location.hash.slice(1) || 'dashboard';
      const [view, param] = hash.split('/');
      if (view === 'hive-detail' && param) {
        BM.hives.detail(param);
      } else {
        this.nav(view || 'dashboard', param);
      }

      // Onboarding removed - user goes directly to dashboard
      localStorage.setItem('bm-onboarded', '1');

      // Supabase auth check - async, sonucu sonra yuklenir
      if (BM.Auth && typeof BM.Auth.initFromStorage === 'function') {
        BM.Auth.initFromStorage().then(() => {
          if (BM.Auth.isAuthenticated()) {
            console.log('[Auth] Auto-logged in as', BM.Auth.getUser().email);
            if (BM.Storage && typeof BM.Storage.syncFromCloud === 'function') {
              BM.Storage.syncFromCloud();
            }
          }
        });
      }

      // Bildirim kontrolü (3 sn sonra)
      setTimeout(() => BM.notify.check(), 3000);

      console.log('[BeeMaster AI v3.0] Spec-driven PWA · 12 modules · clean architecture');
    }
  };

  BM.App = App;
  global.App = App;
})(window);
