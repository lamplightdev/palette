class Palette {
  constructor() {
    this._availableActions = {
      video: false,
      upload: false,
      input: false,
    };

    this._currentAction = false;

    this._ui = {
      vars: {
        size: 150,
      },
      elements: {},
      events: {},
    };
  }

  init() {
    const promises = [];

    this.initUI();

    promises.push(this.initActions());

    return Promise.all(promises);
  }

  getAvailableActions() {
    return this._availableActions;
  }

  initActions() {
    const promises = [];

    promises.push(this.initVideoAction()
      .then(result => {
        this._availableActions.video = result;
      })
      .catch(err => {
        this._availableActions.video = false;
      }));

    promises.push(this.initUploadAction().then(result => {
      this._availableActions.upload = result;
    }));

    promises.push(this.initInputAction().then(result => {
      this._availableActions.input = result;
    }));

    return Promise.all(promises).then(() => {
      let numDisabled = 0;

      if (!this._availableActions.video) {
        this._ui.elements.actionContainer.removeChild(this._ui.elements.videoContainer);
        numDisabled++;
      } else {
        this._ui.elements.video.src = window.URL.createObjectURL(this._availableActions.video);
        this._ui.elements.video.onloadedmetadata = () => {
          this._ui.elements.video.play();

          const previewSize = this._ui.elements.video.offsetWidth;

          let biggestSide;
          let smallestSide;
          let aspectRatio;

          if (this._ui.elements.video.videoHeight > this._ui.elements.video.videoWidth) {
            biggestSide = 'height';
            smallestSide = 'width';
            aspectRatio = this._ui.elements.video.videoHeight / this._ui.elements.video.videoWidth;
          } else {
            biggestSide = 'width';
            smallestSide = 'height';
            aspectRatio = this._ui.elements.video.videoWidth / this._ui.elements.video.videoHeight;
          }

          const offset =
            Math.abs(this._ui.elements.video.videoHeight - this._ui.elements.video.videoWidth) / 2;

          this._ui.elements.video.style[biggestSide] =
            this._ui.elements.canvas.style[biggestSide] = `${previewSize * aspectRatio}px`;

          this._ui.elements.canvas[biggestSide] = previewSize * aspectRatio;
          this._ui.elements.canvas[smallestSide] = previewSize;

          this._ui.elements.videoButton.addEventListener('click', () => {
            this._ui.elements.videoButton.classList.add('hide');
            this._ui.elements.canvasContext.drawImage(this._ui.elements.video,
              biggestSide === 'height' ? 0 : offset,
              biggestSide === 'width' ? 0 : offset,
              biggestSide === 'height' ?
                this._ui.elements.video.videoWidth :
                this._ui.elements.video.videoHeight,
              biggestSide === 'height' ?
                this._ui.elements.video.videoWidth :
                this._ui.elements.video.videoHeight,
              0,
              0,
              previewSize,
              previewSize
            );
            const pixel = this._ui.elements.canvasContext
              .getImageData(previewSize / 2, previewSize / 2, 1, 1)
              .data;

            // pixel[0] = getRandom(0, 255);
            // pixel[1] = getRandom(0, 255);
            // pixel[2] = getRandom(0, 255);

            this.addColour(pixel);
          });
        };
      }

      if (!this._availableActions.upload) {
        this._ui.elements.actionContainer.removeChild(this._ui.elements.uploadContainer);
        numDisabled++;
      }
      if (!this._availableActions.input) {
        this._ui.elements.actionContainer.removeChild(this._ui.elements.inputContainer);
        numDisabled++;
      }

      if (numDisabled > 1) {
        this._ui.elements.btnSource.parentNode.removeChild(this._ui.elements.btnSource);
      }
    });
  }

  initVideoAction() {
    return Promise.resolve().then(() => {
      if (!navigator || !navigator.mediaDevices) {
        return false;
      }

      return navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'environment',
        },
      });
    });
  }

  initUploadAction() {
    return Promise.resolve().then(() => !!FileReader);
  }

  initInputAction() {
    return Promise.resolve().then(() => true);
  }

  initUI() {
    this._ui.elements.video = document.querySelector('video');
    this._ui.elements.videoContainer = document.querySelector('.video-container');
    this._ui.elements.uploadContainer = document.querySelector('.upload-container');
    this._ui.elements.inputContainer = document.querySelector('.input-container');
    this._ui.elements.videoButton = this._ui.elements.videoContainer.querySelector('button');
    this._ui.elements.canvas = document.querySelector('canvas');
    this._ui.elements.canvasContext = this._ui.elements.canvas.getContext('2d');
    this._ui.elements.colourContainer = document.querySelector('.colour-container');
    this._ui.elements.coloursContainer = document.querySelector('.colours-container');
    this._ui.elements.colourRGB = document.querySelector('.colour-rgb');
    this._ui.elements.colourHex = document.querySelector('.colour-hex');
    this._ui.elements.fileUpload = document.querySelector('.file-upload');
    this._ui.elements.actionContainer = document.querySelector('.action-container');
    this._ui.elements.btnSource = document.querySelector('.btn--source');
    this._ui.elements.inputForm = document.querySelector('.input-container form');

    this._ui.elements.inputForm.addEventListener('submit', event => {
      event.preventDefault();
      const pixel = event.target.colour.value.split(',').map(col => parseInt(col.trim(), 10));
      this.addColour(pixel);
    });

    this._ui.elements.fileUpload.addEventListener('change', event => {
      const data = event.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        const image = new Image();
        image.src = reader.result;

        this._ui.elements.canvasContext.drawImage(image, 0, 0);

        const pixel = this._ui.elements.canvasContext
          .getImageData(
            this._ui.elements.canvas.width / 2,
            this._ui.elements.canvas.height / 2,
            1,
            1
          )
          .data;

        this.addColour(pixel);
      });
      reader.readAsDataURL(data);
    });

    this._ui.events.switchAction = (element) => {
      element.classList.add('animate-container');
      element.style.transform = `translateX(-${this._ui.vars.size}px)`;
    };

    this._ui.events.actionEndTransition = (element) => {
      element.classList.remove('animate-container');

      requestAnimationFrame(() => {
        element.style.transform = '';
        element.appendChild(element.children[0]);
        // video.play();
      });
    };

    this._ui.elements.btnSource.addEventListener('click', event => {
      event.preventDefault();
      this._ui.events.switchAction(this._ui.elements.actionContainer);
    });

    this._ui.elements.actionContainer.addEventListener('transitionend', event => {
      if (event.propertyName === 'transform') {
        this._ui.events.actionEndTransition(this._ui.elements.actionContainer);
        this._ui.elements.video.play();
      }
    });
  }

  addColour(pixel) {
    console.log(pixel);
  }
}

const paletteApp = new Palette();

paletteApp.init().then(() => {
  console.log('done', paletteApp.getAvailableActions());
});
