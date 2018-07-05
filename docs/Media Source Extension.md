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



一般video标签的资源获取是走http，将mediaSource与video标签绑定后，资源获取算法会走本地。

mediaSource的duration

The [duration change algorithm](https://www.w3.org/TR/media-source/#duration-change-algorithm) will adjust new duration higher if there is any currently buffered coded frame with a higher end time.



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

一系列字节，包含媒体时间轴的一部分的打包和带时间戳的媒体数据。 媒体段始终与最近附加的初始化片段相关联。

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

A reference to a specific time in the presentation. The presentation timestamp in a [coded frame](https://www.w3.org/TR/media-source/#coded-frame) indicates when the frame *should* be rendered.

在编码帧中的PTS指示何时渲染该帧

**Random Access Point** 随机接入点

A position in a [media segment](https://www.w3.org/TR/media-source/#media-segment) where decoding and continuous playback can begin without relying on any previous data in the segment. For video this tends to be the location of I-frames. In the case of audio, most audio frames can be treated as a random access point. Since video tracks tend to have a more sparse distribution of random access points, the location of these points are usually considered the random access points for multiplexed streams.

不依赖其他数据即可解码的媒体片段，对视频来说是I帧，音频每一帧都是随机接入点。由于视频轨道具有更稀疏的随机接入点分布，所以这些点的位置通常被认为是多路复用流的随机接入点。

**SourceBuffer byte stream format specification** SourceBuffer字节流格式规范

The specific [byte stream format specification](https://www.w3.org/TR/media-source/#byte-stream-format-specs) that describes the format of the byte stream accepted by a [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) instance. The [byte stream format specification](https://www.w3.org/TR/media-source/#byte-stream-format-specs), for a [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) object, is selected based on the type passed to the `addSourceBuffer()` call that created the object.

**SourceBuffer configuration**

A specific set of tracks distributed across one or more [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) objects owned by a single [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) instance.

Implementations *must* support at least 1 [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object with the following configurations:

- A single SourceBuffer with 1 audio track and/or 1 video track.
- Two SourceBuffers with one handling a single audio track and the other handling a single video track.

实现必须至少支持1个具有以下配置的MediaSource对象：

具有1个音频轨道和/或1个视频轨道的单个SourceBuffer。
两个SourceBuffers，一个处理单个音频轨道，另一个处理单个视频轨道。

**Track Description**

A byte stream format specific structure that provides the [Track ID](https://www.w3.org/TR/media-source/#track-id), codec configuration, and other metadata for a single track. Each track description inside a single [initialization segment](https://www.w3.org/TR/media-source/#init-segment) has a unique [Track ID](https://www.w3.org/TR/media-source/#track-id). The user agent *must* run the [append error algorithm](https://www.w3.org/TR/media-source/#sourcebuffer-append-error) if the [Track ID](https://www.w3.org/TR/media-source/#track-id) is not unique within the [initialization segment](https://www.w3.org/TR/media-source/#init-segment).

**Track ID**

A Track ID is a byte stream format specific identifier that marks sections of the byte stream as being part of a specific track. The Track ID in a [track description](https://www.w3.org/TR/media-source/#track-description) identifies which sections of a [media segment](https://www.w3.org/TR/media-source/#media-segment) belong to that track.



### 2. MediaSource Object

The MediaSource object represents a source of media data for an HTMLMediaElement.It keeps track of the `readyState` for this source as well as a list of [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) objects that can be used to add media data to the presentation. MediaSource objects are created by the web application and then attached to an HTMLMediaElement.  The HTMLMediaElement fetches this media data from the [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object when it is needed during playback.

MediaSource对象表示HTMLMediaElement的媒体数据源。它跟踪这个源的readyState和sourceBuffer对象。

Each [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object has a live seekable range variable that stores a [normalized TimeRanges object](https://www.w3.org/TR/html51/semantics-embedded-content.html#normalized-timeranges-object). This variable is initialized to an empty `TimeRanges` object when the [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object is created, is maintained by `setLiveSeekableRange()` and `clearLiveSeekableRange()`, and is used in [HTMLMediaElement Extensions](https://www.w3.org/TR/media-source/#htmlmediaelement-extensions) to modify `HTMLMediaElement.seekable` behavior.

```typescript
enum ReadyState {
  "closed",// Indicates the source is not currently attached to a media element.
  "open",// The source has been opened by a media element and is ready for data to be appended to the SourceBuffer objects in sourceBuffers.
  "ended"//The source is still attached to a media element, but endOfStream() has been called.
}
```

```typescript
enum EndOfStreamError {
  "network", //Terminates playback and signals that a network error has occured.终止播放并且发出发生网络错误的信号
  "decode"//Terminates playback and signals that a decoding error has occured.
}
```

```typescript
[Constructor]
interface MediaSource : EventTarget {
    readonly attribute SourceBufferList    sourceBuffers;
    readonly attribute SourceBufferList    activeSourceBuffers;
    readonly attribute ReadyState          readyState;
             attribute unrestricted double duration;
             attribute EventHandler        onsourceopen;
             attribute EventHandler        onsourceended;
             attribute EventHandler        onsourceclose;
    SourceBuffer addSourceBuffer(DOMString type);
    void         removeSourceBuffer(SourceBuffer sourceBuffer);
    void         endOfStream(optional EndOfStreamError error);
    void         setLiveSeekableRange(double start, double end);
    void         clearLiveSeekableRange();
    static boolean isTypeSupported(DOMString type);
};
```

#### 2.1 Attributes

**sourceBuffers** of type [`SourceBufferList`](https://www.w3.org/TR/media-source/#idl-def-sourcebufferlist), readonly

​	Contains the list of [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) objects associated with this [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource). When `readyState`equals `"closed"` this list will be empty. Once `readyState` transitions to `"open"` SourceBuffer objects can be added to this list by using `addSourceBuffer()`.

**activeSourceBuffers** of type [`SourceBufferList`](https://www.w3.org/TR/media-source/#idl-def-sourcebufferlist), readonly

​	Contains the subset of `sourceBuffers` that are providing the [selected video track](https://www.w3.org/TR/html51/semantics-embedded-content.html#dom-videotrack-selected), the [enabled audio track(s)](https://www.w3.org/TR/html51/semantics-embedded-content.html#dom-audiotrack-enabled), and the `"showing"` or `"hidden"` text track(s).	

​	[`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) objects in this list *must* appear in the same order as they appear in the `sourceBuffers` attribute; e.g., if only sourceBuffers[0] and sourceBuffers[3] are in `activeSourceBuffers`, then activeSourceBuffers[0] *must* equal sourceBuffers[0] and activeSourceBuffers[1] *must* equal sourceBuffers[3].

**readyState** of type [`ReadyState`](https://www.w3.org/TR/media-source/#idl-def-mediasource-readystate), readonly

Indicates the current state of the [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object. When the [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) is created `readyState` *must* be set to `"closed"`.

**duration** of type `unrestricted double`

Allows the web application to set the presentation duration. The duration is initially set to NaN when the [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object is created.

**onsourceopen** of type `EventHandler`

The event handler for the `sourceopen` event.

**onsourceended** of type `EventHandler`

The event handler for the `sourceended` event.

**onsourceclose** of type `EventHandler`

The event handler for the `sourceclose` event.

#### 2.2 Methods

**addSourceBuffer**

Adds a new [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) to `sourceBuffers`.

| Parameter | Type        | Nullable | Optional | Description |
| --------- | ----------- | -------- | -------- | ----------- |
| type      | `DOMString` | ✘        | ✘        |             |

Return type: [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer)

When this method is invoked, the user agent must run the following steps:

1. If type is an empty string then throw a `TypeError` exception and abort these steps.

2. If type contains a MIME type that is not supported or contains a MIME type that is not supported with the types specified for the other [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) objects in `sourceBuffers`, then throw a `NotSupportedError` exception and abort these steps.

3. If the user agent can't handle any more SourceBuffer objects or if creating a SourceBuffer based on type would result in an unsupported [SourceBuffer configuration](https://www.w3.org/TR/media-source/#sourcebuffer-configuration), then throw a `QuotaExceededError` exception and abort these steps.

4. If the `readyState` attribute is not in the `"open"` state then throw an `InvalidStateError` exception and abort these steps.

5. Create a new [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) object and associated resources.

6. Set the [generate timestamps flag](https://www.w3.org/TR/media-source/#sourcebuffer-generate-timestamps-flag) on the new object to the value in the "Generate Timestamps Flag" column of the byte stream format registry [[MSE-REGISTRY](https://www.w3.org/TR/media-source/#bib-MSE-REGISTRY)] entry that is associated with type.

7. If the [generate timestamps flag](https://www.w3.org/TR/media-source/#sourcebuffer-generate-timestamps-flag) equals true:

   Set the `mode` attribute on the new object to `"sequence"`.

   Otherwise:

   Set the `mode` attribute on the new object to `"segments"`.

8. Add the new object to `sourceBuffers` and [queue a task](https://www.w3.org/TR/html51/webappapis.html#queuing) to [fire a simple event](https://www.w3.org/TR/html51/infrastructure.html#fire) named `addsourcebuffer` at `sourceBuffers`.

9. Return the new object.

**removeSourceBuffer**

Removes a [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) from `sourceBuffers`.

| Parameter    | Type           | Nullable | Optional | Description |
| ------------ | -------------- | -------- | -------- | ----------- |
| sourceBuffer | `SourceBuffer` | ✘        | ✘        |             |

Return type: `void`

When this method is invoked, the user agent must run the following steps:

1. If sourceBuffer specifies an object that is not in `sourceBuffers` then throw a `NotFoundError`exception and abort these steps.
2. If the sourceBuffer.updating attribute equals true, then run the following steps:
   1. Abort the [buffer append](https://www.w3.org/TR/media-source/#sourcebuffer-buffer-append) algorithm if it is running.
   2. Set the sourceBuffer.`updating` attribute to false.
   3. [Queue a task](https://www.w3.org/TR/html51/webappapis.html#queuing) to [fire a simple event](https://www.w3.org/TR/html51/infrastructure.html#fire) named `abort` at sourceBuffer.
   4. [Queue a task](https://www.w3.org/TR/html51/webappapis.html#queuing) to [fire a simple event](https://www.w3.org/TR/html51/infrastructure.html#fire) named `updateend` at sourceBuffer.
3. Let SourceBuffer audioTracks list equal the `AudioTrackList` object returned by sourceBuffer.`audioTracks`.
4. If the SourceBuffer audioTracks list is not empty, then run the following steps:
   1. Let HTMLMediaElement audioTracks list equal the `AudioTrackList` object returned by the `audioTracks` attribute on the HTMLMediaElement.
   2. For each `AudioTrack` object in the SourceBuffer audioTracks list, run the following steps:
      - Set the `sourceBuffer` attribute on the `AudioTrack` object to null.
      - Remove the `AudioTrack` object from the HTMLMediaElement audioTracks list.
      - Remove the `AudioTrack` object from the SourceBuffer audioTracks list.
5. Let SourceBuffer videoTracks list equal the `VideoTrackList` object returned by sourceBuffer.`videoTracks`.
6. If the SourceBuffer videoTracks list is not empty, then run the following steps:
   1. Let HTMLMediaElement videoTracks list equal the `VideoTrackList` object returned by the `videoTracks` attribute on the HTMLMediaElement.
   2. For each `VideoTrack` object in the SourceBuffer videoTracks list, run the following steps:
      - Set the `sourceBuffer` attribute on the `VideoTrack` object to null.
      - Remove the `VideoTrack` object from the HTMLMediaElement videoTracks list.
      - Remove the `VideoTrack` object from the SourceBuffer videoTracks list.
7. Let SourceBuffer textTracks list equal the `TextTrackList` object returned by sourceBuffer.`textTracks`.
8.  For each `TextTrack` object in the SourceBuffer textTracks list, run the following steps: 
   1. Let HTMLMediaElement textTracks list equal the `TextTrackList` object returned by the `textTracks` attribute on the HTMLMediaElement.
   2. For each TextTrack  object in the SourceBuffer textTracks list, run the following steps:
      - Set the `sourceBuffer` attribute on the `TextTrack` object to null.
      - Remove the TextTrack object from the HTMLMediaElement textTracks list.
      - Remove the TextTrack object from the SourceBuffer textTracks list.
9. If sourceBuffer is in `activeSourceBuffers`, then remove sourceBuffer from `activeSourceBuffers` and [queue a task](https://www.w3.org/TR/html51/webappapis.html#queuing) to [fire a simple event](https://www.w3.org/TR/html51/infrastructure.html#fire) named `removesourcebuffer` at the [`SourceBufferList`](https://www.w3.org/TR/media-source/#idl-def-sourcebufferlist) returned by `activeSourceBuffers`.
10. Remove sourceBuffer from `sourceBuffers` and [queue a task](https://www.w3.org/TR/html51/webappapis.html#queuing) to [fire a simple event](https://www.w3.org/TR/html51/infrastructure.html#fire) named `removesourcebuffer` at the [`SourceBufferList`](https://www.w3.org/TR/media-source/#idl-def-sourcebufferlist) returned by `sourceBuffers`.
11. Destroy all resources for sourceBuffer.

**endOfStream**

Signals the end of the stream.

| Parameter | Type               | Nullable | Optional | Description |
| --------- | ------------------ | -------- | -------- | ----------- |
| error     | `EndOfStreamError` | ✘        | ✔        |             |

Return type: `void`

1. If the `readyState` attribute is not in the `"open"` state then throw an `InvalidStateError` exception and abort these steps.
2. If the `updating` attribute equals true on any [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) in `sourceBuffers`, then throw an `InvalidStateError` exception and abort these steps.
3. Run the [end of stream algorithm](https://www.w3.org/TR/media-source/#end-of-stream-algorithm) with the error parameter set to error.

**setLiveSeekableRange**

Updates the [live seekable range](https://www.w3.org/TR/media-source/#live-seekable-range) variable used in [HTMLMediaElement Extensions](https://www.w3.org/TR/media-source/#htmlmediaelement-extensions) to modify `HTMLMediaElement.seekable` behavior.

| Parameter | Type     | Nullable | Optional | Description                              |
| --------- | -------- | -------- | -------- | ---------------------------------------- |
| start     | `double` | ✘        | ✘        | The start of the range, in seconds measured from [presentation start time](https://www.w3.org/TR/media-source/#presentation-start-time). While set, and if `duration` equals positive Infinity, `HTMLMediaElement.seekable` will return a non-empty TimeRanges object with a lowest range start timestamp no greater than start. |
| end       | `double` | ✘        | ✘        | The end of range, in seconds measured from [presentation start time](https://www.w3.org/TR/media-source/#presentation-start-time). While set, and if `duration` equals positive Infinity, `HTMLMediaElement.seekable` will return a non-empty TimeRanges object with a highest range end timestamp no less than end. |

Return type: `void`

When this method is invoked, the user agent must run the following steps:

1. If the `readyState` attribute is not `"open"` then throw an `InvalidStateError` exception and abort these steps.
2. If start is negative or greater than end, then throw a `TypeError` exception and abort these steps.
3. Set [live seekable range](https://www.w3.org/TR/media-source/#live-seekable-range) to be a new [normalized TimeRanges object](https://www.w3.org/TR/html51/semantics-embedded-content.html#normalized-timeranges-object) containing a single range whose start position is start and end position is end.

**clearLiveSeekableRange**

Updates the [live seekable range](https://www.w3.org/TR/media-source/#live-seekable-range) variable used in [HTMLMediaElement Extensions](https://www.w3.org/TR/media-source/#htmlmediaelement-extensions) to modify `HTMLMediaElement.seekable` behavior.

*No parameters.*

Return type: `void`

When this method is invoked, the user agent must run the following steps:

1. If the `readyState` attribute is not `"open"` then throw an `InvalidStateError` exception and abort these steps.
2. If [live seekable range](https://www.w3.org/TR/media-source/#live-seekable-range) contains a range, then set [live seekable range](https://www.w3.org/TR/media-source/#live-seekable-range) to be a new empty `TimeRanges` object.

**isTypeSupported**, static

Check to see whether the [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) is capable of creating [`SourceBuffer`](https://www.w3.org/TR/media-source/#idl-def-sourcebuffer) objects for the specified MIME type.

| Parameter | Type        | Nullable | Optional | Description |
| --------- | ----------- | -------- | -------- | ----------- |
| type      | `DOMString` | ✘        | ✘        |             |

Return type: boolean

When this method is invoked, the user agent must run the following steps:

1. If type is an empty string, then return false.
2. If type does not contain a valid MIME type string, then return false.
3. If type contains a media type or media subtype that the MediaSource does not support, then return false.
4. If type contains a codec that the MediaSource does not support, then return false.
5. If the MediaSource does not support the specified combination of media type, media subtype, and codecs then return false.
6. Return true.

### 2.3 Event Summary

| Event name    | Interface | Dispatched when...                       |
| ------------- | --------- | ---------------------------------------- |
| `sourceopen`  | `Event`   | `readyState` transitions from `"closed"` to `"open"` or from `"ended"` to `"open"`. |
| `sourceended` | `Event`   | `readyState` transitions from `"open"` to `"ended"`. |
| `sourceclose` | `Event`   | `readyState` transitions from `"open"` to `"closed"` or `"ended"` to `"closed"`. |

### 2.4 Algorithms

#### 2.4.1 Attaching to a media element

A [`MediaSource`](https://www.w3.org/TR/media-source/#idl-def-mediasource) object can be attached to a media element by assigning a [MediaSource object URL](https://www.w3.org/TR/media-source/#mediasource-object-url) to the media element `src` attribute or the src attribute of a \<source\> inside a media element. A [MediaSource object URL](https://www.w3.org/TR/media-source/#mediasource-object-url) is created by passing a MediaSource object to `createObjectURL()`.

#### 2.4.2 Detaching from a media element

#### 2.4.3 Seeking

1. If new playback position is not in any `TimeRange` of `HTMLMediaElement.buffered`

   - If the `HTMLMediaElement.readyState` attribute is greater than `HAVE_METADATA`, then set the `HTMLMediaElement.readyState` attribute to `HAVE_METADATA`.
   - The media element waits until an `appendBuffer()` call causes the [coded frame processing algorithm](https://www.w3.org/TR/media-source/#sourcebuffer-coded-frame-processing) to set the `HTMLMediaElement.readyState` attribute to a value greater than `HAVE_METADATA`.

   Otherwise:

   - Continue

2. The media element resets all decoders and initializes each one with data from the appropriate [initialization segment](https://www.w3.org/TR/media-source/#init-segment).

3. The media element feeds [coded frames](https://www.w3.org/TR/media-source/#coded-frame) from the [active track buffers](https://www.w3.org/TR/media-source/#active-track-buffers) into the decoders starting with the closest [random access point](https://www.w3.org/TR/media-source/#random-access-point) before the new playback position.

4. Resume the [seek algorithm](https://www.w3.org/TR/html51/semantics-embedded-content.html#seek) at the "*Await a stable state*" step.

#### SourceBuffer Monitoring 









### 来源

[Media Source Extensions W3C](https://www.w3.org/TR/media-source/)

[媒体源扩展 API](https://developer.mozilla.org/zh-CN/docs/Web/API/Media_Source_Extensions_API)