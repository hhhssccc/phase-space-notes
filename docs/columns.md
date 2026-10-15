# 杂感与演算室

## 使用

- 杂感：复制 `templates/reflection.md` 到 `content/<稳定英文ID>.md`，填写元数据和正文。不要编造作者经历；空栏目显示留白。
- 演算室：按用户最新要求仅保留「减掉背景，让答案显影」。栏目主页显示预览，详情直接操作，不放正文预览图、开始/下载/重置按钮或说明段落。
- 类型和 URL 由 `src/lib/content-kinds.mjs` 定义，统一进入搜索、RSS、标签、归档和书房统计；草稿不发布。

## 技术与来源

沿用 Astro 静态构建和 GitHub Pages。图解使用 `sandbox="allow-scripts"` iframe，页面进入后自动加载；通过验证消息来源的 postMessage 同步高度和主题。页面切换清理监听和定时器，不抢焦点。打印使用静态初始状态图。

视觉源自用户指定聊天 `01a13347-109f-76f3-a065-7915567ee347`：无框图表、蓝橙配色、直接标注、原生控件。原文件在 `reading-essays/grover算法综述/outputs/grover_black_box_lesson/`，保持不变；网站片段在 `src/features/visualizations/fragments/`，统一样式为 `surface.css`。其他三份示例的发布内容、片段、截图与仅供噪声图使用的 D3 已移除。

保留示例的模型边界：经典程序操作态的数学表示，相减前仍须计算 oracle 后的状态；枚举八个候选用于说明机制，不代表任意搜索都能常数时间完成。来源：E. M. Stoudenmire 与 Xavier Waintal, Opening the Black Box Inside Grover’s Algorithm, Physical Review X 14, 041029 (2024), https://doi.org/10.1103/PhysRevX.14.041029 。相关原文由条目 related 链接。

现有文章不再自动附带文末实验；历史 physics-lab 模型只保留作数值参考。

## 文章和笔记预览

所有现有文章/笔记复用原题图。构建的 cover manifest 提供 320/640px 缩略图，EntryPreview 读取题图引用，EntryListItem 用于文章、笔记、标签列表；首页和归档复用 EntryPreview。无需新增 Frontmatter，编辑正文题图后列表自动更新。列表预览不裁剪、不反色、不添加到正文。新文章须提供适合预览的题图。

## 验证

`npm run build` 检查类型、链接和内容回归；`node scripts/check-columns-browser.mjs` 检查所有文章/笔记缩略图、单例图解自动加载、导航重入、主题、手机、打印及隔离边界。`npm run validate:browser` 检查既有书房、音乐和阅读功能。
