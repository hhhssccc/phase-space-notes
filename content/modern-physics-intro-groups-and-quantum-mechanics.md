---
title: 《近代物理导论》听课笔记2：从群论到量子力学
description: 从 Klein 的 Erlangen 纲领和 Lie 群出发，经由 SO(3) 与 SU(2) 进入量子力学，并整理了势阱、费米球、散射、Hilbert 空间、测量与时间演化。
date: 2026-09-01
type: note
category: 量子力学
tags:
  - Lie 群
  - SU(2)
  - Schrödinger 方程
  - Hilbert 空间
  - 散射
  - 近代物理导论笔记系列
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes: []
---

<figure class="lead-figure">
  <img src="../../figures/modern-physics-intro-groups-and-quantum-mechanics/lead.png?v=1" alt="浅蓝背景中，一位蓝发、身着深蓝白色服装的动漫人物侧身托腮" width="1536" height="1024" loading="eager" decoding="async" />
</figure>

几个结果：

$$
\left\{J_i,J^2\right\}=0,
$$

$$
\left\{p^2,J_x\right\}=0
$$
## 群与不变量

接下来进入群论部分，从不变量视角，由生成元导出李群。

群：

1. 乘法封闭；
2. 结合；
3. $\exists e$；
4. $\exists a^{-1}$。

F. Klein $\longrightarrow$ Erlangen Program：

> “从几何中看群”

找变换群的不变量。
### $SO(2)$
例如，内积 $|V|^2$：

$$
E_2=|V|^2=V^T V.
$$

$$
V\longrightarrow V'=\hat R V,
$$

$$
V'^T V'=V^T R^T R V.
$$

所以

$$
R^T R=1,
$$

$$
E_2\sim SO(2),
\qquad
\det R=+1.
$$

无穷小变换：

$$
\hat R(\delta)=1+\delta.
$$

$$
R^T R=(1+\delta^T)(1+\delta)
=1+\delta^T+\delta+\delta^T\delta=1.
$$

保留一阶：

$$
\delta^T=-\delta,
$$

即反对称。

$$
\delta
=\epsilon
\begin{pmatrix}
0&-1\\
1&0
\end{pmatrix}
=\epsilon\hat X.
$$

$$
\hat X=\left.\frac{d g(\phi)}{d\phi}\right|_{\phi=0},
$$

也即生成元。


### $SO(1,1)$

例如 $SO(1,1)$：

$$
|V|^2=v_1^2-v_2^2
=(v_1,v_2)
\begin{pmatrix}
1&0\\
0&-1
\end{pmatrix}
\begin{pmatrix}
v_1\\v_2
\end{pmatrix}
=V^TgV,
$$

其中 $g$ 是 metric。

$$
ds^2=dx^2+dy^2+dz^2-dt^2,
\qquad SO(3,1).
$$

$$
R^TgR=g,
$$

$$
R^Tg=gR^{-1}.
$$

取

$$
R=1+\delta,
$$

则

$$
\delta^Tg+g\delta=0.
$$

$$
\delta
=\epsilon
\begin{pmatrix}
0&1\\
1&0
\end{pmatrix}
=\epsilon\hat X.
$$

$$
\lim_{N\to\infty}
\left(1+\frac{\phi}{N}\hat X\right)^N
=e^{\phi\hat X}
=
\begin{pmatrix}
\cosh\phi&\sinh\phi\\
\sinh\phi&\cosh\phi
\end{pmatrix}.
$$

不变量 $\longrightarrow$ 空间几何 $\longrightarrow$ 转动。
## 李群
李群是一个有群结构的微分流形。

一个性质就是可以对它做 Taylor 展开。
列举几个性质：

1.

$$
g(\alpha)g(\beta)=g[f(\alpha,\beta)].
$$

若 $\alpha$ 或 $\beta=0$，则

$$
f(0,\alpha)=f(\alpha,0)=\alpha.
$$

2.定义
$$
g(\alpha)^{-1}=g(\alpha^{-1}),
$$

$$
g(\alpha)g(\alpha^{-1})=g(0)=1.
$$

3. Taylor 展开：

$$
g(\alpha)
=g(0)
+\alpha_i\left.\frac{\partial g}{\partial\alpha_i}\right|_{\alpha=0}
+\frac12\alpha_i\alpha_j
\left.\frac{\partial^2g}{\partial\alpha_i\partial\alpha_j}\right|_{\alpha=0}
+\cdots
$$

$$
=1+\alpha_iX_i+\frac12\alpha_i\alpha_jY_{ij}+\cdots.
$$



由

$$
1=g(\alpha)g(\alpha)^{-1}
$$

得

$$
g(\alpha)^{-1}
=1-\alpha_iX_i
+\alpha_i\alpha_jX_iX_j
-\frac12\alpha_i\alpha_jY_{ij}
+\cdots.
$$

由封闭性：

$$
g(\beta)^{-1}g(\delta)^{-1}g(\beta)g(\delta)
=\text{某一个 }g(\alpha').
$$

$$
[X_i,X_j]=C_{kij}X_k.
$$

$C_{kij}$：结构常数；$X_k$：生成元。

例如 $SO(3)$：结构常数为 $\epsilon_{ijk}$。

生成元 $\longrightarrow$ 无穷小变换 $\longrightarrow$ 有限参数变换。

李代数 $\longrightarrow$ 李群。

非 Abelian：

$$
e^Xe^Y=e^{X+Y+\frac12[X,Y]+\cdots}
$$

（BCH 公式）。

对于 $SO(3)$，

$$
|V|^2=V^TV,
$$

$$
\hat R=I+\delta_\alpha\bar X_\alpha,
$$

$$
(\delta_\alpha\bar X_\alpha)^T
=-\delta_\alpha\bar X_\alpha.
$$

三个生成元：

$$
\bar X_1=
\begin{pmatrix}
0&0&0\\
0&0&1\\
0&-1&0
\end{pmatrix},
\qquad
\bar X_2=
\begin{pmatrix}
0&0&-1\\
0&0&0\\
1&0&0
\end{pmatrix},
$$

$$
\bar X_3=
\begin{pmatrix}
0&1&0\\
-1&0&0\\
0&0&0
\end{pmatrix}.
$$

也可以写成 $J_i$：

$$
X_i=i\hat J_i,
$$

$$
\hat J_i=-iX_i.
$$

$$
(J_i)^\dagger=i(X_i)^T=-iX_i=J_i,
$$

$\Rightarrow$ 厄米的。



$$
[J_i,J_j]
=[-iX_i,-iX_j]
=\epsilon_{ijk}X_k
=i\epsilon_{ijk}J_k
\qquad\longrightarrow\qquad SO(3).
$$

### Eulerian Angle

$$
R(\alpha,\beta,\gamma)
=R_z(\gamma)R_y(\beta)R_z(\alpha),
$$

$$
=e^{i\gamma J_z}e^{i\beta J_y}e^{i\alpha J_z}.
$$

###  $SU(2)$

$$
\mathbb C^2\longrightarrow
\xi=
\begin{pmatrix}
\xi_1\\
\xi_2
\end{pmatrix},
\qquad
\xi_1,\xi_2\in\mathbb C.
$$

$$
\xi\longrightarrow\xi'=U\xi.
$$

$$
\xi'^\dagger\xi'
=\xi^\dagger U^\dagger U\xi
=|\xi|^2,
$$

所以

$$
U^\dagger U=1,
$$

即幺正变换。

$$
\xi^\dagger=(\xi_1^*,\xi_2^*).
$$

$\xi^\dagger\xi$ 为纯数变换不变量。

$$
\xi\xi^\dagger
\longrightarrow
U\xi\xi^\dagger U^\dagger,
$$

不是不变量；但

$$
|\xi\xi^\dagger|
=\det(U\xi\xi^\dagger U^\dagger)
$$

不变。

导出 $U$ 阵：

$$
U(1)=e^{i\alpha}.
$$



一个简单情形：

$$
U=e^{iD},
$$

$D$ 为实对角阵。

$$
e^{iD}
=\sum_{n=0}^{\infty}\frac1{n!}(iD)^n
=
\begin{pmatrix}
e^{ih_1}&0\\
0&e^{ih_2}
\end{pmatrix},
$$

其中

$$
D=
\begin{pmatrix}
h_1&0\\
0&h_2
\end{pmatrix}.
$$

$$
U^\dagger
=\left[\sum_{n=0}^{\infty}\frac{i^n}{n!}D^n\right]^*
=\sum_{n=0}^{\infty}\frac{(-i)^n}{n!}D^n
=e^{-iD}.
$$

定理：厄米阵可以经幺正变换到实对角阵。

$$
H=UDU^\dagger,
$$

$$
U^\dagger H U=D,
$$

$$
(U^\dagger H U)^n=U^\dagger H^nU.
$$



所以

$$
U=e^{iH},
\qquad
U^\dagger=e^{-iH^\dagger}=e^{-iH}.
$$

行列式在相似变换下不变：

$$
\det U
=\det e^{iD}
=e^{ih_1}e^{ih_2}
=e^{i\operatorname{Tr}D}.
$$

对于 $SU(2)$，

$$
\det U=1,
\qquad
\operatorname{Tr}D=0
\Rightarrow
\operatorname{Tr}H=0,
$$

无迹。

$$
U^\dagger U=1.
$$

取

$$
U=1+\epsilon,
$$

则

$$
\epsilon^\dagger=-\epsilon,
$$

反厄米。

无迹 $+$ 反厄米：

$$
\epsilon=\delta_iX_i,
\qquad
X_i=i\sigma_i,
$$

$$
\epsilon=i\sum_i\delta_i\sigma_i
=
\begin{pmatrix}
i\delta_3&\delta_2+i\delta_1\\
-\delta_2+i\delta_1&-i\delta_3
\end{pmatrix}.
$$

### Pauli matrices

$$
\sigma_1=
\begin{pmatrix}
0&1\\
1&0
\end{pmatrix},
\qquad
\sigma_2=
\begin{pmatrix}
0&-i\\
i&0
\end{pmatrix},
\qquad
\sigma_3=
\begin{pmatrix}
1&0\\
0&-1
\end{pmatrix}.
$$

$$
[\sigma_i,\sigma_j]=2i\epsilon_{ijk}\sigma_k.
$$

$$
\left[\frac{\sigma_i}{2},\frac{\sigma_j}{2}\right]
=i\epsilon_{ijk}\frac{\sigma_k}{2}.
$$

$$
\{\sigma_i,\sigma_j\}
=\sigma_i\sigma_j+\sigma_j\sigma_i
=2\delta_{ij}.
$$

所以

$$
\sigma_i\sigma_j
=\delta_{ij}+i\epsilon_{ijk}\sigma_k.
$$

$$
(\vec\sigma\cdot\vec A)(\vec\sigma\cdot\vec B)
=\sigma_iA_i\sigma_jB_j
$$

$$
=\delta_{ij}A_iB_j+i\sigma_k\epsilon_{ijk}A_iB_j
$$

$$
=\vec A\cdot\vec B+i\vec\sigma\cdot(\vec A\times\vec B).
$$

$SU(2)$ 与 $SO(3)$ 的李代数同构：

$$
\mathfrak{su}(2)\cong\mathfrak{so}(3).
$$

群层面，$SU(2)$ 是 $SO(3)$ 的二重覆盖，二者不同构。


$$
SO(3):
\qquad
[J_i,J_j]=i\epsilon_{ijk}J_k.
$$

$$
SO(2)\sim U(1)\sim e^{i\alpha}
\qquad\text{圆群}.
$$

$$
SU(2):
\qquad
\left[\frac{\sigma_i}{2},\frac{\sigma_j}{2}\right]
=i\epsilon_{ijk}\frac{\sigma_k}{2}.
$$

### $SO(N)$ 与 $SU(N)$

$SO(N)$：生成元$N\times N$ 实反对称，

$$
X^T=-X.
$$

独立参数：

$$
\frac{N(N-1)}{2}
\qquad
(\text{对角元为 }0),
$$

即生成元数／李群维数。

$SU(N)$：生成元$N\times N$ 复反厄米，

$$
\epsilon^\dagger=-\epsilon.
$$

独立参数：

$$
2N^2-N^2-1=N^2-1.
$$

反厄米每一项对应一个约束，减少了$N^2$个自由参数
无迹减少一个自由参数

## 量子力学

接下来进入量子力学部分，公理化地快速进入 QM。

以下取 $\hbar=1$。

$$
v_{\mathrm{phase}}
=\frac{\omega}{k}
$$
eg.粒子
$$
\frac{p^2/(2m)}{p}
=\frac{p}{2m}.
$$

相速度一般不传递信息，且不等同于波前速度。

$$
v_{\mathrm{group}}
=\frac{d\omega}{dk}
=\frac{p}{m}.
$$

传递信息；波包中心速度。

自由粒子：

$$
\psi=e^{ikx-i\omega t}=e^{ipx-iEt}.
$$

$$
\frac{\partial}{\partial x}\psi=ip\psi,
\qquad
\frac1i\frac{\partial}{\partial x}\sim p.
$$

$$
\frac{\partial}{\partial t}\psi=-iE\psi,
\qquad
i\frac{\partial}{\partial t}\sim E\sim H.
$$

$$
H=\frac{p^2}{2m}.
$$

$$
i\partial_t\psi(x,t)
=-\frac1{2m}\nabla^2\psi(x,t).
$$

令

$$
\psi(x,t)=f(t)\phi(x),
$$

则

$$
i\frac1{f(t)}\partial_tf(t)
=-\frac1{2m}\frac1{\phi(x)}\partial_x^2\phi(x)
=E.
$$

$$
f(t)=Ae^{-iEt},
$$

$$
\phi(x)
=Ae^{i\sqrt{2mE}\,x}
+Be^{-i\sqrt{2mE}\,x}.
$$

对照波动方程：

$$
\nabla^2\psi(x,t)
-\frac1{u^2}\frac{\partial^2}{\partial t^2}\psi(x,t)
=0,
$$

其中 $u$ 为相速度。



有相互作用：

$$
p=\sqrt{2m(E-V)}.
$$

$$
v_{\mathrm{phase}}
=\frac{\omega}{\sqrt{2m(\omega-V)}},
$$

$$
v_{\mathrm{group}}
=\sqrt{\frac2m}\sqrt{\omega-V}.
$$

设时间可分：

$$
\psi=e^{-i\omega t}\phi(x).
$$

把 $v_{\mathrm{phase}}$ 代入波动方程：

$$
e^{-i\omega t}\nabla^2\phi
-\frac{2m(\omega-V)}{\omega^2}
(-\omega^2)\phi e^{-i\omega t}
=0.
$$

所以

$$
i\partial_t\psi
=\left[-\frac1{2m}\nabla^2+V\right]\psi,
$$

括号内为 $\hat H$。

这不是推导，而是说明 Schrödinger eq 与物质波相容。

德布罗意物质波
$\longrightarrow$
相速度
$\longrightarrow$
代入波动 eq
$\longrightarrow$
Schrödinger eq。

> [!question]
> $\psi(x,t)$ 是什么？


$\longrightarrow$统计诠释

$$
\psi^*\,i\partial_t\psi=\psi^*\hat H\psi,
$$

$$
-i\psi\,\partial_t\psi^*=\psi\hat H\psi^*.
$$

于是

$$
i\left[\psi^*\partial_t\psi+\psi\partial_t\psi^*\right]
=i\partial_t(\psi^*\psi)
$$

$$
=-\frac1{2m}
\left(\psi^*\nabla^2\psi-\psi\nabla^2\psi^*\right).
$$

$$
\partial_t(\psi^*\psi)
+\nabla\cdot
\left[
-\frac{i}{2m}
(\psi^*\nabla\psi-\psi\nabla\psi^*)
\right]
=0.
$$

$$
\rho=\psi^*\psi
\qquad\text{概率密度},
$$

$$
\vec J
=-\frac{i}{2m}
(\psi^*\nabla\psi-\psi\nabla\psi^*)
\qquad\text{概率流}.
$$

概率流守恒。

例如自由粒子

$$
\psi=e^{ikx},
$$

$$
J=-\frac{i}{2m}\cdot 2ik
=\frac{p}{m}
=v.
$$



### argue

1. 线性：

$$
\psi=c_1\psi_1+c_2\psi_2
$$

也是解。

2. $P$ 幺正不变：

$$
\psi\longrightarrow e^{i\alpha}\psi,
\qquad
P\text{ 不变}.
$$

3. <!-- -->

$$
\psi(x)
=\frac1{\sqrt{2\pi}}
\int_{-\infty}^{\infty}
e^{ipx}\psi(p)\,dp,
$$

$$
\psi(p)
=\frac1{\sqrt{2\pi}}
\int_{-\infty}^{\infty}
e^{-ipx}\psi(x)\,dx.
$$

我们讨论的问题可以分为束缚态和散射问题

<figure class="figure-light figure-diagram">
  <img src="../../figures/modern-physics-intro-groups-and-quantum-mechanics/state_and_scattering_models.png" alt="六联图展示束缚态、散射、有限方势垒、三维箱子、库仑散射和有限程散射" width="2800" height="1800" loading="lazy" decoding="async" />
</figure>

自由粒子：

$$
e^{ikx},
$$

$$
\iiint e^{ikx}\cdot e^{-ikx}=\infty\times.
$$


可以认为是测量没有相互作用导致了这个问题！

### 无限深势阱

$$
U(x)=
\begin{cases}
0,&x\in(0,L),\\
\infty,&x\le 0\text{ 或 }x\ge L.
\end{cases}
$$


<figure class="figure-light figure-diagram">
  <img src="../../figures/modern-physics-intro-groups-and-quantum-mechanics/infinite_square_well.png" alt="一维无限深势阱及 E1、4E1、9E1 三条能级" width="2400" height="1440" loading="lazy" decoding="async" />
</figure>

$$
\left[-\frac1{2m}\partial_x^2+U\right]\phi(x)
=E\phi(x).
$$

在势阱外：

$$
\partial_x^2\phi(x)-k^2\phi(x)=0,
$$

$$
k^2=2m(U-E),
$$

$$
k=\sqrt{2m(U-E)}
\qquad\text{取正}.
$$

$$
\phi(x)=\alpha e^{kx}+\beta e^{-kx}.
$$

当

$$
U\to\infty,
\qquad
k\to\infty,
\qquad
x\to\infty,
$$

$\phi$ 不归一，因此

$$
\alpha=0.
$$



中间 $U=0$：

$$
\partial_x^2\phi+2mE\phi=0,
$$

$$
\phi=Ae^{ikx}+Be^{-ikx},
\qquad
k=\sqrt{2mE}.
$$

边界条件：

$$
\phi(0)=\phi(L)=0.
$$

分立取值：

$$
k_n=\frac{n\pi}{L},
$$

$$
\phi_n=2A\sin k_nx,
$$

$$
A=\frac1{\sqrt{2L}}.
$$

$$
E_n
=\frac1{2m}\left(\frac{n\pi}{L}\right)^2
=E_1n^2.
$$



也可以用驻波方法：

$$
k=\frac{n\pi}{L}.
$$

应用：

- Debye 固体比热；
- 原子核系统；
- 费米气体模型。



## 3D 无限深势阱



<figure class="figure-light figure-diagram">
  <img src="../../figures/modern-physics-intro-groups-and-quantum-mechanics/box_and_k_lattice.png" alt="三维无限深势阱与间距为 π/l0 的 k 空间点阵" width="2800" height="1520" loading="lazy" decoding="async" />
</figure>

$$
E_n=\frac{k_n^2}{2m}
=\frac{\pi^2n^2}{2ml^2}.
$$

$$
\nabla^2=\partial_x^2+\partial_y^2+\partial_z^2.
$$

$$
l_x=l_y=l_z=l_0,
$$

$$
x,y,z\in(0,l_0)
\qquad\longrightarrow\qquad
V=0.
$$

$$
-\frac1{2m}\nabla^2\phi(x,y,z)
=E\phi(x,y,z).
$$

$x,y,z$ 方向可分。

$$
\phi(x,y,z)
=\phi_x(x)\phi_y(y)\phi_z(z).
$$

$$
E
=\sum_{i=x,y,z}\frac{p_i^2}{2m}
=E_x+E_y+E_z.
$$

$$
\phi(x,y,z)
\propto
\sin\left(\frac{n_x\pi}{l_x}x\right)
\sin\left(\frac{n_y\pi}{l_y}y\right)
\sin\left(\frac{n_z\pi}{l_z}z\right).
$$

当 $l_x=l_y=l_z=l_0$ 时，

$$
E_n
=\frac1{2m}
\left(\frac{\pi}{l_0}\right)^2
(n_x^2+n_y^2+n_z^2).
$$

$$
\phi_{112},\ \phi_{211},\ \phi_{121}
$$

能量相同，导致简并性。

### Fermi sphere

多粒子 $\longrightarrow$ $\frac{1}{8}$球。



<figure class="figure-light figure-diagram">
  <img src="../../figures/modern-physics-intro-groups-and-quantum-mechanics/fermi_sphere.png" alt="第一卦限中的八分之一费米球、费米波数和 k 空间格点" width="2200" height="1720" loading="lazy" decoding="async" />
</figure>

$$
n_x,n_y,n_z\in 1,2,3,\ldots
$$

$$
\frac N2\left(\frac{\pi}{l_0}\right)^3
=\frac18\cdot\frac43\pi k_F^3.
$$

$\frac{N}{2}\longrightarrow$泡利不相容，每个能级 2 粒子。

全同 $\longrightarrow$ 处理成自由粒子。

简化，但真实物理！

$$
\frac N{l_0^3}\longrightarrow\rho.
$$

$$
E_F=\frac1{2m_n}k_F^2.
$$

$m_n$：质子、中子。

能量差 $\longrightarrow$ 结合能、库仑排斥。






总结：
定态：

$$
\hat H\phi(x)=E\phi(x),
$$

$$
\psi(x,t)=e^{-i\omega t}\phi(x).
$$

束缚态：

$$
x\to\infty,
\qquad
\phi(x)\to0.
$$

散射：

$$
x\to\infty,
\qquad
e^{ikx}.
$$
## 散射
最简单的散射——一维势垒。



<figure class="figure-light figure-diagram">
  <img src="../../figures/modern-physics-intro-groups-and-quantum-mechanics/barrier_scattering.png" alt="一维方势垒散射的入射波、反射波、势垒内波和透射波" width="2800" height="1520" loading="lazy" decoding="async" />
</figure>

$$
E\sim\frac{k^2}{2m},
$$

$$
\left[
\frac1{2m}\partial_x^2+(E-V)
\right]\phi=0.
$$

若

$$
E>V,
$$

为波动解，

$$
k\sim\sqrt{2m(E-V)}.
$$

若

$$
E<V_0,
$$

则

$$
\kappa=\sqrt{2m(V_0-E)}.
$$

I、III 区波动：

$$
Ae^{ikx}+Be^{-ikx}.
$$

II 区：

$$
\left[
\frac1{2m}\partial_x^2-(V_0-E)
\right]\phi=0.
$$

I 区：

$$
\phi_I=\phi_{\mathrm{in}}+Re^{-ikx},
$$

$$
\phi_{\mathrm{in}}=1e^{ikx}.
$$



$$
\phi_s=Re^{-ikx}+Te^{ikx}
=\phi_R+\phi_T.
$$

III 区：

$$
\phi_{III}=Te^{ikx}.
$$

II 区：

$$
\phi_{II}=Be^{\kappa x}+B'e^{-\kappa x},
\qquad E<V_0.
$$

当

$$
E>V_0,
$$

$$
q=\sqrt{2m(E-V_0)},
\qquad
\phi_{II}=Be^{iqx}+B'e^{-iqx}.
$$

边界条件：

$$
\phi_I(0)=\phi_{II}(0),
$$

$$
\phi'_I(0)=\phi'_{II}(0),
$$

$$
\phi_{II}(L)=\phi_{III}(L),
$$

$$
\phi'_{II}(L)=\phi'_{III}(L).
$$

可以解出$T,R,B,B'$



$$
J
=\frac1{2mi}(\psi^*\psi'-\psi\psi^{*\prime}).
$$

$$
J_{\mathrm{in}}=\frac{k}{m},
$$

$$
J_T=|T|^2\frac{k}{m},
$$

$$
J_R=-|R|^2\frac{k}{m}.
$$

$$
J_{\mathrm{in}}+J_R=J_T.
$$

$$
E>V_0,
$$

也非完全透射。

当

$$
E<V_0,
$$

$$
\kappa=\sqrt{2m(V_0-E)}.
$$

边界条件仍为

$$
\phi_I(0)=\phi_{II}(0),
$$

$$
\phi'_I(0)=\phi'_{II}(0),
$$

$$
\phi_{II}(L)=\phi_{III}(L),
$$

$$
\phi'_{II}(L)=\phi'_{III}(L).
$$

给出隧道效应预言。

### argue 1：波函数一阶导

$$
\int_{0^-}^{0^+}
\frac{d^2\phi}{dx^2}\,dx
=2m\int_{0^-}^{0^+}[V(x)-E]\phi(x)\,dx.
$$

若 $V(x)$ 有限，右边为 $0$。

反例：

$$
V(x)=V_0\delta(x).
$$

### argue 2

若

$$
V(x)=V(r),
$$

则

$$
e^{ikx}
\longrightarrow
\frac1r e^{ikr}.
$$

$$
\phi_{\mathrm{in}}+\phi_s
=e^{ikx}
+f(\theta,\varphi)\frac1r e^{ikr}.
$$

$$
d\sigma
=\frac{dn/dt}{J_{\mathrm{in}}}.
$$

$$
\frac{dn}{dt}
=\phi_s^*\phi_s\,
r^2\frac{dr\,d\Omega}{dt}
$$

$$
=|f(\theta,\varphi)|^2
d\Omega\cdot\frac{dr}{dt}.
$$

$$
\frac{d\sigma}{d\Omega}
=|f(\theta,\varphi)|^2.
$$

固态靶。



定态可以发现

$$
\langle m|n\rangle=\delta_{mn}.
$$

可以推广至任意束缚态，

$$
E_i\ne E_j,
$$

$$
\langle i|j\rangle=0,
$$

$\Rightarrow$ 暗示 Hilbert space。

## Hilbert space

向量：

$$
|\psi\rangle\in H.
$$

线性：

$$
|\chi\rangle
=\alpha|\psi\rangle+\beta|\phi\rangle
\in H.
$$

对偶：

$$
\langle\psi|\in H^\dagger.
$$

内积：

$$
\langle\psi|\phi\rangle\in\mathbb C.
$$

对任意 $a,b\in\mathbb C$，

$$
\langle a\psi|b\phi\rangle
=a^*b\langle\psi|\phi\rangle.
$$

$$
\langle\psi|\phi\rangle^*
=\langle\phi|\psi\rangle.
$$

$$
\langle\psi|\phi+\chi\rangle
=\langle\psi|\phi\rangle
+\langle\psi|\chi\rangle.
$$

正定：

$$
\langle\phi|\chi\rangle\ge0.
$$



$$
H|\phi_n\rangle=E_n|\phi_n\rangle,
$$

$$
\langle\phi_m|\phi_n\rangle=\delta_{mn},
$$

$$
|\phi_i\rangle\langle\phi_i|=1.
$$

1. Schwarz 不等式：

$$
|\langle\psi|\phi\rangle|
\le |\psi|\,|\phi|.
$$

例如

$$
|\vec a\cdot\vec b|
\le|\vec a|\,|\vec b|.
$$

2. 三角不等式：

$$
|\psi+\phi|
\le|\psi|+|\phi|.
$$



## Operator in Hilbert space

$$
\forall |\psi\rangle\in H,
\qquad
\hat A|\psi\rangle=|\phi\rangle\in H.
$$

对于

$$
\{|\psi_\alpha\rangle\}\in H,
$$

$$
\hat A|\psi_\alpha\rangle
=\sum_\beta|\psi_\beta\rangle D_{\beta\alpha}(\hat A).
$$

$$
D_{\beta\alpha}
=\langle\psi_\beta|\hat A|\psi_\alpha\rangle.
$$

$\longrightarrow$ Representation：选取基底 $\{|\psi_\alpha\rangle\}$ 有关。“矩阵力学”。

$$
[\hat A,\hat B]=\hat A\hat B-\hat B\hat A.
$$

$$
[\hat x,\hat p]=i\hbar=i,
\qquad
\hbar=1.
$$

$$
e^{\hat A+\hat B}
\sim
\sum_n\frac1{n!}(\hat A+\hat B)^n,
$$

要求

$$
[\hat A,\hat B]=0.
$$

转置算符 $\hat A^T$ 满足

$$
\langle\phi|\hat A^T|\psi\rangle
\equiv
\langle\psi^*|\hat A|\phi^*\rangle.
$$

$$
\langle\phi|\hat A|\psi\rangle^*
=\langle\psi|\hat A^\dagger|\phi\rangle.
$$

$\hat A$ 作用于 $|\psi\rangle$；$\hat A^\dagger$ 作用于 $\langle\psi|$。

$$
\hat A^\dagger=\hat A
\quad\Longleftrightarrow\quad
\langle\psi|\hat A|\psi\rangle\in\mathbb R.
$$

内积不变的算符：幺正算符，

$$
U^\dagger=U^{-1}.
$$

本征值问题：

$$
\hat A|\psi_j\rangle=a_j|\psi_j\rangle.
$$

$$
|\phi\rangle=\sum_jC_j|\psi_j\rangle.
$$

$$
\langle A\rangle
=\sum_j C_j^2a_j.
$$

若

$$
E_1\ne E_2,
$$

则

$$
\langle\psi_2|\psi_1\rangle=0.
$$

因为

$$
\hat H|\psi_1\rangle=E_1|\psi_1\rangle,
$$

$$
\hat H^\dagger|\psi_2\rangle=E_2|\psi_2\rangle,
$$

所以

$$
(E_1-E_2)\langle\psi_2|\psi_1\rangle=0.
$$

Q.E.D.

若

$$
E_1=E_2,
$$

且

$$
|\psi_1\rangle\ne\alpha|\psi_2\rangle,
$$

则为简并。


n维空间：

$$
(\hat H-E\hat 1)|\psi\rangle=0,
$$

$$
\det(\hat H-E\hat 1)=0.
$$

非满秩，非简并情形，构成齐次集。

> [!question]
> 简单情形可由 Schur 引理类似证明？

## 公设

1. 态由 $\psi$ 描述；Born 诠释。
2. 态叠加原理（线性）。
3. 可观测量有厄米算符；测量后处于本征态。



> [!question]
> 测量$\rightarrow$退相干 or 坍缩到本征态？

### argue：同时测量?$\rightarrow$对易子

$$
[\hat x_i,\hat p_j]
=i\hbar\delta_{ij}
=i\delta_{ij},
\qquad
\hbar=1.
$$

$$
[\hat J_i,\hat J_j]
=i\hbar\epsilon_{ijk}\hat J_k
=i\epsilon_{ijk}\hat J_k.
$$

Casimir 算符：

$$
\hat J^2,
$$

$$
[\hat J^2,\hat J_i]=0.
$$

不对易 $\Longleftrightarrow$ 无共同本征态，不可同时测量。

### 不确定度

$$
\langle\psi|\hat H^2|\psi\rangle
=\langle\hat H^2\rangle,
$$

$$
\langle\psi|\hat H|\psi\rangle^2
=\langle\hat H\rangle^2.
$$

若

$$
|\psi\rangle=|\psi_i\rangle,
$$

则

$$
\langle E_i^2\rangle
=\langle E_i\rangle^2.
$$

若 $|\psi\rangle$ 不是 $\hat H$ 的本征态，



$$
\sum_i|c_i|^2E_i^2
\ne
\left(\sum_i|c_i|^2E_i\right)^2.
$$

对于 $\hat A,\hat B$ 两算符：

对易时，

$$
\hat A\hat B|\psi\rangle
=\hat B\hat A|\psi\rangle,
$$

有共同本征态。

不对易时，无共同本征态，不可同时测量。

> [!question]
> 2 个 Hermitian 对易时才能同时对角化？



考虑 $\hat A,\hat B$ 厄米，构造

$$
\Delta\hat A=\hat A-\langle A\rangle
\qquad\text{厄米},
$$

$$
\Delta\hat B=\hat B-\langle B\rangle
\qquad\text{厄米}.
$$

$$
\hat M=\Delta\hat A+i\xi\Delta\hat B
\qquad\text{非厄米}.
$$

利用柯西不等式：

$$
0\le\langle\psi|\hat M^\dagger\hat M|\psi\rangle
$$

$$
=\langle\Delta\hat A^2\rangle
+i\xi\langle[\Delta\hat A,\Delta\hat B]\rangle
+\xi^2\langle\Delta\hat B^2\rangle.
$$


容易验证
$$
[\Delta\hat A,\Delta\hat B]=[\hat A,\hat B].
$$

所以

$$
\langle\Delta\hat B^2\rangle\xi^2
+i\xi\langle[\hat A,\hat B]\rangle
+\langle\Delta\hat A^2\rangle
\ge0.
$$

$$
\Delta A\,\Delta B
\ge\frac12
\left|\langle[\hat A,\hat B]\rangle\right|.
$$

也即广义不确定原理。
一个例子：

$$
[\hat x,\hat p]=i\hbar,
$$

$$
\Delta x\,\Delta p\ge\frac{\hbar}{2}.
$$

4. 演化：

$$
i\partial_t|\psi(x,t)\rangle
=\hat H|\psi(x,t)\rangle.
$$

5. 全同粒子：不可区分。

## Noether's theorem in QM

CM：

$$
g=H
\quad\Longleftrightarrow\quad
\text{时间平移}.
$$

$$
\{H,g\}=0
\quad\Longrightarrow\quad
\frac{dg}{dt}=0.
$$

QM：

$$
|\psi(x,t_0+\delta t)\rangle
=|\psi(x,t_0)\rangle
+\delta t\left.\partial_t|\psi(x,t)\rangle\right|_{t_0}
$$

$$
=\left(1-i\delta t\hat H\right)
|\psi(x,t_0)\rangle.
$$

取

$$
\delta t=\frac{t-t_0}{N}.
$$

极小 $\longrightarrow$ 有限参数：

$$
\left(
1-i\frac{t-t_0}{N}\hat H
\right)^N
|\psi(x,t_0)\rangle
$$

$$
=e^{-i(t-t_0)\hat H}|\psi(x,t_0)\rangle.
$$



$$
|\psi(x,t)\rangle
=e^{-i\hat Ht}|\psi(x,0)\rangle.
$$

$$
\hat U=e^{-i\hat Ht},
\qquad
\hat U^\dagger\hat U=1.
$$

$$
i\partial_t|\psi\rangle_S
=\hat H|\psi\rangle_S,
$$

$$
\frac{\partial\hat A_S}{\partial t}=0
\qquad
\text{算符不含时}.
$$

$$
\langle\psi(t)|\hat A_S|\psi(t)\rangle
=\langle\psi(0)|
\hat U^\dagger\hat A_S\hat U
|\psi(0)\rangle.
$$

$$
\hat A_H
=\hat U^\dagger\hat A_S\hat U
\qquad
\text{含时}.
$$

$$
|\psi_H\rangle
=|\psi(0)\rangle
=\hat U^\dagger|\psi(t)\rangle.
$$

$$
\partial_t|\psi_H\rangle=0.
$$

### Schrödinger picture

$$
\partial_t\hat A_S=0,
$$

$$
i\partial_t|\psi_S\rangle
=\hat H|\psi_S\rangle.
$$

### Heisenberg picture



$$
\partial_t|\psi_H\rangle=0.
$$

$$
\hat A_H
=e^{it\hat H}\hat A_Se^{-it\hat H}.
$$

$$
\partial_t\hat A_H
=i(\hat H\hat A_H-\hat A_H\hat H)
=i[\hat H,\hat A_H].
$$

这里注意 $\hat U,\hat H$ 对易。

$$
i\partial_t\hat A_H
=[\hat A_H,\hat H].
$$

正则量子化：

$$
\{\ ,\ \}
\longrightarrow
\frac1{i\hbar}[\ ,\ ].
$$

推广诺特定理，在幺正变换 $\hat U$ 下，

$$
|\psi'\rangle=\hat U|\psi\rangle.
$$

运动方程不变：

$$
i\partial_t|\psi\rangle
=\hat H|\psi\rangle,
$$

$$
i\partial_t|\psi'\rangle
=\hat H'|\psi'\rangle.
$$

$\hat U$ 不含时，则

$$
\hat U^\dagger\hat H\hat U=\hat H,
$$

即

$$
[\hat H,\hat U]=0.
$$



单参数幺正变换可由厄米算符 $\hat G$ 生成。

无穷小：

$$
\hat U_\delta=1-i\delta\hat G,
$$

$$
\hat G^\dagger=\hat G.
$$

$$
l=N\delta,
$$

$$
\hat U=e^{-il\hat G}.
$$

$$
[\hat H,\hat U]=0
\quad\Longrightarrow\quad
[\hat H,\hat G]=0.
$$

幺正变换下物理不变／对称变换

$\Longleftrightarrow$

生成元厄米算符 $\hat G$ 对应守恒量

$\downarrow$

QM Noether。
