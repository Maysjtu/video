# BUILDING A MEDIA SOURCE HTML5 PLAYER WITH ADAPTIVE STREAMING

原文

https://www.wirewax.com/blog/post/building-a-media-source-html5-player



## Part1

在HTML5之前，使用Flash是浏览器端播放视频的唯一解决方案。苹果促进了HTML5的汹涌发展。当然，原生支持有巨大的优势，但是它准备好如此广泛又快速的采用了吗？它能提供和Flash相同的能力吗？

简言之，不行。缺少的是：dynamic switching, stalling detection, buffering control and (for better or worse) DRM。自从2002年以来，Adobe一直在完善几乎任何浏览器的安全视频传输，能够根据最终用户的连接提供位部分和不同来源的服务。

HTML5 video was quickly heralded as an alternative to Flash but it was very far from matching - let alone beating - Flash for video. [It's only in 2015 that YouTube](http://youtube-eng.blogspot.jp/2015/01/youtube-now-defaults-to-html5_27.html), the biggest video platform ever, has finally been able to get HTML5 video into a state it feels comfortable matches Flash for stability, performance and monitoring.

HTML5很快被视为Flash的替代品，但它远不能和Flash相比，更别提打败它了。直到2015年有史以来最大的视频平台Youtube最终将HTML5视频在稳定性、性能和监控带入一个和Flash相配的状态。

After initially using Flash for the desktop experience and HTML5 for mobile we switched to serving our content exclusively through HTML5 at the start of 2014.

Why did we abandon Flash months ago? Primarily we wanted an identical experience between mobile and desktop.Unfortunately vanilla HTML5 video can be fiendishly（['fi:ndiʃli] 极坏地） unstable and unpredictable. Notably（ ['notəbli]显著地；尤其 ） it has little or no error reporting, rubbish stalling detection and a lack of support for dynamic quality switching. We've been forced to cobble together patches and wrappers with our own proprietary monitoring solutions and rendition switching before we could allow HTML5 video to become the norm for millions of WIREWAX users.Continuous monitoring of the playback and regularly tweaking code to support hundreds of frustrating idiosyncrasies of HTML5 video handling by a wide range of browsers feels like a constant battle.

我们之所以废弃了Flash是因为我们想要在移动端和桌面端有相同的体验。不幸的是，原始的HTML5 video可能会非常不稳定并且不可预测。尤其是，它几乎没有错误报告，垃圾停止检测以及缺乏对动态质量切换的支持。在我们允许HTML5视频成为数百万WIREWAX用户的标准之前，我们不得不用我们自己的专有监控解决方案和再现切换来拼凑补丁和包装器。持续监控播放并定期调整代码以支持数百种令人沮丧的浏览器HTML5视频处理特性感觉像是一场不断的战斗。

We've only become truly happy using HTML5 video since the advent of [Media Source Extensions](https://w3c.github.io/media-source/) (MSE). This extension of the video element allows JavaScript to override the browser's handling of the video stream and do a whole range of powerful things like controlling loading and delivery of media, client-side.  No special media server license required. Your JavaScript can manage multiple video file renditions to cater for end-user bandwidth capabilities.It can even switch playback mid-stream with bitpart file chunking.It's a significant leap forward for media handling in the browser, far superior than the standard HTML5 video tag and, in many ways, an improvement on anything Flash could handle.

Note: The MSE spec is still in a draft form. Its currently supported by default in the latest Chrome, and can be enabled in Firefox [settings](http://www.ghacks.net/2014/05/10/enable-media-source-extensions-firefox/). Currently only IE11 on Windows 8.1 supports MSE but is restricted to MP4 formats. In this series we're sticking to WebM support only.

## What's wrong with vanilla HTML5 Video?

- **No control over how your video files download**

  With classic HTML5 Video you simply specify a video source file in the source attribute. Your browser then opens a pipe to the video file and stuffs it into your video player however it likes, when it likes. If it goes wrong you have no visibility and no way of fixing it.

- **Stalling detection about as reliable as Vladimir Putin at a peace summit in Minsk**

  视频卡住后，不会及时通知或者没有通知。

  看demo视频

- **No adaptive streaming. Slow network? Too bad.**

  With HTML5 video there's no way to switch the video rendition on the fly without interrupting the experience. If your network starts running slow you either have to replace the video with a new one or simply wait for it to buffer. With Flash it's been possible to use adaptive streaming to change the video quality on the fly for years.

  With MSE we can switch the video source between multiple renditions stored on a Content Delivery Network (CDN). We don't even need to use a streaming server.

  看demo视频

- **No control over how the video buffers**

  With classic HTML5 video its completely up to the browser how it buffers. Even if you know for a reliable experience you need certain chunks there's no way to tell the video to buffer these parts, but not other parts. You can end up necessarily wasting your viewer's bandwidth preloading the entire video. With MSE we can customise exactly how each video buffers to cater to specific requirements.

  - Creating a **Choose Your Own Adventure** style video (where the viewer can jump to another video segment by making choices in-frame)? Ensure a seamless experience by buffering all of the entry points to each segment prior to starting playback.

    创建一个选择你自己的冒险风格视频（观众可以通过框内选择跳转到另一个视频片段）？ 通过在开始播放之前缓冲每个片段的所有入口点来确保无缝体验。

    视频无缝切换

  - Is an engaged viewer approaching an interactive tag which may open a **video-in-video** overlay? Start buffering the nested video now so the viewer doesn't have to wait for content to download when the interactive tag is clicked.

    进行缓存控制

  - Want to save data transit costs? Be conservative with how much unwatched video you download.

    想节省数据传输成本吗？ 知道你下载了多少未观看的视频。

  - Be more sympathetic to your audience and only serve video chunks they are more than capable of receiving without annoying buffer time.

    选择合适的码流，避免恼人的缓冲时间。

  

  ## What does it look like in practice?

   At the end of this tutorial you should be able to create something looking like this. But hopefully prettier...

  This video begins using a 1080 rendition, when you click the *Simulate Network Slowdown* button it will switch to a lower 180 rendition. This change will happen visually in the next cluster. This allows the current cluster to continue playing at the same resolution so the video playback isn't interrupted.

  The current download rate, as a ratio of average download time per second of video per second of playback is also displayed.

  All of the code for this example and the upcoming examples are available in our [Git repository](https://github.com/wireWAX/media-source-tutorial).

  In the next article we explain how to prepare a clustered WebM file and how to build a basic Media Source Extensions player.

  

  

  



















