// Auto-detect base path based on the current page
const basePath = document.currentScript.src.includes('/pages/') ? '../' : '';

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create header and footer containers if they don't exist
  if (!document.getElementById('header')) {
    const header = document.createElement('div');
    header.id = 'header';
    document.body.insertBefore(header, document.body.firstChild);
  }
  
  if (!document.getElementById('footer')) {
    const footer = document.createElement('div');
    footer.id = 'footer';
    document.body.appendChild(footer);
  }

  // Load header
  fetch(basePath + 'components/header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header').innerHTML = data;
    });

  // Load footer
  fetch(basePath + 'components/footer.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('footer').innerHTML = data;
    });
});