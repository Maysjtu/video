he **HTMLMediaElement.networkState** property indicates the current state of the fetching of media over the network.

```js
var networkState = audioOrVideo.networkState;
```

| Constant            | Value | Description                              |
| ------------------- | ----- | ---------------------------------------- |
| `NETWORK_EMPTY`     | 0     | There is no data yet. Also, `readyState` is `HAVE_NOTHING`. |
| `NETWORK_IDLE`      | 1     | HTMLMediaElement is active and has selected a resource, but is not using the network. |
| `NETWORK_LOADING`   | 2     | The browser is downloading HTMLMediaElement data. |
| `NETWORK_NO_SOURCE` | 3     | No HTMLMediaElement src found.           |

#### example

```Js
<audio id="example" preload="auto">
 <source src="sound.ogg" type="audio/ogg" />
</audio>
```

```Js
var obj = document.getElementById('example');

obj.addEventListener('playing', function() {

  if (obj.networkState === 2) {
    // Still loading...
  }

});
```

