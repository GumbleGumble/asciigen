// Metaballs Animation Module

// Shader code
const metaballsVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Improved Metaballs Fragment Shader
const metaballsFragmentShader = `
    varying vec2 vUv;
    uniform float u_time;
    uniform int u_num_metaballs; // Actual number of active metaballs
    uniform vec3 u_metaballs[25]; // Array for position (xy) and radius (z), max 25
    uniform float u_threshold;
    uniform float u_color_blend; // 0 = colorA, 1 = colorB

    // Define max balls const in shader, must match JS
    const int MAX_BALLS = 25;

    void main() {
        float totalInfluence = 0.0;
        // Map UV to a coordinate system, e.g., -aspectRatio*scale to +aspectRatio*scale horizontally
        // Assuming square output for now, scale controls the view range
        float scale = 5.0;
        vec2 uvCentered = (vUv * 2.0 - 1.0) * scale; // Center UVs and scale

        for (int i = 0; i < MAX_BALLS; ++i) {
            if (i >= u_num_metaballs) break; // Process only active metaballs

            vec2 ballPos = u_metaballs[i].xy;
            float radius = u_metaballs[i].z;
            if (radius <= 0.0) continue; // Skip inactive balls (radius 0)

            vec2 diff = uvCentered - ballPos;
            float distSq = dot(diff, diff);

            // Falloff function: radius^2 / distance^2 (adjust exponent for sharper/softer edges)
            // Avoid division by zero or extremely large values at center
            totalInfluence += (radius * radius) / max(distSq, 0.001);
        }

        // Map influence to intensity (0 to 1) using smoothstep around the threshold
        float intensity = smoothstep(u_threshold - 0.1, u_threshold + 0.1, totalInfluence);

        if (intensity < 0.01) {
             discard; // Discard fragment if below threshold (transparent background)
        }

        // Color blending
        vec3 colorA = vec3(0.1, 0.4, 0.9); // Blueish
        vec3 colorB = vec3(0.9, 0.2, 0.5); // Reddish/Pinkish
        vec3 finalColor = mix(colorA, colorB, u_color_blend); // Blend based on slider

        // Optionally modulate color by intensity or add glow
        finalColor *= intensity; // Simple modulation

        gl_FragColor = vec4(finalColor, 1.0); // Output final color (alpha 1.0)
    }
`;


function setupMetaballsAnimation() {
	console.log("Setting up Metaballs animation");
	// Ensure controls exist
	if (!metaballsControls || !metaballsControls.sliderCount || !metaballsControls.sliderSize || !metaballsControls.sliderSpeed || !metaballsControls.sliderThreshold || !metaballsControls.sliderColor) {
		console.error("Metaballs controls not found!");
		return;
	}

	const geometry = new THREE.PlaneGeometry(10, 10); // Covers view

	// Initialize metaball data array (pos.x, pos.y, radius)
	const maxBalls = 25; // Must match shader array size (MAX_BALLS)
	const metaballData = new Float32Array(maxBalls * 3);
	animationObjects.metaballData = metaballData; // Store for updates
	animationObjects.metaballVelocities = new Float32Array(maxBalls * 2); // Store velocities (vx, vy)
	animationObjects.maxBalls = maxBalls; // Store max balls constant

	const material = new THREE.ShaderMaterial({
		vertexShader: metaballsVertexShader,
		fragmentShader: metaballsFragmentShader,
		uniforms: {
			u_time: { value: 0.0 },
			u_num_metaballs: { value: Number.parseInt(metaballsControls.sliderCount.value) },
			u_metaballs: { value: metaballData }, // Pass the array reference
			u_threshold: { value: Number.parseFloat(metaballsControls.sliderThreshold.value) },
			u_color_blend: { value: Number.parseFloat(metaballsControls.sliderColor.value) },
		},
		transparent: true, // Needed for discard
	});

	const mesh = new THREE.Mesh(geometry, material);
	mesh.name = "metaballsPlane";
	scene.add(mesh);

	animationObjects.mesh = mesh;
	animationObjects.material = material;
	animationObjects.geometry = geometry;

	// Initialize ball positions and velocities based on current slider values
	initializeMetaballs();

	// Initial UI update handled by script.js calling updateAllValueDisplays
	updateAllValueDisplays();
}

function cleanupMetaballsAnimation() {
	console.log("Cleaning up Metaballs animation");
	if (animationObjects.mesh) {
		scene.remove(animationObjects.mesh);
		animationObjects.geometry?.dispose();
		animationObjects.material?.dispose();
	}
	animationObjects.mesh = null;
	animationObjects.material = null;
	animationObjects.geometry = null;
	animationObjects.metaballData = null;
	animationObjects.metaballVelocities = null;
	animationObjects.maxBalls = null;
}

function initializeMetaballs() {
	if (!animationObjects.metaballData || !animationObjects.metaballVelocities || !metaballsControls.sliderCount || !metaballsControls.sliderSize || !metaballsControls.sliderSpeed) return;

	const numBalls = Number.parseInt(metaballsControls.sliderCount.value);
	const size = Number.parseFloat(metaballsControls.sliderSize.value);
	const speed = Number.parseFloat(metaballsControls.sliderSpeed.value); // Read initial speed
	const data = animationObjects.metaballData;
	const velocities = animationObjects.metaballVelocities;
	const maxBalls = animationObjects.maxBalls;
	const bounds = 4.0; // Movement bounds (relative to the shader's scaled coordinates)

	console.log(`Initializing ${numBalls} metaballs. BaseSize: ${size}, BaseSpeed: ${speed}`); // Log init params

	for (let i = 0; i < maxBalls; i++) { // Initialize entire array
		const i3 = i * 3;
		const i2 = i * 2;
		if (i < numBalls) {
			// Position (random within bounds)
			data[i3] = (Math.random() - 0.5) * 2 * bounds;
			data[i3 + 1] = (Math.random() - 0.5) * 2 * bounds;
			// Radius (base size + slight variation)
			data[i3 + 2] = Math.max(0.1, size * (0.8 + Math.random() * 0.4)); // Ensure radius > 0

			// Velocity (random direction and magnitude based on speed slider)
			const angle = Math.random() * Math.PI * 2;
			// Use the actual speed slider value for initial velocity magnitude
			const velMag = speed * (0.5 + Math.random() * 0.5); // Speed variation
			velocities[i2] = Math.cos(angle) * velMag;
			velocities[i2 + 1] = Math.sin(angle) * velMag;
            // Log initial velocity for the first ball
            if (i === 0) {
                console.log(`Ball 0 initial velocity: (${velocities[i2].toFixed(3)}, ${velocities[i2+1].toFixed(3)}), Magnitude: ${velMag.toFixed(3)}`);
            }
		} else {
			// Deactivate extra balls by setting radius to 0
			data[i3] = 0.0;
			data[i3 + 1] = 0.0;
			data[i3 + 2] = 0.0; // Zero radius effectively disables the ball in the shader
			velocities[i2] = 0.0;
			velocities[i2 + 1] = 0.0;
		}
	}
	// Update uniform count and the data array itself
	if (animationObjects.material) {
		animationObjects.material.uniforms.u_num_metaballs.value = numBalls;
		animationObjects.material.uniforms.u_metaballs.value = data; // Ensure uniform points to the updated data
		// animationObjects.material.uniforms.u_metaballs.needsUpdate = true; // Not typically needed for Float32Array uniforms
	}
}


function handleMetaballsParamChange() {
	// Check if currentAnimationType is defined globally (from script.js)
	if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'metaballs' || !animationObjects.material) return;
	console.log("Handling Metaballs parameter change");

	// Ensure controls exist
	if (!metaballsControls.sliderCount || !metaballsControls.sliderSize || !metaballsControls.sliderThreshold || !metaballsControls.sliderColor) return;

	const numBalls = Number.parseInt(metaballsControls.sliderCount.value);
	const size = Number.parseFloat(metaballsControls.sliderSize.value);
	const threshold = Number.parseFloat(metaballsControls.sliderThreshold.value);
	const colorBlend = Number.parseFloat(metaballsControls.sliderColor.value);

	const currentNumBalls = animationObjects.material.uniforms.u_num_metaballs.value;

	// Check if count changed
	if (currentNumBalls !== numBalls) {
		console.log("Metaball count changed, re-initializing...");
		initializeMetaballs(); // Re-init positions/velocities/radii and updates count uniform
	} else {
		// If only size changed, update radii of existing balls
		const data = animationObjects.metaballData;
		for (let i = 0; i < numBalls; i++) {
			// Update radius based on new size, maintain some variation
			data[i * 3 + 2] = Math.max(0.1, size * (0.8 + Math.random() * 0.4));
		}
		animationObjects.material.uniforms.u_metaballs.value = data; // Update uniform reference if needed (usually not)
	}

	// Update other uniforms that don't require re-initialization
	animationObjects.material.uniforms.u_threshold.value = threshold;
	animationObjects.material.uniforms.u_color_blend.value = colorBlend;
	// Speed is read in update loop

	// UI label updates are handled by the main script's event listeners calling updateAllValueDisplays
}

function updateMetaballsAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.material || !animationObjects.metaballData || !animationObjects.metaballVelocities || !metaballsControls.sliderSpeed) return;

	const speed = Number.parseFloat(metaballsControls.sliderSpeed.value); // Read current speed
	const data = animationObjects.metaballData;
	const velocities = animationObjects.metaballVelocities;
	const numBalls = animationObjects.material.uniforms.u_num_metaballs.value;
	const bounds = 4.0; // Movement bounds, should match initialization

    // Log delta time and speed once per frame if they seem problematic
    // console.log(`Metaballs Update - dt: ${deltaTime.toFixed(4)}, speed: ${speed}`); // Uncomment for debugging

	for (let i = 0; i < numBalls; i++) {
		const i3 = i * 3;
		const i2 = i * 2;

        // const oldX = data[i3]; // Store old position for logging
        // const oldY = data[i3 + 1];

		// Update position based on velocity, speed slider, and delta time
        // Make sure velocity itself isn't zero
        const currentVelX = velocities[i2];
        const currentVelY = velocities[i2 + 1];
        const deltaX = currentVelX * deltaTime * speed;
        const deltaY = currentVelY * deltaTime * speed;

		data[i3] += deltaX;
		data[i3 + 1] += deltaY;

        // Log movement for the first ball if significant
        if (i === 0 && (Math.abs(deltaX) > 1e-5 || Math.abs(deltaY) > 1e-5)) {
             // console.log(`Ball 0 moved by (${deltaX.toFixed(4)}, ${deltaY.toFixed(4)}). Pos: (${data[i3].toFixed(2)}, ${data[i3+1].toFixed(2)}). Vel: (${currentVelX.toFixed(3)}, ${currentVelY.toFixed(3)}). Speed: ${speed}, dt: ${deltaTime.toFixed(4)}`); // Uncomment for debugging
        }


		// Boundary collision (simple reflection)
		if (Math.abs(data[i3]) > bounds) {
			velocities[i2] *= -1; // Reverse x-velocity
			data[i3] = Math.sign(data[i3]) * bounds; // Clamp position to boundary
            // if (i === 0) console.log("Ball 0 hit X boundary"); // Uncomment for debugging
		}
		if (Math.abs(data[i3 + 1]) > bounds) {
			velocities[i2 + 1] *= -1; // Reverse y-velocity
			data[i3 + 1] = Math.sign(data[i3 + 1]) * bounds; // Clamp position to boundary
            // if (i === 0) console.log("Ball 0 hit Y boundary"); // Uncomment for debugging
		}
	}

	// Update uniforms
	animationObjects.material.uniforms.u_time.value = elapsedTime;
	animationObjects.material.uniforms.u_metaballs.value = data; // Pass the updated data array
	// animationObjects.material.uniforms.u_metaballs.needsUpdate = true; // Usually not needed for Float32Array
}

function randomizeMetaballsParameters() {
	console.log("Randomizing Metaballs parameters");
	const sliders = [
		metaballsControls.sliderCount,
		metaballsControls.sliderSize,
		metaballsControls.sliderSpeed,
		metaballsControls.sliderThreshold,
		metaballsControls.sliderColor,
	];
	for (const slider of sliders) {
		if (!slider) continue;
		const min = Number.parseFloat(slider.min);
		const max = Number.parseFloat(slider.max);
		const step = Number.parseFloat(slider.step) || (slider.id.includes('count') ? 1 : 0.01); // Step 1 for count
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
window.METABALLS_ANIMATION = {
	setup: setupMetaballsAnimation,
	update: updateMetaballsAnimation,
	cleanup: cleanupMetaballsAnimation,
	randomize: randomizeMetaballsParameters,
	handleParamChange: handleMetaballsParamChange
};