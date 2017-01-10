class PaletteSavedColours extends HTMLElement {
  constructor() {
    super();

    this._colours = [];

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }
      </style>

      <

      <div id='container'></div>
    `;
  }

  addColour(colour) {

  }
}

window.customElements.define('palette-current-colour', PaletteCurrentColour);
