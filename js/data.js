/*
 * Guide di configurazione delle stampanti fiscali.
 *
 * Per aggiungere una procedura basta aggiungere un oggetto all'array PRINTERS.
 * Nel menu e in home le procedure sono raggruppate per categoria (category, una di CATEGORIES)
 * e mostrate con il nome breve menu (di solito la stampante).
 * needs (cosa serve) e legend (legenda tasti) sono facoltativi.
 *
 * Ogni step ha:
 *   phase   nome della fase (gli step consecutivi con la stessa fase vengono raggruppati)
 *   title   titolo dello step
 *   where   dove si opera: 'printer' | 'pc' | 'web' | 'react' | 'emotiq'
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

// Emotiq: legenda e annullo scontrino, usati da più procedure
const EMOTIQ_LEGEND = [
  { tok: { k: 'SBT' }, text: 'Subtotale: conferma' },
  { tok: { k: 'CHIUSURA' }, text: 'Tasto punto con sopra la freccia' },
  { tok: { n: '15290' }, text: 'Codice tecnico, quando richiesto' }
];
const EMOTIQ_ANNULLO = [
  { n: '87' }, { k: 'SBT' }, { t: 'data di emissione' },
  { t: 'n. documento', cap: '8 cifre, senza il -' }, { k: 'SBT' }, { k: 'SBT' }
];

// Categorie del menu e della home, in quest'ordine
const CATEGORIES = [
  'Preparazione',
  'Verifica periodica',
  'Sostituzione DGFE',
  'Annullo scontrino',
  'Assistenza',
  'Altre procedure'
];

const PRINTERS = [
  {
    id: 'custom-big',
    name: 'Configurazione Custom Big',
    brand: 'Custom',
    category: 'Preparazione',
    menu: 'Custom Big',
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
    name: 'Preparazione Smart RT',
    brand: 'Labware',
    category: 'Preparazione',
    menu: 'Labware Smart RT',
    summary: 'Data e ora, censimento, aggiornamenti, configurazione con la React app e verifica finale.',
    needs: [
      'Stampante accesa e collegata alla rete',
      'PC con la React app',
      'Codice rivenditore: 981602'
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
          { type: 'list', items: ['Imposta reparti, IVA e intestazione. Nell\'ultima stringa inserisci POS.'] },
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
        phase: 'Configurazione',
        title: 'Attivazione',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Per l\'attivazione seleziona OK.'] }
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
      },
      {
        phase: 'Consegna',
        title: 'Tastini e QR code',
        where: 'printer',
        blocks: [
          { type: 'list', items: [
            'Crea i tastini con i reparti indicati dal cliente.',
            'Chiama il commercialista del cliente per il QR code. Quando arriva, leggilo con la pistola, stampalo e attaccalo sulla macchina.'
          ] }
        ]
      },
      {
        phase: 'Consegna',
        title: 'Scontrini per la check-list',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Fai 3 scontrini: 2 attaccali alla check-list e 1 lascialo attaccato alla macchina.'] }
        ]
      }
    ]
  },

  // ---------- Custom ----------

  {
    id: 'custom-verifica',
    name: 'Verifica periodica Custom',
    brand: 'Custom',
    category: 'Verifica periodica',
    menu: 'Custom',
    summary: 'QR code, chiusura, aggiornamento firmware, scontrini di prova con annullo, registrazione intervento.',
    steps: [
      {
        phase: 'QR code',
        title: 'Controllo QR code',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Controlla il QR code della macchina.'] }
        ]
      },
      {
        phase: 'Chiusura',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { key: true }, { k: 'TOTALE' }] }
        ]
      },
      {
        phase: 'Firmware',
        title: 'Lancia l\'aggiornamento',
        where: 'web',
        blocks: [
          { type: 'list', items: ['Collegati al sito Custom e lancia l\'aggiornamento del firmware.'] }
        ]
      },
      {
        phase: 'Firmware',
        title: 'Aggiorna la stampante',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { k: 'PROGRAMMAZIONE' }, { n: '698' }, { k: 'SUBTOT' }] },
          { type: 'note', kind: 'tip', text: 'Non spegnere la stampante durante l\'aggiornamento.' }
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
            ['2', '1,25 €', 'Elettronico, con lotteria']
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
            { k: 'SHIFT' }, { k: 'VAT', x: 3 }, { t: 'dati richiesti' }, { k: 'VAT' }, { k: 'TOTALE' }
          ] },
          { type: 'note', kind: 'info', text: 'Ripeti la sequenza per il secondo scontrino.' }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { key: true }, { k: 'TOTALE' }] }
        ]
      },
      {
        phase: 'Intervento',
        title: 'Registra l\'intervento tecnico',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { k: 'PROGRAMMAZIONE' }, { n: '699' }, { k: 'SUBTOT' }, { m: 'REGISTRAZIONE INT. TECNICO' }] },
          { type: 'note', kind: 'info', text: 'Al termine premi 3 volte KEY e lascia la cassa in REG.' }
        ]
      },
      {
        phase: 'Intervento',
        title: 'Verifica QR code',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Controlla di nuovo il QR code.'] }
        ]
      }
    ]
  },

  {
    id: 'custom-registrazione',
    name: 'Registrazione intervento Custom',
    brand: 'Custom',
    category: 'Altre procedure',
    menu: 'Custom · Registrazione intervento',
    summary: 'Chiusura e registrazione dell\'intervento tecnico.',
    steps: [
      {
        phase: 'Chiusura',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { key: true }, { k: 'SUBTOT' }] }
        ]
      },
      {
        phase: 'Registrazione',
        title: 'Registrazione intervento tecnico',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { k: 'PROGRAMMAZIONE' }, { n: '699' }, { k: 'SUBTOT' }, { m: 'REGISTRAZIONE INT. TECNICO' }] }
        ]
      },
      {
        phase: 'Registrazione',
        title: 'Torna in REG',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true, x: 3 }] },
          { type: 'note', kind: 'info', text: 'Al termine lascia la cassa in REG.' }
        ]
      }
    ]
  },

  {
    id: 'custom-annullo',
    name: 'Annullo scontrino Custom',
    brand: 'Custom',
    category: 'Annullo scontrino',
    menu: 'Custom',
    summary: 'Annullamento di uno scontrino.',
    steps: [
      {
        phase: 'Annullo',
        title: 'Annulla lo scontrino',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { k: 'SHIFT' }, { k: 'VAT', x: 3 }, { t: 'dati richiesti' }, { k: 'VAT' }, { k: 'TOTALE' }
          ] }
        ]
      }
    ]
  },

  {
    id: 'custom-k3',
    name: 'Tastierino K3',
    brand: 'Custom',
    category: 'Altre procedure',
    menu: 'Custom · Tastierino K3',
    summary: 'Passaggio da FPU a LOCAL e stampa dell\'elenco delle programmazioni.',
    steps: [
      {
        phase: 'Modalità',
        title: 'Da FPU a LOCAL',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '222' }, { key: true }] },
          { type: 'table', head: ['Modalità', 'Significato'], rows: [
            ['FPU', 'Lavora da PC'],
            ['LOCAL', 'Lavora in manuale']
          ] },
          { type: 'note', kind: 'warn', text: 'Queste impostazioni valgono solo per le Custom di 3ª generazione.' }
        ]
      },
      {
        phase: 'Programmazioni',
        title: 'Stampa l\'elenco delle programmazioni',
        where: 'printer',
        intro: 'Porta la chiave fino a REG, in lettura.',
        blocks: [
          { type: 'seq', seq: [{ n: '0' }, { k: 'SUBTOT' }] },
          { type: 'note', kind: 'info', text: 'Stampa l\'elenco di tutto quello che si può fare in programmazione.' }
        ]
      }
    ]
  },

  // ---------- Labware ----------

  {
    id: 'labware-dgfe',
    name: 'Sostituzione DGFE Smart RT',
    brand: 'Labware',
    category: 'Sostituzione DGFE',
    menu: 'Labware Smart RT',
    summary: 'Chiusura, sostituzione fisica della DGFE, inizializzazione, registrazione intervento e verifica.',
    needs: [
      'DGFE nuova',
      'Piombo',
      'C.F. del tecnico e P.IVA di S.C.'
    ],
    steps: [
      {
        phase: 'Preparazione',
        title: 'Leggi il QR code',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Leggi il QR code della macchina.'] }
        ]
      },
      {
        phase: 'Preparazione',
        title: 'Chiusura fiscale',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { k: 'CHIUSURA' }] }
        ]
      },
      {
        phase: 'Sostituzione',
        title: 'Spegni la macchina',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Spegni la macchina e togli il cavo della corrente.'] }
        ]
      },
      {
        phase: 'Sostituzione',
        title: 'Apri la macchina',
        where: 'printer',
        blocks: [
          { type: 'list', items: [
            'Togli le 2 viti sotto la tastiera.',
            'Sfila la tastiera, togli il piombo e svita la vite.',
            'Sfila verso il basso la cover nera.'
          ] }
        ]
      },
      {
        phase: 'Sostituzione',
        title: 'Sostituisci la DGFE',
        where: 'printer',
        blocks: [
          { type: 'list', items: [
            'Sfila la DGFE esausta e inserisci la nuova.',
            'Chiudi la cover nera.',
            'Accendi la macchina.'
          ] }
        ]
      },
      {
        phase: 'Inizializzazione',
        title: 'Inizializza la DGFE',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '18' }, { k: 'ANNULLO' }] }
        ]
      },
      {
        phase: 'Inizializzazione',
        title: 'Registra l\'intervento tecnico',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { key: true }, { n: '9626' }, { key: true }, { n: '24' },
            { t: 'C.F. tecnico e P.IVA S.C.' }
          ] }
        ]
      },
      {
        phase: 'Chiusura',
        title: 'Rimonta la macchina',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Completa rimontando tutto e metti il piombo.'] }
        ]
      },
      {
        phase: 'Chiusura',
        title: 'Verifica finale',
        where: 'printer',
        blocks: [
          { type: 'list', items: [
            'Fai il test a zero e la chiusura.',
            'Leggi il QR code per la verifica.'
          ] }
        ]
      }
    ]
  },

  {
    id: 'labware-basic',
    name: 'Labware Basic',
    brand: 'Labware',
    category: 'Preparazione',
    menu: 'Labware Basic',
    summary: 'Censimento, attivazione, aggiornamenti e programmazione reparti.',
    steps: [
      {
        phase: 'Censimento',
        title: 'Censimento',
        where: 'printer',
        intro: 'Seleziona la tastiera dal menu (le 3 linee).',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '50' }, { k: 'ANNULLO' }] }
        ]
      },
      {
        phase: 'Attivazione',
        title: 'Attivazione',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '53' }, { k: 'ANNULLO' }] }
        ]
      },
      {
        phase: 'Aggiornamenti',
        title: 'Aggiornamento parte fiscale',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '80' }] },
          { type: 'note', kind: 'info', text: 'Al termine riavvia la macchina.' }
        ]
      },
      {
        phase: 'Aggiornamenti',
        title: 'Aggiornamento software',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { m: 'Menu (3 linee)' }, { m: 'Impostazioni' }, { n: '1234', cap: 'per entrare' },
            { m: 'Utilità' }, { m: 'Aggiornamento' }, { m: 'Software' }
          ] },
          { type: 'note', kind: 'tip', text: 'Prendi sempre la versione più in alto.' }
        ]
      },
      {
        phase: 'Reparti',
        title: 'Programma i reparti',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Programma i reparti con prezzi e IVA corretti.'] }
        ]
      }
    ]
  },

  // ---------- 3i ----------

  {
    id: '3i-verifica',
    name: 'Verifica periodica RT 30 / RT 40',
    brand: '3i',
    category: 'Verifica periodica',
    menu: '3i RT 30 / RT 40',
    summary: 'Chiusura, corrispettivi, connessione, scontrini di prova con annullo e registrazione intervento.',
    needs: ['C.F. del tecnico e P.IVA di S.C.'],
    steps: [
      {
        phase: 'Chiusura',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '21', cap: 'o 321' }, { k: 'TOTALE' }] }
        ]
      },
      {
        phase: 'Controlli',
        title: 'Corrispettivi non trasmessi',
        where: 'printer',
        intro: 'Verifica che non ci siano corrispettivi non trasmessi all\'AdE.',
        blocks: [
          { type: 'seq', label: 'Se serve, forza l\'invio:', seq: [{ n: '3155' }, { k: 'FUNZIONE' }] }
        ]
      },
      {
        phase: 'Controlli',
        title: 'Test connessione internet',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '5521' }, { k: 'FUNZIONE' }] }
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
            ['2', '1,25 €', 'Elettronico (eventualmente lotteria)']
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
            { n: '701' }, { k: 'FUNZIONE' }, { k: 'TOTALE', cap: 'conferma l\'avvio' },
            { t: 'dati scontrino' }, { k: 'TOTALE' }, { k: 'TOTALE', cap: 'conferma lo scontrino' }
          ] },
          { type: 'note', kind: 'info', text: 'Il registratore stampa un documento commerciale emesso per annullamento, che storna l\'operazione ai fini fiscali e telematici. Ripeti per il secondo scontrino.' }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '21', cap: 'o 321' }, { k: 'TOTALE' }] }
        ]
      },
      {
        phase: 'Intervento',
        title: 'Registra l\'intervento',
        where: 'printer',
        intro: 'Dallo stato di vendita:',
        blocks: [
          { type: 'seq', seq: [
            { n: '4' }, { k: 'MENU', cap: 'o FUNZIONE, in base al firmware' },
            { k: 'CARTA DI CREDITO' }, { k: 'TOTALE' }
          ] },
          { type: 'seq', label: 'Poi:', seq: [
            { t: 'C.F. tecnico e P.IVA S.C.' }, { k: 'TOTALE' }, { k: 'SUBTOTALE' }, { k: 'TOTALE' }
          ] },
          { type: 'seq', label: 'Per tornare allo stato di vendita:', seq: [{ k: 'CREDITO/ESCI' }] }
        ]
      }
    ]
  },

  {
    id: '3i-dgfe',
    name: 'Sostituzione DGFE RT 30 / RT 40',
    brand: '3i',
    category: 'Sostituzione DGFE',
    menu: '3i RT 30 / RT 40',
    summary: 'Chiusura, sostituzione fisica della DGFE, inizializzazione e report di verifica.',
    needs: ['DGFE nuova', 'Piombo'],
    steps: [
      {
        phase: 'Chiusura',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '21' }, { k: 'TOTALE' }] }
        ]
      },
      {
        phase: 'Sostituzione',
        title: 'Sostituisci la DGFE',
        where: 'printer',
        blocks: [
          { type: 'list', items: [
            'Togli il piombo e apri la cassa.',
            'Sostituisci la DGFE.',
            'Chiudi e accendi la macchina.'
          ] }
        ]
      },
      {
        phase: 'Sostituzione',
        title: 'Inizializzazione',
        where: 'printer',
        intro: 'La macchina dovrebbe riconoscere da sola la nuova DGFE e chiedere l\'inizializzazione. Segui le indicazioni sul display confermando con TOTALE.',
        blocks: [
          { type: 'table', head: ['Sul display', 'Cosa fare'], rows: [
            ['DGFE blank', 'Premi C'],
            ['Format', 'Premi SÌ'],
            ['C.F. / P.IVA', 'Inserisci e conferma']
          ] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Test connessione internet',
        where: 'printer',
        intro: 'Dallo stato di vendita:',
        blocks: [
          { type: 'seq', seq: [{ n: '5521' }, { k: 'FUNZIONE' }] },
          { type: 'note', kind: 'info', text: 'Deve comparire la scritta INTERNET OK.' }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Report di verifica iniziale',
        where: 'printer',
        intro: 'Dallo stato di vendita:',
        blocks: [
          { type: 'seq', seq: [
            { n: '2' }, { k: 'MENU' }, { k: 'TOTALE' },
            { k: 'SUBTOTALE', cap: 'finché compare LETTURA DGFE' }, { m: 'LETTURA DGFE' }, { k: 'TOTALE' }
          ] },
          { type: 'list', items: ['Scegli la modalità (es. globale o per data) e stampa il report.'] }
        ]
      }
    ]
  },

  // ---------- Emotiq ----------

  {
    id: 'emotiq-attivazione',
    name: 'Attivazione Nota 2',
    brand: 'Emotiq',
    category: 'Preparazione',
    menu: 'Emotiq Nota 2',
    summary: 'Connessione Wi-Fi, test di rete, configurazione con Emotiq Tools, verifica IVA e QR code.',
    needs: [
      'PC con Emotiq Tools',
      'P.IVA e C.F. del cliente',
      'Nome e password del Wi-Fi del cliente'
    ],
    legend: EMOTIQ_LEGEND,
    steps: [
      {
        phase: 'Connessione',
        title: 'Collega la cassa al Wi-Fi',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { n: '833' }, { k: 'SBT' }, { n: '15290', cap: 'codice' }, { k: 'SBT' },
            { m: 'WIFI 1' }, { k: 'SBT' }, { m: 'ELENCO RETI' }
          ] },
          { type: 'seq', label: 'Quando la cassa ha stampato l\'elenco delle reti:', seq: [
            { t: 'numero della rete' }, { k: 'SBT' }, { t: 'password del Wi-Fi' }, { k: 'SBT' }
          ] }
        ]
      },
      {
        phase: 'Connessione',
        title: 'Test di rete',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '685' }, { k: 'SBT' }] },
          { type: 'note', kind: 'info', text: 'Se non funziona, riprova. Quando funziona, prosegui con Emotiq Tools.' }
        ]
      },
      {
        phase: 'Emotiq Tools',
        title: 'Collegati alla stampante',
        where: 'emotiq',
        intro: 'Apri Emotiq Tools sul PC.',
        blocks: [
          { type: 'seq', seq: [{ m: 'File' }, { m: 'Configura porta' }, { m: 'Connetti' }, { m: 'Trasferisci' }] }
        ]
      },
      {
        phase: 'Emotiq Tools',
        title: 'Fiscalizzazione',
        where: 'emotiq',
        blocks: [
          { type: 'list', items: ['Inserisci P.IVA e C.F. del cliente.'] }
        ]
      },
      {
        phase: 'Emotiq Tools',
        title: 'Intestazione',
        where: 'emotiq',
        blocks: [
          { type: 'seq', seq: [{ m: 'Modifica' }, { m: 'Configura' }, { m: 'Intestazione' }] },
          { type: 'note', kind: 'info', text: 'Logo: Modifica → Configura → Opzioni. Per cancellare il logo esistente dallo scontrino: Modifica → Configura grafica e porta il numero a 0 (dalla cassa: 638 SBT 0 SBT).' }
        ]
      },
      {
        phase: 'Emotiq Tools',
        title: 'Reparti',
        where: 'emotiq',
        blocks: [
          { type: 'seq', seq: [{ m: 'Modifica' }, { m: 'Configura' }, { m: 'Reparti' }] },
          { type: 'seq', label: 'Una volta modificati:', seq: [{ m: 'Invia selezionati' }] }
        ]
      },
      {
        phase: 'Emotiq Tools',
        title: 'Trasferisci alla stampante',
        where: 'emotiq',
        blocks: [
          { type: 'seq', seq: [{ m: 'Trasferisci' }, { m: 'Invia' }, { m: 'Reparti' }] },
          { type: 'seq', seq: [{ m: 'Trasferisci' }, { m: 'Invia' }, { m: 'Intestazione' }] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Verifica IVA',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '1' }, { k: 'REP. 1', cap: 'poi 2, 3, 4…' }] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Info generale RT',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '808' }, { k: 'SBT' }] },
          { type: 'note', kind: 'info', text: 'Stampa modello, versione software e scadenza della verifica.' }
        ]
      },
      {
        phase: 'Consegna',
        title: 'Tastini e QR code',
        where: 'printer',
        blocks: [
          { type: 'list', items: [
            'Stampa i tastini per i reparti.',
            'Contatta il commercialista del cliente per il QR code.'
          ] }
        ]
      }
    ]
  },

  {
    id: 'emotiq-verifica',
    name: 'Verifica periodica Nota / Model M / Opera 57',
    brand: 'Emotiq',
    category: 'Verifica periodica',
    menu: 'Emotiq Nota / Model M / Opera 57',
    summary: 'QR code, chiusura, test di rete, scontrini di prova con annullo, registrazione della verifica e check-list.',
    needs: ['C.F. del tecnico e P.IVA del laboratorio', 'Check-list della verifica'],
    legend: EMOTIQ_LEGEND,
    steps: [
      {
        phase: 'Apertura',
        title: 'Lettura QR code',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Leggi il QR code della macchina.'] }
        ]
      },
      {
        phase: 'Apertura',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ k: 'CHIUSURA', cap: 'tieni premuto 3 secondi' }] },
          { type: 'note', kind: 'info', text: 'Questa chiusura la tiene il cliente: va allegata alla chiusura della sera.' }
        ]
      },
      {
        phase: 'Apertura',
        title: 'Test di rete',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '685' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Scontrini',
        title: 'Scontrino in contanti',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Fai uno scontrino da 1,39 € su un reparto, pagamento contante.'] }
        ]
      },
      {
        phase: 'Scontrini',
        title: 'Annulla lo scontrino',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: EMOTIQ_ANNULLO }
        ]
      },
      {
        phase: 'Scontrini',
        title: 'Scontrino lotteria',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '88' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Scontrini',
        title: 'Scontrino elettronico',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Fai uno scontrino da 1,25 € su un reparto, pagamento POS.'] }
        ]
      },
      {
        phase: 'Scontrini',
        title: 'Annulla lo scontrino',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: EMOTIQ_ANNULLO }
        ]
      },
      {
        phase: 'Registrazione',
        title: 'Registra la verifica',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '825' }, { k: 'SBT' }, { n: '15290', cap: 'codice' }, { k: 'SBT' }] },
          { type: 'seq', label: 'Poi:', seq: [{ t: 'C.F. tecnico' }, { t: 'P.IVA laboratorio' }, { k: 'SBT' }] },
          { type: 'seq', label: 'Scegli il tipo di intervento:', seq: [
            { k: '+ / −', cap: 'scorri le opzioni' }, { m: 'VER. PERIODICA POS.' }, { k: 'SBT' },
            { t: 'scrivi OK' }, { k: 'SBT' }
          ] }
        ]
      },
      {
        phase: 'Registrazione',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ k: 'CHIUSURA', cap: 'tieni premuto 3 secondi' }] }
        ]
      },
      {
        phase: 'Consegna',
        title: 'Scontrino per la check-list',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '808' }, { k: 'SBT' }] },
          { type: 'note', kind: 'info', text: 'Attacca lo scontrino alla check-list.' }
        ]
      },
      {
        phase: 'Consegna',
        title: 'Consegna al cliente',
        where: 'printer',
        blocks: [
          { type: 'list', items: [
            'Lascia tutte le prove al cliente da conservare.',
            'Compila la check-list.'
          ] }
        ]
      }
    ]
  },

  {
    id: 'emotiq-dgfe',
    name: 'Estensione DGFE Emotiq',
    brand: 'Emotiq',
    category: 'Sostituzione DGFE',
    menu: 'Emotiq (estensione)',
    summary: 'Estensione della DGFE dall\'app, scaricamento con la chiusura e controllo finale.',
    needs: ['Telefono con l\'app / portale EmotiqMe', 'Matricola della macchina'],
    legend: EMOTIQ_LEGEND,
    steps: [
      {
        phase: 'Estensione',
        title: 'Estendi la DGFE',
        where: 'web',
        blocks: [
          { type: 'list', items: [
            'Apri l\'app sul telefono (portale EmotiqMe).',
            'Nella zona DGFE inserisci la matricola della macchina.',
            'Conferma l\'acquisto dell\'estensione DGFE.'
          ] }
        ]
      },
      {
        phase: 'Scaricamento',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ k: 'CHIUSURA', cap: 'tieni premuto 3 secondi' }] },
          { type: 'list', items: [
            'La cassa si collega da sola al server e scarica l\'estensione.',
            'Quando compare INVIATO CON SUCCESSO stacca il foglietto: è la chiusura che il cliente deve allegare alla chiusura della sera.'
          ] },
          { type: 'note', kind: 'warn', text: 'Se la DGFE è esaurita la cassa non permette la chiusura. In quel caso, dopo l\'estensione dall\'app, usa questa sequenza al posto della chiusura:' },
          { type: 'seq', seq: [{ n: '823' }, { k: 'SBT' }, { n: '15290', cap: 'codice' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Controllo',
        title: 'Controllo estensione',
        where: 'printer',
        intro: 'Quando compare ESTENSIONE DGFE:',
        blocks: [
          { type: 'seq', seq: [{ n: '808' }, { k: 'SBT' }] },
          { type: 'list', items: ['Attacca tutto lo scontrino sul foglio dell\'estensione DGFE.'] }
        ]
      },
      {
        phase: 'Controllo',
        title: 'Verifica il QR code',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Inquadra il QR code e controlla che si sia aggiornato.'] }
        ]
      }
    ]
  },

  {
    id: 'emotiq-annullo',
    name: 'Annullo scontrino Emotiq',
    brand: 'Emotiq',
    category: 'Annullo scontrino',
    menu: 'Emotiq',
    summary: 'Annullamento di uno scontrino, con ristampa se il cliente non ha lo scontrino.',
    legend: EMOTIQ_LEGEND,
    steps: [
      {
        phase: 'Dati scontrino',
        title: 'Ristampa gli scontrini del giorno',
        where: 'printer',
        intro: 'Solo se il cliente non ha lo scontrino: ristampa gli scontrini di quel giorno per trovare il numero.',
        blocks: [
          { type: 'seq', seq: [
            { n: '712' }, { k: 'SBT' }, { t: 'data di emissione' }, { k: 'SBT' },
            { t: 'ripeti la data' }, { k: 'SBT' }, { n: '0' }, { k: 'SBT' }, { k: 'SBT' }
          ] },
          { type: 'note', kind: 'tip', text: 'Se hai lo scontrino, passa direttamente allo step successivo.' }
        ]
      },
      {
        phase: 'Annullo',
        title: 'Annulla lo scontrino',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: EMOTIQ_ANNULLO },
          { type: 'note', kind: 'info', text: 'Il numero documento sono le 8 cifre, senza il trattino.' }
        ]
      }
    ]
  },

  {
    id: 'emotiq-ripristino',
    name: 'Ripristino Opera',
    brand: 'Emotiq',
    category: 'Assistenza',
    menu: 'Emotiq · Ripristino Opera',
    summary: 'Reimpostazione di data, ora e dati fiscali dopo un reset della cassa.',
    needs: ['C.F. e P.IVA del cliente'],
    legend: EMOTIQ_LEGEND,
    steps: [
      {
        phase: 'Data e ora',
        title: 'Data',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ t: 'data di oggi' }, { k: 'SBT' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Data e ora',
        title: 'Ora',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ t: 'ora, minuti, secondi', cap: 'secondi 00' }, { k: 'SBT' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Dati fiscali',
        title: 'C.F. e P.IVA',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ t: 'C.F.' }, { k: 'SBT' }, { t: 'P.IVA' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Verifica',
        title: 'Verifica periodica',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Fai la verifica periodica (procedura "Verifica periodica Nota / Model M / Opera 57").'] },
          { type: 'note', kind: 'warn', text: 'Dopo ogni reset della cassa va sempre fatta una verifica periodica.' }
        ]
      }
    ]
  },

  {
    id: 'emotiq-non-invia',
    name: 'Opera non invia',
    brand: 'Emotiq',
    category: 'Assistenza',
    menu: 'Emotiq · Opera non invia',
    summary: 'Controllo della rete, ricollegamento e invio dei corrispettivi sospesi.',
    needs: ['Nome (SSID) e password della rete del cliente'],
    legend: EMOTIQ_LEGEND,
    steps: [
      {
        phase: 'Controllo',
        title: 'Controlla il display',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Verifica se sul display compaiono i 2 triangolini sovrapposti.'] }
        ]
      },
      {
        phase: 'Controllo',
        title: 'Test di rete',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '685' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Rete',
        title: 'Verifica le reti',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '826' }, { k: 'SBT' }, { n: '15290', cap: 'codice' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Rete',
        title: 'Collegati alla rete',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Collega la cassa a una rete usando SSID e password.'] }
        ]
      },
      {
        phase: 'Rete',
        title: 'Test di rete',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '685' }, { k: 'SBT' }] }
        ]
      },
      {
        phase: 'Invio',
        title: 'Invia i corrispettivi',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '688' }, { k: 'SBT' }] }
        ]
      }
    ]
  },

  {
    id: 'emotiq-disattivazione',
    name: 'Disattivazione Emotiq',
    brand: 'Emotiq',
    category: 'Altre procedure',
    menu: 'Emotiq · Disattivazione',
    summary: 'Chiusura e disattivazione della cassa.',
    needs: ['C.F. del tecnico e P.IVA del laboratorio'],
    legend: EMOTIQ_LEGEND,
    steps: [
      {
        phase: 'Chiusura',
        title: 'Chiusura',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ k: 'CHIUSURA', cap: 'tieni premuto 3 secondi' }] }
        ]
      },
      {
        phase: 'Disattivazione',
        title: 'Disattiva la cassa',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [
            { n: '684' }, { k: 'SBT' }, { t: 'C.F. tecnico' }, { k: 'SBT' }, { t: 'P.IVA laboratorio' }, { k: 'SBT' }
          ] }
        ]
      }
    ]
  },

  // ---------- Epson ----------

  {
    id: 'epson-annullo',
    name: 'Annullo scontrino Epson',
    brand: 'Epson',
    category: 'Annullo scontrino',
    menu: 'Epson',
    summary: 'Annullamento di uno scontrino.',
    steps: [
      {
        phase: 'Annullo',
        title: 'Avvia l\'annullo',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '2222' }, { key: true }, { n: '91' }, { t: 'matricola' }, { k: 'CONTANTE' }] }
        ]
      },
      {
        phase: 'Annullo',
        title: 'Inserisci i dati',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Inserisci la data e tutto quello che viene richiesto.'] },
          { type: 'seq', label: 'Alla fine chiede AZZERAMENTO?', seq: [{ k: 'VOID' }] }
        ]
      }
    ]
  },

  // ---------- RCH ----------

  {
    id: 'rch-tasto',
    name: 'Programmazione nuovo tasto RCH Print F',
    brand: 'RCH',
    category: 'Altre procedure',
    menu: 'RCH Print F · Nuovo tasto',
    summary: 'Assegnazione di una funzione a un tasto.',
    steps: [
      {
        phase: 'Programmazione',
        title: 'Entra in programmazione',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '5' }, { key: true }, { n: '555', cap: 'password' }] }
        ]
      },
      {
        phase: 'Programmazione',
        title: 'Programma il tasto',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '996' }, { k: 'CONTANTE', x: 2 }, { t: 'codice funzione' }] },
          { type: 'list', items: ['Premi il tasto dove vuoi mettere la nuova funzione.'] }
        ]
      },
      {
        phase: 'Programmazione',
        title: 'Esci',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Per uscire spegni e riaccendi la macchina.'] }
        ]
      }
    ]
  }
];

/*
 * Pagine di consultazione (sezione "Consultazione" in home).
 * Ogni pagina ha delle sezioni, ogni sezione dei gruppi con l'elenco
 * [codice, descrizione] oppure [codice, descrizione, { seq, note }]
 * per mostrare anche la sequenza dei tasti. Il codice può essere vuoto.
 * seq di una sezione: sequenza valida per tutti i codici della sezione.
 */

// Funzioni della Custom (stampate dalla cassa: liste X00, P000 e Z00)

const CUSTOM_FUNCTIONS = [
  {
    id: 'x',
    name: 'Report X',
    note: 'Letture: non azzerano i totali.',
    groups: [
      { title: 'Visualizzazioni', items: [
        ['X05', 'NETTO FISCALE'],
        ['X06', 'TOTALE CASSETTO']
      ] },
      { title: 'Rapporti', items: [
        ['X01', 'INFORMAZIONI ECR'],
        ['X03', 'INFORMAZIONI ECR EXT'],
        ['X10', 'FINANZIARIO GENERALE'],
        ['X20', 'REPARTI GIORNO'],
        ['X21', 'REPARTI PERIODO'],
        ['X22', 'GRUPPI REP. GIORNO'],
        ['X23', 'GRUPPI REP. PERIODO'],
        ['X24', 'REPARTO SPECIFICO'],
        ['X30', 'PLU GIORNO'],
        ['X31', 'PLU PERIODO'],
        ['X41', 'ATTIVITÀ ORARIA'],
        ['X50', 'IVA GIORNO'],
        ['X51', 'IVA PERIODO'],
        ['X60', 'GENERALE CLIENTI'],
        ['X61', 'CLIENTE SPECIFICO'],
        ['X62', 'PAGAMENTI PERIODO'],
        ['X65', 'PDF ONLINE INFO'],
        ['X66', 'PDF ONLINE READ'],
        ['X68', 'VALUTE GIORNO'],
        ['X69', 'M.DETT. REC.LOTTERIA'],
        ['X70', 'LETT.M.DETT. SMART'],
        ['X73', 'LETT.M.DETT. DEMO MODE'],
        ['X74', 'M.DETT. CHIUSURE PER NUMERO'],
        ['X75', 'M.DETT. CHIUSURE PER DATA'],
        ['X76', 'M.DETT. NCHI->NSCO'],
        ['X77', 'M.DETT. ULTIMO SCONTR.'],
        ['X78', 'LETT.GLOB. M.DETT. DATA'],
        ['X79', 'M.DETT. Z IN CORSO'],
        ['X80', 'LETT.TOTALE M.DETT.'],
        ['X81', 'LETT.M.DETT. DATA'],
        ['X82', 'M.DETT. DATA->NSCO'],
        ['X83', 'LETT.INFO.M.DETT.'],
        ['X86', 'LETT.M.DETT. DATA NOF'],
        ['X87', 'M.DETT. DATA->NSCO NOF'],
        ['X88', 'LETT.M.DETT. DATA NOTAC'],
        ['X89', 'M.DETT. DATA->NSCO NOTA'],
        ['X90', 'GENERALE OPERATORI'],
        ['X91', 'OPERATORE SPECIFICO'],
        ['X92', 'OPERATORE ATTIVO'],
        ['X93', 'M.RIEP. INT.TECNICI'],
        ['X94', 'M.RIEP. VERIF. PER.'],
        ['X95', 'M.RIEP. UPGRADE FW.'],
        ['X96', 'M.RIEP. TRA NUMERI'],
        ['X97', 'M.RIEP. TRA DATE'],
        ['X98', 'M.RIEP. SOMMA TRA DATE'],
        ['X99', 'M.RIEP. SOMMA TRA NUMERI']
      ] }
    ]
  },
  {
    id: 'p',
    name: 'Programmazioni',
    seq: [{ key: true }, { k: 'PROGRAMMAZIONE' }, { n: 'codice' }, { k: 'SUBTOT' }],
    groups: [
      { title: 'Generali', items: [
        ['001', 'LISTA PROG. OPZ.GEN.'],
        ['002', 'LISTA CONFIG. TAST.'],
        ['003', 'LISTA ICONE DISPON.'],
        ['010', 'ORA'],
        ['011', 'DATA'],
        ['013', 'NUMERO CASSA'],
        ['014', 'DISPOSIZIONE TASTI'],
        ['015', 'CONFIGURA TASTIERA'],
        ['016', 'TABELLA ALIQUOTE IVA'],
        ['018', 'PARAMETRI STAMPANTE'],
        ['019', 'CONFIGURAZ.GENERALI'],
        ['020', 'CONFIGURAZ.SCONTRINO'],
        ['021', 'INTEST. SCONTRINO'],
        ['023', 'MESS. FINE SCONTRINO'],
        ['024', 'CODICE ICONA PERIODO'],
        ['028', 'CANCELLAZIONE ICONE'],
        ['040', 'PROG. CODICI ATECO'],
        ['041', 'MULTISCONTRINO'],
        ['042', 'RAPP.GEST.AUTOMATICI'],
        ['060', 'ELENCO FUNZ.MULTIPLE'],
        ['061', 'CREAZ. FUNZ.MULTIPLA'],
        ['062', 'CANC. FUNZ.MULTIPLE'],
        ['070', 'FATTURE']
      ] },
      { title: 'Reparti e PLU', items: [
        ['100', 'LISTA PROG. REPARTI'],
        ['110', 'CONFIG.GLOBALE REP.'],
        ['120', 'PROG. REPARTI'],
        ['131', 'DESC. GRUPPI REPARTI'],
        ['133', 'DESC. GRUPPI STAMPA'],
        ['200', 'LISTA PROG. PLU'],
        ['201', 'ELENCO PLU'],
        ['220', 'CREAZ. PLU'],
        ['221', 'PLU DIRETTI'],
        ['290', 'CANC. PARZ. PLU'],
        ['291', 'CANC.TOT.ARC.PLU']
      ] },
      { title: 'Operatori e clienti', items: [
        ['300', 'LISTA PROG.OPERATORI'],
        ['302', 'ELENCO CLIENTI'],
        ['310', 'ABIL. GEST.OPERATORI'],
        ['312', 'CONFIG.GEST.CLIENTI'],
        ['314', 'LOTTERIA'],
        ['320', 'COD/SIGLA ACCESSO OP'],
        ['323', 'CANCELLA OPERATORI'],
        ['340', 'DATI CLIENTE'],
        ['390', 'CANC. PARZ. CLIENTI'],
        ['391', 'CANC. TOTALE CLIENTI']
      ] },
      { title: 'Sconti, cassa e pagamenti', items: [
        ['400', 'LISTA PROG.SCO/MAGG.'],
        ['410', 'SCONTO SU SUBTOTALE'],
        ['420', 'PROGR. SCO/MAGG'],
        ['500', 'LISTA PROG.OP.CASSA'],
        ['501', 'MSG. DISPLAY CLIENTE'],
        ['510', 'ABIL.GEST.FONDOCASSA'],
        ['519', 'CONFIG.OPERAZ.CASSA'],
        ['520', 'MODAL.PAGAMENTO'],
        ['530', 'RAPPORTO CAMBIO VAL.'],
        ['550', 'DIGITA PASSWORD UTEN'],
        ['551', 'CAMBIO PASSWORD UTEN']
      ] },
      { title: 'Tecnico e fiscale', items: [
        ['601', 'SCADENZA ASS.TECNICA'],
        ['609', 'GLOBAL TEST'],
        ['612', 'TEST STAMPANTE'],
        ['623', 'CHECK DISKS'],
        ['647', 'PROFILO USBDEVICE'],
        ['668', 'ZINT TEST'],
        ['669', 'TEST MECC. STAMPA'],
        ['690', 'FISCALIZZAZIONE'],
        ['691', 'SERIALIZZAZIONE'],
        ['692', 'FORMATTAZIONE MMC'],
        ['693', 'INIZIALIZZA M.DETT.'],
        ['698', 'VERIFICA CONNESSIONI'],
        ['699', 'SERVIZI TELEMATICI']
      ] },
      { title: 'Comunicazione', items: [
        ['900', 'LISTA PROG. COMUNIC.'],
        ['902', 'PROG. SLOT SERIALI'],
        ['910', 'PARAMETRI COMUNICAZ.'],
        ['911', 'ETHERNET'],
        ['912', 'WI-FI'],
        ['913', 'BLUETOOTH'],
        ['916', 'WEBSERVER'],
        ['917', 'CUSTOM PAY']
      ] }
    ]
  },
  {
    id: 'z',
    name: 'Azzeramenti Z',
    note: 'Azzerano i totali: usali solo quando serve.',
    groups: [
      { title: 'Azzeramenti', items: [
        ['Z01', 'CHIUSURA FISCALE'],
        ['Z20', 'REPARTI PERIODO'],
        ['Z21', 'PLU PERIODO'],
        ['Z41', 'ATTIVITÀ ORARIA'],
        ['Z51', 'IVA PERIODO'],
        ['Z60', 'TOTALIZZ. CLIENTI'],
        ['Z61', 'MODALITÀ PAGAMENTO'],
        ['Z92', 'TOTALIZZ. OPERATORE']
      ] }
    ]
  }
];

// Funzioni utili delle casse Emotiq
const EMOTIQ_FUNCTIONS = [
  {
    id: 'rete',
    name: 'Rete e invio',
    groups: [
      { items: [
        ['833', 'CONNESSIONE WI-FI', { seq: [
          { n: '833' }, { k: 'SBT' }, { n: '15290' }, { k: 'SBT' }, { m: 'WIFI 1' }, { k: 'SBT' }, { m: 'ELENCO RETI' },
          { t: 'n. della rete' }, { k: 'SBT' }, { t: 'password' }, { k: 'SBT' }
        ], note: 'Aspetta che la cassa stampi l\'elenco delle reti, poi digita il numero della rete.' }],
        ['685', 'TEST DI RETE', { seq: [{ n: '685' }, { k: 'SBT' }], note: 'Se non funziona, riprova.' }],
        ['688', 'INVIO SOSPESI', { seq: [{ n: '688' }, { k: 'SBT' }], note: 'Prima controlla che la cassa sia connessa con il test di rete 685.' }],
        ['826', 'VERIFICA RETI', { seq: [{ n: '826' }, { k: 'SBT' }, { n: '15290' }, { k: 'SBT' }] }]
      ] }
    ]
  },
  {
    id: 'scontrini',
    name: 'Scontrini e chiusure',
    groups: [
      { items: [
        ['87', 'ANNULLO SCONTRINO', { seq: EMOTIQ_ANNULLO, note: 'Il numero documento sono le 8 cifre, senza il trattino.' }],
        ['88', 'SCONTRINO LOTTERIA', { seq: [{ n: '88' }, { k: 'SBT' }] }],
        ['712', 'RISTAMPA SCONTRINI DI UN GIORNO', { seq: [
          { n: '712' }, { k: 'SBT' }, { t: 'data' }, { k: 'SBT' }, { t: 'ripeti la data' }, { k: 'SBT' }, { n: '0' }, { k: 'SBT' }, { k: 'SBT' }
        ], note: 'Utile se il cliente non ha lo scontrino da annullare.' }],
        ['714', 'RISTAMPA CHIUSURE', { seq: [
          { n: '714' }, { k: 'SBT' }, { t: 'data' }, { k: 'SBT' }, { t: 'ripeti la data' }, { k: 'SBT' }, { n: '0' }, { k: 'SBT' }, { k: 'SBT' }
        ] }],
        ['', 'CHIUSURA', { seq: [{ k: 'CHIUSURA', cap: 'tieni premuto 3 secondi' }], note: 'Tasto punto con sopra la freccia.' }]
      ] }
    ]
  },
  {
    id: 'config',
    name: 'Configurazione',
    groups: [
      { items: [
        ['', 'TOGLIERE IL LIMITE PER UNA BATTUTA', { seq: [{ k: 'CHIUSURA', cap: 'premi una volta' }, { t: 'batti lo scontrino' }] }],
        ['601', 'TOGLIERE IL LIMITE PERMANENTEMENTE', { seq: [
          { n: '601' }, { k: 'SBT' }, { t: 'reparto che ti interessa' }, { k: 'SBT', cap: 'per spostarti' }, { m: 'LIMITE' }
        ] }],
        ['638', 'TOGLIERE IL LOGO DALLO SCONTRINO', { seq: [{ n: '638' }, { k: 'SBT' }, { n: '0' }, { k: 'SBT' }] }],
        ['309', 'METTERE LA VIRGOLA DECIMALE', { seq: [{ n: '309' }, { k: 'SBT' }, { n: '1' }] }],
        ['609', 'GESTIONE OPERATORI', { seq: [{ n: '609' }, { k: 'SBT' }] }]
      ] }
    ]
  },
  {
    id: 'tecnico',
    name: 'Tecnico',
    groups: [
      { items: [
        ['808', 'MODELLO, SOFTWARE E SCADENZA VERIFICA', { seq: [{ n: '808' }, { k: 'SBT' }] }],
        ['827', 'AGGIORNAMENTO SOFTWARE', { seq: [{ n: '827' }, { k: 'SBT' }] }],
        ['825', 'REGISTRAZIONE VERIFICA PERIODICA', { seq: [
          { n: '825' }, { k: 'SBT' }, { n: '15290' }, { k: 'SBT' }, { t: 'C.F. tecnico' }, { t: 'P.IVA lab.' }, { k: 'SBT' },
          { k: '+ / −' }, { m: 'VER. PERIODICA POS.' }, { k: 'SBT' }, { t: 'OK' }, { k: 'SBT' }
        ] }],
        ['823', 'ESTENSIONE CON DGFE ESAURITA', { seq: [{ n: '823' }, { k: 'SBT' }, { n: '15290' }, { k: 'SBT' }], note: 'Dopo aver esteso la DGFE dall\'app, quando la cassa non permette la chiusura.' }],
        ['684', 'DISATTIVAZIONE', { seq: [
          { n: '684' }, { k: 'SBT' }, { t: 'C.F. tecnico' }, { k: 'SBT' }, { t: 'P.IVA laboratorio' }, { k: 'SBT' }
        ], note: 'Fai prima la chiusura.' }]
      ] }
    ]
  }
];

const FUNCTION_PAGES = [
  {
    id: 'custom',
    name: 'Funzioni Custom',
    meta: 'Codici report X, programmazioni e azzeramenti Z',
    intro: 'Elenco dei codici disponibili sulla cassa Custom.',
    sections: CUSTOM_FUNCTIONS
  },
  {
    id: 'emotiq',
    name: 'Funzioni Emotiq',
    meta: 'Funzioni utili con la sequenza dei tasti',
    intro: 'Funzioni utili delle casse Emotiq. SBT = subtotale.',
    sections: EMOTIQ_FUNCTIONS
  }
];
