export interface ReadingPath {
  id: string;
  title: string;
  question: string;
  prerequisites: string;
  steps: { id: string; purpose: string }[];
}

// Editorial connections are kept outside article manuscripts: a route is a
// reading suggestion, not a claim that the articles form a complete course.
export const readingPaths: ReadingPath[] = [
  {
    id: 'entropy-and-ensembles', title: '从信息熵到量子气体',
    question: '已知的信息怎样决定统计分布？粒子的量子性质又怎样改变它？',
    prerequisites: '概率、微积分与拉格朗日乘子法；量子气体部分还需了解全同粒子。',
    steps: [
      { id: 'information-entropy-and-everything', purpose: '从信息与不确定性建立熵的直觉。' },
      { id: 'maximum-entropy-and-statistical-ensembles', purpose: '把最大熵原理用于不同约束，得到三种系综。' },
      { id: 'quantum-gas', purpose: '用占据数研究 Bose–Einstein 与 Fermi–Dirac 分布。' },
    ],
  },
  {
    id: 'symmetry-and-structure', title: '从对称性走向数学结构',
    question: '怎样用群、表示与不变量组织物理问题？',
    prerequisites: '线性代数与基础力学；最后一篇还会用到群表示、迹与基本拓扑概念。',
    steps: [
      { id: 'modern-physics-intro-symmetry-and-conservation', purpose: '先从经典对称性与守恒量出发。' },
      { id: 'group-theory-bedtime-story', purpose: '补上群论的基本语言。' },
      { id: 'modern-physics-intro-groups-and-quantum-mechanics', purpose: '看群与表示怎样进入量子力学。' },
      { id: 'jones-polynomial-braids-and-link-invariants', purpose: '延伸到辫群与纽结不变量；这是进阶阅读。' },
    ],
  },
  {
    id: 'quantum-to-search', title: '从量子态到搜索算法',
    question: '从概率振幅与时间演化出发，怎样理解量子搜索？',
    prerequisites: '复数、矩阵运算与基础概率。',
    steps: [
      { id: 'griffiths-quantum-mechanics-born-to-uncertainty', purpose: '回顾波函数、Born 诠释与不确定性。' },
      { id: 'modern-physics-intro-groups-and-quantum-mechanics', purpose: '按需回读 Hilbert 空间、测量与时间演化。' },
      { id: 'grover-algorithm-original-motivation', purpose: '沿原始构思理解 Grover 搜索，再观察振幅旋转。' },
    ],
  },
];

export function pathsFor(id: string) {
  return readingPaths.filter(path => path.steps.some(step => step.id === id));
}

export function relatedFromPaths(id: string) {
  return [...new Set(pathsFor(id).flatMap(path => {
    const index = path.steps.findIndex(step => step.id === id);
    return [path.steps[index - 1]?.id, path.steps[index + 1]?.id].filter(Boolean) as string[];
  }))];
}
