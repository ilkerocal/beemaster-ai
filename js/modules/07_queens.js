(function(global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  var queensModule = {
    // ============ AI PERFORMANS HESAPLAMA (YÖNTEM B) ============
    // Spec 05_Modules/Queens.md & Spec 07_AI_Agents.md
    // 4 Sütun: Verim (%35) + Sağlık/Varroa (%25) + Yavru Düzeni (%20) + Huy (%20) - Yaş Cezası
    calculateMetrics(queenOrId) {
      const q = typeof queenOrId === 'object' ? queenOrId : BM.Storage.get('queens', queenOrId);
      if (!q) return null;

      const hive = q.hiveId ? BM.Storage.get('hives', q.hiveId) : null;
      const inspections = q.hiveId ? BM.Storage.list('inspections').filter(i => i.hiveId === q.hiveId) : [];
      const harvests = q.hiveId ? BM.Storage.list('harvests').filter(h => h.hiveId === q.hiveId) : [];
      const allHarvests = BM.Storage.list('harvests');

      const recentInsp = inspections.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);

      // 1. Verim Etkisi (Productivity Impact - %35)
      let productivityScore = 0.80; // Varsayılan temel skor
      let honeyKg = 0;
      if (harvests.length > 0) {
        honeyKg = harvests.reduce((s, h) => s + (Number(h.weight) || 0), 0);
        const totalHives = Math.max(1, BM.Storage.list('hives').length);
        const avgHoneyAll = allHarvests.length > 0 ? (allHarvests.reduce((s, h) => s + (Number(h.weight) || 0), 0) / totalHives) : 25;
        const ratio = honeyKg / Math.max(1, avgHoneyAll);
        productivityScore = Math.min(1.0, Math.max(0.30, 0.50 + (ratio * 0.35)));
      }

      // 2. Sağlık & Varroa / Hastalık Direnci (%25)
      let healthScore = 0.85;
      let avgVarroa = 0;
      if (recentInsp.length > 0) {
        avgVarroa = recentInsp.reduce((s, i) => s + (Number(i.varroaCount) || 0), 0) / recentInsp.length;
        if (avgVarroa <= 1) healthScore = 1.0;
        else if (avgVarroa <= 2) healthScore = 0.90;
        else if (avgVarroa <= 3) healthScore = 0.75;
        else if (avgVarroa <= 5) healthScore = 0.60;
        else healthScore = 0.35;
      }

      // 3. Yumurtlama & Yavru Düzeni (%20)
      let broodScore = 0.85;
      if (recentInsp.length > 0) {
        let totalBroodPoints = 0;
        recentInsp.forEach(i => {
          let p = 0.75;
          if (i.eggsPattern === 'regular' || i.eggsPattern === 'compact') p += 0.15;
          else if (i.eggsPattern === 'irregular') p -= 0.25;
          else if (i.eggsPattern === 'absent') p -= 0.40;

          if (i.queenSeen === 'seen' || i.queenSeen === true) p += 0.10;
          else if (i.queenSeen === 'absent') p -= 0.20;

          const bFrames = Number(i.broodFrames) || 0;
          if (bFrames >= 4) p += 0.10;
          else if (bFrames <= 1) p -= 0.15;

          totalBroodPoints += Math.max(0.10, Math.min(1.0, p));
        });
        broodScore = totalBroodPoints / recentInsp.length;
      }

      // 4. Koloni Huyu & Sakinlik Skoru (%20)
      let temperamentScore = 0.85;
      const tempMap = { calm: 1.0, moderate: 0.75, nervous: 0.50, aggressive: 0.25, very_aggressive: 0.10 };
      if (hive && hive.temperament && tempMap[hive.temperament]) {
        temperamentScore = tempMap[hive.temperament];
      }

      // 5. Yaş Faktörü & Değişim Cezası
      let agePenalty = 0;
      let ageMonths = 0;
      if (q.birthDate) {
        ageMonths = Math.max(0, Math.round((Date.now() - new Date(q.birthDate).getTime()) / (30.44 * 864e5)));
        if (ageMonths > 36) {
          agePenalty = 0.25; // 3 yaş üzeri
        } else if (ageMonths > 24) {
          agePenalty = 0.10; // 2 yaş üzeri
        }
      }

      const totalWeighted = (productivityScore * 0.35) + (healthScore * 0.25) + (broodScore * 0.20) + (temperamentScore * 0.20) - agePenalty;
      const finalScore = Math.max(0.10, Math.min(1.0, Math.round(totalWeighted * 100) / 100));

      let recommendation = '';
      let statusBadge = '';
      if (finalScore >= 0.85) {
        statusBadge = '⭐ Damızlık Adayı';
        recommendation = 'Mükemmel performans. Kendi yetiştirme ve larva transferi için damızlık olarak kullanılabilir.';
      } else if (finalScore >= 0.70) {
        statusBadge = '✅ Sağlıklı & Verimli';
        recommendation = 'Yumurtlama ve bal verimi yüksek, koloni dengesi iyi durumda.';
      } else if (finalScore >= 0.50) {
        statusBadge = '⚠️ Gözlem Gerekli';
        recommendation = 'Performans ortalama düzeyde. Yavru düzenini ve Varroa baskısını düzenli takip edin.';
      } else {
        statusBadge = '🚨 Değişim Tavsiye Edilir';
        recommendation = 'Yumurtlama düzeni zayıf veya yaşlı ana arı. Koloni sönmeden ana arı değişimi önerilir.';
      }

      return {
        score: finalScore,
        percentage: Math.round(finalScore * 100),
        breakdown: {
          productivity: Math.round(productivityScore * 100),
          health: Math.round(healthScore * 100),
          broodPattern: Math.round(broodScore * 100),
          temperament: Math.round(temperamentScore * 100),
          agePenalty: Math.round(agePenalty * 100)
        },
        ageMonths,
        inspectionsCount: recentInsp.length,
        harvestsCount: harvests.length,
        totalHoney: honeyKg,
        avgVarroa: avgVarroa.toFixed(1),
        statusBadge,
        recommendation
      };
    },

    // Tek bir ana arının skorunu otomatik güncelle
    recalculate(queenId) {
      const q = BM.Storage.get('queens', queenId);
      if (!q) return null;
      const metrics = this.calculateMetrics(q);
      if (!metrics) return null;
      BM.Storage.update('queens', q.id, { performanceScore: metrics.score });
      return metrics;
    },

    // Belirli bir kovandaki ana arının skorunu otomatik güncelle
    recalculateForHive(hiveId) {
      if (!hiveId) return;
      const q = BM.Storage.list('queens').find(x => x.hiveId === hiveId && x.status === 'active') ||
                BM.Storage.list('queens').find(x => x.hiveId === hiveId);
      if (q) {
        this.recalculate(q.id);
      }
    },

    // Tüm ana arıların skorlarını Yöntem B'ye göre toplu güncelle
    recalculateAll() {
      const list = BM.Storage.list('queens');
      let count = 0;
      list.forEach(q => {
        const m = this.calculateMetrics(q);
        if (m) {
          BM.Storage.update('queens', q.id, { performanceScore: m.score });
          count++;
        }
      });
      BM.Toast.show(`✓ ${count} ana arının performansı muayene ve hasat kayıtlarına göre güncellendi`, 'success');
      App.render('queens');
    },

    add(presetHiveId) {
      if (!BM.Storage.list('hives').length) { BM.Toast.show('Önce kovan ekleyin', 'error'); return; }
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${presetHiveId === h.id ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Yeni Ana Arı',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" id="q-hiveId" name="hiveId" required onchange="BM.queens.previewAIScore()">${hOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk *</span>
             <select class="select" name="strain" required>
               ${['anatolian','caucasian','carniolan','buckfast','carpathian','italian','cyprian','syrian','egyptian','hybrid','survivor'].map(s => `<option value="${s}">${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">İşaret Rengi</span>
             <select class="select" name="markedColor">
               ${['white','yellow','red','green','blue'].map(c => `<option value="${c}">${BM.T.color(c)}</option>`).join('')}
             </select></label>
         </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Doğum *</span>
              <input class="input" name="birthDate" type="date" required value="${BM.today()}"></label>
            <label class="field"><span class="field-label">Ana Arı Durumu</span>
              <select class="select" name="queenState">
                ${['laying','virgin','cell','mating','old'].map(st => `<option value="${st}">${BM.T.queenState(st)}</option>`).join('')}
              </select></label>
          </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Kaynak</span>
              <select class="select" name="source">
                ${['bred','purchased','swarm','supersedure','emergency'].map(s => `<option value="${s}">${BM.T.source(s)}</option>`).join('')}
              </select></label>
            <label class="field"><span class="field-label">Fiziksel Özellikler</span>
              <div style="display:flex;gap:12px;margin-top:6px">
                <label style="display:flex;align-items:center;gap:4px;font-size:13px"><input type="checkbox" name="isMarked" value="true" checked> 🎨 İşaretli</label>
                <label style="display:flex;align-items:center;gap:4px;font-size:13px"><input type="checkbox" name="isClipped" value="true"> ✂️ Kanat Kesik</label>
              </div></label>
          </div>
          <div class="field-row">
            <label class="field"><span class="field-label">Tedarikçi</span>
              <input class="input" name="supplier" placeholder="Örn: Kafkas Arıcılık"></label>
            <label class="field"><span class="field-label">Maliyet (₺)</span>
              <input class="input" name="costTry" type="number" min="0" placeholder="0"></label>
          </div>
          
          <div style="background:var(--bg-tertiary);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3)">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:12px;font-weight:600;color:var(--text-primary)">🤖 Otomatik AI Performans Puanı (Yöntem B)</span>
              <button type="button" class="btn btn--sm btn--ghost" onclick="BM.queens.previewAIScore()" style="font-size:11px;color:var(--honey-500);padding:2px 8px">⚡ Hesapla</button>
            </div>
            <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
              <input class="input" id="q-perf-input" name="performanceScore" type="number" min="0" max="100" value="85" style="width:100px;font-weight:700">
              <div id="q-perf-hint" style="font-size:11px;color:var(--text-secondary);line-height:1.4">Muayene ve hasat verilerine göre otomatik hesaplanır.</div>
            </div>
          </div>

          <label class="field"><span class="field-label">Notlar</span>
            <textarea class="textarea" name="notes" rows="2" placeholder="Soy ağacı, ana arı yetiştirme notları..."></textarea></label>`,
        async (d) => {
          d.performanceScore = Math.max(0, Math.min(1, parseInt(d.performanceScore || 80) / 100));
          if (d.costTry) d.costTry = parseFloat(d.costTry);
          d.isMarked = !!d.isMarked;
          d.isClipped = !!d.isClipped;
          const q = await BM.Storage.add('queens', { ...d, status: 'active' });
          const h = BM.Storage.get('hives', d.hiveId);
          if (h) BM.Storage.update('hives', h.id, { queenId: q.id });
          // Hemen Yöntem B ile kesin hesap yap
          BM.queens.recalculate(q.id);
          BM.Toast.show('Ana arı eklendi ve AI performansı hesaplandı ✓', 'success');
          App.render('queens');
          return true;
        }
      );
      setTimeout(() => this.previewAIScore(), 100);
    },

    edit(id) {
      const q = BM.Storage.get('queens', id);
      if (!q) return;
      const metrics = this.calculateMetrics(q);
      const hOpts = BM.Storage.list('hives').map(h => `<option value="${h.id}"${h.id === q.hiveId ? ' selected' : ''}>${BM.esc(h.name)}</option>`).join('');
      BM.Modal.open('Ana Arı Düzenle',
        `<label class="field"><span class="field-label">Kovan *</span>
           <select class="select" id="q-hiveId" name="hiveId" required onchange="BM.queens.previewAIScore('${q.id}')">${hOpts}</select></label>
         <div class="field-row">
           <label class="field"><span class="field-label">Irk</span>
             <select class="select" name="strain">
               ${['anatolian','caucasian','carniolan','buckfast','carpathian','italian','cyprian','syrian','egyptian','hybrid','survivor'].map(s => `<option value="${s}"${q.strain === s ? ' selected' : ''}>${BM.T.strain(s)}</option>`).join('')}
             </select></label>
           <label class="field"><span class="field-label">İşaret</span>
             <select class="select" name="markedColor">
               ${['white','yellow','red','green','blue'].map(c => `<option value="${c}"${q.markedColor === c ? ' selected' : ''}>${BM.T.color(c)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Doğum</span>
             <input class="input" name="birthDate" type="date" required value="${q.birthDate}"></label>
           <label class="field"><span class="field-label">Kaynak</span>
             <select class="select" name="source">
               ${['bred','purchased','swarm','supersedure','emergency'].map(s => `<option value="${s}"${q.source === s ? ' selected' : ''}>${BM.T.source(s)}</option>`).join('')}
             </select></label>
         </div>
         <div class="field-row">
           <label class="field"><span class="field-label">Tedarikçi</span>
             <input class="input" name="supplier" value="${BM.esc(q.supplier || '')}"></label>
           <label class="field"><span class="field-label">Maliyet (₺)</span>
             <input class="input" name="costTry" type="number" value="${q.costTry || ''}"></label>
         </div>

         <div style="background:var(--bg-tertiary);border:1px solid var(--n-800);border-radius:var(--radius-md);padding:var(--space-3);margin-bottom:var(--space-3)">
           <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
             <span style="font-size:12px;font-weight:600;color:var(--text-primary)">🤖 AI Performans Puanı (Yöntem B)</span>
             <button type="button" class="btn btn--sm btn--ghost" onclick="BM.queens.previewAIScore('${q.id}')" style="font-size:11px;color:var(--honey-500);padding:2px 8px">⚡ Yeniden Hesapla</button>
           </div>
           <div style="display:flex;align-items:center;gap:12px;margin-top:8px">
             <input class="input" id="q-perf-input" name="performanceScore" type="number" min="0" max="100" value="${(q.performanceScore * 100).toFixed(0)}" style="width:100px;font-weight:700">
             <div id="q-perf-hint" style="font-size:11px;color:var(--text-secondary);line-height:1.4">
               ${metrics ? `Verim: %${metrics.breakdown.productivity} · Varroa: %${metrics.breakdown.health} · Yavru: %${metrics.breakdown.broodPattern}` : 'Kovan muayenelerine göre otomatik hesaplanır.'}
             </div>
           </div>
         </div>

         <label class="field"><span class="field-label">Durum</span>
           <select class="select" name="status">
             ${['active','superseded','dead','sold','missing'].map(s => `<option value="${s}"${q.status === s ? ' selected' : ''}>${BM.T.status(s)}</option>`).join('')}
           </select></label>
         <label class="field"><span class="field-label">Notlar</span>
           <textarea class="textarea" name="notes" rows="2">${BM.esc(q.notes || '')}</textarea></label>`,
        (d) => {
          d.performanceScore = Math.max(0, Math.min(1, parseInt(d.performanceScore || 80) / 100));
          if (d.costTry) d.costTry = parseFloat(d.costTry);
          BM.Storage.update('queens', id, d);
          BM.Toast.show('Ana arı güncellendi ✓', 'success');
          App.render('queens');
          return true;
        }
      );
    },

    previewAIScore(queenId) {
      const hiveSelect = document.getElementById('q-hiveId');
      const input = document.getElementById('q-perf-input');
      const hint = document.getElementById('q-perf-hint');
      if (!input) return;

      const hiveId = hiveSelect ? hiveSelect.value : null;
      let metrics = null;
      if (queenId) {
        metrics = this.calculateMetrics(queenId);
      } else if (hiveId) {
        metrics = this.calculateMetrics({ hiveId, birthDate: BM.today() });
      }

      if (metrics) {
        input.value = metrics.percentage;
        if (hint) {
          hint.innerHTML = `<b>${metrics.statusBadge}</b> · Verim: %${metrics.breakdown.productivity} · Sağlık: %${metrics.breakdown.health} · Yavru: %${metrics.breakdown.broodPattern} · Huy: %${metrics.breakdown.temperament}`;
        }
        BM.Toast.show(`AI Performans Skoru: %${metrics.percentage} (${metrics.statusBadge})`, 'info');
      }
    },

    del(id) {
      BM.Modal.confirm('Bu ana arıyı silmek istiyor musunuz?', () => {
        BM.Storage.remove('queens', id);
        BM.Toast.show('Ana arı silindi', 'info');
        App.render('queens');
      });
    },

    render() {
      const list = BM.Storage.list('queens');
      return `<div class="actions-bar">
        <div>
          <h2 style="font-size:18px;font-weight:700">Ana Arılar</h2>
          <div style="color:var(--text-secondary);font-size:12px;margin-top:2px">${list.length} ana arı · Yöntem B (Muayene & Hasat tabanlı AI Puanlama)</div>
        </div>
        <div style="display:flex;gap:var(--space-2)">
          <button class="btn btn--ghost" onclick="BM.queens.recalculateAll()" title="Tüm ana arıların skorlarını güncel muayene ve hasatlara göre yeniden hesapla">⚡ Tümünü Hesapla</button>
          <button class="btn btn--primary" onclick="BM.queens.add()">+ Yeni Ana Arı</button>
        </div>
      </div>
      ${!list.length ? `<div class="card"><div class="empty"><div class="empty__icon">${BM.Icons.queens}</div><div class="empty__title">Henüz ana arı kaydı yok</div><button class="btn btn--primary" onclick="BM.queens.add()">+ İlk Ana Arı</button></div></div>` :
      `<div class="grid-3">${list.map(q => {
        const h = BM.Storage.get('hives', q.hiveId);
        const m = this.calculateMetrics(q);
        const age = ((Date.now() - new Date(q.birthDate).getTime()) / (365 * 864e5)).toFixed(1);
        const score = m ? m.percentage : Math.round((q.performanceScore || 0.8) * 100);
        return `<div class="card">
          <div style="display:flex;align-items:center;gap:var(--space-3);margin-bottom:var(--space-3)">
            <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--honey-400),var(--honey-600));display:flex;align-items:center;justify-content:center;font-size:26px">${BM.Icons.queens}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px">
                ${BM.esc(BM.T.strain(q.strain))}
                <span style="font-size:11px;font-weight:600;padding:2px 6px;border-radius:4px;background:rgba(245,158,11,0.15);color:var(--honey-500)">${BM.T.color(q.markedColor)}</span>
              </div>
              <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">${BM.esc(h ? h.name : 'Atanmamış')} · <span class="badge ${BM.T.statusCls(q.status)}">${BM.T.status(q.status)}</span></div>
            </div>
            <div style="text-align:right">
              <div style="font-size:20px;font-weight:800;color:${score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--honey-500)' : 'var(--danger)'}">%${score}</div>
              <div style="font-size:10px;color:var(--text-muted)">AI Skor</div>
            </div>
          </div>

          <!-- Yöntem B: 4 Sütun Metrik Dağılımı -->
          <div style="background:var(--bg-tertiary);border-radius:var(--radius-md);padding:8px 10px;margin-bottom:var(--space-3)">
            <div style="font-size:10px;font-weight:700;color:var(--text-secondary);text-transform:uppercase;margin-bottom:6px">📊 Yöntem B Analizi (${m ? m.statusBadge : 'AI'})</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:11px">
              <div>🍯 Bal: <strong>%${m ? m.breakdown.productivity : 80}</strong></div>
              <div>🛡️ Sağlık: <strong>%${m ? m.breakdown.health : 85}</strong></div>
              <div>🥚 Yavru: <strong>%${m ? m.breakdown.broodPattern : 85}</strong></div>
              <div>🟢 Huy: <strong>%${m ? m.breakdown.temperament : 80}</strong></div>
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-2);font-size:12px">
            <div class="hive-card__metric"><div class="hive-card__metric-label">Yaş</div><div class="hive-card__metric-value">${age} yıl (${m ? m.ageMonths : 0} ay)</div></div>
            <div class="hive-card__metric"><div class="hive-card__metric-label">Kaynak</div><div class="hive-card__metric-value">${BM.T.source(q.source)}</div></div>
          </div>

          ${m && m.recommendation ? `<div style="font-size:11px;color:var(--text-secondary);margin-top:8px;padding:6px;background:rgba(255,255,255,0.03);border-radius:4px;border-left:3px solid ${score >= 70 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'}">💡 ${m.recommendation}</div>` : ''}

          <div class="hive-card__actions" style="margin-top:var(--space-3)">
            <button class="btn btn--sm" onclick="BM.queens.recalculate('${q.id}');App.render('queens')" title="Skoru şimdi yeniden hesapla">⚡ AI Hesapla</button>
            <button class="btn btn--sm" onclick="BM.queens.edit('${q.id}')">Düzenle</button>
            <button class="btn btn--sm btn--danger" onclick="BM.queens.del('${q.id}')">Sil</button>
          </div>
        </div>`;
      }).join('')}</div>`}`;
    }
  };

  // ============ HARVEST ============

  BM.queens = queensModule;
})(window);
