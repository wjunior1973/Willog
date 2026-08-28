"use strict";

// ============================================================
//  SYNTAX HIGHLIGHTING
// ============================================================

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tokenizeHighlight(code) {
  var tokens = [];
  var i = 0, n = code.length;
  var isIdStart = function (c) { return /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]/.test(c); };
  var isIdPart  = function (c) { return /[A-Za-z0-9\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u00FF_]/.test(c); };
  while (i < n) {
    var c = code[i];
    if (c === '"' || c === "'") {
      var q = c, j = i + 1;
      while (j < n && code[j] !== q) j++;
      j = Math.min(j + 1, n);
      tokens.push({ type: 'string', text: code.slice(i, j) });
      i = j;
    } else if (c === '#') {
      if (code[i + 1] === ':') {
        var jb = i + 2;
        while (jb < n) {
          if (code[jb] === ':' && code[jb + 1] === '#') { jb += 2; break; }
          jb++;
        }
        tokens.push({ type: 'comment', text: code.slice(i, jb) });
        i = jb;
      } else {
        var j2 = code.indexOf('\n', i);
        var end = j2 === -1 ? n : j2;
        tokens.push({ type: 'comment', text: code.slice(i, end) });
        i = end;
      }
    } else if (/[0-9]/.test(c)) {
      var j3 = i;
      while (j3 < n && /[0-9]/.test(code[j3])) j3++;
      if (code[j3] === '.' && /[0-9]/.test(code[j3 + 1] || '')) { j3++; while (j3 < n && /[0-9]/.test(code[j3])) j3++; }
      tokens.push({ type: 'number', text: code.slice(i, j3) });
      i = j3;
    } else if (isIdStart(c)) {
      var j4 = i;
      while (j4 < n && isIdPart(code[j4])) j4++;
      var word = code.slice(i, j4);
      var norm = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c');
      var prevIsComeçaTermina = false;
      for (var _k = tokens.length-1; _k>=0; _k--) {
        var _pt = tokens[_k];
        if (_pt.type==='op' && /^\s*$/.test(_pt.text)) continue;
        var _pnorm = _pt.text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ç/g,'c');
        if (_pt.type==='keyword' && (_pnorm==='comeca' || _pnorm==='termina')) prevIsComeçaTermina = true;
        break;
      }
      if (norm==='com' && prevIsComeçaTermina) {
        tokens.push({ type: 'keyword', text: word });
      } else if ((norm==='limparjanela' && code[j4] !== '(') || norm==='constante' || norm==='comeca' || norm==='termina' || norm==='escolha' || norm==='caso' || norm==='padrao' || word === 'mostre' || word === 'limpe' || word === 'leia' || word === 'se' || word === 'senão' || word === 'repita' || word === 'enquanto' ||
          word === 'pare' || word === 'continue' || word === 'vá' ||
          word === 'para' || word === 'cada' || word === 'em' ||
          word === 'definir' || word === 'função' || word === 'funcao' || word === 'retorne' || word === 'retornar' ||
          word === 'emJanela' || word === 'centralizar' ||
          (word === 'e' && code[j4] !== '(') || word === 'ou' || word === 'não' || word === 'existe' ||
          word === 'mod' ||
          word === 'verdadeiro' || word === 'falso' || word === 'true' || word === 'false') tokens.push({ type: 'keyword', text: word });
      else if ((word === 'selecionar' || word === 'comprimento' || word === 'absoluto' || word === 'abs' || word === 'fatorial'  || word === 'variáveis' || word === 'variaveis' || word === 'raizq' || word === 'raizc'  || word === 'pi'   || word === 'inteiro' || word === 'decimal' || word === 'fração' || word === 'fracao'        || word === 'paraLista'  || word === 'paraTexto' || word === 'paraNúmero'           || word === 'cos' || word === 'sen' || word === 'tan' || word === 'arcocos' || word === 'arcosen' || word === 'arcotan' || word === 'aleatório' || word === 'dado' || word === 'moeda'   || word === 'janela' || word === 'ponto' || word === 'linha' || word === 'círculo' || word === 'retângulo' || word === 'texto' || word === 'intervalo' || word === 'log' || word === 'logn' || word === 'ln' || word === 'arredondar' || word === 'arred' || word === 'salvar' || word === 'carregar'   || word === 'ano' || word === 'mês' || word === 'dia' || word === 'hora' || word === 'data' || word === 'agora' || word === 'tempo' || word === 'adicionarDias' || word === 'diaSemana'     || word === 'bipe' || word === 'pausa' || word === 'regressiva' || word === 'som' || word === 'toca' || word === 'mensagem' || word === 'aguardeTecla' || word === 'captureTecla' || word === 'pegar' || word === 'colocar' || word === 'limparJanela' || word === 'corFundo' || word === 'aparar' || word === 'extrair' || word === 'filtrar' || word === 'mapear' || word === 'tipo' || word === 'primo' || word === 'par' || word === 'ímpar' || word === 'impar' || word === 'maiúsculo' || word === 'minúsculo' || word === 'substitua' || word === 'divida' || word === 'junte' || word === 'contém' || word === 'posição' || word === 'insira' || word === 'remova' || word === 'posiçãoEm' || word === 'mmc' || word === 'mdc' || word === 'divisores' || word === 'fatores'  ) && code[j4] === '(') tokens.push({ type: 'function', text: word });
      else tokens.push({ type: 'identifier', text: word });
      i = j4;
    } else {
      if (c === '*' && code[i+1] === '*') { tokens.push({ type: 'op', text: '**' }); i += 2; }
      else if (c === '/' && code[i+1] === '/') { tokens.push({ type: 'op', text: '//' }); i += 2; }
      else { tokens.push({ type: 'op', text: c }); i += 1; }
    }
  }
  return tokens;
}

