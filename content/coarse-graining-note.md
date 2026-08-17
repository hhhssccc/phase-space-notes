---
title: 粗粒化究竟丢掉了什么信息？
description: 相空间网格不是修改微观动力学，而是声明实验分辨率。
date: 2026-08-16
type: note
category: 统计力学
tags: [粗粒化, 熵, 相空间]
featured: false
draft: false
related: [entropy-not-disorder]
backlinks: [entropy-not-disorder]
sidenotes: []
---

粗粒化常被说成“把细节平均掉”，但这句话没有说明平均发生在哪里。相空间粗粒化首先选定一组有限分辨率的格子，再把格子内部的点视为实验上不可区分。

## 两种分布

细粒度分布 $\rho(X,t)$ 依照刘维尔方程演化；粗粒度分布则是对每个格子 $C_\alpha$ 的平均：

$$
\bar\rho_\alpha(t)=\frac{1}{|C_\alpha|}\int_{C_\alpha}\rho(X,t)\,\mathrm dX.
$$

丢掉的不是能量或粒子数，而是格子内部越来越细的相关结构。把网格加密，熵增出现的时间尺度也会改变。
