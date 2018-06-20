# Chromium视频标签<video>原理

​	随着互联网的发展，在网页上观看视频变得越来越流行，尤其是泛娱乐（手机直播）大行其道的今天。在HTML5之前，在网页上播放视频需要插件支持，例如Flash插件。有了HTML5之后，标签<video>使得浏览器有了播放视频的功能。与插件相比，浏览器的视频播放功能不仅在产品上体验更好，在技术上也更加稳定。本文接下来就简要介绍Chromium是如何实现<video>标签的视频播放功能的，以及制定学习计划。

​	 本文以及接下来的文章，我们主要关注Chromium在Android平台上是如何实现<video>标签的视频播放功能的。我们知道，Android平台提供播放视频的API接口，也就是MediaPlayer接口。这个接口不仅可以用来播放本地媒体文件，也就用来播放网络上的流媒体文件。这可以大大简化Chromium在Android平台上支持<video>标签的工作，因为前者可以直接利用后者提供的MediaPlayer接口实现视频播放功能，如图1所示：

​	![img](https://img-blog.csdn.net/20160724014404893?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)



















​	









