/*
 * Guide di configurazione delle stampanti fiscali.
 *
 * Per aggiungere una stampante basta aggiungere un oggetto all'array PRINTERS.
 *
 * Ogni step ha:
 *   phase   nome della fase (gli step consecutivi con la stessa fase vengono raggruppati)
 *   title   titolo dello step
 *   where   dove si opera: 'printer' | 'pc' | 'web' | 'react'
 *   intro   (facoltativo) frase introduttiva
 *   blocks  contenuto dello step:
 *     { type: 'seq',   label?, seq: [token, ...] }      sequenza di tasti
 *     { type: 'list',  items: ['...'] }                 elenco puntato
 *     { type: 'table', head: [...], rows: [[...], ...] }
 *     { type: 'note',  kind: 'info'|'warn'|'tip', text }
 *     { type: 'input', var: 'ip', label, placeholder }  valore da annotare (riusabile con { v: 'ip' })
 *
 * Token di una sequenza:
 *   { key: true }        tasto chiave (icona)
 *   { k: 'SUBTOT' }      tasto della stampante
 *   { n: '690' }         numero da digitare
 *   { m: 'MENU TECNICO'} voce di menu da selezionare
 *   { t: 'testo' }       azione libera
 *   { v: 'ip' }          valore annotato in uno step precedente (empty: testo se non annotato)
 *   proprietà facoltative: cap (didascalia sotto il token), x (numero di ripetizioni)
 */

const PRINTERS = [
  {
    id: 'custom-big',
    name: 'Custom Big',
    brand: 'Custom',
    summary: 'Fiscalizzazione, censimento, attivazione, configurazione con RX Config e verifica finale.',
    needs: [
      'Stampante collegata alla rete con cavo Ethernet',
      'PC con il programma RX Config',
      'Dati del cliente per l\'intestazione dello scontrino',
      'Accesso al portale Custom4U'
    ],
    legend: [
      { tok: { key: true }, text: 'Tasto chiave' },
      { tok: { k: 'PROGRAMMAZIONE' }, text: 'Tasto programmazione' },
      { tok: { k: 'SUBTOT' }, text: 'Conferma (SBT)' },
      { tok: { n: '00' }, text: 'Sposta tra le opzioni' }
    ],
    steps: [
      {
        phase: 'Fiscalizzazione',
        title: 'Fiscalizzazione',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { key: true }, { k: 'PROGRAMMAZIONE' }, { n: '690' }, { k: 'SUBTOT' },
            { n: '147896', cap: 'password' }, { k: 'SUBTOT' },
            { n: '00', cap: 'seleziona SÌ' }, { k: 'SUBTOT' }
          ] },
          { type: 'note', kind: 'info', text: 'Il tasto 00 serve per spostarsi da un\'opzione all\'altra: premilo finché è selezionato SÌ, poi conferma con SUBTOT.' }
        ]
      },
      {
        phase: 'Attivazione DGFE',
        title: 'Attivazione DGFE',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { k: 'PROGRAMMAZIONE' }, { n: '693' }, { k: 'SUBTOT' }] }
        ]
      },
      {
        phase: 'Censimento',
        title: 'Censimento',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { key: true }, { k: 'PROGRAMMAZIONE' }, { n: '699' }, { k: 'SUBTOT' },
            { m: 'MENU TECNICO', cap: 'scorri con 00' }, { k: 'SUBTOT' },
            { m: 'CENSIMENTO' }, { k: 'SUBTOT' }
          ] },
          { type: 'note', kind: 'warn', text: 'Se il censimento non va a buon fine, dal MENU TECNICO genera le chiavi e poi ripeti il censimento.' }
        ]
      },
      {
        phase: 'Attivazione',
        title: 'Attivazione',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { key: true }, { k: 'PROGRAMMAZIONE' }, { n: '699' }, { k: 'SUBTOT' },
            { m: 'MENU TECNICO' }, { k: 'SUBTOT' }, { m: 'ATTIVAZIONE' }
          ] },
          { type: 'table', head: ['Dentro ATTIVAZIONE', 'Valore'], rows: [
            ['Data', 'Lasciare vuoto'],
            ['Flag telematico', 'ABILITATO']
          ] }
        ]
      },
      {
        phase: 'Indirizzo IP',
        title: 'Trova l\'indirizzo IP',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { k: 'PROGRAMMAZIONE' }, { n: '911' }, { k: 'SUBTOT' }, { k: 'SUBTOT' }] },
          { type: 'note', kind: 'info', text: 'L\'indirizzo IP viene mostrato sul display o stampato. Annotalo: serve nel prossimo step.' },
          { type: 'input', var: 'ip', label: 'Indirizzo IP della stampante', placeholder: 'es. 192.168.1.100' }
        ]
      },
      {
        phase: 'RX Config',
        title: 'Collegamento alla stampante',
        where: 'pc',
        intro: 'Apri RX Config sul PC.',
        blocks: [
          { type: 'seq', seq: [
            { m: 'Comunicazione' }, { m: 'Config. porta ETH' },
            { v: 'ip', cap: 'inserisci l\'IP', empty: 'IP non annotato' }, { m: 'Carica dati da stampante' }
          ] }
        ]
      },
      {
        phase: 'RX Config',
        title: 'Intestazione scontrino',
        where: 'pc',
        blocks: [
          { type: 'seq', seq: [{ m: 'Intestazione scontrino' }] },
          { type: 'list', items: ['Inserisci i dati del cliente: ragione sociale, indirizzo, partita IVA.'] }
        ]
      },
      {
        phase: 'RX Config',
        title: 'Programmazione reparti',
        where: 'pc',
        blocks: [
          { type: 'seq', seq: [{ m: 'Prog. reparti' }] },
          { type: 'table', head: ['Reparto', 'Aliquota IVA'], rows: [
            ['1', '22%'],
            ['2', '10%'],
            ['3', '4%']
          ] }
        ]
      },
      {
        phase: 'RX Config',
        title: 'Configurazione tastiera',
        where: 'pc',
        blocks: [
          { type: 'seq', seq: [{ m: 'Config. tastiera' }, { k: '24', cap: 'tasto n. 24' }] },
          { type: 'table', head: ['Tasto 24', 'Impostazione'], rows: [
            ['Tipo', 'POS'],
            ['Pagamento', 'Carta di credito']
          ] },
          { type: 'note', kind: 'info', text: 'Il tasto 24 è sempre quello dei pagamenti elettronici.' }
        ]
      },
      {
        phase: 'RX Config',
        title: 'Salva dati su stampante',
        where: 'pc',
        blocks: [
          { type: 'seq', seq: [{ m: 'Salva dati su stampante' }] },
          { type: 'note', kind: 'tip', text: 'Attendi che il salvataggio sia completato prima di proseguire.' }
        ]
      },
      {
        phase: 'Portale',
        title: 'Registra la macchina nel portale',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { key: true }, { k: 'PROGRAMMAZIONE' }, { n: '699' }, { k: 'SUBTOT' },
            { m: 'MENU TECNICO' }, { k: 'SUBTOT' }, { m: 'PARAMETRI UPGRADE' }
          ] },
          { type: 'note', kind: 'info', text: 'Basta selezionare PARAMETRI UPGRADE.' }
        ]
      },
      {
        phase: 'Portale',
        title: 'Disabilita la Lotteria',
        where: 'web',
        blocks: [
          { type: 'list', items: [
            'Accedi al portale Custom4U.',
            'Apri la stampante appena registrata.',
            'Togli la spunta dal flag Lotteria e salva.'
          ] }
        ]
      },
      {
        phase: 'Portale',
        title: 'Aggiornamento software',
        where: 'web',
        blocks: [
          { type: 'list', items: ['Avvia l\'aggiornamento software della stampante dal sito Custom4U.'] },
          { type: 'note', kind: 'tip', text: 'Non spegnere la stampante durante l\'aggiornamento.' }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Scontrini di prova',
        where: 'printer',
        intro: 'Emetti due scontrini manuali:',
        blocks: [
          { type: 'table', head: ['Scontrino', 'Importo', 'Pagamento'], rows: [
            ['1', '1,39 €', 'Contanti'],
            ['2', '1,25 €', 'Elettronico (tasto 24)']
          ] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Annulla gli scontrini',
        where: 'printer',
        intro: 'Annulla entrambi gli scontrini, uno alla volta.',
        blocks: [
          { type: 'seq', seq: [
            { k: 'SHIFT' }, { k: 'VAT', x: 3 }, { t: 'dati scontrino' }, { k: 'VAT' }, { k: 'CONTANTI' }
          ] },
          { type: 'note', kind: 'info', text: 'Ripeti la sequenza per il secondo scontrino.' }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Chiusura cassa',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Esegui la chiusura cassa.'] }
        ]
      }
    ]
  },

  {
    id: 'smart',
    name: 'Smart',
    brand: 'Smart',
    summary: 'Data e ora, censimento, aggiornamenti, configurazione con la React app e verifica finale.',
    needs: [
      'Stampante accesa e collegata alla rete',
      'PC con la React app'
    ],
    legend: [
      { tok: { key: true }, text: 'Tasto chiave' },
      { tok: { n: '9626' }, text: 'Codice da digitare dopo la chiave' },
      { tok: { k: 'CONTANTI' }, text: 'Conferma il codice' },
      { tok: { k: 'ANNULLO' }, text: 'Al posto di CONTANTI, solo dove indicato' }
    ],
    steps: [
      {
        phase: 'Data e ora',
        title: 'Data e ora',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '3' }, { key: true }, { n: '01' }, { k: 'CONTANTI' }] },
          { type: 'list', items: ['Imposta data e ora e conferma sul touch screen.'] }
        ]
      },
      {
        phase: 'Censimento',
        title: 'Censimento',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '50' }, { k: 'ANNULLO' }] }
        ]
      },
      {
        phase: 'Chiusura',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Esegui la chiusura giornaliera.'] },
          { type: 'note', kind: 'warn', text: 'La chiusura va fatta prima degli aggiornamenti.' }
        ]
      },
      {
        phase: 'Aggiornamenti',
        title: 'Aggiornamento tastiera',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '9626' }, { key: true }, { n: '80' }, { k: 'CONTANTI' }] }
        ]
      },
      {
        phase: 'Aggiornamenti',
        title: 'Aggiornamento software',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '80' }, { k: 'ANNULLO' }] },
          { type: 'note', kind: 'tip', text: 'Non spegnere la stampante durante l\'aggiornamento.' }
        ]
      },
      {
        phase: 'React app',
        title: 'Nuovo modello',
        where: 'react',
        blocks: [
          { type: 'seq', seq: [{ m: 'Modelli' }, { m: 'Nuovo modello' }] },
          { type: 'note', kind: 'info', text: 'Annota il numero che appare nella React app: serve nel prossimo step.' },
          { type: 'input', var: 'modello', label: 'Numero mostrato dalla React app', placeholder: 'es. 12' }
        ]
      },
      {
        phase: 'Configurazione',
        title: 'Configura la stampante',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { key: true }, { n: '9626' }, { key: true }, { n: '47' },
            { v: 'modello', cap: 'numero della React app', empty: 'numero non annotato' }, { k: 'ANNULLO' }
          ] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Scontrini di prova',
        where: 'printer',
        intro: 'Emetti due scontrini:',
        blocks: [
          { type: 'table', head: ['Scontrino', 'Importo', 'Pagamento'], rows: [
            ['1', '1,39 €', 'Contanti'],
            ['2', '1,25 €', 'Elettronico']
          ] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Annulla gli scontrini',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Annulla entrambi gli scontrini di prova.'] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Procedura finale',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '9626' }, { key: true }, { n: '20' }, { k: 'CONTANTI' }] }
        ]
      }
    ]
  }
];
