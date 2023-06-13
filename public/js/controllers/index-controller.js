import TodoController from './todo-controller.js';
import ThemeController from './theme-controller.js';
import { authService } from '../services/auth-service.js';

export default class IndexController {
  initialize() {
    const headerTemplate = document.getElementById('header-template').innerHTML;
    const footerTemplate = document.getElementById('footer-template').innerHTML;
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
    const todoContainer = document.getElementById('todo-container');

    headerContainer.innerHTML = headerTemplate;
    footerContainer.innerHTML = footerTemplate;

    this.loginButton = document.getElementById('loginButton');
    this.logoutButton = document.getElementById('logoutButton');

    // Auth Service
    this.loginButton.addEventListener('click', () => {
      authService
        .login('admin@admin.ch', '123456')
        .then(() => {
          const themeController = new ThemeController();
          themeController.initialize();
          const todoController = new TodoController();
          todoController.renderTodoView();

          this.updateStatus();
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('Fehler beim Einloggen:', error);
        });
    });

    this.logoutButton.addEventListener('click', () => {
      authService.logout();
      todoContainer.innerHTML = '';
      const themeController = new ThemeController();
      themeController.setDarkMode();
      this.updateStatus();
    });

    this.updateStatus();
  }

  updateStatus() {
    Array.from(document.querySelectorAll('.js-non-user')).forEach((x) =>
      x.classList.toggle('hidden', authService.isLoggedIn())
    );
    Array.from(document.querySelectorAll('.js-user')).forEach((x) =>
      x.classList.toggle('hidden', !authService.isLoggedIn())
    );
  }
}

new IndexController().initialize();
