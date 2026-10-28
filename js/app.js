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
    restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>'
  };

  var WHERE = {
    printer: { label: 'Sulla stampante', icon: ICON.printer },
    pc: { label: 'Sul PC · RX Config', icon: ICON.pc },
    web: { label: 'Sul portale web', icon: ICON.web },
    react: { label: 'Sul PC · React app', icon: ICON.pc }
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

  function logo(cls) {
    return '<picture><source srcset="assets/logo-dark.png" media="(prefers-color-scheme: dark)">' +
      '<img class="' + cls + '" src="assets/logo.png" alt="SC Sistemi di Cassa"></picture>';
  }

  // Barra superiore fissa con il logo sempre visibile al centro
  function topbar(left, right) {
    return '<header class="topbar">' +
      (left || '<span class="icon-btn-spacer"></span>') +
      '<a class="topbar-logo" href="#/" aria-label="Home">' + logo('topbar-logo-img') + '</a>' +
      (right || '<span class="icon-btn-spacer"></span>') +
    '</header>';
  }

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
      case 'input':
        return '<label class="block field"><span class="field-label">' + esc(b.label) + '</span>' +
          '<input type="text" inputmode="decimal" autocomplete="off" data-var="' + esc(b.var) + '" placeholder="' + esc(b.placeholder || '') + '" value="' + esc((vars && vars[b.var]) || '') + '"></label>';
      default:
        return '';
    }
  }

  // ---------- Schermate ----------

  function viewHome() {
    var cards = PRINTERS.map(function (p) {
      var pr = progressOf(p.id);
      var badge = pr ? '<span class="badge">In corso · step ' + (pr.step + 1) + ' di ' + p.steps.length + '</span>' : '';
      return '<a class="printer-card" href="#/p/' + p.id + '">' +
        '<span class="printer-icon">' + ICON.printer + '</span>' +
        '<span class="printer-body">' +
          '<span class="printer-name">' + esc(p.name) + '</span>' +
          '<span class="printer-meta">' + p.steps.length + ' step · ' + phasesOf(p).length + ' fasi</span>' +
          badge +
        '</span>' +
        '<span class="printer-go">' + ICON.arrow + '</span>' +
      '</a>';
    }).join('');

    return '<div class="screen home">' +
      topbar() +
      '<header class="hero">' +
        '<div class="brand-name">Configurazioni fiscali</div>' +
        '<h1>Quale stampante vuoi configurare?</h1>' +
        '<p class="lead">Segui la procedura passo per passo. Conferma ogni step con la V verde.</p>' +
      '</header>' +
      '<main class="printer-list">' + cards + '</main>' +
    '</div>';
  }

  function viewOverview(p) {
    var pr = progressOf(p.id);
    var phases = phasesOf(p).map(function (ph, i) {
      return '<li><span class="phase-num">' + (i + 1) + '</span><span class="phase-name">' + esc(ph.name) + '</span>' +
        '<span class="phase-count">' + ph.steps.length + (ph.steps.length === 1 ? ' step' : ' step') + '</span></li>';
    }).join('');
    var legend = p.legend.map(function (l) {
      return '<li>' + renderToken(l.tok) + '<span>' + esc(l.text) + '</span></li>';
    }).join('');
    var needs = p.needs.map(function (n) {
      return '<li><span class="dot">' + ICON.check + '</span><span>' + esc(n) + '</span></li>';
    }).join('');

    var actions = pr
      ? '<button class="btn btn-primary btn-block" data-action="resume">Riprendi da step ' + (pr.step + 1) + '</button>' +
        '<button class="btn btn-ghost btn-block" data-action="restart">' + ICON.restart + 'Ricomincia da capo</button>'
      : '<button class="btn btn-primary btn-block" data-action="start">Inizia la configurazione</button>';

    return '<div class="screen overview">' +
      topbar('<a class="icon-btn" href="#/" aria-label="Torna alla scelta stampante">' + ICON.back + '</a>') +
      '<main class="content">' +
        '<div class="overview-head">' +
          '<span class="printer-icon lg">' + ICON.printer + '</span>' +
          '<div><h1>' + esc(p.name) + '</h1><p class="muted">' + esc(p.summary) + '</p></div>' +
        '</div>' +
        '<section class="panel"><h2>Cosa ti serve</h2><ul class="checklist">' + needs + '</ul></section>' +
        '<section class="panel"><h2>Legenda tasti</h2><ul class="legend">' + legend + '</ul></section>' +
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
        '<button class="icon-btn" data-action="steps" aria-label="Elenco degli step">' + ICON.list + '</button>'
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
      '<div class="sheet" role="dialog" aria-label="Elenco degli step">' +
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
        '<h1>Configurazione completata</h1>' +
        '<p class="muted">' + esc(p.name) + (result ? ' · ' + when + ' · ' + formatDuration(result.finishedAt - result.startedAt) : '') + '</p>' +
        (result && result.vars && result.vars.ip ? '<p class="done-ip">IP stampante: <strong>' + esc(result.vars.ip) + '</strong></p>' : '') +
        '<section class="panel left"><h2>Fasi completate</h2><ul class="checklist done-list">' + phases + '</ul></section>' +
      '</main>' +
      '<footer class="actionbar stack">' +
        '<a class="btn btn-primary btn-block" href="#/">Configura un\'altra stampante</a>' +
      '</footer>' +
    '</div>';
  }

  // ---------- Router ----------

  var lastStep = { id: null, i: -1 };
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
    render(viewHome());
  }

  function render(html) {
    app.innerHTML = html;
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
    var el = e.target.closest('[data-action],[data-goto]');
    if (!el) return;
    var p = currentPrinter();
    var action = el.getAttribute('data-action');

    if (el.hasAttribute('data-goto')) {
      return go('#/p/' + p.id + '/step/' + el.getAttribute('data-goto'));
    }
    switch (action) {
      case 'next': next(); break;
      case 'prev': prev(); break;
      case 'start':
        ensureProgress(p.id); saveStore();
        go('#/p/' + p.id + '/step/0'); break;
      case 'resume':
        go('#/p/' + p.id + '/step/' + progressOf(p.id).step); break;
      case 'restart':
        if (confirm('Vuoi ricominciare la configurazione di ' + p.name + ' dal primo step?')) {
          clearProgress(p.id); ensureProgress(p.id); saveStore();
          go('#/p/' + p.id + '/step/0');
        }
        break;
      case 'steps': {
        var wrap = document.createElement('div');
        wrap.className = 'sheet-root';
        wrap.innerHTML = viewStepsSheet(p, currentStep());
        app.appendChild(wrap);
        var cur = wrap.querySelector('.sheet-step.current');
        if (cur) cur.scrollIntoView({ block: 'center' });
        break;
      }
      case 'close-sheet': {
        var root = app.querySelector('.sheet-root');
        if (root) root.remove();
        break;
      }
    }
  });

  app.addEventListener('input', function (e) {
    var key = e.target.getAttribute && e.target.getAttribute('data-var');
    var p = currentPrinter();
    if (!key || !p) return;
    ensureProgress(p.id).vars[key] = e.target.value.trim();
    saveStore();
  });

  document.addEventListener('keydown', function (e) {
    if (currentStep() < 0) return;
    if (app.querySelector('.sheet-root')) {
      if (e.key === 'Escape') app.querySelector('.sheet-root').remove();
      return;
    }
    var typing = e.target.tagName === 'INPUT';
    if (e.key === 'Enter') { e.preventDefault(); next(); }
    else if (!typing && e.key === 'ArrowRight') next();
    else if (!typing && e.key === 'ArrowLeft') prev();
  });

  window.addEventListener('hashchange', route);
  route();

  // Funzionamento offline (solo se servita via http/https, es. GitHub Pages)
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    navigator.serviceWorker.register('sw.js');
  }
})();
