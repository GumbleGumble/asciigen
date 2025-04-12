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
  uniform float u_noise_speed_x; // Changed
  uniform float u_noise_speed_y; // Added
  uniform float u_noise_brightness;

  // --- FBM (Fractional Brownian Motion) Setup ---
  #define OCTAVES 4 // Number of noise layers

  // Pseudo-random generator
  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Basic value noise
  float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    vec2 u = f * f * (3.0 - 2.0 * f); // Smoothstep
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // FBM function
  float fbm (vec2 st) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < OCTAVES; i++) {
        value += amplitude * noise(st * frequency);
        frequency *= 2.0;
        amplitude *= 0.5;
    }
    return value;
  }
  // --- End FBM Setup ---

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

    // Sample noise based on mirrored coordinates and time with separate speeds
    vec2 timeOffset = vec2(u_time * u_noise_speed_x, u_time * u_noise_speed_y);
    vec2 noiseCoord = mirroredP * u_noise_scale + timeOffset;

    // Use FBM for noise value
    float noiseValue = fbm(noiseCoord);

    gl_FragColor = vec4(vec3(noiseValue * u_noise_brightness), 1.0);
  }
`;


function setupKaleidoscopeAnimation() {
    console.log("Setting up Kaleidoscope animation");
    // Ensure controls exist
    if (!kaleidoscopeControls || !kaleidoscopeControls.sliderSegments || !kaleidoscopeControls.sliderNoiseScale || !kaleidoscopeControls.sliderNoiseSpeedX || !kaleidoscopeControls.sliderNoiseSpeedY || !kaleidoscopeControls.sliderNoiseBrightness) { // Updated checks
        console.error("Kaleidoscope controls not found!");
        return;
    }

    const geometry = new THREE.PlaneGeometry(10, 10); // Simple plane
    const material = new THREE.ShaderMaterial({
        vertexShader: kaleidoscopeVertexShader,
        fragmentShader: kaleidoscopeFragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_segments: { value: Number.parseFloat(kaleidoscopeControls.sliderSegments.value) || 6.0 },
            u_noise_scale: { value: Number.parseFloat(kaleidoscopeControls.sliderNoiseScale.value) || 4.0 },
            u_noise_speed_x: { value: Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeedX.value) || 0.5 }, // Changed
            u_noise_speed_y: { value: Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeedY.value) || 0.2 }, // Added
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
    // ...
    updateAllValueDisplays(); // Call explicitly after setup
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

	// Ensure controls exist before accessing value
	if (kaleidoscopeControls.sliderSegments) {
		animationObjects.material.uniforms.u_segments.value = Number.parseFloat(kaleidoscopeControls.sliderSegments.value);
	}
	if (kaleidoscopeControls.sliderNoiseScale) {
		animationObjects.material.uniforms.u_noise_scale.value = Number.parseFloat(kaleidoscopeControls.sliderNoiseScale.value);
	}
	// Speed is read in update loop
	if (kaleidoscopeControls.sliderNoiseBrightness) {
		animationObjects.material.uniforms.u_noise_brightness.value = Number.parseFloat(kaleidoscopeControls.sliderNoiseBrightness.value);
	}

	// UI label updates are handled by the main script's event listeners calling updateAllValueDisplays
    // updateAllValueDisplays(); // Called by the event listener in script.js
}

// Animation update function for Kaleidoscope
function updateKaleidoscopeAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.material || !kaleidoscopeControls.sliderNoiseSpeedX || !kaleidoscopeControls.sliderNoiseSpeedY) return; // Updated checks
	// Read speeds from the sliders *within* the update loop
	const speedX = Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeedX.value);
    const speedY = Number.parseFloat(kaleidoscopeControls.sliderNoiseSpeedY.value);
    // Update uniforms
	animationObjects.material.uniforms.u_time.value = elapsedTime;
    animationObjects.material.uniforms.u_noise_speed_x.value = speedX;
    animationObjects.material.uniforms.u_noise_speed_y.value = speedY;
}

function randomizeKaleidoscopeParameters() {
	console.log("Randomizing Kaleidoscope parameters...");
	const sliders = [
		kaleidoscopeControls.sliderSegments,
		kaleidoscopeControls.sliderNoiseScale,
        kaleidoscopeControls.sliderNoiseSpeedX, // Changed
        kaleidoscopeControls.sliderNoiseSpeedY, // Added
		kaleidoscopeControls.sliderNoiseBrightness,
	];

	// ... existing randomization loop ...
    // Ensure the loop triggers 'input' event for each slider
    for (const slider of sliders) {
        if (!slider) continue;
        const min = Number.parseFloat(slider.min);
        const max = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step) || (slider.id.includes('segment') ? 1 : 0.1); // Step 1 for segments
        const range = max - min;
        // Ensure calculations handle potential floating point inaccuracies
        const randomValue = min + Math.random() * range;
        // Round to the nearest step
        const steppedValue = Math.round(randomValue / step) * step;
        // Clamp to min/max and fix precision
        const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
        slider.value = Math.min(max, Math.max(min, steppedValue)).toFixed(precision);

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