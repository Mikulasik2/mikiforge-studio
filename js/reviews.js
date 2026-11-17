/*
 * MikiForge Studio v0.4 — formulár na hodnotenia
 * - kontrola polí so súhrnom chýb (rovnaký štýl ako prihláška v main.js)
 * - odoslanie cez Formspree (config.js → reviews; prázdny endpoint = form.endpoint)
 * - predvyplnenie firmy z odkazu: https://mikiforge.sk/?firma=Nazov%20firmy#napisat-hodnotenie
 *
 * Súkromie: skript neukladá údaje do localStorage ani cookies a nič nevypisuje do konzoly.
 * Hodnotenie sa na webe NEZOBRAZÍ automaticky — príde e-mailom a zverejňuje sa ručne.
 */
(function () {
  "use strict";

  var CONFIG = window.MIKIFORGE_CONFIG || {};

  var MESSAGES = {
    reviewName:    { required: "Doplňte svoje meno." },
    reviewEmail:   { required: "Doplňte e-mail.", format: "E-mail nemá správny tvar, napr. meno@firma.sk." },
    reviewText:    { required: "Napíšte pár viet o spolupráci.", short: "Napíšte prosím aspoň jednu celú vetu (min. 20 znakov)." },
    reviewConsent: { required: "Bez súhlasu hodnotenie nemôžem zverejniť." }
  };
  var LABELS = {
    reviewName: "Meno",
    reviewEmail: "E-mail",
    reviewText: "Vaše hodnotenie",
    reviewConsent: "Súhlas so zverejnením"
  };
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function getMode() {
    var r = CONFIG.reviews || {};
    var f = CONFIG.form || {};
    var endpoint = (typeof r.endpoint === "string" && r.endpoint.trim()) ||
                   (typeof f.endpoint === "string" ? f.endpoint.trim() : "");
    var live = r.mode === "production" && /^https:\/\//i.test(endpoint) && r.privacyInfoReady === true;
    return { live: live, endpoint: endpoint, timeout: Number(r.timeoutMs) || 15000 };
  }

  function init() {
    var form = document.getElementById("review-form");
    if (!form) return;

    var submit = document.getElementById("review-submit");
    var submitLabel = submit.querySelector(".form__submit-label");
    var status = document.getElementById("review-status");
    var summary = document.getElementById("review-summary");
    var summaryTitle = document.getElementById("review-summary-title");
    var summaryList = document.getElementById("review-summary-list");
    var mode = getMode();
    var busy = false;
    var idleLabel = mode.live ? "Odoslať hodnotenie" : "Skontrolovať hodnotenie";

    submitLabel.textContent = idleLabel;
    submit.disabled = false;
    if (!mode.live) {
      document.getElementById("review-legal").textContent = "Ukážka: formulár zatiaľ nič neodosiela.";
    }

    // predvyplnenie firmy z odkazu (?firma=...)
    try {
      var firma = new URLSearchParams(window.location.search).get("firma");
      if (firma && !form.elements.reviewCompany.value) {
        form.elements.reviewCompany.value = firma.slice(0, 120);
      }
    } catch (e) { /* staré prehliadače — nič */ }

    function el(name) { return form.elements[name]; }

    function value(name) {
      var e = el(name);
      if (!e) return "";
      if (e.type === "checkbox") return e.checked ? "ano" : "";
      if (e instanceof RadioNodeList) return e.value || "";
      return (e.value || "").trim();
    }

    function validate(name) {
      var v = value(name);
      var m = MESSAGES[name];
      if (name === "reviewEmail") {
        if (!v) return m.required;
        if (!EMAIL_RE.test(v)) return m.format;
        return "";
      }
      if (name === "reviewText") {
        if (!v) return m.required;
        if (v.length < 20) return m.short;
        return "";
      }
      return v ? "" : m.required;
    }

    function showError(name, message) {
      var input = el(name);
      var errEl = document.getElementById(input.id + "-err");
      if (errEl) errEl.textContent = message;
      if (message) input.setAttribute("aria-invalid", "true");
      else input.removeAttribute("aria-invalid");
    }

    Object.keys(MESSAGES).forEach(function (name) {
      var input = el(name);
      var evt = input.type === "checkbox" ? "change" : "blur";
      input.addEventListener(evt, function () {
        if (input.type === "checkbox" || input.value.trim() !== "" || input.getAttribute("aria-invalid") === "true") {
          showError(name, validate(name));
        }
      });
      if (input.type !== "checkbox") {
        input.addEventListener("input", function () {
          if (input.getAttribute("aria-invalid") === "true") showError(name, validate(name));
        });
      }
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

    // Kľúče sú čitateľné, lebo sa priamo zobrazia v e-maile.
    function collect() {
      var name = value("reviewName");
      var company = value("reviewCompany");
      var rating = value("reviewRating");
      return {
        "Typ": "HODNOTENIE (nie prihláška)",
        "Meno": name,
        "Firma": company || "—",
        "email": value("reviewEmail"),
        "Hodnotenie": rating ? rating + " z 5" : "nezadané",
        "Text hodnotenia": value("reviewText"),
        "Súhlas so zverejnením mena a firmy": "áno",
        "Stránka": window.location.href.split("#")[0],
        _gotcha: (el("reviewWebsite").value || ""),
        _subject: "Hodnotenie: " + name + (company ? " (" + company + ")" : ""),
        _replyto: value("reviewEmail")
      };
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (busy) return;
      hideStatus();

      var errors = [];
      Object.keys(MESSAGES).forEach(function (name) {
        var msg = validate(name);
        showError(name, msg);
        if (msg) errors.push({ name: name, message: msg });
      });

      if (errors.length) {
        summaryTitle.textContent = errors.length === 1
          ? "Formulár obsahuje 1 chybu:"
          : "Formulár obsahuje " + errors.length + " chyby:";
        summaryList.textContent = "";
        errors.forEach(function (err) {
          var li = document.createElement("li");
          var a = document.createElement("a");
          var target = el(err.name);
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
        window.setTimeout(function () {
          setBusy(false);
          showStatus("ok", [
            "Údaje sú vyplnené správne. V tomto náhľade sa nič neodoslalo.",
            "Odosielanie hodnotení zatiaľ nie je zapnuté."
          ]);
        }, 450);
        return;
      }

      send(collect())
        .then(function () {
          setBusy(false);
          form.reset();
          showStatus("ok", [
            "Ďakujem! Hodnotenie som prijal.",
            "Pred zverejnením si ho prečítam. Ak budem mať otázku, ozvem sa vám e-mailom."
          ]);
        })
        .catch(function (err) {
          setBusy(false);
          showStatus("error", [
            "Hodnotenie sa nepodarilo odoslať.",
            (err && err.userMessage) || "Text zostal vo formulári. Skúste to prosím o chvíľu znova, alebo mi ho pošlite na kontakt@mikiforge.sk."
          ]);
        });
    });

    function send(payload) {
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
            if (res.ok && data && (data.ok === true || data.success === true)) return data;
            var e = new Error("rejected");
            if (data && typeof data.message === "string" && data.message.length < 300) {
              e.userMessage = data.message + " Text zostal vo formulári.";
            }
            throw e;
          });
        })
        .catch(function (err) {
          if (err && err.name === "AbortError") {
            err.userMessage = "Server neodpovedal včas. Text zostal vo formulári, skúste to prosím znova.";
          }
          throw err;
        })
        .finally(function () { if (timer) window.clearTimeout(timer); });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
