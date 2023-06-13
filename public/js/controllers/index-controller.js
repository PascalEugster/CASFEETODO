export default class IndexController {
  initialize() {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');

    fetch('views/header.hbs')
      .then((response) => response.text())
      .then((html) => {
        headerContainer.innerHTML = html;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Template not found: ', error);
      });

    fetch('views/footer.hbs')
      .then((response) => response.text())
      .then((html) => {
        footerContainer.innerHTML = html;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Template not found: ', error);
      });
  }
}

new IndexController().initialize();
