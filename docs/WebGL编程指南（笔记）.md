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

WebGL只能绘制三种图形：点、线段和三角形。但是，正如本章开头所说到的，从球体到立方体，再到游戏中的三维角色，都可以又小的三角形组成。实际上，你可以使用以上这些最基本的图形来绘制出任何东西。

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



















### 参考资料

[颜色缓冲区、深度缓冲区、模板缓冲区和累积缓冲区](http://blog.sina.com.cn/s/blog_78c5ff950102vlf1.html)

[requestAnimationFrame](http://www.zhangxinxu.com/wordpress/2013/09/css3-animation-requestanimationframe-tween-%E5%8A%A8%E7%94%BB%E7%AE%97%E6%B3%95/)



