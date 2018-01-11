## H.264结构

H.264原始码流（又称为“裸流”）是由一个一个的NALU组成的。他们的结构如下图所示。

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/21182919.jpg)

其中每个NALU之间通过**startcode**（起始码）进行分隔，起始码分成两种：0x000001（3Byte）或者0x00000001（4Byte）。如果NALU对应的Slice为一帧的开始就用0x00000001，否则就用0x000001。



NALU的功能分为两层:视频编码层(VCL, Video Coding Layer)和网络提取层(NAL, Network Abstraction Layer)。

- VCL 数据即编码处理的输出，它表示被压缩编码后的视频数据 序列。
- 在 VCL 数据传输或存储之前，这些编码的 VCL 数据，先被映射或封装进 NAL 单元(以下简称 NALU，Nal Unit) 中。
- 每个 NALU 包括一个原始字节序列负荷(RBSP, Raw Byte Sequence Payload)、一组 对应于视频编码的 NALU 头部信息。
- RBSP 的基本结构是:在原始编码数据的后面填加了结尾 比特。一个 bit“1”若干比特“0”，以便字节对齐。

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/50637958.jpg)

**一帧图片跟 NALU 的关联 ：**

一帧图片经过 H.264 编码器之后，就被编码为一个或多个片（slice），而装载着这些片（slice）的载体，就是 NALU 了，我们可以来看看 NALU 跟片的关系（slice）。

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/54495273.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/89505768.jpg)

小伙伴们要明白，片（slice）的概念不同与帧（frame），帧（frame）是用作描述一张图片的，一帧（frame）对应一张图片，而片（slice），是 H.264 中提出的新概念，是通过编码图片后切分通过高效的方式整合出来的概念，一张图片至少有一个或多个片（slice）。

上图中可以看出，片（slice）都是又 NALU 装载并进行网络传输的，但是这并不代表 NALU 内就一定是切片，这是充分不必要条件，因为 NALU 还有可能装载着其他用作描述视频的信息。

**什么是切片（slice）?**

> 片的主要作用是用作宏块（Macroblock）的载体（ps：下面会介绍到宏块的概念）。片之所以被创造出来，主要目的是为限制误码的扩散和传输。
> 如何限制误码的扩散和传输？
> 每个片（slice）都应该是互相独立被传输的，某片的预测（片（slice）内预测和片（slice）间预测）不能以其它片中的宏块（Macroblock）为参考图像。

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/33512215.jpg)

我们可以理解为一 张/帧 图片可以包含一个或多个分片(Slice)，而每一个分片(Slice)包含整数个宏块(Macroblock)，即每片（slice）至少一个 宏块(Macroblock)，最多时每片包 整个图像的宏块。

上图结构中，我们不难看出，每个分片也包含着头和数据两部分：
1、分片头中包含着分片类型、分片中的宏块类型、分片帧的数量、分片属于那个图像以及对应的帧的设置和参数等信息。
2、分片数据中则是宏块，这里就是我们要找的存储像素数据的地方。

**什么是宏块？**

> 宏块是视频信息的主要承载者，因为它包含着每一个像素的亮度和色度信息。视频解码最主要的工作则是提供高效的方式从码流中获得宏块中的像素阵列。
> 组成部分：一个宏块由一个16×16亮度像素和附加的一个8×8 Cb和一个 8×8 Cr 彩色像素块组成。每个图象中，若干宏块被排列成片的形式。

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/63491172.jpg)

从上图中，可以看到，宏块中包含了宏块类型、预测类型、Coded Block Pattern、Quantization Parameter、像素的亮度和色度数据集等等信息。

**切片（slice）类型跟宏块类型的关系**

对于切片（slice）来讲，分为以下几种类型：

> 0 P-slice. Consists of P-macroblocks (each macro block is predicted using one reference frame) and / or I-macroblocks.
> 1 B-slice. Consists of B-macroblocks (each macroblock is predicted using one or two reference frames) and / or I-macroblocks.
> 2 I-slice. Contains only I-macroblocks. Each macroblock is predicted from previously coded blocks of the same slice.
> 3 SP-slice. Consists of P and / or I-macroblocks and lets you switch between encoded streams.
> 4 SI-slice. It consists of a special type of SI-macroblocks and lets you switch between encoded streams.

I片：只包 I宏块，I 宏块利用从当前片中已解码的像素作为参考进行帧内预测(不能取其它片中的已解码像素作为参考进行帧内预测)。

P片：可包 P和I宏块，P 宏块利用前面已编码图象作为参考图象进行帧内预测，一个帧内编码的宏块可进一步作宏块的分割:即 16×16、16×8、8×16 或 8×8 亮度像素块(以及附带的彩色像素);如果选了 8×8 的子宏块，则可再分成各种子宏块的分割，其尺寸为 8×8、8×4、4×8 或 4×4 亮度像素块(以及附带的彩色像素)。

B片：可包 B和I宏块，B 宏块则利用双向的参考图象(当前和 来的已编码图象帧)进行帧内预测。

SP片(切换P)：用于不同编码流之间的切换，包含 P 和/或 I 宏块

SI片：扩展档次中必须具有的切换，它包 了一种特殊类型的编码宏块，叫做 SI 宏块，SI 也是扩展档次中的必备功能。

**整体结构**
通过剖析了这么多个小零件，是时候个大家一个世界地图了，
那么我们的 NALU 整体结构可以呼之欲出了，以下就引用 H.264 文档当中的一幅图了

[![img](http://upload-images.jianshu.io/upload_images/1073278-8e2d36c5cd06547a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://upload-images.jianshu.io/upload_images/1073278-8e2d36c5cd06547a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

------

其实 H.264 的码流结构并没有大家想的那么复杂，编码后视频的每一组图像（GOP，图像组）都给予了传输中的序列（PPS）和本身这个帧的图像参数（SPS），所以，我们的整体结构，应该如此：

[![img](http://upload-images.jianshu.io/upload_images/1073278-8d490ab2e0b0f79f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://upload-images.jianshu.io/upload_images/1073278-8d490ab2e0b0f79f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> GOP （图像组）主要用作形容一个 i 帧 到下一个 i 帧之间的间隔了多少个帧，增大图片组能有效的减少编码后的视频体积，但是也会降低视频质量，至于怎么取舍，得看需求了。

[![img](http://upload-images.jianshu.io/upload_images/1073278-48daf0a835c373e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)](http://upload-images.jianshu.io/upload_images/1073278-48daf0a835c373e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)





#### 1.1 NAL Header

由三部分组成，forbidden_bit(1bit)，nal_reference_bit(2bits)（优先级），nal_unit_type(5bits)（类型）。

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/3251465.jpg)

举例来说：

```
00 00 00 01 06:  SEI信息   
00 00 00 01 67:  0x67&0x1f = 0x07 :SPS
00 00 00 01 68:  0x68&0x1f = 0x08 :PPS
00 00 00 01 65:  0x65&0x1f = 0x05: IDR Slice
```

#### 1.2 RBSP

RBSP序列举例

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/36206250.jpg)

RBSP描述

![](http://p1yseh5av.bkt.clouddn.com/18-1-10/5283266.jpg)

**SODB与RBSP**
SODB 数据比特串 -> 是编码后的原始数据.
RBSP 原始字节序列载荷 -> 在原始编码数据的后面添加了 结尾比特。一个 bit“1”若干比特“0”，以便字节对齐。
![](http://www.iosxxx.com/images/h264base/12.png)





### 参考

[从零了解H.264结构](http://www.iosxxx.com/blog/2017-08-09-%E4%BB%8E%E9%9B%B6%E4%BA%86%E8%A7%A3H264%E7%BB%93%E6%9E%84.html)

[H.264视频码流解析](http://blog.csdn.net/leixiaohua1020/article/details/50534369)