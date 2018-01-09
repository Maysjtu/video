## RGB、YUV概念

### 1. 概念

常见的色彩格式主要分为两类，一类是RGBA系列，一类是YUV系列。

#### 1.1 RGBA系列

​	首先就是rgba系列的格式，RGBA色彩主要用于色彩的显示和描述。这些格式都比较好理解了。常见的有RGBA/ARGB/BGRA/ABGR/RGB/BGR。这些格式都比较好理解了。R、G、B、A分别表示红绿蓝及透明通道。 
​	以RGBA为例，就是4个字节表示一个颜色值，排列方式就是RGBARGBARGBA这样排列。而RGB，就是三个字节表示一个颜色值，没有透明通道，排列方式就是RGBRGBRGB。在通常的视频中，也是没有透明通道的（也有例外，比如MOV格式，是可以包含透明通道的）。所以当RGBA编码为视频色彩时，A是会被丢掉的。 
​	当然，上面说的，是将每个色彩都用一个字节来表示的情况。RGBA也有RGBA_8888，RGBA_4444,RGB565等等众多格式，也就是并不是每个颜色都用一个字节来表示。以RGB565为例，是用两个字节来表示RGB三个色彩，R占5位，G占6位，B占5位。RGB565与RGB24相比，色彩上稍有损失，一般情况下，不细致对比，不容易发现这个损失，但是内存上会节约1/3的大小。

​	目前的显示器大都是采用了RGB颜色标准，在显示器上，是通过[电子枪](https://link.jianshu.com/?t=http://baike.baidu.com/view/54627.htm)打在屏幕的红、绿、蓝三色发光极上来产生色彩的。

​	![](http://p1yseh5av.bkt.clouddn.com/18-1-8/62004899.jpg)

> **使用8位的二进制**， 可以表示 2^8 （2的8次方） ， 也就是256种色彩。
>
> **使用16位的二进制**，可以表示 2^16 （2 的16次方），也就是65536种色彩。
>
> **使用24位的二进制**，可以表示 2^24 （2的24次方） ，也就是16,777,216种色彩。

>一般称24bit以上的色彩为真彩色，当然还有采用30bit、36bit、42bit的。使用的色彩代码越长，同样像素的文件的文件大小也就相应的成幂次级增长。使用超过16位以上的色彩文件在普通的显示器，尤其是液晶显示器上看不出任何区别，原因是液晶显示器本身不能显示出那么多的色彩。但是对于彩色印刷就非常有用，因为油墨的点非常的细，同时由于印刷尺幅的放大原因， 更大的文件可以在印刷的时候呈现出更细腻的层次和细节。



#### 1.2 YUV系列

Y：明亮度	U：色度		V：浓度

​	YUV主要用于**优化彩色视频信号的传输**，相比RGBA色彩来说，YUV格式占用**更少的内存**。如果只有Y分量，没有UV分量，那么得到的就是黑白灰度图像。 

​	在技术文档里，YUV经常有另外的名字, YCbCr ,YCbCr模型来源于YUV模型，算是YUV的压缩版本，不同之处在于Y'CbCr用于数字图像领域，YUV用于模拟信号领域，MPEG、DVD、摄像机中常说的YUV其实是Y'CbCr。

​	Y′UV is not an absolute color space. It is a way of encoding RGB information, and the actual color displayed depends on the actual RGB colorants used to display the signal.

YUV是对RGB信息进行的压缩：原因是人眼对亮度的敏感性更高。

​	![](http://p1yseh5av.bkt.clouddn.com/18-1-8/67215805.jpg)

​	Y'代表明亮度(luma; brightness)而U与V存储色度(色讯; chrominance; color)部分; 亮度(luminance)记作Y，而Y'的prime符号记作伽玛校正。

​	YUV Formats分成两个格式：

- 紧缩格式（packed formats）：将Y、U、V值存储成Macro Pixels数组，和[RGB](https://zh.wikipedia.org/wiki/RGB)的存放方式类似。
- 平面格式（planar formats）：将Y、U、V的三个分量分别存放在不同的矩阵中。

​        紧缩格式（packed format）中的YUV是混合在一起的，对于YUV4:4:4格式而言，用紧缩格式很合适的，因此就有了UYVY、YUYV等。平面格式（planar formats）是指每Y分量，U分量和V分量都是以独立的平面组织的，也就是说所有的U分量必须在Y分量后面，而V分量在所有的U分量后面，此一格式适用于采样（subsample）。平面格式（planar format）有I420（4:2:0）、YV12、IYUV等。

![](http://p1yseh5av.bkt.clouddn.com/18-1-8/49792229.jpg)

​	YCbCr 有许多取样格式, 如4∶4∶4 , 4∶2∶2 , 4∶1∶1 和4∶2∶0：

![](http://p1yseh5av.bkt.clouddn.com/18-1-8/68118205.jpg)



![](http://p1yseh5av.bkt.clouddn.com/18-1-8/50048308.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-8/80822348.jpg)

![](http://p1yseh5av.bkt.clouddn.com/18-1-8/71839597.jpg)





**历史**

​	Y'UV的发明是由于[彩色电视](https://zh.wikipedia.org/wiki/%E5%BD%A9%E8%89%B2%E9%9B%BB%E8%A6%96)与[黑白电视](https://zh.wikipedia.org/wiki/%E9%BB%91%E7%99%BD%E9%9B%BB%E8%A6%96)的过渡时期[[1\]](https://zh.wikipedia.org/wiki/YUV#cite_note-1)。黑白视频只有Y（Luma，Luminance）视频，也就是灰阶值。到了彩色电视规格的制定，是以YUV/[YIQ](https://zh.wikipedia.org/wiki/YIQ)的格式来处理彩色电视图像，把UV视作表示彩度的C（Chrominance或Chroma），如果忽略C信号，那么剩下的Y（Luma）信号就跟之前的黑白电视频号相同，这样一来便解决彩色电视机与黑白电视机的兼容问题。Y'UV最大的优点在于只需占用极少的带宽。

​	因为UV分别代表不同颜色信号，所以直接使用R与B信号表示色度的UV。 也就是说UV信号告诉了电视要偏移某象素的的颜色，而不改变其亮度。 或者UV信号告诉了显示器使得某个颜色亮度依某个基准偏移。 UV的值越高，代表该像素会有更饱和的颜色。

​	彩色图像记录的格式，常见的有[RGB](https://zh.wikipedia.org/wiki/RGB)、YUV、[CMYK](https://zh.wikipedia.org/wiki/CMYK)等。彩色电视最早的构想是使用RGB三原色来同时传输。这种设计方式是原来黑白带宽的3倍，在当时并不是很好的设计。RGB诉求于人眼对色彩的感应，YUV则着重于视觉对于亮度的敏感程度，Y代表的是亮度，UV代表的是彩度（因此黑白电影可省略UV，相近于RGB），分别用Cr和Cb来表示，因此YUV的记录通常以Y:UV的格式呈现。

### 1.3 比较

​	一般来说，直接采集到的视频数据是RGB24的格式，RGB24一帧的大小size＝width×heigth×3 Byte，RGB32的size＝width×heigth×4，如果是I420（即YUV标准格式4：2：0）的数据量是 size＝width×heigth×1.5 Byte。

​	RGB files are typically encoded in 8, 12, 16 or 24 bits per pixel. In these examples, we will assume 24 bits per pixel, which is written as [RGB888](https://en.wikipedia.org/wiki/RGB888). The standard byte format is:

```
r0, g0, b0, r1, g1, b1, ...
```

​	Y′UV files can be encoded in 12, 16 or 24 bits per pixel. The common formats are Y′UV444 (or YUV444), YUV411, Y′UV422 (or YUV422) and Y′UV420p (or YUV420). The apostrophe after the Y is often omitted, as is the "p" after YUV420p. In terms of actual file formats, YUV420 is the most common, as the data is more easily compressed, and the file extension is usually ".YUV".

To convert from RGB to YUV or back, it is simplest to use RGB888 and YUV444. For YUV411, YUV422 and YUV420, the bytes need to be converted to YUV444 first.

```
YUV444    3 bytes per pixel     (12 bytes per 4 pixels)
YUV422    4 bytes per 2 pixels  ( 8 bytes per 4 pixels)
YUV411    6 bytes per 4 pixels
YUV420p   6 bytes per 4 pixels, reordered
```

**Y′UV444 to RGB888 conversion**

**Y′UV420p (and Y′V12 or YV12) to RGB888 conversion**

### PSNR

PSNR是最基本的视频质量评价方法。

对于8bit量化的像素数据来说，PSNR的计算公式如下所示。

![img](http://img.blog.csdn.net/20160117233527240)

上述公式中mse的计算公式如下所示。

![img](http://img.blog.csdn.net/20160117233543104)

其中M，N分别为图像的宽高，xij和yij分别为两张图像的每一个像素值。PSNR通常用于质量评价，就是计算受损图像与原始图像之间的差别，以此来评价受损图像的质量。本程序输入的两张图像的对比图如下图所示。其中左边的图像为原始图像，右边的图像为受损图像。

![img](http://img.blog.csdn.net/20160117233618041)

经过程序计算后得到的PSNR取值为26.693。PSNR取值通常情况下都在20-50的范围内，取值越高，代表两张图像越接近，反映出受损图像质量越好。







### 参考

[RGBA、YUV色彩格式及libyuv的使用](http://blog.csdn.net/junzia/article/details/76315120)

[YUV-wikipedia](https://en.wikipedia.org/wiki/YUV)

[视音频数据处理入门：RGB、YUV像素数据处理](http://blog.csdn.net/leixiaohua1020/article/details/50534150)

[视频、音频 学习知识整理](https://www.jianshu.com/p/614b3e6e641a?utm_campaign=maleskine&utm_content=note&utm_medium=seo_notes&utm_source=recommendation)