import { createFragmentShader, vertexShader } from './shaders';
import { GAMMA_CONTOURS, GAMMA_CONTOUR_OPACITY } from './mesh';
import type { createGammaMesh, GAMMA_VIEWS } from './mesh';

export type GammaMesh = ReturnType<typeof createGammaMesh>;
export type GammaView = (typeof GAMMA_VIEWS)[keyof typeof GAMMA_VIEWS];
export interface SurfaceRenderer {
  kind: 'webgl' | 'canvas2d';
  draw(view: GammaView, width: number, height: number): boolean;
  dispose(): void;
}

const FOV = Math.PI / 5; // 36°, shared with the static cover's camera.
const near = 0.05;

/** Y is height; azimuth zero looks along +Z toward the target. */
function camera(view: GammaView, aspect: number) {
  const ca = Math.cos(view.azimuth), sa = Math.sin(view.azimuth);
  const ce = Math.cos(view.elevation), se = Math.sin(view.elevation);
  const right = [ca, 0, -sa];
  const up = [-se * sa, ce, -se * ca];
  const eye = [ce * sa, se, ce * ca];
  const distance = view.distance * Math.max(1, 0.95 / aspect);
  const target = view.target;
  const dot = (a: number[], b: readonly number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const matrix = new Float32Array([
    right[0], up[0], eye[0], 0,
    right[1], up[1], eye[1], 0,
    right[2], up[2], eye[2], 0,
    -dot(right, target), -dot(up, target), -dot(eye, target) - distance, 1,
  ]);
  const f = 1 / Math.tan(FOV / 2);
  const far = Math.max(100, distance * 5);
  const projection = new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) / (near - far), -1,
    0, 0, 2 * far * near / (near - far), 0,
  ]);
  return { matrix, projection, f, distance };
}

function pixelSize(canvas: HTMLCanvasElement, width: number, height: number, cap: number) {
  // Bound both density and total backing pixels on large/high-density displays.
  const density = Math.min(devicePixelRatio || 1, cap, Math.sqrt(2_400_000 / Math.max(1, width * height)));
  const w = Math.max(1, Math.round(width * density));
  const h = Math.max(1, Math.round(height * density));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return { w, h };
}

export function createWebGLRenderer(canvas: HTMLCanvasElement, mesh: GammaMesh): SurfaceRenderer | null {
  let gl: WebGLRenderingContext | null = null;
  const buffers: WebGLBuffer[] = [];
  const shaders: WebGLShader[] = [];
  let program: WebGLProgram | null = null;
  const dispose = () => {
    if (!gl) return;
    buffers.forEach(buffer => gl!.deleteBuffer(buffer));
    shaders.forEach(shader => gl!.deleteShader(shader));
    if (program) gl.deleteProgram(program);
    // Astro replaces the canvas; release the GPU context as well as its buffers.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  };
  try {
    gl = canvas.getContext('webgl', {
      alpha: true, depth: true, antialias: true, stencil: false,
      premultipliedAlpha: false, preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: false, powerPreference: 'low-power',
    });
    if (!gl) return null;
    const context = gl;
    const fragmentShader = createFragmentShader(Boolean(context.getExtension('OES_standard_derivatives')));
    program = context.createProgram();
    if (!program) throw new Error('Gamma program unavailable');
    for (const [type, source] of [[context.VERTEX_SHADER, vertexShader], [context.FRAGMENT_SHADER, fragmentShader]] as const) {
      const shader = context.createShader(type);
      if (!shader) throw new Error('Gamma shader unavailable');
      shaders.push(shader);
      context.shaderSource(shader, source);
      context.compileShader(shader);
      if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) throw new Error('Gamma shader could not compile');
      context.attachShader(program, shader);
    }
    context.linkProgram(program);
    if (!context.getProgramParameter(program, context.LINK_STATUS)) throw new Error('Gamma program could not link');
    context.useProgram(program);
    const attribute = (name: string, data: Float32Array) => {
      const buffer = context.createBuffer();
      if (!buffer) throw new Error('Gamma vertex buffer unavailable');
      buffers.push(buffer);
      context.bindBuffer(context.ARRAY_BUFFER, buffer);
      context.bufferData(context.ARRAY_BUFFER, data, context.STATIC_DRAW);
      const location = context.getAttribLocation(program!, name);
      if (location < 0) throw new Error('Gamma vertex attribute unavailable');
      context.enableVertexAttribArray(location);
      context.vertexAttribPointer(location, 3, context.FLOAT, false, 0, 0);
    };
    attribute('aPosition', mesh.positions);
    attribute('aNormal', mesh.normals);
    attribute('aColor', mesh.colors);
    const indexBuffer = context.createBuffer();
    if (!indexBuffer) throw new Error('Gamma index buffer unavailable');
    buffers.push(indexBuffer);
    context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, indexBuffer);
    context.bufferData(context.ELEMENT_ARRAY_BUFFER, mesh.indices, context.STATIC_DRAW);
    const viewLocation = context.getUniformLocation(program, 'uView');
    const projectionLocation = context.getUniformLocation(program, 'uProjection');
    const contourStepLocation = context.getUniformLocation(program, 'uContourStep');
    const pixelRatioLocation = context.getUniformLocation(program, 'uPixelRatio');
    context.enable(context.DEPTH_TEST);
    context.depthFunc(context.LEQUAL);
    context.disable(context.CULL_FACE);
    context.clearColor(0, 0, 0, 0);
    context.clearDepth(1);
    // No blending between faces: every pixel resolves against the depth buffer.
    context.disable(context.BLEND);
    let validated = false;
    return {
      kind: 'webgl',
      draw(view, width, height) {
        if (context.isContextLost()) return false;
        const { w, h } = pixelSize(canvas, width, height, 2);
        const matrices = camera(view, width / height);
        context.viewport(0, 0, w, h);
        context.clear(context.COLOR_BUFFER_BIT | context.DEPTH_BUFFER_BIT);
        context.uniformMatrix4fv(viewLocation, false, matrices.matrix);
        context.uniformMatrix4fv(projectionLocation, false, matrices.projection);
        context.uniform1f(contourStepLocation, 2 * matrices.distance / (matrices.f * height));
        context.uniform1f(pixelRatioLocation, w / width);
        context.drawElements(context.TRIANGLES, mesh.indices.length, context.UNSIGNED_SHORT, 0);
        if (!validated) {
          validated = true;
          if (context.getError() !== context.NO_ERROR) return false;
        }
        return !context.isContextLost();
      },
      dispose,
    };
  } catch {
    dispose();
    return null;
  }
}

/** Interactive CPU fallback for browsers without a usable GPU context. */
export function createCanvasRenderer(canvas: HTMLCanvasElement, mesh: GammaMesh): SurfaceRenderer | null {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return null;
  const count = mesh.positions.length / 3;
  const projected = new Float32Array(count * 3);
  const shaded = new Float32Array(count * 3);
  const faces = Array.from({ length: mesh.indices.length / 3 }, (_, index) => index);
  const depths = new Float32Array(faces.length);
  const normalize = (x: number, y: number, z: number) => {
    const scale = 1 / (Math.hypot(x, y, z) || 1);
    return [x * scale, y * scale, z * scale];
  };
  const key = normalize(-0.55, 0.82, 0.95);
  const fill = normalize(0.8, 0.12, 0.55);
  const half = normalize(key[0], key[1], key[2] + 1);
  return {
    kind: 'canvas2d',
    draw(view, width, height) {
      const { w, h } = pixelSize(canvas, width, height, 1.5);
      context.clearRect(0, 0, w, h);
      const { matrix: m, f } = camera(view, width / height);
      const scale = h * f / 2;
      for (let i = 0; i < count; i++) {
        const k = i * 3;
        const x = mesh.positions[k], y = mesh.positions[k + 1], z = mesh.positions[k + 2];
        const px = m[0] * x + m[4] * y + m[8] * z + m[12];
        const py = m[1] * x + m[5] * y + m[9] * z + m[13];
        const pz = m[2] * x + m[6] * y + m[10] * z + m[14];
        projected[k] = w / 2 + px * scale / -pz;
        projected[k + 1] = h / 2 - py * scale / -pz;
        projected[k + 2] = pz;
        const nx = mesh.normals[k], ny = mesh.normals[k + 1], nz = mesh.normals[k + 2];
        let normal = normalize(m[0] * nx + m[4] * ny + m[8] * nz, m[1] * nx + m[5] * ny + m[9] * nz, m[2] * nx + m[6] * ny + m[10] * nz);
        if (normal[2] < 0) normal = normal.map(value => -value);
        const dot = (a: number[]) => Math.max(0, normal[0] * a[0] + normal[1] * a[1] + normal[2] * a[2]);
        const light = 0.32 + 0.66 * dot(key) + 0.15 * dot(fill);
        const sheen = 0.24 * dot(half) ** 40 + 0.035 * dot(half) ** 8;
        for (let channel = 0; channel < 3; channel++) {
          const linear = Math.max(0, mesh.colors[k + channel]) ** 2.2 * light + sheen * [1, 0.99, 0.97][channel];
          shaded[k + channel] = Math.min(1, linear) ** (1 / 2.2) * 255;
        }
      }
      for (const face of faces) {
        const k = face * 3;
        depths[face] = projected[mesh.indices[k] * 3 + 2] + projected[mesh.indices[k + 1] * 3 + 2] + projected[mesh.indices[k + 2] * 3 + 2];
      }
      faces.sort((a, b) => depths[a] - depths[b]);
      context.lineJoin = 'round';
      context.lineWidth = 0.65;
      for (const face of faces) {
        const k = face * 3;
        const a = mesh.indices[k] * 3, b = mesh.indices[k + 1] * 3, c = mesh.indices[k + 2] * 3;
        if (projected[a + 2] > -near || projected[b + 2] > -near || projected[c + 2] > -near) continue;
        // This mesh is closed. Removing back faces also prevents its two large
        // bottom triangles from obscuring the dense upper sheet in painter order.
        const area = (projected[b] - projected[a]) * (projected[c + 1] - projected[a + 1])
          - (projected[b + 1] - projected[a + 1]) * (projected[c] - projected[a]);
        if (area >= 0) continue;
        const red = Math.round((shaded[a] + shaded[b] + shaded[c]) / 3);
        const green = Math.round((shaded[a + 1] + shaded[b + 1] + shaded[c + 1]) / 3);
        const blue = Math.round((shaded[a + 2] + shaded[b + 2] + shaded[c + 2]) / 3);
        context.fillStyle = `rgb(${red} ${green} ${blue})`;
        context.strokeStyle = context.fillStyle;
        context.beginPath();
        context.moveTo(projected[a], projected[a + 1]);
        context.lineTo(projected[b], projected[b + 1]);
        context.lineTo(projected[c], projected[c + 1]);
        context.closePath();
        context.fill();
        // Same-color subpixel overdraw closes antialias seams, without a grid.
        context.stroke();
        if (mesh.normals[a + 1] > 0 && mesh.normals[b + 1] > 0 && mesh.normals[c + 1] > 0) {
          const vertices = [a, b, c];
          const heights = vertices.map(index => mesh.positions[index + 1]);
          const minimum = Math.min(...heights), maximum = Math.max(...heights);
          for (const level of GAMMA_CONTOURS) {
            if (level <= minimum || level >= maximum) continue;
            const intersections: number[][] = [];
            for (let edge = 0; edge < 3; edge++) {
              const next = (edge + 1) % 3;
              if ((heights[edge] < level) === (heights[next] < level)) continue;
              const t = (level - heights[edge]) / (heights[next] - heights[edge]);
              const first = vertices[edge], second = vertices[next];
              const depth = projected[first + 2] * (1 - t) + projected[second + 2] * t;
              // Perspective-correct projection of the height/edge intersection.
              const amount = t * projected[second + 2] / depth;
              intersections.push([
                projected[first] + (projected[second] - projected[first]) * amount,
                projected[first + 1] + (projected[second + 1] - projected[first + 1]) * amount,
              ]);
            }
            if (intersections.length !== 2) continue;
            const ink = Math.abs(level - 0.76) < 0.001 ? [0.07, 0.11, 0.14] : [0.1, 0.1, 0.1];
            const lineColor = [red, green, blue].map((value, channel) => Math.round(
              ((value / 255) ** 2.2 * (1 - GAMMA_CONTOUR_OPACITY) + ink[channel] * GAMMA_CONTOUR_OPACITY) ** (1 / 2.2) * 255,
            ));
            context.strokeStyle = `rgb(${lineColor.join(' ')})`;
            context.lineWidth = w / width * 0.8;
            context.beginPath();
            context.moveTo(intersections[0][0], intersections[0][1]);
            context.lineTo(intersections[1][0], intersections[1][1]);
            context.stroke();
            context.lineWidth = 0.65;
          }
        }
      }
      return true;
    },
    dispose() { context.clearRect(0, 0, canvas.width, canvas.height); },
  };
}
