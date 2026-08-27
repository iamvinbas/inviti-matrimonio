# Partecipazione di nozze digitale

Sito statico. Zero costi, zero backend. Si apre tirando il fiocco.
Ogni invitato riceve un link personalizzato: `.../?i=mario-e-anna`

## File

| File | A cosa serve |
|---|---|
| `index.html` | struttura della pagina |
| `assets/style.css` | grafica e animazioni |
| `assets/app.js` | logica (apertura busta, countdown, RSVP) |
| `assets/config.js` | **dati del matrimonio** — date, luoghi, IBAN, numero WhatsApp |
| `assets/invitati.js` | elenco invitati (generato) |
| `tools/invitati.csv` | **elenco invitati da compilare** |
| `tools/genera.mjs` | genera `invitati.js` + i link da inviare |
| `tools/link-generati.csv` | output: un link e un messaggio WhatsApp per ogni invitato |

## 1. Personalizzare il matrimonio

Modifica solo `assets/config.js` (nomi, data, chiesa, ristorante, programma,
dress code, IBAN, numero WhatsApp per le conferme).

## 2. Aggiungere gli invitati

Compila `tools/invitati.csv`:

```csv
saluto,nomi,posti,messaggio,telefono
Cari Mario e Anna,Mario & Anna,2,Non vediamo l'ora di ballare con voi.,393331112223
```

- `telefono`: prefisso internazionale senza `+` e senza spazi (es. `39333...`). Se vuoto, il link WhatsApp si apre senza destinatario.
- `messaggio`: opzionale, frase personale mostrata solo a quell'invitato.

Poi genera tutto:

```bash
node tools/genera.mjs "https://TUO-UTENTE.github.io/NOME-REPO/"
```

Trovi i link pronti in `tools/link-generati.csv`.

## 3. Pubblicare su GitHub Pages

```bash
git init && git add -A && git commit -m "Inviti di nozze"
git branch -M main
git remote add origin https://github.com/TUO-UTENTE/NOME-REPO.git
git push -u origin main
```

Poi su GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
Dopo 1-2 minuti il sito è online su `https://TUO-UTENTE.github.io/NOME-REPO/`.

## 4. Anteprima in locale

```bash
python3 -m http.server 4321
```

Apri `http://localhost:4321/?i=mario-e-anna`.

## Note

- Il repository **deve essere pubblico** perché GitHub Pages sia gratuito.
- I link non sono segreti: chi ha il link vede l'invito. Non mettere dati sensibili.
- L'IBAN è visibile a tutti gli invitati: valuta se lasciarlo (`regalo.iban: ""` lo nasconde).
- Per l'anteprima nelle chat, metti un'immagine `assets/preview.png` (1200×630).
