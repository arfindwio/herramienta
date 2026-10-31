// ToolKit - Main Application Controller

window.App = {
  currentPage: 'home',
  toastTimeout: null,

  init() {
    // Apply saved language
    i18n.applyTranslations();

    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        let reloadingForWorker = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          // The LibreOffice runtime needs response isolation headers supplied
          // by the worker. Reload once when a new worker takes control.
          if (!reloadingForWorker) {
            reloadingForWorker = true;
            window.location.reload();
          }
        });
        navigator.serviceWorker.register('/sw.js').then(reg => {
          console.log('[App] SW registered:', reg.scope);
        }).catch(err => console.warn('[App] SW failed:', err));
      });
    }

    // Navigation
    this.bindNavigation();

    // Check URL params
    const urlParams = new URLSearchParams(window.location.search);
    const tool = urlParams.get('tool');
    if (tool) {
      this.navigateTo(tool);
    } else {
      this.navigateTo('home');
    }

    // Settings panel
    this.bindSettings();

    // Language switcher
    document.getElementById('lang-id').addEventListener('click', () => { i18n.setLang('id'); this.refreshPage(); });
    document.getElementById('lang-en').addEventListener('click', () => { i18n.setLang('en'); this.refreshPage(); });

    // PWA install prompt
    this.setupInstallPrompt();

    // Online/offline indicator
    this.setupConnectivity();

    console.log('[App] ToolKit initialized!');
  },

  refreshPage() {
    i18n.applyTranslations();
    // Re-render dynamic lists
    if (this.currentPage === 'password') PasswordTool.renderSavedList();
    if (this.currentPage === 'color') ColorTool.renderSavedColors();
    if (this.currentPage === 'qr') QRTool.renderHistory();
  },

  bindNavigation() {
    document.querySelectorAll('[data-page]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateTo(link.getAttribute('data-page'));
      });
    });
  },

  navigateTo(page) {
    // Stop camera if leaving QR page
    if (this.currentPage === 'qr' && page !== 'qr' && window.QRTool) {
      QRTool.stopCamera();
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('[data-page]').forEach(link => link.classList.remove('active'));

    // Show target page
    const target = document.getElementById(`page-${page}`);
    if (target) target.classList.add('active');

    // Active nav link
    document.querySelectorAll(`[data-page="${page}"]`).forEach(link => link.classList.add('active'));

    this.currentPage = page;

    // Initialize tools on first visit
    if (page === 'password' && !PasswordTool._initialized) {
      PasswordTool.init();
      PasswordTool._initialized = true;
    }
    if (page === 'color' && !ColorTool._initialized) {
      ColorTool.init();
      ColorTool._initialized = true;
    }
    if (page === 'qr' && !QRTool._initialized) {
      QRTool.init();
      QRTool._initialized = true;
    }
    if (page === 'image' && !ImageTool._initialized) {
      ImageTool.init();
      ImageTool._initialized = true;
    }
    if (page === 'document' && !DocumentTool._initialized) {
      DocumentTool.init();
      DocumentTool._initialized = true;
    }

    // Update URL without reload
    const url = new URL(window.location);
    if (page === 'home') {
      url.searchParams.delete('tool');
    } else {
      url.searchParams.set('tool', page);
    }
    history.replaceState({}, '', url);

    // Close side drawer if open
    document.getElementById('side-drawer').classList.remove('open');

    window.scrollTo(0, 0);
  },

  bindSettings() {
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const settingsClose = document.getElementById('settings-close');
    const settingsOverlay = document.getElementById('settings-overlay');

    settingsBtn.addEventListener('click', () => {
      settingsPanel.classList.add('open');
      settingsOverlay.classList.add('active');
    });

    [settingsClose, settingsOverlay].forEach(el => {
      el.addEventListener('click', () => {
        settingsPanel.classList.remove('open');
        settingsOverlay.classList.remove('active');
      });
    });

    // Export/Import/Clear
    document.getElementById('export-btn').addEventListener('click', () => Storage.exportAll());
    document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-input').click());
    document.getElementById('import-input').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (Storage.importAll(ev.target.result)) {
          this.showToast(i18n.t('toastSaved'));
          this.refreshPage();
        } else {
          this.showToast(i18n.t('toastError'));
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    });

    document.getElementById('clear-all-btn').addEventListener('click', () => {
      if (confirm(i18n.currentLang === 'id' ? 'Hapus semua data? Tindakan ini tidak dapat dibatalkan.' : 'Delete all data? This cannot be undone.')) {
        Storage.clear();
        this.showToast(i18n.t('toastDeleted'));
        this.refreshPage();
      }
    });

    // Hamburger menu
    document.getElementById('hamburger-btn').addEventListener('click', () => {
      document.getElementById('side-drawer').classList.toggle('open');
    });
    document.getElementById('drawer-overlay').addEventListener('click', () => {
      document.getElementById('side-drawer').classList.remove('open');
    });
  },

  showToast(message, duration = 2500) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => toast.classList.remove('show'), duration);
  },

  setupInstallPrompt() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      const installBtn = document.getElementById('install-pwa-btn');
      if (installBtn) {
        installBtn.classList.remove('hidden');
        installBtn.addEventListener('click', () => {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(() => {
            deferredPrompt = null;
            installBtn.classList.add('hidden');
          });
        });
      }
    });
  },

  setupConnectivity() {
    const indicator = document.getElementById('connectivity-indicator');
    const update = () => {
      if (indicator) {
        indicator.className = navigator.onLine ? 'online' : 'offline';
        indicator.textContent = '';
        indicator.title = navigator.onLine ? 'Online' : 'Offline';
      }
    };
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }
};

// Init when DOM ready
document.addEventListener('DOMContentLoaded', () => App.init());
