/*
 * MikiForge Studio v0.1 — konfigurácia
 * ------------------------------------------------------------
 * Tu sa upravujú údaje, ktoré ešte nie sú finálne.
 * Nevkladajte sem žiadne API kľúče, heslá ani iné tajomstvá —
 * tento súbor je verejne čitateľný v prehliadači.
 *
 * Po úprave stačí obnoviť stránku (Ctrl + F5).
 */
window.MIKIFORGE_CONFIG = {

  /* --- Prihlasovací formulár ------------------------------------
   * mode: "demo"        = lokálny náhľad, nič sa neodosiela (predvolené)
   *       "production"  = odoslanie na endpoint (pozri docs/FORMULAR_ENDPOINT.md)
   *
   * Produkčný režim sa zapne IBA vtedy, ak platí všetko naraz:
   *   mode === "production"
   *   endpoint je vyplnená adresa začínajúca na https://
   *   privacyInfoReady === true (stránka ochrany osobných údajov je doplnená)
   * Inak formulár zostane v bezpečnom demo režime.
   */
  form: {
    mode: "production",
    endpoint: "https://formspree.io/f/mqppqwvo", // Formspree → e-mail
    privacyInfoReady: true,  // ochrana-osobnych-udajov.html je doplnená
    timeoutMs: 15000
  },

  /* --- Kontakt ----------------------------------------------------
   * Kým je email prázdny, na stránke sa zobrazí „Priamy kontakt pripravujem“.
   * Telefón je nepovinný; prázdny sa nezobrazí.
   */
  contact: {
    email: "kontakt@mikiforge.sk",
    phone: ""
  },

  /* --- Projekt pre miestne firmy ---------------------------------
   * region:          text územia zobrazený na stránke
   * municipalities:  zoznam obcí — ak je prázdny, nezobrazí sa
   * statusLabel:     krátky stav projektu
   * timingNote:      text o termínoch; prázdny = zostane predvolený text v HTML
   */
  campaign: {
    region: "miestne firmy a živnostníci zo Spiša a okolia",
    municipalities: [],
    statusLabel: "Prihlasovanie otvorené",
    timingNote: ""
  }
};
