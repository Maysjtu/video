## 从Youtube上下载素材

详见 https://github.com/rg3/youtube-dl

1. Mac下安装youtube-dl命令行工具

```bash
sudo curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
sudo chmod a+rx /usr/local/bin/youtube-dl	
```

2. 根据url下载素材

```bash
youtube-dl https://www.youtube.com/watch?v=rJSta3pnsQk
```

3. Error: av_interleaved_write_frame(): Invalid argument

   > 添加参数 --prefer-ffmpeg

   ```
   youtube-dl http://v.youku.com/v_show/id_XMzE1NjI2MTM4OA\=\=.html\?spm\=a2h0k.8191407.0.0\&from\=s1.8-1-1.2 --prefer-ffmpeg
   ```

   ​