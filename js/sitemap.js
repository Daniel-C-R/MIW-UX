$(document).ready(async () => {
  const $sitemapList = $("#sitemap-list");
  if ($sitemapList.length === 0) return;

  let sitemapData = {};

  try {
    sitemapData = await $.getJSON("sitemap.json");
    renderSitemap();
  } catch (err) {
    console.error("Error loading sitemap:", err);
    $sitemapList.html("<li>Error loading site map.</li>");
  }

  function renderSitemap() {
    $sitemapList.empty();
    $.each(sitemapData, (key, url) => {
      const $li = $("<li>");
      const translatedName = window.i18nManager ? window.i18nManager.getNestedTranslation(key) : key;
      const $a = $("<a>").attr("href", url).text(translatedName || key);
      $li.append($a);
      $sitemapList.append($li);
    });
  }

  // Re-render when language changes
  $(document).on("languageChanged", () => {
    renderSitemap();
  });
});
