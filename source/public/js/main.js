document.addEventListener('DOMContentLoaded', () => {
    const headerContainer = document.getElementById('header-container');
    const footerContainer = document.getElementById('footer-container');
  
    // Lade den Header
    fetch('views/header.html')
      .then(response => response.text())
      .then(html => {
        headerContainer.innerHTML = html;
      });
  
    // Lade den Footer
    fetch('views/footer.html')
      .then(response => response.text())
      .then(html => {
        footerContainer.innerHTML = html;
      });
  });