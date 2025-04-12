// Particle System Animation

// Expose module methods
window.PARTICLES_ANIMATION = {
	setup: setupParticleAnimation,
	update: updateParticlesAnimation,
	cleanup: cleanupParticleAnimation,
	randomize: randomizeParticleParameters,
	handleCountChange: handleParticleCountChange,
	handleSizeChange: handleParticleParamChange, // Reuse param change handler
	handleSpeedChange: () => {}, // Read in update
	handleLifespanChange: () => {}, // Read in update
	handleEmitterChange: handleParticleEmitterChange, // Requires restart
	handleForceStrengthChange: () => {}, // Read in update
	// Add handlers for new controls if needed, e.g., flow field scale/speed
};

// Simplex noise function (necessary for flow field)
// Source: https://github.com/ashima/webgl-noise/blob/master/src/noise3D.glsl
// Adapted to JS
const SimplexNoise = {
	grad3: new Float32Array([
		1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0,
		-1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1,
	]),
	p: new Uint8Array([
		151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140,
		36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120,
		234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
		88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
		134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133,
		230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161,
		1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130,
		116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250,
		124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227,
		47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44,
		154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98,
		108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34,
		242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
		239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121,
		50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243,
		141, 128, 195, 78, 66, 215, 61, 156, 180,
	]),
	perm: new Uint8Array(512),
	permMod12: new Uint8Array(512),

	init: function () {
		for (let i = 0; i < 512; i++) {
			this.perm[i] = this.p[i & 255];
			this.permMod12[i] = this.perm[i] % 12;
		}
	},

	noise: function (xin, yin, zin) {
		if (!this.perm[0]) this.init(); // Initialize permutation table if not done yet

		let n0;
        let n1;
        let n2; // Noise contributions from the three corners
		// Skew the input space to determine which simplex cell we're in
		const F3 = 1.0 / 3.0;
		const s = (xin + yin + zin) * F3; // Hairy factor for 3D
		const i = Math.floor(xin + s);
		const j = Math.floor(yin + s);
		const k = Math.floor(zin + s);
		const G3 = 1.0 / 6.0; // Factor for unskewing
		const t = (i + j + k) * G3;
		const X0 = i - t; // Unskew the cell origin back to (x,y,z) space
		const Y0 = j - t;
		const Z0 = k - t;
		const x0 = xin - X0; // The x,y,z distances from the cell origin
		const y0 = yin - Y0;
		const z0 = zin - Z0;
		// For the 3D case, the simplex shape is a slightly irregular tetrahedron.
		// Determine which simplex we are in.
		let i1;
        let j1;
        let k1; // Offsets for second corner of simplex in (i,j,k) coords
		let i2;
        let j2;
        let k2; // Offsets for third corner of simplex in (i,j,k) coords
		if (x0 >= y0) {
			if (y0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			} // X Y Z order
			else if (x0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			} // X Z Y order
			else {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			} // Z X Y order
		} else {
			// x0<y0
			if (y0 < z0) {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 0;
				j2 = 1;
				k2 = 1;
			} // Z Y X order
			else if (x0 < z0) {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 0;
				j2 = 1;
				k2 = 1;
			} // Y Z X order
			else {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			} // Y X Z order
		}
		// A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
		// a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
		// a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
		// c = 1/6.
		const x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
		const y1 = y0 - j1 + G3;
		const z1 = z0 - k1 + G3;
		const x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
		const y2 = y0 - j2 + 2.0 * G3;
		const z2 = z0 - k2 + 2.0 * G3;
		const x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
		const y3 = y0 - 1.0 + 3.0 * G3;
		const z3 = z0 - 1.0 + 3.0 * G3;
		// Work out the hashed gradient indices of the four simplex corners
		const ii = i & 255;
		const jj = j & 255;
		const kk = k & 255;
		const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
		const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
		const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
		const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
		// Calculate the contribution from the four corners
		let t0 = 0.5 - x0 * x0 - y0 * y0 - z0 * z0;
		if (t0 < 0) n0 = 0.0;
		else {
			t0 *= t0;
			const g0idx = gi0 * 3;
			n0 =
				t0 *
				t0 *
				(this.grad3[g0idx] * x0 +
					this.grad3[g0idx + 1] * y0 +
					this.grad3[g0idx + 2] * z0);
		}
		let t1 = 0.5 - x1 * x1 - y1 * y1 - z1 * z1;
		if (t1 < 0) n1 = 0.0;
		else {
			t1 *= t1;
			const g1idx = gi1 * 3;
			n1 =
				t1 *
				t1 *
				(this.grad3[g1idx] * x1 +
					this.grad3[g1idx + 1] * y1 +
					this.grad3[g1idx + 2] * z1);
		}
		let t2 = 0.5 - x2 * x2 - y2 * y2 - z2 * z2;
		if (t2 < 0) n2 = 0.0;
		else {
			t2 *= t2;
			const g2idx = gi2 * 3;
			n2 =
				t2 *
				t2 *
				(this.grad3[g2idx] * x2 +
					this.grad3[g2idx + 1] * y2 +
					this.grad3[g2idx + 2] * z2);
		}
		let t3 = 0.5 - x3 * x3 - y3 * y3 - z3 * z3;
		if (t3 < 0) n3 = 0.0;
		else {
			t3 *= t3;
			const g3idx = gi3 * 3;
			n3 =
				t3 *
				t3 *
				(this.grad3[g3idx] * x3 +
					this.grad3[g3idx + 1] * y3 +
					this.grad3[g3idx + 2] * z3);
		}
		// Add contributions from each corner to get the final noise value.
		// The result is scaled to return values in the interval [-1,1].
		return 70.0 * (n0 + n1 + n2 + n3);
	},
	noise3D: function (xin, yin, zin) {
		let n0;
        let n1;
        let n2;
        let n3; // Noise contributions from the four corners - These are assigned later
		// Skew the input space to determine which simplex cell we're in
		const F3 = 1.0 / 3.0;
		const s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D - Can be const
		const i = Math.floor(xin + s); // Can be const
		const j = Math.floor(yin + s); // Can be const
		const k = Math.floor(zin + s); // Can be const
		const G3 = 1.0 / 6.0; // Very nice and simple unskew factor, too - Can be const
		const t = (i + j + k) * G3; // Can be const
		const X0 = i - t; // Unskew the cell origin back to (x,y,z) space - Can be const
		const Y0 = j - t; // Can be const
		const Z0 = k - t; // Can be const
		const x0 = xin - X0; // The x,y,z distances from the cell origin - Can be const
		const y0 = yin - Y0; // Can be const
		const z0 = zin - Z0; // Can be const
		// For the 3D case, the simplex shape is a slightly irregular tetrahedron.
		// Determine which simplex we are in.
		let i1;
        let j1;
        let k1; // Offsets for second corner of simplex in (i,j,k) coords - Assigned conditionally
		let i2;
        let j2;
        let k2; // Offsets for third corner of simplex in (i,j,k) coords - Assigned conditionally
		if (x0 >= y0) {
			if (y0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			} // X Y Z order
			else if (x0 >= z0) {
				i1 = 1;
				j1 = 0;
				k1 = 0;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			} // X Z Y order
			else {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 1;
				j2 = 0;
				k2 = 1;
			} // Z X Y order
		} else {
			// x0<y0
			if (y0 < z0) {
				i1 = 0;
				j1 = 0;
				k1 = 1;
				i2 = 0;
				j2 = 1;
				k2 = 1;
			} // Z Y X order
			else if (x0 < z0) {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 0;
				j2 = 1;
				k2 = 1;
			} // Y Z X order
			else {
				i1 = 0;
				j1 = 1;
				k1 = 0;
				i2 = 1;
				j2 = 1;
				k2 = 0;
			} // Y X Z order
		}
		// A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
		// a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
		// a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
		// c = 1/6.
		const x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords - Can be const
		const y1 = y0 - j1 + G3; // Can be const
		const z1 = z0 - k1 + G3; // Can be const
		const x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords - Can be const
		const y2 = y0 - j2 + 2.0 * G3; // Can be const
		const z2 = z0 - k2 + 2.0 * G3; // Can be const
		const x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords - Can be const
		const y3 = y0 - 1.0 + 3.0 * G3; // Can be const
		const z3 = z0 - 1.0 + 3.0 * G3; // Can be const
		// Work out the hashed gradient indices of the four simplex corners
		const ii = i & 255; // Can be const
		const jj = j & 255; // Can be const
		const kk = k & 255; // Can be const
		// Use perm and grad3 arrays directly
		const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12; // Can be const
		const gi1 =
			this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12; // Can be const
		const gi2 =
			this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12; // Can be const
		const gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12; // Can be const
		// Calculate the contribution from the four corners
		let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0; // Increased from 0.5 - Assigned later
		if (t0 < 0) n0 = 0.0;
		else {
			t0 *= t0;
			n0 = t0 * t0 * this.dot(this.grad3, gi0, x0, y0, z0);
		}
		let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1; // Assigned later
		if (t1 < 0) n1 = 0.0;
		else {
			t1 *= t1;
			n1 = t1 * t1 * this.dot(this.grad3, gi1, x1, y1, z1);
		}
		let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2; // Assigned later
		if (t2 < 0) n2 = 0.0;
		else {
			t2 *= t2;
			n2 = t2 * t2 * this.dot(this.grad3, gi2, x2, y2, z2);
		}
		let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3; // Assigned later
		if (t3 < 0) n3 = 0.0;
		else {
			t3 *= t3;
			n3 = t3 * t3 * this.dot(this.grad3, gi3, x3, y3, z3);
		}
		// Add contributions from each corner to get the final noise value.
		// The result is scaled to stay just inside [-1,1]
		return 32.0 * (n0 + n1 + n2 + n3); // Adjusted scaling factor
	},
	// Helper function
	dot: (g, gi, x, y, z) => { // Converted to arrow function
		return g[gi * 3] * x + g[gi * 3 + 1] * y + g[gi * 3 + 2] * z;
	},
};
SimplexNoise.init(); // Initialize the noise function

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
		const i3 = i * 3;
		resetParticle(
			i,
			positions,
			velocities,
			lifespans,
			initialLifespans,
			colors,
			emitterShape,
			emitterSize,
			lifespan,
		);
		// Randomize initial lifespan state so they don't all die at once
		lifespans[i] = Math.random() * initialLifespans[i];
	}

	// Add the attributes to the particle geometry
	particlesGeometry.setAttribute(
		"position",
		new THREE.BufferAttribute(positions, 3),
	);
	particlesGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3)); // Add color attribute

	// Create particle material
	const particlesMaterial = new THREE.PointsMaterial({
		size: particleSize,
		vertexColors: true, // Use vertex colors
		transparent: true,
		opacity: 0.8,
		blending: THREE.AdditiveBlending, // Good for bright particles on dark background
		sizeAttenuation: true, // Particles smaller further away
		depthWrite: false, // Prevents particles sorting issues
	});

	// Create particle system and add to scene
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
	// Clear animationObjects specific to particles by setting to null
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
}

// Function to reset a single particle
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

	// Set initial lifespan
	initialLifespans[index] = (Math.random() * 0.5 + 0.5) * maxLifespan; // Randomize lifespan slightly
	lifespans[index] = initialLifespans[index];

	// Set position based on emitter shape
	if (emitterShape === "box") {
		positions[i3] = (Math.random() * 2 - 1) * emitterSize; // x
		positions[i3 + 1] = (Math.random() * 2 - 1) * emitterSize; // y
		positions[i3 + 2] = (Math.random() * 2 - 1) * emitterSize; // z
	} else if (emitterShape === "sphere") {
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(Math.random() * 2 - 1);
		const r = Math.random() * emitterSize; // Distribute within the sphere volume
		positions[i3] = r * Math.sin(phi) * Math.cos(theta);
		positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
		positions[i3 + 2] = r * Math.cos(phi);
	} else if (emitterShape === "point") {
		positions[i3] = 0;
		positions[i3 + 1] = 0;
		positions[i3 + 2] = 0;
	} else if (emitterShape === "disc") {
		// Added Disc emitter
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.sqrt(Math.random()) * emitterSize; // sqrt for even distribution
		positions[i3] = radius * Math.cos(angle); // x
		positions[i3 + 1] = radius * Math.sin(angle); // y
		positions[i3 + 2] = (Math.random() - 0.5) * 0.1; // Slight z variation
	} else if (emitterShape === "line") {
		// Added Line emitter
		positions[i3] = (Math.random() * 2 - 1) * emitterSize; // Along X axis
		positions[i3 + 1] = (Math.random() - 0.5) * 0.1; // Slight y variation
		positions[i3 + 2] = (Math.random() - 0.5) * 0.1; // Slight z variation
	}

	// Set initial velocity
	if (emitterShape === "point") {
		// Velocity outwards from center
		const theta = Math.random() * Math.PI * 2;
		const phi = Math.acos(Math.random() * 2 - 1);
		velocities[i3] = Math.sin(phi) * Math.cos(theta);
		velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta);
		velocities[i3 + 2] = Math.cos(phi);
	} else {
		// Random initial velocity for other shapes
		velocities[i3] = Math.random() * 2 - 1;
		velocities[i3 + 1] = Math.random() * 2 - 1;
		velocities[i3 + 2] = Math.random() * 2 - 1;
	}
	// Normalize velocity
	const vLength =
		Math.sqrt(
			velocities[i3] ** 2 + velocities[i3 + 1] ** 2 + velocities[i3 + 2] ** 2,
		) || 1;
	velocities[i3] /= vLength;
	velocities[i3 + 1] /= vLength;
	velocities[i3 + 2] /= vLength;

	// Set initial color (e.g., based on position or random)
	const hue = Math.random() * 0.2 + 0.5; // Bluish-Cyan range
	const saturation = 0.8 + Math.random() * 0.2;
	const lightness = 0.6 + Math.random() * 0.2;
	const color = new THREE.Color().setHSL(hue, saturation, lightness);
	colors[i3] = color.r;
	colors[i3 + 1] = color.g;
	colors[i3 + 2] = color.b;
}

function handleParticleCountChange() {
	if (currentAnimation !== "particles") return;
	console.log("Particle count changed, recreating...");
	cleanupParticleAnimation();
	setupParticleAnimation();
}

function handleParticleParamChange() {
	if (currentAnimation !== "particles" || !animationObjects.particlesMaterial)
		return;
	// Update material size
	const size = Number.parseFloat(particlesControls.sliderSize.value);
	animationObjects.particlesMaterial.size = size;
	if (uiElements.particleSizeValue)
		uiElements.particleSizeValue.textContent = size.toFixed(1);
}

function handleParticleEmitterChange() {
	if (currentAnimation !== "particles") return;
	// Emitter shape or size change requires recreating particles
	console.log("Particle emitter changed, recreating...");
	cleanupParticleAnimation();
	setupParticleAnimation();
}

function updateParticlesAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.particleSystem) return;

	const positions = animationObjects.positions;
	const velocities = animationObjects.velocities;
	const lifespans = animationObjects.lifespans;
	const initialLifespans = animationObjects.initialLifespans;
	const colors = animationObjects.colors;
	const particleCount = animationObjects.particleCount;
	const geometry = animationObjects.particlesGeometry;
	const material = animationObjects.particlesMaterial;

	// Get current parameters
	const speed = Number.parseFloat(particlesControls.sliderSpeed.value);
	const forceType = particlesControls.selectForceType.value;
	const forceStrength = Number.parseFloat(
		particlesControls.sliderForceStrength.value,
	);
	const maxLifespan = Number.parseFloat(particlesControls.sliderLifespan.value); // Get current max lifespan
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
				emitterShape,
				emitterSize,
				maxLifespan,
			);
		} else {
			// Apply forces
			let forceX = 0;
            let forceY = 0;
            let forceZ = 0;

			if (forceType === "gravity") {
				forceY = -forceStrength; // Simple gravity pulls down
			} else if (forceType === "vortex") {
				const posX = positions[i3];
				const posZ = positions[i3 + 2];
				const distSq = posX * posX + posZ * posZ;
				if (distSq > 0.01) {
					const dist = Math.sqrt(distSq);
					// Tangential force for swirl
					forceX = (-posZ / dist) * forceStrength;
					forceZ = (posX / dist) * forceStrength;
					// Optional: Add inward/outward force
					// forceX -= posX / dist * forceStrength * 0.1;
					// forceZ -= posZ / dist * forceStrength * 0.1;
				}
			} else if (forceType === "flow") {
				// Added Flow Field
				// Use 3D simplex noise to get a vector field
				const noiseX = SimplexNoise.noise(
					positions[i3] * flowScale,
					positions[i3 + 1] * flowScale,
					flowTime,
				);
				const noiseY = SimplexNoise.noise(
					positions[i3 + 1] * flowScale + 100,
					positions[i3 + 2] * flowScale,
					flowTime,
				); // Offset inputs for different noise values
				const noiseZ = SimplexNoise.noise(
					positions[i3 + 2] * flowScale,
					positions[i3] * flowScale - 100,
					flowTime,
				);

				forceX = noiseX * forceStrength;
				forceY = noiseY * forceStrength;
				forceZ = noiseZ * forceStrength;
			} else if (forceType === "attract") {
				// Simple attraction to origin
				const posX = positions[i3];
				const posY = positions[i3 + 1];
				const posZ = positions[i3 + 2];
				const distSq = posX * posX + posY * posY + posZ * posZ;
				if (distSq > 0.01) {
					const dist = Math.sqrt(distSq);
					forceX = (-posX / dist) * forceStrength;
					forceY = (-posY / dist) * forceStrength;
					forceZ = (-posZ / dist) * forceStrength;
				}
			} else if (forceType === "repel") {
				// Simple repulsion from origin
				const posX = positions[i3];
				const posY = positions[i3 + 1];
				const posZ = positions[i3 + 2];
				const distSq = posX * posX + posY * posY + posZ * posZ;
				if (distSq > 0.01) {
					const dist = Math.sqrt(distSq);
					// Force decreases with distance (inverse square might be too strong)
					const strengthFactor = 1.0 / (dist + 1.0); // Simple inverse distance
					forceX = (posX / dist) * forceStrength * strengthFactor;
					forceY = (posY / dist) * forceStrength * strengthFactor;
					forceZ = (posZ / dist) * forceStrength * strengthFactor;
				}
			}

			// Update velocity using Euler integration (Velocity Verlet might be more stable)
			velocities[i3] += forceX * deltaTime;
			velocities[i3 + 1] += forceY * deltaTime;
			velocities[i3 + 2] += forceZ * deltaTime;

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

			// Fade color based on lifespan (optional)
			const lifeRatio = lifespans[i] / initialLifespans[i];
			// Example: Fade brightness
			// const baseColor = new THREE.Color(colors[i3], colors[i3+1], colors[i3+2]);
			// baseColor.multiplyScalar(lifeRatio);
			// colors[i3] = baseColor.r;
			// colors[i3+1] = baseColor.g;
			// colors[i3+2] = baseColor.b;

			// Update material opacity based on life (optional)
			// material.opacity = lifeRatio * 0.8; // This affects all particles, better done in shader if needed per-particle
		}
	}

	// Mark attributes for update
	geometry.attributes.position.needsUpdate = true;
	geometry.attributes.color.needsUpdate = true; // Mark colors for update
}

function randomizeParticleParameters() {
	console.log("Randomizing Particle parameters...");

	// Randomize sliders
	const sliders = [
		particlesControls.sliderCount,
		particlesControls.sliderSize,
		particlesControls.sliderSpeed,
		particlesControls.sliderLifespan,
		particlesControls.sliderEmitterSize,
		particlesControls.sliderForceStrength,
	];

	let needsRestart = false;
	for (const slider of sliders) {
		const min = Number.parseFloat(slider.min);
		const max = Number.parseFloat(slider.max);
		const step = Number.parseFloat(slider.step) || (max - min) / 100;
		const randomValue = min + Math.random() * (max - min);
		const newValue = (Math.round(randomValue / step) * step).toFixed(
			step.toString().includes(".") ? step.toString().split(".")[1].length : 0,
		);

		// Check if count or emitter size changed significantly enough to warrant restart
		if (
			(slider === particlesControls.sliderCount ||
				slider === particlesControls.sliderEmitterSize) &&
			slider.value !== newValue
		) {
			needsRestart = true;
		}
		slider.value = newValue;
	}

	// Randomize selects
	const selects = [
		particlesControls.selectEmitterShape,
		particlesControls.selectForceType,
	];
	for (const select of selects) {
		const options = select.options;
		const randomIndex = Math.floor(Math.random() * options.length);
		if (select.selectedIndex !== randomIndex) {
			// Emitter shape change requires restart
			if (select === particlesControls.selectEmitterShape) {
				needsRestart = true;
			}
			select.selectedIndex = randomIndex;
		}
	}

	// Trigger updates or restart
	if (needsRestart) {
		console.log(
			"Restarting particles due to randomized count or emitter change.",
		);
		cleanupParticleAnimation();
		setupParticleAnimation(); // This also updates labels
	} else {
		// Update labels for sliders that didn't cause a restart
		updateAllValueDisplays(); // Call the global update function
		// Update particle size if it changed
		handleParticleParamChange();
	}
}
