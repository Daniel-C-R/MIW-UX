const headerTemplate = document.createElement("template");
headerTemplate.innerHTML = `
<header>
  <h1>Daniel Castaño Rodríguez</h1>

  <nav>
    <ul>
      <li><a href="index.html">Home</a></li>
      <li><a href="about.html">About</a></li>
      <li><a href="contact.html">Contact</a></li>
    </ul>
  </nav>
</header>
`;

document.body.appendChild(headerTemplate.content);
