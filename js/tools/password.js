// ToolKit - Password Manager Tool

window.PasswordTool = {
  currentPassword: '',

  init() {
    this.bindEvents();
    this.generate();
    this.renderSavedList();
  },

  bindEvents() {
    document.getElementById('pw-generate-btn').addEventListener('click', () => this.generate());
    document.getElementById('pw-copy-btn').addEventListener('click', () => this.copy());
    const quickCopy = document.getElementById('pw-quick-copy-btn');
    if (quickCopy) quickCopy.addEventListener('click', () => this.copy());
    document.getElementById('pw-save-btn').addEventListener('click', () => this.save());
    document.getElementById('pw-length').addEventListener('input', (e) => {
      document.getElementById('pw-length-val').textContent = e.target.value;
      this.generate();
    });
    ['pw-upper', 'pw-lower', 'pw-numbers', 'pw-symbols'].forEach(id => {
      document.getElementById(id).addEventListener('change', () => this.generate());
    });
    document.getElementById('pw-output').addEventListener('click', () => this.copy());
    // Auto-adjust on window resize (e.g. rotation or viewport change)
    window.addEventListener('resize', () => this.adjustOutputHeight());
    // Search
    const searchEl = document.getElementById('pw-search');
    if (searchEl) searchEl.addEventListener('input', (e) => this.renderSavedList(e.target.value));
  },

  adjustOutputHeight() {
    const output = document.getElementById('pw-output');
    if (!output) return;
    output.style.height = 'auto';
    const scrollH = output.scrollHeight;
    output.style.height = Math.max(64, scrollH + 4) + 'px';
  },

  generate() {
    const length = parseInt(document.getElementById('pw-length').value) || 16;
    const useUpper = document.getElementById('pw-upper').checked;
    const useLower = document.getElementById('pw-lower').checked;
    const useNumbers = document.getElementById('pw-numbers').checked;
    const useSymbols = document.getElementById('pw-symbols').checked;

    let charset = '';
    if (useUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (useLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (useNumbers) charset += '0123456789';
    if (useSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz';

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    this.currentPassword = password;
    const output = document.getElementById('pw-output');
    output.value = password;
    this.adjustOutputHeight();
    this.updateStrength(password);
  },

  updateStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const bar = document.getElementById('pw-strength-bar');
    const label = document.getElementById('pw-strength-label');

    const levels = [
      { max: 2, cls: 'weak', key: 'strengthWeak' },
      { max: 4, cls: 'fair', key: 'strengthFair' },
      { max: 6, cls: 'good', key: 'strengthGood' },
      { max: 99, cls: 'strong', key: 'strengthStrong' },
    ];

    const level = levels.find(l => score <= l.max);
    bar.className = 'pw-strength-bar ' + level.cls;
    bar.style.width = Math.min(100, (score / 7) * 100) + '%';
    label.textContent = i18n.t(level.key);
    label.className = 'pw-strength-text ' + level.cls;
  },

  async copy() {
    const val = document.getElementById('pw-output').value;
    if (!val) return;
    try {
      await navigator.clipboard.writeText(val);
      App.showToast(i18n.t('toastCopied'));
    } catch (e) {
      // Fallback
      document.getElementById('pw-output').select();
      document.execCommand('copy');
      App.showToast(i18n.t('toastCopied'));
    }
  },

  save() {
    const password = document.getElementById('pw-output').value;
    const label = document.getElementById('pw-label').value.trim();
    const username = document.getElementById('pw-username').value.trim();

    if (!password) return;

    const entry = {
      id: Date.now().toString(),
      label: label || 'Untitled',
      username,
      password,
      createdAt: new Date().toISOString(),
    };

    Storage.savePassword(entry);
    document.getElementById('pw-label').value = '';
    document.getElementById('pw-username').value = '';
    App.showToast(i18n.t('toastSaved'));
    this.renderSavedList();
  },

  renderSavedList(query = '') {
    const list = document.getElementById('pw-saved-list');
    let passwords = Storage.getPasswords();

    if (query) {
      const q = query.toLowerCase();
      passwords = passwords.filter(p =>
        p.label.toLowerCase().includes(q) || (p.username && p.username.toLowerCase().includes(q))
      );
    }

    if (passwords.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </div>
          <span>${i18n.t('noPasswords')}</span>
        </div>`;
      return;
    }

    list.innerHTML = passwords.map(p => `
      <div class="pw-item" id="pw-item-${p.id}">
        <div class="pw-item-header">
          <div class="pw-item-info">
            <strong class="pw-item-label">${this.escapeHtml(p.label)}</strong>
            ${p.username ? `<span class="pw-item-username">${this.escapeHtml(p.username)}</span>` : ''}
          </div>
          <div class="pw-item-actions">
            <button class="icon-btn" onclick="PasswordTool.copyItem('${p.id}')" title="${i18n.t('copyBtn')}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button class="icon-btn danger" onclick="PasswordTool.deleteItem('${p.id}')" title="${i18n.t('deleteBtn')}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"></path></svg>
            </button>
          </div>
        </div>
        <div class="pw-item-password">
          <span class="pw-masked" id="pw-text-${p.id}">••••••••••••</span>
          <button class="icon-btn small" onclick="PasswordTool.toggleReveal('${p.id}', '${this.escapeHtml(p.password)}')" title="Show/Hide">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
          </button>
        </div>
        <div class="pw-item-meta">${new Date(p.createdAt).toLocaleDateString()}</div>
      </div>
    `).join('');
  },

  toggleReveal(id, password) {
    const span = document.getElementById(`pw-text-${id}`);
    if (span.textContent === '••••••••••••') {
      span.textContent = password;
      span.classList.remove('pw-masked');
    } else {
      span.textContent = '••••••••••••';
      span.classList.add('pw-masked');
    }
  },

  async copyItem(id) {
    const passwords = Storage.getPasswords();
    const entry = passwords.find(p => p.id === id);
    if (!entry) return;
    try {
      await navigator.clipboard.writeText(entry.password);
      App.showToast(i18n.t('toastCopied'));
    } catch (e) {
      App.showToast(i18n.t('toastError'));
    }
  },

  deleteItem(id) {
    Storage.deletePassword(id);
    App.showToast(i18n.t('toastDeleted'));
    this.renderSavedList();
  },

  escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
};
