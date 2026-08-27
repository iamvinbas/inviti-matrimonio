/* =========================================================
   Partecipazione di nozze — logica
   ========================================================= */
(() => {
  "use strict";
  const W = window.WEDDING;
  const $ = (s) => document.querySelector(s);

  /* ---------- 1. Chi sta guardando l'invito ---------- */
  const params = new URLSearchParams(location.search);
  const id = (params.get("i") || "").trim().toLowerCase();
  const nomeLibero = (params.get("n") || "").trim();

  let ospite = (window.INVITATI || []).find((o) => o.id.toLowerCase() === id);
  if (!ospite) {
    ospite = { ...window.INVITO_DEFAULT };
    if (nomeLibero) {
      ospite.saluto = "Cari " + nomeLibero;
      ospite.nomi = nomeLibero;
    }
  }

  /* ---------- 2. Riempimento contenuti ---------- */
  const dataEvento = new Date(W.dataISO);

  function testo(sel, val) { const el = $(sel); if (el) el.textContent = val; }

  testo("#nomeSposa", W.sposa);
  testo("#nomeSposo", W.sposo);
  testo("#cardNomiSposi", `${W.sposa} & ${W.sposo}`);
  testo("#firmaSposi", `${W.sposa} & ${W.sposo}`);
  testo("#cardData", W.dataBreve || W.dataTesto);
  testo("#dataTesto", W.dataTesto);
  testo("#oraTesto", W.oraTesto);
  testo("#salutoTop", ospite.saluto);
  testo("#dressCode", W.dressCode);
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

  // Programma
  $("#timeline").innerHTML = W.programma.map((t) => `
    <li><span class="tl-ora">${t.ora}</span>
      <span><span class="tl-tit">${t.titolo}</span>
      ${t.nota ? `<span class="tl-nota">${t.nota}</span>` : ""}</span></li>`).join("");

  // Regalo
  if (W.regalo && W.regalo.iban) {
    testo("#regaloTesto", W.regalo.testo);
    testo("#regaloIban", W.regalo.iban);
    testo("#regaloIntestatario", W.regalo.intestatario);
  } else {
    $("#regaloBox").remove();
  }

  /* ---------- 3. RSVP via WhatsApp ---------- */
  const chi = ospite.nomi || nomeLibero || "";
  const rsvp = (risposta) => {
    const txt =
      `Ciao! Rispondo alla partecipazione di ${W.sposa} e ${W.sposo}.\n` +
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
      `SUMMARY:Matrimonio di ${W.sposa} e ${W.sposo}`,
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

  /* ---------- 6. Condividi + copia IBAN ---------- */
  $("#btnShare").addEventListener("click", async () => {
    const dati = { title: `Matrimonio di ${W.sposa} e ${W.sposo}`, text: "Ti invitiamo!", url: location.href };
    if (navigator.share) { try { await navigator.share(dati); } catch (e) { /* annullato */ } }
    else { copia(location.href); toast("Link copiato"); }
  });
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
  const bow = $("#bow");
  const scena = $("#scena-busta");
  const invito = $("#invito");
  let aperto = false;

  function apri() {
    if (aperto) return;
    aperto = true;
    $("#hint").classList.add("via");
    $("#occhiello").classList.add("via");
    envelope.classList.add("slegata");
    setTimeout(() => envelope.classList.add("aperta"), 820);
    setTimeout(() => {
      scena.classList.add("via");
      invito.hidden = false;
      document.body.classList.remove("no-scroll");
      requestAnimationFrame(() => invito.classList.add("dentro"));
      petali();
      setTimeout(() => { scena.style.display = "none"; }, 1000);
    }, 2500);
  }

  document.body.classList.add("no-scroll");
  bow.addEventListener("click", apri);
  envelope.addEventListener("click", (e) => { if (!aperto && e.target.closest(".env-flap,.env-front")) apri(); });

  // trascinamento del fiocco verso il basso
  let y0 = null;
  bow.addEventListener("pointerdown", (e) => { y0 = e.clientY; bow.setPointerCapture(e.pointerId); });
  bow.addEventListener("pointermove", (e) => {
    if (y0 === null || aperto) return;
    const dy = Math.max(0, e.clientY - y0);
    if (dy > 55) { y0 = null; apri(); return; }
    bow.style.transform = `translate(-50%, calc(-50% + ${dy * 0.6}px))`;
    envelope.classList.toggle("pop", dy > 12);
  });
  const rilascia = () => {
    if (y0 !== null && !aperto) { bow.style.transform = ""; envelope.classList.remove("pop"); }
    y0 = null;
  };
  bow.addEventListener("pointerup", rilascia);
  bow.addEventListener("pointercancel", rilascia);

  /* ---------- 8. Comparsa sezioni allo scroll ---------- */
  const io = new IntersectionObserver((voci) => {
    voci.forEach((v) => { if (v.isIntersecting) { v.target.classList.add("visto"); io.unobserve(v.target); } });
  }, { threshold: 0.18 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- 9. Petali dorati ---------- */
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
