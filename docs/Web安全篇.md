## Web安全篇

#### 一、CSRF 跨站请求伪造

​	跨站请求伪造（Cross-site request forgery），也称为one-click attack或者session riding，CSRF或XSRF。

​	是攻击者通过一些技术手段欺骗用户去访问一个自己曾经认证过的网站并执行一些操作（如发邮件，发消息，甚至财产操作如转账和购买商品）。由于浏览器曾经认证过，所以被访问的网站会认为是真正的用户操作去执行。这利用了web中用户身份验证的一个漏洞：简单的身份验证只能保证请求发自某个用户的浏览器，却不能保证请求本身是用户自愿发出的。

>假如一家银行用以执行转账操作的URL地址如下： <http://www.examplebank.com/withdraw?account=AccoutName&amount=1000&for=PayeeName>
>
>那么，一个恶意攻击者可以在另一个网站上放置如下代码： <img src="<http://www.examplebank.com/withdraw?account=Alice&amount=1000&for=Badman>">
>
>如果有账户名为Alice的用户访问了恶意站点，而她之前刚访问过银行不久，登录信息尚未过期，那么她就会损失1000资金。
>
>这种恶意的网址可以有很多种形式，藏身于网页中的许多地方。此外，攻击者也不需要控制放置恶意网址的网站。例如他可以将这种地址藏在论坛，博客等任何[用户生成内容](https://zh.wikipedia.org/wiki/%E7%94%A8%E6%88%B7%E7%94%9F%E6%88%90%E5%86%85%E5%AE%B9)的网站中。这意味着**如果服务器端没有合适的防御措施的话，用户即使访问熟悉的可信网站也有受攻击的危险**。
>
>透过例子能够看出，攻击者并不能通过CSRF攻击来直接获取用户的账户控制权，也不能直接窃取用户的任何信息。他们能做到的，是**欺骗用户浏览器，让其以用户的名义执行操作**。

**防御措施**

- 检查referer字段

  这种办法简单易行，工作量低，仅需要在关键访问处增加一步校验。但这种办法也有其局限性，因其完全依赖浏览器发送正确的Referer字段。虽然http协议对此字段的内容有明确的规定，但并无法保证来访的浏览器的具体实现，亦无法保证浏览器没有安全漏洞影响到此字段。并且也存在攻击者攻击某些浏览器，篡改其Referer字段的可能。

- 添加校验token

  由于CSRF的本质在于攻击者欺骗用户去访问自己设置的地址，所以如果要求在访问敏感数据请求时，要求用户浏览器提供不保存在cookie中，并且攻击者无法伪造的数据作为校验，那么攻击者就无法再执行CSRF攻击。这种数据通常是表单中的一个数据项。服务器将其生成并附加在表单中，其内容是一个伪乱数。当客户端通过表单提交请求时，这个伪乱数也一并提交上去以供校验。正常的访问时，客户端浏览器能够正确得到并传回这个伪乱数，而通过CSRF传来的欺骗性攻击中，攻击者无从事先得知这个伪乱数的值，服务器端就会因为校验token的值为空或者错误，拒绝这个可疑请求。

#### 二、XSS 跨站脚本攻击

​	跨站脚本（Cross-site scripting）XSS，是一种网站应用程序的安全漏洞攻击，是**代码注入**的一种。它允许恶意用户将代码注入到网页上吗，其他用户在观看网页时就会受到影响。

​	对于一些会展示用户输入的页面，可以将恶意代码注入。

#### 检测方法

```html
><script>alert(document.cookie)</script>
='><script>alert(document.cookie)</script>
"><script>alert(document.cookie)</script>
<script>alert(document.cookie)</script>
<script>alert (vulnerable)</script>
%3Cscript%3Ealert('XSS')%3C/script%3E
<script>alert('XSS')</script>
<img src="javascript:alert('XSS')">
<img src="http://xxx.com/yyy.png" onerror="alert('XSS')">
<div style="height:expression(alert('XSS'),1)"></div>（这个仅限IE有效）
```

#### 浏览器的同源策略

浏览器安全的基础是同源策略(same-origin policy). 简单说, 同源策略保证某个网站的cookie(比如银行的login cookie)不被别的不同源网站读取(比如恶意网站😏). 
同源的网站指这"3同":

- 同协议
- 同域名(域名级别也要相同)
- 同端口

如果设置了**document.domain**, 那么域名级别不同也算同源. 
同源策略除了影响**cookie**的读写, 还影响**localStorage**、**indexDB**的读写, **iframe**父窗口和子窗口间通信, 通过**ajax**发送http请求. 

##### 防御措施

对于一些用户输入的部分进行 HTMLEncode



#### 参考

[浏览器同源政策及其规避方法](http://www.ruanyifeng.com/blog/2016/04/same-origin-policy.html)

[跨站请求伪造](https://zh.wikipedia.org/wiki/%E8%B7%A8%E7%AB%99%E8%AF%B7%E6%B1%82%E4%BC%AA%E9%80%A0)