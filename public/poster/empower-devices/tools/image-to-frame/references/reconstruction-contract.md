# 重建清单与验收

在任务工作目录保存 `reconstruction.json`，不要将用户作品写进 Skill 安装目录。PSD 继续生成原有 manifest.json 与 scene.json 供现有脚本使用；此清单记录跨工具语义，不冒充其兼容输入。

推荐最小结构：
```json
{
  "source": {"path": "absolute source path", "width": 1200, "height": 1600},
  "target": "figma",
  "brandSource": null,
  "elements": [{
    "id": "title", "kind": "text", "bounds": [100,100,800,100],
    "content": "已核对的原文", "occludedBy": [],
    "route": "native-text", "font": {"family": null,"style": null,"status": "unverified"},
    "brandBinding": null, "asset": null, "targetIds": [],
    "completeness": "unverified", "editability": "unverified"
  }],
  "checks": [], "differences": []
}
```

bounds 使用 x/y/width/height，与 PSD 原有 box 的 left/top/right/bottom 区别。对象可追加 shadow、receiver、zOrder、素材生成路径和恢复状态。所有可见信息都有对应项；多个节点属于一个语义对象时记录全部 ID。

验收需要证据：

| 类别 | 通过条件 |
|---|---|
| 覆盖 | 每个元素映射到真实目标节点或图层；无遗漏或重复可见整图 |
| 文字 | 文案、字体、字重、排版核对；原生文字并可修改恢复 |
| 矢量 | 形状、icon、线与边框实际可编辑路径/填充/描边 |
| 完整性 | 隔离对象与背景，隐藏遮挡者无断口、旧字、旧影；透明边缘在浅深底正常 |
| 品牌 | 真实样式/变量/组件来源和绑定证据；未绑定项说明原因 |
| 视觉 | 全图与局部对照位置、比例、字体、颜色、光影，记录实有差异 |
| 编辑 | 修改文字恢复、移动物件组恢复，检查背景/承接面/无影视图 |
| 交付 | Figma 实际链接或 PSD 实际文件；能读取/重开，预览来自最终产物 |

检查记录采用 passed / failed / unverified 与证据路径或节点 ID，不能仅凭 scene 声明标为 passed。看不清的字、缺失字体、生成差异和平台缺口保留在 differences。结构通过不能替代视觉或原生编辑验证。
