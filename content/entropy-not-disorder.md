---
title: 熵不是“无序度”：从相空间体积谈起
description: 如果不先说明宏观描述忽略了什么，“无序”就只是一个会移动的比喻。
abstract: 本文从宏观约束对应的相空间区域出发，区分玻尔兹曼熵、吉布斯熵与信息熵，并解释不可逆性为何不是微观方程中的额外假设。
date: 2026-08-17
updated: 2026-08-17
type: essay
category: 统计力学
tags: [熵, 相空间, 粗粒化, 统计力学]
featured: true
draft: false
related: [coarse-graining-note, noether-conservation]
backlinks: [partition-function-derivative]
sidenotes:
  - marker: "*"
    title: 粗粒化
    body: 粗粒化不是把轨道磨平，而是把实验上不区分的微观状态归入同一宏观格子。
  - marker: "†"
    title: 典型性
    body: 宽屏显示为边注；手机页面中，同一内容会折叠回正文流。
  - marker: "‡"
    title: 平衡
    body: 平衡区域体积占优是典型性论证的核心，不需要把系统拟人化为“追求混乱”。
---

设想一个装有稀薄气体的盒子。微观状态需要用所有粒子的坐标和动量指定；宏观描述却只保留能量、体积与粒子数。所谓宏观状态，并不是一个微观点，而是一整片我们不再区分的相空间区域。

## 1. 宏观量如何出现

对 $N$ 个经典粒子，微观状态可以写成

$$
X=(\mathbf q_1,\ldots,\mathbf q_N;\mathbf p_1,\ldots,\mathbf p_N)\in\Gamma,
$$

其中 $\Gamma$ 是 $6N$ 维相空间。给定一组宏观约束 $M$，满足这些约束的点构成区域 $\Gamma_M$。玻尔兹曼的定义把这种区域的体积变成一个可加量：

$$
S_B(M)=k_B\log\frac{|\Gamma_M|}{h^{3N}}.
$$

分母只负责让对数的自变量无量纲；真正参与比较的是不同宏观区域的体积。这里的关键词不是“乱”，而是**兼容**：有多少微观状态与同一组宏观事实兼容。

<figure>
  <img src="/figures/phase-space.png" alt="相空间中小体积低熵区域演化并铺展到大体积平衡区域的示意图" width="1400" height="820" loading="lazy" />
  <figcaption>图 1｜相空间示意。哈密顿流保持细粒度体积，但一团初始分布会被拉伸、折叠，并在有限分辨率下覆盖更大的宏观区域。</figcaption>
</figure>

这一定义立刻解释了为什么“气体集中在左半边”和“气体均匀充满盒子”并不对称：前者对应的相空间体积大约只是后者的 $2^{-N}$。当 $N\sim10^{23}$ 时，这个比例小到不能用日常直觉表示。

| 描述层次 | 被保留的信息 | 对应对象 | 熵的角色 |
| --- | --- | --- | --- |
| 微观 | 每个粒子的坐标、动量 | 相空间中的一点 | 不需要热力学熵 |
| 宏观 | 能量、体积、粒子数等 | 相空间中的区域 | 区域体积的对数 |
| 概率 | 对微观状态的分布 | 密度 $\rho(X)$ | 分布不确定性的泛函 |

## 2. 粗粒化与典型性

哈密顿动力学满足刘维尔定理：相空间中的细粒度体积不会被压缩。因此，如果把吉布斯熵定义为

$$
S_G[\rho]=-k_B\int_\Gamma \rho(X,t)\log\rho(X,t)\,\mathrm dX,
$$

它在精确的哈密顿演化下保持不变。热力学熵增加并不是这条定理的反例；两者讨论的分辨率不同。

> 不可逆性并不要求微观方程忘记过去。它只要求宏观描述没有记录足够多的信息，去区分一条极其精细的相空间细丝与一个真正均匀的分布。

把相空间划分成有限大小的格子以后，我们只记录每个格子中的概率。拉伸和折叠会让分布进入越来越多格子，于是粗粒化熵上升。更细的定义见 [[notes/coarse-graining-note|粗粒化笔记]]。一个极简的数值实验可以这样写：

```python
import numpy as np

points = initial_cloud(n=100_000)
for step in range(200):
    points = area_preserving_map(points)
    histogram = coarse_grain(points, bins=64)
    entropy[step] = -np.sum(histogram * np.log(histogram + 1e-15))
```

这段程序没有加入摩擦；映射仍然保持面积。上升的是基于有限网格计算的熵，因为观测者主动放弃了格子内部的信息。

```mermaid
flowchart LR
  A[低熵宏观约束] --> B[微观可逆演化]
  B --> C[分布拉伸与折叠]
  C --> D[有限分辨率观测]
  D --> E[粗粒化熵增加]
```

## 3. 不是一句“无序”

“无序”有时能帮助初学者猜到熵变方向，但它不能充当定义。混好的扑克牌在人类习惯中显得无序，晶体在视觉上显得有序；然而统计力学关心的是约束、态数与概率测度，而不是图案是否整齐。

一个更稳定的工作句是：

$$
\Delta S=k_B\log\frac{\Omega_{\mathrm f}}{\Omega_{\mathrm i}},
$$

它询问终态宏观描述兼容的微观状态数，相对初态增加了多少。只要约束写清楚，“有序还是无序”的争论就会被一个可以计算的问题取代。这里还隐藏着低熵初始条件的重要性：时间箭头并非仅靠动力学定律决定。[^arrow]

玻尔兹曼墓碑上的公式常被孤立引用；更准确的理解是，它把热力学宏观量连接到相空间的计数结构。<span class="citation-wrap"><a href="#ref-boltzmann">[1]</a><span class="citation-popover" role="tooltip">Boltzmann, 1877：以“复合体”数目的对数联系概率与熵，是现代态数解释的历史来源。</span></span>

### 小结

熵不是物体“看上去有多乱”的评分。它是一个依赖宏观划分的量：当我们说明保留哪些信息、忽略哪些自由度以后，熵才有确定含义。不可逆性则来自低熵边界条件、相空间中的典型性，以及观测分辨率三者的共同作用。

[^arrow]: 微观可逆定律同时允许熵增与熵减轨道。经验中的时间方向还依赖宇宙早期的特殊低熵条件。

## 参考文献

1. <span id="ref-boltzmann"></span>L. Boltzmann, *Über die Beziehung zwischen dem zweiten Hauptsatze der mechanischen Wärmetheorie und der Wahrscheinlichkeitsrechnung*, 1877.
2. J. L. Lebowitz, “Boltzmann's Entropy and Time's Arrow,” *Physics Today* 46(9), 1993.
3. H. Tasaki, *Statistical Mechanics*, Springer, 2020.
