// Kaleidoscope Animation

// Basic Vertex Shader
const kaleidoscopeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Basic Fragment Shader (Kaleidoscope + Noise)
const kaleidoscopeFragmentShader = `
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_segments;
  uniform float u_noise_scale;
  uniform float u_noise_speed;
  uniform float u_noise_brightness;

  const float PI = 3.14159265359;
  const float TAU = PI * 2.0;

  // Basic 2D random function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  // 2D Noise function (simple value noise)
  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  void main() {
    vec2 center = vec2(0.5, 0.5);
    vec2 uv = vUv - center; // Center UVs

    float angle = atan(uv.y, uv.x);
    float radius = length(uv);

    // Kaleidoscope effect
    float segmentAngle = TAU / u_segments;
    angle = mod(angle, segmentAngle);
    angle = abs(angle - segmentAngle * 0.5); // Mirror within segment

    // Reconstruct UVs
    vec2 kalUv = vec2(cos(angle), sin(angle)) * radius;

    // Apply noise based on kaleidoscope UVs
    vec2 noiseUv = kalUv * u_noise_scale + vec2(u_time * u_noise_speed * 0.1, u_time * u_noise_speed * 0.05);
    float noiseValue = noise(noiseUv);

    float brightness = (noiseValue * 0.5 + 0.5) * u_noise_brightness;
    gl_FragColor = vec4(vec3(brightness), 1.0);
  }
`;

function setupKaleidoscopeAnimation() {
    console.log("Setting up Kaleidoscope animation (placeholder)");
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.ShaderMaterial({
        vertexShader: kaleidoscopeVertexShader,
        fragmentShader: kaleidoscopeFragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_segments: { value: Number.parseFloat(kaleidoscopeControls.sliderSegments.value) || 6.0 },
            u_noise_scale: { value: Number.parseFloat(kaleidoscopeControls.sliderNoiseScale.value) || 4.0 },
            u_noise_speed: { value: Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeed.value) || 1.0 },
            u_noise_brightness: { value: Number.parseFloat(kaleidoscopeControls.sliderNoiseBrightness.value) || 1.0 },
        },
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "kaleidoscopePlane";
    scene.add(mesh);

    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.geometry = geometry;

    // Add listeners if not already in script.js
    kaleidoscopeControls.sliderSegments.addEventListener('input', handleKaleidoscopeParamChange);
    kaleidoscopeControls.sliderNoiseScale.addEventListener('input', handleKaleidoscopeParamChange);
    kaleidoscopeControls.sliderNoiseSpeed.addEventListener('input', handleKaleidoscopeParamChange);
    kaleidoscopeControls.sliderNoiseBrightness.addEventListener('input', handleKaleidoscopeParamChange);
}

function cleanupKaleidoscopeAnimation() {
    console.log("Cleaning up Kaleidoscope animation (placeholder)");
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        if (animationObjects.geometry) animationObjects.geometry.dispose();
        if (animationObjects.material) animationObjects.material.dispose();
    }
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometry = null;

    // Remove listeners
    kaleidoscopeControls.sliderSegments.removeEventListener('input', handleKaleidoscopeParamChange);
    kaleidoscopeControls.sliderNoiseScale.removeEventListener('input', handleKaleidoscopeParamChange);
    kaleidoscopeControls.sliderNoiseSpeed.removeEventListener('input', handleKaleidoscopeParamChange);
    kaleidoscopeControls.sliderNoiseBrightness.removeEventListener('input', handleKaleidoscopeParamChange);
}

// Handler for Kaleidoscope parameter changes
function handleKaleidoscopeParamChange() {
    if (currentAnimation !== 'kaleidoscope' || !animationObjects.material) return;

    const segments = Number.parseFloat(kaleidoscopeControls.sliderSegments.value);
    const noiseScale = Number.parseFloat(kaleidoscopeControls.sliderNoiseScale.value);
    const noiseSpeed = Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeed.value);
    const noiseBrightness = Number.parseFloat(kaleidoscopeControls.sliderNoiseBrightness.value);

    animationObjects.material.uniforms.u_segments.value = segments;
    animationObjects.material.uniforms.u_noise_scale.value = noiseScale;
    animationObjects.material.uniforms.u_noise_speed.value = noiseSpeed; // Store speed for update loop
    animationObjects.material.uniforms.u_noise_brightness.value = noiseBrightness;

    // Update UI labels (already done in script.js listener)
}

// Animation update function for Kaleidoscope
function updateKaleidoscopeAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material) return;
    // Speed is now controlled by the uniform which is updated in handleKaleidoscopeParamChange
    // We just need to update time
    animationObjects.material.uniforms.u_time.value = elapsedTime;
}

function randomizeKaleidoscopeParameters() {
    console.log("Randomizing Kaleidoscope parameters...");
    const sliders = [
        kaleidoscopeControls.sliderSegments,
        kaleidoscopeControls.sliderNoiseScale,
        kaleidoscopeControls.sliderNoiseSpeed,
        kaleidoscopeControls.sliderNoiseBrightness,
    ];

    for (const slider of sliders) {
        const min = Number.parseFloat(slider.min);
        const max = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step) || (max - min) / 100;
        const randomValue = min + Math.random() * (max - min);
        slider.value = (Math.round(randomValue / step) * step).toFixed(
            step.toString().includes('.') ? step.toString().split('.')[1].length : 0
        );
        // Trigger input event to update uniforms via handleKaleidoscopeParamChange and labels via script.js
        slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Make functions available to the main script
window.KALEIDOSCOPE_ANIMATION = {
    setup: setupKaleidoscopeAnimation,
    update: updateKaleidoscopeAnimation,
    cleanup: cleanupKaleidoscopeAnimation,
    randomize: randomizeKaleidoscopeParameters,
    // handleParamChange: handleKaleidoscopeParamChange // Specific handler added
};