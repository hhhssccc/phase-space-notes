import { GAMMA_CONTOURS, GAMMA_CONTOUR_OPACITY, type GammaMesh } from './mesh';

/**
 * Browser-independent, two-pass CPU rasterizer. The first pass resolves exact
 * per-pixel depth; the second shades each visible pixel once. Shared edges are
 * never stroked or blended, so tessellation cannot appear as a triangle grid.
 */
export function createGammaRaster(mesh: GammaMesh) {
  const vertexCount = mesh.positions.length / 3;
  const triangleCount = mesh.indices.length / 3;
  const projected = new Float64Array(vertexCount * 3);
  const normals = new Float32Array(mesh.normals.length);
  const linearColors = Float32Array.from(mesh.colors, value => Math.max(0, value) ** 2.2);
  const gradients = new Float32Array(triangleCount * 4);
  const surface = new Uint8Array(triangleCount);
  const gamma = Uint8Array.from({ length: 8193 }, (_, index) => Math.round((index / 8192) ** (1 / 2.2) * 255));
  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const offset = triangle * 3;
    surface[triangle] = Number(mesh.normals[mesh.indices[offset] * 3 + 1] > 0
      && mesh.normals[mesh.indices[offset + 1] * 3 + 1] > 0
      && mesh.normals[mesh.indices[offset + 2] * 3 + 1] > 0);
  }
  let cachedWidth = 0, cachedHeight = 0;
  let depth = new Float32Array(0);
  let primitive = new Int32Array(0);
  let weightA = new Float32Array(0), weightB = new Float32Array(0);
  let rays = new Float32Array(0);
  const lengthKey = Math.hypot(-0.55, 0.82, 0.95);
  const kx = -0.55 / lengthKey, ky = 0.82 / lengthKey, kz = 0.95 / lengthKey;
  const lengthFill = Math.hypot(0.8, 0.12, 0.55);
  const fx = 0.8 / lengthFill, fy = 0.12 / lengthFill, fz = 0.55 / lengthFill;
  const lengthRim = Math.hypot(0.25, 0.72, -0.9);
  const rx = 0.25 / lengthRim, ry = 0.72 / lengthRim, rz = -0.9 / lengthRim;
  const encode = (value: number) => gamma[Math.max(0, Math.min(8192, Math.round(value * 8192)))];

  function resize(width: number, height: number, focal: number) {
    if (width === cachedWidth && height === cachedHeight) return;
    cachedWidth = width; cachedHeight = height;
    const count = width * height;
    depth = new Float32Array(count);
    primitive = new Int32Array(count);
    weightA = new Float32Array(count); weightB = new Float32Array(count);
    rays = new Float32Array(count * 6);
    const scale = height * focal / 2;
    // Eye and half-light directions depend only on viewport/projection. Reuse
    // them for every orbit, rather than allocate vectors inside the pixel loop.
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * 6;
      let ex = (width / 2 - x - 0.5) / scale;
      let ey = (y + 0.5 - height / 2) / scale;
      const inverseEye = 1 / Math.sqrt(ex * ex + ey * ey + 1);
      ex *= inverseEye; ey *= inverseEye;
      const hx = kx + ex, hy = ky + ey, hz = kz + inverseEye;
      const inverseHalf = 1 / Math.sqrt(hx * hx + hy * hy + hz * hz);
      rays[offset] = ex; rays[offset + 1] = ey; rays[offset + 2] = inverseEye;
      rays[offset + 3] = hx * inverseHalf;
      rays[offset + 4] = hy * inverseHalf;
      rays[offset + 5] = hz * inverseHalf;
    }
  }

  return function render(pixels: Uint8ClampedArray, width: number, height: number, matrix: Float32Array, focal: number, density: number) {
    resize(width, height, focal);
    depth.fill(0); primitive.fill(-1); pixels.fill(0);
    const scale = height * focal / 2;
    for (let vertex = 0; vertex < vertexCount; vertex++) {
      const offset = vertex * 3;
      const x = mesh.positions[offset], y = mesh.positions[offset + 1], z = mesh.positions[offset + 2];
      const inverseDepth = -1 / (matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14]);
      projected[offset] = width / 2 + (matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12]) * scale * inverseDepth;
      projected[offset + 1] = height / 2 - (matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13]) * scale * inverseDepth;
      projected[offset + 2] = inverseDepth;
      const nx = mesh.normals[offset], ny = mesh.normals[offset + 1], nz = mesh.normals[offset + 2];
      normals[offset] = matrix[0] * nx + matrix[4] * ny + matrix[8] * nz;
      normals[offset + 1] = matrix[1] * nx + matrix[5] * ny + matrix[9] * nz;
      normals[offset + 2] = matrix[2] * nx + matrix[6] * ny + matrix[10] * nz;
    }

    // Depth pass. Perspective weights are retained only for the nearest face,
    // so occluded triangles never incur expensive fragment lighting.
    for (let offset = 0; offset < mesh.indices.length; offset += 3) {
      const a = mesh.indices[offset] * 3, b = mesh.indices[offset + 1] * 3, c = mesh.indices[offset + 2] * 3;
      const ax = projected[a], ay = projected[a + 1];
      const bx = projected[b], by = projected[b + 1], cx = projected[c], cy = projected[c + 1];
      const ia = projected[a + 2], ib = projected[b + 2], ic = projected[c + 2];
      if (ia <= 0 || ib <= 0 || ic <= 0 || ia >= 20 || ib >= 20 || ic >= 20) continue;
      const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
      // The mesh is a closed solid, so back faces cannot be visible.
      if (area >= -1e-12) continue;
      const left = Math.max(0, Math.floor(Math.min(ax, bx, cx)));
      const right = Math.min(width - 1, Math.ceil(Math.max(ax, bx, cx)));
      const top = Math.max(0, Math.floor(Math.min(ay, by, cy)));
      const bottom = Math.min(height - 1, Math.ceil(Math.max(ay, by, cy)));
      if (left > right || top > bottom) continue;
      const gax = (by - cy) / area, gay = (cx - bx) / area;
      const gbx = (cy - ay) / area, gby = (ax - cx) / area;
      const gcx = -gax - gbx, gcy = -gay - gby;
      const gradient = offset / 3 * 4;
      gradients[gradient] = gax * ia + gbx * ib + gcx * ic;
      gradients[gradient + 1] = gay * ia + gby * ib + gcy * ic;
      gradients[gradient + 2] = gax * mesh.positions[a + 1] * ia + gbx * mesh.positions[b + 1] * ib + gcx * mesh.positions[c + 1] * ic;
      gradients[gradient + 3] = gay * mesh.positions[a + 1] * ia + gby * mesh.positions[b + 1] * ib + gcy * mesh.positions[c + 1] * ic;
      let rowA = ((bx - left - 0.5) * (cy - top - 0.5) - (by - top - 0.5) * (cx - left - 0.5)) / area;
      let rowB = ((cx - left - 0.5) * (ay - top - 0.5) - (cy - top - 0.5) * (ax - left - 0.5)) / area;
      for (let y = top; y <= bottom; y++, rowA += gay, rowB += gby) {
        let wa = rowA, wb = rowB;
        for (let x = left; x <= right; x++, wa += gax, wb += gbx) {
          const wc = 1 - wa - wb;
          if (wa < -1e-7 || wb < -1e-7 || wc < -1e-7) continue;
          const inverseDepth = wa * ia + wb * ib + wc * ic;
          const pixel = y * width + x;
          if (inverseDepth <= depth[pixel]) continue;
          depth[pixel] = inverseDepth;
          primitive[pixel] = offset;
          weightA[pixel] = wa * ia / inverseDepth;
          weightB[pixel] = wb * ib / inverseDepth;
        }
      }
    }

    // Fragment pass: smooth perspective-correct normals/material, broad glaze
    // highlights, and the same seven world-height contours as WebGL/poster.
    const contourScale = Math.max(0.75, density) * 0.85;
    for (let pixel = 0; pixel < primitive.length; pixel++) {
      const offset = primitive[pixel];
      if (offset < 0) continue;
      const a = mesh.indices[offset] * 3, b = mesh.indices[offset + 1] * 3, c = mesh.indices[offset + 2] * 3;
      const pa = weightA[pixel], pb = weightB[pixel], pc = 1 - pa - pb;
      let nx = pa * normals[a] + pb * normals[b] + pc * normals[c];
      let ny = pa * normals[a + 1] + pb * normals[b + 1] + pc * normals[c + 1];
      let nz = pa * normals[a + 2] + pb * normals[b + 2] + pc * normals[c + 2];
      const inverseNormal = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz || 1);
      nx *= inverseNormal; ny *= inverseNormal; nz *= inverseNormal;
      const ray = pixel * 6;
      const diffuse = Math.max(0, nx * kx + ny * ky + nz * kz);
      const fill = Math.max(0, nx * fx + ny * fy + nz * fz);
      const edge = 1 - Math.max(0, Math.min(1, nx * rays[ray] + ny * rays[ray + 1] + nz * rays[ray + 2]));
      const halfway = Math.max(0, nx * rays[ray + 3] + ny * rays[ray + 4] + nz * rays[ray + 5]);
      const h2 = halfway * halfway, h4 = h2 * h2, h8 = h4 * h4, h16 = h8 * h8;
      const sheen = 0.24 * h16 * h16 * h8 + 0.035 * h8;
      const rim = edge * edge * edge * Math.max(0, nx * rx + ny * ry + nz * rz) * 0.10;
      const light = 0.32 + 0.66 * diffuse + 0.15 * fill;
      const triangle = offset / 3;
      let line = 0, reference = false;
      if (surface[triangle]) {
        const worldHeight = pa * mesh.positions[a + 1] + pb * mesh.positions[b + 1] + pc * mesh.positions[c + 1];
        const gradient = triangle * 4;
        const slope = (Math.abs(gradients[gradient + 2] - worldHeight * gradients[gradient])
          + Math.abs(gradients[gradient + 3] - worldHeight * gradients[gradient + 1])) / depth[pixel];
        let nearest = Infinity;
        for (const level of GAMMA_CONTOURS) {
          const distance = Math.abs(worldHeight - level);
          if (distance < nearest) { nearest = distance; reference = level === 0.76; }
        }
        const ratio = nearest / Math.max(0.00005, slope * contourScale);
        const amount = Math.max(0, Math.min(1, (ratio - 0.25) / 0.75));
        line = (1 - amount * amount * (3 - 2 * amount)) * GAMMA_CONTOUR_OPACITY;
      }
      const remaining = 1 - line;
      const output = pixel * 4;
      pixels[output] = encode(((pa * linearColors[a] + pb * linearColors[b] + pc * linearColors[c]) * light + sheen + 0.90 * rim) * remaining + (reference ? 0.07 : 0.10) * line);
      pixels[output + 1] = encode(((pa * linearColors[a + 1] + pb * linearColors[b + 1] + pc * linearColors[c + 1]) * light + 0.99 * sheen + 0.94 * rim) * remaining + (reference ? 0.11 : 0.10) * line);
      pixels[output + 2] = encode(((pa * linearColors[a + 2] + pb * linearColors[b + 2] + pc * linearColors[c + 2]) * light + 0.97 * sheen + 0.96 * rim) * remaining + (reference ? 0.14 : 0.10) * line);
      pixels[output + 3] = 255;
    }

    // Four subpixel coverage samples only along the outer silhouette. Interior
    // triangle boundaries stay fully opaque; this cannot reintroduce face seams.
    const candidates: number[] = [];
    for (let y = 1; y < height - 1; y++) for (let x = 1; x < width - 1; x++) {
      const pixel = y * width + x;
      const inside = primitive[pixel] >= 0;
      if ((primitive[pixel - 1] >= 0) === inside && (primitive[pixel + 1] >= 0) === inside
        && (primitive[pixel - width] >= 0) === inside && (primitive[pixel + width] >= 0) === inside) continue;
      candidates.length = 0;
      let red = 0, green = 0, blue = 0, contributors = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const neighbor = pixel + dy * width + dx;
        const triangle = primitive[neighbor];
        if (triangle < 0) continue;
        if (!candidates.includes(triangle)) candidates.push(triangle);
        red += pixels[neighbor * 4]; green += pixels[neighbor * 4 + 1]; blue += pixels[neighbor * 4 + 2]; contributors++;
      }
      let covered = 0;
      for (const sy of [0.25, 0.75]) for (const sx of [0.25, 0.75]) {
        const px = x + sx, py = y + sy;
        for (const triangle of candidates) {
          const a = mesh.indices[triangle] * 3, b = mesh.indices[triangle + 1] * 3, c = mesh.indices[triangle + 2] * 3;
          const ax = projected[a], ay = projected[a + 1], bx = projected[b], by = projected[b + 1], cx = projected[c], cy = projected[c + 1];
          const area = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
          const wa = ((bx - px) * (cy - py) - (by - py) * (cx - px)) / area;
          const wb = ((cx - px) * (ay - py) - (cy - py) * (ax - px)) / area;
          if (wa >= -1e-7 && wb >= -1e-7 && 1 - wa - wb >= -1e-7) { covered++; break; }
        }
      }
      const output = pixel * 4;
      if (!inside && covered && contributors) {
        pixels[output] = red / contributors;
        pixels[output + 1] = green / contributors;
        pixels[output + 2] = blue / contributors;
      }
      pixels[output + 3] = Math.round(covered * 255 / 4);
    }
  };
}
