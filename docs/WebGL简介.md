## WebGL简介

**WebGL**（全写Web Graphics Library）是一种3D绘图标准，这种绘图技术标准允许把JavaScript和OpenGL ES 2.0结合在一起，通过增加OpenGL ES 2.0的一个JavaScript绑定，WebGL可以为HTML5 Canvas提供硬件3D加速渲染，这样Web开发人员就可以借助系统显卡来在浏览器里更流畅地展示3D场景和模型了，还能创建复杂的导航和数据视觉化。

以上是WebGL在百科上的一段介绍，说白了，就是通过浏览器提供的接口，我们能直接和底层的OpenGL库打交道。由于能直接调用底层接口，并且有硬件加速，因此WebGL要比普通的Canvas 2D Api性能要高出不少。这里有一个对WebGL和Canvas 2D Api的性能对比实验[developer.tizen.org/dev-guide/w…](https://link.juejin.im/?target=https%3A%2F%2Fdeveloper.tizen.org%2Fdev-guide%2Fweb%2F2.3.0%2Forg.tizen.mobile.web.appprogramming%2Fhtml%2Fguide%2Fw3c_guide%2Fgraphics_guide%2Fperformance_comparison.htm)。在实验中，通过加载一幅图片并随机显示在canvas中的某个位置，通过requestAnimationFrame定时修改图片的颜色，并记录页面的FPS。

![img](https://blog-10039692.file.myqcloud.com/1495008704659_8380_1495008704904.png)

从结果中可见，当需要执行大量绘制任务时，WebGL的性能远远超越了Canvas 2D Api，达到了后者的3~5倍。

即然WebGL性能这么高，为什么没有看到在日常开发中有大规模的应用呢（好吧，可能是我写的代码太少了）。 我想至少有以下两个原因。第一，由于WebGL是直接调用底层的OpenGL，这使得WebGL的接口十分晦涩，对于一般的Web开发人员来说，门槛比较高。第二，WebGL的兼容性并不好，从caniuse上，我们可以看到：

![img](https://blog-10039692.file.myqcloud.com/1495008741047_1242_1495008741223.png)

只有edge和chrome对WebGL有比较好的支持，safari则要到8.0后的版本才支持，firefox则只是部分支持。因此，一般的情况，我们都会对浏览器做feature detection，如果浏览器不支持WebGL，就需要有一个Canvas 2D Api的降级方案，而Threejs就是这么处理的，在Threejs里，除了有一个WebGLRenderer，还有一个CanvasRenderer，以备不时之需。

接下来，我们就通过代码，直接感受一下WebGL的高冷。为了能让大家有一个直观的感受，我同时使用Canvas 2D Api和WebGL，在canvas上绘制一个红色的矩形：

```javascript
var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

context.clearRect(0, 0, canvas.width, canvas.height);

context.fillStyle = '#ff0000';
context.fillRect(100, 100, 100, 100);
```

上面这段代码，我们应该比较熟悉，Canvas 2D Api给我们提供了非常直观的接口，直接就可以在canvas中绘制。显示的效果如下：

![img](https://blog-10039692.file.myqcloud.com/1495008777166_169_1495008777322.png)

接下来我们再来看看WebGL的版本：

```javascript
<div class="km_insert_code">

    var canvas = document.getElementById('canvas');
    var gl = canvas.getContext('experimental-webgl');

    var VSHADER_SOURCE = `
        attribute vec4 a_Position;

        void main() {
            gl_Position = a_Position;
        }
    `;

    var FSHADER_SOURCE = `
        precision mediump float;

        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `;

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);

    gl.shaderSource(vertexShader, VSHADER_SOURCE);
    gl.compileShader(vertexShader);

    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(fragmentShader, FSHADER_SOURCE);
    gl.compileShader(fragmentShader);

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    gl.useProgram(program);

    var vertices = new Float32Array([
        -0.3,  0.3,  0.0,
         0.3,  0.3,  0.0,
        -0.3, -0.3,  0.0,
         0.3, -0.3,  0.0
    ]);

    var buffer = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(program, 'a_Position');

    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

</div>
```

就是这么酸爽(┬＿┬)。即使是绘制一个矩形这么简单的任务，WebGL都不能让你省心，就更别说要在WebGL里绘制3D图像了。但希望各位小伙伴不要被上面这堆东西吓唬到。让我来带这大家一步一步的解读上面的代码。

要解读上面这段代码，我们首先要重新包装一下，把那些细枝末节先隐藏起来，毕竟裸露不一定就代表性感。通过函数的抽象，上面的代码可以写成下面的样子：

```javascript
<div class="km_insert_code">

    var canvas = document.getElementById('canvas');

    // 获取WebGL上下文
    var gl = getWebGLContext(canvas);

    // 编译着色器代码
    initShader(gl, VSHADER_SOURCE, FSHADER_SOURCE);

    // 往顶点数据缓存冲写入数据
    initVertexBuffer(gl, vertices);

    // 使着色器代码中的a_Position变量，指向顶点数据缓冲区
    setAttributeFromBuffer(gl, 'a_Position', 3, 0, 0);

    // 清除颜色缓冲区中数据
    clear(gl, 1.0, 1.0, 1.0, 1.0);

    // 根据着色器代码,绘制图像
    draw(gl, 4);

</div>
```

是不是觉得没那么心塞？简化了代码后，我们就一步一步来解读。首先明确一点，WebGL也是基于canvas标签的，只是获取的上下文不一样而已，在WebGL中我们获取的上下文对象是**webgl**，但由于大部分浏览器并没有全面支持WebGL，而是通过**experimental-webgl**这样一个带前缀的上下文来提供实验性质的WebGL功能。

有了WebGL的上下文，我们就可以开始调用WebGL为我们提供的接口。不过WebGL和Canvas 2D Api不同，并没有直接可以绘制图像的接口，而是需要我们一笔一划的告诉它如何绘制图像。因此，你首先得教会WebGL要如何绘制，而WebGL中表示如何绘制的方式称为着色器。

着色器并不是直接由js来编写，而是用一种叫做**GLSL ES**的语言来编写。该语言与c语言很接近，但内置了一些方便计算机绘图的工具方法，具体可看[www.opengl.org/documentati…](https://link.juejin.im/?target=https%3A%2F%2Fwww.opengl.org%2Fdocumentation%2Fglsl%2F)这个地址，这里我就不详细说明了。

```javascript
<div class="km_insert_code">

    // 顶点着色器
    var VSHADER_SOURCE = `
        attribute vec4 a_Position;
        void main() {
            gl_Position = a_Position;
        }
    `;

    // 片元着色器
    var FSHADER_SOURCE = `
        precision mediump float;
        void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `;

</div>
```

在WebGL中着色器分为两种，一种叫**顶点着色器**（vertex shader），WebGL会根据你提供的图形顶点数据，逐个顶点的执行顶点着色器来组装图形。另外一种叫做**片元着色器**（fragment shader），WebGL利用顶点着色器组装好图形后，就会进行图像栅格化，图像栅格化后，你就得到了对应的片元，你可以想象成屏幕上的像素，然后WebGL就会逐个片元的执行片元着色器来给图像上颜色，最终把绘制好的图像传给颜色缓冲区显示在屏幕上：

![img](https://blog-10039692.file.myqcloud.com/1495008849533_44_1495008849777.png)

通过**initShader**方法，我们已经教会了WebGL如何绘制图像。接下来，我们就要给告诉WebGL，你要绘制的是什么，也只是说，用于控制图形的顶点数据。然而要和WebGL的着色器沟通，我们并不能直接向着色器传入数据（其实也是可以的，不过比较低效），我们需要先在内存里开辟一块缓冲区，然后通过WebGL提供的接口，把数据写入缓冲区，这就是**initVertexBuffer**方法的功能。

![img](https://blog-10039692.file.myqcloud.com/1495008908829_3934_1495008908996.png)

内存中有了数据后，我们就可以通过调用**setAttributeFromBuffer**方法把着色器里的变量指向该块内存，这样当WebGL逐个顶点的执行顶点着色器时，就可以从对应的内存分块中读取到顶点数据。

一切准备就绪，我们终于可以开始绘制图像了，在绘制之前先调用**clear**方法，清除颜色缓冲区中的数据（类似Canvas 2D Api中的clearRect）最后调用**draw**方法，真正绘制出图像。终于松一口气。

通过上面的这个例子，我们明白了，要在WebGL中绘制图像，首先得教会WebGL如何绘制（编写着色器），然后告诉WebGL要绘制什么（创建缓存区，写入顶点数据，并关联到着色器变量上），最后清理一下之前绘制的东西，把准备好的图像绘制到屏幕上。

最后，我把上面用到的每一个方法补上：

```javascript
<div class="km_insert_code">

    function getWebGLContext(canvas) {
        return canvas.getContext('experimental-webgl');
    }

    function initShader(gl, vertexShaderSource, fragmentShaderSource) {
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);

        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.compileShader(vertexShader);

        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        gl.shaderSource(fragmentShader, fragmentShaderSource);
        gl.compileShader(fragmentShader);

        var program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        gl.useProgram(program);

        gl.program = program;
    }

    function initVertexBuffer(gl, vertices) {
        var buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    }

    function setAttributeFromBuffer(gl, name, size, stride, offset) {
        var attribute = gl.getAttribLocation(gl.program, name);

        gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, stride, offset);
        gl.enableVertexAttribArray(attribute);
    }

    function clear(gl, r, g, b, a) {
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    function draw(gl, size) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, size);
    }

</div>
```

这就是我今天要给大家介绍的WebGL基础，以上！



### 来源

[高冷的 WebGL](https://juejin.im/entry/591d0b4d128fe1005cf6d90b)