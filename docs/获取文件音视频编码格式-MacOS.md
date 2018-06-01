## 获取文件音视频编码格式-MacOS

### 一、MP4文件操作步骤

1. 下载**Bento4**C++源代码

   git clone https://github.com/axiomatic-systems/Bento4.git

2. 安装cmake

   brew install cmake

3. 进入bento4源码路径下

   #### CMake/Make

   ```
   mkdir cmakebuild
   cd cmakebuild
   cmake -DCMAKE_BUILD_TYPE=Release ..
   make
   ```

   将其中的可执行文件拷贝到/bin目录下，可以全局执行

4. 具体使用方法

   ```
   mp4info video.mp4 | grep Codec
   ```

   That will return something like

   ```
   Codecs String: avc1.64001F
   Codecs String: mp4a.40.2
   ```

   And then do

   ```
   MediaSource.isTypeSupported('video/mp4; codecs="avc1.64001F,mp4a.40.2"')
   ```

#### 其他

https://stackoverflow.com/questions/16363167/html5-video-tag-codecs-attribute 对编码格式进行了详细解析



The `codecs` parameter is specified by [RFC 6381](http://tools.ietf.org/html/rfc6381). Specifically, see [section 3.3](http://tools.ietf.org/html/rfc6381#section-3.3) for the meaning of `avc1` and `mp4a` values.

In the case of `avc1.4D401E`, `avc1` indicates H.264 video, and this is followed by a dot and three 2-digit hexadecimal numbers defined by [the H.264 standard](http://www.itu.int/rec/T-REC-H.264):

1. `profile_idc`
2. the byte containing the `constraint_set` flags (currently `constraint_set0_flag` through `constraint_set5_flag`, and the `reserved_zero_2bits`)
3. `level_idc`

Some examples:

- `avc1.42E01E`: H.264 Constrained Baseline Profile Level 3
- `avc1.4D401E`: H.264 Main Profile Level 3
- `avc1.64001E`: H.264 High Profile Level 3

These are also the second, third, and fourth bytes of the Sequence Parameter Set and the AVC Configuration Box in an MP4 file. You can dump these bytes using a program such as [`mp4file`](http://code.google.com/p/mp4v2/): `mp4file --dump movie.mp4`. Look for the `avcC` (AVC Configuration) Box and the hexadecimal values for `AVCProfileIndication`, `profile_compatibility`, and `AVCLevelIndication`.

As for `mp4a.40.2`, `mp4a` indicates MPEG-4 audio. It is followed by a dot and a hexadecimal `ObjectTypeIndication` (`objectTypeId` in `mp4file` output), which can be looked up on [the MPEG4 registration site](http://www.mp4ra.org/object.html). If this hexadecimal value is `40` (ISO/IEC 14496-3 Audio), it is followed by another dot and an audio object type in decimal. These are listed in the ISO/IEC 14496-3 standard and on [Wikipedia](https://en.wikipedia.org/wiki/MPEG-4_Part_3#MPEG-4_Audio_Object_Types), and correspond to the first 5 bits of the `DecoderSpecificInfo`(`decSpecificInfo`) (unless these bits equal 31, in which case add 32 to the next 6 bits).`mp4a.40.2` indicates AAC LC audio, which is what is usually used with H.264 HTML5 video.

For example, `codecs="avc1.42E01E, mp4a.40.2"` would be correct for the movie below:

```
$ mp4file --dump movie.mp4
...
    type avcC (moov.trak.mdia.minf.stbl.stsd.avc1.avcC)  ◀━━ avc1
     configurationVersion = 1 (0x01)
     AVCProfileIndication = 66 (0x42)    ◀━━ 42
     profile_compatibility = 224 (0xe0)  ◀━━ E0
     AVCLevelIndication = 30 (0x1e)      ◀━━ 1E
...
    type esds (moov.trak.mdia.minf.stbl.stsd.mp4a.esds)  ◀━━ mp4a
     version = 0 (0x00)
     flags = 0 (0x000000)
     ESID = 2 (0x0002)
     streamDependenceFlag = 0 (0x0) <1 bits>
     URLFlag = 0 (0x0) <1 bits>
     OCRstreamFlag = 0 (0x0) <1 bits>
     streamPriority = 0 (0x00) <5 bits>
     decConfigDescr
      objectTypeId = 64 (0x40)           ◀━━ 40
      streamType = 5 (0x05) <6 bits>
      upStream = 0 (0x0) <1 bits>
      reserved = 1 (0x1) <1 bits>
      bufferSizeDB = 0 (0x000000) <24 bits>
      maxBitrate = 78267 (0x000131bb)
      avgBitrate = 78267 (0x000131bb)
      decSpecificInfo
       info = <2 bytes>  11 90  |..|     ◀━━ 2 (first 5 bits in decimal)
...
```

### 二、Webm

下载MediaInfo，分析音视频格式

https://sourceforge.net/projects/mediainfo/?source=typ_redirect

![](http://p1yseh5av.bkt.clouddn.com/18-6-1/24340365.jpg)



### 参考

https://stackoverflow.com/questions/35616494/get-mime-type-for-mediasource-istypesupported

https://stackoverflow.com/questions/16363167/html5-video-tag-codecs-attribute

TEST CASE https://w3c-test.org/media-source/mediasource-is-type-supported.html

