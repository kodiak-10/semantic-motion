# 可选配音与同步

先生成并检查无声 film.json。用户选择配音后，在根目录执行（Python 3.10+；建议独立虚拟环境）：

```sh
python -m pip install -r requirements-voice.txt
python scripts/free-voice.py examples/flat/general-transformer/generated/film.json out/voice --voice zh-CN-YunxiNeural --rate=+5%
node scripts/flat/prepare-voice.mjs examples/flat/general-transformer/generated/film.json out/voice out/voiced
npm run render -- out/voiced/film.json out/voiced.mp4
node scripts/flat/deliver-voice.mjs out/voiced.mp4 out/silent.mp4 out/audio-qc.json
```

换主题时替换文件路径即可。配音可选，默认流程不依赖 Python 或在线语音服务。

配音采用 [edge-tts](https://github.com/rany2/edge-tts) 访问在线语音服务，无需 API 密钥；讲稿会发送至该服务。使用官方列出的音色；默认 Yunxi 中文男声，语速 +5%。这是合成声音，不是 ChatGPT 本人声音，不支持自定义情感 SSML，不保证每个英文术语都读得标准。服务可用性可能改变，失败时停止配音步骤，不能自动换成劣质声音或伪造时间戳。

free-voice.py 将服务的逐词时间映射到原讲稿的语义短句。规范化后的文字必须完全一致，否则停止。prepare-voice.mjs 使用真实短句起点映射原动画时间，保留运动曲线，重新生成字幕和时间文件。节点与场景使用原动画秒数；字幕与视频长度使用实际配音秒数。成片总时长会随语速变化。字幕不逐字显示。

输出 out/voiced 包含 film.json、silent-film.json、narration.md/json、subtitle.srt、timing.json、voice-provenance.json。音频写入 public/audio，默认不进入源码包。生成结果只供本次成片，重新下载源码后需自行运行配音。

自动检查音轨、时长、削波与视频一致性；它不能代替试听。检查英文术语、句尾、停顿与动作同步，不能根据检查通过声称声音自然。外部录音需要同格式、经过核实的短句时间戳，本版不提供自动语音识别强制对齐。
