#!/usr/bin/env node
/* ============================================================
   Genera assets/invitati.js + tools/link-generati.csv
   partendo da tools/invitati.csv

   Uso:  node tools/genera.mjs "https://UTENTE.github.io/REPO/"
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] || "https://UTENTE.github.io/REPO/").replace(/\/?$/, "/");

/* --- parser CSV minimale con supporto virgolette --- */
function parseCSV(testo) {
  const righe = [];
  let campo = "", riga = [], q = false;
  for (let i = 0; i < testo.length; i++) {
    const c = testo[i];
    if (q) {
      if (c === '"' && testo[i + 1] === '"') { campo += '"'; i++; }
      else if (c === '"') q = false;
      else campo += c;
    } else if (c === '"') q = true;
    else if (c === ",") { riga.push(campo); campo = ""; }
    else if (c === "\n") { riga.push(campo); righe.push(riga); riga = []; campo = ""; }
    else if (c !== "\r") campo += c;
  }
  if (campo || riga.length) { riga.push(campo); righe.push(riga); }
  return righe.filter((r) => r.some((c) => c.trim() !== ""));
}

const slug = (s) => s.toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/&/g, "e").replace(/[^a-z0-9]+/g, "-")
  .replace(/^-|-$/g, "").slice(0, 28);

const righe = parseCSV(readFileSync(join(root, "tools/invitati.csv"), "utf8"));
const testa = righe.shift().map((h) => h.trim());
const col = (r, nome) => (r[testa.indexOf(nome)] ?? "").trim();

const visti = new Set();
const invitati = righe.map((r) => {
  let id = slug(col(r, "nomi") || col(r, "saluto"));
  let base = id, n = 2;
  while (visti.has(id)) id = `${base}-${n++}`;
  visti.add(id);
  return {
    id,
    saluto: col(r, "saluto"),
    nomi: col(r, "nomi"),
    posti: Number(col(r, "posti") || 0),
    messaggio: col(r, "messaggio"),
    telefono: col(r, "telefono")
  };
});

/* --- 1. assets/invitati.js --- */
const js = `/* GENERATO AUTOMATICAMENTE da tools/genera.mjs — non modificare a mano */
window.INVITATI = ${JSON.stringify(
  invitati.map(({ telefono, ...o }) => o), null, 2
)};

window.INVITO_DEFAULT = { id: "", saluto: "Gentili ospiti", nomi: "", posti: 0, messaggio: "" };
`;
writeFileSync(join(root, "assets/invitati.js"), js);

/* --- 2. CSV con link + messaggio WhatsApp pronto --- */
const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
const out = ["nomi,link,link_whatsapp"];
for (const o of invitati) {
  const link = `${BASE}?i=${o.id}`;
  const msg = `Ciao! Abbiamo una cosa da farti vedere 💍\nTira il fiocco per aprire il nostro invito:\n${link}`;
  const wa = o.telefono
    ? `https://wa.me/${o.telefono}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  out.push([esc(o.nomi), esc(link), esc(wa)].join(","));
}
writeFileSync(join(root, "tools/link-generati.csv"), out.join("\n") + "\n");

console.log(`✔ ${invitati.length} inviti generati`);
console.log(`  → assets/invitati.js`);
console.log(`  → tools/link-generati.csv  (base: ${BASE})`);
invitati.forEach((o) => console.log(`    ${o.nomi.padEnd(24)} ${BASE}?i=${o.id}`));
