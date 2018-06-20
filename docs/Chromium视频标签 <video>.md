# Chromium视频标签 <video>

​	随着互联网的发展，在网页上观看视频变得越来越流行，尤其是泛娱乐（手机直播）大行其道的今天。在HTML5之前，在网页上播放视频需要插件支持，例如Flash插件。有了HTML5之后，标签<video>使得浏览器有了播放视频的功能。与插件相比，浏览器的视频播放功能不仅在产品上体验更好，在技术上也更加稳定。本文接下来就简要介绍Chromium是如何实现<video>标签的视频播放功能的 。

​	本文以及接下来的文章，我们主要关注Chromium在Android平台上是如何实现<video>标签的视频播放功能的。

​	我们知道，Android平台提供播放视频的API接口，也就是MediaPlayer接口。这个接口不仅可以用来播放本地媒体文件，也就用来播放网络上的流媒体文件。这可以大大简化Chromium在Android平台上支持<video>标签的工作，因为**前者可以直接利用后者提供的MediaPlayer接口实现视频播放功能**，如图1所示：

​	![img](http://img.blog.csdn.net/20160724014404893?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

​									图1 <video>标签的实现	

​	Chromium是一个多进程架构。其中，Render进程负责加载、解析和渲染网页，Browser进程负责将Render进程渲染出来的网页内容合成到屏幕上显示。Render进程又是通过Webkit来加载和解析网页的。

​	Webkit在解析网页内容时，**每当遇到一个video标签**，就会在DOM Tree中创建一个类型为**HTMLMediaElement**的节点。这个HTMLMediaElement节点又会在内部创建一个WebMediaPlayerClientImpl对象。这个WebMediaPlayerClientImpl对象在WebKit内部就描述为一个播放器，用来为<video>标签提供视频播放功能。

​	WebMediaPlayerClientImpl类是由WebKit提供的，它本身不实现视频播放功能，因为视频播放是一个平台相关的功能。我们知道，**WebKit是平台无关的**，所有平台相关的功能都需要由它的使用者实现。在Chromium中，Webkit的使用者即为运行在Render进程中的Content模块。Content模块提供了一个WebMediaPlayerAndroid类，用来向WebKit提供视频播放功能。

​	WebKit层的每一个WebMediaPlayerClientImpl对象在Content层都有一个对应的WebMediaPlayerAndroid对象。这些WebMediaPlayerAndroid对象就相当于是在Render进程内部实现的播放器。每一个播放器都关联有一个ID，它们被另外一个称为RendererMediaPlayerManager的对象管理。通过这种方式，就可以在一个网页上同时支持多个<video>标签，也就是可以同时播放多个视频。

​	WebMediaPlayerBridge类本身也不实现播放器功能。在Android平台上，WebMediaPlayerBridge类将通过SDK提供的MediaPlayer接口来实现视频播放功能。SDK是在Java层提供MediaPlayer接口的，而WebMediaPlayerBridge类是实现在C++层的，因此后者在使用前者时，需要通过JNI使用。

​	 总结来说，在Android平台上，**Chromium会通过SDK接口MediaPlayer为网页中的每一个<video>标签创建一个播放器**。播放器负责从网络上下载视频内容，并且进行解码。解码后得到的视频画面需要作为网页的一部分进行显示。从前面[Chromium网页渲染机制简要介绍和学习计划](http://blog.csdn.net/luoshengyang/article/details/50916769)这个系列的文章可以知道，在Chromium中，网页是Render进程进行渲染的，并且当前需要渲染的内容来自于网页的CC Active Layer Tree。这意味着**要将播放器解码出来的视频画面交给网页的CC Active Layer Tree处理**。

​	播放器解码出来的视频画面是通过SurfaceTexture接口交给网页的CC Active Layer Tree处理的，如图2所示：

![img](http://img.blog.csdn.net/20160724022059476?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

​							图2 <video>标签的视频画面渲染方式

​	在Android平台上，SurfaceTexture是一个完美的接口。一方面它支持跨进程传输数据，另一方面传输的数据可以作为纹理使用。在我们这个情景中，MediaPlayer运行在Browser进程中，CC Active Layer Tree运行在Render进程中，并且是通过OpenGL进行渲染的。因此，SurfaceTexture非常适合将前者的输出作为后者的输入，并且通过OpenGL以纹理的方式渲染出来。

​	具体来说，就是CC Active Layer Tree会为每一个<video>标签创建一个类型为VideoLayerImpl的节点。这个节点的内容就来自于播放器解码出来的视频画面。这些视频画面最终又是通过纹理来描述的。从前面[Chromium网页渲染机制简要介绍和学习计划](http://blog.csdn.net/luoshengyang/article/details/50916769)这个系列的文章可以知道，CC Active Layer Tree其它节点的内容，最终也是描述为纹理进行渲染的。因此，Chromium可以轻松地将播放器解码出来的视频画面作为网页的一部分进行显示。

​	在Android平台上，Chromium还为<video>标签提供了全屏播放功能。全屏播放与非全屏播放可以进行无缝切换，它是怎么实现的呢？我们通过图3来说明，如下所示：

​	![img](https://img-blog.csdn.net/20160724023736386?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

​					图3 <video>标签的全屏播放功能实现

​	在<video>标签全屏播放的情况下，我们是看不到网页的其它内容的。这使得Chromium可以使用一种简单的方式实现<video>标签的全屏播放功能。当<video>标签全屏播放的时候，Browser进程会在浏览器窗口上创建一个全屏的SurfaceView，然后将这个SurfaceView底层的Surface取出来，设置为MediaPlayer的解码输出。这样就可以将MediaPlayer的解码输出全屏显示在屏幕上了。这时候由于网页是不可见的，Render进程不需要对它进行渲染。

​	接下来，我们结合源码，按照三个情景深入分析Chromium对<video>标签的支持：

1. [为标签创建播放器的过程](http://blog.csdn.net/luoshengyang/article/details/52019877)。
2. [渲染标签视频画面的过程](http://blog.csdn.net/luoshengyang/article/details/52082146)。
3. [全屏播放标签视频的过程](http://blog.csdn.net/luoshengyang/article/details/52125001)。



### Chromium为视频标签<video>创建播放器的过程分析

······



### Chromium为视频标签<video>渲染视频画面的过程分析

在浏览器中，<video>标签与普通标签有一个显著不同点，**它们的内容不是由浏览器自己绘制出来，而是由第三方组件提供的**。例如，在Android平台上，<video>标签的内容来自于系统播放器MediaPlayer的输出。然而在非全屏模式下，<video>标签的内容又需要像普通标签一样，嵌入在HTML页面中显示，也就是由浏览器进行渲染。本文接下来就分析Chromium渲染<video>标签内容的原理。

​	浏览器是否能够无缝地渲染播放器的输出，取决于播放器是否有良好的设计。一个有良好设计的播放器要有独立的输入和输出。输入就是一个URL或者一个本地文件路径，输出即为一帧一帧的视频画面。播放器都能接受URL或者本地文件路径作为输入，也就是输入这一点都能满足要求。在输出上，它的设计就很有讲究了，有上中下三种策略。

​	**下策**是让使用者提供一个**窗口**作为播放器的输出。这显然是不合适的，因为一般来说，播放器的使用者除了要在窗口显示视频内容之外，还需要显示其它内容，也就是需要在窗口上放其它控件。当然，如果系统支持将一个窗口作为一个控件嵌入在另外一个窗口中显示，这种设计也未尝不可，不过这种设计**太不通用**了。

​	**中策**是让使用者提供一个**控件**作为播放器的输出。这种方式可以解决下策中提出的问题。然而，有一类特殊的使用者，它们的主UI不是通过系统提供控件设计出来的，而是用自己的方式绘制出来的。例如，在浏览器中，网页中的元素就不是通过系统提供的控件显示出来的，而是用自己的图形渲染引擎绘制出来的。

​	**上策**是让使用者提供一个**缓冲区**作为播放器的输出。这种输出使得使用者以非常灵活的方式将视频画面显示出来。不过缺点就是使用者要多做一些工作，也就是**将缓冲区的内容渲染出来**。

​	现在流行的系统，渲染基本上都是通过GPU进行的。如果我们提供给播放器的缓冲区，是普通的缓冲区，也就是只有CPU才可以访问的缓冲区，那么使用者在使用GPU渲染的情况下，需要将缓冲区内容上传到GPU去。这就相当于是执行一个纹理上传操作。我们知道，纹理上传是一个非常慢的操作，而视频的数据又很大，分辨率通常达到1080p。因此，理想的设计是让播放器将输出写入到GPU缓冲区中去。不过，这需要系统提供支持。

​	好消息是Android平台提供了这样的支持。在Android系统上，SurfaceTexture描述的就是GPU缓冲区，并且以纹理的形式进行渲染。SurfaceTexture可以进一步封装在Surface中。Android系统的MediaPlayer提供了一个setSurface接口，参数是一个Surface，用来接收解码输出，也就是视频画面。这意味着Android系统的MediaPlayer支持将解码输出写入在GPU缓冲区中。这是上上策，得益于Android系统本身的良好的设计。

​      Chromium正是利用了SurfaceTexture作为MediaPlayer的解码输出，如图1所示：

![img](https://img-blog.csdn.net/20160801032229341?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

​					图1 以SurfaceTexture作为MediaPlayer的解码输出	

​	从前面[Chromium网页渲染机制简要介绍和学习计划](http://blog.csdn.net/luoshengyang/article/details/50916769)这个系列的文章可以知道，在Chromium的Content层，一个网页被抽象为三个Tree：CC Layer Tree、CC Pending Layer Tree和CC Active Layer Tree。其中，CC Layer Tree由Render进程中的Main线程管理，CC Pending Layer Tree和CC Active Layer Tree由Render进程中的Compositor线程管理。CC Pending Layer Tree由CC Layer Tree同步得到，CC Active Layer Tree由CC Pending Layer Tree激活得到。

​	Chromium为每一个<video>标签在CC Layer Tree创建一个VideoLayer。这个VideoLayer在CC Active Layer Tree中有一个对应的VideoLayerImpl。由于网页的UI最终是通过渲染CC Active Layer Tree得到的，因此Chromium通过VideoLayerImpl接收MediaPayer的解码输出。

​			