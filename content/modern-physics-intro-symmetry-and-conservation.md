---
title: 《近代物理导论》听课笔记：从光与相对论到经典对称性
description: 从 Maxwell 电磁波与狭义相对论出发，经由波粒二象性、Hamilton 力学与正则变换，整理对称性和守恒量的对应。
date: 2026-08-24
type: note
category: 量子力学
tags:
  - 狭义相对论
  - 波粒二象性
  - Hamilton 力学
  - 正则变换
  - Noether 定理
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes: []
---

<figure class="lead-figure">
  <img src="../../figures/modern-physics-intro-symmetry-and-conservation/lead.png?v=1" alt="白色背景中，一位金发、穿深色校服的动漫人物竖起食指作安静手势" width="1536" height="1024" loading="eager" decoding="async" />
</figure>

这是我 25 年暑假期间《近代物理导论》by. 王凯 的听课笔记，26 年暑假稍作整理。

## 第一章：绪论

主要从物理学史与实验出发认识原子与量子。

$$
\text{光}
\longrightarrow
\begin{cases}
\text{SR},\\
\text{波粒二象性}.
\end{cases}
$$

## 1.光
真空中的 Maxwell 方程给出

$$
\nabla\times\vec E=-\frac{\partial\vec B}{\partial t},
\qquad
\nabla\times\vec B=\varepsilon_0\mu_0\frac{\partial\vec E}{\partial t}.
$$

利用

$$
\nabla\times(\nabla\times\vec A)
=\nabla(\nabla\cdot\vec A)-\nabla^2\vec A
=-\nabla^2\vec A,
$$

可得

$$
-\nabla^2\vec E
=-\frac{\partial}{\partial t}(\nabla\times\vec B)
=-\varepsilon_0\mu_0\frac{\partial^2\vec E}{\partial t^2},
$$

$$
-\nabla^2\vec B
=\varepsilon_0\mu_0\frac{\partial}{\partial t}(\nabla\times\vec E)
=-\varepsilon_0\mu_0\frac{\partial^2\vec B}{\partial t^2}.
$$

于是得到波动方程

$$
\nabla^2\vec E-\varepsilon_0\mu_0\frac{\partial^2\vec E}{\partial t^2}=0,
\qquad
\nabla^2\vec B-\varepsilon_0\mu_0\frac{\partial^2\vec B}{\partial t^2}=0,
$$

即

$$
\Delta\vec E-\frac{1}{c^2}\frac{\partial^2\vec E}{\partial t^2}=0,
\qquad
\Delta\vec B-\frac{1}{c^2}\frac{\partial^2\vec B}{\partial t^2}=0,
\qquad
c=\frac{1}{\sqrt{\varepsilon_0\mu_0}}.
$$

取

$$
k=\frac{2\pi}{\lambda},
\qquad
\omega=\frac{2\pi c}{\lambda},
$$

$$
\vec E(z,t)=\vec E(z)e^{i\omega t},
\qquad
\vec B(z,t)=\vec B(z)e^{i\omega t},
$$

并写成 $\psi(z)e^{i\omega t}$，则

$$
\left(\frac{d^2}{dz^2}+\frac{\omega^2}{c^2}\right)\psi(z)=0,
$$

$$
\left(\frac{d^2}{dz^2}+k^2\right)\psi(z)=0.
$$

解有两支：

$$
\psi(z)=C_1e^{ikz}+C_2e^{-ikz},
$$

$$
\vec E(\vec r,t)
=\vec E_1e^{i(\omega t-\vec k\cdot\vec r)}
+\vec E_2e^{i(\omega t+\vec k\cdot\vec r)},
$$

分别对应两个传播方向。

#### 平面电磁波

取

$$
\vec E(\vec r)=\vec E_0e^{i\vec k\cdot\vec r}.
$$

对任意分量，

$$
\partial_j E_i
=\partial_j\left[(E_0)_i e^{i\vec k\cdot\vec r}\right]
=ik_j(E_0)_i e^{i\vec k\cdot\vec r}
=(\nabla\vec E)_{ij}.
$$

因此

$$
(\nabla\times\vec E)_i
=\varepsilon_{ijk}\partial_jE_k
=i(\vec k\times\vec E_0)_i e^{i\vec k\cdot\vec r},
$$

$$
\nabla\cdot\vec E
=\partial_iE_i
=ik_iE_i
=i\vec k\cdot\vec E.
$$

由

$$
\nabla\cdot\vec E=0,
\qquad
\nabla\cdot\vec B=0,
$$

得到

$$
\vec k\cdot\vec E=0,
\qquad
\vec k\cdot\vec B=0.
$$

令

$$
\vec E=\vec E_1e^{i(\omega t-\vec k\cdot\vec r)},
\qquad
\vec B=\vec B_1e^{i(\omega t-\vec k\cdot\vec r)},
$$

代回 Maxwell 方程：

$$
-i\vec k\times\vec E_1=-i\omega\vec B_1,
\qquad
-i\vec k\times\vec B_1=\frac{i\omega}{c^2}\vec E_1.
$$

$\vec E$ 与 $\vec B$ 正交，且都与传播方向 $\vec k$ 垂直，是横波：

$$
\vec E\perp\vec B\perp\vec k.
$$

Poynting 向量为

$$
\vec S=\frac{1}{\mu_0}\vec E\times\vec B,
$$

真空电磁波的能量密度为

$$
u=\frac12\left(\varepsilon_0|\vec E|^2+\frac{1}{\mu_0}|\vec B|^2\right).
$$

$\Rightarrow$ Hertz 证实了电磁波；介质中的反射、折射和 Fresnel 公式与光学自洽。

### A.狭义相对论

Galilean transformation：

$$
\begin{cases}
\vec x'=\vec x-\vec v t,\\
t'=t,
\end{cases}
$$

其中 $t'=t$ 表示绝对时间。$(x,t)$ 是原坐标变量，$(x',t')$ 是新坐标变量。

考察电磁场在 Galilean transformation 下的形式。对 $x$ 方向相对运动，

$$
\frac{\partial x}{\partial x'}=1,
\qquad
\frac{\partial y}{\partial y'}=1,
\qquad
\frac{\partial z}{\partial z'}=1,
$$

$$
\frac{\partial x}{\partial t'}=v,
\qquad
\frac{\partial y}{\partial t'}=0,
\qquad
\frac{\partial z}{\partial t'}=0.
$$

所以

$$
\frac{\partial}{\partial x'}
=\frac{\partial x}{\partial x'}\frac{\partial}{\partial x}
+\frac{\partial y}{\partial x'}\frac{\partial}{\partial y}
+\frac{\partial z}{\partial x'}\frac{\partial}{\partial z}
+\frac{\partial t}{\partial x'}\frac{\partial}{\partial t}
=\frac{\partial}{\partial x},
$$

$$
\nabla'^2=\nabla^2,
$$

而

$$
\frac{\partial}{\partial t'}
=\frac{\partial x}{\partial t'}\frac{\partial}{\partial x}
+\frac{\partial t}{\partial t'}\frac{\partial}{\partial t}
=v\frac{\partial}{\partial x}+\frac{\partial}{\partial t}
=\vec v\cdot\nabla+\frac{\partial}{\partial t}.
$$

进一步，

$$
\begin{aligned}
\frac{\partial^2\psi}{\partial t'^2}
&=\left(\vec v\cdot\nabla+\frac{\partial}{\partial t}\right)(\vec v\cdot\nabla\psi)
+\left(\vec v\cdot\nabla+\frac{\partial}{\partial t}\right)\left(\frac{\partial\psi}{\partial t}\right)\\
&=(\vec v\cdot\nabla)^2\psi
+2\vec v\cdot\nabla\frac{\partial\psi}{\partial t}
+\frac{\partial^2\psi}{\partial t^2}.
\end{aligned}
$$

于是波动方程变成

$$
\left[
\nabla^2
-\frac{1}{c^2}\frac{\partial^2}{\partial t^2}
-\frac{2}{c^2}\vec v\cdot\nabla\frac{\partial}{\partial t}
-\frac{1}{c^2}(\vec v\cdot\nabla)^2
\right]\psi=0.
$$

$\Rightarrow$ 电磁场波动方程在 Galilean transformation 下无协变性。

电动力学与 Galilean 相对性原理存在难以调和的矛盾。于是提出：

1. 狭义相对性原理：物理定律惯性系协变，采用 Lorentz 变换；
2. 光速不变原理。

光锥在两个惯性系中都满足

$$
x^2+y^2+z^2-c^2t^2=0,
$$

$$
x'^2+y'^2+z'^2-c^2t'^2=0.
$$

要求两个惯性系之间由线性变换联系，并考虑原点 $x'=0$、$x=vt$，可写

$$
y'=y,
\qquad
z'=z,
$$

$$
t'=\gamma t+\beta x,
\qquad
x'=\alpha(x-vt),
$$

解得 Lorentz 变换

$$
x'=\frac{x-vt}{\sqrt{1-v^2/c^2}},
\qquad
y'=y,
\qquad
z'=z,
$$

$$
t'=\frac{t-vx/c^2}{\sqrt{1-v^2/c^2}}.
$$

#### 时间的相对性、同时性与因果

波动方程可证为 Lorentz 协变。Lorentz 不变量为

$$
\Delta s^2
=c^2\Delta t^2
-(\Delta x^2+\Delta y^2+\Delta z^2).
$$

时间间隔变换为

$$
\Delta t'
=\frac{\Delta t-v\Delta x/c^2}{\sqrt{1-v^2/c^2}}.
$$

当 $\Delta t=0$、$\Delta x\ne0$ 时，$\Delta t'\ne0$：两个不同位置同时发生的事件，在另一惯性系中并不同时。这就是“同时的相对性”。

对不同位置、不同时间的两个事件，

$$
\Delta t'
=\frac{\Delta t}{\sqrt{1-v^2/c^2}}
\left(1-\frac{v\Delta x}{c^2\Delta t}\right).
$$

若要符合因果，要求

$$
\Delta t\,\Delta t'>0,
$$

因此

$$
1-\frac{v}{c^2}\frac{\Delta x}{\Delta t}>0,
\qquad
c^2\Delta t>v\Delta x.
$$

考虑 $v<c$，因果关系要求

$$
\Delta x\le c\Delta t,
\qquad
c^2\Delta t^2\ge(\Delta x)^2.
$$

存在因果关系要求类时或类光间隔

$$
c^2\Delta t^2-\Delta x^2\ge0.
$$

若

$$
c^2\Delta t^2-\Delta x^2<0,
$$

则不可能存在因果关系。

#### 能量与动量

设

$$
\vec p=M(u)\vec u,
\qquad
E=\mathcal E(u).
$$

要求：

1. 能动量守恒具有 Lorentz 协变性；
2. 低速时回到 Newton 力学。

低速极限给出

$$
M(0)=m,
\qquad
\left.\frac{\partial\mathcal E(u)}{\partial(u^2)}\right|_{u=0}=\frac{m}{2}.
$$

对碰过程中，在不同惯性系中写下能量、动量守恒关系。原稿下式左侧第二个速度符号字迹待确认：

$$
M(v)\vec v-M(w)\vec v
=M(v')\vec v'+M(v'')\vec v'',
$$

$$
2\mathcal E(v)=\mathcal E(v')+\mathcal E(v'').
$$

由此得到

$$
\vec p=\gamma m\vec u,
\qquad
E=\gamma mc^2.
$$

### B. Wave-particle duality

电磁波具有衍射与干涉，并满足

$$
\Delta\vec F-\frac{1}{c^2}\frac{\partial^2\vec F}{\partial t^2}=0,
\qquad
c=\frac{1}{\sqrt{\mu_0\varepsilon_0}}.
$$

UV、X-ray 与光电效应引出光子假说。Einstein 取光子静质量

$$
m_0=0.
$$

Planck 关系为

$$
E=h\nu=\hbar\omega=pc,
$$

因为

$$
h\frac{c}{\lambda}
=\frac{h}{2\pi}c\frac{2\pi}{\lambda}
=\hbar ck,
$$

而

$$
E^2=p^2c^2+m_0^2c^4
\quad\Longrightarrow\quad
E=pc.
$$

所以

$$
p=\hbar k.
$$

在自然单位 $\hbar=c=1$ 下，

$$
E=\omega,
\qquad
p=k.
$$

Compton scattering 验证了光子假设中的能动量关系。

## 2.物质波

de Broglie 关系：

$$
\bar\lambda
=\frac{\lambda}{2\pi}
=\frac{1}{k}
=\frac{1}{p},
$$

$$
\omega=E,
\qquad
E^2=p^2+m_0^2.
$$

Davisson-Germer 实验中，电子波长约为

$$
\lambda\sim0.11\,\mathrm{nm},
$$

原稿在此还记有 Davisson-Germer 实验所用电子的动能，单位为 $\mathrm{eV}$，但具体数值字迹不清。

与晶格尺度相当，满足

$$
\delta s=n\lambda
$$

时发生增强干涉，从而验证物质波。

#### 电子双缝干涉

电子双缝干涉中，单次结果随机；这种随机性与统计中的随机性不同。原稿以“布朗运动初态理论可解”作对照。这里用波函数

$$
\psi(\vec x,t)
$$

描述，并由 Born 规则给出

$$
|\psi|^2\longrightarrow\text{概率密度}.
$$

波函数给出概率振幅。

## 第二章：经典力学与对称性

先作物质波假设。在一维中，

$$
\psi(x,t)=\psi_0e^{ikx-i\omega t}
=\psi_0e^{ipx-iEt}.
$$

于是

$$
\frac{\partial\psi}{\partial x}=ip\psi,
\qquad
\frac{\partial\psi}{\partial t}=-iE\psi,
$$

即

$$
-i\frac{\partial}{\partial x}\sim k\sim p,
\qquad
i\frac{\partial}{\partial t}\sim\omega\sim E.
$$

这提示算符与物理量之间的对应关系。

经典力学系统中有没有这样的对应性？例如平移变换

$$
x\longrightarrow x+\varepsilon,
$$

$$
f(x+\varepsilon)
=f(x)+\varepsilon\frac{df}{dx}
=\left(1+\varepsilon\frac{d}{dx}\right)f(x).
$$

时间平移对应能量？空间平移对应动量？

问题：力学量与系统变换的对应。

$$
\text{力学量}\longleftrightarrow\text{变换／算符}.
$$

需要怎样的新力学，才能更自然地描写场与变换？

## 1.Lagrangian

$$
L(q,\dot q,t)=T-U,
$$

$$
p=\frac{\partial L}{\partial\dot q},
\qquad
F=\frac{\partial L}{\partial q}.
$$

由

$$
\delta\int L\,dt=0
$$

得到 Euler-Lagrange 方程

$$
\frac{d}{dt}\left(\frac{\partial L}{\partial\dot q}\right)
-\frac{\partial L}{\partial q}=0.
$$

#### 例：二维有心力

取

$$
U=-\frac{\alpha}{r},
$$

$$
x=r\cos\theta,
\qquad
y=r\sin\theta,
$$

$$
\dot x=\dot r\cos\theta-r\sin\theta\,\dot\theta,
\qquad
\dot y=\dot r\sin\theta+r\cos\theta\,\dot\theta.
$$

动能与 Lagrangian 为

$$
T=\frac{m}{2}(\dot r^2+r^2\dot\theta^2),
$$

$$
L=\frac{m}{2}(\dot r^2+r^2\dot\theta^2)+\frac{\alpha}{r}.
$$

Euler-Lagrange 方程给出

$$
m\ddot r=mr\dot\theta^2-\frac{\alpha}{r^2},
$$

而

$$
\frac{\partial L}{\partial\theta}=0
\quad\Longrightarrow\quad
\frac{\partial L}{\partial\dot\theta}
=mr^2\dot\theta
=\text{constant}.
$$

#### 例：LC 电路

$$
\mathcal E=-\ell\frac{dI}{dt},
$$

$$
W_\ell=\int\mathcal E I\,dt
=\frac12\ell I^2
=\frac12\ell\dot Q^2,
$$

$$
Q=CU,
\qquad
W_C=\int\frac{Q}{C}\,dQ
=\frac{Q^2}{2C}.
$$

因此

$$
L=\frac12\ell\dot Q^2-\frac{Q^2}{2C},
$$

$$
\frac{d}{dt}\left(\frac{\partial L}{\partial\dot Q}\right)
-\frac{\partial L}{\partial Q}=0
\quad\Longrightarrow\quad
\ell\ddot Q-\frac{Q}{C}=0.
$$

一般地，当

$$
\frac{\partial L}{\partial q_i}=0,
$$

就有

$$
\frac{\partial L}{\partial\dot q_i}=\text{constant}.
$$

## 2.Hamiltonian

如果

$$
\frac{\partial L}{\partial t}=0,
$$

定义

$$
H=\dot q\frac{\partial L}{\partial\dot q}-L
=p\dot q-L.
$$

对 $L(q,\dot q,t)$，

$$
\begin{aligned}
\frac{dH}{dt}
&=\dot p\dot q+p\ddot q
-\frac{\partial L}{\partial q}\dot q
-\frac{\partial L}{\partial\dot q}\ddot q
-\frac{\partial L}{\partial t}\\
&=-\frac{\partial L}{\partial t}.
\end{aligned}
$$

因而 $H$ 为常量；在通常情形下 $H=T+U$。

把 $H$ 看成 $H(q,p,t)$，有

$$
dH=\frac{\partial H}{\partial q}\,dq
+\frac{\partial H}{\partial p}\,dp
+\frac{\partial H}{\partial t}\,dt,
$$

同时由 Legendre 变换

$$
dH=\dot q\,dp-\frac{\partial L}{\partial q}\,dq
-\frac{\partial L}{\partial t}\,dt.
$$

比较得到 Hamilton 方程

$$
\dot p=-\frac{\partial H}{\partial q},
\qquad
\dot q=\frac{\partial H}{\partial p},
\qquad
\frac{\partial H}{\partial t}=-\frac{\partial L}{\partial t}.
$$

#### Poisson 括号

定义

$$
\{F,G\}
=\frac{\partial F}{\partial q_\ell}\frac{\partial G}{\partial p_\ell}
-\frac{\partial F}{\partial p_\ell}\frac{\partial G}{\partial q_\ell}.
$$

于是

$$
\dot p=\{p,H\}=-\frac{\partial H}{\partial q},
\qquad
\dot q=\{q,H\}=\frac{\partial H}{\partial p}.
$$

若 $f=f(q,p,t)$，则

$$
\frac{df}{dt}
=\frac{\partial f}{\partial t}
+\frac{\partial f}{\partial q}\dot q
+\frac{\partial f}{\partial p}\dot p
=\frac{\partial f}{\partial t}+\{f,H\}.
$$

并且

$$
\{f,p\}=\frac{\partial f}{\partial q},
\qquad
\{f,q\}=-\frac{\partial f}{\partial p},
\qquad
\{f,H\}=\frac{df}{dt}
$$

（当 $f$ 不显含时间）。基本括号为

$$
\{q_i,q_j\}=0,
\qquad
\{p_i,p_j\}=0,
\qquad
\{q_i,p_j\}=\delta_{ij}.
$$

Poisson 括号满足

$$
\{f,g\}=-\{g,f\},
$$

$$
\{f,g+h\}=\{f,g\}+\{f,h\},
$$

$$
\{f,gh\}=\{f,g\}h+g\{f,h\},
$$

以及 Jacobi 恒等式

$$
\{f,\{g,h\}\}
+\{g,\{h,f\}\}
+\{h,\{f,g\}\}=0.
$$

#### 例：简谐振子与自由粒子

对

$$
L=\frac12m\dot q^2-\frac12kq^2,
$$

有

$$
p=m\dot q,
\qquad
\dot q=\frac{p}{m},
$$

$$
H(q,p)=p\dot q-L
=\frac{p^2}{2m}+\frac12kq^2.
$$

由 Poisson 括号，

$$
\dot p
=\left\{p,\frac{p^2}{2m}+\frac12kq^2\right\}
=-kq,
$$

$$
\dot q
=\left\{q,\frac{p^2}{2m}\right\}
=\frac{p}{m},
$$

所以

$$
m\ddot q+kq=0.
$$

若 $\partial L/\partial t=0$，则

$$
\frac{dH}{dt}=0,
\qquad
H=\text{const},
\qquad
\frac{\partial H}{\partial t}=\{H,H\}=0.
$$

对自由粒子

$$
H=\frac{p^2}{2m},
$$

若

$$
\frac{\partial H}{\partial q}=0,
$$

则

$$
\frac{dp}{dt}=\{p,H\}=-\frac{\partial H}{\partial q}=0.
$$

### 系统的变换性质

#### 电磁场中的粒子

Lorentz 力为

$$
\vec F=e(\vec E+\vec v\times\vec B),
$$

其中

$$
\vec B=\nabla\times\vec A,
\qquad
\vec E=-\nabla\phi-\frac{\partial\vec A}{\partial t}.
$$

因此

$$
\vec F
=e\left[-\nabla\phi-\frac{\partial\vec A}{\partial t}
+\vec v\times(\nabla\times\vec A)\right].
$$

指标计算给出

$$
[\vec v\times(\nabla\times\vec A)]_i
=v_j\left(\frac{\partial A_j}{\partial x_i}
-\frac{\partial A_i}{\partial x_j}\right).
$$

取 Lagrangian

$$
L=\sum_i\frac12m\dot x_i^2-e\phi+e\dot x_jA_j(x).
$$

正则动量为

$$
p_i=\frac{\partial L}{\partial\dot x_i}
=m\dot x_i+eA_i,
$$

即

$$
\vec p=m\vec v+e\vec A.
$$

Euler-Lagrange 方程给出

$$
\frac{d}{dt}\left(\frac{\partial L}{\partial\dot x_i}\right)
-\frac{\partial L}{\partial x_i}
=m\ddot x_i
+e\frac{dA_i}{dt}
+e\frac{\partial\phi}{\partial x_i}
-e\dot x_j\frac{\partial A_j}{\partial x_i}=0,
$$

其中

$$
e\frac{dA_i}{dt}-e\dot x_j\frac{\partial A_j}{\partial x_i}
=e\frac{\partial A_i}{\partial t}
+e\dot x_j\left(
\frac{\partial A_i}{\partial x_j}
-\frac{\partial A_j}{\partial x_i}
\right).
$$

#### 规范变换

取 gauge transformation

$$
\vec A\longrightarrow\vec A'=\vec A+\nabla\lambda.
$$

因为

$$
\nabla\times(\nabla\lambda)=0,
$$

$\vec B$ 不变。再取

$$
\phi\longrightarrow\phi'=\phi-\frac{\partial\lambda}{\partial t},
$$

则 $\vec E$ 也不变。因此规范变换为

$$
\begin{cases}
\vec A'=\vec A+\nabla\lambda,\\
\phi'=\phi-\dfrac{\partial\lambda}{\partial t},
\end{cases}
\qquad
\vec E,\vec B\ \text{不变}.
$$

在

$$
L=-e\phi+e\vec v\cdot\vec A
$$

中代入规范变换，

$$
\begin{aligned}
L'
&=-e\left(\phi-\frac{\partial\lambda}{\partial t}\right)
+e\vec v\cdot(\vec A+\nabla\lambda)\\
&=L+e\frac{\partial\lambda}{\partial t}
+e\vec v\cdot\nabla\lambda\\
&=L+e\frac{d\lambda}{dt}.
\end{aligned}
$$

也就是说，规范变换使 Lagrangian 相差一个全导数。

更一般地，

$$
L(q,\dot q,t)
\longrightarrow
L'=L+\frac{df(q,t)}{dt}.
$$

有

$$
p'=\frac{\partial L'}{\partial\dot q}
=\frac{\partial L}{\partial\dot q}
+\frac{\partial f}{\partial q},
$$

$$
\frac{\partial L'}{\partial q}
=\frac{\partial L}{\partial q}
+\frac{\partial^2f}{\partial t\partial q}
+\frac{\partial^2f}{\partial q^2}\dot q,
$$

$$
\frac{d}{dt}p'
=\frac{d}{dt}\left(\frac{\partial L}{\partial\dot q}\right)
+\frac{d}{dt}\left(\frac{\partial f}{\partial q}\right).
$$

后两项恰好对应，所以 Euler-Lagrange 方程在这种变换下不变。

这再次提示

$$
\frac{df}{dt}=\{f,H\},
\qquad
\frac{\partial f}{\partial q}=\{f,p\},
\qquad
-\frac{\partial f}{\partial p}=\{f,q\},
$$

以及

$$
\frac{\partial}{\partial t}\sim H,
\qquad
\frac{\partial}{\partial x}\sim p.
$$

## 3.正则变换与辛结构

对 $2n$ 维相空间中的 Hamiltonian

$$
H(q_1,\ldots,q_n,p_1,\ldots,p_n),
$$

考虑坐标变换

$$
(q_i,p_i)\longrightarrow(Q_i,P_i),
$$

其中 $Q=Q(q,p)$、$P=P(q,p)$。

写

$$
X=
\begin{pmatrix}
q_1\\
\vdots\\
q_n\\
p_1\\
\vdots\\
p_n
\end{pmatrix},
\qquad
B=
\begin{pmatrix}
0&I\\
-I&0
\end{pmatrix},
$$

则 Hamilton 方程可以写成

$$
\dot X=B\frac{\partial H}{\partial X}.
$$

令

$$
y=
\begin{pmatrix}
Q(q,p)\\
P(q,p)
\end{pmatrix},
\qquad
J=\frac{\partial y}{\partial X},
$$

则

$$
\dot y
=J\dot X
=JB\frac{\partial H}{\partial X}
=JBJ^T\frac{\partial H}{\partial y}.
$$

要让新变量仍满足同一形式的 Hamilton 方程，需要

$$
JBJ^T=B.
$$

在一自由度情形，矩阵乘积把条件写成

$$
\{Q,Q\}=0,
\qquad
\{P,P\}=0,
\qquad
\{Q,P\}=1.
$$

一般地，正则变换要求

$$
\{Q_i,Q_j\}=0,
\qquad
\{P_i,P_j\}=0,
\qquad
\{Q_i,P_j\}=\delta_{ij}.
$$

本质上是在保证 Poisson 括号结构不变。

#### 无穷小正则变换与生成函数

取

$$
Q_i=q_i+\delta q_i
=q_i+\varepsilon F_i(q,p),
$$

$$
P_i=p_i+\delta p_i
=p_i+\varepsilon G_i(q,p).
$$

保留 $\varepsilon$ 的一阶项，并要求

$$
\delta_{ij}=\{Q_i,P_j\},
$$

得到

$$
\varepsilon\left(
\frac{\partial F_i}{\partial q_j}
+\frac{\partial G_j}{\partial p_i}
\right)=0,
$$

即

$$
\frac{\partial F_i}{\partial q_j}
=-\frac{\partial G_j}{\partial p_i}.
$$

变换可由生成函数 $g(q,p)$ 生成：

$$
F_i=\frac{\partial g}{\partial p_i},
\qquad
G_i=-\frac{\partial g}{\partial q_i}.
$$

于是

$$
q_i\longrightarrow Q_i
=q_i+\varepsilon\frac{\partial g}{\partial p_i},
$$

$$
p_i\longrightarrow P_i
=p_i-\varepsilon\frac{\partial g}{\partial q_i}.
$$

这个变换保持

$$
\{Q_i,P_j\}=\delta_{ij}.
$$

#### 三个生成元例子

1. $g=H$：时间平移。

$$
q_i\longrightarrow q_i+\varepsilon\frac{\partial H}{\partial p_i}
=q_i+\varepsilon\frac{dq_i}{dt},
$$

$$
p_i\longrightarrow p_i-\varepsilon\frac{\partial H}{\partial q_i}
=p_i+\varepsilon\frac{dp_i}{dt},
$$

$$
t\longrightarrow t+\varepsilon,
\qquad
f(t+\varepsilon)=f(t)+\varepsilon\frac{df}{dt}.
$$

2. $g=p_x$：$x$ 方向的空间平移。

$$
x\longrightarrow x+\varepsilon\frac{\partial p_x}{\partial p_x}=x+\varepsilon,
$$

$$
y\longrightarrow y+\varepsilon\frac{\partial p_x}{\partial p_y}=y,
$$

$$
p_x\longrightarrow p_x-\varepsilon\frac{\partial p_x}{\partial x}=p_x,
\qquad
p_y\longrightarrow p_y-\varepsilon\frac{\partial p_x}{\partial y}=p_y.
$$

3. $g=J_z=xp_y-yp_x$：平面转动。

$$
x\longrightarrow x+\varepsilon\frac{\partial g}{\partial p_x}=x-\varepsilon y,
$$

$$
y\longrightarrow y+\varepsilon\frac{\partial g}{\partial p_y}=y+\varepsilon x,
$$

$$
p_x\longrightarrow p_x-\varepsilon\frac{\partial g}{\partial x}=p_x-\varepsilon p_y,
$$

$$
p_y\longrightarrow p_y-\varepsilon\frac{\partial g}{\partial y}=p_y+\varepsilon p_x.
$$

相应地，

$$
\begin{pmatrix}p_x\\p_y\end{pmatrix}
\longrightarrow
\left[I+\varepsilon
\begin{pmatrix}0&-1\\1&0\end{pmatrix}
\right]
\begin{pmatrix}p_x\\p_y\end{pmatrix},
$$

$$
\begin{pmatrix}x\\y\end{pmatrix}
\longrightarrow
\left[I+\varepsilon
\begin{pmatrix}0&-1\\1&0\end{pmatrix}
\right]
\begin{pmatrix}x\\y\end{pmatrix}.
$$

记

$$
\Xi=
\begin{pmatrix}0&-1\\1&0\end{pmatrix}.
$$

有限角度转动可由无穷多个无穷小转动得到：

$$
\lim_{N\to\infty}
\left(I+\frac{\phi}{N}\Xi\right)^N
=e^{\phi\Xi}.
$$

因为

$$
\Xi^2=-I,
\qquad
\Xi^4=I,
$$

所以

$$
e^{\phi\Xi}
=\cos\phi\,I+\sin\phi\,\Xi
=\begin{pmatrix}
\cos\phi&-\sin\phi\\
\sin\phi&\cos\phi
\end{pmatrix}.
$$

若变换不改变 Hamiltonian，

$$
\delta H=0,
$$

则生成元满足

$$
\frac{dg}{dt}=0.
$$

因为

$$
\begin{aligned}
\delta H
&=\frac{\partial H}{\partial q_i}\delta q_i
+\frac{\partial H}{\partial p_i}\delta p_i\\
&=\varepsilon\frac{\partial H}{\partial q_i}\frac{\partial g}{\partial p_i}
-\varepsilon\frac{\partial H}{\partial p_i}\frac{\partial g}{\partial q_i}\\
&=\varepsilon\{H,g\}.
\end{aligned}
$$

所以 $g$ 为常量。这里要求了g不显含时间。

### 共轭角动量之间的 Poisson 括号

定义

$$
J_x=yp_z-zp_y,
\qquad
J_y=zp_x-xp_z,
\qquad
J_z=xp_y-yp_x.
$$

例如

$$
\begin{aligned}
\{J_x,J_y\}
&=\{yp_z-zp_y,zp_x-xp_z\}\\
&=\{yp_z,zp_x\}-\{zp_y,zp_x\}
-\{yp_z,xp_z\}+\{zp_y,xp_z\}\\
&=-yp_x+xp_y\\
&=J_z\ne0.
\end{aligned}
$$

循环置换得到

$$
\{J_i,J_j\}=\varepsilon_{ijk}J_k.
$$

这与

$$
\{p_x,p_y\}=0,
\qquad
\{p_y,p_z\}=0,
\qquad
\{p_z,p_x\}=0
$$

不同。角动量生成三维转动，其变换结构不再彼此独立。

## 4.Noether's Theorem

变换的不变性对应守恒量：

$$
\begin{array}{c|c}
g&\text{变换}\\
\hline
H&\text{时间平移}\\
p_x&\text{空间平移}\\
J_z=xp_y-yp_x&\text{转动}
\end{array}
$$

用 Lagrangian 力学证明 Noether's theorem。考虑坐标变换

$$
q_i(t)\longrightarrow Q_i(s,t),
$$

其中 $s\in\mathbb R$ 为变换参数，并且

$$
Q_i(0,t)=q_i(t).
$$

如果 Lagrangian 在该连续对称性下不变，即

$$
\frac{d}{ds}L[Q_i(s,t),\dot Q_i(s,t)]=0,
$$

则总可以找到一个守恒量。对 $s$ 求导：

$$
\frac{\partial L}{\partial Q_i}\frac{\partial Q_i}{\partial s}
+\frac{\partial L}{\partial\dot Q_i}\frac{\partial\dot Q_i}{\partial s}.
$$

在 $s=0$ 处使用 Euler-Lagrange 方程，

$$
\begin{aligned}
\left.\frac{\partial L}{\partial s}\right|_{s=0}
&=\frac{d}{dt}\left(\frac{\partial L}{\partial\dot q_i}\right)
\frac{\partial Q_i}{\partial s}
+\frac{\partial L}{\partial\dot q_i}
\frac{d}{dt}\left(\frac{\partial Q_i}{\partial s}\right)\\
&=\frac{d}{dt}\left(
\frac{\partial L}{\partial\dot q_i}
\frac{\partial Q_i}{\partial s}
\right)=0.
\end{aligned}
$$

因此

$$
\frac{\partial L}{\partial\dot q_i}
\frac{\partial Q_i}{\partial s}
$$

为常数。

### 角动量守恒与三维转动

角动量守恒的例子：

$$
\{p_x^2+p_y^2,J_z\}=0,
$$

$$
\left\{\frac{1}{\sqrt{x^2+y^2}},J_z\right\}=0.
$$

令

$$
u=\frac{1}{r},
$$

则

$$
\left\{J_z,\frac{p^2}{2m}+u\right\}
=0
=\frac{dJ_z}{dt}.
$$

三维转动的三个生成元写成

$$
G_1=yp_z-zp_y,
\qquad
G_2=zp_x-xp_z,
\qquad
G_3=xp_y-yp_x.
$$

于是

$$
x\longrightarrow x
+\varepsilon_1\frac{\partial G_1}{\partial p_x}
+\varepsilon_2\frac{\partial G_2}{\partial p_x}
+\varepsilon_3\frac{\partial G_3}{\partial p_x}
=x+\varepsilon_2z-\varepsilon_3y,
$$

$$
y\longrightarrow y-\varepsilon_1z+\varepsilon_3x,
$$

$$
z\longrightarrow z+\varepsilon_1y-\varepsilon_2x.
$$

对应的无穷小旋转矩阵为

$$
A_1=
\begin{pmatrix}
0&0&0\\
0&0&-1\\
0&1&0
\end{pmatrix},
\qquad
A_2=
\begin{pmatrix}
0&0&1\\
0&0&0\\
-1&0&0
\end{pmatrix},
$$

$$
A_3=
\begin{pmatrix}
0&-1&0\\
1&0&0\\
0&0&0
\end{pmatrix}.
$$

因此

$$
\begin{pmatrix}x\\y\\z\end{pmatrix}
\longrightarrow
\left(I+\sum_a\varepsilon_aA_a\right)
\begin{pmatrix}x\\y\\z\end{pmatrix}.
$$

$A_a$ 是 $SO(3)$ 的无穷小旋转生成矩阵；$J_a$ 是相空间中的旋转生成元。对任意向量，

$$
\vec v' = \vec v+\vec\varepsilon\times\vec v.
$$

相空间变量相应地变换为

$$
Q_i=q_i+\left(\sum_a\varepsilon_aA_a\right)_{ij}q_j,
$$

$$
P_i=p_i+\left(\sum_a\varepsilon_aA_a\right)_{ij}p_j.
$$

这些矩阵的对易关系为

$$
[A_x,A_y]=A_xA_y-A_yA_x=A_z,
$$

一般地

$$
[A_i,A_j]=\varepsilon_{ijk}A_k.
$$

这与角动量的 Poisson 括号一致：

$$
\{J_i,J_j\}=\varepsilon_{ijk}J_k.
$$

并且

$$
\{J^2,J_i\}=0,
\qquad
\{p^2,J_i\}=0.
$$
