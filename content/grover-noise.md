---
title: 噪声怎样吃掉 Grover 的优势
description: 同时改变问题规模与每轮噪声，比较理想和含噪声的成功率。
date: 2026-10-15
type: visualization
visualization: grover-noise
category: 量子噪声
tags: [Grover, 交互图解]
featured: false
draft: false
related: [grover-algorithm-original-motivation]
---

## 可以试试

保持噪声强度不变，增大比特数；再打开无噪声开关，对照两条曲线。

## 模型与边界

唯一解、均匀初态，每轮后施加全局去极化噪声。计算包含混合态回填项；这不是对所有硬件噪声、所有纠错方案或所有 Grover 应用的预测。

## 来源与延伸阅读

本图整理自「打开 Grover 黑盒」交互讲解，独立收录于演算室。图中示例用于解释机制。

- E. M. Stoudenmire 与 Xavier Waintal, *Opening the Black Box Inside Grover’s Algorithm*, Physical Review X **14**, 041029 (2024). [原论文](https://doi.org/10.1103/PhysRevX.14.041029)。
- [[grover-algorithm-original-motivation|Grover 算法的原始动机]]。
