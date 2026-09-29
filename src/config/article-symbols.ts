// Optional reading aids, transcribed from each article's own conventions.
export const articleSymbols: Record<string, { symbol: string; meaning: string }[]> = {
  'grover-algorithm-original-motivation': [
    { symbol: '$N$', meaning: '搜索空间的大小。文中考虑一个被标记的目标态。' },
    { symbol: '$|s\\rangle$', meaning: '所有计算基态的均匀叠加态。' },
    { symbol: '$D=2|s\\rangle\\langle s|-I$', meaning: '扩散算符；关于均匀态的反射。' },
    { symbol: '$R=I-2|x\'\\rangle\\langle x\'|$', meaning: '将目标态的振幅变号，其他基态保持不变。' },
  ],
  'quantum-gas': [
    { symbol: '$\\beta=1/(k_B T)$', meaning: '逆温度。T 为绝对温度，k_B 为 Boltzmann 常数。' },
    { symbol: '$\\mu$', meaning: '化学势，具有能量的量纲。' },
    { symbol: '$\\varepsilon_\\alpha$', meaning: '单粒子态 α 的能量。' },
    { symbol: '$n_\\alpha$', meaning: '态 α 的占据数；玻色子取非负整数，费米子取 0 或 1。' },
    { symbol: '$\\Xi$', meaning: '巨配分函数；理想气体中可以分解为各单粒子态的贡献。' },
  ],
  'jones-polynomial-braids-and-link-invariants': [
    { symbol: '$B_n$', meaning: 'n 股辫群。' },
    { symbol: '$\\sigma_i$', meaning: '第 i 与第 i+1 股的交叉生成元；逆元表示相反交叉。' },
    { symbol: '$e_i$', meaning: '文中代数的幂等生成元，满足 e_i²=e_i。' },
    { symbol: '$\\tau=t/(1+t)^2$', meaning: '相邻幂等元关系及 Markov 迹中的参数。' },
    { symbol: '$d=-(t+1)/\\sqrt t$', meaning: '本文 Jones 多项式定义采用的归一化因子。' },
  ],
};
