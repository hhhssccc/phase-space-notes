# 《渐近自由》维护规范（未来 Agent 必读）

本文件适用于整个仓库。任何 Agent 在新增文章、修改页面、调整样式、启用功能或发布网站之前，必须完整阅读本文件。用户在当前任务中的最新明确要求优先于本文件；除此之外，不得自行偏离这里锁定的内容与设计。

## 1. 项目身份（已确认）

- 中文站名：`渐近自由`
- 英文标识：`ASYMPTOTIC FREEDOM`
- 作者署名：`AsyaInTheCosmicStatic`（不得缩写、改大小写或插入空格）
- Slogan：`从模型出发，向结构深入。`
- 站点说明：`读书时记下的推导、问题和偶尔想明白的事情。`
- 内容语言：中文优先；专有名词、论文题名和必要术语可以保留原文。
- 站点定位：个人理论物理博客，不是资讯站、课程门户或卡片式知识库。

项目目录名和 GitHub 仓库名 `phase-space-notes` 属于部署基础设施，不等于公开站名。未经用户明确授权，不要重命名仓库、改变仓库可见性、迁移托管或修改公开网址。

## 2. 不可破坏的视觉约束

1. 整体方向是“学术纸刊 + 极简主页”，正文阅读优先于装饰。
2. 首页不使用卡片墙、大横幅、统计卡片或常驻播放器；右下角阅读角色是唯一有意保留的悬浮入口。
3. “书房”已按用户最新要求恢复并重做，收纳音乐、全站纸面、最近动态、内容统计和三态主题；不得再依据旧对话删除。
4. 首页精选文章只显示标题、分类和阅读时间，不在标题旁放文章简介。
5. 桌面长文保持“左目录—中正文—右边注”；手机收束成单栏，并把目录和边注变成可展开区域。
6. 正文背景始终是纯净纸面；深色模式需要单独调校，禁止直接对整页或图片套反色滤镜。
7. `public/assets/mascot-idle.webp` 只用于首页首屏；书房入口使用 `mascot-study-avatar.webp` 的莲子 Q 版头像；`mascot-reading.webp` 是保留素材，当前书房标题区不显示人物。
8. 全身角色图片必须等比显示，不得裁掉帽子、手、书或鞋；Q 版头像按其原生方形构图完整显示。所有角色图都不得使用 `invert()`、着色滤镜或改色版本。
9. 打印时隐藏导航、角色、互动控件和阅读进度，只保留适合 A4 的文章内容。
10. 字体职责保持稳定：中文正文为思源黑体风格，标题为思源宋体风格；拉丁标题/正文分别使用 Source Serif 4 / Source Sans 3；代码使用 IBM Plex Mono。
11. 文章目录只反映作者写下的标题，不自动添加 `1`、`1.1` 等编号；目录标题与边注中的 `$...$` 必须和正文一样渲染为 KaTeX。

如果用户只要求发布文章，不要顺手重做首页、字体、颜色、动画或导航。

## 3. 工程结构与权威来源

- `%USERPROFILE%\Obsidian\reading-essays\<学科>\notes\`：用户长期写作与修订的编辑源稿。学科能够明确时，优先放入对应学科的 `notes/`，不要默认堆到 vault 根目录的 `notes/`。
- `content/`：网站构建使用的发布副本。它是线上版本的直接输入；若内容带有 `blog_id` 对应的 reading-essays 编辑源稿，再次发布前必须先从编辑源稿同步，不能让两份正文各自演化。
- `src/content.config.ts`：Frontmatter 数据结构的唯一工程定义。
- `templates/article.md`：新文章起稿模板。
- `src/config/site.ts`：站名、署名、导航、功能开关和角色资源接口。
- `src/components/study-room/`：书房抽屉、音乐控件和站点内容统计。
- `src/lib/article-history.ts`、`src/components/ArticleHistory.astro`：文章 Git 文件版本与日期语义的公开展示。
- `src/styles/global.css`：全站排版、响应式、深浅色与打印样式。
- `public/figures/`：文章插图；新文章优先使用 `public/figures/<文章文件名>/` 子目录。
- `public/assets/mascot-idle.webp`、`public/assets/mascot-reading.webp`、`public/assets/mascot-study-avatar.webp`：固定角色资源接口，文件名不得改变。
- `src/plugins/remark-wikilinks.mjs`：WikiLink 转换逻辑。
- `.github/workflows/ci.yml`：源码构建检查。
- `.github/workflows/pages.yml`：当前 GitHub Pages 发布流程。

不要直接编辑 `dist/`、`.pages-dist/`、`.astro/` 或 `node_modules/`。这些都是生成目录。

## 4. 文章文件与 URL

每篇内容是 `content/` 下的一份 `.md` 文件。文件名同时是稳定 ID 和 URL slug：

- 只用小写 ASCII、数字和连字符，例如 `why-entropy-increases.md`。
- 文件名一旦公开，除非用户明确要求，不要改名；改名会破坏旧链接、WikiLink、相关阅读和搜索索引。
- `type: essay` 发布到 `/articles/<id>/`。
- `type: note` 发布到 `/notes/<id>/`。
- 不在正文中再写一级标题 `#`；页面会从 Frontmatter 的 `title` 生成唯一 H1。

## 5. Frontmatter 合同

推荐完整格式：

```yaml
---
title: 文章标题
description: 一句话说明本文真正回答的问题。
abstract: 用两三句话交代出发点、方法与主要结论。
date: 2026-08-17
updated: 2026-08-20
type: essay
category: 统计力学
tags: [熵, 相空间, 粗粒化]
featured: false
draft: true
related: [coarse-graining-note]
backlinks: []
mathDisplay: auto
sidenotes:
  - marker: "*"
    title: 粗粒化
    body: 这里写不打断正文的补充说明。
---
```

字段规则：

| 字段 | 要求 |
| --- | --- |
| `title` | 必填。准确、具体，避免标题党；不要带站名。 |
| `description` | 必填。纯文本一句话，说明文章解决的问题；同时用于列表摘要和社交元数据。 |
| `abstract` | 长文建议填写，短笔记可省略。不得只是重复 `description`。 |
| `date` | 必填，使用 `YYYY-MM-DD`，表示首次公开日期。 |
| `updated` | 仅在实质性修订后填写；修正错字不必更新。 |
| `type` | `essay` 或 `note`。完整论证用 `essay`，单一问题/推导卡片用 `note`。 |
| `category` | 必填，只选一个稳定学科名称，如“统计力学”“量子力学”“理论力学”。 |
| `tags` | 建议 2–6 个中文标签；复用已有标签，避免同义词分裂。 |
| `featured` | 仅 `essay` 可设为 `true`；首页最多保留 3 篇精选。 |
| `draft` | 写作和检查阶段必须为 `true`；通过发布检查后才能改为 `false`。 |
| `related` | 相关内容的文件 ID，不含路径和 `.md`。只填写确实相关且已存在的内容。 |
| `backlinks` | 明确链接到本文的内容 ID。新增 WikiLink 后同步检查是否应更新。 |
| `mathDisplay` | `auto`、`ruled` 或 `plain`。默认 `auto`：文字多公式少时保留上下细线，公式密集时自动使用无框紧凑样式；只有自动判断不合适时才手动覆盖。 |
| `sidenotes` | 可选。宽屏显示在右侧，手机折叠；控制在 1–4 条，不要复制脚注内容。 |

禁止添加未经 `src/content.config.ts` 定义的 Frontmatter 字段；需要新字段时，先更新 schema、模板和本文件。

## 6. 正文写作与层级

1. 正文从问题、物理场景或结论的适用条件开始，不重复标题。
2. 使用 `##` 作为主章节、`###` 作为子章节，不跳级，通常不超过三级标题。
3. 中文表达优先解释“量是什么、公式从哪里来、近似忽略了什么、结论何时失效”。
4. 完整推导不能用“显然”“容易得到”掩盖关键步骤；可省略的代数必须说明省略内容。
5. 区分原始资料中的结论、作者自己的解释和项目补充推导，不把补充内容冒充原作者观点。
6. 不虚构引用、页码、DOI、实验结果或历史事实；无法核实的内容明确标注待核实并保持草稿。
7. 术语首次出现时给出中文名、必要的英文名和本文采用的定义。
8. 文章末尾先给真正回答开头问题的小结，再列参考文献；不要用空泛口号结尾。

## 7. 数学、代码和图表

- 行内公式：`$E=mc^2$`。
- 独立公式：使用 `$$ ... $$`，前后各留一个空行。
- 显示公式样式默认使用 `mathDisplay: auto`。构建时根据正文字符数与显示公式数量自动选择 `ruled` 或 `plain`；不要为了某一篇文章直接改全站公式边框。
- KaTeX 的渲染包与页面 CSS 必须解析到同一安装版本；`npm run build` 的渲染合同检查会阻止版本错配、残留 Obsidian callout 和损坏的 `\boxed` 结构进入发布。
- 公式作为句子的一部分时保留中文标点；长推导按逻辑分段，不用截图代替公式。
- 每个新符号应在首次出现附近定义，并注明单位、维度或约定（若相关）。
- 代码块必须声明语言，例如 `````python``；代码应能说明正文问题，不放无关样板。
- Mermaid 使用 `````mermaid``，节点文字保持简短；复杂物理图优先使用正式插图而非流程图。
- 表格只承载确实需要逐列比较的信息；手机端虽可横向滚动，仍应控制列数和单元格长度。

## 8. 图片、题注和深色模式

新图片推荐写法：

```html
<figure>
  <img
    src="/figures/article-id/example.webp"
    alt="准确描述图中物理量和关系"
    width="1400"
    height="820"
    loading="lazy"
  />
  <figcaption>图 1｜说明图展示什么、采用什么约定，以及读者应观察什么。</figcaption>
</figure>
```

- 图片必须存入仓库，不依赖外站热链。
- 优先 WebP；需要无损线条或透明通道时可用 PNG。避免无必要的大文件。
- 必须填写真实 `width`、`height`、`alt` 和题注，以减少布局跳动并支持无障碍阅读。
- 图号按正文出现顺序排列；正文应明确引用“图 1”，不能只放图不解释。
- 深色模式不得对照片、图表或角色应用全局 `invert`。若黑白图在深色背景下不可读，由页面提供固定浅色承托底。
- 使用外部图片、论文插图或数据时，记录来源与授权；无法确认使用权时不要发布。

## 9. 链接、WikiLink、脚注与参考文献

- WikiLink：`[[notes/coarse-graining-note|粗粒化笔记]]` 或 `[[article-id|显示文字]]`。
- WikiLink 目标必须存在；发布前不得留下原样的 `[[...]]`。
- 普通链接使用标准 Markdown，链接文字要说明目标，不使用连续的“点击这里”。
- 脚注使用 GFM：正文 `[^1]`，文末定义 `[^1]: ...`。
- 参考文献章节使用 `## 参考文献`；条目至少包含作者、题名、年份和可核验的出版信息或链接。
- 直接引文保持短且必要；以概述为主，并明确来源。

## 10. 从 reading-essays 笔记到博客的工作流

用户今后会在 `%USERPROFILE%\Obsidian\reading-essays` 各学科的次级 `notes/` 文件夹中编写 Markdown，再由 Codex 发布。这个流程的目标是让用户只维护一份适合 Obsidian 阅读和修改的源稿，网站工程负责格式转换、验证与上线。

### 10.1 编辑源稿的位置与命名

- 学科明确时放在 `reading-essays/<学科>/notes/`；例如统计物理文章放在 `reading-essays/统计物理/notes/`。
- 只有跨学科且无法确定主归属时，才使用 vault 根目录的 `notes/`。
- 遵守 reading-essays 的命名约定：笔记文件名使用英文下划线，例如 `information_entropy_and_everything.md`。
- 附件优先放在该笔记目录下的 `assets/` 子目录，使用相对 Markdown 图片路径，保证 Obsidian 可以离线预览。
- 不扫描并自动发布整个 `notes/` 目录；只处理用户明确点名的文件。

### 10.2 编辑源稿 Frontmatter

reading-essays 笔记继续遵守它自己的 Vault 合同，使用 `type: note`。博客映射使用额外的 `blog_*` 字段：

```yaml
---
title: 信息、熵与一切
type: note
status: active
created: 2026-08-17
updated: 2026-08-17
blog_id: information-entropy-and-everything
blog_type: essay
blog_category: 信息论与统计力学
blog_tags: [信息熵, Shannon 熵, 粗粒化]
blog_featured: true
blog_math_display: auto
blog_description: 用于文章列表与社交元数据的一句话说明。
blog_abstract: 用于文章标题下方摘要框的两三句话。
blog_sidenotes:
  - marker: "*"
    title: 侧栏标题
    body: 侧栏正文；桌面显示在右栏，手机收进可展开的边注区域。
blog_url: https://hhhssccc.github.io/phase-space-notes/articles/information-entropy-and-everything/
---
```

- `blog_id` 是网站稳定 ID，必须使用小写 ASCII、数字和连字符；一旦公开不得擅自改变。
- `blog_type` 映射网站的 `essay` 或 `note`，不要把 Vault 的 `type: note` 直接当作网站类型。
- `blog_description`、`blog_abstract`、`blog_math_display` 和 `blog_sidenotes` 分别映射网站的列表说明、摘要框、公式布局和侧栏边注；同步时不得遗漏。
- `blog_math_display` 可取 `auto`、`ruled` 或 `plain`，默认使用 `auto`；只在自动密度判断不符合文章意图时写入手动值。
- `blog_sidenotes` 中的 `marker` 是符号，`title` 是侧栏粗体标题，`body` 是正文。列表顺序就是显示顺序；桌面显示在右栏，手机显示在可展开的“边注”区域。
- 编辑源稿没有 `blog_sidenotes`，不代表网站必须没有边注。若 Agent 在整理或排版时认为需要新增边注，必须把最终采用的完整 `blog_sidenotes` 回写到 reading-essays 原稿；不得只写进网站 `content/`。
- 若网站现有发布副本已有 `sidenotes`、但编辑源稿缺失对应字段，开始修订时应先把现有边注映射回原稿，再让用户或 Agent 在同一处继续修改。
- 没有 `blog_id` 的新笔记在首次发布时由 Agent 选择稳定 ID，并把映射写回编辑源稿。
- `blog_url` 在首次成功上线后写入；它是查找线上版本的便利字段，不用于决定部署路径。

### 10.3 同步与发布

用户说“发布这篇”或“重新上传这篇”后：

1. 读取本文件、reading-essays 根目录的 `AGENTS.md`、目标编辑源稿、网站 schema 与文章模板。
2. 检查两个项目的工作区状态，保护用户未提交修改；目标文件已存在时先比较，不静默覆盖。
3. 以 reading-essays 目标笔记为编辑内容权威，以 `content/<blog_id>.md` 为发布副本。
4. 将 Vault Frontmatter 映射为网站 Frontmatter，包括把 `blog_math_display` 映射为 `mathDisplay`；同步阶段保持网站 `draft: true`。若网站旧副本存在边注而源稿没有 `blog_sidenotes`，先把旧边注回写源稿，避免后续修订时丢失。
5. Vault 笔记允许保留与标题相同的单个 H1；复制到博客时删除这个 H1，避免文章页出现两个一级标题。
6. 把 Obsidian WikiLink、嵌入和相对附件转换成网站支持的链接或图片；附件复制到 `public/figures/<blog_id>/`，不得引用 vault 的绝对本地路径。
7. 只做排版兼容和用户明确要求的修改。若发现物理结论、公式或引用疑点，先报告，不在同步时静默改意。
8. Agent 若在发布整理中新增、删除或修改侧栏边注，必须先把最终的 `marker`、`title`、`body` 和顺序完整写回编辑源稿的 `blog_sidenotes`，再继续构建；禁止产生只存在于网站副本中的边注。
9. 比较编辑源稿与当前线上副本，向用户保留所有实质性改动；不得用旧网站正文反向覆盖新稿。边注回写属于元数据补全，不得借此覆盖用户已修改的 `blog_sidenotes`。
10. 按下节的新文章发布流程执行构建、桌面/手机/深浅色/打印检查和线上验证；通过后再设 `draft: false`。
11. 首次发布保留 `date`；实质性修订添加或更新网站 `updated`。成功上线后确认编辑源稿中的 `blog_id`、`blog_url` 与最终 `blog_sidenotes` 均和发布副本一致。

发布完成后不要删除或移动 reading-essays 编辑源稿。它是用户下次修改的入口；网站 `content/` 是可构建、可部署的同步副本。

## 11. 新文章发布流程

未来 Agent 接到“发布这篇文章”后，按以下顺序执行：

1. 读取本文件、`src/content.config.ts`、`templates/article.md` 和目标 Markdown。
2. 检查工作区状态，保护用户已有修改；不得覆盖未确认的同名文章或图片。
3. 为文章选择稳定 ID，补全 Frontmatter，先保持 `draft: true`。
4. 检查标题层级、公式定界符、符号定义、图片尺寸/题注、链接、WikiLink、标签与引用。
5. 仅做必要的语言和排版修正；涉及物理结论变化时必须说明，不得静默改意。
6. 运行 `npm run build`。任何 schema、类型、链接或渲染错误都必须修复。
7. 对长文检查桌面 1440px、手机 390px、浅色、深色和打印；纯文字小改可按风险缩减视觉检查。
8. 确认不溢出、不遮挡、公式/表格可读、图片不反色、标题和元数据正确。
9. 通过后设置 `draft: false`；首次发布设置 `date`，后续实质修订设置 `updated`。
10. 提交并推送 `main`，等待 Build 与 Publish preview 都成功，再检查公开 URL。
11. 向用户报告文章 URL、实际修改内容以及仍需用户确认的事实或素材。

不得仅因为本地能打开就宣称已经上线；也不得在构建或发布失败时把工作标为完成。

## 12. 常规维护流程

- 修改前先确认任务边界；诊断请求只报告原因，不擅自实施大改。
- 保持最小改动，不借发布文章之机升级依赖或重构全站。
- 删除文章、资源、历史记录或部署配置前必须获得用户明确授权并核对准确目标。
- 依赖升级应查看官方变更说明，单独提交，并运行完整构建与相关页面回归。
- 修改站名、署名、Slogan 时同步检查配置、首页、页脚、About、页面标题、README 和本文件。
- 修改文章 schema 时同步修改模板、现有内容、列表/详情页、搜索数据和本文件。
- 修改路径或部署基路径时检查 RSS、sitemap、canonical、WikiLink、动态资源和 GitHub Pages 子路径。
- 不在仓库中提交密码、令牌、私钥或个人邮箱。Giscus 等公开配置只通过已定义的环境变量提供。
- 当前仓库保持 Public 以支持现有 GitHub Pages。未经用户明确要求和托管迁移验证，不要转为 Private。

### 12.1 更换书房固定音乐

用户会定期指定新的公开音频页面，由 Codex 更换书房中的唯一固定曲目。这不是任意链接解析器或用户可编辑歌单；不得将需要签名、Cookie 或特殊请求头的临时媒体 URL 写入前端。

1. 先读取 `src/config/music.ts`、`src/components/study-room/MusicPlayer.astro` 和当前 `public/audio/study-room-current.m4a`，记录旧音源页、版本标识、文件大小与哈希。
2. 只处理用户明确给出的单个来源页面，去掉分享跟踪参数后把规范 URL 写入 `sourceUrl`。不抄用视频页面的完整标题；用户没有另行命名时，为书房写一个简短、中性、独立的展示名。
3. 使用当前官方 `yt-dlp` 或同等可审计工具读取音轨列表，优先选择浏览器可直接播放的 AAC/M4A 独立音轨。默认只用公开可取得的格式；未经用户明确授权，不导入浏览器 Cookie、会员凭据或付费音源。
4. 先把新音轨下载为临时候选文件，检查容器、时长、大小、可播放性与 SHA-256；只有候选文件通过后，才替换准确目标 `public/audio/study-room-current.m4a`。不要在新音频验证前删除或覆盖旧文件。
5. 在 `musicConfig.tracks[0]` 中同步更新自定义标题、描述、时长、规范来源页和 `src` 查询版本。版本格式使用 `YYYYMMDD-bvid-or-source-id`，保证 GitHub Pages/CDN 不会继续返回旧音频。
6. 运行完整 `npm run build`，然后在实际书房中检查：初始网络请求不包含音频、点击后才加载、播放/暂停/音量/循环正常、来源链接正确，且页面没有显示被要求避免的视频完整标题。
7. 更换音乐不自动授权发布。若用户要求“先预览”，则在本地验证后等待明确的发布指令；正式上线仍须完成本文件的全部发布验收。

## 13. 发布验收底线

每次正式发布至少满足：

- `npm run build` 为 0 error / 0 warning（第三方平台弃用提示需单独评估，但不能忽略真实失败）。
- 所有目标页面生成成功，内部链接没有指向缺失文件。
- 页面中没有未转换的 WikiLink、占位作者、旧站名或本次明确要求移除的功能文案。
- 首页精选不超过 3 篇，且标题视觉优先于元数据。
- 文章页仅有一个 H1；目录、边注、脚注和参考文献层级正确。
- 目录不自动编号；目录标题和桌面/手机边注中不得显示原始 `$...$` 或重复的 KaTeX 辅助文本。
- 390px 无横向页面溢出；宽表格和代码只在自身容器内滚动。
- 深色模式中的角色和正文插图未被反色；打印版不包含导航和角色。
- 音乐默认暂停、不自动播放，且只在用户明确点击后初始化；没有可用音源时应隐藏或明确降级。
- 书房默认关闭，支持 Escape、焦点限定与关闭后回焦；纯纸、方格与轨道纹理必须应用到首页、文章、笔记和其他站内页面。
- 文章页明确区分“首次公开”、“正文实质修订”和“Git 文件版本”，不得把技术提交冒称为正文修订。
- Build 与公开发布均成功，线上页面返回 200。

## 14. 当前暂缓事项

- 独立域名：未配置。
- Vercel：未接管当前正式托管。
- Giscus 评论：功能代码保留但默认关闭，缺少配置时不渲染。

这些事项只有在用户明确要求后才启用。
