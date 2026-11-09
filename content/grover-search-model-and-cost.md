---
title: Grover 算法讨论 2：基本搜索模型与搜索成本的表述
description: 从两次反射推导多解 Grover 搜索的成功概率，比较一次运行与反复尝试直到找到解的成本。
date: 2026-11-10
type: essay
category: 量子信息
tags: [Grover算法, 量子计算, 量子信息]
featured: true
homeLeadEligible: false
draft: false
related: [grover-algorithm-original-motivation]
backlinks: []
mathDisplay: auto
sidenotes: []
---

## 搜索空间的约化

Grover原始论文考虑的是如下问题：当我们有$N=2^n$个候选态时，从均匀初态$\lvert s\rangle=H^{\otimes n}\lvert0^n\rangle$出发，我们怎么找到唯一的答案[^grover96][^grover97]。后续的工作将问题推广到多解情形和一般振幅放大[^bbht][^bht][^bhmt].这里介绍一个多解的均匀态版本问题：设函数 $f:\{0,\ldots,N-1\}\rightarrow\{0,1\}$ 用于识别符合要求的元素，解集 $\mathcal W=\{x:f(x)=1\}$ 包含 $M$ 个解。定义

$$
p=\frac MN,\qquad
\theta=\arcsin\sqrt p,
$$

算法的核心洞见是，下述Grover迭代具有对称性，可以保持所有目标态之间和非目标态之间的等振幅关系，可以把迭代中每一步的态矢量都用两个标准方向：正确方向$\lvert W\rangle=\frac1{\sqrt M}\sum_{x\in\mathcal W}\lvert x\rangle$和错误方向$\lvert R\rangle=\frac1{\sqrt{N-M}},\sum_{x\notin\mathcal W}\lvert x\rangle$表示,从而将搜索空间的演化限制在为两个标准向量张成的不变子空间中。[^bbht]
等振幅叠加态可写为

$$
\lvert s\rangle=\sqrt p\,\lvert W\rangle+\sqrt{1-p}\,\lvert R\rangle=\sin \theta \lvert W\rangle+\cos \theta \lvert R\rangle.
$$

而搜索过程就可以简化为从初始的$\lvert s\rangle$方向转向$\lvert W\rangle$方向的迭代过程。

## 搜索的迭代过程及元件算符的构造

我们给出Grover迭代的构造，其为两个反射的复合，对应了一个不变子空间上的旋转。
对于Grover算法，标准迭代算符为

$$
G=DO_f
$$

由扩散算符$D$和$\pi$-相位反转算符$O_f$组成
$O_f=I-2\Pi_W$（其中$\Pi_W=\sum_{x\in\mathcal W}\lvert x\rangle\langle x\rvert$是目标态的投影算符）构成一个对于目标态的$\pi$-相位反转。而$D=2\lvert s\rangle\langle s\rvert-I$构成一个相对平均振幅的反射，也即扩散操作。

<figure class="figure-light">
  <img src="../../figures/grover-search-model-and-cost/two-reflections.png" alt="Grover 迭代中的两次反射及连续旋转" width="2171" height="1158" loading="lazy" decoding="async" />
</figure>

图1：在上述二维平面内，$O_f$ 保留 $|R\rangle$ 分量并翻转 $|W\rangle$ 分量，因而是关于 $|R\rangle$ 轴的反射。扩散算符 $D$ 则关于 $|s\rangle$ 轴反射。两轴夹角为 $\theta$，故其复合 $DO_f$ 每次使搜索态转过 $2\theta$；初态与 $|R\rangle$ 轴的夹角已为 $\theta$，这就给出了成功概率中的 $(2t+1)\theta$

在有 $M$ 个解（$0<M<N$），且目标态内部与非目标态内部各自保持等振幅对称性的情况下，

$$
\lvert\psi_t\rangle
=
a_t\sum_{x\in\mathcal W}\lvert x\rangle
+
b_t\sum_{x\notin\mathcal W}\lvert x\rangle,
$$

其中，$a_t$ 和 $b_t$ 分别表示每个目标基态和每个非目标基态的振幅，满足 $M|a_t|^2+(N-M)|b_t|^2=1$。$\pi$-相位反转算符操作之后的平均振幅为

$$
\mu_t=\frac{-Ma_t+(N-M)b_t}{N}.
$$

随后，扩散操作将各振幅关于平均振幅反射

$$
\begin{aligned}
a_{t+1}
&=2\mu_t+a_t
=\left(1-\frac{2M}{N}\right)a_t
+\frac{2(N-M)}{N}b_t,\\
b_{t+1}
&=2\mu_t-b_t
=-\frac{2M}{N}a_t
+\left(1-\frac{2M}{N}\right)b_t.
\end{aligned}
$$

在归一化基底 $(\lvert W\rangle,\lvert R\rangle)$ 中，状态的两个坐标分别为 $u_t=\sqrt M\,a_t$ 和 $v_t=\sqrt{N-M}\,b_t$。令 $\theta=\arcsin\sqrt{M/N}$，上述递推关系可写为

$$
\begin{pmatrix}
u_{t+1}\\
v_{t+1}
\end{pmatrix}
=
G
\begin{pmatrix}
u_t\\
v_t
\end{pmatrix},
\qquad
G=
\begin{pmatrix}
\cos2\theta&\sin2\theta\\
-\sin2\theta&\cos2\theta
\end{pmatrix},
\qquad
\lambda_\pm=\mathrm e^{\pm2\mathrm i\theta}.
$$

相应的本征值也可写为

$$
\lambda_\pm
=
1-\frac{2M}{N}
\pm\frac{2\mathrm i\sqrt{M(N-M)}}{N}.
$$

从均匀初态 $\lvert\psi_0\rangle=\lvert s\rangle=\sin\theta\,\lvert W\rangle+\cos\theta\,\lvert R\rangle$ 出发，迭代给出如下精确演化规律：

$$
\begin{aligned}
\lvert\psi_t\rangle
&=
\sin\bigl((2t+1)\theta\bigr)\lvert W\rangle
+
\cos\bigl((2t+1)\theta\bigr)\lvert R\rangle,\\
P_t^{\mathrm G}
&=
M|a_t|^2
=
\sin^2\bigl((2t+1)\theta\bigr).
\end{aligned}
$$

这个迭代结果也可以通过考虑在二维不变子空间的旋转几何容易的给出。只需要考虑$O_f$作为相对错误标准态$\lvert R\rangle$的反射，$D$作为相对平均振幅的反射，同样可以得到$P_t^{\mathrm G}=\sin^2\bigl((2t+1)\theta\bigr).$[^jozsa]

当 $M$ 为已知时，可以在成功概率第一次极大附近选择

$$
r=\left\lfloor\frac{\pi}{4\theta}\right\rfloor,
$$

此时 $1-P_r^{\mathrm G}\le M/N$。在 $M\ll N$ 时，

$$
r\simeq \frac{\pi}{4}\sqrt{\frac NM}.
$$

$M$ 未知时，不能直接代入最佳迭代数。但BBHT 提出的随机迭代长度方案仍然能在 $M\ge1$ 时实现期望上界为 $O(\sqrt{N/M})$ 的查询。[^bbht]

上面我们讨论了可以把一个迭代分解为相位翻转和扩散。要将其实现为量子电路，还需要将初态制备，相位标记和扩散操作分解为量子门复合。

在 $N=2^n$ 的搜索空间，均匀初态可通过对全0初态施加Walsh-Hadamard门（也即对每个搜索量子比特施加一个 Hadamard 门）来制备：

$$
|s\rangle=H^{\otimes n}|0^n\rangle.
$$

因此，初态制备需要 $n$ 个单比特门；允许并行操作时，它们可以在一层中完成。

扩散算符的实现是容易的：

$$
D
=
2|s\rangle \langle s |-I
=
H^{\otimes n}
\bigl(2|0^n\rangle\langle0^n|-I\bigr)
H^{\otimes n}.
$$

引入多控Z门

$$
C^{n-1}Z=I-2|1^n\rangle\langle1^n|,
$$

原本要实现的对全0基态做的相位翻转就化为了对全1基态的操作多控Z门与X门的复合，则

$$
D=
-\,H^{\otimes n}X^{\otimes n}
C^{n-1}Z
X^{\otimes n}H^{\otimes n}.
$$

在标准的 Grover 搜索电路中，整体负相位不影响测量结果的概率。多控 $Z$ 门还可以进一步分解为 Toffoli、CNOT 和单比特相位门[^lavor]。从而，我们将扩散算符分解为了多控门的复合，可以用门数、深度与辅助比特数来估计其搜索成本.在任意单比特门与 CNOT 构成的门集下，使用一个初态为全0态的辅助比特，其分解后通常只需要 $O(n)$ 个门[^barenco]。

构造相位标记的一种简单方法通过将一个经典谓词转化为由Toffoli门构成的经典可逆电路来实现[^gidney]。设可逆电路 $C_f$ 将判定结果写入一个辅助比特，同时可能在工作寄存器中留下中间的计算结果：

$$
C_f|x\rangle|0^a\rangle|0\rangle
=
|x\rangle|g_x\rangle|f(x)\rangle.
$$

接下来对结果比特施加 $Z$ 门，再执行逆电路 $C_f^\dagger$，便得到

$$
|x\rangle|0^a\rangle|0\rangle
\xrightarrow{\,C_f\,}
|x\rangle|g_x\rangle|f(x)\rangle
\xrightarrow{\,Z\,}
(-1)^{f(x)}|x\rangle|g_x\rangle|f(x)\rangle
\xrightarrow{\,C_f^\dagger\,}
(-1)^{f(x)}|x\rangle|0^a\rangle|0\rangle.
$$

这一“计算—相位标记—反计算”过程实现了所需的 $O_f$，并将辅助寄存器恢复到初态，使其不再携带关于 $x$ 的信息，避免纠缠影响进一步的计算。
于是，当辅助比特初始为全0态时：

$$
C_f^\dagger Z_{\rm out}C_f\bigl(|\psi\rangle|0^{a+1}\rangle\bigr)=(O_f|\psi\rangle)|0^{a+1}\rangle
$$

更一般地，BHMT的工作还指出初态还可以由更一般的酉算符实现$|s_A\rangle=A|0^n\rangle.$[^bhmt]此时目标的相位标记仍由 $f$ 决定，关于初态的反射则变为 $D_A=A(2\lvert0^n\rangle\langle0^n\rvert-I)A^\dagger$

## 搜索成本的估计方式

对标准的 Grover算法，一次运行可以分解成如下几项

$$
C_{\mathrm{run}}
=
C_{\mathrm{init}}
+
t\bigl(C_{\mathrm{oracle}}+C_{\mathrm{diffusion}}\bigr)
+
C_{\mathrm{readout/verify}}
.
$$

其中，进行t次迭代，一次迭代成本由$\bigl(C_{\mathrm{oracle}}+C_{\mathrm{diffusion}}\bigr)$给出,$C_{\mathrm{readout/verify}}$为输出测量处理与结果验证的成本。

对于一个实现方案，若每次尝试的成功概率为$P_t>0$，每次失败后独立的重新运行，则直到首次成功，有如下成本估计：

$$
\mathbb E[\mathcal C(t)]
=
\frac{\mathcal C_{\mathrm{run}}(t)}{P_t},
$$

因此，有优化单次成功概率和优化单次运行成本两种优化思路，若需要尽快得到首次成功，得到一个经过验证的解，应选择使得$\mathbb E[\mathcal C(t)]=\frac{\mathcal C_{\mathrm{run}}(t)}{P_t}$最小的t

Boyer等指出，在$M/N\ll1$，忽略初态制造成本和测量验证成本考量下，可以通过最小化$\frac{t}{\sin^2((2t+1)\theta)}$来确定合适的迭代次数，其渐近最优选择为[^bbht]
$t_*\simeq0.583\sqrt{N/M}$,对应单次成功率约为0.845,此时

$$
\frac{t_*}{P_{t_*}}\simeq0.690\sqrt{\frac NM}
\quad<\quad
\frac{\pi}{4}\sqrt{\frac NM}\simeq0.785\sqrt{\frac NM},
$$

更进一步的成本估计要考虑：门集、辅助位数量与初态、门数、深度、是否允许测量。一个例子是Grassl 等，2016 对 Grover 搜索 AES 密钥进行了完整的逻辑资源估计，其考虑了Grover 迭代次数，$T$ 门总数，逻辑量子比特数，总电路深度。[^grassl]这指出，当考虑量子计算加速时，需要分析对比其与经典算法在单次判定速度，准备开销和并行资源等多方面的差异。

## 参考文献

[^grover96]: L. K. Grover, “A Fast Quantum Mechanical Algorithm for Database Search”, STOC, 1996. [论文](https://doi.org/10.1145/237814.237866)
[^grover97]: L. K. Grover, “Quantum Mechanics Helps in Searching for a Needle in a Haystack”, *Physical Review Letters*, 1997. [论文](https://doi.org/10.1103/PhysRevLett.79.325)
[^bbht]: M. Boyer, G. Brassard, P. Høyer, A. Tapp, “Tight Bounds on Quantum Searching”, *Fortschritte der Physik*, 1998. [论文](https://arxiv.org/abs/quant-ph/9605034)
[^bht]: G. Brassard, P. Høyer, A. Tapp, “Quantum Counting”, ICALP, 1998. [论文](https://doi.org/10.1007/BFb0055105)
[^bhmt]: G. Brassard, P. Høyer, M. Mosca, A. Tapp, “Quantum Amplitude Amplification and Estimation”, *Contemporary Mathematics*, 2002（预印本发表于 2000 年）. [出版版](https://doi.org/10.1090/conm/305/05215) · [预印本](https://arxiv.org/abs/quant-ph/0005055)
[^jozsa]: R. Jozsa, “Searching in Grover’s Algorithm”, 1999. [预印本](https://arxiv.org/abs/quant-ph/9901021)
[^lavor]: C. Lavor, L. R. U. Manssur, R. Portugal, “Grover’s Algorithm: Quantum Database Search”, 2003. [预印本](https://arxiv.org/abs/quant-ph/0301079)
[^barenco]: A. Barenco 等, “Elementary Gates for Quantum Computation”, *Physical Review A*, 1995. [论文](https://doi.org/10.1103/PhysRevA.52.3457)
[^gidney]: C. Gidney, “Halving the Cost of Quantum Addition”, *Quantum*, 2018. [论文](https://doi.org/10.22331/q-2018-06-18-74)
[^grassl]: M. Grassl, B. Langenberg, M. Roetteler, R. Steinwandt, “Applying Grover’s Algorithm to AES: Quantum Resource Estimates”, PQCrypto, 2016. [论文](https://doi.org/10.1007/978-3-319-29360-8_3)
