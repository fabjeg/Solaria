varying vec3 vNormal;
varying vec3 vEyePosition;

void main() {
  // Normal in eye/view space for Fresnel calculation
  vNormal      = normalize(normalMatrix * normal);
  // Fragment position in eye space (camera at origin)
  vEyePosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position  = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
