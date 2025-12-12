const headerTemplate = document.createElement("template");
headerTemplate.innerHTML = `
<header>
  <a href="#main-content" class="skip-link" data-i18n="nav.skip_link">Skip to main content</a>
  <h1>Daniel Castaño Rodríguez</h1>

  <nav aria-label="Main navigation">
    <ul>
      <li><a href="index.html" data-i18n="nav.home">Home</a></li>
      <li><a href="about.html" data-i18n="nav.about">About</a></li>
      <li><a href="cv.html" data-i18n="nav.cv">CV</a></li>
      <li><a href="contact.html" data-i18n="nav.contact">Contact</a></li>
    </ul>
    <div class="header-controls">
      <form id="search-form" class="search-form" role="search">
        <label for="search-input" class="visually-hidden" data-i18n="nav.search_placeholder">Search</label>
        <input type="search" id="search-input" class="search-input" placeholder="Search..." aria-label="Search through site content" data-i18n-placeholder="nav.search_placeholder">
        <button type="submit" data-i18n="nav.search_button">Search</button>
      </form>
      <div class="language-selector">
        <label for="language-select" class="visually-hidden" data-i18n="nav.language_label">Select Language</label>
        <select id="language-select">
          <option value="en">🇬🇧 English</option>
          <option value="es">🇪🇸 Español</option>
        </select>
      </div>
    </div>
  </nav>
</header>
<div id="search-results" class="search-results" aria-live="polite" style="display: none;"></div>
`;

document.body.insertBefore(headerTemplate.content, document.body.firstChild);

// Highlight active link
const currentPath = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll("nav[aria-label='Main navigation'] a");

navLinks.forEach(link => {
  if (link.getAttribute("href") === currentPath) {
    link.setAttribute("aria-current", "page");
    link.style.fontWeight = "bold";
    link.style.textDecoration = "underline";
  }
});

/**
 * Clase que gestiona la internacionalización (i18n).
 */
class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem("lang") || "en";
    this.translations = {};
    this.init();
  }

  async init() {
    // Set initial value of selector
    $("#language-select").val(this.currentLang);

    // Load translations
    await this.loadTranslations(this.currentLang);

    // Apply translations
    this.translatePage();

    // Event listener for language change
    $("#language-select").on("change", (e) => {
      this.changeLanguage(e.target.value);
    });
  }

  async loadTranslations(lang) {
    try {
      this.translations = await $.getJSON(`locales/${lang}.json`);
    } catch (error) {
      console.error(`Error loading translations for ${lang}:`, error);
    }
  }

  async changeLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem("lang", lang);
    await this.loadTranslations(lang);
    this.translatePage();
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  }

  translatePage() {
    $("[data-i18n]").each((_, element) => {
      const key = $(element).data("i18n");
      const translation = this.getNestedTranslation(key);
      if (translation) {
        $(element).text(translation);
      }
    });

    $("[data-i18n-placeholder]").each((_, element) => {
      const key = $(element).data("i18n-placeholder");
      const translation = this.getNestedTranslation(key);
      if (translation) {
        $(element).attr("placeholder", translation);
      }
    });
    
    // Trigger a custom event so other scripts can react (e.g. search results)
    $(document).trigger("languageChanged", [this.translations]);
  }

  getNestedTranslation(key) {
    return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), this.translations);
  }
}

// Initialize I18n
$(document).ready(() => {
  window.i18nManager = new I18nManager();
});

/**
 * Clase que gestiona la funcionalidad de búsqueda en el sitio web.
 * Utiliza jQuery para realizar peticiones AJAX y manipular el DOM.
 */
class Searcher {
  /**
   * Constructor de la clase Searcher.
   * @param {string} formSelector - Selector CSS del formulario de búsqueda.
   * @param {string} inputSelector - Selector CSS del campo de entrada de búsqueda.
   * @param {string} resultsSelector - Selector CSS del contenedor de resultados.
   */
  constructor(formSelector, inputSelector, resultsSelector) {
    this.$form = $(formSelector);
    this.$input = $(inputSelector);
    this.$results = $(resultsSelector);
    this.sitemapUrl = "sitemap.json";

    this.initialize();
  }

  /**
   * Inicializa los eventos del buscador.
   */
  initialize() {
    // Manejar el envío del formulario
    this.$form.on("submit", (e) => {
      e.preventDefault();
      const query = this.$input.val().trim();
      if (query) {
        // Redirigir a la página de búsqueda con el parámetro query
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
      }
    });

    // Comprobar si estamos en la página de búsqueda y hay un parámetro query
    if (window.location.pathname.includes("search.html")) {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get("q");
      
      if (query) {
        // Rellenar el input con el término de búsqueda
        this.$input.val(query);
        // Realizar la búsqueda
        this.performSearch(query.toLowerCase());
      }
    }
  }

  /**
   * Realiza la búsqueda del término introducido.
   * @param {string} query - Término de búsqueda.
   */
  async performSearch(query) {
    // Si estamos en search.html, usamos el contenedor de resultados de esa página
    // Si no, usamos el contenedor inyectado por el header (aunque ahora redirigimos, mantenemos la lógica por si acaso)
    const $targetResults = $("#search-results-container").length ? $("#search-results-container") : this.$results;
    
    const searchingText = window.i18nManager ? window.i18nManager.getNestedTranslation("search.searching") : "Searching...";
    $targetResults.html(`<p>${searchingText}</p>`);
    $targetResults.show();

    try {
      const sitemap = await this.getSitemap();
      const results = await this.searchInPages(sitemap, query);
      this.displayResults(results, query, $targetResults);
    } catch (error) {
      console.error("Error en la búsqueda:", error);
      const errorText = window.i18nManager ? window.i18nManager.getNestedTranslation("search.error") : "Error performing search.";
      $targetResults.html(`<p>${errorText}</p>`);
    }
  }

  /**
   * Obtiene el mapa del sitio (sitemap.json).
   * @returns {Promise<Object>} Promesa que resuelve con el objeto sitemap.
   */
  getSitemap() {
    return $.getJSON(this.sitemapUrl);
  }

  /**
   * Busca el término en el contenido de las páginas del sitemap.
   * @param {Object} sitemap - Objeto con las páginas del sitio.
   * @param {string} query - Término de búsqueda.
   * @returns {Promise<Array>} Promesa que resuelve con un array de resultados.
   */
  async searchInPages(sitemap, query) {
    const promises = Object.entries(sitemap).map(async ([name, url]) => {
      try {
        // Usamos $.get de jQuery que devuelve una promesa (jqXHR)
        const html = await $.get(url);
        // Crear un documento temporal para parsear el HTML
        const doc = new DOMParser().parseFromString(html, "text/html");
        // Usamos jQuery para obtener el texto del body
        const bodyText = $(doc.body).text().toLowerCase();

        if (bodyText.includes(query)) {
            return { name, url };
        }
      } catch (err) {
        console.error(`Error getting ${url}:`, err);
      }
      return null;
    });

    const results = await Promise.all(promises);
    return results.filter(r => r !== null);
  }

  /**
   * Muestra los resultados de la búsqueda en el DOM.
   * @param {Array} results - Array de objetos con nombre y url de las páginas encontradas.
   * @param {string} query - Término de búsqueda original.
   * @param {jQuery} $container - Contenedor donde mostrar los resultados.
   */
  displayResults(results, query, $container) {
    const noResultsText = window.i18nManager ? window.i18nManager.getNestedTranslation("search.no_results") : "No results found for";
    const resultsForText = window.i18nManager ? window.i18nManager.getNestedTranslation("search.results_for") : "Results for";

    if (results.length === 0) {
      $container.html(`<p>${noResultsText} "<strong>${query}</strong>".</p>`);
      return;
    }

    const $ul = $("<ul>");
    results.forEach(result => {
      const $li = $("<li>");
      const translatedName = window.i18nManager ? window.i18nManager.getNestedTranslation(result.name) : result.name;
      const $a = $("<a>").attr("href", result.url).text(translatedName || result.name);
      $li.append($a);
      $ul.append($li);
    });

    $container.html(`<p>${resultsForText} "<strong>${query}</strong>":</p>`);
    $container.append($ul);
  }
}

// Inicialización cuando el DOM esté listo (jQuery)
$(document).ready(() => {
    // Instanciamos la clase Searcher
    new Searcher("#search-form", "#search-input", "#search-results");
});
