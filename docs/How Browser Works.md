# How Browsers Work

### 来源

https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/



## The browser's high level structure

The browser's main components are ([1.1](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#1_1)):

1. **The user interface**: Every part of the browser display except the window where you see the requested page.
2. **The browser engine**: marshals actions between the UI and the rendering engine.
3. **The rendering engine **: responsible for displaying requested content. For example if the requested content is HTML, the rendering engine parses HTML and CSS, and displays the parsed content on the screen.
4. **Networking**: for network calls such as HTTP requests, using different implementations for different platform behind a platform-independent interface.
5. **UI backend**: used for drawing basic widgets like combo boxes and windows. This backend exposes a generic interface that is not platform specific. Underneath it uses operating system user interface methods.
6. **JavaScript interpreter**. Used to parse and execute JavaScript code.
7. **Data storage**. This is a persistence layer. The browser may need to save all sorts of data locally, such as cookies. Browsers also support storage mechanisms such as localStorage, IndexedDB, WebSQL and FileSystem.

![](http://p1yseh5av.bkt.clouddn.com/18-6-20/32960950.jpg)

It is important to note that browsers such as Chrome run multiple instances of the rendering engine: one for each tab. **Each tab runs in a separate process**.

## The rendering engine

The responsibility of the rendering engine is well... Rendering, that is display of the requested contents on the browser screen.

By default the rendering engine can display HTML and XML documents and images. It can display other types of data via plug-ins or extension; for example, displaying PDF documents using a PDF viewer plug-in. However, in this chapter we will focus on the main use case: displaying HTML and images that are formatted using CSS.

## Rendering engines

Different browsers use different rendering engines: Internet Explorer uses Trident, Firefox uses Gecko, Safari uses WebKit. Chrome and Opera (from version 15) use Blink, a fork of WebKit.

WebKit is an open source rendering engine which started as an engine for the Linux platform and was modified by Apple to support Mac and Windows. See [webkit.org](http://webkit.org/) for more details.

## The main flow

The rendering engine will start getting the contents of the requested document from the networking layer. This will usually be done in 8kB chunks.

After that, this is the basic flow of the rendering engine:

![](http://p1yseh5av.bkt.clouddn.com/18-6-20/43426904.jpg)

The rendering engine will start parsing the HTML document and convert elements to [DOM](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#DOM) nodes in a tree called the "content tree". The engine will parse the style data, both in external CSS files and in style elements. Styling information together with visual instructions in the HTML will be used to create another tree: the [render tree](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#Render_tree_construction).

The render tree contains rectangles with visual attributes like color and dimensions. The rectangles are in the right order to be displayed on the screen.

After the construction of the render tree it goes through a "[layout](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#layout)" process. This means giving each node the exact coordinates where it should appear on the screen. The next stage is [painting](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#Painting)–the render tree will be traversed and each node will be painted using the UI backend layer.

It's important to understand that this is a gradual process. For better user experience, the rendering engine will try to display contents on the screen as soon as possible. It will not wait until all HTML is parsed before starting to build and layout the render tree. Parts of the content will be parsed and displayed, while the process continues with the rest of the contents that keeps coming from the network.

### Main flow examples

![img](http://p1yseh5av.bkt.clouddn.com/18-6-20/47677366.jpg)

​								Figure : WebKit main flow	



​		    ![img](http://p1yseh5av.bkt.clouddn.com/18-6-20/99986558.jpg)

​					Figure : Mozilla's Gecko rendering engine main flow ([3.6](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#3_6))

From figures 3 and 4 you can see that although WebKit and Gecko use slightly different terminology, the flow is basically the same.

Gecko calls the tree of visually formatted elements a "Frame tree". Each element is a frame. WebKit uses the term "Render Tree" and it consists of "Render Objects". WebKit uses the term "layout" for the placing of elements, while Gecko calls it "Reflow". "Attachment" is WebKit's term for connecting DOM nodes and visual information to create the render tree. A minor non-semantic difference is that Gecko has an extra layer between the HTML and the DOM tree. It is called the "content sink" and is a factory for making DOM elements. We will talk about each part of the flow:

### Parsing–general

Since parsing is a very significant process within the rendering engine, we will go into it a little more deeply. Let's begin with a little introduction about parsing.

Parsing a document means translating it to a structure the code can use. The result of parsing is usually a tree of nodes that represent the structure of the document. This is called a parse tree or a syntax tree.

For example, parsing the expression 2 + 3 - 1 could return this tree:

![img](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/image009.png)

​							Figure : mathematical expression tree node

### Grammars

Parsing is based on the syntax rules the document obeys: the language or format it was written in. Every format you can parse must have deterministic grammar consisting of vocabulary and syntax rules. It is called a [context free grammar](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#context_free_grammar). Human languages are not such languages and therefore cannot be parsed with conventional parsing techniques.

### Parser–Lexer combination

Parsing can be separated into two sub processes: lexical analysis and syntax analysis.

Lexical analysis is the process of breaking the input into tokens. Tokens are the language vocabulary: the collection of valid building blocks. In human language it will consist of all the words that appear in the dictionary for that language.

Syntax analysis is the applying of the language syntax rules.

Parsers usually divide the work between two components: the **lexer** (sometimes called tokenizer) that is responsible for breaking the input into valid tokens, and the **parser** that is responsible for constructing the parse tree by analyzing the document structure according to the language syntax rules. The lexer knows how to strip irrelevant characters like white spaces and line breaks.

![img](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/image011.png)

​							Figure : from source document to parse trees

The parsing process is iterative. The parser will usually ask the lexer for a new token and try to match the token with one of the syntax rules. If a rule is matched, a node corresponding to the token will be added to the parse tree and the parser will ask for another token.

If no rule matches, the parser will store the token internally, and keep asking for tokens until a rule matching all the internally stored tokens is found. If no rule is found then the parser will raise an exception. This means the document was not valid and contained syntax errors.

### Translation

In many cases the parse tree is not the final product. Parsing is often used in translation: transforming the input document to another format. An example is compilation. The compiler that compiles source code into machine code first parses it into a parse tree and then translates the tree into a machine code document.

![img](http://p1yseh5av.bkt.clouddn.com/18-6-20/3546968.jpg)

​									Figure : compilation flow

### Parsing example

In figure 5 we built a parse tree from a mathematical expression. Let's try to define a simple mathematical language and see the parse process.

Vocabulary: Our language can include integers, plus signs and minus signs.

Syntax:

1. The language syntax building blocks are expressions, terms and operations.
2. Our language can include any number of expressions.
3. An expression is defined as a "term" followed by an "operation" followed by another term
4. An operation is a plus token or a minus token
5. A term is an integer token or an expression

Let's analyze the input 2 + 3 - 1. 
The first substring that matches a rule is 2: according to rule #5 it is a term. The second match is 2 + 3: this matches the third rule: a term followed by an operation followed by another term. The next match will only be hit at the end of the input. 2 + 3 - 1 is an expression because we already know that 2 + 3 is a term, so we have a term followed by an operation followed by another term. 2 + + will not match any rule and therefore is an invalid input.

### Formal definitions for vocabulary and syntax

Vocabulary is usually expressed by [regular expressions](http://www.regular-expressions.info/).

For example our language will be defined as:

```
INTEGER: 0|[1-9][0-9]*
PLUS: +
MINUS: -
```

As you see, integers are defined by a regular expression.

Syntax is usually defined in a format called [BNF](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form). Our language will be defined as:

```
expression :=  term  operation  term
operation :=  PLUS | MINUS
term := INTEGER | expression
```

We said that a language can be parsed by regular parsers if its grammar is a [context free grammar](). An intuitive definition of a context free grammar is a grammar that can be entirely expressed in BNF. For a formal definition see[Wikipedia's article on Context-free grammar](http://en.wikipedia.org/wiki/Context-free_grammar)

### Types of parsers

There are two types of parsers: top down parsers and bottom up parsers. An intuitive explanation is that top down parsers examine the high level structure of the syntax and try to find a rule match. Bottom up parsers start with the input and gradually transform it into the syntax rules, starting from the low level rules until high level rules are met.

Let's see how the two types of parsers will parse our example.

The top down parser will start from the higher level rule: it will identify 2 + 3 as an expression. It will then identify 2 + 3 - 1 as an expression (the process of identifying the expression evolves, matching the other rules, but the start point is the highest level rule).

The bottom up parser will scan the input until a rule is matched. It will then replace the matching input with the rule. This will go on until the end of the input. The partly matched expression is placed on the parser's stack.

| Stack                | Input     |
| -------------------- | --------- |
|                      | 2 + 3 - 1 |
| term                 | + 3 - 1   |
| term operation       | 3 - 1     |
| expression           | - 1       |
| expression operation | 1         |
| expression           | -         |

This type of bottom up parser is called a shift-reduce parser, because the input is shifted to the right (imagine a pointer pointing first at the input start and moving to the right) and is gradually reduced to syntax rules.

### Generating parsers automatically

There are tools that can generate a parser. You feed them the grammar of your language–its vocabulary and syntax rules–and they generate a working parser. Creating a parser requires a deep understanding of parsing and it's not easy to create an optimized parser by hand, so parser generators can be very useful.

[WebKit]() uses two well known parser generators: [Flex](http://en.wikipedia.org/wiki/Flex_lexical_analyser) for creating a lexer and [Bison](http://www.gnu.org/software/bison/) for creating a parser (you might run into them with the names Lex and Yacc). Flex input is a file containing regular expression definitions of the tokens. Bison's input is the language syntax rules in BNF format.

## HTML Parser

The job of the HTML parser is to parse the HTML markup into a parse tree.

### The HTML grammar definition

The vocabulary and syntax of HTML are defined in [specifications](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#w3c) created by the W3C organization.

### Not a context free grammar

As we have seen in the parsing introduction, grammar syntax can be defined formally using formats like BNF.

Unfortunately all the conventional parser topics do not apply to HTML (I didn't bring them up just for fun–they will be used in parsing CSS and JavaScript). HTML cannot easily be defined by a context free grammar that parsers need.

There is a formal format for defining HTML–DTD (Document Type Definition)–but it is not a context free grammar.

This appears strange at first sight; HTML is rather close to XML. There are lots of available XML parsers. There is an XML variation of HTML–XHTML–so what's the big difference?

The difference is that the HTML approach is more "forgiving": it lets you omit certain tags (which are then added implicitly), or sometimes omit start or end tags, and so on. On the whole it's a "soft" syntax, as opposed to XML's stiff and demanding syntax.

This seemingly small detail makes a world of a difference. On one hand this is the main reason why HTML is so popular: it forgives your mistakes and makes life easy for the web author. On the other hand, it makes it difficult to write a formal grammar. So to summarize, HTML cannot be parsed easily by conventional parsers, since its grammar is not context free. HTML cannot be parsed by XML parsers.

### HTML DTD

HTML definition is in a DTD format. This format is used to define languages of the [SGML](http://en.wikipedia.org/wiki/Standard_Generalized_Markup_Language) family. The format contains definitions for all allowed elements, their attributes and hierarchy. As we saw earlier, the HTML DTD doesn't form a context free grammar.

There are a few variations of the DTD. The strict mode conforms solely to the specifications but other modes contain support for markup used by browsers in the past. The purpose is backwards compatibility with older content. The current strict DTD is here: [www.w3.org/TR/html4/strict.dtd](http://www.w3.org/TR/html4/strict.dtd)

### DOM

The output tree (the "parse tree") is a tree of DOM element and attribute nodes. DOM is short for Document Object Model. It is the object presentation of the HTML document and the interface of HTML elements to the outside world like JavaScript. 
The root of the tree is the "[Document](http://www.w3.org/TR/1998/REC-DOM-Level-1-19981001/level-one-core.html#i-Document)" object.

The DOM has an almost one-to-one relation to the markup. For example:

```html
<html>
  <body>
    <p>
      Hello World
    </p>
    <div> <img src="example.png"/></div>
  </body>
</html>
```

This markup would be translated to the following DOM tree:

![img](http://p1yseh5av.bkt.clouddn.com/18-6-20/64831217.jpg)

​							Figure : DOM tree of the example markup

Like HTML, DOM is specified by the W3C organization. See [www.w3.org/DOM/DOMTR](http://www.w3.org/DOM/DOMTR). It is a generic specification for manipulating documents. A specific module describes HTML specific elements. The HTML definitions can be found here: [www.w3.org/TR/2003/REC-DOM-Level-2-HTML-20030109/idl-definitions.html](http://www.w3.org/TR/2003/REC-DOM-Level-2-HTML-20030109/idl-definitions.html).

When I say the tree contains DOM nodes, I mean the tree is constructed of elements that implement one of the DOM interfaces. Browsers use concrete implementations that have other attributes used by the browser internally.

#### The parsing algorithm

As we saw in the previous sections, HTML cannot be parsed using the regular top down or bottom up parsers.

The reasons are:

1. The forgiving nature of the language.
2. The fact that browsers have traditional error tolerance to support well known cases of invalid HTML.
3. The parsing process is reentrant. For other languages, the source doesn't change during parsing, but in HTML, dynamic code (such as script elements containing `document.write()` calls) can add extra tokens, so the parsing process actually modifies the input.

Unable to use the regular parsing techniques, browsers create custom parsers for parsing HTML.

The [parsing algorithm is described in detail by the HTML5 specification](http://www.whatwg.org/specs/web-apps/current-work/multipage/parsing.html). The algorithm consists of two stages: tokenization and tree construction.

Tokenization is the lexical analysis, parsing the input into tokens. Among HTML tokens are start tags, end tags, attribute names and attribute values.

The tokenizer recognizes the token, gives it to the tree constructor, and consumes the next character for recognizing the next token, and so on until the end of the input.

![img](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/image017.png)

​					Figure : HTML parsing flow (taken from HTML5 spec)

### The tokenization algorithm

![img](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/image019.png)

​							Figure : Tokenizing the example input

#### Tree construction algorithm

```html
<html>
  <body>
    Hello world
  </body>
</html>
```

![img](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/image022.gif)

Figure : tree construction of example html

### Actions when the parsing is finished

At this stage the browser will mark the document as interactive and start parsing scripts that are in **"deferred" mode**: those that should be executed after the document is parsed. The document state will be then set to "complete" and a "load" event will be fired.

You can see [the full algorithms for tokenization and tree construction in the HTML5 specification](http://www.w3.org/TR/html5/syntax.html#html-parser)

### Browsers' error tolerance

······

## CSS parsing

Remember the parsing concepts in the introduction? Well, unlike HTML, CSS is a context free grammar and can be parsed using the types of parsers described in the introduction. In fact [the CSS specification defines CSS lexical and syntax grammar](http://www.w3.org/TR/CSS2/grammar.html).

Let's see some examples: 
The lexical grammar (vocabulary) is defined by regular expressions for each token:

```
comment   \/\*[^*]*\*+([^/*][^*]*\*+)*\/
num   [0-9]+|[0-9]*"."[0-9]+
nonascii  [\200-\377]
nmstart   [_a-z]|{nonascii}|{escape}
nmchar    [_a-z0-9-]|{nonascii}|{escape}
name    {nmchar}+
ident   {nmstart}{nmchar}*
```

"ident" is short for identifier, like a class name. "name" is an element id (that is referred by "#" )

The syntax grammar is described in BNF.

```basic
ruleset
  : selector [ ',' S* selector ]*
    '{' S* declaration [ ';' S* declaration ]* '}' S*
  ;
selector
  : simple_selector [ combinator selector | S+ [ combinator? selector ]? ]?
  ;
simple_selector
  : element_name [ HASH | class | attrib | pseudo ]*
  | [ HASH | class | attrib | pseudo ]+
  ;
class
  : '.' IDENT
  ;
element_name
  : IDENT | '*'
  ;
attrib
  : '[' S* IDENT S* [ [ '=' | INCLUDES | DASHMATCH ] S*
    [ IDENT | STRING ] S* ] ']'
  ;
pseudo
  : ':' [ IDENT | FUNCTION S* [IDENT S*] ')' ]
  ;
```

Explanation: A ruleset is this structure:

```css
div.error, a.error {
  color:red;
  font-weight:bold;
}
```

div.error and a.error are selectors. The part inside the curly braces contains the rules that are applied by this ruleset. This structure is defined formally in this definition:

```
ruleset
  : selector [ ',' S* selector ]*
    '{' S* declaration [ ';' S* declaration ]* '}' S*
  ;
```

This means a ruleset is a selector or optionally a number of selectors separated by a comma and spaces (S stands for white space). A ruleset contains curly braces and inside them a declaration or optionally a number of declarations separated by a semicolon. "declaration" and "selector" will be defined in the following BNF definitions.

### WebKit CSS parser

WebKit uses [Flex and Bison](https://www.html5rocks.com/en/tutorials/internals/howbrowserswork/#parser_generators) parser generators to create parsers automatically from the CSS grammar files. As you recall from the parser introduction, Bison creates a bottom up shift-reduce parser. Firefox uses a top down parser written manually. In both cases each CSS file is parsed into a StyleSheet object. Each object contains CSS rules. The CSS rule objects contain selector and declaration objects and other objects corresponding to CSS grammar.

![img](http://p1yseh5av.bkt.clouddn.com/18-6-20/53163758.jpg)

​										Figure : parsing CSS

## The order of processing scripts and style sheets

#### Scripts

The model of the web is **synchronous**. Authors expect scripts to be parsed and executed immediately when the parser reaches a <script> tag. The parsing of the document halts until the script has been executed. If the script is external then the resource must first be fetched from the network–this is also done synchronously, and parsing halts until the resource is fetched. This was the model for many years and is also specified in HTML4 and 5 specifications. Authors can add the "defer" attribute to a script, in which case it will not halt document parsing and will execute after the document is parsed. HTML5 adds an option to mark the script as asynchronous so it will be parsed and executed by a different thread.

### Speculative parsing

Both WebKit and Firefox do this optimization. While executing scripts, another thread parses the rest of the document and finds out what other resources **need to be loaded from the network** and **loads them**. In this way, resources can be loaded on parallel connections and overall speed is improved. Note: the speculative parser only parses references to external resources like external scripts, style sheets and images: it doesn't modify the DOM tree–that is left to the main parser.

### Style sheets

Style sheets on the other hand have a different model. Conceptually it seems that since style sheets don't change the DOM tree, there is no reason to wait for them and stop the document parsing. There is an issue, though, of scripts asking for style information during the document parsing stage. If the style is not loaded and parsed yet, the script will get wrong answers and apparently this caused lots of problems. It seems to be an edge case but is quite common. Firefox blocks all scripts when there is a style sheet that is still being loaded and parsed. WebKit blocks scripts only when they try to access certain style properties that may be affected by unloaded style sheets.

## Render tree construction

While the DOM tree is being constructed, the browser constructs another tree, the render tree. This tree is of visual elements in the order in which they will be displayed. It is the visual representation of the document. The purpose of this tree is to enable painting the contents in their correct order.

Firefox calls the elements in the render tree "frames". WebKit uses the term renderer or render object. 
A renderer knows how to lay out and paint itself and its children. 
WebKit's RenderObject class, the base class of the renderers, has the following definition:

```c
class RenderObject{
  virtual void layout();
  virtual void paint(PaintInfo);
  virtual void rect repaintRect();
  Node* node;  //the DOM node
  RenderStyle* style;  // the computed style
  RenderLayer* containgLayer; //the containing z-index layer
}
```















