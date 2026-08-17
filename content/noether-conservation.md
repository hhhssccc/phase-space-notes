---
title: 诺特定理真正守恒的是什么
description: 把“对称性导致守恒律”拆成一个可以看见的变分过程。
abstract: 从作用量的一参数连续变换出发，推导诺特流，并区分拉格朗日量不变、作用量不变与运动方程不变。
date: 2026-08-14
type: essay
category: 理论力学
tags: [诺特定理, 对称性, 守恒律]
featured: true
draft: false
related: [entropy-not-disorder, path-integral-many-paths]
backlinks: []
sidenotes:
  - marker: "*"
    title: 边界项
    body: 拉格朗日量可以改变一个全导数；只要端点条件合适，作用量仍保持不变。
---

“对称性导致守恒律”是一句正确但过于紧凑的话。真正进入证明的对象不是某张图形是否对称，而是作用量在一参数连续变换下如何变化。

## 一参数变换

令 $q_i(t)\to q_i(t)+\varepsilon\Delta q_i(t)$。若拉格朗日量的变化只是全导数，

$$
\delta L=\varepsilon\frac{\mathrm dF}{\mathrm dt},
$$

那么沿着满足欧拉—拉格朗日方程的轨道，

$$
Q=\sum_i\frac{\partial L}{\partial \dot q_i}\Delta q_i-F
$$

满足 $\mathrm dQ/\mathrm dt=0$。守恒量是变换生成元与正则动量的配对，而不是从“看起来对称”直接跳出来的标签。

## 三种容易混淆的不变性

1. 拉格朗日量逐点不变；
2. 拉格朗日量改变一个全导数，但作用量不变；
3. 运动方程形式不变，但未必能选出同一个作用量。

实际使用诺特定理时，第二种最常见，也最容易在一句口号里丢失。

## 平移与能量

时间平移对应的守恒量是哈密顿量，前提是拉格朗日量不显含时间。这里的“时间均匀”不是钟表图案的对称，而是实验在不同绝对时刻开始时，动力学规则不改变。
