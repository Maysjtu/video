# Chromium多进程架构

#### 来源

https://blog.csdn.net/luoshengyang/article/details/47364477



​	Chromium以多进程架构著称，它主要包含四类进程，分别是**Browser进程**、**Render进程**、**GPU进程**和**Plugin进程**。之所以要将Render进程、GPU进程和Plugin进程独立出来，是为了解决他们的不稳定性问题。也就是说Render进程、GPU进程和Plugin进程由于不稳定引发的Crash不会导致整个浏览器崩溃。

​	一个Chromium实例只有一个Browser进程和一个GPU进程，但是Render进程和Plugin进程可以有若干个。Browser进程负责合成浏览器的UI，包括标题栏、地址栏、工具栏以及各个TAB的网页内容。Render进程负责解析和渲染网页的内容。一般来说，一个TAB就对应有一个Render进程。但是我们也可以设置启动参数，让具有相同的域名的TAB都运行在同一个Render进程中。简单起见，我们就假设一个TAB就对应有一个Render进程。无论是Browser进程，还是Render进程，当启用了**硬件加速渲染**时，它们都是**通过GPU进程来渲染UI**的。不过Render进程是将网页内容渲染在一个**离屏窗口**的，例如渲染在一个Frame Buffer Object上，而Browser进程是直接将UI渲染在Frame Buffer上，也就是屏幕上。正因为如此，Render进程渲染好的网页UI要经过Browser进程合成之后，才能在屏幕上看到。

​	Plugin进程，就是用来运行第三方开发的Plugin，以便可以扩展浏览器的功能。例如，Flash就是一个Plugin，它运行在独立的Plugin进程中。注意，为了避免创建过多的Plugin进程，同一个Plugin的不同实例都是运行在同一个Plugin进程中的。也就是说，不管是在同一个TAB的网页创建的同类Plugin，还是在不同TAB的网页创建的同类Plugin，它们都是运行在同一个Plugin进程中。

​	从上面的分析就可以知道，虽然每一个进程的指责不同，但是它们不是相互孤立的，而是**需要相互协作**，这样就需要执行**进程间通信**（IPC）。例如，Render进程渲染好自己负责解析的网页之后，需要通知GPU进程离屏渲染已经解析好的网页的UI，接着还要通知Browser进程合成已经离屏渲染好的网页UI。同样，Browser进程也需要通过GPU进程合成标题栏、地址栏、工具栏和各个网页的离屏UI。对于Plugin进程，Render进程需要将一些网页的事件发送给它处理，这样Render进程就需要与Plugin进程进行通信。反过来，Plugin进程也需要通过SDK接口向Render进程请求一些网页相关的信息，以便可以扩展网页的内容。更进一步地，如果Plugin进程需要绘制自己的UI，那么它也需要通过Render进程间接地和GPU进程进行通信。 

​	以上分析的Browser进程、Render进程、GPU进程和Plugin进程，以及它们之间的通信方式，可以通过图1描述，如下所示：

![img](https://img-blog.csdn.net/20150809003416137?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQv/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

​									图1 Chromium多进程架构

​	从图1可以看到，每一个进程除了具有一个用来实现各自职责的主线程外，都具有一个IO线程。这个IO线程不是用来执行读写磁盘文件之类的IO的，而是用来负责执行IPC的。它们之所以称为IO线程，是因为它们操作的对象是一个**文件描述符**。既然操作的对象是文件描述符，当然也可以称之为类IO。当然，这些是特殊的IO，具体来说，就是一个UNIX Socket。**UNIX Socket**是用来执行本地IPC的，它的概念与**管道**是类似的。只不过管道的通信是单向的，一端只能读，另一端只能写，而**UNIX Socket的通信是双向的**，每一端既可读也可写。

​	关于IO线程的实现，可以参考[Chromium多线程模型设计和实现](http://blog.csdn.net/luoshengyang/article/details/46855395)分析一文。简单来说，就是我们创建了一个UNIX Socket之后，就可以获得两个文件描述符。其中一个文件描述符作为Server端，增加到Server端的IO线程的消息循环中去监控，另一个文件描述符作为Client端，增加到Client端的IO线程的消息循环中去监控。对于这些文件描述符的读写操作都封装在一个Channel对象中。因此，Server端和Client端都有一个对应的Channel对象。

​	 当一个进程的主线程执行某个操作需要与另一个进程进行通信时，它的主线程就会将一个消息发送到IO线程的消息循环去。IO线程在处理这个消息的时候，就会通过前面已经创建好的UNIX Socket转发给目标进程处理。目标进程在其IO线程接收到消息之后，一般也会通过其主线程的消息循环通知主线程执行相应的操作。这就是说，在Chromium里面，线程间通过**消息循环**进行通信，而进程间通过**UNIX Socket**进行通信的。

​	Browser进程和Render进程之间的通信：Browser进程每启动一个Render进程，都会创建一个RenderProcessHost对象。Render进程启动之后，会创建一个RenderProcess对象来描述自己。这样，Browser进程和Render进程之间的通信就是通过上述RenderProcessHost和RenderProcess对象进行。

​	Browser进程和GPU进程之间的通信：Browser进程会创建一个GpuProcessHost对象来描述它启动的GPU进程，GPU进程启动之后，会创建一个GpuProcess进程。这样，Browser进程和GPU进程之间的通信就通过上述的GpuProcessHost对象和GpuProcess对象进行。注意，这两个对象之间的Channel是用来执行信令类通信的。例如，Browser进程通过上述Channel可以通知GPU进程创建另外一个Channel，专门用来执行OpenGL命令。这个专门用来执行OpenGL命令的Channel称为Gpu Channel。

​	我们知道，GPU进程需要同时为多个进程执行OpenGL命令，而OpenGL命令又是具有状态的，因此，GPU进程就需要为每一个Client进程创建一个OpenGL上下文，也就是一个GLContext对象。GPU进程在为某一个Client进程执行OpenGL命令之前，需要找到之前为该Client进程创建的GLContext对象，并且将该GLContext对象描述的OpenGL上下文设置为当前的OpenGL上下文。

​	前面提到，Render进程也需要与GPU进行通信，这意味着它们也像Browser进程一样，需要与GPU进程建立一对Gpu Channel。不过，Render进程不能像Browser进程一样，直接请求GPU进程创建一对Gpu Channel。Render进程首先要向Browser进程发送一个创建Gpu Channel的请求，Browser进程收到这个请求之后，再向GPU进程转发。GPU接收到创建Gpu Channel的请求后，就会创建一个UNIX Socket，并且将Server端的文件描述符封装在一个GpuChannel对象中，而将Client端的文件描述符返回给Browser进程，Browser进程再返回到Render进程，这样Render进程就可以创建一个Client端的Gpu Channel了。除了创建一个Client端的Gpu Channel，Render进程还会创建一个WebGrahpicsContext3DCommandBufferImpl对象，用来描述一个Client端的OpenGL上下文，这个OpenGL上下文与GPU进程里面的GLContext对象描述的OpenGL上下文是对应的。

​	Render进程与Plugin进程之间的通信: ······

​	快速地对IPC消息进行分发处理······

​	最后，还有一点需要注意的是，在Android平台中，Chromium的Browser进程就是Android应用程序的主进程，它具有Android应用程序申请的所有权限，Render进程、GPU进程和Plugin进程是Android应用程序的Service进程。这些Service在AndroidManifest文件中被配置为运行在的孤立进程中，也就是它的android:isolatedProcess属性被设置为true。这类进程在启动的时候，将不会被赋予Android应用程序申请的权限，也就是它们运行在一个非常受限的进程中。

​	······

​	分析Render进程和Plugin进程是如何通过GPU进程进行硬件加速渲染UI的。硬件加速渲染是智能设备获得流畅UI的必要条件。可以说，没有硬件加速渲染的支持，设备UI动画要达到60fps，是非常困难的。Chromium使用**硬件加速渲染**的方式非常独特，具有以下特点：

 	1. Render进程和Plugin进程虽然调用了OpenGL的API，但是这些API仅仅是一个代理接口，也就是这些API调用仅仅是将对应的命令发送给GPU进程进行处理而已。
 	2. 有些OpenGL API，例如glBufferSubData，除了要发送对应的命令给GPU进程之外，还需要发送该命令相关联的数据给GPU进程。这些数据往往是很大的，这样就涉及到如何正确有效地传输它们给GPU进程。
 	3. GPU进程只有一个用来处理Client端发送过来的OpenGL命令的线程，但是该线程却要同时服务多个Client端，也就是要同时为Browser、Render和Plugin进程服务，每一个Client端都相当于有一个OpenGL上下文，这将会涉及到如何为每一个OpenGL上下文进行调度的问题。
 	4. GPU进程同时服务的多个Client端，它们并不是相互孤立的，它们有时候存在一定的关联性。例如，Render进程渲染好的离屏UI，需要交给Browser进程合成，以便可以最终显示在屏幕中。也就是说，Browser进程需要等待Render进程渲染完成之后，才可以进行合成，否则就会得到不完整的UI。对于GPU进程来说，涉及到的问题就是如何在两个不同的OpengGL上下文中进行同步。