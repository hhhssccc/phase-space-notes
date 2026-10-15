# 杂感与演算室

## 使用

- 杂感：复制 `templates/reflection.md` 到 `content/<稳定英文ID>.md`，填写标题、说明、首次公开日期，写正文。`type: reflection`，检查后设 `draft: false`。不用写学术摘要或参考文献。
- 演算室：复制 `templates/visualization.md`；`type: visualization`，`visualization` 指定注册表 ID。独立页面包含预览、互动、模型边界、相关原文和 HTML 下载。
- 两类内容均进入全站搜索、RSS、标签、归档和书房统计。草稿不会生成详情或可下载图解；旧文章的 URL、正文和日期不变。
- 不代作者撰写个人经历。杂感没有公开稿时显示留白。

## 技术路线

沿用 Astro 静态构建和 GitHub Pages 子路径，无新运行时框架、数据库或服务。内容类型与 URL 统一由 `src/lib/content-kinds.mjs` 定义。

演算室采用静态说明页 + `sandbox="allow-scripts"` 的隔离图解文档。点击后才加载计算代码；页面切换按既有生命周期清理。图解通过校验消息来源的 `postMessage` 同步高度与主题，不开放 same-origin、顶层导航、弹窗或表单权限。默认与打印展示真实初始状态截图。

参考：[Astro 页面脚本](https://docs.astro.build/en/guides/client-side-scripts/)、[MDN iframe sandbox](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe)。

## 风格与来源

用户指定聊天 `01a13347-109f-76f3-a065-7915567ee347` 的四份图解为首批作品与风格基准。源文件来自 `reading-essays/grover算法综述/outputs/grover_black_box_lesson/grover-*.html`，原文件保持不变。统一采用透明、无外框的图表区域，蓝橙主色、直接标注、原生控件、手机重排及深浅色适配。

可视化源码在 `src/features/visualizations/fragments/`；统一样式为 `surface.css`。后者提取自参考作品导出预览的公共样式，并补齐独立运行时字体默认值。D3 7.9.0 固定保存于 `vendor/`，附 ISC 许可证，构建时内联到噪声图中；HTML 下载不依赖 CDN，可离线运行。

新增图解时：在 fragments 添加 HTML，登记 registry，更新 schema 的合法 ID，创建 Markdown 说明与真实静态截图（`public/visualizations/`，深浅各一份），更新 previews.json 尺寸。所有计算必须自足，并说明假设、单位、边界；确认代码可信后才能收录。源代码下载与网站互动从同一片段构建。

现有物理文章和笔记不再自动附带文末实验。历史 physics-lab 模型文件保留作数值参考，ArticleLayout 不导入、加载或显示它们。两处移除回归检查保留。演算室四个作品独立收录，以链接指向相关原文，不改既有专题路线的阅读顺序。

## 验证

`npm run build` 检查 schema、链接、搜索锚点、RSS、文末实验移除和旧文章回归。`npm run validate:browser` 检查书房、音乐、搜索、公式等既有功能。`node scripts/check-columns-browser.mjs` 检查新栏目、四图互动、导航重入、主题、移动端、打印、离线源码及隔离边界。
