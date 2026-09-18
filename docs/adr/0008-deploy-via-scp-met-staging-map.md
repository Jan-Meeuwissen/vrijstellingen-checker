# 0008. Deploy via scp met een lokale staging-map

- **Status:** Geaccepteerd
- **Datum:** 2026-08-30
- **Bron:** BOUWOPDRACHT.md §0.5, §10; commit 845dc5e; `deploy.sh`

## Context

De site draait in de submap `/vrijstelling` van faistos.nl, waar ook andere content staat.
De voorkeur was `rsync -avz --delete`, maar op de server staat geen rsync (wel SSH). De scp
van de server werkt in SFTP-modus en accepteert de truc `map/.` niet.

## Besluit

`deploy.sh` gebruikt `scp -r`:

1. Serverconfiguratie komt uit `.env` (niet in git); `.env.voorbeeld` is het sjabloon.
2. Het script weigert te draaien als `DEPLOY_PAD` niet op `/vrijstelling` eindigt.
3. Een lokale staging-map krijgt alleen wat live moet staan: `index.html`, `css`, `js`,
   `assets`. `test/`, documentatie, `deploy.sh` en `.env` blijven erbuiten.
4. Het script toont de bestandslijst en vraagt om bevestiging (`ja`).
5. Daarna wordt alleen de doelmap geleegd, en worden de items los overgezet.

## Gevolgen

- Een deploy vervangt de hele inhoud van `/vrijstelling`; bestanden die alleen op de server
  staan, verdwijnen.
- Tijdens de deploy is de site even leeg of onvolledig (seconden). Voor deze tool acceptabel.
- Nieuwe mappen die live moeten, moeten expliciet in `deploy.sh` worden toegevoegd.
- Staat er ooit rsync op de server, dan kan dit met een nieuwe ADR worden vervangen.

## Overwogen alternatieven

- **rsync** — niet beschikbaar op de server.
- **tar over ssh** — kan ook, maar scp was eenvoudiger te controleren met een bestandslijst.
- **FTP** — onversleuteld; uitgesloten in de bouwopdracht.
