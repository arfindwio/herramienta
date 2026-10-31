// ToolKit - Document Converter
// All conversions run in the browser; selected files never leave the device.

window.DocumentTool = {
  mode: 'image',
  files: [],
  maxFileSize: 25 * 1024 * 1024,
  officeConverter: null,

  modes: {
    image: {
      title: 'Pilih foto', hint: 'JPG, PNG, WebP · Anda dapat memilih beberapa foto',
      accept: 'image/jpeg,image/png,image/webp', multiple: true,
      action: 'Buat PDF', disclaimer: 'Setiap foto menjadi satu halaman dengan rasio asli. Foto ditampilkan penuh tanpa bingkai putih atau pemotongan.'
    },
    word: {
      title: 'Pilih dokumen Word', hint: 'Format DOCX · Maksimal 25 MB',
      accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document', multiple: false,
      action: 'Ubah ke PDF', disclaimer: 'Konversi memakai LibreOffice offline. Pada penggunaan pertama, runtime sekitar 235 MB perlu diunduh dan disimpan di perangkat.'
    },
    pdf: {
      title: 'Pilih file PDF', hint: 'PDF berbasis teks · Maksimal 25 MB',
      accept: 'application/pdf,.pdf', multiple: false,
      action: 'Ubah ke Word', disclaimer: 'Setiap halaman PDF dimasukkan sebagai halaman visual penuh ke DOCX agar tampilan tetap sama. Hasilnya tidak dapat diedit sebagai teks.'
    }
  },

  init() {
    this.bindEvents();
    this.setMode('image');
  },

  bindEvents() {
    const upload = document.getElementById('document-upload');
    const input = document.getElementById('document-file-input');
    upload.addEventListener('click', () => input.click());
    upload.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); input.click(); }
    });
    input.addEventListener('change', (event) => this.selectFiles([...event.target.files]));
    document.querySelectorAll('[data-document-mode]').forEach(button => {
      button.addEventListener('click', () => this.setMode(button.dataset.documentMode));
    });
    ['dragenter', 'dragover'].forEach(type => upload.addEventListener(type, event => {
      event.preventDefault(); upload.classList.add('drag-over');
    }));
    ['dragleave', 'drop'].forEach(type => upload.addEventListener(type, event => {
      event.preventDefault(); upload.classList.remove('drag-over');
    }));
    upload.addEventListener('drop', event => this.selectFiles([...event.dataTransfer.files]));
    document.getElementById('document-convert-btn').addEventListener('click', () => this.convert());
    document.getElementById('document-reset-btn').addEventListener('click', () => this.reset());
  },

  setMode(mode) {
    this.mode = mode;
    const config = this.modes[mode];
    const input = document.getElementById('document-file-input');
    input.accept = config.accept;
    input.multiple = config.multiple;
    document.getElementById('document-upload-title').textContent = config.title;
    document.getElementById('document-upload-hint').textContent = config.hint;
    document.getElementById('document-convert-label').textContent = config.action;
    document.getElementById('document-disclaimer').textContent = config.disclaimer;
    document.querySelectorAll('[data-document-mode]').forEach(button => {
      const active = button.dataset.documentMode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-selected', String(active));
    });
    this.reset();
  },

  selectFiles(files) {
    const config = this.modes[this.mode];
    const accepted = files.filter(file => this.isSupported(file));
    if (!accepted.length) return this.showError('Format file tidak sesuai dengan jenis konversi yang dipilih.');
    if (accepted.some(file => file.size > this.maxFileSize)) return this.showError('Ukuran file maksimal adalah 25 MB.');
    this.files = config.multiple ? accepted : [accepted[0]];
    this.renderFiles();
  },

  isSupported(file) {
    if (this.mode === 'image') return file.type.startsWith('image/') && /image\/(jpeg|png|webp)/.test(file.type);
    if (this.mode === 'word') return /\.docx$/i.test(file.name) || file.type.includes('wordprocessingml');
    return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  },

  renderFiles() {
    const list = document.getElementById('document-file-list');
    list.textContent = '';
    this.files.forEach((file, index) => {
      const row = document.createElement('div');
      row.className = 'document-file-row';
      const number = document.createElement('span');
      number.textContent = this.mode === 'image' ? `${index + 1}.` : 'FILE';
      const name = document.createElement('span');
      name.className = 'document-file-name';
      name.textContent = file.name;
      const size = document.createElement('span');
      size.className = 'document-file-size';
      size.textContent = this.formatBytes(file.size);
      row.append(number, name, size);
      list.appendChild(row);
    });
    list.classList.remove('hidden');
    document.getElementById('document-convert-btn').disabled = false;
    document.getElementById('document-reset-btn').classList.remove('hidden');
    this.setStatus('Siap dikonversi.');
  },

  async convert() {
    if (!this.files.length) return;
    const button = document.getElementById('document-convert-btn');
    button.disabled = true;
    this.setStatus('Memproses file di perangkat…');
    try {
      if (this.mode === 'image') await this.imagesToPdf();
      if (this.mode === 'word') await this.wordToPdf();
      if (this.mode === 'pdf') await this.pdfToWord();
      this.setStatus('Selesai. File telah diunduh.');
    } catch (error) {
      console.error('[DocumentTool]', error);
      this.setStatus('');
      const detail = error && error.message ? ` (${error.message})` : '';
      this.showError(`Konversi gagal. Pastikan file tidak rusak dan coba lagi.${detail}`);
    } finally {
      button.disabled = false;
    }
  },

  async imagesToPdf() {
    if (!window.jspdf) throw new Error('jsPDF unavailable');
    const { jsPDF } = window.jspdf;
    let pdf;
    for (let index = 0; index < this.files.length; index += 1) {
      this.setStatus(`Menambahkan foto ${index + 1} dari ${this.files.length}…`);
      const image = await this.loadImage(this.files[index]);
      // A custom page keeps the photo's aspect ratio, so it can fill the page
      // completely without being cropped or leaving white borders.
      const pageHeight = 200;
      const pageWidth = Math.max(1, pageHeight * image.width / image.height);
      const pageFormat = [pageWidth, pageHeight];
      const orientation = pageWidth > pageHeight ? 'l' : 'p';
      if (!pdf) pdf = new jsPDF({ orientation, unit: 'mm', format: pageFormat, compress: true });
      else pdf.addPage(pageFormat, orientation);
      const actualWidth = pdf.internal.pageSize.getWidth();
      const actualHeight = pdf.internal.pageSize.getHeight();
      const canvas = document.createElement('canvas');
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext('2d');
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      pdf.addImage(canvas.toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, actualWidth, actualHeight, undefined, 'FAST');
    }
    this.downloadBlob(pdf.output('blob'), `${this.baseName(this.files[0].name)}-photos.pdf`);
  },

  async wordToPdf() {
    if (!window.crossOriginIsolated) {
      throw new Error('Runtime Word perlu dimuat ulang sekali setelah aplikasi diperbarui.');
    }
    const file = this.files[0];
    const converter = await this.getOfficeConverter();
    this.setStatus('Membuka dokumen dengan LibreOffice…');
    const result = await converter.convert(new Uint8Array(await file.arrayBuffer()), { outputFormat: 'pdf' }, file.name);
    this.downloadBlob(new Blob([result.data], { type: result.mimeType || 'application/pdf' }), `${this.baseName(file.name)}.pdf`);
  },

  async getOfficeConverter() {
    if (this.officeConverter) return this.officeConverter;
    this.setStatus('Menyiapkan LibreOffice (unduhan pertama sekitar 235 MB)…');
    const base = new URL('vendor/libreoffice/', window.location.href).href;
    const runtimeCdn = 'https://erseco.github.io/libreoffice-document-converter';
    const { WorkerBrowserConverter, createWasmPaths } = await import(`${base}browser.mjs`);
    const converter = new WorkerBrowserConverter({
      ...createWasmPaths(`${base}wasm/`),
      browserWorkerJs: `${base}browser.worker.global.js`,
      sofficeWasm: `${runtimeCdn}/wasm/soffice.wasm`,
      sofficeData: `${runtimeCdn}/wasm/soffice.data`,
      onProgress: ({ percent, message }) => this.setStatus(`${message || 'Memuat LibreOffice'} ${percent ? `(${percent}%)` : ''}`)
    });
    await converter.initialize();
    this.officeConverter = converter;
    return converter;
  },

  async pdfToWord() {
    if (!window.pdfjsLib || !window.docx) throw new Error('converter library unavailable');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const file = this.files[0];
    const documentPdf = await window.pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const sections = [];
    for (let pageNo = 1; pageNo <= documentPdf.numPages; pageNo += 1) {
      this.setStatus(`Merender halaman PDF ${pageNo} dari ${documentPdf.numPages}…`);
      const page = await documentPdf.getPage(pageNo);
      // PNG at 2x makes the DOCX needlessly large and slow to package. A 1.5x
      // JPEG remains clear for a visual copy while using far less memory.
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement('canvas');
      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await page.render({ canvasContext: canvas.getContext('2d'), viewport, background: 'white' }).promise;
      const imageData = new Uint8Array(await (await this.canvasToBlob(canvas, 'image/jpeg', 0.86)).arrayBuffer());
      const naturalViewport = page.getViewport({ scale: 1 });
      const pageWidthTwips = Math.round(naturalViewport.width * 20);
      const pageHeightTwips = Math.round(naturalViewport.height * 20);
      sections.push({
        properties: {
          type: pageNo === 1 ? undefined : window.docx.SectionType.NEXT_PAGE,
          page: { size: { width: pageWidthTwips, height: pageHeightTwips }, margin: { top: 0, right: 0, bottom: 0, left: 0 } }
        },
        children: [new window.docx.Paragraph({
          spacing: { before: 0, after: 0, line: 0 },
          children: [new window.docx.ImageRun({
            data: imageData,
            transformation: { width: naturalViewport.width * 96 / 72, height: naturalViewport.height * 96 / 72 }
          })]
        })]
      });
    }
    const doc = new window.docx.Document({ sections });
    const blob = await window.docx.Packer.toBlob(doc);
    this.downloadBlob(blob, `${this.baseName(file.name)}.docx`);
  },

  loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const image = new Image();
      image.onload = () => { URL.revokeObjectURL(url); resolve(image); };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('invalid image')); };
      image.src = url;
    });
  },

  canvasToBlob(canvas, type, quality) {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('image render failed')), type, quality));
  },

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  reset() {
    this.files = [];
    const input = document.getElementById('document-file-input');
    if (input) input.value = '';
    const list = document.getElementById('document-file-list');
    if (list) { list.textContent = ''; list.classList.add('hidden'); }
    const button = document.getElementById('document-convert-btn');
    if (button) button.disabled = true;
    const resetButton = document.getElementById('document-reset-btn');
    if (resetButton) resetButton.classList.add('hidden');
    this.setStatus('');
  },

  setStatus(message) { document.getElementById('document-status').textContent = message; },
  showError(message) { window.App?.showToast(message, 4000); },
  baseName(name) { return name.replace(/\.[^.]+$/, '') || 'document'; },
  formatBytes(bytes) { return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`; }
};
