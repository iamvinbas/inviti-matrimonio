#!/usr/bin/env bash
# ============================================================
# Pubblica le modifiche su GitHub Pages.
#
#   ./tools/pubblica.sh "messaggio del commit"
#
# Fa tre cose che a mano si dimenticano:
#   1. alza il numero ?v= in index.html  -> invalida la cache dei browser
#   2. commit + push
#   3. aspetta che il deploy sia davvero online e lo verifica
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

SITO="https://iamvinbas.github.io/inviti-matrimonio/"
MSG="${1:-aggiorna contenuti}"

# --- 1. versione ---
VECCHIA=$(grep -o '?v=[0-9]\+' index.html | head -1 | tr -d '?v=')
if [ -z "$VECCHIA" ]; then
  echo "✖ Nessun ?v= trovato in index.html" >&2
  exit 1
fi
NUOVA=$((VECCHIA + 1))
sed -i '' "s/?v=$VECCHIA/?v=$NUOVA/g" index.html
echo "→ versione asset: v$VECCHIA → v$NUOVA"

# --- 2. commit + push ---
if git diff --quiet && git diff --cached --quiet; then
  echo "✖ Niente da pubblicare" >&2
  git checkout -- index.html
  exit 1
fi
git add -A
git commit -q -m "$MSG"
git push -q origin main
echo "→ push completato: $(git log --oneline -1)"

# --- 3. attesa del deploy ---
echo -n "→ attendo GitHub Pages "
for _ in $(seq 1 40); do
  if curl -s "$SITO" | grep -q "?v=$NUOVA"; then
    echo ""
    echo "✔ online: $SITO"
    echo ""
    echo "  Il tuo browser puo' mostrare ancora la versione vecchia:"
    echo "  GitHub Pages serve TUTTO con cache-control: max-age=600 (10 minuti),"
    echo "  index.html compreso. Per vedere subito il risultato usa questo link,"
    echo "  che ha un parametro sempre diverso e quindi non e' mai in cache:"
    echo ""
    echo "  ${SITO}?cb=$(date +%s)"
    echo ""
    echo "  Gli invitati non hanno questo problema: il loro link ?p=... e'"
    echo "  unico, alla prima apertura scaricano sempre la versione aggiornata."
    exit 0
  fi
  echo -n "."
  sleep 6
done

echo ""
echo "✖ Deploy non ancora visibile dopo 4 minuti. Controlla:" >&2
echo "  https://github.com/iamvinbas/inviti-matrimonio/actions" >&2
exit 1
