---
title: 特殊函数
description: 从 Gamma 函数的定义、乘积式与反射公式，到 Beta 函数、Stirling 公式、digamma、zeta 与 Wallis 积分的手写笔记。
date: 2026-10-24
type: note
category: 数学物理方法
tags: [Gamma函数, Beta函数, 特殊函数, 渐近展开]
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes: []
---

## Gamma 函数：定义

### 积分定义（1730，Euler）

$x>0$。

$$
\Gamma(x)=\int_0^1[-\log(m)]^{x-1}\,dm.
$$

考虑 $-\log(m)=t$，则

$$
m=e^{-t},\qquad dm=-e^{-t}\,dt.
$$

第一种形式：

$$
\boxed{\Gamma(x)=\int_0^\infty t^{x-1}e^{-t}\,dt}
$$

再作代换 $-\log(m)=t^2$，利用 $d(t^2)=2t\,dt$，得到第二种形式。

第二种形式：

$$
\boxed{\Gamma(x)=2\int_0^\infty t^{2x-1}e^{-t^2}\,dt}
$$

### 递推关系与唯一性

对第一种积分形式作分部积分，在 $x>1$ 时有

$$
\Gamma(x)=\int_0^\infty t^{x-1}e^{-t}\,dt
=(x-1)\Gamma(x-1).
$$

$$
\Gamma(n)=(n-1)!
$$

$$
\begin{cases}
\Gamma(1)=1,\\
\Gamma(x)=(x-1)\Gamma(x-1).
\end{cases}
$$

不过，仅有归一化和递推关系还不能唯一确定函数。例如，$\cos(2m\pi x)\Gamma(x)$（$m\in\mathbb Z$）也满足这两个条件。

（1922，Bohr–Mollerup）

$$
f:(0,+\infty)\to(0,+\infty),
$$

$$
\left\{
\begin{aligned}
f(1)&=1,\\
f(x)&=(x-1)f(x-1),\qquad x>1,\\
\log(f(x))&\text{ 凸}.
\end{aligned}
\right.
\quad\Longrightarrow\quad f(x)=\Gamma(x).
$$

$$
\boxed{n!=\Gamma(n+1)}
$$

<figure>
  <img src="/phase-space-notes/figures/special-functions/embedded_p02_01.jpg" alt="Gamma 函数曲线及整数点的函数值" width="2465" height="1202" loading="lazy" />
  <figcaption>图 1｜Gamma 函数曲线及整数点的函数值</figcaption>
</figure>

从 $x>0$ 出发，利用递推式

$$
\Gamma(x-1)=\frac{\Gamma(x)}{x-1}.
$$

可以逐段推广到负半轴，但必须避开 $0,-1,-2,\ldots$。

### 极限定义与乘积形式（1729，Euler）

$$
\boxed{\Gamma(x)=\lim_{p\to\infty}\Gamma_p(x),\qquad
\Gamma_p(x)=\frac{p^x}{x(1+x/1)(1+x/2)\cdots(1+x/p)}}
$$

分母共有 $p+1$ 个因子。

$$
p^x=e^{x\ln p}
=e^{x(\ln p-1-\frac12-\cdots-\frac1p)}
 e^{x+\frac x2+\cdots+\frac xp}.
$$

$$
\Gamma_p(x)
=e^{x(\ln p-1-\frac12-\cdots-\frac1p)}
\frac1x\,
\frac{e^x}{1+x/1}\,
\frac{e^{x/2}}{1+x/2}\cdots
\frac{e^{x/p}}{1+x/p}.
$$

$$
\gamma=\lim_{p\to\infty}
\left(1+\frac12+\cdots+\frac1p-\ln p\right)
\approx 0.577.
$$

$$
\lim_{p\to\infty}\Gamma_p(x)=\Gamma(x)
=\frac{e^{-x\gamma}}{x}
\prod_{p=1}^{\infty}\frac{e^{x/p}}{1+x/p}.
$$

这就得到 Weierstrass 乘积形式：

$$
\boxed{\frac1{\Gamma(x)}
=x e^{\gamma x}\prod_{p=1}^{\infty}
\left(1+\frac xp\right)e^{-x/p}}
$$

## Gamma 函数的性质

### 反射公式

$$
\Gamma(z)\Gamma(1-z)=\frac{\pi}{\sin(\pi z)}.
$$

$$
\begin{aligned}
\frac1{\Gamma(x)}\frac1{\Gamma(-x)}
&=x(-x)e^{\gamma x}e^{-\gamma x}
\prod_{p=1}^{\infty}\left(1+\frac xp\right)e^{-x/p}
\prod_{p=1}^{\infty}\left(1-\frac xp\right)e^{x/p}\\
&=-x^2\prod_{p=1}^{\infty}\left(1-\frac{x^2}{p^2}\right).
\end{aligned}
$$

$$
\Gamma(1-x)=-x\Gamma(-x)
\quad\Longrightarrow\quad
\frac{-x}{\Gamma(x)\Gamma(1-x)}
=-x^2\prod_{p=1}^{\infty}\left(1-\frac{x^2}{p^2}\right).
$$

$$
\frac1{\Gamma(x)\Gamma(1-x)}
=x\prod_{p=1}^{\infty}\left(1-\frac{x^2}{p^2}\right).
$$

再利用正弦函数的乘积展开：

$$
\sin(\pi x)=\pi x\prod_{p=1}^{\infty}
\left(1-\frac{x^2}{p^2}\right).\qquad\square
$$

$$
\Gamma\left(\frac12\right)^2=\pi,\qquad
\Gamma\left(\frac12\right)=\sqrt\pi.
$$

### Legendre 二倍公式

$$
\boxed{\Gamma(2z)=\frac{2^{2z-1}}{\sqrt\pi}\,
\Gamma(z)\Gamma\left(z+\frac12\right)}
$$

### 应用：分数阶导数

$$
n!=\Gamma(n+1).
$$

熟知：

$$
\begin{aligned}
\left(\frac d{dx}\right)^n x^a
&=a(a-1)\cdots(a-n+1)x^{a-n}\\
&=\frac{a!}{(a-n)!}x^{a-n}\\
&=\frac{\Gamma(a+1)}{\Gamma(a-n+1)}x^{a-n}.
\end{aligned}
$$

把整数阶 $n$ 形式上推广为 $\nu\in\mathbb R^+$，可写为

$$
\left(\frac d{dx}\right)^\nu x^a
=\frac{\Gamma(a+1)}{\Gamma(a-\nu+1)}x^{a-\nu}.
$$

这里先将它看作幂函数求导公式的形式推广；分数阶导数的具体定义与适用条件需另行指定。

## Beta 函数

当 $\operatorname{Re}x>0$、$\operatorname{Re}y>0$ 时，第一类欧拉积分定义为

$$
\boxed{B(x,y)=\int_0^1 t^{x-1}(1-t)^{y-1}\,dt}
$$

$$
B(x,y)=B(y,x).
$$

三角代换 $t=\sin^2\theta$。

$$
\begin{aligned}
B(x,y)
&=\int_0^{\pi/2}\sin^{2x-2}\theta\,
\cos^{2y-2}\theta\cdot2\sin\theta\cos\theta\,d\theta\\
&=2\int_0^{\pi/2}(\sin\theta)^{2x-1}
(\cos\theta)^{2y-1}\,d\theta.
\end{aligned}
$$

### 性质

$$
\boxed{B(x,y)=\frac{\Gamma(x)\Gamma(y)}{\Gamma(x+y)}}
$$

$$
\boxed{B(x+1,y)
=\frac{\Gamma(x+1)\Gamma(y)}{\Gamma(x+y+1)}
=\frac{x}{x+y}\frac{\Gamma(x)\Gamma(y)}{\Gamma(x+y)}}
$$

证明：

$$
\begin{aligned}
\Gamma(x)\Gamma(y)
&=\left[2\int_0^\infty u^{2x-1}e^{-u^2}\,du\right]
\left[2\int_0^\infty v^{2y-1}e^{-v^2}\,dv\right]\\
&=4\int_0^\infty\int_0^\infty
u^{2x-1}v^{2y-1}e^{-(u^2+v^2)}\,du\,dv.
\end{aligned}
$$

取 $u^2+v^2=r^2$，$u=r\cos\theta$，$v=r\sin\theta$，
$du\,dv=r\,dr\,d\theta$。

$$
\begin{aligned}
\Gamma(x)\Gamma(y)
&=4\int_0^\infty e^{-r^2}r^{2x-1}r^{2y-1}r\,dr
\int_0^{\pi/2}\cos^{2x-1}\theta\,
\sin^{2y-1}\theta\,d\theta\\
&=4\int_0^\infty e^{-r^2}r^{2(x+y)-1}\,dr
\int_0^{\pi/2}\cos^{2x-1}\theta\,
\sin^{2y-1}\theta\,d\theta\\
&=\Gamma(x+y)B(x,y).
\end{aligned}
$$

这里使用了

$$
\boxed{\Gamma(x)=2\int_0^\infty t^{2x-1}e^{-t^2}\,dt}
$$

### Legendre 二倍公式的证明

$$
\boxed{\Gamma(2z)=\frac{2^{2z-1}}{\sqrt\pi}
\Gamma(z)\Gamma\left(z+\frac12\right)}
$$

计算

$$
B(z,z)=\int_0^1 t^{z-1}(1-t)^{z-1}\,dt.
$$

代换 $t=\dfrac{1+x}{2}$：

$$
B(z,z)=\int_{-1}^1
2^{-(z-1)}2^{-(z-1)}(1+x)^{z-1}(1-x)^{z-1}\,\frac{dx}{2}.
$$

$$
\begin{aligned}
B(z,z)
&=\frac12\int_{-1}^1 2^{2-2z}(1-x^2)^{z-1}\,dx\\
&=\int_0^1 2^{2-2z}(1-x^2)^{z-1}\,dx.
\end{aligned}
$$

令 $u=x^2$，$dx=\dfrac{du}{2\sqrt u}$：

$$
\begin{aligned}
B(z,z)
&=\int_0^1 2^{2-2z}(1-u)^{z-1}\frac{du}{2\sqrt u}\\
&=2^{1-2z}\int_0^1(1-u)^{z-1}u^{-1/2}\,du\\
&=2^{1-2z}B\left(z,\frac12\right).
\end{aligned}
$$

代入 $B(x,y)=\dfrac{\Gamma(x)\Gamma(y)}{\Gamma(x+y)}$，得到

$$
\frac{\Gamma(z)\Gamma(z)}{\Gamma(2z)}
=2^{1-2z}\frac{\Gamma(z)\Gamma(1/2)}{\Gamma(z+1/2)}.
$$

约去等式两边的 $\Gamma(z)$：

$$
\begin{aligned}
\Gamma(2z)
&=2^{2z-1}\frac{\Gamma(z)\Gamma(z+1/2)}{\Gamma(1/2)}\\
&=\frac{2^{2z-1}}{\sqrt\pi}\Gamma(z)\Gamma\left(z+\frac12\right).
\qquad\square
\end{aligned}
$$

## Stirling 公式

<figure>
  <img src="/phase-space-notes/figures/special-functions/embedded_p05_01.jpg" alt="Stirling 公式的渐近表达式" width="1298" height="254" loading="lazy" />
  <figcaption>图 2｜Stirling 公式的渐近表达式</figcaption>
</figure>



$$
\Gamma(z)=\int_0^\infty e^{-t}t^{z-1}\,dt.
$$

为了求出大参数下的渐近形式，先考虑 Laplace 型积分

$$
I(\lambda)=\int_a^b f(t)e^{\lambda\phi(t)}\,dt,
\qquad \lambda\to\infty.
$$

设 $\phi$ 在区间内部的 $t_0$ 处取得唯一的全局最大值，$f$ 在附近连续且 $f(t_0)\ne0$，并且

$$
\left.\frac{d\phi}{dt}\right|_{t=t_0}=0,
\qquad \phi''(t_0)<0.
$$

在 $t_0$ 附近作二阶展开：

$$
\phi(t)=\phi(t_0)+\frac{\phi''(t_0)}{2!}(t-t_0)^2
+o\bigl((t-t_0)^2\bigr).
$$

随着 $\lambda$ 增大，积分的主要贡献集中在 $t_0$ 附近。将 $f(t)$ 换成 $f(t_0)$，并保留指数中的二次项，便有

$$
I(\lambda)\simeq f(t_0)\int_a^b
\exp\left\{\lambda\left[\phi(t_0)
+\frac{\phi''(t_0)}2(t-t_0)^2\right]\right\}\,dt.
$$

也可以先把最大值对应的指数因子提出。下面这一步是精确的：

$$
I(\lambda)=e^{\lambda\phi(t_0)}
\int_a^b f(t)e^{\lambda(\phi(t)-\phi(t_0))}\,dt.
$$

当 $t\ne t_0$ 时，$\phi(t)-\phi(t_0)<0$，远离峰值的贡献受到指数抑制。下图展示了这一集中过程。对有限区间上的上述光滑情形，将峰值附近的高斯积分延至整条实轴，就得到

$$
I(\lambda)\sim f(t_0)e^{\lambda\phi(t_0)}
\sqrt{\frac{2\pi}{-\lambda\phi''(t_0)}},
\qquad\lambda\to+\infty.
$$

<figure>
  <img src="/phase-space-notes/figures/special-functions/embedded_p06_01.jpg" alt="Laplace 积分的被积函数随参数增大而集中在极大值附近" width="2427" height="1009" loading="lazy" />
  <figcaption>图 3｜Laplace 积分的被积函数随参数增大而集中在极大值附近</figcaption>
</figure>

回到 Gamma 函数，沿正实轴取 $z\to+\infty$，将积分写成

$$
\begin{aligned}
\Gamma(z+1)
&=\int_0^\infty e^{-t}t^z\,dt\\
&=\int_0^\infty e^{-t+z\ln t}\,dt.
\end{aligned}
$$

将被积函数写成 $e^{\phi(t)}$，其中

$$
\phi(t)=-t+z\ln t,\qquad
\phi'=-1+\frac zt,\qquad
\phi''=-\frac z{t^2}.
$$

$$
\phi'(t_0)=0,\qquad \frac z{t_0}=1,\qquad z=t_0.
$$

因此峰值位于 $t=z$。在这里展开并保留二次项：

$$
\phi(t)\simeq-z+z\ln z+\frac1{2!}\cdot\frac{-1}{z}(t-z)^2.
$$

代回积分，得到

$$
\Gamma(z+1)\simeq e^{-z+z\ln z}\int_0^\infty e^{-(t-z)^2/(2z)}\,dt.
$$

高斯峰的宽度为 $\sqrt z$，而峰值到下限 $0$ 的距离为 $z$；两者的比值为 $\sqrt z\to\infty$。因此可将下限延至 $-\infty$，得到同一渐近主项：

$$
\Gamma(z+1)\simeq\frac{z^z}{e^z}\int_{-\infty}^{\infty} e^{-(t-z)^2/(2z)}\,dt
=\sqrt{2\pi z}\,\frac{z^z}{e^z}.
$$

高斯指数中二次项的系数为 $1/(2z)$，所以整个高斯积分等于 $\sqrt{2\pi z}$。于是

$$
\Gamma(z+1)\sim\sqrt{2\pi z}\left(\frac ze\right)^z,
\qquad z\to+\infty.
$$



## 多伽马函数与 digamma

对 $\ln\Gamma(x)$ 求高阶导数，定义多伽马函数：

$$
\Psi_n(x)=\left(\frac d{dx}\right)^{n+1}\ln\Gamma(x).
$$

digamma：

$$
\frac d{dz}\bigl(\ln\Gamma(z)\bigr)=\psi(z).
$$

$$
\boxed{\frac1{\Gamma(x)}=x e^{\gamma x}
\prod_{p=1}^{\infty}\left(1+\frac xp\right)e^{-x/p}}
$$

$$
\ln\Gamma(x)=-\gamma x-\ln x+
\sum_{p=1}^{\infty}\left[\frac xp-\ln\left(1+\frac xp\right)\right].
$$

$$
\begin{aligned}
\frac d{dx}\ln\Gamma(x)
&=-\gamma-\frac1x+
\sum_{p=1}^{\infty}\left[\frac1p-\frac1{p+x}\right]\\
&=-\gamma+\sum_{p=1}^{\infty}
\left[\frac1p-\frac1{p+x-1}\right].
\end{aligned}
$$

$$
\Longrightarrow\quad\psi(1)=\Gamma'(1)=-\gamma.
$$

$$
\Gamma(x+1)=x\Gamma(x),
$$

$$
\ln\Gamma(x+1)=\ln x+\ln\Gamma(x),
$$

$$
\psi(x+1)=\frac1x+\psi(x).
$$

$$
\Gamma(x)\Gamma(1-x)=\frac\pi{\sin\pi x},
$$

$$
\Longrightarrow\quad
\ln\Gamma(x)+\ln\Gamma(1-x)=\ln\pi-\ln\sin\pi x,
$$

$$
\psi(x)-\psi(1-x)
=-\frac{\pi\cos\pi x}{\sin\pi x}
=-\pi\cot\pi x,
$$

$$
\Longrightarrow\quad\psi(1-x)=\psi(x)+\pi\cot\pi x.
$$

类似地，由 Gamma 函数的二倍公式可得

$$
\psi(2x)=\frac12\psi(x)+\frac12\psi\left(x+\frac12\right)+\ln2.
$$

## Zeta 函数

$$
\zeta(z)=\frac1{1^z}+\frac1{2^z}+\cdots,\qquad\operatorname{Re}z>1.
$$

$$
\Gamma(x)=\int_0^\infty t^{x-1}e^{-t}\,dt.
$$

代换 $t=ku$：

$$
=\int_0^\infty k^{x-1}u^{x-1}e^{-ku}\cdot k\,du,
$$

$$
\Gamma(x)=\int_0^\infty k^x u^{x-1}e^{-ku}\,du.
$$

将与积分变量无关的 $k^x$ 提出：

$$
\frac1{k^x}=\frac1{\Gamma(x)}\int_0^\infty u^{x-1}e^{-ku}\,du,
$$

$$
\begin{aligned}
\sum_{k=1}^{\infty}k^{-x}
&=\frac1{\Gamma(x)}\int_0^\infty
u^{x-1}\sum_{k=1}^{\infty}e^{-ku}\,du\\
&=\frac1{\Gamma(x)}\int_0^\infty
u^{x-1}\left[\frac1{1-e^{-u}}-1\right]\,du.
\end{aligned}
$$

在 $\operatorname{Re}x>1$ 时交换求和与积分，再将 $\Gamma(x)$ 移至左边，得到

$$
\zeta(x)\Gamma(x)=\int_0^\infty\frac{t^{x-1}}{e^t-1}\,dt.
$$

## 附：Wallis 积分——Beta 函数的应用

$$
W_n=\int_0^{\pi/2}\sin^n\theta\,d\theta
=\int_0^{\pi/2}\cos^n\theta\,d\theta.
$$

$$
B(x,y)=2\int_0^{\pi/2}
\sin^{2x-1}(t)\cos^{2y-1}(t)\,dt,
$$

$$
W_n=\frac12B\left(\frac{n+1}{2},\frac12\right).
$$

### $n=2p+1$

$$
W_{2p+1}=\frac12B\left(p+1,\frac12\right)
=\frac{\Gamma(p+1)\Gamma(1/2)}{2\Gamma(p+3/2)}.
$$

利用半整数处的 Gamma 函数值：

$$
\left(n-\frac12\right)!
=\Gamma\left(n+\frac12\right)
=\sqrt\pi\,\frac{1\cdot3\cdots(2n-1)}{2^n}.
$$

$$
\begin{aligned}
W_{2p+1}
&=\frac{\sqrt\pi}{2}\,
\frac{p!}{(p+\frac12)\sqrt\pi\,
\dfrac{1\cdot3\cdot5\cdots(2p-1)}{2^p}}\\
&=\frac{p!\,2^p}{(2p+1)(2p-1)!!}\\
&=\frac{p!\,2^p}{(2p+1)!!}\\
&=\frac{(p!)^2\,4^p}{(2p+1)!}.
\end{aligned}
$$

### $n=2p$

$$
\begin{aligned}
W_{2p}
&=\frac12B\left(p+\frac12,\frac12\right)\\
&=\frac{\Gamma(p+1/2)\Gamma(1/2)}{2\Gamma(p+1)}\\
&=\frac{\sqrt\pi\,\dfrac1{2^p}\,[1\cdot3\cdot5\cdots(2p-1)]\sqrt\pi}{2p!}\\
&=\frac\pi{2^{p+1}}\frac{(2p-1)!!}{p!}.
\end{aligned}
$$

$$
\begin{aligned}
W_{2p}
&=\frac\pi{2^{p+1}}\,
\frac{(2p)!}{2\cdot4\cdot6\cdots2p\cdot p!}\\
&=\frac\pi{2^{2p+1}}\frac{(2p)!}{(p!)^2}.
\end{aligned}
$$
