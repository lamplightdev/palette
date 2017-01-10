class PaletteImageUpload extends HTMLElement {
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: lightblue;
        }

        input {
          width: 0.1px;
          height: 0.1px;
          opacity: 0;
          overflow: hidden;
          position: absolute;
          z-index: -1;
        }

        input + label {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
      </style>

      <input
        type='file'
        accept='image/*'
        id='imagefile'
        name='imagefile'
      >
      <label for="imagefile">
        <slot id='content'>
          <h1>Upload</h1>
        </slot>
      </label>
    `;

    this.style.width = `${this.offsetHeight}px`;

    this._upload = this._upload.bind(this);
  }

  connectedCallback() {
    const input = this.shadowRoot.querySelector('input');

    input.addEventListener('change', this._upload);
  }

  disconnectedCallback() {
    const input = this.shadowRoot.querySelector('input');

    input.removeEventListener('change', this._upload);
  }

  _upload(event) {
    const data = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.dispatchEvent(new CustomEvent('upload', {
        detail: {
          src: reader.result,
        },
      }));
    });
    reader.readAsDataURL(data);
  }
}

window.customElements.define('palette-image-upload', PaletteImageUpload);
