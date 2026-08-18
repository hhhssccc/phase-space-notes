---
title: 从正交性看 Laurent 展开：围道积分、Fourier 模式与全纯性
description: 从围道积分的正交结构出发，理解 Laurent 系数怎样被提取，以及全纯性怎样固定 Fourier 模式的径向依赖。
date: 2026-08-18
type: note
category: 复分析
tags: [Laurent 展开, Fourier 级数, 正交性, 全纯函数]
featured: false
draft: false
related: []
backlinks: []
sidenotes:
  - marker: "*"
    title: 围道方向与绕数
    body: 上式默认 C 正向绕 a 一周。更一般地，如果 C 绕 a 的绕数为 Ind(C,a)，则右端应乘以该绕数。
---

<figure class="lead-figure">
  <img src="../../figures/laurent-expansion-from-orthogonality/lead.jpg" alt="蓝发动漫角色双手托腮，周围点缀星形图案" width="1280" height="824" loading="eager" decoding="async" />
</figure>

## 从一个重要的积分开始

考察积分
$$
\oint_C\frac{1}{(\xi-a)^{1}}\,d\xi
=

2\pi i
$$
这个结果是显然的，只需取圆围道
$$
C:\xi=a+re^{i\theta},\qquad r\text{ 为常数}
$$
则
$$
d\xi=id\theta r e^{i\theta}
$$

$i d\theta$对于圆围道积分一圈积分贡献为$2\pi i$

其余部分抵消了


对这个积分简单变形，我们发现

$$
\oint_C\frac{(\xi-a)^k}{(\xi-a)^{n+1}}\,d\xi
=
\begin{cases}
2\pi i,&k=n,\\
0,&k\ne n,
\end{cases}
$$

这个关系对负的 $k,n$ 也成立。等价地，

$$
\boxed{
\frac{1}{2\pi i}\oint_C(\xi-a)^{k-n-1}\,d\xi
=\delta_{kn},
\qquad k,n\in\mathbb Z
}.
$$

这个积分我们记作积分（0）


## Taylor 展开的启示

对于我们熟知的 Taylor 展开，有

$$
f(z)=\sum_{n=0}^{\infty}\frac{f^{(n)}(a)}{n!}(z-a)^n.
$$

记

$$
a_n=\frac{f^{(n)}(a)}{n!}.
$$

考察积分

$$
\frac{1}{2\pi i}\oint_C\frac{f(\xi)}{(\xi-a)^{n+1}}\,d\xi

$$

用 Taylor 展开代入

$$
\begin{aligned}
\frac{1}{2\pi i}\oint_C\frac{f(\xi)}{(\xi-a)^{n+1}}\,d\xi
&=\frac{1}{2\pi i}\oint_C
\frac{
\dfrac{f(a)}{0!}
+\cdots
+\dfrac{f^{(n)}(a)}{n!}(\xi-a)^n
+\cdots
}{(\xi-a)^{n+1}}\,d\xi .
\end{aligned}
$$

逐项积分时，对于幂次与 $n$ 匹配的那一项，

$$
\begin{aligned}

\frac{1}{2\pi i}\oint_C
\frac{


\dfrac{f^{(n)}(a)}{n!}(\xi-a)^n
}{(\xi-a)^{n+1}}\,d\xi .
\end{aligned}=\frac{1}{2\pi i}\times\dfrac{f^{(n)}(a)}{n!}\times2\pi i
$$
这里使用了积分（0）


对于其他项，其积分结果给出 $0$；匹配项给出 $2\pi i$。因此最后只留下

$$
\frac{f^{(n)}(a)}{n!}.
$$

这也可以写为 Taylor 系数的围道积分表示：

$$
\boxed{
a_n=\frac{1}{2\pi i}\oint_C
\frac{f(\xi)}{(\xi-a)^{n+1}}\,d\xi
}.
$$

###  一个朴素的猜测：把指标延伸到负整数？

> [!question] 猜测
> 当解析域是一个环域时，展开中可能会出现负整数幂。我们能不能把 Taylor 展开直接延伸到 $n<0$？

也就是先猜测

$$
f(z)
=\sum_{n=0}^{\infty}\frac{f^{(n)}(a)}{n!}(z-a)^n
+\sum_{n=-\infty}^{-1}\frac{f^{(n)}(a)}{n!}(z-a)^n,
$$


于是看起来仿佛可以得到

$$
a_n\overset{?}{=}\frac{f^{(n)}(a)}{n!},
\qquad n\in\mathbb Z.
$$

但这条路走不通：所谓“广义负阶导数”在这里没有直接意义，$f$的对应阶导数不一定存在，
并且如果你考虑用Gamma函数解析延拓定义负阶乘，Gamma 函数在负整数处有极点，不能把 $n!$ 机械地延拓到负整数后继续使用。

所以，Laurent 系数公式仍然成立，但它的理由不应被理解成“Taylor 导数公式对负阶导数的延拓”。








### 正确的方向


求导的方向走不通，我们回到常规的方法


设 Laurent 展开为

$$
f(z)=\sum_{k=-\infty}^{\infty}a_k(z-a)^k.
$$
把 Laurent 展开代入前面在 Taylor 情形中考察过的积分
$$
\begin{aligned}
\frac{1}{2\pi i}\oint_C
\frac{f(\xi)}{(\xi-a)^{n+1}}\,d\xi
&=\sum_{k=-\infty}^{\infty}a_k
\frac{1}{2\pi i}\oint_C(\xi-a)^{k-n-1}\,d\xi\\
&=\sum_{k=-\infty}^{\infty}a_k\delta_{nk}\\
&=a_n.
\end{aligned}
$$
也就得到了洛朗展开的系数公式


## 围道积分是一种正交性提供的系数提取


我们再次回顾积分（0）

$$
\boxed{
\frac{1}{2\pi i}\oint_C(\xi-a)^{k-n-1}\,d\xi
=\delta_{kn},
\qquad k,n\in\mathbb Z
}.
$$

这个形式可以被认为是一种“正交性”。抽象地说，若有一个双线性配对

$$
B(\psi_n,\phi_k)=\delta_{nk},
$$

那么 $\{\psi_n\}$ 与 $\{\phi_k\}$ 互为对偶；$B(\psi_n,\cdot)$ 的作用就是提取第 $n$ 个系数。

这里的 $B$ 可以让人联想到内积、积分或某种双线性作用。关键是：只有指标相同时结果非零。这正是“正交性”。概括来说：

$$
I=\int F_n^{\,k}\,dx=\delta_{nk},
$$

其中 $F_n^{\,k}$ 是积分中的代数式；只在 $k=n$ 时积分结果非零。



那么

$$
\begin{aligned}
\frac{1}{2\pi i}\oint_C
\frac{f(\xi)}{(\xi-a)^{n+1}}\,d\xi
&=\sum_{k=-\infty}^{\infty}a_k
\frac{1}{2\pi i}\oint_C(\xi-a)^{k-n-1}\,d\xi\\
&=\sum_{k=-\infty}^{\infty}a_k\delta_{nk}\\
&=a_n.
\end{aligned}
$$

因此，围道积分在这里就像一个“系数提取器”：它在所有 Laurent 模式中挑出第 $n$ 个模式。

### 圆周参数化：Laurent 系数就是 Fourier 系数

取圆周 $C$：

$$
\xi-a=re^{i\theta},
\qquad 0\leq\theta\leq 2\pi.
$$

沿圆周，洛朗展开式

$$
f(z)=\sum_{k=-\infty}^{\infty}a_k(z-a)^k.
$$

代入围道有

$$
f(\xi)=f(a+re^{i\theta})
=\sum_{n=-\infty}^{\infty}a_n r^n e^{in\theta}.
$$

这已经是一个关于角变量 $\theta$ 的 Fourier 展开。对应的系数为

$$
\boxed{
a_n
=r^{-n}\frac{1}{2\pi}
\int_0^{2\pi}f(a+re^{i\theta})e^{-in\theta}\,d\theta
}.
$$

这时思路变得很清楚：

- **正交性回答：怎样提取系数？** 利用  Fourier 正交性。
- **解析性回答：为什么最后得到 Laurent 展开？** 对二维函数使用圆坐标时，几乎总可以角向 Fourier 展开

换句话说，对于圆坐标上的函数，可以先形式地写

$$
F(r,\theta)=\sum_{n=-\infty}^{\infty}C_n(r)e^{in\theta},
$$

此时 $C_n(r)$ 还是一般的径向函数；但全纯性会进一步限制每个模式的径向依赖，考虑全纯性之后，才能把它限制成 Laurent 展开所需的形式。

## 全纯条件怎样固定径向部分

以 $a$ 为圆心写

$$
z-a=re^{i\theta}.
$$

极坐标下的C-R条件记为

$$
\frac{\partial f}{\partial\theta}
=ir\frac{\partial f}{\partial r}.
$$

将

$$
f(r,\theta)=\sum_n C_n(r)e^{in\theta}
$$

代入，有

$$
inC_n(r)=irC_n'(r).
$$

因此

$$
rC_n'(r)=nC_n(r),
$$

从而

$$
C_n(r)=a_n r^n.
$$

于是

$$
\begin{aligned}
f(r,\theta)
&=\sum_n a_n r^n e^{in\theta}\\
&=\sum_n a_n(z-a)^n.
\end{aligned}
$$

这里可以把两个因子分别理解为：

$$
\underbrace{r^n}_{\text{全纯性固定的径向部分}}
\quad
\underbrace{e^{in\theta}}_{\text{彼此正交的角向模式}}.
$$

## 形成的理解

对于 Laurent展开：

1. Laurent 系数的围道积分公式并不是 Taylor 导数公式向“负阶导数”的简单延伸；
2. 核心代数结构是
   $$
   \frac{1}{2\pi i}\oint_C(\xi-a)^{k-n-1}\,d\xi=\delta_{kn},
   $$
   它像正交基的配对一样提取系数；
3. 在圆周上，Laurent 模式就是 Fourier 角向模式；
4. Fourier 正交性负责提取角向系数，全纯性则把一般的径向函数 $C_n(r)$ 限制为 $a_n r^n$；
5. 二者结合后，才得到
   $$
   f(z)=\sum_{n=-\infty}^{\infty}a_n(z-a)^n.
   $$
