# hls之m3u8、ts详解

​	HLS，Http Live Streaming 是由Apple公司定义的用于实时流传输的协议，HLS基于HTTP协议实现，传输内容包括两部分，一是M3U8描述文件，二是TS媒体文件。

### 1. 原理

将视频或流切分成小片（TS）， 并建立索引（M3U8）.

支持视频流：H.264； 音频流：AAC

### 2. M3U8文件

M3U8文件在很多地方也叫做Playlist file。

简单的例子：

![](http://p1yseh5av.bkt.clouddn.com/18-1-3/27046732.jpg)

\#EXT-X-ENDLIST (VOD含EXT-X-ENDLIST,live stream则没有)

#### 2.1 File

​	一个M3U的 Playlist 就是一个由多个独立行组成的文本文件，每行由回车/换行区分。每一行可以是一个URI  空白行或是以”#“号开头的字符串，并且空格只能存在于一行中不同元素间的分隔。   

​	一个URI 表示一个媒体段或是”variant Playlist file“（最多支持一层嵌套，即一个mm3u8文件中嵌套另一个m3u8）

​	以”#EXT“开头的表示一个”tag“，否则表示注释。

#### 2.2 Tag

**#EXTM3U**   每个M3U文件第一行必须是这个tag

**#EXTINF** 

指定每个媒体段（ts）的持续时间，这个仅对其后面的URI有效，每两个媒体段URI间被这个tag分隔开。

```
#EXTINF:<duration>,<title>

duration表示持续的时间（秒）”Durations MUST be integers if the protocol version of the Playlist file is less than 3“，否则可以是浮点数。
```

**#EXT-X-BYTERANGE**

表示媒体段是一个媒体URI资源中的一段，只对气候的media URI有效，格式如下：

```
#EXT-X-BYTERANGE:<n>[@o]

其中n表示这个区间的大小，o表示在URI中的offset。”The EXT-X-BYTERANGE tag appeared in version 4 of the protocol“。
```

**#EXT-X-TARGETDURATION**

指定最大的媒体段时间长（秒）。所以#EXTINF中指定的时间必须小于或者等于这个最大值。

这个tag在整个Playlist文件中只能出现一次。

```
#EXT-X-TARGETDURATION:<s>    

s表示最大的秒数
```

**#EXT-X-MEDIA-SEQUENCE**

每一个media URI在Playlist中只有唯一的序号，相邻之间序号+1。

```
#EXT-X-MEDIA-SEQUENCE:<number>
```

**#EXT-X-KEY**

表示怎么对media segments进行解码。其作用范围是下次该tag出现前的所有media URI，格式如下

```
#EXT-X-KEY:<attribute-list>
```

**#EXT-X-PROGRAM-DATE-TIME**

将一个绝对时间或是日期和一个媒体段中的第一个sample相关联，只对下一个meida URI有效，格式如下：

```
#EXT-X-PROGRAM-DATE-TIME:<YYYY-MM-DDThh:mm:ssZ>                      

For example: #EXT-X-PROGRAM-DATE-TIME:2010-02-19T14:54:23.031+08:00
```

**#EXT-X-ALLOW-CACHE**

是否允许做cache，这个可以在PlayList文件中任意地方出现，并且最多出现一次，作用效果是所有的媒体段。格式如下：

```
#EXT-X-ALLOW-CACHE:<YES|NO>   
```

**#EXT-X-PLAYLIST-TYPE**

提供关于PlayList的可变性的信息， 这个对整个PlayList文件有效，是可选的，格式如下：

```
#EXT-X-PLAYLIST-TYPE:<EVENT|VOD>

如果是VOD，则服务器不能改变PlayList 文件；如果是EVENT，则服务器不能改变或是删除PlayList文件中的任何部分，但是可以向该文件中增加新的一行内容。   
```

**#EXT-X-ENDLIST**

表示PlayList的末尾了，它可以在PlayList中任意位置出现，但是只能出现一个，格式如下：

         ```             
#EXT-X-ENDLIST
         ```



### 3. TS文件

 	TS：全称为MPEG2-TS。TS即"Transport Stream"的缩写。它是分包发送的，每一个包长为188字节（还有192和204个字节的包）。包的结构为，包头为4个字节（第一个字节为0x47），负载为184个字节。在TS流里可以填入很多类型的数据，如视频、音频、自定义信息等。

​	MPEG2-TS主要应用于实时传送的节目，比如实时广播的电视节目。MPEG2-TS格式的特点就是要求从视频流的任一片段开始都是可以独立解码的。简单地说，将DVD上的VOB文件的前面一截cut掉（或者是数据损坏数据）就会导致整个文件无法解码，而电视节目是任何时候打开电视机都能解码（收看）的。

ts文件为传输流文件，视频编码主要格式H.264/MPEG-4，音频为AAC/MP3。

ts文件分为三层：ts层Transport Stream、pes层Packet Elemental Stream、es层 Elementary Stream。

> ES流（Elementary Stream）：基本码流，不分段的音频、视频或其他信息的连续码流。
>
> PES流：把基本流ES分割成段，并加上相应头文件打包成形的打包基本码流。
>
> PS流（Program Stream）：节目流，将具有共同时间基准的一个或多个PES组合（复合）而成的单一数据流（用于播放或编辑系统，如m2p）。
>
> TS流（Transport Stream）：传输流，将具有共同时间基准或独立时间基准的一个或多个PES组合（复合）而成的单一数据流（用于数据传输）。

**TS流是如何产生的**

![](http://p1yseh5av.bkt.clouddn.com/18-1-3/81461487.jpg)

​	

​	从上图可以看出，视频ES和音频ES通过打包器和共同或独立的系统时间基准形成一个个PES，通过TS复用器复用形成的传输流。注意这里的TS流是位流格式（分析Packet的时候会解释），也即是说TS流是可以按位读取的。

**TS流格式**

  TS流是基于Packet的位流格式，每个包是188个字节（或204个字节，在188个字节后加上了16字节的CRC校验数据，其他格式一样）。整个TS流组成形式如下：

![](http://p1yseh5av.bkt.clouddn.com/18-1-3/40598805.jpg)

​		Packet Header（包头）信息说明

| 序号   | 含义                           |            |                             |
| ---- | ---------------------------- | ---------- | --------------------------- |
| 1    | sync_byte                    | 8bits      | 同步字节                        |
| 2    | transport_error_indicator    | 1bit       | 错误指示信息（1：该包至少有1bits传输错误）    |
| 3    | payload_unit_start_indicator | 1bit       | 负载单元开始标志（packet不满188字节时需填充） |
| 4    | transport_priority           | 1bit       | 传输优先级标志（1：优先级高）             |
| 5    | **PID**                      | **13bits** | **Packet ID号码，唯一的号码对应不同的包** |
| 6    | transport_scrambling_control | 2bits      | 加密标志（00：未加密；其他表示已加密）        |
| 7    | adaptation_field_control     | 2bits      | 附加区域控制                      |
| 8    | continuity_counter           | 4bits      | 包递增计数器                      |

PID是TS流中唯一识别标志，Packet Data是什么内容就是由PID决定的。如果一个TS流中的一个Packet的Packet Header中的PID是0x0000，那么这个Packet的Packet Data就是DVB的PAT表而非其他类型数据（如Video、Audio或其他业务信息）。下表给出了一些表的PID值，这些值是固定的，不允许用于更改。

| 表          | PID 值  |
| ---------- | ------ |
| PAT        | 0x0000 |
| CAT        | 0x0001 |
| TSDT       | 0x0002 |
| EIT,ST     | 0x0012 |
| RST,ST     | 0x0013 |
| TDT,TOT,ST | 0x0014 |

例子：

![](http://p1yseh5av.bkt.clouddn.com/18-1-3/5460035.jpg)

​	sync_byte=01000111,  就是0x47,这是DVB TS规定的同步字节,固定是0x47。

​	transport_error_indicator=0, 	表示当前包没有发生传输错误.

​	payload_unit_start_indicator=0,      含义参考ISO13818-1标准文档

​	transport_priority=0,                        表示当前包是低优先级.

​	PID=00111 11100101即0x07e5,       Video PID

​	transport_scrambling_control=00,  表示节目没有加密

​	adaptation_field_control=01           即0x01,具体含义请参考ISO13818-1

​	continuity_counte=0010                即0x02,表示当前传送的相同类型的包是第3个

**总结**

​	TS流是一种位流（当然就是数字的），它是由ES流分割成PES后复用而成的；它经过网络传输被机顶盒接收到；数字电视机顶盒接收到TS流后将解析TS流。

​        TS流是由一个个Packet（包）构成的，每个包都是由Packet Header（包头）和Packet Data（包数据）组成的。其中Packet Header指示了该Packet是什么属性的，并给出了该Packet Data的数据的唯一网络标识符PID。

### 4. 从TS流到PAT、PMT

  说完了TS流的基本概念，就该开始对TS流进行更深入的研究了。首先需要想一想：TS流的本质是什么？它的确是一段码流，并且是一段由数据包（Packet）组成的码流。那么这些数据包究竟是怎样的呢？它和我们收看的电视节目之间又有什么区别？这些都是这部分需要了解的内容。

​        在上一节中，我们可以看到**PID**这个被标红的字段频繁地出现。PID是当前TS流的Packet区别于其他Packet类型的唯一识别符，通过读取每个包的Packet Header，我们可以知道这个Packet的数据属于何种类型。上一节列出了几项固定的PID值，它们用于识别存储了特殊信息的Packet。下面要谈的PAT表的PID值就是固定的0x0000。 



### 来源

1. [TS流PAT/PMT详解](http://www.cnblogs.com/shakin/p/3714848.html)
2. [HLS M3U8详解](http://blog.csdn.net/matrix_laboratory/article/details/18597617)
3. [hls之m3u8、ts、h264、AAC流格式详解](http://ju.outofmemory.cn/entry/276905)

