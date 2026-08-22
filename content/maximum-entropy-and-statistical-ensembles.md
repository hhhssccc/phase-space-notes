---
title: 统计系综:信息论视角
description: 从最大熵与Gibbs分布出发 ，导出三种系综
date: 2026-08-21
updated: 2026-08-22
type: note
category: 统计物理
tags: [最大熵原理, Gibbs 分布, 微正则系综, 正则系综, 巨正则系综]
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes:
  - marker: "*"
    title: 一点命名学
    body: 正则：有“独特的重要性”，是“典范的”指数分布—— by Gibbs；微正则：正则里切一个微小的能量切片，$E\le E(x)<E+\delta E$；巨正则：$N$ 可变，状态空间“巨大”。
---

<figure class="lead-figure">
  <img src="../../figures/maximum-entropy-and-statistical-ensembles/lead.png?v=2" alt="冬日蓝调时分，长门有希独自站在空旷的街道上" width="1536" height="1024" loading="eager" decoding="async" />
</figure>

不知道多体系所有细节，怎么利用已有信息，给出好的 $p(x)$ $\Rightarrow$ 热力学？

$$
\text{微观状态}
\longrightarrow p(x)
\longrightarrow S
\longrightarrow \text{最大熵}
\longrightarrow \text{Gibbs 分布}
\longrightarrow \text{三种系综}
\longrightarrow \text{配分函数与热力学}.
$$

微观态：

$$
\begin{cases}
\text{可观测},\\
\text{不可观测细节}\longrightarrow\text{“少偏见的概率分布”}.
\end{cases}
$$

怎样实现“少偏见”？

关键概念：

$$
S(X)=\sum_x p(x)I(x)=-\sum_x p(x)\log p(x).
$$

观察 $X$ 之前平均缺少多少信息。

Argue：

- $S$ 依赖于我们的测量能力、粗粒化方式，etc.
- 信息可以用来提取功，eg. 红绿球思想实验。

那么在有宏观测量约束下（eg.$\langle E(X)\rangle=E_0.$），只需要 $S(X)$ 尽可能大，就是“少偏见”的，

$\Rightarrow$ 对 $S$ 作拉格朗日乘子法，可以得到 $p(x)$。

约束 0：概率归一。

只有约束 0：等概率

$$
p(x)=\frac{1}{\Omega},\qquad S_{\max}=\ln\Omega.
$$

但有一个问题，信息论并不能告诉你 $\Omega$ 是多少。$\Omega$ 与 $E/V/N$ 有关？$\Rightarrow$ 需要由外部物理条件给出

约束 0：概率归一 + 约束 1：已知期望 $\langle f_a(x)\rangle$，我们可以推出Gibbs 分布

$$
p(x)=\frac{1}{Z}\exp\left(-\sum_a\lambda_a f_a(x)\right),
$$

$$
Z=\sum_x\exp\left[-\sum_a\lambda_a f_a(x)\right],
$$

为配分函数。

一般的计算流程：微观状态 $\longrightarrow$ 能量 $\longrightarrow$ 配分函数 $\longrightarrow$ 对 $\ln Z$ 求导 $\longrightarrow$ 宏观量。


argue一下配分函数：

$\longrightarrow$ 归一化常数。

$\longrightarrow Z=$ 所有微观态的加权总和。

$\longrightarrow \ln Z=$ 包含平均值、涨落、关联和自由能的生成函数。

下面看具体情形：

## A. 微正则系综

孤立的体系。

固定

$$
E(x)=E,\qquad N(x)=N.
$$

没有别的约束，状态空间就是所有 $(E,N)$ 的微观态，$\longrightarrow \Omega(E,N)$ 个。

每个态等可能：

$$
p(x)=\frac{1}{\Omega(E,N)}.
$$

$$
S=\ln\Omega(E,N).
$$

定义（convention）

$$
\left.\frac{\partial S}{\partial E}\right|_N=\frac{1}{T},
\qquad
\left.\frac{\partial S}{\partial N}\right|_E=-\frac{\mu}{T}.
$$

$$
dS=\frac{1}{T}\,dE-\frac{\mu}{T}\,dN,
$$

$$
dE=T\,dS+\mu\,dN \qquad \text{“热一”}.
$$

> [!question] 究竟怎样定义平衡态，才是 well-defined？

我们选取平衡的必要条件：概率分布不随时间演化

$$
P_{\mathrm{eq}}(\Phi_t x)=P_{\mathrm{eq}}(x).
$$

2 个系统：

$$
\frac{1}{\Omega_t(E_1,N_1)}\cdot\frac{1}{\Omega_t(E_2,N_2)}
=
\frac{1}{\Omega_0(E_1,N_1)}\cdot\frac{1}{\Omega_0(E_2,N_2)}.
$$

$$
\Rightarrow dS_1+dS_2=0,
$$

$$
\begin{cases}
dN_1+dN_2=0,\\
dE_1+dE_2=0,
\end{cases}
\qquad\Rightarrow\qquad
\begin{cases}
T_1=T_2,\\
\mu_1=\mu_2.
\end{cases}
$$

## B. 正则系综

与热库接触。

固定

$$
T,\qquad N(x)=N.
$$

$$
\langle E(x)\rangle=\bar E存在涨落
$$

$\Rightarrow$ Gibbs 分布

$$
p(x)=\frac{1}{Z(T,N)}e^{-\beta E(x)}.
$$

$$
\beta=\frac{1}{T}\qquad(k_B=1)
\quad\longrightarrow\quad \text{inverse Temperature}.
$$

$$
\mu=-T\left.\frac{\partial\ln Z}{\partial N}\right|_T.
$$

$\Rightarrow$ 可以定义 Helmholtz 自由能

$$
F(T,N)=-T\ln Z(T,N).
$$

$$
S=-\left.\frac{\partial F}{\partial T}\right|_N,
$$

$$
\mu=\left.\frac{\partial F}{\partial N}\right|_T.
$$

$$
\Rightarrow dF=-S\,dT+\mu\,dN.
$$

$$
F=E-TS,
$$

$$
E=F+TS=F-T\left.\frac{\partial F}{\partial T}\right|_N.
$$

$$
\left.\frac{\partial F}{\partial T}\right|_N
=-\ln Z-T\frac{1}{Z}\frac{\partial Z}{\partial T},
$$

$$
-\left.\frac{\partial F}{\partial T}\right|_N
=\ln Z+\beta E.
$$

## C. 巨正则系综

能量、粒子数的交换都允许。

$$
\langle E(x)\rangle=\bar E,
\qquad
\langle N(x)\rangle=\bar N.
$$

$$
p(x)=\frac{1}{Z(\beta,\mu)}e^{-\beta[E(x)-\mu N(x)]}.
$$

可以定义巨势

$$
\Omega=-T\ln Z(T,\mu).
$$

$$
S'=-\left.\frac{\partial\Omega}{\partial T}\right|_\mu,
$$

$$
N=-\left.\frac{\partial\Omega}{\partial\mu}\right|_T.
$$

$$
\Omega=-T\ln Z=E-TS-\mu N.
$$

## Appendix



### 无约束 $\Rightarrow$ 均匀分布的概率

$$
X=\{x_1,\ldots,x_n\},
\qquad
p_i\equiv p(x_i),
$$

$$
\sum_i p_i=1,
\qquad
p_i\ge 0.
$$

约束只有 $\sum_i p_i=1$。

$$
S'[p]=-\sum_i p_i\ln p_i.
$$

拉乘：

$$
L=-\sum_i p_i\ln p_i-\alpha\left(\sum_i p_i-1\right).
$$

$$
\frac{\partial L}{\partial p_i}=-(\ln p_i+1)-\alpha.
$$

$$
\ln p_i=-1-\alpha,
\qquad
p_i=C=e^{-1-\alpha}.
$$

约束：

$$
\sum_{i=1}^{\Omega}C_i=C\Omega=1,
$$

$$
C=\frac{1}{\Omega}.
$$

$$
\frac{\partial^2S}{\partial p_i\partial p_j}
=-\frac{\delta_{ij}}{p_i}<0
\qquad\text{最大}.
$$

### 假设期望确定

$$
\langle f_a(x)\rangle=\sum_xp(x)f_a(x).
$$

约束：

$$
\sum_xp(x)=1, \tag{0}
$$

$$
\sum_xp(x)f_a(x)=\bar f_a. \tag{1}
$$

$$
L=-\sum_xp(x)\ln p(x)
-\alpha\left(\sum_xp(x)-1\right)
-\sum_a\lambda_a\left(\sum_xp(x)f_a(x)-\bar f_a\right).
$$

$$
\frac{\partial L}{\partial p(x)}
=-(\ln p(x)+1)-\alpha-\sum_a\lambda_af_a.
$$

$$
\Rightarrow\ln p(x)=-1-\alpha-\sum_a\lambda_af_a,
$$

$$
p(x)=e^{-1-\alpha}\exp\left(-\sum_a\lambda_af_a\right).
$$

约束 0：

$$
\sum_xp(x)
=e^{-1-\alpha}\sum_x\exp\left(-\sum_a\lambda_af_a(x)\right)
=e^{-1-\alpha}Z[\lambda]=1.
$$

$$
e^{-1-\alpha}=\frac{1}{Z[\lambda]},
$$

$$
p(x)=\frac{\exp\left(-\sum_a\lambda_af_a\right)}{Z[\lambda]}.
$$

约束 $a$：

$$
\sum_x\frac{1}{Z}\exp\left(-\sum_a\lambda_af_a\right)f_a(x)=\bar f_a.
$$

注意

$$
\frac{\partial Z}{\partial\lambda_a}
=-\sum_x\exp\left(-\sum_a\lambda_af_a(x)\right)f_a(x)
=-Z\bar f_a.
$$

$$
\Rightarrow
-\frac{1}{Z}\frac{\partial Z}{\partial\lambda_a}
=\bar f_a
=-\frac{\partial\ln Z[\lambda]}{\partial\lambda_a}.
$$

$$
\begin{aligned}
S(X)
&=-\sum_x\frac{\exp\left(-\sum_a\lambda_af_a\right)}{Z[\lambda]}
\left[-\sum_a\lambda_af_a-\ln Z[\lambda]\right]\\
&=-\sum_xp(x)\left[-\sum_a\lambda_af_a-\ln Z[\lambda]\right]\\
&=\sum_a\lambda_a\bar f_a+\sum_xp(x)\ln Z[\lambda]\\
&=\sum_a\lambda_a\bar f_a+\ln Z[\lambda]\\
&=-\sum_a\lambda_a\frac{\partial\ln Z[\lambda]}{\partial\lambda_a}+\ln Z[\lambda]\\
&=\left[1-\sum_a\frac{\partial}{\partial\ln\lambda_a}\right]\ln Z[\lambda].
\end{aligned}
$$

### 正则系综的拉格朗日乘子推导

我们想推导 $\beta$ 具体为啥。

$$
E=-\left.\frac{\partial\ln Z}{\partial\beta}\right|_N,
$$

$$
S=\ln Z+\beta E.
$$

$$
\begin{aligned}
dS
&=\left.\frac{\partial\ln Z}{\partial N}\right|_\beta dN
+\beta\,dE
+\left(\left.\frac{\partial\ln Z}{\partial\beta}\right|_N d\beta+E\,d\beta\right)\\
&=\left.\frac{\partial\ln Z}{\partial N}\right|_\beta dN+\beta\,dE.
\end{aligned}
$$

“热一”：

$$
dS=\frac{dE}{T}-\frac{\mu}{T}\,dN.
$$

$$
\beta=\frac{1}{T},
\qquad
\mu=-T\left.\frac{\partial\ln Z}{\partial N}\right|_\beta
=-T\left.\frac{\partial\ln Z}{\partial N}\right|_T.
$$

### 巨正则系综的拉格朗日乘子

设：

$$
p(x)=\frac{\exp\left(-\sum_a\lambda_a f_a\right)}{Z[\lambda]},
$$

$$
\bar f_a=-\frac{\partial\ln Z[\lambda]}{\partial\lambda_a}.
$$

$$
E=\langle E(x)\rangle,
\qquad
N=\langle N(x)\rangle.
$$

$$
S(X)
=-\sum_a\lambda_a\frac{\partial\ln Z[\lambda]}{\partial\lambda_a}
+\ln Z[\lambda].
$$

$$
p(x)=\frac{1}{Z[\beta,\gamma]}e^{-[\beta E(x)+\gamma N(x)]}.
$$

$$
E=-\left.\frac{\partial\ln Z}{\partial\beta}\right|_\gamma,
$$

$$
N=-\left.\frac{\partial\ln Z}{\partial\gamma}\right|_\beta.
$$

$$
S=\ln Z+\beta E+\gamma N.
$$

$$
\begin{aligned}
dS
&=\left(\left.\frac{\partial\ln Z}{\partial\beta}\right|_\gamma d\beta
+E\,d\beta\right)
+\left(\left.\frac{\partial\ln Z}{\partial\gamma}\right|_\beta d\gamma
+N\,d\gamma\right)\\
&\qquad+\beta\,dE+\gamma\,dN\\
&=\beta\,dE+\gamma\,dN.
\end{aligned}
$$

由“热一”：

$$
dS=\frac{1}{T}\,dE-\frac{\mu}{T}\,dN.
$$

$$
\Rightarrow
\beta=\frac{1}{T},
\qquad
\gamma=-\frac{\mu}{T}.
$$

$$
p(x)=\frac{1}{Z}e^{-\beta[E(x)-\mu N(x)]}.
$$

$$
Z
=\sum_x e^{-\beta[E(x)-\mu N(x)]}
=\sum_{N=0}^{\infty}e^{\beta\mu N}Z_N(\beta).
$$

固定粒子数正则配分函数加权求和。
