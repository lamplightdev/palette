class PaletteCameraCapture extends HTMLElement {
  constructor() {
    super();

    this._video = {
      width: 0,
      height: 0,
      aspectRatio: 0,
    };

    this._container = {
      width: 0,
      height: 0,
    };

    this._sources = [];
    this._currentSource = 0;
    this._available = false;

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;dddd
        }

        .container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;

          overflow: hidden;
        }

        button {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;

          width: 100%;
        }
      </style>

      <div class='container'>
        <video></video>
      </div>
      <button class='take-photo'>
        Snap
      </button>
    `;

    const container = this.shadowRoot.querySelector('.container');

    container.style.width = `${this.offsetWidth}px`;
    container.style.height = `${this.offsetHeight}px`;

    this._snap = this._snap.bind(this);
  }

  connectedCallback() {
    this._initVideoAction()
      .then(result => {
        this._available = true;

        const video = this.shadowRoot.querySelector('video');

        video.onloadedmetadata = () => {
          video.play();
          this._getInfo();
        };

        video.src = window.URL.createObjectURL(result);
      })
      .catch(err => {
        console.log('Error accessing video', err);
        this._available = false;
      });

    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', this._snap);
  }

  disconnectedCallback() {
    const button = this.shadowRoot.querySelector('button');
    button.removeEventListener('click', this._snap);
  }

  _initVideoAction() {
    return Promise.resolve().then(() => {
      if (!navigator || !navigator.mediaDevices) {
        return false;
      }

      let promise;
      this._sources = [];

      if (navigator.mediaDevices.enumerateDevices) {
        promise = navigator.mediaDevices.enumerateDevices().then(devices => {
          devices.forEach(device => {
            if (device.kind === 'videoinput') {
              this._sources.push(device.deviceId);
            }
          });
        }).catch(err => {
          console.log('Error enumerating devices', err);
        });
      } else if (window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
        promise = new Promise(resolve => {
          window.MediaStreamTrack.getSources(sources => {
            sources.forEach(source => {
              if (source.kind === 'video') {
                this._sources.push(source.id);
              }
            });

            resolve();
          });
        });
      } else {
        promise = Promise.resolve();
      }

      return promise.then(() => {
        if (this._sources.length > 1) {
          // this._ui.elements.videoSourceButton.classList.remove('hide');
        }

        return navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            optional: [{
              sourceId: this._sources[this._currentSource],
            }],
          },
        });
      });
    });
  }

  _getInfo() {
    const video = this.shadowRoot.querySelector('video');
    const container = this.shadowRoot.querySelector('.container');

    this._video.width = video.videoWidth;
    this._video.height = video.videoHeight;
    this._video.aspectRatio = this._video.width / this._video.height;

    this._container.width = container.offsetWidth;
    this._container.height = container.offsetHeight;
    this._container.aspectRatio = this._container.width / this._container.height;

    if (this._video.aspectRatio > this._container.aspectRatio) {
      video.style.height = `${this._container.height}px`;
    } else {
      video.style.width = `${this._container.width}px`;
    }
  }

  _snap() {
    const video = this.shadowRoot.querySelector('video');

    const canvas = document.createElement('canvas');
    canvas.width = this._video.width;
    canvas.height = this._video.height;

    canvas.getContext('2d').drawImage(video, 0, 0);

    this.dispatchEvent(new CustomEvent('snap', {
      detail: {
        src: canvas.toDataURL(),
      },
    }));
  }
}

window.customElements.define('palette-camera-capture', PaletteCameraCapture);
