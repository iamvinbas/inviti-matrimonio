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
| `tools/pubblica.sh` | pubblica su GitHub Pages gestendo la cache |
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
./tools/pubblica.sh "aggiorna i luoghi"
```

Lo script alza il numero `?v=` in `index.html`, fa commit e push, poi aspetta
che il deploy sia davvero online e lo verifica.

### La cache dei 10 minuti

GitHub Pages serve **ogni** file con `cache-control: max-age=600` e non permette
di cambiare gli header. Conseguenze pratiche:

- Dopo un push, il tuo browser può mostrare ancora la versione vecchia fino a
  10 minuti: **il push è andato bene lo stesso**. Non rifare le modifiche.
- Per verificare subito, apri il link con un parametro qualunque in fondo
  (`?cb=123`): è un URL nuovo, quindi non è in cache. `pubblica.sh` te ne
  stampa uno pronto. In alternativa Cmd+Shift+R.
- **Gli invitati non hanno questo problema**: il loro link `?p=...` è unico,
  alla prima apertura scaricano sempre la versione aggiornata.

Il passaggio sul `?v=` serve comunque: garantisce che, quando l'HTML si
aggiorna, CSS e JS si aggiornino nello stesso momento invece di restare
disallineati (HTML nuovo con JS vecchio).

A mano sarebbe:

```bash
# alza ?v=N in index.html, poi
git add -A && git commit -m "aggiorna dati" && git push
```

## 4. Anteprima in locale

```bash
python3 -m http.server 4321
```

Apri uno dei link di `tools/link-generati.csv` sostituendo il dominio con `http://localhost:4321`.

## Note

- Il repository **deve restare pubblico** perché GitHub Pages sia gratuito sul piano Free.
- L'IBAN in `config.js` è visibile a chiunque apra un invito. `regalo.iban: ""` nasconde la sezione.
- Per l'anteprima nelle chat, aggiungi un'immagine `assets/preview.png` (1200×630).
