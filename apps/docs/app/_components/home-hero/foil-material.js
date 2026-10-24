// Original procedural material inspired by 4rknova's angle-dependent foil study.
const vertexSource = `
attribute vec2 position;
varying vec2 uv;
void main() { uv = position * .5 + .5; gl_Position = vec4(position, 0., 1.); }
`;
const fragmentSource = `
precision highp float;
varying vec2 uv;
uniform vec2 resolution;
uniform vec2 angle;
uniform float strength;
uniform float sparkle;
uniform float roughness;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
void main() {
  vec2 p = uv * 2. - 1.;
  vec3 normal = normalize(vec3(angle * .6 + p * .12, 1.));
  vec3 light = normalize(vec3(-.45, .65, 1.));
  vec3 halfway = normalize(light + vec3(0.,0.,1.));
  float facing = dot(normal, halfway);
  float band = p.x * 1.4 + p.y * .7 + angle.x * 2.8 + angle.y * 2.;
  vec3 spectrum = .5 + .5 * cos(6.28318 * (band * .34 + vec3(0., .33, .67)));
  vec3 paper = vec3(.83, .85, .98);
  vec3 foil = mix(vec3(.69,.73,.79), spectrum * .55 + .40, .70);
  float reflection = pow(max(facing, 0.), mix(100., 10., roughness));
  float crease = exp(-pow((band - .28) * mix(5., 1.8, roughness), 2.));
  vec3 color = mix(paper, foil, strength);
  color += (reflection * .15 + crease * .22) * strength;
  vec2 cell = floor(uv * resolution / 3.);
  float grain = hash(cell);
  float facet = sin(grain * 38. + angle.x * 11. + angle.y * 8.);
  float fleck = pow(max(facet, 0.), 24.) * step(.76, grain);
  color += (grain - .5) * .11 * strength;
  color += fleck * sparkle * strength * .8;
  color -= step(grain, .12) * .07 * strength;
  gl_FragColor = vec4(clamp(color, 0., 1.), 1.);
}
`;

export function createFoilMaterial(canvas) {
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }
  const vertex = compile(gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl.FRAGMENT_SHADER, fragmentSource);
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW
  );
  const position = gl.getAttribLocation(program, 'position');
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const uniforms = Object.fromEntries(
    ['resolution', 'angle', 'strength', 'sparkle', 'roughness'].map((name) => [
      name,
      gl.getUniformLocation(program, name),
    ])
  );
  return {
    draw(x, y, settings) {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.angle, x, y);
      gl.uniform1f(uniforms.strength, settings.strength);
      gl.uniform1f(uniforms.sparkle, settings.sparkle);
      gl.uniform1f(uniforms.roughness, settings.roughness);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },
    dispose() {
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
    },
  };
}
