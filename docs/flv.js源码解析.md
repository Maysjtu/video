## flv.js源码解析

### 1. 背景

flv.js项目的代码有一定规模，如果要研究的话，我建议从demux入手，理解了demux就掌握了媒体数据处理的关键步骤，前面的媒体数据下载和后面的媒体数据播放就变得容易理解了。

**先普及点背景知识，为什么HTML5视频播放要用 flv 格式？**

因为Flash。我标题图片用的是“flash RIP”，flash快死了，但是它的影响力还在，flash技术是过去10多年的互联网视频基础技术，大量相关基础设施都是围绕Flash构建的，比如 CDN 普遍支持的 RTMP 和 flv over http协议。做互联网直播的公司为了能兼容Web上的Flash播放，不约而同地选择了flv的媒体格式。在从Flash到 HTML5过渡的时期，如果HTML5能支持flash的协议是再好不过了，可以平滑过渡，然而HTML5并不原生支持flash协议。flv.js这个项目解决了HTML5支持flash协议的问题，这就是flv.js应运而生短期爆红的历史背景。

### 2. 相关属性

#### 2.1 二进制数组

ArrayBuffer对象、TypedArray对象、DataView对象是JavaScript操作二进制数据的一个接口。

二进制数组由三个对象组成。

**（1）ArrayBuffer对象**：代表内存之中的一段二进制数据，可以通过“视图”进行操作。“视图”部署了数组接口，这意味着，可以用数组的方法操作内存。

**（2) TypedArray对象**：用来生成内存的视图，通过9个构造函数，可以生成9种数据格式的视图，比如`Uint8Array`（无符号8位整数）数组视图, `Int16Array`（16位整数）数组视图, `Float32Array`（32位浮点数）数组视图等等。

**（3）DataView对象**：用来生成内存的视图，可以自定义格式和字节序，比如第一个字节是Uint8（无符号8位整数）、第二个字节是Int16（16位整数）、第三个字节是Float32（32位浮点数）等等。

简单说，ArrayBuffer对象代表原始的二进制数据，TypedArray对象代表确定类型的二进制数据，DataView对象代表不确定类型的二进制数据。它们支持的数据类型一共有9种（DataView对象支持除`Uint8C`以外的其他8种）。

| 数据类型    | 字节长度 | 含义               | 对应的C语言类型       |
| ------- | ---- | ---------------- | -------------- |
| Int8    | 1    | 8位带符号整数          | signed char    |
| Uint8   | 1    | 8位不带符号整数         | unsigned char  |
| Uint8C  | 1    | 8位不带符号整数（自动过滤溢出） | unsigned char  |
| Int16   | 2    | 16位带符号整数         | short          |
| Uint16  | 2    | 16位不带符号整数        | unsigned short |
| Int32   | 4    | 32位带符号整数         | int            |
| Uint32  | 4    | 32位不带符号的整数       | unsigned int   |
| Float32 | 4    | 32位浮点数           | float          |
| Float64 | 8    | 64位浮点数           | double         |

#### 2.2 DataView

**DataView**视图是一个可以从[`ArrayBuffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)对象中读写多种数值类型的底层接口，在读写时不用考虑平台字节序问题。

**Syntax**

```javascript
new DataView(buffer [, byteOffset [, byteLength]]);
```

**Parameters**

- `buffer`

  一个 [`ArrayBuffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) 或 [`SharedArrayBuffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer) ** 对象，DataView 对象的数据源。

- `byteOffset` 可选

  此 DataView 对象的第一个字节在 buffer中 的偏移。如果不指定则默认从第一个字节开始。

- `byteLength` 可选

  此 DataView 对象的字节长度。如果不指定则默认与 buffer 的长度相同。

**Return value**

A new `DataView` object representing the specified data buffer.

```javascript
var littleEndian = (function() {
  var buffer = new ArrayBuffer(2);
  new DataView(buffer).setInt16(0, 256, true /* littleEndian */);
  // Int16Array uses the platform's endianness.
  return new Int16Array(buffer)[0] === 256;
})();
console.log(littleEndian); // true or false
```

**Attributes**

[`DataView.prototype.buffer`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView/buffer) 只读

[`DataView.prototype.byteLength`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView/byteLength) 只读

[`DataView.prototype.byteOffset`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/DataView/byteOffset) 只读

**Methods**

Read

- DataView.prototype.getInt8()

  从DataView起始位置以byte为计数的指定偏移量(byteOffset)处获取一个8-bit数(一个字节).

- DataView.prototype.getUint8()

  从DataView起始位置以byte为计数的指定偏移量(byteOffset)处获取一个8-bit数(无符号字节).

- DataView.prototype.getInt16()

- DataView.prototype.getUint16()

- DataView.prototype.getInt32()

- DataView.prototype.getUint32()

- DataView.prototype.getFloat32()

- DataView.prototype.getFloat64()

Write

- DataView.prototype.setInt8()

  从DataView起始位置以byte为计数的指定偏移量(byteOffset)处储存一个8-bit数(一个字节).

- DataView.prototype.setUint8()

- DataView.prototype.setInt16()

- DataView.prototype.setUint16()

- DataView.prototype.setInt32()

- DataView.prototype.setUint32()

- DataView.prototype.setFloat32()

- DataView.prototype.setFloat64()









### 来源

[FLV.JS 代码解读--demux部分](https://zhuanlan.zhihu.com/p/24429290)

[Dataview](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)

[二进制数组](http://javascript.ruanyifeng.com/stdlib/arraybuffer.html)