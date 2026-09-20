/* ============================================================
   CONFIG — dati fissi del matrimonio (uguali per tutti)
   Modifica SOLO questo file per aggiornare data, luoghi, ecc.
   ============================================================ */
window.WEDDING = {
  /* Palette colori. Valori possibili:
     "verde-oro"   verde notte + oro (originale)
     "salvia"      verde salvia + avorio
     "blu-polvere" blu polvere + navy
     "bordeaux"    bordeaux + cipria
     "terracotta"  terracotta + sabbia
     "blu-notte"   blu notte + argento
     "champagne"   bianco Cloud Dancer + champagne
     "prugna"      prugna + lilla
     "oliva"       verde oliva + giallo burro
     Per provarle senza toccare questo file: aggiungi ?tema=nome al link. */
  tema: "oliva",

  sposa: "Tiziana",
  sposo: "Gaetano",
  // Data/ora inizio cerimonia in formato ISO (fuso Italia)
  dataISO: "2027-07-02T16:30:00+02:00",
  dataTesto: "Venerdì 2 luglio 2027",
  oraTesto: "ore 16:30",
  dataBreve: "02 · 07 · 2027", // mostrata sul biglietto dentro la busta

  cerimonia: {
    titolo: "La cerimonia",
    ora: "16:30",
    luogo: "Duomo S. Corrado",
    indirizzo: "Via Chiesa Vecchia, 70056 Molfetta (BA)",
    maps: "https://www.google.com/maps/search/?api=1&query=Duomo+San+Corrado%2C+Via+Chiesa+Vecchia%2C+Molfetta",
  },
  ricevimento: {
    titolo: "Il ricevimento",
    ora: "18:30",
    luogo: "Villa Ciardi",
    indirizzo: "Via Sant'Andrea 210/208/206, 76011 Bisceglie (BT)",
    maps: "https://www.google.com/maps/search/?api=1&query=Villa+Ciardi%2C+Via+Sant%27Andrea+210%2F208%2F206%2C+Bisceglie",
  },

  programma: [
    {
      ora: "16:30",
      titolo: "Cerimonia",
      nota: "Duomo S. Corrado",
    },
    {
      ora: "18:30",
      titolo: "Ricevimento",
      nota: "Villa Ciardi",
    },
    { ora: "20:00", titolo: "Cena", nota: "Villa Ciardi" },
  ],

  dressCode: "Elegante — formale",

  // RSVP: numero WhatsApp in formato internazionale SENZA + e senza spazi
  // Vuoto = WhatsApp si apre senza destinatario (sicuro per la bozza).
  // Metti qui il numero vero prima di inviare gli inviti: prefisso senza + ne spazi, es. "393401234567"
  rsvpWhatsApp: "393408213056",
  rsvpEntro: "",

  // Lista nozze / IBAN (opzionale: metti "" per nascondere la sezione)
  regalo: {
    testo:
      "La vostra presenza sarà per noi il dono più prezioso. Se desiderate accompagnarci anche con un pensiero, un contributo per il nostro futuro sarà accolto con grande gratitudine.",
    iban: "IT000000000",
    causale: "Matrimonio Gaetano Tiziana",
    intestatario: "Gaetano e Tiziana",
    listaViaggi: {
      nome: "Roilen Viaggi",
      indirizzo: "Piazza Vittorio Emanuele, 6, 70056 Molfetta (BA)",
      link: "",
      maps: "https://www.google.com/maps/search/?api=1&query=Roilen+Viaggi%2C+Piazza+Vittorio+Emanuele+6%2C+Molfetta",
    },
  },

  canzone: {
    titolo: "Young and Beautiful",
    artista: "Lana Del Rey",
    link: "https://open.spotify.com/track/2nMeu6UenVvwUktBCpLMK9",
    // Inserire qui il percorso di un file audio ottenuto legalmente.
    audio: "assets/Lana Del Rey - Young and Beautiful_320k.mp3",
    inizio: 13,
  },
  // Percorso relativo della foto del brindisi, da inserire quando sarà disponibile.
  fotoBrindisi: "",

  hashtag: "#Gaetano&Tiziana2027",

  /* Firma di chi ha realizzato l'invito. Per toglierla: autore: null
     whatsapp/email vuoti = non mostrati. WhatsApp = prefisso senza + ne spazi. */
  autore: {
    testo: "Invito realizzato da",
    nome: "Vincenzo Basile",
    linkedin: "https://www.linkedin.com/in/basile-vincenzo/",
    instagram: "https://www.instagram.com/basile_vinc3nzo/",
    email: "enzobasile05@gmail.com",
    whatsapp: "",
  },
};
