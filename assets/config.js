/* ============================================================
   CONFIG — dati fissi del matrimonio (uguali per tutti)
   Modifica SOLO questo file per aggiornare data, luoghi, ecc.
   ============================================================ */
window.WEDDING = {
  sposa: "Giulia",
  sposo: "Marco",
  // Data/ora inizio cerimonia in formato ISO (fuso Italia)
  dataISO: "2027-06-12T16:30:00+02:00",
  dataTesto: "Sabato 12 Giugno 2027",
  oraTesto: "ore 16:30",
  dataBreve: "12 · 06 · 2027",   // mostrata sul biglietto dentro la busta

  cerimonia: {
    titolo: "La Cerimonia",
    ora: "16:30",
    luogo: "Chiesa di Santa Maria Assunta",
    indirizzo: "Piazza del Duomo 1, Napoli",
    maps: "https://maps.google.com/?q=Chiesa+di+Santa+Maria+Assunta+Napoli"
  },
  ricevimento: {
    titolo: "Il Ricevimento",
    ora: "18:30",
    luogo: "Villa Bellavista",
    indirizzo: "Via Panoramica 22, Sorrento",
    maps: "https://maps.google.com/?q=Villa+Bellavista+Sorrento"
  },

  programma: [
    { ora: "16:30", titolo: "Cerimonia", nota: "Chiesa di Santa Maria Assunta" },
    { ora: "18:30", titolo: "Aperitivo di benvenuto", nota: "Giardino di Villa Bellavista" },
    { ora: "20:00", titolo: "Cena", nota: "Sala degli Ulivi" },
    { ora: "23:00", titolo: "Taglio della torta e festa", nota: "Terrazza" }
  ],

  dressCode: "Elegante — formale",

  // RSVP: numero WhatsApp in formato internazionale SENZA + e senza spazi
  rsvpWhatsApp: "393331234567",
  rsvpEntro: "30 Aprile 2027",

  // Lista nozze / IBAN (opzionale: metti "" per nascondere la sezione)
  regalo: {
    testo: "Il vostro affetto è il regalo più grande. Se desiderate contribuire al nostro viaggio di nozze:",
    iban: "IT00 X000 0000 0000 0000 0000 000",
    intestatario: "Giulia Rossi e Marco Bianchi"
  },

  hashtag: "#GiuliaEMarco2027"
};
