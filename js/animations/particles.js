// Particle System Animation Module

// Ensure SimplexNoise is loaded (e.g., via script tag in index.html)
// Check if SimplexNoise exists, provide fallback if not
const SimplexNoise = window.SimplexNoise || {
    noise3D: (x, y, z) => Math.random() * 2 - 1, // Simple random fallback
    // Add noise2D or noise4D if needed by other parts or fallback logic
};
if (!window.SimplexNoise) {
    console.warn("SimplexNoise library not found, using simple random fallback for particle flow.");
}

// Expose module methods
window.PARTICLES_ANIMATION = {
	setup: setupParticleAnimation,
	update: updateParticlesAnimation,
	cleanup: cleanupParticleAnimation,
	randomize: randomizeParticleParameters,
	handleCountChange: handleParticleCountChange, // Specific handler for count
	handleEmitterChange: handleParticleEmitterChange, // Specific handler for emitter
	handleParamChange: handleParticleParamChange, // General handler for other params
};

// --- Simplex Noise Permutation Table (if needed directly, otherwise use library) ---
// ... (Keep the large permutation table if SimplexNoise library isn't used/available)

// --- Simplex Noise 3D function (if needed directly) ---
// ... (Keep noise function if SimplexNoise library isn't used/available)


// --- Particle Initialization and Reset ---

function resetParticle(
	index,
	positions,
	velocities,
	lifespans,
	initialLifespans,
	colors,
    sizes, // Added sizes array
	emitterShape,
	emitterSize,
	maxLifespan,
    baseSize // Added baseSize
) {
	const i3 = index * 3;
	const lifespan = Math.random() * maxLifespan * 0.5 + maxLifespan * 0.5; // Random lifespan between 50% and 100%
	lifespans[index] = lifespan;
	initialLifespans[index] = lifespan; // Store the initial max lifespan
    sizes[index] = baseSize * (0.5 + Math.random()); // Initial size variation

	// Initial position based on emitter shape
	let initialSpeedFactor = 0.1; // Base initial speed
	let velX = 0;
    let velY = 0;
    let velZ = 0;

	if (emitterShape === "sphere") {
		const phi = Math.acos(-1 + 2 * Math.random()); // Uniform point on sphere surface
		const theta = Math.random() * Math.PI * 2;
		const radius = Math.cbrt(Math.random()) * emitterSize; // Uniform point within sphere volume
		positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
		positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
		positions[i3 + 2] = radius * Math.cos(phi);
		// Velocity outward from center
		const posLen = Math.sqrt(positions[i3]**2 + positions[i3+1]**2 + positions[i3+2]**2) || 1;
		initialSpeedFactor = 0.2; // Slightly faster start for sphere
		velX = (positions[i3] / posLen) * initialSpeedFactor * (Math.random() + 0.5);
		velY = (positions[i3 + 1] / posLen) * initialSpeedFactor * (Math.random() + 0.5);
		velZ = (positions[i3 + 2] / posLen) * initialSpeedFactor * (Math.random() + 0.5);
	} else if (emitterShape === "point") {
		positions[i3] = 0;
		positions[i3 + 1] = 0;
		positions[i3 + 2] = 0;
		// Velocity outward in random direction
		const phi = Math.acos(-1 + 2 * Math.random());
		const theta = Math.random() * Math.PI * 2;
		initialSpeedFactor = 0.3; // Faster start for point
		velX = initialSpeedFactor * Math.sin(phi) * Math.cos(theta) * (Math.random() + 0.5);
		velY = initialSpeedFactor * Math.sin(phi) * Math.sin(theta) * (Math.random() + 0.5);
		velZ = initialSpeedFactor * Math.cos(phi) * (Math.random() + 0.5);
	} else {
		// Default to box
		positions[i3] = (Math.random() - 0.5) * emitterSize * 2;
		positions[i3 + 1] = (Math.random() - 0.5) * emitterSize * 2;
		positions[i3 + 2] = (Math.random() - 0.5) * emitterSize * 2;
		// Random initial velocity
		velX = (Math.random() - 0.5) * initialSpeedFactor;
		velY = (Math.random() - 0.5) * initialSpeedFactor;
		velZ = (Math.random() - 0.5) * initialSpeedFactor;
	}

	velocities[i3] = velX;
	velocities[i3 + 1] = velY;
	velocities[i3 + 2] = velZ;

	// Initial color (e.g., based on position or random)
	const hue = (Math.random() * 0.2 + 0.55) % 1.0; // Blue/purple range
	const saturation = 0.7 + Math.random() * 0.3;
	const lightness = 0.6 + Math.random() * 0.2;
	const color = new THREE.Color().setHSL(hue, saturation, lightness);
	colors[i3] = color.r;
	colors[i3 + 1] = color.g;
	colors[i3 + 2] = color.b;
}

// --- Setup, Cleanup, Handlers ---

function setupParticleAnimation() {
	console.log("Setting up Particle System animation");

	// Get parameters from controls
	const particleCount = Number.parseInt(particlesControls.sliderCount.value);
	const baseSize = Number.parseFloat(particlesControls.sliderSize.value); // Use base size
	const emitterShape = particlesControls.selectEmitterShape.value;
	const emitterSize = Number.parseFloat(
		particlesControls.sliderEmitterSize.value,
	);
	const lifespan = Number.parseFloat(particlesControls.sliderLifespan.value);

	// Create particle geometry
	const particlesGeometry = new THREE.BufferGeometry();

	// Create arrays to hold particle positions and attributes
	const positions = new Float32Array(particleCount * 3);
	const velocities = new Float32Array(particleCount * 3);
	const lifespans = new Float32Array(particleCount);
	const initialLifespans = new Float32Array(particleCount);
	const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount); // Add sizes array

	// Initialize particles
	for (let i = 0; i < particleCount; i++) {
		resetParticle(
			i,
			positions,
			velocities,
			lifespans,
			initialLifespans,
			colors,
            sizes, // Pass sizes array
			emitterShape,
			emitterSize,
			lifespan,
            baseSize // Pass base size
		);
	}

	// Set geometry attributes
	particlesGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions, 3),
	);
	particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1)); // Add size attribute

	// Create particle material - Use ShaderMaterial for size/alpha control
	const particleVertexShader = `
        attribute float size;
        attribute vec3 color; // Use 'color' instead of 'customColor' if using PointsMaterial vertexColors
        varying vec3 vColor;
        varying float vAlpha; // Varying for alpha based on lifespan

        uniform float baseSize; // Pass base size from slider
        uniform float sizeAttenuationFactor; // Control size attenuation

        void main() {
            vColor = color;

            // Calculate point size based on attribute and distance
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            float pointSize = size * baseSize; // Use attribute and base size
            // Size attenuation (optional, THREE.PointsMaterial does this)
            if (sizeAttenuationFactor > 0.0) {
                 gl_PointSize = pointSize * (sizeAttenuationFactor / -mvPosition.z);
            } else {
                 gl_PointSize = pointSize;
            }

            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    const particleFragmentShader = `
        varying vec3 vColor;
        varying float vAlpha; // Receive alpha from vertex shader (or calculate here)

        uniform sampler2D pointTexture; // Texture for particle shape

        void main() {
            // Simple circular particle shape
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard; // Discard fragments outside circle

            // Use vertex color and potentially fade alpha
            // Alpha calculation needs lifespan info passed via another attribute/uniform
            // For now, just use vertex color
            gl_FragColor = vec4(vColor, 1.0); // Use full alpha for now

            // Optional: Use texture
            // gl_FragColor = gl_FragColor * texture2D(pointTexture, gl_PointCoord);
        }
    `;

	const particlesMaterial = new THREE.ShaderMaterial({
        uniforms: {
            baseSize: { value: baseSize },
            sizeAttenuationFactor: { value: 5.0 }, // Adjust for desired attenuation
            // pointTexture: { value: new THREE.TextureLoader().load('path/to/particle.png') } // Optional texture
        },
        vertexShader: particleVertexShader,
        fragmentShader: particleFragmentShader,
        vertexColors: true, // Still needed to pass color attribute
        blending: THREE.AdditiveBlending, // Brighter effect
        depthWrite: false, // Prevent particles from occluding each other incorrectly
        transparent: true,
    });


	// Create particle system
	const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
	particleSystem.name = "particleSystem";
	scene.add(particleSystem);

	// Store references
	animationObjects.particleSystem = particleSystem;
	animationObjects.particlesGeometry = particlesGeometry;
	animationObjects.particlesMaterial = particlesMaterial;
	animationObjects.positions = positions;
	animationObjects.velocities = velocities;
	animationObjects.lifespans = lifespans;
	animationObjects.initialLifespans = initialLifespans;
	animationObjects.colors = colors;
    animationObjects.sizes = sizes; // Store sizes array
	animationObjects.particleCount = particleCount;
	animationObjects.maxLifespan = lifespan;

    updateAllValueDisplays();
}

function cleanupParticleAnimation() {
	console.log("Cleaning up Particle System animation");
	if (animationObjects.particleSystem) {
		scene.remove(animationObjects.particleSystem);
		if (animationObjects.particlesGeometry)
			animationObjects.particlesGeometry.dispose();
		if (animationObjects.particlesMaterial)
			animationObjects.particlesMaterial.dispose();
	}
	// Clear all particle-specific properties
	animationObjects.particleSystem = null;
	animationObjects.particlesGeometry = null;
	animationObjects.particlesMaterial = null;
	animationObjects.positions = null;
	animationObjects.velocities = null;
	animationObjects.lifespans = null;
	animationObjects.initialLifespans = null;
	animationObjects.colors = null;
	animationObjects.emitterShape = null;
	animationObjects.emitterSize = null;
	animationObjects.particleCount = null;
	animationObjects.maxLifespan = null;
}

function handleParticleCountChange() {
	// Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== "particles") return;
	console.log("Particle count changed, recreating...");
	cleanupParticleAnimation();
	setupParticleAnimation();
}

function handleParticleParamChange() {
	// Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== "particles" || !animationObjects.particlesMaterial)
		return;

	// Update material base size uniform if control exists
	if (particlesControls.sliderSize && animationObjects.particlesMaterial.uniforms.baseSize) {
		const baseSize = Number.parseFloat(particlesControls.sliderSize.value);
		animationObjects.particlesMaterial.uniforms.baseSize.value = baseSize;
	}

	// Update max lifespan if control exists and value changed
	if (particlesControls.sliderLifespan) {
		const newMaxLifespan = Number.parseFloat(particlesControls.sliderLifespan.value);
		if (animationObjects.maxLifespan !== newMaxLifespan) {
			animationObjects.maxLifespan = newMaxLifespan;
			console.log("Max lifespan updated to:", newMaxLifespan);
		}
	}

    // Other parameters like speed, force type, strength are read directly in update loop
    // UI label updates are handled by the main script's event listeners calling updateAllValueDisplays
}

function handleParticleEmitterChange() {
	// Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== "particles") return;
	// Emitter shape or size change requires recreating particles
	console.log("Particle emitter changed, recreating...");
	cleanupParticleAnimation();
	setupParticleAnimation();
	// setupParticleAnimation calls updateAllValueDisplays at the end
}

// --- Animation Update ---

function updateParticlesAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.particleSystem || !SimplexNoise) return; // Ensure noise library is loaded

	const positions = animationObjects.positions;
	const velocities = animationObjects.velocities;
	const lifespans = animationObjects.lifespans;
	const initialLifespans = animationObjects.initialLifespans;
	const colors = animationObjects.colors;
    const sizes = animationObjects.sizes; // Get sizes array
	const particleCount = animationObjects.particleCount;
	const geometry = animationObjects.particlesGeometry;
	const material = animationObjects.particlesMaterial; // Get material reference

	// Get current parameters
	const speed = Number.parseFloat(particlesControls.sliderSpeed?.value || 1.0); // Add default
	const forceType = particlesControls.selectForceType?.value || 'none'; // Add default
	const forceStrength = Number.parseFloat(particlesControls.sliderForceStrength?.value || 0.1); // Add default
	const maxLifespan = animationObjects.maxLifespan; // Use stored max lifespan
	const emitterShape = particlesControls.selectEmitterShape?.value || 'box'; // Add default
	const emitterSize = Number.parseFloat(particlesControls.sliderEmitterSize?.value || 5.0); // Add default
    const baseSize = Number.parseFloat(particlesControls.sliderSize?.value || 1.0); // Get base size

	// Flow field parameters (only used if forceType is 'flow')
	const flowTime = elapsedTime * 0.1; // Slower time evolution for flow field
	const flowScale = 0.5; // Spatial scale of the flow field noise

	const tempColor = new THREE.Color(); // Reuse color object

	// Update each particle
	for (let i = 0; i < particleCount; i++) {
		const i3 = i * 3;

		// Decrease lifespan
		lifespans[i] -= deltaTime;

		// If particle has died, respawn it
		if (lifespans[i] <= 0) {
			resetParticle(
				i,
				positions,
				velocities,
				lifespans,
				initialLifespans,
				colors,
                sizes, // Pass sizes
				emitterShape,
				emitterSize,
				maxLifespan,
                baseSize // Pass base size
			);
		} else {
			// Apply forces
			let forceX = 0;
            let forceY = 0;
            let forceZ = 0;
            const posX = positions[i3];
            const posY = positions[i3 + 1];
            const posZ = positions[i3 + 2];

			if (forceType === "gravity") {
				forceY = -forceStrength; // Simple gravity pulls down
			} else if (forceType === "vortex") {
				// const posX = positions[i3]; // Already defined above
				// const posZ = positions[i3 + 2]; // Already defined above
				const distSq = posX * posX + posZ * posZ;
				if (distSq > 0.01) {
					const dist = Math.sqrt(distSq);
					// Tangential force for swirl
					forceX = (-posZ / dist) * forceStrength;
					forceZ = (posX / dist) * forceStrength;
					// Optional: Add inward/outward force (pull towards center slightly)
					forceX -= (posX / dist) * forceStrength * 0.1;
					forceZ -= (posZ / dist) * forceStrength * 0.1;
				}
			} else if (forceType === "flow") {
				// Added Flow Field
				// Use 3D simplex noise to get a vector field
				// Ensure SimplexNoise.noise3D exists and is used correctly
				const noiseX = SimplexNoise.noise3D(
					posX * flowScale,
					posY * flowScale,
					flowTime,
				);
				const noiseY = SimplexNoise.noise3D(
					posY * flowScale + 100, // Offset inputs for different noise values
					posZ * flowScale,
					flowTime,
				);
				const noiseZ = SimplexNoise.noise3D(
					posZ * flowScale,
					posX * flowScale - 100,
					flowTime,
				);

				forceX = noiseX * forceStrength;
				forceY = noiseY * forceStrength;
				forceZ = noiseZ * forceStrength;
			} else if (forceType === "attract") {
				// Simple attraction to origin
				// const posX = positions[i3]; // Already defined above
				// const posY = positions[i3 + 1]; // Already defined above
				// const posZ = positions[i3 + 2]; // Already defined above
				const distSq = posX * posX + posY * posY + posZ * posZ;
				if (distSq > 0.01) {
					const dist = Math.sqrt(distSq);
                    const strengthFactor = 1.0; // Constant force for now
					forceX = (-posX / dist) * forceStrength * strengthFactor;
					forceY = (-posY / dist) * forceStrength * strengthFactor;
					forceZ = (-posZ / dist) * forceStrength * strengthFactor;
				}
			} else if (forceType === "repel") {
				// Simple repulsion from origin
				// const posX = positions[i3]; // Already defined above
				// const posY = positions[i3 + 1]; // Already defined above
				// const posZ = positions[i3 + 2]; // Already defined above
				const distSq = posX * posX + posY * posY + posZ * posZ;
				if (distSq > 0.01) {
					const dist = Math.sqrt(distSq);
					// Force decreases with distance (simple inverse distance)
					const strengthFactor = 1.0 / (dist + 0.5); // Avoid division by zero, adjust falloff
					forceX = (posX / dist) * forceStrength * strengthFactor;
					forceY = (posY / dist) * forceStrength * strengthFactor;
					forceZ = (posZ / dist) * forceStrength * strengthFactor;
				}
			}

			// Update velocity using Euler integration (Velocity Verlet might be more stable)
			velocities[i3] += forceX * deltaTime;
			velocities[i3 + 1] += forceY * deltaTime;
			velocities[i3 + 2] += forceZ * deltaTime;

			// Optional: Add damping
            const damping = 0.98; // Adjust damping factor
            velocities[i3] *= damping;
            velocities[i3 + 1] *= damping;
            velocities[i3 + 2] *= damping;

			// Optional: Clamp velocity magnitude
			// const maxVel = 5.0;
			// const velSq = velocities[i3]**2 + velocities[i3+1]**2 + velocities[i3+2]**2;
			// if (velSq > maxVel*maxVel) {
			//     const velMag = Math.sqrt(velSq);
			//     velocities[i3] = (velocities[i3] / velMag) * maxVel;
            //     velocities[i3+1] = (velocities[i3+1] / velMag) * maxVel;
            //     velocities[i3+2] = (velocities[i3+2] / velMag) * maxVel;
			// }

			// Update position
			positions[i3] += velocities[i3] * speed * deltaTime;
			positions[i3 + 1] += velocities[i3 + 1] * speed * deltaTime;
			positions[i3 + 2] += velocities[i3 + 2] * speed * deltaTime;

			// --- Update Color and Size over Lifespan ---
			const lifeRatio = Math.max(0, lifespans[i] / initialLifespans[i]); // Clamp ratio 0-1

            // Fade color towards dark blue/black
			const fadeTargetColor = new THREE.Color(0x000005); // Very dark blue target
			tempColor.setRGB(colors[i3], colors[i3 + 1], colors[i3 + 2]); // Get current color
            // Lerp based on 1 - lifeRatio (so it fades *towards* target as life decreases)
			tempColor.lerp(fadeTargetColor, 1.0 - lifeRatio);
			colors[i3] = tempColor.r;
			colors[i3 + 1] = tempColor.g;
			colors[i3 + 2] = tempColor.b;

            // Fade size (e.g., shrink over time)
            // Use smoothstep for nicer fade: t * t * (3.0 - 2.0 * t) where t is lifeRatio
            const smoothLifeRatio = lifeRatio * lifeRatio * (3.0 - 2.0 * lifeRatio);
            sizes[i] = baseSize * smoothLifeRatio * (0.5 + Math.random()); // Apply base size and fade

            // Update material opacity (Requires passing lifeRatio to fragment shader)
            // This needs another attribute or careful uniform management.
            // For now, alpha is handled in the fragment shader (currently static).
		}
	}

	// Mark attributes for update
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.color.needsUpdate = true; // Mark colors for update
    geometry.attributes.size.needsUpdate = true; // Mark sizes for update
}

// --- Randomization ---

function randomizeParticleParameters() {
	console.log("Randomizing Particle parameters...");
	let needsRestart = false;

	// Randomize sliders
	const sliders = [
		particlesControls.sliderCount,
		particlesControls.sliderSize,
		particlesControls.sliderSpeed,
		particlesControls.sliderLifespan,
		particlesControls.sliderEmitterSize,
		particlesControls.sliderForceStrength,
	];
	for (const slider of sliders) {
        if (!slider) continue;
		const min = Number.parseFloat(slider.min);
		const max = Number.parseFloat(slider.max);
		const step = Number.parseFloat(slider.step) || (slider.id.includes('count') ? 1 : 0.1); // Step 1 for count, 0.1 otherwise
		const range = max - min;
		// Ensure calculations handle potential floating point inaccuracies
        const randomValue = min + Math.random() * range;
        // Round to the nearest step
        const steppedValue = Math.round(randomValue / step) * step;
        // Clamp to min/max and fix precision
        const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
        const newValue = Math.min(max, Math.max(min, steppedValue)).toFixed(precision);

		// Check if count or emitter size changed significantly
		if ((slider === particlesControls.sliderCount || slider === particlesControls.sliderEmitterSize) && slider.value !== newValue) {
			needsRestart = true;
		}
		slider.value = newValue; // Set the value directly
        // Don't dispatch events here; handle updates after setting all values
	}

	// Randomize selects
	const selects = [
		particlesControls.selectEmitterShape,
		particlesControls.selectForceType,
	];
	for (const select of selects) {
        if (!select) continue;
		const options = select.options;
		const randomIndex = Math.floor(Math.random() * options.length);
		if (select.selectedIndex !== randomIndex) {
			// Emitter shape change requires restart
			if (select === particlesControls.selectEmitterShape) {
				needsRestart = true;
			}
			select.selectedIndex = randomIndex; // Set the value directly
            // Don't dispatch events here
		}
	}

	// Trigger updates or restart
	if (needsRestart) {
		console.log(
			"Restarting particles due to randomized count or emitter change.",
		);
		// Cleanup might already be handled by switchAnimation in main script if type changes
		// If type doesn't change, we need to handle it here.
        if (typeof currentAnimationType !== 'undefined' && currentAnimationType === 'particles') {
            cleanupParticleAnimation();
            setupParticleAnimation(); // This calls updateAllValueDisplays internally at the end
        } else {
            // If animation type is changing anyway, setup will be called by switchAnimation
            // Just ensure labels are updated for the *new* state before the switch happens
             updateAllValueDisplays();
        }
	} else {
		// Update labels for sliders/selects that didn't cause a restart
		updateAllValueDisplays(); // Call the global update function from script.js
		// Update particle size/lifespan if it changed
        handleParticleParamChange(); // Explicitly call handler for non-restarting changes
	}
}
