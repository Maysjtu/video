## MP4结构与FMP4结构对比分析

​       ![img](http://hi.csdn.net/attachment/201112/1/0_1322725383TwE9.gif)

​                                                                      图1  普通MP4文件物理结构

​    ![img](http://img.my.csdn.net/uploads/201112/1/2918137_1322726182MkKM.jpg)

​                                                                    图2  fragmented mp4文件结构



在DASH（自适应流媒体传输）中推荐使用的是fragmented Mp4(fMp4)格式，那么这种格式和传统的mp4格式有什么区别呢？

先说结论：在fMp4格式中包含一系列的segments(moof+mdat的组合)，这些segments可以被独立的request（利用byte-range request），这有利于在不同质量级别的码流之间做码率切换操作

介绍一个可以输出mp4 box信息的工具：[MP4dump](https://www.bento4.com/) 下面我们分别dump出一个regular mp4和一个fmp4的box信息，化简如下

regular mp4

```
[ftyp] size=8+16
[moov] size=8+9149
[mdat] size=8+17923439```123
```

如果我们要在两个码流之间做码率切换，就需要找到两个码流中对应时间点的byte position，然而这时候我们只有一个巨大的mdat box，要在这里面找到一个具体的byte position无疑是复杂的。而且，在regular mp4中，有时moov会在巨大的mdat box之后，这也会影响起播的速度。

fmp4

```
[ftyp] size=8+28
[moov] size=8+790
[sidx] size=12+368
[moof] size=8+1304
[mdat] size=8+2447381
[moof] size=8+132
[mdat] size=8+164418
[moof] size=8+1304
[mdat] size=8+2612620
[moof] size=8+132
[mdat] size=8+124621```1234567891011
```

但是在fmp4中就简单多了，首先我们注意到有一个sidx(segment index) box，它记录了各个moof+mdat组成的segment的精确byte position，所以我们只需要Load一个很小的sidx box就能方便的实现码率切换了。sidx box的具体内容如下，size对应各个segment的大小，duration对应时长。

```
entry 0000 = reference_type=0, referenced_size=388331, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0001 = reference_type=0, referenced_size=1135797, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0002 = reference_type=0, referenced_size=1266343, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0003 = reference_type=0, referenced_size=1160677, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0004 = reference_type=0, referenced_size=1180917, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0005 = reference_type=0, referenced_size=842092, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0006 = reference_type=0, referenced_size=1160963, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0007 = reference_type=0, referenced_size=1203216, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0008 = reference_type=0, referenced_size=1234885, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0009 = reference_type=0, referenced_size=1166036, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0010 = reference_type=0, referenced_size=1237774, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0011 = reference_type=0, referenced_size=1162960, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0012 = reference_type=0, referenced_size=1235166, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
......
 entry 0051 = reference_type=0, referenced_size=1195136, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0052 = reference_type=0, referenced_size=1178021, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0053 = reference_type=0, referenced_size=1222620, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0054 = reference_type=0, referenced_size=1197275, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0055 = reference_type=0, referenced_size=1161201, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0056 = reference_type=0, referenced_size=1239388, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0057 = reference_type=0, referenced_size=1186850, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0058 = reference_type=0, referenced_size=1012514, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0059 = reference_type=0, referenced_size=1110407, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0060 = reference_type=0, referenced_size=1055466, subsegment_duration=147456, starts_with_SAP=1, SAP_type=1, SAP_delta_time=0
 entry 0061 = reference_type=0, referenced_size=7954, subsegment_duration=24576, starts_with_SAP=1, SAP_type=1, SAP_delta_time=012345678910111213141516171819202122232425
```

不仅如此，在fmp4中各个segment的duration是可以由我们自己指定的，从而可以保证不同码流的各个segment是time aligned且一定start with关键帧。

最后介绍一个工具[Mp4Fragment](https://www.bento4.com/)，可以将regular MP4转换为fmp4.













### 来源

[音视频学习-FMP4结构之MP4](https://lucius0.github.io/2018/01/14/archivers/media-study-07/)

[What exactly is Fragmented mp4(fMP4)? How is it different from normal mp4?](https://stackoverflow.com/questions/35177797/what-exactly-is-fragmented-mp4fmp4-how-is-it-different-from-normal-mp4)

[自适应流媒体传输（二）——为什么要使用fragmented MP4](https://blog.csdn.net/nonmarking/article/details/53439481)