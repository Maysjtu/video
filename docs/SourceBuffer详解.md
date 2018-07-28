# SourceBuffer详解

SourceBuffer 是由`mediaSource` 创建，并直接和 `HTMLMediaElement`接触。简单来说，它就是一个流的容器，里面提供的 `append()`，`remove()`来进行流的操作，它可以包含一个或者多个 `media segments`。同样，接下来，我们再来看一下该构造函数上的基本属性和内容。

###  基础内容

前面说过 sourceBuffer 主要是一个用来存放流的容器，那么，它是怎么存放的，它存放的内容是啥，有没有顺序等等。这些都是 sourceBuffer 最最根本的问题。OK，接下来，我们来看一下的它的基本架构有些啥。

参考[ W3C](https://www.w3.org/TR/media-source/#sourcebuffer)，可以基本了解到里面的内容为：

```java
 interface SourceBuffer : EventTarget {
             attribute AppendMode          mode;
    readonly attribute boolean             updating;
    readonly attribute TimeRanges          buffered;
             attribute double              timestampOffset;
    readonly attribute AudioTrackList      audioTracks;
    readonly attribute VideoTrackList      videoTracks;
    readonly attribute TextTrackList       textTracks;
             attribute double              appendWindowStart;
             attribute unrestricted double appendWindowEnd;
             attribute EventHandler        onupdatestart;
             attribute EventHandler        onupdate;
             attribute EventHandler        onupdateend;
             attribute EventHandler        onerror;
             attribute EventHandler        onabort;
    void appendBuffer(BufferSource data);
    void abort();
    void remove(double start, unrestricted double end);
};
```

上面这些属性决定了其 sourceBuffer 整个基础。

```ts
enum AppendMode {
    "segments",
    "sequence"
};
```

| Enumeration description |                                                              |
| ----------------------- | ------------------------------------------------------------ |
| `segments`              | The timestamps in the media segment determine where the [coded frames](https://www.w3.org/TR/media-source/#coded-frame) are placed in the presentation. Media segments can be appended in any order.媒体片段里面的时间戳决定了编码帧的展示。媒体片段可以以任意的顺序插入。 |
| `sequence`              | Media segments will be treated as adjacent in time independent of the timestamps in the media segment. Coded frames in a new media segment will be placed immediately after the coded frames in the previous media segment. The `timestampOffset` attribute will be updated if a new offset is needed to make the new media segments adjacent to the previous media segment. Setting the `timestampOffset` attribute in `"sequence"` mode allows a media segment to be placed at a specific position in the timeline without any knowledge of the timestamps in the media segment.每个媒体片段将被视为与时间相邻，与媒体片段中的时间戳无关。新的媒体片段中的编码中会被立即放置在上一个媒体片段编码帧的后面。在sequence模式下设置timestampOffset可以将一个未知时间戳的媒体片段放在特定的位置。 |





 首先是 `mode`。上面说过，SB(SourceBuffer) 里面存储的是 media segments（就是你每次通过 append 添加进去的流片段）。SB.mode 有两种格式：

- segments: 乱序排放。通过 `timestamps` 来标识其具体播放的顺序。比如：20s的 buffer，30s 的 buffer 等。
- sequence: 按序排放。通过 `appendBuffer` 的顺序来决定每个 mode 添加的顺序。`timestamps` 根据 sequence 自动产生。

那么上面两个哪个是默认值呢？

当 `media segments` 天生自带`timestamps`，那么 `mode` 就为 `segments` ，否则为 `sequence`。所以，一般情况下，我们是不用管它的值。不过，你可以在后面，将 `segments` 设置为 `sequence` 这个是没毛病的。反之，将 `sequence` 设置为 `segments` 就有问题了。

```js
var bufferMode = sourceBuffer.mode;
if (bufferMode == 'segments') {
  sourceBuffer.mode = 'sequence';
}
```





sourceBuffer.appendWindowStart不能更改？改了会导致无法解析？因为没有拿到initialSegment吗？

> NOTE
>
> Some implementations *may* choose to collect some of these coded frames with presentation timestamp less than `appendWindowStart` and use them to generate a splice at the first coded frame that has a [presentation timestamp](https://www.w3.org/TR/media-source/#presentation-timestamp) greater than or equal to `appendWindowStart`even if that frame is not a [random access point](https://www.w3.org/TR/media-source/#random-access-point). Supporting this requires multiple decoders or faster than real-time decoding so for now this behavior will not be a normative requirement.

是因为appendWindowStart定义的时间点不是关键帧的点，导致视频无法解析。



sourceBuffer.appendWindowEnd可以改。

结束时间与视频解码无关。



sourceBuffer.timestampOffset

可以用于两个视频无缝播放

[How do i append two video files data to a source buffer using media source api?](https://stackoverflow.com/questions/14108536/how-do-i-append-two-video-files-data-to-a-source-buffer-using-media-source-api)



即使当前sourceBuffer正在播放也会被覆盖？会打断播放吗，仔细看下。





### 来源

[全面进阶 H5 直播（下）](https://cloud.tencent.com/developer/article/1005457)