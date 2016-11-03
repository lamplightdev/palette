const template = (args) => `
<!DOCTYPE html>

<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes">

    <title>Palette</title>

    <link rel='stylesheet' href='css/app.css'>
    <script src='js/adapter-latest.js'></script>
  </head>

  <body>

    <header class='colour-bar'>
      <h1>Palette</h1>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
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
              <input type='file' accept='image/*' id='imagefile' class='file-upload' name='imagefile'>
              <label for="imagefile"><img src='images/file_upload.svg' alt='Upload'></label>
            </div>
            <form class='container input-container'>
              <input type='text' name='colour' placeholder='#hex or r,g,b'>
              <button class='btn' type='submit'><img src='images/arrow_downward.svg' alt='Go'></button>
            </form>
          </div>
        </div>
        <button class='btn btn--source'>S</button>
      </div>

      <div>
        <canvas width='200' height='200'></canvas>
      </div>

      <div class='colour-info'>
        <div class='colour-data'>
          <div class='sample-rgb'>RGB</div>
        </div>
        <div class='sample-container' id='sample-container'></div>
        <div class='colour-actions'>
          <div class='sample-hex'>HEX</div>
        </div>
      </div>

      <div class='samples-container'>${args.colours.map(colour => `<span>${colour}</span>`)}<div class='sample' id='sample-5'></div><div class='sample' id='sample-4'></div><div class='sample' id='sample-3'></div><div class='sample' id='sample-2'></div><div class='sample' id='sample-1'></div></div>

      <div style='display: none;'>
        <button class='switch'>Switch</button>
        <button class='start'>Start</button>
        <button class='stop'>Stop</button>
        <button class='snap'>Snap</button>

        <form>
          <input type='text' name='colour' value='' placeholder='hex colour'>
        </form>
      </div>
    </main>

    <footer>
      <a href='https://twitter.com/lamplightdev'>@lamplightdev</a> | <a href='https://github.com/lamplightdev/palette'>github</a>
    </footer>

    <script src='js/app.js'></script>
  </body>

</html>
`;

module.exports = template;
