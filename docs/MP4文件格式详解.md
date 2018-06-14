## MP4文件格式详解

### 一、基本概念

1. 文件，由许多Box和FullBox组成。
2. Box，每个Box由Header和Data组成。
3. FullBox，是Box的扩展，Box结构的基础上在Header中增加8bits version和24bits flags。
4. Header，包含了整个Box的长度size和类型type。当size==0时，代表这是文件中最后一个Box；当size==1时，意味着Box长度需要更多bits来描述，在后面会定义一个64bits的largesize描述Box的长度；当type是uuid时，代表Box中的数据是用户自定义扩展类型。
5. Data，是Box的实际数据，可以是纯数据也可以是更多的子Boxes。
6. 当一个Box的Data中是一系列子Box时，这个Box又可称为Container Box。

box的结构用伪代码表示如下：

 ```cpp
aligned(8) class Box (unsigned int(32) boxtype,optional unsigned int(8)[16] extended_type)   
{   
    unsigned int(32) size;   
    unsigned int(32) type = boxtype;   
    if (size==1)   
    {   
        unsigned int(64) largesize;   
    }   
    else if (size==0)   
    {   
        // box extends to end of file   
    }   
    if (boxtype==‘uuid’)   
    {   
        unsigned int(8)[16] usertype = extended_type;   
    }   
}
 ```

结构如下图

![](http://p1yseh5av.bkt.clouddn.com/18-6-3/94872915.jpg)

###  二、MP4文件格式（ISO-14496-12/14）

**MP4文件概述**

MP4文件就是由各式各样的Box组成的，下表中列出了所有必选或可选的Box类型，√代表Box必选。

| 类型 |      |      |      |      |      | 必选 | 含义                                                         |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ------------------------------------------------------------ |
| ftyp |      |      |      |      |      | √    | file type and compatibility                                  |
| pdin |      |      |      |      |      |      | progressive download information                             |
| moov |      |      |      |      |      | √    | container for all the metadata                               |
|      | mvhd |      |      |      |      | √    | movie header, overall declarations                           |
|      | trak |      |      |      |      | √    | container for an individual track or stream                  |
|      |      | tkhd |      |      |      | √    | track header, overall information about the track            |
|      |      | tref |      |      |      |      | track reference container                                    |
|      |      | edts |      |      |      |      | edit list container                                          |
|      |      |      | elst |      |      |      | an edit list                                                 |
|      |      | mdia |      |      |      | √    | container for the media information in a track               |
|      |      |      | mdhd |      |      | √    | media header, overall information about the media            |
|      |      |      | hdlr |      |      | √    | handler, declares the media (handler) type                   |
|      |      |      | minf |      |      | √    | media information container                                  |
|      |      |      |      | vmhd |      |      | video media header, overall information (video track only)   |
|      |      |      |      | smhd |      |      | sound media header, overall information (sound track only)   |
|      |      |      |      | hmhd |      |      | hint media header, overall information (hint track only)     |
|      |      |      |      | nmhd |      |      | Null media header, overall information (some tracks only)    |
|      |      |      |      | dinf |      | √    | data information box, container                              |
|      |      |      |      |      | dref | √    | data reference box, declares source(s) of media data in track |
|      |      |      |      | stbl |      | √    | sample table box, container for the time/space map           |
|      |      |      |      |      | stsd | √    | sample descriptions (codec types, initialization etc.)       |
|      |      |      |      |      | stts | √    | (decoding) time-to-sample                                    |
|      |      |      |      |      | ctts |      | (composition) time to sample                                 |
|      |      |      |      |      | stsc | √    | sample-to-chunk, partial data-offsetinformation              |
|      |      |      |      |      | stsz |      | sample sizes (framing)                                       |
|      |      |      |      |      | stz2 |      | compact sample sizes (framing)                               |
|      |      |      |      |      | stco | √    | chunk offset, partial data-offset information                |
|      |      |      |      |      | co64 |      | 64-bit chunk offset                                          |
|      |      |      |      |      | stss |      | sync sample table (random access points)                     |
|      |      |      |      |      | stsh |      | shadow sync sample table                                     |
|      |      |      |      |      | padb |      | sample padding bits                                          |
|      |      |      |      |      | stdp |      | sample degradation priority                                  |
|      |      |      |      |      | sdtp |      | independent and disposable samples                           |
|      |      |      |      |      | sbgp |      | sample-to-group                                              |
|      |      |      |      |      | sgpd |      | sample group description                                     |
|      |      |      |      |      | subs |      | sub-sample information                                       |
|      | mvex |      |      |      |      |      | movie extends box                                            |
|      |      | mehd |      |      |      |      | movie extends header box                                     |
|      |      | trex |      |      |      | √    | track extends defaults                                       |
|      | ipmc |      |      |      |      |      | IPMP Control Box                                             |
| moof |      |      |      |      |      |      | movie fragment                                               |
|      | mfhd |      |      |      |      | √    | movie fragment header                                        |
|      | traf |      |      |      |      |      | track fragment                                               |
|      |      | tfhd |      |      |      | √    | track fragment header                                        |
|      |      | trun |      |      |      |      | track fragment run                                           |
|      |      | sdtp |      |      |      |      | independent and disposable samples                           |
|      |      | sbgp |      |      |      |      | sample-to-group                                              |
|      |      | subs |      |      |      |      | sub-sample information                                       |
| mfra |      |      |      |      |      |      | movie fragment random access                                 |
|      | tfra |      |      |      |      |      | track fragment random access                                 |
|      | mfro |      |      |      |      | √    | movie fragment random access offset                          |
| mdat |      |      |      |      |      |      | media data container                                         |
| free |      |      |      |      |      |      | free space                                                   |
| skip |      |      |      |      |      |      | free space                                                   |
|      | udta |      |      |      |      |      | user-data                                                    |
|      |      | cprt |      |      |      |      | copyright etc.                                               |
| meta |      |      |      |      |      |      | metadata                                                     |
|      | hdlr |      |      |      |      | √    | handler, declares the metadata (handler) type                |
|      | dinf |      |      |      |      |      | data information box, container                              |
|      |      | dref |      |      |      |      | data reference box, declares source(s) of metadata items     |
|      | ipmc |      |      |      |      |      | IPMP Control Box                                             |
|      | iloc |      |      |      |      |      | item location                                                |
|      | ipro |      |      |      |      |      | item protection                                              |
|      |      | sinf |      |      |      |      | protection scheme information box                            |
|      |      |      | frma |      |      |      | original format box                                          |
|      |      |      |      |      |      |      |                                                              |
|      |      |      | imif |      |      |      | IPMP Information box                                         |
|      |      |      | schm |      |      |      | scheme type box                                              |
|      |      |      | schi |      |      |      | scheme information box                                       |
|      | iinf |      |      |      |      |      | item information                                             |
|      | xml  |      |      |      |      |      | XML container                                                |
|      | bxml |      |      |      |      |      | binary XML container                                         |
|      | pitm |      |      |      |      |      | primary item reference                                       |
|      | fiin |      |      |      |      |      | file delivery item information                               |
|      |      | paen |      |      |      |      | partition entry                                              |
|      |      |      | fpar |      |      |      | file partition                                               |
|      |      |      | fecr |      |      |      | FEC reservoir                                                |
|      |      | segr |      |      |      |      | file delivery session group                                  |
|      |      | gitn |      |      |      |      | group id to name                                             |
|      |      | tsel |      |      |      |      | track selection                                              |
| meco |      |      |      |      |      |      | additional metadata container                                |
|      | mere |      |      |      |      |      | metabox relation                                             |

正式开始前先对文件的几个重要部分宏观介绍一下，以便诸位在后续学习时心中有数：

1. ftypbox，在文件的开始位置，描述的文件的版本、兼容协议等； 
2. moovbox，这个box中不包含具体媒体数据，但包含本文件中所有媒体数据的宏观描述信息，moov box下有mvhd和trak box。
   - mvhd中记录了创建时间、修改时间、时间度量标尺、可播放时长等信息。
   - trak中的一系列子box描述了每个媒体轨道的具体信息。
3. moofbox，这个box是视频分片的描述信息。并不是MP4文件必须的部分，但在我们常见的可在线播放的MP4格式文件中（例如Silverlight Smooth Streaming中的ismv文件）确是重中之重。
4. mdatbox，实际媒体数据。我们最终解码播放的数据都在这里面。
5. mfrabox，一般在文件末尾，媒体的索引文件，可通过查询直接定位所需时间点的媒体数据。

![img](http://hi.csdn.net/attachment/201112/11/0_1323595308T9tF.gif)

附：Smooth Streaming中ismv文件结构，文件分为了多个Fragments，每个Fragment中包含moof和mdat。这样的结构符合渐进式播放需求。（mdat及其描述信息逐步传输，收齐一个Fragment便可播放其中的mdat）。

### 二、MP4文件格式详解——文件类型ftyp

```cpp
aligned(8) class FileTypeBox extends Box(‘ftyp’)   
{   
    unsigned int(32) major_brand;   
    unsigned int(32) minor_version;   
    unsigned int(32) compatible_brands[];  // to end of the box   
}  
```

什么是brands？官方是这样描述的：

Each brand is a printable four-character code, registered with ISO, that identifies a precise specification.//在ISO注册的4个字符。

下表来源于网络，列出了几种常见的基于基础文件格式的，媒体封装格式标识。

更多的内容可以查看<http://www.ftyps.com/>

|                      | **Brand**                | **Extension** | **Mime Type**                         |
| -------------------- | ------------------------ | ------------- | ------------------------------------- |
| **MP4**              | mp41, mp42               | .mp4          | video/mp4, audio/mp4, application/mp4 |
| **3GPP**             | various, e.g. 3gp4, 3gp5 | .3gp          | video/3gpp, audio/3gpp                |
| **3GPP2**            | 3g2a                     | .3g2          | video/3gpp2, audio/3gpp2              |
| **Motion JPEG 2000** | mjp2                     | .mj2          | video/mj2                             |
| **QuickTime**        | "qt"                     | .mov          | video/quicktime                       |

结合实际文件，下图是MP4文件起始位置存放的数据

![img](http://img.my.csdn.net/uploads/201205/19/1337423650_4140.jpg)

length（4字节）：0x0000001c：box的长度是28字节；

boxtype（4字节）：0x66747970：“ftyp”的ASCII码，box的标识；

major_brand（4字节）：0x69736f6d：“isom“的ASCII码；

minor_version（4字节）：0x00000200：ismo的版本号；

compatible_brands（12字节）：说明本文件遵从（或称兼容）ismo,iso2,mp41三种协议。

### MP4文件格式详解——元数据moov（一）mvhd box

movie box —— container box whose sub-boxes define the metadata for a presentation (‘moov’) 

moov包含的一系列次级box中存储着媒体播放所需的元数据（metadata）。

两点疑问：什么是元数据？moov有哪些次级box？

**1）元数据：描述数据的数据**。针对媒体文件而言元数据都有哪些呢？为了让大家直观了解：

 ![img](http://img.my.csdn.net/uploads/201205/22/1337656687_8345.JPG)

上图是使用“格式工厂”获取某MP4文件的媒体信息，这些媒体信息基本都包含在moov中。

视频包括编码等级、分辨率、色域、码率、帧率、位深、时长等等……

音频又包括声道、采样率等音频特有属性。

这些元数据对于我们的价值在于：我们的系统（比如PC播放器，高清播放机）可以通过对moov box的解析，自动适配运行在某种模式下去播放影片。在嵌入式领域，由于DSP或ARM的Ram空间有限，经常需要动态加载本次播放所需的解码器（算法程序），通过自适配可以用最廉价的CPU，完成一款支持多码率多格式的全能播放器。

**mvhd** ——This box defines overall information which is media-independent, and relevant to the entire presentation.

全文件唯一的（一个文件中只能包含一个mvhd box），对整个文件所包含的媒体数据作全面的全局的描述。包含了媒体的创建与修改时间时间刻度、默认音量、色域、时长等信息。

```cpp
aligned(8) class MovieHeaderBox extends FullBox(‘mvhd’, version, 0)   
{   
    if (version==1)   
    {   
        unsigned int(64) creation_time;   
        unsigned int(64) modification_time;   
        unsigned int(32) timescale;   
        unsigned int(64) duration;   
    }   
    else   
    { // version==0   
        unsigned int(32) creation_time;   
        unsigned int(32) modification_time;   
        unsigned int(32) timescale;   
        unsigned int(32) duration;   
    }   
    template int(32)  rate = 0x00010000; // typically 1.0   
    template int(16)  volume = 0x0100;  // typically, full volume   
    const bit(16)  reserved = 0;   
    const unsigned int(32)[2]  reserved = 0;   
    template int(32)[9]  matrix = { 0x00010000,0,0,0,0x00010000,0,0,0,0x40000000 };   
    // Unity matrix   
    bit(32)[6]  pre_defined = 0;   
    unsigned int(32) next_track_ID;   
}  
```

首先mvhd是个Full Box，引用我第一篇文中解释：“

 FullBox，是Box的扩展，Box结构的基础上在Header中增加8bits version和24bits flags。

”，见下图：

![img](http://img.my.csdn.net/uploads/201205/22/1337659249_6769.JPG)

图中标红的是moov box的长度与标识（其实这种box结构类似TLV，称为LTV更直观）。

标蓝的是mvhd的长度0x6c，表黄的是mvhd的标识与内容：

**0x6D766864** 是mvhd的ASCII标识；

**0x00000000** 是FullBox扩展出来的标识位，这里是全0，Version和flags都是0，参见前面的结构定义可知后面的时间与时长采用了32bit表示方式。

第一个**0x7C25B080**是创建时间，第二个**0x7C25B080**是最后修改时间。可见媒体未被修改过。这两个数值是怎么描述具体时间的呢？

 time is an integer that declares the creation time of the presentation (in seconds since midnight, Jan. 1, 1904, in UTC time) 

即，从UTC时间的1904年1月1日0点至今的秒数。我们手动算一下：

0x7C25B080 = 2082844800秒，大概是66.0465年（每年按365天算，不考虑闰年），1904+66=1970年中。看来这个媒体文件生成的并不规范，没有按照ISO的规范填写创建与修改时间（by the way，该文件是一年前使用iKu转码生成）。不过这里的时间并不影响播放器识别并播放影片。 

我们假设4字节的时间描述取其最大值0xFFFFFFFF，通过计算最多支持到2040年。如果，**假设该参数是播放视频所必备的参数**，那么到2040年后，也许所有的MP4文件一夜间就无法播放了~（0 == Version这种）。

**0x000003E8** 是timescale，该数值表示本文件的所有时间描述所采用的单位。0x3E8 = 1000，即将1s平均分为1000份，每份1ms。

**0x000A06A2** 是duration，媒体可播放时长，0xA06A2 =  657058，这个数值的单位与实际时间的对应关系就要通过上面的timescale参数。

**duration / timescale = 可播放时长（s）**。这里算出该视频能播放657.058s。使用MPC打开，时长与我们计算的一致。

 ![img](http://img.my.csdn.net/uploads/201205/22/1337660970_9963.JPG)

timescale时间刻度贯穿在整个文件中，所有对于时间的描述都要以其为参照，例如解码时间DTS，展示时间PTS等最重要的时间描述。

0x00010000 媒体速率，这个值代表原始倍速。

0x0100 媒体音量，这个值代表满音量。

接下来的一系列值都是结构中的预定义值，参见结构定义即可。



### MP4文件格式详解——元数据moov（二）tkhd box

前面我们已经知道每个文件是由多个Track（轨道）组成的，每个Track都对应了自身trak box，其中存放了本track的元数据信息。

本次继续解析trak box的一系列子box：

**1）tkhd box**

```cpp
aligned(8) class TrackHeaderBox extends FullBox(‘tkhd’, version, flags)  
{  
    if (version==1)   
    {   
      unsigned int(64) creation_time;   
      unsigned int(64) modification_time;   
      unsigned int(32) track_ID;   
      const unsigned int(32)  reserved = 0;   
      unsigned int(64) duration;   
    }   
    else   
    {   // version==0   
        unsigned int(32) creation_time;   
        unsigned int(32) modification_time;   
        unsigned int(32) track_ID;   
        const unsigned int(32)  reserved = 0;   
        unsigned int(32) duration;   
    }   
    const unsigned int(32)[2]  reserved = 0;   
    template int(16) layer = 0;   
    template int(16) alternate_group = 0;   
    template int(16)  volume = {if track_is_audio 0x0100 else 0};   
    const unsigned int(16)  reserved = 0;   
    template int(32)[9]  matrix= { 0x00010000,0,0,0,0x00010000,0,0,0,0x40000000 };   
    // unity matrix   
    unsigned int(32) width;   
    unsigned int(32) height;   
}
```

类似我们moov中的mvhd box，但tkhd仅仅描述的单一Track的特性。

 类似我们moov中的mvhd box，但tkhd仅仅描述的单一Track的特性。

![img](http://img.my.csdn.net/uploads/201205/27/1338092240_1796.JPG)

上图是实际媒体中的tkhd的数据：

0x5c是tkhd box长度，0x746b6864是“tkhd”的ASCII码。

0x00 00 00 0f是使用了Full box中的flag位（Full box 8bits version + 24bits flag，详见我第一篇日志），这里flag= 0xf，即1111b。

这4位从低到高分别代表：

Track_enabled: Indicates that the track is enabled.  若此位为0，则该track内容无需播放（比如我们用一些非线编软件<如Sony Vegas>做视频剪辑时，有些Track仅为我们参考与模仿用，在输出时将该Track关掉）。
Track_in_movie: Indicates that the track is used in the presentation. 
Track_in_preview: Indicates that the track is used when previewing the presentation.

Track_in_poster: Indicates that the track is used in movie's poster.

> **important：**我们知道，MP4文件格式是ISO-14496-12基础文件格式的衍生品，14496-14中对-12协议进行了扩充与进一步定义。
>
> 重要的是该“14496-12 基础文件格式”协议如果认祖归宗，我们发现这种文件格式最初是由Apple公司的QuickTime媒体格式发展而来的。
>
> 即，mov格式发展出了“ISO 14496 - 12协议”，再由该协议衍生出了mp4,f4v,ismv,3gp等我们常见的媒体封装格式。
>
> 因此上述标志位的poster位，在14496-12中并没有见到描述，而在Apple的协议中却看到了准确定义。
>
> 详见 <https://developer.apple.com/library/mac/#documentation/QuickTime/QTFF/QTFFChap2/qtff2.html>

 两个0xc5268eb6 是track的创建时间与最后修改时间；

紧随其后的0x00000002，代表track ID =2，Track ID是非0的，唯一的，不可重复使用的标识track的方式；

后面32bit全0是保留位；

0x0009d97c是本track的时长，需要配合mvhd box中的timescale 计算实际的持续时间。

后续一些写死的字段不再分析，有些与mvhd重复，可以参见之前的文章。我们看两个关键字段：

layer，类似photoshop中图层的概念，数值小的在播放时更贴近用户（上层图层）。

alternate_group，track的备用分组ID，当该值为0时，意味着本track内容无备份；否则本track会可能会有零到多个备份track。当播放时相同group ID的track只选择一个进行播放。

 ...

 





### 参考

[MP4文件格式详解——结构概述](https://blog.csdn.net/pirateleo/article/details/7061452)