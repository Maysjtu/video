## GLSL基础

#### 一、OpenGL ES

​	**OpenGL ES**（OpenGL for Embedded Systems）是 [OpenGL](https://zh.wikipedia.org/wiki/OpenGL) [三维图形](https://zh.wikipedia.org/wiki/%E4%B8%89%E7%B6%AD%E5%9C%96%E5%BD%A2)API的子集，针对手机、PDA和游戏主机等[嵌入式设备](https://zh.wikipedia.org/wiki/%E5%B5%8C%E5%85%A5%E5%BC%8F%E8%AE%BE%E5%A4%87)而设计。该API由Khronos集团定义推广，Khronos是一个图形软硬件行业协会，该协会主要关注图形和多媒体方面的开放标准。

#### 二、OpenGL ES Shading Language

​	OpenGL ES着色器语言实际上是两种紧密相关的语言。它们被用于OpenGL ES 处理进程中创建着色器。

- Vertex Processor

  The vertex processor is a programmable unit that operates on incoming vertices and their associated data.Source code that is compiled and run on this processor forms a vertex shader.
  顶点着色器在同一时间仅处理一个顶点。顶点着色器不能代替需要一次知道几个顶点的图形操作。

- Fragment Processor

  The fragment processor is a programmable unit that operates on fragment values and their associateddata. Source code that is compiled and run on this processor forms a fragment shader.

  片元着色器不能改变片元的位置。也不允许操作旁边的片元。片元着色器计算出来的值最终被用于更新frame-buffer memory或者texture memory。

#### 三、基础

- 字符集

  是ASCII的子集。包括以下字符：

  a-z	A-Z	_	0-9	.+-*/%<>[](){}^|&~=~!:;,?#	white space

- A single vertex shader and a single fragment shader are linked together to form a single program.

- 着色器语言是如何编译的

  顶点和片段处理器的编译单元在编译的最后阶段被链接在一起之前被分开处理。

  1.源字符串连接在一起。
  2.源串被转换成一系列预处理标记。 这些令牌包括预处理号码，标识符和预处理操作。 每个注释都被一个空格替换。 换行符被保留。
  3.预处理器运行。 指令被执行，宏扩展被执行。
  4.预处理令牌被转换成令牌。
  5.空白和换行符被丢弃。
  6.根据GLSL ES语法分析语法。
  7.根据语言的语义规则检查结果。
  8.顶点和片段着色器链接在一起。 任何在顶点和片段着色器中都没有使用的varying可能会被丢弃。
  9.生成二进制文件。

- 预处理器指令

  #

  \#define

  \#undef

  \#if

  \#ifdef

  \#ifndef

  \#else

  \#elif

  \#endif

  \#error

  \#pragma

  \#extension

  \#version

  \#line

  define

  以下预定义的宏是可用的: 

  \_\_LINE\_\_将替换成一个十进制整数常量，比当前源字符串中的前一个换行符的数量多一个。

   \_\_FILE\_\_将替换成一个十进制整数常量，表示当前正在处理哪个源字符串编号。

  \_\_VERSION\_\_ 将会替换成一个反映OpenGL ES着色语言版本号的十进制整数。

  GL_ES将被定义并设置为1.对于非ES OpenGL着色语言来说，这不是真的，所以它可以用来进行编译时测试，以查看着色器是否在ES系统上运行。

  在预处理器中应用操作符的语义与C ++预处理器中的标准相匹配，但有以下例外：
  •当且仅当第一个操作数的计算结果为非零时，逻辑和（'&&'）操作中的第二个操作数才会被计算。
  •当且仅当第一个操作数的计算结果为0时，逻辑或（'||'）操作中的第二个操作数才会被计算。

  \#error 将导致implementation将诊断消息放入着色器对象的信息日志中（请参阅平台文档中的API以了解如何访问着色器对象的信息日志）。

  ```
  #pragma optimize(on)
  #pragma optimize(off)
  #pragma debug(on)
  #pragma debug(off)
  ```


-  tokens

  关键词
  标识符

  整型常量

  浮点型常量

  运算符

- Keywords

  attribute const uniform varying
  break continue do for while
  if else
  in out inout

  float int void bool true false
  lowp mediump highp precision invariant
  discard return
  mat2 mat3 mat4
  vec2 vec3 vec4 ivec2 ivec3 ivec4 bvec2 bvec3 bvec4
  sampler2D samplerCube
  struct

  ​

  The following are the keywords reserved for future use. Using them will result in an error:

  asm
  class union enum typedef template this packed
  goto switch default
  inline noinline volatile public static extern external interface flat
  long short double half fixed unsigned superp
  input output
  hvec2 hvec3 hvec4 dvec2 dvec3 dvec4 fvec2 fvec3 fvec4
  sampler1D sampler3D
  sampler1DShadow sampler2DShadow
  sampler2DRect sampler3DRect sampler2DRectShadow
  sizeof cast
  namespace using


- Identifiers

  nondigit: one of
  _ a b c d e f g h i j k l mn o p q r s t u v w x y z
  A B C D EF GH I J K L M N O P QR STU V W X Y Z

  digit: one of
  0 12 3 45 67 8 9



#### 四、Variables and Types

​	All variables and functions must be declared before being used. Variable and function names are identifiers.

​	The OpenGL ES Shading Language supports the following basic data types.

| Type        | Meaning                                  |
| ----------- | ---------------------------------------- |
| void        | for functions that do not return a value or for an empty parameter list |
| bool        | a conditional type, taking on values of true or false |
| int         | a signed integer                         |
| float       | a single floating-point scalar           |
| vec2        | a two component floating-point vector    |
| vec3        | a three component floating-point vector  |
| vec4        | a four component floating-point vector   |
| bvec2       | a two component Boolean vector           |
| bvec3       | a three component Boolean vector         |
| bvec4       | a four component Boolean vector          |
| ivec2       | a two component integer vector           |
| ivec3       | a three component integer vector         |
| ivec4       | a four component integer vector          |
| mat2        | a 2×2 floating-point matrix              |
| mat3        | a 3×3 floating-point matrix              |
| mat4        | a 4×4 floating-point matrix              |
| sampler2D   | a handle for accessing a 2D texture      |
| samplerCube | a handle for accessing a cube mapped texture |

- Structures

  ```
  struct light {
  	float intensity;
      vec3 position;
  } lightVar;
  light lightVar2;
  ```


- Arrays

  ```
  float frequencies[3];
  uniform vec4 lightPosition[4];
  const int numLights = 2;
  light lights[numLights];
  ```

- Scoping

  The scope of a declaration determines where the declaration is visible. GLSL ES uses a system ofstatically nested scopes. This allows names to be redefined within a shader.

   ···

- Storage Qualifiers 存储限定符

  Variable declarations may have a storage qualifier, specified in front of the type. These are summarized as

  | Qualifier         | Meaning                                  |
  | ----------------- | ---------------------------------------- |
  | < none: default > | local read/write memory, or an input parameter to a function |
  | const             | a compile-time constant, or a function parameter that is read-only |
  | attribute         | linkage between a vertex shader and OpenGL ES for per-vertex data<br /> 顶点着色器和OpenGL ES之间为每个顶点数据进行链接 |
  | uniform           | value does not change across the primitive being processed, uniformsform the linkage between a shader, OpenGL ES, and the application																		<br />值在被处理的单元上不会改变 |
  | varying           | linkage between a vertex shader and a fragment shader for interpolateddata	<br />顶点着色器和片段着色器之间的内插数据链接 |

  - Attribute

    The attribute qualifier is used to declare variables that are passed to a vertex shader from OpenGL ES on a per-vertex basis.

    仅用于顶点着色器中，并且是read-only的。

    attribute不能被声明为数组或结构。

    Attribute variables are required to have global scope.

  - Uniform

    The uniform qualifier is used to declare global variables whose values are the same across the entire primitive being processed. All uniform variables are read-only and are initialized either directly by an application via API commands, or indirectly by OpenGL ES.

    uniform的使用数量是有限制的。

  - Varying

    Varying variables provide the interface between the vertex shader, the fragment shader, and the fixed functionality between them.

    顶点着色器会计算每个顶点的值（如颜色，纹理坐标等），并将它们写入varying varible里面。

    如果是单次采样，则内插值为片段中心。 如果是多重采样，则插值可以是像素内的任何位置，包括片段中心或其中一个片段样本。

    A fragment shader can not write to a varying variable.

- Precision and Precision Qualifiers 精度和精度限定符

  | Qualifier | Meaning                                  |
  | --------- | ---------------------------------------- |
  | highp     | Satisfies the minimum requirements for the vertex language describedabove. Optional in the fragment language. |
  | mediump   | Satisfies the minimum requirements above for the fragment language. Itsrange and precision has to be greater than or the same as provided by lowpand less than or the same as provided by highp. |
  | lowp      | Range and precision that can be less than mediump, but still intended torepresent all color values for any color channel.<br />能够代表任何颜色通道的所有颜色值 |

  The required minimum ranges and precisions for precision qualifiers are

  | Qualifier | Floating PointRange | Floating PointMagnitude Range | Floating PointPrecision | IntegerRange   |
  | --------- | ------------------- | ----------------------------- | ----------------------- | -------------- |
  | highp     | (−2^62 , 2^62)      | (2^−62 ,2^62)                 | Relative:2−16           | (−2^16 , 2^16) |
  | mediump   | (−2^14 , 2^14)      | (2^−14 ,2^14)                 | Relative:2−10           | (−2^10 , 2^10) |
  | lowp      | (−2,2)              | (2^−8 ,2)                     | Absolute:2−8            | (−2^8 , 2^8)   |

  ​