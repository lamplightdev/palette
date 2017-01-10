const template = (args) => {
  return `
<!DOCTYPE html>

<html lang="en">

  <head>
    <meta charset="utf-8">
    <meta name="viewport"
      content="width=device-width, minimum-scale=1, initial-scale=1, user-scalable=yes"
    >

    <link rel="icon" type="image/png" href="images/logo.png" />

    <title>Palette</title>

    <link rel='stylesheet' href='css/layout.css'>
  </head>

  <body>

    <div>
      <button class='switch-type'>Switch</button>
    </div>

    <lamplight-layout type='row'>
      <div>
        <h1>One</h1>
      </div>
      <div>
        <h1>Two</h1>
      </div>
      <div>
        <h1>Three</h1>
      </div>
      <div>
        <h1>Four</h1>
      </div>
      <div>
        <h1>Five</h1>
      </div>
      <div>
        <h1>Six</h1>
      </div>
    </lamplight-layout>

    <script src='js/elements/layout.js'></script>

    <script>
      const component = document.querySelector('lamplight-layout');
      const switchType = document.querySelector('.switch-type');

      switchType.addEventListener('click', (event) => {
        const currentType = component.getAttribute('type');

        if (currentType === 'row') {
          component.type = 'column';
        } else if (currentType === 'column') {
          component.type = 'card';
        } else {
          component.type = 'row';
        }
      });
    </script>
  </body>

</html>
`;
};

module.exports = template;
