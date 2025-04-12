// Noise Field Animation

// Basic Vertex Shader
const noiseVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Basic Fragment Shader (Simplex Noise)
const noiseFragmentShader = `
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_scale;
  uniform float u_brightness;

  // Basic 2D random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // 2D Noise function (simple value noise)
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 scaledUv = vUv * u_scale;
    float noiseValue = noise(scaledUv + vec2(u_time * 0.1, u_time * 0.05)); // Animate noise over time
    float brightness = (noiseValue * 0.5 + 0.5) * u_brightness; // Map noise from [0, 1] to brightness
    gl_FragColor = vec4(vec3(brightness), 1.0);
  }
`;

function setupNoiseAnimation() {
    console.log("Setting up Noise animation (placeholder)");
    const geometry = new THREE.PlaneGeometry(10, 10); // Simple plane
    const material = new THREE.ShaderMaterial({
        vertexShader: noiseVertexShader,
        fragmentShader: noiseFragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_scale: { value: Number.parseFloat(noiseControls.sliderScale.value) || 4.0 },
            u_brightness: { value: Number.parseFloat(noiseControls.sliderBrightness.value) || 1.0 },
        },
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "noisePlane";
    scene.add(mesh);

    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.geometry = geometry;

    // Add listeners if not already in script.js
    noiseControls.sliderScale.addEventListener('input', handleNoiseParamChange);
    noiseControls.sliderSpeed.addEventListener('input', handleNoiseParamChange); // Speed affects u_time rate
    noiseControls.sliderBrightness.addEventListener('input', handleNoiseParamChange);
}

function cleanupNoiseAnimation() {
    console.log("Cleaning up Noise animation (placeholder)");
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        if (animationObjects.geometry) animationObjects.geometry.dispose();
        if (animationObjects.material) animationObjects.material.dispose();
    }
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometry = null;

    // Remove listeners
    noiseControls.sliderScale.removeEventListener('input', handleNoiseParamChange);
    noiseControls.sliderSpeed.removeEventListener('input', handleNoiseParamChange);
    noiseControls.sliderBrightness.removeEventListener('input', handleNoiseParamChange);
}


function handleNoiseParamChange() {
    if (currentAnimation !== 'noise' || !animationObjects.material) return;

    const scale = Number.parseFloat(noiseControls.sliderScale.value);
    const brightness = Number.parseFloat(noiseControls.sliderBrightness.value);
    // Speed is handled in the update loop

    animationObjects.material.uniforms.u_scale.value = scale;
    animationObjects.material.uniforms.u_brightness.value = brightness;

    // Update UI labels (already done in script.js listener, but good practice here too)
    if (uiElements.noiseScaleValue) uiElements.noiseScaleValue.textContent = scale.toFixed(1);
    if (uiElements.noiseBrightnessValue) uiElements.noiseBrightnessValue.textContent = brightness.toFixed(1);
    // Speed label updated in script.js listener
}

function updateNoiseAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material) return;
    const speed = Number.parseFloat(noiseControls.sliderSpeed.value) || 1.0;
    animationObjects.material.uniforms.u_time.value = elapsedTime * speed;
}

function randomizeNoiseParameters() {
    console.log("Randomizing Noise parameters...");
    const sliders = [
        noiseControls.sliderScale,
        noiseControls.sliderSpeed,
        noiseControls.sliderBrightness,
    ];

    for (const slider of sliders) {
        const min = Number.parseFloat(slider.min);
        const max = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step) || (max - min) / 100;
        const randomValue = min + Math.random() * (max - min);
        slider.value = (Math.round(randomValue / step) * step).toFixed(
            step.toString().includes('.') ? step.toString().split('.')[1].length : 0
        );
        // Trigger input event to update uniforms via handleNoiseParamChange and labels via script.js
        slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
}


// Make functions available to the main script
window.NOISE_ANIMATION = {
    setup: setupNoiseAnimation,
    update: updateNoiseAnimation,
    cleanup: cleanupNoiseAnimation,
    randomize: randomizeNoiseParameters,
    // handleParamChange: handleNoiseParamChange // Specific handlers added
};