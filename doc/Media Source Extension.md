## Media Source Extensions	

### 摘要

​	本规范扩展了HTMLMediaElement ，允许JavaScript生成用于播放的媒体流。 允许JavaScript生成流有助于实现各种用例，例如自适应流式传输和实时流式转换。

​	 这是一个草案文件，可能随时被其他文件更新，替换或废弃。

### 1. 介绍

​	该规范允许JavaScript为\<audio\>和\<video\>动态构建媒体流。 它定义了一个MediaSource对象，可以作为HTMLMediaElement的媒体数据源。 MediaSource对象具有一个或多个SourceBuffer对象。 应用程序将数据片段赋予SourceBuffer对象，并可以根据系统性能和其他因素调整其质量。

Data from the [`SourceBuffer`](http://w3c.github.io/media-source/#idl-def-sourcebuffer) objects is managed as track buffers for audio, video and text data that is decoded and played。

SourceBuffer对象被用于解码和播放的音频，视频和文本数据的轨道缓冲区管理。



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

The [track buffers](https://www.w3.org/TR/media-source/#track-buffer) that provide [coded frames](https://www.w3.org/TR/media-source/#coded-frame) for the `enabled` `audioTracks`, the `selected` `videoTracks`, and the `"showing"` or `"hidden"` `textTracks`. All these tracks are associated with [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) objects in the `activeSourceBuffers` list.

**Append Window**

A [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) range used to filter out [coded frames](https://www.w3.org/TR/media-source/#coded-frame) while appending. The append window represents a single continuous time range with a single start time and end time. Coded frames with [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) within this range are allowed to be appended to the [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) while coded frames outside this range are filtered out. The append window start and end times are controlled by the `appendWindowStart` and `appendWindowEnd` attributes respectively.

**Coded Frame**(编码帧)

A unit of media data that has a [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp), a [decode timestamp](https://www.w3.org/TR/media-source/#decode-timestamp), and a [coded frame duration](https://www.w3.org/TR/media-source/#coded-frame-duration).

**Coded Frame Duration**

The duration of a [coded frame](https://www.w3.org/TR/media-source/#coded-frame). For video and text, the duration indicates how long the video frame or text *should* be displayed. For audio, the duration represents the sum of all the samples contained within the coded frame. For example, if an audio frame contained 441 samples @44100Hz the frame duration would be 10 milliseconds.

**Coded Frame End Timestamp**

The sum of a [coded frame](https://www.w3.org/TR/media-source/#coded-frame) [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) and its [coded frame duration](https://www.w3.org/TR/media-source/#coded-frame-duration). It represents the [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) that immediately follows the coded frame.

编码帧表示时间戳和编码帧持续时间的总和。 它表示紧接在编码帧之后的表示时间戳。

**Coded Frame Group**

A group of [coded frames](https://www.w3.org/TR/media-source/#coded-frame) that are adjacent(邻近的) and have monotonically(单调的) increasing [decode timestamps](https://www.w3.org/TR/media-source/#decode-timestamp ) without any gaps. Discontinuities detected by the [coded frame processing algorithm](https://www.w3.org/TR/media-source/#sourcebuffer-coded-frame-processing) and `abort()` calls trigger the start of a new coded frame group.

一组相邻的编码帧，并且具有单调递增的解码时间戳，没有任何间隙。 编码帧处理算法检测到的不连续时或者调用abort()时将触发新的编码帧组开始。

**Decode Timestamp**

The decode timestamp indicates the latest time at which the frame needs to be decoded assuming instantaneous decoding and rendering of this and any dependant frames (this is equal to the [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) of the earliest frame, in [presentation order](https://www.w3.org/TR/media-source/#presentation-order), that is dependant on this frame). If frames can be decoded out of [presentation order](https://www.w3.org/TR/media-source/#presentation-order), then the decode timestamp *must* be present in or derivable from the byte stream. The user agent *must* run the [append error algorithm](https://www.w3.org/TR/media-source/#sourcebuffer-append-error) if this is not the case. If frames cannot be decoded out of [presentation order](https://www.w3.org/TR/media-source/#presentation-order) and a decode timestamp is not present in the byte stream, then the decode timestamp is equal to the [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp).

**Initialization Segment**

A sequence of bytes that contain all of the initialization information required to decode a sequence of [media segments](https://www.w3.org/TR/media-source/#media-segment). This includes codec initialization data, [Track ID](https://www.w3.org/TR/media-source/#track-id) mappings for multiplexed(多种，复合的) segments, and timestamp offsets (e.g., edit lists).

>NOTE
>
>The [byte stream format specifications](https://www.w3.org/TR/media-source/#byte-stream-format-specs) in the byte stream format registry [[MSE-REGISTRY](https://www.w3.org/TR/media-source/#bib-MSE-REGISTRY)] contain format specific examples.

**Media Segment**

A sequence of bytes that contain packetized & timestamped media data for a portion of the [media timeline](https://www.w3.org/TR/html51/semantics-embedded-content.html#media-timeline). Media segments are always associated with the most recently appended [initialization segment](https://www.w3.org/TR/media-source/#init-segment).

**MediaSource object URL**

A MediaSource object URL is a unique [Blob URI](https://www.w3.org/TR/FileAPI/#url) [[FILE-API](https://www.w3.org/TR/media-source/#bib-FILE-API)] created by `createObjectURL()`. It is used to attach a [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object to an HTMLMediaElement.

These URLs are the same as a [Blob URI](https://www.w3.org/TR/FileAPI/#url), except that anything in the definition of that feature that refers to [File](https://www.w3.org/TR/FileAPI/#dfn-file) and [Blob](https://www.w3.org/TR/FileAPI/#dfn-Blob) objects is hereby extended to also apply to [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) objects.

The [origin](https://www.w3.org/TR/html51/browsers.html#section-origin) of the MediaSource object URL is the [relevant settings object](https://www.w3.org/TR/html51/webappapis.html#relevant-settings-object) of `this` during the call to `createObjectURL()`.

```javascript
var audio = document.querySelector('audio'),
    mediaSource = new MediaSource();

audio.src = URL.createObjectURL(mediaSource);
```

**Parent Media Source**

The parent media source of a [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) object is the [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object that created it.

**Presentation Start Time**

The presentation start time is the earliest time point in the presentation and specifies the [initial playback position](https://www.w3.org/TR/html51/semantics-embedded-content.html#initial-playback-position) and [earliest possible position](https://www.w3.org/TR/html51/semantics-embedded-content.html#earliest-possible-position). All presentations created using this specification have a presentation start time of 0.

**Presentation Interval**

The presentation interval of a [coded frame](https://www.w3.org/TR/media-source/#coded-frame) is the time interval from its [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) to the [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) plus the [coded frame's duration](https://www.w3.org/TR/media-source/#coded-frame-duration). For example, if a coded frame has a presentation timestamp of 10 seconds and a [coded frame duration](https://www.w3.org/TR/media-source/#coded-frame-duration) of 100 milliseconds, then the presentation interval would be [10-10.1). Note that the start of the range is inclusive, but the end of the range is exclusive.

**Presentation Order**

The order that [coded frames](https://www.w3.org/TR/media-source/#coded-frame) are rendered in the presentation. The presentation order is achieved by ordering [coded frames](https://www.w3.org/TR/media-source/#coded-frame) in monotonically increasing order by their [presentation timestamps](https://www.w3.org/TR/media-source/#presentation-timestamp).

**Presentation Timestamp**





### 来源

[Media Source Extensions W3C](https://www.w3.org/TR/media-source/)

[媒体源扩展 API](https://developer.mozilla.org/zh-CN/docs/Web/API/Media_Source_Extensions_API)