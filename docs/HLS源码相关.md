# HLS源码相关

1. **ID3**是一种[metadata](https://zh.wikipedia.org/wiki/Metadata)容器，多应用于MP3格式的音频文件中。它可以将相关的曲名、演唱者、专辑、音轨数等信息存储在MP3文件中，又稱作「ID3Tags」。 

   [ID3](https://zh.wikipedia.org/zh/ID3)

2. XMLHttpRequest.responseURL

   The value of `responseURL` will be the final URL obtained after any redirects.

   [XMLHttpRequest.responseURL](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/responseURL)

3.  RegExpObject.exec(string)

   ##### 返回值

   返回一个数组，其中存放匹配的结果。如果未找到匹配，则返回值为 null。

   ##### 说明

   exec() 方法的功能非常强大，它是一个通用的方法，而且使用起来也比 test() 方法以及支持正则表达式的 String 对象的方法更为复杂。

   如果 exec() 找到了匹配的文本，则返回一个结果数组。否则，返回 null。此数组的第 0 个元素是与正则表达式相匹配的文本，第 1 个元素是与 RegExpObject 的第 1 个子表达式相匹配的文本（如果有的话），第 2 个元素是与 RegExpObject 的第 2 个子表达式相匹配的文本（如果有的话），以此类推。除了数组元素和 length 属性之外，exec() 方法还返回两个属性。index 属性声明的是匹配文本的第一个字符的位置。input 属性则存放的是被检索的字符串 string。我们可以看得出，在调用非全局的 RegExp 对象的 exec() 方法时，返回的数组与调用方法 String.match() 返回的数组是相同的。

   但是，当 RegExpObject 是一个全局正则表达式时，exec() 的行为就稍微复杂一些。它会在 RegExpObject 的 **lastIndex 属性**指定的字符处开始检索字符串 string。当 exec() 找到了与表达式相匹配的文本时，在匹配后，它将把 RegExpObject 的 lastIndex 属性设置为匹配文本的最后一个字符的下一个位置。这就是说，您可以通过反复调用 exec() 方法来遍历字符串中的所有匹配文本。当 exec() 再也找不到匹配的文本时，它将返回 null，并把 lastIndex 属性重置为 0。

4. video.buffered

   The **HTMLMediaElement.buffered** read-only property returns a new [`TimeRanges`](https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges)object that indicates the ranges of the media source that the browser has buffered (if any) at the moment the `buffered` property is accessed.

   返回一个TimeRanges对象

   A `TimeRanges` object includes one or more ranges of time, each specified by a starting and ending time offset. You reference each time range by using the `start()` and `end()`methods, passing the index number of the time range you want to retrieve.

   ![](http://p1yseh5av.bkt.clouddn.com/18-7-4/39696816.jpg)

   经过seek操作，返回的对象长度会增加，并且可以获得每一段buffer的具体时间。

   ![](http://p1yseh5av.bkt.clouddn.com/18-7-4/77233040.jpg)

   [video.buffer](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/buffered)

   [TimeRanges](https://developer.mozilla.org/en-US/docs/Web/API/TimeRanges)

5. hls基本使用

   ```js
   <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"></script>  
   <video id="video"></video>  
   <script>  
     if(Hls.isSupported()) {
       var video = document.getElementById('video');
       var hls = new Hls();
       hls.loadSource('https://video-dev.github.io/streams/x36xhzz/x36xhzz.m3u8');
       hls.attachMedia(video);
       hls.on(Hls.Events.MANIFEST_PARSED,function() {
         video.play();
     });
    }
   </script> 
   ```

6. 各种controller初始化的顺序也很重要，决定了事件监听的绑定顺序和事件回调函数的执行顺序。

7. 使用Object.create(null)创建新对象。

   不会继承Object原型链上的属性。

   ![](http://p1yseh5av.bkt.clouddn.com/18-7-4/10070175.jpg)

   [详解Object.create(null)](https://juejin.im/post/5acd8ced6fb9a028d444ee4e)

8. `Object.keys()` 方法会返回一个由一个给定对象的自身可枚举属性组成的**数组**，数组中属性名的排列顺序和使用 [`for...in`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...in) 循环遍历该对象时返回的顺序一致 。

9. fragment-tracker

   getBufferedFrag 获取已经缓冲了的frag

   detectEvictedFragments，检查当前frag缓冲状态是否有效，没效的删除。

   ```
   The browser will unload parts of the buffer to free up memory for new buffer data
   ```

   detectPartialFragments 检查Frag是否缓冲完成

   ```
   Checks if the fragment passed in is loaded in the buffer properly
   Partially loaded fragments will be registered as a partial fragment
   ```

10. typedArray.set

    **set()**方法用于从指定数组中读取值，并将其存储在类型化数组中。

    ```js
    typedarr.set(array [,offset])
    typedarr.set(typedarray [,offset])
    ```

    ```js
    // create a SharedArrayBuffer with a size in bytes
    const buffer = new ArrayBuffer(8);
    const uint8 = new Uint8Array(buffer);
    
    // Copy the values into the array starting at index 3
    uint8.set([1, 2, 3], 3);
    
    console.log(uint8);
    // expected output: Uint8Array [0, 0, 0, 1, 2, 3, 0, 0]
    ```

    



