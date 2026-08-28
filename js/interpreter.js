"use strict";

// ============================================================
//  NÚCLEO DO INTERPRETADOR WILLPROG
// ============================================================

function evalTokenize(s) {
  var toks = [];
  var i = 0;
  var n = s.length;
  var isIdStart = function (c) { return /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]/.test(c); };
  var isIdPart  = function (c) { return /[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]/.test(c); };
  while (i < n) {
    var c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (c === '"' || c === "'") {
      var q = c, j = i + 1, str = '', closed = false, depth = 0;
      while (j < n) {
        if (s[j] === '\\' && j + 1 < n && (s[j+1] === '"' || s[j+1] === "'" || s[j+1] === '\\' || s[j+1] === 'n')) {
          var e = s[j + 1];
          str += e === 'n' ? '\n' : e;
          j += 2;
        } else if (s[j] === q) {
          if (q === "'" && depth > 0) {
            var jInner = j + 1, strInner = '', closedInner = false;
            while (jInner < n) {
              if (s[jInner] === '\\' && jInner + 1 < n && (s[jInner+1] === '"' || s[jInner+1] === "'" || s[jInner+1] === '\\' || s[jInner+1] === 'n')) {
                var ei = s[jInner + 1];
                strInner += ei === 'n' ? '\n' : ei;
                jInner += 2;
              } else if (s[jInner] === q) { closedInner = true; jInner++; break; }
              else { strInner += s[jInner]; jInner++; }
            }
            if (!closedInner) throw new Error('String não terminada');
            str += strInner;
            j = jInner;
          } else { closed = true; j++; break; }
        }
        else {
          str += s[j];
          if (s[j] === '{') depth++;
          else if (s[j] === '}') depth = depth > 0 ? depth - 1 : 0;
          j++;
        }
      }
      if (!closed) throw new Error('String não terminada');
      toks.push({ type: 'STR', value: str, raw: q === '"' ? s.slice(i + 1, j - 1) : null, interp: q === '"', src: s.slice(i, j) });
      i = j;
      continue;
    }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i+1] || ''))) {
      var j2 = i;
      while (j2 < n && /[0-9]/.test(s[j2])) j2++;
      if (s[j2] === '.' && /[0-9]/.test(s[j2 + 1] || '')) { j2++; while (j2 < n && /[0-9]/.test(s[j2])) j2++; }
      var lit = s.slice(i, j2);
      toks.push({ type: 'NUM', value: parseFloat(lit), float: lit.indexOf('.') >= 0, src: lit });
      i = j2;
      continue;
    }
    if (isIdStart(c)) {
      var j3 = i;
      while (j3 < n && isIdPart(s[j3])) j3++;
      toks.push({ type: 'ID', name: s.slice(i, j3), src: s.slice(i, j3) });
      i = j3;
      continue;
    }
    if (c === '*' && s[i+1] === '*') { toks.push({ type: 'OP', text: '**', src: '**' }); i += 2; continue; }
    if (c === '<' && s[i+1] === '=') { toks.push({ type: 'OP', text: '<=', src: '<=' }); i += 2; continue; }
    if (c === '<' && s[i+1] === '>') { toks.push({ type: 'OP', text: '<>', src: '<>' }); i += 2; continue; }
    if (c === '>' && s[i+1] === '=') { toks.push({ type: 'OP', text: '>=', src: '>=' }); i += 2; continue; }
    if (c === '=' && s[i+1] === '=') { toks.push({ type: 'OP', text: '==', src: '==' }); i += 2; continue; }
    if (c === '!' && s[i+1] === '=') { toks.push({ type: 'OP', text: '!=', src: '!=' }); i += 2; continue; }
    if (c === ':' && s[i+1] === '=') { toks.push({ type: 'OP', text: ':=', src: ':=' }); i += 2; continue; }
    if (c === '/' && s[i+1] === '/') { toks.push({ type: 'OP', text: '//', src: '//' }); i += 2; continue; }
    if (c === '\\') { toks.push({ type: 'OP', text: '\\', src: '\\' }); i++; continue; }
    if ('+-*/()=,[]<>!:.{}%'.indexOf(c) !== -1) { toks.push({ type: 'OP', text: c, src: c }); i++; continue; }
    throw new Error('Caractere inválido: "' + c + '"');
  }
  return toks;
}

var JANELA_COR_NOMES = ['preto', 'branco', 'amarelo', 'vermelho', 'azul', 'verde', 'roxo', 'laranja', 'cinza', 'marrom', 'rosa'];
var JANELA_CORES = {
  preto: '#000000',
  branco: '#ffffff',
  amarelo: '#ffff00',
  vermelho: '#ff0000',
  azul: '#0000ff',
  verde: '#008000',
  roxo: '#800080',
  laranja: '#ffa500',
  cinza: '#808080',
  marrom: '#a52a2a',
  rosa: '#ff69b4'
};
function janelaCor(v, padrao) {
  if (v === undefined) return padrao;
  if (typeof v !== 'string') {
    throw new Error('as cores devem ser preto, branco, amarelo, vermelho, azul, verde, roxo, laranja, cinza, marrom ou rosa');
  }
  var hex = JANELA_CORES[v.toLowerCase()];
  if (!hex) throw new Error('cor desconhecida "' + v + '"');
  return hex;
}
var bipeCtx = null;
function ensureAudioCtx() {
  try {
    if (!bipeCtx) {
      var ACtx = window.AudioContext || window.webkitAudioContext;
      if (ACtx) bipeCtx = new ACtx();
    }
    if (bipeCtx && bipeCtx.state === 'suspended' && bipeCtx.resume) bipeCtx.resume();
  } catch (e) {}
  return bipeCtx;
}
function scheduleToneAt(freq, seconds, t0) {
  var dur = Math.max(0.001, seconds);
  var osc = bipeCtx.createOscillator();
  var gain = bipeCtx.createGain();
  osc.connect(gain);
  gain.connect(bipeCtx.destination);
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, t0);
  gain.gain.linearRampToValueAtTime(0.4, t0 + 0.015);
  gain.gain.setValueAtTime(0.4, Math.max(t0, t0 + dur - 0.015));
  gain.gain.linearRampToValueAtTime(0, t0 + dur);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}
function emitTone(freq, seconds) {
  try {
    if (ensureAudioCtx()) scheduleToneAt(freq, seconds, bipeCtx.currentTime);
  } catch (e) {
    try {
      if (navigator.vibrate) navigator.vibrate(Math.round(Math.max(0.001, seconds) * 1000));
    } catch (e2) {}
  }
}
function emitBipe(seconds) {
  emitTone(880, seconds);
}
function emitMelody(freqs, secs) {
  try {
    if (ensureAudioCtx()) {
      var t = bipeCtx.currentTime + 0.05;
      for (var i = 0; i < freqs.length; i++) {
        scheduleToneAt(freqs[i], secs, t);
        t += secs;
      }
    }
  } catch (e) {}
}
var NOTE_SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function notaFreq(note) {
  var n = String(note).trim();
  var letter = n.charAt(0).toUpperCase();
  var rest = n.slice(1).toLowerCase();
  var semi = NOTE_SEMI[letter];
  if (semi === undefined) return null;
  if (rest === '#') semi += 1;
  else if (rest === 'b') semi -= 1;
  else if (rest !== '') return null;
  return 440 * Math.pow(2, (60 + semi - 69) / 12);
}
function tocaNota(v) {
  var name = typeof v === 'string' ? v.trim().toUpperCase() : '';
  if (!/^[A-G][#b]?$/.test(name)) {
    throw new Error('toca: nota musical inválida "' + String(v) + '". Use C, D, E, F, G, A, B com sustenido (#) ou bemol (b), ex.: C, C#, Eb');
  }
  return name;
}
// ============================================================
//  PERSISTÊNCIA DE DADOS: salvar / carregar
// ============================================================

function isNwRuntime() {
  return typeof process !== 'undefined' && process.versions && process.versions.nw && typeof require === 'function';
}

function saveStorageKey(dir, name) {
  return 'willprog_save_' + String(dir).trim() + '/' + String(name).trim();
}

function splitTopLevel(src, opts) {
  var parts = [];
  var cur = '';
  var depth = 0;
  var inStr = null;
  var braces = !!(opts && opts.braces);
  var skipEmptyTail = !!(opts && opts.skipEmptyTail);
  for (var i = 0; i < src.length; i++) {
    var c = src[i];
    if (inStr) {
      cur += c;
      if (c === '\\' && i + 1 < src.length) { cur += src[i + 1]; i++; }
      else if (c === inStr) inStr = null;
    } else if (c === '"' || c === "'") {
      inStr = c;
      cur += c;
    } else if (c === '(' || c === '[' || (braces && c === '{')) {
      depth++;
      cur += c;
    } else if (c === ')' || c === ']' || (braces && c === '}')) {
      depth--;
      cur += c;
    } else if (c === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
    } else {
      cur += c;
    }
  }
  if (!skipEmptyTail || cur !== '' || parts.length > 0) parts.push(cur);
  return parts;
}
function splitTopLevelArgs(src) { return splitTopLevel(src, null); }
function splitSaveValueTopLevel(s) { return splitTopLevel(s, { braces: true, skipEmptyTail: true }); }

function serializeValueForSave(v) {
  if (typeof v === 'string') {
    var esc = v.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
    return '"' + esc + '"';
  }
  if (v && typeof v === 'object' && v.wpn) return formatNumber(v.v, v.f);
  if (typeof v === 'number') return formatNumber(v, false);
  if (typeof v === 'boolean') return v ? 'verdadeiro' : 'falso';
  if (Array.isArray(v)) return '[' + v.map(serializeValueForSave).join(',') + ']';
  if (v && typeof v === 'object' && v.wpFunc) throw new Error('salvar: não é possível salvar uma função');
  if (v === undefined || v === null) return '""';
  return '"' + String(v).replace(/"/g, '\\"') + '"';
}



function deserializeSaveValue(text) {
  var t = text.trim();
  if (t === '') return '';
  var q = t.charAt(0);
  if (q === '"' || q === "'") {
    var out = '';
    var i = 1;
    while (i < t.length) {
      var c = t.charAt(i);
      if (c === '\\' && i + 1 < t.length) {
        var e = t.charAt(i + 1);
        if (e === 'n') out += '\n';
        else if (e === 't') out += '\t';
        else if (e === 'r') out += '\r';
        else out += e;
        i += 2;
        continue;
      }
      if (c === q) break;
      out += c;
      i++;
    }
    return out;
  }
  if (t === 'verdadeiro') return true;
  if (t === 'falso') return false;
  if (t.charAt(0) === '[') {
    var closeB = t.lastIndexOf(']');
    if (closeB === -1) return t;
    var parts = splitSaveValueTopLevel(t.slice(1, closeB));
    var list = [];
    for (var j = 0; j < parts.length; j++) {
      var p = parts[j].trim();
      if (p !== '') list.push(deserializeSaveValue(p));
    }
    return list;
  }
  var num = Number(t);
  if (t !== '' && !isNaN(num)) return mkNum(num, t.indexOf('.') >= 0);
  return t;
}

function parseSaveFile(content) {
  var entries = [];
  var lines = content.split(/\r?\n/);
  for (var li = 0; li < lines.length; li++) {
    var line = lines[li].trim();
    if (!line) continue;
    var eq = -1;
    var inStr = null;
    for (var k = 0; k < line.length; k++) {
      var c = line[k];
      if (inStr) {
        if (c === '\\') k++;
        else if (c === inStr) inStr = null;
      } else if (c === '"' || c === "'") {
        inStr = c;
      } else if (c === '=') {
        eq = k;
        break;
      }
    }
    if (eq <= 0) continue;
    var key = line.slice(0, eq).trim();
    var val = line.slice(eq + 1).trim();
    if (!key) continue;
    entries.push({ key: key, value: val });
  }
  return entries;
}

function writeSaveFile(dir, name, content) {
  if (isNwRuntime()) {
    var fs = require('fs');
    var path = require('path');
    var p = path.join(dir, name);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, content, 'utf8');
    return 'Arquivo salvo em "' + p + '"';
  }
  var key = saveStorageKey(dir, name);
  try {
    localStorage.setItem(key, content);
  } catch (e) {
    throw new Error('salvar: não foi possível gravar "' + key + '": ' + e.message);
  }
  return 'Arquivo "' + key + '" salvo (armazenamento local do navegador)';
}

function readSaveFile(dir, name) {
  if (isNwRuntime()) {
    var fs = require('fs');
    var path = require('path');
    var p = path.join(dir, name);
    try {
      return fs.readFileSync(p, 'utf8');
    } catch (e) {
      throw new Error('carregar: arquivo não encontrado: "' + p + '"');
    }
  }
  var key = saveStorageKey(dir, name);
  var val = null;
  try { val = localStorage.getItem(key); } catch (e) {}
  if (val === null) throw new Error('carregar: arquivo não encontrado: "' + key + '"');
  return val;
}

function execSalvar(src, env) {
  var args = splitTopLevelArgs(src);
  if (args.length < 3) {
    throw new Error('salvar espera ao menos 3 argumentos: salvar(diretório, arquivo, valor1, valor2, ...)');
  }
  var dirRaw = args[0].trim();
  var fileRaw = args[1].trim();
  if (!dirRaw || !fileRaw) throw new Error('salvar: informe o diretório e o nome do arquivo');
  var dirVal = String(formatValue(parse(dirRaw, env)));
  var fileVal = String(formatValue(parse(fileRaw, env)));
  if (!fileVal) throw new Error('salvar: o nome do arquivo não pode ser vazio');
  var entries = [];
  for (var i = 2; i < args.length; i++) {
    var raw = args[i].trim();
    var idm = raw.match(/^[A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*$/);
    var key;
    var val;
    if (idm && raw in env) {
      key = raw;
      var st = env[raw];
      if (st && st.wpLazy) val = lazyEval(st, env);
      else val = st;
    } else {
      key = '_' + (i - 1);
      val = parse(raw, env);
    }
    entries.push({ key: key, value: val });
  }
  var lines = entries.map(function (e) {
    return e.key + '=' + serializeValueForSave(e.value);
  }).join('\n');
  return writeSaveFile(dirVal, fileVal, lines);
}

function getGlobalEnv(env) {
  return GLOBAL_ENV || env;
}

function execCarregar(src, env) {
  var args = splitTopLevelArgs(src);
  if (args.length < 3) {
    throw new Error('carregar espera ao menos 3 argumentos: carregar(diretório, arquivo, variável1, variável2, ...)');
  }
  var dirRaw = args[0].trim();
  var fileRaw = args[1].trim();
  var dirVal = String(formatValue(parse(dirRaw, env)));
  var fileVal = String(formatValue(parse(fileRaw, env)));
  if (!fileVal) throw new Error('carregar: o nome do arquivo não pode ser vazio');
  var content = readSaveFile(dirVal, fileVal);
  var entries = parseSaveFile(content);
  if (entries.length === 0) throw new Error('carregar: o arquivo "' + fileVal + '" está vazio ou não tem dados válidos');
  var targets = [];
  for (var i = 2; i < args.length; i++) {
    var raw = args[i].trim();
    var idm = raw.match(/^[A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*$/);
    if (!idm) throw new Error('carregar: o argumento "' + raw + '" deve ser o nome de uma variável');
    targets.push(idm[0]);
  }
  var used = {};
  var assigned = 0;
  for (var t = 0; t < targets.length; t++) {
    var name = targets[t];
    var idx = -1;
    for (var ei = 0; ei < entries.length; ei++) {
      if (!used[ei] && entries[ei].key === name) { idx = ei; break; }
    }
    if (idx === -1) {
      for (var ei2 = 0; ei2 < entries.length; ei2++) {
        if (!used[ei2]) { idx = ei2; break; }
      }
    }
    if (idx === -1) {
      throw new Error('carregar: o arquivo "' + fileVal + '" não tem valores suficientes para preencher ' + targets.length + ' variável(is)');
    }
    used[idx] = true;
    getGlobalEnv(env)[name] = deserializeSaveValue(entries[idx].value);
    assigned++;
  }
  return 'Carregado "' + fileVal + '": ' + assigned + ' valor(es) atribuído(s)';
}

function execFiltrar(src, env){
  var rawParts = splitTopLevel(src, null);
  if (rawParts.length < 2) throw new Error('filtrar espera ao menos 2 argumentos: filtrar(coleção, condição)');
  var predRaw = rawParts[rawParts.length-1].trim();
  var colPartsRaw = rawParts.slice(0, -1);
  var values = [];
  if (colPartsRaw.length === 1){
    var singleRaw = colPartsRaw[0].trim();
    var singleVal = parse(singleRaw, env);
    if (Array.isArray(singleVal)){
      values = singleVal;
    } else if (typeof singleVal === 'string' && singleVal.indexOf(',') !== -1){
      var sp = singleVal.split(',');
      for (var si=0; si<sp.length; si++){
        var tr = sp[si].trim();
        if (tr === '') continue;
        var num = Number(tr);
        if (tr !== '' && !isNaN(num) && /^[-+]?\d*\.?\d+$/.test(tr)) values.push(mkNum(num, tr.indexOf('.')>=0));
        else values.push(tr);
      }
    } else {
      values = [singleVal];
    }
  } else {
    for (var pi=0; pi<colPartsRaw.length; pi++){
      var vv = parse(colPartsRaw[pi].trim(), env);
      values.push(vv);
    }
  }
  var varName = null;
  try {
    var ptoks = evalTokenize(predRaw);
    for (var ti=0; ti<ptoks.length; ti++){
      var tt = ptoks[ti];
      if (tt.type==='ID'){
        var low = tt.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c');
        if (low==='e' || low==='ou' || low==='nao' || low==='não' || low==='existe' || low==='em' || low==='comeca' || low==='termina' || low==='com' || low==='contem' || low==='contem' || low==='verdadeiro' || low==='falso' || low==='true' || low==='false') continue;
        var nxt = ptoks[ti+1];
        if (nxt && nxt.type==='OP' && nxt.text==='(') continue;
        varName = tt.name;
        break;
      }
    }
  } catch(e){ varName = null; }
  if (!varName){
    var m = predRaw.match(/^\s*([A-Za-z_\u00C0-\u00FF][A-Za-z0-9_\u00C0-\u00FF]*)/);
    if (m) varName = m[1];
  }
  if (!varName) throw new Error('filtrar: não foi possível identificar a variável da condição "'+predRaw+'"');
  var res = [];
  for (var vi=0; vi<values.length; vi++){
    var elem = values[vi];
    var tmpEnv = Object.create(env);
    tmpEnv[varName] = elem;
    var condVal;
    try { condVal = parse(predRaw, tmpEnv); } catch(e){ condVal = false; }
    if (numVal(condVal)) res.push(elem);
  }
  return res;
}
function pad2(n) { return (n < 10 ? '0' : '') + n; }

function formatDataAtual() {
  var d = new Date();
  return pad2(d.getDate()) + '/' + pad2(d.getMonth() + 1) + '/' + d.getFullYear();
}

function formatHoraAtual() {
  var d = new Date();
  return pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
}

function parseDataBrasil(txt) {
  if (typeof txt !== 'string') throw new Error('tempo: as datas devem ser textos no formato dd/MM/yyyy');
  var m = txt.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) throw new Error('tempo: data inválida "' + txt + '" (use o formato dd/MM/yyyy)');
  var d = parseInt(m[1], 10);
  var mo = parseInt(m[2], 10);
  var y = parseInt(m[3], 10);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) throw new Error('tempo: data inválida "' + txt + '"');
  var dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) {
    throw new Error('tempo: data inválida "' + txt + '"');
  }
  return { y: y, m: mo, d: d };
}

function diffDatas(a, b) {
  var d1 = parseDataBrasil(a);
  var d2 = parseDataBrasil(b);
  function cmp(x, y2) {
    if (x.y !== y2.y) return x.y - y2.y;
    if (x.m !== y2.m) return x.m - y2.m;
    return x.d - y2.d;
  }
  if (cmp(d1, d2) > 0) { var t = d1; d1 = d2; d2 = t; }
  var anos = d2.y - d1.y;
  var meses = d2.m - d1.m;
  var dias = d2.d - d1.d;
  if (dias < 0) {
    meses--;
    dias += new Date(d2.y, d2.m - 1, 0).getDate();
  }
  if (meses < 0) {
    meses += 12;
    anos--;
  }
  var parts = [];
  if (anos === 1) parts.push('1 ano');
  else if (anos > 1) parts.push(anos + ' anos');
  if (meses === 1) parts.push('1 mês');
  else if (meses > 1) parts.push(meses + ' meses');
  if (dias === 1) parts.push('1 dia');
  else if (dias > 1) parts.push(dias + ' dias');
  if (parts.length === 0) return '0 dias';
  if (parts.length === 1) return parts[0];
  return parts.slice(0, -1).join(', ') + ' e ' + parts[parts.length - 1];
}

function callFunction(name, args, rawName) {
  function nv(i) { return numVal(args[i]); }
  function elwise(arg, fn) {
    if (Array.isArray(arg)) return arg.map(function (e) { return elwise(e, fn); });
    return fn(numVal(arg));
  }
  if (name === 'intervalo') {
    if (args.length < 2 || args.length > 3) throw new Error('intervalo espera 2 ou 3 argumentos: intervalo(início, fim[, passo])');
    return buildRange(args);
  }
  if (name === 'captureTecla') {
    if (args.length !== 0) throw new Error('captureTecla não espera argumentos');
    return waitKeyLast;
  }
  if (name === 'comprimento') {
    if (args.length !== 1) throw new Error('comprimento espera 1 argumento');
    var cv = args[0];
    if (typeof cv === 'string') return mkNum(cv.length, false);
    if (typeof cv === 'number') return mkNum(String(Math.abs(cv)).replace(/[^0-9]/g, '').length, false);
    if (cv && typeof cv === 'object' && cv.wpn) return mkNum(String(Math.abs(cv.v)).replace(/[^0-9]/g, '').length, false);
    if (Array.isArray(cv)) return mkNum(cv.length, false);
    throw new Error('comprimento: não é possível calcular o comprimento deste valor');
  }
  if (name === 'selecionar') {
    if (args.length !== 3) throw new Error('selecionar espera 3 argumentos: selecionar(valor, início, fim)');
    var sv = args[0];
    var sIni = Math.round(numVal(args[1]));
    var sFim = Math.round(numVal(args[2]));
    if (!isFinite(sIni) || !isFinite(sFim) || sIni < 0 || sFim < sIni) {
      throw new Error('selecionar: os índices devem ser números inteiros e válidos (início >= 0 e fim >= início)');
    }
    if (typeof sv === 'string') {
      if (sFim >= sv.length) throw new Error('selecionar: o índice final está além do tamanho do texto');
      return sv.substring(sIni, sFim + 1);
    }
    if (typeof sv === 'number') {
      var sNumStr = String(Math.abs(sv)).replace(/[^0-9]/g, '');
      if (sFim >= sNumStr.length) throw new Error('selecionar: o índice final está além dos algarismos do número');
      return sNumStr.substring(sIni, sFim + 1);
    }
    if (sv && typeof sv === 'object' && sv.wpn) {
      var sNumStr2 = String(Math.abs(sv.v)).replace(/[^0-9]/g, '');
      if (sFim >= sNumStr2.length) throw new Error('selecionar: o índice final está além dos algarismos do número');
      return sNumStr2.substring(sIni, sFim + 1);
    }
    if (Array.isArray(sv)) {
      if (sFim >= sv.length) throw new Error('selecionar: o índice final está além do tamanho da lista');
      return sv.slice(sIni, sFim + 1);
    }
    throw new Error('selecionar: não é possível selecionar parte deste valor');
  }
  if (name === 'absoluto' || name === 'abs') {
    if (args.length !== 1) throw new Error('absoluto espera 1 argumento');
    return elwise(args[0], function (v) {
      if (typeof v !== 'number' || !isFinite(v)) throw new Error('absoluto espera um número');
      return mkNum(Math.floor(Math.abs(v)), false);
    });
  }
  if (name === 'fatorial') {
    if (args.length !== 1) throw new Error('fatorial espera 1 argumento');
    return elwise(args[0], function (v) {
      if (typeof v !== 'number' || !isFinite(v) || v < 0 || Math.floor(v) !== v) {
        throw new Error('fatorial espera um número inteiro não negativo');
      }
      if (v > 170) throw new Error('fatorial: número muito grande');
      var r = 1;
      for (var i = 2; i <= v; i++) r *= i;
      return mkNum(r, false);
    });
  }
  if (name === 'primo') {
    if (args.length !== 1) throw new Error('primo espera 1 argumento');
    return elwise(args[0], function (v) {
      if (typeof v !== 'number' || !isFinite(v) || Math.floor(v) !== v) return false;
      if (v < 2) return false;
      if (v === 2) return true;
      if (v % 2 === 0) return false;
      var r = Math.sqrt(v);
      for (var i = 3; i <= r; i += 2) if (v % i === 0) return false;
      return true;
    });
  }
  if (name === 'par') {
    if (args.length !== 1) throw new Error('par espera 1 argumento');
    return elwise(args[0], function (v) {
      if (typeof v !== 'number' || !isFinite(v)) throw new Error('par espera um número');
      return v % 2 === 0;
    });
  }
  if (name === 'ímpar' || name === 'impar') {
    if (args.length !== 1) throw new Error('ímpar espera 1 argumento');
    return elwise(args[0], function (v) {
      if (typeof v !== 'number' || !isFinite(v)) throw new Error('ímpar espera um número');
      return v % 2 !== 0;
    });
  }
  if (name === 'variáveis') {
    if (args.length !== 0) throw new Error(name + ' não espera argumentos');
    var genv = getGlobalEnv() || {};
    var vnames = Object.keys(genv).sort();
    var vlines = ['Variáveis (' + vnames.length + '):'];
    for (var vi = 0; vi < vnames.length; vi++) {
      var vn2 = vnames[vi];
      var vs2 = genv[vn2];
      if (vs2 && vs2.wpFunc) {
        vlines.push(vn2 + ' = função(' + (vs2.params || []).join(', ') + ')');
      } else if (vs2 && vs2.wpLazy) {
        try {
          vlines.push(vn2 + ' = ' + formatValue(lazyEval(vs2, genv)));
        } catch (e) {
          vlines.push(vn2 + ' = <expressão adiada: ' + vs2.expr + '>');
        }
      } else if (vs2 === undefined || vs2 === null) {
        vlines.push(vn2 + ' = vazio');
      } else if (isIndexedVar(vs2)) {
        vlines.push(vn2 + ' = ' + formatIndexedVar(vs2));
      } else {
        vlines.push(vn2 + ' = ' + formatValue(vs2));
      }
    }
    return vlines.join('\n');
  }
  if (name === 'raizq') {
    if (args.length !== 1) throw new Error('raizq espera 1 argumento');
    return elwise(args[0], function (v) {
      var r = Math.sqrt(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'raizc') {
    if (args.length !== 1) throw new Error('raizc espera 1 argumento');
    return elwise(args[0], function (v) {
      var r = Math.cbrt(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'log') {
    if (args.length !== 2) throw new Error('log espera 2 argumentos: log(x, base)');
    var lbase = numVal(args[1]);
    return elwise(args[0], function (v) {
      var r = Math.log(v) / Math.log(lbase);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'logn' || name === 'ln') {
    if (args.length !== 1) throw new Error(name + ' espera 1 argumento');
    return elwise(args[0], function (v) {
      var r = Math.log(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'arredondar' || name === 'arred') {
    if (args.length !== 2) throw new Error(name + ' espera 2 argumentos: ' + name + '(x, casas decimais)');
    var nd = numVal(args[1]);
    if (typeof nd !== 'number' || !isFinite(nd) || Math.floor(nd) !== nd || nd < 0) {
      throw new Error(name + ': a quantidade de casas deve ser um número inteiro não negativo');
    }
    if (nd > 15) throw new Error(name + ': no máximo 15 casas decimais');
    return elwise(args[0], function (v) {
      var r = Number(v.toFixed(nd));
      return mkNum(r, true);
    });
  }
  if (name === 'pi') {
    if (args.length === 0) return mkNum(Number(Math.PI.toFixed(2)), false);
    if (args.length === 1) {
      var piD = Math.floor(nv(0));
      if (typeof piD !== 'number' || !isFinite(piD) || piD < 0 || piD > 100) throw new Error('pi: casas decimais deve ser entre 0 e 100');
      if (piD === 0) return mkNum(Math.PI, true);
      if (typeof BigInt === 'undefined') throw new Error('pi: BigInt não suportado neste ambiente');
      var piScale = BigInt(10) ** BigInt(piD + 20);
      function arctanInv(ax) {
        var axB = BigInt(ax);
        var axSq = axB * axB;
        var piTerm = piScale / axB;
        var piSum = piTerm;
        var piN = 1;
        while (piTerm !== 0n) {
          piTerm = -piTerm / axSq;
          piSum += piTerm / BigInt(2 * piN + 1);
          piN++;
        }
        return piSum;
      }
      var piVal = (4n * arctanInv(5) - arctanInv(239)) * 4n;
      var piStr = piVal.toString();
      return '3.' + piStr.substring(1, 1 + piD);
    }
    throw new Error('pi espera no máximo 1 argumento');
  }

  if (name === 'cos') {
    if (args.length !== 1) throw new Error('cos espera 1 argumento');
    return elwise(args[0], function (v) {
      var r = Math.cos(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'sen') {
    if (args.length !== 1) throw new Error('sen espera 1 argumento');
    return elwise(args[0], function (v) {
      var r = Math.sin(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'tan') {
    if (args.length !== 1) throw new Error('tan espera 1 argumento');
    return elwise(args[0], function (v) {
      var r = Math.tan(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'arcocos') {
    if (args.length !== 1) throw new Error('arcocos espera 1 argumento');
    return elwise(args[0], function (v) {
      if (v < -1 || v > 1) throw new Error('arcocos espera um número entre -1 e 1');
      var r = Math.acos(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'arcosen') {
    if (args.length !== 1) throw new Error('arcosen espera 1 argumento');
    return elwise(args[0], function (v) {
      if (v < -1 || v > 1) throw new Error('arcosen espera um número entre -1 e 1');
      var r = Math.asin(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  if (name === 'arcotan') {
    if (args.length !== 1) throw new Error('arcotan espera 1 argumento');
    return elwise(args[0], function (v) {
      var r = Math.atan(v);
      return mkNum(r, r % 1 !== 0);
    });
  }
  // ---- helper: GCD (máximo divisor comum entre dois números) ----
  function _gcd2(a, b) {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
    while (b) { var t = b; b = a % b; a = t; }
    return a;
  }
  // ---- helper: LCM (mínimo múltiplo comum entre dois números) ----
  function _lcm2(a, b) {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
    if (a === 0 || b === 0) return 0;
    return (a * b) / _gcd2(a, b);
  }
  // ---- mmc(a, b, ...) — mínimo múltiplo comum ----
  if (name === 'mmc') {
    if (args.length < 2) throw new Error('mmc espera pelo menos 2 argumentos: mmc(a, b, ...)');
    var _mmc = Math.abs(Math.round(numVal(args[0])));
    for (var _mi = 1; _mi < args.length; _mi++) {
      _mmc = _lcm2(_mmc, Math.abs(Math.round(numVal(args[_mi]))));
    }
    return mkNum(_mmc, false);
  }
  // ---- mdc(a, b, ...) — máximo divisor comum ----
  if (name === 'mdc') {
    if (args.length < 2) throw new Error('mdc espera pelo menos 2 argumentos: mdc(a, b, ...)');
    var _mdc = Math.abs(Math.round(numVal(args[0])));
    for (var _gi = 1; _gi < args.length; _gi++) {
      _mdc = _gcd2(_mdc, Math.abs(Math.round(numVal(args[_gi]))));
    }
    return mkNum(_mdc, false);
  }
  // ---- divisores(n) — lista de todos os divisores de n ----
  if (name === 'divisores') {
    if (args.length !== 1) throw new Error('divisores espera 1 argumento: divisores(n)');
    var _dn = Math.abs(Math.round(numVal(args[0])));
    if (_dn === 0) throw new Error('divisores: não existe divisores de 0');
    var _divs = [];
    for (var _di = 1; _di <= _dn; _di++) {
      if (_dn % _di === 0) _divs.push(mkNum(_di, false));
    }
    return _divs;
  }
  // ---- fatores(n) — fatores primos de n ----
  if (name === 'fatores') {
    if (args.length !== 1) throw new Error('fatores espera 1 argumento: fatores(n)');
    var _fn = Math.abs(Math.round(numVal(args[0])));
    if (_fn <= 1) throw new Error('fatores: o número deve ser maior que 1');
    var _facts = [];
    for (var _ffi = 2; _ffi * _ffi <= _fn; _ffi++) {
      while (_fn % _ffi === 0) {
        _facts.push(mkNum(_ffi, false));
        _fn = _fn / _ffi;
      }
    }
    if (_fn > 1) _facts.push(mkNum(_fn, false));
    return _facts;
  }
  // ---- Helper: extrair array numérico de args (lista ou múltiplos args) ----
  function _numArray(a) {
    var arr = [];
    if (Array.isArray(a)) {
      for (var _ai = 0; _ai < a.length; _ai++) arr.push(numVal(a[_ai]));
    } else {
      for (var _aj = 0; _aj < a.length; _aj++) arr.push(numVal(a[_aj]));
    }
    return arr;
  }
  function _validateNums(arr, fname) {
    for (var _vi = 0; _vi < arr.length; _vi++) {
      if (typeof arr[_vi] !== 'number' || !isFinite(arr[_vi])) {
        throw new Error(fname + ': todos os elementos devem ser números');
      }
    }
  }
  // ---- média(lista) — média aritmética ----
  if (name === 'média' || name === 'media') {
    if (args.length !== 1) throw new Error('média espera 1 argumento: média(lista)');
    var _mArr = _numArray(args[0]);
    if (_mArr.length === 0) throw new Error('média: lista vazia');
    _validateNums(_mArr, 'média');
    var _mSum = 0;
    for (var _mi2 = 0; _mi2 < _mArr.length; _mi2++) _mSum += _mArr[_mi2];
    var _mResult = _mSum / _mArr.length;
    return mkNum(_mResult, _mResult % 1 !== 0);
  }
  // ---- mediana(lista) — valor central ----
  if (name === 'mediana') {
    if (args.length !== 1) throw new Error('mediana espera 1 argumento: mediana(lista)');
    var _mdArr = _numArray(args[0]);
    if (_mdArr.length === 0) throw new Error('mediana: lista vazia');
    _validateNums(_mdArr, 'mediana');
    _mdArr.sort(function (a, b) { return a - b; });
    var _mdLen = _mdArr.length;
    var _mdResult;
    if (_mdLen % 2 === 1) {
      _mdResult = _mdArr[Math.floor(_mdLen / 2)];
    } else {
      _mdResult = (_mdArr[_mdLen / 2 - 1] + _mdArr[_mdLen / 2]) / 2;
    }
    return mkNum(_mdResult, _mdResult % 1 !== 0);
  }
  // ---- moda(lista) — valor mais frequente ----
  if (name === 'moda') {
    if (args.length !== 1) throw new Error('moda espera 1 argumento: moda(lista)');
    var _moRaw = args[0];
    var _moList = Array.isArray(_moRaw) ? _moRaw : [_moRaw];
    if (_moList.length === 0) throw new Error('moda: lista vazia');
    var _moFreq = {};
    var _moMaxCount = 0;
    var _moResult = _moList[0];
    for (var _moi = 0; _moi < _moList.length; _moi++) {
      var _moKey = String(formatValue(_moList[_moi]));
      _moFreq[_moKey] = (_moFreq[_moKey] || 0) + 1;
      if (_moFreq[_moKey] > _moMaxCount) {
        _moMaxCount = _moFreq[_moKey];
        _moResult = _moList[_moi];
      }
    }
    return _moResult;
  }
  // ---- variância(lista) ----
  if (name === 'variância' || name === 'variancia') {
    if (args.length !== 1) throw new Error('variância espera 1 argumento: variância(lista)');
    var _vaArr = _numArray(args[0]);
    if (_vaArr.length === 0) throw new Error('variância: lista vazia');
    _validateNums(_vaArr, 'variância');
    var _vaSum = 0;
    for (var _vai = 0; _vai < _vaArr.length; _vai++) _vaSum += _vaArr[_vai];
    var _vaMean = _vaSum / _vaArr.length;
    var _vaSqDiff = 0;
    for (var _vaj = 0; _vaj < _vaArr.length; _vaj++) {
      var _vd = _vaArr[_vaj] - _vaMean;
      _vaSqDiff += _vd * _vd;
    }
    var _vaResult = _vaSqDiff / _vaArr.length;
    return mkNum(_vaResult, _vaResult % 1 !== 0);
  }
  // ---- desvioPadrao(lista) ----
  if (name === 'desvioPadrao' || name === 'desvioPadrão') {
    if (args.length !== 1) throw new Error('desvioPadrao espera 1 argumento: desvioPadrao(lista)');
    var _dpArr = _numArray(args[0]);
    if (_dpArr.length === 0) throw new Error('desvioPadrao: lista vazia');
    _validateNums(_dpArr, 'desvioPadrao');
    var _dpSum = 0;
    for (var _dpi = 0; _dpi < _dpArr.length; _dpi++) _dpSum += _dpArr[_dpi];
    var _dpMean = _dpSum / _dpArr.length;
    var _dpSqDiff = 0;
    for (var _dpj = 0; _dpj < _dpArr.length; _dpj++) {
      var _dpd = _dpArr[_dpj] - _dpMean;
      _dpSqDiff += _dpd * _dpd;
    }
    var _dpResult = Math.sqrt(_dpSqDiff / _dpArr.length);
    return mkNum(_dpResult, _dpResult % 1 !== 0);
  }
  // ---- produto(lista) — produto de todos os elementos ----
  if (name === 'produto') {
    if (args.length !== 1) throw new Error('produto espera 1 argumento: produto(lista)');
    var _prArr = _numArray(args[0]);
    if (_prArr.length === 0) throw new Error('produto: lista vazia');
    _validateNums(_prArr, 'produto');
    var _prResult = 1;
    for (var _pri = 0; _pri < _prArr.length; _pri++) _prResult *= _prArr[_pri];
    return mkNum(_prResult, _prResult % 1 !== 0);
  }
  if (name === 'inteiro') {
    if (args.length !== 1) throw new Error('inteiro espera 1 argumento');
    return mkNum(Math.trunc(numVal(args[0])), false);
  }
  if (name === 'decimal') {
    if (args.length !== 1) throw new Error('decimal espera 1 argumento');
    var x = numVal(args[0]);
    return mkNum(x - Math.trunc(x), numFloat(args[0]));
  }
  if (name === 'fração' || name === 'fracao') {
    if (args.length !== 1) throw new Error('fração espera 1 argumento');
    return (function (arg) {
      function one(x) {
        var v = numVal(x);
        if (typeof v !== 'number' || !isFinite(v)) throw new Error('fração espera um número');
        if (v === 0) return '0/1';
        var sign = v < 0 ? -1 : 1;
        v = Math.abs(v);
        var maxD = 1000000;
        var bestN = 0, bestD = 1, bestErr = Math.abs(v);
        // Farey / continued fraction
        var a0 = Math.floor(v);
        if (Math.abs(v - a0) < 1e-12) return (sign * a0) + '/1';
        var h1 = 1, k1 = 0, h0 = a0, k0 = 1;
        var frac = v - a0;
        for (var i = 0; i < 40; i++) {
          if (Math.abs(frac) < 1e-15) break;
          var inv = 1 / frac;
          var ai = Math.floor(inv + 1e-12);
          var h2 = ai * h0 + h1;
          var k2 = ai * k0 + k1;
          if (k2 > maxD) break;
          h1 = h0; k1 = k0; h0 = h2; k0 = k2;
          frac = inv - ai;
          if (Math.abs(v - h0 / k0) < 1e-12) break;
        }
        var n = h0, d = k0;
        function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = b; b = a % b; a = t; } return a || 1; }
        var g = gcd(n, d);
        n = (n / g) * sign;
        d = d / g;
        return n + '/' + d;
      }
      if (Array.isArray(arg)) return arg.map(function (e) { return one(e); });
      return one(arg);
    })(args[0]);
  }
  if (name === 'aleatório') {
    if (args.length !== 2) throw new Error('aleatório espera 2 argumentos');
    var loV = nv(0);
    var hiV = nv(1);
    if (typeof loV !== 'number' || !isFinite(loV) || typeof hiV !== 'number' || !isFinite(hiV)) {
      throw new Error('aleatório espera números');
    }
    var lo = Math.ceil(loV);
    var hi = Math.floor(hiV);
    if (hi < lo) throw new Error('aleatório: o limite inferior não pode ser maior que o superior');
    return mkNum(lo + Math.floor(Math.random() * (hi - lo + 1)), false);
  }
  if (name === 'dado') {
    if (args.length !== 0) throw new Error('dado não recebe argumentos');
    return mkNum(1 + Math.floor(Math.random() * 6), false);
  }
  if (name === 'moeda') {
    if (args.length !== 0) throw new Error('moeda não recebe argumentos');
    return Math.random() < 0.5 ? 'cara' : 'coroa';
  }
  if (name === 'paraLista') {
    if (args.length !== 1) throw new Error('paraLista espera 1 argumento');
    var pa = args[0];
    if (Array.isArray(pa)) {
      return pa.slice();
    }
    if (typeof pa === 'string') {
      var parts = pa.split(',');
      var result = [];
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i].trim();
        var n = Number(p);
        if (!isNaN(n)) {
          result.push(mkNum(n, p.indexOf('.') >= 0));
        } else {
          result.push(p);
        }
      }
      return result;
    }
    throw new Error('paraLista espera uma lista');
  }
  if (name === 'paraTexto') {
    if (args.length !== 1) throw new Error('paraTexto espera 1 argumento');
    return formatValue(args[0]);
  }
  if (name === 'aparar') {
    if (args.length !== 1) throw new Error('aparar espera 1 argumento: aparar(texto)');
    if (typeof args[0] !== 'string') throw new Error('"aparar" espera um texto');
    return args[0].trim();
  }
  if (name === 'extrair') {
    if (args.length !== 2) throw new Error('extrair espera 2 argumentos: extrair(texto, padrão)');
    var txt = args[0];
    if (typeof txt !== 'string') txt = formatValue(txt);
    var pat = args[1];
    var patStr = '';
    var patHasBrackets = false;
    if (typeof pat === 'string') {
      patStr = pat;
      patHasBrackets = patStr.indexOf('[') !== -1 && patStr.indexOf(']') !== -1;
    } else if (Array.isArray(pat)) {
      if (pat.length===1 && pat[0] && pat[0].wpn && pat[0].v===-9) {
        patStr = '[0-9]';
        patHasBrackets = true;
      } else {
        patStr = '[' + pat.map(function(x){ return formatValue(x); }).join('') + ']';
        patHasBrackets = true;
      }
    } else if (pat && typeof pat === 'object' && pat.wpn) {
      patStr = String(pat.v);
    } else if (typeof pat === 'number') {
      patStr = String(pat);
    } else {
      patStr = formatValue(pat);
      patHasBrackets = String(patStr).indexOf('[')!==-1;
    }
    var regexPat = patStr;
    if (regexPat.indexOf('[')===-1) {
      if (/^[0-9]-[0-9]$/.test(regexPat) || /^[a-z]-[a-z]$/i.test(regexPat) || /^[0-9]$/.test(regexPat) || /^[a-z]$/i.test(regexPat)) {
        regexPat = '[' + regexPat + ']';
      } else if (regexPat.length===1) {
        regexPat = '[' + regexPat + ']';
      }
    }
    var re;
    try { re = new RegExp(regexPat, 'g'); } catch(e){ throw new Error('extrair: padrão inválido "'+patStr+'"'); }
    var matches = txt.match(re);
    if (!matches) {
      var zeros = [];
      for (var zi=0; zi<txt.length; zi++) zeros.push(mkNum(0,false));
      return zeros;
    }
    var res = [];
    for (var mi=0; mi<matches.length; mi++){
      var mm = matches[mi];
      if (!patHasBrackets && /^\d$/.test(mm) && /0-9/.test(patStr)) {
        res.push(mkNum(parseInt(mm,10), false));
      } else {
        res.push(mm);
      }
    }
    return res;
  }
  if (name === 'mapear') {
    if (args.length !== 2) throw new Error('mapear espera 2 argumentos: mapear(coleção, "x*2")');
    var coll = args[0];
    var exprStr = args[1];
    if (typeof exprStr !== 'string') throw new Error('mapear: o segundo argumento deve ser um texto com a expressão, ex: "x*2"');
    var vals = [];
    if (Array.isArray(coll)) vals = coll;
    else if (typeof coll === 'string') {
      if (coll.indexOf(',') !== -1) {
        var parts = coll.split(',');
        for (var pi=0; pi<parts.length; pi++) vals.push(parts[pi].trim());
      } else {
        vals = coll.split('');
      }
    } else {
      throw new Error('mapear: o primeiro argumento deve ser lista ou texto');
    }
    var varName = null;
    try {
      var ptoks = evalTokenize(exprStr);
      for (var ti=0; ti<ptoks.length; ti++){
        var tt = ptoks[ti];
        if (tt.type==='ID'){
          var low = tt.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c');
          if (low==='e' || low==='ou' || low==='nao' || low==='não' || low==='existe' || low==='em' || low==='comeca' || low==='termina' || low==='com' || low==='contem' || low==='verdadeiro' || low==='falso' || low==='true' || low==='false') continue;
          var nxt = ptoks[ti+1];
          if (nxt && nxt.type==='OP' && nxt.text==='(') continue;
          varName = tt.name;
          break;
        }
      }
    } catch(e){}
    if (!varName) throw new Error('mapear: não foi possível identificar variável em "'+exprStr+'"');
    var resM = [];
    for (var vi=0; vi<vals.length; vi++){
      var curEnv = CURRENT_ENV || getGlobalEnv() || {};
      var tmpEnv = Object.create(curEnv);
      tmpEnv[varName] = vals[vi];
      var r;
      try { r = parse(exprStr, tmpEnv); } catch(e){ throw new Error('mapear: erro ao avaliar "'+exprStr+'" com '+varName+'='+formatValue(vals[vi])+': '+e.message); }
      resM.push(r);
    }
    return resM;
  }
  if (name === 'tipo') {
    if (args.length !== 1) throw new Error('tipo espera 1 argumento: tipo(valor)');
    var tv = args[0];
    if (typeof tv === 'string') return "texto";
    if (typeof tv === 'boolean') return "booleano";
    if (Array.isArray(tv)) return "lista";
    if (tv && typeof tv === 'object' && tv.wpn) return "número";
    if (typeof tv === 'number') return "número";
    if (tv && typeof tv === 'object' && tv.wpFunc) return "função";
    if (isIndexedVar(tv)) return "lista";
    return "desconhecido";
  }
  if (name === 'maiúsculo' || name === 'minúsculo') {
    if (args.length !== 1) throw new Error(name + ' espera 1 argumento');
    if (typeof args[0] !== 'string') throw new Error('"' + name + '" espera um texto');
    return name === 'maiúsculo' ? args[0].toUpperCase() : args[0].toLowerCase();
  }
  if (name === 'substitua') {
    if (args.length !== 3) throw new Error('substitua espera 3 argumentos: substitua(texto, busca, troca)');
    for (var sbI = 0; sbI < 3; sbI++) {
      if (typeof args[sbI] !== 'string') throw new Error('"substitua" espera textos como argumentos');
    }
    if (!args[1]) throw new Error('"substitua" espera um texto de busca não vazio');
    return args[0].split(args[1]).join(args[2]);
  }
  if (name === 'divida') {
    if (args.length !== 2) throw new Error('divida espera 2 argumentos: divida(texto, separador)');
    var dvVal = args[0];
    var dvSep = args[1];
    if (typeof dvSep !== 'string') throw new Error('"divida" espera um texto como separador');
    if (typeof dvVal === 'number' || (dvVal && typeof dvVal === 'object' && dvVal.wpn)) {
      var dvStr = String(numVal(dvVal));
      var dvOut = [];
      for (var dvI = 0; dvI < dvStr.length; dvI++) {
        var dvCh = dvStr.charAt(dvI);
        var dvNum = Number(dvCh);
        if (!isNaN(dvNum)) dvOut.push(mkNum(dvNum, dvCh.indexOf('.') >= 0));
        else dvOut.push(dvCh);
      }
      return dvOut;
    }
    if (typeof dvVal !== 'string') throw new Error('"divida" espera um texto ou número');
    if (!dvSep) {
      var dvChars = [];
      for (var dvJ = 0; dvJ < dvVal.length; dvJ++) dvChars.push(dvVal.charAt(dvJ));
      return dvChars;
    }
    return dvVal.split(dvSep);
  }
  if (name === 'junte') {
    if (args.length < 1 || args.length > 2) throw new Error('junte espera 1 ou 2 argumentos: junte(lista, separador)');
    var jtArr = args[0];
    if (!Array.isArray(jtArr)) throw new Error('"junte" espera uma lista');
    var jtSep = '';
    if (args.length === 2) {
      if (typeof args[1] !== 'string') throw new Error('"junte" espera um texto como separador');
      jtSep = args[1];
    }
    var jtOut = '';
    for (var jtI = 0; jtI < jtArr.length; jtI++) {
      if (jtI > 0) jtOut += jtSep;
      jtOut += formatValue(jtArr[jtI]);
    }
    return jtOut;
  }
  if (name === 'contém') {
    if (args.length !== 2) throw new Error('contém espera 2 argumentos: contém(textoOuLista, valor)');
    var ctHay = args[0];
    if (typeof ctHay === 'string') {
      if (typeof args[1] !== 'string') throw new Error('"contém" espera um texto para buscar dentro de um texto');
      return ctHay.indexOf(args[1]) >= 0;
    }
    if (Array.isArray(ctHay)) {
      var ctNeedle = numVal(args[1]);
      for (var ctI = 0; ctI < ctHay.length; ctI++) {
        if (numVal(ctHay[ctI]) == ctNeedle) return true;
      }
      return false;
    }
    throw new Error('"contém" espera um texto ou uma lista como primeiro argumento');
  }
  if (name === 'posição') {
    if (args.length !== 2) throw new Error('posição espera 2 argumentos: posição(textoOuLista, valor)');
    var psHay = args[0];
    var psNeedle = args[1];
    if (Array.isArray(psHay)) {
      var psN = numVal(psNeedle);
      for (var psI = 0; psI < psHay.length; psI++) {
        if (numVal(psHay[psI]) == psN) return mkNum(psI, false);
      }
      return mkNum(-1, false);
    }
    if (typeof psHay === 'string') { }
    else if (typeof psHay === 'number' || (psHay && typeof psHay === 'object' && psHay.wpn)) psHay = String(numVal(psHay));
    else throw new Error('"posição" espera um texto, número ou lista como primeiro argumento');
    if (typeof psNeedle === 'string') { }
    else if (typeof psNeedle === 'number' || (psNeedle && typeof psNeedle === 'object' && psNeedle.wpn)) psNeedle = String(numVal(psNeedle));
    else throw new Error('"posição" espera um texto ou número como valor buscado');
    return mkNum(psHay.indexOf(psNeedle), false);
  }
  if (name === 'insira') {
    if (args.length !== 3) throw new Error('insira espera 3 argumentos: insira(textoOuLista, posição, valor)');
    var inHay = args[0];
    var inPos = numVal(args[1]);
    if (typeof inPos !== 'number' || !isFinite(inPos) || Math.floor(inPos) !== inPos) throw new Error('"insira" espera um número inteiro como posição');
    if (Array.isArray(inHay)) {
      var inPL = Math.min(Math.max(inPos, -1), inHay.length - 1);
      var inArr = inHay.slice();
      inArr.splice(inPL + 1, 0, args[2]);
      return inArr;
    }
    var inIsNum = typeof inHay === 'number' || (inHay && typeof inHay === 'object' && inHay.wpn);
    var inStr = typeof inHay === 'string' ? inHay : (inIsNum ? String(numVal(inHay)) : null);
    if (inStr === null) throw new Error('"insira" espera um texto, número ou lista');
    var inVal = args[2];
    if (typeof inVal !== 'string' && typeof inVal !== 'number' && !(inVal && typeof inVal === 'object' && inVal.wpn)) throw new Error('"insira" espera um texto ou número como valor');
    var inIns = formatValue(inVal);
    var inEff = Math.min(Math.max(inPos, -1), inStr.length - 1);
    var inOut = inStr.slice(0, inEff + 1) + inIns + inStr.slice(inEff + 1);
    if (inIsNum) {
      var inN = Number(inOut);
      return isNaN(inN) ? inOut : mkNum(inN, inOut.indexOf('.') >= 0);
    }
    return inOut;
  }
  if (name === 'remova') {
    if (args.length !== 2) throw new Error('remova espera 2 argumentos: remova(textoOuLista, posição)');
    var rmHay = args[0];
    var rmPos = numVal(args[1]);
    if (typeof rmPos !== 'number' || !isFinite(rmPos) || Math.floor(rmPos) !== rmPos) throw new Error('"remova" espera um número inteiro como posição');
    var rmIsNum = typeof rmHay === 'number' || (rmHay && typeof rmHay === 'object' && rmHay.wpn);
    var rmStr = Array.isArray(rmHay) ? null : (typeof rmHay === 'string' ? rmHay : (rmIsNum ? String(numVal(rmHay)) : null));
    if (rmStr === null && !Array.isArray(rmHay)) throw new Error('"remova" espera um texto, número ou lista');
    if (Array.isArray(rmHay)) {
      if (rmPos < 0 || rmPos >= rmHay.length) throw new Error('"remova" recebeu a posição ' + formatValue(args[1]) + ', mas a lista só tem ' + rmHay.length + (rmHay.length === 1 ? ' elemento' : ' elementos'));
      var rmArr = rmHay.slice();
      rmArr.splice(rmPos, 1);
      return rmArr;
    }
    if (rmPos < 0 || rmPos >= rmStr.length) throw new Error('"remova" recebeu a posição ' + formatValue(args[1]) + ', mas "' + rmStr + '" só tem ' + rmStr.length + (rmStr.length === 1 ? ' caractere' : ' caracteres'));
    var rmOut = rmStr.slice(0, rmPos) + rmStr.slice(rmPos + 1);
    if (rmIsNum) {
      var rmN = Number(rmOut);
      return isNaN(rmN) ? rmOut : mkNum(rmN, rmOut.indexOf('.') >= 0);
    }
    return rmOut;
  }
  if (name === 'posiçãoEm') {
    if (args.length !== 2) throw new Error('posiçãoEm espera 2 argumentos: posiçãoEm(textoOuLista, posição)');
    var peHay = args[0];
    var pePos = numVal(args[1]);
    if (typeof pePos !== 'number' || !isFinite(pePos) || Math.floor(pePos) !== pePos) throw new Error('"posiçãoEm" espera um número inteiro como posição');
    if (Array.isArray(peHay)) {
      if (pePos < 0 || pePos >= peHay.length) throw new Error('"posiçãoEm" recebeu a posição ' + formatValue(args[1]) + ', mas a lista só tem ' + peHay.length + (peHay.length === 1 ? ' elemento' : ' elementos'));
      return peHay[pePos];
    }
    var peIsNum = typeof peHay === 'number' || (peHay && typeof peHay === 'object' && peHay.wpn);
    var peStr = typeof peHay === 'string' ? peHay : (peIsNum ? String(numVal(peHay)) : null);
    if (peStr === null) throw new Error('"posiçãoEm" espera um texto, número ou lista');
    if (pePos < 0 || pePos >= peStr.length) throw new Error('"posiçãoEm" recebeu a posição ' + formatValue(args[1]) + ', mas "' + peStr + '" só tem ' + peStr.length + (peStr.length === 1 ? ' caractere' : ' caracteres'));
    var peCh = peStr.charAt(pePos);
    if (peIsNum) {
      var peN = Number(peCh);
      return isNaN(peN) ? peCh : mkNum(peN, false);
    }
    return peCh;
  }
  if (name === 'janela') {
    if (args.length < 2 || args.length > 4) {
      throw new Error('janela espera entre 2 e 4 argumentos: janela(x, y, cor de fundo, "título")');
    }
    var jx = numVal(args[0]);
    var jy = numVal(args[1]);
    if (typeof jx !== 'number' || !isFinite(jx) || typeof jy !== 'number' || !isFinite(jy)) {
      throw new Error('janela espera números para a largura e a altura');
    }
    var jw = Math.round(jx);
    var jh = Math.round(jy);
    if (jw <= 0 || jh <= 0) throw new Error('janela: as dimensões devem ser positivas');
    if (jw > 20000 || jh > 20000) throw new Error('janela: dimensões muito grandes (máx. 20000 px)');
    var bg = janelaCor(args[2], '#000000');
    var titulo = args.length >= 4 ? args[3] : 'Janela';
    if (typeof titulo !== 'string') throw new Error('janela: o título deve ser um texto');
    openJanela(jw, jh, bg, titulo);
    return 'janela aberta';
  }
  if (name === 'ponto') {
    if (args.length < 2 || args.length > 3) {
      throw new Error('ponto espera 2 ou 3 argumentos: ponto(x, y, cor)');
    }
    var px = numVal(args[0]);
    var py = numVal(args[1]);
    if (typeof px !== 'number' || !isFinite(px) || typeof py !== 'number' || !isFinite(py)) {
      throw new Error('ponto espera números para as coordenadas x e y');
    }
    if (!lastJanela) {
      throw new Error('ponto: execute janela(largura, altura) antes de usar ponto');
    }
    if (px < 0 || px > lastJanela.w || py < 0 || py > lastJanela.h) {
      throw new Error('ponto: coordenada fora da janela (largura ' + lastJanela.w + ', altura ' + lastJanela.h + ')');
    }
    var pc = janelaCor(args[2], '#ffffff');
    lastJanela.points.push({ x: px, y: py, c: pc });
    janelaDirty = true;
    return 'ponto desenhado';
  }
  if (name === 'linha') {
    if (args.length < 4 || args.length > 5) {
      throw new Error('linha espera 4 ou 5 argumentos: linha(x1, y1, x2, y2, cor)');
    }
    var lx1 = numVal(args[0]);
    var ly1 = numVal(args[1]);
    var lx2 = numVal(args[2]);
    var ly2 = numVal(args[3]);
    if (typeof lx1 !== 'number' || !isFinite(lx1) || typeof ly1 !== 'number' || !isFinite(ly1) ||
        typeof lx2 !== 'number' || !isFinite(lx2) || typeof ly2 !== 'number' || !isFinite(ly2)) {
      throw new Error('linha espera números para as coordenadas x1, y1, x2 e y2');
    }
    if (!lastJanela) {
      throw new Error('linha: execute janela(largura, altura) antes de usar linha');
    }
    if (lx1 < 0 || lx1 > lastJanela.w || ly1 < 0 || ly1 > lastJanela.h ||
        lx2 < 0 || lx2 > lastJanela.w || ly2 < 0 || ly2 > lastJanela.h) {
      throw new Error('linha: coordenada fora da janela (largura ' + lastJanela.w + ', altura ' + lastJanela.h + ')');
    }
    var lc = janelaCor(args[4], '#ffffff');
    lastJanela.lines.push({ x1: lx1, y1: ly1, x2: lx2, y2: ly2, c: lc });
    janelaDirty = true;
    return 'linha desenhada';
  }
  if (name === 'círculo') {
    if (args.length < 3 || args.length > 5) {
      throw new Error('círculo espera 3, 4 ou 5 argumentos: círculo(x, y, raio, cor da borda, cor de preenchimento)');
    }
    var cx = numVal(args[0]);
    var cy = numVal(args[1]);
    var cr = numVal(args[2]);
    if (typeof cx !== 'number' || !isFinite(cx) || typeof cy !== 'number' || !isFinite(cy) ||
        typeof cr !== 'number' || !isFinite(cr)) {
      throw new Error('círculo espera números para as coordenadas x, y e o raio');
    }
    if (cr < 0) {
      throw new Error('círculo: o raio deve ser um número positivo');
    }
    if (!lastJanela) {
      throw new Error('círculo: execute janela(largura, altura) antes de usar círculo');
    }
    if (cx - cr < 0 || cx + cr > lastJanela.w || cy - cr < 0 || cy + cr > lastJanela.h) {
      throw new Error('círculo: círculo fora da janela (largura ' + lastJanela.w + ', altura ' + lastJanela.h + ')');
    }
    var cc = janelaCor(args[3], '#ffffff');
    var cf = janelaCor(args[4], null);
    lastJanela.circles.push({ x: cx, y: cy, r: cr, c: cc, fill: cf });
    janelaDirty = true;
    return 'círculo desenhado';
  }
  if (name === 'retângulo') {
    if (args.length < 4 || args.length > 6) {
      throw new Error('retângulo espera 4, 5 ou 6 argumentos: retângulo(x, y, largura, altura, cor da borda, cor de preenchimento)');
    }
    var rx = numVal(args[0]);
    var ry = numVal(args[1]);
    var rw = numVal(args[2]);
    var rh = numVal(args[3]);
    if (typeof rx !== 'number' || !isFinite(rx) || typeof ry !== 'number' || !isFinite(ry) ||
        typeof rw !== 'number' || !isFinite(rw) || typeof rh !== 'number' || !isFinite(rh)) {
      throw new Error('retângulo espera números para as coordenadas x, y, a largura e a altura');
    }
    if (rw <= 0 || rh <= 0) {
      throw new Error('retângulo: a largura e a altura devem ser números positivos');
    }
    if (!lastJanela) {
      throw new Error('retângulo: execute janela(largura, altura) antes de usar retângulo');
    }
    if (rx < 0 || ry < 0 || rx + rw > lastJanela.w || ry + rh > lastJanela.h) {
      throw new Error('retângulo: retângulo fora da janela (largura ' + lastJanela.w + ', altura ' + lastJanela.h + ')');
    }
    var rc = janelaCor(args[4], '#ffffff');
    var rf = janelaCor(args[5], null);
    lastJanela.rects.push({ x: rx, y: ry, w: rw, h: rh, c: rc, fill: rf });
    janelaDirty = true;
    return 'retângulo desenhado';
  }
  if (name === 'texto') {
    if (args.length < 3 || args.length > 5) {
      throw new Error('texto espera de 3 a 5 argumentos: texto(x, y, "texto", cor, tamanho da fonte)');
    }
    var tx = numVal(args[0]);
    var ty = numVal(args[1]);
    if (typeof tx !== 'number' || !isFinite(tx) || typeof ty !== 'number' || !isFinite(ty)) {
      throw new Error('texto espera números para as coordenadas x e y');
    }
    if (typeof args[2] !== 'string') {
      throw new Error('texto: o conteúdo deve ser um texto entre aspas');
    }
    if (!lastJanela) {
      throw new Error('texto: execute janela(largura, altura) antes de usar texto');
    }
    if (tx < 0 || tx > lastJanela.w || ty < 0 || ty > lastJanela.h) {
      throw new Error('texto: coordenada fora da janela (largura ' + lastJanela.w + ', altura ' + lastJanela.h + ')');
    }
    var tc = janelaCor(args[3], '#ffffff');
    var tfs = args.length >= 5 ? numVal(args[4]) : 14;
    if (typeof tfs !== 'number' || !isFinite(tfs) || tfs <= 0) {
      throw new Error('texto: o tamanho da fonte deve ser um número positivo (em pixels)');
    }
    lastJanela.texts.push({ x: tx, y: ty, t: args[2], c: tc, s: tfs });
    janelaDirty = true;
    return 'texto desenhado';
  }
  if (name === 'pegar') {
    if (args.length !== 4) {
      throw new Error('pegar espera 4 argumentos: pegar(x0, y0, x1, y1)');
    }
    var pgX0 = numVal(args[0]);
    var pgY0 = numVal(args[1]);
    var pgX1 = numVal(args[2]);
    var pgY1 = numVal(args[3]);
    if (typeof pgX0 !== 'number' || !isFinite(pgX0) || typeof pgY0 !== 'number' || !isFinite(pgY0) ||
        typeof pgX1 !== 'number' || !isFinite(pgX1) || typeof pgY1 !== 'number' || !isFinite(pgY1)) {
      throw new Error('pegar espera números para as coordenadas x0, y0, x1 e y1');
    }
    if (!lastJanela) {
      throw new Error('pegar: execute janela(largura, altura) antes de usar pegar');
    }
    var pgMinX = Math.min(pgX0, pgX1);
    var pgMaxX = Math.max(pgX0, pgX1);
    var pgMinY = Math.min(pgY0, pgY1);
    var pgMaxY = Math.max(pgY0, pgY1);
    if (pgMinX < 0 || pgMinY < 0 || pgMaxX > lastJanela.w || pgMaxY > lastJanela.h) {
      throw new Error('pegar: região fora da janela (largura ' + lastJanela.w + ', altura ' + lastJanela.h + ')');
    }
    if (pgMaxX === pgMinX || pgMaxY === pgMinY) {
      throw new Error('pegar: a região deve ter largura e altura maiores que zero');
    }
    var pgP = [];
    for (var pgpi = 0; pgpi < lastJanela.points.length; pgpi++) {
      var pgp = lastJanela.points[pgpi];
      if (pgp.x >= pgMinX && pgp.x <= pgMaxX && pgp.y >= pgMinY && pgp.y <= pgMaxY) {
        pgP.push({ x: pgp.x, y: pgp.y, c: pgp.c });
      }
    }
    var pgL = [];
    for (var pgli = 0; pgli < lastJanela.lines.length; pgli++) {
      var pgl = lastJanela.lines[pgli];
      var pgmx = (pgl.x1 + pgl.x2) / 2;
      var pgmy = (pgl.y1 + pgl.y2) / 2;
      if (pgmx >= pgMinX && pgmx <= pgMaxX && pgmy >= pgMinY && pgmy <= pgMaxY) {
        pgL.push({ x1: pgl.x1, y1: pgl.y1, x2: pgl.x2, y2: pgl.y2, c: pgl.c });
      }
    }
    var pgC = [];
    for (var pgci = 0; pgci < lastJanela.circles.length; pgci++) {
      var pgc = lastJanela.circles[pgci];
      if (pgc.x >= pgMinX && pgc.x <= pgMaxX && pgc.y >= pgMinY && pgc.y <= pgMaxY) {
        pgC.push({ x: pgc.x, y: pgc.y, r: pgc.r, c: pgc.c, fill: pgc.fill });
      }
    }
    var pgR = [];
    for (var pgri = 0; pgri < lastJanela.rects.length; pgri++) {
      var pgr = lastJanela.rects[pgri];
      if (pgr.x >= pgMinX && pgr.x <= pgMaxX && pgr.y >= pgMinY && pgr.y <= pgMaxY) {
        pgR.push({ x: pgr.x, y: pgr.y, w: pgr.w, h: pgr.h, c: pgr.c, fill: pgr.fill });
      }
    }
    var pgT = [];
    for (var pgti = 0; pgti < lastJanela.texts.length; pgti++) {
      var pgt = lastJanela.texts[pgti];
      if (pgt.x >= pgMinX && pgt.x <= pgMaxX && pgt.y >= pgMinY && pgt.y <= pgMaxY) {
        pgT.push({ x: pgt.x, y: pgt.y, t: pgt.t, c: pgt.c, s: pgt.s });
      }
    }
    lastJanelaCopy = { x0: pgMinX, y0: pgMinY, x1: pgMaxX, y1: pgMaxY, points: pgP, lines: pgL, circles: pgC, rects: pgR, texts: pgT };
    return 'região copiada';
  }
  if (name === 'colocar') {
    if (args.length !== 4) {
      throw new Error('colocar espera 4 argumentos: colocar(x0, y0, x1, y1)');
    }
    var clX0 = numVal(args[0]);
    var clY0 = numVal(args[1]);
    var clX1 = numVal(args[2]);
    var clY1 = numVal(args[3]);
    if (typeof clX0 !== 'number' || !isFinite(clX0) || typeof clY0 !== 'number' || !isFinite(clY0) ||
        typeof clX1 !== 'number' || !isFinite(clX1) || typeof clY1 !== 'number' || !isFinite(clY1)) {
      throw new Error('colocar espera números para as coordenadas x0, y0, x1 e y1');
    }
    if (!lastJanela) {
      throw new Error('colocar: execute janela(largura, altura) antes de usar colocar');
    }
    if (!lastJanelaCopy) {
      throw new Error('colocar: execute pegar(x0, y0, x1, y1) antes de usar colocar');
    }
    var clMinX = Math.min(clX0, clX1);
    var clMaxX = Math.max(clX0, clX1);
    var clMinY = Math.min(clY0, clY1);
    var clMaxY = Math.max(clY0, clY1);
    if (clMinX < 0 || clMinY < 0 || clMaxX > lastJanela.w || clMaxY > lastJanela.h) {
      throw new Error('colocar: região fora da janela (largura ' + lastJanela.w + ', altura ' + lastJanela.h + ')');
    }
    if (clMaxX === clMinX || clMaxY === clMinY) {
      throw new Error('colocar: a região deve ter largura e altura maiores que zero');
    }
    var clSX = (clMaxX - clMinX) / (lastJanelaCopy.x1 - lastJanelaCopy.x0);
    var clSY = (clMaxY - clMinY) / (lastJanelaCopy.y1 - lastJanelaCopy.y0);
    var clSR = (clSX + clSY) / 2;
    for (var clpi = 0; clpi < lastJanelaCopy.points.length; clpi++) {
      var clp = lastJanelaCopy.points[clpi];
      lastJanela.points.push({ x: clMinX + (clp.x - lastJanelaCopy.x0) * clSX, y: clMinY + (clp.y - lastJanelaCopy.y0) * clSY, c: clp.c });
    }
    for (var clli = 0; clli < lastJanelaCopy.lines.length; clli++) {
      var cll = lastJanelaCopy.lines[clli];
      lastJanela.lines.push({
        x1: clMinX + (cll.x1 - lastJanelaCopy.x0) * clSX,
        y1: clMinY + (cll.y1 - lastJanelaCopy.y0) * clSY,
        x2: clMinX + (cll.x2 - lastJanelaCopy.x0) * clSX,
        y2: clMinY + (cll.y2 - lastJanelaCopy.y0) * clSY,
        c: cll.c
      });
    }
    for (var clci = 0; clci < lastJanelaCopy.circles.length; clci++) {
      var clc = lastJanelaCopy.circles[clci];
      lastJanela.circles.push({
        x: clMinX + (clc.x - lastJanelaCopy.x0) * clSX,
        y: clMinY + (clc.y - lastJanelaCopy.y0) * clSY,
        r: clc.r * clSR,
        c: clc.c,
        fill: clc.fill
      });
    }
    for (var clri = 0; clri < lastJanelaCopy.rects.length; clri++) {
      var clr = lastJanelaCopy.rects[clri];
      lastJanela.rects.push({
        x: clMinX + (clr.x - lastJanelaCopy.x0) * clSX,
        y: clMinY + (clr.y - lastJanelaCopy.y0) * clSY,
        w: clr.w * clSX,
        h: clr.h * clSY,
        c: clr.c,
        fill: clr.fill
      });
    }
    for (var clti = 0; clti < lastJanelaCopy.texts.length; clti++) {
      var clt = lastJanelaCopy.texts[clti];
      lastJanela.texts.push({ x: clMinX + (clt.x - lastJanelaCopy.x0) * clSX, y: clMinY + (clt.y - lastJanelaCopy.y0) * clSY, t: clt.t, c: clt.c, s: clt.s * clSR });
    }
    janelaDirty = true;
    return 'região colada';
  }
  if (name === 'limparJanela') {
    if (args.length !== 0) throw new Error('limparJanela não espera argumentos: use limparJanela ou limparJanela()');
    if (!lastJanela) throw new Error('limparJanela: execute janela(largura, altura) antes de usar limparJanela');
    if (typeof CURRENT_OUT !== 'undefined' && CURRENT_OUT) {
      CURRENT_OUT.push({kind:'clearJanela', lineNo: null});
    } else {
      lastJanela.points = [];
      lastJanela.lines = [];
      lastJanela.circles = [];
      lastJanela.rects = [];
      lastJanela.texts = [];
      lastJanelaCopy = null;
      janelaDirty = true;
    }
    return 'janela limpa';
  }
  if (name === 'corFundo') {
    if (args.length !== 1) throw new Error('corFundo espera 1 argumento: corFundo(cor)');
    if (!lastJanela) throw new Error('corFundo: execute janela(largura, altura) antes de usar corFundo');
    var bg = janelaCor(args[0], null);
    if (!bg) throw new Error('corFundo: cor inválida');
    if (typeof CURRENT_OUT !== 'undefined' && CURRENT_OUT) {
      CURRENT_OUT.push({kind:'corFundo', bg:bg, lineNo: null});
    } else {
      lastJanela.bg = bg;
      janelaDirty = true;
    }
    return 'cor de fundo alterada';
  }
  if (name === 'paraNúmero') {
    if (args.length !== 1) throw new Error('paraNúmero espera 1 argumento');
    var ns = String(numVal(args[0])).trim();
    if (ns.indexOf(',') !== -1 && ns.indexOf('.') === -1) ns = ns.replace(/,/g, '.');
    var nn = Number(ns);
    if (typeof nn !== 'number' || !isFinite(nn)) throw new Error('paraNúmero espera um texto numérico');
    return mkNum(nn, ns.indexOf('.') >= 0);
  }
  if (name === 'ano') {
    if (args.length !== 0) throw new Error('ano espera nenhum argumento');
    return mkNum(new Date().getFullYear(), false);
  }
  if (name === 'mês') {
    if (args.length !== 0) throw new Error('mês espera nenhum argumento');
    return mkNum(parseInt(pad2(new Date().getMonth() + 1),10), false);
  }
  if (name === 'dia') {
    if (args.length !== 0) throw new Error('dia espera nenhum argumento');
    return mkNum(parseInt(pad2(new Date().getDate()),10), false);
  }
  if (name === 'hora') {
    if (args.length !== 0) throw new Error('hora espera nenhum argumento');
    return mkNum(new Date().getHours(), false);
  }
  if (name === 'data') {
    if (args.length !== 0) throw new Error('data espera nenhum argumento');
    return formatDataAtual();
  }
  if (name === 'agora') {
    if (args.length !== 0) throw new Error('agora espera nenhum argumento');
    return formatHoraAtual();
  }
  if (name === 'tempo') {
    if (args.length !== 2) throw new Error('tempo espera 2 argumentos: tempo("dd/MM/yyyy", "dd/MM/yyyy")');
    return diffDatas(args[0], args[1]);
  }
  if (name === 'adicionarDias') {
    if (args.length !== 2) throw new Error('adicionarDias espera 2 argumentos: adicionarDias("dd/MM/yyyy", dias)');
    var _ad = String(args[0]);
    var _dias = numVal(args[1]);
    if (typeof _dias !== 'number' || !isFinite(_dias) || Math.floor(_dias) !== _dias) throw new Error('adicionarDias: dias deve ser um número inteiro');
    var _p = parseDataBrasil(_ad);
    var _dt = new Date(_p.y, _p.m - 1, _p.d);
    _dt.setDate(_dt.getDate() + _dias);
    return pad2(_dt.getDate()) + '/' + pad2(_dt.getMonth() + 1) + '/' + _dt.getFullYear();
  }
  if (name === 'diaSemana') {
    if (args.length !== 1) throw new Error('diaSemana espera 1 argumento: diaSemana("dd/MM/yyyy")');
    var _ds = String(args[0]);
    var _pp = parseDataBrasil(_ds);
    var _ddt = new Date(_pp.y, _pp.m - 1, _pp.d);
    var _dias = ['domingo','segunda','terça','quarta','quinta','sexta','sábado'];
    return _dias[_ddt.getDay()];
  }
  if (name === 'bipe') {
    if (args.length !== 1) throw new Error('bipe espera 1 argumento: bipe(segundos)');
    var bs = numVal(args[0]);
    if (typeof bs !== 'number' || !isFinite(bs) || bs <= 0) {
      throw new Error('bipe: os segundos devem ser um número positivo (ex.: bipe(0.5) para meio segundo)');
    }
    emitBipe(bs);
    return 'bipe de ' + formatNumber(bs, bs % 1 !== 0) + ' segundo(s) emitido';
  }
  if (name === 'som') {
    if (args.length !== 2) throw new Error('som espera 2 argumentos: som(frequência, segundos)');
    var somF = numVal(args[0]);
    var somS = numVal(args[1]);
    if (typeof somF !== 'number' || !isFinite(somF) || somF < 37 || somF > 32767) {
      throw new Error('som: a frequência deve ser um número entre 37 e 32767 Hz');
    }
    if (typeof somS !== 'number' || !isFinite(somS) || somS <= 0) {
      throw new Error('som: os segundos devem ser um número positivo (ex.: som(880, 0.5))');
    }
    emitTone(somF, somS);
    return 'som de ' + formatNumber(somF, false) + ' Hz por ' + formatNumber(somS, somS % 1 !== 0) + ' segundo(s) emitido';
  }
  if (name === 'toca') {
    if (args.length < 2) throw new Error('toca espera as notas e o tempo: toca("C", "D", "E", 0.5)');
    var tocaSecs = numVal(args[args.length - 1]);
    if (typeof tocaSecs !== 'number' || !isFinite(tocaSecs) || tocaSecs <= 0) {
      throw new Error('toca: o último argumento deve ser o tempo em segundos, inteiro ou decimal (ex.: toca("C", "D", 0.5))');
    }
    var tocaFreqs = [];
    for (var tci = 0; tci < args.length - 1; tci++) {
      var tcName = tocaNota(args[tci]);
      var tcFreq = notaFreq(tcName);
      if (tcFreq === null) throw new Error('toca: nota musical inválida "' + tcName + '"');
      tocaFreqs.push(tcFreq);
    }
    emitMelody(tocaFreqs, tocaSecs);
    return 'tocando ' + tocaFreqs.length + ' nota(s) por ' + formatNumber(tocaSecs, tocaSecs % 1 !== 0) + ' segundo(s) cada';
  }
  if (name === 'mensagem') {
    if (args.length !== 2) throw new Error('mensagem espera 2 argumentos: mensagem("Título da janela", "mensagem")');
    if (typeof args[0] !== 'string') throw new Error('mensagem: o título deve ser um texto entre aspas');
    if (typeof args[1] !== 'string') throw new Error('mensagem: o conteúdo deve ser um texto entre aspas');
    showMessageBox(args[0], args[1]);
    return 'mensagem exibida';
  }
  throw new Error('Função desconhecida: ' + name);
}

function interpString(raw, env) {
  var out = '';
  var i = 0, n = raw.length;
  while (i < n) {
    var ch = raw[i];
    if (ch === '\\' && i + 1 < n) {
      var e = raw[i + 1];
      if (e === 'n') out += '\n';
      else if (e === 't') out += '\t';
      else out += e;
      i += 2;
      continue;
    }
    if (ch === '{') {
      var k = i + 1, depth = 1, quote = null, close = -1;
      while (k < n) {
        var ck = raw[k];
        if (quote) {
          if (ck === '\\') { k += 2; continue; }
          if (ck === quote) quote = null;
          k++;
          continue;
        }
        if (ck === '"' || ck === "'") { quote = ck; k++; continue; }
        if (ck === '{') { depth++; k++; continue; }
        if (ck === '}') {
          depth--;
          if (depth === 0) { close = k; break; }
          k++;
          continue;
        }
        k++;
      }
      if (close === -1) { out += ch; i++; continue; }
      var expr = raw.slice(i + 1, close);
      var litToks = null;
      try { litToks = evalTokenize(expr); } catch (e) { litToks = null; }
      if (litToks && litToks.length === 1 && litToks[0].type === 'STR') {
        var litVal = litToks[0].value;
        var stripL = (i - 1 >= 0 && raw[i - 1] === "'" && out.charAt(out.length - 1) === "'");
        if (stripL) out = out.slice(0, -1);
        if (close + 1 < n && raw[close + 1] === "'") close++;
        if (litVal.charAt(0) === '{' && litVal.charAt(litVal.length - 1) === '}') out += litVal;
        else out += '{' + litVal + '}';
        i = close + 1;
        continue;
      }
      try {
        out += formatValue(parse(expr, env));
      } catch (err) {
        var interpOk = false;
        if (/^[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][A-Za-z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]*$/.test(expr)) {
          try { out += formatValue(parse(expr + '()', env)); interpOk = true; } catch (err2) {}
        }
        if (!interpOk) out += raw.slice(i, close + 1);
      }
      i = close + 1;
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function parse(input, env) {
  input = input.replace(/\b(e|ou)\s+se\b/gi, '$1');
  CURRENT_ENV = env;
  var toks = evalTokenize(input);
  var pos = 0;
  function peek() { return toks[pos]; }
  function next() { return toks[pos++]; }
  function isOp(t) { return !!t && t.type === 'OP'; }
  function expectOp(op) {
    if (!isOp(peek()) || peek().text !== op) throw new Error("Operador esperado: '" + op + "'");
    return next();
  }
  function parseExpr() { return parseTernario(); }
  function isWord(t, word) { return !!t && t.type === 'ID' && t.name === word; }
  function isKw(t, word) { return !!t && t.type === 'ID' && t.name.toLowerCase() === word.toLowerCase(); }
  function isSenaoKw(t){ if(!t||t.type!=='ID') return false; var n=t.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c'); return n==='senao'; }
  function normKey(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c'); }
  function findVarKey(name){
    if (name in env) return name;
    var nk = normKey(name);
    for (var kk in env){ if (normKey(kk)===nk) return kk; }
    return null;
  }
  function normalizeCondExpr(s) {
    return s.replace(/\b(e|ou)\s+se\b/gi, '$1');
  }
  function parseTernario(){
    var thenVal = parseOr();
    if (isKw(peek(),'se')){
      next();
      var cond = parseOr();
      if (!isSenaoKw(peek())) throw new Error('Esperado "senão" após condição do "se" ternário');
      next();
      var elseVal = parseTernario();
      return numVal(cond) ? thenVal : elseVal;
    }
    return thenVal;
  }
  function parseOr() {
    var left = parseAnd();
    while (isKw(peek(), 'ou')) { next(); var right = parseAnd(); left = !!(numVal(left) || numVal(right)); }
    return left;
  }
  function parseAnd() {
    var left = parseNot();
    while (isKw(peek(), 'e')) { next(); var right = parseNot(); left = !!(numVal(left) && numVal(right)); }
    return left;
  }
  function parseNot() {
    if (isKw(peek(), 'não') || isKw(peek(), 'nao')) { next(); var v = parseNot(); return !numVal(v); }
    if (isKw(peek(), 'existe')) {
      next();
      var startPos = pos;
      var depth = 0;
      var emPos = -1;
      for (var p = pos; p < toks.length; p++) {
        var t = toks[p];
        if (t.type === 'OP' && t.text === '(') depth++;
        else if (t.type === 'OP' && t.text === ')') { if (depth>0) depth--; }
        else if (depth===0 && t.type === 'ID' && t.name.toLowerCase() === 'em') { emPos = p; break; }
      }
      if (emPos === -1) throw new Error('Sintaxe inválida: use "existe <valor> em <texto ou lista>"');
      var needleToks = toks.slice(startPos, emPos);
      pos = emPos + 1;
      var exHay = parseComparison();
      if (needleToks.length === 0) throw new Error('Sintaxe inválida: valor ausente em "existe"');
      var nPos = 0;
      function nPeek(){ return needleToks[nPos]; }
      function nNext(){ return needleToks[nPos++]; }
      function getNeedleVal(tok){
        if (!tok) throw new Error('Valor ausente em "existe"');
        if (tok.type==='STR') return tok.value;
        if (tok.type==='NUM') return mkNum(tok.value, tok.float);
        if (tok.type==='ID'){
          var low = tok.name.toLowerCase();
          if (low==='verdadeiro' || low==='true') return true;
          if (low==='falso' || low==='false') return false;
          if (JANELA_COR_NOMES.indexOf(tok.name)>=0) return tok.name;
          var _kk = findVarKey(tok.name);
          if (_kk){
            var vv = env[_kk];
            if (vv && vv.wpLazy) return lazyEval(vv, env);
            return vv;
          }
          throw new Error('Variável não definida: '+tok.name);
        }
        throw new Error('Valor inválido em "existe": '+tok.src);
      }
      function needlePrimary(){
        var tt = nPeek();
        if (!tt) throw new Error('Expressão incompleta em "existe"');
        if (tt.type==='OP' && tt.text==='('){
          nNext();
          var v = needleOr();
          var closing = nPeek();
          if (!closing || closing.type!=='OP' || closing.text!==')') throw new Error('Parêntese não fechado em "existe"');
          nNext();
          return v;
        }
        var baseTok = nNext();
        var baseVal = getNeedleVal(baseTok);
        while (nPos < needleToks.length && nPeek() && nPeek().type==='OP' && nPeek().text==='.'){
          nNext();
          var propTok = nPeek();
          if (!propTok || propTok.type!=='ID') throw new Error('Propriedade esperada após "."');
          nNext();
          var margs = null;
          if (nPeek() && nPeek().type==='OP' && nPeek().text==='('){
            nNext();
            margs = [];
            if (!(nPeek() && nPeek().type==='OP' && nPeek().text===')')){
              while (true){
                var argTok = nPeek();
                if (!argTok) throw new Error('Parêntese não fechado em propriedade');
                if (argTok.type==='OP' && argTok.text===')') break;
                if (argTok.type==='OP' && argTok.text===','){ nNext(); continue; }
                // simple argument as value token
                var aTok = nNext();
                margs.push(getNeedleVal(aTok));
                if (nPeek() && nPeek().type==='OP' && nPeek().text===','){ nNext(); continue; }
                break;
              }
            }
            if (!nPeek() || nPeek().type!=='OP' || nPeek().text!==')') throw new Error('Parêntese não fechado em propriedade');
            nNext();
          }
          baseVal = getProperty(baseVal, propTok.name, margs);
        }
        return callFunction('contém', [exHay, baseVal]);
      }
      function needleNot(){
        if (nPeek() && nPeek().type==='ID' && (nPeek().name.toLowerCase()==='não' || nPeek().name.toLowerCase()==='nao')){
          nNext();
          var vv = needleNot();
          return !numVal(vv);
        }
        return needlePrimary();
      }
      function needleAnd(){
        var left = needleNot();
        while (nPeek() && nPeek().type==='ID' && nPeek().name.toLowerCase()==='e'){
          nNext();
          var right = needleNot();
          left = !!(numVal(left) && numVal(right));
        }
        return left;
      }
      function needleOr(){
        var left = needleAnd();
        while (nPeek() && nPeek().type==='ID' && nPeek().name.toLowerCase()==='ou'){
          nNext();
          var right = needleAnd();
          left = !!(numVal(left) || numVal(right));
        }
        return left;
      }
      var res = needleOr();
      if (nPos < needleToks.length) throw new Error('Expressão inválida em "existe": sobrou "'+needleToks[nPos].src+'"');
      return res;
    }
    return parseEm();
  }
  function parseEm() {
    function normWord(s){ return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c'); }
    var left = parseComparison();
    if (isKw(peek(), 'em')) {
      next();
      var right = parseComparison();
      return callFunction('contém', [right, left]);
    }
    if (peek() && peek().type==='ID' && normWord(peek().name)==='contem') {
      next();
      var right = parseComparison();
      return callFunction('contém', [left, right]);
    }
    function isComecaAhead(){
      var t0 = peek();
      var t1 = toks[pos+1];
      if (!t0 || !t1 || t0.type!=='ID' || t1.type!=='ID') return false;
      return normWord(t0.name)==='comeca' && normWord(t1.name)==='com';
    }
    function isTerminaAhead(){
      var t0 = peek();
      var t1 = toks[pos+1];
      if (!t0 || !t1 || t0.type!=='ID' || t1.type!=='ID') return false;
      return normWord(t0.name)==='termina' && normWord(t1.name)==='com';
    }
    if (isComecaAhead()){
      next(); next();
      var right = parseComparison();
      var sL = (typeof left==='string') ? left : formatValue(left);
      var sR = (typeof right==='string') ? right : formatValue(right);
      return String(sL).startsWith(String(sR));
    }
    if (isTerminaAhead()){
      next(); next();
      var right2 = parseComparison();
      var sL2 = (typeof left==='string') ? left : formatValue(left);
      var sR2 = (typeof right2==='string') ? right2 : formatValue(right2);
      return String(sL2).endsWith(String(sR2));
    }
    return left;
  }
  var COMP_OPS = { '=': 1, '==': 1, '!=': 1, '<>': 1, '<': 1, '>': 1, '<=': 1, '>=': 1 };
  function parseComparison() {
    var left = parseAddSub();
    while (isOp(peek()) && COMP_OPS[peek().text]) {
      var op = next().text;
      var right = parseAddSub();
      var lv = numVal(left), rv = numVal(right);
      if (op === '=' || op === '==') left = lv == rv;
      else if (op === '!=' || op === '<>') left = lv != rv;
      else if (op === '<') left = lv < rv;
      else if (op === '>') left = lv > rv;
      else if (op === '<=') left = lv <= rv;
      else if (op === '>=') left = lv >= rv;
    }
    return left;
  }
  function parseAddSub() {
    var left = parseTerm();
    while (isOp(peek()) && (peek().text === '+' || peek().text === '-')) {
      var op = next().text;
      var right = parseTerm();
      if (op === '+') {
        left = binOp(left, right, function (a, b) {
          if (typeof a === 'string' || typeof b === 'string') return String(numVal(a)) + String(numVal(b));
          return mkNum(numVal(a) + numVal(b), numFloat(a) || numFloat(b));
        });
      } else {
        left = binOp(left, right, function (a, b) {
          return mkNum(numVal(a) - numVal(b), numFloat(a) || numFloat(b));
        });
      }
    }
    return left;
  }
  function parseTerm() {
    var left = parsePower();
    while (true) {
      var isModWord = isWord(peek(), 'mod');
      var isOpTerm = isOp(peek()) && (peek().text === '*' || peek().text === '/' || peek().text === '//' || peek().text === '\\');
      if (!isModWord && !isOpTerm) break;
      var op;
      if (isModWord) { next(); op = '\\'; } else { op = next().text; }
      var right = parsePower();
      left = binOp(left, right, function (a, b) {
        var lv = numVal(a), rv = numVal(b);
        if (op === '*') {
          var raStr = typeof a === 'string' ? a : null;
          var rbStr = typeof b === 'string' ? b : null;
          if (raStr !== null || rbStr !== null) {
            var repStr = raStr !== null ? raStr : rbStr;
            var repCnt = raStr !== null ? rv : lv;
            if (typeof repCnt !== 'number' || !isFinite(repCnt) || Math.floor(repCnt) !== repCnt) {
              throw new Error('"*" espera um número inteiro para repetir um texto');
            }
            if (repCnt < 0) repCnt = 0;
            var repOut = '';
            for (var rpI = 0; rpI < repCnt; rpI++) repOut += repStr;
            return repOut;
          }
          return mkNum(lv * rv, numFloat(a) || numFloat(b));
        }
        if (op === '/') return mkNum(lv / rv, true);
        if (op === '//') return mkNum(Math.floor(lv / rv), false);
        if (op === '\\') {
          if (rv === 0) throw new Error('mod: divisão por zero');
          return mkNum(lv % rv, numFloat(a) || numFloat(b));
        }
      });
    }
    return left;
  }
  function parsePower() {
    var left = parseUnary();
    if (isOp(peek()) && peek().text === '**') {
      next();
      var right = parsePower();
      return binOp(left, right, function (a, b) {
        return mkNum(Math.pow(numVal(a), numVal(b)), numFloat(a) || numFloat(b));
      });
    }
    return left;
  }
  function parseUnary() {
    if (isOp(peek()) && peek().text === '-') {
      next();
      var u = parseUnary();
      if (Array.isArray(u)) return u.map(function (x) { return mkNum(-numVal(x), numFloat(x)); });
      return mkNum(-numVal(u), numFloat(u));
    }
    return parsePrimary();
  }
  function parsePrimary() {
    var v = parsePrimaryInner();
    while (isOp(peek()) && peek().text === '.') {
      next();
      var pt = peek();
      if (!pt || pt.type !== 'ID') throw new Error('Propriedade esperada após "."');
      next();
      var margs = null;
      if (isOp(peek()) && peek().text === '(') {
        next();
        margs = [];
        if (!(isOp(peek()) && peek().text === ')')) {
          while (true) {
            margs.push(parseExpr());
            if (isOp(peek()) && peek().text === ',') { next(); continue; }
            break;
          }
        }
        expectOp(')');
      }
      v = getProperty(v, pt.name, margs);
    }
    while (isOp(peek()) && peek().text === '!') {
      next();
      v = callFunction('fatorial', [v]);
    }
    return v;
  }
  function parsePrimaryInner() {
    var t = peek();
    if (!t) throw new Error('Expressão incompleta');
    if (t.type === 'NUM') { next(); return mkNum(t.value, t.float); }
    if (t.type === 'STR') {
      next();
      if (t.interp && t.raw && t.raw.indexOf('{') >= 0) return interpString(t.raw, env);
      return t.value;
    }
    if (t.type === 'ID') {
      next();
      if (t.name === 'verdadeiro' || t.name === 'true') return true;
      if (t.name === 'falso' || t.name === 'false') return false;
      if (JANELA_COR_NOMES.indexOf(t.name) >= 0) return t.name;
      if (isOp(peek()) && peek().text === '(') {
        next();
        if (t.name === 'salvar' || t.name === 'carregar') {
          var svParts = [];
          var svDepth = 0;
          while (true) {
            var svt = peek();
            if (!svt) throw new Error('Parêntese não fechado em ' + t.name);
            if (isOp(svt) && svt.text === '(') svDepth++;
            if (isOp(svt) && svt.text === ')') {
              if (svDepth === 0) break;
              svDepth--;
            }
            svParts.push(svt.src);
            next();
          }
          expectOp(')');
          var svSrc = svParts.join('');
          if (t.name === 'salvar') return execSalvar(svSrc, env);
          return execCarregar(svSrc, env);
        }
        if (t.name === 'filtrar') {
          var fParts = [];
          var fDepth = 0;
          while (true) {
            var ft = peek();
            if (!ft) throw new Error('Parêntese não fechado em filtrar');
            if (isOp(ft) && ft.text === '(') fDepth++;
            if (isOp(ft) && ft.text === ')') {
              if (fDepth === 0) break;
              fDepth--;
            }
            fParts.push(ft.src);
            next();
          }
          expectOp(')');
          var filterSrc = fParts.join(' ');
          return execFiltrar(filterSrc, env);
        }
        var args = [];
        if (!(isOp(peek()) && peek().text === ')')) {
          while (true) {
            args.push(parseExpr());
            if (isOp(peek()) && peek().text === ',') { next(); continue; }
            break;
          }
        }
        expectOp(')');
        if (t.name === 'selecionar' || t.name === 'comprimento' || t.name === 'captureTecla' || t.name === 'absoluto' || t.name === 'abs' || t.name === 'fatorial'  || t.name === 'variáveis' || t.name === 'variaveis' || t.name === 'raizq' || t.name === 'raizc' || t.name === 'pi'    || t.name === 'inteiro' || t.name === 'decimal' || t.name === 'fração' || t.name === 'fracao'     || t.name === 'paraLista'  || t.name === 'paraTexto' || t.name === 'paraNúmero'       || t.name === 'cos' || t.name === 'sen' || t.name === 'tan' || t.name === 'arcocos' || t.name === 'arcosen' || t.name === 'arcotan' || t.name === 'aleatório' || t.name === 'dado' || t.name === 'moeda'   || t.name === 'janela' || t.name === 'ponto' || t.name === 'linha' || t.name === 'círculo' || t.name === 'retângulo' || t.name === 'texto' || t.name === 'intervalo' || t.name === 'log' || t.name === 'logn' || t.name === 'ln' || t.name === 'arredondar' || t.name === 'arred' || t.name === 'ano' || t.name === 'mês' || t.name === 'dia' || t.name === 'hora' || t.name === 'data' || t.name === 'agora' || t.name === 'tempo' || t.name === 'adicionarDias' || t.name === 'diaSemana'     || t.name === 'bipe' || t.name === 'som' || t.name === 'toca' || t.name === 'mensagem' || t.name === 'pegar' || t.name === 'colocar' || t.name === 'limparJanela' || t.name === 'corFundo' || t.name === 'aparar' || t.name === 'extrair' || t.name === 'filtrar' || t.name === 'mapear' || t.name === 'tipo' || t.name === 'primo' || t.name === 'par' || t.name === 'ímpar' || t.name === 'impar' || t.name === 'maiúsculo' || t.name === 'minúsculo' || t.name === 'substitua' || t.name === 'divida' || t.name === 'junte' || t.name === 'contém' || t.name === 'posição' || t.name === 'insira' || t.name === 'remova' || t.name === 'posiçãoEm' || t.name === 'mmc' || t.name === 'mdc' || t.name === 'divisores' || t.name === 'fatores' || t.name === 'média' || t.name === 'media' || t.name === 'mediana' || t.name === 'moda' || t.name === 'variância' || t.name === 'variancia' || t.name === 'desvioPadrao' || t.name === 'desvioPadrão' || t.name === 'produto'  ) {
          return callFunction(t.name, args);
        }
        var _k0 = findVarKey(t.name);
        var base = _k0 ? env[_k0] : undefined;
        if (base && base.wpLazy) base = lazyEval(base, env);
        if (base && base.wpFunc) {
          if (args.length !== base.params.length) throw new Error("'" + t.name + "' espera " + base.params.length + ' argumento(s)');
          return callUserFunc(base, args);
        }
        if (base !== undefined && Array.isArray(base)) {
          if (args.length !== 1) throw new Error('Índice de lista espera 1 argumento');
          var idx = numVal(args[0]);
          if (typeof idx !== 'number' || !isFinite(idx) || Math.floor(idx) !== idx) {
            throw new Error('Índice deve ser um número inteiro');
          }
          if (idx < 0 || idx >= base.length) throw new Error('Índice fora dos limites da lista');
          return base[idx];
        }
        if (isIndexedVar(base)) {
          if (args.length !== 1) throw new Error('Índice de variável espera 1 argumento');
          return getIndexedVal(base, indexKey(args[0]));
        }
        if (args.length === 1) {
          var idxdAuto = ensureIndexedVar(env, t.name);
          return getIndexedVal(idxdAuto, indexKey(args[0]));
        }
        if (findVarKey(t.name)) throw new Error("'" + t.name + "' não é uma lista nem variável indexada");
        throw new Error('Variável não definida: ' + t.name);
      }
      var _k1 = findVarKey(t.name);
      if (_k1) {
        var stored = env[_k1];
        if (stored && stored.wpLazy) return lazyEval(stored, env);
        return stored;
      }
      if (t.name === 'pi') return mkNum(Number(Math.PI.toFixed(2)), false);
      if (t.name === 'e') return mkNum(Math.E, false);
      throw new Error('Variável não definida: ' + t.name);
    }
    if (isOp(t) && t.text === '(') {
      next();
      var first = parseExpr();
      if (isOp(peek()) && peek().text === ',') {
        var elems = [first];
        while (isOp(peek()) && peek().text === ',') {
          next();
          elems.push(parseExpr());
        }
        expectOp(')');
        if (elems.length < 2 || elems.length > 3) throw new Error('Intervalo deve ter 2 ou 3 valores');
        return buildRange(elems);
      }
      expectOp(')');
      return first;
    }
    if (isOp(t) && t.text === '%') {
      next();
      if (!(isOp(peek()) && peek().text === '(')) throw new Error('Sintaxe: %(valor, porcentagem)');
      next();
      var pctA = parseExpr();
      if (!(isOp(peek()) && peek().text === ',')) throw new Error('Sintaxe: %(valor, porcentagem)');
      next();
      var pctB = parseExpr();
      expectOp(')');
      return binOp(pctA, pctB, function (a, b) {
        return mkNum(numVal(a) * numVal(b) / 100, true);
      });
    }
    if (isOp(t) && t.text === '{') {
      next();
      var obj = { wpDict: true };
      if (!(isOp(peek()) && peek().text === '}')) {
        while (true) {
          var keyTok = peek();
          var key;
          if (keyTok && keyTok.type === 'STR') { next(); key = keyTok.value; }
          else if (keyTok && keyTok.type === 'ID') { next(); key = keyTok.name; }
          else throw new Error('Chave de dicionário esperada');
          expectOp(':');
          var val = parseExpr();
          obj[key] = val;
          if (isOp(peek()) && peek().text === ',') { next(); continue; }
          break;
        }
      }
      expectOp('}');
      return obj;
    }
    if (isOp(t) && t.text === '[') {
      next();
      var arr = [];
      if (!(isOp(peek()) && peek().text === ']')) {
        while (true) {
          arr.push(parseExpr());
          if (isOp(peek()) && peek().text === ',') { next(); continue; }
          break;
        }
      }
      expectOp(']');
      return arr;
    }
    throw new Error('Expressão inválida');
  }

  var result = parseExpr();
  if (pos < toks.length) throw new Error('Operador inesperado: ' + toks[pos].text);
  return result;
}

function mkNum(v, f) { return { wpn: true, v: v, f: !!f }; }
function numVal(x) { return (x && typeof x === 'object' && x.wpn) ? x.v : x; }
function numFloat(x) { return (x && typeof x === 'object' && x.wpn) ? x.f : false; }

function binOp(a, b, fn) {
  if (Array.isArray(a) || Array.isArray(b)) {
    var res = [];
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) throw new Error('Listas devem ter o mesmo tamanho');
      for (var i = 0; i < a.length; i++) res.push(binOp(a[i], b[i], fn));
    } else if (Array.isArray(a)) {
      for (var j = 0; j < a.length; j++) res.push(binOp(a[j], b, fn));
    } else {
      for (var j = 0; j < b.length; j++) res.push(binOp(a, b[j], fn));
    }
    return res;
  }
  return fn(a, b);
}

function buildRange(elems) {
  var vals = [];
  for (var i = 0; i < elems.length; i++) vals.push(numVal(elems[i]));
  for (var k = 0; k < vals.length; k++) {
    if (typeof vals[k] !== 'number' || !isFinite(vals[k])) throw new Error('Limites do intervalo devem ser números');
  }
  var a = vals[0], b = vals[1];
  var step = vals.length === 3 ? vals[2] : 1;
  if (step === 0) throw new Error('Passo do intervalo não pode ser zero');
  var f = numFloat(elems[0]) || numFloat(elems[1]) || (elems.length === 3 && numFloat(elems[2]));
  if (Math.abs((b - a) / step) > 100000) throw new Error('intervalo muito grande (máx 100k elementos)');
  var items = [];
  if (step > 0) {
    for (var v = a; v <= b; v += step) { if (items.length > 100000) throw new Error('intervalo muito grande'); items.push(mkNum(v, f)); }
  } else {
    for (var v2 = a; v2 >= b; v2 += step) { if (items.length > 100000) throw new Error('intervalo muito grande'); items.push(mkNum(v2, f)); }
  }
  return items;
}

var lazyDepth = 0;
function lazyEval(def, env) {
  if (lazyDepth > 100) throw new Error('Definição circular ou excessivamente profunda');
  lazyDepth++;
  try { return parse(def.expr, env); }
  finally { lazyDepth--; }
}

function getProperty(v, name, args) {
  if (v && typeof v === 'object' && v.wpDict) {
    if (args !== null) throw new Error('Propriedade "'+name+'" de dicionário não é uma função');
    if (!(name in v)) throw new Error('Chave "'+name+'" não encontrada no dicionário');
    return v[name];
  }
  if (name === 'ordenada') {
    if (args !== null) throw new Error('"ordenada" não recebe argumentos');
    if (!Array.isArray(v)) throw new Error('"ordenada" só se aplica a listas');
    var sorted = v.slice();
    var allNum = true;
    for (var i = 0; i < sorted.length; i++) {
      if (typeof numVal(sorted[i]) !== 'number') { allNum = false; break; }
    }
    if (allNum) {
      sorted.sort(function (a, b) { return numVal(a) - numVal(b); });
    } else {
      sorted.sort(function (a, b) {
        var sa = String(formatValue(a)), sb = String(formatValue(b));
        return sa < sb ? -1 : sa > sb ? 1 : 0;
      });
    }
    return sorted;
  }
  if (name === 'mínimo' || name === 'máximo') {
    if (args !== null) throw new Error('"' + name + '" não recebe argumentos');
    if (!Array.isArray(v)) throw new Error('"' + name + '" só se aplica a listas');
    if (v.length === 0) throw new Error('"' + name + '": lista vazia');
    var wantLess = name === 'mínimo';
    var bestIdx = -1;
    for (var mnI = 0; mnI < v.length; mnI++) {
      var mv = numVal(v[mnI]);
      if (typeof mv !== 'number' || !isFinite(mv)) throw new Error('"' + name + '" espera uma lista de números');
      if (bestIdx < 0 || (wantLess ? mv < numVal(v[bestIdx]) : mv > numVal(v[bestIdx]))) bestIdx = mnI;
    }
    return v[bestIdx];
  }
  if (name === 'invertida') {
    if (args !== null) throw new Error('"invertida" não recebe argumentos');
    if (Array.isArray(v)) return v.slice().reverse();
    if (typeof v === 'string') return v.split('').reverse().join('');
    throw new Error('"invertida" não se aplica a números puros — use um texto ou uma lista');
  }
  if (name === 'contar') {
    if (args !== null) throw new Error('"contar" não recebe argumentos');
    if (typeof v === 'string') return mkNum(v.length, false);
    if (Array.isArray(v)) return mkNum(v.length, false);
    throw new Error('"contar" não se aplica a números puros — use um texto ou uma lista');
  }
  if (name === 'tamanho') {
    if (args !== null) throw new Error('"tamanho" não recebe argumentos');
    if (typeof v === 'string') return mkNum(v.length, false);
    if (Array.isArray(v)) return mkNum(v.length, false);
    throw new Error('"tamanho" não se aplica a números puros — use um texto ou uma lista');
  }
  if (name === 'primeiro') {
    if (args !== null) throw new Error('"primeiro" não recebe argumentos');
    if (typeof v === 'string') {
      if (v.length === 0) throw new Error('"primeiro": texto vazio');
      return v.charAt(0);
    }
    if (Array.isArray(v)) {
      if (v.length === 0) throw new Error('"primeiro": lista vazia');
      return v[0];
    }
    throw new Error('"primeiro" só se aplica a listas e textos');
  }
  if (name === 'ultimo' || name === 'último') {
    if (args !== null) throw new Error('"ultimo" não recebe argumentos');
    if (typeof v === 'string') {
      if (v.length === 0) throw new Error('"ultimo": texto vazio');
      return v.charAt(v.length - 1);
    }
    if (Array.isArray(v)) {
      if (v.length === 0) throw new Error('"ultimo": lista vazia');
      return v[v.length - 1];
    }
    throw new Error('"ultimo" só se aplica a listas e textos');
  }
  if (name === 'fatiar') {
    if (args === null || args.length !== 2) throw new Error('fatiar espera 2 argumentos: fatiar(início, fim)');
    var fIni = Math.round(numVal(args[0]));
    var fFim = Math.round(numVal(args[1]));
    if (!isFinite(fIni) || !isFinite(fFim) || fIni < 0 || fFim < fIni) throw new Error('fatiar: índices devem ser inteiros válidos (início >=0 e fim >= início)');
    if (typeof v === 'string') {
      if (fFim >= v.length) throw new Error('fatiar: índice final além do tamanho do texto');
      return v.substring(fIni, fFim + 1);
    }
    if (Array.isArray(v)) {
      if (fFim >= v.length) throw new Error('fatiar: índice final além do tamanho da lista');
      return v.slice(fIni, fFim + 1);
    }
    if (typeof v === 'number' || (v && typeof v === 'object' && v.wpn)) {
      var sNum = String(Math.abs(numVal(v))).replace(/[^0-9]/g,'');
      if (fFim >= sNum.length) throw new Error('fatiar: índice final além dos algarismos do número');
      return sNum.substring(fIni, fFim + 1);
    }
    throw new Error('fatiar só se aplica a listas, textos e números');
  }
  if (name === 'maiúsculo' || name === 'maiusculo') {
    if (args !== null) throw new Error('"maiúsculo" não recebe argumentos');
    if (typeof v !== 'string') throw new Error('"maiúsculo" só se aplica a textos');
    return v.toUpperCase();
  }
  if (name === 'minúsculo' || name === 'minusculo') {
    if (args !== null) throw new Error('"minúsculo" não recebe argumentos');
    if (typeof v !== 'string') throw new Error('"minúsculo" só se aplica a textos');
    return v.toLowerCase();
  }
  if (name === 'contarItem') {
    if (args === null || args.length !== 1) throw new Error('contarItem espera 1 argumento: contarItem(valor)');
    if (typeof v === 'string') {
      var ciNeedle = args[0];
      if (typeof ciNeedle !== 'string') throw new Error('"contarItem" espera um texto para buscar dentro de um texto');
      if (ciNeedle.length === 0) throw new Error('"contarItem" espera um trecho não vazio para buscar');
      return mkNum(v.split(ciNeedle).length - 1, false);
    }
    if (Array.isArray(v)) {
      var ciWant = numVal(args[0]);
      var ciCount = 0;
      for (var ciI = 0; ciI < v.length; ciI++) {
        if (numVal(v[ciI]) == ciWant) ciCount++;
      }
      return mkNum(ciCount, false);
    }
    throw new Error('"contarItem" não se aplica a números puros — use um texto ou uma lista');
  }
  if (name === 'adicionar') {
    if (args === null || args.length === 0) throw new Error('adicionar espera ao menos 1 argumento');
    if (Array.isArray(v)) {
      for (var k = 0; k < args.length; k++) v.push(args[k]);
      return v;
    }
    if (typeof v === 'string') {
      var res = v;
      for (var k2 = 0; k2 < args.length; k2++) {
        var av = args[k2];
        res += (typeof av === 'string') ? av : formatValue(av);
      }
      return res;
    }
    throw new Error('"adicionar" só se aplica a listas e textos');
  }
  if (name === 'remover') {
    if (args === null || args.length !== 1) throw new Error('remover espera 1 argumento: remover(posi\u00e7\u00e3o)');
    if (!Array.isArray(v)) throw new Error('"remover" s\u00f3 se aplica a listas');
    var rmIdx = numVal(args[0]);
    if (typeof rmIdx !== 'number' || !isFinite(rmIdx) || Math.floor(rmIdx) !== rmIdx) throw new Error('"remover" espera um n\u00famero inteiro como posi\u00e7\u00e3o');
    if (rmIdx < 0 || rmIdx >= v.length) throw new Error('"remover" recebeu a posi\u00e7\u00e3o ' + formatValue(args[0]) + ', mas a lista s\u00f3 tem ' + v.length + (v.length === 1 ? ' elemento' : ' elementos'));
    v.splice(rmIdx, 1);
    return v;
  }
  if (name === 'aleatório') {
    if (args !== null) throw new Error('"aleatório" não recebe argumentos');
    if (!Array.isArray(v)) throw new Error('"aleatório" só se aplica a listas');
    if (v.length === 0) throw new Error('aleatório: lista vazia');
    return v[Math.floor(Math.random() * v.length)];
  }
  if (name === 'embaralhar') {
    if (args !== null) throw new Error('"embaralhar" não recebe argumentos');
    if (!Array.isArray(v)) throw new Error('"embaralhar" só se aplica a listas');
    for (var s = v.length - 1; s > 0; s--) {
      var r = Math.floor(Math.random() * (s + 1));
      var tmp = v[s]; v[s] = v[r]; v[r] = tmp;
    }
    return v;
  }
  if (name === 'soma') {
    if (args !== null) throw new Error('"soma" não recebe argumentos');
    if (!Array.isArray(v)) throw new Error('"soma" só se aplica a listas');
    if (v.length === 0) throw new Error('"soma": lista vazia');
    var allNum = true;
    var hasFloat = false;
    for (var si = 0; si < v.length; si++) {
      var sv = numVal(v[si]);
      if (typeof sv !== 'number' || !isFinite(sv)) { allNum = false; break; }
      if (Math.floor(sv) !== sv) hasFloat = true;
    }
    if (allNum) {
      var total = 0;
      for (var si = 0; si < v.length; si++) total += numVal(v[si]);
      return mkNum(total, hasFloat);
    }
    var parts = [];
    for (var si = 0; si < v.length; si++) parts.push(formatValue(v[si]));
    return parts.join('');
  }
  if (name === 'distintos') {
    if (args !== null) throw new Error('"distintos" não recebe argumentos');
    if (typeof v === 'string') {
      var seen = {};
      var out = '';
      for (var dI = 0; dI < v.length; dI++) {
        var dCh = v[dI];
        if (!seen[dCh]) { seen[dCh] = true; out += dCh; }
      }
      return out;
    }
    if (Array.isArray(v)) {
      var dSeen = {};
      var dOut = [];
      for (var dJ = 0; dJ < v.length; dJ++) {
        var dKey = formatValue(v[dJ]);
        if (!dSeen[dKey]) { dSeen[dKey] = true; dOut.push(v[dJ]); }
      }
      return dOut;
    }
    throw new Error('"distintos" não se aplica a números puros — use um texto ou uma lista');
  }
  throw new Error('Propriedade desconhecida: "' + name + '"');
}

function indexKey(v) {
  var n = numVal(v);
  if (typeof n === 'number' && isFinite(n)) {
    if (Object.is && Object.is(n, -0)) return '0';
    if (Math.floor(n) === n) return String(n);
    return String(n);
  }
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'string') return 's:' + v;
  return 'v:' + formatValue(v);
}

function isIndexedVar(v) {
  return !!(v && typeof v === 'object' && v.wpIndexed);
}

function ensureIndexedVar(env, name) {
  var cur = env[name];
  if (isIndexedVar(cur)) return cur;
  var idxd = { wpIndexed: true, map: Object.create(null), hasDef: false, def: undefined };
  if (cur !== undefined && !Array.isArray(cur) && !(cur && cur.wpFunc) && !(cur && cur.wpLazy)) {
    idxd.hasDef = true;
    idxd.def = cur;
  }
  env[name] = idxd;
  return idxd;
}

function getIndexedVal(idxd, key) {
  if (Object.prototype.hasOwnProperty.call(idxd.map, key)) return idxd.map[key];
  if (idxd.hasDef) return idxd.def;
  throw new Error('Índice não definido');
}

function formatIndexedVar(v) {
  var keys = Object.keys(v.map);
  keys.sort(function (a, b) {
    var na = Number(a), nb = Number(b);
    var aNum = a !== '' && !isNaN(na) && String(na) === a;
    var bNum = b !== '' && !isNaN(nb) && String(nb) === b;
    if (aNum && bNum) return na - nb;
    if (aNum) return -1;
    if (bNum) return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
  if (keys.length === 0) {
    return v.hasDef ? formatValue(v.def) : '(vazio)';
  }
  var parts = [];
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var label = k.indexOf('s:') === 0 ? JSON.stringify(k.slice(2)) : (k.indexOf('v:') === 0 ? k.slice(2) : k);
    parts.push(label + ':' + formatValue(v.map[k]));
  }
  return parts.join(', ');
}

function parseIndexedAssign(line) {
  var m = line.match(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*\(/);
  if (!m) return null;
  var name = m[1];
  var start = m[0].length;
  var depth = 1;
  var inStr = null;
  var i = start;
  for (; i < line.length; i++) {
    var ch = line[i];
    if (inStr) {
      if (ch === '\\' && i + 1 < line.length) i++;
      else if (ch === inStr) inStr = null;
    } else if (ch === '"' || ch === "'") {
      inStr = ch;
    } else if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0) break;
    }
  }
  if (depth !== 0) return null;
  var idxExpr = line.slice(start, i).trim();
  if (!idxExpr) return null;
  var rest = line.slice(i + 1).replace(/^\s+/, '');
  var opm = rest.match(/^(:=|\*\*=|\+=|-=|\*=|\/=|=)\s*([\s\S]*)$/);
  if (!opm) return null;
  if (opm[1] === '=' && rest.charAt(1) === '=') return null;
  return { name: name, idxExpr: idxExpr, op: opm[1], expr: opm[2] };
}

function formatNumber(x, f) {
  if (!isFinite(x)) return String(x);
  if (f && x === Math.floor(x)) return x.toFixed(1);
  return String(Number(x.toPrecision(15)));
}

function formatValue(v) {
  if (typeof v === 'string') return v;
  if (typeof v === 'boolean') return v ? 'verdadeiro' : 'falso';
  if (v && typeof v === 'object' && v.wpn) return formatNumber(v.v, v.f);
  if (typeof v === 'number') return formatNumber(v, false);
  if (isIndexedVar(v)) return formatIndexedVar(v);
  if (Array.isArray(v)) {
    var parts = [];
    for (var i = 0; i < v.length; i++) parts.push(formatValue(v[i]));
    return parts.join(',');
  }
  return String(v);
}

var ASSIGN_RE = /^([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*=\s*(.+)$/;
var COMPOUND_ASSIGN_RE = /^([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*(\*\*=|\+=|-=|\*=|\/=)\s*(.+)$/;
var LAZY_ASSIGN_RE = /^([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*:=\s*(.+)$/;
var LEIA_ASSIGN_RE = /^([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*=\s*leia\b\s*(.*)$/;
var CONSTANT_RE = /^constante\s+([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*(=|:=)\s*(.+)$/i;
var DICT_ASSIGN_RE = /^([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*\.\s*([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*=\s*(.+)$/;
var CONSTANTS = Object.create(null);
function isConstant(name){
  var n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c');
  for (var k in CONSTANTS) { if (!Object.prototype.hasOwnProperty.call(CONSTANTS, k)) continue; if (k.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c')===n) return true; }
  return false;
}

function parseMultiAssignLHS(line) {
  var eq = -1;
  var depth = 0;
  var inStr = null;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (inStr) {
      if (c === '\\' && i + 1 < line.length) i++;
      else if (c === inStr) inStr = null;
    } else if (c === '"' || c === "'") {
      inStr = c;
    } else if (c === '(' || c === '[' || c === '{') {
      depth++;
    } else if (c === ')' || c === ']' || c === '}') {
      depth--;
    } else if (c === '=' && depth === 0) {
      eq = i;
      break;
    }
  }
  if (eq <= 0) return null;
  var lhs = line.slice(0, eq).trim();
  if (lhs.indexOf(',') < 0) return null;
  var names = [];
  var parts = lhs.split(',');
  for (var j = 0; j < parts.length; j++) {
    var nm = parts[j].trim();
    if (!/^[A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][A-Za-z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF]*$/.test(nm)) return null;
    names.push(nm);
  }
  return { names: names, expr: line.slice(eq + 1).trim() };
}

function splitStatements(line) {
  var parts = [];
  var cur = '';
  var quote = null;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (quote) {
      cur += ch;
      if (ch === '\\' && i + 1 < line.length) { cur += line[i + 1]; i++; }
      else if (ch === quote) quote = null;
    } else {
      if (ch === '"' || ch === "'") { quote = ch; cur += ch; }
      else if (ch === ';') { parts.push(cur); cur = ''; }
      else cur += ch;
    }
  }
  parts.push(cur);
  return parts;
}

function stripBlockComments(code) {
  var out = '';
  var i = 0, n = code.length;
  var quote = null;
  while (i < n) {
    var ch = code[i];
    if (quote) {
      out += ch;
      if (ch === '\\' && i + 1 < n) { out += code[i + 1]; i += 2; continue; }
      if (ch === quote) quote = null;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      out += ch;
      i++;
      continue;
    }
    if (ch === '#' && code[i + 1] === ':') {
      i += 2;
      while (i < n) {
        if (code[i] === ':' && code[i + 1] === '#') { i += 2; break; }
        if (code[i] === '\n') out += '\n';
        else if (code[i] === '\r') {
          if (code[i + 1] === '\n') { out += '\n'; i++; }
          else out += '\n';
        }
        i++;
      }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

function stripInlineComment(line) {
  var quote = null;
  for (var i = 0; i < line.length; i++) {
    var ch = line[i];
    if (quote) {
      if (ch === '\\' && i + 1 < line.length) i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '#') {
      return line.slice(0, i);
    }
  }
  return line;
}

function countIndent(str) {
  var n = 0;
  for (var i = 0; i < str.length; i++) {
    if (str[i] === ' ') n++;
    else if (str[i] === '\t') n += 4;
    else break;
  }
  return n;
}

function stringOpenAtEnd(text) {
  var quote = null;
  for (var i = 0; i < text.length; i++) {
    var ch = text[i];
    if (quote) {
      if (ch === '\\' && i + 1 < text.length) { i++; continue; }
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    }
  }
  return quote;
}

function endsWithStringContinuation(text) {
  if (!stringOpenAtEnd(text)) return false;
  return /_\s*$/.test(text);
}

function toStatements(code) {
  var stmts = [];
  var rawLines = stripBlockComments(code).split('\n');
  var i = 0;
  while (i < rawLines.length) {
    var indent = countIndent(rawLines[i]);
    var logical = rawLines[i];
    var firstLine = i + 1;
    while (i + 1 < rawLines.length && endsWithStringContinuation(logical)) {
      logical = logical.replace(/_\s*$/, '');
      i++;
      logical += rawLines[i].replace(/^[ \t]+/, '');
    }
    if (endsWithStringContinuation(logical)) {
      logical = logical.replace(/_\s*$/, '');
    }
    i++;
    logical = stripInlineComment(logical);
    var parts = splitStatements(logical.trim());
    for (var j = 0; j < parts.length; j++) {
      var text = parts[j].trim();
      if (!text) continue;
      stmts.push({ indent: indent, text: text, lineNo: firstLine });
    }
  }
  return stmts;
}

function isSe(text) { return /^se\b/.test(text); }
function isSenao(text) { var t=text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); return /^(senao)\s*:\s*$/.test(t); }
function isParaCada(text) { return /^para\b/.test(text); }
function isRepita(text) { return /^repita\b/.test(text); }
function isEnquanto(text) { return /^enquanto\b/.test(text); }
function isSelecionarOpcao(text) { return /^selecionar\s+op[cç](?:ã|a)o\s*:\s*$/i.test(text); }
function isEmJanela(text) { return /^em\s*janela\s*(?:\(\s*centralizar\s*\))?\s*:\s*$/i.test(text); }
function isEmJanelaCentered(text) { return /^em\s*janela\s*\(\s*centralizar\s*\)\s*:\s*$/i.test(text); }
function isEscolha(text){ return /^escolha\b/i.test(text); }
function isCaso(text){ return /^caso\b/i.test(text); }
function isPadrao(text){ return /^(padrao|padrão)\s*:/i.test(text); }
function extractEscolha(text){ var rest = text.replace(/^escolha\b/i,'').trim(); rest = rest.replace(/:+\s*$/,'').trim(); return rest; }
function isRotulo(text) { return /^:\s*[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*\s*$/.test(text); }
function extractRotulo(text) { return text.replace(/^:\s*/, '').trim(); }
function isVaPara(text) { return /^v[áa]\s+para\b/.test(text); }
function extractVaPara(text) {
  var rest = text.replace(/^v[áa]\s+para\b/, '').trim();
  if (!/^[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*$/.test(rest)) {
    throw new Error('Sintaxe inválida: use "vá para <rótulo>", ex.: vá para início');
  }
  return rest;
}

function extractSeCond(text) {
  var cond = text.replace(/^se\b/, '').trim();
  cond = cond.replace(/:+\s*$/, '').trim();
  return cond;
}

function extractEnquanto(text) {
  var cond = text.replace(/^enquanto\b/, '').trim();
  cond = cond.replace(/:+\s*$/, '').trim();
  return cond;
}

function extractParaCada(text) {
  var rest = text.replace(/^para(?:\s+cada)?\b/, '').trim();
  rest = rest.replace(/:+\s*$/, '').trim();
  var m = rest.match(/^([A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_][A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s+em\s+(.+)$/);
  if (!m) throw new Error('Sintaxe inválida: use "para <variável> em <expressão>:" ou "para cada <variável> em <expressão>:"');
  return { varName: m[1], expr: m[2].trim() };
}

function extractRepita(text) {
  var rest = text.replace(/^repita\b/, '').trim();
  rest = rest.replace(/:+\s*$/, '').trim();
  var m = rest.match(/^\((.+)\)$/);
  if (!m) throw new Error('Sintaxe inválida: use "repita(<quantidade>):"');
  return m[1].trim();
}

function findTopLevelComma(s) {
  var depth = 0, inStr = null;
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
    if (inStr) {
      if (c === inStr) inStr = null;
    } else if (c === '"' || c === "'") {
      inStr = c;
    } else if (c === '(' || c === '[' || c === '{') {
      depth++;
    } else if (c === ')' || c === ']' || c === '}') {
      depth--;
    } else if (c === ',' && depth === 0) {
      return i;
    }
  }
  return -1;
}

function evaluateCollection(expr, env) {
  var trimmed = expr.trim();
  if (trimmed.charAt(0) === '(' && trimmed.charAt(trimmed.length - 1) === ')') {
    var inner = trimmed.slice(1, -1).trim();
    var comma = findTopLevelComma(inner);
    if (comma >= 0) {
      var parts = [];
      var rest2 = inner;
      while (true) {
        var cm = findTopLevelComma(rest2);
        if (cm < 0) { parts.push(rest2.trim()); break; }
        parts.push(rest2.slice(0, cm).trim());
        rest2 = rest2.slice(cm + 1);
      }
      if (parts.length < 2 || parts.length > 3) throw new Error('Intervalo deve ter 2 ou 3 valores');
      var elems = [];
      for (var i = 0; i < parts.length; i++) elems.push(parse(parts[i], env));
      return buildRange(elems);
    }
    var innerVal = parse(inner, env);
    if (typeof innerVal === 'string') return innerVal.split('');
    return [innerVal];
  }
  var val = parse(trimmed, env);
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split('');
  throw new Error('Não é possível iterar sobre o valor');
}

function parseBlock(stmts, index, minIndent, stopAtSenao) {
  var nodes = [];
  var senao = null;
  while (index < stmts.length) {
    var s = stmts[index];
    if (s.indent <= minIndent) break;
    if (isSenao(s.text)) {
      if (stopAtSenao) { senao = s; break; }
      index++;
      continue;
    }
    if (isSe(s.text)) {
      var r = parseSe(stmts, index);
      nodes.push(r.node);
      index = r.index;
    } else if (isParaCada(s.text)) {
      var r2 = parseParaCada(stmts, index);
      nodes.push(r2.node);
      index = r2.index;
    } else if (isRepita(s.text)) {
      var r3 = parseRepita(stmts, index);
      nodes.push(r3.node);
      index = r3.index;
    } else if (isEnquanto(s.text)) {
      var r4 = parseEnquanto(stmts, index);
      nodes.push(r4.node);
      index = r4.index;
    } else if (isRegressiva(s.text)) {
      var rRg = parseRegressiva(stmts, index);
      nodes.push(rRg.node);
      index = rRg.index;
    } else if (isDefinirFuncao(s.text)) {
      var r5 = parseDefinirFuncao(stmts, index);
      nodes.push(r5.node);
      index = r5.index;
    } else if (isSelecionarOpcao(s.text)) {
      var r6 = parseSelecionarOpcao(stmts, index);
      nodes.push(r6.node);
      index = r6.index;
    } else if (isEscolha(s.text)) {
      var rE = parseEscolha(stmts, index);
      nodes.push(rE.node);
      index = rE.index;
    } else if (isEmJanela(s.text)) {
      var r7 = parseEmJanela(stmts, index);
      nodes.push(r7.node);
      index = r7.index;
    } else if (isRotulo(s.text)) {
      nodes.push({ type: 'rotulo', name: extractRotulo(s.text), lineNo: s.lineNo });
      index++;
    } else {
      if (/^em\s*janela\s*\(/i.test(s.text)) {
        var emArg = s.text.match(/^em\s*janela\s*\(\s*([^)]*)\s*\)/i);
        var emInner = emArg ? emArg[1].trim() : '';
        if (!emInner) {
          throw new Error('Sintaxe inválida: use "emJanela:" ou "emJanela(centralizar):" (com o bloco indentado)');
        }
        if (!/^centralizar$/i.test(emInner)) {
          throw new Error('Sintaxe inválida: o argumento de emJanela deve ser "centralizar", ex.: emJanela(centralizar):');
        }
        if (!/:\s*$/.test(s.text)) {
          throw new Error('Sintaxe inválida: use "emJanela(centralizar):" seguido do bloco indentado');
        }
      }
      nodes.push({ type: 'stmt', text: s.text, lineNo: s.lineNo });
      index++;
    }
  }
  return { nodes: nodes, index: index, senao: senao };
}

function parseSe(stmts, index) {
  var s = stmts[index];
  var seIndent = s.indent;
  var cond = extractSeCond(s.text);
  var idx = index + 1;
  var r = parseBlock(stmts, idx, seIndent, true);
  var thenNodes = r.nodes;
  var elseNodes = [];
  var idxAfter = r.index;
  if (r.senao) {
    idxAfter = r.index + 1;
    var e = parseBlock(stmts, idxAfter, seIndent, false);
    elseNodes = e.nodes;
    idxAfter = e.index;
  } else {
    var nx = stmts[idxAfter];
    if (nx && isSenao(nx.text) && nx.indent <= seIndent) {
      idxAfter++;
      var e2 = parseBlock(stmts, idxAfter, seIndent, false);
      elseNodes = e2.nodes;
      idxAfter = e2.index;
    }
  }
  return { node: { type: 'if', cond: cond, then: thenNodes, els: elseNodes, lineNo: s.lineNo }, index: idxAfter };
}

function parseParaCada(stmts, index) {
  var s = stmts[index];
  var p = extractParaCada(s.text);
  var r = parseBlock(stmts, index + 1, s.indent, false);
  return { node: { type: 'for', var: p.varName, expr: p.expr, body: r.nodes, lineNo: s.lineNo }, index: r.index };
}

function parseRepita(stmts, index) {
  var s = stmts[index];
  var countExpr = extractRepita(s.text);
  var r = parseBlock(stmts, index + 1, s.indent, false);
  return { node: { type: 'repeat', count: countExpr, body: r.nodes, lineNo: s.lineNo }, index: r.index };
}

function parseEnquanto(stmts, index) {
  var s = stmts[index];
  var cond = extractEnquanto(s.text);
  var r = parseBlock(stmts, index + 1, s.indent, false);
  return { node: { type: 'while', cond: cond, body: r.nodes, lineNo: s.lineNo }, index: r.index };
}

function parseEscolha(stmts, index){
  var s = stmts[index];
  var expr = extractEscolha(s.text);
  if (!expr) throw new Error('Sintaxe inválida: use "escolha <expressão>:"');
  var escolhaIndent = s.indent;
  var cases = [];
  var padrao = null;
  var idx = index + 1;
  while (idx < stmts.length){
    var line = stmts[idx];
    if (line.indent <= escolhaIndent) break;
    if (isCaso(line.text)){
      var m = line.text.match(/^caso\s+(.*?):\s*(.*)$/i);
      if (!m) throw new Error('Sintaxe inválida: use "caso <valor>:"');
      var valExpr = m[1].trim();
      var inline = m[2].trim();
      var casoIndent = line.indent;
      var bodyNodes = [];
      if (inline){
        bodyNodes.push({ type:'stmt', text:inline, lineNo: line.lineNo });
      }
      var r = parseBlock(stmts, idx+1, casoIndent, false);
      bodyNodes = bodyNodes.concat(r.nodes);
      cases.push({ value: valExpr, body: bodyNodes, lineNo: line.lineNo });
      idx = r.index;
    } else if (isPadrao(line.text)){
      var m2 = line.text.match(/^(padrao|padrão)\s*:\s*(.*)$/i);
      var inline2 = m2[2] ? m2[2].trim() : '';
      var padIndent = line.indent;
      var padBody = [];
      if (inline2){
        padBody.push({ type:'stmt', text:inline2, lineNo: line.lineNo });
      }
      var r2 = parseBlock(stmts, idx+1, padIndent, false);
      padBody = padBody.concat(r2.nodes);
      padrao = { body: padBody, lineNo: line.lineNo };
      idx = r2.index;
    } else {
      throw new Error('Dentro de "escolha" use "caso <valor>:" ou "padrao:"');
    }
  }
  if (cases.length===0 && !padrao) throw new Error('escolha sem casos: adicione ao menos um "caso <valor>:" ou "padrao:"');
  return { node: { type:'escolha', expr: expr, cases: cases, padrao: padrao, lineNo: s.lineNo }, index: idx };
}
function isRegressiva(text) { return /^regressiva\b/.test(text); }

function parseRegressiva(stmts, index) {
  var s = stmts[index];
  var m = s.text.match(/^regressiva\s*\(([^)]*)\)\s*(:)\s*$/);
  if (!m) throw new Error('Sintaxe inválida: use "regressiva(segundos):" seguido do bloco indentado que será executado quando a contagem terminar');
  var rgR = parseBlock(stmts, index + 1, s.indent, false);
  return { node: { type: 'regressiva', secs: m[1].trim(), body: rgR.nodes, lineNo: s.lineNo }, index: rgR.index };
}

function parseSelecionarOpcao(stmts, index) {
  var s = stmts[index];
  var selIndent = s.indent;
  var options = [];
  var idx = index + 1;
  while (idx < stmts.length) {
    var line = stmts[idx];
    if (line.indent <= selIndent) break;
    var m = line.text.match(/^<([A-Za-z0-9])>\s*(?:"([^"]*)"|'([^']*)')\s*:\s*$/);
    if (!m) {
      var err = new Error('Opção inválida em "selecionar opção": use "<chave> "título":", ex.: <1> "Mostrar mensagem":');
      err.lineNo = line.lineNo;
      throw err;
    }
    var r = parseBlock(stmts, idx + 1, line.indent, false);
    options.push({ key: m[1].toUpperCase(), title: m[2] !== undefined ? m[2] : m[3], body: r.nodes, lineNo: line.lineNo });
    idx = r.index;
  }
  if (options.length === 0) {
    var err2 = new Error('"selecionar opção" espera ao menos uma opção: use "<chave> "título":", ex.: <1> "Mostrar mensagem":');
    err2.lineNo = s.lineNo;
    throw err2;
  }
  return { node: { type: 'select', options: options, lineNo: s.lineNo }, index: idx };
}

function parseEmJanela(stmts, index) {
  var s = stmts[index];
  var r = parseBlock(stmts, index + 1, s.indent, false);
  return { node: { type: 'window', body: r.nodes, lineNo: s.lineNo, centered: isEmJanelaCentered(s.text) }, index: r.index };
}

function isDefinirFuncao(text) { return /^definir\s+fun[çc](?:ão|ao)\b/.test(text); }

function parseDefinirFuncao(stmts, index) {
  var s = stmts[index];
  var m = s.text.match(/^definir\s+fun[çc](?:ão|ao)\s+([A-Za-z_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF][A-Za-z0-9_\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]*)\s*\(([^)]*)\)\s*:?\s*$/);
  if (!m) throw new Error('Sintaxe inválida: use "definir função <nome>(<parâmetros>):"');
  var params = [];
  var rawParams = m[2].split(',');
  for (var i = 0; i < rawParams.length; i++) {
    var p = rawParams[i].trim();
    if (p) params.push(p);
  }
  var r = parseBlock(stmts, index + 1, s.indent, false);
  return { node: { type: 'func', name: m[1], params: params, body: r.nodes, lineNo: s.lineNo }, index: r.index };
}

function parseProgram(code) {
  var stmts = toStatements(code);
  var r = parseBlock(stmts, 0, -1, false);
  return r.nodes;
}

function execStatement(line, lineNo, env, out, noRerun) {
  try {
    if (!noRerun && /capture\s*tecla\s*\(/i.test(line)) {
      out.push({ kind: 'rerun', line: line, lineNo: lineNo });
      return true;
    }
    if (/^(retorne|retornar)\b/.test(line)) {
      var retRest = line.replace(/^(retorne|retornar)\b/, '').trim();
      if (!retRest) throw { wpReturn: true, value: undefined };
      var retParts = splitSaveValueTopLevel(retRest);
      var retVals = [];
      for (var ri = 0; ri < retParts.length; ri++) {
        retVals.push(parse(retParts[ri].trim(), env));
      }
      throw { wpReturn: true, value: retVals.length === 1 ? retVals[0] : retVals };
    }
    if (/^pare\s*$/.test(line)) {
      throw { wpPare: true, lineNo: lineNo };
    }
    if (/^continue\s*$/.test(line)) {
      throw { wpContinue: true, lineNo: lineNo };
    }
    if (isVaPara(line)) {
      throw { wpGoto: true, target: extractVaPara(line), lineNo: lineNo };
    }
    var constM = line.match(CONSTANT_RE);
    if (constM) {
      var cName = constM[1];
      var cOp = constM[2];
      var cExpr = constM[3];
      if (isConstant(cName)) throw new Error('Constante "'+cName+'" já definida e não pode ser alterada');
      var cnorm = cName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c');
      var foundVar = false;
      for (var ek in env) { if (!Object.prototype.hasOwnProperty.call(env, ek)) continue; if (ek.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c')===cnorm) { foundVar = true; break; } }
      if (foundVar) throw new Error('Não é possível criar constante "'+cName+'": já existe variável com esse nome');
      if (cOp === ':=') {
        env[cName] = { wpLazy: true, expr: cExpr };
        CONSTANTS[cName]=true;
        out.push({ kind: 'assign', text: cName+' = '+cExpr, lineNo: lineNo });
      } else {
        var cVal = parse(cExpr, env);
        env[cName]=cVal;
        CONSTANTS[cName]=true;
        out.push({ kind: 'assign', text: cName+' = '+formatValue(cVal), lineNo: lineNo });
      }
      return false;
    }
    var dictAssign = line.match(DICT_ASSIGN_RE);
    if (dictAssign) {
      var dictName = dictAssign[1];
      var propName = dictAssign[2];
      var dictExpr = dictAssign[3];
      var actualDictKey = null;
      var normDict = dictName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c');
      for (var kk in env) { if (kk.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c')===normDict) { actualDictKey = kk; break; } }
      if (!actualDictKey) throw new Error('Variável não definida: '+dictName);
      var dictObj = env[actualDictKey];
      if (!dictObj || typeof dictObj !== 'object' || !dictObj.wpDict) throw new Error('"'+dictName+'" não é um dicionário');
      if (isConstant(dictName)) throw new Error('Não é possível alterar constante "'+dictName+'"');
      var dictVal = parse(dictExpr, env);
      dictObj[propName] = dictVal;
      out.push({ kind: 'assign', text: dictName+'.'+propName+' = '+formatValue(dictVal), lineNo: lineNo });
      return false;
    }
    var multiM = parseMultiAssignLHS(line);
    if (multiM) {
      for (var _cm=0; _cm<multiM.names.length; _cm++) if (isConstant(multiM.names[_cm])) throw new Error('Não é possível alterar constante "'+multiM.names[_cm]+'"');
      var rhsVal = parse(multiM.expr, env);
      if (!Array.isArray(rhsVal)) throw new Error('A atribuição múltipla espera uma lista de valores (ex.: retorne 1, 2)');
      if (rhsVal.length !== multiM.names.length) {
        throw new Error('A atribuição múltipla espera ' + multiM.names.length + ' valor(es), mas a expressão devolveu ' + rhsVal.length);
      }
      for (var ma = 0; ma < multiM.names.length; ma++) env[multiM.names[ma]] = rhsVal[ma];
      out.push({ kind: 'assign', text: multiM.names.join(', ') + ' = ' + formatValue(rhsVal), lineNo: lineNo });
    } else if (/^mostre\b/.test(line)) {
      var rest = line.replace(/^mostre\b/, '').trim();
      out.push({ kind: 'out', text: formatValue(parse(rest, env)), lineNo: lineNo });
    } else if (/^limpe\b/.test(line)) {
      out.push({ kind: 'clear', lineNo: lineNo });
    } else if (/^pausa\s*\(/.test(line)) {
      var pauseM = line.match(/^pausa\s*\(([^)]*)\)\s*$/);
      var pauseSecs = null;
      if (pauseM && pauseM[1].trim()) pauseSecs = numVal(parse(pauseM[1].trim(), env));
      if (typeof pauseSecs !== 'number' || !isFinite(pauseSecs) || pauseSecs < 0) {
        throw new Error('pausa espera os segundos de pausa, que podem ser fracionados (ex.: pausa(2) ou pausa(0.5))');
      }
      out.push({ kind: 'pause', text: 'Pausando por ' + String(Number(pauseSecs.toPrecision(15))) + ' segundo(s)...', secs: pauseSecs, lineNo: lineNo });
    } else if (/^bipe\s*\(/.test(line)) {
      var bipeM = line.match(/^bipe\s*\(([^)]*)\)\s*$/);
      var bipeSecs = null;
      if (bipeM && bipeM[1].trim()) bipeSecs = numVal(parse(bipeM[1].trim(), env));
      if (typeof bipeSecs !== 'number' || !isFinite(bipeSecs) || bipeSecs <= 0) {
        throw new Error('bipe espera os segundos de duração, que podem ser fracionados (ex.: bipe(0.075))');
      }
      out.push({ kind: 'sound', text: 'Bipe de ' + String(Number(bipeSecs.toPrecision(15))) + ' segundo(s)...', secs: bipeSecs, lineNo: lineNo });
    } else if (/^som\s*\(/.test(line)) {
      var somM = line.match(/^som\s*\(([^)]*)\)\s*$/);
      var somF = null;
      var somS = null;
      if (somM && somM[1].trim()) {
        var somParts = splitTopLevelArgs(somM[1]);
        if (somParts.length !== 2) throw new Error('som espera 2 argumentos: som(frequência, segundos)');
        somF = numVal(parse(somParts[0].trim(), env));
        somS = numVal(parse(somParts[1].trim(), env));
      }
      if (typeof somF !== 'number' || !isFinite(somF) || somF < 37 || somF > 32767) {
        throw new Error('som: a frequência deve ser um número entre 37 e 32767 Hz');
      }
      if (typeof somS !== 'number' || !isFinite(somS) || somS <= 0) {
        throw new Error('som: os segundos devem ser um número positivo (ex.: som(880, 0.5))');
      }
      out.push({ kind: 'sound', freq: somF, secs: somS, lineNo: lineNo });
    } else if (/^toca\s*\(/.test(line)) {
      var tocaM = line.match(/^toca\s*\(([^)]*)\)\s*$/);
      if (!tocaM || !tocaM[1].trim()) throw new Error('toca espera as notas e o tempo: toca("C", "D", "E", 0.5)');
      var tocaParts = splitTopLevelArgs(tocaM[1]);
      if (tocaParts.length < 2) throw new Error('toca espera as notas e o tempo: toca("C", "D", "E", 0.5)');
      var tocaSecs = numVal(parse(tocaParts[tocaParts.length - 1].trim(), env));
      if (typeof tocaSecs !== 'number' || !isFinite(tocaSecs) || tocaSecs <= 0) {
        throw new Error('toca: o último argumento deve ser o tempo em segundos, inteiro ou decimal (ex.: toca("C", "D", 0.5))');
      }
      var tocaFreqs = [];
      for (var ti = 0; ti < tocaParts.length - 1; ti++) {
        var tn = tocaNota(parse(tocaParts[ti].trim(), env));
        var tf2 = notaFreq(tn);
        if (tf2 === null) throw new Error('toca: nota musical inválida "' + tn + '"');
        tocaFreqs.push(tf2);
      }
      out.push({ kind: 'melody', freqs: tocaFreqs, secs: tocaSecs, lineNo: lineNo });
    } else if (/^mensagem\s*\(/.test(line)) {
      var msgOpen = line.indexOf('(');
      var msgClose = -1, msgDepth = 0, msgInStr = null;
      for (var msgI = msgOpen; msgI < line.length; msgI++) {
        var msgC = line.charAt(msgI);
        if (msgInStr) {
          if (msgC === '\\' && msgI + 1 < line.length) { msgI++; continue; }
          if (msgC === msgInStr) msgInStr = null;
        } else if (msgC === '"' || msgC === "'") {
          msgInStr = msgC;
        } else if (msgC === '(') {
          msgDepth++;
        } else if (msgC === ')') {
          msgDepth--;
          if (msgDepth === 0) { msgClose = msgI; break; }
        }
      }
      if (msgOpen < 0 || msgClose < 0 || line.slice(msgClose + 1).trim() !== '') {
        throw new Error('mensagem espera 2 argumentos: mensagem("T\u00edtulo da janela", "mensagem")');
      }
      var msgInner = line.slice(msgOpen + 1, msgClose).trim();
      if (!msgInner) throw new Error('mensagem espera 2 argumentos: mensagem("T\u00edtulo da janela", "mensagem")');
      var msgParts = splitTopLevelArgs(msgInner);
      if (msgParts.length !== 2) throw new Error('mensagem espera 2 argumentos: mensagem("T\u00edtulo da janela", "mensagem")');
      var msgT = parse(msgParts[0].trim(), env);
      var msgB = parse(msgParts[1].trim(), env);
      if (typeof msgT !== 'string') throw new Error('mensagem: o t\u00edtulo deve ser um texto entre aspas');
      if (typeof msgB !== 'string') throw new Error('mensagem: o conte\u00fado deve ser um texto entre aspas');
      out.push({ kind: 'message', title: msgT, body: msgB, lineNo: lineNo });
    } else if (/^aguarde\s*tecla\s*\(/i.test(line)) {
      var wtM = line.match(/^aguarde\s*tecla\s*\(\s*([^)]*)\s*\)\s*$/i);
      if (!wtM) throw new Error('aguardeTecla espera aguardeTecla("tecla") ou aguardeTecla() para qualquer tecla');
      var wtKey = null;
      if (wtM[1].trim()) {
        var wtV = parse(wtM[1].trim(), env);
        if (typeof wtV !== 'string' || wtV.length !== 1) {
          throw new Error('aguardeTecla espera exatamente 1 caractere entre aspas (ex.: aguardeTecla("Z")) ou nenhum para qualquer tecla');
        }
        wtKey = wtV.toLowerCase();
      }
      out.push({ kind: 'waitKey', key: wtKey, text: 'Aguardando tecla!', lineNo: lineNo });
    } else {
      var readM = line.match(LEIA_ASSIGN_RE);
      if (readM) {
        if (isConstant(readM[1])) throw new Error('Não é possível alterar constante "'+readM[1]+'"');
        var readMsg = readM[2].trim() ? String(formatValue(parse(readM[2].trim(), env))) : '';
        var raw = null;
        if (WP_INPUT_CTX && !WP_NO_INPUT_DEFER) {
          if (!WP_INPUT_QUEUE.length) throw { wpInput: true, name: readM[1], msg: readMsg, lineNo: lineNo };
          raw = WP_INPUT_QUEUE.shift();
        } else {
          raw = window.prompt(readMsg);
        }
        if (raw === null) throw new Error('Entrada cancelada');
        var trimmed = raw.trim();
        var numTxt = trimmed;
        if (numTxt.indexOf(',') !== -1 && numTxt.indexOf('.') === -1) numTxt = numTxt.replace(/,/g, '.');
        var isNum = /^[-+]?\d*\.?\d+$/.test(numTxt);
        var storedVal = isNum ? mkNum(parseFloat(numTxt), numTxt.indexOf('.') >= 0) : trimmed;
        env[readM[1]] = storedVal;
        out.push({ kind: 'assign', text: readM[1] + ' = ' + formatValue(storedVal), lineNo: lineNo });
      } else {
        var idxAssign = parseIndexedAssign(line);
        if (idxAssign) {
          if (isConstant(idxAssign.name)) throw new Error('Não é possível alterar constante "'+idxAssign.name+'"');
          var idxVal = parse(idxAssign.idxExpr, env);
          var idxd = ensureIndexedVar(env, idxAssign.name);
          var ikey = indexKey(idxVal);
          var newVal;
          if (idxAssign.op === ':=') {
            idxd.map[ikey] = { wpLazy: true, expr: idxAssign.expr };
            out.push({ kind: 'assign', text: idxAssign.name + '(' + formatValue(idxVal) + ') := ' + idxAssign.expr, lineNo: lineNo });
          } else if (idxAssign.op === '=') {
            if (/^leia\b/.test(idxAssign.expr.trim())) {
              var readRest = idxAssign.expr.trim().replace(/^leia\b/, '').trim();
              var readMsg2 = readRest ? String(formatValue(parse(readRest, env))) : '';
              var raw2 = null;
              if (WP_INPUT_CTX && !WP_NO_INPUT_DEFER) {
                if (!WP_INPUT_QUEUE.length) throw { wpInput: true, name: idxAssign.name, msg: readMsg2, lineNo: lineNo };
                raw2 = WP_INPUT_QUEUE.shift();
              } else {
                raw2 = window.prompt(readMsg2);
              }
              if (raw2 === null) throw new Error('Entrada cancelada');
              var trimmed2 = raw2.trim();
              var numTxt2 = trimmed2;
              if (numTxt2.indexOf(',') !== -1 && numTxt2.indexOf('.') === -1) numTxt2 = numTxt2.replace(/,/g, '.');
              var isNum2 = /^[-+]?\d*\.?\d+$/.test(numTxt2);
              newVal = isNum2 ? mkNum(parseFloat(numTxt2), numTxt2.indexOf('.') >= 0) : trimmed2;
            } else {
              newVal = parse(idxAssign.expr, env);
            }
            idxd.map[ikey] = newVal;
            out.push({ kind: 'assign', text: idxAssign.name + '(' + formatValue(idxVal) + ') = ' + formatValue(newVal), lineNo: lineNo });
          } else {
            var curI = Object.prototype.hasOwnProperty.call(idxd.map, ikey) ? idxd.map[ikey] : (idxd.hasDef ? idxd.def : mkNum(0, false));
            if (curI && curI.wpLazy) curI = lazyEval(curI, env);
            var opSymI = idxAssign.op.slice(0, -1);
            var rightI = parse(idxAssign.expr, env);
            newVal = binOp(curI, rightI, function (a, b) {
              var lv = numVal(a), rv = numVal(b);
              if (opSymI === '+') {
                if (typeof a === 'string' || typeof b === 'string') return String(lv) + String(rv);
                return mkNum(lv + rv, numFloat(a) || numFloat(b));
              }
              if (opSymI === '-') return mkNum(lv - rv, numFloat(a) || numFloat(b));
              if (opSymI === '*') return mkNum(lv * rv, numFloat(a) || numFloat(b));
              if (opSymI === '/') return mkNum(lv / rv, true);
              if (opSymI === '**') return mkNum(Math.pow(lv, rv), numFloat(a) || numFloat(b));
              throw new Error('Operador composto desconhecido');
            });
            idxd.map[ikey] = newVal;
            out.push({ kind: 'assign', text: idxAssign.name + '(' + formatValue(idxVal) + ') = ' + formatValue(newVal), lineNo: lineNo });
          }
        } else {
        var lazyM = line.match(LAZY_ASSIGN_RE);
        if (lazyM) {
          if (isConstant(lazyM[1])) throw new Error('Não é possível alterar constante "'+lazyM[1]+'"');
          env[lazyM[1]] = { wpLazy: true, expr: lazyM[2] };
        } else {
          var cm = line.match(COMPOUND_ASSIGN_RE);
          if (cm) {
            if (isConstant(cm[1])) throw new Error('Não é possível alterar constante "'+cm[1]+'"');
            var targetName = cm[1];
            var opSym = cm[2].slice(0, -1);
            var cval = parse(targetName + opSym + '(' + cm[3] + ')', env);
            env[targetName] = cval;
            out.push({ kind: 'assign', text: targetName + ' = ' + formatValue(cval), lineNo: lineNo });
          } else {
            var m = line.match(ASSIGN_RE);
            if (m) {
              if (isConstant(m[1])) throw new Error('Não é possível alterar constante "'+m[1]+'"');
              var val = parse(m[2], env);
              env[m[1]] = val;
              out.push({ kind: 'assign', text: m[1] + ' = ' + formatValue(val), lineNo: lineNo });
            } else if (/^limparJanela\s*(\(\s*\))?\s*$/.test(line)) {
              if (!lastJanela) throw new Error('limparJanela: execute janela(largura, altura) antes de usar limparJanela');
              out.push({kind:'clearJanela', lineNo: lineNo});
            } else if (/^(janela|ponto|linha|círculo|retângulo|texto|pegar|colocar|limparJanela|corFundo)\s*\(/.test(line)) {
              parse(line, env);
            } else {
              var exprVal = parse(line, env);
              if (exprVal !== undefined) {
                out.push({ kind: 'return', text: formatValue(exprVal), lineNo: lineNo });
              }
            }
          }
        }
        }
      }
    }
  } catch (e) {
    if (e && e.wpReturn) throw e;
    if (e && (e.wpPare || e.wpContinue || e.wpGoto || e.wpInput)) throw e;
    out.push({ kind: 'error', text: e.message, lineNo: lineNo });
  }
  return false;
}

var CURRENT_OUT = null;
var GLOBAL_ENV = null;
var CURRENT_ENV = null;

function callUserFunc(fn, args) {
  var childEnv = Object.create(fn.env);
  for (var i = 0; i < fn.params.length; i++) childEnv[fn.params[i]] = args[i];
  WP_NO_INPUT_DEFER++;
  try {
    execNodes(fn.body, childEnv, CURRENT_OUT || []);
  } catch (e) {
    if (e && e.wpReturn) return e.value;
    if (e && e.wpPare) throw new Error("'pare' usado fora de um laço");
    if (e && e.wpContinue) throw new Error("'continue' usado fora de um laço");
    throw e;
  } finally {
    WP_NO_INPUT_DEFER--;
  }
  return undefined;
}

function execNodes(nodes, env, out) {
  CURRENT_OUT = out;
  var cascadeDefer = false;
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    if (n.type === 'if') {
      var gfIf = gotoFrameFor(n);
      if (gfIf >= 0) {
        var gfr = WP_GOTO_PATH[gfIf];
        var gcond;
        try {
          gcond = !!numVal(parse(n.cond, env));
        } catch (eg) {
          WP_GOTO_PATH = null;
          out.push({ kind: 'error', text: eg.message, lineNo: n.lineNo });
          continue;
        }
        if (!gcond) {
          WP_GOTO_PATH = null;
          out.push({ kind: 'error', text: "vá para: salto impossível, a condição do 'se' no caminho é falsa", lineNo: n.lineNo });
          continue;
        }
        execNodes((gfr.branch === 0 ? n.then : n.els).slice(gfr.idx), env, out);
      } else {
        var cond;
        try {
          cond = !!numVal(parse(n.cond, env));
        } catch (e) {
          out.push({ kind: 'error', text: e.message, lineNo: n.lineNo });
          continue;
        }
        if (cond) execNodes(n.then, env, out);
        else execNodes(n.els, env, out);
      }
    } else if (n.type === 'for') {
      var items;
      try {
        items = evaluateCollection(n.expr, env);
      } catch (e) {
        out.push({ kind: 'error', text: e.message, lineNo: n.lineNo });
        continue;
      }
      var gfFor = gotoFrameFor(n);
      var gForIdx = gfFor >= 0 ? WP_GOTO_PATH[gfFor].idx : -1;
      for (var j = 0; j < items.length; j++) {
        env[n.var] = items[j];
        try {
          if (j === 0 && gForIdx >= 0) execNodes(n.body.slice(gForIdx), env, out);
          else execNodes(n.body, env, out);
        } catch (er) {
          if (er && er.wpPare) break;
          if (!(er && er.wpContinue)) throw er;
        }
      }
    } else if (n.type === 'repeat') {
      var cnt;
      try {
        cnt = numVal(parse(n.count, env));
      } catch (e) {
        out.push({ kind: 'error', text: e.message, lineNo: n.lineNo });
        continue;
      }
      if (typeof cnt !== 'number' || !isFinite(cnt) || Math.floor(cnt) !== cnt || cnt < 0 || cnt > 100000) {
        out.push({ kind: 'error', text: 'repita espera um número inteiro não negativo até 100000', lineNo: n.lineNo });
        continue;
      }
      var gfRep = gotoFrameFor(n);
      var gRepIdx = gfRep >= 0 ? WP_GOTO_PATH[gfRep].idx : -1;
      for (var rr = 0; rr < cnt; rr++) {
        try {
          if (rr === 0 && gRepIdx >= 0) execNodes(n.body.slice(gRepIdx), env, out);
          else execNodes(n.body, env, out);
        } catch (er) {
          if (er && er.wpPare) break;
          if (!(er && er.wpContinue)) throw er;
        }
      }
    } else if (n.type === 'while') {
      var gfWhl = gotoFrameFor(n);
      var gWhlIdx = gfWhl >= 0 ? WP_GOTO_PATH[gfWhl].idx : -1;
      var condVal;
      try {
        condVal = !!numVal(parse(n.cond, env));
      } catch (e) {
        if (gfWhl >= 0) WP_GOTO_PATH = null;
        out.push({ kind: 'error', text: e.message, lineNo: n.lineNo });
        continue;
      }
      if (!condVal && gWhlIdx >= 0) {
        WP_GOTO_PATH = null;
        out.push({ kind: 'error', text: "vá para: salto impossível, a condição do 'enquanto' no caminho é falsa", lineNo: n.lineNo });
        continue;
      }
      var guard = 0;
      while (condVal) {
        try {
          if (guard === 0 && gWhlIdx >= 0) execNodes(n.body.slice(gWhlIdx), env, out);
          else execNodes(n.body, env, out);
        } catch (er) {
          if (er && er.wpPare) break;
          if (!(er && er.wpContinue)) throw er;
        }
        guard++;
        if (guard > 1000000) {
          out.push({ kind: 'error', text: 'enquanto: limite de 1.000.000 de iterações excedido (possível laço infinito)', lineNo: n.lineNo });
          break;
        }
        try {
          condVal = !!numVal(parse(n.cond, env));
        } catch (e) {
          out.push({ kind: 'error', text: e.message, lineNo: n.lineNo });
          break;
        }
      }
    } else if (n.type === 'regressiva') {
      var rgSecs;
      try {
        rgSecs = n.secs ? numVal(parse(n.secs, env)) : null;
      } catch (e) {
        out.push({ kind: 'error', text: e.message, lineNo: n.lineNo });
        continue;
      }
      if (typeof rgSecs !== 'number' || !isFinite(rgSecs) || rgSecs < 0) {
        out.push({ kind: 'error', text: 'regressiva espera os segundos da contagem, que podem ser fracionados (ex.: regressiva(10) ou regressiva(0.5))', lineNo: n.lineNo });
        continue;
      }
      var gfRg = gotoFrameFor(n);
      var rgOut = [];
      if (gfRg >= 0) execNodes(n.body.slice(WP_GOTO_PATH[gfRg].idx), env, rgOut);
      else execNodes(n.body, env, rgOut);
      if (janelaDirty) {
        janelaDirty = false;
        rgOut.push({
          kind: 'render', lineNo: n.lineNo,
          vp: lastJanela ? lastJanela.points.length : 0,
          vl: lastJanela ? lastJanela.lines.length : 0,
          vc: lastJanela ? lastJanela.circles.length : 0,
          vr: lastJanela ? lastJanela.rects.length : 0,
          vt: lastJanela ? lastJanela.texts.length : 0
        });
      }
      out.push({ kind: 'timer', secs: rgSecs, inner: rgOut, lineNo: n.lineNo });
    } else if (n.type === 'func') {
      env[n.name] = { wpFunc: true, name: n.name, params: n.params, body: n.body, env: env };
    } else if (n.type === 'select') {
      out.push({ kind: 'select', options: n.options, lineNo: n.lineNo });
    } else if (n.type === 'window') {
      var gfWin = gotoFrameFor(n);
      var winOut = [];
      try {
        if (gfWin >= 0) execNodes(n.body.slice(WP_GOTO_PATH[gfWin].idx), env, winOut);
        else execNodes(n.body, env, winOut);
      } catch (ew) {
        if (ew && ew.wpGoto && winOut.length > 0) {
          WP_PENDING_WINOUT.push({ kind: 'window', inner: winOut, env: env, lineNo: n.lineNo, centered: !!n.centered });
        } else if (ew && ew.wpInput) {
          var hasWin = false;
          var ow;
          for (ow = 0; ow < out.length; ow++) { if (out[ow].kind === 'window') { hasWin = true; break; } }
          if (!hasWin) {
            for (ow = 0; ow < WP_PENDING_WINOUT.length; ow++) { if (WP_PENDING_WINOUT[ow].kind === 'window') { hasWin = true; break; } }
          }
          if (winOut.length > 0 || !hasWin) {
            WP_PENDING_WINOUT.push({ kind: 'window', inner: winOut, env: env, lineNo: n.lineNo, centered: !!n.centered });
          }
        }
        throw ew;
      }
      out.push({ kind: 'window', inner: winOut, env: env, lineNo: n.lineNo, centered: !!n.centered });
    } else if (n.type === 'escolha') {
      var gfEs = gotoFrameFor(n);
      if (gfEs >= 0) {
        var gfrEs = WP_GOTO_PATH[gfEs];
        var targetBodyEs;
        if (gfrEs.branch === -1 || gfrEs.branch >= n.cases.length) {
          targetBodyEs = n.padrao ? n.padrao.body : [];
        } else {
          targetBodyEs = n.cases[gfrEs.branch].body;
        }
        execNodes(targetBodyEs.slice(gfrEs.idx), env, out);
      } else {
        var escolhaVal;
        try {
          escolhaVal = parse(n.expr, env);
        } catch (e) {
          out.push({ kind: 'error', text: e.message, lineNo: n.lineNo });
          continue;
        }
        var matched = false;
        for (var ci = 0; ci < n.cases.length; ci++) {
          var cas = n.cases[ci];
          var casoVal;
          try {
            casoVal = parse(cas.value, env);
          } catch (e) {
            out.push({ kind: 'error', text: e.message, lineNo: cas.lineNo });
            continue;
          }
          var lv = numVal(escolhaVal);
          var rv = numVal(casoVal);
          if (lv == rv) {
            matched = true;
            execNodes(cas.body, env, out);
            break;
          }
        }
        if (!matched && n.padrao) {
          execNodes(n.padrao.body, env, out);
        }
      }
    } else if (n.type === 'stmt') {
      if (cascadeDefer) {
        out.push({ kind: 'rerun', line: n.text, lineNo: n.lineNo });
      } else if (execStatement(n.text, n.lineNo, env, out)) {
        cascadeDefer = true;
      }
    }
    if (janelaDirty) {
      janelaDirty = false;
      out.push({
        kind: 'render', lineNo: n.lineNo,
        vp: lastJanela ? lastJanela.points.length : 0,
        vl: lastJanela ? lastJanela.lines.length : 0,
        vc: lastJanela ? lastJanela.circles.length : 0,
        vr: lastJanela ? lastJanela.rects.length : 0,
        vt: lastJanela ? lastJanela.texts.length : 0
      });
    }
  }
}

function findGotoPath(nodes, name) {
  function walk(list, owner, branch) {
    var i;
    for (i = 0; i < list.length; i++) {
      if (list[i].type === 'rotulo' && list[i].name === name) {
        return [{ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i }];
      }
    }
    for (i = 0; i < list.length; i++) {
      var nd = list[i];
      var sub = null;
      if (nd.type === 'if') {
        sub = walk(nd.then, nd, 0);
        if (!sub) sub = walk(nd.els, nd, 1);
      } else if (nd.type === 'for' || nd.type === 'repeat' || nd.type === 'while' || nd.type === 'regressiva' || nd.type === 'window') {
        sub = walk(nd.body, nd, null);
      } else if (nd.type === 'func') {
        if (walk(nd.body, nd, null)) throw new Error("vá para: não é possível saltar para dentro de uma função");
      } else if (nd.type === 'select') {
        for (var q = 0; q < nd.options.length; q++) {
          if (walk(nd.options[q].body, nd, q)) throw new Error('vá para: não é possível saltar para dentro de uma opção do "selecionar opção"');
        }
      } else if (nd.type === 'escolha') {
        for (var ec = 0; ec < nd.cases.length; ec++) {
          sub = walk(nd.cases[ec].body, nd, ec);
          if (sub) { sub.unshift({ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i }); return sub; }
        }
        if (nd.padrao) {
          sub = walk(nd.padrao.body, nd, -1);
          if (sub) { sub.unshift({ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i }); return sub; }
        }
      }
      if (sub) {
        sub.unshift({ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i });
        return sub;
      }
    }
    return null;
  }
  var frames = walk(nodes, null, null);
  return frames && frames.length ? frames : null;
}

function findResumePath(nodes, lineNo) {
  function walk(list, owner, branch) {
    var i;
    for (i = 0; i < list.length; i++) {
      if ((list[i].type === 'stmt' || list[i].type === 'rotulo') && list[i].lineNo === lineNo) {
        return [{ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i }];
      }
    }
    for (i = 0; i < list.length; i++) {
      var nd = list[i];
      var sub = null;
      if (nd.type === 'if') {
        sub = walk(nd.then, nd, 0);
        if (!sub) sub = walk(nd.els, nd, 1);
      } else if (nd.type === 'for' || nd.type === 'repeat' || nd.type === 'while' || nd.type === 'regressiva' || nd.type === 'window') {
        sub = walk(nd.body, nd, null);
      } else if (nd.type === 'escolha') {
        for (var ec2 = 0; ec2 < nd.cases.length; ec2++) {
          sub = walk(nd.cases[ec2].body, nd, ec2);
          if (sub) { sub.unshift({ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i }); return sub; }
        }
        if (nd.padrao) {
          sub = walk(nd.padrao.body, nd, -1);
          if (sub) { sub.unshift({ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i }); return sub; }
        }
      }
      if (sub) {
        sub.unshift({ owner: owner || null, branch: branch === undefined ? null : branch, list: list, idx: i });
        return sub;
      }
    }
    return null;
  }
  var fr = walk(nodes, null, null);
  return fr && fr.length ? fr : null;
}

var WP_GOTO_PATH = null;
var WP_GOTO_DEPTH = 0;
var WP_PENDING_WINOUT = [];
var WP_INPUT_CTX = false;
var WP_INPUT_QUEUE = [];
var WP_NO_INPUT_DEFER = 0;

function gotoFrameFor(node) {
  if (!WP_GOTO_PATH || WP_GOTO_DEPTH >= WP_GOTO_PATH.length) return -1;
  if (WP_GOTO_PATH[WP_GOTO_DEPTH].owner !== node) return -1;
  return WP_GOTO_DEPTH++;
}

function executeProgram(code, opts) {
  var env = opts && opts.resumeEnv ? opts.resumeEnv : {};
  GLOBAL_ENV = env;
  if (!opts || !opts.resumeEnv) { CONSTANTS = Object.create(null); }
  var out = [];
  var nodes;
  try {
    nodes = parseProgram(code);
  } catch (e) {
    out.push({ kind: 'error', text: e.message, lineNo: e.lineNo || null });
    return out;
  }
  try {
    var startIdx = 0;
    var jumps = 0;
    WP_GOTO_PATH = null;
    WP_GOTO_DEPTH = 0;
    WP_PENDING_WINOUT.length = 0;
    if (opts && opts.resumePath) {
      WP_GOTO_PATH = opts.resumePath;
      WP_GOTO_DEPTH = 1;
      startIdx = opts.resumePath[0].idx;
    }
    while (true) {
      var jumped = false;
      try {
        execNodes(startIdx > 0 ? nodes.slice(startIdx) : nodes, env, out);
      } catch (e) {
        if (e && e.wpReturn) {
          out.push({ kind: 'error', text: 'retorne usado fora de uma função', lineNo: null });
        } else if (e && e.wpPare) {
          out.push({ kind: 'error', text: "'pare' usado fora de um laço", lineNo: e.lineNo || null });
        } else if (e && e.wpContinue) {
          out.push({ kind: 'error', text: "'continue' usado fora de um laço", lineNo: e.lineNo || null });
        } else if (e && e.wpGoto) {
          var gpath = null;
          var gerr = null;
          try { gpath = findGotoPath(nodes, e.target); } catch (ef) { gerr = ef.message; }
          if (gerr) {
            out.push({ kind: 'error', text: gerr, lineNo: e.lineNo || null });
          } else if (!gpath) {
            out.push({ kind: 'error', text: "vá para: rótulo '" + e.target + "' não encontrado", lineNo: e.lineNo || null });
          } else if (++jumps > 100000) {
            WP_GOTO_PATH = null;
            out.push({ kind: 'error', text: 'vá para: limite de 100.000 saltos excedido (possível laço infinito)', lineNo: e.lineNo || null });
          } else {
            WP_GOTO_PATH = gpath;
            WP_GOTO_DEPTH = 1;
            startIdx = gpath[0].idx;
            while (WP_PENDING_WINOUT.length) out.push(WP_PENDING_WINOUT.shift());
            jumped = true;
          }
        } else if (e && e.wpInput) {
          var rpath = null;
          try { rpath = findResumePath(nodes, e.lineNo); } catch (er1) { rpath = null; }
          WP_GOTO_PATH = null;
          WP_GOTO_DEPTH = 0;
          while (WP_PENDING_WINOUT.length) out.push(WP_PENDING_WINOUT.shift());
          out.push({ kind: 'input', name: e.name, text: e.msg, msg: e.msg, lineNo: e.lineNo, env: env, resumePath: rpath });
        } else {
          throw e;
        }
      }
      if (!jumped) break;
    }
    WP_GOTO_PATH = null;
    WP_GOTO_DEPTH = 0;
    WP_PENDING_WINOUT.length = 0;
  } catch (e) {
    if (e && e.wpGoto) {
      out.push({ kind: 'error', text: "vá para: rótulo '" + e.target + "' não encontrado", lineNo: e.lineNo || null });
    } else if (e && e.wpInput) {
      while (WP_PENDING_WINOUT.length) out.push(WP_PENDING_WINOUT.shift());
      out.push({ kind: 'input', name: e.name, text: e.msg, msg: e.msg, lineNo: e.lineNo, env: env, resumePath: null });
    } else if (e && (e.wpReturn || e.wpPare || e.wpContinue)) {
      out.push({ kind: 'error', text: e.message || 'comando usado fora do lugar certo', lineNo: null });
    } else {
      throw e;
    }
  }
  return out;
}

