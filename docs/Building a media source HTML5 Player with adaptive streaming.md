# BUILDING A MEDIA SOURCE HTML5 PLAYER WITH ADAPTIVE STREAMING

原文

https://www.wirewax.com/blog/post/building-a-media-source-html5-player

https://www.wirewax.com/blog/post/building-a-media-source-html5-player-with-adaptive-streaming-34

https://www.wirewax.com/blog/post/building-a-media-source-html5-player-with-adaptive-streaming-44

https://www.google.com/search?q=BUILDING+A+MEDIA+SOURCE+HTML5+PLAYER+WITH+ADAPTIVE+STREAMING&rlz=1C5CHFA_enUS800US802&oq=BUILDING+A+MEDIA+SOURCE+HTML5+PLAYER+WITH+ADAPTIVE+STREAMING&aqs=chrome..69i57j69i60l3.274j0j7&sourceid=chrome&ie=UTF-8

看一下相关视频



## Part1 - VANILLA HTML5 VIDEO SUCKS. MEDIA SOURCE EXTENSIONS ARE THE ANSWER

在HTML5之前，使用Flash是浏览器端播放视频的唯一解决方案。苹果促进了HTML5的汹涌发展。当然，原生支持有巨大的优势，但是它准备好如此广泛又快速的采用了吗？它能提供和Flash相同的能力吗？

简言之，不行。缺少的是：**dynamic switching**, stalling detection, **buffering control** and (for better or worse) DRM（数字版权管理）。自从2002年以来，Adobe一直在完善几乎任何浏览器的安全视频传输，能够根据最终用户的连接提供位部分和不同来源的服务。

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



## PART2 - HOW THE HELL DO I DO IT

### Introduction

In [Part 1](https://jennifer-mah-87xd.squarespace.com/config/pages/building-a-media-source-html5-player) we saw the problems with vanilla HTML5 video and the advantages of using the Media Source Extensions with WebM: the ability to create an entirely client-side adaptive streaming HTML5 player with no need for a streaming server, just a regular CDN. We're going to outline how you build a basic Media Source Extension HTML5 Player, with the end-result being a clustered playback able to switch the video rendition on-the-fly without interrupting playback, in response to degraded network traffic.

### Preparing a WebM video file

The first step is to create a correctly clustered WebM video file. The clusters of the WebM file should be aligned so that the first frame of each cluster is an [Intra-frame](http://en.wikipedia.org/wiki/Intra-frame), meaning that the video contained within the cluster can be played with *only* data contained within that cluster. All other frames are derivatives([dɪ'rɪvətɪv] 派生的；引出的) of the previous frame right back until it hits an Intra-frame.

The most straightforward way to create a WebM video file from your video source is to use [FFMPEG](https://www.ffmpeg.org/), an open source cross-platform video encoding library. For the best browser support you should use the VP8 Video Codec and the Vorbis Audio Codec.

You need to compile FFMPeg FFMPEG with these options:

```
--enable-libvpx --enable-libvorbis
```

When generating your WebM file you should specify your audio and video codecs, for example:

```
ffmpeg -i <input-file> -c:v libvpx -c:a libvorbis <output-file.webm> -
```

Unfortunately FFMPEG often doesn't generate WebM files with correctly aligned clusters. If your file is broken (test it at the bottom of this article) you should be able to use [acolwell's Media Source Extension Tools](https://github.com/acolwell/mse-tools) to fix your file.

Build the tools ([Go](http://golang.com/) required) as described in the [Git repository](https://github.com/acolwell/mse-tools) and run *msewebmremuxer* to fix the clusters, for example:

./mse_webm_remuxer example.webm fixedExample.webm

You can **test your generated video file** using our Simple Media Source Player example at the bottom of this article.

There's also an **example of correctly clustered WebM video file** for testing at:

<http://edge-assets.wirewax.com/blog/vidData/example.webm>



## Building the basic player

####  Let's keep it simple

 We're going to keep it dead simple in this first part - we're going to download an entire video file in one piece, place it into memory in the form of a data array and then attach it the video element using the MSE objects. There'll be no clustering, no buffering and no fancy adaptive streaming until parts 2 and 3. This should let you determine if the WebM rendition you've created above has worked out.

#### The code

Let's start by creating a simple Javascript object in a jQuery ready event, give it the ability to show the user its state and check for Media Source compatibility:

```js
$(function () { 
    var BasicPlayer = function () {
        var self = this;
        this.initiate = function (sourceFile) { 
            if (!window.MediaSource || !MediaSource.isTypeSupported('video/webm; codecs="vp8,vorbis"')) { 
                self.setState("Your browser is not supported"); 
                return; 
            } 
        } 
        this.setState = function (state) { 
            $('#state-display').html(state); 
        } 
    } 
    var basicPlayer = new BasicPlayer(); 
    window.updatePlayer = function () { 
        var sourceFile = $('#source-file').val();
        basicPlayer.initiate(sourceFile);
    } 
    updatePlayer(); 
}
```

The key component of a Media Source Extensions played is the [MediaSource Object](http://w3c.github.io/media-source/#mediasource). This object needs to be created and attached to a video element source using [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL.createObjectURL). The MediaSource object then triggers a *sourceopen* event, at which point a [SourceBuffer](http://w3c.github.io/media-source/#sourcebuffer) object can be attached.

We'll now add some functionality to our init method to create a MediaSource object and associate it with a detached video object. A *sourceopen* listener is then added to the MediaSource which is triggered when the video element has been attached to the DOM:

```js
this.initiate = function (sourceFile) { 
    if (!window.MediaSource || !MediaSource.isTypeSupported('video/webm; codecs="vp8,vorbis"')) { 
        self.setState("Your browser is not supported");
        return; 
    } 
    self.clearUp(); 
    self.sourceFile = sourceFile; 
    self.setState("Creating media source using");
    //create the video element 
    self.videoElement = $('<video controls></video>')[0]; 
    //create the media source self.mediaSource = new MediaSource(); 
    self.mediaSource.addEventListener('sourceopen', function () {
        self.setState("Creating source buffer"); 
        //when the media source is opened create the source buffer 
        self.createSourceBuffer();
    }, false); 
    //append the video element to the DOM 
    self.videoElement.src = window.URL.createObjectURL(self.mediaSource);
    $('#basic-player').append($(self.videoElement)); 
} 
this.clearUp = function() { 
    if (self.videoElement) { 
        //clear down any resources from the previous video embed if it exists
        $(self.videoElement).remove();
        delete self.mediaSource; 
        delete self.sourceBuffer; 
    } 
}
```

 We also need a clearUp method so the video can be restarted.

The SourceBuffer object now needs to be created and attached to the MediaSource using the [MediaSource.addSourceBuffer](http://w3c.github.io/media-source/#widl-MediaSource-addSourceBuffer-SourceBuffer-DOMString-type) method, which takes a string containing the file format and codecs.

This source buffer then takes the video data in the form of a [Typed Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array) using the [SourceBuffer.appendBuffer](http://w3c.github.io/media-source/#widl-SourceBuffer-appendBuffer-void-ArrayBufferView-data) method. You should check that the source buffer is not in the updating state before appending data. The video data can be obtained using a standard [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).

```js
this.createSourceBuffer = function () { 
    self.sourceBuffer =  self.mediaSource.addSourceBuffer(
        'video/webm;codecs="vp8,vorbis"'); 
    self.sourceBuffer.addEventListener('updateend', function () { 
        self.setState("Ready"); 
    }, false); 
    var xhr = new XMLHttpRequest(); 
    xhr.open('GET', self.sourceFile, true); 
    xhr.responseType = 'arraybuffer'; 
    xhr.onload = function (e) { 
        if (xhr.status !== 200) {
            self.setState("Failed to download video data"); 
            self.clearUp(); 
        } else { 
            var arr = new Uint8Array(xhr.response);
            if (!self.sourceBuffer.updating) { 
                self.setState("Appending video data to buffer"); 
                self.sourceBuffer.appendBuffer(arr); 
            } else { 
                self.setState("Source Buffer failed to update"); 
            } 
        } 
    }; 
    xhr.onerror = function () { 
        self.setState("Failed to download video data"); 
        self.clearUp(); 
    };
    xhr.send(); 
    self.setState("Downloading video data"); 
}
```

In the next article we'll use the clusters of the WebM to break the file into chunks using HTTP Range and feed the parts in the buffer as we wish them to be buffered.



# PART 3 - BUFFERING A VIDEO CLUSTER BY CLUSTER

### Introduction

Previously we explained how to build a basic Media Source Extension HTML5 player which downloads a complete WebM video file and places it into the Media Source buffer. To create an adaptive streaming player we need to be able to select specific parts of a video to download and place into the buffer.

### Extracting the WebM cluster data

The first thing we need to do is extract the cluster data metadata from the clustered WebM rendition. This data is stored in the file in the form of [EBML](http://ebml.sourceforge.net/), a binary extension of XML. While it would be possible to write an EBML parser in Javascript we prefer to do it server-side at the point of generating a rendition and store it in JSON.

As in [Part 2](https://jennifer-mah-87xd.squarespace.com/config/pages/building-a-media-source-html5-player-with-adaptive-streaming-25) we're going to use [acolwell's Media Source Extension Tools](https://github.com/acolwell/mse-tools), this time the *msejsonmanifest*tool, ie:

```
./mse_json_manifest <input-file.webm> -> <output-file.json>
```

**Note:** If you'd prefer to use Python instead of Go there's a good alternative outlined on the [IONCANNON](http://www.ioncannon.net/utilities/1515/segmenting-webm-video-and-the-mediasource-api/)blog, however the format of the resultant JSON will be slightly different.

The generated JSON manifest should be of the form:

 ```js
{
  "type": "video/webm; codecs=\"vp8, vorbis\"",
  "duration": 30892.000000,
  "init": { "offset": 0, "size": 4651},
  "media": [
    { "offset": 4651, "size": 962246, "timecode": 0.000000 },
    { "offset": 966897, "size": 660411, "timecode": 9.991000 },
    { "offset": 1627308, "size": 721264, "timecode": 19.999000 },
    { "offset": 2348572, "size": 83217, "timecode": 29.984000 }
  ]
}
 ```

An example WebM file with associated JSON manifest can be found here:

<http://edge-assets.wirewax.com/blog/vidData/example.webm>

<http://edge-assets.wirewax.com/blog/vidData/example.json>



### Understanding the JSON

The WebM format begins with an ***initialization cluster***. This cluster is analogous( [ə'næləgəs] 类似的) to a header; it includes metadata about the rest of the file, telling the video decoder where in the file to look for different parts of the video. It is from this cluster that we have extracted our JSON metadata. The HTML5 decoder needs to be given this data to successfully play the video.

 The init field in the output JSON gives us the byte-range of the initialization cluster, so in the example above we would look in the byte range 0-4,651.

 The duration field is the duration of the video in milliseconds. We'll want to divide this by 1,000 to make it consistent with the timecode field, which is in seconds. 使timecode以秒为单位。

The media list is a list of the non-init clusters in the video, each of which should begin with an Intra-frame so that each cluster can be played independently of previous clusters.

The offset refers to the byte-offset of that cluster, so our first cluster starts at byte *4,651*. Not that this is immediately after the end of the initialization cluster as we'd expect.

The size refers to the length of this cluster, in bytes. This means our first cluster occupies the byte-range *4,651-233,539.*

The timecode refers to the start point of the cluster in the video timeline, in seconds. Note that our first cluster begins at 0 seconds as we'd expect.

### Preparing our cluster data

We're going to be using the cluster data a lot in the upcoming code so it's important we store it in a logical manner. A cluster will initially be defined by the data we receive from the cluster JSON. This will yield(产生；屈服) the fields:

一个cluster会根据上面的JSON数据进行初始化定义。 将会产生如下字段

- Starting byte (inclusive)    开始字节
- End byte (exclusive)    结束字节
- Time-range start (inclusive)    时间范围开始
- Time-range end (exclusive)    时间范围结束
- Is it an initialization cluster?    是否是初始化cluster

We will also want to store the state of the cluster as it moves through our data pipeline. This should be straightforward:

Download Requested Downloaded, queued to be added to SourceBuffer Buffered in the SourceBuffer

Remember the SourceBuffer can only be appended to when it's not in the updating state, so cluster data will need to be queued up waiting for an opportunity to be added.

记住SourceBuffer只有在updating为false的时候才能添加，所以cluster必须排队等待添加机会。

This means we'll need fields flagging:

所以我们需要添加一个标记字段

requested - it's been requested and we're waiting for it to be downloaded.
queued - it's been downloaded and is now queued up waiting to be added to the buffer.
buffered - it's associated data has been added to the source buffer.

Finally we'll also need a field in which store the video data itself, once it's been downloaded. So we're going to define an object with these properties：

```js
function Cluster(byteStart, byteEnd, isInitCluster, timeStart, timeEnd) { 
    this.byteStart = byteStart; //byte range start inclusive 
    this.byteEnd = byteEnd; //byte range end exclusive 
    this.timeStart = timeStart ? timeStart : -1; //timecode start inclusive 
    this.timeEnd = timeEnd ? timeEnd : -1; //exclusive 
    this.isInitCluster = isInitCluster; //is an init cluster 
    this.requested = false; //cluster download has started 
    this.queued = false; //cluster has been downloaded and queued to be appended to source buffer 
    this.buffered = false; //cluster has been added to source buffer 
    this.data = null; //cluster data from vid file 
}
```

This object now stores all of the data we need to know about a specific cluster, as well as its state in our player pipeline.

### Using HTTP Range to download a specific cluster

We now need to be able to download a specific cluster, and take advantage of some of the possibilities download video parts manually allows. Here we define a download method using HTTP Range which includes a time out and a retry with a cache buster to avoid situations where the browser cache screws up.

 ```js
Cluster.prototype.download = function (callback) { 
    this.requested = true; 
    this._getClusterData(function () { 
        self.flushBufferQueue(); 
        if (callback) { 
            callback(); 
        } 
    }) 
}; 
Cluster.prototype._makeCacheBuster = function() { 
    var text = ""; 
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++) 
        text += possible.charAt(Math.floor(Math.random() * possible.length)); 
    return text; 
}; 
Cluster.prototype._getClusterData = function (callback, retryCount) { 
    var xhr = new XMLHttpRequest();
    var vidUrl = self.sourceFile; 
    if (retryCount) { 
        vidUrl += '?cacheBuster=' + this._makeCacheBuster(); 
    }
    xhr.open('GET', vidUrl, true); 
    xhr.responseType = 'arraybuffer'; 
    xhr.timeout = 6000; 
    xhr.setRequestHeader('Range', 'bytes=' + this.byteStart + '-' + this.byteEnd);
    xhr.send(); 
    var cluster = this; 
    xhr.onload = function (e) { 
        if (xhr.status != 206) { 
            consoel.error("media: Unexpected status code " + xhr.status);
            return false; 
        } 
        cluster.data = new Uint8Array(xhr.response); 
        cluster.queued = true; 
        callback(); 
    };
    xhr.ontimeout = function () { 
        var retryAmount = !retryCount ? 0 : retryCount; 
        if (retryCount == 2) { 
            self._failed(); 
        } else { 
            cluster._getClusterData(callback, retryCount++); 
        } 
    } 
};
 ```

> HTTP **206 Partial Content** 成功状态响应代码表示请求已成功，并且主体包含所请求的数据区间，该数据区间是在请求的 [`Range`](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Headers/Range) 首部指定的。



### Plugging our clusters into a basic player

将cluster插入播放器

The next step is to plug this cluster data into our basic player, to make a slightly-more-advanced player. We're going to download our cluster JSON file, create a cluster object for each item in the media list and our initialization cluster. We'll simply download all of the clusters in sequence, one-by-one and append it to the buffer using a queue system.

First, we'll download the cluster data and wait for it to be completed before we create our MediaSource. To download all the clusters and place them in a list:

```js
this.downloadClusterData = function (callback) { 
    var xhr = new XMLHttpRequest();
    var url = self.clusterFile; 
    xhr.open('GET', url, true); 
    xhr.responseType = 'json'; 
    xhr.send();
    xhr.onload = function (e) { 
        self.createClusters(xhr.response);
        callback(); 
    }; 
} 
this.createClusters = function (rslt) { 
    self.clusters.push(new Cluster( rslt.init.offset, rslt.init.size - 1, true )); 
    for (var i = 0; i < rslt.media.length; i++) { 
        self.clusters.push(
            new Cluster( 
                rslt.media[i].offset, 
                rslt.media[i].offset + rslt.media[i].size - 1, 
                false, 
                rslt.media[i].timecode, 
                (i === rslt.media.length - 1) ? parseFloat(rslt.duration / 1000) : rslt.media[i + 1].timecode )
        ); 
    }
}
```

Now we need to make some methods to fulfil our basic requirements:

- Download the initialization cluster
- Download all the non-initialization clusters
- Concatenate the Uint8Array data from the list of queued clusters into a single Uint8Array to append to the SourceBuffer
- Flush our queue of queued clusters such that the initialization cluster is always added first, when the SourceBuffer is not already updating  刷新clusters队列

To keep our code clean and simple we're going to use a functional toolkit library. You can use either [UnderscoreJS](http://underscorejs.org/) or [Lodash](https://lodash.com/) depending on how hipster you're feeling today ;)

```js
this.createSourceBuffer = function () { 
    self.sourceBuffer = self.mediaSource.addSourceBuffer('video/webm; codecs="vp8,vorbis"'); 
    self.sourceBuffer.addEventListener('updateend', function () { 
        self.flushBufferQueue(); 
    }, false); 
    self.setState("Downloading clusters"); 
    self.downloadInitCluster();
} 
this.flushBufferQueue = function() { 
    if (!self.sourceBuffer.updating) { 
        var initCluster = _.findWhere(self.clusters, {isInitCluster:true}); 
        if (initCluster.queued || initCluster.buffered) { 
            var bufferQueue = _.filter(self.clusters,function(cluster) { 
                return (cluster.queued === true && cluster.isInitCluster === false) 
            }); 
            if (!initCluster.buffered) { 
                bufferQueue.unshift(initCluster); 
            } 
            if (bufferQueue.length) { 
                var concatData = self.concatClusterData(bufferQueue);
                _.each(bufferQueue, function (bufferedCluster) { 
                    bufferedCluster.queued = false;
                    bufferedCluster.buffered = true;
                });
                self.sourceBuffer.appendBuffer(concatData); 
            } 
        }
    } 
}
this.downloadInitCluster = function() { 
    _.findWhere(
        self.clusters, 
        {isInitCluster:true}
    ).download(self.downloadNextUnRequestedCluster); 
}
this.concatClusterData = function (clusterList) {
    var bufferArrayList = [];
    _.each(clusterList, function (cluster) { 
        bufferArrayList.push(cluster.data); 
    }) 
    var arrLength = 0; 
    _.each(bufferArrayList, function (bufferArray) { 
        arrLength += bufferArray.length; 
    });
    var returnArray = new Uint8Array(arrLength);
    var lengthSoFar = 0;
    _.each(bufferArrayList, function (bufferArray, idx) { 
        returnArray.set(bufferArray, lengthSoFar);
        lengthSoFar += bufferArray.length
    }); 
    return returnArray; 
}; 
this.downloadNextUnRequestedCluster = function() { 
    var nextCluster = _.chain(self.clusters)
    .filter(function(cluster) {
        return (cluster.requested === false && cluster.isInitCluster === false)
    })
    .first() 
    .value(); 
    if (nextCluster) { 
        nextCluster.download(self.downloadNextUnRequestedCluster); 
    } else { 
        self.setState("all clusters downloaded");
    }
}
```

We've also modified our createSourceBuffer method from the basic player so that it kicks the whole process off. We call the flush buffer queue method whenever a cluster is added to the queue or when the SourceBuffer has finished updating, so our queue is always added to the buffer at its earliest opportunity.

### Building a simple buffering service

 Now we're going to build a simple service, powered by the timeupdate event from the video element. 

We're going to check for unrequested clusters which are less than five seconds ahead of the current timestamp and then set them downloading.

```js
this.createSourceBuffer = function () { 
    self.sourceBuffer = self.mediaSource.addSourceBuffer('video/webm; codecs="vp8,vorbis"'); 
    self.sourceBuffer.addEventListener('updateend', function () {
        self.flushBufferQueue(); 
    }, false); 
    self.setState("Downloading clusters"); 
    self.downloadInitCluster();
    self.videoElement.addEventListener('timeupdate',function(){ 
        self.downloadUpcomingClusters(); 
    },false); 
} 
this.downloadInitCluster = function () { 
    _.findWhere(self.clusters, {isInitCluster: true})
        .download(self.downloadUpcomingClusters); 
}
this.downloadUpcomingClusters = function () { 
    var nextClusters = _.filter(self.clusters, function (cluster) { 
        return (cluster.requested === false && 
                cluster.timeStart <= self.videoElement.currentTime + 5) 
    });
    if (nextClusters.length) { 
        _.each(nextClusters, function (nextCluster) { 
            nextCluster.download(); 
        }); 
    } else { 
        if (_.filter(self.clusters, function (cluster) { 
            return (cluster.requested === false ) 
        }).length === 0) { 
            self.setState("finished buffering whole video");
        } else { 
            self.finished = true; 
            self.setState("finished buffering ahead"); 
        } 
    } 
}
```



### What's coming up?

In the next article we'll implement adaptive streaming, allowing us to switch between different renditions of the video on the fly.

  



# PART 4 - ADAPTIVE STREAMING

### Introduction

In the previous article we created a Media Source Extensions player which could buffer certain parts of the video on demand. We're now going to extend this to create the ability to switch between different renditions of the video on demand, and then to record how long each cluster takes to download and aggregate to estimate the download rate compared to the bitrate of the upcoming clusters. This will enable us to switch the video rendition on the fly depending on the network conditions of the client, all completely client-side and with no reliance on streaming servers.

The code we're using in this example can be found at our [Git repository](https://github.com/wireWAX/media-source-tutorial). 

### Preparing our data

To facilitate changing the video rendition on the fly and recording how long each cluster takes to download we need to add four fields to our Cluster object: fileUrl, rendition, requestedTime, and queuedTime. This means our Cluster definition is now:

```js
function Cluster( fileUrl,
                  rendition,
                  byteStart,
                  byteEnd,
                  isInitCluster,
                  timeStart,
                  timeEnd) { 
    this.byteStart = byteStart; //byte range start inclusive 
    this.byteEnd = byteEnd; //byte range end exclusive
    this.timeStart = timeStart ? timeStart : -1; //timecode start inclusive 
    this.timeEnd = timeEnd ? timeEnd : -1; //exclusive 
    this.requested = false; //cluster download has started 
    this.isInitCluster = isInitCluster; //is an init cluster
    this.queued = false; //cluster has been downloaded and queued to be appended to source buffer 
    this.buffered = false; //cluster has been added to source buffer 
    this.data = null; //cluster data from vid file 
    this.fileUrl = fileUrl; 
    this.rendition = rendition; 
    this.requestedTime = null;
    this.queuedTime = null;
}
```

We then also need to store a list of possible renditions and the current rendition in the Player object. In this example we're going to be using just two: 1080 and 180, to demonstrate the difference between renditions most effectively.

```js
self.renditions = ["180", "1080"]; self.rendition = "1080"
```

The cluster downloading function and cluster creation functions need to be changed to populate the new data, including setting the file url.

In this example the video url is in the format example<rendition>.webm

Example renditions are available for experimentation at:

<http://edge-assets.wirewax.com/blog/vidData/example180.webm>

[http://edge-assets.wirewax.com/blog/vidData/example1080.webm](http://edge-assets.wirewax.com/blog/vidData/example.webm)

```js
this.downloadClusterData = function (callback) { 
    var totalRenditions = self.renditions.length;
    var renditionsDone = 0;
    _.each(self.renditions, function (rendition) { 
        var xhr = new XMLHttpRequest(); 
        var url = self.clusterFile + rendition + '.json';
        xhr.open('GET', url, true);
        xhr.responseType = 'json';
        xhr.send(); 
        xhr.onload = function (e) { 
            self.createClusters(xhr.response, rendition); 
            renditionsDone++; 
            if (renditionsDone === totalRenditions) { 
                callback();
            } 
        }; 
    })
} 
this.createClusters = function (rslt, rendition) {
    self.clusters.push(
        new Cluster( 
            self.sourceFile + rendition + '.webm', 
            rendition, 
            rslt.init.offset,
            rslt.init.size - 1,
            true )
    ); 
    for (var i = 0; i < rslt.media.length; i++) { 
        self.clusters.push(
            new Cluster(
                self.sourceFile + rendition + '.webm', 
                rendition, 
                rslt.media[i].offset, 
                rslt.media[i].offset + rslt.media[i].size - 1,
                false,
                rslt.media[i].timecode, 
                (i === rslt.media.length - 1) ? parseFloat(rslt.duration / 1000) : rslt.media[i + 1].timecode )
        );
    } 
}
```

 Then we need to record the requestedTime in the download method:

 ```js
Cluster.prototype.download = function (callback) { 
    this.requested = true; 
    this.requestedTime = new Date().getTime(); 
    this._getClusterData(
        function () { 
            self.flushBufferQueue(); 
            if (callback) { 
                callback();
            } 
        }) 
};
 ```

Also record queuedTime in the Cluster._getClusterData:

```js
xhr.onload = function (e) { 
    if (xhr.status != 206) { 
        console.err("media: Unexpected status code " + xhr.status);
        return false; 
    }
    cluster.data = new Uint8Array(xhr.response);
    cluster.queued = true; 
    cluster.queuedTime = new Date().getTime(); 
    callback();
};
```

### Appending video data from different renditions

When appending cluster data of different video sources there is an important caveat (警告) - you cannot change the video data of the cluster which is currently being displayed in the video.  This will break the video for the duration of the current cluster. When switching between renditions we then only download and append *upcoming* clusters.

不能对当前正在播放的cluster变换码率，只能对即将要处理的cluster变换码率。

To facilitate this we will change the downloadUpcomingClusters method to only download strictly upcoming clusters, and create a new method downloadCurrentCluster which is only called after the initial downloadInitCluster method call:

Generally we also need to change all of our cluster methods to only operate on clusters of the current, active rendition:

Generally we also need to change all of our cluster methods to only operate on clusters of the current, active rendition:

```js
this.downloadInitCluster = function (callback) { 
    _.findWhere(self.clusters, 
                {isInitCluster: true, rendition: self.rendition})
        .download(callback);
}
this.downloadCurrentCluster = function () { 
    var currentClusters = _.filter(self.clusters, function (cluster) { 
        return (cluster.rendition === self.rendition && 
                cluster.timeStart <= self.videoElement.currentTime && 
                cluster.timeEnd > self.videoElement.currentTime) 
    });
    if (currentClusters.length === 1) { 
        currentClusters[0].download(); 
    } else { 
        console.err("Something went wrong with download current cluster"); 
    } 
} 
this.downloadUpcomingClusters = function () { 
    var nextClusters = _.filter(self.clusters, function (cluster) { 
        return (cluster.requested === false && 
                cluster.rendition === self.rendition && 
                cluster.timeStart > self.videoElement.currentTime && 
                cluster.timeStart <= self.videoElement.currentTime + 5) 
    }); 
    if (nextClusters.length) { 
        _.each(nextClusters, function (nextCluster) { 
            nextCluster.download();
        }); 
    } else { 
        if (_.filter(self.clusters, function (cluster) { 
            return (cluster.requested === false ) 
        }).length === 0) {
            self.setState("finished buffering whole video");
        } else { 
            self.finished = true; 
            self.setState("finished buffering ahead rendition " + self.rendition); 
        } 
    } 
}
```

and in our createSourceBuffer method we make sure the initial downloadInitCluster call then triggers the current and first cluster of the initial rendition to download:

```js
self.downloadInitCluster(self.downloadCurrentCluster);
```

Finally the flushBufferQueue method must be changed to use only the clusters associated with the active rendition but being sure to still **add the current rendition's initialization cluster first.**

 ```js
this.flushBufferQueue = function () { 
    if (!self.sourceBuffer.updating) { 
        var initCluster = _.findWhere(self.clusters, 
                                      {isInitCluster: true, rendition: self.rendition}
                                     );
        if (initCluster.queued || initCluster.buffered) {
            var bufferQueue = _.filter(self.clusters, function (cluster) { 
                return (cluster.queued === true && 
                        cluster.isInitCluster === false && 
                        cluster.rendition === self.rendition) 
            }); 
            if (!initCluster.buffered) { 
                bufferQueue.unshift(initCluster); 
            } 
            if (bufferQueue.length) {
                var concatData = self.concatClusterData(bufferQueue); 
                _.each(bufferQueue, function (bufferedCluster) { 
                    bufferedCluster.queued = false; 
                    bufferedCluster.buffered = true; 
                });
                self.sourceBuffer.appendBuffer(concatData); 
            } 
        } 
    } 
}
 ```

### Adapting the stream dynamically

To adapt the stream dynamically we need to know how fast the video data has been downloading and compare that to the bitrate of the upcoming cluster in the current rendition. We're already recording this data, so now we just need to aggregate(集合；聚集) it.

We're using a simple [Map Reduce](http://en.wikipedia.org/wiki/MapReduce) model to achieve this, and making use of UnderscoreJS's [memoize](http://underscorejs.org/#memoize)function to avoid doing unnecessary calculations:

```js
this.downloadTimeMR = _.memoize( 
    function (downloadedClusters) { 
        // map reduce function to get download time per byte return 
        _.chain(downloadedClusters.map(function (cluster) { 
            return { 
                size: cluster.byteEnd - cluster.byteStart,
                time: cluster.queuedTime - cluster.requestedTime }; 
        }) .reduce(function (memo, datum) {
            return { 
                size: memo.size + datum.size, 
                time: memo.time + datum.time } 
        }, {size: 0, time: 0})
     	).value() 
    }, 
    function (downloadedClusters) { 
        return downloadedClusters.length;
        //hash function is the length of the downloaded clusters as it should be strictly increasing 
    } ); 
this.getNextCluster = function () { 
    var unRequestedUpcomingClusters = _.chain(self.clusters)
    .filter(function (cluster) {
        return (!cluster.requested &&
                cluster.timeStart >= self.videoElement.currentTime && 
                cluster.rendition === self.rendition); 
    }) .sortBy(function (cluster) { 
        return cluster.byteStart 
    }) .value(); 
    if (unRequestedUpcomingClusters.length) { 
        return unRequestedUpcomingClusters[0]; 
    } else { 
        throw new Error("No more upcoming clusters"); 
    } 
}; 
this.getDownloadTimePerByte = function () { 
    //seconds per byte
    var mapOut = this.downloadTimeMR(_.filter(self.clusters, function (cluster) {
        return (cluster.queued || cluster.buffered) 
    }));
    var res = ((mapOut.time / 1000) / mapOut.size);
    return res; 
}; 
this.checkBufferingSpeed = function () { 
    var secondsToDownloadPerByte = self.getDownloadTimePerByte(); 
    var nextCluster = self.getNextCluster(); 
    var upcomingBytesPerSecond = (nextCluster.byteEnd - nextCluster.byteStart) / (nextCluster.timeEnd - nextCluster.timeStart); 
    var estimatedSecondsToDownloadPerSecondOfPlayback = secondsToDownloadPerByte * upcomingBytesPerSecond;
    $('#rate-display').html(estimatedSecondsToDownloadPerSecondOfPlayback); 
    if (estimatedSecondsToDownloadPerSecondOfPlayback > 0.8) { 
        if (self.rendition !== "180") { 
            self.switchRendition("180")
        }
    } else { 
        if (self.rendition !== "1080") { 
            self.switchRendition("1080") 
        }
    } 
}
```

Our hash is the length of the downloaded cluster data because this is strictly increasing. There are no circumstances where the average download rate can change without the length of the downloaded clusters data increasing. 

We now need to implement a very simple switchRendition function which changes the current rendition variable. We'll want to call the checkBufferingSpeedfunction on time update, to check how the buffering is coming along, and switch the bitrate as the video is moving along if there's a problem:

我们现在需要实现一个非常简单的switchRendition函数来改变当前的rendition变量。 在timeupdate时会调用checkBufferingSpeedfunction来检查缓冲状态，在video播放出现问题时，及时切换码率。

```js
this.createSourceBuffer = function () { 
    self.sourceBuffer = self.mediaSource.addSourceBuffer('video/webm; codecs="vp8,vorbis"'); 
    self.sourceBuffer.addEventListener('updateend', function () {
        self.flushBufferQueue(); 
    }, false); 
    self.setState("Downloading clusters"); 
    self.downloadInitCluster(self.downloadCurrentCluster); 
    self.videoElement.addEventListener('timeupdate', function () { 
        self.downloadUpcomingClusters();
        self.checkBufferingSpeed(); 
    }, false); 
}
this.switchRendition = function (rendition) { 
    self.rendition = rendition; 
    self.downloadInitCluster(); 
    self.downloadUpcomingClusters(); 
}
```

This example does not include further functionality you could (and should) implement such as:

- seeking to a point in the video which has not yet been buffered
- stall detection using our knowledge of which clusters have been added to the source buffer
- using the cluster data to determine the bitrate of each rendition to select the correct when dynamically changing the stream.

This video begins using a 1080 rendition, when you click the *Simulate Network Slowdown* button it will switch to a lower 180 rendition. This change will happen visually in the next cluster. This allows the current cluster to continue playing at the same resolution so the video playback isn not interrupted.

The current download rate, as a ratio of average download time per second of video per second of playback is also displayed.

All of the code for this example and the previous examples are available in our [Git repository](https://github.com/wireWAX/media-source-tutorial).

