#!/usr/bin/env bash
# deploy.sh — zet de site over naar faistos.nl/vrijstelling.
#
# Methode: scp -r. Op de server staat geen rsync (gecontroleerd tijdens de
# bouw, zie §0.5 van de bouwopdracht), dus geen rsync -avz --delete. In
# plaats daarvan: een lokale staging-map met precies de bestanden die live
# moeten staan, en die map vervangt de inhoud van de doelmap in zijn geheel.
#
# Vereist: .env met DEPLOY_USER, DEPLOY_HOST, DEPLOY_PORT (optioneel),
# DEPLOY_SSH_KEY (optioneel), DEPLOY_PAD. Zie .env.voorbeeld.

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

if [[ ! -f .env ]]; then
  echo "FOUT: .env ontbreekt. Kopieer .env.voorbeeld naar .env en vul het in." >&2
  exit 1
fi
set -a
source .env
set +a

for var in DEPLOY_USER DEPLOY_HOST DEPLOY_PAD; do
  if [[ -z "${!var:-}" ]]; then
    echo "FOUT: $var staat niet (of leeg) in .env." >&2
    exit 1
  fi
done

if [[ "$DEPLOY_PAD" != */vrijstelling ]]; then
  echo "FOUT: DEPLOY_PAD ('$DEPLOY_PAD') eindigt niet op /vrijstelling." >&2
  echo "Dit script vervangt de VOLLEDIGE inhoud van dat pad — controleer dit dus dubbel." >&2
  exit 1
fi

SSH_OPTS=(-4 -o BatchMode=yes)
[[ -n "${DEPLOY_PORT:-}" ]] && SSH_OPTS+=(-p "$DEPLOY_PORT")
[[ -n "${DEPLOY_SSH_KEY:-}" ]] && SSH_OPTS+=(-i "$DEPLOY_SSH_KEY")
SCP_OPTS=(-4 -r)
[[ -n "${DEPLOY_PORT:-}" ]] && SCP_OPTS+=(-P "$DEPLOY_PORT")
[[ -n "${DEPLOY_SSH_KEY:-}" ]] && SCP_OPTS+=(-i "$DEPLOY_SSH_KEY")

DOEL="${DEPLOY_USER}@${DEPLOY_HOST}"

echo "Doel: ${DOEL}:${DEPLOY_PAD} (poort: ${DEPLOY_PORT:-standaard})"
echo ""

# --- Staging: alleen wat live moet staan, in dezelfde structuur ---
STAGING="$(mktemp -d)"
trap 'rm -rf "$STAGING"' EXIT

rsync_achtig() {
  # We hebben geen rsync nodig voor déze stap (lokaal naar lokaal is prima
  # met cp), we gebruiken alleen scp voor het echte transport naar de server.
  for item in index.html css js assets; do
    cp -r "$item" "$STAGING/"
  done
  # test/, README.md, BOUWOPDRACHT.md, deploy.sh, .env, .env.voorbeeld,
  # .gitignore en .git blijven bewust buiten de staging-map.
}
rsync_achtig

echo "Bestanden die naar de server gaan:"
(cd "$STAGING" && find . -type f | sed 's#^\./#  #' | sort)
echo ""
echo "Dit VERVANGT alle bestaande inhoud van ${DEPLOY_PAD} op de server."
read -r -p "Doorgaan? Typ 'ja' om te bevestigen: " BEVESTIGING
if [[ "$BEVESTIGING" != "ja" ]]; then
  echo "Geannuleerd."
  exit 0
fi

echo "Doelmap op de server legen (alleen ${DEPLOY_PAD})..."
ssh "${SSH_OPTS[@]}" "$DOEL" "mkdir -p '${DEPLOY_PAD}' && find '${DEPLOY_PAD}' -mindepth 1 -delete"

echo "Bestanden overzetten..."
# Let op: "$STAGING"/. werkt hier niet — de scp op deze server (SFTP-modus)
# accepteert die trailing-dot-truc niet ("unexpected filename: ."). In
# plaats daarvan geven we elk item in de staging-map los mee; bash breidt
# de glob lokaal uit voor scp het ziet.
scp "${SCP_OPTS[@]}" "$STAGING"/* "${DOEL}:${DEPLOY_PAD}/"

echo ""
echo "Klaar. Controleer:"
echo "  curl -sSI https://${DEPLOY_HOST}/vrijstelling/ | head -n 1"
