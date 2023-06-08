export default class ThemeController {
  constructor() {
    this.darkMode = this.getDarkModeFromCookie() || false;

    this.setDarkMode();
  }

  switchDarkMode() {
    this.darkMode = !this.darkMode;
    this.setDarkMode();
    this.saveDarkModeToCookie();
  }

  initEventHandlers() {
    const darkModeButton = document.getElementById('darkModeButton');
    darkModeButton.addEventListener('click', () => {
      this.switchDarkMode();
    });
  }

  setDarkMode() {
    const darkModeButton = document.getElementById('darkModeButton');
    if (this.darkMode) {
      darkModeButton.innerHTML =
        '<ion-icon name="sunny-outline"></ion-icon> Light Mode';
      const htmlElement = document.querySelector('html');
      htmlElement.classList.add('dark-mode');
    } else {
      darkModeButton.innerHTML =
        '<ion-icon name="moon-outline"></ion-icon>Dark Mode';
      const htmlElement = document.querySelector('html');
      htmlElement.classList.remove('dark-mode');
    }
  }

  saveDarkModeToCookie() {
    document.cookie = `darkMode=${this.darkMode}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
  }

  getDarkModeFromCookie() {
    let darkMode = false;
    const cookies = document.cookie.split(';');

    cookies.forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name === 'darkMode' && value === 'true') {
        darkMode = true;
      }
    });

    return darkMode;
  }

  initialize() {
    this.initEventHandlers();
  }
}

new ThemeController().initialize();
