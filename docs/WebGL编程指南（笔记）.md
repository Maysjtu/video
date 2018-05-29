## WebGL编程指南（笔记）

### 一、WebGL起源

​	![](http://p1yseh5av.bkt.clouddn.com/18-1-23/61301883.jpg)

从2.0版本开始，OpenGL支持了一项非常重要的特性，可编程着色器语言。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/49645694.jpg)

WebGL程序使用三种语言开发：HTML，JavaScript，GLSL ES

### 二、WebGL入门

```javascript
gl.clearColor(r,g,b,a); //设置背景色
```

一旦指定了背景色后，背景色就会贮存在WebGL系统中，在下一次调用gl.clearColor()方法前不会改变。

```javascript
gl.clear(gl.COLOR_BUFFER_BIT); //用之前指定的背景色清空绘图区域
```

gl.clear()方法实际上继承自OpenGL，它基于多基本缓冲区模型，这可比二位绘图上下文复杂得多。清空绘图区域，实际上是在清空颜色缓冲区（color buffer），传递参数gl.COLOR_BUFFER_BIT就是在告诉WebGL清空颜色缓冲区。除了颜色缓冲区，WebGL还会使用其他种类的缓冲区，比如深度缓冲区和模版缓冲区。

>**颜色缓冲区**：就是帧缓冲区（图形设备的内存），需要渲染的场景的每一个像素都最终写入该缓冲区，然后由他渲染到屏幕上显示。
>
>**深度缓冲区**：与帧缓冲区对应，用于记录上面每个像素的深度值，通过深度缓冲区，我们可以进行深度测试，从而确定像素的遮挡关系，保证渲染正确。（注意区分深度测试和背面剔除）
>
>**模板缓冲区**：与深度缓冲区类似，通过设置模板缓冲每个像素的值，我们可以在渲染的时候只渲染后写像素，从而可以达到一些特殊的效果。
>
>​    模板缓冲区可以为屏幕上的每个像素点保存一个无符号的整数值，在渲染过程中，可以用这个值与一个预先设定的参考值相比较，根据比较的结果来决定是否更新相应的像素点的颜色值。
>
>​    **模板测试发生在透明度测试之后，深度测试之前**，如果模板测试通过，则相应的像素点更新，否则不更新。
>
>**累积缓冲区**：允许在渲染到颜色缓冲区之后，不是把结果显示到窗口上，而是把内容复制到累积缓冲区，这样就可以把颜色缓冲区与累积缓冲区中的内容反复进行混合，可以用来进行模糊处理和抗锯齿。

| 缓冲区名称 | 默认值                 | 相关函数                   |
| ----- | ------------------- | ---------------------- |
| 颜色缓冲区 | （0.0,0.0, 0.0, 0.0） | gl.clearColor(r,g,b,a) |
| 深度缓冲区 | 1.0                 | gl.clearDepth(depth)   |
| 模版缓冲区 | 0                   | gl.clearStencil(s)     |

WebGL依赖于着色器的绘图机制。着色器提供了灵活且强大的绘制二维或三维图形的方法，所有WebGL程序必须使用它。

#### HelloPoint

```javascript
var VSHADER_SOURCE = `
  void main() {
      gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
      gl_PointSize = 10.0;
  }
`;
var FSHADER_SOURCE = `
void mian() {
	gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}
`
```

顶点着色器：描述顶点特性（位置，颜色等）

片元着色器：进行逐片元处理过程（光照）的程序。可以理解为像素（图像的单元）。

WebGL程序包括运行在浏览器中的JavaScript和运行在WebGL系统的着色器程序这两个部分。

顶点着色器内置变量

| 类型和变量名             | 描述          |
| ------------------ | ----------- |
| vec4 gl_Position   | 表示顶点位置      |
| float gl_PointSize | 表示点的尺寸（像素数） |

⚠️：gl_Position变量必须被赋值，否则着色器就无法正常工作。相反，gl_PointSize并不是必须的。

**由4个分量组成的矢量被称为齐次坐标**，因为它能够提高处理三维数据的效率，所以在三维系统中被大量使用。

虽然齐次坐标是四维的，但是如果其最后一个分量是1.0，那么这个齐次坐标就可以表示”前三个分量为坐标值“那个点。所以，当你需要使用齐次坐标表示顶点坐标的时候，只要将最后一个分量赋值为1.0就可以了。

```
齐次坐标
齐次坐标使用如下符号描述:(x,y,z,w)。齐次坐标(x,y,z,w)等价于三维坐标(x/w,y/w,z/w)。所以如果齐次坐标的第4个分量是1，你就可以将它当做三维坐标来使用。w的值必须是大于等于0的。如果w趋近于0，那么它所表示的点将趋近于无穷远，所以在齐次坐标系中可以有无穷的概念。齐次坐标的存在，使得用矩阵乘法来描述顶点变换成为可能，三维系统在计算过程中，通常使用齐次坐标来表示顶点的三维坐标。
```

片元着色器的内置变量

| 类型和变量名            | 描述     |
| ----------------- | ------ |
| Vec4 gl_FragColor | 指定片元颜色 |

```
gl.drawArrays(mode,first,count);
执行顶点着色器，按照mode参数指定的方式绘制图形。
mode: gl.POINTS,gl.LINES,gl.LINE_STRIP,gl.LINE_LOOP,gl.TRIANGLES,gl.TRIANGLE_STRIP,gl.TRIANGLE_FAN
first: 从那个顶点开始绘制
count: 绘制需要用到多少个顶点
```

现在当程序调用gl.drawArrays()时，顶点着色器将被执行count次，每次处理一个顶点。

在着色器执行时，将调用并逐行执行内部的main()函数。

一旦顶点着色器执行完后，片元着色器就会开始执行，调用main函数···

#### WebGL坐标系统

右手坐标系。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/70762851.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/42438698.jpg)

#### HelloPoint1

讨论如何在JavaScript和着色器之间传输数据。

有两种方式传递数据：attribute变量和uniform变量

**attribute**变量传递的是那些与**顶点相关**的数据，而**uniform**变量传输的是那些对于所有顶点都相同的数据（**顶点无关**）。

```javascript
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = 10.0;
    }
`;
//获取attribute变量的存储位置
var a_Position = gl.getAttribLocation(gl.program, 'a_Position'); 
gl.vertexAttrib3f(a_Position, 0.0, 0.0, 0.0);
```

Attribute 存储限定符

```javascript
gl.getAttribLocation(program, name);//获取name指定的参数地址
```

```javascript
gl.vertexAttrib3f(location,v0,v1,v2);//将数据(v0,v1,v1)传给attribute变量
```

实际上，如果你省略了第四个参数，这个方法就会默认地将第4个分量设置为了1.0

同族函数：

gl.vertexAttrib1f(location,v0);

gl.vertexAttrib2f(location,v0,v1);

gl.vertexAttrib3f(location,v0,v1,v2);

gl.vertexAttrib4f(location,v0,v1,v2,v3);

也可以使用这些方法的矢量版本，它们的名字以v结尾。

```javascript
var position = new Float32Array([1.0,2.0,3.0,1.0]);
gl.vertexAttrib4fv(a_Position, position);
```

#### 通过鼠标绘制点 ClickPoint

```javascript
canvas.onmousedown = function(ev) {
  click(ev, gl, canvas, a_Position);
}
var g_points = [];
function click(ev, gl, canvas, a_Position) {
  var x = ev.clientX;
  var y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();
  //将canvas坐标转到webgl坐标下
  x = ((x-rect.left)-canvas.height/2)/(canvas.height/2);
  y = (canvas.width/2 - (y-rect.top))/(canvas.width/2);
  g_points.push(x);
  g_points.push(y);
  
  gl.clear(gl.COLOR_BUFFER_BIT); //清空背景色
  
  var len = g_points.length;
  for(var i=0; i< len; i+=2){
    gl.vertexAttrib3f(a_Position, g_points[i], g_points[i+1], 0.0);
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}
```

WebGL系统中的绘制操作实际上是在颜色缓冲区中进行绘制的，绘制结束后系统将缓冲区中的内容显示在屏幕上，然后颜色缓冲区就会被重置，其中的内容会丢失。

在绘制点之后，颜色缓冲区就会被WebGL重置为了默认的颜色（0.0,0.0,0.0,0.0），默认背景是透明色。

#### ColoredPoints

```javascript
var FSHADER_SOURCE = `
	precision mediump float;
	uniform vec4 u_FragColor;
    void main(){
		gl_FragColor = u_FragColor;
    }
`;
var u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
gl.uniform4f(u_FragColor, r, g,b,a);
```

#### 总结

顶点着色器进行的是逐顶点的操作，片元着色器进行的是逐片元的操作。



### 三、 绘制和变换三角形

​	这一节的主要内容是绘制多个点组成的图形。

#### MultiPoint

对于那些由多个顶点组成的图形，比如三角形、矩形和立方体来说，需要一次性将图形的顶点传入顶点着色器，然后才能把图形画出来。

WebGL提供了一种很方便的机制，即缓冲区对象（buffer object），它可以一次性地向着色器传入多个顶点的数据。缓冲区对象是WebGL系统中的一块内存区域，我们可以一次性地向缓冲区对象中填充大量的顶点数据，然后将这些数据保存在其中，供顶点着色器使用。

```javascript
function initVertexBuffers(gl){
  var vertices = new Float32Array([
    0.0,0.5,-0.5,-0.5,0.5,-0.5
  ]);
  var n = 3;
  var vertexBuffer = gl.createBuffer();
  //将缓冲区绑定到对象
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  //向缓冲区对象中写入数据
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  //将缓冲区对象分配给a_Position
  gl.vertexAtttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  //连接a_Position变量与分配给它的缓冲区对象
  gl.enableVertexAttribArray(a_Position);
  
  return n;
}
gl.drawArrays(gl.POINTS, 0, n);
```



####  使用缓冲区对象

缓冲区对象是WebGL系统中的一块存储区，你可以在缓冲区对象中保存想要绘制的所有顶点的数据。

可以一次性地向顶点着色器中传入多个顶点的attribute变量的数据。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/96103465.jpg)

使用缓冲区对象需遵循五个步骤，处理其他对象，如纹理对象、帧缓冲区对象（光照）时的步骤也比较类似。

五个步骤：

1. 创建缓冲区对象(gl.createBuffer()).
2. 绑定缓冲区对象(gl.bindBuffer()).
3. 将数据写入缓冲区对象(gl.bufferData()).
4. 将缓冲区对象分配给一个attribute变量(gl.vertexAttribPointer).
5. 开启attribute变量(gl.enableVertexAttribArray()).

```javascript
gl.createBuffer(); //创建缓冲区对象
gl.deleteBuffer(buffer); //删除缓冲区对象 
```

创建缓冲区之后，要将缓冲区对象绑定到WebGL系统中已经存在的“目标”上，这个“目标”表示缓冲区对象的用途。

```javascript
gl.bindBuffer(target, buffer)
允许使用buffer表示的缓冲区对象并将器绑定到target表示的目标上。
target:	gl.ARRAY_BUFFER 表示缓冲区对象中包含了顶点数据
		gl.ELEMENT_ARRAY_BUFFER 表示缓冲区对象中包含了顶点的索引值
```

 ```javascript
gl.bufferData(target, data, usage)
开辟存储空间，向绑定在target上的的缓冲区对象中写入数据data
target: gl.ARRAY_BUFFER或者gl.ELEMENT_ARRAY_BUFFER
data: 写入缓冲区对象的数据（类型化数组）
usage: 表示程序将如何使用存储在缓冲区对象中的数据。该参数将帮助WEBGL优化操作。
	  gl.STATIC_DRAW 只会向缓冲区对象中写入一次数据，但需要绘制很多次
      gl.STREAM_DRAW 只会向缓冲区对象中写入一次数据，然后绘制若干次
      gl.DYNAMIC_DRAW 只向缓冲区对象中多次写入数据，并绘制很多次
 ```

```javascript
gl.vertexAttribPointer(location, size, type, normalized, stride, offset)
location:
size: 指定缓冲区中每个顶点的分量个数。若size比attribute变量需要的分量数小，缺失分量将自动补全（0,0,0,1）
type: gl.UNSIGNED_BYTE,gl.SHORT,gl.UNSIGNED_SHORT,gl.INT,gl.UNSIGNED_INT,gl.FLOAT
normalize: 传入true或false，表明是否将非浮点型的数据归一化到[0,1]或[-1,1]区间
stride: 指定相邻两个顶点间的字节数，默认为0
offset: 指定缓冲区对象中的偏移量，以字节为单位，即attribute变量从缓冲区中的何处开始存储。
```

```javascript
gl.enableVertexAttribArray(location)
```

此时不能再使用gl.vertexAttrib[1234]f()向它传数据了。

gl.drawArrays(gl.POINTS, 0, n);

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/94668370.jpg)

#### Hello Triangle

相比MultiPoint.js的关键改动,2点：

- gl_PointSize = 10.0 删去了。该语句只有绘制单个点的时候才起作用。
- gl.drawArrays(gl.TRIANGLES, 0, n)

WebGL可以绘制的基本图形：

| 基本图形 | 参数mode            | 描述                                       |
| ---- | ----------------- | ---------------------------------------- |
| 点    | gl.POINTS         | 一系列点 v0、v1、v2···                         |
| 线段   | gl.LINES          | 一系列单独的线段 (v0,v1),(v2,v3)··· 点数为奇数时忽略最后一个点 |
| 线条   | gl.LINE_STRIP     | 一系列连续的线段(v0,v1),(v1,v2)···               |
| 回路   | gl.LINE_LOOP      | 一系列连续的线段 增加了(vN,v0)                      |
| 三角形  | gl.TRIANGLES      | 一系列单独的三角形(v0,v1,v2),(v3,v4,v5)···        |
| 三角带  | gl.TRIANGLE_STRIP | 一系列带状三角形(v0,v1,v2),(v1,v2,v3)···         |
| 三角扇  | gl.TRIANGLE_STRIP | 一系列三角形组成的类似于扇形的图形(v0,v1,v2),(v0,v2,v3)··· |

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/68351878.jpg)

WebGL只能绘制三种图形：点、线段和三角形。但是，正如本章开头所说到的，从球体到立方体，再到游戏中的三维角色，都可以用小的三角形组成。实际上，你可以使用以上这些最基本的图形来绘制出任何东西。

#### Hello Rectangle

···

#### 移动、旋转和缩放

平移、旋转和缩放三角形。这样的操作成为变换或仿射变换。

**平移：**

​	x1 = x + Tx;

​	y1 = y + Ty;

​	z1 = z + Tz;

这是一个**逐顶点操作**而非逐片元操作，上述修改应该发生在顶点着色器，而不是片元着色器中。

```javascript
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	uniform vec4 u_Translation;
	void main() {
		gl_Position = a_Position + u_Translation;
	}
`;
gl.uniform4f(u_Translation, Tx, Ty, Tz, 0.0);
```

gl_Position是一个齐次坐标，具有4个分量，如果w分量为1，那么它的前三个分量就可以表示一个点的三维坐标。

平移后w1+w2必须是1.0，所以w2只能为0。

**旋转：**

旋转比平移稍微复杂一些，因为描述一个旋转本身就比描述一个平移复杂。

- 旋转轴（图形将围绕旋转轴旋转）
- 旋转方向 （方向：顺时针或逆时针）
- 旋转角度 （图形旋转经过的角度）

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/64094328.jpg)



正旋转又可以称为右手法则旋转。

如果旋转的角度为正值，那就是逆时针旋转。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/32987521.jpg)

x = rcos∂

y = rsin∂

x1 = rcos(∂+ß).  =>              x1 = xcosß - ysinß

X2 = rsin(∂+ß)		      x2 = xsinß+ycosß

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/32454559.jpg)

#### RotatedTriangle

```javascript
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	uniform float u_CosB, u_sinB;
	void main() {
		gl_Position.x = a_Position.x*u_CosB - a_Position.y*u_SinB;
		gl_Position.y = a_Position.x*u_SinB + a_Position.y*u_CosB;
		gl_Position.z = a_Position.z;
		gl_Position.w = 1.0;
	}
`;
var radian = Math.PI*ANGLE/180.0;
```

如果指定了一个负的ANGLE值，三角形就会顺时针旋转。

#### 变换矩阵：旋转

变换矩阵非常适合操作计算机图形。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/99034496.jpg)

=>

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/78414973.jpg)

理解矩阵是如何代替数学表达式的：

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/70515410.jpg)

这个矩阵就被称为变换矩阵。上面这个变换矩阵进行的变换是一次旋转，所以这个矩阵又可以被称为旋转矩阵（rotation matrix）。

#### 变换矩阵：平移

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/66996435.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/26367359.jpg)

#### 4*4的旋转矩阵

在“先旋转再平移”的情形下，我们需要将两个矩阵组合起来。

需要使用某种手段，使旋转矩阵和平移矩阵的阶数一致。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/88356067.jpg)

#### RotatedTriangle_Matrix

```javascript
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	uniform mat4 u_xformMatrix;
	void main(){
		gl_Position = u_xformMatrix*a_Position;
	}
`;
var ANGEL = 90.0;
var radian = Math.PI*ANGLE/180.0;
var cosB = Math.cos(radian),sinB = Math.sin(radian);
var xformMatrix = new Float32Array([
  cosB, sinB, 0.0, 0.0,
  -sinB, cosB, 0.0, 0.0,
  0.0, 0.0, 1.0, 0.0,
  0.0, 0.0, 0.0, 1.0
]);
var u_xformMatrix = gl.getUniformLocation(gl.program, 'u_xformMatrix');
gl.uniformMatrix4fv(u_xformMatrix, false, xformMatrix);
```

矩阵是二维的，其元素按照行和列进行排列，而数组是一维的，其元素只是排成一行。我们可以按照两种方式在数组中存储矩阵元素：按行主序和按列主序。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/97968203.jpg)

WebGL和OpenGL一样，矩阵元素是按列主序存储在数组中的。

```javascript
gl.uniformMatrix4fv(location,transpose,array);
location: uniform变量的存储位置
Transpose: 在WebGL中必须指定为false//表示是否专注矩阵。WebGL实现没有提供矩阵转置的方法
array: 待传输的类型化数组，4*4矩阵按列主序存储在其中
```

#### 变换矩阵：缩放

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/41865361.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/12172386.jpg)

注意：如果将Sx、Sy或Sz指定为0，缩放因子就是0.0，图片就会缩小到不可见。如果希望保持图形的尺寸不变，应该将缩放因子全部设为1.0。

#### 总结

- 将多个顶点的信息一次性传入顶点着色器。
- 利用顶点坐标按照不同的规则绘制图形，以及进行图形的变换。



### 四、高级变换与动画基础

- 使用一个矩阵变换库
- 使用它对图形进行复合变换
- 在该矩阵库的帮助下，实现简单的动画效果

#### 平移，然后旋转

在编写WebGL程序的时候，手动计算每个矩阵很耗费时间。

目前已经有一些开源的矩阵库。

```javascript
var xformMatrix = new Matrix4();
xformMaxtrix.setRotate(ANGLE, 0, 0, 1);
```

#### 复合变换

满足结合律，不满足交换律。

平移后坐标 = 平移矩阵*原始坐标

平移旋转后坐标 = 旋转矩阵\*（平移矩阵\*原始坐标） = （旋转矩阵*平移矩阵）\*原始坐标

一个模型可能经过了多次变换，将这些变换全部复合成一个等效的变换，就得到了**模型变换**（model transformation），或称**建模变换**（modeling transformation），相应地，模型变换的矩阵称为**模型矩阵**。

#### 动画

为了让一个三角形转动起来，你需要做的是：不断擦除和重绘三角形，并且在每次重绘时轻微地改变其角度。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/68076034.jpg)

为了生成动画，我们需要两个关键机制：

**机制一**：在t0、t1、t2、t3等时刻反复调用同一个函数来绘制三角形。

**机制二**：在每次绘制之前，清除上次绘制的内容，并使三角形旋转相应的角度。

#### RotatingTriangle

```javascript
var tick = function() {
  currentAngle = animate(currentAngle);
  draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix);
  requestAnimationFrame(tick);
}
tick();
var g_last = Date.now();
function animate(angle) {
  var now = Date.now();
  var elapsed = now - g_last;
  g_last = now;
  var newAngle = angle + (ANGLE_STEP*elapsed)/1000.0;
  return newAngle%360;
}
function draw(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
  modelMatrix.setRotate(currentAngle, 0, 0, 1);
  gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, n);
}
```

#### 请求再次被调用（requestAnimationFrame()）

现代的浏览器都支持多个标签页，每个标签页具有单独的JS运行环境，但是自setInterval()函数诞生之初，浏览器还没有开始支持多标签页。所以在现代的浏览器中，不管标签页是否被激活，其中的setInterval()函数都会反复调用func，如果标签页比较多，就**会增加浏览器的负荷**。所以后来，浏览器又引入了requestAnimation()方法，该方法只有当标签页处于激活状态时才会生效。requestAnimationFrame()是新引入的方法，还没有实现标准化。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/40485254.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/36740935.jpg)

- `callback`

  一个在每次需要重新绘制动画时调用的包含指定函数的参数。这个回调函数有一个传参，[`DOMHighResTimeStamp`](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMHighResTimeStamp)，指示从触发 requestAnimationFrame 回调到现在（重新渲染页面内容之前）的时间（从 [`performance.now()`](https://developer.mozilla.org/zh-CN/docs/Web/API/Performance/now) 取得）。

> 国庆北京高速，最多每`16.7s`通过一辆车，结果，突然插入一批`setTimeout`的军车，强行要`10s`通过。显然，这是超负荷的，要想顺利进行，只能让第三辆车直接消失（正如显示绘制第三帧的丢失）。然，这是不现实的，于是就有了会堵车！
>
>  同样的，显示器`16.7ms`**刷新间隔之前发生了其他绘制请求**(`setTimeout`)，导致所有第三帧丢失，继而导致动画断续显示（堵车的感觉），这就是过度绘制带来的问题。不仅如此，这种计时器频率的降低也会对电池使用寿命造成负面影响，并会降低其他应用的性能。
>
> 这也是为何`setTimeout`的定时器值推荐最小使用`16.7ms`的原因（16.7 = 1000 / 60, 即每秒60帧）。
>
> 而我`requestAnimationFrame`就是为了这个而出现的。我所做的事情很简单，跟着浏览器的绘制走，如果浏览设备绘制间隔是`16.7ms`，那我就这个间隔绘制；如果浏览设备绘制间隔是`10ms`, 我就`10ms`绘制。这样就不会存在**过度绘制**的问题，动画不会掉帧，自然流畅

我们知道requestAnimationFrame()只是请求浏览器在适当的时机调用参数函数，那么浏览器就会根据自身状态决定t0、t1、t2时刻，在不同的浏览器上，或者在同一个浏览器的不同状态下，都有所不同。总而言之，t1-t0很可能不等于t2-t1。

#### 总结

- 复杂变换的矩阵可以通过一系列基本变换的矩阵相乘得到。
- 通过反复变换和重绘图形可以生成动画效果。

### 五、颜色与纹理

- 将顶点的其他数据（颜色，大小等），传入顶点着色器。
- 发生在顶点着色器和片元着色器之间的从图形到片元的转化，又称为**图元光栅化**。
- 将图像（或称纹理）映射到图形或三维对象的表面上。

#### 将非坐标数据传入顶点着色器

#### MultiAttributeSize

```javascript
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute float a_PointSize;
	void main() {
		gl_Position = a_Position;
		gl_PointSize = a_PointSize;
	}
`;
 var vertices = new Float32Array([
    0.0,0.5,-0.5,-0.5,0.5,-0.5
  ]);
  var n = 3;
  var vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  gl.vertexAtttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  
  var sizes = new Float32Array([
  	10.0, 20.0, 30.0
  ]);
  var sizeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
  gl.vertexAtttribPointer(a_PointSize, 1, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_PointSize);
  
```

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/36251079.jpg)

#### gl.vertexAttribPointer()的步进和偏移参数

将顶点的坐标和尺寸数据**交错组织**(interleaving)。

```javascript
var verticesSizes = new Float32Array([
  0.0,0.5,10.0,
  -0.5,-0.5,20.0,
  0.5,-0.5,30.0
]);
```

#### MultiAttributeSize_Interleaved

```javascript
var verticesSizes = new Float32Array([ 
  0.0,0.5,10.0, 
  -0.5,-0.5,20.0, 
  0.5,-0.5,30.0
]);
var vertexBuffer = gl.createBuffer();
var FSIZE = verticesSizes.BYTES_PER_ELEMENT;
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
gl.vertexAtttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE*3, 0);
gl.enableVertexAttribArray(a_Position);

var a_PointSize = gl.getAttribLocation(gl.program, 'a_PointSize');
gl.vertexAtttribPointer(a_PointSize, 1, gl.FLOAT, false, FSIZE*3, FSIZE*2);

```

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/38152369.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/5986508.jpg)

#### 修改颜色（varying变量）

在第2章中ColoredPoints程序使用了一个uniform变量来将颜色信息传入片元着色器。

我们使用一种新的varying变量向片元着色器中传入数据，实际上，v**arying变量的作用是从顶点着色器向片元着色器传输数据**。

#### MultiAttributeColor

```js
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	varying vec4 v_Color;
	void main(){
		gl_Position = a_Position;
		gl_PointSize = 10.0;
		v_Color = a_Color;
	}
`;
var FSHADER_SOURCE = `
	varying vec4 v_Color;
	void main(){
		gl_FragColor = v_Color;
	}
`;
```

在WebGL中，如果顶点着色器与片元着色器中有类型和命名都相同的varying变量，那么顶点着色器赋给该变量的值就会被自动的传入片元着色器。

![](http://p1yseh5av.bkt.clouddn.com/18-1-23/28389769.jpg)

发现程序绘制了一个颜色平滑过渡的、三个角各是红、绿、蓝颜色的三角形。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/82629293.jpg)

实际上，在顶点着色器和片元着色器之间，有这样两个步骤：

- **图形装配过程**：将孤立的顶点坐标装配成几何图形。几何图形图形的类别由gl.drawArrays()的函数的第一个参数决定。
- **光栅化过程**：将装配好的几何图形转化为片元。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/32511488.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/84725436.jpg)

gl_Position实际上是**几何图形装配**阶段的输入数据。注意，几何图形装配过程又被称为**图元装配过程**。因为被装配出的基本图形（点、线、面）又被称为图元。

过程：

1. 执行顶点着色器，第1个坐标传入并存储在装配区。
2. 再次执行顶点着色器，第2个坐标传入并存储在装配区。
3. 第三次执行顶点着色器，第三个坐标传入并存储在装配区。此时，三个顶点坐标都已经处在装配区了。
4. 开始装配图形。根据gl.drawArrays()的第一个参数信息决定如何装配。本例gl.TRIANGLES，装配出一个三角形，
5. 显示在屏幕上的三角形是由片元（像素）组成的，所以还需要将图形转化为片元，这个过程被称为光栅化。此后，我们那就得到了组成这个三角形的所有片元。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/24119003.jpg)

上图为了示意，只显示了10个片元。实际上，片元数目就是这个三角形最终在屏幕上所覆盖的像素数。

如果是gl.LINE，程序就会使用前两个点装配出一条线段，舍弃第3个点。

如果是gl.LINE_LOOP，程序就会将三个点装配成为首尾相接的折线段，并光栅化出一个空心的三角形。

#### 调用片元着色器

一旦光栅化过程结束后，程序就开始逐片元调用片元着色器。上图中，片元着色器被调用了10次，每调用一次，就处理一个片元。对于每个片元，片元着色器计算出该片元的颜色，并写入颜色缓冲区。知道第15步最后一个片元被处理完成，浏览器就会显示出最终的结果。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/25531105.jpg)

#### 用示例程序做实验

实验：尝试根据片元的位置来确定片元颜色。这样可以证明片元着色器对每个片元都执行了一次。光栅化过程生成的片元都是带有坐标信息的，调用片元着色器时这些坐标信息也随着片元传了进去，我们可以通过片元着色器的内置变量来访问片元的坐标。

| 类型和变量名            | 描述                                       |
| ----------------- | ---------------------------------------- |
| vec4 gl_FragCoord | 该内置变量的第一个和第二个分量表示片元在canvas坐标提醒（窗口坐标系统）中的坐标值。 |

```javascript
var FSHADER_SOURCE = `
	precision mediump float;
	uniform float u_Width;
	uniform float u_Height;
	void main(){
		gl_FragColor = vec4(gl_FragCoord.x/u_Width, 0.0, gl_FragCoord.y/u_Height, 1.0);
	}
`;
```

上程序中，三角形中每个片元的颜色，其红色分量和蓝色分量都是根据片元的位置计算得到的。

canvas中Y轴方向和WebGL系统中的Y轴方向是相反的。且WebGL中的颜色分量值区间为0.0-1.0

我们将gl.drawingBufferWidth和gl.drawingBufferHeight(颜色缓冲区的宽高)传给u_Width和u_Height。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/93355867.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/45398491.jpg)

#### varying变量的作用和内插过程

为什么在顶点着色器中只是指定了每个顶点的颜色，最后得到了一个具有渐变效果的三角形？

事实上，我们把顶点的颜色赋值给了顶点着色器中的varying变量v_Color，它的值被传给片元着色器中的同名，同类型变量。但是，更准确的说，顶点着色器中的v_Color变量在传入片元着色器之前经过了内插过程。所以，片元着色器中v_Color变量和顶点着色器中的v_Color变量实际上并不是一回事，这也是我们将这种变量称为“varying”变量的原因。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/34170104.jpg)

更准确的说，我们在varying变量中为三角形的3个不同的顶点指定了3个不同的颜色，而三角形表面上这些片元的颜色值都是WebGL系统用者3个顶点的颜色内插出来的

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/44789957.jpg)

线段上的所有片元的颜色值都会被恰当地计算出来——这个过程就被称为内插过程（interpolation process）。

光栅化是三维图形学的关键技术之一，它负责将矢量的几何图形转变为栅格化的片元（像素）。

图形被转化称为片元之后，我们就可以在片元着色器内做更多的事情，如为每个片元指定不同的颜色。

颜色可以内插出来，也可以直接编程指定。

#### 在矩形表面贴上图像

**纹理映射**。纹理映射其实非常简单，就是将一张图像映射到一个几何图形的表面上去。将一张真实世界的图片贴到一个由两个三角形组成的矩形上，这样矩形表面看上去就是这张图片。此时，这张图片又可以称为纹理图像（texture image）或纹理（texture）。

纹理映射的作用，就是根据纹理图像，为之前光栅化后的每个片元涂上合适的颜色，组成纹理图像的像素又被称为纹素（texels，texture elements），每一个纹素的颜色都使用RGB或RGBA格式编码。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/57326300.jpg)

纹理映射的步骤：

1. 准备好映射到几何图形上的纹理图像。
2. 为几何图形配置纹理映射方式。 //纹理坐标
3. 加载纹理图像，对其进行一些配置，以在WebGL中使用它。
4. 在片元着色器中将相应的纹素从纹理中取出来，并将纹素的颜色赋给片元。

```
注意：当你在Chrome浏览器下，从本地磁盘运行使用纹理图像的示例程序时，你需要开启--allow-file-access-from-files选项，这样做是出于安全考虑，因为在默认状况下，Chrome是不被允许访问本地文件的。
```

=>可以启一个本地server

#### 纹理坐标

纹理坐标是纹理图像上的坐标，通过纹理坐标可以在纹理图像上获取纹素颜色。

WebGL中的纹理坐标是二维的，为了将纹理坐标和广泛使用的x坐标和y坐标区分开来，WebGL使用s和t命名纹理坐标（st坐标系统）。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/17006526.jpg)

**纹理坐标**很通用，因为坐标值**与图像自身的尺寸无关**。

#### 将纹理图像粘贴到几何图形上

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/78799085.jpg)

#### TexturedQuad

纹理映射的过程：

- 首先在顶点着色器中为每个顶点指定纹理坐标
- 然后在片元着色器中根据每个片元的纹理坐标从纹理图像中国抽取纹素颜色

```javascript
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec2 a_TexCoord;
	varying vec2 v_TexCoord;
	void main(){
		gl_Position = a_Position;
		v_TexCoord = a_TexCoord;
	}
`;
var FSHADER_SOURCE = `
	uniform sampler2D u_Sampler;
	varying vec2 v_TexCoord;
	void main(){
		gl_FragColor = texture2D(u_Sampler, v_TexCoord);
	}
`;
function initVertexBuffers(gl){
  var verticesTexCoords = new Float32Array([
    //顶点坐标、纹理坐标
    -0.5,  0.5, 0.0, 1.0,
    -0.5, -0.5, 0.0, 0.0,
     0.5,  0.5, 1.0, 1.0,
     0.5, -0.5, 1.0, 0.0
  ]);
  var n = 4;
  var vertexTexCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);
  var FSIZE = verticesTexCoord.BYTES_PER_ELEMENT;
  var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE*4,FSIZE*2);
  gl.enableVertexAttribArray(a_TexCoord);
  ...
}
function initTextures(gl, n){
	var texture = gl.createTexure();
  	var u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  	var image = new Image();
  	image.onload = function(){
    	loadTexture(gl, n, texture, u_Sampler, image);	
  	}
    image.src = '../assets/sky.jpg'
}  
function loadTexture(gl, n, texture, u_Sampler, image){
  	//对纹理图像进行Y轴反转
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  	//开启0号纹理单元
  	gl.activeTexture(gl.TEXTURE0);
  	//向target绑定纹理对象
  	gl.bindTexture(gl.TEXTURE_2D, texture);
  	//配置纹理参数
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  	//配置纹理图像
  	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  	//将0号纹理传递给着色器 
  	gl.uniform1i(u_Sampler, 0);
  	...
  	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
}

```



 ```js
gl.createTexture()//创建纹理对象以存储纹理图像
 ```

gl.TEXTURE0到gl.TEXTURE7是管理纹理图像的8个纹理单元，每一个都与gl.TEXTURE_2D相关联，而后者就是绑定纹理时的纹理目标。

```js
gl.deleteTexture(texture)//删除纹理对象 
```

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/24304324.jpg)

#### 为WebGL配置纹理

使用纹理对象的方式与使用缓冲区很类似。

```js
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);//对纹理图像进行Y轴反转
```

WebGL纹理坐标系统中的t轴的方向和PNG、BMP、JPG等格式图片的坐标系统的Y轴方向是相反的。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/41324467.jpg)

```js
gl.pixelStorei(pname, param)
使用pname和param指定的方式处理加载得到的图像。
pname:  gl.UNPACK_FLIP_Y_WEBGL              对图像进行Y轴反转
		gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL   将图像RGB颜色值的每一个分量乘A
param:   指定非0（true）或0（false），整数。        
```

#### 激活纹理单元 gl.activeTexture

WebGL通过一种称作纹理单元（texture unit）的机制来同时使用多个纹理。每个纹理单元有一个单元编号来管理一张纹理图像。即使你的程序只需要使用一张纹理图像，也得为其制定一个纹理单元。

WebGL至少支持8个纹理单元，一些其他的系统支持的个数更多。

在使用纹理单元之前，还需要调用gl.activeTexture()来激活它

```js
gl.activeTexture(texUnit);//激活指定的纹理单元
```

#### 绑定纹理对象（gl.bindTexture）

WebGL支持两种类型的纹理

| 纹理类型                | 描述    |
| ------------------- | ----- |
| gl.TEXTURE_2D       | 二维纹理  |
| gl.TEXTURE_CUBE_MAP | 立方体纹理 |

```js
gl.bindTexture(target, texture)
开启texture指定的纹理对象，并将其绑定到target上。此外，如果已经通过gl.activeTexture()激活了某个纹理单元，则纹理对象也会绑定到这个纹理单元上。
target: gl.TEXTURE_2D或gl.TEXTURE_BUVE_MAP
texture: 表示绑定的纹理单元
```

！注意，该方法完成了两个任务：

1. 开启纹理对象
2. 将纹理对象绑定到纹理单元上

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/93874764.jpg)

在WebGL中，你没法直接操作纹理对象，必须通过将纹理对象绑定到纹理单元上，然后通过操作纹理单元来操作纹理对象。

#### 配置纹理对象参数

设置纹理图像映射到图形上的具体方式：如何根据纹理坐标获取纹素颜色、按哪种方式重复填充纹理。

```js
gl.texParameteri(target, pname, param);
target: gl.TEXTURE_2D或gl.TEXTURE_CUBE_MAP;
pname: 见表
param: 见表
```

pname：

| 参数名称                        | 描述                                       |
| --------------------------- | ---------------------------------------- |
| 放大方法（gl.TEXTURE_MAG_FILTER） | 当纹理绘制范围比纹理本身大时，该如何绘制。WebGL需要填充由于放大而造成的像素间的间隙。 |
| 缩小方法（gl.TEXTURE_MIN_FILTER） | 当纹理绘制范围比纹理本身小时，如何获取颜色。为了将纹理缩小，WebGL需要剔除纹理图像中的部分像素。 |
| 水平填充方法（gl.TEXTURE_WRAP_S）   | 如何对纹理图像左侧或右侧的区域进行填充                      |
| 垂直填充方法（gl.TEXTURE_WRAP_T）   | 如何对纹理图像上方和下方的区域进行填充                      |

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/70341809.jpg)

| 纹理参数                  | 描述     | 默认值                      |
| --------------------- | ------ | ------------------------ |
| gl.TEXTURE_MAG_FILTER | 纹理放大   | gl.LINEAR                |
| gl.TEXTURE_MIN_FILTER | 纹理缩小   | gl.NEAREST_MIPMAP_LINEAR |
| gl.TEXTURE_WRAP_S     | 纹理水平填充 | gl.REPEAT                |
| gl.TEXTURE_WRAP_T     | 纹理竖直填充 | gl.REPEAT                |

对于纹理放大和缩小，非金字塔纹理类型常量

| 值          | 描述                                       |
| ---------- | ---------------------------------------- |
| gl.NEAREST | 使用原纹理距离映射后像素（新像素）中心最近的颜色值，作为新像素的值。（使用曼哈顿距离，即直角距离\|x1-x2\|+\|y1-y2\|） |
| gl.LINEAR  | 使用距离新像素中心最近的四个像素的颜色值的加权平均，作为新像素的值（图像质量更好，但开销更高） |

对于纹理水平和竖直填充

| 值                  | 描述         |
| ------------------ | ---------- |
| gl.REPEAT          | 平铺式重复纹理    |
| gl.MIRRORED_REPEAT | 镜像对称式的重复纹理 |
| gl.CLAMP_TO_EDGE   | 使用纹理图像边缘值  |

MIPMPAP（也称金字塔）的纹理类型。MIPMAP纹理实际上是一系列纹理，或者说是原始纹理图像的一系列不同分辨率的版本。本书中不大会用到这种类型。

#### 将纹理图像分配给纹理对象 gl.textImage2D

```js
gl.texImage2D(target, level, internalformat, format, type, image)
将image指定的图像分配给绑定到目标上的纹理对象
target: gl.TEXTURE_2D或gl.TEXTURE_CUBE_MAP
level: 0 //该参数是为金字塔纹理准备的
internalformat: 图像的内部格式
format: 纹理数据的格式
type: 纹理数据的类型
image: 包含纹理图像的Image对象
```

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/9832675.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/15441132.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/24374986.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/5836620.jpg)

使用GLSL ES内置函数texture2D()抽取纹素颜色。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/7781069.jpg)

纹理放大和缩小方法的参数将决定WebGL系统以何种方式内插出片元。

#### 使用多幅纹理

WebGL可以同时处理多幅纹理，纹理单元就是为了这个目的而设计的。

WebGL具有处理不同纹理图像格式的能力。

#### MultiTexture

```js
var FSHADER_SOURCE = `
	...
	uniform sampler2D u_Sampler0;
	uniform sampler2D u_Sampler1;
	varying vec2 v_TexCoord;
	void main(){
		vec4 color0 = texture2D(u_Sampler0, v_TexCoord);
		vec4 color1 = texture2D(u_Sampler1, v_TexCoord);
		gl_FragColor = color0*color1;
	}
`;
function initTexture(gl ,n){
  var texture0 = gl.createTexture();
  var texture1 = gl.createTexture();
  var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  var u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

  var image0 = new Image();
  var image1 = new Image();
  image0.onload = function(){
    loadTexture(gl, n, texture0, u_Sampler0, image0, 0);	
  }
  image1.onload = function(){
    loadTexture(gl, n, texture1, u_Sampler1, image1, 1);	
  }

  image0.src = './assets/sky.jpg';
  image1.src = './assets/circle.gif';
}
var get_Tex0 = false,getTex1 = false;
function loadTexture(gl, n, texture, u_Sampler, image, texUnit){
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,1);
  if(texUnit==0) {
    gl.activeTexture(gl.TEXTURE0);
    get_Tex0 = true;
  } else {
    gl.activeTexture(gl.TEXTURE1);
    get_Tex1 = true;
  }

  //向target绑定纹理对象
  gl.bindTexture(gl.TEXTURE_2D, texture);
  //配置纹理参数
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //配置纹理图像
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  //将0号纹理传递给着色器 
  gl.uniform1i(u_Sampler, texUnit);

  if(get_Tex0&&get_Tex1){
    clear(gl, 0.0, 0.0, 0.0, 1.0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);			  		
  }

}
```

颜色矢量的分量乘法，最终得到：

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/2993975.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/1874168.jpg)

需要注意的是，在本例的loadTexture()函数中，我们无法预测哪一幅纹理图像先被加载完成，因为加载的过程是异步进行的，只有当两幅图像都加载完成时，程序才会开始绘图。

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/90868671.jpg)

#### 总结

本章深入地探索了WebGL的世界。



### 六、OpenGL ES着色器语言 GLSL ES

#### 矢量构造函数

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/90157600.jpg)

#### 矩阵构造函数

**必须是列主序的**！！

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/94322619.jpg)



与矢量构造函数类似，如果传入的数值的数量大于1，又没有达到矩阵元素的数量，就会出错。

#### .运算符

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/63881245.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/57464182.jpg)

#### []运算符

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/39445588.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/67774740.jpg)

#### 矢量和浮点数的运算

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/77871635.jpg)

#### 矢量运算

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/58771191.jpg)

#### 矩阵和浮点数的运算

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/99485919.jpg)

#### 矩阵右乘矢量

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/2904635.jpg)

#### 矩阵左乘矢量

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/743368.jpg)

#### 矩阵与矩阵相乘

···

GLSL ES只支持一维数组

#### 取样器

GLSL ES支持的一种内置类型称为取样器(sampler)，我们必须通过该类型变量访问纹理。

取样器类型：sampler2D和samplerCube

取样器变量只能是uniform变量

必须使用WebGL方法gl.uniformli()来进行赋值

取样器类型变量受到着色器支持的纹理单元的最大数量限制

| 着色器   | 表示最大数量的内置常量                              | 最小数量 |
| ----- | ---------------------------------------- | ---- |
| 顶点着色器 | const mediump int gl_MaxVertexTextureImageUnits | 0    |
| 片元着色器 | const mediump int gl_MaxTextureImageUnits | 8    |

#### 程序流程控制：分支和循环

if和if-else

for

Continue, break,discard

关于discard，它只能在片元着色器中使用，表示放弃当前片元直接处理下一个片元。

#### 函数

类似于c

**递归调用是不允许的。**

#### 规范声明

#### 参数限定词

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/44543683.jpg)

in是默认的限定词

```c
void luma2 (in ve3 color, out float brightness) {	
	brightness = 0.2126*color.r + 0.7162*color.g + 0.0722*color.b;
}
luma2(color, brightness);
```

#### 内置函数

![](http://p1yseh5av.bkt.clouddn.com/18-1-24/13011249.jpg)

#### 全局变量和局部变量

attribute变量，varying变量和uniform变量都必须声明为全局变量。

#### 存储限定字

const，attribute，uniform，varying

#### 精度限定字

GLSL ES新引入了精度限定字，目的是帮助着色器程序提高运行效率，削减内存开支。

高精度的程序需要更大的开销（包括更大的内存和更久的计算时间）。

```c
#ifdef GL_ES
precision mediump float;
#endif
```

由于WebGL是基于OpenGL ES 2.0的，WebGL程序最后有可能运行在各种各样的硬件平台上。肯定存在某些情况需要在低精度下运行程序，以提高内存的使用效率，减少性能开销，以及更重要的，降低能耗，延长移动设备的电池续航能力。

注意，在低精度下，WebGL程序的运行结果会比较粗糙或不准确，你必须在程序效果和性能间进行平衡。

| 精度限定字   | 描述                         | 默认数值范围和精度            |              |
| ------- | -------------------------- | -------------------- | ------------ |
|         |                            | float                | int          |
| highp   | 高精度，顶点着色器的最低精度             | (-2^26, 2^26)精度2^-16 | (-2^16,2^16) |
| mediump | 中精度，介于高精度和低精度之间，片元着色器的最低精度 | (-2^14,2^14)精度2^-10  | (-2^10,2^10) |
| lowp    | 低精度，低于中精度，可以表示所有颜色         | (-2,2)精度2^-8         | (-2^8,2^8)   |

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/85425071.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/16781907.jpg)

对于这些类型，着色器已经实现了默认的精度，只有片元着色器中的float类型没有默认精度，我们需要手动指定，不指定则会报错：

```
Failed to compile shader: ERROR: 0:3: '' : No precision specified for (float)
```

数据类型的默认精度：

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/72214671.jpg)

#### 预处理指令

···

#### 总结

GLSL ES和C语言有很多相似之处。与C语言相比，GLSL ES支持一些专为计算机图形学而设计的专属特性，包括对矢量和矩阵类型的支持，访问矢量和军阵元素的特殊分量名，矢量和矩阵的操作等，同时简化或删除了一些不必要的特性。此外，GLSL ES还支持许多内置的与计算机图形学相关的函数。



### 七、进入三维世界

#### 立方体由三角形构成

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/25158155.jpg)

绘制三维物体时，还得考虑它们的深度信息（depth information）

#### 视点和视线

定义一个观察者：

- 观察方向，即观察者自己在什么位置，在看场景的哪一部分？
- 可视距离，即观察者能够看多远？

我们将观察者所处的位置称为**视点**(eye point)，从视点出发沿着观察方向的射线称作**视线**(viewing direction)。

在WebGL系统中，默认情况下的视点处于原点（0，0，0），视线为Z轴负半轴。

#### 视点、观察目标点和上方向

视点：观察者的位置。

观察目标点：被观察目标所在的点，它可以用来确定视线。

上方向：最终绘制在屏幕上的影像中的向上的方向。因为我们最后要把观察到的景象绘制到屏幕上，还需要知道上方向（up direction）。

有了这三项信息，就可以确定观察者的状态了。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/89716397.jpg)

在WebGL中，我们可以用上述三个矢量创建一个视图矩阵(view matrix)，然后将该矩阵传给顶点着色器。

试图矩阵可以表示观察者的状态，含有观察者的视点、观察目标点、上方向等信息。

```js
var initViewMatrix = new Matrix4();
initialViewMatrix.setLookAt(0,0,0,0,0,-1,0,1,0);
//传入视点，观察目标点，上方向
```

#### LookAtTriangles

```js
var VHSADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	uniform mat4 u_ViewMatrix;
	varying vec4 v_Color;
	void main(){
		gl_Position = u_ViewMatrix*a_Position;
		v_Color = a_Color;
	}
`;
var FSHADER_SOURCE = `
	varying vec4 v_Color;
	void main() {
		gl_FragColor = v_Color;
	}
`;
function main(){
  var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(0.20, 0.25, 0.25, 0, 0, 0, 0, 1, 0);
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
  
  gl.drawArarys(gl.TRIANGLES, 0, n);
}
```

实际上，”根据自定义的观察者状态，绘制观察者看到的景象“ 与”使用默认的观察状态，但是对三维对象进行平移、旋转等变换，再绘制观察者看到的景象“。这两种行为是等价的。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/51345650.jpg)

“改变观察者的状态” 与 “对整个世界进行平移和旋转变换”， 本质上是一样的，它们都可以用矩阵来描述。

最终矩阵 = **视图矩阵** x **模型矩阵** x 原始顶点坐标

#### LookAtRotatedTriangles

```js
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	uniform mat4 u_ViewMatrix;
	uniform mat4 u_ModelMatrix;
	varying vec4 v_Color;
	void main(){
		gl_Position = u_ViewMatrix*u_ModelMatrix*a_Position;
		v_Color = a_Color;
	}
`;
```

#### 独缺一角

三角形缺了一角的原因是，我们没有指定可视范围（visible range）。

#### 可视范围（正射类型）

不绘制可视范围外的对象，是基本的降低程序开销的手段。

从某种程序上来说，这样做也模拟了人类观察物体的方式。

我们人类也只能看到眼前的东西，水平视角大约200度左右。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/62904888.jpg)

水平视角，垂直视角和可视深度，定义了可视空间。

#### 可视空间

- 长方体可视空间，也称盒状空间，由正射投影(orthographic projection)产生。
- 四棱锥/金字塔可视空间，由透视投影(perspective projection)产生。

在透视投影下，产生的三维场景看上去更加有深度感，更加自然，因为我们平时观察真实世界用的也是透视投影。在大多数情况下，比如三维设计类游戏中，我们都应当采用透视投影。

盒状可视空间工作原理：

可视空间由前后两个矩形表面确定，分别称为近剪裁面和远剪裁面。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/10676948.jpg)

#### 定义盒状可视空间

```js
Matrix.setOrtho(left, right, bottom, top, near, far);
```

我们在这里又用到了矩阵，这个矩阵被称为正射投影矩阵。

#### OrthoView

```js
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +
  '}\n';
```

设置可视空间的矩阵待研究······

#### 补上缺掉的角 LookAtTrianglesWithKeys_ViewVolume

最终坐标 = 正射投影矩阵 x 视图矩阵 x 顶点坐标

调整可视空间大小，最终将缺掉的角补回来。

#### 实验 OrthoView_halfSize

如果可视空间**近剪裁面的宽高比**与canvas不一致，显示出的物体就会被压缩变形。

#### 可视空间（透视投影）

远处的东西看上去小 => 透视感

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/902940.jpg)

在使用透视投影矩阵后，WebGL就能够自动将距离远的物体缩小显示，从而产生上图（左）中的深度感。

#### 定义透视投影的可视空间

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/95986327.jpg)

```js
Matrix4.setPerspective(fov, aspect, near, far)
fov: 指定垂直视角，即可视空间顶面与地面间的夹角，必须大于0
aspect: 指定近剪裁面的宽高比
near, far: 指定近剪裁面和远裁剪面的位置
```

#### 投影矩阵的作用

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/22210043.jpg)

换一个角度看，透视投影矩阵实际上将金字塔状的可视空间变换为了盒状的可视空间。这个盒状的可视空间又称规范立方体。

#### 共冶一炉（模型矩阵、视图矩阵和投影矩阵）

顶点变换过程:

​	投影矩阵 x 视图矩阵 x 模型矩阵 x 顶点坐标

#### 正确处理对象的前后关系

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/2757117.jpg)

上图中，绿色三角形的一部分被黄色和蓝色三角形挡住了。看上去似乎是WebGL专为三维图形学设计，能够自动分析出三维对象的远近，并正确处理遮挡关系。

遗憾的是，事实没有想象的那么美好。在默认情况下，**WebGL为了加速绘图操作，是按照顶点在缓冲区中的顺序来处理它们的**。前面所有的示例程序我们都是故意先定义远的物体，后定义近的物体，从而产生正确的效果。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/57244764.jpg)

WebGL在默认情况下会按照**缓冲区中的顺序**绘制图形，而且后绘制的图形覆盖先绘制的图形，因为这样做很高效。如果场景中的对象不发生运动，观察者的状态也是唯一的，那么这种做法没有问题。否则，会有问题，不可能实现决定对象出现的顺序。

#### 隐藏面消除 hidden surface removal

解决这个问题。

1. 开启隐藏面消除功能。

   gl.enable(gl.DEPTH_TEST);

2. 在绘制之前，清除深度缓冲区。

   gl.clear(gl.DEPTH_BUFFER_BIT)；

深度缓冲区（depth buffer）是一个中间对象，其作用就是帮助WebGL进行隐藏面消除。WebGL在颜色缓冲区中绘制几何图形，绘制完成后将颜色缓冲区显示到canvas上。如果要将隐藏面消除，那就必须知道每个几何图形的深度信息，而深度缓冲区就是用来存储深度信息的。由于深度方向通常是Z轴方向，所以有时候我们也称它为Z缓冲区。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/60298221.jpg)

在绘制任意一帧之前，都必须清除深度缓冲区，以消除绘制上一帧时在其中留下的痕迹。如果不这样做，就会出现错误的结果。

同时清除深度缓冲区和颜色缓冲区：

```js
gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
```

gl.enable  <=> gl.disable 开启和关闭某项功能。

在任何三维场景中，你都应该开启隐藏面消除，并在适当的时刻清空深度缓冲区。（通常是在绘制每一帧之前）

！！⚠️	隐藏面消除的前提是正确设置可视空间，否则就可能产生错误的结果。不管是盒状的正射投影空间，还是金字塔状的透视投影空间，你必须使用一个。

??

#### 深度冲突

隐藏面消除是WebGL的一项复杂而又强大的特性，在绝大多数情况下，他都能很好的完成任务。然而，当几何图形或物体的两个表面极为接近时，就会出现新的问题，使得表面看上去斑斑驳驳的。这种现象被称为深度冲突（Z fighting）.

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/51835083.jpg)

处理前

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/9678786.jpg)

处理后。

#### 多边形偏移

可以使用多边形偏移的机制来解决这个问题。

该机制将自动在Z值加上一个偏移量，偏移量的值由物体表面相对于观察者视线的角度来确定。

- 启用多边形偏移

  gl.enable(gl.POLYGON_OFFSET_FILL);

- 在绘制之前指定用来计算偏移量的参数。

  gl.polygonOffset(1.0, 1.0)

#### 立方体

为每个顶点定义颜色后，表面上的颜色会根据顶点颜色内插出来，形成一种光滑的渐变效果。

色体，相当于二维的色轮。

绘制立方体=>使用gl.TRIANGLES,gl.TRIANGLE_STRIP,gl.TIRANGLE_FAN模式来绘制三角形。

通过绘制两个三角形来拼成立方体的一个矩形表面。

WebGL确实提供了一种完美的方案：gl.drawElements()。使用该函数替代gl.drawArays()函数进行绘制，能够避免重复定义顶点，保持顶点数量最小。因此，你需要知道模型的每一个顶点的坐标，这些顶点坐标描述了整个模型。

立方体被拆成6个面。每个面由两个三角形组成，与三角形列表中的两个三角形相关联。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/39003024.jpg)

#### 通过顶点索引绘制物体

```js
gl.drawElements(mode, count, type, offset)
mode: 指定绘制的方式
count: 指定绘制顶点的个数
type: 指定索引值数据类型
offset: 指定索引数组中开始绘制的位置
```

与`gl.drawArrays()`最重要的区别在于`gl.ELEMENT_ARRAY_BUFFER`

#### HelloCube

```js
// Create a cube
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3
var verticesColors = new Float32Array([
  // Vertex coordinates and color
  1.0,  1.0,  1.0,     1.0,  1.0,  1.0,  // v0 White
  -1.0,  1.0,  1.0,     1.0,  0.0,  1.0,  // v1 Magenta
  -1.0, -1.0,  1.0,     1.0,  0.0,  0.0,  // v2 Red
  1.0, -1.0,  1.0,     1.0,  1.0,  0.0,  // v3 Yellow
  1.0, -1.0, -1.0,     0.0,  1.0,  0.0,  // v4 Green
  1.0,  1.0, -1.0,     0.0,  1.0,  1.0,  // v5 Cyan
  -1.0,  1.0, -1.0,     0.0,  0.0,  1.0,  // v6 Blue
  -1.0, -1.0, -1.0,     0.0,  0.0,  0.0   // v7 Black
]);

// Indices of the vertices
var indices = new Uint8Array([
  0, 1, 2,   0, 2, 3,    // front
  0, 3, 4,   0, 4, 5,    // right
  0, 5, 6,   0, 6, 1,    // up
  1, 6, 7,   1, 7, 2,    // left
  7, 4, 3,   7, 3, 2,    // down
  4, 7, 6,   4, 6, 5     // back
]);
//将顶点索引数据写入缓冲区对象
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
return indices.length;
...
// Clear color and depth buffer
gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

// Draw the cube
gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
```

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/69797773.jpg)

这种方式通过索引来访问顶点数据，从而循环利用了顶点信息，控制内存的开销，但代价是你需要通过索引来间接地访问顶点，在某种程度上使程序复杂化了。

虽然我们已经证明了`gl.drawElements()`是高效的绘制三维图形的方式，但还是漏了关键的一点：我们无法通过将颜色定义在索引值上，颜色仍然是依赖于顶点的。

#### 为立方体的每个表面指定颜色

我们需要创建多个具有相同顶点坐标的顶点。

这样每个面都指向一组不同的顶点，就可以实现前述的效果。

#### ColoredCube

```js
// Create a cube
//    v6----- v5
//   /|      /|
//  v1------v0|
//  | |     | |
//  | |v7---|-|v4
//  |/      |/
//  v2------v3

var vertices = new Float32Array([   // Vertex coordinates
  1.0, 1.0, 1.0,  -1.0, 1.0, 1.0,  -1.0,-1.0, 1.0,   1.0,-1.0, 1.0,  // v0-v1-v2-v3 front
  1.0, 1.0, 1.0,   1.0,-1.0, 1.0,   1.0,-1.0,-1.0,   1.0, 1.0,-1.0,  // v0-v3-v4-v5 right
  1.0, 1.0, 1.0,   1.0, 1.0,-1.0,  -1.0, 1.0,-1.0,  -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
  -1.0, 1.0, 1.0,  -1.0, 1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0,-1.0, 1.0,  // v1-v6-v7-v2 left
  -1.0,-1.0,-1.0,   1.0,-1.0,-1.0,   1.0,-1.0, 1.0,  -1.0,-1.0, 1.0,  // v7-v4-v3-v2 down
  1.0,-1.0,-1.0,  -1.0,-1.0,-1.0,  -1.0, 1.0,-1.0,   1.0, 1.0,-1.0   // v4-v7-v6-v5 back
]);

var colors = new Float32Array([     // Colors
  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  0.4, 0.4, 1.0,  // v0-v1-v2-v3 front(blue)
  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  0.4, 1.0, 0.4,  // v0-v3-v4-v5 right(green)
  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  1.0, 0.4, 0.4,  // v0-v5-v6-v1 up(red)
  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  1.0, 1.0, 0.4,  // v1-v6-v7-v2 left
  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  1.0, 1.0, 1.0,  // v7-v4-v3-v2 down
  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0,  0.4, 1.0, 1.0   // v4-v7-v6-v5 back
]);

var indices = new Uint8Array([       // Indices of the vertices
  0, 1, 2,   0, 2, 3,    // front
  4, 5, 6,   4, 6, 7,    // right
  8, 9,10,   8,10,11,    // up
  12,13,14,  12,14,15,    // left
  16,17,18,  16,18,19,    // down
  20,21,22,  20,22,23     // back
]);
```

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/54434227.jpg)

如果物体各表面的颜色相同，它就会失去立体感。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/39147595.jpg)

相反，在现实世界中，一个纯白色的立方体被放在桌上的时候，你仍然还是能够辨认出它的。

实际上，显示中的立方体各个表面虽然是同一个颜色，但是看上去却又轻微的差异，因为各个表面的角度不同，受到环境中光照的情况也不同。

#### 总结

引入了深度的概念



### 八、光照

光照使场景更具有层次感。

- 明暗、阴影、不同类型的光：点光源光、平行光和散射光。
- 物体表面反射光线的方式：漫反射和环境反射。
- 编写代码实现光照效果，使三维模型看上去更逼真。

#### 光照原理

现实世界中的物体被光线照射时，会反射一部分光。只有当反射光线进入你的眼睛时，你才能够看出物体并辨认出它的颜色。

现实世界中，光线照射到物体上时，发生了两个重要的现象。

- 根据光源和光线方向，物体不同表面的明暗程度变得不一致。
- 根据光源和光线方向，物体向地面投下了影子。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/82484802.jpg)

在生活中，你可能常常会注意到阴影，却很少注意到明暗差异，实际上正是明暗差异给了物体立体感，虽然难以察觉，但它始终存在。

在三维图形学中术语**着色（shading）**的真正含义就是，根据光照条件重建“物体各表面明暗不一的效果”的过程。物体向地面投下影子的现象，又被称为**阴影（shadowing）**。本节将讨论前者。

先考虑：

- 发出光线的光源的类型
- 物体表面如何反射光线

#### 光源类型

真实世界中的光主要有两种类型：

- 平行光（directional light），类似于自然中的太阳光。
- 点光源光（point light），类似于人造灯泡的光。

此外，我们还用环境光（ambient light）来模拟真实世界中的非直射光。三维图形学还使用一些其他类型的光，比如用聚光灯光（spot light）来模拟电筒、车前灯等。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/98597561.jpg)

**平行光：**平行光的光线是相互平行的，平行光具有方向。太阳光。

​		平行光很简单，可以用一个方向和一个颜色来定义。

**点光源光：**点光源光是从一个点向周围的所有方向发出的光。灯泡、火焰等。

​		我们需要指定点光源的位置和颜色。光线的方向将根据点光源的位置和被照射之处的位置计算出来，因为点光源的光线的方向在场景内的不同位置是不同的。

**环境光：**环境光是指那些经光源发出后，被墙壁等物体多次反射，然后照到物体表面上的光。环境光从各个角度照射物体，其强度都是一致的。

​		环境光不用指定位置和方向，只需要指定颜色即可。

#### 反射类型

物体表面反射光线的方式有两种：漫反射（diffuse reflection）和环境反射（enviroment/ambient reflection）。

#### 漫反射

漫反射是针对平行光或点光源而言的。漫反射的反射光在各个方向上是均匀的。如果物体表面像镜子一样光滑，那么光线就会以特定的角度反射出去；但是现实中的大部分材质，比如纸张、岩石、塑料等，其表面都是粗糙的，在这种情况下反射光就会以不固定的角度反射出去，漫反射就是针对后一种情况而建立的理想反射模型。

![](http://p1yseh5av.bkt.clouddn.com/18-1-25/72300583.jpg)

在漫反射中，反射光的颜色取决于入射光的颜色、表面的基底色、入射光与表面形成的入射角。我们将入射角定义为入射光与表面的法线形成的夹角，并用∂表示，那么漫反射光的颜色可以根据下式计算得到：

​	<漫反射光颜色> = <入射光颜色> x <表面基底色> x cos∂

式中，入射光颜色指的是点光源或平行光的颜色，乘法操作是在颜色矢量上逐分量进行的。因为漫反射光在各个方向上都是均匀的，所以从任何方向看上去其强度都相等。

#### 环境反射

环境反射是针对环境光而言的。在环境反射中，反射光的方向可以认为就是入射光的反方向。由于环境光照射物体的方式就是个方向均匀、强度相等的，所以反射光也是各向均匀的。

​		<环境反射光颜色> = <入射光颜色>x<表面基底色>

这里入射光颜色实际上也就是环境光的颜色。

当漫反射和环境反射同时存在时，将两者加起来，就会得到物体最终被观察到的颜色：

​		<表面的反射光颜色> = <漫反射光颜色>+<环境反射光颜色>

注意，两种反射光并不一定总是存在，也并不一定要完全按照上述公式来计算。渲染三维模型时，你可以修改这些公式以达到想要的效果。



示例程序，在合适的位置放置一个光源，对场景进行着色。

#### 平行光下的漫反射

因为平行光的方向是唯一的，对于同一个平面上的所有点，入射角是相同的。

​		<漫反射光颜色> = <入射光颜色>x<表面基底色>xcos∂

入射光的颜色可能是白色的，比如阳光；也可能是其他颜色的，比如隧道中的橘黄色灯光。

物体表面的基底色其实就是“物体本来的颜色”（物体在标准白光下的颜色）。

在计算反射光颜色时，我们对RGB值的三个分量逐个相乘。

···

当白光垂直入射到红色物体的表面时，漫反射光的颜色就变成了红色。而如果是红光垂直入射到白色物体的表面时，漫反射光的颜色也会是红色。

入射光与表面平行时，物体表面应该完全不反光，看上去是黑的。

#### 根据光线和表面的方向计算入射角

我们必须根据入射光的方向和物体表面的朝向（即法线方向）来计算出入射角。

我们可以确定每个表面的朝向。在指定光源的时候，再确定光的方向，就可以用这两项信息来计算入射角了。

可以通过计算两个矢量的点积，来计算这两个矢量的夹角余弦值cos∂。

​		cos∂ = <光线方向>·<法线方向>

因此 <漫反射光颜色> = <入射光颜色>x<表面基底色>x(<光线方向>·<法线方向>)

⚠️：

1. 光线方向矢量和表面法线矢量的长度必须为1，否则反射光的颜色就会过亮或过暗。

   讲一个矢量的长度调整为1，同时保持方向不变的过程称之为归一化（normalization）。

2. 这里所谓的光线方向，实际上是入射方向的反方向，即从入射点指向光源方向（因为这样，该方向与法相方向的夹角才是入射角）。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/6398677.jpg)

#### 法线：表面的朝向

物体表面的朝向，即垂直于表面的方向，又称法线或法向量。法向量有三个分量，向量（nx，ny，nz）表示从原点（0，0，0）指向点（nx，ny，nz）的方向。

向量（1，0，0）表示x轴正方向。

向量（0，0，1）表示z轴正方向。

涉及到表面和法向量的问题时，必须考虑以下两点：

- 一个表面具有两个法向量

  每个表面都有两个面，“正面”和“背面”。两个面个字具有一个法向量。

  ![](http://p1yseh5av.bkt.clouddn.com/18-1-26/70583160.jpg)

在三维图形学中，表面的正面和背面取决于绘制表面时的顶点顺序。当你按照v0,v1,v2,v3的顶点顺序绘制了一个平面，那么当你从正面观察这个表面时，这4个顶点时顺时针的，而你从背面观察该表面，这4个顶点就是逆时针的。所以，该平面正面的法向量就是（0，0，-1）

#### 平面的法向量唯一

由于法向量表示的是方向，与位置无关，所以一个平面只有一个法向量。换句话说，平面的任意一点都具有相同的法向量。

相互平行的两个平面，也具有相同的法向量。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/27591915.jpg)

一旦计算好每个平面的法向量，接下来的任务就是将数据传给着色器程序。

每个顶点对应三个法向量，就像之前每个顶点都对应3个颜色值一样。

> 立方体比较特殊，各表面垂直相交，所以每个顶点对应3个法向量（同时在缓冲区中被拆成3个顶点）。但是一些表面光滑的物体，比如游戏中人物模型，通常其每个顶点只对应一个法向量。

#### LightedCube

```js
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' + 
  'attribute vec4 a_Color;\n' + 
  'attribute vec4 a_Normal;\n' +        // Normal
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position ;\n' +
  // 对法向量归一化
  '  vec3 normal = normalize(a_Normal.xyz);\n' +
  // 计算方向和法向量的点积
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
  // 计算漫反射光的颜色
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
  '  v_Color = vec4(diffuse, a_Color.a);\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE = 
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
···
  // Set the clear color and enable the depth test
  gl.clearColor(0, 0, 0, 1);
  gl.enable(gl.DEPTH_TEST);

  // Get the storage locations of uniform variables and so on
  var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  if (!u_MvpMatrix || !u_LightColor || !u_LightDirection) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.5, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);

···

    var normals = new Float32Array([    // Normal
    0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,   0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
    1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,   1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
    0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,   0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
   -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
    0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,   0.0,-1.0, 0.0,  // v7-v4-v3-v2 down
    0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0,   0.0, 0.0,-1.0   // v4-v7-v6-v5 back
  ]);	

```

#### 顶点着色器

float nDotL = max(dot(u_LightDirection, normal), 0.0);

点积值小于0，意味着cos∂中的∂大于90度。∂是入射角，也就是入射反方向与表面法向量的夹角，∂大于90度说明光线照射在表面的背面上，则将nDotL赋值为0.0

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/75016857.jpg)

实际上，物体表面的透明度确实会影响物体的外观。但这是光照的计算较为复杂，现在暂时认为物体都是不透明的，这样就计算出了漫反射光的颜色diffuse。

 ```
v_Color = vec4(diffuse, 1.0);
 ```

顶点着色器运行的结果就是计算出了v_Color变量，其值取决于顶点的颜色、法线方向、平行光的颜色和方向。

v_Color变量将被传入片元着色器并赋值给gl_FragColor变量。本例中的光是平行光，所以立方体上同一个面的颜色也是一致的，没有之前出现的颜色渐变效果。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/78063325.jpg)

#### 环境光下的漫反射

在现实世界中，光照下物体的各表面的差异不会如此分明：那些背光的面虽然会暗一些，但绝不至于黑到看不见的程度。实际上，那些背光的面是背非直射光（即用其他物体，如墙壁的反射光等）照亮的，前面提到的环境光就起到了这部分非直射光的作用，它使场景更加逼真。因为环境光均匀地从各个角度照在物体表面，所以由环境光反射产生的颜色只取决于光的颜色和表面基底色。

​		<环境反射光颜色> = <入射光颜色>x<表面基底色>

得到：

​		<表面的反射光颜色> = <漫反射光颜色>+<环境反射光颜色>

#### LightedCube_ambient

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/49291867.jpg)

```js
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +       // Normal
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform vec3 u_DiffuseLight;\n' +   // Diffuse light color
  'uniform vec3 u_LightDirection;\n' + // Diffuse light direction (in the world coordinate, normalized)
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Make the length of the normal 1.0
  '  vec3 normal = normalize(a_Normal.xyz);\n' +
     // The dot product of the light direction and the normal (the orientation of a surface)
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_DiffuseLight * a_Color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
     // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
  '}\n';

  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

```

显然，物体的运动会改变每个表面的法向量，从而导致光照效果发生变化。

#### 运动物体的光照效果

立方体旋转时，每个表面的法向量也会随之变化。下图中，我们沿着z轴负方向观察一个立方体，最左边时立方体的初始状态，途中标出了立方体由侧面的法向量（1，0，0），它指向x轴正方向，然后对该立方体进行变换，观察由侧面法向量随之变化的情况。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/20041032.jpg)

- 平移变换不会改变法向量，因为平移不会改变物体的方向。

- 旋转变换会改变法向量，因为旋转改变了物体的方向。

- 缩放变换对法向量的影响较为复杂。

  缩放比例在所有的轴上都一致的话，那么法向量就不会变化。最后，即使物体在某些轴上的缩放比例并不一致，法向量也并不一定会变化。

#### 魔法矩阵：逆转置矩阵

对顶点进行变换的矩阵称为模型矩阵。

如何计算变换之后的**法向量**呢？

只要将变换之前的法向量乘以**模型矩阵**的**逆转置矩阵**即可。

所谓逆转置矩阵，就是逆矩阵的转置。

逆矩阵的含义是，如果矩阵M的逆矩阵是R，那么R\*M或M\*R的结果都是单位矩阵。

转置的意思是，将矩阵的行列进行调换。

**规则：用法向量乘以模型矩阵的逆转置矩阵，就可以求的变换后的法向量。**

求逆转置矩阵的两个步骤：

- 求原矩阵的逆矩阵。
- 将上一步求得的逆矩阵进行转置。

| 方法                      | 描述         |
| ----------------------- | ---------- |
| Matrix4.setInverseOf(m) | 使自身成为m的逆矩阵 |
| Matrix4.transpose       | 对自身进行转置    |

#### LightedTranslatedRotatedCube

```js
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Recalculate the normal based on the model matrix and make its length 1.
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate the dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
     // Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';
···
var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
  var u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  var u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
  var u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
  if (!u_MvpMatrix || !u_NormalMatrix || !u_LightColor || !u_LightDirection || !u_AmbientLight) { 
    console.log('Failed to get the storage location');
    return;
  }

  // Set the light color (white)
  gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
  // Set the light direction (in the world coordinate)
  var lightDirection = new Vector3([0.0, 3.0, 4.0]);
  lightDirection.normalize();     // Normalize
  gl.uniform3fv(u_LightDirection, lightDirection.elements);
  // Set the ambient light
  gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

  var modelMatrix = new Matrix4();  // Model matrix
  var mvpMatrix = new Matrix4();    // Model view projection matrix
  var normalMatrix = new Matrix4(); // Transformation matrix for normals

  // Calculate the model matrix
  modelMatrix.setTranslate(0, 0.9, 0); // Translate to the y-axis direction
  modelMatrix.rotate(90, 0, 0, 1);     // Rotate 90 degree around the z-axis
  // Calculate the view projection matrix
  mvpMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  mvpMatrix.lookAt(3, 3, 7, 0, 0, 0, 0, 1, 0);
  mvpMatrix.multiply(modelMatrix);
  // Pass the model view projection matrix to u_MvpMatrix
  gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

  // Calculate the matrix to transform the normal based on the model matrix
  //根据模型矩阵计算用来变换法向量的矩阵
  normalMatrix.setInverseOf(modelMatrix);
  normalMatrix.transpose();
  // Pass the transformation matrix for normals to u_NormalMatrix
  gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

  // Clear color and depth buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Draw the cube
  gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
```

#### 点光源光

与平行光相比，点光源光发出的光，在三维空间的不同位置上其方向也不同。所以，在对点光源光下的物体进行着色时，需要在每个入射点计算点光源光在该处的方向。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/21789363.jpg)

着色器需要知道点光源光自身所在的位置，而不是光的方向。

#### PointLightedCube

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/97723135.jpg)

```js
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +   // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +  // Transformation matrix of the normal
  'uniform vec3 u_LightColor;\n' +    // Light color
  'uniform vec3 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
  'uniform vec3 u_AmbientLight;\n' +  // Ambient light color
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Recalculate the normal based on the model matrix and make its length 1.
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
     // Calculate world coordinate of vertex
  '  vec4 vertexPosition = u_ModelMatrix * a_Position;\n' +
     // Calculate the light direction and make it 1.0 in length
  '  vec3 lightDirection = normalize(u_LightPosition - vec3(vertexPosition));\n' +
     // The dot product of the light direction and the normal
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the color due to diffuse reflection
  '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
     // Calculate the color due to ambient reflection
  '  vec3 ambient = u_AmbientLight * a_Color.rgb;\n' +
     //  Add the surface colors due to diffuse reflection and ambient reflection
  '  v_Color = vec4(diffuse + ambient, a_Color.a);\n' + 
  '}\n';

```

点光源向四周放射光线，所以顶点出的光线方向是由点光源光坐标减去顶点坐标而得到的矢量。

`u_LightPosition`点光源坐标

`lightDirection`光线方向矢量，需要进行归一化

但是逐顶点处理点光源光的光照效果时仍然会出现不自然现象

出现该现象的原因是，WebGL系统会根据顶点的颜色，内插出表面上每个片元的颜色。实际上，点光源光照射到一个表面上，所产生的效果（即每个片元获得的颜色）与简单实用4个顶点颜色内插出的效果并不完全相同（在某些极端情况下甚至很不一样），所以为了使效果更加逼真，我们需要对表面的每一点计算光照效果。

如果使用一个球体，两者的差异可能会更明显。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/92586591.jpg)

逐顶点计算

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/19865806.jpg)

逐片元计算

#### 更逼真：逐片元光照

```js
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_ModelMatrix;\n' +    // Model matrix
  'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
  'varying vec4 v_Color;\n' +
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'void main() {\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
     // Calculate the vertex position in the world coordinate
  '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
  '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  v_Color = a_Color;\n' + 
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec3 u_LightPosition;\n' +  // Position of the light source
  'uniform vec3 u_AmbientLight;\n' +   // Ambient light color
  'varying vec3 v_Normal;\n' +
  'varying vec3 v_Position;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
     // Normalize the normal because it is interpolated and not 1.0 in length any more
  '  vec3 normal = normalize(v_Normal);\n' +
     // Calculate the light direction and make its length 1.
  '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
     // The dot product of the light direction and the orientation of a surface (the normal)
  '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
     // Calculate the final color from diffuse reflection and ambient reflection
  '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
  '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
  '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
  '}\n';

```

为了逐片元地计算光照，你需要知道：

1. 片言在世界坐标系下的坐标。
2. 片元表面的法向量。

可以在顶点着色器中，将顶点的**世界坐标**和**法向量**以varying变量的形式传入片元着色器，片元着色器中的同名变量就已经是内插后的逐片元值了。

片元的世界坐标

片元的法向量

#### 总结

在正确的光照效果下，三维场景会更加逼真。



### 九、层次模型

这一章是涉及WebGL的核心特性的最后一章。

- 由多个简单的部件组成的复杂模型。
- 为复杂物体建立具有层次化结构的三维模型。
- 使用模型矩阵，模拟机器人手臂上的关节运动。
- 研究initShader函数的实现，了解初始化着色器的内部细节。

#### 多个简单模型组成的复杂模型

绘制由多个小部件组成的复杂模型，最关键的问题是如何处理模型的整体移动，以及各个小部件间的相对移动。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/25060253.jpg)

手臂的每个部分可以围绕关节运动

- 上臂可以绕肩关节旋转运动，并带动前臂、手掌、手指动

- 前臂可绕肘关节···

  ···

总之，当手臂的某个部位运动时，位于该部位以下的其他部位会随之一起运动，而位于该部位以上的其他部位不受影响。此外，这里的所有运动，都是围绕某个关节的转动。

#### 层次结构模型

绘制机器人手臂这样一个复杂的模型，最常用的方法就是按照模型中各个部件的层次顺序，从高到低逐一绘制，并在每个关节上应用模型矩阵。

肩关节、肘关节、腕关节、指关节都有各自的旋转矩阵。

三维模型和现实中的人类或机器人不一样，它的部件并没有真正连接在一起。

···

#### 单关节模型

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/34322001.jpg)

#### JointMode

和以前的程序比，main()函数基本没有变化，主要的变化发生在initVertexBuffers()函数中，它将arm1和arm2的数据写入了相应的缓冲区。以前程序中的立方体都是以原点为中心，且边长为2.0；本例为了更好地模拟机器人手臂，使用下图所示的立方体，原点位于底面中心，底面是变长为3.0的正方形，高度为10.0。将原点置于立方体的地面中心，是为了便于使立方体绕关节转动。arm1和arm2都使用这个立方体。

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/34347702.jpg)

main()函数首先根据可视空间，视点和视线方向计算出克视图投影矩阵。

然后在键盘事件响应函数中调用keydown()函数，通过方向键控制机器人的手臂运动。

#### 绘制层次模型draw()

draw()函数的任务是绘制机器人手臂。

draw()函数内部调用了drawBox()函数，每调用一次绘制一个部件，先绘制下方较细的arm1，再绘制上方较粗的arm2.

drawBox()函数的任务是绘制机器人手臂的某一个立方体部件，如上臂或前臂。

要模拟现实中的人类手臂，应该对皮肤进行建模。

#### 多节点模型

![](http://p1yseh5av.bkt.clouddn.com/18-1-26/60946435.jpg)

#### MultiJointModel

···



#### 着色器和着色器程序对象：initShaders()函数的作用

initShader的7个步骤：

1. 创建着色器对象（gl.createShader()）
2. 向着色器对象中填充着色器程序的源代码（gl.shaderSource()）
3. 编译着色器(gl.compileShader())
4. 创建程序对象（gl.createProgram()）
5. 为程序对象分配着色器(gl.attachShader())
6. 连接程序对象(gl.linkProgram())
7. 使用程序对象(gl.useProgram())

**着色器对象：** 着色器对象管理一个顶点着色器或一个片元着色器。每一个着色器都有一个着色器对象。

**程序对象：**程序对象是管理着色器对象的容器。WebGL中，一个程序对象必须包含一个顶点着色器和一个片元着色器。



#### 总结

本章讨论了如何绘制和操作由多个部件组成的层次化模型。



### 十、高级技术

#### 用鼠标控制物体旋转

我们可以这样来实现：在鼠标左键按下时记录鼠标的初始坐标，然后在鼠标移动的时候用当前坐标减去初始坐标，获得鼠标的位移，然后根据这个位移来计算旋转矩阵。

#### RotateObject

```js
var currentAngle = [0.0, 0.0];
```

#### 选中物体

选中三维物体比选中二维物体更加复杂，因为我们需要更多的数学过程来计算鼠标是否悬浮在某个图形上。

示例程序用一个简单的技巧解决了这一个问题。

如何实现选中物体？

1. 当鼠标左键按下时，将整个立方体重绘为单一的红色。
2. 读取鼠标点击处的像素颜色。
3. 使用立方体原来的颜色对其进行重绘。
4. 如果第二步读取到的颜色是红色，就显示消息“The cube was selected！”。

如果不加以处理，那么当立方体被重绘为红色时，就可以看到这个立方体闪烁了一下，而且闪烁的一瞬间时红色的。然后我们读取鼠标点击处的像素在这一瞬间的颜色值，就可以通过判断该颜色是否为红色来确定鼠标是否点击在了立方体上。

为了使用户看不到立方体的这一闪烁过程，我们还得在取出像素颜色之后立即将立方体重绘成原来的样子。

```js
var VSHADER_SOURCE = `
	uniform mat4 u_MvpMatrix;
	uniform bool u_Clicked;
	varying vec4 v_Color;
	void main(){
		gl_Position = u_MvpMatrix*a_Position;
		if(u_Clicked){	
			v_Color = vec4(1.0, 0.0, 0.0, 1.0);
		} else {
			v_Color = a_Color;	
		}
	}
`;
canvas.onmousedown = function(ev){
  var x = ev.clientX, y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();
  if(rect.left<=x&&x<rect.right&&rect.top<=y&&y<rect.bottom){
    var x_in_canvas = x - rect.left,
        y_in_canvas = rect.bottom - y;
    var picked = check(gl, n, x_in_canvas, y_in_canvas, currentAngle, u_Clicked, viewProjMatrix,u_MvpMatrix);
    if(picked) alert('Cube was selected');
  }
}
function check(...){
  var picked = false;
  gl.uniform1i(u_Clicked, 1);
  draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
  var pixels = new Uint8Array(4);
  gl.readPixels(x,y,1,1,gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  if(pixels[0]==255) picked = true;
  gl.uniform1i(u_Clicked, 0);
  draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
  return picked;
}
```

#### 选中一个表面

可以使用同样的方法来选中物体的某一个表面。

PickObject用户在点击鼠标时，将立方体重绘为红色，然后读取鼠标点击位置的像素颜色，根据其是红色或是黑色来判断点击时鼠标是否在立方体上，即是否选中了立方体。而PickFace则更进一步，在用户点击鼠标时重绘立方体，并将“每个像素属于哪个面”的信息写入到颜色缓冲区的∂分量中。

#### PickFace

```js
var VSHADER_SOURCE = `
	attribute vec4 a_Position;
	attribute vec4 a_Color;
	attribute float a_Face; //表面编号，不可使用int类型
	uniform mat4 u_MvpMatrix;
	uniform int u_PickedFace;
	varying vec4 v_Color;
	void main(){
		gl_Position = u_MvpMatrix*a_Position;
		int face = int(a_Face);//转为int类型
		vec3 color = (face==u_PickedFace)?vec3(1.0):a_Color.rgb;
		if(u_PickedFace==0) {
			v_Color = vec4(color, a_Face/255.0);
		} else {
			v_Color = vec4(color, a_Color);
		}
	}
`;
gl.uniform1i(u_PickedFace, -1);
var currentAngle = 0.0;
canvas.onmousedown = function(ev) {
  var x = ev.clientX, y = ev.clientY;
  var rect = ev.target.getBoundingClientRect();
  if(rect.left<=x&&x<rect.right&&rect.top<=y&&y<rect.bottom){
    var x_in_canvas = x - rect.left,
        y_in_canvas = rect.bottom - y;
    var face = checkFace(...);
    gl.unifrom1i(u_PickedFace, face);                     
    draw(gl, n, currentAngle, viewProjMatrix, u_MvpMatrix);
  }
}
var faces = new Uint8Array([
  1, 1, 1, 1,
  2, 2, 2, 2,
  ...
  6, 6, 6, 6,
]);

```







### 参考资料

[颜色缓冲区、深度缓冲区、模板缓冲区和累积缓冲区](http://blog.sina.com.cn/s/blog_78c5ff950102vlf1.html)

[requestAnimationFrame](http://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/)



