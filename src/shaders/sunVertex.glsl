varying vec2  vUv;
varying vec3  vNormalEye;    // eye-space normal (limb darkening)
varying vec3  vPosEye;       // eye-space position (limb darkening)
varying vec3  vSpherePos;    // model-space unit position (noise domain, no UV distortion)

void main() {
  vUv         = uv;
  vSpherePos  = normalize(position);
  vNormalEye  = normalize(normalMatrix * normal);
  vPosEye     = (modelViewMatrix * vec4(position, 1.0)).xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
