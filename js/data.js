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

// Labware Basiq: legenda dei tasti
const LABWARE_LEGEND = [
  { tok: { key: true }, text: 'Tasto chiave: Chiave 1 = X, Chiave 2 = Z, Chiave 3 = SET' },
  { tok: { k: 'CONTANTI' }, text: 'Conferma e passa al campo successivo' },
  { tok: { k: 'ANNULLO SCONTRINO' }, text: 'Conferma le operazioni verso l\'AdE (50-63, 80)' },
  { tok: { k: 'FN' }, text: 'Seconda funzione del tasto' }
];

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
  'Disattivazione',
  'Cambio ragione sociale',
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
            ['3', '4%'],
            ['8', 'Forfettario']
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

  {
    id: 'custom-big-disattivazione',
    name: 'Disattivazione Custom Big',
    brand: 'Custom',
    category: 'Disattivazione',
    menu: 'Custom Big',
    summary: 'Disattivazione dal menu tecnico dei servizi telematici.',
    legend: [
      { tok: { key: true }, text: 'Tasto chiave' },
      { tok: { k: 'PROGRAMMAZIONE' }, text: 'Tasto programmazione' },
      { tok: { k: 'SUBTOT' }, text: 'Conferma (SBT)' },
      { tok: { n: '00' }, text: 'Sposta tra le opzioni' }
    ],
    steps: [
      {
        phase: 'Menu tecnico',
        title: 'Servizi telematici',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { k: 'PROGRAMMAZIONE' }, { n: '699' }, { k: 'SUBTOT' }] }
        ]
      },
      {
        phase: 'Menu tecnico',
        title: 'Menu tecnico',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ m: 'MENU TECNICO' }, { k: 'SUBTOT' }] }
        ]
      },
      {
        phase: 'Disattivazione',
        title: 'Evento',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '00', cap: 'fino a EVENTO' }, { m: 'EVENTO' }, { k: 'SUBTOT' }] }
        ]
      },
      {
        phase: 'Disattivazione',
        title: 'Disattivazione',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '00', cap: 'fino a DISATTIVAZIONE' }, { m: 'DISATTIVAZIONE' }, { k: 'SUBTOT' }] }
        ]
      },
      {
        phase: 'Disattivazione',
        title: 'Codice e note',
        where: 'printer',
        blocks: [
          { type: 'table', head: ['Campo', 'Valore'], rows: [
            ['Codice', 'ALTRO'],
            ['Note', 'Vuoto, oppure il motivo (es. chiusura attività)']
          ] }
        ]
      },
      {
        phase: 'Conferma',
        title: 'Conferma',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '00', cap: 'fino a SÌ' }, { m: 'SÌ' }, { k: 'SUBTOT' }] }
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
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '18' }, { k: 'ANNULLO' }] },
          { type: 'note', kind: 'info', text: 'Z 18 = inizializzazione DGFE: la cassa stampa uno scontrino con numero DGFE, data, ora di attivazione e matricola.' }
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
    name: 'Preparazione Labware Basiq',
    brand: 'Labware',
    category: 'Preparazione',
    menu: 'Labware Basiq',
    summary: 'Data e ora, rete, censimento, attivazione, aggiornamenti, intestazione, aliquote IVA e reparti.',
    needs: [
      'Cassa collegata a internet (porta LAN1)',
      'C.F. del tecnico abilitato e P.IVA del centro assistenza',
      'P.IVA del cliente e dati per l\'intestazione',
      'Reparti e aliquote IVA del cliente'
    ],
    legend: LABWARE_LEGEND,
    steps: [
      {
        phase: 'Data e ora',
        title: 'Data e ora',
        where: 'printer',
        blocks: [
          { type: 'seq', label: 'Entra in programmazione (SET), codice 01:', seq: [{ key: true }, { n: '3' }, { key: true }, { n: '01' }] },
          { type: 'seq', label: 'Data:', seq: [{ t: 'GGMMAAAA' }, { k: 'FN' }, { k: ',' }] },
          { type: 'note', kind: 'info', text: 'Se compare PRIMA CONFERMA (data più avanti di oltre un giorno), ricontrolla la data e premi 2 volte SUB-TOTALE: compaiono SECONDA CONFERMA e DATA CONFERMATA.' },
          { type: 'seq', label: 'Ora:', seq: [{ k: 'CONTANTI' }, { t: 'HHMM' }, { k: 'FN' }, { k: ',' }] },
          { type: 'note', kind: 'warn', text: 'Si può fare solo dopo una chiusura. Non si può mettere una data precedente all\'ultima operazione fiscale: un errore sulla data può bloccare la cassa in modo irreparabile.' }
        ]
      },
      {
        phase: 'Rete',
        title: 'Indirizzo IP',
        where: 'printer',
        intro: 'Serve solo se la rete del cliente non assegna l\'indirizzo in automatico.',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '3' }, { key: true }, { n: '22' }] },
          { type: 'table', head: ['Campo', 'Esempio'], rows: [
            ['Abilita DHCP', '0 = no, 1 = sì'],
            ['Indirizzo IP', '192168001025'],
            ['Subnet mask', '255255255000'],
            ['Gateway', '192168001254'],
            ['DNS 1', '008008008008'],
            ['DNS 2', '008008004004']
          ] },
          { type: 'note', kind: 'info', text: 'Gli indirizzi si scrivono senza punti, completando ogni gruppo con gli zeri. Conferma ogni campo con CONTANTI; alla fine premi di nuovo CONTANTI per tornare al menu SET.' }
        ]
      },
      {
        phase: 'Censimento',
        title: 'Censimento',
        where: 'printer',
        intro: 'Seleziona la tastiera dal menu (le 3 linee).',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '50' }] },
          { type: 'table', head: ['Dato richiesto', ''], rows: [
            ['C.F. tecnico abilitato', 'poi CONTANTI'],
            ['P.IVA centro assistenza', 'poi CONTANTI']
          ] },
          { type: 'seq', label: 'Conferma:', seq: [{ k: 'ANNULLO SCONTRINO' }] },
          { type: 'note', kind: 'info', text: 'A censimento riuscito la cassa salva il certificato del dispositivo, valido 8 anni.' }
        ]
      },
      {
        phase: 'Attivazione',
        title: 'Attivazione',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '53' }] },
          { type: 'table', head: ['Dato richiesto', ''], rows: [
            ['P.IVA esercente', 'poi CONTANTI'],
            ['C.F. tecnico abilitato', 'poi CONTANTI'],
            ['P.IVA centro assistenza', 'poi CONTANTI']
          ] },
          { type: 'seq', label: 'Conferma:', seq: [{ k: 'ANNULLO SCONTRINO' }] },
          { type: 'note', kind: 'info', text: 'Il 53 attiva la cassa e la mette subito in servizio. Per comunicare una data di messa in servizio futura si usa il 51.' }
        ]
      },
      {
        phase: 'Aggiornamenti',
        title: 'Aggiornamento firmware (parte fiscale)',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '80' }, { k: 'ANNULLO SCONTRINO' }] },
          { type: 'seq', label: 'Finito lo scaricamento, conferma:', seq: [{ key: true, cap: 'oppure CL per annullare' }] },
          { type: 'note', kind: 'warn', text: 'Non spegnere la cassa: durante l\'aggiornamento il led frontale lampeggia blu. Alla fine torna da sola in REG.' }
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
        phase: 'Programmazione',
        title: 'Intestazione (ragione sociale)',
        where: 'printer',
        intro: '10 righe da 48 caratteri. Con CONTANTI passi alla riga successiva.',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '16' }, { k: 'CONTANTI' }, { t: 'righe intestazione' }] },
          { type: 'table', head: ['Tasto', 'Funzione'], rows: [
            ['%+ / %-', 'Sposta il cursore a destra / sinistra'],
            ['FN + 7', 'Centra la riga'],
            ['FN + 5', 'Cancella la riga'],
            ['SUB-TOTALE', 'Stampa le righe per controllarle']
          ] },
          { type: 'seq', label: 'Alla fine, per tornare in REG:', seq: [{ key: true }] },
          { type: 'note', kind: 'warn', text: 'Si può fare solo se dopo l\'ultima chiusura non sono stati emessi scontrini: altrimenti fai prima la chiusura giornaliera.' }
        ]
      },
      {
        phase: 'Programmazione',
        title: 'Aliquote IVA',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '3' }, { key: true }, { n: '05' }] },
          { type: 'list', items: ['Per ogni gruppo IVA (1, 2, 3…) scrivi l\'aliquota e premi CONTANTI.'] },
          { type: 'table', head: ['Codice esenzione', 'Natura'], rows: [
            ['0 · EE', 'N1 escluse ex art. 15'],
            ['1 · NS', 'N2 non soggette'],
            ['2 · NI', 'N3 non imponibili'],
            ['3 · ES', 'N4 esenti'],
            ['4 · RM', 'N5 regime del margine'],
            ['5 · AL', 'N6 altro non IVA']
          ] }
        ]
      },
      {
        phase: 'Programmazione',
        title: 'Reparti',
        where: 'printer',
        intro: 'Programma i reparti con prezzi e IVA corretti.',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '3' }, { key: true }, { n: '02' }] },
          { type: 'table', head: ['Campo', 'Come'], rows: [
            ['Numero reparto', 'Numero, poi CONTANTI'],
            ['Descrizione', 'Max 20 caratteri, poi CONTANTI'],
            ['Prezzo', 'Prezzo unitario, poi CONTANTI'],
            ['Articolo singolo', 'FN + , per SÌ/NO, poi CONTANTI'],
            ['Gruppo IVA', 'Numero del gruppo (1-10), poi CONTANTI'],
            ['Limite prezzo', '0 = nessun controllo, poi CONTANTI'],
            ['Unità di misura · Bene/Servizio/Ventilazione', 'CONTANTI passa al reparto successivo']
          ] },
          { type: 'note', kind: 'tip', text: 'Per stampare i reparti programmati, da SET 02 premi SUB-TOTALE. Per passare a un\'altra programmazione premi , seguito dal codice.' }
        ]
      }
    ]
  },

  {
    id: 'labware-disattivazione',
    name: 'Disattivazione Labware Smart RT / Basiq',
    brand: 'Labware',
    category: 'Disattivazione',
    menu: 'Labware Smart RT / Basiq',
    summary: 'Disattivazione della cassa all\'Agenzia delle Entrate.',
    needs: ['C.F. del tecnico abilitato e P.IVA del centro assistenza'],
    steps: [
      {
        phase: 'Disattivazione',
        title: 'Disattiva la cassa',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '55' }] },
          { type: 'table', head: ['Dato richiesto', ''], rows: [
            ['C.F. tecnico abilitato', 'poi CONTANTI'],
            ['P.IVA centro assistenza', 'poi CONTANTI']
          ] },
          { type: 'seq', label: 'Conferma:', seq: [{ k: 'ANNULLO', cap: 'ANNULLO SCONTRINO sulla Basiq' }] },
          { type: 'note', kind: 'info', text: '55 = disattivazione per cessione. Per un altro motivo si usa il 56, che chiede di scrivere il motivo. Dopo la disattivazione la cassa non è più associata all\'esercente.' }
        ]
      }
    ]
  },

  {
    id: 'labware-annullo',
    name: 'Annullo scontrino Labware Basiq',
    brand: 'Labware',
    category: 'Annullo scontrino',
    menu: 'Labware Basiq',
    summary: 'Documento commerciale di annullamento di uno scontrino già emesso.',
    legend: LABWARE_LEGEND,
    steps: [
      {
        phase: 'Annullo',
        title: 'Avvia l\'annullo',
        where: 'printer',
        intro: 'Tieni a portata di mano lo scontrino da annullare. La cassa deve essere in REG.',
        blocks: [
          { type: 'seq', seq: [{ k: 'ANNULLO' }] }
        ]
      },
      {
        phase: 'Annullo',
        title: 'Matricola',
        where: 'printer',
        intro: 'Il display mostra la matricola della cassa.',
        blocks: [
          { type: 'seq', seq: [{ k: ',', cap: 'conferma' }] },
          { type: 'note', kind: 'info', text: 'Se lo scontrino è di un\'altra Basiq, scrivi la sua matricola e conferma con ,.' }
        ]
      },
      {
        phase: 'Annullo',
        title: 'Numero del documento',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ t: 'n. chiusura' }, { t: 'n. documento' }, { k: ',' }] },
          { type: 'note', kind: 'info', text: 'Sullo scontrino: Doc. N. 0002-0010 → chiusura 0002, documento 0010.' }
        ]
      },
      {
        phase: 'Annullo',
        title: 'Data del documento',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ t: 'GGMMAAAA' }, { k: ',' }] },
          { type: 'note', kind: 'info', text: 'La cassa cerca lo scontrino nel DGFE e stampa il documento commerciale emesso per ANNULLAMENTO.' }
        ]
      }
    ]
  },

  {
    id: 'labware-pendenti',
    name: 'Corrispettivi non inviati Labware Basiq',
    brand: 'Labware',
    category: 'Assistenza',
    menu: 'Labware · Corrispettivi non inviati',
    summary: 'Controllo e invio forzato dei corrispettivi e delle lotterie pendenti.',
    legend: LABWARE_LEGEND,
    steps: [
      {
        phase: 'Controllo',
        title: 'Stampa i pendenti',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '42' }, { k: 'CONTANTI' }] },
          { type: 'note', kind: 'info', text: 'Stampa l\'elenco dei corrispettivi e delle lotterie non ancora trasmessi all\'AdE.' }
        ]
      },
      {
        phase: 'Invio',
        title: 'Invia i pendenti',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '40' }, { k: 'CONTANTI' }] },
          { type: 'note', kind: 'info', text: 'Durante la trasmissione il led frontale diventa giallo.' }
        ]
      },
      {
        phase: 'Invio',
        title: 'Invio di un singolo corrispettivo',
        where: 'printer',
        intro: 'Solo se un corrispettivo resta pendente.',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '41' }, { k: 'CONTANTI' }, { t: 'n. corrispettivo' }, { k: 'CONTANTI' }] },
          { type: 'note', kind: 'info', text: 'Per una fornitura lotteria usa il codice 47 al posto del 41.' }
        ]
      },
      {
        phase: 'Controllo',
        title: 'Controlla gli esiti',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '43' }, { k: 'CONTANTI' }] },
          { type: 'note', kind: 'info', text: 'Stampa gli esiti degli invii dei corrispettivi (45 per le lotterie).' }
        ]
      }
    ]
  },

  {
    id: 'labware-fuori-servizio',
    name: 'Fuori servizio Labware Basiq',
    brand: 'Labware',
    category: 'Altre procedure',
    menu: 'Labware Basiq · Fuori servizio',
    summary: 'Segnalazione di fuori servizio all\'Agenzia delle Entrate (inattività o guasto).',
    legend: LABWARE_LEGEND,
    steps: [
      {
        phase: 'Fuori servizio',
        title: 'Segnala il fuori servizio',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ key: true }, { n: '2' }, { key: true }, { n: '61', cap: 'magazzino / inattività' }] },
          { type: 'table', head: ['Codice', 'Motivo'], rows: [
            ['61', 'Magazzino (inattività di almeno 12 giorni)'],
            ['62', 'Malfunzionamento'],
            ['63', 'Altro (chiede il motivo)']
          ] },
          { type: 'seq', label: 'Avanza e conferma:', seq: [{ k: 'CONTANTI', cap: 'avanza' }, { k: 'ANNULLO SCONTRINO', cap: 'conferma' }] },
          { type: 'note', kind: 'info', text: 'La cassa resta attiva e associata all\'esercente e torna in servizio da sola con la prima trasmissione dei corrispettivi.' }
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
    category: 'Disattivazione',
    menu: 'Emotiq',
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
 * Cambio ragione sociale: per ogni modello si riusano gli step delle altre procedure,
 * così restano allineati quando si modificano. stepsFrom(id, primo, ultimo, fase) prende
 * gli step dal titolo "primo" al titolo "ultimo" (compresi) e li mette nella fase indicata.
 */

function stepsFrom(id, first, last, phase) {
  var p = PRINTERS.filter(function (x) { return x.id === id; })[0];
  var titles = p.steps.map(function (st) { return st.title; });
  var a = titles.indexOf(first);
  var b = titles.indexOf(last, a);
  if (a === -1 || b === -1) throw new Error('stepsFrom: step non trovati in ' + id + ': ' + first + ' → ' + last);
  return p.steps.slice(a, b + 1).map(function (st) {
    return Object.assign({}, st, { phase: phase });
  });
}

PRINTERS.push(
  {
    id: 'labware-cambio-rs',
    name: 'Cambio ragione sociale Labware Smart RT',
    brand: 'Labware',
    category: 'Cambio ragione sociale',
    menu: 'Labware Smart RT',
    summary: 'Chiusura, disattivazione, sostituzione e inizializzazione DGFE, attivazione, nuova configurazione, aggiornamenti e verifica.',
    needs: [
      'DGFE nuova',
      'Piombo',
      'C.F. del tecnico e P.IVA di S.C.',
      'PC con la React app',
      'Dati della nuova ragione sociale'
    ],
    legend: PRINTERS.filter(function (p) { return p.id === 'smart'; })[0].legend,
    steps: [].concat(
      stepsFrom('labware-dgfe', 'Chiusura fiscale', 'Chiusura fiscale', 'Chiusura cassa'),
      stepsFrom('labware-disattivazione', 'Disattiva la cassa', 'Disattiva la cassa', 'Disattivazione'),
      stepsFrom('labware-dgfe', 'Spegni la macchina', 'Rimonta la macchina', 'DGFE'),
      stepsFrom('labware-basic', 'Attivazione', 'Attivazione', 'Attivazione cassa'),
      stepsFrom('smart', 'Nuovo modello', 'Configura la stampante', 'Nuova intestazione'),
      stepsFrom('smart', 'Aggiornamento tastiera', 'Aggiornamento software', 'Aggiornamento e verifica'),
      stepsFrom('smart', 'Scontrini di prova', 'Procedura finale', 'Aggiornamento e verifica')
    )
  },

  {
    id: 'custom-big-cambio-rs',
    name: 'Cambio ragione sociale Custom Big',
    brand: 'Custom',
    category: 'Cambio ragione sociale',
    menu: 'Custom Big',
    summary: 'Chiusura, disattivazione, sostituzione e attivazione DGFE, attivazione, nuova intestazione, aggiornamento e verifica.',
    needs: [
      'DGFE nuova',
      'PC con il programma RX Config',
      'Dati della nuova ragione sociale per l\'intestazione',
      'Accesso al portale Custom4U'
    ],
    legend: PRINTERS[0].legend,
    steps: [].concat(
      stepsFrom('custom-big', 'Chiusura cassa', 'Chiusura cassa', 'Chiusura cassa'),
      stepsFrom('custom-big-disattivazione', 'Servizi telematici', 'Conferma', 'Disattivazione'),
      [{
        phase: 'DGFE',
        title: 'Sostituisci la DGFE',
        where: 'printer',
        blocks: [
          { type: 'list', items: ['Sostituisci la DGFE con quella nuova.'] }
        ]
      }],
      stepsFrom('custom-big', 'Attivazione DGFE', 'Attivazione DGFE', 'DGFE'),
      stepsFrom('custom-big', 'Attivazione', 'Attivazione', 'Attivazione cassa'),
      stepsFrom('custom-big', 'Trova l\'indirizzo IP', 'Intestazione scontrino', 'Nuova intestazione'),
      stepsFrom('custom-big', 'Salva dati su stampante', 'Salva dati su stampante', 'Nuova intestazione'),
      stepsFrom('custom-verifica', 'Lancia l\'aggiornamento', 'Verifica QR code', 'Aggiornamento e verifica')
    )
  },

  {
    id: 'emotiq-cambio-rs',
    name: 'Cambio ragione sociale Emotiq',
    brand: 'Emotiq',
    category: 'Cambio ragione sociale',
    menu: 'Emotiq',
    summary: 'Chiusura, disattivazione, estensione DGFE, attivazione, nuova intestazione, aggiornamento e verifica.',
    needs: [
      'PC con Emotiq Tools',
      'P.IVA, C.F. e intestazione della nuova ragione sociale',
      'C.F. del tecnico e P.IVA del laboratorio',
      'Telefono con l\'app / portale EmotiqMe',
      'Nome e password del Wi-Fi del cliente'
    ],
    legend: EMOTIQ_LEGEND,
    steps: [].concat(
      stepsFrom('emotiq-disattivazione', 'Chiusura', 'Chiusura', 'Chiusura cassa'),
      stepsFrom('emotiq-disattivazione', 'Disattiva la cassa', 'Disattiva la cassa', 'Disattivazione'),
      stepsFrom('emotiq-dgfe', 'Estendi la DGFE', 'Verifica il QR code', 'DGFE'),
      stepsFrom('emotiq-attivazione', 'Collega la cassa al Wi-Fi', 'Fiscalizzazione', 'Attivazione cassa'),
      stepsFrom('emotiq-attivazione', 'Intestazione', 'Intestazione', 'Nuova intestazione'),
      stepsFrom('emotiq-attivazione', 'Trasferisci alla stampante', 'Trasferisci alla stampante', 'Nuova intestazione'),
      [{
        phase: 'Aggiornamento e verifica',
        title: 'Aggiornamento software',
        where: 'printer',
        blocks: [
          { type: 'seq', seq: [{ n: '827' }, { k: 'SBT' }] },
          { type: 'note', kind: 'tip', text: 'Non spegnere la cassa durante l\'aggiornamento.' }
        ]
      }],
      stepsFrom('emotiq-verifica', 'Scontrino in contanti', 'Consegna al cliente', 'Aggiornamento e verifica')
    )
  }
);

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

// Funzioni della Labware Basiq (dal manuale utente Basiq ver. 5.05)
const LABWARE_FUNCTIONS = [
  {
    id: 'reg',
    name: 'Tasti in REG',
    groups: [
      { items: [
        ['', 'RISTAMPA ULTIMI N SCONTRINI', { seq: [{ t: 'n' }, { k: 'FN' }, { k: 'X' }], note: 'Es. 3 FN X ristampa gli ultimi 3.' }],
        ['', 'SCONTRINO DI CORTESIA ULTIMA VENDITA', { seq: [{ k: 'FN' }, { k: 'CONTANTI' }] }],
        ['', 'DATA E ORA SUL DISPLAY CLIENTE', { seq: [{ k: 'FN' }, { k: 'X' }] }],
        ['', 'CODICE LOTTERIA / CODICE FISCALE / P.IVA', { seq: [{ k: 'FN' }, { k: 'C.F.', cap: 'tasto ENTRATE' }], note: '1 volta: codice lotteria; 2 volte: codice fiscale; 3 volte: P.IVA. Chiudi con FN + C.F.' }],
        ['', 'ANNULLO DI UNO SCONTRINO EMESSO', { seq: [{ k: 'ANNULLO' }, { k: ',', cap: 'matricola' }, { t: 'n. chiusura + n. doc.' }, { k: ',' }, { t: 'data' }, { k: ',' }] }],
        ['', 'RESO MERCE', { seq: [{ k: 'FN' }, { k: 'ANNULLO' }, { k: ',', cap: 'matricola' }, { t: 'n. chiusura + n. doc.' }, { k: ',' }, { t: 'data' }, { k: ',' }, { t: 'importo' }, { k: 'REPARTO' }, { k: 'CONTANTI' }] }],
        ['', 'ANNULLO SCONTRINO IN CORSO', { seq: [{ k: 'ANNULLO SCONTRINO' }] }],
        ['', 'CORREZIONE ULTIMA RIGA', { seq: [{ k: 'FN' }, { k: 'STORNO' }] }],
        ['', 'STORNO DI UNA RIGA', { seq: [{ k: 'STORNO' }, { t: 'importo' }, { k: 'REPARTO' }] }],
        ['', 'OMAGGIO', { seq: [{ k: 'FN' }, { k: '%-' }, { n: '1' }], note: 'Dopo SUB-TOTALE vale per tutto lo scontrino.' }],
        ['', 'PAGAMENTO CARTA DI CREDITO', { seq: [{ t: 'n carta' }, { k: 'CARTE' }] }],
        ['', 'PAGAMENTO BANCOMAT', { seq: [{ k: 'FN' }, { k: 'CARTE' }] }],
        ['', 'PAGAMENTO ASSEGNI', { seq: [{ k: 'FN' }, { k: 'PRELIEVI' }] }],
        ['', 'NON RISCOSSO / CREDITO', { seq: [{ k: 'FN' }, { k: 'CREDITO' }] }],
        ['', 'ENTRATE DI CASSA', { seq: [{ t: 'importo' }, { k: 'ENTRATE' }, { k: 'CONTANTI' }] }],
        ['', 'PRELIEVI DI CASSA', { seq: [{ t: 'importo' }, { k: 'PRELIEVI' }, { k: 'CONTANTI' }] }],
        ['', 'SCONTRINO DIGITALE (MODALITÀ DI STAMPA)', { seq: [{ k: 'FN' }, { k: 'CARTA' }], note: 'Prima di chiudere lo scontrino, 1 o 2 volte.' }]
      ] }
    ]
  },
  {
    id: 'x',
    name: 'Letture X',
    seq: [{ key: true }, { n: '1' }, { key: true }, { n: 'codice' }, { k: 'CONTANTI' }],
    note: 'Stampe non fiscali. Per cambiare codice premi , seguito dal nuovo codice.',
    groups: [
      { items: [
        ['01', 'FINANZIARIO GIORNALIERO'],
        ['03', 'REPARTI GIORNALIERO'],
        ['07', 'FINANZIARIO PERIODICO'],
        ['13', 'TOTALE CONTANTI GIORNALIERO (SOLO VISUALIZZAZIONE)']
      ] }
    ]
  },
  {
    id: 'z',
    name: 'Azzeramenti Z',
    seq: [{ key: true }, { n: '2' }, { key: true }, { n: 'codice' }, { k: 'CONTANTI' }],
    note: 'Dal 50 al 63: inserisci i dati richiesti avanzando con CONTANTI e conferma con ANNULLO SCONTRINO.',
    groups: [
      { title: 'Chiusure e memoria di riepilogo', items: [
        ['01', 'RAPPORTO FISCALE GIORNALIERO (CHIUSURA)'],
        ['02', 'RAPPORTO FINANZIARIO GIORNALIERO'],
        ['07', 'FINANZIARIO PERIODICO'],
        ['11', 'STAMPA INTERVENTI TECNICI PER DATA'],
        ['12', 'STAMPA TOTALI FISCALI GIORNO X NUMERO'],
        ['13', 'STAMPA TOTALI FISCALI GIORNO X DATA'],
        ['14', 'STAMPA SOMMA TOTALI FISCALI X DATA'],
        ['15', 'STAMPA CONTENUTO MEMORIA DI RIEPILOGO'],
        ['16', 'PROGRAM. DATI IDENTIFICATIVI (RAGIONE SOCIALE)', { note: 'Solo dopo una chiusura. 10 righe da 48 caratteri.' }],
        ['17', 'VISUALIZ. NUMERO MATRICOLA']
      ] },
      { title: 'DGFE', items: [
        ['18', 'INIZIALIZZAZIONE DGFE', { note: 'Attiva una DGFE nuova e stampa numero DGFE, data e matricola.' }],
        ['21', 'LETTURA DGFE DA DATA A DATA'],
        ['22', 'LETTURA DGFE DA DATA X SCONTRINO'],
        ['23', 'LETTURA DGFE INTEGRALE'],
        ['24', 'INVIO LETTURA DGFE COMPUTER'],
        ['25', 'LETTURA DOC. ANNULLO/RESO DGFE X DATA'],
        ['26', 'LETTURA DGFE RICERCA DOCUMENTO COMMERCIALE'],
        ['28', 'LETTURA DGFE RAPPORTI FINANZIARI PER DATA'],
        ['30', 'DGFE -> PC: XML DA DATA A DATA'],
        ['31', 'DGFE -> PC: XML ESITI DA DATA A DATA'],
        ['32', 'DGFE -> PC: XML CORRISPETTIVI E LOTTERIA PENDENTI'],
        ['33', 'DGFE -> PC: XML CORRISPETTIVO N.'],
        ['34', 'DGFE -> PC: XML M.RIEPILOGO INTEGRALE'],
        ['35', 'DGFE -> PC: XML M.DETTAGLIO INTEGRALE'],
        ['36', 'DGFE -> BROWSER: XML CORRISPETTIVO E LOTTERIA PER N. E SCONTRINI DIGITALI']
      ] },
      { title: 'Invii all\'AdE', items: [
        ['40', 'INVIA CORRISPETTIVI E LOTTERIA PENDENTI'],
        ['41', 'INVIO MANUALE CORRISPETTIVO N.'],
        ['42', 'STAMPA ELENCO CORRISPETTIVI E LOTTERIA PENDENTI'],
        ['43', 'STAMPA ESITO INVIO CORRISP. NEL DGFE'],
        ['44', 'STAMPA ESITO INVIO CORRISP. DATA <-> DATA'],
        ['45', 'STAMPA ESITO INVIO LOTTERIA NEL DGFE'],
        ['46', 'STAMPA ESITO INVIO LOTTERIA DATA <-> DATA'],
        ['47', 'INVIO MANUALE FORNITURA LOTTERIA N.']
      ] },
      { title: 'Stato del dispositivo', items: [
        ['50', 'CENSIMENTO DISPOSITIVO', { note: 'Chiede C.F. tecnico e P.IVA centro assistenza.' }],
        ['51', 'ATTIVA E COMUNICA DATA MESSA IN SERVIZIO', { note: 'Chiede P.IVA esercente, C.F. tecnico e P.IVA centro assistenza.' }],
        ['52', 'ATTIVA E SALVA DATA (SOLO TEST DI LABORATORIO, NON USARE)'],
        ['53', 'ATTIVA E METTI SUBITO IN SERVIZIO', { note: 'Chiede P.IVA esercente, C.F. tecnico e P.IVA centro assistenza.' }],
        ['54', 'ESERCITA REVOCA (NON PIÙ DISPONIBILE)'],
        ['55', 'DISATTIVAZIONE - CESSIONE', { note: 'Chiede C.F. tecnico e P.IVA centro assistenza.' }],
        ['56', 'DISATTIVAZIONE - ALTRO', { note: 'Chiede C.F. tecnico, P.IVA centro assistenza e il motivo.' }],
        ['57', 'DISMISSIONE - SMALTIMENTO', { note: 'Definitiva: dopo la cassa permette solo le letture.' }],
        ['58', 'DISMISSIONE - MEMORIA FISCALE ESAURITA', { note: 'Definitiva: dopo la cassa permette solo le letture.' }],
        ['59', 'RIMETTI IN SERVIZIO DOPO REVOCA'],
        ['60', 'METTI IN SERVIZIO PRIMA DELLA DATA (SOLO TEST DI LABORATORIO)'],
        ['61', 'FUORI SERVIZIO - MAGAZZINO', { note: 'Per inattività di almeno 12 giorni. Torna in servizio con il primo invio.' }],
        ['62', 'FUORI SERVIZIO - MALFUNZIONAMENTO'],
        ['63', 'FUORI SERVIZIO - ALTRO']
      ] },
      { title: 'Firmware', items: [
        ['80', 'RICHIESTA AGGIORNAMENTO FIRMWARE', { seq: [{ key: true }, { n: '2' }, { key: true }, { n: '80' }, { k: 'ANNULLO SCONTRINO' }, { key: true, cap: 'conferma (CL annulla)' }], note: 'Non spegnere: il led lampeggia blu fino alla fine.' }]
      ] }
    ]
  },
  {
    id: 'set',
    name: 'Programmazione SET',
    seq: [{ key: true }, { n: '3' }, { key: true }, { n: 'codice' }],
    note: 'Per passare a un\'altra programmazione premi , seguito dal codice. SUB-TOTALE stampa la programmazione aperta.',
    groups: [
      { items: [
        ['01', 'DATA E ORA'],
        ['02', 'REPARTI'],
        ['04', 'SCONTI E MAGGIORAZIONI'],
        ['05', 'ALIQUOTE IVA'],
        ['06', 'CODICE ATTIVITÀ (ATECO)', { note: 'Fino a 3 codici, 6 cifre senza punti.' }],
        ['07', 'CARTE DI CREDITO'],
        ['10', 'TICKET (BUONI PASTO)'],
        ['14', 'OPZIONI (FLAG)'],
        ['15', 'PARAMETRI CASSA'],
        ['16', 'TIPO CARATTERE INTESTAZIONE'],
        ['22', 'INDIRIZZO IP'],
        ['23', 'PASSWORD ACCESSO BROWSER'],
        ['27', 'MESSAGGI DI CORTESIA'],
        ['28', 'TIPO CARATTERE MESSAGGI DI CORTESIA'],
        ['29', 'DESCRIZIONI FUNZIONI'],
        ['30', 'CODICI DI ACCESSO CHIAVI'],
        ['31', 'SCONTI E MAGGIORAZIONI AGGIUNTIVI']
      ] }
    ]
  },
  {
    id: 'flag',
    name: 'Opzioni SET 14',
    seq: [{ key: true }, { n: '3' }, { key: true }, { n: '14' }],
    note: 'FN + , cambia il valore, CONTANTI passa al flag successivo, SUB-TOTALE stampa i flag. Tra parentesi il valore di default.',
    groups: [
      { items: [
        ['2', 'BUZZER TASTIERA (SÌ)'],
        ['3', 'STAMPA APERTURA CASSETTO (NO)'],
        ['4', 'TASTIERA 10 REPARTI (NO)'],
        ['5', 'BARCODE SCANNER (NO)'],
        ['8', 'STAMPA NUMERO PEZZI (NO)'],
        ['13', 'OBBLIGO SUB-TOTALE (NO)'],
        ['15', 'DISPLAY GRAFICO SMART (SÌ)'],
        ['19', 'TASTO STORNO PROTETTO (SÌ)', { note: 'SÌ = usabile solo da stato X.' }],
        ['20', 'TASTO CORREZIONE PROTETTO (SÌ)'],
        ['21', 'TASTO ANNULLO SCONTRINO PROTETTO (SÌ)'],
        ['22', 'TASTO SCONTO % PROTETTO (SÌ)'],
        ['23', 'TASTO SCONTO PROTETTO (SÌ)'],
        ['24', 'TASTO NON RISCOSSO DCRaSSN (SÌ)'],
        ['25', 'TASTO NON RISCOSSO FATTURA (SÌ)'],
        ['26', 'TASTO OMAGGIO (SÌ)'],
        ['28', 'STAMPA NUMERO CASSA (NO)'],
        ['29', 'STAMPA A FINE TRANSAZIONE (SÌ)'],
        ['30', 'OBBLIGO INSERIMENTO PAGAMENTO (NO)'],
        ['31', 'STAMPA INTERLINEA TOTALE (NO)'],
        ['33', 'TASTIERA ALFANUMERICA PER DESCRIZIONI (NO)'],
        ['34', 'RETROILLUMINAZIONE (SÌ)'],
        ['35', 'CREDITO NON RISCOSSO (SÌ)', { note: 'Va su SÌ anche per il pagamento con BONIFICO.' }],
        ['36', 'STAMPA RESTI FINANZIARI (SÌ)'],
        ['37', 'VIRGOLA IMPLICITA (SÌ)', { note: 'SÌ: 125 = 1,25 €. NO: 1,25 si scrive 1 , 25.' }],
        ['38', 'STAMPA NUMERI DEL LOTTO (NO)'],
        ['39', 'OBBLIGO CHIUSURA Z A ORARIO (NO)', { note: 'L\'ora si imposta in SET 15, parametro 15.' }],
        ['40', 'DATA/ORA AUTOMATICA SUL DISPLAY (NO)'],
        ['41', 'VENTILAZIONE IVA (NO)'],
        ['42', 'STAMPA DETTAGLIO PAGAMENTI (SÌ)'],
        ['43', 'ON/OFF GESTITO DA PC (NO)'],
        ['44', 'STAMPA COMPATTA (NO)'],
        ['45', 'STAMPA INFO LOTTERIA (SÌ)'],
        ['46', 'STAMPA PREZZO UNITARIO (NO)'],
        ['47', 'APERTURA CASSETTO SOLO MANUALE (NO)'],
        ['49', 'CHIUSURA AUTOMATICA DOPO INATTIVITÀ (NO)'],
        ['50', 'INFO STATO AL CLOUD (NO)'],
        ['51', 'ARROTONDAMENTO DL.50/2017 (SÌ)'],
        ['52', 'INVIO A SISTEMA TESSERA SANITARIA (NO)'],
        ['55', 'CHIUSURA AUTOMATICA ALL\'ORA HH (NO)']
      ] }
    ]
  },
  {
    id: 'param',
    name: 'Parametri cassa SET 15',
    seq: [{ key: true }, { n: '3' }, { key: true }, { n: '15' }],
    note: 'Tra parentesi il valore di default.',
    groups: [
      { items: [
        ['5', 'NUMERO RITRASMISSIONI (3)'],
        ['6', 'TEMPO TRA LE RITRASMISSIONI (2 S)'],
        ['7', 'INTENSITÀ STAMPANTE 0-9 (5)'],
        ['8', 'INTENSITÀ LCD 0-15 (8)'],
        ['9', 'NUMERO CASSA (0)'],
        ['10', 'INDIRIZZO RETE (40)'],
        ['11', 'LOGO A INIZIO SCONTRINO 1-10 (0)'],
        ['12', 'LOGO A FINE SCONTRINO 1-10 (0)'],
        ['15', 'ORA CHIUSURA FISCALE (0)'],
        ['16', 'SECONDI VISUALIZZAZIONE DATA/ORA (10)'],
        ['17', 'TAGLIERINA 0 NO / 1 PARZIALE / 2 TOTALE (0)'],
        ['18', 'MODO TASTO CREDITO (0)'],
        ['19', 'MODO TASTO BANCOMAT (0)'],
        ['20', 'TIPO PROTOCOLLO PC (0)'],
        ['22', 'RITARDO INVIO PENDENZE IN MINUTI (0)'],
        ['23', 'SCONTRINO DIGITALE 0 OFF / 1 SU RICHIESTA / 2 SEMPRE / 3 STAMPA + DIGITALE (0)'],
        ['24', 'TRASMISSIONE DOC. DIGITALE (0)'],
        ['25', 'ERRORE UPLOAD DOC. DIGITALE 0 STAMPA COPIA / 1 SILENTE (0)'],
        ['27', 'SECONDI VISUALIZZAZIONE QR (2)'],
        ['28', 'IMPORTO MINIMO LOTTERIA (100 = 1 €)'],
        ['29', 'PAGAMENTO PER LOTTERIA (ELETTRONICO)'],
        ['33', 'ASSISTENZA CLOUD 0 OFF / 1 MANUALE / 2 AUTOMATICA (1)'],
        ['34', 'STAMPA AZZERAMENTO 0 CARTA / 1 PDF / 2 ENTRAMBI (0)'],
        ['35', 'STAMPA AZZERAMENTO AUTOMATICO 0 CARTA / 1 PDF / 2 ENTRAMBI (0)']
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
  },
  {
    id: 'labware',
    name: 'Funzioni Labware Basiq',
    meta: 'Codici X, Z, SET, opzioni e tasti in REG',
    intro: 'Codici della Labware Basiq dal manuale utente (ver. 5.05). Chiave 1 = X, Chiave 2 = Z, Chiave 3 = SET.',
    sections: LABWARE_FUNCTIONS
  }
];
