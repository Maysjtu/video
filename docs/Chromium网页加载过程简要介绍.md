# Chromium网页加载过程简要介绍

​	Chromium网页加载的过程需要由Browser进程和Render进程协作完成。加载网页的过程由Browser进程发起，向服务器请求网页内容的过程也是由Browser进程完成。Render进程负责对下载回来的网页内容进行解析，解析之后得到一个DOM Tree。有了这个DOM Tree之后，Render进程就可以对网页进行渲染了。

​	第一个涉及到的重要概念是Chromium的模块划分及其层次关系，如图1所示：

​		![img](https://img-blog.csdn.net/20151229000226886)

​					图1 Chromium模块划分及其层次关系

​       这个图来自官方文档：[How Chromium Displays Web Pages](https://www.chromium.org/developers/design-documents/displaying-a-web-page-in-chrome)。从下往上看：

 1.  **Webkit**：**网页渲染引擎层**，定义在命令空间Web Core中。Port部分用来集成平台相关服务：例如资源加载和绘图服务。WebKit是一个平台无关的网页渲染引擎，但是用在具体的平台上时，需要由平台提供一些平台相关的实现，才能让WebKit跑起来。

	2. **Webkit glue**：**WebKit嵌入层**，用来将WebKit类型转化为Chromium类型，定义在命令空间blink中。Chromium不直接访问WebKit接口，而是通过WebKit glue接口间接访问。WebKit glue的对象命名有一个特点，均是以Web为前缀。

	3. **Renderer/Renderer Host**：**多进程嵌入层**，定义在命令空间content中。其中，Renderer运行在Render进程中，Renderer host运行在Browser进程中。

	4. **WebContents**：允许将一个HTML网页以多进程方式渲染到一个区域中，定义在命令空间content中。

	5. **Browser**：代表一个浏览器窗口，它可以包含多个WebContents。

	6. **Tab Helpers**：附加在WebContents上，用来增加WebContents的功能，例如显示InfoBar。

    ​

​        我们可以将第1层和第2层归结为WebKit层，第3层和第4层归结为Content层，第5层和第6层归结为浏览器层。如果以进程为边界，Tab Helpers、Browser、WebContents和Renderer host运行在Browser进程中，Renderer、WebKit glue和WebKit运行在Render进程中。

​	Content层是Chromium的核心模块，它实现了Chromium的多进程架构。Content层主要向外提供的接口是WebContents，浏览器层通过这个WebContents接口就可以将一个HTML网页渲染在一个区域上。例如，Chrome就是通过Content层提供的WebContents接口实现一个浏览器的。同样我们也可以通过Content层提供的WebContents接口实现一个与Chrome类似的浏览器，甚至我们也可以通过Content层提供的WebContents接口实现一个嵌入在应用程序的浏览器控件，例如Android 4.4的WebView。

​	在Content层中，一个用来渲染网页的区域称为RenderView。一个RenderView也称为一个RenderWidget。RenderView与RenderWidget的区别是，前者是描述的是一个用来显示网页内容的控件，后者描述的是一个可以接收用户输入的控件，但是它不一定是用来显示网页内容的。例如，点击网页上的选择框弹出来的窗口，是一个RenderWidget，它里面显示的内容与网页无关。

​	我们可以将RenderView和RenderWidget看作是一个接口。Browser进程和Render进程都需要实现这个接口。其中，Browser进程分别实现RenderView和RenderWidget接口的两个类是RenderViewHostImpl和RenderWidgetHostImpl，Render进程分别实现RenderView和RenderWidget接口的两个类是RenderViewImpl和RenderWidgetImpl。Browser进程的每一个RenderViewHostImpl对象和每一个RenderWidgetHostImpl对象在Render进程中都分别对应有一个RenderViewImpl对象和一个RenderWidgetImpl。RenderViewHostImpl对象与RenderViewImpl对象、RenderWidgetHostImpl对象与RenderWidgetImpl对象可以通过Browser进程与Render进程建立的IPC通道进行通信。

​	WebKit层的WebView和WebWidget相当于Content层的RenderView和RenderWidget。我们注意到，WebKit层还有一个称为WebFrame的对象。事实上，Content层也有一个类似的对象，称为RenderFrame。WebFrame和RenderFrame都是用来描述网页的。既然已经有了RenderView和RenderWidget，为什么还需要WebFrame和RenderFrame呢？这与Chromium的Out-of-Process iframes（OOPIFs）项目有关。关于Chromium的Out-of-Process iframes（OOPIFs）项目的详细信息，可以参考官方文档：[Out-of-Process iframes (OOPIFs)](http://www.chromium.org/developers/design-documents/oop-iframes)。

​	网页间的通信机制postMessasge： ······

​	从前面的分析我们就可以看到，在Chromium中，为什么一个网页既要使用RenderView、RenderWidget，又要使用RenderFrame、WebFrame来描述，它们的作用是不一样的，总结来说，就是：

1. RenderView描述的是一个用来显示网页内容的RenderWidget。


2. RenderWidget描述的是一个UI控件。
3. RenderFrame用来建立网页之间的消息通道。

