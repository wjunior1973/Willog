# Willog - Convenções do projeto

## IDE

- Menu `Arquivo` (`index.html` `#btnFile` + `#fileMenu`): `Abrir...` (Ctrl+O), `Salvar` (Ctrl+S), `Salvar como...`, `Sair`; estilos em `.menu-wrap`/`.menu`/`.menu-item` (`css/style.css`); lógica em `js/ide.js` (File System Access API com fallback para download/`input file`, `beforeunload` quando há alterações).
- Programas salvos com extensão `.wil` (`ensureWil()`); nome atual em `#fileName`, `document.title` e `localStorage willog.filename`; `•` indica alterações não salvas.
- Autocompletar no editor (`#completeBox`, estilos `.complete-box`): variáveis primeiro (da última execução + `constante NOME=`/`NOME=`/`para cada NOME em` no texto), depois comandos e funções; após `.` só propriedades; `↑`/`↓` navegam, `Enter`/`Tab` aceitam, `Esc` fecha, `Ctrl+Espaço` força; suprimido em textos, comentários e intervalos `..`.

## Regra obrigatória: manter as Referências atualizadas

Daqui em diante, TODA implementação ou alteração de recurso da linguagem
(comandos, funções, operadores, propriedades ou qualquer nova funcionalidade)
deve ser refletida imediatamente na **Referência da IDE** (bloco `.help-overlay`
em `index.html`), na **aba específica** e em **ordem alfabética**.

Abas atuais (`index.html`):

- **Comandos** -> `data-panel="comandos"`
- **Funções** -> `data-panel="funcoes"`
- **Operadores** -> `data-panel="operadores"` (ordenados pelo nome, ex.: Adição, Divisão, ...)
- **Propriedades** -> `data-panel="propriedades"`

Cada item usa a estrutura de cartão (assinatura + descrição + exemplo verificado com saída + botão "usar"):

```html
<div class="ref-item" data-name="termos de busca">
  <code class="ref-sig">nome(argumentos)</code>
  <p class="ref-desc">Descrição curta.</p>
  <div class="ref-ex">
    <pre class="ref-ex-code">código do exemplo</pre>
    <pre class="ref-ex-out">saída exata do exemplo</pre>
    <button class="mini ref-use" title="Carregar este exemplo no editor">usar</button>
  </div>
</div>
```

Todo exemplo da Referência deve ser executado de verdade no interpretador antes de entrar no HTML (saída exata).

Se um novo recurso não se encaixar em nenhuma aba existente, criar a aba
correspondente e posicioná-la também em ordem alfabética entre as abas. Toda aba
nova precisa de: um botão em `.help-tabs` com `data-tab`, e um `.help-panel` com
`data-panel` (os demais painéis ficam com o atributo `hidden`).

## Estrutura do projeto

- `index.html` - IDE autocontida em um único arquivo (estilos em `<style>`; lexer, parser, interpretador e IDE em `<script>` nessa ordem). Edições de CSS/JS são feitas direto nele.
- `exemplos/*.wil` - programas de exemplo (extensão padrão `.wil`; `.willog` antigo ainda abre)

## Linguagem

- Variáveis e constantes em MAIÚSCULAS ou minúsculas, sem distinção (`nome` e `NOME` são a mesma variável; o inspetor exibe em MAIÚSCULAS).
- Palavras reservadas: `constante`, `leia`, `mostre`, `para`, `cada`, `em`, `repetir`, `se`, `senão`/`senao`, `então`/`entao`, `e`, `ou`, `não`/`nao`, `verdadeiro`, `falso`, `existe`.
- Comentários começam com `#`.
- Comparações `< > <= >= == !=` (em expressão, `=` sozinho vale como `==`), lógicos `e`, `ou`, `não`, pertinência `existe ITEM em COLEÇÃO` (lista, texto ou número) e valores `verdadeiro`/`falso`; 0, texto vazio e lista vazia contam como falso no `se`.
- Intervalos `(a..b)` e literais `[1,2,3]` geram listas; laços `para cada NOME em (a..b):` com corpo indentado (ou em uma linha); `repetir(n):` repete o corpo indentado n vezes (ou em uma linha).
- Condicional `se condição [então] [:]` com corpo indentado (ou em uma linha), `senão [:]` opcional no mesmo nível de indentação do `se`; ex.: `se N<50 então:` / `senão:`.
- Listas têm propriedades via ponto: `.crescente .decrescente .aleatório .primeiro .último .menor .maior .distintos .contar .contarDistintos .separar` (funcionam com números e textos; `separar` também aceita texto ou número direto) e métodos com argumentos: `.adicionar(v) .posição(i) .retirar(v) .recortar(ini,fim) .contarItem(v)` (conta ocorrências separando textos em letras e números em algarismos).
