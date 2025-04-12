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
// Instantiate simplex noise generator
const simplex = new SimplexNoise();


// Expose module methods
window.PARTICLES_ANIMATION = {
    setup: setupParticleAnimation,
    update: updateParticleAnimation,
    cleanup: cleanupParticleAnimation,
    randomize: randomizeParticleParameters,
    handleCountChange: handleParticleCountChange, // Specific handler for count
    handleEmitterChange: handleParticleEmitterChange, // Handler for other params
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
    // Set initial size variation ONCE here. Ensure it's positive.
    // This value will be read by the vertex shader.
    sizes[index] = Math.max(0.1, baseSize * (0.5 + Math.random() * 1.0)); // Base size + up to 100% variation

	// Initial position based on emitter shape
	let initialSpeedFactor = 0.1; // Base initial speed
	let velX = 0;
    let velY = 0;
    let velZ = 0;

	if (emitterShape === "sphere") {
		// Uniform point on sphere surface
		// const phi = Math.acos(-1 + 2 * Math.random());
		// const theta = Math.random() * Math.PI * 2;
		// Uniform point within sphere volume (use cube root for uniform volume distribution)
        const u = Math.random();
        const v = Math.random();
        const theta = 2 * Math.PI * u;
        const phi = Math.acos(2 * v - 1);
		const radius = Math.cbrt(Math.random()) * emitterSize; // Use cube root for volume
		positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
		positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
		positions[i3 + 2] = radius * Math.cos(phi);
			// Initial velocity outwards from center
		const speed = initialSpeedFactor * (0.5 + Math.random() * 0.5);
		velX = positions[i3] * speed / Math.max(0.1, radius); // Normalize and scale
		velY = positions[i3 + 1] * speed / Math.max(0.1, radius);
		velZ = positions[i3 + 2] * speed / Math.max(0.1, radius);
	} else if (emitterShape === "point") {
		positions[i3] = 0;
		positions[i3 + 1] = 0;
		positions[i3 + 2] = 0;
			// Initial velocity in random direction
		const speed = initialSpeedFactor * (0.8 + Math.random() * 0.4);
		const phi = Math.acos(-1 + 2 * Math.random());
		const theta = Math.random() * Math.PI * 2;
		velX = speed * Math.sin(phi) * Math.cos(theta);
		velY = speed * Math.sin(phi) * Math.sin(theta);
		velZ = speed * Math.cos(phi);
	} else {
		// Default to box emitter
		positions[i3] = (Math.random() - 0.5) * emitterSize;
		positions[i3 + 1] = (Math.random() - 0.5) * emitterSize;
		positions[i3 + 2] = (Math.random() - 0.5) * emitterSize;
		// Initial velocity slightly upwards or random
		velX = (Math.random() - 0.5) * initialSpeedFactor * 0.5;
		velY = Math.random() * initialSpeedFactor;
		velZ = (Math.random() - 0.5) * initialSpeedFactor * 0.5;
	}

	velocities[i3] = velX;
	velocities[i3 + 1] = velY;
	velocities[i3 + 2] = velZ;

	// Initial color (e.g., based on position or random)
	const hue = Math.random() * 0.1 + 0.55; // Bluish-cyan range
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
	const particleCount = Number.parseInt(particlesControls.sliderCount?.value || 2000);
	const baseSize = Number.parseFloat(particlesControls.sliderSize?.value || 1.0); // Use base size
	const emitterShape = particlesControls.selectEmitterShape?.value || 'box';
	const emitterSize = Number.parseFloat(particlesControls.sliderEmitterSize?.value || 5.0);
	const lifespan = Number.parseFloat(particlesControls.sliderLifespan?.value || 5.0);

	// Create particle geometry
	const particlesGeometry = new THREE.BufferGeometry();

	// Create arrays to hold particle positions and attributes
	const positions = new Float32Array(particleCount * 3);
	const velocities = new Float32Array(particleCount * 3);
	const lifespans = new Float32Array(particleCount);
	const initialLifespans = new Float32Array(particleCount);
	const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount); // Add sizes array
    const alphas = new Float32Array(particleCount); // Add alpha array

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
        alphas[i] = 1.0; // Initialize alpha to 1
	}

	// Set geometry attributes
	particlesGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions, 3),
	);
	particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    // Use a distinct name like 'particleSize' for the size attribute
    particlesGeometry.setAttribute("particleSize", new THREE.BufferAttribute(sizes, 1));
    particlesGeometry.setAttribute("alpha", new THREE.BufferAttribute(alphas, 1)); // Add alpha attribute

	// Create particle material - Use ShaderMaterial for size/alpha control
	const particleVertexShader = `
        attribute float particleSize; // Use the correct attribute name
        attribute float alpha; // Receive alpha attribute
        attribute vec3 color; // Receive vertex color
        varying vec3 vColor; // Pass color to fragment shader
        varying float vAlpha; // Pass alpha to fragment shader
        uniform float u_base_size_multiplier; // Global size multiplier from slider
        // uniform float u_lifespan_left; // Normalized lifespan (1 = new, 0 = dead) - Calculated per particle

        void main() {
            vColor = color; // Pass vertex color through
            vAlpha = alpha; // Pass alpha through

            // Calculate point size based on attribute and lifespan
            // float size = particleSize * u_base_size_multiplier * lifespanLeft;
            // Use the attribute directly for now, ensure it's passed correctly
            float size = particleSize * u_base_size_multiplier;

            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z); // Adjust size based on distance
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

	const particleFragmentShader = `
        varying vec3 vColor;
        varying float vAlpha; // Receive alpha from vertex shader

        void main() {
            // Create circular shape
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) {
                discard; // Discard fragments outside the circle
            }

            // Apply alpha calculated in vertex shader (and potentially faded)
            // Add soft edge to the circle
            float edgeFactor = 1.0 - smoothstep(0.45, 0.5, dist);
            gl_FragColor = vec4(vColor, vAlpha * edgeFactor); // Fade towards center/edge
        }
    `;

	const particleMaterial = new THREE.ShaderMaterial({
		vertexShader: particleVertexShader,
		fragmentShader: particleFragmentShader,
		uniforms: {
            // Add uniforms if needed, e.g., for global size or time
            u_base_size_multiplier: { value: 1.0 }, // Start with multiplier 1
            // u_lifespan_left: { value: 1.0 } // This needs to be per-particle, handled differently
        },
		vertexColors: true, // Use vertex colors attribute
		transparent: true, // Enable transparency
		depthWrite: false, // Disable depth writing for better blending
		blending: THREE.AdditiveBlending, // Additive blending often looks good for particles
	});

	// Create particle system (Points object)
	const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
	particleSystem.name = "particleSystem";
	scene.add(particleSystem);

	// Store references
	animationObjects.particleSystem = particleSystem;
	animationObjects.particlesGeometry = particlesGeometry;
	animationObjects.particlesMaterial = particleMaterial;
	animationObjects.positions = positions;
	animationObjects.velocities = velocities;
	animationObjects.lifespans = lifespans;
	animationObjects.initialLifespans = initialLifespans;
	animationObjects.colors = colors;
    animationObjects.sizes = sizes; // Store sizes array
    // Store alpha array reference if needed elsewhere, though it's mainly updated in update loop
    // animationObjects.alphas = alphas;
	animationObjects.particleCount = particleCount;
	animationObjects.maxLifespan = lifespan;

    // Initial update of size uniform based on slider
    handleParticleParamChange();

    updateAllValueDisplays();
}

function cleanupParticleAnimation() {
	console.log("Cleaning up Particle System animation");
	if (animationObjects.particleSystem) {
		scene.remove(animationObjects.particleSystem);
		animationObjects.particlesGeometry?.dispose();
		animationObjects.particlesMaterial?.dispose();
	}
	// Clear all related properties
	animationObjects.particleSystem = null;
	animationObjects.particlesGeometry = null;
	animationObjects.particlesMaterial = null;
	animationObjects.positions = null;
	animationObjects.velocities = null;
	animationObjects.lifespans = null;
	animationObjects.initialLifespans = null;
	animationObjects.colors = null;
    animationObjects.sizes = null;
	animationObjects.particleCount = null;
	animationObjects.maxLifespan = null;
    // animationObjects.alphas = null;
}

// Handler for count changes (requires recreation)
function handleParticleCountChange() {
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'particles') return;
    console.log("Particle count changed, recreating...");
    cleanupParticleAnimation();
    setupParticleAnimation();
}

// Handler for emitter changes (requires recreation)
function handleParticleEmitterChange() {
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'particles') return;
    console.log("Particle emitter changed, recreating...");
    cleanupParticleAnimation();
    setupParticleAnimation();
}

// Handler for other parameter changes (size, lifespan, speed, force)
function handleParticleParamChange() {
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'particles' || !animationObjects.particlesMaterial) return;
    // console.log("Handling Particle parameter change (non-recreation)"); // Debug log

    // Update material uniforms or other non-geometry related states
    if (particlesControls.sliderSize) {
        const baseSizeMultiplier = Number.parseFloat(particlesControls.sliderSize.value);
        animationObjects.particlesMaterial.uniforms.u_base_size_multiplier.value = baseSizeMultiplier;
        // console.log("Updated base size multiplier:", baseSizeMultiplier); // Debug log
    }
    if (particlesControls.sliderLifespan) {
        // Update maxLifespan used when resetting particles
        animationObjects.maxLifespan = Number.parseFloat(particlesControls.sliderLifespan.value);
    }
    // Speed and Force are read in the update loop
    // UI label updates are handled by the main script's event listeners calling updateAllValueDisplays
}


// --- Animation Update ---
function updateParticleAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.particleSystem || !animationObjects.positions || !animationObjects.velocities || !animationObjects.lifespans || !simplex) {
        // if (!simplex) console.warn("Simplex noise not available for particle update."); // Warn if simplex missing
        return; // Exit if essential objects or simplex are missing
    }

    // Ensure deltaTime is valid, provide fallback
    const dt = (typeof deltaTime === 'number' && deltaTime > 0) ? Math.min(deltaTime, 0.05) : (1/60);

	const positions = animationObjects.positions;
	const velocities = animationObjects.velocities;
	const lifespans = animationObjects.lifespans;
	const initialLifespans = animationObjects.initialLifespans;
	const colors = animationObjects.colors;
    const sizes = animationObjects.sizes; // Get sizes array
	const particleCount = animationObjects.particleCount;
	const geometry = animationObjects.particlesGeometry;
    const material = animationObjects.particlesMaterial; // Get material

	// Get current control values
	const speedMultiplier = Number.parseFloat(particlesControls.sliderSpeed?.value || 1.0);
	const forceType = particlesControls.selectForceType?.value || 'none';
	const forceStrength = Number.parseFloat(particlesControls.sliderForceStrength?.value || 0.1);
    const emitterShape = particlesControls.selectEmitterShape?.value || 'box';
	const emitterSize = Number.parseFloat(particlesControls.sliderEmitterSize?.value || 5.0);
    const baseSize = Number.parseFloat(particlesControls.sliderSize?.value || 1.0);
    const maxLifespan = animationObjects.maxLifespan; // Use stored max lifespan

    // Create alpha attribute if it doesn't exist, or get it
    let alphaAttribute = geometry.getAttribute('alpha');
    if (!alphaAttribute || alphaAttribute.array.length !== particleCount) { // Check length too
        console.log("Creating/Resizing alpha attribute");
        const alphas = new Float32Array(particleCount);
        // Initialize if creating new
        if (!alphaAttribute) {
             for (let i = 0; i < particleCount; i++) alphas[i] = 1.0;
        } else {
            // If resizing, copy old data? Or just re-initialize? Re-initialize is simpler.
             for (let i = 0; i < particleCount; i++) alphas[i] = 1.0;
        }
        alphaAttribute = new THREE.BufferAttribute(alphas, 1);
        geometry.setAttribute('alpha', alphaAttribute);
    }
    const alphas = alphaAttribute.array; // Get the array reference

	// --- Update loop ---
	for (let i = 0; i < particleCount; i++) {
		const i3 = i * 3;

		// Decrease lifespan
		lifespans[i] -= dt;

		// Check if particle needs reset
		if (lifespans[i] <= 0) {
			resetParticle(
				i,
				positions,
				velocities,
				lifespans,
				initialLifespans,
				colors,
                sizes,
				emitterShape,
				emitterSize,
				maxLifespan,
                baseSize
			);
            alphas[i] = 1.0; // Reset alpha on respawn
		} else {
			// Apply forces
			let forceX = 0;
			let forceY = 0;
			let forceZ = 0;

			switch (forceType) {
				case "gravity":
					forceY = -forceStrength * 9.8; // Simple gravity
					break;
				case "vortex": {
					// Vortex around Y axis
					const radius = Math.sqrt(positions[i3] ** 2 + positions[i3 + 2] ** 2);
					if (radius > 0.1) { // Avoid singularity at center
						const angle = Math.atan2(positions[i3 + 2], positions[i3]);
						const speed = forceStrength / radius; // Speed decreases with distance
						forceX = -Math.sin(angle) * speed;
						forceZ = Math.cos(angle) * speed;
						// Optional pull towards center
						// forceX -= positions[i3] * forceStrength * 0.1;
						// forceZ -= positions[i3 + 2] * forceStrength * 0.1;
					}
					break;
				}
				case "noise": {
					// Simplex noise force field
					const noiseScale = 0.5; // How detailed the noise field is
					const timeScale = 0.1; // How fast the noise field evolves
					const noiseX = simplex.noise3D(
						positions[i3] * noiseScale,
						positions[i3 + 1] * noiseScale,
						positions[i3 + 2] * noiseScale + elapsedTime * timeScale
					);
					const noiseY = simplex.noise3D(
						positions[i3 + 1] * noiseScale + 100.0, // Offset inputs slightly
						positions[i3 + 2] * noiseScale,
						positions[i3] * noiseScale + elapsedTime * timeScale
					);
					const noiseZ = simplex.noise3D(
						positions[i3 + 2] * noiseScale + 200.0,
						positions[i3] * noiseScale,
						positions[i3 + 1] * noiseScale + elapsedTime * timeScale
					);
					forceX = noiseX * forceStrength;
					forceY = noiseY * forceStrength;
					forceZ = noiseZ * forceStrength;
					break;
				}
                // default: 'none' - no force applied
			}

			// Update velocity (Euler integration)
			velocities[i3] += forceX * dt;
			velocities[i3 + 1] += forceY * dt;
			velocities[i3 + 2] += forceZ * dt;

			// Update position
			positions[i3] += velocities[i3] * dt * speedMultiplier;
			positions[i3 + 1] += velocities[i3 + 1] * dt * speedMultiplier;
			positions[i3 + 2] += velocities[i3 + 2] * dt * speedMultiplier;

            // Update alpha based on lifespan (fade out)
            const lifespanLeft = Math.max(0, lifespans[i] / initialLifespans[i]); // Normalized 0-1
            // Apply smoothstep for smoother fade
            alphas[i] = smoothstep(0.0, 0.5, lifespanLeft); // Fade out during first half of life remaining
		}
	}

	// Mark attributes as needing update
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.color.needsUpdate = true;
    geometry.attributes.particleSize.needsUpdate = true; // Size might change on reset
    geometry.attributes.alpha.needsUpdate = true; // Alpha changes every frame
}

// Helper smoothstep function (already in other files, maybe move to a global util?)
function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}


// --- Randomization ---

function randomizeParticleParameters() {
	console.log("Randomizing Particle parameters...");
	let needsRestart = false;

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
		const step = Number.parseFloat(slider.step) || (slider.id.includes('count') ? 1 : 0.1); // Step 1 for count
		const range = max - min;
        const randomValue = min + Math.random() * range;
        const steppedValue = Math.round(randomValue / step) * step;
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
