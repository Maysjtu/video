## Webpack打包性能

#### 优化非业务代码打包

- 初级解决方法

  手工打包这些module，然后设置externals，让Webpack不再打包它们。

  lib-bundle.js

  ```javascript
  window.__LIB["react"] = require("react");
  window.__LIB["react-addons-css-transition-group"] = require("react-addons-css-transition-group");
  // ...其它依赖包
  ```

  webpack lib-bundle.js lib.js

  ​

