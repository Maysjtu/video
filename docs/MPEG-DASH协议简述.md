# MPEG-DASH协议简述

### DASH协议简述

DASH(Dynamic Adaptive Streaming over HTTP)是在2011年底由MPEG和ISO共同制定的标准，通过HTTP共同影音档案通讯协定，可使高品质影音内容通过网路传送到联网电视、机顶盒及移动终端设备。在MPEG-DASH之前，市场上已有Apple的HLS、Microsoft的Smooth Streaming以及Adobe的Dynamic Streaming等渐进式流媒体协议，但彼此并不相容，MPEG-DASH整合了这三种流媒体协议，同时支持TS profile和ISO profile，更具通用性。

MPEG-DASH的形成历史可以参见下图：

![img](https://img-blog.csdn.net/20180109155917497?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvRGVsaWFQdQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

目前，MPEG-DASH已经被越来越多的应用在互联网上，随着一些有影响力的大公司如Netflix、YouTube和Google等的加入，加速了MPEG-DASH协议的部署。有了这些主要的互联网流量来源，MPEG-DASH已经占据了网络流媒体总流量的半壁江山。

 DASH自适应码率下载工作示意图如下，首先，HTTP Server端将媒体文件切分成一个个时间长度相等的小分片(Segments)，每个分片被编码为不同的码率和分辨率；这些分片可以通过GET请求下载，客户端通过评估自身的性能和带宽情况，下载相应码率和分辨率的切片。码率切换以Segment为单位，当自身带宽较好时，在下载下一个切片时，就可以请求对应码率的较高分辨率的切片；而当带宽变差时，则当前切片下载完成后，可以下载码率和分辨率较低的下一个切片。由于不同质量的切片在时间上都是对齐的，因此，在不同质量的切片之间切换时，是自然流畅的。

![img](https://img-blog.csdn.net/20180109160353009?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvRGVsaWFQdQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)  



为了描述Segments之间在时间和结构上的关系，MPEG-DASH引入了Media Presentation Description (MPD)的概念。MPD是一个**XML文件**，它完整表示了视频的所有信息，包括视频长度，不同Segments的码率和分辨率、分片时长以及对应的URL等等，客户端通过首先下载并解析MPD文件，可获取到与自身性能和带宽最匹配的切片序列。下图比较清晰地说明了MPEG-DASH的工作机制以及MPD文件的作用。

![img](https://img-blog.csdn.net/20180109203052520?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvRGVsaWFQdQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

MPD文件的结构大概如下图所示：

![img](https://img-blog.csdn.net/20180109203526993?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvRGVsaWFQdQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

有了以上的概念，我们来最后看一个完整的MPD文件，由于内容较多，其中隐藏了部分内容，但保留了整个MPD文件的结构。

![img](https://img-blog.csdn.net/20180109205354537?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvRGVsaWFQdQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

###  DASH和HLS比较

#### 1、引言

HTTP（hyper text transport protoco1，超文本传输协议）自适应流媒体技术融合了传统RTSP（real time streaming protoco1）/RTP（real time protoco1）流式技术和HTTP渐进式下载技术的优点，具有高效、可扩展及兼容性强等特点，在降低头端服务器技术复杂度的同时，能够有效提升用户的媒体播放体验，已逐渐成为视频传输技术的主流。

HLS（HTTP live streaming,HTTP实时流传输）为苹果公司具有自主知识产权的流媒体传输方案，2009年开始被苹果公司的机顶盒、其他终端产品以及市面上多款OTT机顶盒产品所广泛采纳，为最具代表性的企业解决方案之一。HLS支持MPEG-2 TS（以下简称M2TS）传输格式，能快速渗透广播电视领域，然而苹果公司至今未明确其知识产权策略，尽管新特性被不断更新进企业标准版本，但在直播时延、端到端整体加密实现以及非苹果终端的原生支持度等方面表现不够理想。2014年，首个基于HTTP 自适应流媒体传输的国际标准 MPEG-DASH （dynamic adaptive streaming over HTTP，基于HTTP的动态自适应流）面世，以形成IP网络承载单一格式的流媒体并提供高效与高质量服务的统一方案为主要目标，解决多制式传输方案并存格局下的存储与服务能力浪费、运营高成本与复杂度、系统间互操作弱等问题。随着标准的发展，MPEG-DASH被越来越多的企业所关注，2011年3GPP R10版本就已将其明确为LTE网络多媒体广播多播业务的传输方案。

#### 2、技术比较

##### 2.1 实现原理

（1）DASH技术

DASH技术架构分为3部分，如[图1](http://www.infocomm-journal.com/dxkx/article/2015/1000-0801/1000-0801-31-4-00022/img_23.jpg)所示。内容生成服务器，负责制作媒体内容并将制作好的内容分发至流媒体服务器；流媒体服务器，管理DASH媒体内容并响应客户端的HTTP媒体服务请求；DASH客户端，负责以标准HTTP与服务器交互，获取与解析MPD（media presentation description，媒体表示描述）文件、构建与管理媒体文件下载请求、解码与输出媒体内容，同时也负责响应事件，实现与流媒体服务相关的应用。

服务器与客户端间的DASH内容传输流程如[图2](http://www.infocomm-journal.com/dxkx/article/2015/1000-0801/1000-0801-31-4-00022/img_24.jpg)所示。首先媒体内容部署在流媒体服务器上，按内容的存储方式分为MPD与媒体分片文件两部分。当用户发起内容播放请求时，客户端首先向服务器请求、下载与解析MPD文件，获取节目码率等信息，然后根据实际的网络带宽情况向服务器请求某种码率的媒体分片文件。在视频的播放过程中，客户端会根据带宽情况选择不同码率的媒体分片以实现自适应切换。

MPD作为索引文件，用于描述客户端向服务端获取媒体分片进行解复用、解码与流媒体服务所需的详细信息，MPD采用HTTP XML（extensible markup language，可扩展标记语言）的格式组织数据；媒体分片文件则为与媒体格式相对应的有效编码内容及元数据，由客户端通过HTTP get指令获取。DASH传输数据模型采用多元素层次化的架构，支持音频、视频等内容的灵活封装。MPD分层数据模型结构如[图3](http://www.infocomm-journal.com/dxkx/article/2015/1000-0801/1000-0801-31-4-00022/img_25.jpg)所示，内容描述元数据被封装在5种嵌套的元素中，例如广告内容可封装在时段元素中，一个节目的音频、视频、字幕等相关元数据可以分别封装在3 个不同的自适应集或者复用在一个自适应集元素中进行描述。

（2）HLS技术

HLS技术架构如[图4](http://www.infocomm-journal.com/dxkx/article/2015/1000-0801/1000-0801-31-4-00022/img_26.jpg)所示。与MPEG-DASH 基本类似，也由内容源组件、流媒体服务组件和客户端3部分组成。媒体内容的传输流程大致为：编码器对媒体内容进行编码，将输出的M2TS码流切割成时间间隔相同的一系列TS文件，并生成包含这些TS文件相关信息的索引文件，在流媒体服务器上完成部署，用户请求媒体播放时，客户端从流媒体服务器上分别获取与解析索引文件，然后根据实际的网络带宽情况，按序向服务器请求媒体分片文件并提供边拉动边播放的媒体服务。

HLS的索引文件采用．M3U8格式，分为一级索引和二级索引，其中一级索引为包含不同码率索引的索引文件，二级索引为包含特定码率分片文件的索引。HLS方案支持实时广播和视频点播两种应用场景，广播业务的索引文件是动态更新的，服务器向编码器收集满3个直播TS文件即封装一个HLS索引，下发给客户端提供直播服务；对于视频点播会话来说，索引文件为静态。

##### 2.2 技术特性

MPEG-DASH 支持的媒体流格式分为 MP4或分片MP4（以下简称fMP4）以及M2TS两类，而HLS只支持M2TS。这里将针对fMP4格式的MPEG-DASH方案与M2TS格式的HLS方案，就内容安全、视频质量、系统效率、业务体验等方面所表现的不同特性展开详细论述。

（1）媒体存储与切换机制 

​	DASH fMP4格式支持元数据及媒体内容的分开存储，每个媒体分片包含可独立解密和解码的内容元数据。MPD对同一节目的多个音频、视频或字幕等元数据进行统一描述，服务端无需预先对存放于不同位置的媒体文件进行组合，由客户端根据描述信息按需重构媒体下载的请求。以此为基础，fMP4格式内容可实现基于媒体类型的比特流时间同步和播放无缝切换，其中音频媒体流通过同步帧、视频媒体流通过GOP（group of pictures，画面组）对齐来实现。不同类型媒体流以及同一媒体流的不同媒体帧之间也能做到独立时间同步，这使得fMP4的分片长度可以小至1s或2s，由此，客户端能够对网络变化做出快速响应，避免了视频质量骤变、终端缓冲下溢等问题。 

​	HLS M2TS格式将多路基本媒体流及元数据复用在一起传输，解码参数与码流一同传输使得客户端能以较快的速度完成解码。然而为支持节目的多语种、多声道、多字幕等业务功能，需进行多份媒体内容组合的制作、部署和存储，考虑多码率、多类型传输协议、多屏终端的复杂应用场景，对服务端的管理能力提出了很高的要求。多路复用使得客户端无法分开请求，即便做到比特流的精确定位，得到的也将是头信息、元数据、音频、视频等内容的混合。此外，HLS未明确要求M2TS媒体数据块时间对齐或以IDR（instantaneous decoding refresh，即时解码刷新）帧为起始帧，因此实现媒体数据的下载与解码需要耗费双倍的网络带宽和终端处理能力，还存在媒体帧之间切换的问题。

（2）缓存效率与带宽利用率

​	fMP4格式一种类型的媒体文件只有一份且由MPD统一描述，客户端根据需求组合媒体分片生成服务请求，当媒体文件达到一定访问热度，就被缓存到边缘节点，因此边缘节点的命中率相对较高。同时，由于fMP4要求媒体分片或子分片的时间严格对齐，自适应切换时客户端无需消耗过多带宽。

​	M2TS格式为满足不同业务使用场景要求，存在一个节目多份媒体内容的情况，当用户发起一个节目某种内容的服务请求时，该内容的访问热度未必达到CDN边缘节点的缓存条件，因此一个节目在边缘节点缓存或媒体服务在边缘命中的概率相对较低。同时，客户端需要消耗更多的性能完成媒体数据的解复用、解码与时间对齐等处理，占用双倍的带宽资源对某一时段的分片内容进行重复下载。

（3）DRM的支持

​	MPEG-DASH支持分组层面的数字版权与加密，支持基本流的加密与DRM（data rights management，数字版权管理）功能。DASH标准与MPEG通用加密（common encryption,CENC）方案相结合，支持UltraViolet联盟认证的5种DRM解决方案，包括Adobe、Google、Marlin、Microsoft以及OMA （Open Mobile Alliance，开放移动联盟）。

​	HLS没有涉及DRM实现的相关描述，只是提及如何利用128位AES算法进行M2TS流的加扰，并未规定如何从DRM 密钥服务器获取密钥等实现方案。

 



#### 















### 参考

[网络流媒体协议之——MPEG-DASH协议简述](https://blog.csdn.net/DeliaPu/article/details/79013812)

[MPEG-DASH与HLS流传输技术的比较分析](http://www.infocomm-journal.com/dxkx/article/2015/1000-0801/1000-0801-31-4-00022.shtml)

 