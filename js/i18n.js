// ToolKit - Internationalization (i18n)
// Supports: English (en) & Bahasa Indonesia (id)

window.i18n = {
  currentLang: localStorage.getItem('toolkit-lang') || 'id',

  translations: {
    en: {
      // App
      appName: 'ToolKit',
      appTagline: 'Your Daily Tools',
      // Navigation
      home: 'Home',
      password: 'Password',
      color: 'Color',
      qr: 'QR Code',
      image: 'Image',
      document: 'Documents',
      // Home
      welcomeTitle: 'Daily Toolkit',
      welcomeSubtitle: 'All your essential tools, offline & private.',
      // Password Tool
      passwordTitle: 'Password Manager',
      passwordDesc: 'Generate secure passwords & save locally',
      generateBtn: 'Generate',
      copyBtn: 'Copy',
      saveBtn: 'Save',
      deleteBtn: 'Delete',
      lengthLabel: 'Length',
      includeUpper: 'Uppercase (A-Z)',
      includeLower: 'Lowercase (a-z)',
      includeNumbers: 'Numbers (0-9)',
      includeSymbols: 'Symbols (!@#$)',
      strengthLabel: 'Strength',
      strengthWeak: 'Weak',
      strengthFair: 'Fair',
      strengthGood: 'Good',
      strengthStrong: 'Strong',
      savedPasswords: 'Saved Passwords',
      noPasswords: 'No saved passwords yet.',
      labelPlaceholder: 'Label (e.g. Gmail)',
      usernameLabel: 'Username / Email (optional)',
      // Color Tool
      colorTitle: 'Color Picker',
      colorDesc: 'Pick, convert, and generate color palettes',
      pickColor: 'Pick Color',
      hexLabel: 'HEX',
      rgbLabel: 'RGB',
      hslLabel: 'HSL',
      cmykLabel: 'CMYK',
      savedColors: 'Saved Colors',
      noColors: 'No saved colors yet.',
      generatePalette: 'Generate Palette',
      paletteTypes: 'Palette Type',
      complementary: 'Complementary',
      analogous: 'Analogous',
      triadic: 'Triadic',
      tetradic: 'Tetradic',
      monochromatic: 'Monochromatic',
      // QR Tool
      qrTitle: 'QR Code',
      qrDesc: 'Generate and scan QR codes',
      qrGenerate: 'Generate',
      qrScan: 'Scan',
      qrInput: 'Enter text or URL...',
      qrSize: 'Size',
      qrColor: 'Color',
      qrBg: 'Background',
      downloadQR: 'Download QR',
      scanQR: 'Scan QR Code',
      scanFromCamera: 'Use Camera',
      scanFromFile: 'Upload Image',
      scanResult: 'Scan Result',
      noCamera: 'Camera not available',
      qrHistory: 'History',
      noHistory: 'No QR history yet.',
      // Image Tool
      imageTitle: 'Image Compressor',
      imageDesc: 'Compress images offline without upload',
      dropImage: 'Drop image here or click to browse',
      qualityLabel: 'Quality',
      maxWidthLabel: 'Max Width (px)',
      maxHeightLabel: 'Max Height (px)',
      formatLabel: 'Output Format',
      originalSize: 'Original',
      compressedSize: 'Compressed',
      savedSpace: 'Saved',
      downloadBtn: 'Download',
      compressBtn: 'Compress',
      documentTitle: 'Document Converter',
      documentDesc: 'Photos, Word, and PDF — processed on your device',
      documentPrivacy: 'Files are not uploaded. Conversion happens directly on your device.',
      // Common
      copied: 'Copied!',
      saved: 'Saved!',
      deleted: 'Deleted',
      error: 'Error',
      clear: 'Clear',
      close: 'Close',
      confirm: 'Confirm',
      cancel: 'Cancel',
      settings: 'Settings',
      language: 'Language',
      theme: 'Theme',
      lightMode: 'Light',
      darkMode: 'Dark',
      exportData: 'Export Data',
      importData: 'Import Data',
      clearAllData: 'Clear All Data',
      version: 'Version',
      about: 'About',
      // Toast
      toastCopied: 'Copied to clipboard!',
      toastSaved: 'Saved successfully!',
      toastDeleted: 'Deleted successfully!',
      toastError: 'Something went wrong.',
    },
    id: {
      // App
      appName: 'ToolKit',
      appTagline: 'Alat Harianmu',
      // Navigation
      home: 'Beranda',
      password: 'Sandi',
      color: 'Warna',
      qr: 'Kode QR',
      image: 'Gambar',
      document: 'Dokumen',
      // Home
      welcomeTitle: 'Toolkit Harian',
      welcomeSubtitle: 'Semua alat penting, offline & privat.',
      // Password Tool
      passwordTitle: 'Manajer Kata Sandi',
      passwordDesc: 'Buat kata sandi aman & simpan secara lokal',
      generateBtn: 'Buat',
      copyBtn: 'Salin',
      saveBtn: 'Simpan',
      deleteBtn: 'Hapus',
      lengthLabel: 'Panjang',
      includeUpper: 'Huruf Besar (A-Z)',
      includeLower: 'Huruf Kecil (a-z)',
      includeNumbers: 'Angka (0-9)',
      includeSymbols: 'Simbol (!@#$)',
      strengthLabel: 'Kekuatan',
      strengthWeak: 'Lemah',
      strengthFair: 'Cukup',
      strengthGood: 'Bagus',
      strengthStrong: 'Kuat',
      savedPasswords: 'Kata Sandi Tersimpan',
      noPasswords: 'Belum ada kata sandi tersimpan.',
      labelPlaceholder: 'Label (mis. Gmail)',
      usernameLabel: 'Username / Email (opsional)',
      // Color Tool
      colorTitle: 'Pemilih Warna',
      colorDesc: 'Pilih, konversi, dan buat palet warna',
      pickColor: 'Pilih Warna',
      hexLabel: 'HEX',
      rgbLabel: 'RGB',
      hslLabel: 'HSL',
      cmykLabel: 'CMYK',
      savedColors: 'Warna Tersimpan',
      noColors: 'Belum ada warna tersimpan.',
      generatePalette: 'Buat Palet',
      paletteTypes: 'Jenis Palet',
      complementary: 'Komplementer',
      analogous: 'Analog',
      triadic: 'Triadik',
      tetradic: 'Tetradik',
      monochromatic: 'Monokromatik',
      // QR Tool
      qrTitle: 'Kode QR',
      qrDesc: 'Buat dan pindai kode QR',
      qrGenerate: 'Buat',
      qrScan: 'Pindai',
      qrInput: 'Masukkan teks atau URL...',
      qrSize: 'Ukuran',
      qrColor: 'Warna',
      qrBg: 'Latar Belakang',
      downloadQR: 'Unduh QR',
      scanQR: 'Pindai Kode QR',
      scanFromCamera: 'Gunakan Kamera',
      scanFromFile: 'Unggah Gambar',
      scanResult: 'Hasil Pindai',
      noCamera: 'Kamera tidak tersedia',
      qrHistory: 'Riwayat',
      noHistory: 'Belum ada riwayat QR.',
      // Image Tool
      imageTitle: 'Kompresor Gambar',
      imageDesc: 'Kompres gambar offline tanpa unggah',
      dropImage: 'Letakkan gambar di sini atau klik untuk pilih',
      qualityLabel: 'Kualitas',
      maxWidthLabel: 'Lebar Maks (px)',
      maxHeightLabel: 'Tinggi Maks (px)',
      formatLabel: 'Format Output',
      originalSize: 'Asli',
      compressedSize: 'Terkompresi',
      savedSpace: 'Dihemat',
      downloadBtn: 'Unduh',
      compressBtn: 'Kompres',
      documentTitle: 'Konverter Dokumen',
      documentDesc: 'Foto, Word, dan PDF — diproses di perangkat',
      documentPrivacy: 'File tidak diunggah. Konversi dilakukan langsung di perangkat Anda.',
      // Common
      copied: 'Disalin!',
      saved: 'Disimpan!',
      deleted: 'Dihapus',
      error: 'Kesalahan',
      clear: 'Bersihkan',
      close: 'Tutup',
      confirm: 'Konfirmasi',
      cancel: 'Batal',
      settings: 'Pengaturan',
      language: 'Bahasa',
      theme: 'Tema',
      lightMode: 'Terang',
      darkMode: 'Gelap',
      exportData: 'Ekspor Data',
      importData: 'Impor Data',
      clearAllData: 'Hapus Semua Data',
      version: 'Versi',
      about: 'Tentang',
      // Toast
      toastCopied: 'Disalin ke clipboard!',
      toastSaved: 'Berhasil disimpan!',
      toastDeleted: 'Berhasil dihapus!',
      toastError: 'Terjadi kesalahan.',
    }
  },

  t(key) {
    return this.translations[this.currentLang][key] || this.translations['en'][key] || key;
  },

  setLang(lang) {
    this.currentLang = lang;
    localStorage.setItem('toolkit-lang', lang);
    this.applyTranslations();
  },

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });
    document.documentElement.lang = this.currentLang;
  }
};
