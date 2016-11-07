const express = require('express');
const templateIndex = require('./templates/index');

const Palette = require('./public/js/palette');
const app = express();

app.use(express.static('public'));

const colours = [
  [220, 16, 21],
  [22, 167, 211],
];

app.get('/', (req, res) => {
  if (req.query.c) {
    const valid = Palette.parseColourText(req.query.c);
    if (valid) {
      let rgb;

      if (valid.type === 'rgb') {
        rgb = valid.value;
      } else {
        // hex
        rgb = Palette.hexToRgb(valid.value);
      }

      colours.unshift(rgb);
    }
  }

  res.send(templateIndex({
    colours,
  }));
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

