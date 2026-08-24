---
title: Griffiths《量子力学概论》速通笔记1：从 Born 诠释到不确定性原理
description: 从波函数的概率诠释与概率流出发，引出动量算符、Ehrenfest 定理和位置—动量不确定性。
date: 2026-08-24
type: note
category: 量子力学
tags:
  - Schrödinger 方程
  - Born 诠释
  - Ehrenfest 定理
  - 不确定性原理
  - 量子力学概论速通笔记
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes:
  - marker: "*"
    title: 概率流的定义
    body: >-
      这里的 $\tilde j=\Psi^*\partial_x\Psi-(\partial_x\Psi^*)\Psi$ 只是概率流表达式的括号部分；通常定义 $j=-\frac{i}{2m}\tilde j$，于是连续性方程写成 $\partial_t\rho+\partial_xj=0$。
---

<figure class="lead-figure">
  <img src="../../figures/griffiths-quantum-mechanics-born-to-uncertainty/lead.png?v=1" alt="白色背景中，一位金发、穿白金色服装的动漫人物双手在胸前比出三角形手势" width="1535" height="1024" loading="eager" decoding="async" />
</figure>

角动量、对称性、自旋等问题在[《近代物理导论》笔记](https://hhhssccc.github.io/phase-space-notes/tags/%E8%BF%91%E4%BB%A3%E7%89%A9%E7%90%86%E5%AF%BC%E8%AE%BA%E7%AC%94%E8%AE%B0%E7%B3%BB%E5%88%97/)里有更详细的讨论，这里略过。

## 第一章：波函数

### 一、Schrödinger 方程

Griffiths 先引入 Schrödinger equation，取 $\hbar=1$：

$$
i\frac{\partial\Psi}{\partial t}
=-\frac{1}{2m}\frac{\partial^2\Psi}{\partial x^2}+V\Psi
=\left[-\frac{1}{2m}\frac{\partial^2}{\partial x^2}+V\right]\Psi.
$$

这是量子力学的演化方程。

Schrödinger equation 的有趣之处在于，它的线性性质不来自于近似。方程的解 $\Psi(x,t)$ 是波函数/概率幅。对其详细讨论可以参见《费曼物理学讲义》第三卷。

### 二、Born 诠释

Born 诠释：

$$
\int_a^b |\Psi(x,t)|^2\,dx
=P(t=t,\text{ 粒子在 }a,b\text{ 之间}).
$$

这里对于诠释问题按下不表。

> [!question]
> 但量子不确定性的来源究竟是什么？

Copenhagen interpretation 认为测量使波函数坍缩：

$$
\Psi(x)\longrightarrow\Psi_{c_i}(x).
$$

测量究竟是什么？我个人的看法是：过程进行的信息被记录，无论记录是否能为人所读取。

对 Born 诠释的argue：

1. $\Psi$要归一化；
2. $\Psi$要勒贝格可积；
3. $\Psi(x,t)$ 的概率流守恒。

由

$$
\frac{\partial|\Psi|^2}{\partial t}
=\Psi^*\frac{\partial\Psi}{\partial t}
+\Psi\frac{\partial\Psi^*}{\partial t},
$$

代入 Schrödinger equation，得到

$$
\frac{\partial|\Psi|^2}{\partial t}
=\frac{i}{2m}\frac{\partial}{\partial x}\tilde j(x,t),
$$

其中

$$
\tilde j
=\Psi^*\frac{\partial\Psi}{\partial x}
-\frac{\partial\Psi^*}{\partial x}\Psi.
$$

幺正演化满足

$$
\langle\Psi(t)|\Psi(t)\rangle
=\langle\Psi(0)|\Psi(0)\rangle.
$$

### 三、力学量与算符

Griffiths 这里采用 ensemble interpretation，从系统平均的角度引入，而不是作为一条公理。

$$
\langle x\rangle
=\int_{-\infty}^{\infty}x|\Psi|^2\,dx,
$$

$$
\langle v\rangle=\frac{d\langle x\rangle}{dt}.
$$

于是


$$
\begin{aligned}
m\langle v\rangle
=\langle p\rangle
&=m\frac{d}{dt}\int_{-\infty}^{\infty}x|\Psi|^2\,dx\\
&=m\int_{-\infty}^{\infty}x\frac{\partial}{\partial x}\tilde j(x,t)\,dx\cdot\frac{i}{2m}\\
&=-m\int_{-\infty}^{\infty}\tilde j\,dx\cdot\frac{i}{2m}\\
&=-\frac{i}{2}\int_{-\infty}^{\infty}
\left(\Psi^*\partial_x\Psi-\partial_x\Psi^*\,\Psi\right)dx\\
&=-i\int_{-\infty}^{\infty}\Psi^*\partial_x\Psi\,dx\\
&=\int_{-\infty}^{\infty}\Psi^*\frac{\partial_x}{i}\Psi\,dx.
\end{aligned}
$$

因此

$$
p\longrightarrow\hat p=\frac{1}{i}\partial_x.
$$

物理量 $\longleftrightarrow$ 算符。

### 四、Ehrenfest 定理

$$
\frac{d\langle p\rangle}{dt}
=-\left\langle\frac{\partial V}{\partial x}\right\rangle.
$$

要注意

$$
-\langle V'(x)\rangle\ne -V'(\langle x\rangle),
$$

所以平均位置并不按经典轨道演化，只是一种量子—经典对应。

### 五、不确定性原理

这里定性讨论。平面波

$$
e^{ikx}
$$

动量确定，位置不定；概率无法归一，因而是非物理的。（但可作为广义本征态进行 $\delta$ 归一化）

一个实际的情形是一个波包。我们可以粗略地说，一个波包有不确定的波长。波包可以作 Fourier 展开：

$$
\Psi(x)=\int A(k)e^{ikx}\,dk,
$$

即叠加不同波长。

动量展宽 $\delta p\uparrow$，位置展宽 $\delta x\downarrow$。

直觉上，$\delta x\cdot\delta p$ 存在下限：

$$
\delta x\cdot\delta p\ge\frac{\hbar}{2}:=\frac12
\qquad(\hbar=1).
$$
