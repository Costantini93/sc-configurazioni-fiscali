# SC Configurazioni Fiscali

Web app con le guide passo passo per la configurazione delle stampanti fiscali (SC Sistemi di Cassa).
Funziona da telefono e da PC, anche offline, e si può installare come app.

## Modificare le guide

Tutti i contenuti sono in [js/data.js](js/data.js): ogni stampante ha la sua lista di step.
In cima al file è spiegato come scrivere tasti, numeri, voci di menu, tabelle e note.
Per aggiungere una procedura basta copiare un blocco esistente e cambiarne i contenuti.
Con `category` scegli in quale categoria del menu compare (Preparazione, Verifica periodica, …) e con `menu` il nome che vi viene mostrato.

## Pubblicare su GitHub Pages

1. Carica questa cartella in un repository GitHub.
2. Nel repository: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, branch `main`, cartella `/ (root)`.
3. Dopo un minuto l'app è online su `https://<utente>.github.io/<repository>/`.

## Installarla sul telefono

- **Android (Chrome):** apri il link → menu ⋮ → *Installa app*.
- **iPhone (Safari):** apri il link → Condividi → *Aggiungi alla schermata Home*.

Dopo la prima apertura funziona anche senza internet.
