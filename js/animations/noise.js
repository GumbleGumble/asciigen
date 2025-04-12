// Noise Animation Module - Needs Implementation

// Shader code (Example - replace with actual noise shader)
const noiseVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const noiseFragmentShader = `
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_scale;
  uniform float u_speed;
  uniform float u_brightness;

  // Simple 2D noise function (replace with Simplex or Perlin if available/needed)
  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 scaledUv = vUv * u_scale;
    float timeEffect = u_time * u_speed;
    float noiseValue = noise(scaledUv + vec2(timeEffect * 0.1, timeEffect * 0.05)); // Simple time evolution
    gl_FragColor = vec4(vec3(noiseValue * u_brightness), 1.0);
  }
`;


function setupNoiseAnimation() {
    console.log("Setting up Noise animation (Implementation Pending)");
    // TODO: Implement noise plane, material, uniforms based on noiseControls
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.ShaderMaterial({
        vertexShader: noiseVertexShader,
        fragmentShader: noiseFragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_scale: { value: Number.parseFloat(noiseControls.sliderScale?.value || 4.0) },
            u_speed: { value: Number.parseFloat(noiseControls.sliderSpeed?.value || 1.0) },
            u_brightness: { value: Number.parseFloat(noiseControls.sliderBrightness?.value || 1.0) },
        },
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "noisePlane";
    scene.add(mesh);

    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.geometry = geometry;

    // Initial UI update handled by script.js
}

function cleanupNoiseAnimation() {
    console.log("Cleaning up Noise animation (Implementation Pending)");
    // TODO: Remove objects, dispose geometry/material
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        animationObjects.geometry?.dispose();
        animationObjects.material?.dispose();
    }
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometry = null;
}

function handleNoiseParamChange() {
    if (currentAnimationType !== 'noise' || !animationObjects.material) return;
    console.log("Handling Noise parameter change (Implementation Pending)");
    // TODO: Update shader uniforms based on noiseControls values
    animationObjects.material.uniforms.u_scale.value = Number.parseFloat(noiseControls.sliderScale.value);
    // Speed is read in update loop
    animationObjects.material.uniforms.u_brightness.value = Number.parseFloat(noiseControls.sliderBrightness.value);

    // UI label updates are handled by the main script's event listeners
}

function updateNoiseAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material) return;
    // TODO: Update time uniform, potentially other dynamic uniforms
    const speed = Number.parseFloat(noiseControls.sliderSpeed.value); // Read speed here
    animationObjects.material.uniforms.u_time.value = elapsedTime * speed;
}

function randomizeNoiseParameters() {
    console.log("Randomizing Noise parameters (Implementation Pending)");
    // TODO: Randomize noiseControls sliders and trigger 'input' event
    const sliders = [
        noiseControls.sliderScale,
        noiseControls.sliderSpeed,
        noiseControls.sliderBrightness,
    ];
    for (const slider of sliders) {
        if (!slider) continue;
        const min = Number.parseFloat(slider.min);
        const max = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step) || (max - min) / 100;
        const range = max - min;
        const randomSteps = Math.floor(Math.random() * (range / step + 1));
        slider.value = min + randomSteps * step;
        slider.dispatchEvent(new Event('input', { bubbles: true })); // Trigger update
    }
}

// Expose module methods
window.NOISE_ANIMATION = {
    setup: setupNoiseAnimation,
    update: updateNoiseAnimation,
    cleanup: cleanupNoiseAnimation,
    randomize: randomizeNoiseParameters,
    handleParamChange: handleNoiseParamChange
};