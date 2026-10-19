# 杂感与演算室

## 使用

- 杂感：复制 `templates/reflection.md` 到 `content/<稳定英文ID>.md`，填写元数据和正文。不要编造作者经历；空栏目显示留白。
- 杂感列表沿用 `EntryListItem`，封面位于 `public/figures/<id>/cover.webp`，尺寸为 640×400。2026-10-19 三篇采用用户确认的白底、蓝橙、无字抽象插画；封面只用于列表预览，不重复插入正文。原尺寸图片保存在对应 Vault 附件目录。
- 演算室：按用户最新要求收录 QiGA 背景相减与 QiGA-2 逐位计数两份图解。栏目主页显示预览，详情直接操作，不放正文预览图、开始/下载/重置按钮或说明段落。
- 类型和 URL 由 `src/lib/content-kinds.mjs` 定义，统一进入搜索、RSS、标签、归档和书房统计；草稿不发布。

## 技术与来源

沿用 Astro 静态构建和 GitHub Pages。图解使用 `sandbox="allow-scripts"` iframe，页面进入后自动加载；通过验证消息来源的 postMessage 同步高度和主题。页面切换清理监听和定时器，不抢焦点。打印使用静态初始状态图。

视觉源自用户指定聊天 `01a13347-109f-76f3-a065-7915567ee347`：无框图表、蓝橙配色、直接标注、原生控件。原文件在 `reading-essays/grover算法综述/outputs/grover_black_box_lesson/`，保持不变；网站片段在 `src/features/visualizations/fragments/`，统一样式为 `surface.css`。MPS 与噪声两份示例及仅供噪声图使用的 D3 不再发布；QiGA-2 从同一参考源恢复收录。

保留示例的模型边界：经典程序操作态的数学表示，相减前仍须计算 oracle 后的状态；枚举八个候选用于说明机制，不代表任意搜索都能常数时间完成。来源：E. M. Stoudenmire 与 Xavier Waintal, Opening the Black Box Inside Grover’s Algorithm, Physical Review X 14, 041029 (2024), https://doi.org/10.1103/PhysRevX.14.041029 。相关原文由条目 related 链接。

现有文章不再自动附带文末实验；历史 physics-lab 模型只保留作数值参考。

## 文章和笔记预览

按用户最新要求，10 篇文章与笔记均使用与演算室一致的白底蓝橙概念图，不再使用正文题图作预览。原创 SVG 定义在 `src/features/previews/diagrams.ts`，静态资源路由为 `/previews/<id>.svg`；没有外部素材、字体或运行时脚本。图内内容取自对应文章：旋转群、辫子交叉、二元熵、Grover 振幅、围道与 Fourier 模式、Gibbs 权重、Born 概率、势阱、等能轨道以及单态占据。示意图用于识别主题，不替代正文推导。

EntryPreview 与 EntryListItem 继续覆盖文章、笔记、标签、归档、首页。新增公开文章/笔记必须在 diagrams 注册图解，缺图构建失败。正文的 lead-figure、源图和日期均不改；演算室列表同样使用核心图形 SVG：QiGA 四组振幅与 QiGA-2 计数树，不含下拉框、滑块和说明文字；完整截图仅供详情打印。

## 验证

`npm run build` 检查类型、链接和内容回归；`node scripts/check-columns-browser.mjs` 检查所有文章/笔记缩略图、单例图解自动加载、导航重入、主题、手机、打印及隔离边界。`npm run validate:browser` 检查既有书房、音乐和阅读功能。

## QiGA-2 与原论文引用

期刊版第 VI A 节、图 9 与公式 (21)–(24) 给出闭合模拟计数法。A=S/2ⁿ；每一步试填 0，计算该分支 A₀=S₀/D₀，非空则保留 0，否则保留 1。此图沿用参考作品的首位优先顺序（原论文从末位开始），输入为单解 101 或多解 010、101、111，显示初始计数加三次分支计数。图中枚举仅演示机制，并非高效电路模拟器；单次精确振幅计算仍可能很昂贵。

两份详情在图下共用完整原论文书目与 DOI，并分别标注 QiGA 的第 IV 节、QiGA-2 的第 VI A 节/图 9/公式 (21)–(24)。不添加长篇正文。
