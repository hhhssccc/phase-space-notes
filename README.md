# 渐近自由：个人物理博客

AsyaInTheCosmicStatic 的中文理论物理博客：沿着公式，逼近直觉。首页保持极简，正文采用纸刊式三栏阅读。

> Agent 在维护或发布前必须完整阅读根目录的 `AGENTS.md`。文章合同、视觉边界、发布流程和验收标准均以该文件为准。

## 日常写作

所有文章都在 `content/` 中，每篇文章是一份 Markdown。这个目录可以直接作为 Obsidian Vault 的内容目录使用。

用户只需要写正文并告诉 Codex“发布这篇”；Codex负责补全元数据、检查公式和图片、构建、提交与推送。`templates/article.md` 是文章结构参考，不要求手工填写。

## 已实现

- 首页、文章、笔记、归档、标签、搜索、关于和 404 页面
- KaTeX 公式、Mermaid 图表、WikiLink、脚注、表格、代码和图片题注
- 桌面目录/正文/边注三栏，手机单栏与折叠边注
- 引用预览、图片灯箱、反向链接、相关阅读、阅读进度
- RSS、sitemap、打印样式和本地搜索
- 系统/浅色/深色主题和纯净正文纸面
- 评论采用配置开关；缺少配置时自动隐藏

## 固定角色接口

- `public/assets/mascot-idle.webp`：首页首屏
- `public/assets/mascot-reading.webp`：保留的角色阅读状态素材，目前不在页面中显示

两张图始终等比显示。深色模式不会对素材使用反色、改色或滤镜。

## 本地检查

```bash
npm install
npm run dev
npm run build
```

静态产物生成在 `dist/`。Vercel 可以零配置识别并部署。

## 尚未配置

站名、作者、Slogan 与视觉方向已经确认。独立域名与评论仍未配置；正式域名确定后，用 `SITE_URL` 环境变量覆盖默认地址。
