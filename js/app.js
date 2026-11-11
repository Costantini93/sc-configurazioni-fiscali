(function () {
  'use strict';

  var STORE_KEY = 'sc-config-v1';
  var app = document.getElementById('app');

  var ICON = {
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="m9 6 6 6-6 6"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
    warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
    printer: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="9" rx="2"/><path d="M7 14h10v7H7z"/><path d="M17 12h.01"/></svg>',
    pc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
    web: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'
  };

  var WHERE = {
    printer: { label: 'Sulla stampante', icon: ICON.printer },
    pc: { label: 'Sul PC · RX Config', icon: ICON.pc },
    web: { label: 'Sul portale web', icon: ICON.web },
    react: { label: 'Sul PC · React app', icon: ICON.pc },
    emotiq: { label: 'Sul PC · Emotiq Tools', icon: ICON.pc },
    rch: { label: 'Sul PC · Aggiornamento firmware RCH', icon: ICON.pc }
  };

  // ---------- Stato persistente ----------

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; }
  }
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* storage non disponibile */ }
  }
  var store = loadStore();
  store.progress = store.progress || {};

  function progressOf(id) { return store.progress[id]; }
  function ensureProgress(id) {
    if (!store.progress[id]) store.progress[id] = { step: 0, startedAt: Date.now(), vars: {} };
    return store.progress[id];
  }
  function clearProgress(id) { delete store.progress[id]; saveStore(); }

  // ---------- Utilità ----------

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function findPrinter(id) {
    for (var i = 0; i < PRINTERS.length; i++) if (PRINTERS[i].id === id) return PRINTERS[i];
    return null;
  }
  function phasesOf(p) {
    var phases = [];
    p.steps.forEach(function (s, i) {
      var last = phases[phases.length - 1];
      if (last && last.name === s.phase) last.steps.push(i);
      else phases.push({ name: s.phase, steps: [i] });
    });
    return phases;
  }
  function phaseIndexOf(p, stepIndex) {
    var phases = phasesOf(p);
    for (var i = 0; i < phases.length; i++) if (phases[i].steps.indexOf(stepIndex) !== -1) return i;
    return 0;
  }
  function formatDuration(ms) {
    var min = Math.max(1, Math.round(ms / 60000));
    if (min < 60) return min + (min === 1 ? ' minuto' : ' minuti');
    var h = Math.floor(min / 60), m = min % 60;
    return h + (h === 1 ? ' ora' : ' ore') + (m ? ' e ' + m + ' min' : '');
  }
  function go(hash) { location.hash = hash; }
  // Testo per la ricerca: minuscolo, senza accenti, punteggiatura e spazi ("WI-FI" -> "wifi")
  function normalize(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
  }
  // Come normalize ma tiene separate le parole, così una ricerca non combacia a cavallo di due parole
  function normalizeText(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
  }

  function logo(cls) {
    return '<img class="' + cls + ' logo-light" src="assets/logo.png" alt="SC Sistemi di Cassa">' +
      '<img class="' + cls + ' logo-dark" src="assets/logo-dark.png" alt="SC Sistemi di Cassa">';
  }

  // ---------- Tema chiaro / scuro ----------

  // Al primo avvio si parte dal tema del dispositivo; poi vale la scelta fatta con il pulsante
  var THEME_KEY = 'sc-theme';
  var THEMES = {
    light: { icon: 'moon', label: 'Passa al tema scuro', next: 'dark' },
    dark: { icon: 'sun', label: 'Passa al tema chiaro', next: 'light' }
  };
  function getTheme() {
    var t; try { t = localStorage.getItem(THEME_KEY); } catch (e) { /* storage non disponibile */ }
    if (THEMES[t]) return t;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function applyTheme() {
    var t = getTheme();
    document.documentElement.classList.toggle('theme-dark', t === 'dark');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'dark' ? '#0b1220' : '#ffffff');
    document.querySelectorAll('.theme-btn').forEach(function (b) {
      b.innerHTML = ICON[THEMES[t].icon];
      b.setAttribute('aria-label', THEMES[t].label);
      b.setAttribute('title', THEMES[t].label);
    });
  }
  function cycleTheme() {
    try { localStorage.setItem(THEME_KEY, THEMES[getTheme()].next); } catch (e) { /* storage non disponibile */ }
    applyTheme();
  }
  function themeBtn() {
    var t = getTheme();
    return '<button class="icon-btn theme-btn" data-action="theme" aria-label="' + THEMES[t].label + '" title="' + THEMES[t].label + '">' + ICON[THEMES[t].icon] + '</button>';
  }

  // Barra superiore fissa con il logo sempre visibile al centro.
  // Su mobile a sinistra c'è il pulsante del menu (tranne dentro una procedura: noMenu).
  function topbar(left, right, noMenu) {
    var menuBtn = noMenu ? '' : '<button class="icon-btn menu-btn" data-action="open-nav" aria-label="Apri il menu" aria-controls="nav" aria-expanded="false">' + ICON.menu + '</button>';
    return '<header class="topbar">' +
      '<span class="topbar-side">' + menuBtn + (left || '') + '</span>' +
      '<a class="topbar-logo" href="#/" aria-label="Home">' + logo('topbar-logo-img') + '</a>' +
      '<span class="topbar-side right">' + (right || themeBtn()) + '</span>' +
    '</header>';
  }

  // ---------- Stampanti e operazioni ----------

  var FN_OP = 'Codici e funzioni';
  var HELP_OP = 'Cerca negli articoli';

  function printersOf(p) { return [].concat(p.printer); }
  function photosOf(model) { return PRINTER_PHOTOS[model] || []; }
  // Foto che si ingrandisce al tocco
  function zoomPhoto(src, cls, label) {
    return '<button type="button" class="zoom-btn" data-zoom="' + esc(src) + '" data-zoom-label="' + esc(label || '') + '" aria-label="Ingrandisci la foto' + (label ? ' di ' + esc(label) : '') + '">' +
      photoImg(src, cls) + '</button>';
  }
  function openZoom(src, label) {
    var box = document.createElement('div');
    box.className = 'zoom-root';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-label', label || 'Foto della stampante');
    rememberFocus();
    box.innerHTML = '<div class="zoom-backdrop" data-action="close-zoom"></div>' +
      '<figure class="zoom-box">' +
        '<button class="icon-btn zoom-close" data-action="close-zoom" aria-label="Chiudi">' + ICON.close + '</button>' +
        '<img src="' + esc(src) + '" alt="' + esc(label || '') + '">' +
        (label ? '<figcaption>' + esc(label) + '</figcaption>' : '') +
      '</figure>';
    box.addEventListener('click', function (e) {
      if (e.target.closest('[data-action="close-zoom"]') || e.target.tagName === 'IMG') closeZoom();
    });
    document.body.appendChild(box);
    box.querySelector('.zoom-close').focus();
  }
  function closeZoom() {
    var box = document.querySelector('.zoom-root');
    if (box) { box.remove(); restoreFocus(); }
  }

  // ---------- Focus nelle finestre (foto, elenco step, menu su telefono) ----------

  var lastFocus = null;
  function rememberFocus() { lastFocus = document.activeElement; }
  function restoreFocus() {
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  }
  // Tab e Maiusc+Tab restano dentro la finestra aperta
  function trapTab(e, container) {
    var items = Array.prototype.filter.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, select, summary, [tabindex]:not([tabindex="-1"])'),
      function (el) {
        // escluso ciò che è nascosto, anche dentro un gruppo del menu chiuso (il suo titolo resta raggiungibile)
        var closed = el.closest('details:not([open])');
        if (closed && !(el.tagName === 'SUMMARY' && el.parentElement === closed)) return false;
        return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
      }
    );
    if (!items.length) return;
    var first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  function photoImg(src, cls) {
    return '<img class="' + cls + '" src="' + esc(src) + '" alt="" loading="lazy">';
  }
  // Modelli di più marche o della stessa marca: "Emotiq Model M / Nota / Opera 2"
  function printerLabel(p) {
    return printersOf(p).map(function (m, i) {
      var b = brandOf(m);
      return i && b === brandOf(printersOf(p)[i - 1]) ? shortModel(m) : m;
    }).join(' / ');
  }
  function brandOf(model) {
    for (var i = 0; i < PRINTER_BRANDS.length; i++) if (PRINTER_BRANDS[i].models.indexOf(model) !== -1) return PRINTER_BRANDS[i].brand;
    return '';
  }
  // Nome del modello senza la marca: "Emotiq Model M" -> "Model M"
  function shortModel(model) {
    var b = brandOf(model);
    return b && model.indexOf(b + ' ') === 0 ? model.slice(b.length + 1) : model;
  }

  // Operazioni disponibili per un modello: procedure (in ordine di OPERATIONS) e pagine dei codici
  function opsFor(model) {
    var procs = PRINTERS.filter(function (p) { return printersOf(p).indexOf(model) !== -1; })
      .sort(function (a, b) { return OPERATIONS.indexOf(a.op) - OPERATIONS.indexOf(b.op); })
      .map(function (p) { return { label: p.op, href: '#/p/' + p.id, p: p }; });
    var fns = FUNCTION_PAGES.filter(function (f) { return [].concat(f.printer).indexOf(model) !== -1; })
      .map(function (f) { return { label: FN_OP, href: '#/funzioni/' + f.id, f: f }; });
    var helps = HELP_CENTERS.filter(function (h) { return h.printer === model; })
      .map(function (h) { return { label: HELP_OP, href: '#/assistenza/' + h.id, h: h }; });
    return procs.concat(fns, helps);
  }

  // ---------- Menu laterale ----------

  var nav = document.getElementById('nav');
  var navBackdrop = document.getElementById('nav-backdrop');

  function renderNav() {
    function link(href, label) {
      return '<a class="nav-link" href="' + href + '">' + esc(label) + '</a>';
    }
    nav.innerHTML =
      '<div class="nav-head"><span class="nav-title">Stampanti</span>' +
        '<span class="nav-head-actions">' + themeBtn() +
        '<button class="icon-btn nav-close" data-action="close-nav" aria-label="Chiudi il menu">' + ICON.close + '</button></span></div>' +
      '<a class="nav-link nav-home" href="#/">Home</a>' +
      PRINTER_BRANDS.map(function (b) {
        // marca con un solo modello: il modello è la voce principale
        if (b.models.length === 1) return modelGroup(b.models[0], b.models[0], 'nav-group');
        return '<details class="nav-group nav-brand"><summary>' +
          '<span class="nav-thumb">' + thumb(b.models[0]) + '</span>' +
          '<span class="nav-model">' + esc(b.brand) + '<span class="nav-count">' + b.models.length + ' modelli</span></span></summary>' +
          b.models.map(function (m) { return modelGroup(m, shortModel(m), 'nav-sub'); }).join('') +
        '</details>';
      }).join('');
    function thumb(model) {
      var photo = photosOf(model)[0];
      return photo ? photoImg(photo, 'nav-thumb-img') : ICON.printer;
    }
    function modelGroup(model, label, cls) {
      return '<details class="' + cls + '"><summary>' +
        '<span class="nav-thumb">' + thumb(model) + '</span>' +
        '<span class="nav-model">' + esc(label) + '</span></summary>' +
        opsFor(model).map(function (o) { return link(o.href, o.label); }).join('') + '</details>';
    }
  }

  // Evidenzia la voce della pagina aperta (anche dentro una procedura)
  function updateNav() {
    var m = location.hash.match(/^#\/(p|funzioni|assistenza)\/([^/]+)/);
    var current = m ? '#/' + m[1] + '/' + m[2] : (/^#?\/?$/.test(location.hash) ? '#/' : (location.hash === '#/funzioni' ? '#/funzioni/custom' : ''));
    var opened = false;
    nav.querySelectorAll('.nav-link').forEach(function (a) {
      var on = a.getAttribute('href') === current;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
      // apre marca e modello della pagina aperta (solo il primo, se la procedura vale per più modelli)
      if (on && !opened) {
        opened = true;
        for (var d = a.closest('details'); d; d = d.parentElement.closest('details')) d.open = true;
      }
    });
  }

  // Su telefono il menu è una finestra sopra la pagina; su desktop è sempre visibile
  function navIsOverlay() { return !window.matchMedia('(min-width: 1024px)').matches; }
  function setMenuExpanded(open) {
    document.querySelectorAll('.menu-btn').forEach(function (b) { b.setAttribute('aria-expanded', open ? 'true' : 'false'); });
  }
  function openNav() {
    rememberFocus();
    document.body.classList.add('nav-open');
    setMenuExpanded(true);
    var active = nav.querySelector('.is-active');
    if (active) active.scrollIntoView({ block: 'center' });
    (active || nav.querySelector('.nav-close')).focus({ preventScroll: true });
  }
  function closeNav() {
    if (!document.body.classList.contains('nav-open')) return;
    document.body.classList.remove('nav-open');
    setMenuExpanded(false);
    restoreFocus();
  }

  nav.addEventListener('click', function (e) {
    if (e.target.closest('[data-action="theme"]')) return cycleTheme();
    if (e.target.closest('[data-action="close-nav"]') || e.target.closest('.nav-link')) closeNav();
  });
  navBackdrop.addEventListener('click', closeNav);

  // ---------- Render dei contenuti ----------

  function renderToken(t, vars) {
    var inner;
    if (t.key) inner = '<span class="cap cap-icon" aria-label="Tasto chiave">' + ICON.key + '</span>';
    else if (t.k) inner = '<span class="cap">' + esc(t.k) + '</span>';
    else if (t.n) inner = '<span class="cap cap-num">' + esc(t.n) + '</span>';
    else if (t.m) inner = '<span class="tok-menu">' + esc(t.m) + '</span>';
    else if (t.v) {
      var val = vars && vars[t.v];
      inner = val
        ? '<span class="tok-var">' + esc(val) + '</span>'
        : '<span class="tok-var is-empty">' + esc(t.empty || 'non annotato') + '</span>';
    }
    else inner = '<span class="tok-text">' + esc(t.t) + '</span>';
    if (t.x) inner += '<span class="tok-times">×' + t.x + '</span>';
    return '<span class="tok"><span class="tok-main">' + inner + '</span>' +
      (t.cap ? '<span class="tok-cap">' + esc(t.cap) + '</span>' : '') + '</span>';
  }

  function renderSeq(seq, vars) {
    return '<div class="seq">' + seq.map(function (t, i) {
      // freccia e tasto restano uniti quando la sequenza va a capo
      return '<span class="seq-item">' +
        (i ? '<span class="seq-arrow" aria-hidden="true">' + ICON.arrow + '</span>' : '') +
        renderToken(t, vars) + '</span>';
    }).join('') + '</div>';
  }

  function renderBlock(b, vars) {
    switch (b.type) {
      case 'seq':
        return '<div class="block">' + (b.label ? '<div class="block-label">' + esc(b.label) + '</div>' : '') + renderSeq(b.seq, vars) + '</div>';
      case 'list':
        return '<ul class="block checklist">' + b.items.map(function (it) {
          return '<li><span class="dot">' + ICON.arrow + '</span><span>' + esc(it) + '</span></li>';
        }).join('') + '</ul>';
      case 'table':
        return '<div class="block table-wrap"><table><thead><tr>' +
          b.head.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
          '</tr></thead><tbody>' +
          b.rows.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + esc(c) + '</td>'; }).join('') + '</tr>'; }).join('') +
          '</tbody></table></div>';
      case 'note':
        return '<div class="block note note-' + b.kind + '"><span class="note-icon">' + ICON[b.kind] + '</span><p>' + esc(b.text) + '</p></div>';
      case 'link':
        return '<a class="block link-btn" href="' + esc(b.href) + '" target="_blank" rel="noopener">' + ICON.web + '<span>' + esc(b.label) + '</span><span class="link-go">' + ICON.arrow + '</span></a>';
      case 'image':
        return '<figure class="block step-img"><img src="' + esc(b.src) + '" alt="' + esc(b.alt || '') + '">' +
          (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
      case 'input':
        return '<label class="block field"><span class="field-label">' + esc(b.label) + '</span>' +
          '<input type="text" inputmode="decimal" autocomplete="off" data-var="' + esc(b.var) + '" placeholder="' + esc(b.placeholder || '') + '" value="' + esc((vars && vars[b.var]) || '') + '"></label>';
      default:
        return '';
    }
  }

  // ---------- Schermate ----------

  function procCard(p, title) {
    var pr = progressOf(p.id);
    var nPhases = phasesOf(p).length;
    var badge = pr ? '<span class="badge">In corso · step ' + (pr.step + 1) + ' di ' + p.steps.length + '</span>' : '';
    return '<a class="printer-card" href="#/p/' + p.id + '">' +
      '<span class="printer-icon">' + ICON.printer + '</span>' +
      '<span class="printer-body">' +
        '<span class="printer-name">' + esc(title || p.name) + '</span>' +
        '<span class="printer-meta">' + p.steps.length + ' step · ' + nPhases + (nPhases === 1 ? ' fase' : ' fasi') + '</span>' +
        badge +
      '</span>' +
      '<span class="printer-go">' + ICON.arrow + '</span>' +
    '</a>';
  }
  function fnCard(f) {
    return '<a class="printer-card" href="#/funzioni/' + f.id + '">' +
      '<span class="printer-icon">' + ICON.list + '</span>' +
      '<span class="printer-body">' +
        '<span class="printer-name">' + esc(f.name) + '</span>' +
        '<span class="printer-meta">' + esc(f.meta) + '</span>' +
      '</span>' +
      '<span class="printer-go">' + ICON.arrow + '</span>' +
    '</a>';
  }

  // Opzioni del secondo menu a tendina, per il modello scelto
  function opOptions(model, selected) {
    return '<option value="">' + (model ? 'Scegli l\'operazione' : 'Prima scegli la stampante') + '</option>' +
      (model ? opsFor(model).map(function (o) {
        return '<option value="' + esc(o.href) + '"' + (o.href === selected ? ' selected' : '') + '>' + esc(o.label) + '</option>';
      }).join('') : '');
  }
  function pickPhoto() {
    return photosOf(homePick.printer).map(function (src) { return zoomPhoto(src, 'pick-photo-img', homePick.printer); }).join('');
  }
  function pickResult() {
    if (!homePick.href) return '';
    var o = opsFor(homePick.printer).filter(function (x) { return x.href === homePick.href; })[0];
    if (!o) return '';
    return o.p ? procCard(o.p) + '<p class="pick-summary">' + esc(o.p.summary) + '</p>' : fnCard(o.f);
  }

  function viewHome() {
    var inProgress = PRINTERS.filter(function (p) { return progressOf(p.id); });

    return '<div class="screen home">' +
      topbar() +
      '<header class="hero">' +
        '<h1>Quale cassa hai davanti?</h1>' +
        '<p class="lead">Scegli il modello e cosa devi fare: la guida ti accompagna tasto per tasto.</p>' +
      '</header>' +
      '<main class="printer-list">' +
        '<section class="picker">' +
          '<label class="pick-field"><span class="field-label">Marca e modello</span>' +
            '<select data-pick="printer"><option value="">Scegli la stampante</option>' +
              PRINTER_BRANDS.map(function (b) {
                return '<optgroup label="' + esc(b.brand) + '">' + b.models.map(function (m) {
                  return '<option value="' + esc(m) + '"' + (m === homePick.printer ? ' selected' : '') + '>' + esc(m) + '</option>';
                }).join('') + '</optgroup>';
              }).join('') +
            '</select></label>' +
          '<div class="pick-photo">' + pickPhoto() + '</div>' +
          '<label class="pick-field"><span class="field-label">Operazione</span>' +
            '<select data-pick="op"' + (homePick.printer ? '' : ' disabled') + '>' + opOptions(homePick.printer, homePick.href) + '</select></label>' +
          '<div class="pick-result">' + pickResult() + '</div>' +
        '</section>' +
        (inProgress.length
          ? '<div class="list-head"><span class="list-title">In corso</span>' +
              '<button class="btn-reset" data-action="reset-all">' + ICON.restart + 'Ripristina tutto</button></div>' +
            inProgress.map(function (p) { return procCard(p); }).join('')
          : '') +
        '<div class="list-title">Oppure cerca</div>' +
        '<label class="fn-search home-search">' + ICON.search +
          '<input type="search" data-home-search placeholder="Cerca procedura, codice o passaggio" autocomplete="off" aria-label="Cerca nelle procedure" value="' + esc(homeQuery) + '">' +
        '</label>' +
        '<div class="home-results" hidden></div>' +
      '</main>' +
    '</div>';
  }

  function onPick(el) {
    if (el.getAttribute('data-pick') === 'printer') {
      homePick = { printer: el.value, href: '' };
      var op = app.querySelector('[data-pick="op"]');
      op.innerHTML = opOptions(homePick.printer, '');
      op.disabled = !homePick.printer;
      app.querySelector('.pick-photo').innerHTML = pickPhoto();
    } else {
      homePick.href = el.value;
    }
    app.querySelector('.pick-result').innerHTML = pickResult();
  }

  function fnText(it) {
    return normalizeText(it[0] + ' ' + it[1] + ' ' + ((it[2] && it[2].note) || ''));
  }

  function findFunctionPage(id) {
    for (var i = 0; i < FUNCTION_PAGES.length; i++) if (FUNCTION_PAGES[i].id === id) return FUNCTION_PAGES[i];
    return null;
  }

  function viewFunctions(page) {
    var sections = page.sections.map(function (sec) {
      var count = 0;
      var groups = sec.groups.map(function (g) {
        count += g.items.length;
        return '<div class="fn-group">' + (g.title ? '<div class="fn-group-name">' + esc(g.title) + '</div>' : '') + '<ul class="fn-list">' +
          g.items.map(function (it) {
            var extra = it[2] || {};
            return '<li data-search="' + esc(fnText(it)) + '"' + (extra.seq ? ' class="fn-rich"' : '') + '>' +
              '<div class="fn-row">' + (it[0] ? '<span class="fn-code">' + esc(it[0]) + '</span>' : '') + '<span>' + esc(it[1]) + '</span></div>' +
              (extra.seq ? renderSeq(extra.seq) : '') +
              (extra.note ? '<p class="fn-note">' + esc(extra.note) + '</p>' : '') +
            '</li>';
          }).join('') + '</ul></div>';
      }).join('');
      return '<section class="panel fn-section" data-section="' + esc(sec.id) + '">' +
        '<h2>' + esc(sec.name) + ' <span class="fn-count">· ' + count + '</span></h2>' +
        (sec.seq ? '<div class="fn-howto">' + renderSeq(sec.seq) + '</div>' : '') +
        (sec.note ? '<p class="fn-note">' + esc(sec.note) + '</p>' : '') +
        groups +
      '</section>';
    }).join('');

    return '<div class="screen functions">' +
      topbar('<a class="icon-btn" href="#/" aria-label="Torna alla home">' + ICON.back + '</a>') +
      '<main class="content">' +
        '<h1 class="fn-title">' + esc(page.name) + '</h1>' +
        '<p class="muted">' + esc(page.intro) + '</p>' +
        '<label class="fn-search">' + ICON.search +
          '<input type="search" data-filter placeholder="Cerca codice o funzione (es. wifi)" autocomplete="off" aria-label="Cerca codice o funzione">' +
        '</label>' +
        '<div class="fn-chips" role="group" aria-label="Categoria">' +
          [{ id: '', name: 'Tutte' }].concat(page.sections).map(function (sec) {
            return '<button class="fn-chip' + (sec.id ? '' : ' is-active') + '" data-chip="' + esc(sec.id) + '" aria-pressed="' + !sec.id + '">' + esc(sec.name) + '</button>';
          }).join('') +
        '</div>' +
        sections +
        '<p class="fn-empty muted" hidden>Nessuna funzione trovata.</p>' +
      '</main>' +
    '</div>';
  }

  // ---------- Ricerca negli articoli del centro assistenza ----------

  var helpState = { id: null, query: '', html: '' }; // ultima ricerca, ricordata tornando indietro
  var helpTimer = null, helpSeq = 0;

  function findHelp(id) {
    for (var i = 0; i < HELP_CENTERS.length; i++) if (HELP_CENTERS[i].id === id) return HELP_CENTERS[i];
    return null;
  }

  function helpIdle() {
    return '<p class="help-msg muted">Scrivi almeno 3 lettere: gli articoli compaiono mentre scrivi.</p>';
  }

  function viewHelp(h) {
    var same = helpState.id === h.id;
    return '<div class="screen help">' +
      topbar('<a class="icon-btn" href="#/" aria-label="Torna alla home">' + ICON.back + '</a>') +
      '<main class="content">' +
        '<h1 class="fn-title">' + esc(h.name) + '</h1>' +
        '<p class="muted">' + esc(h.intro) + '</p>' +
        '<form class="help-form" data-help="' + esc(h.id) + '" role="search">' +
          '<label class="field-label" for="help-q">Cosa cerchi?</label>' +
          '<div class="fn-search help-search">' + ICON.search +
            '<input id="help-q" type="search" data-help-q enterkeyhint="search" autocomplete="off" placeholder="' + esc(h.example) + '" value="' + esc(same ? helpState.query : '') + '">' +
          '</div>' +
        '</form>' +
        '<div class="help-results" aria-live="polite">' + (same && helpState.html ? helpState.html : helpIdle()) + '</div>' +
        '<a class="block link-btn help-site" href="' + esc(h.url) + '" target="_blank" rel="noopener">' + ICON.web +
          '<span>Apri il centro assistenza</span><span class="link-go">' + ICON.arrow + '</span></a>' +
      '</main>' +
    '</div>';
  }

  // Lo snippet di Zendesk evidenzia le parole trovate con <em>: si tiene solo quello, il resto diventa testo
  function safeSnippet(html) {
    var parts = String(html || '').split(/(<\/?em>)/);
    var out = '';
    parts.forEach(function (part) {
      if (part === '<em>') out += '<mark>';
      else if (part === '</em>') out += '</mark>';
      else {
        var tmp = document.createElement('textarea');
        tmp.innerHTML = part.replace(/<[^>]*>/g, '');
        out += esc(tmp.value);
      }
    });
    return out;
  }

  function searchHelp(h, query) {
    var q = query.trim();
    var box = app.querySelector('.help-results');
    if (!box) return;
    helpState = { id: h.id, query: query, html: '' };
    if (q.length < 3) { helpSeq++; box.innerHTML = helpIdle(); return; }
    var seq = ++helpSeq;
    var slow = setTimeout(function () {
      if (seq === helpSeq) box.innerHTML = '<p class="help-msg muted">Cerco negli articoli…</p>';
    }, 300);
    var url = h.api + '?locale=' + encodeURIComponent(h.locale) + '&per_page=15&query=' + encodeURIComponent(q);
    fetch(url).then(function (r) {
      if (!r.ok) throw new Error('http ' + r.status);
      return r.json();
    }).then(function (data) {
      if (seq !== helpSeq) return;
      var results = (data && data.results) || [];
      var total = data.count || results.length;
      var html = results.length
        ? '<p class="help-msg muted">' + (total > results.length ? 'I primi ' + results.length + ' di ' + total + ' articoli' : results.length + (results.length === 1 ? ' articolo' : ' articoli')) + '</p>' +
          '<ul class="help-list">' + results.map(function (a) {
            return '<li><a class="help-item" href="' + esc(a.html_url) + '" target="_blank" rel="noopener">' +
              '<span class="help-title">' + esc(a.title) + '</span>' +
              (a.snippet ? '<span class="help-snippet">' + safeSnippet(a.snippet) + '…</span>' : '') +
              '<span class="help-open">Apri l\'articolo ' + ICON.arrow + '</span>' +
            '</a></li>';
          }).join('') + '</ul>'
        : '<p class="help-msg">Nessun articolo per «' + esc(q) + '». Prova con un\'altra parola, per esempio il nome della funzione.</p>';
      helpState.html = html;
      if (app.contains(box)) box.innerHTML = html;
    }).catch(function () {
      if (seq !== helpSeq || !app.contains(box)) return;
      box.innerHTML = '<p class="help-msg help-error">' + ICON.warn + '<span>' +
        (navigator.onLine === false ? 'Sei offline: la ricerca negli articoli richiede internet.' : 'Il centro assistenza non ha risposto. Riprova tra poco.') +
        '</span></p>';
    }).then(function () { clearTimeout(slow); });
  }

  // ---------- Ricerca in home ----------

  // Testo di ogni step (titolo, tasti, elenchi, tabelle, note) per la ricerca
  function stepText(st) {
    var parts = [st.phase, st.title, st.intro || ''];
    st.blocks.forEach(function (b) {
      if (b.label) parts.push(b.label);
      if (b.seq) b.seq.forEach(function (t) { parts.push(t.k || t.n || t.m || t.t || '', t.cap || ''); });
      if (b.items) parts = parts.concat(b.items);
      if (b.head) parts = parts.concat(b.head);
      if (b.rows) b.rows.forEach(function (r) { parts = parts.concat(r); });
      if (b.text) parts.push(b.text);
      if (b.type === 'input' || b.type === 'link') parts.push(b.label);
      if (b.caption) parts.push(b.caption);
    });
    return normalizeText(parts.join(' '));
  }
  var searchIndex = null;
  function buildIndex() {
    searchIndex = PRINTERS.map(function (p) {
      return {
        p: p,
        meta: normalizeText([p.name, printerLabel(p), p.op, p.brand, p.summary].join(' ')),
        steps: p.steps.map(stepText)
      };
    });
  }
  function searchWords(q) { return q.split(/\s+/).map(normalize).filter(Boolean); }
  function hasAll(text, words) { return words.every(function (w) { return text.indexOf(w) !== -1; }); }

  function homeResults(q) {
    if (!searchIndex) buildIndex();
    var words = searchWords(q);
    var html = '';
    searchIndex.forEach(function (e) {
      var all = e.meta + ' ' + e.steps.join(' ');
      if (!hasAll(all, words)) return;
      // step che contengono almeno una parola e, insieme a stampante e operazione, tutte
      var hits = [];
      e.steps.forEach(function (t, i) {
        var some = words.some(function (w) { return t.indexOf(w) !== -1; });
        if (some && hasAll(e.meta + ' ' + t, words)) hits.push(i);
      });
      html += '<div class="result">' +
        '<a class="result-head" href="#/p/' + e.p.id + '">' +
          '<span class="result-cat">' + esc(printerLabel(e.p)) + '</span>' +
          '<span class="printer-name">' + esc(e.p.op) + '</span>' +
        '</a>' +
        hits.map(function (i) {
          return '<a class="result-step" href="#/p/' + e.p.id + '/step/' + i + '">' +
            '<span class="sheet-mark">' + (i + 1) + '</span><span>' + esc(e.p.steps[i].title) + '</span></a>';
        }).join('') +
      '</div>';
    });
    FUNCTION_PAGES.forEach(function (f) {
      var n = 0;
      f.sections.forEach(function (sec) {
        sec.groups.forEach(function (g) {
          g.items.forEach(function (it) { if (hasAll(fnText(it), words)) n++; });
        });
      });
      if (!n) return;
      html += '<div class="result">' +
        '<a class="result-head" href="#/funzioni/' + f.id + '/' + encodeURIComponent(q.trim()) + '">' +
          '<span class="result-cat">' + esc(printerLabel(f)) + '</span>' +
          '<span class="printer-name">' + FN_OP + '</span>' +
          '<span class="printer-meta">' + n + (n === 1 ? ' funzione trovata' : ' funzioni trovate') + '</span>' +
        '</a>' +
      '</div>';
    });
    return html || '<p class="muted fn-empty">Nessun risultato.</p>';
  }

  function filterHome() {
    var input = app.querySelector('[data-home-search]');
    homeQuery = input.value;
    var active = searchWords(homeQuery).length > 0;
    var results = app.querySelector('.home-results');
    results.hidden = !active;
    results.innerHTML = active ? homeResults(homeQuery) : '';
  }

  // Filtra l'elenco senza ridisegnare la pagina (il campo di ricerca mantiene il focus).
  // Ogni parola cercata deve comparire nel codice o nella descrizione.
  function filterFunctions() {
    var words = app.querySelector('[data-filter]').value.split(/\s+/).map(normalize).filter(Boolean);
    var chip = app.querySelector('.fn-chip.is-active').getAttribute('data-chip');
    var any = false;
    app.querySelectorAll('.fn-section').forEach(function (sec) {
      var secHits = 0;
      var inChip = !chip || sec.getAttribute('data-section') === chip;
      sec.querySelectorAll('.fn-group').forEach(function (g) {
        var hits = 0;
        g.querySelectorAll('li').forEach(function (li) {
          var text = li.getAttribute('data-search');
          var ok = inChip && words.every(function (w) { return text.indexOf(w) !== -1; });
          li.hidden = !ok;
          if (ok) hits++;
        });
        g.hidden = !hits;
        secHits += hits;
      });
      sec.hidden = !secHits;
      if (secHits) any = true;
    });
    app.querySelector('.fn-empty').hidden = any;
  }

  function viewOverview(p) {
    var pr = progressOf(p.id);
    var phases = phasesOf(p).map(function (ph, i) {
      return '<li><span class="phase-num">' + (i + 1) + '</span><span class="phase-name">' + esc(ph.name) + '</span>' +
        '<span class="phase-count">' + ph.steps.length + (ph.steps.length === 1 ? ' step' : ' step') + '</span></li>';
    }).join('');
    var legend = (p.legend || []).map(function (l) {
      return '<li>' + renderToken(l.tok) + '<span>' + esc(l.text) + '</span></li>';
    }).join('');
    var needs = (p.needs || []).map(function (n) {
      return '<li><span class="dot">' + ICON.check + '</span><span>' + esc(n) + '</span></li>';
    }).join('');

    var actions = pr
      ? '<button class="btn btn-primary btn-block" data-action="resume">Riprendi da step ' + (pr.step + 1) + '</button>' +
        '<button class="btn btn-ghost btn-block" data-action="restart">' + ICON.restart + 'Ricomincia da capo</button>'
      : '<button class="btn btn-primary btn-block" data-action="start">Inizia la procedura</button>';

    return '<div class="screen overview">' +
      topbar('<a class="icon-btn" href="#/" aria-label="Torna alle procedure">' + ICON.back + '</a>') +
      '<main class="content">' +
        '<div class="overview-head">' +
          (photosOf(printersOf(p)[0])[0]
            ? '<span class="printer-photo">' + zoomPhoto(photosOf(printersOf(p)[0])[0], 'printer-photo-img', printersOf(p)[0]) + '</span>'
            : '<span class="printer-icon lg">' + ICON.printer + '</span>') +
          '<div><h1>' + esc(p.name) + '</h1><p class="muted">' + esc(p.summary) + '</p></div>' +
        '</div>' +
        (needs ? '<section class="panel"><h2>Cosa ti serve</h2><ul class="checklist">' + needs + '</ul></section>' : '') +
        (legend ? '<section class="panel"><h2>Legenda tasti</h2><ul class="legend">' + legend + '</ul></section>' : '') +
        '<section class="panel"><h2>Fasi della procedura</h2><ol class="phases">' + phases + '</ol></section>' +
      '</main>' +
      '<footer class="actionbar stack">' + actions + '</footer>' +
    '</div>';
  }

  function viewStep(p, i, dir) {
    var pr = ensureProgress(p.id);
    var s = p.steps[i];
    var total = p.steps.length;
    var phases = phasesOf(p);
    var phIdx = phaseIndexOf(p, i);
    var w = WHERE[s.where] || WHERE.printer;
    var pct = Math.round((i / total) * 100);
    var last = i === total - 1;

    return '<div class="screen wizard">' +
      topbar(
        '<a class="icon-btn" href="#/p/' + p.id + '" aria-label="Esci dalla procedura">' + ICON.close + '</a>',
        '<button class="icon-btn" data-action="steps" aria-label="Elenco degli step">' + ICON.list + '</button>',
        true
      ) +
      '<div class="progress">' +
        '<div class="progress-meta"><span><strong>' + esc(p.name) + '</strong> · Step <strong>' + (i + 1) + '</strong> di ' + total + '</span>' +
        '<span>Fase ' + (phIdx + 1) + '/' + phases.length + ' · ' + esc(s.phase) + '</span></div>' +
        '<div class="progress-track"><div class="progress-fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<main class="content">' +
        '<article class="step-card ' + (dir < 0 ? 'enter-back' : 'enter-fwd') + '">' +
          '<div class="where where-' + esc(s.where) + '">' + w.icon + '<span>' + w.label + '</span></div>' +
          '<h1 class="step-title"><span class="step-num">' + (i + 1) + '</span>' + esc(s.title) + '</h1>' +
          (s.intro ? '<p class="step-intro">' + esc(s.intro) + '</p>' : '') +
          s.blocks.map(function (b) { return renderBlock(b, pr.vars); }).join('') +
        '</article>' +
      '</main>' +
      '<footer class="actionbar">' +
        '<button class="btn btn-back" data-action="prev" aria-label="Step precedente"' + (i === 0 ? ' disabled' : '') + '>' + ICON.back + '</button>' +
        '<button class="btn btn-confirm" data-action="next">' + ICON.check + '<span>' + (last ? 'Completa' : 'Fatto, avanti') + '</span></button>' +
      '</footer>' +
    '</div>';
  }

  function viewStepsSheet(p, current) {
    var html = phasesOf(p).map(function (ph, pi) {
      return '<div class="sheet-phase"><div class="sheet-phase-name">' + (pi + 1) + '. ' + esc(ph.name) + '</div>' +
        ph.steps.map(function (si) {
          var st = si < current ? 'done' : si === current ? 'current' : '';
          return '<button class="sheet-step ' + st + '" data-goto="' + si + '">' +
            '<span class="sheet-mark">' + (si < current ? ICON.check : (si + 1)) + '</span>' +
            '<span>' + esc(p.steps[si].title) + '</span></button>';
        }).join('') + '</div>';
    }).join('');
    return '<div class="sheet-backdrop" data-action="close-sheet"></div>' +
      '<div class="sheet" role="dialog" aria-modal="true" aria-label="Elenco degli step">' +
        '<div class="sheet-head"><h2>Tutti gli step</h2>' +
        '<button class="icon-btn" data-action="close-sheet" aria-label="Chiudi">' + ICON.close + '</button></div>' +
        '<div class="sheet-body">' + html + '</div>' +
      '</div>';
  }

  function viewDone(p, result) {
    var phases = phasesOf(p).map(function (ph) {
      return '<li><span class="dot">' + ICON.check + '</span><span>' + esc(ph.name) + '</span></li>';
    }).join('');
    var when = result ? new Date(result.finishedAt).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' }) : '';
    return '<div class="screen done">' +
      topbar() +
      '<main class="content center">' +
        '<div class="done-badge">' + ICON.check + '</div>' +
        '<h1>Procedura completata</h1>' +
        '<p class="muted">' + esc(p.name) + (result ? ' · ' + when + ' · ' + formatDuration(result.finishedAt - result.startedAt) : '') + '</p>' +
        (result && result.vars && result.vars.ip ? '<p class="done-ip">IP stampante: <strong>' + esc(result.vars.ip) + '</strong></p>' : '') +
        '<section class="panel left"><h2>Fasi completate</h2><ul class="checklist done-list">' + phases + '</ul></section>' +
      '</main>' +
      '<footer class="actionbar stack">' +
        '<a class="btn btn-primary btn-block" href="#/">Torna alle procedure</a>' +
      '</footer>' +
    '</div>';
  }

  // ---------- Router ----------

  var lastStep = { id: null, i: -1 };
  var homePick = { printer: '', href: '' }; // scelte dei menu a tendina in home, ricordate tornando indietro
  var homeQuery = ''; // ricerca in home, ricordata tornando indietro
  var lastResult = null;

  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var dir = 1;

    if (parts[0] === 'p' && parts[1]) {
      var p = findPrinter(parts[1]);
      if (!p) return go('#/');

      if (parts[2] === 'step') {
        var i = parseInt(parts[3], 10);
        if (isNaN(i) || i < 0 || i >= p.steps.length) return go('#/p/' + p.id);
        if (lastStep.id === p.id && i < lastStep.i) dir = -1;
        var pr = ensureProgress(p.id);
        pr.step = i;
        saveStore();
        lastStep = { id: p.id, i: i };
        render(viewStep(p, i, dir));
        return;
      }
      if (parts[2] === 'done') {
        render(viewDone(p, lastResult && lastResult.id === p.id ? lastResult : null));
        return;
      }
      lastStep = { id: null, i: -1 };
      render(viewOverview(p));
      return;
    }

    lastStep = { id: null, i: -1 };
    if (parts[0] === 'assistenza') {
      var hc = findHelp(parts[1]);
      if (!hc) return go('#/');
      render(viewHelp(hc));
      return;
    }
    if (parts[0] === 'funzioni') {
      // #/funzioni (vecchio link) apre le funzioni Custom
      // #/funzioni/<pagina>/<ricerca> apre la pagina già filtrata (dalla ricerca in home)
      var page = findFunctionPage(parts[1] || 'custom');
      if (!page) return go('#/');
      render(viewFunctions(page));
      if (parts[2]) {
        app.querySelector('[data-filter]').value = decodeURIComponent(parts.slice(2).join('/'));
        filterFunctions();
      }
      return;
    }
    render(viewHome());
    if (homeQuery) filterHome();
  }

  function closeSheet() {
    var root = app.querySelector('.sheet-root');
    if (root) { root.remove(); restoreFocus(); }
  }

  function render(html) {
    app.innerHTML = html;
    updateNav();
    window.scrollTo(0, 0);
    var main = app.querySelector('.content');
    if (main) main.scrollTop = 0;
  }

  function currentPrinter() {
    var m = location.hash.match(/^#\/p\/([^/]+)/);
    return m ? findPrinter(m[1]) : null;
  }
  function currentStep() {
    var m = location.hash.match(/\/step\/(\d+)/);
    return m ? parseInt(m[1], 10) : -1;
  }

  function next() {
    var p = currentPrinter(), i = currentStep();
    if (!p || i < 0) return;
    if (i < p.steps.length - 1) return go('#/p/' + p.id + '/step/' + (i + 1));
    var pr = ensureProgress(p.id);
    lastResult = { id: p.id, startedAt: pr.startedAt, finishedAt: Date.now(), vars: pr.vars };
    clearProgress(p.id);
    lastStep = { id: null, i: -1 };
    // replace: il tasto indietro del telefono non deve riportare dentro la procedura conclusa
    location.replace('#/p/' + p.id + '/done');
  }
  function prev() {
    var p = currentPrinter(), i = currentStep();
    if (p && i > 0) go('#/p/' + p.id + '/step/' + (i - 1));
  }

  // ---------- Eventi ----------

  app.addEventListener('click', function (e) {
    var zoom = e.target.closest('[data-zoom]');
    if (zoom) return openZoom(zoom.getAttribute('data-zoom'), zoom.getAttribute('data-zoom-label'));
    var chip = e.target.closest('[data-chip]');
    if (chip) {
      app.querySelectorAll('.fn-chip').forEach(function (c) {
        c.classList.toggle('is-active', c === chip);
        c.setAttribute('aria-pressed', c === chip);
      });
      return filterFunctions();
    }
    var el = e.target.closest('[data-action],[data-goto]');
    if (!el) return;
    var p = currentPrinter();
    var action = el.getAttribute('data-action');

    if (el.hasAttribute('data-goto')) {
      return go('#/p/' + p.id + '/step/' + el.getAttribute('data-goto'));
    }
    switch (action) {
      case 'open-nav': openNav(); break;
      case 'theme': cycleTheme(); break;
      case 'reset-all': {
        var n = Object.keys(store.progress).length;
        if (confirm('Vuoi riportare allo step 1 ' + (n === 1 ? 'la procedura in corso' : 'tutte le ' + n + ' procedure in corso') + '? Anche i valori annotati (es. indirizzi IP) verranno cancellati.')) {
          store.progress = {};
          saveStore();
          route();
        }
        break;
      }
      case 'next': next(); break;
      case 'prev': prev(); break;
      case 'start':
        ensureProgress(p.id); saveStore();
        go('#/p/' + p.id + '/step/0'); break;
      case 'resume':
        go('#/p/' + p.id + '/step/' + progressOf(p.id).step); break;
      case 'restart':
        if (confirm('Vuoi ricominciare ' + p.name + ' dal primo step?')) {
          clearProgress(p.id); ensureProgress(p.id); saveStore();
          go('#/p/' + p.id + '/step/0');
        }
        break;
      case 'steps': {
        rememberFocus();
        var wrap = document.createElement('div');
        wrap.className = 'sheet-root';
        wrap.innerHTML = viewStepsSheet(p, currentStep());
        app.appendChild(wrap);
        var cur = wrap.querySelector('.sheet-step.current');
        if (cur) cur.scrollIntoView({ block: 'center' });
        (cur || wrap.querySelector('[data-action="close-sheet"].icon-btn')).focus({ preventScroll: true });
        break;
      }
      case 'close-sheet':
        closeSheet();
        break;
    }
  });

  app.addEventListener('change', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('data-pick')) onPick(e.target);
  });

  // Invio nella ricerca degli articoli: cerca subito e chiude la tastiera del telefono
  app.addEventListener('submit', function (e) {
    var form = e.target.closest('[data-help]');
    if (!form) return;
    e.preventDefault();
    clearTimeout(helpTimer);
    var input = form.querySelector('[data-help-q]');
    searchHelp(findHelp(form.getAttribute('data-help')), input.value);
    input.blur();
  });

  app.addEventListener('input', function (e) {
    if (e.target.hasAttribute && e.target.hasAttribute('data-filter')) return filterFunctions();
    if (e.target.hasAttribute && e.target.hasAttribute('data-home-search')) return filterHome();
    if (e.target.hasAttribute && e.target.hasAttribute('data-help-q')) {
      var hcIn = findHelp(e.target.form.getAttribute('data-help'));
      var val = e.target.value;
      clearTimeout(helpTimer);
      helpTimer = setTimeout(function () { searchHelp(hcIn, val); }, 400);
      return;
    }
    var key = e.target.getAttribute && e.target.getAttribute('data-var');
    var p = currentPrinter();
    if (!key || !p) return;
    ensureProgress(p.id).vars[key] = e.target.value.trim();
    saveStore();
  });

  document.addEventListener('keydown', function (e) {
    if (document.querySelector('.zoom-root')) {
      if (e.key === 'Escape') closeZoom();
      else if (e.key === 'Tab') trapTab(e, document.querySelector('.zoom-root'));
      return;
    }
    if (document.body.classList.contains('nav-open') && navIsOverlay()) {
      if (e.key === 'Escape') closeNav();
      else if (e.key === 'Tab') trapTab(e, nav);
      return;
    }
    if (currentStep() < 0) return;
    if (app.querySelector('.sheet-root')) {
      if (e.key === 'Escape') closeSheet();
      else if (e.key === 'Tab') trapTab(e, app.querySelector('.sheet'));
      return;
    }
    var typing = e.target.tagName === 'INPUT';
    // Invio su un pulsante o un link lo attiva; altrove (o dentro un campo) passa allo step successivo
    var control = /^(BUTTON|A|SELECT|SUMMARY|TEXTAREA)$/.test(e.target.tagName);
    if (e.key === 'Enter' && !control) { e.preventDefault(); next(); }
    else if (!typing && e.key === 'ArrowRight') next();
    else if (!typing && e.key === 'ArrowLeft') prev();
  });

  window.addEventListener('hashchange', function () { closeNav(); closeZoom(); route(); });
  renderNav();
  applyTheme();
  route();

  // Funzionamento offline (solo se servita via http/https, es. GitHub Pages)
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js');
  }
})();
