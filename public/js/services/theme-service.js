import { httpService } from './http-service.js';

class ThemeService {
  getDarkMode() {
    return httpService.getDarkMode();
  }

  setDarkMode() {
    let isDarkMode = httpService.getDarkMode();
    if (isDarkMode === true) {
      isDarkMode = false;
    } else {
      isDarkMode = true;
    }
    return httpService.setDarkMode(isDarkMode);
  }
}

export const themeService = new ThemeService();
