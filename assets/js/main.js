/* ==========================================================================
   Current Security Group Ltd
   Small, dependency-free behaviours:
   - mobile menu (native <details>, plus Escape/outside-click)
   - light / dark theme control
   - quote, incident, careers and training forms -> WhatsApp / email / phone
   - service preselection from contact.html?service=guarding
   - print button, footer year
   No tracking, no third-party scripts. Only the theme choice is stored locally.
   ========================================================================== */

(function () {
  "use strict";

  var WHATSAPP = "254737334449";
  var HOTLINE = "+254737334449";
  var EMAIL = "csgroup79@gmail.com";

  /* ------------------------------------------------------------------ *
   * Mobile menu
   * ------------------------------------------------------------------ */

  var menu = document.querySelector(".mobile-nav");

  if (menu) {
    menu.addEventListener("toggle", function () {
      document.body.classList.toggle("nav-open", menu.open);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menu.open) {
        menu.open = false;
        var summary = menu.querySelector("summary");
        if (summary) summary.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (menu.open && !menu.contains(event.target)) {
        menu.open = false;
      }
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.open = false;
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Light / dark theme
   * ------------------------------------------------------------------ */

  var themeButtons = document.querySelectorAll("[data-theme-toggle]");

  function syncThemeButtons() {
    var dark = document.documentElement.getAttribute("data-theme") === "dark";
    var label = dark ? "Switch to light theme" : "Switch to dark theme";

    themeButtons.forEach(function (button) {
      button.setAttribute("aria-label", label);
      button.setAttribute("title", label);
    });
  }

  themeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      if (window.csTheme) window.csTheme.toggle();
    });
  });

  syncThemeButtons();
  document.documentElement.addEventListener("cs:themechange", syncThemeButtons);

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */

  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ------------------------------------------------------------------ *
   * Print button (company profile)
   * ------------------------------------------------------------------ */

  document.querySelectorAll("[data-print]").forEach(function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

  /* ------------------------------------------------------------------ *
   * Preselect a service from ?service=guarding
   * ------------------------------------------------------------------ */

  var params = new URLSearchParams(window.location.search);
  var requestedService = params.get("service");
  var serviceSelect = document.querySelector("[data-service-select]");
  var serviceNote = document.querySelector("[data-service-note]");

  if (requestedService && serviceSelect) {
    var matched = Array.prototype.find.call(serviceSelect.options, function (option) {
      return option.value === requestedService;
    });

    if (matched) {
      serviceSelect.value = requestedService;
      if (serviceNote) {
        serviceNote.textContent = "Enquiry about: " + matched.textContent;
        serviceNote.hidden = false;
      }
    }
  }

  /* ------------------------------------------------------------------ *
   * Forms
   * ------------------------------------------------------------------ */

  function value(data, name) {
    var raw = data.get(name);
    return raw ? String(raw).trim() : "";
  }

  function line(label, raw) {
    return raw ? label + ": " + raw : "";
  }

  function buildMessage(form, data) {
    var type = form.getAttribute("data-form");
    var lines = [];

    if (type === "quote") {
      lines.push("New quote request from the website", "");
      lines.push(line("Name", value(data, "name")));
      lines.push(line("Phone / WhatsApp", value(data, "phone")));
      lines.push(line("Email", value(data, "email")));
      lines.push(line("Service", value(data, "service")));
      lines.push(line("Location / premises", value(data, "where")));
      lines.push(line("Details", value(data, "details")));
    }

    if (type === "incident") {
      lines.push("Client support request from the website", "");
      lines.push(line("Site / premises", value(data, "site")));
      lines.push(line("Contact name", value(data, "name")));
      lines.push(line("Phone / WhatsApp", value(data, "phone")));
      lines.push(line("Request type", value(data, "type")));
      lines.push(line("Priority", value(data, "priority")));
      lines.push(line("Date and time", value(data, "when")));
      lines.push(line("Details", value(data, "details")));
    }

    if (type === "career") {
      lines.push("Guard application from the website", "");
      lines.push(line("Name", value(data, "name")));
      lines.push(line("Phone / WhatsApp", value(data, "phone")));
      lines.push(line("Location", value(data, "where")));
      lines.push(line("Experience", value(data, "experience")));
      lines.push(line("Availability", value(data, "availability")));
      lines.push(line("Notes", value(data, "details")));
      lines.push("");
      lines.push("I will send my CV and ID copy on WhatsApp.");
    }

    if (type === "training") {
      lines.push("Training enquiry from the website", "");
      lines.push(line("Name", value(data, "name")));
      lines.push(line("Organisation", value(data, "organisation")));
      lines.push(line("Phone / WhatsApp", value(data, "phone")));
      lines.push(line("Email", value(data, "email")));
      lines.push(line("Course or topic", value(data, "course")));
      lines.push(line("Participants", value(data, "participants")));
      lines.push(line("Preferred date", value(data, "date")));
      lines.push(line("Location", value(data, "where")));
      lines.push(line("Notes", value(data, "details")));
    }

    return lines.filter(function (item, index, array) {
      return item !== "" || (index > 0 && index < array.length - 1);
    }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  function setStatus(form, text, options) {
    var status = form.querySelector(".form-status");
    if (!status) return;

    status.classList.remove("form-status--error");
    if (options && options.error) {
      status.classList.add("form-status--error");
    }

    status.replaceChildren();

    var paragraph = document.createElement("p");
    paragraph.textContent = text;
    status.appendChild(paragraph);

    if (options && options.link) {
      var link = document.createElement("a");
      link.href = options.link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = options.linkText || "Open the message";
      status.appendChild(link);

      if (options.secondary) {
        status.appendChild(document.createTextNode(" "));
        var secondary = document.createElement("a");
        secondary.href = options.secondary;
        secondary.textContent = options.secondaryText || "Use email instead";
        status.appendChild(secondary);
      }
    }

    status.setAttribute("tabindex", "-1");
    status.focus({ preventScroll: true });
  }

  document.querySelectorAll("form[data-wa-form]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var honeypot = form.querySelector('[name="company_website"]');
      if (honeypot && honeypot.value) {
        return;
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var message = buildMessage(form, data);
      var subject = form.getAttribute("data-subject") || "Website enquiry";
      var whatsappUrl = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message);
      var mailtoUrl = "mailto:" + EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(message);

      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      setStatus(
        form,
        "Your message is ready. WhatsApp should open in a new tab. If it did not, use one of the links below or call 0737 334 449.",
        {
          link: whatsappUrl,
          linkText: "Open WhatsApp",
          secondary: mailtoUrl,
          secondaryText: "Send by email"
        }
      );
    });
  });

  /* If JavaScript fails to run, the mailto action on each form still works. */
})();
