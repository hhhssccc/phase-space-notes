---
title: Grover 算法讨论 1：最初的想法
description: 从经典逻辑门与量子门出发，沿薛定谔方程的离散化思路讨论 Grover 算法最初的想法。
date: 2026-09-15
type: essay
category: 量子信息
tags: [Grover算法, 量子计算, 量子信息]
featured: true
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes: []
---

<figure class="lead-figure"><img src="/phase-space-notes/figures/grover-algorithm-original-motivation/lead.png" alt="冷灰色射电望远镜实景与橘雪莉" width="1672" height="941" /></figure>



这是 2026.9.13 讨论班讲稿，主要参考了 Grover（2001）[^grover2001]。这篇文章不够严谨，但可以帮我们很好地理解 Grover 的初始 motivation，需要的前置知识只有线性代数，熟悉量子门的读者可直接从第 1 节开始。

## 0. 在一切之前

我们简要介绍经典逻辑门，再考虑将其量子化，这是后续算法讨论的基础。

### 0.1. AND gate

$A,B\in\{0,1\}$，$C:=A\land B$，映射 $(A,B)\mapsto C$。

真值表：

| $A\backslash B$ | 0 | 1 |
| --- | --- | --- |
| 0 | 0 | 0 |
| 1 | 0 | 1 |

类似有 OR gate：$A\lor B$；NOT gate：$\neg A$。

### 0.2. NAND 与 NOR

N means not。

$$
\operatorname{NAND}(A,B)=\neg(A\land B),\qquad
\operatorname{NOR}(A,B)=\neg(A\lor B).
$$

对 NAND，真值表：

| $A\backslash B$ | 0   | 1   |
| --------------- | --- | --- |
| 0               | 1   | 1   |
| 1               | 1   | 0   |

> [!question]
> 为什么我们要专门讨论 NAND 和 NOR？

其原因是我们有所谓的 functional completeness：一切 Boolean function：$\{0,1\}^n\mapsto\{0,1\}$，都可以仅由 NAND 或 NOR 构造。

例如：

$$
\neg A=\operatorname{NAND}(A,A),\qquad
A\land B=\neg\bigl(\operatorname{NAND}(A,B)\bigr).
$$

### 0.3. 量子化逻辑门

现在研究对象从 bit $\{0,1\}$ 转为 qubit $|0\rangle,|1\rangle$。我们也要尝试构造相应的量子化逻辑门。

作用在 qubit 的演化算符 $U$ 幺正：$U^\dagger U=1$。

但 NAND：

$$
00\mapsto1,\quad01\mapsto1,\quad10\mapsto1,\quad11\mapsto0,
$$

不可逆，非幺正。

> [!question]
> 怎么使其可逆？

用一个小 trick：

$$
\begin{aligned}
\text{Classic: }&(a,b)\xmapsto{f}f(a,b),\\
\text{QM: }&(a,b,c)\xmapsto{f}(a,b,c\oplus f(a,b)).
\end{aligned}
$$

$c$ 称作 target qubit，$a,b$ 称作 control qubit。$\oplus$ 为模2加法（异或）。

显然 $U_f^2=1$，操作可逆。

#### 0.3.1. NOT gate

这个和经典一样，是trivial 的。

$$
\operatorname{NOT}:=X=\begin{pmatrix}0&1\\1&0\end{pmatrix}=\sigma_x.
$$

也即 Pauli $X$。

> [!question]
> 有什么用？

交换振幅：

$$
\begin{pmatrix}\alpha\\\beta\end{pmatrix}
\longrightarrow\begin{pmatrix}\beta\\\alpha\end{pmatrix}.
$$

#### 0.3.2. CNOT gate

Controlled NOT。这里要用到刚才的 trick：

$$
|a,b\rangle\mapsto|a,b\oplus a\rangle.
$$

$a$ 为 control qubit，$b$ 为 target qubit。

$$
\begin{aligned}
|0,0\rangle&\mapsto|0,0\rangle,\\
|0,1\rangle&\mapsto|0,1\rangle,\\
|1,0\rangle&\mapsto|1,1\rangle,\\
|1,1\rangle&\mapsto|1,0\rangle.
\end{aligned}
$$

对应

$$
U_{\mathrm{CNOT}}=\begin{pmatrix}
1&0&0&0\\0&1&0&0\\0&0&0&1\\0&0&1&0
\end{pmatrix}.
$$

只是一个置换，$U_{\mathrm{CNOT}}^\dagger U_{\mathrm{CNOT}}=1$。

> [!question]
> 有什么用？

产生纠缠，二体耦合。

假设输入

$$
|+\rangle\otimes|0\rangle
=\frac1{\sqrt2}(|0\rangle+|1\rangle)|0\rangle
=\frac1{\sqrt2}(|00\rangle+|10\rangle).
$$

$$
U_{\mathrm{CNOT}}|+\rangle|0\rangle
=\frac1{\sqrt2}(|00\rangle+|11\rangle).
$$

产生纠缠，这个例子产生的就是所谓的 Bell 态。

#### 0.3.3. CCNOT gate（Toffoli gate）

$$
|a,b,c\rangle\mapsto|a,b,c\oplus ab\rangle.
$$

$a,b$ 为 control qubit，$c$ 为 target qubit。对应了置换 $|110\rangle\leftrightarrow|111\rangle$，显然可逆。

> [!question]
> 有什么用？

If $c=0$，

$$
|a,b,0\rangle\xrightarrow{\mathrm{Toffoli}}|a,b,ab\rangle
=|a,b,a\land b\rangle.
$$

⇒ “可逆版 AND”。

If $c=1$，

$$
|a,b,1\rangle\xrightarrow{\mathrm{Toffoli}}|a,b,\neg(a\land b)\rangle.
$$

⇒ “可逆 NAND”。

下面介绍几种无经典对应的操作。

#### 0.3.4. Hadamard gate

$$
H=\frac1{\sqrt2}\begin{pmatrix}1&1\\1&-1\end{pmatrix}.
$$

$$
H|0\rangle=\frac{|0\rangle+|1\rangle}{\sqrt2}:=|+\rangle,
\qquad H|1\rangle=\frac{|0\rangle-|1\rangle}{\sqrt2}:=|-\rangle.
$$

① 制造叠加态。

② $H^2=1$，$H^{-1}=H$，$H^\dagger=H$。

#### 0.3.5. Walsh–Hadamard transformation

我们把 Hadamard gate 推广到 $n$ qubit。相应 Hilbert space 是 $(\mathbb C^2)^{\otimes n}$，$2^n$ 维。

定义 $\overline W=H^{\otimes n}$。

例如 $n=2$，$\overline W=H\otimes H$：

$$
\begin{aligned}
\overline W|00\rangle
&=(H|0\rangle)\otimes(H|0\rangle)\\
&=\frac1{(\sqrt2)^2}(|00\rangle+|01\rangle+|10\rangle+|11\rangle).
\end{aligned}
$$

$$
\overline W|000\rangle
=\left[\frac1{\sqrt2}(|0\rangle+|1\rangle)\right]^{\otimes3}
=\frac1{\sqrt8}(|000\rangle+\cdots+|111\rangle).
$$

$$
\overline W|\overline0\rangle=\frac1{\sqrt N}\sum_x|x\rangle=|s\rangle.
$$

“均匀态”。其中 $|\overline0\rangle$ 是全 0 态，$N=2^n$，$\sum_x|x\rangle$ 为对所有基底求和。⇒ 作用后得到了均匀态。

由 $H^2=1\Rightarrow\overline W^2=1$。

#### 0.3.6. Selective phase inversion

仅把某一个基底态反号，形如

$$
\begin{pmatrix}1&0&0&0\\0&-1&0&0\\0&0&1&0\\0&0&0&1\end{pmatrix}.
$$

> [!question]
> 有什么用？

相位改变不影响概率，但再做其它幺正变换后，概率幅就会改变。

#### 0.3.7. Oracle $I_f$

定义 a Boolean function，$f(x)\in\{0,1\}$：

$$
f(x)=\begin{cases}1,&x=x',\\0,&\text{else}.\end{cases}
$$

$x=x'$ ⇒ 正确结果。

我们不考虑 $f(x)$ 这个黑箱子的内部实现。有了它，我们可以构造操作 $I_f$，但：

$$
I_f|x\rangle=(-1)^{f(x)}|x\rangle.
$$

则只有 $|x'\rangle$ 会反号。

## 1. 搜索问题

假设有 $N=2^n$ 个候选，对应 $N$ 个基底态。

经典算法要 $O(N)$ 复杂度，$\sim N/2$。Grover 要 $O(\sqrt N)$。

我们先不加证明写出算法：先制备均匀态 $|s\rangle=\overline W|\overline0\rangle$，再作用 $DR=-\overline W I_{\overline0}\overline W I_f$（算符从右向左作用），重复 $O(\sqrt N)$ 次；单目标情形的最优次数约为 $\pi\sqrt N/4$。

$\overline W$：W–H 变换。$I_f$：目标态反号。$I_{\overline0}$：选择翻转全 0 态。前面的负号是出于最终形式上的考虑。

> [!question]
> 从 $|\overline0\rangle$ 开始，为什么需先作用 $\overline W$？

如果先 $I_f|\overline0\rangle$，只能知道 $|\overline0\rangle$ 是否答对。如果先 $\overline W|\overline0\rangle$，得到均匀态 $|s\rangle=\frac1{\sqrt N}\sum_x|x\rangle$，所有候选态都出现。

再 $I_f$ 操作：

$$
I_f|s\rangle=\frac1{\sqrt N}\left(\sum_{x\ne x'}|x\rangle-|x'\rangle\right).
$$

但这时每个态概率幅都一样，只改变可能的全局相位，不能据此读出是否为目标。

可以证明，每做一轮 $DR=-\overline W I_{\overline0}\overline W I_f$，$|x'\rangle$ 态概率幅增加约 $O(1/\sqrt N)$。

接下来展开讨论。

## 2. Schrödinger eq. 的启发

采用 $\hbar=1$、$2m=1$，假设势能与时间无关。Schrödinger eq.：

$$
i\partial_t\psi=\hat H\psi.
$$

$$
\begin{aligned}
\psi(t+dt)&=e^{-i\hat Hdt}\psi(t)\\
&=e^{(i\partial_x^2-iV)dt}\psi(t)\\
&\approx e^{i\partial_x^2dt}\cdot e^{-iVdt}\psi(t).
\end{aligned}
$$

这里有大量不严谨近似，我们姑且认为拆开是合理的。

对 $e^{i\partial_x^2dt}$ 作时间一阶小量展开，先网格离散化，$X_j=j\,dx$，采用周期边界条件：

$$
\bigl[e^{i\partial_x^2dt}\psi\bigr]_j
\approx\bigl[(1+i\partial_x^2dt)\psi\bigr]_j
\approx\psi_j+i\frac{dt}{dx^2}(\psi_{j+1}+\psi_{j-1}-2\psi_j).
$$

定义 $\epsilon=dt/dx^2$：

$$
\bigl[e^{i\partial_x^2dt}\psi\bigr]_j
\approx(1-2i\epsilon)\psi_j+i\epsilon\psi_{j+1}+i\epsilon\psi_{j-1}.
$$

$$
D:=
\begin{pmatrix}
1-2i\epsilon&i\epsilon&0&\cdots&i\epsilon\\
i\epsilon&1-2i\epsilon&i\epsilon&\cdots&0\\
0&i\epsilon&\ddots&\ddots&\vdots\\
\vdots&\vdots&\ddots&\ddots&i\epsilon\\
i\epsilon&0&\cdots&i\epsilon&1-2i\epsilon
\end{pmatrix}.
$$

这里 $D$ 是离散后的一步近似演化矩阵。这里注意，对于 $\epsilon=dt/dx^2$，我们没严格讨论小量阶数，这为后续讨论埋下隐患。

$e^{-iVdt}$ 可写作形如 $R=\operatorname{diag}(e^{-iV_1dt},e^{-iV_2dt},\ldots)$ 的对角阵。

Argue：

① 可以发现 $D$ 阵使 $j$ 处与 $j-1,j+1$ 处概率幅产生关联，其形式可以看作概率幅的“扩散”。

② 势能项起的作用为提供相位，这让我们想到选择性相位翻转可以看作某种“旋转”。

## 3. 推广：Grover 的灵机一动

上述 $D$ 阵引入了所谓空间“邻居”，$j-1\sim j\sim j+1$。但我们难以定义搜索候选的“距离”。

> [!insight]
> Grover's insight：那我们让所有信息都连起来不就好了？

$$
D=\begin{pmatrix}
1-i(N-1)\epsilon&i\epsilon&\cdots&i\epsilon\\
i\epsilon&1-i(N-1)\epsilon&\cdots&i\epsilon\\
\vdots&\vdots&\ddots&\vdots\\
i\epsilon&i\epsilon&\cdots&1-i(N-1)\epsilon
\end{pmatrix}.
$$

“全局的量子扩散”。

下面 argue 一件事：相位翻转后，概率幅会流向目标态 $|x'\rangle$。

假设一开始目标态与所有非标记态振幅都一样，为 $k/\sqrt N$。目标态在 $R$ 之后相位转 $-\pi/2$，变为 $-ik/\sqrt N$。

既然如此，在两个普通态间，振幅相同，$i\epsilon$ 从两边的交换抵消。⇒ 在小步近似下，净概率从普通态转移到目标态。

## 4. 存在的问题与修正

现在 Grover 已经有了清晰的机制：

- $R$：给目标态制造相位差。
- $D$：利用相位差转移振幅到目标态。

但 $D$ 不严格幺正，只有 $\epsilon\ll1/N$ 才近似幺正。

> [!question]
> 怎么办？

构造

$$
D=\begin{pmatrix}
a&b&b&\cdots\\b&a&b&\cdots\\b&b&a&\cdots\\\vdots&\vdots&\vdots&\ddots
\end{pmatrix}.
$$

要求D幺正：

$$
\begin{cases}
|a|^2+(N-1)|b|^2=1,\\
2\operatorname{Re}(ab^*)+(N-2)|b|^2=0.
\end{cases}
$$

有上界 $|b|\le2/N$；取达到上界且为正实数的 $b=2/N$，则 $a=-1+2/N$。

$$
D=\begin{pmatrix}
-1+\frac2N&\frac2N&\cdots&\frac2N\\
\frac2N&-1+\frac2N&\cdots&\frac2N\\
\vdots&\vdots&\ddots&\vdots\\
\frac2N&\frac2N&\cdots&-1+\frac2N
\end{pmatrix}.
$$

终于，我们得到了严格幺正的 Grover diffusion operator $D$。

## 5. 现代语言重写

定义 $|s\rangle=\frac1{\sqrt N}\sum_x|x\rangle$：

$$
|s\rangle\langle s|=\frac1N\begin{pmatrix}
1&1&\cdots&1\\1&1&\cdots&1\\\vdots&\vdots&\ddots&\vdots\\1&1&\cdots&1
\end{pmatrix}.
$$

则 $D=2|s\rangle\langle s|-1$，也即关于均匀态 $|s\rangle$ 的反射。

$D_{ij}=2/N\in\mathbb R$（$i\ne j$），对角元为 $D_{ii}=-1+2/N$。为了得到最大振幅转移，目标振幅应该反向：

$$
R|x'\rangle=-|x'\rangle,\qquad R=1-2|x'\rangle\langle x'|.
$$

反射 $|x'\rangle$。

$$
-\overline W I_{\overline0}\overline W
=-\overline W(1-2|\overline0\rangle\langle\overline0|)\overline W
=-1+2|s\rangle\langle s|=D.
$$

因此我们可以用 $-\overline W I_{\overline0}\overline W$ 实现 $D$。

可以计算一次 $DR$ 初期大约使目标态增加 $2/\sqrt N$。大约 $O(\sqrt N)$ 后，目标振幅达到 $O(1)$。

[^grover2001]: Lov K. Grover. *From Schrödinger's Equation to the Quantum Search Algorithm*. 2001. [arXiv:quant-ph/0109116](https://arxiv.org/abs/quant-ph/0109116).
