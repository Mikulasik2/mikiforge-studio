/*
 * MikiForge Studio v0.1 — správanie stránky
 * - mobilné menu
 * - texty z config.js (kontakt, územie projektu)
 * - kontrola a (v produkčnom režime) odoslanie prihlášky
 * - jemné objavovanie sekcií
 *
 * Súkromie: skript neukladá údaje z formulára do localStorage,
 * cookies ani analytiky a nič z nich nevypisuje do konzoly.
 */
(function () {
  "use strict";

  var CONFIG = window.MIKIFORGE_CONFIG || {};

  function get(path) {
    return path.split(".").reduce(function (obj, key) {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, CONFIG);
  }

  /* ========================= Mobilné menu ========================= */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("hlavna-navigacia");
    if (!toggle || !nav) return;
    var mq = window.matchMedia("(max-width: 960px)");
    var label = toggle.querySelector(".nav-toggle__label");

    function setOpen(open, returnFocus) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      if (label) label.textContent = open ? "Zavrieť" : "Menu";
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus({ preventScroll: true });
      } else if (returnFocus) {
        toggle.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true", false);
    });

    nav.addEventListener("click", function (e) {
      if (e.target.closest("a") && mq.matches) setOpen(false, false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, true);
      }
    });

    // klik mimo menu ho zatvorí
    document.addEventListener("click", function (e) {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false, false);
    });

    // Tab z posledného odkazu v otvorenom menu sa vráti na tlačidlo
    nav.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !mq.matches || toggle.getAttribute("aria-expanded") !== "true") return;
      var links = nav.querySelectorAll("a");
      var last = links[links.length - 1];
      var first = links[0];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); toggle.focus(); }
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); toggle.focus(); }
    });

    function onChange() { if (!mq.matches) setOpen(false, false); }
    if (mq.addEventListener) mq.addEventListener("change", onChange); else mq.addListener(onChange);
  }

  /* ========================= Konfigurovateľné texty ========================= */
  function initConfigText() {
    document.querySelectorAll("[data-config-text]").forEach(function (el) {
      var value = get(el.getAttribute("data-config-text"));
      if (typeof value === "string" && value.trim() !== "") el.textContent = value.trim();
    });

    document.querySelectorAll("[data-config-list]").forEach(function (el) {
      var list = get(el.getAttribute("data-config-list"));
      if (Array.isArray(list) && list.length) {
        el.textContent = "Obce: " + list.join(", ") + ".";
        el.hidden = false;
      }
    });

    // Kontakt
    var email = (get("contact.email") || "").trim();
    var phone = (get("contact.phone") || "").trim();
    var listEl = document.getElementById("contact-list");
    var pending = document.getElementById("contact-pending");
    // ak je kontakt už priamo v HTML, nič nepridávame (žiadne duplicity)
    if (listEl && !listEl.children.length && (email || phone)) {
      if (email) addContact(listEl, "mailto:" + email, email);
      if (phone) addContact(listEl, "tel:" + phone.replace(/[^\d+]/g, ""), phone);
      listEl.hidden = false;
      if (pending) pending.hidden = true;
    }

    var year = document.getElementById("year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  function addContact(list, href, text) {
    var li = document.createElement("li");
    var a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    li.appendChild(a);
    list.appendChild(li);
  }

  /* ========================= Formulár ========================= */
  var MESSAGES = {
    company: { required: "Doplňte názov firmy alebo živnosti." },
    contactName: { required: "Doplňte meno kontaktnej osoby." },
    email: { required: "Doplňte e-mail.", format: "E-mail nemá správny tvar. Skontrolujte, či obsahuje @ a doménu, napr. meno@firma.sk." },
    phone: { format: "Telefón môže obsahovať iba číslice, medzery a znak +. Napríklad +421 900 000 000." },
    town: { required: "Doplňte obec alebo mesto." },
    business: { required: "Napíšte stručne, čomu sa venujete." },
    existingWeb: { format: "Zadajte adresu webu alebo Facebooku, napr. facebook.com/vasafirma." },
    benefit: { required: "Napíšte aspoň krátko, čo by mal web ukázať alebo priniesť.", short: "Napíšte prosím aspoň jednu celú vetu (min. 15 znakov)." },
    materials: { required: "Vyberte jednu z možností." }
  };

  var LABELS = {
    company: "Názov firmy alebo živnosti",
    contactName: "Kontaktná osoba",
    email: "E-mail",
    phone: "Telefón",
    town: "Obec / mesto",
    business: "Čomu sa venujete",
    existingWeb: "Existujúci web alebo Facebook",
    benefit: "Čo by mal web ukázať alebo priniesť",
    materials: "Máte fotografie a podklady?"
  };

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^\+?[0-9][0-9 \/-]{5,18}[0-9]$/;
  var URL_RE = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)?$/i;

  function getMode() {
    var f = CONFIG.form || {};
    var endpoint = typeof f.endpoint === "string" ? f.endpoint.trim() : "";
    var ready = f.mode === "production" && /^https:\/\//i.test(endpoint) && f.privacyInfoReady === true;
    return { live: ready, endpoint: endpoint, timeout: Number(f.timeoutMs) || 15000 };
  }

  function initForm() {
    var form = document.getElementById("application-form");
    if (!form) return;

    var submit = document.getElementById("form-submit");
    var submitLabel = submit.querySelector(".form__submit-label");
    var status = document.getElementById("form-status");
    var summary = document.getElementById("form-summary");
    var summaryTitle = document.getElementById("form-summary-title");
    var summaryList = document.getElementById("form-summary-list");
    var mode = getMode();
    var busy = false;
    var startedAt = Date.now();

    var idleLabel = mode.live ? "Odoslať prihlášku" : "Skontrolovať prihlášku";
    submitLabel.textContent = idleLabel;
    submit.disabled = false;

    if (!mode.live) {
      // demo režim: poctivé texty (HTML obsahuje texty pre ostrý režim)
      document.getElementById("form-mode-title").textContent = "Ukážka prihlášky — prihlasovanie zatiaľ nie je otvorené";
      document.getElementById("form-mode-text").textContent = "Formulár si môžete vyskúšať. Údaje sa iba skontrolujú priamo vo vašom prehliadači a nikam sa neodošlú ani neuložia.";
      document.getElementById("form-legal").textContent = "V ukážke sa nič neodosiela.";
    }

    if (mode.live) {
      var box = document.getElementById("form-mode");
      box.classList.add("is-live");
      document.getElementById("form-mode-title").textContent = "Prihlasovanie je otvorené";
      document.getElementById("form-mode-text").textContent = "Prihlášku mi doručí e-mailom služba Formspree. Potvrdenie sa zobrazí až po jej prijatí.";
    }

    function fieldValue(name) {
      var el = form.elements[name];
      if (!el) return "";
      if (el instanceof RadioNodeList) return el.value || "";
      return (el.value || "").trim();
    }

    function validateField(name) {
      var v = fieldValue(name);
      var m = MESSAGES[name];
      switch (name) {
        case "email":
          if (!v) return m.required;
          if (!EMAIL_RE.test(v)) return m.format;
          return "";
        case "phone":
          if (v && !PHONE_RE.test(v)) return m.format;
          return "";
        case "existingWeb":
          if (v && !URL_RE.test(v.replace(/\s+/g, ""))) return m.format;
          return "";
        case "benefit":
          if (!v) return m.required;
          if (v.length < 15) return m.short;
          return "";
        default:
          if (m && m.required && !v) return m.required;
          return "";
      }
    }

    function fieldElement(name) {
      if (name === "materials") return form.querySelector('input[name="materials"]');
      return form.elements[name];
    }

    function showError(name, message) {
      var errId = name === "materials" ? "f-materials-err" : fieldElement(name).id + "-err";
      var errEl = document.getElementById(errId);
      if (errEl) errEl.textContent = message;
      if (name === "materials") {
        var fs = form.querySelector(".choice");
        fs.classList.toggle("is-invalid", !!message);
        form.querySelectorAll('input[name="materials"]').forEach(function (r) {
          if (message) r.setAttribute("aria-invalid", "true"); else r.removeAttribute("aria-invalid");
        });
      } else {
        var el = fieldElement(name);
        if (message) el.setAttribute("aria-invalid", "true"); else el.removeAttribute("aria-invalid");
      }
    }

    // priebežná kontrola: po opustení poľa a pri oprave chybného poľa
    Object.keys(MESSAGES).forEach(function (name) {
      if (name === "materials") {
        form.querySelectorAll('input[name="materials"]').forEach(function (r) {
          r.addEventListener("change", function () { showError("materials", validateField("materials")); });
        });
        return;
      }
      var el = form.elements[name];
      el.addEventListener("blur", function () {
        if (el.value.trim() !== "" || el.getAttribute("aria-invalid") === "true") showError(name, validateField(name));
      });
      el.addEventListener("input", function () {
        if (el.getAttribute("aria-invalid") === "true") showError(name, validateField(name));
      });
    });

    function hideStatus() {
      status.hidden = true;
      status.className = "form__status";
      status.textContent = "";
    }

    function showStatus(kind, lines) {
      status.className = "form__status " + (kind === "ok" ? "is-ok" : "is-error");
      status.textContent = "";
      lines.forEach(function (line) {
        var p = document.createElement("p");
        p.textContent = line;
        status.appendChild(p);
      });
      status.hidden = false;
      status.focus({ preventScroll: true });
      status.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }

    function setBusy(on) {
      busy = on;
      form.classList.toggle("is-busy", on);
      form.setAttribute("aria-busy", String(on));
      submit.disabled = on;
      submitLabel.textContent = on ? (mode.live ? "Odosielam…" : "Kontrolujem…") : idleLabel;
    }

    var MATERIALS_LABEL = { "ano": "Áno", "ciastocne": "Čiastočne", "zatial-nie": "Zatiaľ nie" };

    // Kľúče sú čitateľné, lebo sa priamo zobrazia v e-maile s prihláškou.
    function collect() {
      return {
        "Firma / živnosť": fieldValue("company"),
        "Kontaktná osoba": fieldValue("contactName"),
        "email": fieldValue("email"),
        "Telefón": fieldValue("phone") || "—",
        "Obec / mesto": fieldValue("town"),
        "Čomu sa venuje": fieldValue("business"),
        "Web / Facebook": fieldValue("existingWeb") || "—",
        "Čo má web ukázať / priniesť": fieldValue("benefit"),
        "Fotografie a podklady": MATERIALS_LABEL[fieldValue("materials")] || fieldValue("materials"),
        // špeciálne polia služby Formspree:
        _gotcha: (form.elements.companyWebsite.value || ""),   // pasca na roboty (ľudia nevidia)
        _subject: "Prihláška: " + fieldValue("company"),          // predmet e-mailu
        _replyto: fieldValue("email")                            // „Odpovedať“ pôjde priamo firme
      };
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return; // zabráni opakovanému odoslaniu

      hideStatus();
      var errors = [];
      Object.keys(MESSAGES).forEach(function (name) {
        var msg = validateField(name);
        showError(name, msg);
        if (msg) errors.push({ name: name, message: msg });
      });

      if (errors.length) {
        summaryTitle.textContent = errors.length === 1
          ? "Prihláška obsahuje 1 chybu:"
          : "Prihláška obsahuje " + errors.length + (errors.length < 5 ? " chyby:" : " chýb:");
        summaryList.textContent = "";
        errors.forEach(function (err) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          var target = fieldElement(err.name);
          a.href = "#" + target.id;
          a.textContent = LABELS[err.name] + " — " + err.message;
          a.addEventListener("click", function (ev) {
            ev.preventDefault();
            target.focus();
            target.scrollIntoView({ block: "center", behavior: prefersReducedMotion() ? "auto" : "smooth" });
          });
          li.appendChild(a);
          summaryList.appendChild(li);
        });
        summary.hidden = false;
        summary.focus({ preventScroll: true });
        summary.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
        return;
      }

      summary.hidden = true;
      setBusy(true);

      if (!mode.live) {
        // DEMO: nič sa neodosiela ani neukladá
        window.setTimeout(function () {
          setBusy(false);
          showStatus("ok", [
            "Údaje sú vyplnené správne. V tomto náhľade sa nič neodoslalo.",
            "Prihlasovanie zatiaľ nie je otvorené. Vyplnené údaje zostali iba v tomto okne prehliadača."
          ]);
        }, 450);
        return;
      }

      sendApplication(collect())
        .then(function () {
          setBusy(false);
          form.reset();
          startedAt = Date.now();
          showStatus("ok", [
            "Ďakujem, prihlášku som prijal.",
            "Ozvem sa vám e-mailom. Prihlásenie vás k ničomu nezaväzuje."
          ]);
        })
        .catch(function (err) {
          setBusy(false);
          showStatus("error", [
            "Prihlášku sa nepodarilo odoslať.",
            (err && err.userMessage) || "Vaše údaje zostali vo formulári. Skúste to prosím o chvíľu znova."
          ]);
        });
    });

    function sendApplication(payload) {
      var controller = "AbortController" in window ? new AbortController() : null;
      var timer = controller ? window.setTimeout(function () { controller.abort(); }, mode.timeout) : null;

      return fetch(mode.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        credentials: "omit",
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          return res.json().catch(function () { return null; }).then(function (data) {
            // úspech iba ak server potvrdí prijatie: {"ok": true} (Formspree aj vlastný server)
            // alebo {"success": true} (niektoré iné služby)
            if (res.ok && data && (data.ok === true || data.success === true)) return data;
            var e = new Error("rejected");
            if (data && typeof data.message === "string" && data.message.length < 300) {
              e.userMessage = data.message + " Vaše údaje zostali vo formulári.";
            }
            // chyby jednotlivých polí zo servera
            if (data && data.errors && typeof data.errors === "object") {
              Object.keys(data.errors).forEach(function (name) {
                if (MESSAGES[name] && typeof data.errors[name] === "string") showError(name, data.errors[name]);
              });
            }
            throw e;
          });
        })
        .catch(function (err) {
          if (err && err.name === "AbortError") {
            err.userMessage = "Server neodpovedal včas. Vaše údaje zostali vo formulári, skúste to prosím znova.";
          }
          throw err;
        })
        .finally(function () { if (timer) window.clearTimeout(timer); });
    }
  }

  /* ========================= Objavovanie sekcií ========================= */
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function initReveal() {
    if (prefersReducedMotion() || !("IntersectionObserver" in window)) return;
    var items = document.querySelectorAll(".local__head, .scope, .process, .project, .about__grid, .faq__grid, .apply__grid, .contact__inner");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) {
      // prvky už viditeľné pri načítaní neanimujeme
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  function init() {
    initNav();
    initConfigText();
    initForm();
    initReveal();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
