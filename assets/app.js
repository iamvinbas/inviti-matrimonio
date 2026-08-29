/* =========================================================
   Partecipazione di nozze — logica
   ========================================================= */
(() => {
  "use strict";
  const W = window.WEDDING;
  const $ = (s) => document.querySelector(s);

  /* ---------- 1. Chi sta guardando l'invito ----------
     I dati dell'invitato NON stanno sul sito: viaggiano dentro il link,
     nel parametro ?p=, come JSON compresso in base64url.
     Cosi' non esiste nessun elenco scaricabile e nessun codice da indovinare:
     una stringa inventata non si decodifica e mostra l'invito generico.
     Chiavi compatte: s=saluto, n=nomi, o=posti, m=messaggio.       */
  const GENERICO = { saluto: "Gentili ospiti", nomi: "", posti: 0, messaggio: "" };

  function leggiOspite() {
    const p = new URLSearchParams(location.search).get("p");
    if (!p) return { ...GENERICO };
    try {
      const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
      const bin = atob(b64.padEnd(Math.ceil(b64.length / 4) * 4, "="));
      const byte = Uint8Array.from(bin, (c) => c.charCodeAt(0));
      const d = JSON.parse(new TextDecoder().decode(byte));
      if (!d || typeof d !== "object") return { ...GENERICO };
      return {
        saluto: String(d.s || GENERICO.saluto),
        nomi: String(d.n || ""),
        posti: Number(d.o) || 0,
        messaggio: String(d.m || "")
      };
    } catch (e) {
      return { ...GENERICO };   // link storpiato o inventato
    }
  }

  const ospite = leggiOspite();

  /* ---------- 2. Riempimento contenuti ---------- */
  const dataEvento = new Date(W.dataISO);

  function testo(sel, val) { const el = $(sel); if (el) el.textContent = val; }

  // Ordine di visualizzazione: uomo prima, poi donna (richiesta esplicita).
  testo("#nomeSposa", W.sposa);
  testo("#nomeSposo", W.sposo);
  testo("#cardNomiSposi", `${W.sposo} & ${W.sposa}`);
  testo("#firmaSposi", `${W.sposo} & ${W.sposa}`);
  testo("#cardData", W.dataBreve || W.dataTesto);
  testo("#dataTesto", W.dataTesto);
  testo("#oraTesto", W.oraTesto);
  testo("#salutoTop", ospite.saluto);
  // Dress code: sezione sospesa (vedi index.html). W.dressCode resta in config.js.
  // testo("#dressCode", W.dressCode);
  testo("#rsvpEntro", W.rsvpEntro);
  testo("#hashtag", W.hashtag || "");
  document.title = ospite.nomi ? `${ospite.nomi} — Partecipazione di Nozze` : "Partecipazione di Nozze";

  if (ospite.posti > 0) {
    const p = $("#posti");
    p.hidden = false;
    p.textContent = ospite.posti === 1
      ? "Invito riservato a 1 persona"
      : `Invito riservato a ${ospite.posti} persone`;
  }
  if (ospite.messaggio) {
    const m = $("#msgPersonale");
    m.hidden = false;
    m.textContent = "« " + ospite.messaggio + " »";
  }

  // Luoghi
  const luogoHTML = (l) => `
    <p class="ora">${l.ora}</p>
    <h4>${l.titolo}</h4>
    <p class="ind">${l.luogo}<br>${l.indirizzo}</p>
    <a class="btn-ghost" href="${l.maps}" target="_blank" rel="noopener">Apri in mappe</a>`;
  $("#luogoCerimonia").innerHTML = luogoHTML(W.cerimonia);
  $("#luogoRicevimento").innerHTML = luogoHTML(W.ricevimento);

  // Programma: sezione sospesa (vedi index.html). W.programma resta in config.js.
  // $("#timeline").innerHTML = W.programma.map((t) => `
  //   <li><span class="tl-ora">${t.ora}</span>
  //     <span><span class="tl-tit">${t.titolo}</span>
  //     ${t.nota ? `<span class="tl-nota">${t.nota}</span>` : ""}</span></li>`).join("");

  // Regalo
  if (W.regalo && W.regalo.iban) {
    testo("#regaloTesto", W.regalo.testo);
    testo("#regaloIban", W.regalo.iban);
    testo("#regaloIntestatario", W.regalo.intestatario);
  } else {
    $("#regaloBox").remove();
  }

  /* ---------- 3. RSVP via WhatsApp ---------- */
  const chi = ospite.nomi || "";
  const rsvp = (risposta) => {
    const txt =
      `Ciao! Rispondo alla partecipazione di ${W.sposo} e ${W.sposa}.\n` +
      (chi ? `Sono: ${chi}\n` : "") +
      `Risposta: ${risposta}` +
      (ospite.posti > 1 ? `\nPersone: ___ / ${ospite.posti}` : "");
    return `https://wa.me/${W.rsvpWhatsApp}?text=${encodeURIComponent(txt)}`;
  };
  $("#btnSi").href = rsvp("CI SARÒ ✅");
  $("#btnNo").href = rsvp("Purtroppo non potrò esserci");
  $("#btnSi").target = $("#btnNo").target = "_blank";
  $("#btnSi").rel = $("#btnNo").rel = "noopener";

  /* ---------- 4. Countdown ---------- */
  const cdBox = $("#countdown");
  const celle = [["Giorni", 0], ["Ore", 0], ["Minuti", 0], ["Secondi", 0]];
  cdBox.innerHTML = celle.map(([l]) =>
    `<div class="cd-cella"><span class="cd-num">--</span><span class="cd-lab">${l}</span></div>`).join("");
  const nums = cdBox.querySelectorAll(".cd-num");
  function tick() {
    let d = dataEvento - Date.now();
    if (d <= 0) { $("#countdownBox").innerHTML = '<h3 class="titolo">È il giorno giusto</h3>'; return; }
    d = Math.floor(d / 1000);
    const v = [Math.floor(d / 86400), Math.floor(d / 3600) % 24, Math.floor(d / 60) % 60, d % 60];
    v.forEach((x, i) => { nums[i].textContent = String(x).padStart(2, "0"); });
    setTimeout(tick, 1000);
  }
  tick();

  /* ---------- 5. Calendario (.ics) ---------- */
  $("#btnCal").addEventListener("click", () => {
    const fine = new Date(dataEvento.getTime() + 8 * 3600 * 1000);
    const fmt = (dt) => dt.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//invito//IT",
      "BEGIN:VEVENT",
      "UID:" + Date.now() + "@invito",
      "DTSTAMP:" + fmt(new Date()),
      "DTSTART:" + fmt(dataEvento),
      "DTEND:" + fmt(fine),
      `SUMMARY:Matrimonio di ${W.sposo} e ${W.sposa}`,
      `LOCATION:${W.cerimonia.luogo}\\, ${W.cerimonia.indirizzo}`,
      `DESCRIPTION:${W.cerimonia.ora} cerimonia — ${W.ricevimento.ora} ricevimento a ${W.ricevimento.luogo}`,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = "matrimonio.ics"; a.click();
    URL.revokeObjectURL(url);
    toast("Evento scaricato");
  });

  /* ---------- 6. Copia IBAN ---------- */
  const btnIban = $("#copiaIban");
  if (btnIban) btnIban.addEventListener("click", () => { copia(W.regalo.iban); toast("IBAN copiato"); });

  function copia(t) {
    if (navigator.clipboard) navigator.clipboard.writeText(t).catch(() => {});
  }
  let toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add("su");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove("su"), 2200);
  }

  /* ---------- 7. Apertura busta ---------- */
  const envelope = $("#envelope");
  const sigillo = $("#sigillo");
  const scena = $("#scena-busta");
  const invito = $("#invito");
  let aperto = false;

  // Iniziali sul sigillo di ceralacca e nome sotto la busta: dal nome, non a mano.
  const iniziale = (n) => (n || "").trim().charAt(0).toUpperCase();
  testo("#sigilloIniziali", `${iniziale(W.sposo)}&${iniziale(W.sposa)}`);
  testo("#bustaNomi", `${W.sposo} & ${W.sposa}`);

  function apri() {
    if (aperto) return;
    aperto = true;
    scena.classList.add("si-apre");
    envelope.classList.add("slegata");
    setTimeout(() => envelope.classList.add("aperta"), 550);
    setTimeout(() => {
      scena.classList.add("via");
      invito.hidden = false;
      document.body.classList.remove("no-scroll");
      requestAnimationFrame(() => invito.classList.add("dentro"));
      petali();
      setTimeout(() => { scena.style.display = "none"; }, 1000);
    }, 2300);
  }

  document.body.classList.add("no-scroll");
  sigillo.addEventListener("click", apri);
  $("#bustaCta").addEventListener("click", apri);

  /* ---------- 8. Comparsa sezioni allo scroll ---------- */
  const io = new IntersectionObserver((voci) => {
    voci.forEach((v) => { if (v.isIntersecting) { v.target.classList.add("visto"); io.unobserve(v.target); } });
  }, { threshold: 0.18 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- 9. Firma dell'autore ---------- */
  (function credito() {
    const a = W.autore;
    if (!a || !a.nome) return;

    const icone = {
      linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1-.02 5 2.5 2.5 0 0 1 .02-5zM3 9h4v12H3V9zm6.5 0h3.8v1.64h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.8c0-1.38-.03-3.17-1.97-3.17-1.97 0-2.27 1.5-2.27 3.06V21h-4V9z"/></svg>',
      instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none"/></svg>',
      whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.5-.6c.1-.2.1-.3 0-.5l-.7-1.7c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.7.7-1 1.6-.9 2.5.3 1.6 1.2 3 2.6 4.2 1.6 1.4 3.3 2.1 4.4 2.1.8 0 1.6-.3 2.2-.9.2-.3.3-.6.3-.9v-.5c0-.2-.1-.3-.3-.4z"/></svg>',
      email: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M3 7l9 6 9-6"/></svg>'
    };

    const link = [];
    if (a.linkedin) link.push(["LinkedIn", a.linkedin, icone.linkedin]);
    if (a.instagram) link.push(["Instagram", a.instagram, icone.instagram]);
    if (a.whatsapp) link.push(["WhatsApp", "https://wa.me/" + a.whatsapp, icone.whatsapp]);
    if (a.email) link.push(["Email", "mailto:" + a.email, icone.email]);

    const el = $("#credito");
    el.innerHTML =
      `<p class="credito-testo">${a.testo || "Realizzato da"}<br><strong>${a.nome}</strong></p>` +
      (link.length
        ? `<div class="credito-link">${link.map(([n, u, i]) =>
            `<a href="${u}" target="_blank" rel="noopener noreferrer" aria-label="${n}" title="${n}">${i}</a>`).join("")}</div>`
        : "");
    el.hidden = false;
  })();

  /* ---------- 10. Petali dorati ---------- */
  function petali() {
    const c = $("#petals"), x = c.getContext("2d");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w, h, p = [];
    const ridimensiona = () => {
      w = c.width = innerWidth * devicePixelRatio;
      h = c.height = innerHeight * devicePixelRatio;
      c.style.width = innerWidth + "px"; c.style.height = innerHeight + "px";
    };
    ridimensiona(); addEventListener("resize", ridimensiona);
    for (let i = 0; i < 18; i++) {
      p.push({ x: Math.random() * w, y: Math.random() * h, r: (2 + Math.random() * 3) * devicePixelRatio,
               vy: (.25 + Math.random() * .55) * devicePixelRatio, a: Math.random() * 6.28,
               va: (Math.random() - .5) * .02, o: .10 + Math.random() * .16 });
    }
    c.classList.add("on");
    (function loop() {
      x.clearRect(0, 0, w, h);
      p.forEach((s) => {
        s.y += s.vy; s.a += s.va; s.x += Math.sin(s.a) * .4 * devicePixelRatio;
        if (s.y - s.r > h) { s.y = -s.r; s.x = Math.random() * w; }
        x.save(); x.translate(s.x, s.y); x.rotate(s.a);
        x.fillStyle = `rgba(227,200,111,${s.o})`;
        x.beginPath(); x.ellipse(0, 0, s.r, s.r * .55, 0, 0, 6.283); x.fill();
        x.restore();
      });
      requestAnimationFrame(loop);
    })();
  }
})();
