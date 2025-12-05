const footerTemplate = document.createElement("template");
footerTemplate.innerHTML = `
<footer>
  <p>&copy; <time datetime="${new Date().getFullYear()}">${new Date().getFullYear()}</time> Daniel Castaño Rodríguez | <a href="sitemap.html" style="color: #fff; text-decoration: underline;" data-i18n="footer.sitemap">Site Map</a></p>
  <p style="font-size: 0.9rem; margin-top: 0.5rem; opacity: 0.8;" data-i18n="footer.last_updated">Last updated: December 12, 2025</p>
</footer>
<button id="scroll-to-top" class="scroll-to-top" aria-label="Scroll to top" title="Go to top">
  ↑
</button>
`;

document.body.appendChild(footerTemplate.content);

// Scroll to Top Logic
const scrollToTopBtn = document.getElementById("scroll-to-top");

window.addEventListener("scroll", () => {
  if (window.scrollY > 300) {
    scrollToTopBtn.classList.add("visible");
  } else {
    scrollToTopBtn.classList.remove("visible");
  }
});

scrollToTopBtn.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});
