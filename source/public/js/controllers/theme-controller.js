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
    const btnDarkMode = document.getElementById('btnDarkMode');
    btnDarkMode.addEventListener('click', () => {
      this.switchDarkMode();
    });
  }

  setDarkMode() {
    const btnDarkMode = document.getElementById('btnDarkMode');
    if (this.darkMode) {
      btnDarkMode.innerHTML =
        '<ion-icon name="sunny-outline"></ion-icon> Light Mode';
      const htmlElement = document.querySelector('html');
      htmlElement.classList.add('dark-mode');
    } else {
      btnDarkMode.innerHTML =
        '<ion-icon name="moon-outline"></ion-icon>Dark Mode';
      const htmlElement = document.querySelector('html');
      htmlElement.classList.remove('dark-mode');
    }
  }

  saveDarkModeToCookie() {
    document.cookie = `darkMode=${this.darkMode}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
  }

  getDarkModeFromCookie() {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const [name, value] = cookie.trim().split('=');
      if (name === 'darkMode') {
        return value === 'true';
      }
    }
    return false;
  }

  initialize() {
    this.initEventHandlers();
  }
}

new ThemeController().initialize();
