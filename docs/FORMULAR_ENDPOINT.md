# Server pre prihlasovací formulár — špecifikácia

> **Aktuálne (v0.2):** formulár posiela prihlášky službe **Formspree** (`https://formspree.io/f/mqppqwvo`), ktorá ich doručí e-mailom.
> Kľúče v JSON sú čitateľné slovenské názvy („Firma / živnosť“, „Kontaktná osoba“, `email`…) plus špeciálne polia Formspree `_gotcha`, `_subject`, `_replyto`.
> Úspech = HTTP 2xx a `{"ok": true}`. Nižšie je pôvodná špecifikácia pre prípadný vlastný server.

Frontend (`js/main.js`) posiela prihlášku iba v produkčnom režime (`config.js`):
`form.mode = "production"`, `form.endpoint` začína `https://` a `form.privacyInfoReady = true`.

## Požiadavka

```
POST {form.endpoint}
Content-Type: application/json
Accept: application/json
(bez cookies — credentials: "omit")
```

```json
{
  "company": "Stolárstvo Novák",
  "contactName": "Ján Novák",
  "email": "jan@stolarstvo.sk",
  "phone": "+421 900 123 456",
  "town": "Kežmarok",
  "business": "stolárska výroba na mieru",
  "existingWeb": "facebook.com/stolarstvonovak",
  "benefit": "Chceme ukázať našu prácu a získať zákazníkov z okolia.",
  "materials": "ano",
  "companyWebsite": "",
  "elapsedMs": 84210,
  "source": "mikiforge-web-v0.1"
}
```

| Pole | Povinné | Max. dĺžka | Poznámka |
|---|---|---|---|
| company | áno | 120 | |
| contactName | áno | 100 | |
| email | áno | 160 | overiť formát |
| phone | nie | 30 | prázdny reťazec, ak nevyplnené |
| town | áno | 80 | |
| business | áno | 200 | |
| existingWeb | nie | 200 | môže byť bez `https://` |
| benefit | áno | 1500 | min. 15 znakov |
| materials | áno | — | `"ano"` / `"ciastocne"` / `"zatial-nie"` |
| companyWebsite | — | — | **pasca na roboty** — musí byť prázdne |
| elapsedMs | — | — | čas od načítania formulára v ms |
| source | — | — | identifikátor verzie webu |

## Odpoveď

Úspech (frontend zobrazí potvrdenie a vyprázdni formulár **iba v tomto prípade**):

```
HTTP 200 (alebo 201)
{ "ok": true, "id": "voliteľné-ID" }
```

Chyba (frontend ponechá údaje vo formulári):

```
HTTP 400 / 422 / 429 / 500
{
  "ok": false,
  "message": "Krátka správa pre používateľa (do 300 znakov, po slovensky).",
  "errors": { "email": "E-mail nemá správny tvar." }
}
```

`errors` je nepovinné; kľúče sú názvy polí z tabuľky a zobrazia sa priamo pri poliach.
Akákoľvek iná odpoveď (aj HTTP 200 bez `"ok": true`, ne-JSON, časový limit) sa berie ako neúspech.
Časový limit nastavuje `form.timeoutMs` (predvolene 15 s).

## Čo musí zabezpečiť server

1. **Validácia** všetkých polí znova na serveri (povinnosť, dĺžky, formát e-mailu, hodnoty `materials`). Frontendovej kontrole nedôverovať.
2. **Ochrana proti spamu:** zahodiť požiadavky s neprázdnym `companyWebsite` alebo s `elapsedMs` pod cca 3000 ms (odpovedať pokojne `{"ok": true}`, aby robot nezistil dôvod); obmedziť počet požiadaviek z jednej IP (rate limit); prípadne doplniť CAPTCHA bez sledovania.
3. **CORS:** povoliť iba finálnu doménu webu (`Access-Control-Allow-Origin: https://vasadomena.sk`), metódy `POST, OPTIONS`, hlavičku `Content-Type`.
4. **Doručenie alebo bezpečné uloženie:** odoslať prihlášku e-mailom prevádzkovateľovi alebo uložiť do zabezpečeného úložiska (HTTPS, prístup len pre prevádzkovateľa). Neuchovávať dlhšie, než uvádza stránka ochrany osobných údajov.
5. **Žiadne tajomstvá vo frontende:** API kľúče (napr. e-mailovej služby) patria iba na server.
6. **Logy** bez osobných údajov (nelogovať telo požiadavky).
7. Odpovedať do niekoľkých sekúnd; dlhé spracovanie (e-mail) robiť asynchrónne.

Vhodné riešenia: malá serverless funkcia (napr. Cloudflare Workers, Netlify Functions, Vercel) alebo overená služba na formuláre so sídlom v EÚ. Výber a jej uvedenie na stránke ochrany osobných údajov je súčasťou checklistu.

## Overenie po napojení

- prázdny formulár → chyby pri poliach, nič sa neodošle,
- správne vyplnený → prišiel e-mail / záznam, zobrazilo sa „Ďakujem, prihlášku som prijal.“,
- vypnutý server alebo chybná adresa → chybová správa, údaje ostali vyplnené,
- vyplnené pole `companyWebsite` (cez nástroje prehliadača) → nič nedoručené.
