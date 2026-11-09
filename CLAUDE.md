# SC Configurazioni Fiscali

Web app (PWA) con le guide passo passo per configurare le stampanti fiscali di SC Sistemi di Cassa. Si usa soprattutto da telefono, sul posto dal cliente, spesso con una mano sola e senza rete. Lingua dell'interfaccia: italiano.

## Stack e struttura

HTML, CSS e JavaScript semplice. Nessun framework, nessun build, nessun `package.json`.

- `index.html`: pagina unica; il tema scuro parte da uno script in `<head>` (classe `theme-dark` su `<html>`).
- `js/data.js`: tutti i contenuti (stampanti, procedure, step). Le istruzioni per scriverli sono in cima al file.
- `js/app.js`: interfaccia e stato (salvato in `localStorage`, chiave `sc-config-v1`).
- `css/style.css`: stile, con i colori come variabili in `:root` e `:root.theme-dark`.
- `sw.js`: service worker per l'uso offline.

Per provarla in locale: `python3 -m http.server` nella cartella del progetto e apri `http://localhost:8000`.

## Regole fisse

- Quando cambi o aggiungi un file servito (CSS, JS, immagini), aggiungilo a `FILES` in `sw.js` e aumenta `CACHE`. Senza questo i telefoni continuano a mostrare la versione vecchia.
- I contenuti delle guide si modificano solo in `js/data.js`, copiando un blocco esistente.
- Non introdurre React, librerie o strumenti di build senza che lo chieda Alessandro.

## Regole di design

Valgono per ogni modifica all'interfaccia.

- **Tipografia:** al massimo tre pesi (400, 500, 600), mai sopra 600. Corpo 16px, testo secondario 14px, nessun testo sotto 12px. Il 12px solo per note e metadati. Titoli con interlinea 1.1 a 1.25, testo con 1.5 a 1.6.
- **Colori:** sempre tramite le variabili, in entrambi i temi. Ogni colore nuovo va definito chiaro e scuro, con contrasto leggibile. Il colore da solo non basta mai a comunicare uno stato: aggiungi testo o icona.
- **Niente decorazione:** no sfocature (`backdrop-filter`), no sfondi sfumati sui pulsanti, no pillole attorno a testo statico, no illustrazioni di persone negli stati vuoti.
- **Tocco:** ogni elemento cliccabile è alto almeno 44px.
- **Tastiera e focus:** il contorno di focus resta sempre visibile. Non usare `outline: none` senza un sostituto equivalente sullo stesso elemento o sul suo contenitore.
- **Movimento:** ogni animazione ha la variante `prefers-reduced-motion`.
- **Form:** etichetta visibile su ogni campo (il segnaposto è solo un esempio di formato). Gli errori dicono cosa è successo e come correggerlo, senza dare la colpa a chi scrive.
- **Testi:** pulsanti con il verbo all'inizio ("Inizia la procedura", non "OK" né "Invia"). Un'azione ha lo stesso nome in tutto il percorso. Frasi brevi, in italiano semplice.
- **Spaziatura:** multipli di 4px; contenuti larghi al massimo 65 caratteri per riga.
- **Telefono prima di tutto:** niente scorrimento orizzontale della pagina da 375px in su; tabelle larghe in un contenitore che scorre da solo.

## Skill da usare per il lavoro sull'interfaccia

Sono plugin installati nell'account di Alessandro, non fanno parte del repository, e nelle sessioni cloud o da app possono mancare. Se una skill non è disponibile, applica comunque le regole scritte sopra.

- Prima di costruire o cambiare una schermata: `frontend-design` e `vectorlab-ux-skills:page-patterns`.
- Stile: `vectorlab-ux-skills:typography`, `colour-palette`, `spacing`, `anti-slop`.
- Form e interazione: `forms`, `labels`, `verbs`, `errors`, `empty-states`, `defaults`, `surfaces`, `keyboard`, `icon-buttons`.
- Movimento: `motion`, `transitions`, `reduced-motion`.
- Telefono e schermi piccoli: `viewports`.
- Prima di chiudere il lavoro: `vectorlab-ux-skills:ux-audit` e `design:accessibility-review`. Per un parere sul risultato: `design:design-critique`.
- Testi dell'interfaccia: `design:ux-copy`.
- Grafici o tabelle di dati: `dataviz`.

Non servono qui `21st` e `web-artifacts-builder`: lavorano su React e shadcn, che questo progetto non usa.
