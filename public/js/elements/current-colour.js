class PaletteCurrentColour extends HTMLElement {
  constructor() {
    super();

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

      <div id='rgb'></div>
      <div id='colour'></div>
      <div id='hex'></div>
    `;
  }

  static get observedAttributes() {
    return ['colour'];
  }

  get colour() {
    return this.getAttribute('colour');
  }

  set colour(colour) {
    this.setAttribute('colour', colour);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'colour':
        this._colourChanged(oldValue, newValue);
        break;
      default:
        break;
    }
  }

  _colourChanged(oldValue, newValue) {
    console.log(oldValue, newValue);

    this.shadowRoot.querySelector('#colour').textContent = newValue;
  }
}

window.customElements.define('palette-current-colour', PaletteCurrentColour);
