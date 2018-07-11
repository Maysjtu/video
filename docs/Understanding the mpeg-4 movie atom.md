# Understanding the mpeg-4 movie atom

#### Requirements

#### Prerequisite(adj. 首要必备的) knowledge

You should have a basic understanding of media encoding concepts. 

### User level

Advanced

Preparing video files for playback on the Adobe Flash Platform is a relatively straightforward(adj. 简单的；坦率的；明确的) process.One detail that is often perplexing(令人费解的),however, is the moov atom. An *atom* is a self-contained data unit that contains information about the video file.  The *moov atom*, also referred to as the *movie atom*, defines the timescale, duration, display characteristics of the movie, as well as subatoms containing information for each track in the movie.  The optimal location of the moov atom depends on the selected delivery method. This article delves into the details around the moov atom, what data it contains, and how to move it to the proper location for your delivery method.

这篇文章阐述了moov atom的细节，它 包含什么数据，如何根据你的传输方法将它移到合适的位置上。

This article is targeted to anyone who is publishing H.264 video for delivery in Adobe Flash Player or Adobe AIR. It provides technical details about the metadata that can hamper good encoding and delivery, causing poor playback performance. 

本文面向发布H.264视频以便在Adobe Flash Player或Adobe AIR中发布的任何人。 它提供了有关元数据的技术细节，这些细节可能妨碍良好的编码和传输，从而导致较差的播放性能。

### Delivering video

Four different methods are available for video delivery in Adobe Flash Player: progressive download, RTMP streaming, HTTP dynamic streaming, or P2P via RTMFP.Regardless of the method you choose, the experience for viewers is very similar. Your choice depends on your budget, the Flash Player version you require, and the level of content protection needed. The moov atom will be handled differently in each delivery method, as you'll see when I explain the details of container structure.

### Progressive download

The progressive download method downloads and caches video on the viewer's computer.  A short period of time is required to buffer and cache the beginning of the media file before it starts playing. 

渐进式下载方法在观看者的计算机上下载和缓存视频。 在开始播放之前，需要很短的时间来缓冲和缓存媒体文件的开头。

Flash Player can calculate an appropriate buffer time based on the rate the data is being received and the total length of the video. 

Flash Player可以根据接收数据的速率和视频的总长度计算适当的缓冲时间。

Once the video has been cached, subsequent viewing does not require any buffering. 

Progressively downloaded files are generally delivered through a content delivery network (CDN) using the standard HTTP protocol. In this case, Flash Player establishes a direct HTTP connection with the CDN's servers to retrieve the content. Low-traffic progressive delivery can be served from your standard web server along with other website content.

可以提供低流量渐进式传送。

### RTMP streaming

The RTMP streaming method delivers the video bits in real time, as they are requested. The bits are viewed and then discarded. The user experience is virtually the same as with progressive download but has a few key differences:

看完即丢，没有缓存。

- Viewers do not have to wait for video to download before seeking throughout the video.
- Video is not cached on the viewer's computer, so it cannot be viewed offline.
- Flash Player can deliver streaming video via the RTMP or RTMPE protocols supported by Adobe Flash Media Server.

### HTTP dynamic streaming

Flash Player 10.1 introduced support for HTTP dynamic streaming—enabling an adaptive-bitrate, protected streaming experience with common HTTP servers, caching devices, and networks, using a standard MPEG-4 media format (also known as MP4). HTTP dynamic streaming shares some features with RTMP streaming:

- It supports both live and on demand delivery.
- It adjusts video quality to viewers' connection speed and processing power.
- Viewers do not have to wait for video to download before seeking throughout the video.
- Live DVR functionality is supported, enabling pausing and rewinding live streams.

Like standard progressive delivery, content is cached on the viewer's computer. Integration with Adobe Flash Access is available if content protection is desired.

### Peer-assisted delivery via RTMFP

Peer-to-peer media delivery is supported in Flash Player 10.1 and later using the Real Time Media Flow Protocol (RTMFP). This enables Flash Player clients to share video, audio, and data through a direct connection, rather than through a server. This enables high-capacity delivery via multicast, as well as ultra-low-latency communication for applications such as VoIP, videoconferencing, and multiplayer games.

Flash Player 10.1及更高版本支持使用实时媒体流协议（RTMFP）进行点对点媒体传输。 这使Flash Player客户端可以通过直接连接而不是通过服务器共享视频，音频和数据。 这可实现通过多播的高容量传输，以及用于VoIP，视频会议和多人游戏等应用的超低延迟通信。

Note: Live streaming does not utilize(vt. 利用) the moov atom; therefore, this article will not address live streaming.

### MPEG-4 stream packaging

MPEG-4流包装

For Flash Player to be able to play back an MPEG-4 (MP4) file, the file must be packaged in a specific type of container—one that follows the MPEG-4 Part 12 (ISO/IEC 14496-12) specification. Stream packaging is the process of making a multiplexed media file. Also known as muxing, this procedure combines multiple elements that enable control of the distribution delivery process into a single file.

为使Flash Player能够播放MPEG-4（MP4）文件，必须将文件打包在特定类型的容器中 - 遵循MPEG-4 Part 12（ISO / IEC 14496-12）规范。 流包装是制作多路复用媒体文件的过程。此过程也称为多路复用，它结合了多个元素，这些元素可以将分发传递过程控制到单个文件中。

Some of these elements are represented in self-contained atoms. As I mentioned at the outset, an atom is a basic data unit that contains a header and a data field. The header contains referencing metadata that describes how to find, process, and access the contents of the data field, which may include (but is not limited to) the following components:

这些元素中的一些以独立原子表示。 正如我在开头提到的，atom是一个包含头和数据字段的基本数据单元。 标头包含引用元数据，描述如何查找，处理和访问数据字段的内容，其中可能包括（但不限于）以下组件：

- Video frames
- Audio samples
- Interleaving AV data
- Captioning data
- Chapter index
- Title
- Poster
- User data
- Various technical metadata: codec, timescale, version, preferred playback rate, preferred playback volume, movie duration, etc.

In an MPEG-4–compliant container, every movie contains a moov atom. Normally, a movie atom contains a movie header atom (an *mvhd*atom) that defines the timescale and duration information for the entire movie, as well as its display characteristics.The movie atom also contains one track atom (a *trak* atom) for each track in the movie. Each track atom contains one or more media atoms (an *mdia* atom) along with other atoms that define other track and movie characteristics.

In this tree-like hierarchy, the moov atom acts an index of the video data. It is here that the MPEG-4 muxer stores information about the file to enable the viewer to play and scrub the file. The file will not start to play until the player can access this index.

在这种树状层次结构中，moov原子作为视频数据的索引。 这里，MPEG-4复用器存储有关文件的信息，以使观看者能够播放和擦除文件。 在播放器可以访问此索引之前，该文件不会开始播放。

Unless specified otherwise, the moov atom is normally stored at the end of the file in on-demand content, after all of the information describing the file has been generated. Depending on the type of on demand delivery method selected—progressive download, streaming, or local playback—the location will need to move either to the end or to the beginning of the file.

除非另有说明，否则在生成描述文件的所有信息之后，moov原子通常存储在按需内容的文件末尾。 根据所选的按需交付方式的类型 - 渐进式下载，流式传输或本地回放 - 该位置将需要移动到文件的结尾或开头。

If the planned delivery method is progressive download or streaming (RTMP or HTTP), the moov atom will have to be moved to the beginning of the file. This ensures that the required movie information is downloaded first, enabling playback to start right away. If the moov atom is located at the end of the file, it forces the download of the entire file first before it will start playback. If the file is intended for local playback, then the location of the moov atom will not impact the start time, since the entire file is available for playback right away.

如果计划的传递方法是渐进式下载或流式传输（RTMP或HTTP），则必须将moov原子移动到文件的开头。 这可确保首先下载所需的电影信息，从而立即开始播放。 如果moov原子位于文件末尾，则会在开始播放之前强制下载整个文件。 如果文件用于本地播放，则moov原子的位置不会影响开始时间，因为整个文件可立即播放。

The placement of the moov atom is specified in various software packages through settings such as "progressive download," "fast start," "use streaming mode," or similar options. Software packages such as MP4creator or AtomicParsley enable you to analyze the location of the moov atom in your encoded files (Figures 1 and 2).

通过诸如“渐进式下载”，“快速启动”，“使用流式传输模式”或类似选项的设置，在各种软件包中指定moov原子的放置。 MP4creator或AtomicParsley等软件包使您能够分析编码文件中moov原子的位置（图1和图2）。

Some tools enable relocation of the moov atom to the beginning of the file's structure through post processing of the compressed MPEG-4 (MP4) file. One such tool is MP4Creator, mentioned earlier, and another is MP4 FastStart. The best way to handle the moov atom location, however, is to set it during the compression and muxing portion of the encoding process. This minimizes the probability of the moov atom inadvertently being placed at the end.

一些工具通过对压缩的MPEG-4（MP4）文件进行后处理，可以将moov原子重定位到文件结构的开头。 其中一个工具是前面提到的MP4Creator，另一个是MP4 FastStart。 然而，处理moov原子位置的最佳方法是在编码过程的压缩和复用部分期间设置它。 这最小化了moov原子无意中被放置在末端的可能性。

### Importance of moov atom location

 As I mentioned earlier, positioning the moov atom at the beginning of the file structure expedites(vt. 加快；促进；发出) the playback experience and access to the data payload for decoding and presentation by the client player. This is especially true for progressive delivery, where the moov atom data must be received before playback will begin. 

However, another vital reason for having the moov atom at the beginning relates to the file, server, and CDN relationship in RTMP streaming.

在开头放置moov原子的另一个重要原因与RTMP流中的文件，服务器和CDN有关。 

When the user requests a video asset via RTMP, Flash Media Server checks for availability of the asset on the local cache. If FMS does not locate the asset locally, it then requests the asset via a local service while leveraging HTTP cache hierarchy. This is a crucial point: initially, Flash Media Server requests a "range" at the beginning of the file to get the table of contents. If FMS sees that the metadata is stored at the end of the file, it then requests a range at the end of the file where metadata is stored, and then it requests the file from the beginning again. Since **range requests are not cacheable**, and because they can overlap, this process of back-and-forth requests may cause rebuffering. This is especially true if the user is watching video randomly or in small segments instead of the entire video from start to finish, as it's never cached in its entirety. Therefore, always encoding or muxing files with the moov atom at the beginning is recommended to avoid rebuffering caused by moov atom location.

但是，在开头使用moov原子的另一个重要原因与RTMP流中的文件，服务器和CDN关系有关。当用户通过RTMP请求视频资产时，Flash Media Server会检查本地缓存上资产的可用性。如果FMS未在本地找到资产，则它会在利用HTTP缓存层次结构的同时通过本地服务请求资产。这是一个关键点：最初，Flash Media Server在文件开头请求“范围”以获取目录。如果FMS发现元数据存储在文件末尾，则它会在文件末尾请求存储元数据的范围，然后再次从头开始请求文件。由于范围请求不可缓存，并且因为它们可以重叠，所以此来回请求的过程可能导致重新缓冲。如果用户从头到尾随机地或以小段而不是整个视频观看视频，则尤其如此，因为它从未完全缓存。因此，建议始终在开头使用moov原子编码或复用文件，以避免由moov原子位置引起的重新缓冲。

### Issues with edts atom handling

编辑原子处理的问题

An edts atom contained in the trak atom of a moov atom located within an MP4 container hierarchy is responsible for tracking times and durations of the media. Flash Player architecture is designed to ignore the existence of an edts atom; however, an edts atom containing invalid or broken data may interfere with smooth and stable switching of HTTP packaged streams. Therefore, it is important to repair or remove an invalid edts atom prior to packaging the file for HTTP dynamic streaming.

The broken edts atom can be eliminated from a file using tools such as [FLVCheck](http://www.adobe.com/products/flashmediaserver/tool_downloads/) for file conformance, MP4Creator for structure analysis, and AtomicParsley for removal of metadata (see Figures 3 and 4). 





 













 

 













 