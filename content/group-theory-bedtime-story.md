---
title: 简明群论1
description: 从循环群、二面体群和置换群出发，串起共轭类、子群、商群、同态与不可约表示。
date: 2026-08-25
type: essay
category: 群论
tags:
  - 群论
  - 二面体群
  - 共轭类
  - 商群
  - 群表示
  - 简明群论
featured: false
draft: false
related: []
backlinks: []
mathDisplay: plain
sidenotes: []
---

<figure class="lead-figure">
  <img src="../../figures/group-theory-bedtime-story/lead.jpg?v=1" alt="白色背景中，两位动漫少女并肩相对，白色花叶从人物边缘向背景消散" width="1280" height="853" loading="eager" decoding="async" />
</figure>

## 群的刻画

群满足：

1. 结合律：

   $$
   a(bc)=(ab)c.
   $$

2. 有单位元 $e$。
3. 对每个 $a$，有逆元 $a^{-1}$。

群的阶记为 $|G|$。

## 一些例子
### 循环群 $C_n$

把正 $n$ 边形旋转 $2\pi/n$ 的操作记为 $c$。$c$ 是生成元，满足

$$
c^n=e,
$$

所以 $c$ 是 $n$ 阶元素。循环群可以写成

$$
C_n=\{e,c,c^2,\ldots,c^{n-1}\},
$$

并且

$$
C_n\cong\mathbb Z_n,
$$

对应模 $n$ 加法，例如

$$
[0]+[1]=[1].
$$

### 二面体群 $D_n$

如果正 $n$ 边形无方向，除了旋转，还可以沿对称轴反射，于是得到二面体群 $D_n$。

以 $D_3$ 为例，旋转为 $e,c,c^2$，三条反射轴对应 $b_1,b_2,b_3$。一般有

$$
bc\ne cb,
$$

所以它是非阿贝尔群；同时

$$
bcb=c^{-1}.
$$

顺时针与逆时针在反射下交换。二面体群可写成

$$
D_n=\langle c,b\mid c^n=e,\ b^2=e,\ bcb=c^{-1}\rangle.
$$

在 $D_3$ 中，

$$
cb_1c^{-1}=b_2,
\qquad
c^{-1}b_1c=b_3.
$$

这就是共轭：旋转坐标后，反射轴也跟着改变。

#### $D_4$ 群

对于正方形，基本旋转为

$$
c=\frac{2\pi}{4}=\frac{\pi}{2}.
$$

四条反射轴在旋转共轭下满足

$$
\begin{aligned}
cb_1c^{-1}&=b_3,\\
cb_2c^{-1}&=b_4,\\
cb_3c^{-1}&=b_1,\\
cb_4c^{-1}&=b_2.
\end{aligned}
$$

因此反射被分成两个共轭类：

$$
\{b_1,b_3\},
\qquad
\{b_2,b_4\}.
$$

$c^2$ 对应旋转 $\pi$，并且对任意 $g\in D_4$ 都有

$$
gc^2=c^2g.
$$

这引出群的中心，也即与任一群元可交换的元素集。
一般地，对 $n\ge 3$，

$$
n\text{ 为奇数}:\quad Z(D_n)=\{e\},
$$

$$
n\text{ 为偶数}:\quad Z(D_n)=\{e,c^{n/2}\}.
$$

可以发现$D_4$ 群与$D_3$ 群有着不同的群结构。
### 置换群 $S_n$

置换群 $S_n$ 是n个元素的置换操作组成的群
有

$$
|S_n|=n!
$$

个元素。

当 $n=2$ 时，唯一的非平凡置换是交换

$$
(1,2)=a,
\qquad
a^2=e,
$$

所以

$$
S_2\cong C_2\cong\mathbb Z_2.
$$

当 $n=3$ 时，置换包括

$$
(1,2),\ (2,3),\ (1,3)
$$

三个二阶元素，以及

$$
(1,2,3),\ (1,3,2)
$$

两个三阶元素，因此

$$
S_3\cong D_3.
$$

当 $n=4$ 时，

$$
S_4\ne D_4.
$$

把正方形顶点记为 $A,B,C,D$，$D_4$ 可以作为 $S_4$ 的子群作用在这四个顶点上，但只交换一条边上的两个顶点，另一条边不动这样的操作属于 $S_4$ 但不属于$D_4$ 。

$S_4$ 有五个共轭类：

- $1$ 个单位元 $e$；
- $6$ 个换位 $(i,j)$，即 $\binom42$ 个二阶元素；
- $3$ 个双换位 $(i,j)(k,l)$，为二阶元素；
- $8$ 个三循环 $(i,j,k)$，为三阶元素；
- $6$ 个四循环 $(i,j,k,l)$，为四阶元素。

相同循环结构的置换彼此共轭。

#### Cayley 定理
有限群 $G$ 可以嵌入 $S_{|G|}$。

设

$$
G=\{g_1,\ldots,g_n\}.
$$

任取 $g\in G$，左乘给出

$$
gG=\{gg_1,\ldots,gg_n\}.
$$

若 $gh_1=gh_2$，左乘 $g^{-1}$ 得 $h_1=h_2$，所以 $gG$ 仍有 $n$ 个不同元素，对应于对群元素的一次置换。

### 无限群与矩阵群

整数加法群 $(\mathbb Z,+)$ 是第一个无限群、循环群。圆群中

$$
\theta\in[0,2\pi),
\qquad
\theta_1\circ\theta_2=\theta_1+\theta_2\pmod{2\pi},
$$

也可写成

$$
U(1)=\{e^{i\theta}\mid\theta\in[0,2\pi)\}.
$$

它可以看作 $C_n$ 在 $n\to\infty$ 时的极限。

矩阵群一般取可逆矩阵，即

$$
\det A\ne0.
$$

实数域和复数域上的一般线性群分别记为

$$
GL(n,\mathbb R),
\qquad
GL(n,\mathbb C).
$$

若进一步要求

$$
\det A=1,
$$

则得到

$$
SL(n,\mathbb R),
\qquad
SL(n,\mathbb C).
$$

## 共轭类

对 $a,b\in G$，若存在 $g\in G$ 使

$$
a=gbg^{-1},
$$

则称 $a,b$ 共轭。

> [!insight]
> 换坐标／重编号后，哪些操作一样？

共轭满足：

$$
a\sim a,
$$

$$
a\sim b\ \Longrightarrow\ b\sim a,
$$

$$
a\sim b,\ b\sim c\ \Longrightarrow\ a\sim c.
$$

判断共轭的一个必要条件是

$$
a\sim b
\quad\Longrightarrow\quad
\operatorname{Ord}(a)=\operatorname{Ord}(b).
$$

反过来不一定成立：$D_4$ 群
可以有

$$
b_1^2=b_2^2=e,
\qquad
b_1\not\sim b_2.
$$

共轭是一个等价关系，因此群可以按共轭类切块：

$$
G=C_1\sqcup C_2\sqcup\cdots.
$$

对于阿贝尔群，

$$
gag^{-1}=a,
$$

每个元素各自构成一个共轭类。共轭类大小反映了群的非交换性。

$D_4$ 的共轭类为

$$
\{e\},
\quad
\{b_1,b_3\},
\quad
\{b_2,b_4\},
\quad
\{c,c^3\},
\quad
\{c^2\}.
$$

其中 $\{b_1,b_3\}$ 对应顶点—顶点轴，$\{b_2,b_4\}$ 对应中点—中点轴，$\{c,c^3\}$ 是旋转，$\{c^2\}$ 是中心元素。

群的中心为

$$
Z(G)=\{a\in G\mid ag=ga,\ \forall g\in G\}.
$$
$$a\in Z(G)\Leftrightarrow a的共轭类只有自己$$
阿贝尔群满足

$$gag^{-1}=a$$
$$
\operatorname{Cl}(a)=\{a\},
\qquad
Z(G)=G.
$$

## 子群

若 $H\subseteq G$，并且 $H$ 用 $G$ 的运算仍然构成群，则记作

$$
H\le G.
$$


 $H$ 不同于 $\{e\}$ 和 $G\to$ 真子群（proper subgroup）

判断 $H$ 是否为子群时，G的结合律由 H继承，只需检查：

1. $e\in H$；
2. $a,b\in H\Longrightarrow ab\in H$；
3. $a\in H\Longrightarrow a^{-1}\in H$。

也可压缩成一步：

$$
H\ne\varnothing,
\qquad
a,b\in H\Longrightarrow ab^{-1}\in H.
$$

取 $a=b$ 得 $aa^{-1}=e$；

取 $a,b^{-1}\in H$ 得 $a(b^{-1})^{-1}=ab\in H$；

取 $e,a\in H$ 得 $ea^{-1}=a^{-1}\in H$。

> [!question]
> 子群能不能用来切块？

答案由陪集给出。

可以通俗的认为是把G用子群H的“平移”来切块

对 $H\le G$，任取 $g\in G$，左陪集与右陪集分别为

$$
gH=\{gh\mid h\in H\},
\qquad
Hg=\{hg\mid h\in H\}.
$$

 $g\ne e$时，通常$gH$ 一般不是一个群。同时

$$
|gH|=|H|.
$$

例如在

$$
D_3=\{e,c,c^2,b_1,b_2,b_3\}
$$

中，取

$$
H=\{e,b_1\}.
$$

同一个陪集可以有不同代表元：

$$
b_1H=\{e,b_1\}=eH.
$$

其余陪集为

$$
cH=\{c,b_3\},
\qquad
c^2H=\{c^2,b_2\},
$$

于是

$$
D_3=eH\sqcup cH\sqcup c^2H.
$$

> [!question]
> 切块一定能成立？

定理：任意两个左陪集要么相同，要么完全不交。

### Lagrange 定理
若 $H\le G$，则

$$
|H|\mid |G|,
$$

并且

$$
|G|=[G:H]|H|,
$$

其中 $[G:H]$ 是陪集个数。一个推论是：素数阶群无真子群，一定是循环群。

## 正规子群与商群

### 正规子群
> [!question]
> $gH\ne Hg$？

若 $H\le G$ 且对任意 $g\in G$ 都有

$$
gHg^{-1}=H,
$$

等价地，

$$
gH=Hg,
$$

则称 $H$ 是正规子群，记为

$$
H\triangleleft G.
$$

直觉上，它类似共轭：在“换坐标”下不变，是内部对称性下不变的子群。

在 $D_3$ 中，

$$
C_3=\{e,c,c^2\}
$$

是正规子群，因为

$$
b_i c b_i^{-1}=c^2.
$$

但

$$
C_2=\{e,b_1\}
$$

不是正规子群，因为

$$
cb_1c^{-1}=b_2.
$$
### 中心和正规子群的对比

中心要求群里的每一个元素都在共轭里不变，

正规子群则只要求全集保持不变即可


### 商群

有了正规子群，就可以把陪集做成一个新群——商群。

若 $H\triangleleft G$，商群由陪集 $g_iH$ 构成，运算定义为

$$
(g_1H)\circ(g_2H):=(g_1g_2)H.
$$

以整数加法群为例，

$$
3\mathbb Z=\{3k\mid k\in\mathbb Z\}
$$

是 $\mathbb Z$ 的子群。它的元素包括

$$
\ldots,-6,-3,0,3,6,9,\ldots.
$$

在模 $3$ 的等价关系中，

$$
3\sim0\sim6\sim9,
$$

而

$$
4\sim1.
$$

它们是不同代表元，但在商群中都变成 $[1]$。子群 $3\mathbb Z$ 被压缩成单位元。

商群可以看作粗粒化：不再区分相差一个 $H$ 中元素的群元素。

如果

$$
g_1^{-1}g_2\in H,
$$

那么

$$
g_1H=g_2H,
$$

即 $g_1,g_2$ 被看作同一个东西。

> [!question]
> 商群良定义？（well-definedness?）

同一陪集可写成 $g_1H=g_2H$，代表元不唯一，但运算结果只取决于“陪集”本身：

$$
(g_1H)(kH)=(g_2H)(kH).
$$

这只依赖于陪集本身，要求

$$
H\triangleleft G.
$$
这里不叙述这个证明

## 直积

群 $G,H$ 的直积为

$$
G\times H=\{(g,h)\mid g\in G,\ h\in H\}.
$$

其中有两个特殊子群

$$
G'=\{(g,e_H)\}=G\times\{e_H\}\cong G,
$$

$$
H'=\{(e_G,h)\}=\{e_G\}\times H\cong H.
$$

相应商群满足

$$
(G\times H)/G'\cong H,
\qquad
(G\times H)/H'\cong G.
$$

并且

$$
(g,e)(e,h)=(g,h)=(e,h)(g,e),
$$

所以由交换性可见这两个子群都是正规子群。群的阶满足

$$
|G\times H|=|G|\,|H|.
$$

例如

$$
\mathbb Z_2\times\mathbb Z_3
=\{(0,0),(0,1),(0,2),(1,0),(1,1),(1,2)\}.
$$

$$|\mathbb Z_2\times\mathbb Z_3|=|\mathbb Z_2|\times|\mathbb Z_3|$$

> [!question]
> $G/H\cong K\Longrightarrow G\cong H\times K?$

这个关系并不总成立。

正例

$$
D_2\cong C_2\times C_2,
$$

其中 $C_2=\operatorname{gp}\{a\}$、$a^2=e$，另一个 $C_2=\operatorname{gp}\{b\}$、$b^2=e$。直积元素为

$$
(e,e),\ (a,e),\ (e,b),\ (a,b),
$$

非单位元都满足 $x^2=e$。

反例是

$$
C_4\ne C_2\times C_2.
$$

$C_4=\operatorname{gp}\{a\}$、$a^4=e$，有四阶元素 $a$；而 $C_2\times C_2$ 无四阶元素。

另一个反例是

$$
D_3/C_3\cong C_2,
$$

但

$$
D_3\ne C_3\times C_2,
$$

因为后者是阿贝尔群。若 $p_1,p_2$ 互素，则

$$
C_{p_1}\times C_{p_2}\cong C_{p_1p_2}.
$$

## 同态

同态（homomorphism）是保持乘法的映射

$$
f:A\to B.
$$

由保乘法的条件，它自然满足

$$
f(e_A)=e_B,
\qquad
f(a^{-1})=f(a)^{-1}.
$$

同态可以丢失信息。

若同态 faithful，则它是单射、不丢信息，并且

$$
\operatorname{im}f\le B.
$$

同构是完全一一对应。

> [!question]
> 哪些元素被映射到单位元？

这给出核：

$$
\ker f=\{a\in A\mid f(a)=e_B\}.
$$

若 $k\in\ker f$，则对任意 $g$，

$$
f(gkg^{-1})
=f(g)f(k)f(g^{-1})
=f(g)e f(g)^{-1}
=e,
$$

所以

$$
\ker f\triangleleft G.
$$

同态的核是正规子群。或者说，正规子群可以看作某个同态的核。

例如

$$
f:\mathbb Z\to\mathbb Z_n,
\qquad
k\mapsto k\bmod n.
$$

此时

$$
\ker f=n\mathbb Z,
\qquad
\operatorname{im}f=\mathbb Z_n.
$$

可以写成

$$
\mathbb Z/\ker f\cong\operatorname{im}f,
$$

一般地，

$$
G/\ker f\cong\operatorname{im}f.
$$
这就是所谓的第一同构定理。
## 表示

表示是同态

$$
G\longrightarrow GL(n,\mathbb C).
$$

### 几个例子

对

$$
C_2=\{e,c\},
$$

两个正规子群是 $\{e\}$ 与 $C_2$。

忠实表示可以写成

$$
\rho(e)=1,
\qquad
\rho(c)=-1.
$$

平凡表示为

$$
\rho(e)=\rho(c)=1.
$$

二维表示为

$$
D(e)=
\begin{pmatrix}
1&0\\
0&1
\end{pmatrix},
\qquad
D(c)=
\begin{pmatrix}
0&1\\
1&0
\end{pmatrix}.
$$



表示的作用对象为平面向量的。

圆群在二维平面中的表示为

$$
D(\theta)=
\begin{pmatrix}
\cos\theta&-\sin\theta\\
\sin\theta&\cos\theta
\end{pmatrix}.
$$

在三维空间中，它可写成

$$
D(\theta)=
\begin{pmatrix}
\cos\theta&-\sin\theta&0\\
\sin\theta&\cos\theta&0\\
0&0&1
\end{pmatrix}.
$$

也可以有一维表示

$$
\rho(\theta)=e^{i\theta}.
$$

### 等价表示与特征标

群 $G$ 的两个 $n$ 维表示 $D^{(1)},D^{(2)}$，若对所有 $g\in G$ 都有

$$
D^{(1)}(g)=S D^{(2)}(g)S^{-1},
$$

则它们等价。这相当于换基底，对应同一个线性作用。总可以找到幺正矩阵

$$
U(g)=S D(g)S^{-1},
\qquad
D\sim U.
$$

特征标为

$$
\chi=\{\chi(g)\mid g\in G\},
\qquad
\chi(g)=\operatorname{Tr}D(g).
$$

由于

$$
\operatorname{Tr}(SDS^{-1})=\operatorname{Tr}D,
$$

特征标不依赖基底，等价表示的特征标是相同的。若

$$
g\sim g',
\qquad
g'=hgh^{-1},
$$

则

$$
\operatorname{Tr}D(g')=\operatorname{Tr}D(g),
$$

所以

$$
\chi(g')=\chi(g).
$$

特征标是在共轭类上恒定、不依赖基底的复函数。

### 可约性
圆群的三维旋转表示
$$
D(\theta)=
\begin{pmatrix}
\cos\theta&-\sin\theta&0\\
\sin\theta&\cos\theta&0\\
0&0&1
\end{pmatrix}.
$$
可以拆成

$$
\mathbb R^3=\mathbb R_{xy}^2\oplus\mathbb R_z.
$$

如果能经相似变换写成分块对角形式

$$
S D(g)S^{-1}
=
\begin{pmatrix}
A(g)&0\\
0&B(g)
\end{pmatrix},
$$

表示就是可约的。复杂表示可以继续分解为不可约表示（irreps）。



对

$$
D_3=\{e,c,c^2,b_1,b_2,b_3\},
$$

有两个一维不可约表示和一个二维不可约表示。对一组完整的互不等价不可约表示，

$$
\sum_\alpha d_\alpha^2=|G|,
$$
其中 $d_\alpha$ 是第 $\alpha$ 个不可约表示的维数，$\alpha$ 遍历这组完整表示。

即

$$
1^2+1^2+2^2=6.
$$

##  不可约表示与正交关系
$$
D_3=\{e,c,c^2,b_1,b_2,b_3\},
$$
$D_3$的前两个不可约表示可写成六分量向量：

$$
D^{(1)}=(1,1,1,1,1,1),
$$

$$
D^{(2)}=(1,1,1,-1,-1,-1),
$$

元素顺序为

$$
(e,c,c^2,b_1,b_2,b_3).
$$



$D^{(1)}$、$D^{(2)}$ 都是六分量向量，并且向量之间相互正交。

> [!question]
> $D^{(3)}$怎么类似的写做向量？

取 $D^{(3)}$ 的 $[1,1]$ 位置矩阵元，

$$
D^{(3)}[1,1]
=
\left(1,-\frac12,-\frac12,-1,\frac12,\frac12\right).
$$
可以发现其同样与其他向量正交

### 基本正交定理

一般地，在表示 $D^{(\mu)}$ 中固定一个矩阵位置 $(j,k)$，遍历所有 $g$，就得到一个 $|G|$ 维复向量：

$$
V_{jk}^{(\mu)}
=
\left(
\bigl(D^{(\mu)}(g_1)\bigr)_{jk},
\ldots,
\bigl(D^{(\mu)}(g_{|G|})\bigr)_{jk}
\right).
$$

若

$$
(\mu,j,k)\ne(\nu,s,t),
$$

则

$$
\left\langle V_{jk}^{(\mu)},V_{st}^{(\nu)}\right\rangle=0.
$$

正交关系写成

$$
\frac1{|G|}
\sum_{g\in G}
\left(\bigl(D^{(\mu)}(g)\bigr)_{jk}\right)^*
\bigl(D^{(\nu)}(g)\bigr)_{st}
=
\frac1{d_\mu}
\delta_{\mu\nu}\delta_{js}\delta_{kt},
$$

其中 $d_\mu$ 是表示的维数。对当前取出的互不等价不可约表示，把这些向量限制在 $|G|$ 维空间中，得到

$$
\sum_\mu d_\mu^2\le |G|.
$$
当 $\mu$ 遍历一组完整的互不等价不可约表示时，这个不等式饱和为等式。
