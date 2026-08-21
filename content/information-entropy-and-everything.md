---
title: 信息、熵与一切
description: 从自信息与 Shannon 熵出发，经由相空间粗粒化理解热力学第二定律，并在 Maxwell 妖中看见信息擦除的代价。
abstract: 信息熵度量我们对随机结果的平均不确定性；热力学熵则在粗粒化的宏观描述中获得方向性。本文把两者放在同一条推导链上，并用 Maxwell 妖说明被擦除的信息如何转化为环境中的热力学熵。
date: 2026-08-17
updated: 2026-08-17
type: essay
category: 统计物理
mathDisplay: ruled
tags: [信息熵, Shannon 熵, 粗粒化, 热力学第二定律, Maxwell 妖]
featured: true
draft: false
related: []
backlinks: []
sidenotes:
  - marker: "*"
    title: 连续熵的尺度
    body: 连续 Shannon–Gibbs 熵会依赖参考测度与坐标尺度；本文只保留它与概率分布不确定性之间的核心联系。
  - marker: "†"
    title: 推导边界
    body: 粗粒化给出第二定律的信息论框架，但完整证明还需说明低熵初态、宏观观测限制，并排除极端精细调控与 Poincaré 回归等情形。
---

> 本文限于篇幅，暂时略去信息熵连续化时的测度选择等技术性问题。

## 引入：“并不是什么都知道，我只知道我所知道的”

<figure class="lead-figure">
  <img src="../../figures/information-entropy-and-everything/hanekawa-title.webp" alt="《物语》系列中的羽川翼与字幕‘我只知道我知道的事情’" width="2307" height="1448" loading="eager" decoding="async" />
  <figcaption>题图｜《物语》系列中的羽川翼：“并不是什么都知道，我只知道我所知道的。”</figcaption>
</figure>

一个常见的观点认为，物理学的目标是探究所谓的终极真理，但这显然会遇到一些困难。

假定我们所拥有的计算能力永远有限，那么我们便不可能穷尽所有的知识。统计物理与信息论的insight，便是辨认哪些信息必须保留、哪些细节可以舍弃。

一个例子：热力学里，我们通常知道的是少数宏观量；而真正的微观状态包含大量自由度，宏观观察无法逐一分辨。

| 描述层次 | 我们知道的 | 我们不知道的 |
| ---- | ----------------------- | ----------- |
| 宏观 | 热力学量，如 $E,V,N,T,\ldots$ | — |
| 微观 | — | 系统所处的具体微观状态 |

## 怎么度量信息？Shannon entropy

感性地说，信息是我们消除的不确定性；获得一条信息，就是把一部分“无知”排除掉。

### Surprisal：自信息与信息量

若事件 $x$ 出现的概率为 $p(x)$，定义它带来的信息量为

$$
I(x)=I\bigl(p(x)\bigr)=-k\log p(x).
$$

这里 $k$ 只是单位常数。若取 $\log=\log_2$ 且 $k=1$，单位是 bit；若取 $\log=\ln$ 且 $k=k_{\mathrm B}$，量纲便与热力学熵一致。

下文讨论 Shannon 熵时默认取 $k=1$；回到热力学熵时，再显式写出 $k_{\mathrm B}$。

这个定义之所以合理，可以从三条性质看出：

1. 罕见事件更“有信息”：$p$ 越小，$I$ 越大。
2. 必然事件没有新信息：$I(p=1)=0$。
3. 独立事件的信息量可相加。若 $p(x,y)=p(x)p(y)$，则

$$
I(x,y)=-k\log[p(x)p(y)]=I(x)+I(y).
$$

例如，公平硬币正面朝上的概率为 $1/2$，所以

$$
I(x)=-\log_2\frac{1}{2}=1\ \mathrm{bit}.
$$

<figure class="figure-light figure-plot">
  <img src="../../figures/information-entropy-and-everything/surprisal.png" alt="自信息 I(p) 随事件概率 p 下降而增大的曲线" width="686" height="504" loading="lazy" decoding="async" />
  <figcaption>图一｜事件越罕见，其自信息量越大。</figcaption>
</figure>

### Shannon entropy：平均信息量

对随机变量 $X$，若其可能结果为 $x_i$、概率为 $p_i$，则 Shannon 熵定义为

$$
H(X)=\langle I(x)\rangle=-\sum_i p_i\log p_i.
$$

直观上，$H(X)$ 表示：对于一个带概率分布的系统，我们平均还有多少无知。

以偏置硬币为例。设硬币正面概率为 $p$，反面概率为 $1-p$。若以 bit 为单位，

$$
H(X)=-p\log_2p-(1-p)\log_2(1-p).
$$

于是

$$
\begin{aligned}
p=0\ \text{或}\ 1 &: \quad H(X)=0,\\
p=\frac12 &: \quad H(X)=1\ \mathrm{bit}.
\end{aligned}
$$

当 $p=0$ 或 $1$ 时，结果已经完全可知；当 $p=1/2$ 时，我们对结果最无知。因此可以猜想：等概率时，无知最多。

<figure class="figure-light figure-plot">
  <img src="../../figures/information-entropy-and-everything/binary-entropy.png" alt="二元 Shannon 熵在正面概率为二分之一时达到最大值一 bit" width="720" height="474" loading="lazy" decoding="async" />
  <figcaption>图二｜等概率时不确定性最大。</figcaption>
</figure>

> **Shannon 熵的基本刻画。** 不严格证明地说，只要要求“不确定性”满足连续性、等概率单调性与分组一致性，它的形式就几乎被唯一确定为 $H=-\sum_i p_i\log p_i$。
>
> 1. **连续性：** 概率略微变化时，不确定性也只略微变化。
> 2. **等概率单调性：** 若有 $n$ 个等概率结果，则 $H(1/n,\ldots,1/n)$ 随 $n$ 增大而增大。
> 3. **分组一致性：** 若一个问题可以先分组、再在组内回答，则总不确定性等于“组的不确定性”加上“组内不确定性的加权平均”。

### 区分信息与可提取功

一个经典例子是带隔板的箱子。假设左右两边装有数量相同的两种稀薄物质，不妨把它们想成无规则运动的红色和绿色小球；总球数记为 $N$。起初红球在左、绿球在右。移开隔板，等待充分混合后再放回。

若一位外星物理学家和他的全部仪器都无法区分颜色，那么在他采用的粗粒描述中，混合前后没有可分辨的改变：

$$
\Delta S=0
$$

一个人类物理学家能区分两种组分的颜色，那么每个小球在等体积的左右两室之间多出一个二元位置选择：

$$
\Delta S_{\mathrm{mix}}=Nk_{\mathrm B}\ln 2,
$$

也就是每个小球贡献一 bit 的混合信息。

更重要的是，这种区分可以对应可提取功。若用只允许某一组分通过的选择性半透膜替代普通隔板，膜两侧会出现渗透压差，可以借此做功。对不具备组分选择能力的外星物理学家而言，这似乎是从“最大熵状态”中继续取出了功；比起认为热力学第二定律失效了，更合理的结论是，他原先的宏观描述遗漏了一项可操作的差异。（也许他会用“颜色”这个奇怪的词来命名。）

> **能被物理装置利用的区分信息，可以转化为可提取功。**

熵不是物理系统自身的属性。它取决于我们能够（或选择）测量什么，以及我们有能力（或愿意）考察到多细的细节。

### Maxwell 妖：循环的代价

这个问题的一个变体是所谓的 Maxwell 妖。
Maxwell’s demon 是一个可以观察分子速度的小妖。它控制一道小门，让快分子偏向一边、慢分子偏向另一边；看起来就能在不做功的情况下制造温差，从而似乎违反第二定律。

<figure class="figure-light figure-diagram">
  <img src="../../figures/information-entropy-and-everything/maxwells-demon.svg" alt="Maxwell 妖根据分子速度控制小门，将快分子与慢分子分流到左右两室的示意图" width="960" height="520" loading="lazy" decoding="async" />
  <figcaption>图三｜小妖测量分子速度，并控制小门将快、慢分子分流。</figcaption>
</figure>

原则上，测量和记录可以任意接近可逆；但若小妖要循环工作，就必须把记忆恢复到初始状态。根据 Landauer 原理，在温度为 $T$ 的热环境中，逻辑不可逆地擦除一 bit 记忆至少需要向热库释放

$$
Q\ge k_{\mathrm B}T\ln 2
$$

的热量，相当于让环境熵增加至少

$$
\Delta S_{\mathrm{env}}\ge k_{\mathrm B}\ln 2.
$$

因此，单看气体似乎能够降低热力学熵；但把小妖的记忆和热库一起算入，总熵并不会下降。

> **被擦除的信息熵，转化为环境中的热力学熵。**

## 诚实地面对无知：最大熵估计

<figure class="figure-portrait">
  <img src="../../figures/information-entropy-and-everything/et-jaynes.webp" alt="理论物理学家 E. T. Jaynes 的黑白肖像" width="500" height="627" loading="lazy" decoding="async" />
  <figcaption>图四｜E. T. Jaynes。他把统计力学重新表述为信息不完备时的统计推断。图片来自 <a href="https://commons.wikimedia.org/wiki/File:ETJaynes1.jpg">Wikimedia Commons</a>。</figcaption>
</figure>

最大熵（maximum entropy, MaxEnt）估计是统计推断中的重要原则，由 E. T. Jaynes 在 1957 年系统地用于统计力学。
其内容可以简述为：在归一化条件和我们确实掌握的知识约束范围内，应当选择使随机变量 $X$ 的 Shannon 熵最大的概率分布。哲学一点的解释是：你必须诚实地面对自己的无知，使推断不超出已有知识所能支持的水平。

### 相空间与 Shannon–Gibbs 熵

我们上面讨论的概率都是离散形式的；在连续空间里，我们往往采用概率密度展开讨论。

哈密顿力学中，相空间中的一点可以用

$$
\Gamma=(p_1,\ldots,p_n,q_1,\ldots,q_n)
$$

指定，也就是每个粒子的动量与位置，它描述一个微观态。离散形式的 Shannon–Gibbs 熵为

$$
S'[p]=-k_{\mathrm B}\sum_i p_i\ln p_i,
$$

若微观态的概率密度分布为 $\rho(\Gamma)$，则求和可以换成积分，连续形式写作

$$
S'[\rho]=-k_{\mathrm B}\int \mathrm d\Gamma\,\rho(\Gamma)\ln\rho(\Gamma).
$$

严格地说，上式的连续版本需要指定参考测度或粗粒化尺度；在这里我们不严格地只保留它与“概率分布的不确定性”之间的核心联系。

再看 Boltzmann 熵。设宏观态 $M$ 对应 $\Omega(M)$ 个可及微观态，且现有信息不足以进一步区分它们。最大熵原则给出均匀分布 $p_j=1/\Omega$，此时

$$
S_{\mathrm B}(M)=k_{\mathrm B}\ln\Omega(M).
$$

它也可以看成 Shannon–Gibbs 熵在等概率情形下的特例：

$$
-k_{\mathrm B}\sum_{j=1}^{\Omega}\frac{1}{\Omega}\ln\frac{1}{\Omega}
=k_{\mathrm B}\ln\Omega.
$$

## 从粗粒化熵看热力学第二定律

宏观观察者不能分辨相空间里越来越精细的细节。实际可见的不是精细分布 $\rho(\Gamma)$，而是把相空间分成许多粗粒单元 $C_a$ 后得到的粗粒化分布。

### 粗粒化

<figure class="figure-light figure-diagram">
  <img src="../../figures/information-entropy-and-everything/coarse-graining.png" alt="相空间分布依次经历粗粒状态、可逆演化和再次粗粒化的三联示意图" width="764" height="282" loading="lazy" decoding="async" />
  <figcaption>图五｜可逆演化与再粗粒化的示意。可逆演化会把分布拉伸、折叠，产生更细的结构；宏观观察只能保留粗粒化后的平均结果。</figcaption>
</figure>

把相空间划分为互不重叠的粗粒单元 $C_a$。在每个单元内，用平均值代替真实分布：

$$
\rho^{\mathrm c}(\Gamma)
=\frac{1}{|C_a|}\int_{C_a}\rho(\Gamma')\,\mathrm d\Gamma',
\qquad \Gamma\in C_a.
$$

这可以简写为

$$
\rho^{\mathrm c}=\widehat C\rho,
$$

其中 $\widehat C$ 是粗粒化算符。定义粗粒化熵

$$
S^{\mathrm c}[\rho]
=S[\rho^{\mathrm c}]
=-k_{\mathrm B}\int \mathrm d\Gamma\,
\rho^{\mathrm c}(\Gamma)\ln\rho^{\mathrm c}(\Gamma).
$$

关键事实是

$$
S[\rho^{\mathrm c}]\ge S[\rho].
$$

原因很直观：粗粒化会抹掉单元内部的细节；细节被丢掉后，我们对系统的无知只会增加，不会减少。

### 演化、再粗粒化与第二定律的大框架

<figure class="figure-light figure-diagram">
  <img src="../../figures/information-entropy-and-everything/coarse-entropy.png" alt="二维离散相空间玩具模型中精细熵不变而粗粒化熵逐步上升的曲线" width="768" height="531" loading="lazy" decoding="async" />
  <figcaption>图六｜一个二维离散相空间中的粗粒化玩具模型。可逆演化本身不改变精细熵，但每次重新粗粒化后，宏观可见的熵上升。</figcaption>
</figure>

设宏观观察的时间间隔为 $\tau$。它应当足够长，使得微观运动能在相空间中把分布拉伸、折叠出细丝结构；但又足够短，以至于宏观状态还来得及被连续追踪。记观察时刻为

$$
t_m=m\tau.
$$

在两次观察之间，系统按 Hamilton 力学演化。用 Liouville 演化算符 $\widehat U_\tau$ 表示这段精细演化，则

$$
\rho_{t_{m+1}}=\widehat U_\tau\rho_{t_m}.
$$

精细 Gibbs 熵在这种可逆演化下保持不变：

$$
S[\widehat U_\tau\rho]=S[\rho].
$$

宏观描述在每个观察时刻都只保留粗粒化后的分布。因此，从 $t_m$ 到 $t_{m+1}$ 的有效过程不是单纯的可逆演化，而是

$$
\rho^{\mathrm c}(t_m)
\xrightarrow{\widehat U_\tau}
\widehat U_\tau\rho^{\mathrm c}(t_m)
\xrightarrow{\widehat C}
\rho^{\mathrm c}(t_{m+1})
=\widehat C\widehat U_\tau\rho^{\mathrm c}(t_m).
$$

于是

$$
\begin{aligned}
S^{\mathrm c}(t_{m+1})
&=S\!\left[\widehat C\widehat U_\tau\rho^{\mathrm c}(t_m)\right]\\
&\ge S\!\left[\widehat U_\tau\rho^{\mathrm c}(t_m)\right]\\
&=S[\rho^{\mathrm c}(t_m)]\\
&=S^{\mathrm c}(t_m).
\end{aligned}
$$

也就是说，

$$
\frac{\mathrm dS^{\mathrm c}}{\mathrm dt}
\approx
\frac{S^{\mathrm c}(t_{m+1})-S^{\mathrm c}(t_m)}{\tau}
\ge 0.
$$

这就是热力学第二定律在这个信息论图像中的大框架。换句话说，对宏观观察者而言，可用信息不断转移到不可观察的微观相关性中；微观力学仍然可逆，但宏观描述会显示为熵增加。

> **注意。** 这不是完全严格的数学证明，而是物理推导框架。它依赖粗粒化、低熵初态、宏观观察限制以及忽略极端精细调控和 Poincaré 回归等条件。

## 参考文献

1. C. E. Shannon, “A Mathematical Theory of Communication,” *Bell System Technical Journal* 27 (1948), 379–423, 623–656.
2. J. W. Gibbs, *Elementary Principles in Statistical Mechanics*, Yale University Press, 1902.
3. R. Landauer, “Irreversibility and Heat Generation in the Computing Process,” *IBM Journal of Research and Development* 5 (1961), 183–191.
4. E. T. Jaynes, “Information Theory and Statistical Mechanics,” *Physical Review* 106 (1957), 620–630.
5. Yi-Zhuang You（尤亦庄）, *140B Statistical Physics, Part 1: Statistical Ensembles*, “Information Theory,” UC San Diego 课程讲义，[课程页面](https://everettyou.github.io/teaching/PHYS140B) · [讲义 PDF](https://everettyou.github.io/teaching/PHYS140B/StatisticalEnsembles.pdf)。
