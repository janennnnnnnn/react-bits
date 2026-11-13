# React Bits 组件库

首页是 HTML 模板库，支持按 Presentation、Product、Solution 和 Exhibition 浏览。示例卡片用于演示，真实模板可用 Upload 导入。

- HTML 链接支持 HTTP 和 HTTPS。若来源网站禁止嵌入，可从预览窗口打开原链接。
- ZIP 内请包含 `index.html` 和相对路径引用的资源。支持常见的本地样式、图片、字体和脚本。ZIP 上限 25 MB，解压后上限 50 MB。多页面跳转、运行时加载的本地文件及模块间相对导入需要先打包为单页，或改用已托管的 HTML 链接。
- 导入按浏览器及站点地址保存。静态部署后每个浏览器使用自己的模板库，当前版本没有共享上传存储。

## 预览、定制与复用

在 HTML 或 Poster 中点击模板，或用左侧 Browse 快速切换。Customize 支持选择已保存的背景和 Figma 品牌 Logo，并可调整文字颜色、字体、对齐、边距和缩放。Reset 恢复原始样式。

PAX · MAXSTORE Ecosystem 包含 Figma 参考中的 17 张版式。Copy Link 复制原始模板的详情地址。Download HTML + Skill 下载当前配置的 HTML、`SKILL.md` 和所需资源。解压后打开 `index.html`。链接模板需先点击 Load editable source。若原站限制源码读取，请导入 ZIP。

## Creative Tools

Creative Tools 提供 Background Studio、React Bits 和 Sound Bits。Background Studio 仅展示 Aurora、Color Bends、Dither、Gradient ASCII、Grainient、Grid Motion、Laser Flow、Prism 和 Side Rays。Aurora 默认使用 Azure 到 Aqua，并按 PAX 色标提供六组预设。调整效果后，可从 Export → Code 复制配置，或用 Save to My Effects 保存当前画面。已保存的背景可在模板 Customize 中选择，并随 HTML 下载。我的效果保存在当前浏览器。

## 本地运行

在本目录执行：

```sh
npm ci
npm run dev
```

打开终端显示的本地地址。

## 构建和预览

```sh
npm run build
npm run preview
```

部署产物在 `dist/`。预览时可以直接访问首页、分类和组件详情，也可以刷新后检查深链接。

## 部署

如果有权发布此版本，可使用仓库内的 `wrangler.jsonc` 作为 Cloudflare Workers 部署配置，或将 `dist/` 上传到支持无扩展名 HTML 路径的静态托管。构建命令是 `npm run build`，输出目录是 `dist`。部署在域名根目录。当前静态 SEO 元数据沿用 React Bits 官方域名，接入自己的域名前需调整。

这个副本保留 React Bits 的版权和 [许可证](LICENSE.md)。上游许可证限制组件本身的再分发，以及原版或实质相似工具的托管服务。首页中尚未确定的导航显示「待开发」。
