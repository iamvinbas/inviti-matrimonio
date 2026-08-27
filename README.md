# Partecipazione di nozze digitale

Sito statico su GitHub Pages. Zero costi, zero backend.
Si apre tirando il fiocco. Ogni invitato riceve un link personalizzato.

**Online:** https://iamvinbas.github.io/inviti-matrimonio/

## Privacy: come funziona la personalizzazione

Il repository è pubblico (serve per avere GitHub Pages gratis), quindi
**l'elenco degli invitati non viene mai committato**. I dati di ciascun
invitato viaggiano dentro il link, nel parametro `?p=`, come JSON in base64url:

```
https://iamvinbas.github.io/inviti-matrimonio/?p=eyJzIjoiQ2FyYSBGYW1pZ2xpYSBFc3Bvc2l0byIsIm4iOiJGYW1pZ2xpYSBFc3Bvc2l0byIsIm8iOjR9
```

Conseguenze:

- Sul sito **non esiste nessun elenco scaricabile**: niente da enumerare.
- Un codice inventato o storpiato non si decodifica → l'invito si apre in versione generica ("Gentili ospiti"). Nessuno finisce sull'invito di un altro.
- `tools/invitati.csv` e `tools/link-generati.csv` sono in `.gitignore`: restano solo sul tuo computer. **Fanne un backup**, perché non sono su GitHub.
- Il link non è cifrato: chi lo riceve può decodificarlo e leggere il proprio nome. È irrilevante — sono i suoi dati. Non metterci nulla che quell'invitato non debba vedere.

## File

| File | A cosa serve |
|---|---|
| `index.html` | struttura della pagina |
| `assets/style.css` | grafica e animazioni |
| `assets/app.js` | logica (apertura busta, countdown, RSVP) |
| `assets/config.js` | **dati del matrimonio** — date, luoghi, IBAN, numero WhatsApp |
| `tools/invitati.csv` | **elenco invitati** (privato, non su GitHub) |
| `tools/genera.mjs` | genera i link personalizzati |
| `tools/link-generati.csv` | output: link + messaggio WhatsApp per ogni invitato (privato) |

## 1. Dati del matrimonio

Modifica **solo** `assets/config.js`: nomi, data, chiesa, ristorante, programma,
dress code, IBAN, numero WhatsApp per le conferme.

I nomi scritti in `index.html` sono segnaposto: `app.js` li sovrascrive
leggendo da `config.js`. Cambiarli nell'HTML non serve a niente.

## 2. Invitati

Compila `tools/invitati.csv`:

```csv
saluto,nomi,posti,messaggio,telefono
Cari Mario e Anna,Mario & Anna,2,Non vediamo l'ora di ballare con voi.,393331112223
```

- `telefono`: prefisso internazionale senza `+` e senza spazi. Se vuoto, il link WhatsApp si apre senza destinatario.
- `messaggio`: opzionale, frase personale mostrata solo a quell'invitato.
- se il testo contiene una virgola, mettilo tra virgolette: `"Cari Mario, Anna e famiglia"`.

Poi:

```bash
node tools/genera.mjs "https://iamvinbas.github.io/inviti-matrimonio/"
```

I link pronti finiscono in `tools/link-generati.csv`. La colonna `link_whatsapp`
si apre già con il messaggio scritto e il destinatario giusto.

## 3. Pubblicare gli aggiornamenti

```bash
git add -A && git commit -m "aggiorna dati" && git push
```

GitHub Pages ricostruisce in circa un minuto.

**Se modifichi CSS o JS**, alza di 1 il numero `?v=` nei tag di `index.html`
(`?v=4` → `?v=5`): GitHub Pages serve gli asset con `cache-control: max-age=600`,
senza il cambio di versione gli invitati vedrebbero la vecchia copia per 10 minuti.

## 4. Anteprima in locale

```bash
python3 -m http.server 4321
```

Apri uno dei link di `tools/link-generati.csv` sostituendo il dominio con `http://localhost:4321`.

## Note

- Il repository **deve restare pubblico** perché GitHub Pages sia gratuito sul piano Free.
- L'IBAN in `config.js` è visibile a chiunque apra un invito. `regalo.iban: ""` nasconde la sezione.
- Per l'anteprima nelle chat, aggiungi un'immagine `assets/preview.png` (1200×630).
