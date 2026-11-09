import { GAMMA_CONTOURS, GAMMA_CONTOUR_OPACITY } from './mesh';

// Lighting is evaluated per fragment from interpolated normals: the mesh has no
// wireframe, baked shadows, or time uniform.
export const vertexShader = `
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec3 aColor;
uniform mat4 uView;
uniform mat4 uProjection;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying float vHeight;
varying float vSurface;
void main() {
  vec4 position = uView * vec4(aPosition, 1.0);
  vPosition = position.xyz;
  vNormal = mat3(uView) * aNormal;
  vColor = aColor;
  vHeight = aPosition.y;
  vSurface = aNormal.y > 0.0 ? 1.0 : 0.0;
  gl_Position = uProjection * position;
}
`;

const contourDistance = GAMMA_CONTOURS.map((level, index) => index === 0
  ? `float contourDistance = abs(vHeight - ${level.toFixed(6)}); float contourLevel = ${level.toFixed(6)};`
  : `if (abs(vHeight - ${level.toFixed(6)}) < contourDistance) { contourDistance = abs(vHeight - ${level.toFixed(6)}); contourLevel = ${level.toFixed(6)}; }`).join('\n');

export function createFragmentShader(derivatives: boolean) {
  return `${derivatives ? '#extension GL_OES_standard_derivatives : enable\n' : ''}
precision highp float;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vColor;
varying float vHeight;
varying float vSurface;
uniform float uContourStep;
uniform float uPixelRatio;
void main() {
  vec3 normal = normalize(vNormal);
  if (!gl_FrontFacing) normal = -normal;
  vec3 eye = normalize(-vPosition);
  vec3 key = normalize(vec3(-0.55, 0.82, 0.95));
  vec3 fill = normalize(vec3(0.80, 0.12, 0.55));
  vec3 rim = normalize(vec3(0.25, 0.72, -0.90));
  vec3 halfKey = normalize(key + eye);
  float diffuse = max(dot(normal, key), 0.0);
  float softFill = max(dot(normal, fill), 0.0);
  float edge = pow(1.0 - max(dot(normal, eye), 0.0), 3.0);
  float sheen = pow(max(dot(normal, halfKey), 0.0), 40.0);
  float broadSheen = pow(max(dot(normal, halfKey), 0.0), 8.0);
  float backLight = max(dot(normal, rim), 0.0);
  vec3 base = pow(clamp(vColor, 0.0, 1.0), vec3(2.2));
  vec3 light = base * (0.32 + 0.66 * diffuse + 0.15 * softFill);
  light += vec3(1.0, 0.99, 0.97) * (0.24 * sheen + 0.035 * broadSheen);
  light += vec3(0.90, 0.94, 0.96) * edge * backLight * 0.10;
  if (vSurface > 0.5) {
    ${contourDistance}
    float heightGradient = ${derivatives ? 'fwidth(vHeight) * uPixelRatio' : 'uContourStep'};
    float ratio = contourDistance / max(0.00005, heightGradient * 0.85);
    float coverage = 1.0 - smoothstep(0.25, 1.0, ratio);
    vec3 ink = abs(contourLevel - 0.76) < 0.001 ? vec3(0.07, 0.11, 0.14) : vec3(0.10);
    light = mix(light, ink, coverage * ${GAMMA_CONTOUR_OPACITY.toFixed(6)});
  }
  gl_FragColor = vec4(pow(clamp(light, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
}
`;
}
