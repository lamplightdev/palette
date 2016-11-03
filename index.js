const express = require('express');
const templateIndex = require('./templates/index');

const app = express();

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send(templateIndex({
    colours: ['#546632'],
  }));
});

app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

