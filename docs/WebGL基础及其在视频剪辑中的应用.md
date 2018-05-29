## WebGL基础及其在视频剪辑中的应用

### 一、WebGL的起源

个人计算机上使用最广泛的两种三维图形渲染技术：

**Direct3D**： 是微软DirectX技术的一部分，主要用于Windows平台。

**OpenGL**： 开源免费，在多种平台上广泛使用（计算机、智能手机、平板电脑、家用游戏机等）。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/61301883.jpg)



**OpenGL ES**: 在添加新特性的同时从OpenGL中移除了许多陈旧无用的旧特性，使它在保持轻量级的同时，仍具有足够的能力来渲染出精美的三维图形。

从2.0版本开始，OpenGL支持了一项非常重要的特性，**可编程着色器语言**。允许应用程序编程人员编写他们自己的着色器程序并且充分利用GPU的巨大能力。特别地，借助于更好的GPU和更多的存储区来储存或保留几何信息，延迟绘制模式（retained mode graphics）变得越来越重要。



### 二、计算机图形学基础

#### 2.1 图形系统

1. 输入设备
2. 中央处理单元（CPU）
3. 图形处理单元（GPU）
4. 存储器
5. **帧缓存**
6. 输出设备

这个模型足够通用，可以包括工作站、个人计算机、交互式游戏系统、移动电话、GPS系统和复杂的图像生成系统。

![](http://p1yseh5av.bkt.clouddn.com/18-2-9/46144417.jpg)

**像素和帧缓存**

现代图形系统都是基于光栅的，在输出设备上看到的图像都是图形元素组成的的阵列。

像素（pixel=picture element）：图像的基本单元 

光栅（raster）：像素的阵列

帧缓冲区（frame buffer）：图形系统的核心部件，存储屏幕上像素的颜色信息 

分辨率（resolution）：帧缓冲区中像素的个数

深度（depth）或精度（precision）：每个像素的位数 

​	– 全彩（真彩）色：24位， 2^24 种颜色。也称为 RGB-颜色，每个像素被赋予红、绿、蓝三基色颜色组（各8位）

![](http://p1yseh5av.bkt.clouddn.com/18-5-28/84545.jpg)

#### 2.2 应用程序编程接口

- 笔式绘图仪模型

![](http://p1yseh5av.bkt.clouddn.com/18-5-28/74639040.jpg)

- 三维API——照相机模式

  - 对象
  - 观察者
  - 光源
  - 材质属性

  

- 图形绘制流水线

  ![](http://p1yseh5av.bkt.clouddn.com/18-5-28/94206024.jpg)

  顶点 ➡ 顶点处理模块  ➡ 裁剪模块和图元组装模块 ➡光栅化模块 ➡ 片元处理模块 ➡ 像素 



### 三、Canvas绘图

在HTML5出现之前，如果你想在网页上显示图像，只能使用HTML提供的原生方案<img>标签，<canvas>出现后，允许JavaScript动态地绘制图形。

**WebGL**（全写Web Graphics Library）是一种3D绘图标准，这种绘图技术标准允许把JavaScript和OpenGL ES 2.0结合在一起，通过增加OpenGL ES 2.0的一个JavaScript绑定，WebGL可以为HTML5 Canvas提供硬件3D加速渲染，这样Web开发人员就可以借助系统显卡来在浏览器里更流畅地展示3D场景和模型了，还能创建复杂的导航和数据视觉化。

#### 2D VS 3D

在画布上画三角形：

Canvas 2D:

```Javascript
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.moveTo(10,10);
ctx.lineTo(30,40);
ctx.lineTo(50,10);
ctx.lineTo(10,10);
ctx.fillStyle = '#f00';
ctx.fill();
// ctx.stroke();
```

WebGL：

```javascript
var canvas = document.getElementById('canvas');
// 获取WebGL上下文
var gl = canvas.getContext('experimental-webgl');

// 编译着色器代码
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

// 往顶点数据缓存冲写入数据
var vertices = new Float32Array([
    -0.1,  0.1,  0.0,
    0.4,  0.1,  0.0,
    0.1, -0.3,  0.0,
]);

var buffer = gl.createBuffer();

gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
// 使着色器代码中的a_Position变量，指向顶点数据缓冲区
var a_Position = gl.getAttribLocation(program, 'a_Position');

gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(a_Position);

// 清除颜色缓冲区中数据
gl.clearColor(1.0, 1.0, 1.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);

// 根据着色器代码,绘制图像
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);

```

WebGL绘制流程图：

![img](https://blog-10039692.file.myqcloud.com/1495008849533_44_1495008849777.png)

WebGL可以绘制的基本图形：

| 基本图形 | 参数mode          | 描述                                                         |
| -------- | ----------------- | ------------------------------------------------------------ |
| 点       | gl.POINTS         | 一系列点 v0、v1、v2···                                       |
| 线段     | gl.LINES          | 一系列单独的线段 (v0,v1),(v2,v3)··· 点数为奇数时忽略最后一个点 |
| 线条     | gl.LINE_STRIP     | 一系列连续的线段(v0,v1),(v1,v2)···                           |
| 回路     | gl.LINE_LOOP      | 一系列连续的线段 增加了(vN,v0)                               |
| 三角形   | gl.TRIANGLES      | 一系列单独的三角形(v0,v1,v2),(v3,v4,v5)···                   |
| 三角带   | gl.TRIANGLE_STRIP | 一系列带状三角形(v0,v1,v2),(v1,v2,v3)···                     |
| 三角扇   | gl.TRIANGLE_STRIP | 一系列三角形组成的类似于扇形的图形(v0,v1,v2),(v0,v2,v3)···   |

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/68351878.jpg)

WebGL只能绘制三种图形：点、线段和三角形。但是，正如本章开头所说到的，从球体到立方体，再到游戏中的三维角色，都可以用小的三角形组成。实际上，你可以使用以上这些最基本的图形来绘制出任何东西。

#### 其他差异

- 坐标系统表示不同

  Canvas2D

  ![](http://p1yseh5av.bkt.clouddn.com/18-1-24/45398491.jpg)

  WebGL

  ![](http://p1yseh5av.bkt.clouddn.com/18-1-23/70762851.jpg)

  ![](http://p1yseh5av.bkt.clouddn.com/18-1-23/42438698.jpg)

- 性能差异

  https://juejin.im/entry/591d0b4d128fe1005cf6d90b

  ![img](https://blog-10039692.file.myqcloud.com/1495008704659_8380_1495008704904.png)

  从结果中可见，当需要执行大量绘制任务时，WebGL的性能远远超越了Canvas 2D Api，达到了后者的3~5倍。

  [移动端 webgl 对比 canvas 性能](https://blog.csdn.net/jiexiaopei_2004/article/details/48437309)

- 浏览器兼容性

  Canvas 2D API

  ![](http://p1yseh5av.bkt.clouddn.com/18-5-29/52451443.jpg)

  WebGL

  ![](http://p1yseh5av.bkt.clouddn.com/18-5-29/18792897.jpg)

  ![](http://p1yseh5av.bkt.clouddn.com/18-5-29/10171726.jpg)

### 四、WebGL过渡效果

- 矩形绘图区域

- 纹理映射 ->demo

  ![](http://p1yseh5av.bkt.clouddn.com/18-1-24/17006526.jpg)

  ![](http://p1yseh5av.bkt.clouddn.com/18-1-24/78799085.jpg)

- 逐片元处理 -> demo

  

叠化shader解析

```javascript
var VSHADER_SOURCE = `
attribute vec2 a_Position;
varying vec2 uv;

void main(){
gl_Position = vec4(a_Position,0.0,1.0);
//计算获取纹理坐标
uv = vec2(0.5, 0.5) * (a_Position + vec2(1.0, 1.0));
}
`;
var FSHADER_SOURCE = `
precision mediump float;
precision highp float;
varying vec2 uv;

uniform float progress, ratio;

uniform sampler2D u_Sampler0, u_Sampler1;
vec4 getFromColor(vec2 uv){
return texture2D(u_Sampler0, uv);
}
vec4 getToColor(vec2 uv){
return texture2D(u_Sampler1, uv);
}
//逐片元进行叠化
vec4 transition (vec2 uv) {
  return mix(
    getFromColor(uv),
    getToColor(uv),
    progress
  );
}
void main(){
gl_FragColor=transition(uv);
}
`;
```



### 参考

1. [高冷的 WebGL](https://juejin.im/entry/591d0b4d128fe1005cf6d90b)
2. 《WebGL编程指南》
3. 《交互式计算机图形学》第七版
4. [GL-Transitions](https://gl-transitions.com/)