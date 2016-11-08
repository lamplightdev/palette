const Palette = require('../public/js/palette');

const template = (args) => {
  const num = 6;

  const colours = args.colours.slice(0, num).map((colour, index) => `
    <div
      id='sample-${num - index}'
      class='sample'
      data-r='${colour[0]}' data-g='${colour[1]}' data-b='${colour[2]}'
      style='background-color: rgb(${colour[0]}, ${colour[1]}, ${colour[2]});'>
    </div>`.trim()
  );

  for (let i = num - colours.length; i > 0; i--) {
    colours.push(`
      <div
        id='sample-${i}'
        class='sample'
      >
      </div>
    `.trim());
  }

  const firstColour = colours.shift();

  let rgbInfo = 'RGB';
  let hexInfo = 'HEX';
  let headerColour = Palette.rgbInfo([33, 150, 243]);
  if (args.colours.length) {
    const rgb = args.colours[0];

    rgbInfo = Palette.rgbInfo(rgb);
    hexInfo = Palette.hexInfo(rgb);
    headerColour = rgbInfo;
  }

  return `
<!DOCTYPE html>

<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport"
      content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes"
    >

    <title>Palette</title>

    <link rel='stylesheet' href='css/app.css'>
  </head>

  <body>

    <header class='colour-bar'>
      <h1 style='color: ${headerColour};'>Palette</h1>
      <div style='background-color: ${headerColour};'></div>
      <div style='background-color: ${headerColour};'></div>
      <div style='background-color: ${headerColour};'></div>
      <div style='background-color: ${headerColour};'></div>
      <div style='background-color: ${headerColour};'></div>
      <div style='background-color: ${headerColour};'></div>
      <div style='background-color: ${headerColour};'></div>
      <div style='background-color: ${headerColour};'></div>
    </header>

    <main>
      <div class='main'>
        <button class='btn btn--'>S</button>
        <div class='action'>
          <div class='action-container'>
            <div class='container video-container' id='video-container'>
                <video></video>
                <button><img src='images/touch_app.svg' alt='Take photo'></button>
            </div>
            <div class='container upload-container'>
              <input
                type='file'
                accept='image/*'
                id='imagefile'
                class='file-upload'
                name='imagefile'
              >
              <label for="imagefile"><img src='images/file_upload.svg' alt='Upload'></label>
            </div>
            <form class='container input-container' method='get'>
              <input type='text' name='c' placeholder='#hex / r,g,b'>
              <button class='btn' type='submit'>
                <img src='images/arrow_downward.svg' alt='Go'>
              </button>
            </form>
          </div>
        </div>
        <button class='btn btn--source'>
          <img src='images/autorenew.svg' alt='Change source'>
        </button>
      </div>

      <div>
        <canvas width='200' height='200'></canvas>
      </div>

      <div class='colour-info'>
        <div class='colour-data'>
          <div class='sample-rgb'>${rgbInfo}</div>
        </div>
        <div class='sample-container' id='sample-container'>${firstColour}</div>
        <div class='colour-actions'>
          <div class='sample-hex'>${hexInfo}</div>
        </div>
      </div>

      <div class='samples-container'>${colours.join('')}</div>
    </main>

    <footer>
      <a href='https://twitter.com/lamplightdev'>@lamplightdev</a> | <a href='https://github.com/lamplightdev/palette'>github</a>
    </footer>

    <script src='js/palette.js'></script>
    <script src="https://polyfill.io/v2/polyfill.min.js?callback=polyfillsAreLoaded" defer async></script>
    <script>
      function polyfillsAreLoaded() {
        const paletteApp = new Palette();

        paletteApp.init().then(() => {
          console.log('done', paletteApp.getAvailableActions());
        });
      }
    </script>
  </body>

</html>
`;
};

module.exports = template;
