## MSE支持格式详解

### 一、常用命令

Mp4 转 webm

```
ffmpeg -i input_file.mp4 output_file.webm
```

### 二、MSE支持格式

| MIME type/subtype     | Public Specification(s)                                      | Generate Timestamps Flag |
| --------------------- | ------------------------------------------------------------ | ------------------------ |
| audio/webm video/webm | [WebM Byte Stream Format](https://www.w3.org/TR/mse-byte-stream-format-webm/) [[MSE-FORMAT-WEBM](https://www.w3.org/TR/mse-byte-stream-format-registry/#bib-MSE-FORMAT-WEBM)] | false                    |
| audio/mp4 video/mp4   | [ISO BMFF Byte Stream Format](https://www.w3.org/TR/mse-byte-stream-format-isobmff/) [[MSE-FORMAT-ISOBMFF](https://www.w3.org/TR/mse-byte-stream-format-registry/#bib-MSE-FORMAT-ISOBMFF)] | false                    |
| audio/mp2t video/mp2t | [MPEG-2 Transport Streams Byte Stream Format](https://www.w3.org/TR/mse-byte-stream-format-mp2t/) [[MSE-FORMAT-MP2T](https://www.w3.org/TR/mse-byte-stream-format-registry/#bib-MSE-FORMAT-MP2T)] | false                    |
| audio/mpeg audio/aac  | [MPEG Audio Byte Stream Format](https://www.w3.org/TR/mse-byte-stream-format-mpeg-audio/) [[MSE-FORMAT-MPEG-AUDIO](https://www.w3.org/TR/mse-byte-stream-format-registry/#bib-MSE-FORMAT-MPEG-AUDIO)] | true                     |

### 三、概述

- H.264

  H.264是一种专利视频格式。它的专利被一家[MPEG-LA](http://en.wikipedia.org/wiki/MPEG-LA)公司控制。

- Webm

  WebM采用MKV作为封装格式，里面的音频编码用Vorbis格式，视频编码用VP8格式。

- VP8

  VP8是一个没有专利约束、并且获得Google支持的免费视频编码格式。 

- Ogg

  Ogg全称应该是OGG Vorbis是一种新的音频[压缩格式](https://baike.baidu.com/item/%E5%8E%8B%E7%BC%A9%E6%A0%BC%E5%BC%8F)，类似于MP3等现有的[音乐格式](https://baike.baidu.com/item/%E9%9F%B3%E4%B9%90%E6%A0%BC%E5%BC%8F)。但有一点不同的是，它是完全免费、开放和没有专利限制的。OGG Vorbis有一个很出众的特点，就是支持多声道，随着它的流行，以后用随身听来听DTS编码的多声道作品将不会是梦想。

- Vorbis

  Vorbis 是这种音频压缩机制的名字，而Ogg则是一个计划的名字，该计划意图设计一个完全开放性的[多媒体系统](https://baike.baidu.com/item/%E5%A4%9A%E5%AA%92%E4%BD%93%E7%B3%BB%E7%BB%9F)。目前该计划只实现了OggVorbis这一部分。

- opus

  **Opus**是一個[有損聲音編碼](https://zh.wikipedia.org/wiki/%E7%A0%B4%E5%A3%9E%E6%80%A7%E8%B3%87%E6%96%99%E5%A3%93%E7%B8%AE#%E9%9F%B3%E8%A8%8A%E5%A3%93%E7%B8%AE)的格式，由[Xiph.Org基金會](https://zh.wikipedia.org/wiki/Xiph.Org%E5%9F%BA%E9%87%91%E6%9C%83)開發，之後由[網際網路工程任務組](https://zh.wikipedia.org/wiki/%E4%BA%92%E8%81%94%E7%BD%91%E5%B7%A5%E7%A8%8B%E4%BB%BB%E5%8A%A1%E7%BB%84)（IETF）進行標準化，目標用希望用單一格式包含聲音和語音，取代[Speex](https://zh.wikipedia.org/wiki/Speex)和[Vorbis](https://zh.wikipedia.org/wiki/Vorbis)，且適用於網路上低延遲的即時聲音傳輸，標準格式定義於[RFC](https://zh.wikipedia.org/wiki/RFC) 6716文件。Opus格式是一個[開放格式](https://zh.wikipedia.org/wiki/%E9%96%8B%E6%94%BE%E6%A0%BC%E5%BC%8F)，使用上沒有任何[專利](https://zh.wikipedia.org/wiki/%E5%B0%88%E5%88%A9)或限制。



### 三、Webm

#### 1. Introduction

This specification describes a byte stream format based on the WebM container format [[WEBM](https://www.w3.org/TR/mse-byte-stream-format-webm/#bib-WEBM)]. It defines the MIME-type parameters used to signal codecs, and provides the necessary format specific definitions for [initialization segments](https://www.w3.org/TR/media-source/#init-segment), [media segments](https://www.w3.org/TR/media-source/#media-segment), and [random access points](https://www.w3.org/TR/media-source/#random-access-point) required by the [byte stream formats section](https://www.w3.org/TR/media-source/#byte-stream-formats) of the Media Source Extensions spec.

#### 2. MIME-type parameters

This section specifies the parameters that can be used in the MIME-type passed to `isTypeSupported()` or `addSourceBuffer()`.

![](http://p1yseh5av.bkt.clouddn.com/18-6-1/92640203.jpg)

合法的MIME TYPES示例：

- audio/webm;codecs="vorbis"
- video/webm;codecs="vorbis"
- video/webm;codecs="vp8"
- video/webm;codecs="vp8,vorbis"
- video/webm;codecs="vp9,opus"

### 四、 MP4

MSE仅支持fmp4

>If I'm not mistaken, MediaSource can be used to play fragmented MP4s, but not MP4 files generally. Fragmented MP4 files are structured differently and can be fetched in independent pieces. This is what DASH and HLS use when they refer to MP4 files. General MP4 files will have to be played directly with HTML5 video, which you can already do today without Shaka Player.



















### 参考

1. [MSE byte stream format registry](https://www.w3.org/TR/mse-byte-stream-format-registry/)
2. [MSE Webm 规范](https://www.w3.org/TR/mse-byte-stream-format-webm/)
3. [HTML5的视频格式之争](http://www.ruanyifeng.com/blog/2010/05/html5_codec_fight.html)
4. [VP9 vs H.265——下一代视频编码标准的王道之争](https://zhuanlan.zhihu.com/p/31817775)
5. [Ogg Vorbis](https://baike.baidu.com/item/Ogg%20Vorbis)
6. https://github.com/google/shaka-player/issues/1241