## 进制转换

JS中的进制转换其实很简单，主要运用两个函数即可完成：

 

# toString 方法

返回对象的字符串表示。

`objectname.**toString(**[radix]**)**`

#### 参数

objectname

必选项。要得到字符串表示的对象。

radix

可选项。指定将数字值转换为字符串时的进制。

#### 说明

**toString** 方法是所有内建的 JScript 对象的成员。它的操作依赖于对象的类型：

对象 操作

|          |                                          |
| -------- | ---------------------------------------- |
| Array    | 将 **Array** 的元素转换为字符串。结果字符串由逗号分隔，且连接起来。  |
| Boolean  | 如果 Boolean 值是 **true**，则返回 “true”。否则，返回 “false”。 |
| Date     | 返回日期的文字表示法。                              |
| Error    | 返回一个包含相关错误消息的字符串。                        |
| Function | 返回如下格式的字符串，其中 *functionname* 是被调用 **toString** 方法函数的名称：`function functionname( ) { [native code] }` |
| Number   | 返回数字的文字表示。                               |
| String   | 返回 **String** 对象的值。                      |
| 默认       | 返回 “`[object objectname]`”，其中 `objectname` 是对象类型的名称。 |

 

### 抛出

当调用该方法的对象不是 Number 时抛出 TypeError 异常。

 ```javascript
var m = 10;  
document.write(m.toString(2) + "<br>"); // 显示为 1010  
document.write(m.toString(8) + "<br>"); // 显示为 12  
document.write(m.toString(10) + "<br>"); // 显示为 10  
document.write(m.toString(16) + "<br>"); // 显示为 a，小写  
 ```



# parseInt 方法

返回由字符串转换得到的整数。

`**parseInt(***numString*, [*radix*]**)**`

#### 参数

*numString*

必选项。要转换为数字的字符串。

*radix*

可选项。在 2 和 36 之间的表示 *numString* 所保存数字的进制的值。如果没有提供，则前缀为 '0x' 的字符串被当作十六进制，前缀为 '0' 的字符串被当作八进制。所有其它字符串都被当作是十进制的。

#### 说明

**parseInt** 方法返回与保存在 *numString* 中的数字值相等的整数。如果 *numString* 的前缀不能解释为整数，则返回 **NaN**（而不是数字）。

```
parseInt("abc")     // 返回 NaN。
parseInt("12abc")   // 返回 12。
```

可以用 **isNaN** 方法检测 **NaN**。

 ```javascript
document.write(parseInt(1010, 2) + "<br>"); // 显示为 10  
document.write(parseInt(12, 8) + "<br>"); // 显示为 10  
document.write(parseInt(10, 10) + "<br>"); // 显示为 10  
document.write(parseInt("a", 16) + "<br>"); // 显示为 10  
document.write(parseInt("A", 16) + "<br>"); // 显示为 10  
 ```



