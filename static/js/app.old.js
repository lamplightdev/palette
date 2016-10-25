const videoDevices = [];
let frontCamera = false;
const maxViewportDimension = Math.max(window.innerWidth, window.innerHeight);

const getRandom = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/*
navigator.mediaDevices.enumerateDevices()
  .then(devices => {
    devices.forEach(device => {
      if (device.kind === 'videoinput') {
        videoDevices.push(device);
      }
    });
    init();
  })
  .catch(err => {
    console.log(`${err.name}: ${err.message}`);
  });
*/

const video = document.querySelector('video');
const videoContainer = document.querySelector('.video-container');
const videoButton = videoContainer.querySelector('button');
const buttonSnap = document.querySelector('button.snap');
const buttonStop = document.querySelector('button.stop');
const buttonStart = document.querySelector('button.start');
const buttonSwitch = document.querySelector('button.switch');
const canvas = document.querySelector('canvas');
const canvasContext = canvas.getContext('2d');
const colourContainer = document.querySelector('.colour-container');
const coloursContainer = document.querySelector('.colours-container');
const colourRGB = document.querySelector('.colour-rgb');
const colourHex = document.querySelector('.colour-hex');
const fileUpload = document.querySelector('.file-upload');
const actionContainer = document.querySelector('.action-container');
const btnSource = document.querySelector('.btn--source');
const inputForm = document.querySelector('.input-container form');

const maxColours = 5;
let lastColourRGB;
let isFullscreenColour = false;

const updateColourInfo = (colour) => {
  const rgb = c0lor.RGB(colour.r, colour.g, colour.b);

  colourRGB.textContent = `rgb(${rgb.R}, ${rgb.G}, ${rgb.B})`;
  colourHex.textContent = `#${rgb.hex()}`;
};

buttonSwitch.addEventListener('click', () => {
  frontCamera = !frontCamera;
  init();
});

const init = () => {
  const p = navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      facingMode: frontCamera ? 'face' : 'environment',
    },
  });


  let pos = 0;

  btnSource.addEventListener('click', () => {
    pos = 150;
    actionContainer.classList.add('animate-container');

    requestAnimationFrame(() => {
      actionContainer.style.transform = `translateX(-${pos}px)`;
    });
  });

  actionContainer.addEventListener('transitionend', event => {
    if (event.propertyName === 'transform') {
      pos = 0;
      actionContainer.classList.remove('animate-container');

      requestAnimationFrame(() => {
        actionContainer.style.transform = '';
        actionContainer.appendChild(actionContainer.children[0]);
        video.play();
      });
    }
  });

  inputForm.addEventListener('submit', event => {
    event.preventDefault();
    const pixel = event.target.colour.value.split(',').map(col => parseInt(col.trim(), 10));
    addColour(pixel);
  });

  fileUpload.addEventListener('change', event => {
    const data = event.target.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', readerEvent => {
      const image = new Image();
      image.src = reader.result;

      canvasContext.drawImage(image, 0, 0);

      const pixel = canvasContext.getImageData(canvas.width / 2, canvas.height / 2, 1, 1).data;

      addColour(pixel);
    });
    reader.readAsDataURL(data);
  });


  p.then(mediaStream => {
    video.src = window.URL.createObjectURL(mediaStream);
    video.onloadedmetadata = () => {
      video.play();

      buttonStart.addEventListener('click', () => {
        video.play();
      });

      buttonStop.addEventListener('click', () => {
        video.pause();
      });

      const previewSize = video.offsetWidth;

      let biggestSide;
      let smallestSide;
      let aspectRatio;

      if (video.videoHeight > video.videoWidth) {
        biggestSide = 'height';
        smallestSide = 'width';
        aspectRatio = video.videoHeight / video.videoWidth;
      } else {
        biggestSide = 'width';
        smallestSide = 'height';
        aspectRatio = video.videoWidth / video.videoHeight;
      }

      const offset = Math.abs(video.videoHeight - video.videoWidth) / 2;

      video.style[biggestSide] = canvas.style[biggestSide] = `${previewSize * aspectRatio}px`;
      canvasContext.canvas[biggestSide] = previewSize * aspectRatio;
      canvasContext.canvas[smallestSide] = previewSize;

      colourContainer.addEventListener('click', event => {
        event.stopPropagation();
        const colourLarge = colourContainer.querySelector('.colour');
        colourLarge.classList.add('colour--animate-fullscreen');

        if (colourLarge.classList.contains('colour--fullscreen')) {
          colourLarge.style.transform = 'scale(1)';
          colourLarge.classList.remove('colour--fullscreen');
          isFullscreenColour = false;
        } else {
          colourLarge.style.transform = `scale(${Math.ceil(maxViewportDimension / colourLarge.offsetWidth) * 2})`;
          colourLarge.classList.add('colour--fullscreen');
          isFullscreenColour = true;
        }

        colourLarge.addEventListener('transitionend', () => {
          colourLarge.classList.remove('colour--animate-fullscreen');
        });
      }, true); // useCapture === true so we can stopPropagation to child

      [videoButton, buttonSnap].forEach(el => {
        el.addEventListener('click', () => {
          videoButton.classList.add('hide');
          canvasContext.drawImage(video,
            biggestSide === 'height' ? 0 : offset,
            biggestSide === 'width' ? 0 : offset,
            biggestSide === 'height' ? video.videoWidth : video.videoHeight,
            biggestSide === 'height' ? video.videoWidth : video.videoHeight,
            0,
            0,
            previewSize,
            previewSize
          );
          const pixel = canvasContext.getImageData(previewSize / 2, previewSize / 2, 1, 1).data;

          // pixel[0] = getRandom(0, 255);
          // pixel[1] = getRandom(0, 255);
          // pixel[2] = getRandom(0, 255);

          addColour(pixel);
        });
      });
    };
  });

  p.catch(err => {
    console.log(err.name);
  });
};

const addColour = (pixel) => {
  const currentContainer = actionContainer.querySelector(':first-child');

  const colour = document.createElement('div');
  colour.className = 'colour colour--large';
  colour.style.backgroundColor = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
  colour.dataset.r = pixel[0];
  colour.dataset.g = pixel[1];
  colour.dataset.b = pixel[2];

  lastColourRGB = {
    r: pixel[0],
    g: pixel[1],
    b: pixel[2],
  };

  const firstColour = colourContainer.firstChild;

  const buildClickSwapListener = (el) => {
    return () => {
      requestAnimationFrame(() => {
        const currentFirstColour = colourContainer.firstChild;
        const firstColourClass = currentFirstColour.className;
        const firstColourTransform = currentFirstColour.style.transform;
        const elTransform = el.style.transform;

        currentFirstColour.className = el.className;
        el.className = firstColourClass;

        coloursContainer.insertBefore(currentFirstColour, el);
        colourContainer.appendChild(el);

        lastColourRGB = {
          r: el.dataset.r,
          g: el.dataset.g,
          b: el.dataset.b,
        };

        updateColourInfo(lastColourRGB);

        if (!isFullscreenColour) {
          const elRect = el.getBoundingClientRect();
          const firstColourRect = currentFirstColour.getBoundingClientRect();

          const xDiff = elRect.left - firstColourRect.left + elRect.width / 2 - firstColourRect.width / 2;
          const yDiff = elRect.top - firstColourRect.top + elRect.height / 2 - firstColourRect.height / 2;

          const scaleFactor = elRect.width / firstColourRect.width;

          el.style.transform = `scale(${1 / scaleFactor}) `
          + `translateX(${-xDiff * scaleFactor}px) `
          + `translateY(${-yDiff * scaleFactor}px) `;

          currentFirstColour.style.transform = `scale(${scaleFactor}) `
          + `translateX(${xDiff / scaleFactor}px) `
          + `translateY(${yDiff / scaleFactor}px) `;

          requestAnimationFrame(() => {
            el.classList.add('colour--animate--nodelay', 'colour--show');
            currentFirstColour.classList.add('colour--animate--nodelay', 'colour--show');
            el.style.transform = firstColourTransform;
            currentFirstColour.style.transform = elTransform;
          });
        } else {
          el.style.transform = firstColourTransform;
          currentFirstColour.style.transform = elTransform;
        }
      });
    };
  };

  if (firstColour) {
    firstColour.classList.remove('colour--large');
    firstColour.classList.remove('colour--');
    coloursContainer.insertBefore(firstColour, coloursContainer.firstChild);

    if (coloursContainer.children.length > maxColours) {
      // set to previous colour so colour inherited by
      // :after pseudo element background colour (css uses currentColor)
      coloursContainer.children[maxColours - 1].style.color = coloursContainer.children[maxColours].style.backgroundColor;
      coloursContainer.removeChild(coloursContainer.children[maxColours]);
    }
  }

  colour.addEventListener('click', buildClickSwapListener(colour));

  colourContainer.appendChild(colour);

  const otherColours = [...coloursContainer.childNodes];

  colour.addEventListener('transitionend', event => {
    if (event.propertyName === 'transform') {
      colour.classList.remove('colour--animate', 'colour--animate--nodelay');

      updateColourInfo(lastColourRGB);
    }
  });

  otherColours.forEach((otherColour, index) => {
    otherColour.addEventListener('transitionend', event => {
      if (event.propertyName === 'transform') {
        otherColour.classList.remove('colour--animate', 'colour--animate--nodelay');
        otherColour.classList.remove('colour--hide');
        if (index === otherColours.length - 1) {
          otherColour.classList.add('colour--hide');
        }
      }
    });
  });

  requestAnimationFrame(() => {
    const colourRect = colour.getBoundingClientRect();
    const currentContainerRect = currentContainer.getBoundingClientRect();

    const scaleFactor = currentContainerRect.width / colourRect.width;
    const xDiff = currentContainerRect.left
      - colourRect.left
      + currentContainerRect.width / 2
      - colourRect.width / 2;

    const yDiff = currentContainerRect.top
      - colourRect.top
      + currentContainerRect.height / 2
      - colourRect.height / 2;

    colour.style.transform = `scale(${scaleFactor}) `
    + `translateX(${xDiff / scaleFactor}px) `
    + `translateY(${yDiff / scaleFactor}px) `;

    /* ///////////////////////////////////////// */

    if (firstColour) {
      const firstColourRect = firstColour.getBoundingClientRect();
      // colourRect

      const scaleFactorMini = colourRect.width / firstColourRect.width;
      const xDiffMini = colourRect.left
        - firstColourRect.left
        + colourRect.width / 2
        - firstColourRect.width / 2;

      const yDiffMini = colourRect.top
        - firstColourRect.top
        + colourRect.height / 2
        - firstColourRect.height / 2;

      firstColour.style.transform = `scale(${scaleFactorMini}) `
      + `translateX(${xDiffMini / scaleFactorMini}px) `
      + `translateY(${yDiffMini / scaleFactorMini}px) `;
    }

    if (otherColours.length > 1) {
      const otherColourRect = otherColours[1].getBoundingClientRect();
      otherColours.forEach((otherColour, index) => {
        if (index > 0) {
          otherColour.style.transform = `translateX(-${otherColourRect.width}px)`;
        }
      });
    }

    /* ///////////////////////////////////////// */

    requestAnimationFrame(() => {
      colour.classList.add('colour--animate', 'colour--show');
      colour.style.transform = '';

      if (firstColour) {
        firstColour.classList.add('colour--animate', 'colour--show');
        firstColour.style.transform = '';
      }

      otherColours.forEach((otherColour, index) => {
        if (index > 0) {
          otherColour.classList.add('colour--animate', 'colour--show');
          otherColour.style.transform = '';
        }
      });
    });
  });
};

init();
