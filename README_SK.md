# MikiForge Studio — web v0.1

Statický web (HTML + CSS + čistý JavaScript), bez frameworku a bez build procesu.
Pripravený na ľubovoľný statický hosting. Server pre prihlasovací formulár je samostatná služba (pozri `docs/FORMULAR_ENDPOINT.md`).

## Obsah priečinka

```
MikiForge-Studio-v0.1/
├── index.html                    hlavná stránka
├── ochrana-osobnych-udajov.html  pracovná verzia (údaje na doplnenie)
├── config.js                     KONFIGURÁCIA: formulár, kontakt, územie projektu
├── css/styles.css                všetky štýly (farby a fonty v :root na začiatku)
├── js/main.js                    menu, formulár, texty z konfigurácie
├── assets/
│   ├── fonts/                    Source Serif 4 + Manrope (licencia SIL OFL, súbory OFL-*.txt)
│   └── img/
│       ├── brand/                značka M, favicony, Open Graph obrázok
│       ├── hero/                 snímky webu D&K AutoCARE pre úvod
│       └── projects/             snímky projektov
├── docs/FORMULAR_ENDPOINT.md     formát požiadavky a odpovede pre server formulára
├── START_LOCAL.bat               spustenie lokálneho servera vo Windows
├── CHECKLIST_PRED_SPUSTENIM.md
└── CHANGELOG.md
```

## 1. Otvorenie lokálneho náhľadu

**Najjednoduchšie:** dvojklik na `index.html`. Stránka sa otvorí priamo v prehliadači a funguje celá vrátane ukážky formulára.

**Odporúčané (lokálny server)** — správa sa presne ako na hostingu:

- **Windows:** dvojklik na `START_LOCAL.bat`. Skontroluje, či je nainštalovaný Python, spustí server a otvorí `http://localhost:8000`. Zastavenie: zavrieť okno alebo Ctrl + C.
- **Ručne (Windows / macOS / Linux):** v tomto priečinku spustite
  ```
  python -m http.server 8000
  ```
  (na macOS/Linuxe prípadne `python3`) a otvorte `http://localhost:8000`.

Python stiahnete z https://www.python.org/downloads/ — pri inštalácii zaškrtnite **„Add python.exe to PATH“**. Nič iné netreba inštalovať.

## 2. Úpravy

### Texty
Všetky texty sú priamo v `index.html`, sekcie sú označené komentármi
(`<!-- ===== PROJEKT PRE MIESTNE FIRMY ===== -->` a pod.). Otvorte súbor v textovom editore (napr. VS Code alebo Poznámkový blok), upravte text a uložte v kódovaní **UTF-8**.

### Údaje, ktoré sa ešte menia — `config.js`
| Nastavenie | Čo robí |
|---|---|
| `contact.email`, `contact.phone` | Kým sú prázdne, v kontakte je „Priamy kontakt pripravujem“. Po vyplnení sa zobrazia ako odkazy. |
| `campaign.region` | Text územia („miestne firmy a živnostníci zo Spiša a okolia“). |
| `campaign.municipalities` | Zoznam obcí, napr. `["Kežmarok", "Poprad"]`. Prázdny = nezobrazí sa. |
| `campaign.statusLabel` | Štítok stavu („Pripravovaný projekt“). |
| `campaign.timingNote` | Text o termínoch pod priebehom spolupráce. Prázdny = ostane predvolený text. |
| `form.*` | Režim formulára — pozri nižšie. |

Bez JavaScriptu sa zobrazia predvolené texty z `index.html`, preto pri trvalej zmene upravte text aj tam.

### Obrázky
- Snímky projektov sú v `assets/img/projects/`, vždy vo formáte `.webp` (hlavný) aj `.jpg` (záloha).
- Pri výmene zachovajte **pomer strán** (hlavné snímky 16:10, napr. 1280 × 800 a 720 × 450) a **rovnaký názov súboru**. Ak zmeníte rozmery, upravte v `index.html` aj atribúty `width` a `height`.
- Snímky webov boli vytvorené 27. 10. 2026 zo zverejnených verzií oboch webov. Keď sa weby zmenia, oplatí sa ich nasnímať znova.

### Farby a písmo
Na začiatku `css/styles.css` v bloku `:root` (napr. `--copper`, `--cream`, `--bg`).

## 3. Formulár: demo vs. produkcia

| | **Demo (predvolené v0.1)** | **Produkcia** |
|---|---|---|
| Nastavenie | `form.mode: "demo"` | `mode: "production"` + `endpoint: "https://…"` + `privacyInfoReady: true` |
| Tlačidlo | „Skontrolovať prihlášku“ | „Odoslať prihlášku“ |
| Čo sa stane | Údaje sa iba skontrolujú v prehliadači. **Nič sa neodosiela ani neukladá.** | Údaje sa pošlú (POST, JSON) na endpoint. |
| Správa | „Údaje sú vyplnené správne. V tomto náhľade sa nič neodoslalo.“ | Úspech **iba ak server vráti HTTP 2xx a `{"ok": true}`**. Inak chyba a údaje ostanú vo formulári. |

Produkčný režim sa zapne **iba ak sú splnené všetky tri podmienky naraz**. Ak čokoľvek chýba, formulár zostane v bezpečnom demo režime.

Do `config.js` **nikdy nevkladajte API kľúče ani heslá** — súbor je verejný. Overenie, ochrana proti spamu a doručenie patria na server. Podrobnosti: `docs/FORMULAR_ENDPOINT.md`.

Formulár neukladá údaje do localStorage, cookies ani analytiky a nič z nich nevypisuje do konzoly.

## 4. Indexovanie
Pracovná verzia má v oboch HTML súboroch `<meta name="robots" content="noindex, nofollow">`.
Pred zverejnením postupujte podľa `CHECKLIST_PRED_SPUSTENIM.md` (sekcia Metadáta).
