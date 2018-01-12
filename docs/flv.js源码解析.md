## flv.js源码解析

### 1. 背景

flv.js项目的代码有一定规模，如果要研究的话，我建议从demux入手，理解了demux就掌握了媒体数据处理的关键步骤，前面的媒体数据下载和后面的媒体数据播放就变得容易理解了。

**先普及点背景知识，为什么HTML5视频播放要用 flv 格式？**

因为Flash。我标题图片用的是“flash RIP”，flash快死了，但是它的影响力还在，flash技术是过去10多年的互联网视频基础技术，大量相关基础设施都是围绕Flash构建的，比如 CDN 普遍支持的 RTMP 和 flv over http协议。做互联网直播的公司为了能兼容Web上的Flash播放，不约而同地选择了flv的媒体格式。在从Flash到 HTML5过渡的时期，如果HTML5能支持flash的协议是再好不过了，可以平滑过渡，然而HTML5并不原生支持flash协议。flv.js这个项目解决了HTML5支持flash协议的问题，这就是flv.js应运而生短期爆红的历史背景。

>| 左移（Left shift） | a<<b  | 将 `a` 的二进制形式向左移 `b` (< 32) 比特位，右边用0填充。   |
>| -------------- | ----- | ---------------------------------------- |
>| 有符号右移          | a>>b  | 将 a 的二进制表示向右移` b `(< 32) 位，丢弃被移出的位。      |
>| 无符号右移          | a>>>b | 将 a 的二进制表示向右移` b `(< 32) 位，丢弃被移出的位，并使用 0 在左侧填充。 |














### 来源

[FLV.JS 代码解读--demux部分](https://zhuanlan.zhihu.com/p/24429290)

[Dataview](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView)

[二进制数组](http://javascript.ruanyifeng.com/stdlib/arraybuffer.html)

[按位操作符](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Bitwise_Operators)