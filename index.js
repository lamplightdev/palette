const express = require('express');
const bodyParser = require('body-parser');

const Palette = require('./public/js/palette');
const templateIndex = require('./templates/index');
const templateLayout = require('./templates/layout');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

const colours = [
  // [220, 16, 21],
  // [22, 167, 211],
];

const addColour = (text) => {
  const valid = Palette.parseColourText(text);
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

  return valid;
};

app.get('/', (req, res) => {
  if (req.query.c) {
    addColour(req.query.c);
  }

  res.send(templateIndex({
    colours,
  }));
});

app.get('/layout', (req, res) => {
  res.send(templateLayout({
  }));
});

app.post('/api/add', (req, res) => {
  if (req.body.c) {
    res.json(addColour(req.body.c));
  } else {
    res.json(false);
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Example app listening on port ${process.env.PORT || 3000}`);
});

