# Checklist pred spustením

Odškrtávajte postupne. Kým nie sú hotové body 1–6, web môže byť verejne dostupný len ako ukážka (formulár v demo režime nič neodosiela).

## 1. Doména a kontakt
- [x] Vybraná a zaregistrovaná finálna doména. (mikiforge.sk)
- [ ] Funkčná e-mailová schránka; doplnená do `config.js` → `contact.email`.
- [ ] (Voliteľne) telefón do `contact.phone`.
- [ ] Rozhodnutý statický hosting; web nahraný a otestovaný na doméne cez HTTPS.

## 2. Územie a termíny kampane
- [ ] Potvrdené územie (`campaign.region`) a prípadný zoznam obcí (`campaign.municipalities`).
- [ ] Potvrdené termíny prijímania prihlášok → `campaign.timingNote` aj predvolený text v `index.html` (sekcia Priebeh).
- [ ] Upravený štítok `campaign.statusLabel` (napr. „Prihlasovanie otvorené“) a text v sekcii Kontakt („prihlášky otvorím…“).

## 3. Podmienky projektu
- [ ] Finálne znenie rozsahu (čo je / nie je súčasťou) a kritérií výberu.
- [ ] Odpovede v sekcii Časté otázky zodpovedajú finálnym podmienkam.
- [ ] Pripravená jednoduchá písomná dohoda s vybranou firmou (rozsah, náklady na doménu a služby, odovzdanie prístupov, použitie v portfóliu).

## 4. Portfólio
- [ ] Písomné (stačí e-mail) povolenie firmy D&K AutoCARE na zobrazenie webu a jeho snímok v portfóliu.
- [ ] Snímky projektov sú aktuálne (vytvorené 27. 10. 2026).

## 5. Prevádzkovateľ a osobné údaje
- [ ] Doplnené všetky polia `[DOPLNIŤ]` a `[OVERIŤ]` v `ochrana-osobnych-udajov.html` (právna forma, IČO, adresa, e-mail, lehota uchovávania, poskytovatelia služieb).
- [ ] Odstránený pruh „pracovný návrh“ a nadpis „Pracovná verzia“; doplnený dátum.
- [ ] Text skontrolovaný (ideálne odborníkom).
- [ ] Ak pribudne analytika alebo externé služby, doplnené do stránky a podľa potreby riešený súhlas.

## 6. Skutočné odosielanie formulára
- [ ] Server/funkcia podľa `docs/FORMULAR_ENDPOINT.md` (validácia, spam, CORS, doručenie, žiadne tajomstvá vo frontende).
- [ ] V `config.js`: `mode: "production"`, `endpoint: "https://…"`, `privacyInfoReady: true`.
- [ ] Otestované na ostrej doméne: prázdny formulár, chybný e-mail, správne vyplnený (prišiel e-mail/záznam), nedostupný server (chyba, údaje ostali).
- [ ] Skontrolovaný text pri tlačidle (`#form-legal` sa v produkcii nastaví automaticky).

## 7. Metadáta a indexovanie
- [ ] V `index.html` zmeniť `<meta name="robots" content="noindex, nofollow">` na `index, follow` (stránku ochrany údajov môžete nechať `noindex`).
- [x] Doplniť `<link rel="canonical" href="https://vasadomena.sk/">`.
- [x] `og:url` a absolútna `og:image` pre mikiforge.sk.
- [x] Vytvoriť `robots.txt` a `sitemap.xml` so skutočnou doménou.
- [ ] Overiť náhľad odkazu (napr. vložením do e-mailu/Messengera) a validitu v PageSpeed Insights.
- [ ] Zmeniť v pätičke „pracovná verzia v0.1“ a v `CHANGELOG.md` zapísať verziu.
