// ToolKit - Image Compressor Tool
// 100% client-side using Canvas API

window.ImageTool = {
  originalFile: null,
  originalDataUrl: null,
  compressedDataUrl: null,
  compressedBlob: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    const dropZone = document.getElementById('img-drop-zone');
    const fileInput = document.getElementById('img-file-input');

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => this.loadFile(e.target.files[0]));

    // Drag & Drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) this.loadFile(file);
    });

    document.getElementById('img-quality').addEventListener('input', (e) => {
      document.getElementById('img-quality-val').textContent = e.target.value + '%';
      if (this.originalFile) this.compress();
    });

    document.getElementById('img-max-width').addEventListener('input', () => {
      if (this.originalFile) this.compress();
    });

    document.getElementById('img-max-height').addEventListener('input', () => {
      if (this.originalFile) this.compress();
    });

    document.getElementById('img-format').addEventListener('change', () => {
      if (this.originalFile) this.compress();
    });

    document.getElementById('img-download-btn').addEventListener('click', () => this.download());
    document.getElementById('img-clear-btn').addEventListener('click', () => this.clear());
    document.getElementById('img-compress-btn').addEventListener('click', () => {
      if (this.originalFile) this.compress();
    });
  },

  loadFile(file) {
    if (!file || !file.type.startsWith('image/')) return;

    this.originalFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.originalDataUrl = e.target.result;
      this.showOriginalPreview(file);
      this.compress();
    };
    reader.readAsDataURL(file);
  },

  showOriginalPreview(file) {
    document.getElementById('img-drop-zone').classList.add('hidden');
    document.getElementById('img-workspace').classList.remove('hidden');
    document.getElementById('img-original-preview').src = this.originalDataUrl;
    document.getElementById('img-original-name').textContent = file.name;
    document.getElementById('img-original-size').textContent = this.formatBytes(file.size);

    const img = new Image();
    img.onload = () => {
      document.getElementById('img-original-dims').textContent = `${img.width} × ${img.height}px`;
    };
    img.src = this.originalDataUrl;
  },

  compress() {
    if (!this.originalDataUrl) return;

    const quality = parseInt(document.getElementById('img-quality').value) / 100;
    const maxWidth = parseInt(document.getElementById('img-max-width').value) || 99999;
    const maxHeight = parseInt(document.getElementById('img-max-height').value) || 99999;
    const format = document.getElementById('img-format').value;

    const img = new Image();
    img.onload = () => {
      let { width, height } = img;

      // Maintain aspect ratio
      if (width > maxWidth) { height = Math.round(height * maxWidth / width); width = maxWidth; }
      if (height > maxHeight) { width = Math.round(width * maxHeight / height); height = maxHeight; }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (format === 'image/png') {
        // PNG: transparent background
        ctx.clearRect(0, 0, width, height);
      } else {
        // JPEG/WEBP: white background
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        this.compressedBlob = blob;
        const url = URL.createObjectURL(blob);

        // Revoke old URL
        if (this.compressedDataUrl) URL.revokeObjectURL(this.compressedDataUrl);
        this.compressedDataUrl = url;

        // Update preview
        document.getElementById('img-compressed-preview').src = url;
        document.getElementById('img-compressed-size').textContent = this.formatBytes(blob.size);
        document.getElementById('img-compressed-dims').textContent = `${width} × ${height}px`;

        // Savings
        const saved = this.originalFile.size - blob.size;
        const pct = Math.round((saved / this.originalFile.size) * 100);
        const savingsEl = document.getElementById('img-savings');
        if (saved > 0) {
          savingsEl.textContent = `↓ ${this.formatBytes(saved)} (${pct}%)`;
          savingsEl.className = 'img-savings positive';
        } else {
          savingsEl.textContent = `↑ ${this.formatBytes(Math.abs(saved))} (${Math.abs(pct)}%)`;
          savingsEl.className = 'img-savings negative';
        }

        document.getElementById('img-download-btn').disabled = false;
      }, format, quality);
    };
    img.src = this.originalDataUrl;
  },

  download() {
    if (!this.compressedDataUrl) return;
    const format = document.getElementById('img-format').value;
    const ext = format.split('/')[1];
    const baseName = this.originalFile.name.replace(/\.[^.]+$/, '');

    const a = document.createElement('a');
    a.href = this.compressedDataUrl;
    a.download = `${baseName}-compressed.${ext}`;
    a.click();
  },

  clear() {
    this.originalFile = null;
    this.originalDataUrl = null;
    if (this.compressedDataUrl) URL.revokeObjectURL(this.compressedDataUrl);
    this.compressedDataUrl = null;
    this.compressedBlob = null;

    document.getElementById('img-drop-zone').classList.remove('hidden');
    document.getElementById('img-workspace').classList.add('hidden');
    document.getElementById('img-file-input').value = '';
    document.getElementById('img-download-btn').disabled = true;
  },

  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
};
