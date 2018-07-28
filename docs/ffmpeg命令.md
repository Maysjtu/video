# FFmpeg 命令

1. 将mp4转成m3u8文件

```
ffmpeg -i filename.mp4 -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 -f hls filename.m3u8
```

2. 格式转换

 ```
ffmpeg -i filename.mp4 filename.webm
 ```

3. mp4转fmp4

```
ffmpeg -re -i infile.ext -g 52 \
-strict experimental -acodec aac -ab 64k -vcodec libx264 -vb 448k \
-f mp4 -movflags frag_keyframe+empty_moov \
output.mp4
```

[how-to-output-fragmented-mp4-with-ffmpeg](https://stackoverflow.com/questions/8616855/how-to-output-fragmented-mp4-with-ffmpeg)

用在mse中失败了。

使用Bento 的 mp4fragment 成功

mp4fragment filein.mp4 fileout.mp4

4. 使用ffmpeg调整视频分辨率

   `ffmpeg -i <input> -vf scale=720x406 <output>`

   https://www.bugcodemaster.com/article/changing-resolution-video-using-ffmpeg

5. 