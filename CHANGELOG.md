# Zmeny

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
