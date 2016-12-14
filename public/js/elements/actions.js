class PaletteActions extends HTMLElement {
  constructor() {
    super();

    console.log('palette-actions contstructor');

    this._size = {
      width: 0,
      height: 0,
    };

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          overflow: hidden;
          position: relative;
        }

        .container {
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;

          transition: left 1s linear 0s;
        }

        #actions::slotted(*) {
        }
      </style>

      <div class='container'>
        <slot id='actions'></slot>
      </div>
    `;

    this.addEventListener('click', () => {
      if (!this.shadowRoot.querySelector('.container').style.left) {
        this.shadowRoot.querySelector('.container').style.left = 0;
      }
      this.shadowRoot.querySelector('.container').style.left = `${parseInt(this.shadowRoot.querySelector('.container').style.left, 10) - 250}px`;
    });
  }

  connectedCallback() {
    console.log('palette-actions connected');

    this._size.width = this.offsetWidth;
    this._size.height = this.offsetHeight;

    const maxDimension = Math.max(this._size.width, this._size.height);

    const slot = this.shadowRoot.querySelector('slot#actions');
    console.log(slot.assignedNodes());
  }

  disconnectedCallback() {
    console.log('palette-actions disconnected');
  }
}

window.customElements.define('palette-actions', PaletteActions);
