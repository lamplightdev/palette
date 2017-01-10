class LamplightLayout extends HTMLElement {
  static get observedAttributes() {
    return ['type'];
  }

  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
        }

        :host([type=column]) {
          flex-direction: column;
        }

        :host([type=card]) #items::slotted(*) {
          position: absolute;
          top: 0;

          transition: transform 0.2s ease-out 0s;
        }

        #items {

        }

          #items::slotted(*) {
            background-color: #eeeeee;
            opacity: 0.9;
            border: 1px solid lightgray;
            border-radius: 5px;
            width: 150px;
            height: 200px;
            margin: 5px;
            padding: 5px;
          }
      </style>

      <slot id='items'></slot>
    `;
  }

  get type() {
    return this.getAttribute('type');
  }

  set type(type) {
    this.setAttribute('type', type);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'type':
        this._typeChanged(oldValue, newValue);
        break;
      default:
        break;
    }
  }

  _typeChanged(oldValue, newValue) {
    const items = this.shadowRoot.querySelector('slot#items')
      .assignedNodes()
      .filter(node => node.nodeType !== Node.TEXT_NODE);

    if (newValue === 'card') {
      [...items].forEach((item, index) => {
        item.style.transform = `translateY(${30 * index}px) rotateZ(${5 * (index % 2 === 0 ? 1 : -1)}deg)`;
      });
    } else {
      [...items].forEach((item) => {
        item.style.transform = '';
      });
    }
  }
}

window.customElements.define('lamplight-layout', LamplightLayout);
