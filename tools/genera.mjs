#!/usr/bin/env node
/* ============================================================
   Genera i link personalizzati partendo da tools/invitati.csv

   Uso:  node tools/genera.mjs "https://iamvinbas.github.io/inviti-matrimonio/"

   I dati dell'invitato NON finiscono sul sito: vengono codificati
   dentro il link (parametro ?p=). Il repository resta pubblico ma
   non contiene nessun elenco di invitati.
   Chiavi compatte nel payload: s=saluto, n=nomi, o=posti, m=messaggio.
   ============================================================ */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const BASE = (process.argv[2] || "https://iamvinbas.github.io/inviti-matrimonio/").replace(/\/?$/, "/");

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

const righe = parseCSV(readFileSync(join(root, "tools/invitati.csv"), "utf8"));
const testa = righe.shift().map((h) => h.trim());
const col = (r, nome) => (r[testa.indexOf(nome)] ?? "").trim();

const invitati = righe.map((r) => ({
  saluto: col(r, "saluto"),
  nomi: col(r, "nomi"),
  posti: Number(col(r, "posti") || 0),
  messaggio: col(r, "messaggio"),
  telefono: col(r, "telefono").replace(/\D/g, "")
}));

/* --- codifica del payload --- */
function codifica(o) {
  const compatto = { s: o.saluto, n: o.nomi };
  if (o.posti) compatto.o = o.posti;
  if (o.messaggio) compatto.m = o.messaggio;
  return Buffer.from(JSON.stringify(compatto), "utf8").toString("base64url");
}

const esc = (s) => `"${String(s).replace(/"/g, '""')}"`;
const out = ["nomi,link,link_whatsapp"];

for (const o of invitati) {
  const link = `${BASE}?p=${codifica(o)}`;
  const msg = `Ciao! Abbiamo una cosa da farti vedere 💍\nTira il fiocco per aprire il nostro invito:\n${link}`;
  const wa = o.telefono
    ? `https://wa.me/${o.telefono}?text=${encodeURIComponent(msg)}`
    : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  out.push([esc(o.nomi), esc(link), esc(wa)].join(","));
}

writeFileSync(join(root, "tools/link-generati.csv"), out.join("\n") + "\n");

console.log(`✔ ${invitati.length} inviti generati → tools/link-generati.csv`);
console.log(`  base: ${BASE}`);
console.log(`  ATTENZIONE: invitati.csv e link-generati.csv restano solo in locale (.gitignore)\n`);
for (const o of invitati) {
  const link = `${BASE}?p=${codifica(o)}`;
  console.log(`  ${o.nomi.padEnd(22)} ${link.length} car.`);
  console.log(`  ${" ".repeat(22)} ${link}\n`);
}
