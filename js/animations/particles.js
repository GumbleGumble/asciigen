s// Particle System Animation Module

// Ensure SimplexNoise is loaded (e.g., via script tag in index.html)
const SimplexNoise = window.SimplexNoise;

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
	emitterShape,
	emitterSize,
	maxLifespan,
) {
	const i3 = index * 3;
	const lifespan = Math.random() * maxLifespan * 0.5 + maxLifespan * 0.5; // Random lifespan between 50% and 100%
	lifespans[index] = lifespan;
	initialLifespans[index] = lifespan; // Store the initial max lifespan

	// Initial position based on emitter shape
	if (emitterShape === "sphere") {
		const phi = Math.acos(-1 + 2 * Math.random());
		const theta = Math.sqrt(4 * Math.PI) * Math.random();
		positions[i3] = emitterSize * Math.sin(phi) * Math.cos(theta);
		positions[i3 + 1] = emitterSize * Math.sin(phi) * Math.sin(theta);
		positions[i3 + 2] = emitterSize * Math.cos(phi);
	} else if (emitterShape === "point") {
		positions[i3] = 0;
		positions[i3 + 1] = 0;
		positions[i3 + 2] = 0;
	} else {
		// Default to box
		positions[i3] = (Math.random() - 0.5) * emitterSize * 2;
		positions[i3 + 1] = (Math.random() - 0.5) * emitterSize * 2;
		positions[i3 + 2] = (Math.random() - 0.5) * emitterSize * 2;
	}

	// Initial velocity (e.g., outward from center or random)
	const speedFactor = 0.1; // Adjust initial speed
	if (emitterShape === "point" || emitterShape === "sphere") {
		// Start moving outwards from center
		const dirX = positions[i3];
		const dirY = positions[i3 + 1];
		const dirZ = positions[i3 + 2];
		const len = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ) || 1;
		velocities[i3] = (dirX / len) * speedFactor * (Math.random() + 0.5);
		velocities[i3 + 1] = (dirY / len) * speedFactor * (Math.random() + 0.5);
		velocities[i3 + 2] = (dirZ / len) * speedFactor * (Math.random() + 0.5);
	} else {
		// Random initial velocity for box
		velocities[i3] = (Math.random() - 0.5) * speedFactor;
		velocities[i3 + 1] = (Math.random() - 0.5) * speedFactor;
		velocities[i3 + 2] = (Math.random() - 0.5) * speedFactor;
	}


	// Initial color (e.g., based on position or random)
	const hue = (Math.random() * 0.2 + 0.5) % 1.0; // Cyan/Blue/Purple range
	const saturation = 0.8 + Math.random() * 0.2;
	const lightness = 0.5 + Math.random() * 0.3;
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
	const particleSize = Number.parseFloat(particlesControls.sliderSize.value);
	const emitterShape = particlesControls.selectEmitterShape.value;
	const emitterSize = Number.parseFloat(
		particlesControls.sliderEmitterSize.value,
	);
	const lifespan = Number.parseFloat(particlesControls.sliderLifespan.value);

	// Update display values
	particlesControls.valueCount.textContent = particleCount;
	if (uiElements.particleSizeValue)
		uiElements.particleSizeValue.textContent = particleSize.toFixed(1);
	if (uiElements.particleSpeedValue)
		uiElements.particleSpeedValue.textContent = Number.parseFloat(
			particlesControls.sliderSpeed.value,
		).toFixed(1);
	if (uiElements.particleLifespanValue)
		uiElements.particleLifespanValue.textContent = lifespan.toFixed(1);
	if (uiElements.particleEmitterSizeValue)
		uiElements.particleEmitterSizeValue.textContent = emitterSize.toFixed(1);
	if (uiElements.particleForceStrengthValue)
		uiElements.particleForceStrengthValue.textContent = Number.parseFloat(
			particlesControls.sliderForceStrength.value,
		).toFixed(1);

	// Create particle geometry - simple points
	const particlesGeometry = new THREE.BufferGeometry();

	// Create arrays to hold particle positions and attributes
	const positions = new Float32Array(particleCount * 3); // x, y, z
	const velocities = new Float32Array(particleCount * 3);
	const lifespans = new Float32Array(particleCount);
	const initialLifespans = new Float32Array(particleCount); // Store max lifespan per particle
	const colors = new Float32Array(particleCount * 3); // r, g, b

	// Initialize particle positions based on emitter shape
	for (let i = 0; i < particleCount; i++) {
		resetParticle(
			i,
			positions,
			velocities,
			lifespans,
			initialLifespans,
			colors,
			emitterShape,
			emitterSize,
			lifespan, // Pass current max lifespan
		);
	}

	// Set geometry attributes
	particlesGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions, 3),
	);
	particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3)); // Add color attribute

	// Create particle material
	const particlesMaterial = new THREE.PointsMaterial({
		size: particleSize,
		vertexColors: true, // Use colors defined in the geometry attribute
		// blending: THREE.AdditiveBlending, // Optional: for brighter effect
		transparent: true, // Optional: if opacity is used
		opacity: 0.8, // Optional: set base opacity
		sizeAttenuation: true, // Make particles smaller further away
	});

	// Create particle system
	const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
	particleSystem.name = "particleSystem";
	scene.add(particleSystem);

	// Store references for animation updates
	animationObjects.particleSystem = particleSystem;
	animationObjects.particlesGeometry = particlesGeometry;
	animationObjects.particlesMaterial = particlesMaterial;
	animationObjects.positions = positions;
	animationObjects.velocities = velocities;
	animationObjects.lifespans = lifespans;
	animationObjects.initialLifespans = initialLifespans;
	animationObjects.colors = colors;
	animationObjects.emitterShape = emitterShape; // Store current emitter shape
	animationObjects.emitterSize = emitterSize; // Store current emitter size
	animationObjects.particleCount = particleCount; // Store current count
	animationObjects.maxLifespan = lifespan; // Store current max lifespan
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
	// Update material size
	const size = Number.parseFloat(particlesControls.sliderSize.value);
	animationObjects.particlesMaterial.size = size;
	if (uiElements.particleSizeValue)
		uiElements.particleSizeValue.textContent = size.toFixed(1);

    // Update max lifespan if it changed (will affect new particles)
    const newMaxLifespan = Number.parseFloat(particlesControls.sliderLifespan.value);
    if (animationObjects.maxLifespan !== newMaxLifespan) {
        animationObjects.maxLifespan = newMaxLifespan;
        console.log("Max lifespan updated to:", newMaxLifespan);
    }

    // Other parameters like speed, force type, strength are read directly in update loop
}

function handleParticleEmitterChange() {
	// Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== "particles") return;
	// Emitter shape or size change requires recreating particles
	console.log("Particle emitter changed, recreating...");
	cleanupParticleAnimation();
	setupParticleAnimation();
}

// --- Animation Update ---

function updateParticlesAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.particleSystem || !SimplexNoise) return; // Ensure noise library is loaded

	const positions = animationObjects.positions;
	const velocities = animationObjects.velocities;
	const lifespans = animationObjects.lifespans;
	const initialLifespans = animationObjects.initialLifespans;
	const colors = animationObjects.colors;
	const particleCount = animationObjects.particleCount;
	const geometry = animationObjects.particlesGeometry;
	// const material = animationObjects.particlesMaterial; // Material reference not needed here

	// Get current parameters
	const speed = Number.parseFloat(particlesControls.sliderSpeed.value);
	const forceType = particlesControls.selectForceType.value;
	const forceStrength = Number.parseFloat(
		particlesControls.sliderForceStrength.value,
	);
	const maxLifespan = animationObjects.maxLifespan; // Use stored max lifespan
	const emitterShape = particlesControls.selectEmitterShape.value; // Get current shape
	const emitterSize = Number.parseFloat(
		particlesControls.sliderEmitterSize.value,
	); // Get current size

	// Flow field parameters (only used if forceType is 'flow')
	const flowTime = elapsedTime * 0.1; // Slower time evolution for flow field
	const flowScale = 0.5; // Spatial scale of the flow field noise

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
				emitterShape, // Pass current emitter shape
				emitterSize, // Pass current emitter size
				maxLifespan, // Pass current max lifespan
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
				const noiseX = SimplexNoise.noise3D( // Use noise3D
					posX * flowScale,
					posY * flowScale,
					flowTime,
				);
				const noiseY = SimplexNoise.noise3D( // Use noise3D
					posY * flowScale + 100, // Offset inputs for different noise values
					posZ * flowScale,
					flowTime,
				);
				const noiseZ = SimplexNoise.noise3D( // Use noise3D
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
            const damping = 0.98;
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

			// Fade color based on lifespan (optional) - Fade towards black
			const lifeRatio = Math.max(0, lifespans[i] / initialLifespans[i]); // Clamp ratio 0-1
            // Get original color (set during reset) - requires storing original color or recalculating
            // Simple approach: just scale current color by lifeRatio
			colors[i3] *= lifeRatio; // This will fade existing color towards black
			colors[i3 + 1] *= lifeRatio;
			colors[i3 + 2] *= lifeRatio;

			// Update material opacity based on life (optional)
			// material.opacity = lifeRatio * 0.8; // This affects all particles, better done in shader if needed per-particle
            // Per-particle opacity requires custom shader material
		}
	}

	// Mark attributes for update
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.color.needsUpdate = true; // Mark colors for update
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
		const step = Number.parseFloat(slider.step) || (max - min) / 100;
		const range = max - min;
		const randomSteps = Math.floor(Math.random() * (range / step + 1));
		const newValue = (min + randomSteps * step).toFixed(step.toString().includes('.') ? step.toString().split('.')[1].length : 0);

		// Check if count changed significantly
		if (slider === particlesControls.sliderCount && slider.value !== newValue) {
			needsRestart = true;
		}
		slider.value = newValue;
        // No need to dispatch 'input' here, handled by updateAllValueDisplays or restart
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
			select.selectedIndex = randomIndex;
            // No need to dispatch 'change' here, handled by updateAllValueDisplays or restart
		}
	}

	// Trigger updates or restart
	if (needsRestart) {
		console.log(
			"Restarting particles due to randomized count or emitter change.",
		);
		cleanupParticleAnimation();
		setupParticleAnimation(); // This also updates labels via its internal logic
        updateAllValueDisplays(); // Ensure all other labels are updated too
	} else {
		// Update labels for sliders/selects that didn't cause a restart
		updateAllValueDisplays(); // Call the global update function from script.js
		// Update particle size if it changed (handled by handleParticleParamChange called via updateAllValueDisplays)
        // handleParticleParamChange(); // Called indirectly
	}
}
