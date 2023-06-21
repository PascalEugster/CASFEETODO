import { authService } from '../services/auth-service.js';
import { themeService } from '../services/theme-service.js';

export default class ThemeController {
  constructor() {
    if (authService.isLoggedIn()) {
      this.darkMode = this.getDarkMode() || 0;
      this.setDarkMode();
    }
  }

  switchDarkMode() {
    if (authService.isLoggedIn()) {
      if (this.darkMode === 0) {
        this.darkMode = 1;
      } else {
        this.darkMode = 0;
      }
      this.setDarkMode();
      this.saveDarkMode();
    }
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

  saveDarkMode() {
    if (authService.isLoggedIn()) {
      document.cookie = themeService.setDarkMode(this.darkMode);
    }
  }

  getDarkMode() {
    if (authService.isLoggedIn()) {
      return themeService.getDarkMode();
    }
  }

  initialize() {
    this.initEventHandlers();
  }
}

new ThemeController().initialize();
