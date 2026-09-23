---
title: Jones 多项式：从辫群到纽结不变量
description: 从纽结图和辫群出发，记录通过 Markov 变换、代数表示与迹构造 Jones 多项式的思路。
date: 2026-09-23
type: essay
category: 拓扑与几何
tags: [纽结, 辫群, Jones多项式]
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes: []
---

<figure class="lead-figure">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/lead.png" alt="晴空下，戴帽的旅人站在山林悬崖上，远处有山峰、木桥与瀑布" width="1672" height="941" loading="eager" decoding="async" />
</figure>

这是2026.9.19的研讨班讲稿，主要介绍的是Jones 1984的工作。

## 研究对象与出发点

我们讨论的是三维空间 $\mathbb R^3$ 或 $S^3$ 中的纽结（knots）与链环（links）。

### 历史与 Alexander 多项式

历史上对纽结的研究：
1923：Alexander 多项式（Alexander polynomial），记为 $\Delta(K)$。

这是一条拓扑学的路线（topological method）：通过纽结补空间 $S^3\setminus K$ 的同调（homology）来研究纽结，可以称为“内蕴的”方法。

但存在问题：纽结与镜像之间有如下关系：

$$
\Delta(K)=\Delta(\overline K).
$$

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/alexander_mirror.png" alt="纽结与镜像的示意图" width="712" height="456" loading="lazy" decoding="async" />
</figure>

所以我们不能靠Alexander 多项式分辨一个扭结和它的镜像。
### Jones 的路线

Jones 的路线（Jones's approach）则以“非内蕴”的构造作为出发点：从链环图出发，把它表示成辫子的闭包，再通过 von Neumann 代数的思路构造一个不变量。

<figure class="figure-light figure-diagram" style="width:min(100%, 201px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/jones_knot.png" alt="三叶结的链环图" width="201" height="171" loading="lazy" decoding="async" />
</figure>

$$
\text{links diagram}
\longrightarrow \text{a closure of a braid}
\longrightarrow \text{via von Neumann}
\longrightarrow \text{an invariant}.
$$

## 从纽结图到辫群

### Reidemeister 变换

Reidemeister 变换包含三类局部操作，分别记为 $R_1,R_2,R_3$。

<figure class="figure-light figure-diagram" style="width:min(100%, 598px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/reidemeister_1.png" alt="R1：直线与两种局部卷曲" width="598" height="342" loading="lazy" decoding="async" />
</figure>

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/reidemeister_23.png" alt="R2 与 R3：交叉的抵消与移动" width="712" height="465" loading="lazy" decoding="async" />
</figure>

将 $R_3$ 用交叉的生成元表示，便得到

$$
\sigma_1\sigma_2\sigma_1=\sigma_2\sigma_1\sigma_2.
$$

### 辫子的闭包

以三叶结为例，可以把它改画成一段辫子加上外侧的闭合线，辫子部分记为 $B$。

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/braid_closure.png" alt="三叶结改画为辫子闭包" width="981" height="371" loading="lazy" decoding="async" />
</figure>

辫子具有一个沿“时间顺序”叠接的乘法结构，从而引出辫群（braid group）。

在 $B_4$ 的例子中，$\sigma_1$ 交换第 1、2 股的上下穿越关系，$\sigma_2$ 对应第 2、3 股；一般有生成元 $\sigma_1,\ldots,\sigma_{n-1}$。相反交叉记为 $\sigma_i^{-1}$。

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/braid_generators.png" alt="辫群生成元、逆元与抵消" width="1116" height="792" loading="lazy" decoding="async" />
</figure>

一次交叉与它的逆交叉可以通过 $R_2$ 抵消，因此

$$
\sigma_i\sigma_i^{-1}=1.
$$

相距足够远的交叉可以交换顺序：

$$
\sigma_1\sigma_3=\sigma_3\sigma_1,
\qquad
\sigma_i\sigma_j=\sigma_j\sigma_i,\quad |i-j|>1.
$$

<figure class="figure-light figure-diagram" style="width:min(100%, 457px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/distant_crossings.png" alt="作用于不同股的两个交叉" width="457" height="304" loading="lazy" decoding="async" />
</figure>

相邻交叉满足

$$
\sigma_{i+1}\sigma_i\sigma_{i+1}
=\sigma_i\sigma_{i+1}\sigma_i.
$$

因此，辫群可以用生成元与关系表示为：

$$
B_n=\left\langle \sigma_1,\ldots,\sigma_{n-1}\ \middle|\
\begin{aligned}
\sigma_i\sigma_{i+1}\sigma_i&=\sigma_{i+1}\sigma_i\sigma_{i+1},\\
\sigma_i\sigma_j&=\sigma_j\sigma_i\quad (|i-j|>1)
\end{aligned}\right\rangle.
$$

### Alexander 定理

Alexander 定理指出：$S^3$ 中任意有向链环，都可以表示为某个 $b\in B_n$ 的闭包。这里用 $(b,n)$ 记录辫子及其股数。



<figure class="figure-light figure-diagram" style="width:min(100%, 497px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/hopf_source.png" alt="Hopf 链环" width="497" height="342" loading="lazy" decoding="async" />
</figure>

> [!question]
> 一个链环能对应哪些辫子？哪些辫子对应的其实是同一种链环？

这其实类似于一个群可以有哪些表示，哪些表示对应同一种群的问题，核心是特征标，也即构造不变量。
## Markov 变换：不同辫子何时给出同一个链环

不同的辫子可能具有相同的闭包。要构造链环不变量，就需要理解这些辫子之间的关系。

第一种操作是在闭包中移动两段辫子 $b_1,b_2$，交换它们的先后顺序。这与迹的轮换性相呼应：

$$
\operatorname{tr}(AB)=\operatorname{tr}(BA).
$$

第二种变换在增加一股的同时加入一个交叉，闭包后仍可变回原来的链环。

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/markov_moves.png" alt="两类 Markov 变换" width="1143" height="1064" loading="lazy" decoding="async" />
</figure>

Markov 定理用以下两类变换刻画闭包的等价关系：

$$
(b,n)\sim(gbg^{-1},n),
$$

$$
(b,n)\sim(b\sigma_n^{\pm1},n+1).
$$

我们希望得到一个在这两类变换下保持不变的多项式。

将这个目标写成映射，就是

$$
V_n:B\longrightarrow\mathbb Z[t,t^{-1}].
$$

这里先保留这一目标环的写法，它与后面允许 $\sqrt t$ 的 Laurent 多项式之间有一个需要澄清的区别。[^target-ring]

具体的构造分为两步：先把辫群表示为代数中的元素，再取迹。

$$
V_n:B_n\xrightarrow{\gamma}A_n\xrightarrow{\operatorname{tr}}\mathbb C.
$$

## 代数、表示与迹

### Von Neumann Algebra：代数关系

定义：考虑由 $1,e_1,\ldots,e_{n-1}$ 生成的有限维代数 $A_n$，其生成元满足

$$
e_i^2=e_i,
$$

$$
e_i e_{i\pm1}e_i=\tau e_i,\qquad t\in\mathbb C,\tau=\frac{t}{(1+t)^2}
$$

$$
e_i e_j=e_j e_i,\qquad |i-j|>1.
$$
其中t是一个自由度。


接下来一个自然的想法是能否直接把 $\sigma_i$ 对应到 $e_i$？这里有一个障碍：$\sigma_i$ 必须可逆，而 $e_i$ 一般不可逆。把 $e_i$ 想成对角元为 $0$、$1$ 的投影矩阵，就能看出它会丢掉补空间上的信息。

这一步尝试可以写为

$$
\begin{aligned}
B_n&\xrightarrow{\gamma}A_n,\\
\sigma_i&\longmapsto e_i.
\end{aligned}
$$

但左边的生成元可逆，右边的幂等元不可逆，因此这个直接对应不能作为所需的群表示。$e_i$ 与 $1-e_i$ 的对角形式如下：一个方向上前者取 $1$，后者就取 $0$；反之亦然。

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/projection_diagrams.png" alt="交叉到幂等元的尝试，以及幂等元和补元的对角矩阵示意" width="1035" height="398" loading="lazy" decoding="async" />
</figure>

为此，同时使用 $e_i$ 和它的补元 $1-e_i$，定义

$$
\gamma_n:B_n\longrightarrow A_n,
$$

其对参数 $t$ 的依赖也记作 $\gamma_t$：

$$
\gamma_t(\sigma_i)
=\sqrt t\bigl(te_i-(1-e_i)\bigr)=g_i,
$$

$$
\gamma_t(\sigma_i^{-1})
=\frac1{\sqrt t}\bigl(t^{-1}e_i-(1-e_i)\bigr)=g_i^{-1}.
$$

这两个公式体现了对应关系：$\sigma_i\mapsto\sigma_i^{-1}$，$t\mapsto t^{-1}$。

记

$$
P=e_i,\qquad Q=1-e_i.
$$

于是

$$
P^2=P,\quad Q^2=Q,\quad PQ=QP=0,\quad P+Q=1.
$$

直观地说，$P,Q$ 把空间分成两部分。若只用 $e_i$ 表示交叉，补空间上的信息会被消掉，一般无法求逆；而辫子的交叉 $\sigma_i$ 必须有逆元。

我们采用如下表示：

$$
g_i=\gamma_t(\sigma_i)
=\sqrt t\bigl(tP-Q\bigr)
=t^{3/2}P-t^{1/2}Q.
$$

它在两个部分上分别乘以 $t^{3/2}$ 和 $-t^{1/2}$，这两个因子在 $t\ne0$ 时都可逆。因此

$$
g_i^{-1}=t^{-3/2}P-t^{-1/2}Q
=\frac1{\sqrt t}\bigl(t^{-1}P-Q\bigr).
$$

直接相乘，交叉项因为 $PQ=QP=0$ 消失，剩下 $P+Q=1$。这就验证了逆元公式。

更有用的是，同样的办法可以直接计算任意整数次幂：

$$
\boxed{g_i^m=t^{3m/2}P+(-1)^m t^{m/2}Q.}
$$



### 它为什么还能满足三股辫子的关系

可逆性还不够，我们也需要

$$
g_i g_{i+1}g_i=g_{i+1}g_i g_{i+1}.
$$

相邻幂等元之间的关系在此发挥作用。令

$$
\tau=\frac{t}{(1+t)^2},\qquad a=t+1,
$$

则 $g_i=\sqrt t(ae_i-1)$，而 $e_i e_{i+1}e_i=\tau e_i$。设 $X=ae_i-1$、$Y=ae_{i+1}-1$，为看清乘法中的每一项，暂记 $p=e_i$、$q=e_{i+1}$，并设 $X=ap-1$、$Y=aq-1$。使用幂等性 $p^2=p$、$q^2=q$，还有相邻生成元的关系 $pqp=\tau p$、$qpq=\tau q$。相邻的 $p$ 与 $q$ 一般**不能**交换次序。
先展开第一个乘积，保留每项的因子顺序：

$$
\begin{aligned}
XYX
&=(ap-1)(aq-1)(ap-1)\\
&=(a^2pq-ap-aq+1)(ap-1)\\
&=a^3pqp-a^2pq-a^2p^2+ap-a^2qp+aq+ap-1\\
&=(a^3\tau-a^2+2a)p+aq-a^2(pq+qp)-1.
\end{aligned}
$$

由同样的展开式交换 $p$、$q$，再使用 $q^2=q$ 和 $qpq=\tau q$，得到

$$
YXY=(a^3\tau-a^2+2a)q+ap-a^2(qp+pq)-1.
$$

相减时，含 $pq+qp$ 的项和常数 $-1$ 都抵消。因此

$$
\begin{aligned}
XYX-YXY
&=(a^3\tau-a^2+a)(p-q)\\
&=a(a^2\tau-a+1)(e_i-e_{i+1}).
\end{aligned}
$$

括号中的系数恰好是

$$
(t+1)^2\frac{t}{(t+1)^2}-(t+1)+1=0.
$$

因此相邻生成元满足辫子关系。远处的关系则直接来自 $e_i e_j=e_j e_i$（$|i-j|>1$）。这些关系通常用 Temperley–Lieb 代数的幂等元形式表述。

### 迹的性质

在这个代数上引入迹映射

$$
\operatorname{tr}_n:A_n\longrightarrow\mathbb C,
$$

要求它满足

$$
\operatorname{tr}_n(1)=1,
\qquad
\operatorname{tr}_n(AB)=\operatorname{tr}_n(BA),
$$

把 $A_n$ 自然地嵌入 $A_{n+1}$ 时，迹还满足相容性

$$
\operatorname{tr}_{n+1}(\omega)=\operatorname{tr}_n(\omega),
\qquad \omega\in A_n.
$$

$$
\operatorname{tr}_{n+1}(\omega e_n)
=\tau\operatorname{tr}_n(\omega),
\qquad \omega\in A_n.
$$
### Jones 多项式

若 $L$ 是 $b\in B_n$ 的闭包，定义

$$
L=\widehat{(b,n)},
$$

记

$$
d=-\frac{t+1}{\sqrt t}
=-\left(\sqrt t+\frac1{\sqrt t}\right).
$$

Jones 多项式定义为

$$
V_{\widehat b}(t)=d^{n-1}\operatorname{tr}_n\bigl(\gamma_t(b)\bigr).
$$

这一表达式给出 $L$ 的不变量。验证它需要分别考察两类 Markov 变换。对于共轭，需要有

$$
V_{\widehat b}=V_{\widehat{g^{-1}bg}},
\qquad
V_{\widehat b}\propto\operatorname{tr}\bigl(\gamma_t(b)\bigr),
$$

对应地，共轭后的闭包给出

$$
V_{\widehat{g^{-1}bg}}\propto
\operatorname{tr}\bigl(\gamma_t(g^{-1}bg)\bigr).
$$

因此，共轭不变性的关键在于比较 $\operatorname{tr}(\gamma_t(g^{-1}bg))$ 与 $\operatorname{tr}(\gamma_t(b))$。

令 $g\in B_n$。因为 $\gamma_t$ 是群同态，$\gamma_t(g^{-1})=\gamma_t(g)^{-1}$；再利用迹的轮换性，便有

$$
\begin{aligned}
\operatorname{tr}_n\!\left(\gamma_t(g^{-1}bg)\right)
&=\operatorname{tr}_n\!\left(\gamma_t(g)^{-1}\gamma_t(b)\gamma_t(g)\right)\\
&=\operatorname{tr}_n\!\left(\gamma_t(b)\gamma_t(g)\gamma_t(g)^{-1}\right)\\
&=\operatorname{tr}_n\!\left(\gamma_t(b)\right).
\end{aligned}
$$

共轭前后的辫子仍有 $n$ 股，因而归一化因子 $d^{n-1}$ 也相同。于是

$$
V_{\widehat{g^{-1}bg}}(t)=V_{\widehat b}(t).
$$

第一类 Markov 变换的不变性只用到群同态和迹的轮换性；迹在相邻代数之间的关系则用于处理第二类变换。

对于稳定化，需要比较增加一股并附加交叉前后的结果：

$$
V_{\widehat b}=V_{\widehat{b\sigma}},
\qquad
\operatorname{tr}\bigl(\gamma_t(b\sigma_n)\bigr).
$$

此时股数发生变化，验证的关键是追踪迹与前面的归一化因子如何共同变化。

令 $x=\gamma_t(b)\in A_n$，并把它看作 $A_{n+1}$ 中的元素。记 $g_n=\gamma_t(\sigma_n)$，则

$$
g_n=\sqrt t\bigl((t+1)e_n-1\bigr),
\qquad
g_n^{-1}=\frac1{\sqrt t}\bigl((t^{-1}+1)e_n-1\bigr).
$$

对正交叉，先把 $g_n$ 代入乘积。这里 $x\in A_n$ 已经作为 $A_{n+1}$ 的元素，且 $\sqrt t$ 是标量，因此

$$
xg_n=x\sqrt t\bigl((t+1)e_n-1\bigr)
=\sqrt t\bigl((t+1)xe_n-x\bigr).
$$

再取迹并用线性性拆开两项。对第一项，迹与 $e_n$ 的关系给出 $\operatorname{tr}_{n+1}(xe_n)=\tau\operatorname{tr}_n(x)$；对第二项，跨层级相容性给出 $\operatorname{tr}_{n+1}(x)=\operatorname{tr}_n(x)$。所以

$$
\begin{aligned}
\operatorname{tr}_{n+1}(xg_n)
&=\sqrt t\left((t+1)\operatorname{tr}_{n+1}(xe_n)
-\operatorname{tr}_{n+1}(x)\right)\\
&=\sqrt t\left((t+1)\tau\operatorname{tr}_n(x)
-\operatorname{tr}_n(x)\right)\\
&=\sqrt t\bigl((t+1)\tau-1\bigr)\operatorname{tr}_n(x).
\end{aligned}
$$

最后代入 $\tau=t/(t+1)^2$，把括号中的系数通分：

$$
\begin{aligned}
(t+1)\tau-1
&=(t+1)\frac{t}{(t+1)^2}-1\\
&=\frac{t}{t+1}-\frac{t+1}{t+1}
=-\frac1{t+1}.
\end{aligned}
$$

另一方面，由 $d=-(t+1)/\sqrt t$ 可知 $d^{-1}=-\sqrt t/(t+1)$。于是正交叉使迹乘上 $d^{-1}$：

$$
\operatorname{tr}_{n+1}(xg_n)
=-\frac{\sqrt t}{t+1}\operatorname{tr}_n(x)
=d^{-1}\operatorname{tr}_n(x).
$$

负交叉同样不能略过：

$$
\begin{aligned}
\operatorname{tr}_{n+1}(xg_n^{-1})
&=\frac1{\sqrt t}
\bigl((t^{-1}+1)\tau-1\bigr)\operatorname{tr}_n(x)\\
&=-\frac{\sqrt t}{t+1}\operatorname{tr}_n(x)
=d^{-1}\operatorname{tr}_n(x).
\end{aligned}
$$

因此，两种稳定化都使迹乘以 $d^{-1}$。与此同时，股数由 $n$ 变成 $n+1$，Jones 多项式定义中的前因子由 $d^{n-1}$ 变成 $d^n$，多出的 $d$ 与迹中的 $d^{-1}$ 恰好抵消：

$$
\begin{aligned}
V_{\widehat{b\sigma_n^{\pm1}}}(t)
&=d^n\operatorname{tr}_{n+1}(xg_n^{\pm1})\\
&=d^n d^{-1}\operatorname{tr}_n(x)\\
&=V_{\widehat b}(t).
\end{aligned}
$$

这便证明了第二类 Markov 变换下的不变性。

## 性质与局部关系

Jones 多项式具有以下性质：

1. $V_L(t)$ 是 $\sqrt t$ 的 Laurent 多项式。
2. 镜像满足 $V_{\overline L}(t)=V_L(t^{-1})$。
3. 连通和满足 $V_{L_1\#L_2}=V_{L_1}V_{L_2}$。

第三条中的 $\#$ 表示连通和：在选定的分支上各取一小段，再将两者接起来。它与把两个链环分开放置的操作不同。

<figure class="figure-light figure-diagram" style="width:min(100%, 564px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/connected_sum.png" alt="L1 与 L2 通过连接带形成连通和" width="564" height="437" loading="lazy" decoding="async" />
</figure>

## 计算几个例子

### 平凡结与平凡链环

这里要区分“给定链环是什么”与“选择哪条辫子表示它”。平凡结 $\widehat{(1,1)}=O$，选用这个表示时 $n=1$，得到

$$
V_O(t)=d^0\operatorname{tr}_1(1)=1.
$$



再计算平凡链环的多项式。取 $b=1\in B_2$，因此 $n=2$；群同态将单位元映为单位元，即 $\gamma_t(1)=1\in A_2$；迹的归一化条件为 $\operatorname{tr}_2(1)=1$。逐项代入定义，

$$
\begin{aligned}
V_{U_2}(t)
&=d^{2-1}\operatorname{tr}_2\!\bigl(\gamma_t(1)\bigr)\\
&=d\operatorname{tr}_2(1)\\
&=d=-\frac{t+1}{\sqrt t}
=-\left(\sqrt t+\frac1{\sqrt t}\right).
\end{aligned}
$$


取 $\sigma_1\in B_2$ 时虽然 $n=2$，它的闭包仍是平凡结：$1\in B_1$ 经过一次 Markov 稳定化就得到 $\sigma_1\in B_2$。下面计算同一个结在两股表示下的多项式。

先用 $P=e_1$、$Q=1-e_1$ 展开交叉的代数像：

$$
\begin{aligned}
g_1=\gamma_t(\sigma_1)
&=\sqrt t\,(tP-Q)\\
&=\sqrt t\bigl(te_1-(1-e_1)\bigr)\\
&=\sqrt t\bigl((t+1)e_1-1\bigr).
\end{aligned}
$$

迹的归一化给出 $\operatorname{tr}_2(1)=1$。在 $\operatorname{tr}_{n+1}(xe_n)=\tau\operatorname{tr}_n(x)$ 中取 $n=1$、$x=1\in A_1$，又有

$$
\operatorname{tr}_2(e_1)
=\tau\operatorname{tr}_1(1)
=\tau=\frac{t}{(t+1)^2}.
$$

利用迹的线性性，逐项代入并通分：

$$
\begin{aligned}
\operatorname{tr}_2(g_1)
&=\sqrt t\left((t+1)\operatorname{tr}_2(e_1)
-\operatorname{tr}_2(1)\right)\\
&=\sqrt t\left((t+1)\frac{t}{(t+1)^2}-1\right)\\
&=\sqrt t\left(\frac{t}{t+1}-\frac{t+1}{t+1}\right)\\
&=-\frac{\sqrt t}{t+1}.
\end{aligned}
$$

而 $d=-(t+1)/\sqrt t$，所以刚算出的迹正是 $d^{-1}$。最后因为选用的是 $B_2$ 中的辫子，定义中的指数是 $n-1=1$：

$$
\begin{aligned}
V_{\widehat{(\sigma_1,2)}}(t)
&=d^{2-1}\operatorname{tr}_2\bigl(\gamma_t(\sigma_1)\bigr)\\
&=\left(-\frac{t+1}{\sqrt t}\right)
\left(-\frac{\sqrt t}{t+1}\right)\\
&=1.
\end{aligned}
$$

这与一股表示给出的 $V_O(t)=1$ 相同，具体展示了稳定化时前因子 $d$ 与迹中的 $d^{-1}$ 怎样抵消。

### Hopf 链环：两次交叉

两股辫子给出 $H=\widehat{\sigma_1^2}$，$n=2$，所以计算从

$$
V_H(t)=-\frac{t+1}{\sqrt t}\operatorname{tr}_2(g_1^2)
$$

开始。

取 $H=\widehat{\sigma_1^2}$，并简记 $e=e_1$。因为 $e(1-e)=0$，

$$
g_1^2=t\bigl(t^2e+(1-e)\bigr)
=t\bigl(1+(t^2-1)e\bigr).
$$

于是

$$
\begin{aligned}
V_H(t)
&=-\frac{t+1}{\sqrt t}\,
t\left(1+(t^2-1)\operatorname{tr}_2(e)\right)\\
&=-(t+1)\sqrt t\left(1+(t^2-1)\frac{t}{(t+1)^2}\right)\\
&=-\sqrt t\left((t+1)+t(t-1)\right)\\
&=\boxed{-\sqrt t(1+t^2)}.
\end{aligned}
$$

这里的 $t/(t+1)^2$ 来自 Markov 迹；最后的化简使用了 $t^2-1=(t-1)(t+1)$。

### 三叶结：三次交叉

同样地，$n=2$ 时有

$$
V_T(t)=-\frac{t+1}{\sqrt t}\operatorname{tr}_2(g_1^3).
$$

取 $T=\widehat{\sigma_1^3}$。奇数次幂使补空间那一项保留负号：

$$
g_1^3=t^{3/2}\bigl(t^3e-(1-e)\bigr)
=t^{3/2}\bigl((t^3+1)e-1\bigr).
$$

所以

$$
\begin{aligned}
V_T(t)
&=-\frac{t+1}{\sqrt t}\,t^{3/2}
\left((t^3+1)\frac{t}{(t+1)^2}-1\right)\\
&=-t(t+1)\left(\frac{t(t^3+1)}{(t+1)^2}-1\right)\\
&=-t\left(t(t^2-t+1)-(t+1)\right)\\
&=-t(t^3-t^2-1)\\
&=\boxed{t+t^3-t^4}.
\end{aligned}
$$

第三行用的是 $t^3+1=(t+1)(t^2-t+1)$。计算的关键是先利用互补幂等元求出 $g_1^3$，再用迹将代数元素化为标量。

## 一个代数恒等式如何变成 skein 关系

我们希望通过局部操作，将 $L$ 联系到若干 $L_1',L_2',\ldots$，使得

$$
V_L=F\bigl(V(L_1'),\ldots,V(L_m')\bigr).
$$

先算同一个局部交叉的两个代数元素：

$$
\begin{aligned}
t^{-1}g_i-tg_i^{-1}
&=\left(\sqrt t\,P-t^{-1/2}Q\right)
-\left(t^{-1/2}P-\sqrt t\,Q\right)\\
&=(\sqrt t-t^{-1/2})(P+Q)\\
&=(\sqrt t-t^{-1/2})1.
\end{aligned}
$$

这里有一个很值得注意的区分：$e_i$ 是上述代数分解中的幂等元；这条恒等式右边最终出现的却是单位元 $1$。在两条平行同向辫股的局部图中，$1$ 对应不交叉的两根直线，也就是此处的有向平滑。

定义三个链环图：局部区域以外完全相同，区域内分别是正交叉 $L_+$、负交叉 $L_-$、以及保持定向连续的平滑 $L_0$。本文固定 $\sigma_i\leftrightarrow L_+$、$\sigma_i^{-1}\leftrightarrow L_-$。

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/skein_local.png" alt="正交叉、负交叉与有向平滑" width="793" height="342" loading="lazy" decoding="async" />
</figure>

在辫子形式下，把共同的其余部分记为 $b$，则这三个局部替换分别对应 $b\sigma_i,b\sigma_i^{-1},b$。对上面的恒等式乘以 $\gamma_t(b)$、取迹，再乘同一个 $d^{n-1}$，得到

$$
\boxed{
\frac1t V_{L_+}(t)-tV_{L_-}(t)
=\left(\sqrt t-\frac1{\sqrt t}\right)V_{L_0}(t).
}
$$

这就是本约定下的 Jones skein 关系。它对一般有向链环图同样成立；上面的计算展示了其局部代数来源。

“换交叉”只改变谁从上面经过，连接方式不变；“平滑”则把局部连接重新接成没有交叉且定向连续的样子，可能改变闭合分支数。因此，$L_0$ 不是“什么也没有”，也不是把整个链环删掉。

把三叶结写作 $\sigma_1\sigma_1\sigma_1$。选择其中一个正交叉：

- 保持正交叉，仍是 $T=\widehat{\sigma_1^3}$。
- 改成负交叉，例如得到 $\sigma_1\sigma_1^{-1}\sigma_1=\sigma_1$，闭包是平凡结 $O$。
- 把它平滑，相当于在这两股同向辫子的该处用单位元替换，剩下 $\sigma_1^2$，闭包是 Hopf 链环 $H$。

因此，此处 $L_+=T,L_-=O,L_0=H$于是

<figure class="figure-light figure-diagram" style="width:min(100%, 688px)">
  <img src="/phase-space-notes/figures/jones-polynomial-braids-and-link-invariants/skein_trefoil.png" alt="三叶结及换交叉、平滑后得到的两个闭包" width="1250" height="874" loading="lazy" decoding="async" />
</figure>

$$
t^{-1}V_T-tV_O=(\sqrt t-t^{-1/2})V_H.
$$

代入 $V_O=1$ 和刚算出的 $V_H=-\sqrt t(1+t^2)$：

$$
\begin{aligned}
V_T
&=t^2+t(\sqrt t-t^{-1/2})\bigl[-\sqrt t(1+t^2)\bigr]\\
&=t^2-t(t-1)(1+t^2)\\
&=t+t^3-t^4.
\end{aligned}
$$

这个结果和直接计算 $\operatorname{tr}(g_1^3)$ 完全一致。两条路线因而形成了交叉检查。
