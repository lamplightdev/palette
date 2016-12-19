class Palette {
  constructor() {
    this._availableActions = {
      video: false,
      upload: false,
      input: false,
    };

    this._availableVideoSources = [];
    this._currentVideoSourceIndex = 0;
    this._videoButtonListener = false;

    this._currentAction = false;

    this._ui = {
      vars: {
        size: 200,
        maxSamples: 5,
        sampleCount: 6, // there'll always be 6 on initialisation (event if they are empty)
        duration: 0.4,
        maxDimension: Math.max(window.innerWidth, window.innerHeight),
        colourPoints: 50,
        colourCircleRadius: 15,
      },
      elements: {},
      events: {},
    };

    this._animationBatch = [];
  }

  initUIElements() {
    this._ui.elements.body = document.querySelector('body');
    this._ui.elements.video = document.querySelector('video');
    this._ui.elements.videoContainer = document.querySelector('.video-container');
    this._ui.elements.uploadContainer = document.querySelector('.upload-container');
    this._ui.elements.inputContainer = document.querySelector('.input-container');
    this._ui.elements.videoButton = this._ui.elements.videoContainer.querySelector('button');
    this._ui.elements.videoSourceButton = document.querySelector('.btn--videosource');
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

    this._actionsIndex = 0;

    document.querySelector('.actions-button-prev').addEventListener('click', () => {
      this._actionsIndex = (this._actionsIndex - 1 + document.querySelectorAll('palette-image-upload').length + 1) % (document.querySelectorAll('palette-image-upload').length + 1);
      document.querySelector('palette-actions').setAttribute('index', this._actionsIndex);
    });

    document.querySelector('.actions-button-next').addEventListener('click', () => {
      this._actionsIndex = (this._actionsIndex + 1) % (document.querySelectorAll('palette-image-upload').length + 1);
      document.querySelector('palette-actions').setAttribute('index', this._actionsIndex);
    });

    document.querySelector('.actions-button-1').addEventListener('click', () => {
      this._actionsIndex = 3;
      document.querySelector('palette-actions').setAttribute('index', 3);
    });

    document.querySelector('palette-camera-capture').addEventListener('snap', (event) => {
      const img = new Image();
      img.src = event.detail.data.src;
      this._ui.elements.body.appendChild(img);
      console.log('snapped', event, event.detail);
    });
  }

  initUIEvents() {
    this._ui.elements.inputForm.addEventListener('submit', event => {
      event.preventDefault();

      const value = event.target.c.value;
      const valid = this.constructor.parseColourText(value);
      if (valid) {
        event.target.c.classList.remove('warn');

        let pixel;

        if (valid.type === 'rgb') {
          pixel = valid.value;
        } else {
          // hex
          pixel = this.constructor.hexToRgb(valid.value);
        }

        this.pushSample(pixel, this._ui.elements.inputContainer);
      } else {
        event.target.c.classList.add('warn');
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

      if (this._ui.elements.actionContainer.children[1]
          && this._ui.elements.actionContainer.children[1].id === 'video-container'
          && this._availableVideoSources.length > 1) {
        this._ui.elements.videoSourceButton.classList.remove('hide');
      } else {
        this._ui.elements.videoSourceButton.classList.add('hide');
      }

      this.runAnimation();
    });

    // add event listeners for server side rendered elements
    const existingSamples = document.querySelectorAll('.sample');
    for (let i = 0; i < existingSamples.length; i++) {
      const sample = existingSamples[i];

      sample.addEventListener('click', event => {
        event.preventDefault();

        this._sampleClickListener(sample);
      });
    }

    this._ui.elements.videoSourceButton.addEventListener('click', () => {
      if (this._availableVideoSources.length > 1) {
        this._currentVideoSourceIndex =
          (this._currentVideoSourceIndex + 1) % this._availableVideoSources.length;

        const track = this._availableActions.video.getVideoTracks()[0];
        if (track) {
          track.stop();
        }
        navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            optional: [{
              sourceId: this._availableVideoSources[this._currentVideoSourceIndex],
            }],
          },
        }).then(result => {
          this._availableActions.video = result;
          this._ui.elements.video.src = window.URL.createObjectURL(this._availableActions.video);
        });
      }
    });
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

    /*
    promises.push(this.initVideoAction()
      .then(result => {
        this._availableActions.video = result;
      })
      .catch(err => {
        console.log('Error accessing video', err);
        this._availableActions.video = false;
      }));
    */

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

        this.initVideo();
        this._ui.elements.video.src = window.URL.createObjectURL(this._availableActions.video);
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

      let promise;
      this._availableVideoSources = [];

      if (navigator.mediaDevices.enumerateDevices) {
        promise = navigator.mediaDevices.enumerateDevices().then(devices => {
          devices.forEach(device => {
            if (device.kind === 'videoinput') {
              this._availableVideoSources.push(device.deviceId);
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
                this._availableVideoSources.push(source.id);
              }
            });

            resolve();
          });
        });
      } else {
        promise = Promise.resolve();
      }

      return promise.then(() => {
        if (this._availableVideoSources.length > 1) {
          this._ui.elements.videoSourceButton.classList.remove('hide');
        }

        return navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            optional: [{
              sourceId: this._availableVideoSources[this._currentVideoSourceIndex],
            }],
          },
        });
      });
    });
  }

  initUploadAction() {
    return Promise.resolve().then(() => !!FileReader);
  }

  initInputAction() {
    return Promise.resolve().then(() => true);
  }

  initVideo() {
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

      if (this._videoButtonListener) {
        this._ui.elements.videoButton.removeEventListener('click', this._videoButtonListener);
      }

      this._videoButtonListener = () => {
        this._sampleVideo(biggestSide, offset, previewSize);
      };

      this._ui.elements.videoButton.addEventListener('click', this._videoButtonListener);
    };
  }

  _sampleVideo(biggestSide, offset, previewSize) {
    // this._ui.elements.videoButton.classList.add('hide');
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

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    const points = [];

    for (let i = 0; i < this._ui.vars.colourPoints; i++) {
      const theta = i * goldenAngle;
      const r = Math.sqrt(i) / Math.sqrt(this._ui.vars.colourPoints);

      points.push({
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
      });
    }

    const pixels = points.map(point => {
      return {
        x: parseInt(previewSize / 2 + point.x * this._ui.vars.colourCircleRadius, 10),
        y: parseInt(previewSize / 2 + point.y * this._ui.vars.colourCircleRadius, 10),
      };
    });

    const pixel = pixels.reduce((previous, current) => {
      const pixelData = this._ui.elements.canvasContext
        .getImageData(current.x, current.y, 1, 1)
        .data;

      return [
        previous[0] + pixelData[0],
        previous[1] + pixelData[1],
        previous[2] + pixelData[2],
      ];
    }, [0, 0, 0]);

    pixel[0] = parseInt(pixel[0] / this._ui.vars.colourPoints, 10);
    pixel[1] = parseInt(pixel[1] / this._ui.vars.colourPoints, 10);
    pixel[2] = parseInt(pixel[2] / this._ui.vars.colourPoints, 10);

    this.pushSample(pixel, this._ui.elements.videoContainer.querySelector('div'));
  }

  initUI() {
    this.initUIElements();
    this.initUIEvents();
  }

  _sampleClickListener(sample) {
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
        this._ui.elements.body.classList.remove('body-fullscreen');
        sample.style.transform = '';
      } else {
        sample.classList.add('sample--fullscreen');
        this._ui.elements.body.classList.add('body-fullscreen');
        sample.style.transform = `scale(${Math.ceil(this._ui.vars.maxDimension / 50) * 2})`;
      }
    }
  }

  pushSample(pixel, fromElement) {
    const sample = this.createSample(pixel);

    sample.addEventListener('click', (event) => {
      event.preventDefault();
      this._sampleClickListener(sample);
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

    this._ui.elements.video.classList.add('video--blur');
    this.pushAnimation(
      sample,
      fromElement,
      `opacity ${this._ui.vars.duration}s ease-in-out 0s,
      transform ${this._ui.vars.duration}s ease-in-out 0s`,
      () => {
        this._ui.elements.video.classList.remove('video--blur');
      }
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

    this.sendToServer(pixel);
  }

  createSample(pixel) {
    const sample = document.createElement('div');
    this._ui.vars.sampleCount++;
    sample.id = `sample-${this._ui.vars.sampleCount}`;
    sample.className = 'sample';
    sample.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    sample.dataset.r = pixel[0];
    sample.dataset.g = pixel[1];
    sample.dataset.b = pixel[2];

    return sample;
  }

  updateSampleData(pixel) {
    this._ui.elements.colourBarHeading.style.color = this.constructor.rgbInfo(pixel);

    for (let i = 0; i < this._ui.elements.colourBarDivs.length; i++) {
      this._ui.elements.colourBarDivs[i].style.backgroundColor = this.constructor.rgbInfo(pixel);
    }

    this._ui.elements.sampleRGB.textContent = this.constructor.rgbInfo(pixel);
    this._ui.elements.sampleHex.textContent = this.constructor.hexInfo(pixel);
  }

  pushAnimation(element, from, transition, onTransitionEnd = false) {
    this._animationBatch.push({
      element,
      from,
      transition,
      onTransitionEnd
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

  sendToServer(pixel) {
    fetch('/api/add', {
      method: 'post',
      body: JSON.stringify({
        c: pixel.slice(0, 3).join(','),
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    }).then(response => {
      return response.json();
    }).then(json => {
      console.log(json);
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

  static rgbInfo(pixel) {
    return `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  }

  static hexInfo(pixel) {
    return this.rgbToHex(pixel[0], pixel[1], pixel[2]);
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
