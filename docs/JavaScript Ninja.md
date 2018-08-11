# JavaScript Ninja

## 第一章

熟练掌握定时器如何在浏览器内运行，可以让我们有能力解决复杂的编码任务，如长时间运行的计算和平滑的动画。而理解正则表达式是如何工作的，可以让我们简化原本相当复杂的代码段。

### 1.4 当前最佳实践

- 测试

  ```js
  assert(condition, message);
  ```

  for example

  ```js
  assert(a == 1, "Disaster! a is not 1")
  ```

- 性能分析

  收集性能信息

  ```js
  start = new Date().getTime();
  for(var n = 0; n < maxCount; n++){ 
     // perform the operation to be measured
  }
  elpased = new Date().getTime() - start;
  assert(true, "Measured time" + elapsed);
  ```

  注意我们是如何多次执行代码的，在本例中，我们执行的次数由maxCount表示。因为代码的单次操作执行太快而很难准确地测量，所以我们需要多次执行代码以获取可衡量的值。

  这些最佳实践技术，以及在这个过程中我们将学到的其他实践，将极大地提高我们的JavaScript开发水平。用浏览器提供的有限资源开发应用程序，再加上浏览器功能和兼容性问题日益复杂，因此掌握完整和强大的技能是非常必要的。

- 调试技巧

#### 总结

- 跨浏览器的Web应用程序开发是困难的，比大多数人想象的都要难。
- 为了圆满完成跨浏览器开发，我们不仅要掌握JS，还要全面了解浏览器以及它们的怪异模式和矛盾，并要具备当前最佳实践方面的良好基础。
- JS开发毋庸置疑是很具有挑战性的，但有一些勇敢者已经沿着这条曲折的道路走了下来。



## 第二章 利用测试和调试武装自己

为代码构建有效的测试套件是非常重要的。

我们不仅要处理典型问题：确保代码质量，尤其是与多位同时编写一段代码的开发人员打交道时，并避免出现会破坏API的回归错误。

还要处理：判断代码是否在我们选择支持的所有浏览器上都能正常运行。

### 2.1调试代码

从alert ->firebug ->webkit开发者工具

调试js有两个重要的方法：日志记录和断点

- 日志记录

  console.log()

- 断点

### 2.2 测试用例生成

不管是何种编程准则，好的测试铸就好的代码。

注意这个“好”字的强调。如果测试用例的构建很差，它很有可能只是大量的测试套件，不会真正帮助我们提高代码质量。

优秀的测试用例具有三个重要特征。

- 可重用性（repeatability）。测试结果应该是高度可再生的。多次运行测试应该产生相同的结果。如果测试结果是不确定的，那我们又如何知道哪些结果是有效的，哪些又是无效的呢？此外，可重现性可以确保我们的测试不依赖于外部因素。
- 简单性（simplicity）。测试应该只专注于测试一件事。在不影响测试用例目的的情况下，我们应该尽可能消除过多的HTML标记、CSS或JS。我们删除得越多，测试用例只受特定代码影响的可能性就越大。
- 独立性（independence）。测试用例应该独立执行。我们必须避免一个测试结果依赖于另外一个测试结果。把测试分解成尽可能小的单元，这将帮助我们确定在错误发生时确切代码位置。

1. 解构型测试用例（deconstructive test cases）——在消弱代码隔离问题时进行创建，以消除任何不恰当的问题。
2. 构建型测试用例（constructive test cases）—— 构建型测试用例，我们从一个大家熟知的良好精简场景开始，构建用例，知道我们能够重现bug为止。

### 2.3 测试框架

一个JS测试套件应该满足一个唯一需求：显示测试的结果，以便很容易地确定哪些测试是通过的，哪些是失败的。测试框架可以帮助我们达到这一目标，除了创建测试并将其组织到测试套件中意外，不用再担心别的事情。

测试框架中的功能。

- 能够模拟浏览器行为（单击按键等）
- 测试的交互式控制（暂停和恢复测试）
- 处理异步测试超时问题
- 能够过滤哪些会被执行的测试

近一半JS开发人员不做测试

- QUnit
  - 简洁的API
  - 支持异步测试
  - 特别适合于回归测试
- YUI Test
- JsUnit

### 2.4 测试套件基础知识

测试套件的主要目的是聚合代码中的所有单个测试，将其组合成为一个单位，这样它们可以批量运行。

为了更好的理解测试套件的工作原理，我们有必要了解如何构建一个测试套件。

构建自己的测试套件可以作为很好的学习经验，尤其是了解异步测试是如何工作的时候。

- 断言

  ```js
  var results = document.getElementById("results");
  function assert(value, desc) {
      var li = document.createElement('li');
      li.className = value?"pass":"fail";
      li.appendChild(document.createTextNode(desc));
     	results.appendChild(li);
      if(!value) {
          li.parentNode.parentNode.className = 'fail';
      }
      return li;
  }
  ```

- 测试组

  ```js
  function test(name, fn) {
      results = assert(true,name).appendChild(
      document.createElement("ul"));
      fn();
  }
  test('A test', function(){
      assert(true, "first assertion completed");
      assert(true, "second assertion completed");
      assert(true, "third assertion completed");
  });
  ```

- 异步测试

  很多开发人员在开发测试套件时遇到的一个艰巨而复杂的任务是对异步测试的处理。这些测试的结果在一段不确定的时间后会返回，这种场景的常见例子如 Ajax请求和动画。

  - 将依赖相同异步操作的断言组合成一个统一的测试组
  - 每个测试组需要放在一个队列上，在先前其他的测试组完成运行之后再运行。





## 第3章 函数是根基

- 函数是第一型对象

- 浏览器的事件轮询

  桌面应用程序编程经验：

  - 创建用户界面
  - 进入轮询，等待事件触发
  - 调用事件的处理程序

  浏览器编程没什么不同，唯一不同的就是，代码不负责事件轮询和事件派发，而是浏览器帮我们处理。

  我们的职责是为浏览器中发生的各种事件建立事件的处理程序（handler）。这些事件在触发时被放置在一个事件队列（先进先出列表FIFO）中，然后浏览器将调用已经为这些事件建立好的处理程序。

  事件处理函数的调用是异步的。

  以下事件都有可能相互穿插发生：

  - 浏览器事件
  - 网络事件
  - 用户事件
  - 计时器事件

  > 非侵入式JS 不再HTML上直接写JS

  浏览器的事件轮询是单线程的，每个事件都是按照在队列中所防止的顺序来处理的。每个水岸都在自己的生命周期内进行处理，所有其他事件必须等到这个事件处理结束以后才能继续处理。

- 排序

  ```js
  Arrays.sort(values, new Comparator<Integer>(){
              public int compare(Integer value1, Integer value2) {
      			return value2 - value1;
  			}
  })
  ```

  ```js
  var values = [2123, 43,4,6]
  values.sort(function(value1, value2) {return value1 - value2});
  ```

- 作用域和函数

  - 函数作用域
  - 函数声明提升
  - 对于作用域声明，全局上下文就像一个包含页面所有代码的超大型函数

- 调用

  - 作为函数进行调用

  - 作为方法进行调用

  - 作为构造器进行调用

    将函数作为构造器进行调用，是JS的一个超级特性，因为构造器调用时，如下行为会发生：

    - 创建一个空对象
    - 传递给构造器的对象时this参数，从而成为构造器的函数上下文
    - 如果没有显式返回值，新创建的对象则作为构造器的返回值进行返回

    ```js
    function Ninja() {
        this.skulk = function() {
            return this;
        }
    }
    var ninja1 = new Ninja();
    var ninja2 = new Ninja();
    ```

    构造器编码注意事项：

    构造器的目的是通过函数调用初始化创建新的对象。

    通过构造器，使用相同的模式就可以更容易地创建多个对象，而无需再一遍又一遍地重复相同的代码。通用代码，作为构造器的构造体，只需要编写一次。

- 使用apply和call方法进行调用

  当一个事件处理程序被调用时，该函数的上下文将被设置为绑定事件的那个对象。

  作为第一型对象（顺便说一下，它是由Function()构造器创建），函数可以像其他任何类型的对象一样，拥有属性和方法。

  命令式编程 VS 函数式编程

  ```js
  //命令式
  function collection(){
      for(var n = 0; n < collection.length; n++) {
          //do something to collection[n]
      }
  }
  //函数式
  function(item) {
      //do something to item
  }
  ```

  两者之间的区别在于思维层面：函数式程序的构件块而不是命令式语句。

  为了使函数式编程更容易，很多流行的JavaScript库都提供一个“for-each”的函数，该函数子啊数组的每个元素上都进行回调调用。在函数式编程中，这种风格更简洁，并优于传统的那些for语句。（代码重用）。

  构建简化版本forEach

  ```js
  function forEach(list, callback) {
      for(var n = 0; n < list.length; n++) {
          callback(list[n], n);
      }
  }
  var weapons = ['su', 'ka', 'nu'];
  forEach(
      weapons,
      function(index){
          ...
      }
  )
  ```

  鉴于apply和call的功能基本相同，我们该选哪一个呢？

  参数在数组里面，用apply

  变量有很多无关的值，用call

### 4.3 将函数视为对象

和其他对象一样，我们可以给函数添加属性。

```js
var fn = function(){}
fn.prop = "climbing"
```

- 函数存储

  有时候，我们可能需要存储一组相关但又独立的函数，事件回调管理是最明显的例子。向这个集合添加函数时，我们面临的挑战是要确定哪些函数在集合中不存在，而应该添加，以及哪些函数已经存在并且不需要再添加了。

  显而易见的天真做法是，将所有的函数保存在一个数组里，然后便利数组检查重复的函数。只不过这种方式很一般，作为忍者来说，我们不只是工作，而是要把工作做”好“。

  ```js
  //存储一组独立的函数
  var store = {
      nextId: 1,
      cache: {},
      add: function(fn) {
          if(!fn.id) {
              fn.id = store.nextId++;
              return !!(store.cache[fn.id] = fn);
          }
      }
  }
  ```

- 自记忆函数

  缓存记忆（memoization）是构建函数的过程，这种函数能够记住先前计算的结果。通过避免已经执行过的不必要复杂计算，这种方式可以显著提高性能。

  - 缓存记忆昂贵的计算结果

    基本示例： 看一个计算素数的简单算法，这只是一个复杂计算的简单例子，但这种方法却很容易适用于其他昂贵的计算，例如字符串的MD5哈希计算，比这里的示例复杂的多。

    ```js
    function isPrime(value) {
        if(!isPrime.answers) isPrime.answers = {};
        if(isPrime.answers[value] != null) {
            return isPrime.answers[value];
        }
        var prime = value != 1;
        for(var i = 2; i < value; i++) {
            if(value % i ==0) {
                prime = false;
                break;
            }
        }
        //保存计算出的值
        return isPrime.answers[value] = prime;
    }
    ```

    缓存记忆有两个优点：

    - 在函数调用获取之前计算结果的时候，最终用户享有性能优势。
    - 发生在幕后，完全无缝，最终用户和页面开发人员都无需任何特殊操作或为此做任何额外的初始化工作。

    缺点：

    - 为了提高性能，任何类型的缓存肯定会牺牲掉内存。
    - 纯粹主义者可能认为缓存这个问题不应该与业务逻辑放在一起，一个函数或方法应该只做一件事，并把它做好。
    - 很难测试或测量一个算法的性能，像本例这样。

  - 缓存记忆DOM元素

    通过元素的标签查询DOM元素集是相当常见的操作，但是性能可能不是特别好。我们可以利用新发现的缓存记忆特性创建一个缓存，用于保存已经匹配到的元素集。

    ```js
    function getElements(name) {
        if(!getElements.cache) getElements.cache = {};
        return getElements.cache[name] = getElements.cache[name]||document.getElementsByTagName(name);
    }
    ```

- 伪造数组方法

  给普通对象添加我们想要的功能

  ```js
  var elems = {
      length: 0, 
      //保存元素的个数。如果我们要假装成是数组，那么就需要保存元素项的个数
      add: function(elem) {
          Array.prototype.push.call(this, elem);
      },
      gather: function(id) {
          this.add(document.getElementById(id));
      }
  }
  ```

  

- 使用apply()支持可变参数

  call、apply、bind的区别

  call传的单个参数，apply传的数组

  call和apply会立即执行

  bind返回一个改变了上下文this的函数

  https://github.com/lin-xin/blog/issues/7

- arguments参数引用的不是真正的数组。

  引导Array函数将一个非数组当成一个数组来看待。

  Array.prototype.slice.call(arguments, 1);

- 根据传入的参数个数进行函数重载



## 第5章 闭包

- 闭包是什么，它们是如何工作的
- 利用闭包简化开发
- 利用闭包提高性能
- 利用闭包解决常见的作用域问题

**简单来说，闭包是一个函数在创建时允许该自身函数访问并操作该自身函数之外的变量时所创建的作用域。**

**换句话说，闭包可以让函数访问所有的变量和函数，只要这些变量和函数存在于该函数声明时的作用域内就行。**

```js
var outerValue = 'ninja';
var later;
function outerFunction() {
    var innerValue = 'samurai';
    function innerFunction() {
        assert(outerValue, "I can see ninja");
        assert(innerValue, "I can see samurai");
    }
    later = innerFunction;
}
outerFunction();
later();
```

答案是两个都能看见。

在外部函数中声明innerFunction()的时候，不仅是声明了函数，还创建了一个闭包，该闭包不仅包含函数声明，还包含了函数声明的那一时刻点上该作用域中的所有变量。

最终当innerFunction执行的时候，当时晟敏的作用域已经消失了，通过闭包，该函数还是能够访问到原始作用域的。

> 像保护气泡一样，只要innerFunction函数一直存在，它的闭包就保持该作用域中即将被垃圾回收的变量

这种气泡，包含了函数及其变量，和函数本身停留在一起。



闭包可以访问到什么内容

```js
var outerValue = 'ninja';
var later;

function outerFunction() {
    var innerValue = 'samurai';
    function innerFunction(paramValue) {
        assert(outerValue, "Innser see ninja");
        assert(innerValue, "Inner see samurai");
        assert(paramValue, "Inner see waki")
        assert(tooLate, "Inner see ronin")
    }
    later = innerFunction;
}
assert(!tooLate, "Outer cant see the ronin");
var tooLate = 'ronin';
outerFunction();
later('waki');
```

结果

```js
Outer cant see the ronin
Innser see ninja
Inner see samurai
Inner see waki
Inner see ronin
```

说明了：

- 内部函数的参数是包含在闭包中的
- 作用域之外的所有变量，即便是函数声明之后的那些声明，也都包含在闭包中
- 相同的作用域内，尚未声明的函数不能提前引用

### 5.2 使用闭包

- 私有变量
- 回调函数（callback）与计时器（timer）



### 5.3 绑定函数上下文

```js
var button = {
    clicked: false,
    click: function(){
        this.clicked = true;
        assert(button.clicked, "The button has been clicked");
    }
}
var elem = document.getElementById('test');
elem.addEventListener('click', button.click, false);
```

click函数的上下文不是我们所期待的button对象

如果通过`button.click()`调用函数，那么函数上下文就是button.

但是，在本示例中，浏览器的事件处理系统认为函数调用的上下文是事件的目标元素，所以才导致其上下文是test元素，而不是button对象。

通过使用匿名函数、apply和闭包，我们可以强制让特定的函数在调用时使用特定所需的上下文。

```js
function bind(context, name) {
    return function() {
        return context[name].apply(context, arguments);
    }
}
···
elem.addEventListener('click', bind(button, 'click'), false);
```

bind 该方法用于**创建并返回一个匿名函数**，该匿名函数使用apply调用了原始函数，以便我们可以强制将上下文设置成我们想要的任何对象。

**总结：bind就是返回一个使用apply改变了上下文的函数，并不执行它。**

在Prototype中，函数bind代码的示例

```js
Function.prototype.bind = function(){
    var fn = this,
        args = Array.prototype.slice.call(arguments),
        object = args.shift();
    
    return function(){
        return fn.apply(object,                  args.concat(Array.prototype.slice.call(arguments)));
    }
}
```

该方法与上述方法对比：

- 将自身方法作为Function的prototype属性的属性，以便将该方法附加到所有函数上，而不是声明一个全局作用域的方法。

bind 并不意味着它是apply或call的替代方法。该方法的潜在目的时通过匿名函数和闭包控制后续执行的上下文。这个重要的区别使apply和call对事件处理程序和定时器的回调进行延迟执行特别有帮助。

### 5.4 偏应用函数

“分部应用”一个函数是一项特别有趣的技术，在函数调用之前，我们可以预先传入一些函数。实际上，偏应用函数返回了一个含有预处理参数的新函数，以便后期可以调用。

这种在一个函数中首先填充几个参数（然后再返回一个新函数）的技术称之为柯里化currying。

```js
var elements = "val1, val2, val3".split(/,\s*/);
```

记住并编写正则表达式是一项乏味的事情。

在原生函数上进行分部参数应用：

```js
String.prototype.csv = String.prototype.split.partial(/,\s*/);
var results = ("Mugan, Jin, Fuu").csv();
```

Prototype库中的柯里化：

```js
Function.prototype.curry = function() {
    var fn = this,
        args = Array.prototype.slice.call(arguments);
    return function() {
        return fn.apply(this, args.concat(
        	Array.prototype.slice.call(arguments)
        ));
    }
}
```

这个技术是另外一个利用闭包记住状态的很好的例子。

在本例中，我们要记住新增加的函数（这里的this参数不会存在于任何闭包中，因为每个函数调用的时候都有自己的this）以及预填充参数，并将它们转移到新创建的函数中。该新函数将有预填充参数以及刚传入的新参数。其结果就是，这样的方法可以让我们预先传入一些参数，然后返回给我们一个新的简单函数供我们使用。

一个更复杂的“分部”函数：

```js
Function.prototype.partial = function() {
    var fn = this, args = Array.prototype.slice.call(arguments);
    return function() {
        var arg = 0;
        for(var i = 0; i < args.length && arg < arguments.length; i++) {
            if(args[i] === undefined) {
                args[i] = arguments[arg++]
            }
        }
        return fn.apply(this, args);
    }
}
```

该实现的本质类似于Prototype的curry方法，差异：

- 用户可以在参数列表的任意位置指定参数，然后在后续的调用中，根据遗漏的参数值是否等于undefined来判断参数的遗漏。！

让我们来看看其他一些使用该新函数的方式。

```js
var delay = setTimeout.partial(undefined, 10);
```

我们也可以创建一个简单的函数用于事件绑定：

```js
var bindClick = document.body.addEventListener.partial('click', undefined, false);
bindClick(function(){ 'click event'});
```

截止到目前，我们使用闭包减少了代码的复杂性，也展示了JS函数式编程的一些能力。现在，让我们继续研究如何使用闭包添加更高级的行为，并进行进一步代码简化。

### 5.5 函数重载

修改现有的函数，或基于现有的函数创建一个自更新的新函数。

- 缓存记忆

  ```js
  Function.prototype.memorized = function(key) {
      this._values = this._values || {};
      return this._values[key] !== undefined
          ?this._values[key]
      :this._values[key] = this.apply(this,arguments);
  }
  function isPrime(num) {
      var prime = num != 1;
      for(var i = 2; i < num; i++) {
          if(num % i == 0) {
              prime = false;
              break;
          }
      }
      return prime;
  }
  
  isPrime.memorized(5);
  ```

  直接切入现有函数的能力是有限的，但我们可以很容易在函数上添加一个新方法或者通过prototype给所有的函数都添加一个新方法。我们将为所有函数都添加一个memoized方法，使得该方法可以对函数进行包装，并附加与函数自身相关的属性。

  让我们研究一下如何通过闭包来创建一个新函数，以便在函数调用的时候自动进行缓存记忆，而无需再做像调用memoized方法这样的事情。

  ```js
  Function.prototype.memorized = function(key) {
      this._values = this._values || {};
      return this._values !== undefined ?
          this._values[key] :
      this._values[key] = this.apply(this, arguments);
  }
  Function.prototype.memorize = function() {
      var fn = this;
      return function() {
          return fn.memorized.apply(fn, arguments);
      }
  }
  var isPrime = (function(num){
      ...
  }).memorize();
      
  isPrime(17);
  ```

  在memorize方法中，我们构建了一个闭包，通过将上下文复制到一个变量中从而记住需要缓存记忆的原始函数。

- 函数包装

  **使用新功能包装旧函数**

  首先，创建一个包装函数用于函数包装，然后用该函数为readAttribute方法创建一个包装器。

  ```js
  function wrap(object, method, wrapper) {
      var fn = object[method];
      return object[method] = function() {
          return wrapper.apply(this, [fn.bind(this)].concat(
          Array.prototype.slice.call(arguments)
          ));
      }
  }
  if(Prototype.Browser.Opera) {
      wrap(Element.Methods, "readAttribute",
      	function(original, elem, attr){
          return attr == 'title' ?
              elem.title :
          	original(elem, attr);
      })
  }
  ```

  让我们深究一下wrap是如何工作的。传入了一个基本对象、要包装该对象中的方法名称、新包装函数。首先，将原有方法保存在变量fn中。

### 5.6 即时函数

```js
(function(){})();
```

这种模式的代码，毫无疑问可能用在很多地方，它给JS语言带来了出乎意料的能力。

`(...)()`

我们知道，可以通过函数名加圆括号(`functionName()`)的语法方式调用任意的一个函数。可以饮用函数名称调用函数

```js
var someFunction = function() { ... }
result = someFunction();
```

也就是说在(...)()中，第一组圆括号仅仅是用于划定表达式的范围，而第二个圆括号则是一个操作符。

```js
var someFunction = function() {...}
result = (someFunction)();
```

如果我们在第一组圆括号内直接使用匿名函数，而不是变量名称：

```js
(function(){...})();
```

在函数体内钾上一些语句 => 

```js
(function(){
    statement-1;
    statement-2;
    ...
})();
```

这段代码的最终结果是：

- 创建一个函数实例
- 执行该函数
- 销毁该函数

此外，因为我们要处理一个可以有一个闭包的函数，所以在函数调用的短暂过程中，也是可以访问和声明语句处在同一个作用域内的外部变量和参数的。

**临时作用域和私有变量**

​	利用即时函数，我们建立一个有趣的封闭空间来做一些事情，由于函数是立即执行，其内部所有的函数、所有的变量都局限于其内部作用域。我们可以使用即时函数来创建一个临时的作用域，用于存储数据状态。

- 创建一个独立作用域

  ```js
  (function(){
      var numClicks = 0;
      document.addEventListener('click', function(){
          alert( ++numClicks );
      }, false);
  })();
  ```

  上述代码为包含了numClicks变量的事件处理程序创建了一个闭包，该闭包使得numClicks变量可以在处理程序中进行持久化，并且可以被处理程序进行引用，除此之外没有别的地方可以引用该变量。

  ```js
  document.addEventListener('click', (function(){
      var numClicks = 0;
      return function() {
          alert( ++numClicks );
      }
  }), false);
  ```

  在很多编程语言中，作用域是依赖于代码块的。但是在JS中，变量的作用域依赖于变量所在的闭包。

**通过参数限制作用域内的名称**

```js
(function(what){ alert(what); }('Hi there!'));
```

另一个使用即时函数更加实际的例子，在页面上，将其他库与jQuery库一起混合使用，比如Prototype库。

jQuery提供一个方式(jQuery.noConflict)用于将$恢复成其他想使用的JS库

通过即时函数，我们可以**将$重新分配回jQuery**。

```js
$ = function() { alert('not jQuery'); }
(function($){
    $(img).on('click',function(){
        ...
    })
})(jQuery);
```

这种技术被很多jQuery插件开发人员所使用，他们在页面中的代码从来不直接使用$。直接用是不安全的。

**使用简洁名称让代码保持可读性**

通常，在一段代码中我们会频繁引用一个对象。如果引用很长并且很复杂，所有这些很长的名称会让代码变得难以阅读。

便捷的方法：

var short = Some.long.reference.to.something;

但是，我们在当前作用域内却引用了一个不必要的新名称。

```js
(function(v){
    Object.extend(v, {
        href: v.getAttr,
        src: v.getAttr,
        ...
    })
})(Element.attributeTranslations.read.values);
```

在当前示例中，Prototype正在给对象扩展新的属性和方法。在代码中，Prototype并没有为Element.attributeTranslations.read.values创建临时变量！

这种在作用域内创建临时变量的技巧，对没有延迟调用的循环遍历来说尤其有用。

**循环**

即时函数另外一个有用的地方是，它可以利用循环和闭包解决一些棘手的问题。

```js
var divs = document.getElementsByTagName('div');
for(var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', function(){
        alert('divs ' + i + ' was clicked');
    },false);
}
```

不过不用担心，我们可以再用一个闭包和即时函数来修正当前这个闭包的问题。

```js
var divs = document.getElementsByTagName('div');
for(var i = 0; i < divs.length; i++) {
    (function(n){
       divs[n].addEventListener('click', function(){
        alert('divs ' + n + ' was clicked');
    	},false) 
    })(i);
}
```

**类库包装**

关于闭包和即时函数细粒度应用的另外一个重要用途，是将其用于JS类库的开发。当我们开发一个类库时，很重要的一点是，不希望让一些不必要的变量去污染全局命名空间，尤其是哪些临时变量。

要解决这个问题，闭包和即时函数尤其有用，它们可以帮助我们让类库尽可能的保持私有，并且可以有选择性的让一些变量暴露到全局命名空间内。jQuery旧专注于这个原则，完整的封装了它所有的功能，并选择性的将一些变量关联到全局空间。

```js
(function(){
    var jQuery = window.jQuery = function(){
        //
    }
})();
```

注意，这里有两次赋值，这是有意这样做的。

赋值给window.jQuery，这样就将其作为一个全局变量了。

尽管如此，也不能保证全局的jQuery变量就会一直存在，处于我们控制代码之外的代码可能会改变或删除jQuery。为了避免这个问题，将其赋值给局部变量，强制将其保持在即时函数的作用域内。

另外一种方式：

```js
var jQuery = (function(){
    function jQuery(){
        //
    }
    return jQuery;
})()
```



## 第6章 原型和面向对象

- 利用函数实现构造器
- 探索原型
- 利用原型实现对象的扩展
- 避免常见的问题
- 构建可继承的类

作为JS的一个方便方式，使用原型所定义的属性和功能会自动应用到对象的实例上。

原型类似于经典面向对象语言中的类（classes）

JS原型的主要用途就是使用一种类风格的面相对象和继承技术进行编码。

所有的函数在初始化的时候都有一个prototype属性，该属性的初始值是一个空对象。只有在函数作为构造器的时候，prototype属性才会发挥更大的作用。



在创建对象时，不仅仅是简单复制属性那么简单。

事实上，原型上的属性并没有复制到其他地方，而是附加到新创建的对象上了，并可以和对象滋生的属性引用一起协调运行。

```js
function Ninja() {
    this.swung = true;
}
var ninja = new Ninja();
Ninja.prototype.swingSword = function() {
    return this.swung;
}
assert(ninja.swingSword(), 'Method exists');
```

在引用一个对象的属性时：

1. 看对象本身是否有。
2. 看对象原型是否有。
3. 都没有，返回undefiend

**通过构造器判断对象类型**

对象的构造器可以通过constructor属性获得。任何时候我们都可以重新引用该构造器，甚至可以使用它进行类型检查。

```js
function Ninja() {}
var ninja = new Ninja();
typeof ninja == 'object'; //true
ninja.contructor == 'Ninja'; //true
ninja instanceof Ninja; //true

var ninja2 = new ninja.constructor();
```

**继承与原型链**

instanceof 操作符还有另外一个功能，我们可以利用它作为对象继承的一种形式

```js
function Person() {}
Person.prototype.dance = function() {};
function Ninja() {};

Ninja.prototype = { dance: Person.prototype.dance };
var ninja = new Ninja();

ninja instanceof Ninja; //true
ninja instanceof Person; //false
ninja instanceof Object; //true
```

创建一个实现继承的原型链：

```js
subClass.prototype = new SuperClass();
//例如
Ninja.prototype = new Person();
```

所有原生JS对象构造器（如Object、Array、String、Number、RegExp、Function）都有可以被操作和扩展的原型属性。因为每个对象构造器自身就是一个函数。

实现forEach：

```js
if(!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, context) {
        for(var i = 0; i < this.length; i++) {
            callback.call(context || null, this[i], i, this);
        }
    }
}
```

**HTML DOM 原型**

所有DOM元素都继承于HTMLElement构造器。通过访问HTMLElement的原型，浏览器可以为我们提供扩展任意HTML节点的能力。

```js
HTMLElement.prototype.remove = function() {
    if(this.parentNode){
        this.parentNode.removeChild();
    }
}
```

尽管浏览器暴露了基本元素构造器和原型，它们选择性地禁用了通过构造器创建元素的能力。



### 6.2 疑难陷阱

**扩展对象**

扩展原生Object.prototype.在扩展该原型时，所有的对象都会接收这些额外的属性。

```js
Object.prototype.keys = function() {
    var keys = [];
    for(var p in this) keys.push(p);
    return keys;
}
var obj = { a:1, b:2, c:3};
```

```js
Object.prototype.keys = function() {
    var keys = [];
    for(var i in this){
        if(this.hasOwnProperty(i)) {
            keys.push(i);
        }
    }
    return keys;
}
var obj = { a:1, b:2, c:3};
```

**扩展数字**

```js
Number.prototype.add = function(num) {
    return this + num;
}
var n = 5;
n.add(3) == 8; //works
(5).add(3) == 8; //works
5.add(3) == 8; //No
```

语法解析器不能处理字面量这种情况

！最好避免在Number的原型上做扩展。

**子类化原生对象**

```js
function MyArray() {}
MyArray.prototype = new Array();
var mine = new MyArray();
mine.push(1,2,3);
mine.length ==3 
```

除了在IE上，该代码在其他任何地方都能正常使用。

在这种情况下，最好的策略是单独实现原生对象的各个功能，而不是扩展出子类。

```js
function MyArray() {}
MyArray.prototype.length = 0;
(function(){
    var methods = ['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'join'];
    for(var i = 0; i < methods.length; i++) (function(name){
        MyArray.prototype[name] = function() {
            return Array.prototype[name].apply(this, arguments);
        }
    })(methods[i]);
})();
```

唯一一个需要自己实现的一个属性是length属性，因为该属性需要保持易变性——IE。

**实例化问题**

函数有两种用途：作为“普通”的函数，以及作为构造器。

- 不小心将变量引入到全局命名空间中

```js
function User(first, last) {
    this.name = first + ' ' + last;
}
var name = 'Rukia';
var user = User('Inc', 'Ku');
name == 'Rukia' //false
```

函数作为构造器调用时，函数调用的上下文是新分配的对象。

但作为普通函数调用时，其上下文是全局作用域。

- 判断函数是否是作为构造器调用的

  ```js
  function Test() {
      return this instanceof arguments.callee;
  }
  !Test(); 
  new Test(); 
  ```

  - 通过arguments.callee可以得到当前执行函数的引用
  - 普通函数的上下文是全局作用域
  - 利用instanceof操作符测试已构建对象是否构建于指定的构造器

经过修改后：

```js
function User(first, last) {
    if(!(this instanceof arguments.callee)) {
        return new User(first, last);
    }
    this.name = first + ' ' + last;
}
```

### 6.3 编写类风格的代码

```js
var Person = Object.subClass({
    init: function(isDancing) {
        this.dancing = isDancing;
    },
    dance: function() {
        return this.dancing;
    }
});
var Ninja = Person.subClass({
    init: function() {
        this._super(false);
    },
    dance: function() {
        return this._super();
    }
})
```

**子类方法**

```js
(function() {
    var initializing = false,
        superPattern = /xyz/.test(function() {
            xyz;
        })?/\b_super\b/ : /.*/;
    Object.subClass = function(properties) {
        var _super = this.prototype;
        
        initializing = true;
        var proto = new this();
        initializing = false;
        
        for(var name in properties) {
            proto[name] = typeof properties[name]=='function'
            &&typeof _super[name] == 'function'
            &&superPattern.test(properties[name])?
                (function(name, fn){
                return function(){
                    var tmp = this._super;
                    this._super = _super[name];
                    var ret = fn.apply(this, arguments);
                    this._super = tmp;
                    return ret;
                }
            })(name, properties[name]):
            properties[name];
        }
    }
    function Class() {
        if(!initializing && this.init) {
            this.init.apply(this, arguments);
        }
        Class.prototype = proto;
        Class.constructor = Class;
        Class.subClass = arguments.callee;
        return Class;
    }
})();
```

该实现的两个最重要的部分是初始化以及超类方法处理部分。对这两个部分进行深入了解有助于理解整个实现。

**检测函数是否可序列化**

函数序列化（function serialization）就是简单接收一个函数，然后返回该函数的源码文本。稍后，我们可以使用这种方法检查一个函数在我们感兴趣的对象中是否存在引用。

在大多数现代浏览器中，函数的toString方法都会奏效。一般来说，一个函数在其上下文序列化成字符串，会导致它的toString方法被调用，所以，可以用这种方式测试函数是否可以序列化。

- 我们使用如下表达式测试一个函数是否能够被序列化。

```js
/xyz/.test(function(){
    xyz;
})
```

该表达式创建一个包含xyz的函数，将该函数传递给正则表达式的test方法，该正则表达式对字符串xyz进行测试。如果函数能够正常序列化，最终结果将返回true。

我们在随后的代码中使用了该正则表达式：

```js
superPattern = /xyz/.test(function(){xyz; })?
    /\b_super\b/ : /.*/;
```

建立了一个名为superPattern的变量，稍后用它来判断一个函数是否包含字符串

“_super”；只有函数支持序列化才能进行判断，所以在不支持序列化的浏览器上，我们使用一个匹配任意字符串的模式进行代替。

**子类的实例化**

此时，我们准备开始定义一个方法用于子类化父类。

```js
Object.subClass = function(properties) {
    var _super = this.prototype;
} 
```

给Object添加一个subClass方法，该方法接收一个参数，该参数是我们期望添加到子类的属性集。

为了用函数原型模拟继承，我们使用前面讨论过的技术：

```js
function Person() {}
function Ninja() {}
Ninja.prototype = new Person();
new Ninja() instanceof Person;
```

**这段代码的具有挑战之处是我们想从instanceof运算符中受益，而不是实例化Person对象并运行其构造器**。为了抵消这一点，我们在代码中定义了一个initializing变量，，每当我们想使用原型实例化一个类的时候，都将该变量设置为true；

因此，在构造实例时，我们可以确保不在实例化模式下进行构建实例，并可以相应地运行或跳过init方法。

```js
if(!initializing && this.init) {
    this.init.apply(this, arguments);
}
```

尤其重要的是，init方法可以运行各种昂贵的启动代码（连接到服务器、创建DOM元素、还有其他未知内容），所以如果只是创建一个实例作为原型的话，我们要规避任何不必要的昂贵启动代码。

接下来，我们需要做的是将传递给子类的方法赋值到原型实例上。

**保留父级方法**

重写函数时，可以通过_super调用父函数。

```js
typeof properties[name] == 'function' &&
    typeof _super[name] == 'function' &&
    superPattern.test(properties[name])
```

需要判断：

- 子类属性是否是一个函数
- 超类属性是否是一个函数
- 子类函数是否包含一个_super()引用

只有三个条件都为true的时候，我们才能做所要做的事情，而不是复制属性值。

```js
 (function(name, fn){
     return function(){
         var tmp = this._super;
         this._super = _super[name];
         var ret = fn.apply(this, arguments);
         this._super = tmp;
         return ret;
     }
 })(name, properties[name])
```

该即时函数创建并返回了一个新函数，该新函数包装并执行了子类的函数，同时可以通过_super属性访问父类函数。

首先，作为优秀的开发人员，需要先保持旧的this._super引用，然后处理完以后再恢复该引用。

接下来，创建新的super方法，它只是在父类原型中已经存在的一个方法的引用。值得庆幸的是，我们不需要做任何额外的代码修改或作用域修改。当函数称为我们对象的一个属性时，该函数的上下文会自动设置（this引用的是当前子类的实例，而不是父类实例）。



## 第7章 正则表达式

用一句正确的正则表达式很有可能就可以省略半屏幕的代码。

```js
function isThisAZipCode(candidate) {
    return /^\d{5}-\d{4}$/.test(candidate);
}
```

\b匹配单词边界。

**反向引用**

这种属于表示法是在反斜杠后面加一个要引用的捕获数量，该数字从1开始，如\1，\2等。

**重复出现**

？0次或1次

\+ 1次或多次

\* 0次或多次

{} 表示重复次数

{m, n} 表示重复m-n次





## 第8章 驯服线程和定时器

- JavaScript是如何处理线程的
- 定时器执行详解
- 使用定时器处理大型任务
- 使用定时器管理动画
- 使用定时器进行更好的测试

定时器不是JS的一项功能。定时器作为对象和方法的一部分，才能在浏览器中使用。如果在非浏览器环境，我们不得不使用特定实现的功能（如Rhino中的线程），来实现我们自己的定时器版本。

由于JS是单线程的特性，定时器提供了一种跳出这种限制的方法，以一种不太直观的方式来执行代码。

### 8.1 定时器和线程是如何工作的

JavaScript定时器的延迟时间是不能保证的。原因和JS线程的本质有很大关系。

**执行线程中的定时器执行**

在Web Worker可用之前，浏览器中的所有JS代码都是在单线程中执行的。

这种情况的不可避免的结果就是：异步事件的处理程序，如用户界面事件和定时器，在线程中没有代码执行的时候才进行执行。这就是说，处理程序在执行时必须进行排队执行，并且一个处理程序并不能中断另外一个处理程序的执行。

当一个异步事件发生时，会排队，在线程空闲时才进行执行。

![](http://p1yseh5av.bkt.clouddn.com/18-7-15/54377593.jpg)

浏览器不会对特定interval处理程序的多个实例进行排队。

重要概念：由于JS是单线程的，在特定的时间点只能运行一个执行代码，而且我们也不能确定定时器处理程序到底是在什么时候执行的。

interval间隔定时器有一些并不适用于timeout定时器的特殊情况。

**timeout和interval之间的区别**

```js
setTimeout(function repeatMe() {
    setTimeout(repeatMe, 10);
}, 100);
setInterval(function() {
    //
}, 10);
```

- JS引擎是单线程执行，异步事件必须要排队等待才能执行。
- 如果无法立即执行定时器，该定时器会被推迟到下一个可用的时间点上。
- 如果一直被延迟，多最后，Interval间隔定时器可能会无延迟执行，并且同一个interval处理程序的多个实例不能同时进行排队。
- setTimeout和setInterval在出发周期的定义上是完全不同的。

了解JS引擎如何处理异步代码，尤其是如何处理通常发生在页面上的大量异步事件，是构建高级应用程序代码的重要基础。



### 8.2 定时器延迟的最小化及其可靠性

······

现代浏览器通常无法实现1ms粒度的可持续间隔，但某些浏览器的实现却真的非常接近。

浏览器不保证我们指定的延时间隔。虽然我们可以指定特定的值，但其准确性却并不总是能够保证，尤其是在延迟值很小的时候。   



### 8.3 处理昂贵的计算过程

JS的单线程本质可能是JS复杂应用开发中的最大陷阱。在JS执行繁忙的时候，浏览器中的用户交互，最好的情况是操作稍有缓慢，最差的情况则是反应迟钝。这可能会导致浏览器很卡或者似乎要挂掉，因为在JS执行的时候，页面渲染的所有更新操作都要暂停。

因此，如果要保持界面有良好的响应能力，减少运行时间超过几百ms的复杂操作，将其控制在可管理状态是非常必要的。此外，如果一段脚本的运行时间超过5s，有些浏览器将弹出一个对话框警告用户该脚本“无法响应”。而其他浏览器，比如iPhone上的浏览器，将默认终止运行时间超过5s的脚本。

这时候，定时器就可以来拯救我们了，其会变得特别有用。作为定时器，它在一段时间之后，可以有效暂停一段JS代码的执行，定时器还可以将代码的各个部分，分解成不会让浏览器挂掉的碎片。

考虑到这一点，我们可以将强循环和操作转化为非阻塞操作。

```js
var tbody = document.getElementsByTagName("tbody")[0];
for(var i = 0; i < 20000; i++) {
    var tr = document.createElement('id');
    for(var t = 0; t < 6; t++) {
        var td = document.createElement('td');
        td.appendChild(document.createTextNode(i + ',' + t));
    	tr.appendChild(td);
    } 
	tobody.appendChild(tr);    
}
```

本例我们创建了240000个DOM节点。这是昂贵的操作，明显会增加浏览器的执行时间，从而阻止正常的用户交互操作。

- 使用定时器分解长时间运行的任务

  ```js
  var rowCount = 20000;
  var divideInto = 4;
  var chunkSize = rowCount/divideInto;
  var iteration = 0;
  
  var table = document.getElementsByTagName('tbody')[0];
  
  setTimeout(function generateRows(){
      var base = (chunkSize)*iteration;
      for(var i = 0; i < chunkSize; i++) {
          var tr = document.createElement('tr');
          for(var t = 0; t < 6; t++) {
              var td = document.createElement('td');
              td.appendChild(
              document.createTextNode((i + base) + ',' + t +',' + iteration);
              );
              tr.appendChild(td);
          }
          table.appendChild(tr);
      }
      iteration++;
      if(iteration < divideInto) {
          setTimeout(generateRows, 0);
      }
  }, 0)
  ```

  在修改示例中，我们将冗长的操作拆分成四步小操作，每个操作创建自己的DOM节点。这些较小的操作，则不太可能让浏览器挂掉。

  我们应该努力确保，在页面中引入的代码不会明显中断浏览器的正常运行。

  这种技术的有用之处通常是令人惊讶的。我们会经常发现它被用于长时间运行的过程中。

  最重要的是，该技术展示了，使用定时器解决浏览器环境的单线程限制是多么容易的事情，而且还提供了很好的用户体验。

  但是，处理大量的定时器是很不实用的。

### 8.4 中央定时器控制

使用定时器可能出现的问题是对大批量定时器的管理。这在处理动画时尤其重要，因为在试图操纵大量属性的同时，我们还需要一种方式来管理它们。

管理多个定时器会出现很多问题，原因有很多。存在的问题不仅是要保留大量间隔定时器的引用，然后迟早还必须取消它们，而且还干扰了浏览器的正常运行。我们之前看到，**确保定时器处理程序不执行过于冗长的操作**，可以防止我们的代码阻塞其他操作，但也有一些其他浏览器已经考虑到这方面了。其中之一就是垃圾回收。

同时创建大量的定时器，将会在浏览器中增加垃圾回收任务发生的可能性。大致说来，**垃圾回收就是浏览器遍历其分配过的内存，并试图删除没有任何应用的未使用对象的过程**。定时器是一个特殊的问题，因为通常它们是在JavaScript单线程引擎之外的流程中进行管理的（通过其他浏览器线程）。

有些浏览器可以很好的处理这种情况，但其他一些浏览器的垃圾回收周期则很长。大家可能已经注意到了，一个动画在某个浏览器中很漂亮、很流畅，但在另外一个浏览器中却很卡顿。减少同时使用定时器的数量，将大大有助于解决这种问题，这就是为什么所有现代动画引擎都是用一种称为中央定时器控制（central timer control）的技术。

在多个定时器中使用中央定时器控制，可以带来很大的威力和灵活性。

- 每个页面在同一时间只需要运行一个定时器
- 可以根据需要暂停和恢复定时器
- 删除回调函数的过程变得很简单

**管理多个处理程序的中央定时器控制**

```js
var timers = {
    timerID: 0,
    timers: [],
    add: function(fn) {
        this.timers.push(fn);
    },
    start: function() {
        if(this.timerID) return;
        (function runNext(){
            if(timers.timers.length > 0) {
                for(var i = 0; i < timers.timers.length; i++){
                    if(timers.timers[i]() === false) {
                        timers.timers.splice(i, 1);
                        i--;
                    }
                }
                timers.timerID = setTimeout(runNext, 0);
            }
        })();
    },
    stop: function() {
        clearTimeout(this.timerID);
        this.timerID = 0;
    }
}
```

使用这个中央定时器：

```js
<div id="box">Hello!</div>

var box = document.getElementById("box"), x = 0, y = 20;
timers.add(function(){
    box.style.left = x + 'px';
    if(++x > 50) return false;
});

timers.add(function(){
    box.style.top = y + 'px';
    y+=2;
    if(y>120) return false;
})

timers.start();
```

重要的是要注意，以这种方式组织定时器，可以确保回调函数总是按照添加的顺序进行执行。而普通的定时器通常不会保证这种顺序。

### 8.5 异步测试

······



## 第13章 不老事件

本章内容：

- 为什么事件会有问题
- 事件绑定和解绑技术
- 事件触发
- 自定义事件的使用
- 事件冒泡和事件委托

DOM事件并不简单

尽管所有的浏览器都提供了相对稳定的事件管理API，但它们的方法和实现都不相同。浏览器提供的功能对于完成大部分需要复杂应用程序才能处理的任务来说是不够的，其难度甚至超出浏览器差异带来的挑战。

JS库最终需要重新实现现有的浏览器事件处理API。本书有助于了解我们所使用的库对这类事件处理程序是如何处理的，也有助于我们了解这些类库在刚开始创建时的秘密。

```js
<body onload="doSomething()">    
window.onload = doSomething;
```

这两种方法都使用了 DOM Level 0 Event Model

但DOM Level 0 事件有严重的局限性，使得其不适合用于构建可重用代码或者复杂的页面。

DOM Level 2 事件模型提供了一个更强大的API，但是它的使用也是有问题的，因为它在IE 9之前版本的浏览器上不可用。它缺少一些我们真正需要的功能。

本章将帮助我们查看事件处理的雷区，并解释如何克服浏览器带给我们的糟糕环境。

### 13.1 绑定和解绑事件处理程序

DOM 2 Model：addEventListener和removeEventListener

IE Model：attachEvent和detachEvent

IE Model没有提供事件捕获阶段的监听方式。IE Model只支持事件处理过程中的冒泡阶段。

IE Model设置了错误的上下文，并且没有将事件信息传递给处理程序。

> 冒泡阶段：事件将事件源传播到DOM根节点
>
> 捕获阶段：从DOM根节点遍历传播到事件源上
>
> 任何W3C事件模型中发生的事件都是先捕获，直到它到达目标元素，然后再向外冒泡。

```js
addEvent(window, 'load', function(){
    var elems = document.getElementsByTagName('div');
    for(var i = 0; i < elems.length; i++) {
        (function(elem){
            var handler = addEvent(elem, 'click', function(){
                this.style.backgroundColor = this.style.backgroundColor==''?'green':'';
           		removeEvent(elem, 'click', handler)
            })
        })(elems(i));
    }
})
```

不能依赖callee，IE下不正确

### 13.2 Event对象

在DOM Model中，Event对象实例是作为第一个参数传入到事件处理程序中；

IE Model中，是通过全局上下文的属性来获取到的。

创建一个新的对象来模拟浏览器的原始事件对象，将原始事件的属性进行规范化以匹配DOM Model。为什么不直接修改现有对象？因为原生事件对象中有很多属性不能被覆盖。

**规范化Event对象实例**

```js
function fixEvent(event) {
    function returnTrue { return true; }
    function returnFalse { return false; }
    //测试是否需要修复
    if(!event||!event.stopPropagation){
        var old = event||window.event;
        //clone the old object so that we can modify the values
        event = {};
        for(var prop in old) {
            event[prop] = old[prop];
        } 
        //The event occurred on this element
        if(!event.target) {
            event.target = event.srcElement||document;
        }
        event.relatedTarget = event.fromElement === event.target?event.toElement:event.fromElement;
        //stop the default browser action 阻止默认事件
        event.preventDefault = function() {
            event.returnValue = false;
            event.isDefaultPrevented = returnTrue;
        }
        event.isDefaultPrevent = returnFalse();
        event.stopPropagation = function() {
            event.cancelBubble = true;
            event.isPropagationStopped = returnTrue;
        }
        event.isPropagationStopped = returnFalse;
        event.stopImmediatePropagation = function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        }
        event.isImmediatePropagationStopped = returnFalse;
        
        //Handle mouse position
        if(event.clientX != null) {
            var doc = document.documentElement, body = document.body;
            event.pageX = event.clientX +
             (doc&&doc.scrollLeft||body&&body.scrollLeft||0) - 
             (doc&&doc.clientLeft||body&&body.clientLeft||0);
            event.pageY = event.clientY +
             (doc&&doc.scrollLeft||body&&body.scrollLeft||0) - 
             (doc&&doc.clientLeft||body&&body.clientLeft||0);
        }
        event.which = event.charCode || event.keyCode;
        //Fix button for mouse clicks:
        //0 == left; 1 == middle; 2 == right
        if(event.button != null) {
            event.button = ...
        }
    }
    return event;//修复后的实例
}
```

> **pageX/pageY:** 鼠标相对于整个页面的X/Y坐标。  特别说明：IE不支持！ **clientX/clientY：** 事件发生时鼠标在浏览器内容区域的X/Y坐标（不包含滚动条）。

好了，现在我们有一种规范化的Event实例了。

### 13.3 处理程序的管理

由于诸多原因，不将事件处理程序直接绑定在元素上是有利的。如果我们使用一个中间事件处理程序，并将所有的处理程序都保存在一个单独的对象上，我们可以最大化的控制处理过程。

还能做到以下几点：

- 规范化处理程序的上下文
- 修复Event对象的属性
- 处理垃圾回收
- 过滤触发或删除一些处理程序
- 解绑特定类型的所有事件
- 克隆事件处理程序

#### 集中存储相关信息

管理与DOM元素相关联的处理程序的最好方式是给每个元素都指定一个唯一标识符，然后将所有相关的数据和该标识符一起保存在一个集中的对象上。虽然将信息单独保存在每个对象上似乎更自然，但是将所有的数据都保存在一个集中的对象上可以避免IE浏览器的潜在内存泄漏问题，这些潜在问题在某些情况下会丢失信息。（例如，在IE的DOM元素上绑定的函数如果在某个元素节点上有闭包关联的话，离开页面时会导致内存回收失败）

**实现一个中央对象用于保存DOM元素信息**

```js
<div title="Ninja"> Ninja </div>
<div title="Secrets">秘密</div>
<script>
(function(){
	var cache = {},
        guidCounter = 1,
        expando = "data" + (new Date).getTime();
    this.getData = function(elem) {
        var guid = elem[expamdo];
        if(!guid) {
            guid = elem[expando] = guidCounter++;
            cache[guid] = {};
        }
        return cache[guid];
    }
    this.removeData = function(elem) {
        var guid = elem[expando];
        if(!guid) return;
        delete cache[guid];
        try {
            delete elem[expando];
        }
        catch (e) {
            if(elem.removeAttribute) {
                elem.removeAtribute(expando);
            }
        }
    }
})();
var elems = document.getElementsByTagName('div');
for(var n = 0; n < elems.length; n++) {
    getData(elems[n]).ninja = elems[n].title;
}
for(var n = 0; n < elems.length; n++) {
    getData(elems[n]).ninja === elems[n].title;
}
for(var n = 0; n < elems.length; n++) {
    removeData(elem[n]);
    getData(elems[n]).ninja === elems[n].title;
}
</script>
```

我们需要一些变量，但又不想污染全局作用域，所以我们在一个即时函数里进行设置。

#### 管理事件处理程序

为了完全控制事件处理过程，我们需要创建自己的函数来包装事件的绑定和解绑操作。这样做，我们可以尽可能地在所有平台上，将事件处理模型进行统一。

**绑定事件处理程序并进行跟踪的函数**

```js
(function(){
    var nextGuid = 1;
    this.addEvent = function(elem, type, fn) {
        var data = getData(elem);
        if(!data.handlers) data.handlers = {};
        if(!data.handlers[type]) {
            data.handlers[type] = [];
        }
        if(!fn.guid) {
            fn.guid = nextGuid++;
        }
        data.handlers[type].push(fn);
        if(!data.dispatcher) {
            data.disabled = false;
            data.dispatcher = function(event) {
                if(data.disabled) return;
                event = fixEvent(event);
                var handlers = data.handlers[event.type];
                if(handlers) {
                    for(var n = 0; n < handlers.length; n++){
                        handlers[n].call(elem, event);
                    }
                }
            }
        }
        if(data.handlers[type].length == 1){
            if(document.addEventListener){
                elem.addEventListener(type, data.dispatcher, false);
            }
            else if(document.attachEvent) {
                elem.attachEvent('on' + type, data.dispatcher);
            }
        }     
    }
})();
```

最后，判断是否为该元素创建了第一个这种类型的处理程序，如果是，就在运行的浏览器中根据适当的方法，将dispatcher函数作为该类型的事件处理程序进行绑定。

最后的结果就是，传入的函数从来就没有成为实际的事件处理程序，相反，它们通过委托函数进行保存，并在事件发生时进行调用，真正的处理程序是委托函数。可以做到：

- Event实例被修复
- 将函数上下文设置成目标元素
- Event实例作为唯一的参数传递给处理程序
- 事件处理程序永远按照其绑定顺序进行执行

使用这种方式对事件处理过程进行这种级别的控制，尤达都会感到自豪。

**清理资源**

- 清理处理程序

```js
function tidyUp(elem, type) {
    function isEmpty(object){
        for(var prop in object){
            return false;
        }
    }
    var data = getData(elem);
    if(data.handlers[type].length === 0){
        delete data.handlers[type];
        if(document.removeEventListener) {
            elem.removeEventListener(type, data.dispatcher, false);
        } else if(document.detachEvent){
            elem.detachEvent('on' + type, data.dispatcher);
        }
    }
    if(isEmpty(data.handlers)) {
        delete data.handlers;
        delete data.dispatcher;
    }
    if(isEmpty(data)){
        removeData(elem);
    }
 }
```

**解绑事件处理程序**

功能：

- 将一个元素的所有绑定事件进行解绑
- 将一个元素特定类型的所有事件进行解绑
- 将一个元素的特定处理程序进行解绑

通过一个可变长度的参数列表，我们可以实现上述功能。

`removeEvent(element);`

`removeEvent(element, 'click');`

`removeEvent(element, 'click', handler);`

- 事件处理程序的解绑函数

```js
this.removeEvent = function(elem, type, fn) {
    var data = getData(elem);
    if(!data.handlers) return;
    var removeType = function(t) {
        data.handlers[t] = [];
        tidyUp(elem, t);
    }
    if(!type) {
        for(var t in data.handlers) removeType(t);
        return;
    }
    var handlers = data.handlers[type];
    if(!handlers) return;
    if(!fn) {
        removeType(type);
        return;
    }
    if(fn.guid) {
        for(var n = 0; n < handlers.length; n++) {
            if(handlers[n].guid === fn.guid) {
                handlers.splice(n--,1);
            }
        }
    }
    tidyUp(elem, type);
}
```

**事件触发**

```js
function triggerEvent(elem, event){
    var elemData = getData(elem),
        parent = elem.parentNode||elem.ownerDocument;
    if(typeof event === 'string') {
        event = { type:event, target:elem };
    }
    event = fixEvent(event);
    if(elemData.dispatcher) {
        elemData.dispatcher.call(elem, event);
    }
    if(parent && !event.isPropagationStopped()){
        triggerEvent(parent, event);
    } else if(!parent&&!event.isDefaultPrevented()) {
        var targetData = getData(event.target);
        if(event.target[event.type]) {
            targetData.disabled = true;
            event.target[event.type]();
            targetData.disabled = false;
        }
    }
    
}
```

**自定义事件**

**松耦合**

**触发自定义事件**

```js
addEvent(body, 'ajax-start', function(){
    ...
})
addEvent(body, 'ajax-end', function(){
    ...
})
function performAjaxOperation(target) {
    triggerEvent(target, 'ajax-start');
    triggerEvent(target, 'ajax-end');
}
```

