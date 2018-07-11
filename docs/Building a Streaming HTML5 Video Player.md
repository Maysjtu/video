# Building a Streaming HTML5 Video Player

来源

https://www.youtube.com/watch?v=w6muSE-w0U8



### Online Video Options

- Progressive Download
- Real Time Protocols（RTP，RTMP，RTSP，etc）
- HTTP Streaming（HDS，HLS，Smooth Streaming（DASH），etc）

### The challenge

- No plugins

- Most agree that HTTP Streaming is the most efficient choice

- Different devices support different streaming protocols

- No one standard is currently supported ubiquitously(无所不在地)

- Results in media being served in several different formats to support the broadcast range of devices 

  以不同的格式提供来支持多种设备

### What do browsers support

- unfortunately, Progressive Download is the only ubiquitously supported option.
- Different browsers support different video codecs
  - H264
  - webM
  - VP8/VP9
  - etc.
- Safari natively supports HLS
- MSE released in Chrome, IE11, and Safari

### MSE

- MSE allow for segments of media to be handed to the HTML5 video tag's buffer directly.
- This enables HTTP Streaming in HTML
- not univerally supported,yet

### What is MPEG-DASH

- DASH - Dynamic Adaptive Streaming via HTTP

- International open standard, developed and published by ISO

- Address both simple and advanced use cases

  解决简单和高级用例

- Enables highest-quality multicreen distribution and efficient dynamic adaptive switching 

- Enables reuse of existing content, devices, and infrastructure

  允许重用现有内容，设备和基础架构

- Attempts to unify to a single standard for HTTP Streaming 

DASH吸取了其他协议的精华。

DASH给音频和视频定义了明确的分离，所以多语言视频很容易实现。只需要切换音频轨道就可以了。

### DASH and codecs

- The DASH specification is codec agnostic

  DASH规范与编解码器无关

  可以定义vp8/vp9/webm/h264让客户端自己选择要用哪种流

- Any existing or future codec can work with DASH

- DASH manifest describes which codec is used 

- Allow ability for a single manifest to describe several different versions in different codecs

### Building a DASH player

- We have built DASH players for several different platforms
  - Flash 
  - Android 
  - HTML5/JavaScript(dash.js)
- DASH.js is avilable as an open source project on github
- DASH.js is the reference player for the DASH Industry Forum (dashif.org)

### How to play a DASH Stream 

- Download Manifest 
- Parse Manifest
- Determine optional bandwidth for client
- Initialize for bandwidth
- Download segment 
- Hand Segment to MSE
- Check bandwidth to determine if change is necessary

The first thing is to pass in the initialization segment as you switch bit rates,you need to reinitialize for each bitrate.

Initialization segment会告诉video标签如何对视频流进行解码和播放

### Understanding Dash Structure

- Three types of files 

  - Manifest(.mpd)

    XML file describing the segments

  - Initialization file 

    Contains headers needed to decode bytes in segment

  - Segment Files

    Contains playable media 

    Includes:

    - 0 - many video tracks
    - 0 - many audio tracks

- Manifest contains 

  - Root node
  - 1 or more periods
    - Periods contain 1 adaption set per video stream 
    - Periods contain 1 adaption set per audio stream 
    - Adaption sets contain
      - Content Composition nodes(for each video or audio track)
      - 1 or more representation node 
        - each representation describes a single bitrate 
        - Representations contain data on finding actual segments
        - Different ways a representation can describe segments

- Describing Representations 

  - SegmentBase  
    - Describes a stream with only a single Segment per bitrate 
    - Can be used for Byte Range Requests
  - SegmentList 
    - A SegmentList will contain a specific list of each SegmentURL(individual HTTP packet with media data)
    - Can be used for Byte Range Requests
  - SegmentTemplate
    - Defines a known url for the fragment with wildcards resolved at runtime to request a segments
    - Alternaitvely, can specify a list of segments based on duration



### Dash.js player

- dash.js is a open source player 
- Code available on github
- Currently the base of several different production players
- Recent uses include ...



### Tools used by dash.js

- Core Player 

  Dijon - DI/IOC

直播过程中

mpd仅仅下载一次， 所以需要 How to calculate now which is the most recent segment

m3u8需要不断地去请求更新



