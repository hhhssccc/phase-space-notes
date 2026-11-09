import { createFragmentShader, vertexShader } from './shaders';
import { createGammaRaster } from './cpu-raster';
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

/** Interactive CPU fallback with a per-pixel depth buffer and smooth shading. */
export function createCanvasRenderer(canvas: HTMLCanvasElement, mesh: GammaMesh): SurfaceRenderer | null {
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return null;
  const raster = createGammaRaster(mesh);
  // Keep work bounded on phones and very large desktop covers. Presentation is
  // bilinearly scaled by the browser; geometry and lighting remain continuous.
  const lowPower = typeof navigator !== 'undefined' && navigator.hardwareConcurrency <= 4;
  const pixelBudget = lowPower ? 180_000 : 320_000;
  let image: ImageData | undefined;
  return {
    kind: 'canvas2d',
    draw(view, width, height) {
      const density = Math.min(devicePixelRatio || 1, 1.3, Math.sqrt(pixelBudget / Math.max(1, width * height)));
      const w = Math.max(1, Math.round(width * density));
      const h = Math.max(1, Math.round(height * density));
      if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
      if (!image || image.width !== w || image.height !== h) image = context.createImageData(w, h);
      const { matrix, f } = camera(view, width / height);
      raster(image.data, w, h, matrix, f, w / width);
      context.putImageData(image, 0, 0);
      return true;
    },
    dispose() { context.clearRect(0, 0, canvas.width, canvas.height); image = undefined; },
  };
}
