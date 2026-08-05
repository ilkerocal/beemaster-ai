/* ===== js/ui.js ===== */
// ============================================================
// UI Components — Modal, Toast, Tabs (Spec 03 §3.1)
// ============================================================
(function (global) {
  'use strict';
  const BM = global.BM = global.BM || {};

  // ============ MODAL ============
  const Modal = {
    cb: null,
    el: null,

    open(title, html, onSubmit, options) {
      if (!this.el) {
        this.el = document.getElementById('modal-overlay');
      }
      // Click outside to close
      this.el.onclick = (e) => { if (e.target === this.el) this.close(); };
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').innerHTML = html;
      document.getElementById('modal-form').onsubmit = async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        const data = {};
        for (const [k, v] of fd.entries()) {
          if (data[k] !== undefined) {
            // multi-value
            if (!Array.isArray(data[k])) data[k] = [data[k]];
            data[k].push(v);
          } else {
            data[k] = v;
          }
        }
        // Disable submit button while processing
        const submitBtn = document.getElementById('modal-submit');
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = '⏳ Kaydediliyor...'; }
        try {
          const result = this.cb ? await this.cb(data) : true;
          if (result !== false) this.close();
        } catch (err) {
          console.error('[Modal] submit error:', err);
          BM.Toast.show('Hata: ' + err.message, 'error');
          if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Kaydet'; }
        }
      };
      this.cb = onSubmit;
      const foot = document.querySelector('.modal__foot');
      if (foot) {
        if (options && options.hideFooter) {
          foot.style.display = 'none';
        } else {
          foot.style.display = '';
          foot.innerHTML = '<button type="button" class="btn btn--ghost" onclick="BM.Modal.close()">İptal</button>\n          <button type="submit" class="btn btn--primary" id="modal-submit">Kaydet</button>';
        }
      }
      this.el.classList.add('modal-overlay--active');
      setTimeout(() => {
        const f = document.getElementById('modal-body').querySelector('input,select,textarea');
        if (f) f.focus();
      }, 50);
    },

    close() {
      if (this.el) this.el.classList.remove('modal-overlay--active');
      this.cb = null;
      const foot = document.querySelector('.modal__foot');
      if (foot) {
        foot.style.display = '';
        foot.innerHTML = '<button type="button" class="btn btn--ghost" onclick="BM.Modal.close()">İptal</button>\n          <button type="submit" class="btn btn--primary" id="modal-submit">Kaydet</button>';
      }
    },

    confirm(msg, onYes, onNo) {
      const self = this;
      this.cb = null;
      if (!this.el) this.el = document.getElementById('modal-overlay');
      this.el.onclick = (e) => { if (e.target === this.el) { this.close(); onNo && onNo(); } };
      document.getElementById('modal-title').textContent = '⚠️ Onay';
      document.getElementById('modal-body').innerHTML = `<div class="empty" style="padding:var(--space-3) 0"><div class="empty__icon" style="font-size:48px">⚠️</div><div class="empty__title" style="font-size:15px;margin-top:var(--space-2)">${BM.esc(msg)}</div></div>`;
      const foot = document.querySelector('.modal__foot');
      if (foot) {
        foot.style.display = 'flex';
        foot.innerHTML = `<button type="button" class="btn btn--ghost" id="confirm-no">İptal</button><button type="button" class="btn btn--danger" id="confirm-yes">⚠️ Onayla</button>`;
        setTimeout(() => {
          const yesBtn = document.getElementById('confirm-yes');
          const noBtn = document.getElementById('confirm-no');
          if (yesBtn) yesBtn.onclick = () => { self.close(); if (onYes) onYes(); };
          if (noBtn) noBtn.onclick = () => { self.close(); if (onNo) onNo(); };
        }, 50);
      }
      this.el.classList.add('modal-overlay--active');
    },

    showReport(html) {
      this.open('Rapor', html, () => true);
    }
  };

  // ============ TOAST ============
  const Toast = {
    container: null,
    show(msg, type = 'info') {
      if (!this.container) this.container = document.getElementById('toast-container');
      const el = document.createElement('div');
      el.className = 'toast toast--' + type;
      el.textContent = msg;
      this.container.appendChild(el);
      setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 300);
      }, 3000);
    }
  };

  // ============ TABS ============
  const Tabs = {
    init(container, tabs, defaultTab, onChange) {
      const tabBar = container.querySelector('.tabs');
      const content = container.querySelector('.tabs__content');
      if (!tabBar || !content) return;

      const render = (activeId) => {
        tabBar.innerHTML = tabs.map(t => `
          <button type="button" class="tabs__item ${t.id === activeId ? 'tabs__item--active' : ''}" data-tab="${t.id}">
            ${BM.esc(t.label)}
          </button>
        `).join('');
        const tab = tabs.find(t => t.id === activeId);
        if (tab) content.innerHTML = tab.content;
        onChange && onChange(activeId);
        tabBar.querySelectorAll('.tabs__item').forEach(btn => {
          btn.onclick = () => render(btn.dataset.tab);
        });
      };

      render(defaultTab || tabs[0].id);
      return { setActive: render };
    }
  };

  // ============ WIZARD ============
  const Wizard = {
    open(title, steps, onComplete, initialState) {
      let currentStep = 0;
      // initialState'i direkt kullan ki setMode gibi cagrilar ayni objeyi degistirsin
      const state = initialState || {};

      const render = () => {
        const step = steps[currentStep];
        const isLast = currentStep === steps.length - 1;

        Modal.open(title,
          `
            <div class="wizard">
              <div class="wizard__steps">
                ${steps.map((s, i) => `
                  <div class="wizard__step ${i === currentStep ? 'wizard__step--active' : (i < currentStep ? 'wizard__step--done' : '')}">
                    <div class="wizard__step-num">${i < currentStep ? '✓' : i + 1}</div>
                    <div class="wizard__step-label">${BM.esc(s.label)}</div>
                  </div>
                `).join('')}
              </div>
              <div id="wizard-body">${step.render(state)}</div>
              <div class="wizard__nav">
                <button type="button" class="btn btn--ghost" ${currentStep === 0 ? 'disabled' : ''} onclick="BM.Wizard._prev()">← Geri</button>
                <div style="font-size:11px;color:var(--text-secondary)">${currentStep + 1}/${steps.length}</div>
                ${isLast
                  ? `<button type="button" class="btn btn--primary" onclick="BM.Wizard._complete()">✓ Tamamla</button>`
                  : `<button type="button" class="btn btn--primary" onclick="BM.Wizard._next()">İleri →</button>`}
              </div>
            </div>
          `,
          () => false // Wizard kendi navigation'unu yonetiyor
        );
        // Modal form'u disable et (submit wizard tarafindan kontrol ediliyor)
        document.getElementById('modal-form').onsubmit = (e) => { e.preventDefault(); return false; };
        // Hide default foot
        const foot = document.querySelector('.modal__foot');
        if (foot) foot.style.display = 'none';

        // Trigger step's onMount
        if (step.onMount) step.onMount(state, (data) => Object.assign(state, data));
      };

      this._next = () => {
        const step = steps[currentStep];
        if (step.validate && !step.validate(state)) return;
        if (step.onNext) step.onNext(state);
        if (currentStep < steps.length - 1) {
          currentStep++;
          render();
        }
      };

      this._prev = () => {
        if (currentStep > 0) {
          currentStep--;
          render();
        }
      };

      this._complete = () => {
        const step = steps[currentStep];
        if (step.validate && !step.validate(state)) return;
        Modal.close();
        // Restore default foot
        const foot = document.querySelector('.modal__foot');
        if (foot) foot.style.display = '';
        onComplete(state);
      };

      render();
    }
  };

  Object.assign(BM, { Modal, Toast, Tabs, Wizard });
})(window);
