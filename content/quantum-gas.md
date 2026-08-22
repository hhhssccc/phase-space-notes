---
title: 量子气体
description: 从全同粒子的占据数表述出发，整理 Bose–Einstein/Fermi–Dirac 分布与 D 维态密度。
date: 2026-08-23
type: note
category: 统计物理
tags: [全同粒子, Bose–Einstein 分布, Fermi–Dirac 分布, 态密度]
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes: []
---

<figure class="lead-figure">
  <img src="../../figures/quantum-gas/lead.png?v=1" alt="暗色星空中，穿白色实验服的双叶理央以失重姿态漂浮" width="1536" height="1024" loading="eager" decoding="async" />
</figure>

## 前置知识

2 粒子态 $\longrightarrow$ 张量积

$$
|\alpha\rangle_1\otimes|\beta\rangle_2.
$$

粒子 $1,2$ 不可分辨。

交换全同粒子：

$$
\psi(1,2)=+\psi(2,1)\qquad\text{玻色子},
$$

$$
\psi(1,2)=-\psi(2,1)\qquad\text{费米子}.
$$

能量 $\varepsilon_\alpha$，$\hat n_\alpha=n_\alpha$。

$$
\text{单粒子态 }|\alpha\rangle
\longrightarrow\text{占据数}
\longrightarrow\text{多体微观态}
\longrightarrow\text{巨配分函数}
\longrightarrow\text{BE/FD 分布}
\longrightarrow\text{态密度积分}
\longrightarrow\text{宏观热力学}.
$$

## A. 费米子与玻色子？

$\longrightarrow$ 全同粒子。

对于可分辨粒子，2 粒子态表示为

$$
|\alpha\rangle_1\otimes|\beta\rangle_2.
$$

但全同粒子，$|\alpha\rangle_1\otimes|\beta\rangle_2$ 和 $|\beta\rangle_1\otimes|\alpha\rangle_2$ 不同。

这里的 $1,2$ 是形式的槽编号，张量积表示引入了 2 个槽，但全同粒子的槽编号无物理意义。

交换算符：

$$
P_{12}|\alpha\rangle_1|\beta\rangle_2
=|\beta\rangle_1|\alpha\rangle_2.
$$

2 次复原：

$$
P_{12}^2=1.
$$

全同粒子槽编号无物理意义：

$$
P_{12}|\psi\rangle=e^{i\theta}|\psi\rangle
\quad\Rightarrow\quad
e^{i\theta}=\pm1.
$$

对全同粒子，我们要把张量积限制到对称/反对称子空间。

$$
|\alpha,\beta\rangle_B
=\frac{1}{\sqrt2}
\left(|\alpha\rangle_1|\beta\rangle_2+|\beta\rangle_1|\alpha\rangle_2\right),
$$

$$
|\alpha,\beta\rangle_F
=\frac{1}{\sqrt2}
\left(|\alpha\rangle_1|\beta\rangle_2-|\beta\rangle_1|\alpha\rangle_2\right).
$$

- 玻色子：相互作用媒介。
- 费米子：组成物质。

当 $\alpha=\beta$：

$$
\frac{1}{\sqrt2}
\left(|\alpha\rangle|\alpha\rangle+|\alpha\rangle|\alpha\rangle\right)
=\sqrt2|2\alpha\rangle_B,
$$

干涉相长。

$$
|\alpha\rangle|\alpha\rangle-|\alpha\rangle|\alpha\rangle=0.
$$

$\longrightarrow$ “泡利不相容”。

$\longrightarrow$ 多个玻色子可以占据同一单粒子态，费米子不行。

$\longrightarrow$ 占据数

$$
n_\alpha=
\begin{cases}
0,1,2,\cdots, & \text{玻色},\\
0,1, & \text{费米}.
\end{cases}
$$

普通三维复合粒子：

$$
\begin{cases}
B+B=B,\\
B+F=F,\\
F+F=B.
\end{cases}
$$

## B. 统计分布

我们要研究理想气体。

这个研究对象的好处是可以说明其概率分布可以因子化：

$$
E(\vec n)=\sum_\alpha\varepsilon_\alpha n_\alpha,
$$

没有耦合项。

$$
p(\vec n)=\prod_\alpha p(n_\alpha),
\qquad
\Xi=\prod_\alpha\Xi_\alpha.
$$

接下来就是要写出配分函数：

$$
\Xi_\alpha
=\sum_{n_\alpha}e^{-\beta n_\alpha(\varepsilon_\alpha-\mu)}.
$$

玻色子：

$$
\sum_{n_\alpha=0}^{\infty},
\qquad
\Xi_\alpha=\frac{1}{1-e^{-\beta(\varepsilon_\alpha-\mu)}}.
$$
> [!question]
> 巨正则系综求和无上界？

费米子：

$$
\sum_{n_\alpha=0,1},
\qquad
\Xi_\alpha=1+e^{-\beta(\varepsilon_\alpha-\mu)}.
$$

### Bose–Einstein 分布

$$
\begin{aligned}
p(n_\alpha)
&=\frac{1}{\Xi_\alpha}e^{-\beta n_\alpha(\varepsilon_\alpha-\mu)}\\
&=\left[1-e^{-\beta(\varepsilon_\alpha-\mu)}\right]
e^{-\beta n_\alpha(\varepsilon_\alpha-\mu)}.
\end{aligned}
$$

$$
\begin{aligned}
\langle n_\alpha\rangle
&=\sum_{n_\alpha=0}^{\infty}
e^{-\beta n_\alpha(\varepsilon_\alpha-\mu)}n_\alpha
\left[1-e^{-\beta(\varepsilon_\alpha-\mu)}\right]\\
&=\frac{1}{e^{\beta(\varepsilon_\alpha-\mu)}-1}.
\end{aligned}
$$

要保证

$$
\varepsilon_\alpha>\mu.
$$

### Fermi–Dirac 分布

$$
p(n_\alpha)
=\frac{1}{1+e^{-\beta(\varepsilon_\alpha-\mu)}}
e^{-\beta n_\alpha(\varepsilon_\alpha-\mu)}
=
\begin{cases}
\dfrac{1}{1+e^{-\beta(\varepsilon_\alpha-\mu)}}, & n_\alpha=0,\\[6pt]
\dfrac{1}{1+e^{\beta(\varepsilon_\alpha-\mu)}}, & n_\alpha=1.
\end{cases}
$$

$$
\langle n_\alpha\rangle
=\frac{1}{e^{\beta(\varepsilon_\alpha-\mu)}+1}.
$$

$$
\Rightarrow
\langle n_\alpha\rangle
=\frac{1}{e^{\beta(\varepsilon_\alpha-\mu)}-\eta},
\qquad
\begin{cases}
\eta=+1, & \text{玻色子},\\
\eta=-1, & \text{费米子}.
\end{cases}
$$

它们的经典极限是 Maxwell–Boltzmann 分布。

稀薄：

$$
\frac{N}{V}\longrightarrow0,
\qquad
\langle n_\alpha\rangle\longrightarrow0,
\qquad
e^{\beta(\varepsilon_\alpha-\mu)}\longrightarrow\infty.
$$

$\eta$ 不重要。

$$
\langle n_\alpha\rangle\sim e^{-\beta(\varepsilon_\alpha-\mu)}.
$$

我们接下来要考虑：怎么算做计算，$\alpha$ 是什么？

$$
H|\vec k,\sigma\rangle
=\varepsilon_{\vec k,\sigma}|\vec k,\sigma\rangle.
$$

$\sigma$ 是内部自由度，打包复合指标

$$
\alpha=(\vec k,\sigma).
$$

## 动量空间与态密度

考虑 $D$ 维盒子，我们让波矢离散化，取周期性边界：

$$
e^{ikL}=1,
\qquad
k=\frac{2\pi m}{L}.
$$

> [!question]
> 这里认为 $L\to\infty$，边界对体相性质不重要，但我对离散化与周期边界还存在疑问。

动量空间一个 $\vec k$ 占据

$$
\left(\frac{2\pi}{L}\right)^D.
$$

一个态对应

$$
\left(\frac{2\pi}{L}\right)^D
=\frac{(2\pi)^D}{V}.
$$

反过来，对应 $d^Dk$ 微元：

$$
g_s\frac{V}{(2\pi)^D}\,d^Dk,
$$

$g_s$ 为可能的内部状态。

没有内部对称性破缺时，$\varepsilon_\alpha=\varepsilon_{\vec k,\sigma}$ 不依赖指标 $\sigma$。

$$
\sum_\alpha
=\sum_\sigma\sum_{\vec k}
\longrightarrow
g_s\frac{V}{(2\pi)^D}\int d^Dk.
$$

连续化

引入态密度：

$$
\sum_\alpha f(\varepsilon_\alpha)
=V\int d\varepsilon\,g(\varepsilon)f(\varepsilon).
$$

$$
Vg(\varepsilon)d\varepsilon
=\varepsilon\text{ 到 }\varepsilon+d\varepsilon\text{ 单粒子态数}.
$$

例如

$$
E
=V\int
\frac{\varepsilon}{e^{\beta(\varepsilon-\mu)}-\eta}
g(\varepsilon)d\varepsilon.
$$

接下来我们来讨论，能量小于某个 $\varepsilon_k$ 值有多少单粒子态个数。这对应动量空间的一个球：

$$
|\vec k'|<k.
$$

计算球体积：

$$
\Omega_D(k)=\int_0^k A_D k'^{D-1}dk',
$$

$A_D$ 为单位半径 $(D-1)$ 维球面面积。

例如

$$
\Omega_3(k)=\int_0^k4\pi k'^2dk'=\frac{4}{3}\pi k^3.
$$

球内允许的单粒子态数：

$$
N_k
=g_s\frac{\Omega_D(k)}{(2\pi/L)^D}
=g_s\frac{A_Dk^D}{D}\frac{V}{(2\pi)^D}.
$$

用态密度：

$$
N_k=V\int_0^{\varepsilon_k}g(\varepsilon)d\varepsilon,
$$

$$
\begin{aligned}
g(\varepsilon)
&=\frac{1}{V}\frac{dN_k}{d\varepsilon_k}\\
&=\frac{1}{V}\frac{dN_k}{dk}\frac{dk}{d\varepsilon_k}\\
&=g_s\frac{A_Dk^{D-1}}{(2\pi)^D}\frac{dk}{d\varepsilon_k}.
\end{aligned}
$$

$$
g_s\frac{V}{(2\pi)^D}A_Dk^{D-1}dk
=g_s\frac{A_Dk^{D-1}dk}{(2\pi/L)^D}
=Vg(\varepsilon)d\varepsilon.
$$

左边是 $[k,k+dk]$ 壳层状态数，右边是 $[\varepsilon,\varepsilon+d\varepsilon]$ 状态数。

接下来就要考虑 $dk/d\varepsilon_k$（色散关系）。

### 1. 非相对论

$$
\varepsilon=\frac{k^2}{2m},
\qquad
k=\sqrt{2m\varepsilon},
\qquad
\frac{dk}{d\varepsilon}=\frac{m}{k}.
$$

$$
g(\varepsilon)
=g_s\frac{A_D}{2(2\pi)^D}(2m)^{D/2}\varepsilon^{D/2-1},
$$

$$
g(\varepsilon)\propto\varepsilon^{D/2-1}.
$$

argue：二次色散，$d\varepsilon\propto k\,dk$；$D$ 维球壳，$\propto k^{D-1}dk$。

$$
g(\varepsilon)
\propto\frac{k^{D-1}dk}{k\,dk}
=k^{D-2}
\propto\varepsilon^{D/2-1}.
$$

### 2. 相对论、线性色散

$$
\varepsilon=ck,
\qquad
\frac{dk}{d\varepsilon}=c^{-1},
\qquad
d\varepsilon\propto dk.
$$

$$
g(\varepsilon)
=g_s\frac{A_D}{(2\pi)^D}c^{-D}\varepsilon^{D-1}.
$$

$\Rightarrow$ 统一的幂律形式：

$$
g(\varepsilon)
=\frac{\delta\,\varepsilon^{\delta-1}}{\varepsilon_0^\delta},
$$

$$
\delta:=\frac{D}{\xi},
\qquad
\xi:=\text{动力学指数},
\qquad
\varepsilon_k\sim k^\xi.
$$

$\delta$ 是重要表征。

半径 $k$ 内：

$$
N(k)\propto k^D,
\qquad
\varepsilon\propto k^\xi
\longrightarrow
k\propto\varepsilon^{1/\xi},
$$

$$
\Rightarrow
N(k)\sim\varepsilon^{D/\xi}=\varepsilon^\delta.
$$

对能量求导：

$$
g(\varepsilon)\propto\varepsilon^{\delta-1},
$$

就有前面幂律形式为态密度：

$$
g(\varepsilon)d\varepsilon
=d\left(\frac{\varepsilon}{\varepsilon_0}\right)^\delta.
$$

## 热力学

未完待续

## Appendix

### 巨正则分布的因子化

$$
\begin{aligned}
p(\vec n)
&=\frac{1}{\Xi}
\exp\left[-\beta\left(\sum_\alpha\varepsilon_\alpha n_\alpha
-\mu\sum_\alpha n_\alpha\right)\right]\\
&=\frac{1}{\Xi}
\exp\left[-\beta\sum_\alpha
(\varepsilon_\alpha n_\alpha-\mu n_\alpha)\right]\\
&=\frac{1}{\Xi}\prod_\alpha
\exp\left[-\beta n_\alpha(\varepsilon_\alpha-\mu)\right].
\end{aligned}
$$

$$
\begin{aligned}
\Xi
&=\sum_{\vec n}e^{-\sum_\alpha n_\alpha\beta(\varepsilon_\alpha-\mu)}\\
&=\sum_{n_1}\sum_{n_2}\sum_{n_3}\cdots
\prod_\alpha e^{-n_\alpha\beta(\varepsilon_\alpha-\mu)}.
\end{aligned}
$$

假如只有 $n_1,n_2$，$n_1$ 和 $n_2$ 是分离的：

$$
\begin{aligned}
&\sum_{n_1}\sum_{n_2}
e^{-n_1\beta(\varepsilon_1-\mu)}
e^{-n_2\beta(\varepsilon_2-\mu)}\\
&=\left(\sum_{n_1}e^{-n_1\beta(\varepsilon_1-\mu)}\right)
\left(\sum_{n_2}e^{-n_2\beta(\varepsilon_2-\mu)}\right).
\end{aligned}
$$

$$
\Xi
=\prod_\alpha
\left[\sum_{n_\alpha}e^{-n_\alpha\beta(\varepsilon_\alpha-\mu)}\right]
=\prod_\alpha\Xi_\alpha.
$$

$$
\Rightarrow
p(\vec n)=\prod_\alpha p(n_\alpha).
$$

### 怎么算 B–E 分布的平均？

$$
\langle n_\alpha\rangle
=\sum_{n_\alpha=0}^{\infty}
e^{-\beta n_\alpha(\varepsilon_\alpha-\mu)}n_\alpha
\left[1-e^{-\beta(\varepsilon_\alpha-\mu)}\right].
$$

令

$$
q=e^{-\beta(\varepsilon_\alpha-\mu)},
\qquad
0<q<1.
$$

$$
\langle n_\alpha\rangle
=\sum_{n_\alpha=0}^{\infty}q^{n_\alpha}n_\alpha(1-q).
$$

$$
\sum_{n=0}^{\infty}q^n=\frac{1}{1-q},
$$

$$
\sum_{n=1}^{\infty}nq^{n-1}=\frac{1}{(1-q)^2},
$$

$$
\Rightarrow
\sum_{n=1}^{\infty}nq^n
=\sum_{n=0}^{\infty}nq^n
=\frac{q}{(1-q)^2}.
$$

$$
\langle n_\alpha\rangle
=\frac{q}{1-q}
=\frac{1}{1/q-1}
=\frac{1}{e^{\beta(\varepsilon_\alpha-\mu)}-1}.
$$

### 2D下离散化的例子

$$
k_x,k_y,
\qquad
\vec k=\frac{2\pi}{L}(m_x,m_y).
$$

一个格点

$$
\left(\frac{2\pi}{L}\right)^D
$$

对应一个态。

则动量空间微元 $d^Dk$ 包含空间模式：

$$
\frac{d^Dk}{(2\pi/L)^D}
=\frac{V}{(2\pi)^D}d^Dk.
$$

乘上 $g_s$ 个内部状态。
