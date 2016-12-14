class PaletteImageUpload extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
        }
      </style>

      <h1>Hi</h1>
    `;

    this.style.width = `${this.offsetHeight}px`;
  }
}

window.customElements.define('palette-image-upload', PaletteImageUpload);
