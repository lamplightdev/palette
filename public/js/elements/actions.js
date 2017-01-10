class PaletteActions extends HTMLElement {
  static get observedAttributes() {
    return ['index'];
  }

  get index() {
    return this.getAttribute('index') || 0;
  }

  set index(index) {
    this.setAttribute('index', index);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case 'index':
        this._indexChanged(oldValue, newValue);
        break;
      default:
        break;
    }
  }

  _indexChanged(oldValue, newValue) {
    this._nextAction(parseInt(oldValue, 10) || 0, parseInt(newValue, 10));
  }

  constructor() {
    super();

    this._elements = {
      container: null,
      button: null,
      slot: null,
      actions: [],
    };

    this._actionInfo = {
      number: 0,
      order: [],
    };

    this._size = {
      width: 0,
      height: 0,
    };

    const shadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = `
      <style>
        :host {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .container {
          display: flex;
          position: absolute;
          top: 0;
          left: 0;
          bottom: 0;

          transition: transform 0.4s ease-in-out 0s;
        }

        .container.no-animation {
          transition: none;
        }

        button {
          position: relative;
        }

        #actions::slotted(*) {
        }
      </style>

      <div class='container no-animation'>
        <slot id='actions'></slot>
      </div>
    `;

    this._elements.slot = this.shadowRoot.querySelector('slot#actions');
    this._elements.container = this.shadowRoot.querySelector('.container');

    this._transitionEnd = this._transitionEnd.bind(this);
  }

  connectedCallback() {
    this._elements.actions = this._elements.slot
      .assignedNodes()
      .filter(node => node.nodeType !== Node.TEXT_NODE);

    this._actionInfo.order = [];
    this._elements.actions.forEach((action, index) => {
      action.dataset.index = index;
      this._actionInfo.order.push(index);
    });

    this._actionInfo.number = this._actionInfo.order.length;

    this._size.width = this.offsetWidth;
    this._size.height = this.offsetHeight;

    this._elements.actions.forEach(action => {
      action.style.width = `${this._size.width}px`;
      action.style.height = `${this._size.height}px`;
    });

    this._elements.container.addEventListener('transitionend', this._transitionEnd);
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._nextAction);
    this.removeEventListener('transitionend', this._transitionEnd);
  }

  _nextAction(prevIndex, nextIndex) {
    console.log(prevIndex, nextIndex);

    let left = 0;
    this._diff = nextIndex - prevIndex;
    if (this._diff === this._actionInfo.number - 1) {
      this._diff = -1;
    } else if (this._diff === -1 * (this._actionInfo.number - 1)) {
      this._diff = 1;
    }

    if (Math.abs(this._diff) < this._actionInfo.number) {
      left = this._size.width * this._diff;
    } else {
      left = this._size.width * (this._diff + this._actionInfo.number - 1);
    }

    if (this._diff < 0) {
      const parent = this._elements.actions[this._actionInfo.number - 1].parentNode;

      for (let i = 0; i > this._diff; i--) {
        parent.insertBefore(this._elements.actions[this._actionInfo.number - 1], this._elements.actions[0]);

        this._elements.actions.unshift(this._elements.actions.pop());
        this._actionInfo.order.unshift(this._actionInfo.order.pop());
      }

      requestAnimationFrame(() => {
        this._elements.container.style.transform = `translateX(${1 * left}px)`;
        requestAnimationFrame(() => {
          this._elements.container.classList.remove('no-animation');
          this._elements.container.style.transform = '';
        });
      });
    } else {
      this._elements.container.classList.remove('no-animation');
      requestAnimationFrame(() => {
        this._elements.container.style.transform = `translateX(${-1 * left}px)`;
      });
    }
  }

  _transitionEnd() {
    this._elements.container.classList.add('no-animation');
    this._elements.container.style.transform = '';

    if (this._diff > 0) {
      const parent = this._elements.actions[0].parentNode;

      for (let i = 0; i < this._diff; i++) {
        parent.appendChild(this._elements.actions[0]);

        this._elements.actions.push(this._elements.actions.shift());
        this._actionInfo.order.push(this._actionInfo.order.shift());
      }
    }

    console.log(this._actionInfo.order);
  }
}

window.customElements.define('palette-actions', PaletteActions);
