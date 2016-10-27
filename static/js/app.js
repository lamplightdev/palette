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
        maxSamples: 5,
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

            this.pushSample(pixel);
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
    this._ui.elements.sampleContainer = document.querySelector('.sample-container');
    this._ui.elements.samplesContainer = document.querySelector('.samples-container');
    this._ui.elements.sampleRGB = document.querySelector('.sample-rgb');
    this._ui.elements.sampleHex = document.querySelector('.sample-hex');
    this._ui.elements.fileUpload = document.querySelector('.file-upload');
    this._ui.elements.actionContainer = document.querySelector('.action-container');
    this._ui.elements.btnSource = document.querySelector('.btn--source');
    this._ui.elements.inputForm = document.querySelector('.input-container form');

    this._ui.elements.inputForm.addEventListener('submit', event => {
      event.preventDefault();
      const pixel = event.target.colour.value.split(',').map(col => parseInt(col.trim(), 10));
      this.pushSample(pixel);
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

        this.pushSample(pixel);
      });
      reader.readAsDataURL(data);
    });

    this._ui.elements.btnSource.addEventListener('click', event => {
      event.preventDefault();

      this._ui.elements.actionContainer.appendChild(this._ui.elements.actionContainer.children[0]);
      this._ui.elements.video.play();
    });
  }

  pushSample(pixel) {
    const sample = this.createSample(pixel);

    sample.addEventListener('click', event => {
      event.preventDefault();

      if (sample.parentNode === this._ui.elements.samplesContainer) {
        const mainSample = this._ui.elements.sampleContainer.firstChild;
        const mainSampleClassName = mainSample.className;

        this._ui.elements.samplesContainer.insertBefore(mainSample, sample);
        this._ui.elements.sampleContainer.appendChild(sample);

        mainSample.className = sample.className;
        sample.className = mainSampleClassName;

        this.updateSampleData([
          sample.dataset.r,
          sample.dataset.g,
          sample.dataset.b,
        ]);
      } else if (sample.parentNode === this._ui.elements.sampleContainer) {
        if (sample.classList.contains('sample--fullscreen')) {
          sample.classList.remove('sample--fullscreen');
        } else {
          sample.classList.add('sample--fullscreen');
        }
      }
    });

    const currentSamples = [];
    for (let i = 0; i < this._ui.elements.samplesContainer.length; i++) {
      currentSamples.push(this._ui.elements.samplesContainer[i]);
    }

    const currentSample = this._ui.elements.sampleContainer.firstChild;
    if (currentSample) {
      this._ui.elements.samplesContainer
        .insertBefore(currentSample, currentSamples[0]);
    }
    this._ui.elements.sampleContainer.appendChild(sample);

    if (this._ui.elements.samplesContainer.children.length > this._ui.vars.maxSamples) {
      this._ui.elements.samplesContainer
        .removeChild(this._ui.elements.samplesContainer.children[this._ui.vars.maxSamples]);
    }

    this.updateSampleData(pixel);

    requestAnimationFrame(() => {
      const sourceContainerRect = this._ui.elements.videoContainer.getBoundingClientRect();
      const targetContainerRect = this._ui.elements.sampleContainer.getBoundingClientRect();

      let scale = sourceContainerRect.width / targetContainerRect.width;

      let x = sourceContainerRect.left
        - targetContainerRect.left
        + (sourceContainerRect.width - targetContainerRect.width) / 2;

      let y = sourceContainerRect.top
        - targetContainerRect.top
        + (sourceContainerRect.height - targetContainerRect.height) / 2;

      sample.style.transform =
        `scale(${scale}) translateX(${x / scale}px) translateY(${y / scale}px)`;

      if (currentSample) {
        const currentTargetContainerRect =
          this._ui.elements.samplesContainer.children[0].getBoundingClientRect();

        scale = targetContainerRect.width / currentTargetContainerRect.width;

        x = targetContainerRect.left
          - currentTargetContainerRect.left
          + (targetContainerRect.width - currentTargetContainerRect.width) / 2;

        y = targetContainerRect.top
          - currentTargetContainerRect.top
          + (targetContainerRect.height - currentTargetContainerRect.height) / 2;

        currentSample.style.transform =
          `scale(${scale}) translateX(${x / scale}px) translateY(${y / scale}px)`;

        currentSample.style.color =
          `rgb(
            ${currentSamples[0].dataset.r},
            ${currentSamples[0].dataset.g},
            ${currentSamples[0].dataset.b}
          )`;
        currentSamples[this._ui.vars.maxSamples - 2].classList.add('sample--last');
      }

      const currentSamplesWidth = currentSamples[0].offsetWidth;
      currentSamples.forEach(samp => {
        samp.style.transform = `translateX(-${currentSamplesWidth}px)`;
      });

      requestAnimationFrame(() => {
        sample.style.transition = 'transform 0.3s ease-in-out 0s';
        sample.style.transform = '';

        if (currentSample) {
          currentSample.style.transition = 'transform 0.3s ease-in-out 0s';
          currentSample.style.transform = '';
        }

        currentSamples.forEach(samp => {
          samp.style.transition = 'transform 0.3s ease-in-out 0s';
          samp.style.transform = '';
        });
      });
    });

    sample.addEventListener('transitionend', event => {
      sample.style.transition = '';
    });
  }

  createSample(pixel) {
    const sample = document.createElement('div');
    sample.className = 'sample';
    sample.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    sample.dataset.r = pixel[0];
    sample.dataset.g = pixel[1];
    sample.dataset.b = pixel[2];

    return sample;
  }

  updateSampleData(pixel) {
    this._ui.elements.sampleRGB.textContent = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    this._ui.elements.sampleHex.textContent = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  }
}

const paletteApp = new Palette();

paletteApp.init().then(() => {
  console.log('done', paletteApp.getAvailableActions());
});
