"use strict";
"use strict";

// ============================================================
//  INTERFACE (DOM)
// ============================================================

var editor   = document.getElementById('code');
var highlight = document.getElementById('highlight');
var gutter   = document.getElementById('lineNumbers');
var consoleEl = document.getElementById('console');
var consoleGutter = document.getElementById('consoleGutter');
var btnRun   = document.getElementById('btnRun');
var runStatus = document.getElementById('runStatus');
var statusbar = document.getElementById('statusbar');
var chkAssign = document.getElementById('chkAssign');
var consolePanel = document.getElementById('consolePanel');
document.getElementById('headerClose').addEventListener('click', function () {
  window.close();
});
var nwWin = null;
try {
  if (typeof nw !== 'undefined' && nw.Window && nw.Window.get) nwWin = nw.Window.get();
  else if (typeof require === 'function' && typeof process !== 'undefined' && process.versions && process.versions.nw) nwWin = require('nw.gui').Window.get();
} catch (e) { nwWin = null; }
var headerMaxIcon = document.getElementById('headerMaxIcon');
var headerMaximized = false;
var ICON_MAX_REST = '<rect x="2.5" y="2.5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>';
var ICON_MAX_DONE = ICON_MAX_REST + '<rect x="5" y="5" width="6.5" height="6.5" rx="1" fill="currentColor"/>';
function setMaxIcon(el, maxed) {
  if (el) el.innerHTML = maxed ? ICON_MAX_DONE : ICON_MAX_REST;
}
function setHeaderMaxIcon(maxed) { setMaxIcon(headerMaxIcon, maxed); }
function toggleModalMaximize(modal, maxClass, iconEl) {
  if (!modal) return false;
  var isMax = modal.classList.toggle(maxClass);
  setMaxIcon(iconEl, isMax);
  return isMax;
}
document.getElementById('headerMaximize').addEventListener('click', function () {
  if (nwWin) {
    try { if (headerMaximized) nwWin.restore(); else nwWin.maximize(); } catch (e) {}
    return;
  }
  var el = document.documentElement;
  var fsEl = document.fullscreenElement || document.webkitFullscreenElement;
  if (fsEl) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } else {
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  }
});
if (nwWin) {
  try {
    nwWin.on('maximize', function () { headerMaximized = true; setHeaderMaxIcon(true); });
    nwWin.on('restore', function () { headerMaximized = false; setHeaderMaxIcon(false); });
    nwWin.on('enterfullscreen', function () { headerMaximized = true; setHeaderMaxIcon(true); });
    nwWin.on('leavefullscreen', function () { headerMaximized = false; setHeaderMaxIcon(false); });
  } catch (e) {}
}
var splitter = document.getElementById('splitter');
var mainEl = document.querySelector('main');
var modalOverlay = document.getElementById('modalOverlay');
var modalClose = document.getElementById('modalClose');
var running = false;

var EDITOR_FONT_MIN = 8;
var EDITOR_FONT_MAX = 30;
var editorFontSize = 14;
var editorLineHeight = 21;

var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };

function updateLineNumbers() {
  var val = editor.value;
  var count = val.split('\n').length + (val.charAt(val.length - 1) === '\n' ? 1 : 0);
  var parts = new Array(count);
  for (var i = 0; i < count; i++) parts[i] = '<div>' + (i + 1) + '</div>';
  gutter.innerHTML = parts.join('');
}

function renderHighlight() {
  var tokens = tokenizeHighlight(editor.value);
  var html = '';
  for (var i = 0; i < tokens.length; i++) {
    html += '<span class="h-' + tokens[i].type + '">' + escapeHtml(tokens[i].text) + '</span>';
  }
  if (editor.value.charAt(editor.value.length - 1) === '\n') html += '\n';
  highlight.innerHTML = html;
}

function updateStatus() {
  var val = editor.value;
  var pos = editor.selectionStart || 0;
  var upto = val.slice(0, pos);
  var parts = upto.split('\n');
  var line = parts.length;
  var col = parts[parts.length - 1].length + 1;
  statusbar.textContent = 'Linha ' + line + ', Coluna ' + col + '  |  ' + val.split('\n').length + ' linhas, ' + val.length + ' caracteres';
}

function syncAll() {
  renderHighlight();
  updateLineNumbers();
  updateStatus();
}

var CODE_STORAGE_KEY = 'willprogCode';
function saveCode() {
  try { localStorage.setItem(CODE_STORAGE_KEY, editor.value); } catch (e) {}
}

function syncConsoleGutter() {
  var lines = 0;
  var logs = consoleEl.children;
  var lh = editorLineHeight;
  for (var i = 0; i < logs.length; i++) {
    if (logs[i].classList.contains('placeholder')) continue;
    var h = logs[i].getBoundingClientRect().height;
    lines += Math.max(1, Math.round(h / lh));
  }
  var html = '';
  for (var j = 1; j <= lines; j++) html += '<div class="cg-line">' + j + '</div>';
  consoleGutter.innerHTML = html;
  consoleGutter.scrollTop = consoleEl.scrollTop;
}

function clearConsole() {
  consoleEl.innerHTML = '';
  var ph = document.createElement('div');
  ph.className = 'placeholder';
  ph.textContent = 'Pressione Executar para ver a saída do programa.';
  consoleEl.appendChild(ph);
  syncConsoleGutter();
}

function addConsole(rec, isFinal) {
  var ph = consoleEl.querySelector('.placeholder');
  if (ph) ph.remove();
  var div = document.createElement('div');
  div.className = 'log';
  if (isFinal) div.className += ' final';
  if (rec.kind === 'error') div.className += ' error';
  else if (rec.kind === 'assign') div.className += ' assign';
  else if (rec.kind === 'info' || rec.kind === 'waitKey') div.className += ' info';
  div.textContent = rec.text;
  consoleEl.appendChild(div);
  consoleEl.scrollTop = consoleEl.scrollHeight;
  syncConsoleGutter();
}

consoleEl.addEventListener('scroll', function () {
  consoleGutter.scrollTop = consoleEl.scrollTop;
});

function addConsoleInfo(text, isError) {
  addConsole({ kind: 'info', text: text, lineNo: null, isError: !!isError });
}

var lastJanela = null;
var lastJanelaCopy = null;
var janelaDirty = false;
var janelaVis = null;
var janelaUsada = false;
var janelaFechada = false;
var janelaWaitCancel = null;

function interromperEsperaJanela() {
  if (janelaWaitCancel) {
    var f = janelaWaitCancel;
    janelaWaitCancel = null;
    f();
  }
}

function sleepJanela(ms) {
  return new Promise(function (resolve) {
    var done = false;
    var fim = function () {
      if (done) return;
      done = true;
      if (janelaWaitCancel === fim) janelaWaitCancel = null;
      resolve();
    };
    janelaWaitCancel = fim;
    setTimeout(fim, ms);
  });
}

function janelaBorda(bg) {
  var hex = bg.charAt(0) === '#' ? bg.slice(1) : bg;
  var r = parseInt(hex.substr(0, 2), 16);
  var g = parseInt(hex.substr(2, 2), 16);
  var b = parseInt(hex.substr(4, 2), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#000000' : '#ffffff';
}

function openJanela(w, h, bg, titulo) {
  lastJanela = { w: w, h: h, bg: bg || '#000000', points: [], lines: [], circles: [], rects: [], texts: [] };
  janelaVis = null;
  janelaUsada = true;
  janelaFechada = false;
  document.getElementById('janelaTitle').textContent = titulo || 'Janela';
  wmOpen('janelaOverlay');
  renderJanela();
}

function renderJanela() {
  if (!lastJanela) return;
  var w = lastJanela.w;
  var h = lastJanela.h;
  var nP = lastJanela.points.length;
  var nL = lastJanela.lines.length;
  var nC = lastJanela.circles.length;
  var nR = lastJanela.rects.length;
  var nT = lastJanela.texts.length;
  if (janelaVis) {
    nP = Math.min(janelaVis.p, nP);
    nL = Math.min(janelaVis.l, nL);
    nC = Math.min(janelaVis.c, nC);
    nR = Math.min(janelaVis.r, nR);
    nT = Math.min(janelaVis.t, nT);
  }
  var canvas = document.getElementById('janelaCanvas');
  var dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  var body = document.getElementById('janelaBody');
  var availW = body.clientWidth - 32;
  var availH = body.clientHeight - 28;
  if (!isFinite(availW) || availW <= 0) availW = (window.innerWidth || 800) * 0.92;
  if (!isFinite(availH) || availH <= 0) availH = (window.innerHeight || 600) * 0.75;
  var scale = Math.min(1, availW / w, availH / h);
  if (!isFinite(scale) || scale <= 0) scale = 1;
  canvas.style.width = Math.round(w * scale) + 'px';
  canvas.style.height = Math.round(h * scale) + 'px';
  var ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = lastJanela.bg;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = janelaBorda(lastJanela.bg);
  ctx.lineWidth = 2;
  ctx.strokeRect(1, 1, w - 2, h - 2);
  for (var l = 0; l < nL; l++) {
    var ln = lastJanela.lines[l];
    ctx.strokeStyle = ln.c;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ln.x1, ln.y1);
    ctx.lineTo(ln.x2, ln.y2);
    ctx.stroke();
  }
  for (var rq = 0; rq < nR; rq++) {
    var rqi = lastJanela.rects[rq];
    ctx.beginPath();
    ctx.rect(rqi.x, rqi.y, rqi.w, rqi.h);
    if (rqi.fill) {
      ctx.fillStyle = rqi.fill;
      ctx.fill();
    }
    ctx.strokeStyle = rqi.c;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  for (var c = 0; c < nC; c++) {
    var ci = lastJanela.circles[c];
    ctx.beginPath();
    ctx.arc(ci.x, ci.y, ci.r, 0, Math.PI * 2);
    if (ci.fill) {
      ctx.fillStyle = ci.fill;
      ctx.fill();
    }
    ctx.strokeStyle = ci.c;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
  for (var p = 0; p < nP; p++) {
    ctx.fillStyle = lastJanela.points[p].c;
    ctx.beginPath();
    ctx.arc(lastJanela.points[p].x, lastJanela.points[p].y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.font = '14px Consolas, monospace';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  for (var t = 0; t < nT; t++) {
    var txt = lastJanela.texts[t];
    ctx.fillStyle = txt.c;
    ctx.font = txt.s + 'px Consolas, monospace';
    ctx.fillText(txt.t, txt.x, txt.y);
  }
}

async function run() {
  acClose();
  if (running) return;
  running = true;
  btnRun.disabled = true;
  btnRun.innerHTML = '&#8230; Executando';
  runStatus.textContent = '● executando...';
  clearConsole();
  closeEmJanela();
  janelaUsada = false;
  janelaFechada = false;

  WP_INPUT_QUEUE.length = 0;
  WP_INPUT_CTX = true;
  var records;
  try {
    records = executeProgram(editor.value);
  } finally {
    WP_INPUT_CTX = false;
  }
  var showAssign = chkAssign.checked;
  var errors = 0;

  var lastOut = -1;
  for (var li = 0; li < records.length; li++) {
    if (records[li].kind === 'out' || records[li].kind === 'return') lastOut = li;
  }

  if (records.length === 0) {
    addConsoleInfo('Nenhum código para executar.');
  }

  var timerCount = 0;
  var playPos = { i: 0 };
  for (var i = 0; i < records.length || timerCount > 0; i++) {
    while (i >= records.length && timerCount > 0) { await sleep(30); }
    if (i >= records.length) { break; }
    var rec = records[i];
    playPos.i = i + 1;
    if (rec.kind === 'clear') { clearConsole(); continue; }
    if (rec.kind === 'pause') {
      if (!(janelaUsada && janelaFechada)) {
        if (!rec.silent) addConsole(rec, false);
        await sleepJanela(Math.max(0, rec.secs) * 1000);
      }
      continue;
    }
    if (rec.kind === 'clearJanela') {
      if (lastJanela) {
        lastJanela.points = [];
        lastJanela.lines = [];
        lastJanela.circles = [];
        lastJanela.rects = [];
        lastJanela.texts = [];
        lastJanelaCopy = null;
        janelaDirty = true;
      }
      if (!(janelaUsada && janelaFechada)) {
        janelaVis = { p: 0, l: 0, c: 0, r: 0, t: 0 };
        renderJanela();
      }
      continue;
    }
    if (rec.kind === 'corFundo') {
      if (lastJanela) {
        lastJanela.bg = rec.bg;
        janelaDirty = true;
      }
      if (!(janelaUsada && janelaFechada)) {
        janelaVis = { p: lastJanela ? lastJanela.points.length : 0, l: lastJanela ? lastJanela.lines.length : 0, c: lastJanela ? lastJanela.circles.length : 0, r: lastJanela ? lastJanela.rects.length : 0, t: lastJanela ? lastJanela.texts.length : 0 };
        renderJanela();
      }
      continue;
    }
    if (rec.kind === 'timer') {
      timerCount++;
      (function (tRec) {
        setTimeout(function () {
          timerCount--;
          var at = Math.min(playPos.i, records.length);
          records.splice.apply(records, [at, 0].concat(tRec.inner));
          if (i > at) i = at;
        }, Math.max(0, tRec.secs) * 1000);
      })(rec);
      continue;
    }
    if (rec.kind === 'render') {
      var nxR = records[i + 1];
      if (!(nxR && nxR.kind === 'render') && !(janelaUsada && janelaFechada)) {
        janelaVis = { p: rec.vp, l: rec.vl, c: rec.vc, r: rec.vr, t: rec.vt };
        renderJanela();
      }
      continue;
    }
    if (rec.kind === 'sound') {
      if (typeof rec.freq === 'number' && isFinite(rec.freq)) emitTone(rec.freq, Math.max(0.001, rec.secs));
      else emitBipe(Math.max(0.001, rec.secs));
      await sleep(15);
      continue;
    }
    if (rec.kind === 'melody') {
      for (var mi = 0; mi < rec.freqs.length; mi++) {
        emitTone(rec.freqs[mi], Math.max(0.001, rec.secs));
        await sleep(Math.max(0, rec.secs) * 1000);
      }
      continue;
    }
    if (rec.kind === 'message') {
      await showMessageBox(rec.title, rec.body);
      continue;
    }
    if (rec.kind === 'select') {
      await showSelecionarOpcao(rec.options);
      continue;
    }
    if (rec.kind === 'window') {
      await processEmJanela(rec.inner, rec.centered);
      continue;
    }
    if (rec.kind === 'rerun') {
      var rr = [];
      try {
        execStatement(rec.line, rec.lineNo, GLOBAL_ENV, rr, true);
      } catch (e) {
        if (e && e.wpReturn) rr.push({ kind: 'error', text: 'retorne usado fora de uma função', lineNo: rec.lineNo });
        else if (e && e.wpPare) rr.push({ kind: 'error', text: "'pare' usado fora de um laço", lineNo: rec.lineNo });
        else if (e && e.wpContinue) rr.push({ kind: 'error', text: "'continue' usado fora de um laço", lineNo: rec.lineNo });
        else throw e;
      }
      records.splice.apply(records, [i + 1, 0].concat(rr));
      continue;
    }
    if (rec.kind === 'waitKey') {
      addConsole(rec, false);
      await waitKey(rec.key);
      continue;
    }
    if (rec.kind === 'input') {
      if (!rec.resumePath) {
        records.splice.apply(records, [i + 1, 0].concat([{ kind: 'error', text: "não foi possível continuar o programa após este 'leia'", lineNo: rec.lineNo }]));
        continue;
      }
      var respIn = null;
      try { respIn = await showInputBox(rec.msg || rec.text || ''); } catch (eIn) { respIn = null; }
      if (respIn === null) {
        records.splice.apply(records, [i + 1, 0].concat([{ kind: 'error', text: 'Entrada cancelada', lineNo: rec.lineNo }]));
        continue;
      }
      WP_INPUT_QUEUE.push(respIn);
      var nrIn;
      WP_INPUT_CTX = true;
      try {
        nrIn = executeProgram(editor.value, { resumePath: rec.resumePath, resumeEnv: rec.env });
      } finally {
        WP_INPUT_CTX = false;
      }
      records.splice.apply(records, [i + 1, 0].concat(nrIn));
      continue;
    }
    if (rec.kind === 'assign' && !showAssign) continue;
    if (rec.kind === 'error') errors++;
    addConsole(rec, i === lastOut);
    await sleep(15);
  }

  if (records.length > 0) {
    addConsoleInfo(errors === 0 ? 'Execução concluída com sucesso.' : 'Execução concluída com ' + errors + ' erro(s).');
  }

  runStatus.textContent = errors === 0 ? '● concluído' : '● concluído com erros';
  WP_INPUT_QUEUE.length = 0;
  running = false;
  btnRun.disabled = false;
  btnRun.innerHTML = '&#9654; Executar';
}

function insertAtCursor(text, insideParens) {
  var start = editor.selectionStart || 0;
  var end = editor.selectionEnd || 0;
  var before = editor.value.slice(0, start);
  var after = editor.value.slice(end);
  var value = before + text + after;
  editor.value = value;
  var caret = start + text.length;
  if (insideParens) caret = start + text.length - 1;
  editor.setSelectionRange(caret, caret);
  syncAll();
  saveCode();
  editor.focus();
}


// ============================================================
//  AUTOCOMPLETAR (SUGESTÕES ENQUANTO DIGITA)
// ============================================================

var acEl = document.getElementById('autocomplete');
var acNavKey = false;

var AC_ALL = (function () {
  var list = [];
  function add(name, insert, paren, cat, desc) {
    list.push({ name: name, insert: insert, paren: !!paren, cat: cat, desc: desc });
  }
  add('mostre', 'mostre ', false, 'Saída', 'Exibe o valor de uma expressão');
  add('limpe', 'limpe', false, 'Saída', 'Apaga o console');
  add('#: ... :#', '#:\n\n:#', false, 'Comentário', 'Comenta um bloco de código (não-executável) entre #: e :#');
  add('leia', 'leia ', false, 'Entrada', 'Lê um valor digitado (ex.: nome = leia "Nome: ")');
  add('aguardeTecla', 'aguardeTecla()', true, 'Entrada', 'Aguarda o usuário pressionar uma tecla (ex.: aguardeTecla("Z"))');
  add('pausa', 'pausa()', true, 'Controle', 'Pausa a execução por s segundos (pode ser fracionado)');
  add('regressiva', 'regressiva():', true, 'Controle', 'Contagem regressiva sem parar o programa; executa o bloco indentado quando a contagem termina');
  add('bipe', 'bipe()', true, 'Som', 'Emite um sinal sonoro por s segundos (pode ser fracionado)');
  add('som', 'som()', true, 'Som', 'Emite um som com frequência f em Hz por s segundos');
  add('toca', 'toca()', true, 'Som', 'Toca uma sequência de notas musicais, cada uma por s segundos');
  add('mensagem', 'mensagem()', true, 'Saída', 'Abre uma caixa de mensagem com título e texto');
  add('pegar', 'pegar()', true, 'Visualização', 'Copia a parte do desenho dentro do retângulo (x0, y0)-(x1, y1)');
  add('colocar', 'colocar()', true, 'Visualização', 'Coloca a parte copiada com pegar no retângulo (x0, y0)-(x1, y1)');
  add('limparJanela', 'limparJanela', true, 'Visualização', 'Limpa a janela criada por janela(x,y)');
  add('corFundo', 'corFundo()', true, 'Visualização', 'Altera a cor de fundo da janela: corFundo(azul)');
  add('se', 'se ', false, 'Controle', 'Executa um bloco se a condição for verdadeira');
  add('senão', 'senão:', false, 'Controle', 'Executa um bloco quando a condição do se é falsa');
  add('enquanto', 'enquanto ', false, 'Controle', 'Repete enquanto a condição for verdadeira');
  add('selecionar opção', 'selecionar opção:', false, 'Controle', 'Abre uma janela com um menu de opções executáveis pelo teclado');
  add('emJanela', 'emJanela:', false, 'Janela', 'Executa o bloco indentado em uma janela maximizada ao invés do console');
  add('emJanela(centralizar)', 'emJanela(centralizar):', false, 'Janela', 'Como emJanela:, mas com o texto centralizado na janela');
  add('repita', 'repita()', true, 'Controle', 'Repete o bloco um número fixo de vezes');
  add('para cada', 'para cada ', false, 'Controle', 'Percorre os itens de uma coleção');
  add('para x em', 'para x em ', false, 'Controle', 'Percorre os itens de uma coleção (sem "cada")');
  add('pare', 'pare', false, 'Controle', 'Interrompe imediatamente o laço atual');
  add('continue', 'continue', false, 'Controle', 'Pula para a próxima iteração do laço');
  add('vá para', 'vá para ', false, 'Controle', 'Salta a execução do programa para o rótulo indicado (ex.: vá para início)');
  add(': rótulo', ':nome', false, 'Controle', 'Define um rótulo, destino do comando "vá para" (ex.: :início)');
  add('definir função', 'definir função ', false, 'Controle', 'Define uma nova função');
  add('retorne', 'retorne ', false, 'Controle', 'Retorna um ou mais valores de uma função');
  add('retornar', 'retornar ', false, 'Controle', 'Retorna um ou mais valores de uma função');
  add('escolha', 'escolha ', false, 'Controle', 'Escolhe valor entre casos: escolha nota: caso 10: ... padrao: ...');
  add('caso', 'caso ', false, 'Controle', 'Caso de escolha: caso 10: mostre "perfeito"');
  add('padrao', 'padrao:', false, 'Controle', 'Caso padrão de escolha (quando nenhum caso coincide)');
  add('padrão', 'padrão:', false, 'Controle', 'Caso padrão de escolha (com acento)');
  add('constante', 'constante ', false, 'Variáveis', 'Define constante imutável: constante PI=3.14');
  add('tipo', 'tipo()', true, 'Introspecção', 'Tipo do valor: tipo(5)->número, tipo("a")->texto');
  add('e', 'e ', false, 'Lógica', 'E lógico');
  add('ou', 'ou ', false, 'Lógica', 'OU lógico');
  add('não', 'não ', false, 'Lógica', 'Negação lógica');
  add('se ... senão', ' se condição senão ', false, 'Operador', 'Ternário: valor se condição senão valor2 (ex: a se a<b senão b, "Aprovado" se média>=7 senão "Reprovado")');
  add('em', 'em ', false, 'Operador', 'Pertence: "Ana" em nome ou 5 em lista');
  add('existe', 'existe ', false, 'Operador', 'Existe valor em coleção: existe "a" em "banana" ou existe (a e "sol") em "dia de sol"');
  add('começa com', 'começa com ', false, 'Operador', 'Verifica prefixo: "Willog" começa com "Will"');
  add('termina com', 'termina com ', false, 'Operador', 'Verifica sufixo: "casa" termina com "sa"');
  add('verdadeiro', 'verdadeiro', false, 'Valor', 'Valor booleano verdadeiro');
  add('falso', 'falso', false, 'Valor', 'Valor booleano falso');
  add('salvar', 'salvar()', true, 'Arquivos', 'Salva variáveis, textos e números em um arquivo de texto');
  add('carregar', 'carregar()', true, 'Arquivos', 'Lê um arquivo de texto e devolve os valores às variáveis');
  add('\\', '\\ ', false, 'Operador', 'Resto da divisão: a \\ b (ex.: 10 \\ 3 -> 1)');
  add('mod', 'mod ', false, 'Operador', 'Resto da divisão: a mod b (alias de \\)');
  add('%', '%(,)', true, 'Matemática', 'Porcentagem: %(a, b) calcula a% de b (a×b÷100)');
  var fns = [
    ['selecionar', 'Listas', 'Seleciona uma parte (do início ao fim) de um texto, número ou lista'],
    ['comprimento', 'Matemática', 'Quantidade de caracteres de um texto, algarismos de um número ou elementos de uma lista'],
    ['captureTecla', 'Entrada', 'Mostra qual tecla o usuário pressionou como resposta ao último aguardeTecla()'],
    ['raizq', 'Matemática', 'Raiz quadrada de x'],
    ['variáveis', 'Variáveis', 'Mostra todas as variáveis definidas e seus valores'],
    ['raizc', 'Matemática', 'Raiz cúbica de x'],
    ['absoluto', 'Matemática', 'Valor absoluto (parte inteira) de x'],
    ['abs', 'Matemática', 'Valor absoluto (parte inteira) de x'],
    ['log', 'Matemática', 'Logaritmo de x na base informada'],
    ['logn', 'Matemática', 'Logaritmo natural de x'],
    ['ln', 'Matemática', 'Logaritmo natural de x'],
    ['arredondar', 'Matemática', 'Arredonda x com um número de casas decimais'],
    ['arred', 'Matemática', 'Arredonda x com um número de casas decimais'],
    ['pi', 'Matemática', 'Valor de pi (2 casas decimais)'],
    ['inteiro', 'Matemática', 'Parte inteira do número'],
    ['decimal', 'Matemática', 'Parte decimal do número'],
    ['fração', 'Matemática', 'Converte decimal em fração'],
    ['fracao', 'Matemática', 'Converte decimal em fração'],
    ['intervalo', 'Intervalo', 'Cria um intervalo numérico do início até o fim (inclusive), com passo opcional'],
    ['aleatório', 'Matemática', 'Número aleatório inteiro entre min e max'],
    ['dado', 'Matemática', 'Sorteia um número inteiro de 1 a 6, como um dado de seis faces'],
    ['moeda', 'Matemática', 'Sorteia "cara" ou "coroa", como o lançamento de uma moeda'],
    ['cos', 'Trigonometria', 'Cosseno de x (em radianos)'],
    ['sen', 'Trigonometria', 'Seno de x (em radianos)'],
    ['tan', 'Trigonometria', 'Tangente de x (em radianos)'],
    ['arcocos', 'Trigonometria', 'Arcocosseno de x (em radianos)'],
    ['arcosen', 'Trigonometria', 'Arcosseno de x (em radianos)'],
    ['arcotan', 'Trigonometria', 'Arcotangente de x (em radianos)'],
    ['paraLista', 'Conversão', 'Converte uma lista em outra lista'],
    ['paraTexto', 'Conversão', 'Converte um valor em texto'],
    ['maiúsculo', 'Texto', 'Converte o texto para MAIÚSCULAS'],
    ['minúsculo', 'Texto', 'Converte o texto para minúsculas'],
    ['substitua', 'Texto', 'Troca todas as ocorrências de um trecho por outro: substitua(texto, busca, troca)'],
    ['divida', 'Texto', 'Divide um texto em lista de partes, usando o separador informado; um número vira lista de algarismos'],
    ['junte', 'Texto', 'Junta os elementos de uma lista em um único texto, com separador opcional'],
    ['contém', 'Texto', 'Verifica se um texto ou lista contém o valor informado (devolve verdadeiro/falso)'],
    ['posição', 'Texto', 'Devolve a posição (a partir de 0) da primeira ocorrência do valor, ou -1 se não encontrar'],
    ['insira', 'Texto', 'Insere um valor depois da posição informada em um texto, número ou lista'],
    ['remova', 'Texto', 'Remove o caractere ou elemento na posição informada de um texto, número ou lista'],
    ['posiçãoEm', 'Texto', 'Devolve o caractere ou elemento que está na posição informada'],
    ['paraNúmero', 'Conversão', 'Converte texto numérico em valor'],
    ['janela', 'Gráficos', 'Abre uma janela gráfica (janela(larg, alt, cor, título))'],
    ['ponto', 'Gráficos', 'Desenha um ponto na janela'],
    ['linha', 'Gráficos', 'Traça uma linha na janela'],
    ['círculo', 'Gráficos', 'Desenha um círculo na janela'],
    ['retângulo', 'Gráficos', 'Desenha um retângulo na janela'],
    ['texto', 'Gráficos', 'Escreve um texto na janela'],
    ['ano', 'Data e Hora', 'Ano atual (yyyy)'],
    ['mês', 'Data e Hora', 'Mês atual (mm)'],
    ['dia', 'Data e Hora', 'Dia atual (dd)'],
    ['hora', 'Data e Hora', 'Hora atual'],
    ['data', 'Data e Hora', 'Data atual (dd/MM/yyyy)'],
    ['agora', 'Data e Hora', 'Hora, minuto e segundo atuais (HH:mm:ss)'],
    ['tempo', 'Data e Hora', 'Tempo decorrido (anos, meses e dias) entre duas datas dd/MM/yyyy'],
    ['adicionarDias', 'Data e Hora', 'Adiciona dias a uma data dd/MM/yyyy: adicionarDias("13/08/2026",10) -> 23/08/2026'],
    ['diaSemana', 'Data e Hora', 'Dia da semana de uma data dd/MM/yyyy: diaSemana("13/08/2026") -> quinta'],
    ['tipo', 'Introspecção', 'Tipo do valor: número/texto/lista/booleano/função'],
    ['primo', 'Matemática', 'Verifica se número é primo: primo(11) -> verdadeiro'],
    ['par', 'Matemática', 'Verifica se número é par: par(8) -> verdadeiro'],
    ['ímpar', 'Matemática', 'Verifica se número é ímpar: ímpar(3) -> verdadeiro'],
    ['impar', 'Matemática', 'Verifica se número é ímpar (sem acento)'],
    ['aparar', 'Texto', 'Remove espaços do início e fim: aparar(" escola ") -> escola'],
    ['extrair', 'Texto', 'Extrai caracteres por padrão: extrair("a1b2c3","[0-9]") -> 1,2,3'],
    ['filtrar', 'Lista', 'Filtra lista por condição: filtrar([1,2,3,4],x>2) -> 3,4'],
    ['mapear', 'Lista', 'Mapeia cada elemento: mapear([1,2,3],"x*2") -> 2,4,6'],
    ['mmc', 'Matemática', 'Mínimo múltiplo comum: mmc(2,4,8) -> 8'],
    ['mdc', 'Matemática', 'Máximo divisor comum: mdc(12,18) -> 6'],
    ['divisores', 'Matemática', 'Lista de divisores: divisores(12) -> 1,2,3,4,6,12'],
    ['fatores', 'Matemática', 'Fatores primos: fatores(42) -> 2,3,7'],
    ['média', 'Estatística', 'Média aritmética: média([10,20,30]) -> 20'],
    ['media', 'Estatística', 'Média aritmética (sem acento)'],
    ['mediana', 'Estatística', 'Valor central: mediana([3,1,4,1,5]) -> 3'],
    ['moda', 'Estatística', 'Valor mais frequente: moda([1,2,2,3]) -> 2'],
    ['variância', 'Estatística', 'Variância: variância([2,4,4,5,5,7,9]) -> 4'],
    ['desvioPadrao', 'Estatística', 'Desvio padrão: desvioPadrao([2,4,4,5,5,7,9]) -> 2'],
    ['produto', 'Estatística', 'Produto dos elementos: produto([2,3,4]) -> 24']
  ];
  for (var i = 0; i < fns.length; i++) {
    add(fns[i][0], fns[i][0] + '()', true, fns[i][1], fns[i][2]);
  }
  return list;
})();

var AC_PROPS = [
  { name: 'ordenada', insert: 'ordenada', paren: false, cat: 'Lista', desc: 'Retorna a lista em ordem crescente' },
  { name: 'mínimo', insert: 'mínimo', paren: false, cat: 'Lista', desc: 'Retorna o menor valor numérico da lista' },
  { name: 'máximo', insert: 'máximo', paren: false, cat: 'Lista', desc: 'Retorna o maior valor numérico da lista' },
  { name: 'adicionar', insert: 'adicionar()', paren: true, cat: 'Lista', desc: 'Adiciona valores ao final da lista ou concatena ao final do texto: "banana".adicionar("s") -> bananas' },
  { name: 'remover', insert: 'remover()', paren: true, cat: 'Lista', desc: 'Remove o elemento na posição informada (modifica a própria lista)' },
  { name: 'aleatório', insert: 'aleatório', paren: false, cat: 'Lista', desc: 'Sorteia um item aleatório da lista' },
  { name: 'embaralhar', insert: 'embaralhar', paren: false, cat: 'Lista', desc: 'Embaralha os itens da lista (modifica a própria lista)' },
  { name: 'soma', insert: 'soma', paren: false, cat: 'Lista', desc: 'Soma os elementos numéricos ou concatena os textos da lista' },
  { name: 'invertida', insert: 'invertida', paren: false, cat: 'Lista', desc: 'Retorna a lista ou o texto com a ordem dos itens invertida' },
  { name: 'contar', insert: 'contar', paren: false, cat: 'Lista', desc: 'Retorna a quantidade de itens de uma lista ou de caracteres de um texto' },
  { name: 'tamanho', insert: 'tamanho', paren: false, cat: 'Lista', desc: 'Retorna a quantidade de itens (alias de .contar): [1,2,3].tamanho -> 3' },
  { name: 'primeiro', insert: 'primeiro', paren: false, cat: 'Lista', desc: 'Retorna o primeiro elemento da lista ou primeiro caractere do texto: [1,2,3].primeiro -> 1' },
  { name: 'ultimo', insert: 'ultimo', paren: false, cat: 'Lista', desc: 'Retorna o último elemento da lista ou último caractere do texto: [1,2,3].ultimo -> 3' },
  { name: 'último', insert: 'último', paren: false, cat: 'Lista', desc: 'Retorna o último elemento (com acento)' },
  { name: 'fatiar', insert: 'fatiar()', paren: true, cat: 'Lista', desc: 'Retorna sublista/subtexto de início a fim (inclusive): [1,2,3,4,5].fatiar(1,3) -> 2,3,4' },
  { name: 'maiúsculo', insert: 'maiúsculo', paren: false, cat: 'Texto', desc: 'Converte para MAIÚSCULAS: "banana".maiúsculo -> BANANA' },
  { name: 'maiusculo', insert: 'maiusculo', paren: false, cat: 'Texto', desc: 'Converte para MAIÚSCULAS (sem acento)' },
  { name: 'minúsculo', insert: 'minúsculo', paren: false, cat: 'Texto', desc: 'Converte para minúsculas: "banana".minúsculo -> banana' },
  { name: 'minusculo', insert: 'minusculo', paren: false, cat: 'Texto', desc: 'Converte para minúsculas (sem acento)' },
  { name: 'contarItem', insert: 'contarItem()', paren: true, cat: 'Lista', desc: 'Retorna quantas vezes o valor aparece na lista ou no texto' },
  { name: 'distintos', insert: 'distintos', paren: false, cat: 'Lista', desc: 'Retorna apenas os valores únicos (remove duplicatas, mantendo a primeira ocorrência)' }
];

var QUICK_REF = (function () {
  var list = [];
  function qr(name, tag, desc, example) {
    list.push({ name: name, tag: tag, desc: desc, example: example });
  }
  qr('mostre', 'Comando', 'Exibe o valor de uma expressão', 'preco = 25\nquantidade = 4\nmostre "Total: R$ " + (preco * quantidade)');
  qr('limpe', 'Comando', 'Apaga o console', 'mostre "isto desaparecerá"\nlimpe\nmostre "console limpo"');
  qr('#: ... :#', 'Comentário', 'Comenta um bloco de código (não-executável) entre #: e :#', 'mostre "antes"\n#:\nmostre "isto não executa"\nx = 10\n:#\nmostre "depois"');
  qr('leia', 'Comando', 'Lê um valor digitado pelo usuário', 'nome = leia "Qual o seu nome? "\nmostre "Prazer, " + nome + "!"');
  qr('aguardeTecla', 'Comando', 'Aguarda o usuário pressionar uma tecla para continuar', 'mostre "Aperte Z"\naguardeTecla("Z")\nmostre "Você apertou Z!"\naguardeTecla()\nmostre "Apertei qualquer tecla!"');
  qr('captureTecla', 'Função', 'Mostra qual tecla o usuário pressionou como resposta ao último aguardeTecla()', 'aguardeTecla()\nmostre "Você apertou: " + captureTecla()');
  qr('se', 'Comando', 'Executa um bloco se a condição for verdadeira', 'idade = 18\nse idade >= 18:\n  mostre "Pode votar"\nsenão:\n  mostre "Não pode votar"');
  qr('senão', 'Comando', 'Bloco executado quando a condição do se é falsa', 'nota = 6\nse nota >= 6:\n  mostre "Aprovado"\nsenão:\n  mostre "Recuperação"');
  qr('enquanto', 'Comando', 'Repete enquanto a condição for verdadeira', 'n = 5\nenquanto n > 0:\n  mostre n\n  n = n - 1');
  qr('repita', 'Comando', 'Repete o bloco um número fixo de vezes', 'repita(4):\n  mostre "batida"');
  qr('selecionar opção', 'Comando', 'Abre uma janela com um menu de opções executáveis pelo teclado', 'selecionar opção:\n  <1> "Mostrar mensagem":\n    mostre "Opção 1"\n  <2> "Calcular quadrado":\n    mostre 5**2\n  <3> "Contar até 3":\n    para x em (1,3):\n      mostre x');
  qr('emJanela', 'Comando', 'Executa o bloco indentado em uma janela maximizada ao invés do console', 'emJanela:\n  mostre "Olá do janela!"\n  x = 5\n  mostre x + 1');
  qr('emJanela(centralizar)', 'Comando', 'Como emJanela:, mas com o texto centralizado na janela', 'emJanela(centralizar):\n  mostre "Título centralizado"\n  mostre "Linha 2"');
  qr('para cada', 'Comando', 'Percorre os itens de uma coleção', 'frutas = ["maçã", "banana", "uva"]\npara cada fruta em frutas:\n  mostre fruta');
  qr('pare', 'Comando', 'Interrompe imediatamente o laço atual', 'n = 1\nenquanto verdadeiro:\n  mostre n\n  n = n + 1\n  se n > 3:\n    pare');
  qr('continue', 'Comando', 'Pula para a próxima iteração do laço', 'para n em intervalo(1, 6):\n  se n == 3:\n    continue\n  mostre n');
  qr('vá para', 'Comando', 'Salta a execução do programa para um rótulo definido com ":nome" (como o GOTO do BASIC)', ':início\nx = leia "Valor: "\nse x >= 10:\n  mostre "Muito alto! Tente novamente!"\n  vá para início\nsenão:\n  mostre "Valor aceito!"');
  qr('para x em', 'Comando', 'Percorre os itens de uma coleção (sem "cada")', 'para n em intervalo(2, 6, 2):\n  mostre n');
  qr('definir função', 'Comando', 'Define uma nova função', 'definir função quadrado(n):\n  retorne n * n\nmostre quadrado(7)');
  qr('retorne', 'Comando', 'Retorna um ou mais valores de uma função (separados por vírgula)', 'definir função troca(a, b):\n  retorne b, a\nx, y = troca(1, 2)\nmostre x + " " + y');
  qr('retornar', 'Comando', 'Retorna um valor de uma função (sinônimo de retorne)', 'definir função saudação(nome):\n  retornar "Olá, " + nome\nmostre saudação("Ana")');
  qr('e', 'Comando', 'E lógico', 'idade = 25\naltura = 1.75\nse idade >= 18 e altura >= 1.60:\n  mostre "Apto"\nsenão:\n  mostre "Inapto"');
  qr('ou', 'Comando', 'OU lógico', 'dia = 7\nse dia == 6 ou dia == 7:\n  mostre "Fim de semana"\nsenão:\n  mostre "Dia útil"');
  qr('não', 'Comando', 'Negação lógica', 'ativo = falso\nse não ativo:\n  mostre "desativado"');
  qr('se ... senão', 'Operador', 'Ternário: valor se condição senão valor2', 'a=10\nb=20\nmostre a se a<b senão b\nmédia=6\nmostre "Aprovado" se média>=7 senão "Reprovado"');
  qr('em', 'Operador', 'Pertence: verifica se valor existe em texto ou lista', 'nome="Ana Clara"\nse "Ana" em nome:\n  mostre "encontrou"\nlista=[1,2,3]\nse 2 em lista:\n  mostre "tem 2"');
  qr('existe', 'Operador', 'Existe: existe valor em coleção, com e/ou/não', 'a="dia"\nse existe (a e "sol") em "dia de sol":\n  mostre "Tudo ok!"');
  qr('começa com', 'Operador', 'Verifica se texto começa com prefixo', 'se "Willog" começa com "Will":\n  mostre "ok"');
  qr('termina com', 'Operador', 'Verifica se texto termina com sufixo', 'se "casa" termina com "sa":\n  mostre "ok"');
  qr('escolha', 'Comando', 'Escolhe casos: escolha nota: caso 10: ... padrao: ...', 'nota=10\nescolha nota:\n  caso 10: mostre "perfeito"\n  caso 9: mostre "otimo"\n  padrao: mostre "estude mais"');
  qr('caso', 'Comando', 'Caso de escolha', 'escolha nota:\n  caso 10: mostre "perfeito"');
  qr('padrao', 'Comando', 'Caso padrão de escolha', 'escolha nota:\n  caso 10: mostre "perfeito"\n  padrao: mostre "estude mais"');
  qr('padrão', 'Comando', 'Caso padrão (com acento)', 'escolha nota:\n  caso 10: mostre "perfeito"\n  padrão: mostre "estude mais"');
  qr('constante', 'Comando', 'Define constante imutável', 'constante LOCAL="casa"\nconstante PI=3.14\nmostre LOCAL');
  qr('tipo', 'Função', 'Tipo do valor: número/texto/lista/booleano', 'mostre tipo(5)\nmostre tipo("Olá")\nmostre tipo(5==7)\nmostre tipo([1,2,3])');
  qr('aparar', 'Função', 'Remove espaços do início e fim', 'mostre aparar(" escola ")\nmostre aparar("    casa")');
  qr('extrair', 'Função', 'Extrai caracteres por padrão', 'mostre extrair("a1b2c3","[0-9]")\nmostre extrair("a1b2c3","[a-z]")');
  qr('filtrar', 'Função', 'Filtra lista por condição', 'mostre filtrar([1,2,3,4],x>2)\nmostre filtrar("eu","ela","ele","casa",palavra contém "a")');
  qr('mapear', 'Função', 'Mapeia cada elemento por expressão', 'mostre mapear([1,2,3],"x*2")\nmostre mapear("1,2,3","y*2")');
  qr('primo', 'Função', 'Verifica se é primo', 'mostre primo(11)\nmostre primo(4)');
  qr('par', 'Função', 'Verifica se é par', 'mostre par(8)\nmostre par(15)');
  qr('ímpar', 'Função', 'Verifica se é ímpar', 'mostre ímpar(3)\nmostre ímpar(108)');
  qr('impar', 'Função', 'Verifica se é ímpar (sem acento)', 'mostre impar(3)');
  qr('adicionarDias', 'Função', 'Adiciona dias a data dd/MM/yyyy', 'mostre adicionarDias("13/08/2026",10)');
  qr('diaSemana', 'Função', 'Dia da semana de data dd/MM/yyyy', 'mostre diaSemana("13/08/2026")');
  qr('verdadeiro', 'Valor', 'Valor booleano verdadeiro', 'aprovado = verdadeiro\nse aprovado:\n  mostre "passou"');
  qr('falso', 'Valor', 'Valor booleano falso', 'erro = falso\nse erro:\n  mostre "falhou"\nsenão:\n  mostre "tudo certo"');
  qr('salvar', 'Função', 'Salva variáveis, textos e números em um arquivo de texto', 'nome = "Ana"\nidade = 12\nsalvar("dados", "perfil.txt", nome, idade)');
  qr('carregar', 'Função', 'Lê um arquivo de texto e devolve os valores às variáveis', 'nome = ""\nidade = 0\ncarregar("dados", "perfil.txt", nome, idade)\nmostre nome + " tem " + idade + " anos"');
  qr('raizq', 'Função', 'Raiz quadrada de x', 'mostre raizq(169)');
  qr('raizc', 'Função', 'Raiz cúbica de x', 'mostre raizc(27)');
  qr('absoluto', 'Função', 'Valor absoluto (parte inteira) de x', 'a = absoluto(-2.666666)\nmostre a');
  qr('abs', 'Função', 'Valor absoluto (parte inteira) de x', 'b = abs(1.45555)\nmostre b');
  qr('fatorial', 'Função', 'Fatorial de um número inteiro não negativo (n! também funciona)', 'mostre fatorial(5)\nmostre 5!');
  qr('variáveis', 'Função', 'Mostra todas as variáveis definidas e seus valores', 'x = 5\nnome = "Ana"\nmostre variáveis()');
  qr('log', 'Função', 'Logaritmo de x na base informada', 'mostre log(8, 2)');
  qr('logn', 'Função', 'Logaritmo natural de x', 'mostre logn(10)');
  qr('ln', 'Função', 'Logaritmo natural de x (sinônimo de logn)', 'mostre ln(10)');
  qr('arredondar', 'Função', 'Arredonda x com um número de casas decimais', 'numero = 1.333333333\nmostre arredondar(numero, 2)');
  qr('arred', 'Função', 'Arredonda x com um número de casas decimais (sinônimo de arredondar)', 'numero = 1.333333333\nmostre arred(numero, 6)');
  qr('pi', 'Função', 'Valor de pi. Sem argumento: 2 casas. Com argumento: n casas decimais (até 100)', 'raio = 5\narea = pi() * raio * raio\nmostre area\nmostre pi(20)\nmostre pi(100)');
  qr('inteiro', 'Função', 'Parte inteira do número', 'mostre inteiro(9.99)');
  qr('decimal', 'Função', 'Parte decimal do número', 'mostre decimal(9.75)');
  qr('fração', 'Função', 'Converte decimal em fração', 'mostre fração(0.5)');
  qr('//', 'Operador', 'Divisão inteira — parte inteira do quociente', 'mostre 3 // 2\nmostre 10 // 3');
  qr('\\', 'Operador', 'Resto da divisão — a \\ b ou a mod b (ex.: 10 \\ 3 -> 1)', 'mostre 10 \\ 3\nmostre 10 mod 3\nmostre 7 \\ 2\nmostre [10,11,12] \\ 5');
  qr('mod', 'Operador', 'Resto da divisão — a mod b (alias de \\)', 'mostre 10 mod 3\nmostre 7 mod 2\nmostre 10 \\ 3');
  qr('%', 'Operador', 'Porcentagem — %(a, b) calcula a% de b (a × b ÷ 100)', 'mostre %(10, 4)\nmostre %(5, 100)\nmostre %(12, 50)');
  qr('intervalo', 'Função', 'Cria um intervalo numérico do início até o fim (inclusive), com passo opcional', 'para n em intervalo(1, 10, 2):\n  mostre n');
  qr('aleatório', 'Função', 'Número aleatório inteiro entre min e max', 'mostre aleatório(100, 200)');
  qr('mmc', 'Função', 'Mínimo múltiplo comum de dois ou mais números', 'mostre mmc(2, 4, 8)\nmostre mmc(3, 4)\nmostre mmc(6, 8, 10)');
  qr('mdc', 'Função', 'Máximo divisor comum de dois ou mais números', 'mostre mdc(12, 18)\nmostre mdc(100, 75)\nmostre mdc(17, 13)');
  qr('divisores', 'Função', 'Lista de todos os divisores de um número', 'mostre divisores(12)\nmostre divisores(17)\nmostre divisores(100)');
  qr('fatores', 'Função', 'Fatores primos de um número', 'mostre fatores(39)\nmostre fatores(42)\nmostre fatores(100)');
  qr('média', 'Função', 'Média aritmética de uma lista numérica', 'notas = [8, 7, 9, 6, 10]\nmostre média(notas)');
  qr('media', 'Função', 'Média aritmética (sem acento)', 'notas = [8, 7, 9, 6, 10]\nmostre media(notas)');
  qr('mediana', 'Função', 'Valor central de uma lista ordenada', 'dados = [3, 1, 4, 1, 5]\nmostre mediana(dados)');
  qr('moda', 'Função', 'Valor que mais aparece na lista', 'cores = ["azul", "azul", "verde"]\nmostre moda(cores)');
  qr('variância', 'Função', 'Variância estatística de uma lista', 'notas = [7, 8, 8, 9, 10]\nmostre variância(notas)');
  qr('variancia', 'Função', 'Variância estatística (sem acento)', 'notas = [7, 8, 8, 9, 10]\nmostre variancia(notas)');
  qr('desvioPadrao', 'Função', 'Desvio padrão de uma lista', 'notas = [7, 8, 8, 9, 10]\nmostre desvioPadrao(notas)');
  qr('desvioPadrão', 'Função', 'Desvio padrão (com acento)', 'notas = [7, 8, 8, 9, 10]\nmostre desvioPadrão(notas)');
  qr('produto', 'Função', 'Produto de todos os elementos da lista', 'fatores = [2, 3, 5]\nmostre produto(fatores)');
  qr('dado', 'Função', 'Sorteia um número inteiro de 1 a 6, como um dado de seis faces', 'mostre dado()\nrepita(3):\n  mostre dado()');
  qr('moeda', 'Função', 'Sorteia "cara" ou "coroa", como o lançamento de uma moeda', 'mostre moeda()\nrepita(3):\n  mostre moeda()');
  qr('cos', 'Função', 'Cosseno de x (em radianos)', 'mostre cos(3.14159265)');
  qr('sen', 'Função', 'Seno de x (em radianos)', 'mostre sen(1.57079633)');
  qr('tan', 'Função', 'Tangente de x (em radianos)', 'mostre tan(0.785398163)');
  qr('arcocos', 'Função', 'Arcocosseno de x (em radianos)', 'mostre arcocos(0.5)');
  qr('arcosen', 'Função', 'Arcosseno de x (em radianos)', 'mostre arcosen(0.5)');
  qr('arcotan', 'Função', 'Arcotangente de x (em radianos)', 'mostre arcotan(0)');
  qr('paraLista', 'Função', 'Retorna uma cópia da lista', 'a = [1,2,3]\nb = paraLista(a)\nmostre b\nc = paraLista("1,2,3")\nmostre c');
  qr('paraTexto', 'Função', 'Converte um valor em texto', 'mostre paraTexto(3.1415)');
  qr('maiúsculo', 'Função', 'Converte o texto para MAIÚSCULAS', 'mostre maiúsculo("batata")');
  qr('minúsculo', 'Função', 'Converte o texto para minúsculas', 'mostre minúsculo("ESCOLA")');
  qr('substitua', 'Função', 'Troca todas as ocorrências de um trecho por outro', 'mostre substitua("Olá, mundo!", "Olá", "Tchau")');
  qr('divida', 'Função', 'Divide um texto em lista de partes usando o separador; um número vira lista de algarismos', 'mostre divida("a,b,c", ",")\nmostre divida(12345, ",")');
  qr('junte', 'Função', 'Junta os elementos de uma lista em um único texto, com separador opcional', 'mostre junte([1,2,3,4,5])\nmostre junte(["a","b","c"], "-")');
  qr('contém', 'Função', 'Verifica se um texto ou lista contém o valor informado', 'mostre contém("escola", "esc")\nmostre contém("cidade", "cido")\nmostre contém([1,2,3], 2)');
  qr('posição', 'Função', 'Devolve a posição da primeira ocorrência do valor (a partir de 0), ou -1 se não encontrar', 'mostre posição("banana", "a")\nmostre posição(12345654, 5)\nmostre posição([10,20,30], 20)');
  qr('insira', 'Função', 'Insere um valor depois da posição informada', 'mostre insira("banana", 3, "olo")\nmostre insira(1234567, 4, 9)');
  qr('remova', 'Função', 'Remove o caractere ou elemento na posição informada (a partir de 0)', 'mostre remova(12345, 3)\nmostre remova("banana", 2)\nmostre remova([5,6,7,8,9], 4)');
  qr('posiçãoEm', 'Função', 'Devolve o caractere ou elemento que está na posição informada (a partir de 0)', 'mostre posiçãoEm("banana", 2)\nmostre posiçãoEm(12444, 3)\nmostre posiçãoEm([1,2,3,4,5,6,7], 4)');
  qr('paraNúmero', 'Função', 'Converte texto numérico em valor', 'mostre paraNúmero("3.14") + 1');
  qr('janela', 'Função', 'Abre uma janela gráfica', 'janela(400, 300, preto, "Meu desenho")');
  qr('ponto', 'Função', 'Desenha um ponto na janela', 'janela(400, 300)\nponto(200, 150, azul)');
  qr('linha', 'Função', 'Traça uma linha na janela', 'janela(400, 300)\nlinha(100, 100, 300, 200, verde)');
  qr('círculo', 'Função', 'Desenha um círculo na janela', 'janela(400, 300)\ncírculo(200, 150, 80, verde, branco)');
  qr('retângulo', 'Função', 'Desenha um retângulo na janela a partir do canto (x, y), com largura e altura em pixels', 'janela(400, 300)\nretângulo(50, 50, 300, 200, verde, branco)');
  qr('texto', 'Função', 'Escreve um texto na janela (cor e tamanho da fonte opcionais)', 'janela(400, 300)\ntexto(50, 50, "Olá, mundo!", branco, 28)');
  qr('ano', 'Função', 'Ano atual (yyyy)', 'mostre ano()');
  qr('mês', 'Função', 'Mês atual (mm)', 'mostre mês()');
  qr('dia', 'Função', 'Dia atual (dd)', 'mostre dia()');
  qr('hora', 'Função', 'Hora atual', 'mostre hora()');
  qr('data', 'Função', 'Data atual (dd/MM/yyyy)', 'mostre data()');
  qr('agora', 'Função', 'Hora, minutos e segundos atuais (HH:mm:ss)', 'mostre agora()');
  qr('selecionar', 'Função', 'Seleciona a parte de um texto, número ou lista entre os índices início e fim (inclusive)', 'planeta = "Saturno"\nmostre selecionar(planeta, 0, 3)\nmostre selecionar("4893847", 3, 5)\nmostre selecionar([1, 3, 5, 7, 9, 11], 2, 4)');
  qr('comprimento', 'Função', 'Quantidade de caracteres de um texto, algarismos de um número ou elementos de uma lista', 'mostre comprimento("Willog")\nmostre comprimento(1234567)\nmostre comprimento([2, 4, 6, 8])');
  qr('tempo', 'Função', 'Tempo decorrido em anos, meses e dias entre duas datas', 'mostre tempo("13/08/2026", "10/02/2027")');
  qr('bipe', 'Função', 'Emite um sinal sonoro por s segundos (pode ser fracionado)', 'bipe(1)\nbipe(0.5)\nbipe(0.25)');
  qr('pausa', 'Comando', 'Pausa a execução por s segundos (pode ser fracionado)', 'mostre "começou"\npausa(2)\nmostre "seguiu depois de 2 s"');
  qr('regressiva', 'Comando', 'Contagem regressiva sem parar o programa; executa o bloco indentado quando a contagem termina', 'mostre "o jogo começou!"\nregressiva(5):\n  mostre "tempo esgotado!"\nmostre "seguindo enquanto o tempo corre..."');
  qr('som', 'Função', 'Emite um som com frequência f (Hz, entre 37 e 32767) por s segundos', 'som(440, 0.5)\nsom(880, 0.25)');
  qr('toca', 'Função', 'Toca uma sequência de notas musicais, cada uma por s segundos', 'toca("C", "D", "E", "F", "G", "A", "B", 0.25)');
  qr('mensagem', 'Comando', 'Abre uma caixa de mensagem com título e texto', 'mensagem("Olá", "Bem-vindo ao Willog!")');
  qr('pegar', 'Comando', 'Copia a parte do desenho dentro do retângulo (x0, y0)-(x1, y1)', 'janela(500, 300)\nlinha(50, 50, 100, 100, vermelho)\npegar(30, 30, 200, 200)');
  qr('colocar', 'Comando', 'Coloca a parte copiada com pegar no retângulo (x0, y0)-(x1, y1)', 'janela(500, 300)\nlinha(50, 50, 100, 100, vermelho)\npegar(30, 30, 200, 200)\ncolocar(250, 50, 420, 220)');
  qr('limparJanela', 'Comando', 'Limpa a janela criada por janela(x,y)', 'janela(500,300)\nponto(10,10,vermelho)\nlimparJanela');
  qr('corFundo', 'Comando', 'Altera a cor de fundo da janela', 'janela(500,500)\ncorFundo(azul)');
  qr('ordenada', 'Propriedade', 'Retorna a lista em ordem crescente', 'notas = [7, 3, 9, 5]\nmostre notas.ordenada');
  qr('mínimo', 'Propriedade', 'Retorna o menor valor numérico da lista', 'lista = [-2, -1, 0, 1, 2]\nmostre lista.mínimo');
  qr('invertida', 'Propriedade', 'Retorna a lista ou o texto com a ordem dos itens invertida', 'mostre [1,2,3,4].invertida\nmostre "banana".invertida');
  qr('contar', 'Propriedade', 'Retorna a quantidade de itens de uma lista ou de caracteres de um texto', 'mostre "escola".contar\nmostre [1,2,3,4,5,6,7,8].contar');
  qr('tamanho', 'Propriedade', 'Alias de .contar: retorna a quantidade de itens', 'mostre [1,2,3,4,5].tamanho\nmostre "escola".tamanho');
  qr('primeiro', 'Propriedade', 'Retorna o primeiro elemento da lista ou primeiro caractere do texto', 'mostre [1,2,3].primeiro\nmostre "Willog".primeiro');
  qr('ultimo', 'Propriedade', 'Retorna o último elemento da lista ou último caractere do texto', 'mostre [1,2,3].ultimo\nmostre "Willog".ultimo');
  qr('último', 'Propriedade', 'Retorna o último elemento (com acento)', 'mostre [1,2,3].último');
  qr('fatiar', 'Propriedade', 'Retorna sublista/subtexto de início a fim (inclusive)', 'mostre [1,2,3,4,5].fatiar(1,3)\nmostre "Willog".fatiar(0,2)');
  qr('contarItem', 'Propriedade', 'Retorna quantas vezes o valor aparece na lista ou no texto', 'mostre "banana".contarItem("a")\nmostre [1,2,1,2,3].contarItem(2)');
  qr('existe ... em', 'Comando', 'Verifica se um valor existe em um texto ou lista (devolve verdadeiro ou falso)', 'se existe "ba" em "banana":\n  mostre "tem ba"\nmostre existe 2 em [1,2,3,4,5]');
  qr('máximo', 'Propriedade', 'Retorna o maior valor numérico da lista', 'lista = [-2, -1, 0, 1, 2]\nmostre lista.máximo');
  qr('adicionar', 'Propriedade', 'Adiciona valores ao final da lista (modifica a própria lista) ou concatena ao final do texto', 'lista = [1, 2, 3]\nlista.adicionar(4, 5)\nmostre lista\nmostre "banana".adicionar("s")\na="12345"\nmostre a.adicionar("6789")');
  qr('remover', 'Propriedade', 'Remove o elemento na posição informada (modifica a própria lista)', 'mostre [1,2,3,4,5].remover(2)\na = ["a","b","c","d","e"]\na.remover(4)\nmostre a');
  qr('aleatório', 'Propriedade', 'Sorteia um item aleatório da lista', 'lista = [1, 2, 3, 4, 5]\nmostre lista.aleatório');
  qr('embaralhar', 'Propriedade', 'Embaralha os itens da lista (modifica a própria lista)', 'lista = [1, 2, 3, 4, 5, 6]\nmostre lista.embaralhar');
  qr('soma', 'Propriedade', 'Soma os elementos numéricos ou concatena os textos da lista', 'nums = [1, 2, 3, 4]\nmostre nums.soma\nletras = ["a","b","c"]\nmostre letras.soma');
  qr('distintos', 'Propriedade', 'Retorna apenas os valores únicos (remove duplicatas, mantendo a primeira ocorrência)', 'mostre "banana".distintos\nmostre [1,2,2,3,4,5,5,5,6].distintos\nmostre ["a","b","c","a","d","c"].distintos');
  return list;
})();

var AC_ITEMS = [];
var AC_INDEX = -1;

function acIsOpen() { return acEl.classList.contains('open'); }

function currentWord() {
  var caret = editor.selectionStart || 0;
  var upto = editor.value.slice(0, caret);
  var m = upto.match(/[A-Za-z0-9_\u00C0-\u00FF \t]*$/);
  var raw = m ? m[0] : '';
  var word = raw.replace(/[ \t]+$/, '');
  return { start: caret - raw.length, word: word };
}

function inStringOrComment() {
  var caret = editor.selectionStart || 0;
  var upto = editor.value.slice(0, caret);
  var quote = null;
  for (var i = 0; i < upto.length; i++) {
    var ch = upto[i];
    if (quote) {
      if (ch === '\\' && i + 1 < upto.length) { i++; continue; }
      if (ch === quote) quote = null;
    } else {
      if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '#' && upto[i + 1] === ':') {
        i += 2;
        var closed = false;
        while (i < upto.length) {
          if (upto[i] === ':' && upto[i + 1] === '#') { i += 1; closed = true; break; }
          i++;
        }
        if (!closed) return true;
      } else if (ch === '#') {
        var nl = upto.indexOf('\n', i);
        if (nl === -1) return true;
        i = nl;
      }
    }
  }
  return quote !== null;
}

function collectVariables(code) {
  var vars = {};
  var lines = stripBlockComments(code).split('\n');
  for (var i = 0; i < lines.length; i++) {
    var parts = splitStatements(stripInlineComment(lines[i]));
    for (var j = 0; j < parts.length; j++) {
      var t = parts[j].trim();
      if (!t) continue;
      var m = t.match(/^([A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*)\s*(?:=|:=)/);
      if (m) { vars[m[1]] = true; continue; }
      var mm = parseMultiAssignLHS(t);
      if (mm) {
        for (var mn = 0; mn < mm.names.length; mn++) vars[mm.names[mn]] = true;
        continue;
      }
      var fm = t.match(/^para(?:\s+cada)?\s+([A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*)\s+em\b/);
      if (fm) { vars[fm[1]] = true; continue; }
      var dm = t.match(/^definir\s+fun[çc](?:ão|ao)\s+([A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*)\s*\(/);
      if (dm) { vars[dm[1]] = true; }
    }
  }
  return Object.keys(vars);
}

function acItemsFor(word, inProperty) {
  var wl = word.toLowerCase();
  if (inProperty) {
    var props = [];
    for (var i = 0; i < AC_PROPS.length; i++) {
      if (AC_PROPS[i].name.toLowerCase().indexOf(wl) === 0) props.push(AC_PROPS[i]);
    }
    return props;
  }
  var vars = collectVariables(editor.value);
  vars.sort(function(a,b){ return a.toLowerCase().localeCompare(b.toLowerCase()); });
  var varSet = {};
  for (var vs = 0; vs < vars.length; vs++) varSet[vars[vs].toLowerCase()] = true;
  var items = [];
  for (var v = 0; v < vars.length; v++) {
    if (vars[v].toLowerCase().indexOf(wl) === 0) items.push({ name: vars[v], insert: vars[v], paren: false, cat: 'Variável', desc: '' });
  }
  for (var j = 0; j < AC_ALL.length; j++) {
    if (AC_ALL[j].name.toLowerCase().indexOf(wl) === 0 && !varSet[AC_ALL[j].name.toLowerCase()]) items.push(AC_ALL[j]);
  }
  return items;
}

function measureTextWidth(text) {
  var canvas = measureTextWidth._canvas || (measureTextWidth._canvas = document.createElement('canvas'));
  var ctx = canvas.getContext('2d');
  ctx.font = editorFontSize + 'px Consolas, "Courier New", monospace';
  return ctx.measureText(text).width;
}

function acPosition() {
  if (!acIsOpen()) return;
  var caret = editor.selectionStart || 0;
  var upto = editor.value.slice(0, caret);
  var parts = upto.split('\n');
  var line = parts.length - 1;
  var colText = parts[parts.length - 1];
  var wrap = acEl.parentElement;
  var top = 8 + line * editorLineHeight - editor.scrollTop;
  var left = 12 + measureTextWidth(colText) - editor.scrollLeft;
  var estH = Math.min(acEl.scrollHeight || 220, 220);
  var flip = top + 24 + estH > wrap.clientHeight && top > wrap.clientHeight / 2;
  acEl.style.left = Math.max(0, Math.min(left, wrap.clientWidth - 250)) + 'px';
  if (flip) {
    acEl.style.top = 'auto';
    acEl.style.bottom = Math.max(0, wrap.clientHeight - top) + 'px';
  } else {
    acEl.style.top = (top + 22) + 'px';
    acEl.style.bottom = 'auto';
  }
}

function acRender() {
  var html = '';
  var lastCat = null;
  for (var i = 0; i < AC_ITEMS.length; i++) {
    var it = AC_ITEMS[i];
    if (it.cat !== lastCat) {
      html += '<div class="ac-cat">' + escapeHtml(it.cat) + '</div>';
      lastCat = it.cat;
    }
    var sel = i === AC_INDEX ? ' selected' : '';
    var desc = it.desc ? '<span class="ac-desc">' + escapeHtml(it.desc) + '</span>' : '';
    html += '<div class="ac-item' + sel + '" data-index="' + i + '"><span class="ac-name">' + escapeHtml(it.name) + '</span>' + desc + '</div>';
  }
  acEl.innerHTML = html;
}

function acSelect(index) {
  AC_INDEX = index;
  var items = acEl.querySelectorAll('.ac-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('selected', i === index);
  }
  var sel = items[index];
  if (sel && sel.scrollIntoView) sel.scrollIntoView({ block: 'nearest' });
}

function acMove(delta) {
  if (!acIsOpen() || AC_ITEMS.length === 0) return;
  var ni = AC_INDEX + delta;
  if (ni < 0) ni = AC_ITEMS.length - 1;
  if (ni >= AC_ITEMS.length) ni = 0;
  acSelect(ni);
}

function acUpdate(force) {
  if (inStringOrComment()) { acClose(); return; }
  var cw = currentWord();
  var before = editor.value.slice(0, cw.start);
  var inProperty = /\.\s*$/.test(before);
  if (!force && !inProperty && cw.word.length === 0) { acClose(); return; }
  var items = acItemsFor(cw.word, inProperty);
  if (items.length === 0) { acClose(); return; }
  AC_ITEMS = items;
  AC_INDEX = 0;
  acRender();
  acEl.classList.add('open');
  acPosition();
}

function acAccept() {
  if (!acIsOpen() || AC_ITEMS.length === 0 || AC_INDEX < 0) return;
  var item = AC_ITEMS[AC_INDEX];
  var cw = currentWord();
  var caret = editor.selectionStart || 0;
  var before = editor.value.slice(0, cw.start);
  var after = editor.value.slice(caret);
  editor.value = before + item.insert + after;
  var newCaret = cw.start + item.insert.length;
  if (item.paren) newCaret = cw.start + item.insert.length - 1;
  editor.setSelectionRange(newCaret, newCaret);
  syncAll();
  saveCode();
  editor.focus();
  acClose();
}

function acClose() {
  AC_ITEMS = [];
  AC_INDEX = -1;
  acEl.classList.remove('open');
  acEl.innerHTML = '';
}

acEl.addEventListener('mousedown', function (e) {
  var item = e.target.closest ? e.target.closest('.ac-item') : null;
  if (!item) return;
  e.preventDefault();
  AC_INDEX = Number(item.getAttribute('data-index'));
  acAccept();
});


// ============================================================
//  BARRA DE MENUS
// ============================================================
var menuTriggers = document.querySelectorAll('.menu-trigger');
var menuDropdowns = document.querySelectorAll('.menu-dropdown');
function closeAllMenus() {
  for (var i = 0; i < menuTriggers.length; i++) menuTriggers[i].classList.remove('open');
  for (var j = 0; j < menuDropdowns.length; j++) menuDropdowns[j].classList.remove('open');
}
function anyMenuOpen() {
  for (var i = 0; i < menuDropdowns.length; i++) {
    if (menuDropdowns[i].classList.contains('open')) return true;
  }
  return false;
}
function openMenu(trigger) {
  closeAllMenus();
  trigger.classList.add('open');
  var dd = document.getElementById(trigger.getAttribute('data-menu'));
  if (dd) dd.classList.add('open');
}
for (var mt = 0; mt < menuTriggers.length; mt++) {
  (function (tr) {
    tr.addEventListener('click', function (e) {
      e.stopPropagation();
      if (tr.classList.contains('open')) closeAllMenus();
      else openMenu(tr);
    });
    tr.addEventListener('mouseenter', function () {
      if (anyMenuOpen()) openMenu(tr);
    });
  })(menuTriggers[mt]);
}
document.addEventListener('click', closeAllMenus);
var menuChecks = document.querySelectorAll('.menu-dropdown .menu-item-check');
for (var mc = 0; mc < menuChecks.length; mc++) {
  menuChecks[mc].addEventListener('click', function (e) { e.stopPropagation(); });
}

// Eventos
btnRun.addEventListener('click', run);
document.getElementById('btnClearConsole').addEventListener('click', clearConsole);
document.getElementById('btnClear').addEventListener('click', function () {
  editor.value = '';
  syncAll();
  saveCode();
  editor.focus();
});
document.getElementById('btnSave').addEventListener('click', function () {
  var code = editor.value;
  if (!code.trim()) { alert('Nada para salvar.'); return; }
  if (typeof process !== 'undefined' && process.versions && process.versions.nw) {
    var saveInput = document.getElementById('nwSaveInput');
    if (!saveInput) {
      saveInput = document.createElement('input');
      saveInput.type = 'file';
      saveInput.id = 'nwSaveInput';
      saveInput.setAttribute('nwsaveas', 'programa.wil');
      saveInput.style.display = 'none';
      document.body.appendChild(saveInput);
      saveInput.addEventListener('change', function () {
        var path = saveInput.value;
        if (!path) return;
        try {
          var fs = require('fs');
          if (!/\.wil$/i.test(path)) path += '.wil';
          fs.writeFileSync(path, editor.value, 'utf8');
        } catch (err) {
          alert('Erro ao salvar: ' + err.message);
        }
        saveInput.value = '';
      });
    }
    saveInput.click();
    return;
  }
  var name = window.prompt('Nome do arquivo:', 'programa');
  if (name === null) return;
  name = name.trim();
  if (!name) name = 'programa';
  if (!/\.wil$/i.test(name)) name += '.wil';
  var blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
});
var fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.accept = '.wil,.txt';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);
fileInput.addEventListener('change', function () {
  var f = fileInput.files && fileInput.files[0];
  if (!f) return;
  var reader = new FileReader();
  reader.onload = function (e) {
    editor.value = String(e.target.result || '');
    syncAll();
    saveCode();
    editor.focus();
  };
  reader.readAsText(f, 'utf-8');
  fileInput.value = '';
});
document.getElementById('btnLoad').addEventListener('click', function () {
  fileInput.click();
});
var modalTabs = document.querySelectorAll('.modal-tab');
function activateManualTab(panelId) {
  for (var i = 0; i < modalTabs.length; i++) {
    modalTabs[i].classList.toggle('active', modalTabs[i].getAttribute('data-panel') === panelId);
  }
  var panels = document.querySelectorAll('.manual-panel');
  for (var j = 0; j < panels.length; j++) {
    panels[j].classList.toggle('active', panels[j].id === panelId);
  }
  try { localStorage.setItem('willprogManualTab', panelId); } catch (e) {}
}
for (var mi = 0; mi < modalTabs.length; mi++) {
  (function (tab) {
    tab.addEventListener('click', function () {
      activateManualTab(tab.getAttribute('data-panel'));
    });
  })(modalTabs[mi]);
}
document.querySelector('.modal-body').addEventListener('click', function (e) {
  var j = e.target.closest ? e.target.closest('.tab-jump') : null;
  if (j) activateManualTab(j.getAttribute('data-tab'));
});
document.getElementById('btnManual').addEventListener('click', function () {
  var saved = null;
  try { saved = localStorage.getItem('willprogManualTab'); } catch (e) {}
  if (saved && document.getElementById(saved)) activateManualTab(saved);
  wmOpen('modalOverlay');
});
var quickRefOverlay = document.getElementById('quickRefOverlay');
var quickRefList = document.getElementById('quickRefList');
var quickRefEmpty = document.getElementById('quickRefEmpty');
var quickRefSearch = document.getElementById('quickRefSearch');
function renderQuickRef(filter) {
  var q = (filter || '').toLowerCase();
  var items = QUICK_REF.filter(function (r) {
    return !q || r.name.toLowerCase().indexOf(q) >= 0 || r.desc.toLowerCase().indexOf(q) >= 0;
  });
  items.sort(function (a, b) { return a.name.localeCompare(b.name, 'pt-BR'); });
  quickRefList.innerHTML = '';
  for (var i = 0; i < items.length; i++) {
    (function (r) {
      var link = document.createElement('a');
      link.className = 'quickref-item';
      link.href = '#';
      link.setAttribute('role', 'button');
      link.setAttribute('aria-expanded', 'false');
      link.innerHTML = '<span class="q-name">' + escapeHtml(r.name) + '</span>' +
        '<span class="q-tag">' + escapeHtml(r.tag) + '</span>' +
        '<span class="q-desc">' + escapeHtml(r.desc) + '</span>' +
        '<span class="q-chev">&#9656;</span>';
      var ex = document.createElement('div');
      ex.className = 'quickref-example';
      var pre = document.createElement('pre');
      pre.textContent = r.example;
      ex.appendChild(pre);
      var actions = document.createElement('div');
      actions.className = 'qr-actions';
      var btn = document.createElement('button');
      btn.textContent = 'Inserir no editor';
      btn.addEventListener('click', function (ev) {
        ev.stopPropagation();
        insertAtCursor(r.example);
        wmClose('quickRefOverlay');
      });
      actions.appendChild(btn);
      ex.appendChild(actions);
      link.addEventListener('click', function (ev) {
        ev.preventDefault();
        var open = link.classList.toggle('open');
        link.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
      quickRefList.appendChild(link);
      quickRefList.appendChild(ex);
    })(items[i]);
  }
  quickRefEmpty.style.display = items.length ? 'none' : 'block';
}
document.getElementById('btnQuickRef').addEventListener('click', function () {
  renderQuickRef(quickRefSearch.value);
  wmOpen('quickRefOverlay');
  quickRefSearch.focus();
});
document.getElementById('quickRefClose').addEventListener('click', function () {
  wmClose('quickRefOverlay');
});
quickRefOverlay.addEventListener('click', function (e) {
  if (e.target === quickRefOverlay) wmClose('quickRefOverlay');
});
var quickRefModal = document.querySelector('#quickRefOverlay .modal');
var quickRefMaxIcon = document.getElementById('quickRefMaxIcon');
document.getElementById('quickRefMinimize').addEventListener('click', function () {
  wmMinimize('quickRefOverlay');
});
document.getElementById('quickRefMaximize').addEventListener('click', function () { toggleModalMaximize(quickRefModal, 'qr-maximized', quickRefMaxIcon); });
quickRefSearch.addEventListener('input', function () {
  renderQuickRef(this.value);
});
var sobreOverlay = document.getElementById('sobreOverlay');
document.getElementById('btnSobre').addEventListener('click', function () {
  sobreOverlay.classList.add('open');
});
document.getElementById('sobreClose').addEventListener('click', function () {
  sobreOverlay.classList.remove('open');
});
sobreOverlay.addEventListener('click', function (e) {
  if (e.target === sobreOverlay) sobreOverlay.classList.remove('open');
});

function splitCommentPart(rawLine) {
  var quote = null;
  for (var i = 0; i < rawLine.length; i++) {
    var ch = rawLine[i];
    if (quote) {
      if (ch === '\\' && i + 1 < rawLine.length) i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#' && rawLine[i + 1] === ':') {
      return { code: rawLine.slice(0, i), comment: rawLine.slice(i), block: true };
    } else if (ch === '#') {
      return { code: rawLine.slice(0, i), comment: rawLine.slice(i), block: false };
    }
  }
  return { code: rawLine, comment: null, block: false };
}

function markBlockCommentLines(code) {
  var lines = code.split('\n');
  var flags = new Array(lines.length);
  var inBlock = false;
  var quote = null;
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li];
    var lineIn = inBlock;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i];
      if (quote) {
        if (ch === '\\' && i + 1 < line.length) { i++; continue; }
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") { quote = ch; continue; }
      if (!inBlock && ch === '#' && line[i + 1] === ':') {
        inBlock = true;
        lineIn = true;
        i++;
        continue;
      }
      if (inBlock && ch === ':' && line[i + 1] === '#') {
        inBlock = false;
        lineIn = true;
        i++;
        continue;
      }
      if (!inBlock && ch === '#') break;
    }
    flags[li] = lineIn;
  }
  return flags;
}

function stripQuotes(s) {
  var t = s.trim();
  if (t.length >= 2 && (t.charAt(0) === '"' || t.charAt(0) === "'") && t.charAt(t.length - 1) === t.charAt(0)) {
    return t.slice(1, -1);
  }
  return s;
}

function comentarComando(text) {
  var t = text.trim();
  if (!t) return null;
  if (isSenao(t)) {
    return 'Esse é o "senão": ele só roda quando o "se" de cima não deu certo. Tipo um "se não..." nas regras de um jogo.';
  }
  if (isSe(t)) {
    var cond = extractSeCond(t);
    return 'Esse "se" checa se "' + cond + '" é verdadeiro. Se for, o computador faz o que está indentado ali embaixo. Se não for, ele pula.';
  }
  if (isDefinirFuncao(t)) {
    var m = t.match(/^definir\s+fun[çc](?:ão|ao)\s+([A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*)\s*\(([^)]*)\)\s*:?\s*$/);
    if (m) {
      var params = [];
      var rawParams = m[2].split(',');
      for (var i = 0; i < rawParams.length; i++) {
        var p = rawParams[i].trim();
        if (p) params.push(p);
      }
      return 'Isso cria uma receita chamada "' + m[1] + '"' + (params.length ? ' com os ingredientes ' + params.join(', ') : '') + '. O bloco indentado é o que a receita faz — só roda quando alguém chama essa receita no código.';
    }
  }
  if (isParaCada(t)) {
    var pc = extractParaCada(t);
    return 'Esse "para cada" passa por cada item de "' + pc.expr + '". A cada volta, o item atual fica guardado na variável "' + pc.varName + '" e o bloco de dentro é executado.';
  }
  if (isRepita(t)) {
    var cnt = extractRepita(t);
    return 'Esse "repita" faz o bloco de dentro rodar "' + cnt + '" vez(es). Tipo bater palmas X vezes.';
  }
  if (isEnquanto(t)) {
    var wc = extractEnquanto(t);
    return 'Esse "enquanto" fica repetindo o bloco de dentro enquanto "' + wc + '" for verdadeiro. Tipo "enquanto tiver fome, come". Se o computador checar e não for verdadeiro, ele pula.';
  }
  if (/^pare\s*$/.test(t)) {
    return 'O "pare" faz tudo parar e sai do laço na hora. Tipo desistir de um round e ir pro próximo.';
  }
  if (/^continue\s*$/.test(t)) {
    return 'O "continue" pula essa volta e vai direto pra próxima repetição do laço. Tipo apertar "próximo" num slide.';
  }
  if (isVaPara(t)) {
    return 'O "vá para" teleporta a execução pro lugar marcado com o rótulo "' + t.replace(/^v[áa]\s+para\s+/, '') + '".';
  }
  if (isRotulo(t)) {
    return 'O rótulo "' + extractRotulo(t) + '" é só uma marca no código pra onde o "vá para" pode ir. Sozinho, ele não faz nada.';
  }
  if (isSelecionarOpcao(t)) {
    return 'O "selecionar opção" abre um menu de escolhas na tela. O programa para e espera você apertar uma tecla pra escolher uma opção.';
  }
  if (isEmJanela(t)) {
    if (isEmJanelaCentered(t)) {
      return 'O "emJanela(centralizar)" mostra o resultado numa janela bonita no centro da tela, em vez do console. A janela abre cheia e você pode minimizar ou restaurar com os botões.';
    }
    return 'O "emJanela" mostra o resultado numa janela grande em vez do console. A janela abre cheia e você pode minimizar ou restaurar com os botões.';
  }
  if (/^aguarde\s*tecla\s*\(/i.test(t)) {
    return 'O "aguardeTecla" faz o programa esperar você apertar uma tecla. Tipo um "Pressione qualquer tecla pra continuar". Se colocar uma letra entre aspas (tipo "Z"), só essa tecla funciona.';
  }
  if (/^capture\s*tecla\s*\(/i.test(t)) {
    return 'A "captureTecla" descobre qual tecla você apertou por último e devolve o nome dela. Tipo ler o que você digitou.';
  }
  if (/^variá?veis\s*\(/i.test(t)) {
    return 'A "variáveis" mostra todas as variáveis que existem no momento e o que elas guardam. Tipo um inventário de um jogo.';
  }
  var selOptM = t.match(/^<([A-Za-z0-9])>\s*(?:"([^"]*)"|'([^']*)')\s*:\s*$/);
  if (selOptM) {
    return 'Essa é uma opção do "selecionar opção": quando você apertar "' + selOptM[1].toUpperCase() + '" no teclado, o bloco de dentro roda. A opção se chama "' + (selOptM[2] !== undefined ? selOptM[2] : selOptM[3]) + '".';
  }
  var m2;
  var pam = parseMultiAssignLHS(t);
  if (pam) {
    return 'Essa é uma atribuição múltipla: pega vários valores de uma vez e guarda cada um numa variável diferente (' + pam.names.join(', ') + ').';
  }
  if ((m2 = t.match(LEIA_ASSIGN_RE))) {
    var msg = stripQuotes(m2[2]);
    return 'O "leia" pede algo pra você digitar' + (msg ? ' — a mensagem que aparece é "' + msg + '"' : '') + '. O que você digitar fica guardado na variável "' + m2[1] + '".';
  }
  if ((m2 = t.match(LAZY_ASSIGN_RE))) {
    return 'Essa variável "' + m2[1] + '" é preguiçosa: o computador só calcula "' + m2[2].trim() + '" na hora que precisar dela, não agora.';
  }
  if ((m2 = t.match(COMPOUND_ASSIGN_RE))) {
    var opDesc = { '**=': 'eleva', '+=': 'soma', '-=': 'subtrai', '*=': 'multiplica', '/=': 'divide' }[m2[2]] || m2[2];
    return 'Essa linha atualiza a variável "' + m2[1] + '": ' + opDesc + ' com "' + m2[3].trim() + '" e guarda o novo valor de volta nela.';
  }
  if ((m2 = t.match(ASSIGN_RE))) {
    return 'Essa linha guarda o resultado de "' + m2[2].trim() + '" dentro da variável "' + m2[1] + '". Tipo colocar algo numa caixa com o nome dela.';
  }
  if (/^mostre\b/.test(t)) {
    var rest = stripQuotes(t.replace(/^mostre\b/, '').trim());
    return 'O "mostre" imprime "' + rest + '" na tela (no console).';
  }
  if (/^bipe\s*\(/.test(t)) {
    var bm = t.match(/^bipe\s*\((.+)\)\s*$/);
    return 'O "bipe" faz um biiip! dura' + (bm && bm[1] ? ' "' + bm[1].trim() + '"' : '') + ' segundo(s). Dá pra usar valores quebrados, tipo bipe(0.5) = meio segundo.';
  }
  if (/^som\s*\(/.test(t)) {
    var sm = t.match(/^som\s*\((.+)\)\s*$/);
    return 'O "som" toca um som com a frequência "' + (sm && sm[1] ? sm[1].trim() : 'f, s') + '". O primeiro número é o tom (37 a 32767) e o segundo é a duração em segundos.';
  }
  if (/^toca\s*\(/.test(t)) {
    var tm2 = t.match(/^toca\s*\((.+)\)\s*$/);
    return 'O "toca" toca as notas musicais que você colocar (C, D, E, F, G, A, B — com # pra sustenido e b pra bemol). O último número é a duração de cada nota em segundos.';
  }
  if (/^mensagem\s*\(/.test(t)) {
    var msm = t.match(/^mensagem\s*\((.+)\)\s*$/);
    return 'A "mensagem" abre uma caixinha de diálogo na tela com um título e uma mensagem. Tipo um alerta de um jogo.';
  }
  if (/^salvar\s*\(/.test(t)) {
    return 'O "salvar" grava o progresso das variáveis num arquivo de texto. Tipo salvar sua fase num jogo.';
  }
  if (/^carregar\s*\(/.test(t)) {
    return 'O "carregar" traz o progresso de volta de um arquivo salvo com "salvar". Tipo carregar uma fase salva.';
  }
  if (/^comprimento\s*\(/.test(t)) {
    var cpl = t.match(/^comprimento\s*\((.+)\)\s*$/);
    return 'A "comprimento" conta quantos caracteres tem em "' + (cpl && cpl[1] ? cpl[1].trim() : 'x') + '". Tipo medir o tamanho de um texto ou contar elementos numa lista.';
  }
  if (/^maiúsculo\s*\(/.test(t)) {
    var mauM = t.match(/^maiúsculo\s*\((.+)\)\s*$/);
    return 'A "maiúsculo" converte o texto "' + (mauM && mauM[1] ? mauM[1].trim() : 'x') + '" tudo pra MAIÚSCULAS.';
  }
  if (/^minúsculo\s*\(/.test(t)) {
    var minM = t.match(/^minúsculo\s*\((.+)\)\s*$/);
    return 'A "minúsculo" converte o texto "' + (minM && minM[1] ? minM[1].trim() : 'x') + '" tudo pra minúsculas.';
  }
  if (/^substitua\s*\(/.test(t)) {
    var subM = t.match(/^substitua\s*\((.+)\)\s*$/);
    return 'A "substitua" troca todas as vezes que aparece algo por outra coisa. Tipo "trocar todas as bolinhas por estrelinhas" num texto.';
  }
  if (/^divida\s*\(/.test(t)) {
    var dvM = t.match(/^divida\s*\((.+)\)\s*$/);
    return 'A "divida" corta o texto em pedaços usando um separador. Tipo fatiar uma pizza em pedaços — cada pedaço vai pra uma posição numa lista.';
  }
  if (/^junte\s*\(/.test(t)) {
    var jtM = t.match(/^junte\s*\((.+)\)\s*$/);
    return 'A "junte" junta tudo que está numa lista num texto só. É o contrário da "divida". Se você colocar um separador, ele aparece entre cada pedaço.';
  }
  if (/^contém\s*\(/.test(t)) {
    var ctM = t.match(/^contém\s*\((.+)\)\s*$/);
    return 'A "contém" verifica se algo existe dentro de um texto ou lista. Se tiver, devolve verdadeiro. Se não tiver, devolve falso. Tipo checar se seu nome está numa lista.';
  }
  if (/^posição\s*\(/.test(t)) {
    var psM = t.match(/^posição\s*\((.+)\)\s*$/);
    return 'A "posição" diz onde algo está dentro de um texto ou lista (começando do zero). Se não achar, devolve -1.';
  }
  if (/^insira\s*\(/.test(t)) {
    var inM = t.match(/^insira\s*\((.+)\)\s*$/);
    return 'A "insira" coloca algo numa posição específica de um texto ou lista. Tipo enfiar uma carta no meio de um baralho.';
  }
  if (/^regressiva\s*\(/.test(t)) {
    return 'A "regressiva" faz uma contagem regressiva sem parar o programa. Quando terminar, o bloco de depois roda. Tipo uma bomba-relógio num jogo!';
  }
  if (/^moeda\s*\(/.test(t)) {
    return 'A "moeda" joga uma moeda no ar e devolve "cara" ou "coroa" — completamente aleatório!';
  }
  if (/^dado\s*\(/.test(t)) {
    return 'O "dado" joga um dado de seis faces e devolve um número de 1 a 6. Tipo jogar num tabuleiro.';
  }
  if (/^existe\b/.test(t)) {
    return 'O "existe ... em" checa se o primeiro valor está dentro do segundo (texto ou lista). Se tiver, devolve verdadeiro. Tipo procurar um objeto numa mochila.';
  }
  if (/^remova\s*\(/.test(t)) {
    var rmM = t.match(/^remova\s*\((.+)\)\s*$/);
    return 'A "remova" tira o caractere ou elemento que está numa posição de um texto ou lista. Tipo arrancar uma página de um livro.';
  }
  if (/^posiçãoEm\s*\(/.test(t)) {
    var peM = t.match(/^posiçãoEm\s*\((.+)\)\s*$/);
    return 'A "posiçãoEm" pega o que está numa posição específica de um texto ou lista. Tipo abrir um armário e pegar o que está na prateleira X.';
  }
  if (/^(absoluto|abs)\s*\(/.test(t)) {
    var am = t.match(/^(?:absoluto|abs)\s*\((.+)\)\s*$/);
    return 'A "' + (t.trim().startsWith('absoluto') ? 'absoluto' : 'abs') + '" tira o sinal negativo de um número. Tipo a distância — sempre positiva.';
  }
  if (/^selecionar\s*\(/.test(t)) {
    var sel = t.match(/^selecionar\s*\((.+)\)\s*$/);
    return 'A "selecionar" pega um pedaço de "' + (sel && sel[1] ? sel[1].trim() : 'valor, início, fim') + '" entre duas posições. Tipo recortar um trecho de um texto ou pegar um pedaço de uma lista.';
  }
  if (/^limpe\b/.test(t)) {
    return 'O "limpe" apaga tudo que está escrito no console. Tipo limpar a tela com um apagador.';
  }
  if (/^pausa\s*\(/.test(t)) {
    var pm2 = t.match(/^pausa\s*\((.+)\)\s*$/);
    return 'A "pausa" faz o programa esperar "' + (pm2 && pm2[1] ? pm2[1].trim() : 's') + '" segundo(s) antes de continuar. Tipo uma pausa num vídeo.';
  }
  if (/^(retorne|retornar)\b/.test(t)) {
    var rr = t.replace(/^(retorne|retornar)\b/, '').trim();
    return rr ? 'O "retorne" sai da receita (função) e devolve "' + rr + '" pra quem chamou. Tipo entregar o resultado pronto.' : 'O "retorne" sai da receita (função) sem devolver nada.';
  }
  if (/\.distintos\s*$/.test(t)) {
    return 'A propriedade ".distintos" pega o texto ou lista e devolve só os valores únicos, tirando as repetições. Tipo filtrar o que é diferente.';
  }
  return 'Essa linha executa "' + t + '".';
}

function gerarComentarioLinha(rawLine, inBlockComment) {
  var trimmed = rawLine.trim();
  var isBlank = trimmed === '';
  var cmt = splitCommentPart(rawLine);
  var comments = [];
  var stmts = 0;
  var isBlock = false;

  if (inBlockComment) {
    if (/#:/.test(rawLine) && /:#/.test(rawLine)) {
      comments.push('Aqui tem um comentário de bloco "#: ... :#": o computador ignora tudo que está entre esses dois marcadores.');
    } else if (/#:/.test(rawLine)) {
      comments.push('Aqui começa um comentário de bloco "#:": daqui pra frente, o computador ignora tudo até achar um ":#".');
    } else if (/:#/.test(rawLine)) {
      comments.push('Aqui termina o comentário de bloco ":#": o computador volta a ler o código normalmente.');
    } else {
      comments.push('Essa linha está dentro de um comentário de bloco "#: ... :#". O computador pula ela.');
    }
  } else if (cmt.comment && cmt.code.trim() === '') {
    comments.push('Essa linha é só uma anotação sua ("' + cmt.comment.trim() + '"). O computador ignora isso.');
  } else {
    var parts = splitStatements(cmt.code);
    for (var i = 0; i < parts.length; i++) {
      var t = parts[i].trim();
      if (!t) continue;
      stmts++;
      var c = comentarComando(t);
      if (c) {
        if (/^Esse (?:é o|"[a-z]+" )|Isso cria/.test(c)) isBlock = true;
        comments.push(c);
      }
    }
    if (cmt.comment) {
      if (cmt.block) {
        comments.push('Tem um comentário de bloco "#: ... :#" nessa linha. O computador ignora o que está entre os marcadores.');
      } else {
        comments.push('No final da linha tem uma anotação ("' + cmt.comment.trim() + '") que o computador ignora.');
      }
    }
  }

  if (comments.length === 0) {
    comments.push('Linha vazia — o computador pula isso.');
  }

  return { code: rawLine, isBlank: isBlank, comments: comments, stmts: stmts, isBlock: isBlock, commentCount: (cmt.comment || inBlockComment) ? 1 : 0 };
}

var btnTheme = document.getElementById('btnTheme');
var btnPalette = document.getElementById('btnPalette');
var paletteOverlay = document.getElementById('paletteOverlay');

var paletteDarkGrid = document.getElementById('palette-dark');
var paletteLightGrid = document.getElementById('palette-light');


// ============================================================
//  APLICAÇÃO DE PALETA
// ============================================================
function applyPaletteVars(palette, light) {
  var r = document.documentElement;
  r.style.setProperty('--bg', palette.bg);
  r.style.setProperty('--bg2', palette.bg2);
  r.style.setProperty('--bg3', palette.bg3);
  r.style.setProperty('--fg', palette.fg);
  r.style.setProperty('--fg2', palette.fg2);
  r.style.setProperty('--border', palette.border);
  r.style.setProperty('--hover', palette.hover);
  r.style.setProperty('--accent', palette.accent);
  r.style.setProperty('--accent-hover', palette.accentHover);
  r.style.setProperty('--accent-fg', palette.accentFg);
  r.style.setProperty('--hl-keyword', palette.hlKeyword);
  r.style.setProperty('--hl-func', palette.hlFunc);
  r.style.setProperty('--hl-str', palette.hlStr);
  r.style.setProperty('--hl-num', palette.hlNum);
  r.style.setProperty('--hl-comment', palette.hlComment);
  r.style.setProperty('--hl-id', palette.hlId);
  r.style.setProperty('--statusbar-bg', palette.statusBarBg);
  r.style.setProperty('--err', palette.err);
  r.style.setProperty('--info', palette.info);
  r.style.setProperty('--ok', palette.ok);
  document.body.style.background = palette.bg;
  document.body.style.color = palette.fg;
  var codePre = document.querySelector('.code-wrap pre');
  if (codePre) codePre.style.color = palette.fg;
}

function clearPaletteVars() {
  var r = document.documentElement;
  var vars = ['--bg','--bg2','--bg3','--fg','--fg2','--border','--hover','--accent','--accent-hover','--accent-fg','--hl-keyword','--hl-func','--hl-str','--hl-num','--hl-comment','--hl-id','--statusbar-bg','--err','--info','--ok'];
  for (var i = 0; i < vars.length; i++) r.style.removeProperty(vars[i]);
  document.body.style.background = '';
  document.body.style.color = '';
}

var currentPalette = null;
var currentMode = 'dark';

function setPalette(name, mode) {
  var palettes = mode === 'dark' ? darkPalettes : lightPalettes;
  if (!palettes[name]) return;
  currentPalette = name;
  currentMode = mode;
  var isLight = mode === 'light';
  document.body.classList.toggle('light', isLight);
  applyPaletteVars(palettes[name], isLight);
  btnTheme.textContent = isLight ? 'Modo Escuro' : 'Modo Claro';
  try {
    localStorage.setItem('willprogPalette', name);
    localStorage.setItem('willprogTheme', mode);
  } catch (e) {}
  updatePaletteSelection();
}

function applyTheme(light) {
  var mode = light ? 'light' : 'dark';
  var savedPalette = null;
  try { savedPalette = localStorage.getItem('willprogPalette'); } catch (e) {}
  var palettes = mode === 'dark' ? darkPalettes : lightPalettes;
  if (savedPalette && palettes[savedPalette]) {
    setPalette(savedPalette, mode);
  } else {
    var defaultName = mode === 'dark' ? 'VS Code Dark' : 'VS Code Light';
    setPalette(defaultName, mode);
  }
}

// ============================================================
//  MODAL DE PALETAS
// ============================================================
function buildPaletteGrid(gridId, palettes, mode) {
  var grid = document.getElementById(gridId);
  grid.innerHTML = '';
  var names = Object.keys(palettes);
  names.sort();
  for (var i = 0; i < names.length; i++) {
    var p = palettes[names[i]];
    var item = document.createElement('div');
    item.className = 'palette-item';
    item.dataset.name = names[i];
    item.dataset.mode = mode;
    var preview = document.createElement('div');
    preview.className = 'pi-preview';
    var previewColors = [p.bg, p.accent, p.hlKeyword, p.hlFunc, p.hlStr, p.hlComment];
    for (var j = 0; j < previewColors.length; j++) {
      var s = document.createElement('span');
      s.style.background = previewColors[j];
      preview.appendChild(s);
    }
    var label = document.createElement('div');
    label.className = 'pi-name';
    label.textContent = names[i];
    item.appendChild(preview);
    item.appendChild(label);
    item.addEventListener('click', function () {
      var n = this.dataset.name;
      var m = this.dataset.mode;
      setPalette(n, m);
    });
    grid.appendChild(item);
  }
}

function updatePaletteSelection() {
  var items = document.querySelectorAll('.palette-item');
  for (var i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', items[i].dataset.name === currentPalette && items[i].dataset.mode === currentMode);
  }
  var tabs = document.querySelectorAll('.palette-tab');
  for (var t = 0; t < tabs.length; t++) {
    var tabMode = tabs[t].dataset.tab === 'palette-dark' ? 'dark' : 'light';
    tabs[t].classList.toggle('active', tabMode === currentMode);
  }
  var darkPanel = document.getElementById('palette-dark');
  var lightPanel = document.getElementById('palette-light');
  if (darkPanel && lightPanel) {
    darkPanel.style.display = currentMode === 'dark' ? '' : 'none';
    lightPanel.style.display = currentMode === 'light' ? '' : 'none';
  }
}

buildPaletteGrid('palette-dark', darkPalettes, 'dark');
buildPaletteGrid('palette-light', lightPalettes, 'light');

// Palette tabs
var paletteTabs = document.querySelectorAll('.palette-tab');
for (var pt = 0; pt < paletteTabs.length; pt++) {
  paletteTabs[pt].addEventListener('click', function () {
    var mode = this.dataset.tab === 'palette-dark' ? 'dark' : 'light';
    var savedMode = currentMode;
    try { savedMode = localStorage.getItem('willprogTheme') || currentMode; } catch (e) {}
    currentMode = mode;
    updatePaletteSelection();
  });
}

// Theme toggle button (keeps old btnTheme for quick toggle)
btnTheme.addEventListener('click', function () {
  var light = !document.body.classList.contains('light');
  applyTheme(light);
});

// Palette button opens modal
btnPalette.addEventListener('click', function () {
  paletteOverlay.classList.add('open');
  closeAllMenus();
  updatePaletteSelection();
});

// Palette modal controls
document.getElementById('paletteClose').addEventListener('click', function () {
  paletteOverlay.classList.remove('open');
});
paletteOverlay.addEventListener('click', function (e) {
  if (e.target === paletteOverlay) paletteOverlay.classList.remove('open');
});
document.getElementById('paletteMinimize').addEventListener('click', function () {
  wmMinimize('paletteOverlay');
});

// ============================================================
//  RESTAURA PALETA SALVA
// ============================================================
var savedTheme = null;
var savedPaletteName = null;
try { savedTheme = localStorage.getItem('willprogTheme'); } catch (e) {}
try { savedPaletteName = localStorage.getItem('willprogPalette'); } catch (e) {}

var isLight = savedTheme === 'light';
var mode = isLight ? 'light' : 'dark';
var palettes = mode === 'dark' ? darkPalettes : lightPalettes;
if (savedPaletteName && palettes[savedPaletteName]) {

  setPalette(savedPaletteName, mode);
} else {
  var defaultName = mode === 'dark' ? 'VS Code Dark' : 'VS Code Light';
  setPalette(defaultName, mode);
}

// ============================================================
//  PLAIN LANGUAGE MODULE ("Em Palavras")
// ============================================================
var PlainLang = (function () {

  function generate(code) {
    var lines = code.split('\n');
    if (!lines.length || !code.trim()) return null;
    var blockFlags = markBlockCommentLines(code);
    var items = [];

    for (var i = 0; i < lines.length; i++) {
      var raw = lines[i];
      var trimmed = raw.trim();
      if (!trimmed) continue;
      if (blockFlags[i] && !/#:/.test(trimmed) && !/:#/.test(trimmed)) continue;
      var info = gerarComentarioLinha(raw, blockFlags[i]);
      if (!info.comments || !info.comments.length) continue;
      if (info.isBlank) continue;
      var depth = getDepth(raw);
      for (var j = 0; j < info.comments.length; j++) {
        var c = info.comments[j];
        if (!c) continue;
        c = cleanComment(c);
        if (!c) continue;
        items.push({ text: c, lineNo: i + 1, raw: trimmed, depth: depth, isBlock: info.isBlock });
      }
    }
    return items;
  }

  function getDepth(raw) {
    var m = raw.match(/^(\s*)/);
    var len = m ? m[1].replace(/\t/g, '    ').length : 0;
    return Math.floor(len / 2);
  }

  function cleanComment(c) {
    c = c.replace(/^Essa linha (?:está dentro de|é só)/, 'Está dentro de');
    c = c.replace(/Linha vazia — o computador pula isso\./, '');
    return c.trim();
  }

  function toHtml(items) {
    if (!items || !items.length) return '<div class="plainlang-empty">N\u00e3o h\u00e1 c\u00f3digo para descrever.</div>';
    var html = '<p class="plainlang-para">Este programa faz o seguinte:</p>';
    var prevDepth = 0;
    var openBlock = 0;
    for (var i = 0; i < items.length; i++) {
      var s = items[i];
      if (s.depth > prevDepth) {
        html += '<div class="plainlang-block">';
        openBlock++;
      }
      if (i > 0 && s.depth === prevDepth) html += ' ';
      html += lnBadge(s.lineNo, s.raw) + highlightTerms(escHtml(s.text));
      var next = items[i + 1];
      if (!next || next.depth < s.depth) {
        while (openBlock > 0 && (!next || next.depth < s.depth)) {
          html += '</div>';
          openBlock--;
        }
        if (next && next.depth <= s.depth) html += '</p><p class="plainlang-para">';
      }
      prevDepth = s.depth;
    }
    while (openBlock > 0) { html += '</div>'; openBlock--; }
    html += '</p>';
    return html;
  }

  function lnBadge(lineNo, raw) {
    var tip = escHtml(raw);
    return '<span class="plainlang-ln" data-line="' + lineNo + '">' + lineNo + '<span class="plainlang-tip">' + tip + '</span></span>';
  }

  function highlightTerms(t) {
    t = t.replace(/"([^"]+)"/g, '"<span class="plainlang-str">$1</span>"');
    t = t.replace(/\b(se|senão|repita|enquanto|para cada|definir função|mostre|leia|limpe|retorne|retornar|pare|continue|pausa|bipe|som|toca|mensagem|aguarde|captureTecla|capture)\b/g, '<span class="plainlang-kw">$1</span>');
    return t;
  }

  function escHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  return { generate: generate, toHtml: toHtml };
})();

// ============================================================
//  PLAIN LANGUAGE CONTROLS
// ============================================================
var plOverlay = document.getElementById('plainLangOverlay');
var plBody = document.getElementById('plainLangBody');

function plOpen() {
  closeAllMenus();
  plOverlay.classList.add('open');
  plRender();
}

function plRender() {
  var code = editor.value;
  if (!code.trim()) { plBody.innerHTML = '<div class="plainlang-empty">N\u00e3o h\u00e1 c\u00f3digo para descrever.</div>'; return; }
  var sentences = PlainLang.generate(code);
  plBody.innerHTML = PlainLang.toHtml(sentences);
  plBindTooltips();
}

function plBindTooltips() {
  var badges = plBody.querySelectorAll('.plainlang-ln');
  for (var i = 0; i < badges.length; i++) plBindOne(badges[i]);
}

function plBindOne(badge) {
  var tip = badge.querySelector('.plainlang-tip');
  if (!tip) return;
  badge.addEventListener('mouseenter', function () { plPositionTip(badge, tip); });
  badge.addEventListener('mousemove', function () { plPositionTip(badge, tip); });
}

function plPositionTip(badge, tip) {
  var rect = badge.getBoundingClientRect();
  var tipRect = tip.getBoundingClientRect();
  var ww = window.innerWidth;
  var margin = 8;
  var x = rect.left + rect.width / 2 - tipRect.width / 2;
  if (x < margin) x = margin;
  if (x + tipRect.width > ww - margin) x = ww - margin - tipRect.width;
  var spaceAbove = rect.top - margin;
  var spaceBelow = window.innerHeight - rect.bottom - margin;

  if (spaceAbove >= tipRect.height + margin || spaceAbove >= spaceBelow) {
    tip.style.bottom = 'auto';
    tip.style.top = (rect.top - tipRect.height - margin) + 'px';
  } else {
    tip.style.bottom = 'auto';
    tip.style.top = (rect.bottom + margin) + 'px';
  }
  tip.style.left = x + 'px';
}

document.getElementById('btnPlainLang').addEventListener('click', plOpen);
document.getElementById('plainLangClose').addEventListener('click', function () { plOverlay.classList.remove('open'); });
plOverlay.addEventListener('click', function (e) { if (e.target === plOverlay) plOverlay.classList.remove('open'); });
document.getElementById('plainLangAtualizar').addEventListener('click', plRender);
document.getElementById('plainLangMinimize').addEventListener('click', function () { wmMinimize('plainLangOverlay'); });
document.getElementById('plainLangMaximize').addEventListener('click', function () {
  var modal = plOverlay.querySelector('.modal');
  var maximized = modal.classList.toggle('pl-maximized');
  var icon = document.getElementById('plainLangMaxIcon');
  if (icon) icon.innerHTML = maximized
    ? '<rect x="3.5" y="1.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3.5" y="5.5" width="7" height="7" rx="1" fill="none" stroke="currentColor" stroke-width="1.6"/>'
    : '<rect x="2.5" y="2.5" width="9" height="9" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/>';
});





var btnFullscreen = document.getElementById('btnFullscreen');
function syncFullscreen() {
  var el = document.fullscreenElement || document.webkitFullscreenElement;
  btnFullscreen.textContent = el ? 'Sair da Tela' : 'Tela Cheia';
}
document.addEventListener('fullscreenchange', syncFullscreen);
document.addEventListener('webkitfullscreenchange', syncFullscreen);
btnFullscreen.addEventListener('click', function () {
  var el = document.fullscreenElement || document.webkitFullscreenElement;
  if (el) {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  } else {
    var d = document.documentElement;
    if (d.requestFullscreen) d.requestFullscreen();
    else if (d.webkitRequestFullscreen) d.webkitRequestFullscreen();
  }
});
syncFullscreen();

var btnZoomIn = document.getElementById('btnZoomIn');
var btnZoomOut = document.getElementById('btnZoomOut');

var WIN_FONT_MIN = 8;
var WIN_FONT_MAX = 30;
var WIN_FONT_DEFAULT = 14;
var winFontSizes = {};
var winIds = ['interpretadorOverlay'];
for (var wi = 0; wi < winIds.length; wi++) {
  var _sv = null;
  try { _sv = parseInt(localStorage.getItem('willprogZoom_' + winIds[wi]), 10); } catch (e) {}
  winFontSizes[winIds[wi]] = (isFinite(_sv) && _sv >= WIN_FONT_MIN && _sv <= WIN_FONT_MAX) ? _sv : WIN_FONT_DEFAULT;
}

function applyWinZoom(targetId, delta) {
  var overlay = document.getElementById(targetId);
  if (!overlay) return;
  var cur = winFontSizes[targetId] || WIN_FONT_DEFAULT;
  var next = cur + delta;
  if (next < WIN_FONT_MIN || next > WIN_FONT_MAX) return;
  winFontSizes[targetId] = next;
  var val = next + 'px';
  overlay.style.setProperty('--w-font', val);
  var modal = overlay.querySelector('.modal');
  if (modal) modal.style.setProperty('--w-font', val);
  var wrappers = overlay.querySelectorAll('.modal-body, .interp-output');
  for (var i = 0; i < wrappers.length; i++) wrappers[i].style.setProperty('--w-font', val);
  try { localStorage.setItem('willprogZoom_' + targetId, String(next)); } catch (e) {}
}

function zoomIn() {
  if (editorFontSize < EDITOR_FONT_MAX) {
    editorFontSize += 1;
    applyZoom();
  }
}
function zoomOut() {
  if (editorFontSize > EDITOR_FONT_MIN) {
    editorFontSize -= 1;
    applyZoom();
  }
}
function applyZoom() {
  editorLineHeight = Math.round(editorFontSize * 1.5);
  document.documentElement.style.setProperty('--w-font', editorFontSize + 'px');
  document.documentElement.style.setProperty('--w-lh', editorLineHeight + 'px');
  try { localStorage.setItem('willprogZoom', String(editorFontSize)); } catch (e) {}
  syncAll();
  updateStatus();
}
btnZoomIn.addEventListener('click', zoomIn);
btnZoomOut.addEventListener('click', zoomOut);
document.addEventListener('click', function (e) {
  var btn = e.target.closest ? e.target.closest('[data-win-zoom]') : null;
  if (!btn) return;
  var targetId = btn.getAttribute('data-win-zoom-target');
  if (!targetId) return;
  if (btn.getAttribute('data-win-zoom') === 'in') applyWinZoom(targetId, 2); else applyWinZoom(targetId, -2);
});

modalClose.addEventListener('click', function () {
  wmClose('modalOverlay');
});
modalOverlay.addEventListener('click', function (e) {
  if (e.target === modalOverlay) wmClose('modalOverlay');
});
var manualModal = document.querySelector('#modalOverlay .modal');
var manualMaxIcon = document.getElementById('manualMaxIcon');
document.getElementById('manualMinimize').addEventListener('click', function () {
  wmMinimize('modalOverlay');
});
document.getElementById('manualMaximize').addEventListener('click', function () { toggleModalMaximize(manualModal, 'modal-maximized', manualMaxIcon); });
var janelaOverlay = document.getElementById('janelaOverlay');
document.getElementById('janelaClose').addEventListener('click', function () {
  wmClose('janelaOverlay');
  janelaFechada = true;
  interromperEsperaJanela();
});
janelaOverlay.addEventListener('click', function (e) {
  if (e.target === janelaOverlay) {
    wmClose('janelaOverlay');
    janelaFechada = true;
    interromperEsperaJanela();
  }
});
var janelaMaxIcon = document.getElementById('janelaMaxIcon');
document.getElementById('janelaMinimize').addEventListener('click', function () {
  wmMinimize('janelaOverlay');
});
document.getElementById('janelaMaximize').addEventListener('click', function () { toggleModalMaximize(document.querySelector('#janelaOverlay .modal'), 'janela-maximized', janelaMaxIcon); });
var mensagemOverlay = document.getElementById('mensagemOverlay');
var mensagemResolve = null;
function showMessageBox(title, message) {
  document.getElementById('mensagemTitle').textContent = title;
  document.getElementById('mensagemText').textContent = message;
  mensagemOverlay.classList.add('open');
  return new Promise(function (resolve) {
    mensagemResolve = resolve;
  });
}
function closeMensagem() {
  if (!mensagemOverlay.classList.contains('open')) return;
  mensagemOverlay.classList.remove('open');
  if (mensagemResolve) {
    var r = mensagemResolve;
    mensagemResolve = null;
    r();
  }
}
document.getElementById('mensagemOk').addEventListener('click', closeMensagem);
document.getElementById('mensagemClose').addEventListener('click', closeMensagem);
mensagemOverlay.addEventListener('click', function (e) {
  if (e.target === mensagemOverlay) closeMensagem();
});
var leiaOverlay = document.getElementById('leiaOverlay');
var leiaResolve = null;
function showInputBox(message) {
  document.getElementById('leiaText').textContent = message;
  var inp = document.getElementById('leiaInput');
  inp.value = '';
  leiaOverlay.classList.add('open');
  setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
  return new Promise(function (resolve) {
    leiaResolve = resolve;
  });
}
function closeLeiaOk() {
  if (!leiaOverlay.classList.contains('open')) return;
  var val = document.getElementById('leiaInput').value;
  leiaOverlay.classList.remove('open');
  if (leiaResolve) {
    var r1 = leiaResolve;
    leiaResolve = null;
    r1(val);
  }
}
function closeLeiaCancel() {
  if (!leiaOverlay.classList.contains('open')) return;
  leiaOverlay.classList.remove('open');
  if (leiaResolve) {
    var r2 = leiaResolve;
    leiaResolve = null;
    r2(null);
  }
}
document.getElementById('leiaOk').addEventListener('click', closeLeiaOk);
document.getElementById('leiaClose').addEventListener('click', closeLeiaCancel);
document.getElementById('leiaCancel').addEventListener('click', closeLeiaCancel);
leiaOverlay.addEventListener('click', function (e) {
  if (e.target === leiaOverlay) closeLeiaCancel();
});
document.getElementById('leiaInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') { e.preventDefault(); closeLeiaOk(); }
  else if (e.key === 'Escape') { e.preventDefault(); closeLeiaCancel(); }
});
var selecionarOverlay = document.getElementById('selecionarOverlay');
var selecionarOptions = document.getElementById('selecionarOptions');
var selecionarOutput = document.getElementById('selecionarOutput');
var selecionarOpts = [];
var selResolvers = [];
var selBusy = false;

function selAddLine(text, cls) {
  var d = document.createElement('div');
  d.className = 'sel-oline' + (cls ? ' ' + cls : '');
  d.textContent = text;
  selecionarOutput.appendChild(d);
  selecionarOutput.scrollTop = selecionarOutput.scrollHeight;
}
function selClearOutput() {
  selecionarOutput.innerHTML = '';
  selecionarOutput.classList.remove('open');
}
function renderSelOptions(options) {
  selecionarOptions.innerHTML = '';
  options.forEach(function (opt) {
    var item = document.createElement('div');
    item.className = 'sel-item';
    item.setAttribute('data-key', opt.key);
    var k = document.createElement('span');
    k.className = 'sel-key';
    k.textContent = opt.key;
    var t = document.createElement('span');
    t.className = 'sel-label';
    t.textContent = opt.title;
    item.appendChild(k);
    item.appendChild(t);
    selecionarOptions.appendChild(item);
  });
}
function showSelecionarOpcao(options) {
  selecionarOpts = options;
  document.getElementById('selecionarTitle').textContent = 'Selecionar opção';
  selClearOutput();
  renderSelOptions(options);
  selecionarOverlay.classList.add('open');
  try { editor.blur(); } catch (e) {}
  selecionarOverlay.focus();
  return new Promise(function (resolve) {
    selResolvers.push(resolve);
  });
}
function closeSelecionar() {
  if (!selecionarOverlay.classList.contains('open')) return;
  selecionarOverlay.classList.remove('open');
  if (selResolvers.length) {
    var r = selResolvers.pop();
    r();
  }
}
function findSelOption(key) {
  var k = String(key).toUpperCase();
  for (var i = 0; i < selecionarOpts.length; i++) {
    if (String(selecionarOpts[i].key).toUpperCase() === k) return selecionarOpts[i];
  }
  return null;
}
function selKeyHandler(e) {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  if (!selecionarOverlay.classList.contains('open')) return;
  if (mensagemOverlay.classList.contains('open')) return;
  if (leiaOverlay.classList.contains('open')) return;
  if (selBusy) return;
  if (e.key === 'Escape') { e.preventDefault(); closeSelecionar(); return; }
  if (e.key.length === 1) {
    e.preventDefault();
    var opt = findSelOption(e.key);
    if (opt) selExecuteOption(opt);
  }
}
async function selExecuteOption(opt) {
  if (selBusy) return;
  selBusy = true;
  try {
    if (!selecionarOutput.classList.contains('open')) {
      selecionarOutput.classList.add('open');
    }
    var out = [];
    selAddLine(opt.key + ' "' + opt.title + '":', 'sel-head');
    var optEnv = Object.create(GLOBAL_ENV || {});
    WP_NO_INPUT_DEFER++;
    try {
      execNodes(opt.body, optEnv, out);
    } catch (egoto) {
      if (egoto && egoto.wpReturn) out.push({ kind: 'error', text: 'retorne usado fora de uma função', lineNo: opt.lineNo });
      else if (egoto && egoto.wpPare) out.push({ kind: 'error', text: "'pare' usado fora de um laço", lineNo: opt.lineNo });
      else if (egoto && egoto.wpContinue) out.push({ kind: 'error', text: "'continue' usado fora de um laço", lineNo: opt.lineNo });
      else if (egoto && egoto.wpGoto) out.push({ kind: 'error', text: "'vá para' não funciona dentro de \"selecionar opção\"", lineNo: opt.lineNo });
      else out.push({ kind: 'error', text: egoto.message || String(egoto), lineNo: opt.lineNo });
    } finally {
      WP_NO_INPUT_DEFER--;
    }
    var timerCount = 0;
    var playPos = { i: 0 };
    for (var i = 0; i < out.length || timerCount > 0; i++) {
      while (i >= out.length && timerCount > 0) { await sleep(30); }
      if (i >= out.length) { break; }
      var rec = out[i];
      playPos.i = i + 1;
      if (rec.kind === 'clear') { selecionarOutput.innerHTML = ''; continue; }
      if (rec.kind === 'timer') {
        timerCount++;
        (function (tRec) {
          setTimeout(function () {
            timerCount--;
            var at = Math.min(playPos.i, out.length);
            out.splice.apply(out, [at, 0].concat(tRec.inner));
            if (i > at) i = at;
          }, Math.max(0, tRec.secs) * 1000);
        })(rec);
        continue;
      }
      if (rec.kind === 'pause') { if (!(janelaUsada && janelaFechada)) { if (!rec.silent) selAddLine(rec.text, 'sel-info'); await sleepJanela(Math.max(0, rec.secs) * 1000); } continue; }
      if (rec.kind === 'render') { var nxR = out[i + 1]; if (!(nxR && nxR.kind === 'render') && !(janelaUsada && janelaFechada)) { janelaVis = { p: rec.vp, l: rec.vl, c: rec.vc, r: rec.vr, t: rec.vt }; renderJanela(); } continue; }
      if (rec.kind === 'sound') {
        if (typeof rec.freq === 'number' && isFinite(rec.freq)) emitTone(rec.freq, Math.max(0.001, rec.secs));
        else emitBipe(Math.max(0.001, rec.secs));
        await sleep(15);
        continue;
      }
      if (rec.kind === 'melody') {
        for (var mi = 0; mi < rec.freqs.length; mi++) {
          emitTone(rec.freqs[mi], Math.max(0.001, rec.secs));
          await sleep(Math.max(0, rec.secs) * 1000);
        }
        continue;
      }
      if (rec.kind === 'message') { await showMessageBox(rec.title, rec.body); continue; }
      if (rec.kind === 'waitKey') { selAddLine(rec.text, 'sel-info'); await waitKey(rec.key); continue; }
      if (rec.kind === 'rerun') {
        var rr2 = [];
        WP_NO_INPUT_DEFER++;
        try {
        execStatement(rec.line, rec.lineNo, optEnv, rr2, true);
      } catch (e) {
        if (e && e.wpReturn) rr2.push({ kind: 'error', text: 'retorne usado fora de uma função', lineNo: rec.lineNo });
        else if (e && e.wpPare) rr2.push({ kind: 'error', text: "'pare' usado fora de um laço", lineNo: rec.lineNo });
        else if (e && e.wpContinue) rr2.push({ kind: 'error', text: "'continue' usado fora de um laço", lineNo: rec.lineNo });
        else if (e && e.wpGoto) rr2.push({ kind: 'error', text: "'vá para' não funciona dentro de \"selecionar opção\"", lineNo: rec.lineNo });
        else throw e;
      } finally {
        WP_NO_INPUT_DEFER--;
      }
        out.splice.apply(out, [i + 1, 0].concat(rr2));
        continue;
      }
      if (rec.kind === 'select') {
        selBusy = false;
        var savedOpts = selecionarOpts;
        await showSelecionarOpcao(rec.options);
        selecionarOpts = savedOpts;
        renderSelOptions(selecionarOpts);
        selBusy = true;
        continue;
      }
      if (rec.kind === 'error') { selAddLine(rec.text, 'sel-error'); continue; }
      if (rec.kind === 'out' || rec.kind === 'return') { selAddLine(rec.text); continue; }
      if (rec.kind === 'assign') { selAddLine(rec.text, 'sel-info'); continue; }
    }
  } finally {
    selBusy = false;
  }
}
document.getElementById('selecionarClose').addEventListener('click', closeSelecionar);
selecionarOverlay.addEventListener('click', function (e) {
  if (e.target === selecionarOverlay) closeSelecionar();
});
selecionarOptions.addEventListener('click', function (e) {
  var item = e.target.closest('.sel-item');
  if (!item) return;
  var opt = findSelOption(item.getAttribute('data-key'));
  if (opt) selExecuteOption(opt);
});
document.addEventListener('keydown', selKeyHandler);
var waitKeyQueue = [];
var waitKeyLast = '';
function waitKey(key) {
  return new Promise(function (resolve) {
    waitKeyQueue.push({ key: key, resolve: resolve });
  });
}
function feedWaitKey(ek) {
  if (waitKeyQueue.length === 0) return;
  if (ek === undefined || ek === null || ek === 'Unidentified') return;
  if (ek === 'Shift' || ek === 'Control' || ek === 'Alt' || ek === 'Meta' || ek === 'CapsLock' || ek === 'NumLock' || ek === 'ScrollLock') return;
  var isSingle = ek.length === 1;
  var k = isSingle ? ek.toLowerCase() : ek;
  for (var i = 0; i < waitKeyQueue.length; i++) {
    var w = waitKeyQueue[i];
    var match = w.key === null ? true : (isSingle && w.key === k);
    if (match) {
      waitKeyQueue.splice(i, 1);
      waitKeyLast = ek;
      w.resolve(k);
      i--;
    }
  }
}
document.addEventListener('keydown', function (e) { feedWaitKey(e.key); });
var emJanelaOverlay = document.getElementById('emJanelaOverlay');
var emJanelaModal = document.getElementById('emJanelaModal');
var emJanelaOutput = document.getElementById('emJanelaOutput');
var emJanelaMaxIcon = document.getElementById('emJanelaMaxIcon');

function emJanelaClearOutput() {
  emJanelaOutput.innerHTML = '';
  var ph = document.createElement('div');
  ph.className = 'placeholder';
  ph.textContent = 'Sem saída ainda.';
  emJanelaOutput.appendChild(ph);
}
function emJanelaAdd(rec, isFinal) {
  var ph = emJanelaOutput.querySelector('.placeholder');
  if (ph) ph.remove();
  var div = document.createElement('div');
  div.className = 'log';
  if (isFinal) div.className += ' final';
  if (rec.kind === 'error') div.className += ' error';
  else if (rec.kind === 'assign') div.className += ' assign';
  else if (rec.kind === 'info' || rec.kind === 'waitKey') div.className += ' info';
  div.textContent = rec.text;
  emJanelaOutput.appendChild(div);
  emJanelaOutput.scrollTop = emJanelaOutput.scrollHeight;
}
function openEmJanela(title, centered) {
  document.getElementById('emJanelaTitle').textContent = title;
  emJanelaOutput.classList.toggle('centered', !!centered);
  wmOpen('emJanelaOverlay');
  emJanelaClearOutput();
}
function closeEmJanela() {
  wmClose('emJanelaOverlay');
}
function makeEmjSinkOverlay(centered) {
  openEmJanela('Janela', centered);
  return {
    alive: function () { return true; },
    clear: function () { emJanelaClearOutput(); },
    add: function (rec, isFinal) { emJanelaAdd(rec, isFinal); }
  };
}
async function processEmJanela(records, centered) {
  var sink = makeEmjSinkOverlay(centered);
  sink.clear();
  var lastOut = -1;
  for (var li = 0; li < records.length; li++) {
    if (records[li].kind === 'out' || records[li].kind === 'return') lastOut = li;
  }
  var timerCount = 0;
  var playPos = { i: 0 };
  for (var i = 0; i < records.length || timerCount > 0; i++) {
    while (i >= records.length && timerCount > 0) { await sleep(30); }
    if (i >= records.length) { break; }
    var rec = records[i];
    playPos.i = i + 1;
    if (rec.kind === 'clear') { sink.clear(); continue; }
    if (rec.kind === 'timer') {
      timerCount++;
      (function (tRec) {
        setTimeout(function () {
          timerCount--;
          var at = Math.min(playPos.i, records.length);
          records.splice.apply(records, [at, 0].concat(tRec.inner));
          if (i > at) i = at;
        }, Math.max(0, tRec.secs) * 1000);
      })(rec);
      continue;
    }
    if (rec.kind === 'pause') { if (!(janelaUsada && janelaFechada)) { if (!rec.silent) sink.add(rec, false); await sleepJanela(Math.max(0, rec.secs) * 1000); } continue; }
    if (rec.kind === 'render') { var nxR = records[i + 1]; if (!(nxR && nxR.kind === 'render') && !(janelaUsada && janelaFechada)) { janelaVis = { p: rec.vp, l: rec.vl, c: rec.vc, r: rec.vr, t: rec.vt }; renderJanela(); } continue; }
    if (rec.kind === 'sound') {
      if (typeof rec.freq === 'number' && isFinite(rec.freq)) emitTone(rec.freq, Math.max(0.001, rec.secs));
      else emitBipe(Math.max(0.001, rec.secs));
      await sleep(15);
      continue;
    }
    if (rec.kind === 'melody') {
      for (var mi = 0; mi < rec.freqs.length; mi++) {
        emitTone(rec.freqs[mi], Math.max(0.001, rec.secs));
        await sleep(Math.max(0, rec.secs) * 1000);
      }
      continue;
    }
    if (rec.kind === 'message') { await showMessageBox(rec.title, rec.body); continue; }
    if (rec.kind === 'waitKey') {
      sink.add(rec, false);
      await waitKey(rec.key);
      continue;
    }
    if (rec.kind === 'rerun') {
      var rr = [];
      try {
        execStatement(rec.line, rec.lineNo, rec.env, rr, true);
      } catch (e) {
        if (e && e.wpReturn) rr.push({ kind: 'error', text: 'retorne usado fora de uma função', lineNo: rec.lineNo });
        else if (e && e.wpPare) rr.push({ kind: 'error', text: "'pare' usado fora de um laço", lineNo: rec.lineNo });
        else if (e && e.wpContinue) rr.push({ kind: 'error', text: "'continue' usado fora de um laço", lineNo: rec.lineNo });
        else throw e;
      }
      records.splice.apply(records, [i + 1, 0].concat(rr));
      continue;
    }
    if (rec.kind === 'select') { await showSelecionarOpcao(rec.options); continue; }
    if (rec.kind === 'window') { await processEmJanela(rec.inner, rec.centered); continue; }
    if (rec.kind === 'assign') continue;
    sink.add(rec, i === lastOut);
  }
}
document.getElementById('emJanelaClose').addEventListener('click', closeEmJanela);
emJanelaOverlay.addEventListener('click', function (e) {
  if (e.target === emJanelaOverlay) closeEmJanela();
});

document.getElementById('emJanelaMinimize').addEventListener('click', function () {
  wmMinimize('emJanelaOverlay');
});
document.getElementById('emJanelaMaximize').addEventListener('click', function () { toggleModalMaximize(emJanelaModal, 'emjanela-maximized', emJanelaMaxIcon); });

// ============================================================
//  INTERPRETADOR
// ============================================================

var interpOverlay = document.getElementById('interpretadorOverlay');
var interpModal = document.getElementById('interpretadorModal');
var interpOutput = document.getElementById('interpOutput');
var interpInput = document.getElementById('interpInput');
var interpMaxIcon = document.getElementById('interpMaxIcon');
var interpEnv = {};
var interpHistory = [];
var interpHistIdx = -1;

function interpClearOutput() {
  interpOutput.innerHTML = '';
  var ph = document.createElement('div');
  ph.className = 'placeholder';
  ph.textContent = 'Digite comandos e pressione Enter para executar.';
  interpOutput.appendChild(ph);
}

function interpAddOutput(rec) {
  var ph = interpOutput.querySelector('.placeholder');
  if (ph) ph.remove();
  var div = document.createElement('div');
  div.className = 'log';
  if (rec.kind === 'error') div.className += ' error';
  else if (rec.kind === 'assign') div.className += ' assign';
  else if (rec.kind === 'info') div.className += ' info';
  else if (rec.kind === 'cmd') div.className += ' cmd';
  div.textContent = rec.text;
  interpOutput.appendChild(div);
  interpOutput.scrollTop = interpOutput.scrollHeight;
}

function openInterpretador() {
  interpClearOutput();
  wmOpen('interpretadorOverlay');
  interpInput.value = '';
  interpInput.focus();
}

function closeInterpretador() {
  wmClose('interpretadorOverlay');
}

function interpZoomIn() {
  zoomIn();
}

function interpZoomOut() {
  zoomOut();
}

interpOutput.addEventListener('wheel', function (e) {
  if (e.ctrlKey || e.metaKey) {
    e.preventDefault();
    if (e.deltaY < 0) interpZoomIn();
    else interpZoomOut();
  }
}, { passive: false });

async function interpExec(line) {
  var trimmed = line.trim();
  if (!trimmed || trimmed.charAt(0) === '#') return;

  interpAddOutput({ kind: 'cmd', text: '> ' + trimmed });

  janelaFechada = false;
  var records = [];
  try {
    var stmts = toStatements(trimmed);
    if (stmts.length > 0) {
      var nodes = [];
      for (var si = 0; si < stmts.length; si++) {
        if (isRotulo(stmts[si].text)) continue;
        nodes.push({ type: 'stmt', text: stmts[si].text, lineNo: 1 });
      }
      execNodes(nodes, interpEnv, records);
    }
  } catch (e) {
    if (e && e.wpReturn) records.push({ kind: 'error', text: 'retorne usado fora de uma função', lineNo: null });
    else if (e && e.wpPare) records.push({ kind: 'error', text: "'pare' usado fora de um laço", lineNo: null });
    else if (e && e.wpContinue) records.push({ kind: 'error', text: "'continue' usado fora de um laço", lineNo: null });
    else if (e && e.wpGoto) records.push({ kind: 'error', text: "'vá para' não é suportado no Interpretador; use o Editor", lineNo: null });
    else records.push({ kind: 'error', text: e.message || String(e), lineNo: null });
  }

  var timerCount = 0;
  var playPos = { i: 0 };
  for (var ri = 0; ri < records.length || timerCount > 0; ri++) {
    while (ri >= records.length && timerCount > 0) { await sleep(30); }
    if (ri >= records.length) { break; }
    var rec = records[ri];
    playPos.i = ri + 1;
    if (rec.kind === 'clear') { interpClearOutput(); continue; }
    if (rec.kind === 'timer') {
      timerCount++;
      (function (tRec) {
        setTimeout(function () {
          timerCount--;
          var at = Math.min(playPos.i, records.length);
          records.splice.apply(records, [at, 0].concat(tRec.inner));
          if (ri > at) ri = at;
        }, Math.max(0, tRec.secs) * 1000);
      })(rec);
      continue;
    }
    if (rec.kind === 'pause') { if (!(janelaUsada && janelaFechada)) { if (!rec.silent) interpAddOutput(rec); await sleepJanela(Math.max(0, rec.secs || 1) * 1000); } continue; }
    if (rec.kind === 'render') { var nxR = records[ri + 1]; if (!(nxR && nxR.kind === 'render') && !(janelaUsada && janelaFechada)) { janelaVis = { p: rec.vp, l: rec.vl, c: rec.vc, r: rec.vr, t: rec.vt }; renderJanela(); } continue; }
    if (rec.kind === 'message') { await showMessageBox(rec.title, rec.body); continue; }
    if (rec.kind === 'select') { await showSelecionarOpcao(rec.options); continue; }
    if (rec.kind === 'window') { await processEmJanela(rec.inner, rec.centered); continue; }
    if (rec.kind === 'rerun') {
      var rr = [];
      try {
        execStatement(rec.line, rec.lineNo || 1, interpEnv, rr, true);
      } catch (e) {
        if (e && e.wpReturn) rr.push({ kind: 'error', text: 'retorne usado fora de uma função', lineNo: null });
        else if (e && e.wpPare) rr.push({ kind: 'error', text: "'pare' usado fora de um laço", lineNo: null });
        else if (e && e.wpContinue) rr.push({ kind: 'error', text: "'continue' usado fora de um laço", lineNo: null });
        else if (e && e.wpGoto) rr.push({ kind: 'error', text: "'vá para' não é suportado no Interpretador; use o Editor", lineNo: null });
        else rr.push({ kind: 'error', text: e.message || String(e), lineNo: null });
      }
      records.splice.apply(records, [ri + 1, 0].concat(rr));
      continue;
    }
    if (rec.kind === 'waitKey') {
      interpAddOutput(rec);
      await waitKey(rec.key);
      continue;
    }
    if (rec.kind === 'sound') {
      emitTone(rec.freq, rec.secs);
      await sleep(15);
      continue;
    }
    if (rec.kind === 'melody') {
      for (var mi = 0; mi < rec.freqs.length; mi++) {
        emitTone(rec.freqs[mi], Math.max(0.001, rec.secs));
        await sleep(Math.max(0, rec.secs) * 1000);
      }
      continue;
    }
    interpAddOutput(rec);
  }
}

interpInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    var val = interpInput.value;
    if (val.trim()) {
      interpHistory.push(val);
      interpHistIdx = interpHistory.length;
    }
    interpInput.value = '';
    interpExec(val);
    return;
  }
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (interpHistIdx > 0) {
      interpHistIdx--;
      interpInput.value = interpHistory[interpHistIdx] || '';
    }
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (interpHistIdx < interpHistory.length - 1) {
      interpHistIdx++;
      interpInput.value = interpHistory[interpHistIdx] || '';
    } else {
      interpHistIdx = interpHistory.length;
      interpInput.value = '';
    }
    return;
  }
});

document.getElementById('interpClose').addEventListener('click', closeInterpretador);
interpOverlay.addEventListener('click', function (e) {
  if (e.target === interpOverlay) closeInterpretador();
});
document.getElementById('interpMinimize').addEventListener('click', function () {
  wmMinimize('interpretadorOverlay');
});
document.getElementById('interpMaximize').addEventListener('click', function () { toggleModalMaximize(interpModal, 'interp-maximized', interpMaxIcon); });



var graficoOverlay = document.getElementById('graficoOverlay');
function graficoWrap(ctx, text, maxWidth) {
  var lines = [];
  var cur = '';
  for (var i = 0; i < text.length; i++) {
    var test = cur + text[i];
    if (ctx.measureText(test).width > maxWidth && cur !== '') {
      lines.push(cur);
      cur = text[i];
    } else {
      cur = test;
    }
  }
  if (cur !== '') lines.push(cur);
  if (lines.length === 0) lines.push('');
  return lines;
}
function renderGrafico() {
  var canvas = document.getElementById('graficoCanvas');
  var body = document.querySelector('#graficoOverlay .grafico-body');
  if (!body || !canvas) return;
  var cs = window.getComputedStyle(consoleEl);
  var fontFamily = cs.fontFamily || "Consolas, 'Courier New', monospace";
  var fontSize = parseFloat(cs.fontSize) || 14;
  var lineHeight = parseFloat(cs.lineHeight) || 21;
  var bg = cs.backgroundColor || '#1e1e1e';
  var textPad = parseFloat(cs.paddingLeft) || 12;
  var padTop = parseFloat(cs.paddingTop) || 8;
  var gs = window.getComputedStyle(consoleGutter);
  var gutterBg = gs.backgroundColor || '#1e1e1e';
  var gutterColor = gs.color || '#6a6a6a';
  var gutterWidth = parseFloat(gs.width) || 44;
  var gutterPadRight = parseFloat(gs.paddingRight) || 6;

  var entries = [];
  var kids = consoleEl.children;
  for (var i = 0; i < kids.length; i++) {
    var kid = kids[i];
    entries.push({ color: window.getComputedStyle(kid).color, text: kid.textContent, bold: !!kid.classList && kid.classList.contains('final') });
  }
  if (entries.length === 0) {
    entries.push({ color: '#8a8a8a', text: 'Console vazio.' });
  }

  var dpr = window.devicePixelRatio || 1;
  var ctx = canvas.getContext('2d');
  ctx.font = fontSize + 'px ' + fontFamily;

  var availW = Math.max(body.clientWidth - gutterWidth - textPad * 2, 100);
  var rows = [];
  for (var e = 0; e < entries.length; e++) {
    var raw = entries[e].text.split('\n');
    for (var r = 0; r < raw.length; r++) {
      var ws = graficoWrap(ctx, raw[r], availW);
      for (var w = 0; w < ws.length; w++) {
        rows.push({ text: ws[w], color: entries[e].color, bold: entries[e].bold });
      }
    }
  }

  var width = Math.max(Math.round(availW + gutterWidth + textPad * 2), 320);
  var height = Math.max(Math.round(rows.length * lineHeight + padTop * 2), 60);

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = gutterBg;
  ctx.fillRect(0, 0, gutterWidth, height);

  ctx.font = fontSize + 'px ' + fontFamily;
  ctx.textBaseline = 'top';
  var y = padTop;
  for (var r2 = 0; r2 < rows.length; r2++) {
    ctx.fillStyle = gutterColor;
    ctx.textAlign = 'right';
    ctx.fillText(String(r2 + 1), gutterWidth - gutterPadRight, y);
    ctx.fillStyle = rows[r2].color;
    ctx.textAlign = 'left';
    ctx.font = (rows[r2].bold ? 'bold ' : '') + fontSize + 'px ' + fontFamily;
    ctx.fillText(rows[r2].text, gutterWidth + textPad, y);
    y += lineHeight;
  }
}
function consoleText() {
  var parts = [];
  var kids = consoleEl.children;
  for (var i = 0; i < kids.length; i++) {
    if (kids[i].classList.contains('placeholder')) continue;
    parts.push(kids[i].textContent);
  }
  return parts.join('\n');
}
function copyConsoleText() {
  var text = consoleText();
  if (!text) text = 'Console vazio.';
  var done = function () {
    var btn = document.getElementById('graficoCopy');
    if (btn) {
      var old = btn.textContent;
      btn.textContent = 'Copiado!';
      setTimeout(function () { btn.textContent = old; }, 1500);
    }
  };
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) {}
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, fallback);
  } else {
    fallback();
  }
}
function openGrafico() {
  wmOpen('graficoOverlay');
  requestAnimationFrame(renderGrafico);
}
document.getElementById('btnGrafico').addEventListener('click', openGrafico);
document.getElementById('btnInterpretador').addEventListener('click', openInterpretador);
document.getElementById('graficoCopy').addEventListener('click', copyConsoleText);
document.getElementById('graficoClose').addEventListener('click', function () {
  wmClose('graficoOverlay');
});
graficoOverlay.addEventListener('click', function (e) {
  if (e.target === graficoOverlay) wmClose('graficoOverlay');
});
var graficoMaxIcon = document.getElementById('graficoMaxIcon');
document.getElementById('graficoMinimize').addEventListener('click', function () {
  wmMinimize('graficoOverlay');
});
document.getElementById('graficoMaximize').addEventListener('click', function () { toggleModalMaximize(document.querySelector('#graficoOverlay .modal'), 'grafico-maximized', graficoMaxIcon); });
window.addEventListener('resize', function () {
  syncAll();
  if (janelaOverlay.classList.contains('open')) renderJanela();
});
document.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '=')) {
    e.preventDefault();
    if (document.activeElement === interpInput) interpZoomIn(); else zoomIn();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === '-' || e.key === '_')) {
    e.preventDefault();
    if (document.activeElement === interpInput) interpZoomOut(); else zoomOut();
    return;
  }
  if (e.key === 'Escape') {
    closeAllMenus();
    wmClose('modalOverlay', true);
    if (janelaUsada) {
      janelaFechada = true;
      interromperEsperaJanela();
    }
    wmClose('janelaOverlay', true);
    wmClose('graficoOverlay', true);
    wmClose('quickRefOverlay', true);
    sobreOverlay.classList.remove('open');
    closeSelecionar();
    wmClose('emJanelaOverlay', true);
    wmClose('interpretadorOverlay', true);
    wmStack = [];
    wmRenderBar();
  }
});

var dragging = false;
splitter.addEventListener('mousedown', function (e) {
  dragging = true;
  e.preventDefault();
  document.body.classList.add('dragging');
});
document.addEventListener('mousemove', function (e) {
  if (!dragging) return;
  var rect = mainEl.getBoundingClientRect();
  var width = rect.right - e.clientX;
  var minW = 180;
  var maxW = rect.width - 320;
  if (width < minW) width = minW;
  if (width > maxW) width = maxW;
  consolePanel.style.flex = '0 0 ' + width + 'px';
});
document.addEventListener('mouseup', function () {
  if (dragging) {
    dragging = false;
    document.body.classList.remove('dragging');
    var rect = mainEl.getBoundingClientRect();
    var pct = rect.width > 0 ? consolePanel.getBoundingClientRect().width / rect.width * 100 : 42;
    try { localStorage.setItem('willprogConsoleWidth', String(pct)); } catch (e) {}
  }
});

editor.addEventListener('keydown', function (e) {
  if (acIsOpen()) {
    if (e.key === 'ArrowDown') { e.preventDefault(); acNavKey = true; acMove(1); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); acNavKey = true; acMove(-1); return; }
    if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) { e.preventDefault(); acAccept(); return; }
    if (e.key === 'Tab' && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); acAccept(); return; }
    if (e.key === 'Escape') { e.preventDefault(); acClose(); return; }
  }
  if ((e.ctrlKey || e.metaKey) && (e.key === ' ' || e.key === 'Space')) { e.preventDefault(); acUpdate(true); return; }
  if (e.key === 'Tab') { e.preventDefault(); insertAtCursor('  ', false); }
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
  if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
    var start = editor.selectionStart || 0;
    var before = editor.value.slice(0, start);
    var nl = before.lastIndexOf('\n');
    var line = nl === -1 ? before : before.slice(nl + 1);
    if (/\S/.test(line) && /:\s*$/.test(line)) {
      e.preventDefault();
      var ind = line.match(/^[ \t]*/);
      insertAtCursor('\n' + (ind ? ind[0] : '') + '  ', false);
    }
  }
});
var _syncTimer = null;
editor.addEventListener('input', function () {
  acUpdate();
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(function () {
    _syncTimer = null;
    syncAll();
    saveCode();
  }, 16);
});
editor.addEventListener('click', function () { updateStatus(); acUpdate(); });
editor.addEventListener('keyup', function (e) {
  updateStatus();
  if (acNavKey) { acNavKey = false; return; }
  if (acIsOpen() && (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'Home' || e.key === 'End')) acUpdate();
});
editor.addEventListener('scroll', function () {
  highlight.scrollTop = editor.scrollTop;
  highlight.scrollLeft = editor.scrollLeft;
  gutter.scrollTop = editor.scrollTop;
  if (acIsOpen()) acPosition();

});
editor.addEventListener('blur', acClose);

// ============================================================

// ==================== Window Manager ====================
var wmStack = [];
var wmLabels = {
  janelaOverlay:     'Janela',
  emJanelaOverlay:   'emJanela',
  interpretadorOverlay: 'Interpretador',
  graficoOverlay:    'Gráfico de Funções',
  modalOverlay:      'Manual',
  quickRefOverlay:   'Ref. Rápida'
};
function wmFindCurrent() {
  var ids = Object.keys(wmLabels);
  for (var i = 0; i < ids.length; i++) {
    var el = document.getElementById(ids[i]);
    if (el && el.classList.contains('open')) return ids[i];
  }
  return null;
}
var _wmMaxMap = {
  modalOverlay:'modal-maximized', quickRefOverlay:'qr-maximized',
  interpretadorOverlay:'interp-maximized',
  graficoOverlay:'grafico-maximized',
  janelaOverlay:'janela-maximized',
  emJanelaOverlay:'emjanela-maximized'
};
function wmOpen(overlayId) {
  var el = document.getElementById(overlayId);
  if (!el) { return; }
  var cur = wmFindCurrent();
  if (cur && cur !== overlayId && wmStack.indexOf(cur) === -1) {
    wmStack.push(cur);
    document.getElementById(cur).classList.remove('open');
  }
  el.classList.add('open');
  if (_wmMaxMap[overlayId]) {
    var md = el.querySelector('.modal');
    if (md && !md.classList.contains(_wmMaxMap[overlayId])) {
      md.classList.add(_wmMaxMap[overlayId]);
      var svg = md.querySelector('svg[id$="MaxIcon"]');
      if (svg) setMaxIcon(svg, true);
    }
  }
  wmRenderBar();
}
function wmClose(overlayId, noRestore) {
  var el = document.getElementById(overlayId);
  if (!el) { return; }
  el.classList.remove('open');
  var idx = wmStack.indexOf(overlayId);
  if (idx !== -1) wmStack.splice(idx, 1);
  if (!noRestore && wmStack.length > 0) {
    var prev = wmStack.pop();
    document.getElementById(prev).classList.add('open');
  }
  wmRenderBar();
}
function wmMinimize(overlayId) {
  var el = document.getElementById(overlayId);
  if (!el) return;
  el.classList.remove('open');
  if (wmStack.indexOf(overlayId) === -1) wmStack.push(overlayId);
  for (var i = wmStack.length - 1; i >= 0; i--) {
    if (wmStack[i] !== overlayId) {
      var prev = wmStack.splice(i, 1)[0];
      document.getElementById(prev).classList.add('open');
      break;
    }
  }
  wmRenderBar();
}
function wmRenderBar() {
  var bar = document.getElementById('minimizedBar');
  bar.innerHTML = '';
  for (var i = 0; i < wmStack.length; i++) {
    var id = wmStack[i];
    var btn = document.createElement('button');
    btn.className = 'minimized-btn';
    btn.textContent = wmLabels[id] || id;
    btn.setAttribute('data-wm-id', id);
    btn.addEventListener('click', (function (wid) {
      return function () {
        var idx2 = wmStack.indexOf(wid);
        if (idx2 !== -1) wmStack.splice(idx2, 1);
        var cur2 = wmFindCurrent();
        if (cur2 && cur2 !== wid && wmStack.indexOf(cur2) === -1) {
          wmStack.push(cur2);
          document.getElementById(cur2).classList.remove('open');
        }
        document.getElementById(wid).classList.add('open');
        wmRenderBar();
      };
    })(id));
    bar.appendChild(btn);
  }
}

// Inicial
var savedCode = null;
try { savedCode = localStorage.getItem(CODE_STORAGE_KEY); } catch (e) {}
if (savedCode && savedCode.trim()) editor.value = savedCode;
var savedZoom = null;
try { savedZoom = parseInt(localStorage.getItem('willprogZoom'), 10); } catch (e) {}
if (isFinite(savedZoom)) editorFontSize = Math.max(EDITOR_FONT_MIN, Math.min(EDITOR_FONT_MAX, savedZoom));
applyZoom();

for (var _wi = 0; _wi < winIds.length; _wi++) {
  var _ov = document.getElementById(winIds[_wi]);
  if (_ov && winFontSizes[winIds[_wi]] !== WIN_FONT_DEFAULT) {
    var _val = winFontSizes[winIds[_wi]] + 'px';
    _ov.style.setProperty('--w-font', _val);
    var _md = _ov.querySelector('.modal');
    if (_md) _md.style.setProperty('--w-font', _val);
    var _wrappers = _ov.querySelectorAll('.modal-body, .interp-output');
    for (var _wj = 0; _wj < _wrappers.length; _wj++) _wrappers[_wj].style.setProperty('--w-font', _val);
  }
}

var savedWidth = null;
try { savedWidth = parseFloat(localStorage.getItem('willprogConsoleWidth')); } catch (e) {}
if (isFinite(savedWidth) && savedWidth > 0) {
  var wPct = Math.max(10, Math.min(90, savedWidth));
  consolePanel.style.flex = '0 0 ' + wPct + '%';
}


// ============================================================
// ============================================================
//  EDITOR TOOLTIP (hover sobre comandos/funções)
// ============================================================
(function () {
  var ttEl = document.getElementById('editorTooltip');
  if (!ttEl) return;

  var TOOLTIPS = {
    'mostre': { cat: 'Comando', desc: 'Exibe o valor de uma expressão no console', ex: 'mostre 2 + 3' },
    'limpe':  { cat: 'Comando', desc: 'Apaga todo o conteúdo do console' },
    'mensagem': { cat: 'Comando', desc: 'Abre uma caixa de mensagem com título e texto', ex: 'mensagem("Título", "Corpo")' },
    'emJanela': { cat: 'Comando', desc: 'Executa o bloco em uma janela ao invés do console' },
    'leia': { cat: 'Comando', desc: 'Pede que o usuário digite um valor', ex: 'nome = leia "Nome: "' },
    'aguardeTecla': { cat: 'Comando', desc: 'Pausa até o usuário pressionar uma tecla', ex: 'aguardeTecla("Z")' },
    'captureTecla': { cat: 'Função', desc: 'Retorna a tecla pressionada no último aguardeTecla()' },
    'se': { cat: 'Comando', desc: 'Executa o bloco se a condição for verdadeira', ex: 'se x > 5:\n  mostre "grande"' },
    'senão': { cat: 'Comando', desc: 'Bloco executado quando a condição do se é falsa' },
    'enquanto': { cat: 'Comando', desc: 'Repete o bloco enquanto a condição for verdadeira', ex: 'enquanto n > 0:\n  mostre n' },
    'repita': { cat: 'Comando', desc: 'Repete o bloco um número fixo de vezes', ex: 'repita(3):\n  mostre "oi"' },
    'para': { cat: 'Comando', desc: 'Percorre itens de uma coleção (para cada / para x em)', ex: 'para n em intervalo(1,5):\n  mostre n' },
    'cada': { cat: 'Comando', desc: 'Parte de "para cada" — percorre uma coleção' },
    'em': { cat: 'Comando', desc: 'Parte de "para x em" — indica a coleção a percorrer' },
    'pare': { cat: 'Comando', desc: 'Interrompe imediatamente o laço atual' },
    'continue': { cat: 'Comando', desc: 'Pula para a próxima iteração do laço' },
    'vá': { cat: 'Comando', desc: 'Salta a execução para um rótulo (vá para :nome)', ex: 'vá para início' },
    'escolha': { cat: 'Comando', desc: 'Compara o valor com cada caso (estilo switch)', ex: 'escolha nota:\n  caso 10: mostre "perfeito"' },
    'caso': { cat: 'Comando', desc: 'Opção dentro de um bloco escolha' },
    'padrao': { cat: 'Comando', desc: 'Caso padrão quando nenhum caso coincide' },
    'selecionar': { cat: 'Comando', desc: 'Abre uma janela com menu de opções executáveis pelo teclado' },
    'definir': { cat: 'Comando', desc: 'Define uma nova função', ex: 'definir função dobro(n):\n  retorne n * 2' },
    'função': { cat: 'Comando', desc: 'Parte de "definir função" — declara uma função' },
    'retorne': { cat: 'Comando', desc: 'Retorna um ou mais valores de uma função', ex: 'retorne n * n' },
    'retornar': { cat: 'Comando', desc: 'Sinônimo de retorne' },
    'constante': { cat: 'Comando', desc: 'Define um valor imutável', ex: 'constante PI = 3.14' },
    'tipo': { cat: 'Função', desc: 'Retorna o tipo do valor: número, texto, lista ou booleano', ex: 'tipo(42) → número' },
    'variáveis': { cat: 'Função', desc: 'Mostra todas as variáveis definidas e seus valores' },
    'e': { cat: 'Operador', desc: 'E lógico — verdadeiro se ambas as condições forem verdadeiras' },
    'ou': { cat: 'Operador', desc: 'Ou lógico — verdadeiro se pelo menos uma condição for verdadeira' },
    'não': { cat: 'Operador', desc: 'Negação lógica — inverte o valor booleano' },
    'existe': { cat: 'Operador', desc: 'Verifica se um valor existe em texto ou lista', ex: 'existe "ba" em "banana"' },
    'verdadeiro': { cat: 'Valor', desc: 'Valor booleano verdadeiro' },
    'falso': { cat: 'Valor', desc: 'Valor booleano falso' },
    'absoluto': { cat: 'Função', desc: 'Valor absoluto (parte inteira) de um número', ex: 'absoluto(-5) → 5' },
    'abs': { cat: 'Função', desc: 'Sinônimo de absoluto' },
    'raizq': { cat: 'Função', desc: 'Raiz quadrada de um número', ex: 'raizq(9) → 3' },
    'raizc': { cat: 'Função', desc: 'Raiz cúbica de um número', ex: 'raizc(8) → 2' },
    'log': { cat: 'Função', desc: 'Logaritmo na base informada', ex: 'log(100, 10) → 2' },
    'logn': { cat: 'Função', desc: 'Logaritmo natural', ex: 'logn(1) → 0' },
    'ln': { cat: 'Função', desc: 'Logaritmo natural (sinônimo de logn)' },
    'pi': { cat: 'Função', desc: 'Valor de pi — pi() para 2 casas, pi(n) para n casas', ex: 'pi() → 3.14' },
    'sen': { cat: 'Função', desc: 'Seno de um ângulo em radianos', ex: 'sen(0) → 0' },
    'cos': { cat: 'Função', desc: 'Cosseno de um ângulo em radianos', ex: 'cos(0) → 1' },
    'tan': { cat: 'Função', desc: 'Tangente de um ângulo em radianos', ex: 'tan(0) → 0' },
    'arcosen': { cat: 'Função', desc: 'Arco-seno (seno inverso)' },
    'arcocos': { cat: 'Função', desc: 'Arco-cosseno (cosseno inverso)' },
    'arcotan': { cat: 'Função', desc: 'Arco-tangente (tangente inversa)' },
    'fatorial': { cat: 'Função', desc: 'Fatorial de um número inteiro não negativo (n! também funciona)', ex: 'fatorial(5) → 120' },
    'primo': { cat: 'Função', desc: 'Verifica se o número é primo', ex: 'primo(7) → verdadeiro' },
    'par': { cat: 'Função', desc: 'Verifica se o número é par', ex: 'par(4) → verdadeiro' },
    'ímpar': { cat: 'Função', desc: 'Verifica se o número é ímpar', ex: 'ímpar(3) → verdadeiro' },
    'impar': { cat: 'Função', desc: 'Sinônimo de ímpar (sem acento)' },
    'arredondar': { cat: 'Função', desc: 'Arredonda com um número de casas decimais', ex: 'arredondar(3.456, 2) → 3.46' },
    'arred': { cat: 'Função', desc: 'Sinônimo de arredondar' },
    'inteiro': { cat: 'Função', desc: 'Parte inteira do número', ex: 'inteiro(9.99) → 9' },
    'decimal': { cat: 'Função', desc: 'Parte decimal do número', ex: 'decimal(9.75) → 0.75' },
    'fração': { cat: 'Função', desc: 'Converte decimal em fração', ex: 'fração(0.5) → 1/2' },
    'mmc': { cat: 'Função', desc: 'Mínimo múltiplo comum de dois ou mais números', ex: 'mmc(2, 4, 8) → 8' },
    'mdc': { cat: 'Função', desc: 'Máximo divisor comum de dois ou mais números', ex: 'mdc(12, 18) → 6' },
    'divisores': { cat: 'Função', desc: 'Lista de todos os divisores de um número', ex: 'divisores(12) → 1,2,3,4,6,12' },
    'fatores': { cat: 'Função', desc: 'Fatores primos de um número', ex: 'fatores(42) → 2,3,7' },
    'média': { cat: 'Função', desc: 'Média aritmética de uma lista numérica', ex: 'média([10,20,30]) → 20' },
    'media': { cat: 'Função', desc: 'Sinônimo de média (sem acento)' },
    'mediana': { cat: 'Função', desc: 'Valor central de uma lista ordenada', ex: 'mediana([3,1,4,1,5]) → 3' },
    'moda': { cat: 'Função', desc: 'Valor que mais aparece na lista', ex: 'moda([1,2,2,3]) → 2' },
    'variância': { cat: 'Função', desc: 'Variância estatística de uma lista', ex: 'variância([2,4,4,5,5,7,9]) → 4' },
    'variancia': { cat: 'Função', desc: 'Sinônimo de variância (sem acento)' },
    'desvioPadrao': { cat: 'Função', desc: 'Desvio padrão de uma lista numérica', ex: 'desvioPadrao([2,4,4,5,5,7,9]) → 2' },
    'desvioPadrão': { cat: 'Função', desc: 'Sinônimo de desvioPadrao (com acento)' },
    'produto': { cat: 'Função', desc: 'Produto de todos os elementos da lista', ex: 'produto([2,3,4]) → 24' },
    'aleatório': { cat: 'Função', desc: 'Número aleatório inteiro entre min e max', ex: 'aleatório(1, 6)' },
    'dado': { cat: 'Função', desc: 'Retorna um número aleatório de 1 a 6 (simula um dado)' },
    'moeda': { cat: 'Função', desc: 'Retorna "cara" ou "coroa" aleatoriamente' },
    'intervalo': { cat: 'Função', desc: 'Cria um intervalo numérico do início até o fim (inclusive)', ex: 'intervalo(1, 5) → 1,2,3,4,5' },
    'paraLista': { cat: 'Função', desc: 'Converte valor em lista' },
    'paraTexto': { cat: 'Função', desc: 'Converte valor em texto', ex: 'paraTexto(42) → "42"' },
    'paraNúmero': { cat: 'Função', desc: 'Converte valor em número' },
    'comprimento': { cat: 'Função', desc: 'Comprimento de uma string ou lista', ex: 'comprimento("hello") → 5' },
    'filtrar': { cat: 'Função', desc: 'Filtra lista por condição' },
    'mapear': { cat: 'Função', desc: 'Aplica uma expressão a cada elemento', ex: 'mapear([1,2,3], "x*2") → 2,4,6' },
    'maiúsculo': { cat: 'Função', desc: 'Converte para maiúsculas', ex: 'maiúsculo("ola") → "OLA"' },
    'minúsculo': { cat: 'Função', desc: 'Converte para minúsculas', ex: 'minúsculo("OLA") → "ola"' },
    'aparar': { cat: 'Função', desc: 'Remove espaços do início e fim', ex: 'aparar("  oi  ") → "oi"' },
    'substitua': { cat: 'Função', desc: 'Substitui texto por outro' },
    'divida': { cat: 'Função', desc: 'Divide texto em lista', ex: 'divida("a,b,c", ",") → a,b,c' },
    'junte': { cat: 'Função', desc: 'Junta lista em texto', ex: 'junte([1,2], "-") → "1-2"' },
    'contém': { cat: 'Função', desc: 'Verifica se contém o valor', ex: 'contém("banana", "nan") → verdadeiro' },
    'posição': { cat: 'Função', desc: 'Posição da primeira ocorrência', ex: 'posição("hello", "ll") → 2' },
    'insira': { cat: 'Função', desc: 'Insere valor em texto ou lista na posição' },
    'remova': { cat: 'Função', desc: 'Remove caractere/elemento na posição' },
    'posiçãoEm': { cat: 'Função', desc: 'Posição de um elemento na lista', ex: 'posiçãoEm([10,20,30], 20) → 1' },
    'extrair': { cat: 'Função', desc: 'Extrai texto por padrão regex' },
    'ano': { cat: 'Função', desc: 'Ano atual (ex.: 2026)' },
    'mês': { cat: 'Função', desc: 'Mês atual (1–12)' },
    'dia': { cat: 'Função', desc: 'Dia atual (1–31)' },
    'hora': { cat: 'Função', desc: 'Hora atual (0–23)' },
    'data': { cat: 'Função', desc: 'Data atual no formato dd/MM/yyyy' },
    'agora': { cat: 'Função', desc: 'Data e hora atuais' },
    'tempo': { cat: 'Função', desc: 'Diferença em dias entre duas datas', ex: 'tempo("01/01/2023", "01/02/2023") → 31' },
    'adicionarDias': { cat: 'Função', desc: 'Adiciona dias a uma data' },
    'diaSemana': { cat: 'Função', desc: 'Dia da semana de uma data', ex: 'diaSemana("25/12/2023") → segunda' },
    'bipe': { cat: 'Função', desc: 'Emite um sinal sonoro por s segundos', ex: 'bipe(0.5)' },
    'som': { cat: 'Função', desc: 'Emite um som com frequência em Hz', ex: 'som(440, 1)' },
    'toca': { cat: 'Função', desc: 'Toca notas musicais (C, D, E...)', ex: 'toca("C", "D", "E", 0.3)' },
    'pausa': { cat: 'Comando', desc: 'Pausa a execução por s segundos', ex: 'pausa(2)' },
    'regressiva': { cat: 'Comando', desc: 'Contagem regressiva sem parar o programa' },
    'janela': { cat: 'Função', desc: 'Abre janela gráfica com x×y pixels', ex: 'janela(500, 300, azul)' },
    'ponto': { cat: 'Função', desc: 'Desenha um ponto na janela' },
    'linha': { cat: 'Função', desc: 'Traça uma linha entre dois pontos' },
    'círculo': { cat: 'Função', desc: 'Desenha um círculo na janela' },
    'retângulo': { cat: 'Função', desc: 'Desenha um retângulo na janela' },
    'texto': { cat: 'Função', desc: 'Escreve texto na janela gráfica' },
    'pegar': { cat: 'Função', desc: 'Copia uma região da janela' },
    'colocar': { cat: 'Função', desc: 'Cola região copiada na janela' },
    'limparJanela': { cat: 'Comando', desc: 'Limpa toda a janela gráfica' },
    'corFundo': { cat: 'Função', desc: 'Altera a cor de fundo da janela' },
    'salvar': { cat: 'Função', desc: 'Salva variáveis em arquivo de texto' },
    'carregar': { cat: 'Função', desc: 'Lê variáveis de arquivo de texto' },
    'ordenada': { cat: 'Propriedade', desc: 'Retorna a lista em ordem crescente', ex: 'lista.ordenada' },
    'invertida': { cat: 'Propriedade', desc: 'Retorna a lista invertida', ex: 'lista.invertida' },
    'contar': { cat: 'Propriedade', desc: 'Conta os itens da lista ou caracteres do texto', ex: 'lista.contar' },
    'tamanho': { cat: 'Propriedade', desc: 'Quantidade de itens/caracteres', ex: '"hello".tamanho → 5' },
    'primeiro': { cat: 'Propriedade', desc: 'Primeiro item da lista ou caractere', ex: 'lista.primeiro' },
    'último': { cat: 'Propriedade', desc: 'Último item da lista ou caractere', ex: 'lista.último' },
    'soma': { cat: 'Propriedade', desc: 'Soma de todos os elementos numéricos', ex: 'lista.soma' },
    'mínimo': { cat: 'Propriedade', desc: 'Menor valor numérico da lista', ex: 'lista.mínimo' },
    'máximo': { cat: 'Propriedade', desc: 'Maior valor numérico da lista', ex: 'lista.máximo' },
    'embaralhar': { cat: 'Propriedade', desc: 'Embaralha os itens aleatoriamente', ex: 'lista.embaralhar' },
    'distintos': { cat: 'Propriedade', desc: 'Remove itens duplicados', ex: 'lista.distintos' },
    'fatiar': { cat: 'Propriedade', desc: 'Extrai sublista ou substring por índices' },
    'contarItem': { cat: 'Propriedade', desc: 'Conta quantas vezes o valor aparece' },
    'adicionar': { cat: 'Propriedade', desc: 'Adiciona valor ao final da lista', ex: 'lista.adicionar(5)' },
    'remover': { cat: 'Propriedade', desc: 'Remove item na posição informada' },
    'começa': { cat: 'Operador', desc: 'Verifica se o texto começa com o prefixo', ex: '"abc" começa com "a"' },
    'termina': { cat: 'Operador', desc: 'Verifica se o texto termina com o sufixo', ex: '"abc" termina com "c"' },
    'mod': { cat: 'Operador', desc: 'Resto da divisão (alias de \\)' },
    '//': { cat: 'Operador', desc: 'Divisão inteira — parte inteira do quociente', ex: '10 // 3 → 3' },
    '**': { cat: 'Operador', desc: 'Potência — base elevada ao expoente', ex: '2 ** 3 → 8' },
    ':=': { cat: 'Operador', desc: 'Variável preguiçosa — calcula só quando usada' },
    '#': { cat: 'Comentário', desc: 'Comentário de linha — ignorado na execução' }
  };

  function getWordAtPos(text, pos) {
    var start = pos;
    while (start > 0 && /[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]/.test(text[start - 1])) start--;
    var end = pos;
    while (end < text.length && /[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]/.test(text[end])) end++;
    return text.slice(start, end);
  }

  function lookupTooltip(word) {
    if (!word) return null;
    if (TOOLTIPS[word]) return TOOLTIPS[word];
    var lower = word.toLowerCase();
    for (var k in TOOLTIPS) {
      if (k.toLowerCase() === lower) return TOOLTIPS[k];
    }
    return null;
  }

  function showTooltip(info, x, y) {
    var html = '<div class="tt-name">' + info.name;
    if (info.cat) html += ' <span class="tt-cat">' + info.cat + '</span>';
    html += '</div>';
    html += '<div class="tt-desc">' + info.desc + '</div>';
    if (info.ex) html += '<div class="tt-example">' + info.ex + '</div>';
    ttEl.innerHTML = html;
    ttEl.classList.add('visible');
    var tw = ttEl.offsetWidth;
    var th = ttEl.offsetHeight;
    var left = x + 12;
    var top = y - th - 8;
    if (left + tw > window.innerWidth - 8) left = x - tw - 12;
    if (top < 8) top = y + 20;
    if (left < 8) left = 8;
    ttEl.style.left = left + 'px';
    ttEl.style.top = top + 'px';
  }

  function hideTooltip() {
    ttEl.classList.remove('visible');
  }

  var _ttTimer = null;
  var _ttLastWord = '';

  // Obtém a posição do caractere sob o mouse usando caretPositionFromPoint
  function getCaretPosFromPoint(x, y) {
    if (document.caretPositionFromPoint) {
      var cp = document.caretPositionFromPoint(x, y);
      if (cp && cp.offsetNode === editor) return cp.offset;
    }
    if (document.caretRangeFromPoint) {
      var range = document.caretRangeFromPoint(x, y);
      if (range && range.startContainer === editor || range && editor.contains(range.startContainer)) {
        // Converter offset relativo ao container para offset no value
        var textNode = range.startContainer;
        var offset = range.startOffset;
        if (textNode === editor) return offset;
        // Se está dentro de um text node, calcular offset absoluto
        var walk = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT, null, false);
        var total = 0;
        var node;
        while (node = walk.nextNode()) {
          if (node === textNode) return total + offset;
          total += node.textContent.length;
        }
      }
    }
    // Fallback: usar elementFromPoint para encontrar a posição
    var rect = editor.getBoundingClientRect();
    var relX = x - rect.left;
    var relY = y - rect.top;
    // Estimar linha/coluna baseado no tamanho da fonte
    var lineHeight = editorLineHeight || 21;
    var charWidth = (editorFontSize || 14) * 0.6;
    var line = Math.floor(relY / lineHeight);
    var col = Math.floor(relX / charWidth);
    var lines = editor.value.split('\n');
    if (line >= lines.length) line = lines.length - 1;
    if (line < 0) line = 0;
    var pos2 = 0;
    for (var li = 0; li < line; li++) pos2 += lines[li].length + 1;
    pos2 += Math.min(col, lines[line].length);
    return pos2;
  }

  editor.addEventListener('mousemove', function (e) {
    if (acEl && acEl.classList.contains('open')) { hideTooltip(); return; }
    var pos = getCaretPosFromPoint(e.clientX, e.clientY);
    if (pos < 0 || pos > editor.value.length) { hideTooltip(); _ttLastWord = ''; return; }
    var word = getWordAtPos(editor.value, pos);
    var info = lookupTooltip(word);

    if (info && word !== _ttLastWord) {
      _ttLastWord = word;
      clearTimeout(_ttTimer);
      _ttTimer = setTimeout(function () {
        showTooltip({ name: word, cat: info.cat, desc: info.desc, ex: info.ex }, e.clientX, e.clientY);
      }, 200);
    } else if (!info) {
      _ttLastWord = '';
      clearTimeout(_ttTimer);
      hideTooltip();
    } else {
      showTooltip({ name: word, cat: info.cat, desc: info.desc, ex: info.ex }, e.clientX, e.clientY);
    }
  });

  editor.addEventListener('mouseleave', function () {
    clearTimeout(_ttTimer);
    hideTooltip();
    _ttLastWord = '';
  });

  editor.addEventListener('input', function () {
    hideTooltip();
    _ttLastWord = '';
  });

  editor.addEventListener('keydown', function () {
    hideTooltip();
    _ttLastWord = '';
  });

  editor.addEventListener('click', function () {
    hideTooltip();
    _ttLastWord = '';
  });
})();
