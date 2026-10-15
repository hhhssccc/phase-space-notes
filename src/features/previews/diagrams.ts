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

export const previewDiagrams: Record<string, { label: string; draw: () => string }> = {
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
