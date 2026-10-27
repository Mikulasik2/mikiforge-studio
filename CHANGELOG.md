# Zmeny

## v0.2 — 27. 10. 2026
- Ostrá prihláška: formulár odosiela cez Formspree (https://formspree.io/f/mqppqwvo) na e-mail.
  - E-mail s prihláškou má predmet „Prihláška: názov firmy“, čitateľné slovenské názvy polí a „Odpovedať“ ide priamo firme.
  - Ochrana proti robotom (`_gotcha`), potvrdenie sa zobrazí iba po prijatí službou, pri chybe ostanú údaje vo formulári.
- Hotová stránka ochrany osobných údajov (prevádzkovateľ Martin Mikulášik, Formspree, Zoho Mail EU, GitHub Pages, lehoty, práva).
- Štítok projektu „Prihlasovanie otvorené“, upravené texty o termínoch a v kontakte, pätička „v0.2“.

## v0.1.2 — 27. 10. 2026
- E-mail kontakt@mikiforge.sk (Zoho Mail, EU) v sekcii Kontakt a pri prihláške; `config.js` → `contact.email`.
- Kontakt je priamo v HTML, takže sa zobrazí aj bez JavaScriptu.

## v0.1.1 — 27. 10. 2026
- Pripojená doména mikiforge.sk (GitHub Pages, DNS u WebSupportu).
- Súbor `CNAME`, `robots.txt`, `sitemap.xml`.
- Doplnené `canonical`, `og:url` a absolútna adresa `og:image`.
- `noindex` zatiaľ ponechaný — zrušiť po doplnení kontaktu a ochrany osobných údajov.

## v0.1 — 27. 10. 2026
Prvá pracovná verzia webu MikiForge Studio.

- Jednostránkový web: úvod, Projekt pre miestne firmy (rozsah, výber, priebeh), Projekty, O štúdiu, Časté otázky, Prihláška, Kontakt.
- Vizuálny smer podľa návrhu: tmavá grafitová, medené akcenty, krémová sekcia pre firmy, serif Source Serif 4 + Manrope (lokálne, SIL OFL).
- Pracovná identita: SVG značka „M“, favicon (SVG, 32 px, 180 px, 512 px), Open Graph obrázok 1200 × 630.
- Projekty v poradí Mechanical Workshop → D&K AutoCARE so skutočnými snímkami zverejnených webov a záberom z hry (uložené lokálne).
- Prihlasovací formulár: validácia so súhrnom chýb a chybami pri poliach, zachovanie údajov, ochrana pred dvojitým odoslaním, pasca na roboty.
  - Predvolene poctivý demo režim (nič sa neodosiela).
  - Pripravený produkčný režim s konfigurovateľným endpointom (aktivuje sa iba s endpointom a doplnenými údajmi o spracúvaní).
- `config.js` pre kontakt, územie, obce, stav a termíny projektu.
- Pracovná stránka ochrany osobných údajov s označenými údajmi na doplnenie.
- Prístupnosť: mobilné menu s aria-expanded, Escape a klávesnicou, viditeľný focus, `details/summary` otázky, prefers-reduced-motion, obsah aj bez JavaScriptu.
- Bez analytiky, trackerov, cookies a externých načítaní. `noindex` do zverejnenia.
