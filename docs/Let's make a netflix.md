# Let's make a netflix

### 来源

https://github.com/nickdesaulniers/netfix

http://nickdesaulniers.github.io/netfix/#/



An intro to streaming media on the web

### Topics

1. **Terminology 术语**

- PULSE CODED MODULATION 脉冲编码调制

  Audio PCM streams are made up of a sample rate: how frequently the amplitude is measured (ex. 320Mbps),and bit depth: how many passible digital values can be represented by one sample.

  音频PCM流由采样率组成：测量幅度的频率（例如320 Mbps）和位深度：一个样本可以表示多少个可能的数字值。

- COMPRESSION 压缩

  The Digital to Audio Converter (DAC) on your computer's soundcard expects PCM (HD Audio or AC'97), but PCM is large and therefore expensive to store and transmit.

  计算机声卡上的数字音频转换器（DAC）需要PCM（HD Audio或AC'97），但PCM很大，因此存储和传输都很昂贵。

- LOSSY VS LOSSLESS COMPRESSION 有损与无损压缩

  Lossless compression allows us to more efficiently represent the same uncompressed data and also sounds fantastic on your expensive audio equipment.

  Lossy compression sacrifices fidelity for size and allows you to store thousands of songs on your phone.

  Lossless to lossy is a one way conversion

  You cannot get back fidelity once it's been thrown away

  无损到有损是单向转换

  一旦它被扔掉，你就无法恢复保真度

- CODECS

  Codecs are how the media data is represented, or encoded. Some codecs are lossy like MP3, some are lossless like FLAC. Most codecs are encumbered by patents. :(

  编解码器是媒体数据的表示或编码方式。 有些编解码器像MP3一样有损，有些像FLAC一样无损。 大多数编解码器都受到专利的阻碍

- CONTAINERS

  Containers such as WAV, MP4, and Ogg represent the meta-data of a media file such as artist or duration, subtitles, etc. Containers, in addition to their meta-data, will contain streams of audio or video encoded via a specific codec.

- FILE EXTENSION

  Sometimes used by OS to determine what program should open what file. Unreliable; anyone can change the file extension of a given file, but that does not change the encoding (how the bits are arranged) or the container (how the meta-data and streams are packaged).

- PLAYLISTS

  Playlist files are used by media playing applications to play subsequent mediums. Browsers do not understand playlist files, but playlist files can easily be [parsed](https://github.com/nickdesaulniers/javascript-playlist-parser) in JavaScript.

  媒体播放应用程序使用播放列表文件来播放一连串的媒体。 浏览器不了解播放列表文件，但可以在JavaScript中轻松解析播放列表文件。

- PROTOCOL

  How are the bits transferred from one machine to another? On the Web, HTTP is the most familiar, but there are other protocols used when streaming media such as RTSP and ICY.

- KNOW YOUR TERMS

  Codecs, containers, file extensions, playlist files, and protocols are not equivalent. Ex. Media A could be aac encoded, in an MP4 container, with a .m4a extension, listed in a m3u playlist file, served over ICY.

  编解码器，容器，文件扩展名，播放列表文件和协议不等价。例如， 媒体A可以在MP4容器中进行aac编码，扩展名为.m4a，列在m3u播放列表文件中，通过ICY提供。

- HARDWARE ACCELERATION

  Media can be decoded in software or in hardware. Application Specific Integrated Circuits (ASICs) can be faster and more power efficient than General Purpose Processors. Mobile friendly. They can also be patent encumbered.

  媒体可以用软件或硬件解码。 专用集成电路（ASIC）比通用处理器更快，功率更高。 移动友好。 他们也可以受到专利保护。

2. **Transcoding 转码** 

- WHY?

  Not all browsers support all codecs.
  A lossy to lossy conversion is preferable to asking the user to install a different browser.
  If storage is cheaper than bandwidth, also preferable.

  并非所有浏览器都支持所有编解码器
  有损耗的转换比要求用户安装其他浏览器更可取。
  如果存储比带宽便宜，也是可取的。

- FFMPEG

  Your free and Open Source transcoding swiss army knife.瑞士军刀

  ```
  ffmpeg -h full 2>/dev/null| wc -l
  5424
  ```

  THE EXTREME BASICS

  ```
  ffmpeg -i input.wav output.mp3
  ffmpeg -i input.y4m -i input.wav output.webm
  ```

  CODEC SUPPORT

  ffmpeg -codecs will tell you if you can decode from one codec and encode into another.

  ```
  $ ffmpeg -codecs
    DEV.LS h264  H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10 (decoders: h264 h264_vda ) (encoders: libx264 libx264rgb )
    DEV.L. vp8   On2 VP8 (decoders: vp8 libvpx ) (encoders: libvpx )
    DEV.L. vp9   Google VP9 (decoders: vp9 libvpx-vp9 ) (encoders: libvpx-vp9 )
    DEA.L. mp3   MP3 (MPEG audio layer 3) (decoders: mp3 mp3float ) (encoders: libmp3lame )
    DEA.L. opus  Opus (Opus Interactive Audio Codec) (decoders: opus libopus ) (encoders: libopus )
  ```

  If you're missing an expected encoder/decoder, you probably need to install a shared library and rebuild/reinstall ffmpeg. Not fun.

  `ffmpeg -i input.file` will tell you a lot about a file.

  ```
  $ ffmpeg -i bunny.mp4
    Duration: 00:01:00.10 ...
    Stream #0:0(eng): Audio: aac ... 22050 Hz, stereo, ... 65 kb/s
    Stream #0:1(eng): Video: h264 ... 640x360, 612 kb/s, 23.96 fps ...
    
  ```

  MULTIPLEXING

  aka muxing

  ```
    $ ffmpeg -i bunny.mp4
    Stream #0:0(eng): Audio: aac ... 22050 Hz, stereo, ... 65 kb/s
    Stream #0:1(eng): Video: h264 ... 640x360, 612 kb/s, 23.96 fps ...
    Stream #0:2(eng): Data: none (rtp  / 0x20707472), 45 kb/s
    Stream #0:3(eng): Data: none (rtp  / 0x20707472), 5 kb/s
  
    $ ffmpeg -i bunny.mp4 -map 0:0 -map 0:1 -c copy bunny_clean.mp4
  
    $ ffmpeg -i bunny_clean.mp4
    Stream #0:0(eng): Audio: aac ... 22050 Hz, stereo, ... 65 kb/s
    Stream #0:1(eng): Video: h264 ... 640x360, 612 kb/s, 23.96 fps ...
  ```

  

3. **Audio & Video Tags**

- AUDIOSTREAM

![](http://p1yseh5av.bkt.clouddn.com/18-7-5/35206078.jpg)

- BYTE RANGE REQUESTS

  A browser will make Byte Range Requests on behalf of a media element to buffer content.

  Request Headers:

  Range: bytes=0-
  Response Headers:

  Content-Length: 1024
  Content-Range: 0-1023:4096

- WHAT IF WE WANT FINER GRAIN CONTROL OVER LOADING ASSETS?

  我们想要获得更加细粒度的控制 该如何做呢？

  Why?

  Video is easily an order of magnitude larger in file size than audio.

  视频的文件大小比音频大一个数量级。

  Waste of bandwidth if user downloads entire file, but watches only a part.

  如果用户下载整个文件但只看一部分，浪费带宽。

- BINARY DATA

    ```js
  var xhr = new XMLHttpRequest;
  xhr.open('GET', 'song.mp3');
  xhr.responseType = 'arraybuffer';
  xhr.onload = function () {
      var audio = new Audio;
      audio.src = URL.createObjectURL(new Blob([xhr.response], {
          type: 'audio/mpeg' }));
      audio.oncanplaythrough = audio.play.bind(audio);
  };
  xhr.send();
    ```

  plus byte range requests? 

- BINARY DATA + BYTE RANGE REQUESTS

  Audio tags don't let us combine arraybuffers, they require one contiguous arraybuffer. Web Audio API can help here.

  But...

  Results in audible clicks between segments. Finding the proper range to segment by is very difficult. Web Audio API does not help here.

4. **MSE**

- A NOTE ABOUT MP4

  mp4 needs to be "fragmented." From ISO BMFF Byte Stream Format §3:

  > An ISO BMFF initialization segment is defined in this specification as a single File Type Box (ftyp) followed by a single Movie Header Box (moov).

- HOW TO CHECK IF YOUR MP4 IS PROPERLY FRAGMENTED

  I highly recommend [axiomatic-systems/Bento4](https://github.com/axiomatic-systems/Bento4) on GitHub.

  ```
  $ ./mp4dump ~/Movies/devtools.mp4 | head
  [ftyp] size=8+24
  ...
  [free] size=8+0
  [mdat] size=8+85038690
  [moov] size=8+599967
  ...
  ```

- HOW TO MAKE YOUR MP4 PROPERLY FRAGMENTED

  ```
  $ ./mp4fragment ~/Movies/devtools.mp4 devtools_fragmented.mp4
  $ ./mp4dump devtools_fragmented.mp4 | head
  [ftyp] size=8+28
  ...
  [moov] size=8+1109
  ...
  [moof] size=8+600
  ...
  [mdat] size=8+138679
  [moof] size=8+536
  ...
  [mdat] size=8+24490
  ...
  ```

  ...ftype followed by a single moov...

  You'll also notice multiple moof/mdat pairs.

  When transcoding with ffmpeg, you'll want the flag: -movflags frag_keyframe+empty_moov

- HTMLMEDIAELEMENT
  ![](http://p1yseh5av.bkt.clouddn.com/18-7-5/83884345.jpg)

- MEDIA SOURCE EXTENSIONS

  ![](http://p1yseh5av.bkt.clouddn.com/18-7-5/39322273.jpg)

  view-source:http://nickdesaulniers.github.io/netfix/demo/bufferWhenNeeded.html

5. **DASH**

   ADAPTIVE BITRATE STREAMING

   ![](http://p1yseh5av.bkt.clouddn.com/18-7-5/98304703.jpg)