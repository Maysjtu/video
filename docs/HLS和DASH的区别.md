# HLS和DASH的区别

原文

[HLS vs DASH](https://www.vidbeo.com/blog/hls-vs-dash)



**HLS** and **DASH** are two rival formats for delivering video over the web. HLS is older and widely supported, however shows no likelihood of becoming an official standard format. DASH is newer, more efficient, and has become a standard. However it is not supported natively within HTML5.

Both HLS and DASH are based on standard HTTP protocols. As they use standard HTTP traffic, firewalls and proxy servers need no additional ports opening. This is a key advantage over UDP-based protocols, which often have to "tunnel" through ports (such as 80, the standard HTTP port) to bypass that restriction.

Since they are based on HTTP, HLS and DASH are ideal for delivery using a content delivery network (CDN), as their segments can be cached at the edge. This makes scaling much simpler than with other protocols like RTMP (use by Adobe's Flash).



### HLS

HLS supports AES-128 encryption, along with Apple's own DRM, Fairplay.



### DASH



 

