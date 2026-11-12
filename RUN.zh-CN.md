# React Bits 组件库

首页是 HTML 模板库，支持按 Presentation、Product、Solution 和 Exhibition 浏览。示例卡片用于演示，真实模板可用 Upload 导入。

- HTML 链接支持 HTTP 和 HTTPS。若来源网站禁止嵌入，可从预览窗口打开原链接。
- ZIP 内请包含 `index.html` 和相对路径引用的资源。支持常见的本地样式、图片、字体和脚本。ZIP 上限 25 MB，解压后上限 50 MB。多页面跳转、运行时加载的本地文件及模块间相对导入需要先打包为单页，或改用已托管的 HTML 链接。
- 导入按浏览器及站点地址保存。静态部署后每个浏览器使用自己的模板库，当前版本没有共享上传存储。

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

这个副本保留 React Bits 的版权和 [许可证](LICENSE.md)。上游许可证限制组件本身的再分发，以及原版或实质相似工具的托管服务。原有 Tools、Pro、Sponsors 和 Showcase 路由仍在源码中，首页中尚未确定的导航显示「待开发」。
