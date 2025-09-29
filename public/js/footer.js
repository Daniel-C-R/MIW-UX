const footerTemplate = document.createElement("template");
footerTemplate.innerHTML = `
<footer>
  <p>&copy; <time datetime="2025">2025</time> Daniel Castaño Rodríguez</p>
</footer>
`;

document.body.appendChild(footerTemplate.content);
