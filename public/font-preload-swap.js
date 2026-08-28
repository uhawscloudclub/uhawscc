// Swaps the Google Fonts <link> from rel="preload" to rel="stylesheet" once
// the CSS has fetched, so it never blocks initial render. Must run as a
// same-origin, non-deferred script (not an inline onload="" attribute) —
// the CSP's default script-src-attr 'none' blocks inline event handlers, and
// this needs to attach synchronously, before the cross-origin font CSS fetch
// can possibly resolve.
(function () {
  var link = document.getElementById("gfonts-preload");
  if (!link) return;
  link.addEventListener(
    "load",
    function () {
      link.rel = "stylesheet";
    },
    { once: true },
  );
})();
