uniform vec3  uColor;
uniform float uPower;
uniform float uIntensity;

varying vec3 vNormal;
varying vec3 vEyePosition;

void main() {
  // Direction from fragment to camera in eye space (camera is at origin in eye space)
  vec3 eyeDir = normalize(-vEyePosition);

  // Fresnel: 0 at face-on, 1 at the limb
  float rim    = 1.0 - max(0.0, dot(vNormal, eyeDir));
  float alpha  = pow(rim, uPower) * uIntensity;

  gl_FragColor = vec4(uColor, alpha);
}
