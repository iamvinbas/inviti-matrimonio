/* =========================================================
   Decori floreali "in rilievo" della busta
   Uso:  node tools/decori-busta.mjs   ->  scrive assets/decori/*.svg

   Gli SVG servono SOLO come maschere (mask-image in style.css): conta
   la forma, non il colore. Carta, rilievo e luce dorata li disegna il CSS
   con le variabili del tema, cosi' funzionano con tutte le palette.
   Dentro la maschera: bianco = carta in rilievo, nero = solco.
   ========================================================= */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "assets", "decori");
const n = (v) => +v.toFixed(2);
const deg = (r) => (r * 180) / Math.PI;

/* ---------- primitive: ogni funzione aggiunge forme in ordine di pittura ---------- */
function disegno() {
  const out = [];
  const pieno = (d, t = "") => out.push(`<path${t} d="${d}" fill="#fff"/>`);
  const solco = (d, w, t = "") => out.push(`<path${t} d="${d}" fill="none" stroke="#000" stroke-width="${n(w)}"/>`);
  const alone = (d, w, t = "") => out.push(`<path${t} d="${d}" fill="#000" stroke="#000" stroke-width="${n(w)}"/>`);
  const tr = (x, y, a = 0) => ` transform="translate(${n(x)} ${n(y)})${a ? ` rotate(${n(a)})` : ""}"`;
  const cerchio = (r) => `M${n(-r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0Z`;

  const api = {
    out,
    // gambo: stroke bianco
    gambo(d, w = 1.6) { out.push(`<path d="${d}" fill="none" stroke="#fff" stroke-width="${n(w)}"/>`); },
    // foglia con nervatura; a=0 punta in su
    foglia(x, y, a, l, w) {
      const d = `M0 0C${n(w)} ${n(-l * .22)} ${n(w * .92)} ${n(-l * .7)} 0 ${n(-l)}C${n(-w * .92)} ${n(-l * .7)} ${n(-w)} ${n(-l * .22)} 0 0Z`;
      alone(d, 1.1, tr(x, y, a));
      pieno(d, tr(x, y, a));
      solco(`M0 ${n(-l * .1)}Q${n(w * .14)} ${n(-l * .5)} 0 ${n(-l * .84)}`, Math.max(.45, w * .13), tr(x, y, a));
    },
    // fiore a cinque petali
    fiore(x, y, r, rot = 0) {
      const p = `M0 0C${n(r * .58)} ${n(-r * .22)} ${n(r * .52)} ${n(-r * .96)} 0 ${n(-r)}C${n(-r * .52)} ${n(-r * .96)} ${n(-r * .58)} ${n(-r * .22)} 0 0Z`;
      for (let i = 0; i < 5; i++) { alone(p, 1.1, tr(x, y, rot + i * 72)); pieno(p, tr(x, y, rot + i * 72)); }
      alone(cerchio(r * .24), .9, tr(x, y));
      pieno(cerchio(r * .2), tr(x, y));
      solco(cerchio(r * .1), .6, tr(x, y));
    },
    // rosa: due corone di petali tondi e una spirale incisa al centro
    rosa(x, y, r) {
      const corona = (k, dist, pr, rot) => {
        for (let i = 0; i < k; i++) {
          const a = (rot + (i * 360) / k) * Math.PI / 180;
          const px = x + Math.sin(a) * dist, py = y - Math.cos(a) * dist;
          alone(cerchio(pr), 1.2, tr(px, py));
          pieno(cerchio(pr), tr(px, py));
        }
      };
      corona(8, r * .66, r * .38, 0);
      corona(6, r * .4, r * .32, 30);
      alone(cerchio(r * .34), 1.2, tr(x, y));
      pieno(cerchio(r * .34), tr(x, y));
      solco(`M${n(r * .05)} ${n(-r * .02)}a${n(r * .08)} ${n(r * .08)} 0 1 1 ${n(-r * .1)} ${n(r * .08)}a${n(r * .16)} ${n(r * .16)} 0 1 1 ${n(r * .26)} ${n(-r * .08)}a${n(r * .25)} ${n(r * .24)} 0 0 1 ${n(-r * .2)} ${n(r * .3)}`, .8, tr(x, y));
    },
    // bocciolo a goccia con due sepali
    bocciolo(x, y, a, s) {
      const d = `M0 0C${n(s * .42)} ${n(-s * .3)} ${n(s * .3)} ${n(-s * .85)} 0 ${n(-s)}C${n(-s * .3)} ${n(-s * .85)} ${n(-s * .42)} ${n(-s * .3)} 0 0Z`;
      alone(d, 1, tr(x, y, a)); pieno(d, tr(x, y, a));
      api.foglia(x, y, a - 32, s * .55, s * .16);
      api.foglia(x, y, a + 32, s * .55, s * .16);
    },
    bacche(x, y, r, k = 3, rot = 0) {
      for (let i = 0; i < k; i++) {
        const a = (rot + i * (360 / k)) * Math.PI / 180;
        const px = x + Math.sin(a) * r * 2.1, py = y - Math.cos(a) * r * 2.1;
        alone(cerchio(r), .8, tr(px, py)); pieno(cerchio(r), tr(px, py));
      }
    },
    viticcio(x, y, s, verso = 1) {
      out.push(`<path d="M${n(x)} ${n(y)}c${n(verso * s * .5)} ${n(-s * .2)} ${n(verso * s * .9)} ${n(-s * .7)} ${n(verso * s * .5)} ${n(-s)}c${n(-verso * s * .3)} ${n(-s * .2)} ${n(-verso * s * .5)} ${n(s * .1)} ${n(-verso * s * .25)} ${n(s * .25)}" fill="none" stroke="#fff" stroke-width=".9"/>`);
    },
    // ramo su una cubica: gambo + foglie alternate che rimpiccioliscono verso la punta
    ramo(P, { foglie = 6, l0 = 14, w0 = 5, da = .18, angolo = 52, punta = "foglia", gw = 1.5 } = {}) {
      const [a, b, c, d] = P;
      api.gambo(`M${a[0]} ${a[1]}C${b[0]} ${b[1]} ${c[0]} ${c[1]} ${d[0]} ${d[1]}`, gw);
      const pt = (t) => {
        const u = 1 - t;
        return [0, 1].map((i) => u * u * u * a[i] + 3 * u * u * t * b[i] + 3 * u * t * t * c[i] + t * t * t * d[i]);
      };
      const tg = (t) => {
        const u = 1 - t;
        return [0, 1].map((i) => 3 * u * u * (b[i] - a[i]) + 6 * u * t * (c[i] - b[i]) + 3 * t * t * (d[i] - c[i]));
      };
      for (let i = 0; i < foglie; i++) {
        const t = da + ((.94 - da) * i) / Math.max(1, foglie - 1);
        const [x, y] = pt(t), [dx, dy] = tg(t);
        const dir = deg(Math.atan2(dx, -dy));
        const k = 1 - .45 * (i / Math.max(1, foglie - 1));
        api.foglia(x, y, dir + (i % 2 ? angolo : -angolo), l0 * k, w0 * k);
      }
      const [dx, dy] = tg(1);
      const dir = deg(Math.atan2(dx, -dy));
      if (punta === "foglia") api.foglia(d[0], d[1], dir, l0 * .6, w0 * .55);
      else if (punta === "bocciolo") api.bocciolo(d[0], d[1], dir, l0 * .75);
    }
  };
  return api;
}

/* ---------- composizioni ---------- */

// Bouquet: rosa centrale, rami simmetrici e un gambo che scende verso il sigillo.
function bouquet() {
  const W = 320, H = 190;
  const meta = (s) => {
    s.ramo([[150, 66], [112, 42], [62, 22], [14, 42]], { foglie: 12, l0: 16, w0: 6, angolo: 48, punta: "bocciolo" });
    s.ramo([[148, 76], [112, 90], [80, 106], [36, 100]], { foglie: 10, l0: 14, w0: 5.2, angolo: 50 });
    s.ramo([[152, 56], [142, 36], [128, 20], [108, 8]], { foglie: 6, l0: 12, w0: 4.4, punta: "bocciolo", gw: 1.2 });
    s.ramo([[146, 84], [128, 108], [116, 124], [92, 136]], { foglie: 6, l0: 12, w0: 4.4, gw: 1.2 });
    // rametti secondari: riempiono i vuoti tra i rami principali
    s.ramo([[98, 32], [90, 20], [82, 12], [70, 6]], { foglie: 4, l0: 9, w0: 3.4, gw: 1, punta: "bocciolo" });
    s.ramo([[86, 100], [74, 114], [62, 122], [48, 126]], { foglie: 4, l0: 9, w0: 3.2, gw: 1 });
    s.ramo([[124, 48], [112, 34], [100, 34], [92, 46]], { foglie: 3, l0: 8, w0: 3, gw: .9 });
    s.ramo([[130, 100], [118, 96], [108, 102], [104, 112]], { foglie: 3, l0: 8, w0: 3, gw: .9 });
    s.viticcio(52, 30, 12, 1);
    s.viticcio(70, 104, 10, -1);
    s.bacche(88, 54, 1.9, 3, 20);
    s.bacche(100, 118, 1.7, 3, 60);
    s.bacche(40, 86, 1.6, 3, 0);
    s.bacche(30, 30, 1.5, 3, 40);
    s.foglia(146, 84, -128, 28, 10);
    s.foglia(142, 50, -58, 24, 8.5);
    s.foglia(134, 70, -96, 24, 8);
    s.fiore(112, 68, 13.5, 8);
    s.fiore(72, 36, 8.5, 20);
    s.fiore(62, 96, 7.5, 40);
    s.fiore(118, 124, 6.5, 10);
    s.fiore(130, 94, 8, 30);
    s.fiore(126, 36, 6.5, 0);
    s.fiore(36, 52, 5.5, 14);
  };
  const lato = disegno(), centro = disegno();
  meta(lato);
  centro.ramo([[160, 86], [158, 116], [163, 150], [160, 184]], { foglie: 6, l0: 12, w0: 4.2, da: .22, angolo: 58, punta: "bocciolo", gw: 1.4 });
  centro.viticcio(158, 132, 9, -1);
  centro.viticcio(162, 160, 8, 1);
  // corona di foglie dietro la rosa
  for (const a of [-150, -118, -86, -54, -22, 22, 54, 86, 118, 150]) {
    const r = a * Math.PI / 180;
    centro.foglia(160 + Math.sin(r) * 14, 64 - Math.cos(r) * 14, a, 30, 10);
  }
  centro.rosa(160, 64, 25);
  // la meta' destra riusa la sinistra specchiata (<use>): file grande la meta'
  const corpo =
    `<g id="lato">${lato.out.join("")}</g>` +
    `<use href="#lato" transform="translate(${W} 0) scale(-1 1)"/>` +
    centro.out.join("");
  return { W, H, corpo };
}

// Tralcio verticale per i lembi laterali.
function tralcio() {
  const W = 72, H = 330;
  const s = disegno();
  const pts = [];
  for (let y = H - 4; y >= 6; y -= 4) pts.push([36 + 8 * Math.sin(y / 38), y]);
  s.gambo("M" + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join("L"), 1.4);
  const xAt = (y) => 36 + 8 * Math.sin(y / 38);
  // rametti laterali: ogni tanto un ramo corto esce dal tralcio
  for (const [y, v] of [[300, 1], [262, -1], [214, 1], [150, -1], [112, 1], [74, -1]]) {
    const x = xAt(y);
    s.ramo([[x, y], [x + v * 8, y - 6], [x + v * 14, y - 14], [x + v * 20, y - 24]], { foglie: 3, l0: 8, w0: 3, gw: .9, da: .3 });
  }
  let i = 0;
  for (let y = H - 14; y > 20; y -= 12.5, i++) {
    const dx = (8 / 38) * Math.cos(y / 38) * -4, dy = -4;   // tangente verso l'alto
    const dir = deg(Math.atan2(dx, -dy));
    const k = 1 - .35 * (1 - y / H);
    s.foglia(xAt(y), y, dir + (i % 2 ? 54 : -54), 16 * k, 5.6 * k);
  }
  s.bacche(xAt(282) + 16, 282, 1.7, 3, 10);
  s.bacche(xAt(130) - 16, 128, 1.6, 3, 50);
  s.bacche(xAt(190) + 16, 190, 1.5, 3, 30);
  s.viticcio(xAt(206) + 2, 206, 10, 1);
  s.viticcio(xAt(62) - 2, 62, 9, -1);
  s.fiore(xAt(316) - 12, 314, 7, 6);
  s.fiore(xAt(246) + 13, 246, 8.5, 12);
  s.fiore(xAt(232) - 12, 230, 6, 40);
  s.fiore(xAt(172) - 13, 172, 9, 30);
  s.fiore(xAt(158) + 12, 156, 6, 10);
  s.fiore(xAt(98) + 12, 98, 8, 0);
  s.fiore(xAt(84) - 12, 84, 5.5, 20);
  s.fiore(xAt(36) - 10, 40, 6.5, 22);
  s.bocciolo(xAt(8), 8, 0, 11);
  return { W, H, corpo: s.out.join("") };
}

function svg({ W, H, corpo }, trasforma = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">` +
    `<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}">` +
    `<g stroke-linecap="round" stroke-linejoin="round"${trasforma ? ` transform="${trasforma}"` : ""}>${corpo}</g>` +
    `</mask></defs><rect width="${W}" height="${H}" fill="#fff" mask="url(#m)"/></svg>\n`;
}

fs.mkdirSync(OUT, { recursive: true });
const b = bouquet(), t = tralcio();
const file = {
  "bouquet-alto.svg": svg(b),
  "bouquet-basso.svg": svg(b, `translate(0 ${b.H}) scale(1 -1)`),
  "tralcio-sx.svg": svg(t),
  "tralcio-dx.svg": svg(t, `translate(${t.W} 0) scale(-1 1)`)
};
for (const [nome, testo] of Object.entries(file)) {
  fs.writeFileSync(path.join(OUT, nome), testo);
  console.log(`${nome}  ${(testo.length / 1024).toFixed(1)} KB`);
}
