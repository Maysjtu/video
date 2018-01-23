## MSE

MSE 中主要内容就是 MS 和 SourceBuffer，我们接下来着重介绍一下。

## MediaSource

### 基本 API

整个 MS 内容可以直接参考 [W3C](https://w3c.github.io/media-source/#mediasource)：

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

我们先从静态属性来看一下。

### isTypeSupported

isTypeSupported 主要是用来检测 MS 是否支持某个特定的编码和容器盒子。例如：

```javascript
MediaSource.isTypeSupported('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')
```

那我怎么查看我想要使用到的 MIME 呢？

如果你有现成的 video 文件，可以直接使用 FFmpeg 进行分析：`ffmpge -i video.mp4`。不过，这个只是给你文件的相关描述，例如：

```
Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'video.mp4':
Metadata:
major_brand     : isom
minor_version   : 1
compatible_brands: isomavc1
Duration: 00:00:03.94, start: 0.000000, bitrate: 69 kb/s
Stream #0:0(und): Audio: aac (LC) (mp4a / 0x6134706D), 48000 Hz, stereo, fltp, 61 kb/s (default)
Metadata:
handler_name    : SoundHandler
```

那实际怎么得到，像上面一样的 `video/mp4; codecs="avc1.42E01E, mp4a.40.2"` 的 MIME 内容呢？具体映射主要参考：[MIME doc](https://wiki.whatwg.org/wiki/Video_type_parameters#Browser_Support) 即可。

### SourceBuffer 的处理

SourceBuffer 是 MS 下的一个子集，相当于就是具体的音视频轨道，具体内容是啥以及干啥的，我们在后面有专题进行介绍。在 MS 层，提供了相关的 API 可以直接对 SB 进行相关的创建，删除，查找等。

#### addSourceBuffer

该是用来返回一个具体的视频流 SourceBuffer，接受一个 mimeType 表示该流的编码格式。例如：

```javascript
var mimeType = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
var sourceBuffer = mediaSource.addSourceBuffer(mimeType);
```

实际上，SourceBuffer 的操作才是真正影响到 video/audio 播放的内容。

```javascript
function sourceOpen (_) {
  var mediaSource = this;
  var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
  fetchAB(assetURL, function (buf) {
    sourceBuffer.addEventListener('updateend', function (_) {
      mediaSource.endOfStream();
      video.play();
    });
    // 通过 fetch 添加视频 Buffer
    sourceBuffer.appendBuffer(buf);
  });
};
```

它通过 appendBuffer 直接添加视频流，实现播放。不过，在使用 addSourceBuffer 创建之前，还需要保证当前浏览器是否支持该编码格式。当然，不支持也行，顶多是当前 MS 报错，断掉当前 JS 线程。

#### removeSourceBuffer

用来移除某个 sourceBuffer。比如当前流已经结束，那么你就没必要再保留当前 SB 来占用空间，可以直接移除。具体格式为：

```javascript
mediaSource.removeSourceBuffer(sourceBuffer);
```

#### sourceBuffers

sourceBuffers 是 MS 实例上的一个属性，它返回的是一个 `SourceBufferList` 的对象，里面可以获取当前 MS 上挂载的所有 SB。不过，只有当 MS 为 `open` 状态的时候，它才可以访问。具体使用为：

```javascript
let SBs = mediaSource.sourceBuffers;
```

那我们怎么获取到具体的 SB 对象呢？因为，其返回值是 `SourceBufferList` 对象，具体格式为：

```typescript
interface SourceBufferList : EventTarget {
    readonly attribute unsigned long length;
             attribute EventHandler  onaddsourcebuffer;
             attribute EventHandler  onremovesourcebuffer;
    getter SourceBuffer (unsigned long index);
};
```

简单来说，你可以直接通过 index 来访问具体的某个 SB:

```Javascript
let SBs = mediaSource.sourceBuffers;
let SB1 = SBs[0];
```

SBL 对象还提供了 `addsourcebuffer` 和 `removesourcebuffer` 事件，如果你想监听 SB 的变化，可以直接通过 SBL 来做。这也是为什么 MS 没有提供监听事件的一个原因。

所以，删除某一个 SB 就可以通过 SBL 查找，然后，利用 remove 方法移除即可：

```javascript
let SBs = mediaSource.sourceBuffers;
let SB1 = SBs[0];
mediaSource.removeSourceBuffer(SB1);
```

另外，MS 上，还有另外一个 SBL。基本内容为：

#### activeSourceBuffers

activeSourceBuffers 实际上是 sourceBuffers 的子集，返回的同样也是 SBL 对象。为什么说也是子集呢？

因为 ASBs 包含的是当前正在使用的 SB。因为前面说了，每个 SB 实际上都可以具体代表一个 track，比如，video track，audio track，text track 等等，这些都算。那怎么标识正在使用的 SB 呢？

很简单，不用标识啊，因为，控制哪一个 SB 正在使用是你来决定的。如果非要标识，就需要使用到 HTML 中的 video 和 audio 节点。通过

```javascript
audioTrack = media.audioTracks[index]
videoTrack = media.videoTracks[index]

// media 为具体的 video/audio 的节点
// 返回值就是 video/audio 的底层 tracks

audioTrack = media.audioTracks.getTrackById( id )
videoTrack = media.videoTracks.getTrackById( id )

videoTrack.selected // 返回 boolean 值，标识是否正在被使用
```

上面的代码只是告诉你，`正在使用` 的含义是什么。对于，我们实际编码的 SB 来说，并没有太多关系，了解就好。上面说了 ASBs 返回值也是一个 SBL。所以，使用方式可以直接参考 SBL 即可。

### 状态切换

要说道状态切换，我们得先知道 MS 一共有几个状态值。MS 本身状态并不复杂，一共只有三个状态值：

```typescript
enum ReadyState {
    "closed",
    "open",
    "ended"
};
```

- closed: 当前的 MS 并没有和 HTMLMedia 元素连接
- open: MS 已经和 HTMLMedia 连接，并且等待新的数据被添加到 SB 中去。
- ended: 当调用 `endOfStream` 方法时会触发，并且此时依然和 HTMLMedia 元素连接。

记住，closed 和 ended 到的区别关键点在于有没有和 HTMLMedia 元素连接。

其对应的还有三个监听事件：

- sourceopen: 当状态变为 `open` 时触发。常常在 MS 和 HTMLMedia 绑定时触发。
- sourceended: 当状态变为 `ended` 时触发。
- sourceclose: 当状态变为 `closed` 时触发。

那哪种条件下会触发呢？

`sourceopen` 事件相同于是一个总领事件，只有当 sourceopen 时间触发后，后续对于 MS 来说，才是一个可操作的对象。

通常来说，只有当 MS 和 video 元素成功绑定时，才会正常触发：

```javascript
let mediaSource = new MediaSource();
vidElement.src = URL.createObjectURL(mediaSource);
```

其实这简单的来说，就是给 MS 添加 HTML media 元素。其整个过程为：

1. 先延时 media 元素的 load 事件，将 `delaying-the-load-event-flag` 设置为 false
2. 将 `readyState` 设置为 open。
3. 触发 MS 的 sourceopen 事件

**sourceended 触发**

sourceended 的触发条件其实很简单，只有当你调用 endOfStream 的时候，会进行相关的触发。

```
mediaSource.endOfStream();
```

**sourceclose 的触发**

sourceclose 是在 media 元素和 MS 断开的时候，才会触发。那这个怎么断开呢？

难道直接将 media 的元素的 src 直接设置为 null 就 OK 了吗？

要是这样，我就日了狗了。MS 会这么简单么？实际上并不，如果要手动触发 sourceclose 事件的话，则需要下列步骤：

1. 将 readyState 设置为 closed
2. 将 MS.duration 设置为 NaN
3. 移除 activeSourceBuffers 上的所有 Buffer
4. 触发 activeSourceBuffers 的 `removesourcebuffer` 事件
5. 移除 sourceBuffers 上的 SourceBuffer。
6. 触发 sourceBuffers 的 `removesourcebuffer` 事件
7. 触发 MediaSource 的 `sourceclose` 事件

到这里，三个状态事件基本就介绍完了。不过，感觉只有 `sourceopen` 才是最有用的一个。

### track 的切换

track 这个概念其实是音视频播放的轨道，它和 MS 没有太大的关系。不过，和 SB 还是有一点关系的。因为，某个一个 SB 里面可能会包含一个 track 或者说是几个 track。所以，推荐某一个 SB 最好包含一个值包含一个 track，这样，后面的 track 也方便更换。

在 track 中的替换里，有三种类型，audio，video，text 轨道。

**移除原有不需要 track**

1. 从 activeSourceBuffers 移除与当前 track 相关的 SB
2. 触发 activeSourceBuffers 的 `removesourcebuffer` 事件

**添加指定的 track**

1. 从 activeSourceBuffers 添加指定的 SourceBuffer
2. 触发 activeSourceBuffers 的 addsourcebuffer 事件

#### audio 切换

audio 的切换和 video 的过程一模一样。这里我就不过多赘述了。

### MS duration 修正机制

MS 的 duration 实际上就是 media 中播放的时延。通常来说，A/V track 实际上是两个独立的播放流，这中间必定会存在先关的差异时间。但是，media 播放机制永远会以最长的 duration 为准。

这种情况对于 live stream 的播放，特别适合。因为 liveStream 是不断动态添加 buffer，但是 buffer 内部会有一定的时长的，而 MS 就需要针对这个 buffer 进行动态更新。

整个更新机制为：

1. 当前 MS.duration 更新为 new duration。
2. 如果 new duration 比 sourceBuffers 中的最大的 pts 小，这时候就会报错。
3. 让最后一个的 sample 的 end time 为所后 timeRanges 的 end time。
4. 将 new duration 设置为当前 SourceBuffer 中最大的 endTime。
5. 将 video/audio 的播放时长（duration） 设置为最新的 new duration。

## SourceBuffer

SourceBuffer 则是 MS 子属中最重要的内容。也就是说，所有的 media track 的内容都是存储在 SB 里面的。

```Typescript
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

其中，SB 中有一个很重要的概念–`mode`。该字段决定了 A/V segment 是怎样进行播放的。

### 播放模式

`mode` 的取值有两个，一个是 `segments`，一个是 `sequence`。

segments 表示 A/V 的播放时根据你视频播放流中的 pts 来决定，该模式也是最常使用的。因为音视频播放中，最重要的就是 pts 的排序。因为，pts 可以决定播放的时长和顺序，如果一旦 A/V 的 pts 错开，有可能就会造成 A/V sync drift。

sequence 则是根据空间上来进行播放的。每次通过 `appendBuffer` 来添加指定的 Buffer 的时候，实际上就是添加一段 A/V segment。此时，播放器会根据其添加的位置，来决定播放顺序。还需要注意，在播放的同时，你需要告诉 SB，这段 segment 有多长，也就是该段 Buffer 的实际偏移量。而该段偏移量就是由 `timestampOffset` 决定的。整个过程用代码描述一下就是：

```javascript
sb.appendBuffer(media.segment);
sb.timestampOffset += media.duration;
```

另外，如果你想手动更改 `mode` 也是可以的，不过需要注意几个先决条件：

1. 对应的 SB.updating 必须为 false.
2. 如果该 parent MS 处于 `ended` 状态，则会手动将 MS readyState 变为 `open` 的状态。

### 如何界定 track

这里先声明一下，track 和 SB 并不是一一对应的关系。他们的关系只能是 SB : track = 1: 1 or 2 or 3。即，一个 SB可能包含，一个 A/V track(1)，或者，一个 Video track ，一个Audio track(2)，或者 再额外加一个 text track(3)。

上面也说过，推荐将 track 和 SB 设置为一一对应的关系，应该这样比较好控制，比如，移除或者同步等操作。具体编码细节我们有空再说，这里先来说一下，SB 里面怎么决定 track 的播放。

track 最重要的特性就是 pts ，duration，access point flag。track 中 最基本的单位叫做 Coded Frame，表示具体能够播放的音视频数据。它本身其实就是一些列的 media data，并且这些 media data 里面必须包含 pts，dts，sampleDuration 的相关信息。在 SB 中，有几个基本内部属性是用来标识前面两个字段的。

- `last decode timestamp`: 用来表示最新一个 frame 的编码时间（pts）。默认为 null 表示里面没有任何数据
- `last frame duration`: 表示 coded frame group 里面最新的 frame 时长。
- `highest end timestamp`: 相当于就是最后一个 frame 的 pts + duration
- `need random access point flag`: 这个就相当于是同步帧的意思。主要设置是根据音视频流 里面具体字段决定的，和前端这边编码没关系。
- `track buffer ranges`: 该字段表示的是 coded frame group 里面，每一帧对应存储的 pts 范围。

这里需要特别说一下 last frame duration 的概念，其实也就是 `Coded Frame Duration` 的内容。

`Coded Frame Duration` 针对不同的 track 有两种不同的含义。一种是针对 video/text 的 track，一种是针对 audio 的 track:

- video/text: 其播放时长（duration）直接是根据 pts 直接的差值来决定，和你具体播放的 samplerate 没啥关系。虽然，官方也有一个计算 refsampelDuration 的公式：`duration = timescale / fps`，不过，由于视频的帧率是动态变化的，没什么太大的作用。
- audio: audio 的播放时长必须是严格根据采样频率来的，即，其播放时间必须和你自己定制的 timescale 以及 sampleRate 一致才行。针对于 AAC，因为其采样频率常为 `44100Hz`，其固定播放时长则为：`duration = 1024 / sampleRate * timescale`

**所以，如果你在针对 unstable stream 做同步的话，一定需要注意这个坑。有时候，dts 不同步，有可能才是真正的同步。**

我们再回到上面的子 title 上-- `如果界定 track`。一个 SB 里面是否拥有一个或者多个 track，主要是根据里面的视频格式来决定的。打个比方，比如，你是在编码 MP4 的流文件。它里面的 track 内容，则是根据 `moov box` 中的 `trak box` 来判断的。即，如果你的 MP4 文件只包含一个，那么，里面的 track 也有只有一个。

### SB buffer 的管理

SB 内部的状态，通常根据一个属性：`updating` 值来更新。即，它只有 true 或者 false 两种状态：

- true：当前 SB 正在处理添加或者移除的 segment
- false：当前 SB 处于空闲状态。当且仅当 updating = false 的时候，才可以对 SB 进行额外的操作。

SB 内部的 buffer 管理主要是通过 `appendBuffer(BufferSource data)` 和 `remote()` 两个方法来实现的。当然，并不是所有的 Buffer 都能随便添加给指定的 SB，这里面是需要条件和相关顺序的。

- 该 buffer，必须满足 MIME 限定的类型
- 该 buffer，必须包含 initialization segments（IS） 和 media segments（MS）.

下图是相关的支持 [MIME](https://w3c.github.io/media-source/byte-stream-format-registry.html)：

![image.png-107.1kB](http://static.zybuluo.com/jimmythr/m9zrb2j86mll6567lq36s4bn/image.png)

这里需要提醒大家一点，MSE 只支持 fmp4 的格式。具体内容可以参考: [FMP4 基本解析](https://www.villainhr.com/page/2017/08/21/%E5%AD%A6%E5%A5%BD%20MP4%EF%BC%8C%E8%AE%A9%E7%9B%B4%E6%92%AD%E6%9B%B4%E7%BB%99%E5%8A%9B)。上面提到的 IS 和 MS 实际上就是 FMP4 中不同盒子的集合而已。

#### Initialization segments

FMP4 中的 IS 实际上就是：`ftyp + moov`。里面需要包含指定的 track ID，相关 media segment 的解码内容。下面为基本的格式内容：

```
[ftyp] size=8+24
  major_brand = isom
  minor_version = 200
  compatible_brand = isom
  compatible_brand = iso2
  compatible_brand = avc1
  compatible_brand = mp41
[mdat] 
[moov] 
  [mvhd] 
    timescale = 1000
    duration = 13686
    duration(ms) = 13686
  [trak] 
  [trak] 
  [udta] 
```

具体内容编码内容，我们就放到后面来讲解，具体详情可以参考：[W3C Byte Stream Formats](https://w3c.github.io/media-source/#byte-stream-format-specs%BC%8C%E8%AE%A9%E7%9B%B4%E6%92%AD%E6%9B%B4%E7%BB%99%E5%8A%9B)。我们可以把 IS 类比为一个文件描述头，该头可以指定该音视频的类型，track 数，时长等。

MS 是具体的音视频流数据，在 FMP4 格式中，就相当于为 `moof + mdat` 两个 box。MS 需要包含已经打包和编码时间后的数据，其会参考最近的 IS 头内容。

相关格式内容，可以直接参考 [MP4 格式解析](https://www.villainhr.com/page/2017/08/21/%E5%AD%A6%E5%A5%BD%20MP4%EF%BC%8C%E8%AE%A9%E7%9B%B4%E6%92%AD%E6%9B%B4%E7%BB%99%E5%8A%9B)。

在了解了 MS 和 IS 之后，我们就需要使用相应的 API 添加/移除 buffer 了。

这里，需要注意一下，在添加 Buffer 的时候，你需要了解你所采用的 `mode` 是哪种类型，`sequence` 或者 `segments`。这两种是完全两种不同的添加方式。

**segments**

这种方式是直接根据 MP4 文件中的 pts 来决定播放的位置和顺序，它的添加方式极其简单，只需要判断 updating === false，然后，直接通过 appendBuffer 添加即可。

```
if (!sb.updating) {
    let MS = this._mergeBuffer(media.tmpBuffer);
           
    sb.appendBuffer(MS); // ****

    media.duration += lib.duration; 
    media.tmpBuffer = [];
}
```

**sequence**

如果你是采用这种方式进行添加 Buffer 进行播放的话，那么你也就没必要了解 FMP4 格式，而是了解 MP4 格式。因为，该模式下，SB 是根据具体添加的位置来进行播放的。所以，如果你是 FMP4 的话，有可能就有点不适合了。针对 sequence 来说，每段 buffer 都必须有自己本身的指定时长，每段 buffer 不需要参考的 `baseDts`，即，他们直接可以毫无关联。那 sequence 具体怎么操作呢？

简单来说，在每一次添加过后，都需要根据指定 SB 上的 `timestampOffset`。该属性，是用来控制具体 Buffer 的播放时长和位置的。

```
if (!sb.updating) {
    let MS = this._mergeBuffer(media.tmpBuffer);
           
    sb.appendBuffer(MS); // ****

    sb.timestampOffset += lib.duration; // ****
    media.tmpBuffer = [];
}
```

上面两端打 * 号的就是重点内容。该方式比较容易用来直接控制 buffer 片段的添加，而不用过度关注相对 baseDTS 的值。

### 控制播放片段

如果要在 video 标签中控制指定片段的播放，一般是不可能的。因为，在加载整个视频 buffer 的时候，视频长度就已经固定的，剩下的只是你如果在 video 标签中控制播放速度和音量大小。而在 MSE 中，如何在已获得整个视频流 Buffer 的前提下，完成底层视频 Buffer 的切割和指定时间段播放呢？

```
sourceBuffer.appendWindowStart = 2.0;
sourceBuffer.appendWindowEnd = 5.0;
```

设置添加 Buffer 的时间戳为 [2s,5s] 之间。`appendWindowStart` 和 `appendWindowEnd` 的基准单位为 `s`。该属性值，通常在添加 Buffer 之前设置。

### SB 内存释放

SB 内存释放其实就和在 JS 中，将一个变量指向 null 一样的过程。

```
var a = new ArrayBuffer(1024 * 1000);
a = null; // start garbage collection
```

在 SB 中，简单的来说，就是移除指定的 time ranges’ buffer。需要用到的 API 为：

```
remove(double start, unrestricted double end);
```

具体的步骤为：

- 找到具体需要移除的 segment。
- 得到其开始（start）的时间戳（以 s 为单位）
- 得到其结束（end）的时间戳（以 s 为单位）
- 此时，updating 为 true，表明正在移除
- 完成之后，触发 updateend 事件

如果，你想直接清空 Buffer 重新添加的话，可以直接利用 `abort()` API 来做。它的工作是清空当前 SB 中所有的 segment，使用方法也很简单，不过就是需要注意不要和 remove 操作一起执行。更保险的做法就是直接，通过 `updating===false` 来完成：

```
if(sb.updating===false){
    sb.abort();
}
```

 这时候，abort 的主要流程为：

- 确保 MS.readyState===“open”
- 将 appendWindowStart 设置为 pts 原始值，比如，0
- 将 appendWindowEnd 设置为正无限大，即，`Infinity`。

到这里，整个流程差不多就已经介绍完了。实际代码，可以参考一下，w3c 的 [example](https://w3c.github.io/media-source/#examples)。下面一篇文章，我们主要来查阅一下，实际 HTMLMediaElement 和 MSE 之间又有啥不干净的关系。



### 来源

[无 Flash 时代，让直播拥抱 H5（MSE篇）](https://www.villainhr.com/page/2017/10/10/%E6%97%A0%20Flash%20%E6%97%B6%E4%BB%A3%EF%BC%8C%E8%AE%A9%E7%9B%B4%E6%92%AD%E6%8B%A5%E6%8A%B1%20H5%EF%BC%88MSE%E7%AF%87%EF%BC%89)

