---
title: 沿着前缀，一步步找到解
description: 用一棵可回看的搜索树，理解 QiGA2 如何把计数结果变成逐位选择。
date: 2026-10-15
type: visualization
visualization: grover-counting
category: 结构化搜索
tags: [Grover, 交互图解]
featured: false
draft: false
related: [grover-algorithm-original-motivation]
---

## 可以试试

切换单解或多解，再拖动步骤，观察被保留的分支及每次实际试算。

## 模型与边界

这里展示计数结果怎样引导搜索。每一次计数对应经典振幅计算，其成本依赖 oracle 电路结构；调用次数少不等于总计算量小。

## 来源与延伸阅读

本图整理自「打开 Grover 黑盒」交互讲解，独立收录于演算室。图中示例用于解释机制。

- E. M. Stoudenmire 与 Xavier Waintal, *Opening the Black Box Inside Grover’s Algorithm*, Physical Review X **14**, 041029 (2024). [原论文](https://doi.org/10.1103/PhysRevX.14.041029)。
- [[grover-algorithm-original-motivation|Grover 算法的原始动机]]。
