// Original vector illustrations of ideas already discussed in the corresponding notes.
// Shared with the visual lab: white paper, blue/orange marks, direct labels, no frame.
const blue = '#329bff';
const orange = '#f3883b';
const gray = '#d8dde3';
const ink = '#5d6670';
const line = (x1: number, y1: number, x2: number, y2: number, color = gray, width = 3) => `<path d="M${x1} ${y1}L${x2} ${y2}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
const path = (d: string, color = blue, width = 5, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const dot = (x: number, y: number, color = orange, r = 9) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const text = (x: number, y: number, value: string, color = ink, size = 28) => `<text x="${x}" y="${y}" fill="${color}" font-family="Arial,sans-serif" font-size="${size}" text-anchor="middle">${value}</text>`;
const rect = (x: number, y: number, w: number, h: number, color: string) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}"/>`;
const curve = (fn: (t: number) => [number, number], count = 100) => Array.from({ length: count + 1 }, (_, i) => `${i ? 'L' : 'M'}${fn(i / count).map(n => n.toFixed(2)).join(' ')}`).join('');
const axes = () => line(90, 310, 560, 310) + line(90, 310, 90, 65);

function grover() {
  return [0, 1].map(stage => {
    const left = 65 + stage * 310;
    return text(left + 95, 65, stage ? 'ψ₁' : 'ψ₀') + line(left - 5, 300, left + 218, 300) + Array.from({ length: 8 }, (_, i) => {
      const height = 180 / Math.sqrt(8) * (stage ? (i === 5 ? 2.5 : .5) : 1);
      return rect(left + i * 28, 300 - height, 19, height, i === 5 ? orange : blue);
    }).join('');
  }).join('') + path('M303 198h32m-11-10 11 10-11 10', ink, 3);
}

function group() {
  return [165, 475].map((cx, i) =>
    `<rect x="${cx - 70}" y="130" width="140" height="140" fill="#f3f8ff" stroke="${blue}" stroke-width="5"/>` +
    [[-70,-70],[70,-70],[70,70],[-70,70]].map(([x,y], n) => dot(cx + x, 200 + y, n === i ? orange : blue, 11)).join('')
  ).join('') + path('M280 200h80m-14-12 14 12-14 12', ink, 3) + text(320, 160, 'R', orange) + text(320, 340, 'R⁴ = I');
}

function entropy() {
  const d = curve(p => [90 + 470 * p, 310 - 220 * (p === 0 || p === 1 ? 0 : -p * Math.log2(p) - (1-p) * Math.log2(1-p))]);
  return axes() + `<path d="${d}L560 310Z" fill="${blue}" opacity=".08"/>` + path(d) + line(325, 90, 325, 310, gray, 2) + dot(325, 90) + text(325, 350, '½') + text(565, 350, 'p') + text(72, 58, 'H');
}

function braid() {
  let body = '';
  for (let i = 0; i < 3; i++) {
    const y = 70 + i * 85;
    const under = `M430 ${y}C430 ${y+35} 210 ${y+50} 210 ${y+85}`;
    const over = `M210 ${y}C210 ${y+35} 430 ${y+50} 430 ${y+85}`;
    body += path(under, i % 2 ? blue : orange, 7) + path(over, '#fff', 22) + path(over, i % 2 ? orange : blue, 7);
  }
  return body + text(320, 375, 'σ₁³');
}

function laurent() {
  const circle = '<circle cx="180" cy="205" r="98" fill="#f3f8ff" stroke="'+blue+'" stroke-width="5"/>';
  return line(55,205,305,205) + line(180,80,180,330) + circle + dot(180,205,ink,5) +
    path('M267 160l2-20 18 8', orange, 5) + text(180,365,'C') +
    [0,1].map(i => line(365,150+i*120,590,150+i*120) + path(curve(t=>[365+225*t,150+i*120-36*Math.sin(2*Math.PI*(i+1)*t)]),i?orange:blue,5)).join('') + text(478,65,'eⁱⁿθ');
}

function ensembles() {
  const weights = Array.from({length:8},(_,i)=>Math.exp(-i*.38));
  return axes() + weights.map((p,i)=>rect(110+i*54,310-220*p,30,220*p,i===0?orange:blue)).join('') + text(545,355,'E') + text(76,58,'p') + text(360,65,'p ∝ e⁻ᵝᴱ');
}

function born() {
  const gaussian = (t:number):[number,number] => [90+470*t,310-220*Math.exp(-(((t-.5)/.2)**2))];
  const d = curve(gaussian);
  const area = curve(t=>gaussian(.36+.28*t),40);
  return axes() + `<path d="${area}L390.8 310L259.2 310Z" fill="${orange}" opacity=".28"/>` + path(d) +
    line(259.2,310,259.2,175,orange,3) + line(390.8,310,390.8,175,orange,3) + text(330,65,'|ψ(x)|²') + text(560,355,'x');
}

function well() {
  return path('M130 65V320H510V65',ink,4) + [1,2,3].map(n=> {
    const y=320-24*n*n;
    return line(130,y,510,y,gray,2) + path(curve(t=>[130+380*t,y-22*Math.sin(n*Math.PI*t)]),n===2?orange:blue,4) + text(560,y+8,`${n}²`);
  }).join('') + text(320,370,'Eₙ ∝ n²');
}

function symmetry() {
  return line(65,200,575,200) + line(320,55,320,345) +
    [1,.73,.46].map((scale,i)=>`<ellipse cx="320" cy="200" rx="${215*scale}" ry="${118*scale}" fill="none" stroke="${i===1?orange:blue}" stroke-width="4.5"/>`).join('') +
    dot(320,82,orange,8) + path('M302 72l18 10-17 10',orange,4) + text(565,237,'q') + text(350,64,'p') + text(320,380,'H = const.');
}

function gas() {
  return [0,1].map(j=> {
    const x=65+j*320;
    const levels=Array.from({length:4},(_,n)=>line(x,305-n*65,x+190,305-n*65));
    const particles=j ? Array.from({length:4},(_,n)=>dot(x+95,291-n*65,orange,11)) :
      [0,1,2].map(n=>dot(x+45+n*50,291,blue,11)).concat([dot(x+95,226,blue,11)]);
    return levels.join('') + particles.join('') + text(x+95,65,j?'Fermi':'Bose',j?orange:blue);
  }).join('');
}

function qiga() {
  const a = 1 / Math.sqrt(8);
  return [0, 1, 2, 3].map(stage => {
    const left = 62 + (stage % 2) * 318;
    const top = stage < 2 ? 40 : 230;
    return Array.from({ length: 8 }, (_, i) => {
      const value = stage === 0 ? a : stage === 1 ? (i === 5 ? -a : a) : i === 5 ? (stage === 2 ? -2*a : -1) : 0;
      const height = Math.abs(value) * 60;
      return rect(left+i*26,top,23,120,'#f5f6f7') +
        rect(left+i*26+4,top+60-(value>0?height:0),15,height,value<0?orange:blue);
    }).join('') + line(left,top+60,left+205,top+60,gray,1.5);
  }).join('');
}

function qigaTree() {
  const kept = new Set(['', '1', '10', '101']);
  const empty = new Set(['0', '100']);
  const position = (bits: string) => ({ x: bits ? (parseInt(bits,2)+.5)*640/(2**bits.length) : 320, y: 42+bits.length*98 });
  let edges = '', nodes = '';
  for(let depth=0;depth<=3;depth++)for(let i=0;i<2**depth;i++) {
    const bits = depth ? i.toString(2).padStart(depth,'0') : '';
    const p = position(bits);
    if(depth) {
      const parent = position(bits.slice(0,-1));
      edges += line(parent.x,parent.y,p.x,p.y,kept.has(bits)?blue:'#e5e8ec',kept.has(bits)?4:2);
    }
    if(!depth) { nodes += dot(p.x,p.y,blue,11); continue; }
    const fill = bits==='101' ? orange : kept.has(bits) ? '#e3f1ff' : '#f3f4f5';
    nodes += `<rect x="${p.x-24}" y="${p.y-17}" width="48" height="34" rx="6" fill="${fill}" stroke="${empty.has(bits)?orange:fill}" stroke-width="2"/>` +
      text(p.x,p.y+7,bits,bits==='101'?'#fff':kept.has(bits)?blue:empty.has(bits)?orange:'#a7afb8',20);
  }
  return edges + nodes;
}

// Gamma sampled on the positive real axis; orange dots are Γ(n) = (n−1)!.
function specialFunctions() {
  return axes() + path('M105.75 98.51 L108.71 133.67 L111.67 159.05 L114.64 178.18 L117.60 193.09 L120.56 205.00 L123.53 214.72 L126.49 222.78 L129.45 229.56 L132.41 235.33 L135.38 240.29 L138.34 244.59 L141.30 248.35 L144.26 251.65 L147.22 254.57 L150.19 257.16 L153.15 259.48 L156.11 261.55 L159.07 263.42 L162.04 265.10 L165.00 266.62 L167.96 267.99 L170.93 269.24 L173.89 270.38 L176.85 271.41 L179.81 272.35 L182.78 273.20 L185.74 273.98 L188.70 274.69 L191.66 275.34 L194.62 275.93 L197.59 276.46 L200.55 276.95 L203.51 277.39 L206.48 277.78 L209.44 278.13 L212.40 278.45 L215.36 278.73 L218.32 278.97 L221.29 279.18 L224.25 279.37 L227.21 279.52 L230.17 279.65 L233.14 279.74 L236.10 279.82 L239.06 279.86 L242.03 279.89 L244.99 279.89 L247.95 279.86 L250.91 279.82 L253.88 279.75 L256.84 279.66 L259.80 279.55 L262.76 279.42 L265.73 279.27 L268.69 279.09 L271.65 278.90 L274.61 278.69 L277.58 278.45 L280.54 278.20 L283.50 277.92 L286.46 277.63 L289.42 277.31 L292.39 276.97 L295.35 276.61 L298.31 276.23 L301.27 275.82 L304.24 275.40 L307.20 274.95 L310.16 274.47 L313.12 273.98 L316.09 273.46 L319.05 272.91 L322.01 272.34 L324.98 271.74 L327.94 271.12 L330.90 270.47 L333.86 269.79 L336.83 269.08 L339.79 268.34 L342.75 267.57 L345.71 266.77 L348.68 265.93 L351.64 265.06 L354.60 264.16 L357.56 263.22 L360.52 262.24 L363.49 261.22 L366.45 260.17 L369.41 259.07 L372.38 257.93 L375.34 256.74 L378.30 255.51 L381.26 254.23 L384.22 252.90 L387.19 251.51 L390.15 250.08 L393.11 248.59 L396.07 247.04 L399.04 245.43 L402.00 243.76 L404.96 242.02 L407.93 240.22 L410.89 238.34 L413.85 236.40 L416.81 234.38 L419.78 232.27 L422.74 230.09 L425.70 227.82 L428.66 225.46 L431.62 223.01 L434.59 220.46 L437.55 217.81 L440.51 215.06 L443.48 212.20 L446.44 209.22 L449.40 206.12 L452.36 202.90 L455.33 199.55 L458.29 196.07 L461.25 192.44 L464.21 188.67 L467.18 184.74 L470.14 180.66 L473.10 176.40 L476.06 171.98 L479.03 167.37 L481.99 162.57 L484.95 157.57 L487.91 152.36 L490.88 146.94 L493.84 141.29 L496.80 135.40 L499.76 129.27 L502.73 122.88 L505.69 116.21 L508.65 109.26 L511.61 102.02 L514.58 94.47 L517.54 86.59 L520.50 78.37', blue, 5) +
    [1, 2, 3, 4].map(n => {
      const value = [1, 1, 2, 6][n - 1];
      return dot(90 + 105*n, 310 - 34*value, orange, 8) + text(90 + 105*n, 345, `${n}`, ink, 22);
    }).join('') + text(335, 80, 'Γ(x)', blue, 32) + text(555, 345, 'x', ink, 22) +
    text(535, 112, '6', orange, 22) + text(320, 387, 'Γ(n) = (n − 1)!', orange, 26);
}

export const previewDiagrams: Record<string, { label: string; draw: () => string }> = {
  'special-functions': {label:'Gamma 函数与整数阶乘',draw:specialFunctions},
  'grover-subtraction': {label:'QiGA 的四组振幅',draw:qiga},
  'grover-counting': {label:'QiGA-2 的逐位计数树',draw:qigaTree},
  'grover-algorithm-original-motivation': {label:'Grover 搜索的一步振幅放大',draw:grover},
  'group-theory-bedtime-story': {label:'正方形旋转与循环群',draw:group},
  'information-entropy-and-everything': {label:'二元信息熵',draw:entropy},
  'jones-polynomial-braids-and-link-invariants': {label:'三次交叉的二股辫子',draw:braid},
  'laurent-expansion-from-orthogonality': {label:'复平面围道与 Fourier 模式',draw:laurent},
  'maximum-entropy-and-statistical-ensembles': {label:'Gibbs 概率权重',draw:ensembles},
  'griffiths-quantum-mechanics-born-to-uncertainty': {label:'波函数的概率诠释',draw:born},
  'modern-physics-intro-groups-and-quantum-mechanics': {label:'无限深势阱的能级与波函数',draw:well},
  'modern-physics-intro-symmetry-and-conservation': {label:'相空间中的等能轨道',draw:symmetry},
  'quantum-gas': {label:'玻色子与费米子的单态占据',draw:gas},
};

export function previewSvg(id: string) {
  const item = previewDiagrams[id];
  if (!item) throw new Error(`Missing preview diagram: ${id}`);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><title>${item.label}</title><rect width="640" height="400" fill="#fff"/>${item.draw()}</svg>`;
}
