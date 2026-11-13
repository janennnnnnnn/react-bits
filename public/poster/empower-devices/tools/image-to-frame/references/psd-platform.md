# PSD 平台能力与输出

继承的 `build_psd.ps1` 使用 Windows Photoshop COM；`compose.jsx` 是原生 Photoshop 合成代码。现有代码只直接支持 image/text/fill（rectangle/ellipse），复杂原生路径需要按本次任务扩展并验证，不能把任意 SVG 智能对象称为可编辑形状路径。

- Windows：检查 Photoshop 与 COM、Python 依赖后按原路线执行。
- macOS：不运行 Windows COM。检查真实 Photoshop 安装及可用的 JSX 调用途径，适配本次执行器并用合成素材验证后才用于用户图。可通过 Photoshop 支持的脚本入口或经过验证的本地控制调用；不得声称仓库自带了已验证的 Mac runner。
- 无 Photoshop：继续生成完整资产、场景清单、原生重建数据。仅当另一个 PSD 写入器经验证保留所需原生 text/shape/effect 类型时才可替代；打包多张 PNG 不能满足全部原生可编辑要求。无法达到时交付明确标为中间产物的资产，不称 PSD 转换成功。

PS 中主文案必须是 TypeLayer；形状/边框/icon 必须原生 shape/vector mask/path，不能用栅格层或仅嵌入一张图的智能对象冒充路径可编辑。复杂产品等可为各自智能对象；可编辑滤镜与阴影独立设置。新增 PSD 类型时更新预检与验收覆盖，不能绕过原校验或只改 scene 声明。

按 tooling.md 运行预检，PSD 使用新版本路径保存，重新打开验证字体/图层类型/完整合成；执行改字恢复、移动组恢复、隐藏主体检查背景等测试。未运行 Photoshop 的验证只能标为结构检查，不能称原生验证通过。

Python 依赖可以使用本 Skill `.venv/bin/python`（存在时）；否则检查当前环境再安装缺项。脚本路径均从当前 Skill 目录解析，不硬编码原作者 Windows 路径。
