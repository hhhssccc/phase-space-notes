# 渐近自由：个人物理博客

AsyaInTheCosmicStatic 的中文理论物理博客：沿着公式，逼近直觉。首页保持极简，正文采用纸刊式三栏阅读。

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
- 右下角阅读角色书房：三态主题、首页纸面、默认暂停的音乐、最近动态与构建期内容统计
- 文章首次公开/正文实质修订日期，以及可核验的 Git 文件版本时间线
- 评论采用配置开关；缺少配置时自动隐藏

## 固定角色接口

- `public/assets/mascot-idle.webp`：首页首屏
- `public/assets/mascot-reading.webp`：书房入口与抽屉阅读状态

两张图始终等比显示。深色模式不会对素材使用反色、改色或滤镜。

## 本地检查

```bash
npm install
npm run dev
npm run build
```

静态产物生成在 `dist/`。推送到 GitHub 后，由 GitHub Pages 自动构建并发布。

## 尚未配置

站名、作者、Slogan 与视觉方向已经确认。独立域名与评论仍未配置；正式域名确定后，用 `SITE_URL` 环境变量覆盖默认地址。
