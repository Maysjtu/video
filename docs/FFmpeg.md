## FFmpeg

### 1. 基本概念

| 概念                  | 含义                                       |
| ------------------- | ---------------------------------------- |
| *容器（Container）*     | 一种文件格式，比如flv，mkv等。                       |
| *流（Stream）*         | 一种视频信息数据的传输方式，5种流：音频、视频、字幕、附件、数据。        |
| *帧（Frame）*          | 帧代表了一幅静止的图像，分为I帧，P帧，B帧。                  |
| *编解码器（Codec）*       | 是对视频进行压缩或者解压缩，CODEC = COde（编码）+ DECode（解码）。 |
| *复用/解复用（mux/demux）* | 把不同的流按照某种容器的规则放入容器，这种行为叫做复用（mux）把不同的流从某种容器中解析出来，这种行为叫做解复用(demux) |

### 2. 背景知识

本章主要介绍一下FFMPEG都用在了哪里（在这里仅列几个我所知的，其实远比这个多）。说白了就是为了说明：FFMPEG是非常重要的。

使用FFMPEG作为内核视频播放器：

> Mplayer，ffplay，射手播放器，暴风影音，KMPlayer，QQ影音...

使用FFMPEG作为内核的Directshow Filter：

> ffdshow，lav filters...

使用FFMPEG作为内核的转码工具：

> ffmpeg，格式工厂...

事实上，FFMPEG的视音频编解码功能确实太强大了，几乎囊括了现存所有的视音频编码标准，因此只要做视音频开发，几乎离不开它。

### 2. 简介

FFmpeg的名称来自MPEG视频编码标准，前面的“FF”代表“Fast Forward”，FFmpeg是一套可以用来记录、转换数字音频、视频，并能将其转化为流的开源计算机程序。它提供了录制、转换以及流化音视频的完整解决方案。它包含了非常先进的音频/视频编解码库libavcodec，为了保证高可移植性和编解码质量，libavcodec里很多code都是从头开发的。

PS：有不少人不清楚“FFmpeg”应该怎么读。它读作“ef ef em peg”

FFmpeg在Linux平台下开发，但它同样也可以在其它操作系统环境中编译运行，包括Windows、Mac OS X等。

**功能：**

1. 视频采集

2. 视频格式转换

3. 视频截图

4. 视频加水印

   ······

**结构：**

**libavformat**：用于各种音视频[封装格式](http://baike.baidu.com/view/1942911.htm)的生成和解析，包括获取解码所需信息以生成解码上下文结构和读取音视频帧等功能；

**libavcodec**：用于各种类型声音/图像编解码；

**libavutil**：包含一些公共的工具函数；

**libswscale**：用于视频场景比例缩放、色彩映射转换；

**libpostproc**：用于后期效果处理；

**ffmpeg**：该项目提供的一个工具，可用于格式转换、解码或[电视卡](http://baike.baidu.com/view/44687.htm)即时编码等；

**ffsever**：一个 HTTP 多媒体即时广播串流服务器；

**ffplay**：是一个简单的播放器，使用ffmpeg 库解析和解码，通过SDL显示；







### 来源

[FFMPEG视音频编解码零基础学习方法](http://blog.csdn.net/leixiaohua1020/article/details/15811977)







