// ToolKit - Local Storage Manager
// Uses localStorage for small data, IndexedDB for large data (images)

window.Storage = {
  prefix: 'toolkit_',

  // ---- localStorage helpers ----
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Storage.set error:', e);
      return false;
    }
  },

  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item !== null ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },

  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },

  clear() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(this.prefix)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  },

  // ---- Password storage ----
  getPasswords() {
    return this.get('passwords', []);
  },

  savePassword(entry) {
    const passwords = this.getPasswords();
    entry.id = entry.id || Date.now().toString();
    entry.createdAt = entry.createdAt || new Date().toISOString();
    const existing = passwords.findIndex(p => p.id === entry.id);
    if (existing >= 0) {
      passwords[existing] = entry;
    } else {
      passwords.unshift(entry);
    }
    return this.set('passwords', passwords);
  },

  deletePassword(id) {
    const passwords = this.getPasswords().filter(p => p.id !== id);
    return this.set('passwords', passwords);
  },

  // ---- Color storage ----
  getSavedColors() {
    return this.get('colors', []);
  },

  saveColor(colorData) {
    const colors = this.getSavedColors();
    colorData.id = colorData.id || Date.now().toString();
    colorData.savedAt = new Date().toISOString();
    // Avoid duplicate HEX
    const exists = colors.find(c => c.hex === colorData.hex);
    if (!exists) {
      colors.unshift(colorData);
      if (colors.length > 50) colors.splice(50);
    }
    return this.set('colors', colors);
  },

  deleteColor(id) {
    const colors = this.getSavedColors().filter(c => c.id !== id);
    return this.set('colors', colors);
  },

  // ---- QR History ----
  getQRHistory() {
    return this.get('qr_history', []);
  },

  addQRHistory(entry) {
    const history = this.getQRHistory();
    entry.id = entry.id || Date.now().toString();
    entry.createdAt = new Date().toISOString();
    history.unshift(entry);
    if (history.length > 30) history.splice(30);
    return this.set('qr_history', history);
  },

  clearQRHistory() {
    return this.set('qr_history', []);
  },

  // ---- Export/Import ----
  exportAll() {
    const data = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      passwords: this.getPasswords(),
      colors: this.getSavedColors(),
      qrHistory: this.getQRHistory(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolkit-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importAll(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.passwords) this.set('passwords', data.passwords);
      if (data.colors) this.set('colors', data.colors);
      if (data.qrHistory) this.set('qr_history', data.qrHistory);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }
};
