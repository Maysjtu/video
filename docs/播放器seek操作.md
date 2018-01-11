## 播放器seek操作

### seek操作

ffmpeg 提供了 av_seek_frame 这样一个api用来执行seek操作，函数定义如下：

```c
/**
 * Seek to the keyframe at timestamp.
 * 'timestamp' in 'stream_index'.
 *
 * @param s media file handle
 * @param stream_index If stream_index is (-1), a default
 * stream is selected, and timestamp is automatically converted
 * from AV_TIME_BASE units to the stream specific time_base.
 * @param timestamp Timestamp in AVStream.time_base units
 *        or, if no stream is specified, in AV_TIME_BASE units.
 * @param flags flags which select direction and seeking mode
 * @return >= 0 on success
 */
int av_seek_frame(AVFormatContext *s, int stream_index, int64_t timestamp,
                  int flags);
```

第一个参数是从 avformat_open_input 得到的一个 AVFormatContext
第二个参数是 stream 的 index，可以传入 -1，表示选用默认的 stream
第三个参数 timestamp 传入要定位到的时间点，以 AV_TIME_BASE 为单位

第四个参数 flags 可以是以下的可选常量组合：

```c
#define AVSEEK_FLAG_BACKWARD 1 ///< seek backward
#define AVSEEK_FLAG_BYTE 2 ///< seeking based on position in bytes
#define AVSEEK_FLAG_ANY 4 ///< seek to any frame, even non-keyframes
#define AVSEEK_FLAG_FRAME 8 ///< seeking based on frame number
```

第一，我们的 player 是多线程运行的，执行 seek 操作，多数时候是在 ui 的主线程中进行的，比如 windows 的窗口处理函数，android 的 Activity UI 主线程。而在调用这个函数的同时，我们有 demux 线程、audio 解码线程、video 解码线程，等是同时在执行的，并且有很大可能性会访问到共享资源的。比如，demux 用到的 AVFormatContext、解码用到的 AVCodecContext、……。所以我们需要**暂停这些线程**，执行 av_seek_frame，然后再恢复这些线程。

第二，仅仅是暂停线程然后恢复，还是不够的。因为我们的 pktqueue 里面有 demux 出来的音频 packet 队列和视频 packet 队列。而且这两个队列还比较长，为了保证良好的音视频同步，我们一般将其设定得比较大。那么 **seek 之前暂停相关线程，seek 之后恢复相关线程**，pktqueue 里面的包队列，仍然会残留了 seek 之前的音视频 packet。**seek 之后这些 packet 会被继续解码并播放**，等于就是 seek 后我们仍然会看到 seek 之前的音视频回放，而且可能会持续好几秒，这当然是不能接受的。

第三，av_seek_frame 可以帮我们**定位到关键帧和非关键帧**。定位到非关键帧肯定是不行的，因为视频的解码需要依赖于关键帧。如果跳过关键帧，解码出来的图像是会出现马赛克的，影响用户体验。通常情况下，我们的 seek 接口都是以 ms 为单位的，如果指定的 ms 时间点，刚好不是关键帧（这个概率很大），ffmpeg 会自动往回 seek 到最近的关键帧，这就是 AVSEEK_FLAG_BACKWARD 这个 flag 的含义。如果不加入这个 flag，av_seek_frame 可以精确的定位到 timestamp 附近的音视频帧上，但是不会保证是关键帧；如果加上这个 flag 可以保证关键帧，但是又没法保证 seek 的精度，因为有可能会往回 seek。所以**如何做到避免马赛克，又能保证定位精度呢**？

最后，seek 的时候，要暂停相关线程、恢复相关线程、清空 packet 队列、处理好多线程的同步等等问题。一旦与多线程扯上关系了，问题往往就比较复杂……

从 ffmpeg 的 api 角度来看，seek 的核心是 av_seek_frame 这个 api 的调用，所有的操作都是围绕它来进行。但是从多线程的角度来看，事情却没那么简单，因为多线程运行时，问题的核心在于共享资源和线程间的同步。前面提到播放器就如同工厂的流水线，每一道工序就对应了一个处理线程。那么 seek 操作，基本上就可以理解为，我们要把流水线停下来，还要把流水线上已经存在的全部零部件都撤走，然后从源头重新上新的原材料，最后重新启动流水线。可以看到这个动作的代价是巨大且耗时的。

所以，正确的 seek 流程是什么：

1. 想尽办法停下 demux 线程、音频解码线程、视频解码线程，这三个线程
2. 清空 packet 队列，清空 adev 和 vdev 内部的缓存
3. 恢复线程并解码音频视频（此时还不能进入正常播放状态，不能做音视频渲染）
4. 解码出的音视频帧的 pts 如果小于 seek 的目标 pts，则全部丢掉
5. 一直解码直到音视频帧的 pts 大于等于 seek 的目标 pts，恢复音视频渲染
6. 恢复到正常的播放状态



## 无阻塞的 seek 操作

在最新的 ffplayer 代码中，我们实现了 0ms 延时的、快速的、无阻塞的 seek 操作，这算是一次较大的优化动作。前面提到了 seek 操作的复杂性，这些操作是非常耗时的，如果这些操作全部在 UI 主线程中执行，给人的感觉就是卡顿、反应慢。ffplayer 早期的实现，就是把 seek 操作的全部动作，都放到了 player_seek 这个函数中，里面有两次耗时的等待，一次是等待 demux 和解码线程的暂停，另一次是等待重新解码至指定的 pts 上。这两次等待有时会消耗非常长的时间（几秒甚至十几秒），这样会导致用户体验差。一种简单的优化，就是在 UI 代码中，将 player_seek 放到一个线程中去执行和处理，但这样会增加 UI 层代码的复杂性。

在最新代码中，player_seek 的内部实现，改为了无等待无阻塞的实现，任何情况下执行 player_seek 耗时都是 0ms。优化的方式，就是将阻塞和耗时的动作，放到了 demux 线程中去做，player_seek 中只做了简单的时间计算和 seek 操作标志位的设置。经过优化后 seek 操作的速度、准确性，都有了极大提升。（具体的优化方法，大家可以对比阅读前后两个版本的 ffplayer 的源代码）

一个简单的 seek 操作，其内部实现并不简单，要真正做好做到最优化，不仅要明白原理，处理好多线程的同步，还需要反复的调试优化。