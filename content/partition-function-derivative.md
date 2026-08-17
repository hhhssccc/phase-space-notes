---
title: 配分函数的导数为什么给出涨落
description: 一阶导数给平均值，二阶导数给方差，背后是累积量生成函数。
date: 2026-08-06
type: note
category: 统计力学
tags: [配分函数, 涨落, 系综]
featured: false
draft: false
related: [entropy-not-disorder]
backlinks: []
sidenotes: []
---

正则系综配分函数

$$
Z(\beta)=\sum_n e^{-\beta E_n}
$$

可以看作能量分布的矩生成结构。直接求导得到

$$
-\frac{\partial\log Z}{\partial\beta}=\langle E\rangle,
\qquad
\frac{\partial^2\log Z}{\partial\beta^2}=\langle E^2\rangle-\langle E\rangle^2.
$$

因此热容与能量涨落并不是两条偶然相似的公式；它们是同一个生成函数的一阶与二阶响应。
