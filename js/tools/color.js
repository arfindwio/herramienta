// ToolKit - Color Picker & Palette Generator Tool

window.ColorTool = {
  currentHex: '#2b2d35',

  init() {
    this.bindEvents();
    this.updateFromHex(this.currentHex);
    this.renderSavedColors();
  },

  bindEvents() {
    const picker = document.getElementById('color-picker-input');
    if (picker) {
      picker.addEventListener('input', (e) => this.updateFromHex(e.target.value));
      picker.addEventListener('change', (e) => this.updateFromHex(e.target.value));
    }

    document.getElementById('color-hex-input').addEventListener('input', (e) => {
      let val = e.target.value;
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{6}$/.test(val)) this.updateFromHex(val);
    });

    document.getElementById('color-save-btn').addEventListener('click', () => this.saveColor());
    document.getElementById('color-gen-palette-btn').addEventListener('click', () => this.generatePalette());

    // Copy buttons
    ['hex', 'rgb', 'hsl', 'cmyk'].forEach(type => {
      const btn = document.getElementById(`copy-${type}-btn`);
      if (btn) btn.addEventListener('click', () => this.copyValue(type));
    });
  },

  updateFromHex(hex) {
    this.currentHex = hex;
    const rgb = this.hexToRgb(hex);
    if (!rgb) return;

    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const cmyk = this.rgbToCmyk(rgb.r, rgb.g, rgb.b);

    // Update picker
    const picker = document.getElementById('color-picker-input');
    if (picker) picker.value = hex;

    // Update preview
    const preview = document.getElementById('color-preview-swatch');
    if (preview) preview.style.backgroundColor = hex;

    // Update values
    document.getElementById('color-hex-input').value = hex.toUpperCase();
    document.getElementById('color-rgb-value').value = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('color-hsl-value').value = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
    document.getElementById('color-cmyk-value').value = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

    // Update text color for readability
    const luminance = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
    if (preview) preview.style.color = luminance > 128 ? '#000' : '#fff';
  },

  saveColor() {
    const colorData = {
      hex: this.currentHex,
      rgb: document.getElementById('color-rgb-value').value,
      hsl: document.getElementById('color-hsl-value').value,
    };
    Storage.saveColor(colorData);
    App.showToast(i18n.t('toastSaved'));
    this.renderSavedColors();
  },

  renderSavedColors() {
    const list = document.getElementById('color-saved-list');
    const colors = Storage.getSavedColors();

    if (colors.length === 0) {
      list.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
          </div>
          <span>${i18n.t('noColors')}</span>
        </div>`;
      return;
    }

    list.innerHTML = colors.map(c => `
      <div class="color-chip" onclick="ColorTool.updateFromHex('${c.hex}')" title="${c.hex}">
        <div class="color-chip-swatch" style="background:${c.hex}"></div>
        <div class="color-chip-info">
          <span class="color-chip-hex">${c.hex.toUpperCase()}</span>
          <button class="icon-btn danger tiny" onclick="event.stopPropagation();ColorTool.deleteColor('${c.id}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    `).join('');
  },

  deleteColor(id) {
    Storage.deleteColor(id);
    this.renderSavedColors();
  },

  async copyValue(type) {
    const el = document.getElementById(`color-${type}-${type === 'hex' ? 'input' : 'value'}`);
    if (!el) return;
    try {
      await navigator.clipboard.writeText(el.value);
      App.showToast(i18n.t('toastCopied'));
    } catch (e) {
      el.select();
      document.execCommand('copy');
      App.showToast(i18n.t('toastCopied'));
    }
  },

  generatePalette() {
    const type = document.getElementById('palette-type').value;
    const hex = this.currentHex;
    const rgb = this.hexToRgb(hex);
    const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);

    let colors = [];
    switch (type) {
      case 'complementary':
        colors = [hex, this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)];
        break;
      case 'analogous':
        colors = [
          this.hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
          hex,
          this.hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
        ];
        break;
      case 'triadic':
        colors = [hex, this.hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l), this.hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)];
        break;
      case 'tetradic':
        colors = [hex, this.hslToHex((hsl.h + 90) % 360, hsl.s, hsl.l), this.hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l), this.hslToHex((hsl.h + 270) % 360, hsl.s, hsl.l)];
        break;
      case 'monochromatic':
        colors = [
          this.hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 30)),
          this.hslToHex(hsl.h, hsl.s, Math.max(10, hsl.l - 15)),
          hex,
          this.hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 15)),
          this.hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30)),
        ];
        break;
      default:
        colors = [hex];
    }

    this.renderPalette(colors);
  },

  renderPalette(colors) {
    const container = document.getElementById('palette-result');
    container.innerHTML = colors.map(hex => `
      <div class="palette-swatch" onclick="ColorTool.updateFromHex('${hex}')" style="background:${hex}">
        <div class="palette-swatch-label">${hex.toUpperCase()}</div>
      </div>
    `).join('');
  },

  // --- Color conversion helpers ---
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  },

  rgbToCmyk(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    return {
      c: Math.round(((1 - r - k) / (1 - k)) * 100),
      m: Math.round(((1 - g - k) / (1 - k)) * 100),
      y: Math.round(((1 - b - k) / (1 - k)) * 100),
      k: Math.round(k * 100),
    };
  },

  hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = n => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  },
};
