# 架构与维护

## 边界

- `content/` 是发布副本；`reading-essays` 编辑源稿仍独立维护。本次工程重构不改文章正文、日期、ID、插图或音频。
- `src/content.config.ts` 定义 Frontmatter；`draft` 必填，空标题/分类/说明、倒置修订日期及精选笔记会在构建时失败。
- `src/config/` 保存站点、曲目、专题与符号的编辑入口。
- `src/pages/` 负责路由和页面组装。文章、笔记 URL 不变，共用 `lib/content/service.ts` 的查询、引用验证和阅读上下文。
- `src/layouts/` 负责页面外壳与文章结构。`components/` 保存 Astro 展示组件，交互代码归 `features/`。
- `features/reading/` 管理书签、位置恢复、公式菜单、脚注、图片放大和进度；`features/search/` 管理搜索界面。
- `features/study-room/` 管理持久抽屉和音乐。音乐内部拆为播放会话、纯歌单状态、界面、存储、启动/取消与系统媒体适配。
- `features/physics-lab/` 将模型计算、SVG、控制器与实验注册表分离；点击后才加载相应控制器。
- `lib/browser/` 是少量共享能力：页面生命周期、存储容错和主题/纸面偏好；不承载业务 DOM。
- `lib/content/analysis.ts` 提供统一源码标题扫描、纯文本及公式密度分析。章节 URL 始终使用 Astro 渲染锚点。
- `plugins/` 完成 Markdown 转换。公式 ID 仍由原始 LaTeX 的摘要得到；WikiLink 使用内容实际类型；站内资源只在构建时加一次 base。

## 生命周期与状态

页面功能通过 `registerPageFeature(name, mount)` 注册。`mount` 接收 `AbortSignal`，可返回清理函数；在换页前清理，换页后重新初始化。各功能独立启动，Mermaid 等异步依赖失败不阻断其他功能。异步回调在操作 DOM 前检查取消状态。

书房与音乐是文档级功能：持久抽屉和独立音频在站内导航时保留。音乐会话只初始化一次；真正离开文档才暂停和释放播放资源，不能放入页面清理注册表。生成音频兼容接口仍保留。

主题和纸面通过 `preferences.ts` 修改；内联防闪烁脚本复用 `theme-config.ts` 的同一规则。阅读和音乐保留原 localStorage 键与数据格式，存储不可用时降级。

公式每篇共用一个菜单。桌面入口由 CSS 悬停/键盘聚焦显示；触屏默认关闭点按操作。菜单仅在打开时测量位置，滚动时关闭，不在每次滚动中遍历公式。宽公式仍由原 KaTeX 容器滚动；操作按钮和菜单位于容器外，打印不显示。

## 样式

`styles/global.css` 是显式排序的聚合入口：tokens、base、站点外壳、首页、浏览列表、文章布局、正文和打印。保持当前层叠关系，避免因拆文件改变视觉。全局辅助类在 `utilities.css`，功能样式靠近相应功能。

由 Markdown、`innerHTML` 或脚本生成的内容不拥有 Astro 组件作用域属性，因此公式、书架、实验 SVG 等使用明确的全局功能类。不要机械改为 scoped 样式。`article-performance.css` 的实测性能策略仍独立保留。

## 扩展入口

新增专题/符号仍修改 `config/reading-paths.ts` / `config/article-symbols.ts`；引用必须指向公开内容。新增实验时添加模型、图形、控制器，在 `physics-lab/registry.ts` 配置文章映射、说明和参数，并在 `entry.ts` 与 `PhysicsLab.astro` 注册对应加载器/静态绘图。参数默认值只有注册表一份，模型需独立数值检查。

新增页面交互先决定文档级或页面级生命周期。只有被两个以上功能实际使用的能力才进入 `lib/browser`，不要增加全局事件总线。

## 验证与发布

| 层级 | 入口 | 责任 |
| --- | --- | --- |
| 单元/隔离集成 | `npm run test:unit` | 引用、Markdown 分析、URL、WikiLink、模型、公式锚点、阅读存储和歌单行为 |
| 通用构建合同 | `npm run validate:render`、`npm run validate:reading` | 全站链接、元数据、公式渲染、Git 历史、搜索锚点与注册实验 |
| 内容回归 | `npm run validate:regressions` | 指定 Laurent、熵和 Jones 文章的历史回归，编辑这些样本时同步评估 |
| 浏览器集成 | `npm run validate:browser` | 1440/390、浅/深色、菜单、触屏、书签、跨页播放、搜索、实验和打印，并保存截图 |
| 长文交互 | `node scripts/check-article-interaction.mjs` | 原生/回退进度、全部公式、锚点、查找、打印；使用带窗口 Edge |

`npm run build` 自动运行前三层，CI 与 Pages 复用同一个命令。浏览器检查使用本机已有依赖，不自动下载浏览器；长文持续交互性能须额外在实际 Edge 中检查。

`scripts/check-*.mjs` 保留稳定命令入口，实际断言在 `tests/`。完整构建以后，`prepare-pages.mjs` 只复制到 `.pages-dist/`；发布前对该目录重复通用合同与内容回归。不要修改产物来修复源码问题。

构建本身不等于发布成功：提交并推送以后，仍须核对 Build 与 Pages 的成功 SHA，并检查公开 URL。架构重构不改变文章的首次公开/实质修订日期。
