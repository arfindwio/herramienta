// ToolKit - QR Code Generator & Scanner Tool
// Uses qrcode.js for generation and jsQR for scanning

window.QRTool = {
  qrInstance: null,
  stream: null,
  scanning: false,
  activeTab: 'generate',

  init() {
    this.bindEvents();
    this.renderHistory();
    this.generateQR();
  },

  bindEvents() {
    document.getElementById('qr-tab-generate').addEventListener('click', () => this.switchTab('generate'));
    document.getElementById('qr-tab-scan').addEventListener('click', () => this.switchTab('scan'));

    document.getElementById('qr-text-input').addEventListener('input', () => this.generateQR());
    document.getElementById('qr-size').addEventListener('input', (e) => {
      document.getElementById('qr-size-val').textContent = e.target.value + 'px';
      this.generateQR();
    });
    document.getElementById('qr-fg-color').addEventListener('input', () => this.generateQR());
    document.getElementById('qr-bg-color').addEventListener('input', () => this.generateQR());
    document.getElementById('qr-download-btn').addEventListener('click', () => this.download());

    document.getElementById('qr-camera-btn').addEventListener('click', () => this.startCamera());
    document.getElementById('qr-file-btn').addEventListener('click', () => document.getElementById('qr-file-input').click());
    document.getElementById('qr-file-input').addEventListener('change', (e) => this.scanFromFile(e));
    document.getElementById('qr-stop-camera-btn').addEventListener('click', () => this.stopCamera());
    document.getElementById('qr-clear-history-btn').addEventListener('click', () => this.clearHistory());
  },

  switchTab(tab) {
    this.activeTab = tab;
    if (tab !== 'scan') this.stopCamera();

    document.getElementById('qr-tab-generate').classList.toggle('active', tab === 'generate');
    document.getElementById('qr-tab-scan').classList.toggle('active', tab === 'scan');
    document.getElementById('qr-generate-panel').classList.toggle('hidden', tab !== 'generate');
    document.getElementById('qr-scan-panel').classList.toggle('hidden', tab !== 'scan');
  },

  generateQR() {
    const text = document.getElementById('qr-text-input').value.trim();
    const container = document.getElementById('qr-canvas-container');

    if (!text) {
      container.innerHTML = '<div class="qr-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg><p>QR Code akan muncul di sini</p></div>';
      return;
    }

    const size = parseInt(document.getElementById('qr-size').value) || 200;
    const fgColor = document.getElementById('qr-fg-color').value;
    const bgColor = document.getElementById('qr-bg-color').value;

    container.innerHTML = '';
    try {
      if (window.QRCode) {
        new QRCode(container, {
          text: text,
          width: size,
          height: size,
          colorDark: fgColor,
          colorLight: bgColor,
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        // Fallback using Canvas if library not loaded
        container.innerHTML = '<div class="qr-placeholder"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><p>QR library loading...</p></div>';
      }
    } catch (e) {
      container.innerHTML = `<div class="qr-placeholder error"><svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg><p>${e.message}</p></div>`;
    }
  },

  download() {
    const text = document.getElementById('qr-text-input').value.trim();
    if (!text) return;

    const canvas = document.querySelector('#qr-canvas-container canvas');
    const img = document.querySelector('#qr-canvas-container img');

    if (canvas) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (img) {
      const link = document.createElement('a');
      link.download = 'qrcode.png';
      link.href = img.src;
      link.click();
    }

    // Save to history
    Storage.addQRHistory({ text, type: 'generated' });
    this.renderHistory();
  },

  async startCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      App.showToast(i18n.t('noCamera'));
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      const video = document.getElementById('qr-video');
      video.srcObject = this.stream;
      video.play();

      document.getElementById('qr-camera-area').classList.remove('hidden');
      document.getElementById('qr-stop-camera-btn').classList.remove('hidden');
      document.getElementById('qr-camera-btn').classList.add('hidden');

      this.scanning = true;
      this.scanLoop();
    } catch (e) {
      App.showToast(i18n.t('noCamera'));
    }
  },

  stopCamera() {
    this.scanning = false;
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    const video = document.getElementById('qr-video');
    if (video) video.srcObject = null;
    document.getElementById('qr-camera-area').classList.add('hidden');
    document.getElementById('qr-stop-camera-btn').classList.add('hidden');
    document.getElementById('qr-camera-btn').classList.remove('hidden');
  },

  scanLoop() {
    if (!this.scanning) return;
    const video = document.getElementById('qr-video');
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(() => this.scanLoop());
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      if (window.jsQR) {
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });
        if (code) {
          this.showScanResult(code.data);
          this.stopCamera();
          return;
        }
      }
    } catch (e) {}

    requestAnimationFrame(() => this.scanLoop());
  },

  scanFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        if (window.jsQR) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            this.showScanResult(code.data);
          } else {
            document.getElementById('qr-scan-result').textContent = '❌ No QR code detected';
          }
        }
      } catch (e) {
        document.getElementById('qr-scan-result').textContent = '❌ Error scanning image';
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
    event.target.value = '';
  },

  showScanResult(text) {
    const resultEl = document.getElementById('qr-scan-result-box');
    const textEl = document.getElementById('qr-scan-result');
    resultEl.classList.remove('hidden');
    textEl.textContent = text;

    // Save to history
    Storage.addQRHistory({ text, type: 'scanned' });
    this.renderHistory();
  },

  async copyResult() {
    const text = document.getElementById('qr-scan-result').textContent;
    try {
      await navigator.clipboard.writeText(text);
      App.showToast(i18n.t('toastCopied'));
    } catch (e) {}
  },

  openResult() {
    const text = document.getElementById('qr-scan-result').textContent;
    if (text.startsWith('http://') || text.startsWith('https://')) {
      window.open(text, '_blank', 'noopener,noreferrer');
    }
  },

  renderHistory() {
    const list = document.getElementById('qr-history-list');
    const history = Storage.getQRHistory();

    if (history.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </div>
          <span>${i18n.t('noHistory')}</span>
        </div>`;
      return;
    }

    list.innerHTML = history.slice(0, 10).map(entry => `
      <div class="qr-history-item" onclick="QRTool.useHistoryEntry('${entry.id}')">
        <span class="qr-history-type">
          ${entry.type === 'scanned' 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
          }
        </span>
        <span class="qr-history-text">${this.escapeHtml(entry.text).substring(0, 60)}${entry.text.length > 60 ? '…' : ''}</span>
        <span class="qr-history-date">${new Date(entry.createdAt).toLocaleDateString()}</span>
      </div>
    `).join('');
  },

  useHistoryEntry(id) {
    const history = Storage.getQRHistory();
    const entry = history.find(h => h.id === id);
    if (!entry) return;
    this.switchTab('generate');
    document.getElementById('qr-text-input').value = entry.text;
    this.generateQR();
  },

  clearHistory() {
    Storage.clearQRHistory();
    this.renderHistory();
    App.showToast(i18n.t('toastDeleted'));
  },

  escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
};
