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

/*
 * Funzioni della Custom (stampate dalla cassa: liste X00, P000 e Z00).
 * Ogni gruppo ha un titolo e l'elenco [codice, descrizione].
 */

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
