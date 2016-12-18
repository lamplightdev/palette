class PaletteImageUpload extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    const name = this.getAttribute('name');

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
        }
      </style>

      <h1>Hi ${name}</h1>
    `;

    this.style.width = `${this.offsetHeight}px`;
  }
}

window.customElements.define('palette-image-upload', PaletteImageUpload);
