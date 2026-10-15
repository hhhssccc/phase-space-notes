---
title: 小矩阵怎样装下大向量
description: 沿两条通道读取振幅，再观察计算途中先升后降的 Schmidt 秩。
date: 2026-10-15
type: visualization
visualization: grover-mps
category: 张量网络
tags: [Grover, 交互图解]
featured: false
draft: false
related: [grover-algorithm-original-motivation]
---

## 可以试试

先把比特串从 101 换成 000，再拖动计算阶段，比较终点与中途的键维。

## 模型与边界

示例固定三输入位、三辅助位及其排列，并提前给定目标 101。它说明最终状态简单不保证中途表示简单；这个可化简的玩具电路不是经典困难性的证明。

## 来源与延伸阅读

本图整理自「打开 Grover 黑盒」交互讲解，独立收录于演算室。图中示例用于解释机制。

- E. M. Stoudenmire 与 Xavier Waintal, *Opening the Black Box Inside Grover’s Algorithm*, Physical Review X **14**, 041029 (2024). [原论文](https://doi.org/10.1103/PhysRevX.14.041029)。
- [[grover-algorithm-original-motivation|Grover 算法的原始动机]]。
