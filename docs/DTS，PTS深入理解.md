## DTS，PTS深入理解

DTS和PTS是音视频同步的关键技术，同时也与丢帧策略密切相关。

**dts/pts定义** 

dts: decoding time stamp

pts: present time stamp

在ISO/IEC13818-1中制定90k Hz 的时钟，如果编码帧频是30，那么**时间戳**间隔就该是90000 / 30 = 3000。 

 为什么是90000k Hz的时钟：

> You can find the answer in "*RTP: Audio and Video for the Internet*" by Colin Perkins p.154
>
> In short, such rate is chosen so that the frame rates that are common to majority of the formats will have integer timestamp increment i.e. the division still can have reminder but it will be of negligible range.

在FFMPEG中有三种时间单位：秒、微秒和dts/pts

从dts/pts转化为微秒公式：

```
dts* AV_TIME_BASE/ denominator
```

EXT-X-DISCONTINUITY标签，它表征其后面的视频段文件和之前的不连续，这意味着文件格式、时间戳顺序、编码参数等的变化。



### 参考

[DTS和PTS的解释（FFMPEG、HLS相关）](http://www.cnblogs.com/fpzeng/archive/2012/07/26/dts_pts.html)

[Why RTP's timestamp for video payload use a 90 kHz clock rate?](https://stackoverflow.com/questions/43845905/why-rtps-timestamp-for-video-payload-use-a-90-khz-clock-rate)