import sharp from 'sharp';
import { createGammaMesh, GAMMA_CONTOURS, GAMMA_CONTOUR_OPACITY, GAMMA_VIEWS, type Vec3 } from './mesh';

const normalize = (x: number, y: number, z: number): Vec3 => {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
};
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cached = new Map<boolean, Promise<string>>();

/** The no-script poster uses a pixel depth buffer, never SVG face ordering. */
export function createGammaPoster(mobile = false): Promise<string> {
  if (!cached.has(mobile)) cached.set(mobile, renderPoster(mobile));
  return cached.get(mobile)!;
}

async function renderPoster(mobile: boolean): Promise<string> {
  const width = mobile ? 1215 : 2160;
  const height = Math.round(width * (mobile ? 3 / 4 : 21 / 50));
  const mesh = createGammaMesh({ resolution: 156 });
  const view = GAMMA_VIEWS.oblique;
  const ca = Math.cos(view.azimuth), sa = Math.sin(view.azimuth);
  const ce = Math.cos(view.elevation), se = Math.sin(view.elevation);
  const right: Vec3 = [ca, 0, -sa];
  const up: Vec3 = [-se * sa, ce, -se * ca];
  const eye: Vec3 = [ce * sa, se, ce * ca];
  const scale = height / (2 * Math.tan(Math.PI / 10));
  const count = mesh.positions.length / 3;
  const projected = new Float64Array(count * 3);
  const transformedNormals = new Float32Array(mesh.normals.length);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    const relative: Vec3 = [
      mesh.positions[offset] - view.target[0],
      mesh.positions[offset + 1] - view.target[1],
      mesh.positions[offset + 2] - view.target[2],
    ];
    const distance = view.distance - dot(relative, eye);
    projected[offset] = width / 2 + dot(relative, right) * scale / distance;
    projected[offset + 1] = height / 2 - dot(relative, up) * scale / distance;
    projected[offset + 2] = 1 / distance;
    const normal: Vec3 = [mesh.normals[offset], mesh.normals[offset + 1], mesh.normals[offset + 2]];
    transformedNormals[offset] = dot(normal, right);
    transformedNormals[offset + 1] = dot(normal, up);
    transformedNormals[offset + 2] = dot(normal, eye);
  }
  const pixels = new Uint8Array(width * height * 4);
  const depth = new Float32Array(width * height);
  const key = normalize(-0.55, 0.82, 0.95);
  const fill = normalize(0.80, 0.12, 0.55);
  const rim = normalize(0.25, 0.72, -0.90);
  const edge = (ax: number, ay: number, bx: number, by: number, x: number, y: number) => (bx - ax) * (y - ay) - (by - ay) * (x - ax);

  for (let triangle = 0; triangle < mesh.indices.length; triangle += 3) {
    const a = mesh.indices[triangle] * 3;
    const b = mesh.indices[triangle + 1] * 3;
    const c = mesh.indices[triangle + 2] * 3;
    const ax = projected[a], ay = projected[a + 1];
    const bx = projected[b], by = projected[b + 1];
    const cx = projected[c], cy = projected[c + 1];
    const area = edge(ax, ay, bx, by, cx, cy);
    if (Math.abs(area) < 1e-12) continue;
    const left = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
    const rightEdge = Math.min(width - 1, Math.ceil(Math.max(ax, bx, cx)));
    const top = Math.max(0, Math.floor(Math.min(ay, by, cy)));
    const bottom = Math.min(height - 1, Math.ceil(Math.max(ay, by, cy)));
    const facing = area < 0 ? 1 : -1;
    const surface = mesh.normals[a + 1] > 0 && mesh.normals[b + 1] > 0 && mesh.normals[c + 1] > 0;
    const gradientAX = (by - cy) / area, gradientAY = (cx - bx) / area;
    const gradientBX = (cy - ay) / area, gradientBY = (ax - cx) / area;
    const gradientCX = -gradientAX - gradientBX, gradientCY = -gradientAY - gradientBY;
    const gradientDepthX = gradientAX * projected[a + 2] + gradientBX * projected[b + 2] + gradientCX * projected[c + 2];
    const gradientDepthY = gradientAY * projected[a + 2] + gradientBY * projected[b + 2] + gradientCY * projected[c + 2];
    const gradientHeightX = gradientAX * mesh.positions[a + 1] * projected[a + 2]
      + gradientBX * mesh.positions[b + 1] * projected[b + 2] + gradientCX * mesh.positions[c + 1] * projected[c + 2];
    const gradientHeightY = gradientAY * mesh.positions[a + 1] * projected[a + 2]
      + gradientBY * mesh.positions[b + 1] * projected[b + 2] + gradientCY * mesh.positions[c + 1] * projected[c + 2];
    for (let y = top; y <= bottom; y += 1) for (let x = left; x <= rightEdge; x += 1) {
      const wa = edge(bx, by, cx, cy, x + 0.5, y + 0.5) / area;
      const wb = edge(cx, cy, ax, ay, x + 0.5, y + 0.5) / area;
      const wc = 1 - wa - wb;
      if (wa < -1e-8 || wb < -1e-8 || wc < -1e-8) continue;
      const inverseDepth = wa * projected[a + 2] + wb * projected[b + 2] + wc * projected[c + 2];
      const pixel = y * width + x;
      if (inverseDepth <= depth[pixel]) continue;
      depth[pixel] = inverseDepth;
      const pa = wa * projected[a + 2] / inverseDepth;
      const pb = wb * projected[b + 2] / inverseDepth;
      const pc = wc * projected[c + 2] / inverseDepth;
      const normal = normalize(
        facing * (pa * transformedNormals[a] + pb * transformedNormals[b] + pc * transformedNormals[c]),
        facing * (pa * transformedNormals[a + 1] + pb * transformedNormals[b + 1] + pc * transformedNormals[c + 1]),
        facing * (pa * transformedNormals[a + 2] + pb * transformedNormals[b + 2] + pc * transformedNormals[c + 2]),
      );
      const direction = normalize((width / 2 - x) / scale, (y - height / 2) / scale, 1);
      const halfway = normalize(key[0] + direction[0], key[1] + direction[1], key[2] + direction[2]);
      const diffuse = Math.max(0, dot(normal, key));
      const softFill = Math.max(0, dot(normal, fill));
      const fresnel = Math.pow(1 - Math.max(0, dot(normal, direction)), 3);
      const sheen = Math.pow(Math.max(0, dot(normal, halfway)), 40);
      const broadSheen = Math.pow(Math.max(0, dot(normal, halfway)), 8);
      const backLight = Math.max(0, dot(normal, rim));
      const worldHeight = pa * mesh.positions[a + 1] + pb * mesh.positions[b + 1] + pc * mesh.positions[c + 1];
      let line = 0;
      let reference = false;
      if (surface) {
        const pixelGradient = (Math.abs(gradientHeightX - worldHeight * gradientDepthX)
          + Math.abs(gradientHeightY - worldHeight * gradientDepthY)) / inverseDepth;
        const lineWidth = Math.max(0.00005, pixelGradient * 1.15);
        let nearest = Infinity;
        for (const level of GAMMA_CONTOURS) {
          const distance = Math.abs(worldHeight - level);
          if (distance < nearest) { nearest = distance; reference = level === 0.76; }
        }
        const t = Math.max(0, Math.min(1, (nearest / lineWidth - 0.25) / 0.75));
        line = (1 - t * t * (3 - 2 * t)) * GAMMA_CONTOUR_OPACITY;
      }
      const offset = pixel * 4;
      for (let channel = 0; channel < 3; channel += 1) {
        const color = pa * mesh.colors[a + channel] + pb * mesh.colors[b + channel] + pc * mesh.colors[c + channel];
        let light = Math.pow(color, 2.2) * (0.32 + 0.66 * diffuse + 0.15 * softFill)
          + [1, 0.99, 0.97][channel] * (0.24 * sheen + 0.035 * broadSheen)
          + [0.90, 0.94, 0.96][channel] * fresnel * backLight * 0.10;
        light = light * (1 - line) + (reference ? [0.07, 0.11, 0.14][channel] : 0.10) * line;
        pixels[offset + channel] = Math.round(Math.pow(Math.max(0, Math.min(1, light)), 1 / 2.2) * 255);
      }
      pixels[offset + 3] = 255;
    }
  }
  const image = await sharp(pixels, { raw: { width, height, channels: 4 } })
    .resize(mobile ? 900 : 1600, mobile ? 675 : 672).webp({ quality: 94, alphaQuality: 100, effort: 5 }).toBuffer();
  return `data:image/webp;base64,${image.toString('base64')}`;
}
