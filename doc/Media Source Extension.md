## Media Source Extensions	

### 摘要

​	本规范扩展了HTMLMediaElement ，允许JavaScript生成用于播放的媒体流。 允许JavaScript生成流有助于实现各种用例，例如自适应流式传输和实时流式转换。

​	 这是一个草案文件，可能随时被其他文件更新，替换或废弃。

### 1. 介绍

​	该规范允许JavaScript为\<audio\>和\<video\>动态构建媒体流。 它定义了一个MediaSource对象，可以作为HTMLMediaElement的媒体数据源。 MediaSource对象具有一个或多个SourceBuffer对象。 应用程序将数据片段赋予SourceBuffer对象，并可以根据系统性能和其他因素调整其质量。

Data from the [`SourceBuffer`](http://w3c.github.io/media-source/#idl-def-sourcebuffer) objects is managed as track buffers for audio, video and text data that is decoded and played。

SourceBuffer对象被用于解码和播放的音频，视频和文本数据的轨道缓冲区管理。

 用于这些扩展的字节流规范在字节流格式注册表[MSE-REGISTRY]中可用。

![](http://p1yseh5av.bkt.clouddn.com/18-1-3/81932331.jpg)

#### 1.1 目标

- Allow JavaScript to construct media streams independent of how the media is fetched.
- Define a splicing and buffering model that facilitates use cases like adaptive streaming, ad-insertion, time-shifting, and video editing. 定义拼接和缓冲模型，以便于自适应流媒体，广告插入，时移和视频编辑等用例。
- Minimize the need for media parsing in JavaScript.
- Leverage the browser cache as much as possible. 尽可能利用浏览器缓存。
- Provide requirements for byte stream format specifications.
- Not require support for any particular media format or codec（编解码器）.

#### 1.2 定义

**Active Track Buffers**

The [track buffers](http://w3c.github.io/media-source/#track-buffer) that provide [coded frames](http://w3c.github.io/media-source/#coded-frame) for the `enabled` `audioTracks`, the `selected` `videoTracks`, and the `"showing"` or `"hidden"` `textTracks`. All these tracks are associated with [`SourceBuffer`](http://w3c.github.io/media-source/#idl-def-sourcebuffer) objects in the `activeSourceBuffers` list.



















​	