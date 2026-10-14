# 制作与检查

## 环境与样例

在项目根目录运行 `npm ci`、`npm run setup`。Node.js 至少 22.18。`npm run check` 检查编译和回归；`npm run demo` 渲染当前白底蓝色样例，`npm run demo:jev` 渲染 AI 样例。

## 新主题的数据

读取 `schemas/knowledge-plan.schema.json` 和 `examples/flat/general-transformer/knowledge-plan.json` 了解格式，读取同目录 staging.json 了解动画声明。

- knowledge-plan：input、sources、claims、foundation、glossary、scenes、review 等字段以 schema 为准。foundation.plain_definition 必须出现在实际定义场景的讲稿中。input.style_profile 的 `editorial-notes` 是内容计划格式；画面的风格在 staging.style_profile 设置为 `tech-light`（白底蓝色）、`tech`（深色）、`studio`、`ink` 或 `midnight`。
- scenes 的 cues 是语义短句，决定字幕和时间；requires / teaches 表达前置知识。不同主题按事实设计结构，不能照搬样例说法。
- staging.shots 与内容场景一一对应。每个 nodes 对象有稳定 id、kind 和 keys；keys.t 是场景内 0–1 的相对时间，编译后变为秒。
- 节点类型包括 text、rect、surface、path、dots、image、asset。text 的 printedOn 绑定真实 surface；path 需提供 bounds；dots 各状态保留相同数量与身份。字段见 `src/cartoon/flatEngine.ts`。
- image.src 是 public 内的相对路径，仅支持本地 PNG/JPG/WebP。不要填网络 URL。为新素材记录来源和许可；找不到可用素材时明确说明，设计原创示意图。
- visualEvidence 记录 trigger / change / result / nodes，引用真实出现的节点。有意接触使用 contacts 的 pair、start、end、reason；禁止用全天豁免掩盖布局错误。

为新主题建立 `projects/my-topic/knowledge-plan.json` 和 `staging.json`，然后执行：

```sh
npm run compile -- projects/my-topic/knowledge-plan.json projects/my-topic/staging.json projects/my-topic/generated
npm run render -- projects/my-topic/generated/film.json out/my-topic.mp4
```

取指定帧检查：

```sh
npm run render -- projects/my-topic/generated/film.json out/my-topic-frame.png 300
```

正式渲染会检查内容、文字和物体布局。失败应修正知识或动画，不能使用 `--study` 绕过正式交付检查。可选的 Python 视频检查依赖在 requirements-qc.txt；这不是渲染的必要条件。

## 质量判断

内容检查分别判断准确性、完整性、清晰度、类比是否误导、术语密度与视觉是否支撑讲解。标准篇必须包含完整认知链；短视频可合并维度，不能省略基本定义或必要前提。

视觉上检查全程可读性、运动轨迹、前后层级、字幕对比、动作因果和节奏。每 1.5–2.5 秒争取一次有意义的状态变化，连续静态超过 3 秒应重新审视；不能靠背景闪动来凑变化。保留重音、停顿和动作反馈，避免廉价弹跳。

自动报告是结构与几何证据，不是事实核查或审美评分。对无法支持的新动作扩展 renderer，并配套真实边界；不能伪装已有能力。

## 可选 3D 物体（v0.12）

需要解释体积、层级或观察角度时，可在普通 staging 的 nodes 中加入 `solid`。它使用三维顶点旋转、透视投影、背面剔除与方向光，不是图片的缩放替代。当前支持 box 与 sphere（可用不同三轴尺寸制作椭球）。这是基础几何模块，不支持角色骨骼、物理碰撞模拟、任意模型导入或跨物体的真实三维遮挡；跨物体仍按节点顺序绘制，不能用它表现互相穿插的物体。

```json
{
  "id": "layer",
  "kind": "solid",
  "geometry": "box",
  "width": 300,
  "height": 52,
  "depth": 160,
  "cameraDistance": 1600,
  "color": "#79c8c1",
  "keys": [
    {"t": 0, "x": 550, "y": 500, "rx": -12, "ry": -30},
    {"t": 1, "ry": 90}
  ]
}
```

rx/ry/rz 是角度；x/y 是画面中心位置，solid 尺寸以中心为原点。cameraDistance 必须大于物体外接球半径。动画与布局检查调用同一投影函数，因此检查会覆盖旋转时变大的轮廓。默认配色适合浅色 Studio；文字保持在独立平面上，不随物体旋转损害阅读。

三维节点是可选通用能力，默认制作与预览以 Tech Light 白底蓝色效果为准。

## Midnight 配色

`midnight` 使用近黑深蓝背景、冷白主文字、蓝色辅助标注与暖橙光源强调。背景点为视觉纹理，不表示数据或星图。使用该风格前判断是否符合题材；不能让所有知识主题都变成太空场景。

`light-source` 是可复用示意光源，局部边界含柔光为 ±150；标签须留在该边界外。增加元素时应明确它解释的内容，例如对照、照明方向或观察位置，不为填满空间添加无关图案。
