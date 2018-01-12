## FLV格式

#### FLV封装原理

FLV（Flash Video）是Adobe公司设计开发的一种流行的流媒体格式，由于其视频文件体积轻巧、封装简单等特点，使其很适合在互联网上进行应用。此外，FLV可以使用Flash Player进行播放，而Flash Player插件已经安装在全世界绝大部分浏览器上，这使得通过网页播放FLV视频十分容易。目前主流的视频网站如优酷网，土豆网，乐视网等网站无一例外地使用了FLV格式。FLV封装格式的文件后缀通常为“.flv”。

>  **1.        FLV文件对齐方式**
>
> FLV文件以大端对齐方式存放多字节整型。
>
> 如存放数字无符号16位的数字300（0x012C），那么在FLV文件中存放的顺序是：|0x01|0x2C|。
>
> 如果是无符号32位数字300（0x0000012C），那么在FLV文件中的存放顺序是：|0x00|0x00|0x00|0x01|0x2C。



总体上看，FLV包括文件头（File Header）和文件体（File Body）两部分，其中文件体由一系列的Tag组成。

![](http://static.kanhunli.cn//18-1-2/59966338.jpg)

其中，每个Tag前面还包含了Previous Tag Size字段，表示前面一个Tag的大小。Tag的类型可以是视频、音频和Script，每个Tag只能包含以上三种类型的数据中的一种。

![](http://static.kanhunli.cn//18-1-2/17414241.jpg)



- Audio Tag

  音频Tag开始的第1个字节包含了音频数据的参数信息，从第2个字节开始为音频流数据。

  ![](http://static.kanhunli.cn//18-1-2/37457718.jpg)

  第1个字节的前4位的数值表示了音频编码类型。

| 值    | 含义                           |
| ---- | ---------------------------- |
| 0    | Linear PCM，platform endian   |
| 1    | ADPCM                        |
| 2    | MP3                          |
| 3    | Linear PCM，little endian     |
| 4    | Nellymoser 16-kHz mono       |
| 5    | Nellymoser 8-kHz mono        |
| 6    | Nellymoser                   |
| 7    | G.711 A-law logarithmic PCM  |
| 8    | G.711 mu-law logarithmic PCM |
| 9    | reserved                     |
| 10   | AAC                          |
| 14   | MP3 8-Khz                    |
| 15   | Device-specific sound        |

第1个字节的第5-6位的数值表示音频采样率。

音频采样率

| 值    | 含义     |
| ---- | ------ |
| 0    | 5.5kHz |
| 1    | 11KHz  |
| 2    | 22 kHz |
| 3    | 44 kHz |

PS：从上表可以发现，FLV封装格式并不支持48KHz的采样率。

第1个字节的第7位表示音频采样精度。

音频采样精度

| 值    | 含义     |
| ---- | ------ |
| 0    | 8bits  |
| 1    | 16bits |

第1个字节的第8位表示音频类型。

音频类型

| 值    | 含义        |
| ---- | --------- |
| 0    | sndMono   |
| 1    | sndStereo |

- Video Tag

  视频Tag也用开始的第1个字节包含视频数据的参数信息，从第2个字节为视频流数据。

  ![](http://static.kanhunli.cn//18-1-2/22656302.jpg)

  第1个字节的前4位的数值表示帧类型。

  帧类型

  | 值    | 含义                                       |
  | ---- | ---------------------------------------- |
  | 1    | keyframe （for AVC，a seekable frame）      |
  | 2    | inter frame （for AVC，a nonseekable frame） |
  | 3    | disposable inter frame （H.263 only）      |
  | 4    | generated keyframe （reserved for server use） |
  | 5    | video info/command frame                 |

  第1个字节的后4位的数值表示视频编码类型。

  视频编码类型

  | 值    | 含义                         |
  | ---- | -------------------------- |
  | 1    | JPEG （currently unused）    |
  | 2    | Sorenson H.263             |
  | 3    | Screen video               |
  | 4    | On2 VP6                    |
  | 5    | On2 VP6 with alpha channel |
  | 6    | Screen video version 2     |
  | 7    | AVC     => H.264/AVC       |

- Script Tag Data（控制帧）

  该类型Tag又通常被称为Metadata Tag，会放一些关于FLV视频和音频的元数据信息如：duration、width、height等。通常该类型Tag会跟在File Header后面作为第一个Tag出现，而且**只有一个**。

  AMF（Action Message Format）是Adobe设计的一种通用数据封装格式，在Adobe的很多产品中应用，简单来说，AMF将不同类型的数据用统一的格式来描述。

  第一个AMF包：

  第1个字节表示AMF包类型，一般总是0x02，表示字符串。第2-3个字节为UI16类型值，标识字符串的长度，一般总是0x000A（“onMetaData”长度）。后面字节为具体的字符串，一般总为“onMetaData”（6F,6E,4D,65,74,61,44,61,74,61）。

  第二个AMF包：

  第1个字节表示AMF包类型，一般总是0x08，表示数组。第2-5个字节为UI32类型值，表示数组元素的个数。后面即为各数组元素的封装，数组元素为元素名称和值组成的对。

  常见MetaData

| 值               | 含义     |
| --------------- | ------ |
| duration        | 时长     |
| width           | 视频宽度   |
| height          | 视频高度   |
| videodatarate   | 视频码率   |
| framerate       | 视频帧率   |
| videocodecid    | 视频编码方式 |
| audiosamplerate | 音频采样率  |
| audiosamplesize | 音频采样精度 |
| stereo          | 是否为立体声 |
| audiocodecid    | 音频编码方式 |
| filesize        | 文件大小   |

**视频数据**

**AVCVideoPacket格式**

AVCVideoPacket同样包括Packet Header和Packet Body两部分：

即AVCVideoPacket Format：

| AVCPacketType(8)| CompostionTime(24) | Data |

AVCPacketType为包的类型：

​         如果AVCPacketType=0x00，为AVCSequence Header；

​         如果AVCPacketType=0x01，为AVC NALU；

​         如果AVCPacketType=0x02，为AVC end ofsequence

CompositionTime为相对时间戳：

​         如果AVCPacketType=0x01， 为相对时间戳；

​         其它，均为0；

Data为负载数据：

​         如果AVCPacketType=0x00，为AVCDecorderConfigurationRecord；

​         如果AVCPacketType=0x01，为NALUs；

​         如果AVCPacketType=0x02，为空。

**AVCDecorderConfigurationRecord格式**

AVCDecorderConfigurationRecord包括文件的信息。

具体格式如下：

| cfgVersion(8) | avcProfile(8) | profileCompatibility(8) |avcLevel(8) | reserved(6) | lengthSizeMinusOne(2) | reserved(3) | numOfSPS(5) |spsLength(16) | sps(n) | numOfPPS(8) | ppsLength(16) | pps(n) |





#### 来源

1. [视音频数据处理入门：FLV封装格式解析](http://blog.csdn.net/leixiaohua1020/article/details/50535082)
2. [视音频编解码学习工程：FLV封装格式分析器](http://blog.csdn.net/leixiaohua1020/article/details/17934487)
3. [FLV文件格式解析](http://blog.csdn.net/hellofeiya/article/details/9249709)

