# 渐近自由：个人物理博客

AsyaInTheCosmicStatic 的中文理论物理博客：从模型出发，向结构深入。首页保持极简，正文采用纸刊式三栏阅读。

> Agent 在维护或发布前必须完整阅读根目录的 `AGENTS.md`。文章合同、视觉边界、发布流程和验收标准均以该文件为准。

## 日常写作

长期写作和修订优先在 `%USERPROFILE%\Obsidian\reading-essays\<学科>\notes\` 中完成；学科明确时放进对应学科，而不是统一堆到根目录。`content/` 保存网站实际构建使用的发布副本。

用户只需要在 Obsidian 修改源稿并告诉 Codex“发布这篇”或“重新上传这篇”；Codex 负责按 `blog_id` 同步发布副本、转换 WikiLink 和附件、补全网站元数据、检查公式与图片、构建、提交与推送。`templates/article.md` 是网站侧结构参考，不要求用户手工填写。

## 已实现

- 首页、文章、笔记、归档、标签、搜索、关于和 404 页面
- KaTeX 公式、Mermaid 图表、WikiLink、脚注、表格、代码和图片题注
- 桌面目录/正文/边注三栏，手机单栏与折叠边注
- 引用预览、图片灯箱、反向链接、相关阅读、阅读进度
- RSS、sitemap、打印样式和本地搜索
- 系统/浅色/深色主题和纯净正文纸面
- 右下角莲子头像书房：三态主题、全站纸面、默认暂停的音乐、最近动态与构建期内容统计
- 文章首次公开/正文实质修订日期，以及可核验的 Git 文件版本时间线
- 评论采用配置开关；缺少配置时自动隐藏

## 书房音乐

书房使用单一固定曲目，音频文件接口是 `public/audio/study-room-current.m4a`；前端仍保持默认暂停，只在用户点击后加载。未来由 Codex 更换时，必须按 `AGENTS.md` 的“更换书房固定音乐”流程执行，并更新 `src/config/music.ts` 中的来源页与缓存版本。

## 固定角色接口

- `public/assets/mascot-idle.webp`：首页首屏
- `public/assets/mascot-study-avatar.webp`：书房入口的莲子 Q 版头像
- `public/assets/mascot-reading.webp`：保留的全身阅读素材，当前界面不显示

角色图始终等比显示。深色模式不会对素材使用反色、改色或滤镜。

## 本地检查

```bash
npm install
npm run dev
npm run build
```

静态产物生成在 `dist/`。推送到 GitHub 后，由 GitHub Pages 自动构建并发布。

## 长文排版性能

构建时为独立公式预估占位高度，浏览器通过 `content-visibility: auto` 延后排版屏幕外的公式。正文、原始 TeX 和辅助阅读使用的 MathML 始终保留，支持原生查找与目录跳转；打印不启用延后排版。不支持该 CSS 的浏览器直接使用普通排版。带编号或显式换行等无法可靠估算的公式保留普通排版。

阅读进度通过尺寸观察更新总高度，滚动时只在动画帧内更新进度，不反复测量整篇文章。调整 KaTeX 版本或 `.katex` 字号时须同时检查 `src/plugins/rehype-math-visibility.mjs` 的高度估算，并运行 `node --test scripts/rehype-math-visibility.test.mjs`、完整构建及手机/桌面的目录、查找、打印回归。

## 尚未配置

站名、作者、Slogan 与视觉方向已经确认。独立域名与评论仍未配置；正式域名确定后，用 `SITE_URL` 环境变量覆盖默认地址。
