class PaletteCameraCapture extends HTMLElement {
  constructor() {
    super();

    this._sources = [];
    this._currentSource = 0;
    this._available = false;

    const shadowRoot = this.attachShadow({ mode: 'open' });

    shadowRoot.innerHTML = `
      <style>
        :host {
          font-family: serif;
          display: flex;
          flex-direction: column;
        }

        video {
          height: 100%;
        }
      </style>

      <video></video>
      <button class='take-photo'>
        Snap
      </button>
    `;

    const video = this.shadowRoot.querySelector('video');

    video.setAttribute('width', this.offsetHeight);
    video.setAttribute('height', this.offsetHeight);
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

  connectedCallback() {
    this._initVideoAction()
      .then(result => {
        this._available = true;

        const video = this.shadowRoot.querySelector('video');

        video.onloadedmetadata = () => {
          video.play();
        };

        video.src = window.URL.createObjectURL(result);
      })
      .catch(err => {
        console.log('Error accessing video', err);
        this._available = false;
      });
  }
}

window.customElements.define('palette-camera-capture', PaletteCameraCapture);
