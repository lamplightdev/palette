const paletteApp = new Palette();

paletteApp.init().then(() => {
  console.log('done', paletteApp.getAvailableActions());
});
