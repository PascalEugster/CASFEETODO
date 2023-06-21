import { httpService } from './http-service.js';

class ThemeService {
  getDarkMode() {
    return httpService.getDarkMode();
  }

  setDarkMode(isDarkMode) {
    return httpService.setDarkMode(isDarkMode);
  }
}

export const themeService = new ThemeService();
