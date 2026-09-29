export interface LabControl {
  key: string; label: string; value: number; output?: string; display?: string;
  min?: number; max?: number; step?: number; options?: number[];
}
export interface LabDefinition {
  title: string; description: string; formula: string; staticCaption: string; caption: string;
  source: { href: string; label: string }; controls: LabControl[];
}
export const labs = {
  grover: {
    title: '把振幅旋转看见',
    description: '接着文末的两次反射，把理想 Grover 迭代画在二维平面上。假设只有一个目标态，初态是均匀叠加；横、纵坐标是有正负号的振幅。',
    formula: '$\\theta=\\arcsin(1/\\sqrt N),\\quad P_k=\\sin^2((2k+1)\\theta)$',
    staticCaption: '静态示例：N = 16，尚未迭代，目标态概率为 1/16 = 6.25%。',
    caption: '迭代次数超过第一个峰值后，成功概率会回落。图中的概率来自理想模型，不包含设备噪声。',
    source: { href: 'https://quantum.cloud.ibm.com/learning/en/courses/fundamentals-of-quantum-algorithms/grover-algorithm/analysis', label: 'IBM Quantum · Grover 算法分析' },
    controls: [
      { key: 'size', label: '搜索空间 N', value: 16, options: [4, 16, 64, 256] },
      { key: 'iterations', label: '迭代次数 k', value: 0, min: 0, max: 24, step: 1, output: 'iteration-value', display: '0' },
    ],
  },
  gas: {
    title: '三种统计分布，放在一起看',
    description: '比较理想气体单个量子态的平均占据数，而非能量概率密度。取固定能量单位 E₀，基态能量为 0；为共同展示三种分布，化学势限制在 0 以下。',
    formula: '$\\bar n_{B/F}=1/(e^{(\\varepsilon-\\mu)/(k_BT)}\\mp1),\\quad \\bar n_{MB}=e^{-(\\varepsilon-\\mu)/(k_BT)}$',
    staticCaption: '静态示例：kBT/E₀ = 1，μ/E₀ = −0.5。实线为 B–E，点线为 F–D，虚线为 M–B。',
    caption: '实线 B–E · 点线 F–D · 虚线 M–B。纵轴随参数调整；M–B 仅在稀薄极限近似量子分布。这里独立调节温度与化学势，不固定总粒子数。',
    source: { href: 'https://www.damtp.cam.ac.uk/user/tong/statphys/statmechhtml/S3.html', label: 'David Tong · Quantum Gases' },
    controls: [
      { key: 'temperature', label: '温度 kBT / E₀', value: 1, min: .25, max: 2, step: .05, output: 'temperature-value', display: '1.00' },
      { key: 'chemical', label: '化学势 μ / E₀', value: -.5, min: -3, max: -.05, step: .05, output: 'chemical-value', display: '−0.50' },
    ],
  },
} satisfies Record<string, LabDefinition>;
export type LabKind = keyof typeof labs;
export const articleLabs: Record<string, LabKind> = {
  'grover-algorithm-original-motivation': 'grover',
  'quantum-gas': 'gas',
};
