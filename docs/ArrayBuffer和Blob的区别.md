# ArrayBuffer和Blob的区别

### 来源

 https://stackoverflow.com/questions/11821096/what-is-the-difference-between-an-arraybuffer-and-a-blob

**Summary**

Unless you **need the ability to write/edit** (using an `ArrayBuffer`), then `Blob` format is probably best.

**Detail**

I came to this question from a [*different* html5rocks page.](https://www.html5rocks.com/en/tutorials/websockets/basics/), and I found [@Bart van Heukelom's comments](https://stackoverflow.com/questions/11821096/what-is-the-difference-between-an-arraybuffer-and-a-blob#comment41489269_11821109) to be helpful, so I wanted to elevate them to an answer here.

I also found it helpful to find resources specific to `ArrayBuffer` and `Blob` objects. I added the emphasis to reiterate the helpful detail I was looking for. In summary: *despite the emphasis on Blob being "raw data" it's very workable.

The differences from the documentation I wanted to emphasize:

- Mutability

  - an ArrayBuffer can be **changed** (e.g. with a DataView)
  - a Blob is **immutable**

- Source

  - Quoting Bart van Heukelom :

    > - An ArrayBuffer is in the memory, **available** for manipulation.
    > - A Blob can be on disk, in cache memory, and other places **not readily available**

- Access Layer

  - ArrayBuffer will require **some access layer** like [typed arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Typed_arrays)
  - Blob can be passed directly into other functions like [`window.URL.createObjectURL`](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL), as seen in the example from [OP's URL](http://www.html5rocks.com/en/tutorials/file/xhr2/).
  - However, as [Mörre points out](https://stackoverflow.com/questions/11821096/what-is-the-difference-between-an-arraybuffer-and-a-blob/39951543?noredirect=1#comment77413345_39951543) you may still need File-related APIs like `FileReader` to work with a blob.

- Convert

  - Can convert Blob to ArrayBuffer and vice versa, which addresses the OP's *"Aren't both containers comprised of bits?"*
  - **Blob can become an ArrayBuffer** [using the `FileReader`'s `readAsArrayBuffer` method](https://developer.mozilla.org/en-US/docs/Web/API/FileReader#readAsArrayBuffer())
  - **ArrayBuffer can become a Blob** [as @user3405291 points out](https://stackoverflow.com/questions/11821096/what-is-the-difference-between-an-arraybuffer-and-a-blob/39951543?noredirect=1#comment86677751_39951543) `new Blob([new Uint8Array(data)]);`, shown in [this answer](https://stackoverflow.com/a/44148694/3405291)

Here are the documentation details that helped me:

[Here is ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

> The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You **cannot directly** manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and **use that to read and write** the contents of the buffer.

[Here is Blob](https://developer.mozilla.org/en-US/docs/Web/API/Blob)

> A Blob object represents a file-like object of **immutable**, raw data. Blobs represent data that isn't necessarily in a JavaScript-native format. The File **interface** is based on Blob, inheriting blob functionality and expanding it to support files on the user's system.