## FMP4详解

MP4文件的基本单元是“box”，这些box既可以包括data，也可以包括metadata。MP4文件标准允许多种方式来组织data box和metadata box。将metadata放在data之前，客户端应用程序可以在播放video/audio之前获得更多的关于video/audio的信息，因此这种方式在大多数的多媒体应用场景都是比较有用的。但是，在流媒体应用场景，不可能预先保存关于整个流数据的metadata信息，因为不可能提前完全知道。而且，预先保存的metadata越少就意味着越少的开销，因此也可以缩短启动时间。

 MP4 ISO Base Media文件格式标准允许以fragmented方式组织box，这也就意味着MP4文件可以组织成这样的结构，由一系列的短的metadata/data box对组成，而不是一个长的metadata/data对。Fragmented MP4文件结构如图1所示，图中只给出了两个fragments。

 ![](http://p1yseh5av.bkt.clouddn.com/18-6-5/36198370.jpg)

在Fragmented MP4文件中都有三个非常关键的boxes：‘moov’、‘moof’和‘mdat’。

（1）‘moov’（movie metadata box）

和普通MP4文件的‘moov’一样，包含了file-level的metadata信息，用来描述file。

（2）‘mdat’（media data box）

和普通MP4文件的‘mdat’一样，用于存放媒体数据，不同的是普通MP4文件只有一个‘mdat’box，而Fragmented MP4文件中，每个fragment都会有一个‘mdat’类型的box。

（3）‘moof’（movie fragment box）

该类型的box存放的是fragment-level的metadata信息，用于描述所在的fragment。该类型的box在普通的MP4文件中是不存在的，而在Fragmented MP4文件中，每个fragment都会有一个‘moof’类型的box。

一个‘moof’和一个‘mdat’组成Fragmented MP4文件的一个fragment，这个fragment包含一个video track或audio track，并且包含足够的metadata以保证这部分数据可以单独解码。Fragment的结构如图2所示。

![](http://p1yseh5av.bkt.clouddn.com/18-6-5/8921427.jpg)

上面两张图片来自http://alexzambelli.com/blog/2009/02/10/smooth-streaming-architecture

图3是用MP4Info工具查看的一个Fragmented MP4文件的结构，该文件是通过MP4Box工具，通过下面的一个命令转化出来的一个文件。图4是与之对应的普通的MP4文件结构。

\#MP4Box -dash 500000 -frag 50000 -rap file_name.mp4

由于设置的时间参数较大，因此得到的Fragmented MP4文件中仅仅包含四个fragments（每个fragment由一对‘moof’和‘mdat’组成）。

![img](https://img-blog.csdn.net/20130710140702015?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbHl1YW4xMzE0/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

图3 MP4Info显示的Fragmented MP4文件结构

![img](https://img-blog.csdn.net/20130710140708171?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvbHl1YW4xMzE0/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/Center)

图4 MP4Info显示的普通MP4文件结构



### 来源

[Fragmented MP4文件格式](https://blog.csdn.net/yu_yuan_1314/article/details/9289827)

[Smooth Streaming Architecture](http://alexzambelli.com/blog/2009/02/10/smooth-streaming-architecture/)