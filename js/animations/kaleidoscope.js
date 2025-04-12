// Kaleidoscope Animation Module

// Shader code (unchanged)
const kaleidoscopeVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const kaleidoscopeFragmentShader = `
  varying vec2 vUv;
  uniform float u_time;
  uniform float u_segments;
  uniform float u_noise_scale;
  uniform float u_noise_speed;
  uniform float u_noise_brightness;

  // Simple 2D noise function (replace with Simplex or Perlin if needed)
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

    vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep interpolation

    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 p = vUv - 0.5; // Center coordinates
    float angle = atan(p.y, p.x);
    float radius = length(p);

    // Kaleidoscope effect
    float segmentAngle = 3.1415926535 * 2.0 / u_segments;
    angle = mod(angle, segmentAngle);
    angle = abs(angle - segmentAngle / 2.0); // Mirror within segment

    // Convert back to Cartesian coordinates for noise sampling
    vec2 mirroredP = vec2(cos(angle), sin(angle)) * radius;

    // Sample noise based on mirrored coordinates and time
    vec2 noiseCoord = mirroredP * u_noise_scale + vec2(u_time * u_noise_speed * 0.1, u_time * u_noise_speed * 0.05);
    float noiseValue = noise(noiseCoord);

    gl_FragColor = vec4(vec3(noiseValue * u_noise_brightness), 1.0);
  }
`;


function setupKaleidoscopeAnimation() {
    console.log("Setting up Kaleidoscope animation");
    const geometry = new THREE.PlaneGeometry(10, 10); // Simple plane
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

    // Add listeners (handled in script.js, ensure handleKaleidoscopeParamChange exists)
    // kaleidoscopeControls.sliderSegments.addEventListener('input', handleKaleidoscopeParamChange);
    // kaleidoscopeControls.sliderNoiseScale.addEventListener('input', handleKaleidoscopeParamChange);
    // kaleidoscopeControls.sliderNoiseSpeed.addEventListener('input', handleKaleidoscopeParamChange);
    // kaleidoscopeControls.sliderNoiseBrightness.addEventListener('input', handleKaleidoscopeParamChange);
}

function cleanupKaleidoscopeAnimation() {
    console.log("Cleaning up Kaleidoscope animation");
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        if (animationObjects.geometry) animationObjects.geometry.dispose();
        if (animationObjects.material) animationObjects.material.dispose();
    }
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometry = null;

    // Remove listeners (handled in script.js)
    // kaleidoscopeControls.sliderSegments.removeEventListener('input', handleKaleidoscopeParamChange);
    // kaleidoscopeControls.sliderNoiseScale.removeEventListener('input', handleKaleidoscopeParamChange);
    // kaleidoscopeControls.sliderNoiseSpeed.removeEventListener('input', handleKaleidoscopeParamChange);
    // kaleidoscopeControls.sliderNoiseBrightness.removeEventListener('input', handleKaleidoscopeParamChange);
}

// Handler for Kaleidoscope parameter changes
function handleKaleidoscopeParamChange() {
    // Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'kaleidoscope' || !animationObjects.material) return;

    const segments = Number.parseFloat(kaleidoscopeControls.sliderSegments.value);
    const noiseScale = Number.parseFloat(kaleidoscopeControls.sliderNoiseScale.value);
    const noiseSpeed = Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeed.value); // Keep reading speed here for update loop access if needed
    const noiseBrightness = Number.parseFloat(kaleidoscopeControls.sliderNoiseBrightness.value);

    animationObjects.material.uniforms.u_segments.value = segments;
    animationObjects.material.uniforms.u_noise_scale.value = noiseScale;
    // animationObjects.material.uniforms.u_noise_speed.value = noiseSpeed; // Speed is read in update loop
    animationObjects.material.uniforms.u_noise_brightness.value = noiseBrightness;

    // Update UI labels (Handled by script.js listener triggering this function AND updating labels)
	// if (uiElements.kaleidoscopeNoiseBrightnessValue)
	// 	uiElements.kaleidoscopeNoiseBrightnessValue.textContent =
	// 		brightness.toFixed(1); // REMOVE THIS LINE
}

// Animation update function for Kaleidoscope
function updateKaleidoscopeAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material) return;
    // Read speed from the slider *within* the update loop
    const speed = Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeed.value);
    animationObjects.material.uniforms.u_time.value = elapsedTime * speed;
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
         if (!slider) continue;
        const min = Number.parseFloat(slider.min);
        const max = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step) || (max - min) / 100;
        const range = max - min;
        const randomSteps = Math.floor(Math.random() * (range / step + 1));
        slider.value = min + randomSteps * step;
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
    handleParamChange: handleKaleidoscopeParamChange // Unified handler
};