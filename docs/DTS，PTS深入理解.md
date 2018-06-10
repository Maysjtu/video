## DTS，PTS深入理解

DTS和PTS是音视频同步的关键技术，同时也与丢帧策略密切相关。

**dts/pts定义** 

dts: decoding time stamp

pts: present time stamp

在ISO/IEC13818-1中制定90k Hz 的时钟，如果编码帧频是30，那么**时间戳**间隔就该是90000 / 30 = 3000。 

在FFMPEG中有三种时间单位：秒、微秒和dts/pts

从dts/pts转化为微秒公式：

```
dts* AV_TIME_BASE/ denominator
```

EXT-X-DISCONTINUITY标签，它表征其后面的视频段文件和之前的不连续，这意味着文件格式、时间戳顺序、编码参数等的变化。

