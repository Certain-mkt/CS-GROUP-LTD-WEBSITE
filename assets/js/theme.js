/* ==========================================================================
   Current Security Group Ltd
   Theme boot script. Loaded synchronously in <head> so the correct theme is
   applied before first paint. The choice is stored locally; no tracking.
   ========================================================================== */

(function () {
  "use strict";

  var KEY = "cs-theme";
  var root = document.documentElement;
  var media = window.matchMedia
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

  function stored() {
    try {
      var value = localStorage.getItem(KEY);
      return value === "light" || value === "dark" ? value : null;
    } catch (error) {
      return null;
    }
  }

  function preferred() {
    return media && media.matches ? "dark" : "light";
  }

  function apply(theme, persist) {
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;

    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", theme === "dark" ? "#081426" : "#305db1");
    }

    if (persist) {
      try {
        localStorage.setItem(KEY, theme);
      } catch (error) {
        /* Storage can be unavailable in private browsing; the theme still works. */
      }
    }

    root.dispatchEvent(new CustomEvent("cs:themechange", { detail: { theme: theme } }));
  }

  root.classList.add("js");
  apply(stored() || preferred(), false);

  window.csTheme = {
    get: function () {
      return root.getAttribute("data-theme");
    },
    set: function (theme) {
      if (theme === "light" || theme === "dark") apply(theme, true);
    },
    toggle: function () {
      apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark", true);
    }
  };

  if (media) {
    var onChange = function (event) {
      if (!stored()) apply(event.matches ? "dark" : "light", false);
    };

    if (media.addEventListener) {
      media.addEventListener("change", onChange);
    } else if (media.addListener) {
      media.addListener(onChange);
    }
  }
})();
