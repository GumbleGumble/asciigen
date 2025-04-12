// Noise Animation Module

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
  uniform float u_speed_x; // Changed
  uniform float u_speed_y; // Added
  uniform float u_brightness;
  uniform int u_octaves; // Added octaves uniform

  // --- FBM (Fractional Brownian Motion) Setup ---
  // #define OCTAVES 4 // Removed define, use uniform instead

  // Pseudo-random generator (from previous version)
  float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  // Basic value noise (from previous version)
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

  // FBM function - sums multiple layers (octaves) of noise
  float fbm (vec2 st, int octaves) { // Pass octaves as argument
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0; // Initial frequency (related to scale)

    for (int i = 0; i < 10; i++) { // Loop up to a max (e.g., 10)
        if (i >= octaves) break; // Break if we've reached the desired number of octaves
        value += amplitude * noise(st * frequency);
        frequency *= 2.0; // Double frequency for each octave (lacunarity)
        amplitude *= 0.5; // Halve amplitude for each octave (persistence/gain)
    }
    return value;
  }
  // --- End FBM Setup ---


  void main() {
    vec2 scaledUv = vUv * u_scale;
    // Use separate speeds for time evolution in x and y
    vec2 timeOffset = vec2(u_time * u_speed_x, u_time * u_speed_y);

    // Use FBM for more detailed noise
    float noiseValue = fbm(scaledUv + timeOffset, u_octaves);

    // Apply brightness and clamp
    // Adjust range if FBM output isn't strictly 0-1 (depends on OCTAVES/amplitude)
    // Simple FBM often ranges roughly 0-1 with amplitude 0.5 start and decay
    float finalValue = clamp(noiseValue * u_brightness, 0.0, 1.0);

    gl_FragColor = vec4(vec3(finalValue), 1.0); // Output grayscale noise
  }
`;


function setupNoiseAnimation() {
	console.log("Setting up Noise animation");
	// Ensure noiseControls are available
	if (!noiseControls || !noiseControls.sliderScale || !noiseControls.sliderSpeedX || !noiseControls.sliderSpeedY || !noiseControls.sliderBrightness || !uiElements.noiseOctaves) { // Added octaves check
		console.error("Noise controls not found!");
		return;
	}

	const geometry = new THREE.PlaneGeometry(10, 10); // Plane covers the view
	const material = new THREE.ShaderMaterial({
		vertexShader: noiseVertexShader,
		fragmentShader: noiseFragmentShader,
		uniforms: {
			u_time: { value: 0.0 },
			u_scale: { value: Number.parseFloat(noiseControls.sliderScale.value) },
            u_speed_x: { value: Number.parseFloat(noiseControls.sliderSpeedX.value) }, // Changed
            u_speed_y: { value: Number.parseFloat(noiseControls.sliderSpeedY.value) }, // Added
			u_brightness: { value: Number.parseFloat(noiseControls.sliderBrightness.value) },
            u_octaves: { value: Number.parseInt(uiElements.noiseOctaves.value) }, // Added octaves uniform
		},
		// side: THREE.DoubleSide // Render both sides if needed
	});

	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = "noisePlane";
	scene.add(mesh);

	animationObjects.mesh = mesh;
	animationObjects.material = material;
	animationObjects.geometry = geometry;

    // Add listener for octaves slider
    if (uiElements.noiseOctaves) {
        uiElements.noiseOctaves.addEventListener('input', handleNoiseParamChange);
    }

	// Initial UI update handled by script.js calling updateAllValueDisplays
    updateAllValueDisplays(); // Call explicitly after setup
}

function cleanupNoiseAnimation() {
	console.log("Cleaning up Noise animation");
	if (animationObjects.mesh) {
		scene.remove(animationObjects.mesh);
		animationObjects.geometry?.dispose();
		animationObjects.material?.dispose();
	}
    // Remove listener
    if (uiElements.noiseOctaves) {
        uiElements.noiseOctaves.removeEventListener('input', handleNoiseParamChange);
    }
	animationObjects.mesh = null;
	animationObjects.material = null;
	animationObjects.geometry = null;
}

function handleNoiseParamChange() {
	// Check if currentAnimationType is defined globally (from script.js)
	if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'noise' || !animationObjects.material) return;
	console.log("Handling Noise parameter change");

	// Ensure controls exist before accessing value
	if (noiseControls.sliderScale) {
		animationObjects.material.uniforms.u_scale.value = Number.parseFloat(noiseControls.sliderScale.value);
	}
	// Speed is read in update loop, no need to set uniform here
    // if (noiseControls.sliderSpeedX) { // No need to update speed uniforms here
	// 	animationObjects.material.uniforms.u_speed_x.value = Number.parseFloat(noiseControls.sliderSpeedX.value);
	// }
    // if (noiseControls.sliderSpeedY) {
	// 	animationObjects.material.uniforms.u_speed_y.value = Number.parseFloat(noiseControls.sliderSpeedY.value);
	// }
	if (noiseControls.sliderBrightness) {
		animationObjects.material.uniforms.u_brightness.value = Number.parseFloat(noiseControls.sliderBrightness.value);
	}
    if (uiElements.noiseOctaves) { // Added octaves handler
        animationObjects.material.uniforms.u_octaves.value = Number.parseInt(uiElements.noiseOctaves.value);
    }

	// UI label updates are handled by the main script's event listeners calling updateAllValueDisplays
    // updateAllValueDisplays(); // Called by the event listener in script.js
}

function updateNoiseAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.material || !noiseControls.sliderSpeedX || !noiseControls.sliderSpeedY) return; // Updated checks
	// Read speeds from sliders within the update loop
	const speedX = Number.parseFloat(noiseControls.sliderSpeedX.value);
    const speedY = Number.parseFloat(noiseControls.sliderSpeedY.value);
    // Update uniforms directly - time is the main driver
	animationObjects.material.uniforms.u_time.value = elapsedTime;
    animationObjects.material.uniforms.u_speed_x.value = speedX;
    animationObjects.material.uniforms.u_speed_y.value = speedY;
}

function randomizeNoiseParameters() {
	console.log("Randomizing Noise parameters");
	const sliders = [
		noiseControls.sliderScale,
        noiseControls.sliderSpeedX, // Changed
        noiseControls.sliderSpeedY, // Added
		noiseControls.sliderBrightness,
        uiElements.noiseOctaves, // Added octaves slider
	];
	// ... existing randomization loop ...
    // Ensure the loop triggers 'input' event for each slider
    for (const slider of sliders) {
        if (!slider) continue;
        const min = Number.parseFloat(slider.min);
        const max = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step) || (slider.id.includes('octaves') ? 1 : 0.1); // Step 1 for octaves
        const range = max - min;
        // Ensure calculations handle potential floating point inaccuracies
        const randomValue = min + Math.random() * range;
        // Round to the nearest step
        const steppedValue = Math.round(randomValue / step) * step;
        // Clamp to min/max and fix precision
        const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
        slider.value = Math.min(max, Math.max(min, steppedValue)).toFixed(precision);

        slider.dispatchEvent(new Event('input', { bubbles: true })); // Trigger update handler and UI label update
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