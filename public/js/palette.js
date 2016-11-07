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
        size: 200,
        maxSamples: 5,
        count: 5,
        duration: 0.4,
        maxDimension: Math.max(window.innerWidth, window.innerHeight),
      },
      elements: {},
      events: {},
    };

    this._animationBatch = [];
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
        this._ui.elements.videoContainer.classList.add('show');
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

            this.pushSample(pixel, this._ui.elements.videoContainer);
          });
        };
      }

      if (!this._availableActions.upload) {
        this._ui.elements.actionContainer.removeChild(this._ui.elements.uploadContainer);
        numDisabled++;
      } else {
        this._ui.elements.uploadContainer.classList.add('show');
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
    this.initUIElements();
    this.initUIEvents();
  }

  initUIElements() {
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
    this._ui.elements.inputForm = document.querySelector('.input-container');
    this._ui.elements.colourBarHeading = document.querySelector('.colour-bar > h1');
    this._ui.elements.colourBarDivs = document.querySelectorAll('.colour-bar > div');
  }

  initUIEvents() {
    this._ui.elements.inputForm.addEventListener('submit', event => {
      event.preventDefault();

      const value = event.target.colour.value;
      const valid = this.constructor.parseColourText(value);
      if (valid) {
        event.target.colour.classList.remove('warn');

        let pixel;

        if (valid.type === 'rgb') {
          pixel = valid.value;
        } else {
          // hex
          pixel = this.constructor.hexToRgb(valid.value);
        }

        this.pushSample(pixel, this._ui.elements.inputContainer);
      } else {
        event.target.colour.classList.add('warn');
      }
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

        this.pushSample(pixel, this._ui.elements.uploadContainer);
      });
      reader.readAsDataURL(data);
    });

    this._ui.elements.btnSource.addEventListener('click', event => {
      event.preventDefault();

      this._ui.elements.actionContainer.style.left = `-${this._ui.vars.size}px`;
      this.pushAnimation(
        this._ui.elements.actionContainer,
        `translateX(${this._ui.vars.size}px)`,
        `transform ${this._ui.vars.duration}s ease-in-out 0s`,
        () => {
          this._ui.elements.actionContainer.appendChild(
            this._ui.elements.actionContainer.children[0]
          );
          this._ui.elements.actionContainer.style.left = '';
          this._ui.elements.video.play();
        }
      );

      this.runAnimation();
    });
  }

  pushSample(pixel, fromElement) {
    const sample = this.createSample(pixel);

    sample.addEventListener('click', event => {
      event.preventDefault();

      if (sample.parentNode === this._ui.elements.samplesContainer) {
        const mainSample = this._ui.elements.sampleContainer.firstChild;
        const mainSampleClassName = mainSample.className;
        const mainSampleTransform = mainSample.style.transform;

        this._ui.elements.samplesContainer.insertBefore(mainSample, sample);
        this._ui.elements.sampleContainer.appendChild(sample);

        mainSample.className = sample.className;
        mainSample.style.transform = sample.style.transform;
        sample.className = mainSampleClassName;
        sample.style.transform = mainSampleTransform;

        this.updateSampleData([
          parseInt(sample.dataset.r, 10),
          parseInt(sample.dataset.g, 10),
          parseInt(sample.dataset.b, 10),
        ]);

        if (!sample.classList.contains('sample--fullscreen')) {
          this.pushAnimation(
            sample,
            mainSample,
            `transform ${this._ui.vars.duration}s ease-in-out 0s`
          );

          this.pushAnimation(
            mainSample,
            sample,
            `transform ${this._ui.vars.duration}s ease-in-out 0s`
          );

          this.runAnimation();
        }
      } else if (sample.parentNode === this._ui.elements.sampleContainer) {
        if (sample.classList.contains('sample--fullscreen')) {
          sample.classList.remove('sample--fullscreen');
          sample.style.transform = '';
        } else {
          sample.classList.add('sample--fullscreen');
          sample.style.transform = `scale(${Math.ceil(this._ui.vars.maxDimension / 50) * 2})`;
        }
      }
    });

    const currentSamples = [];
    for (let i = 0; i < this._ui.elements.samplesContainer.children.length; i++) {
      currentSamples.push(this._ui.elements.samplesContainer.children[i]);
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

    this.pushAnimation(
      sample,
      fromElement,
      `transform ${this._ui.vars.duration}s ease-in-out 0.2s`
    );

    if (currentSample) {
      this.pushAnimation(
        currentSample,
        this._ui.elements.sampleContainer,
        `transform ${this._ui.vars.duration}s ease-in-out 0s`
      );

      currentSample.style.color =
        `rgb(
          ${currentSamples[0].dataset.r},
          ${currentSamples[0].dataset.g},
          ${currentSamples[0].dataset.b}
        )`;
    }

    currentSamples.forEach(samp => {
      this.pushAnimation(
        samp,
        'translateX(-50px)',
        `transform ${this._ui.vars.duration}s ease-in-out 0s`
      );
    });

    this.runAnimation();
  }

  createSample(pixel) {
    const sample = document.createElement('div');
    this._ui.vars.count++;
    sample.id = `sample-${this._ui.vars.count}`;
    sample.className = 'sample';
    sample.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    sample.dataset.r = pixel[0];
    sample.dataset.g = pixel[1];
    sample.dataset.b = pixel[2];

    return sample;
  }

  static rgbInfo(pixel) {
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  }

  static hexInfo(pixel) {
    return this.rgbToHex(pixel[0], pixel[1], pixel[2]);
  }

  updateSampleData(pixel) {
    this._ui.elements.colourBarHeading.style.color = this.constructor.rgbInfo(pixel);

    for (let i = 0; i < this._ui.elements.colourBarDivs.length; i++) {
      this._ui.elements.colourBarDivs[i].style.backgroundColor = this.constructor.rgbInfo(pixel);
    }

    this._ui.elements.sampleRGB.textContent = this.constructor.rgbInfo(pixel);
    this._ui.elements.sampleHex.textContent = this.constructor.hexInfo(pixel);
  }

  pushAnimation(element, from, transition, onTransitionEnd = null) {
    this._animationBatch.push({
      element,
      from,
      transition,
      onTransitionEnd,
    });
  }

  runAnimation() {
    const rects = {};

    requestAnimationFrame(() => {
      this._animationBatch.forEach(animation => {
        if (animation.from.tagName) {
          // is DOM element
          if (!rects[animation.from.id]) {
            rects[animation.from.id] = animation.from.getBoundingClientRect();
          }
          const fromRect = rects[animation.from.id];

          if (!rects[animation.element.id]) {
            rects[animation.element.id] = animation.element.getBoundingClientRect();
          }
          const toRect = rects[animation.element.id];

          const scale = fromRect.width / toRect.width;

          const x = fromRect.left
            - toRect.left
            + (fromRect.width - toRect.width) / 2;

          const y = fromRect.top
            - toRect.top
            + (fromRect.height - toRect.height) / 2;

          animation.element.style.transform =
            `scale(${scale}) translateX(${x / scale}px) translateY(${y / scale}px)`;
        } else {
          // is transform string
          animation.element.style.transform = animation.from;
        }
      });

      this._ui.elements.samplesContainer.children[this._ui.vars.maxSamples - 1].classList.add('sample--last');

      requestAnimationFrame(() => {
        this._animationBatch.forEach(animation => {
          animation.element.style.transition = animation.transition;
          animation.element.style.transform = '';
        });

        this._animationBatch = [];
      });

      this._animationBatch.forEach(animation => {
        animation.transitionEnd = () => {
          animation.element.style.transition = '';
          animation.element.removeEventListener('transitionend', animation.transitionEnd);

          if (animation.onTransitionEnd) {
            animation.onTransitionEnd();
          }
        };
        animation.element.addEventListener('transitionend', animation.transitionEnd);
      });
    });
  }

  static parseColourText(text) {
    let test = text.trim();

    let valid = false;
    let type = false;

    if (test.indexOf(',') > -1) {
      // try rgb
      const rgb = text.split(',');
      if (rgb.length === 3 && rgb[0] && rgb[1] && rgb[2]) {
        type = 'rgb';

        valid = rgb
          .map(part => parseInt(part.trim(), 10))
          .map(part => {
            if (Number.isNaN(part) || part < 0) {
              return 0;
            } else if (part > 255) {
              return 255;
            }

            return part;
          });
      }
    } else {
      // try hex
      if (test.indexOf('#') === 0) {
        test = test.substring(1);
      }

      if (/^([a-f0-9]{3}){1,2}$/i.test(test)) {
        type = 'hex';
        valid = test;
      }
    }

    if (!valid) {
      return valid;
    }

    return {
      type,
      value: valid,
    };
  }

  static partToHex(part) {
    const hex = part.toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  }

  static rgbToHex(r, g, b) {
    return `#${this.partToHex(r)}${this.partToHex(g)}${this.partToHex(b)}`;
  }

  static hexToRgb(hex) {
    let fullHex = hex;

    if (fullHex.length === 3) {
      fullHex = `${fullHex[0]}${fullHex[0]}${fullHex[1]}${fullHex[1]}${fullHex[2]}${fullHex[2]}`;
    }

    return [
      parseInt(fullHex.substr(0, 2), 16),
      parseInt(fullHex.substr(2, 2), 16),
      parseInt(fullHex.substr(4, 2), 16),
    ];
  }
}

if (typeof module !== 'undefined') {
  module.exports = Palette;
}
