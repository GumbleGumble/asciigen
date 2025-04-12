// Torus Animation

// Expose module methods
window.TORUS_ANIMATION = {
	setup: setupTorusAnimation,
	update: updateTorusAnimation,
	cleanup: cleanupTorusAnimation,
	randomize: randomizeTorusParameters,
	handleThicknessChange: handleTorusThicknessChange,
	handleMajorRadiusChange: handleTorusMajorRadiusChange, // Added
	handleRotationAxisChange: () => {}, // No specific handler needed, read in update
	handleMaterialChange: handleTorusMaterialChange, // Added
	handleSpeedChange: () => {}, // No specific handler needed, read in update
};

function setupTorusAnimation() {
	console.log("Setting up Torus animation");

	// Get parameters
	const thicknessRatio = Number.parseFloat(torusControls.sliderThickness.value);
	const majorRadius = Number.parseFloat(uiElements.torusMajorRadius.value); // Use uiElements directly
	const roughness = Number.parseFloat(torusControls.sliderRoughness.value);
	const metalness = Number.parseFloat(torusControls.sliderMetalness.value);

	// Update UI labels
	torusControls.valueThickness.textContent = thicknessRatio.toFixed(2);
	if (uiElements.torusMajorRadiusValue)
		uiElements.torusMajorRadiusValue.textContent = majorRadius.toFixed(1);
	if (uiElements.torusRoughnessValue)
		uiElements.torusRoughnessValue.textContent = roughness.toFixed(2);
	if (uiElements.torusMetalnessValue)
		uiElements.torusMetalnessValue.textContent = metalness.toFixed(2);
	if (uiElements.torusSpeedValue)
		uiElements.torusSpeedValue.textContent = Number.parseFloat(
			torusControls.sliderSpeed.value,
		).toFixed(2);

	// Create torus geometry with adjustable thickness and radius
	// Parameters: radius, tube radius, radial segments, tubular segments
	const tubeRadius = majorRadius * thicknessRatio;
	const geometry = new THREE.TorusGeometry(majorRadius, tubeRadius, 32, 100); // Increased segments

	// Create material with adjustable properties
	const material = new THREE.MeshStandardMaterial({
		color: 0x6495ed, // Cornflower blue
		roughness: roughness,
		metalness: metalness,
		flatShading: false,
	});

	// Create mesh and add to scene
	const torus = new THREE.Mesh(geometry, material);
	torus.name = "torusMesh";
	scene.add(torus);

	// Store references for animation updates
	animationObjects.torus = torus;
	animationObjects.geometry = geometry; // Store geometry reference for potential disposal
	animationObjects.material = material; // Store material reference

	// Add event listeners (handled in script.js)
}

function cleanupTorusAnimation() {
	console.log("Cleaning up Torus animation");
	if (animationObjects.torus) {
		scene.remove(animationObjects.torus);
		// Dispose geometry and material
		if (animationObjects.geometry) animationObjects.geometry.dispose();
		if (animationObjects.material) animationObjects.material.dispose();
	}
	// Clear animationObjects specific to torus
	animationObjects.torus = null;
	animationObjects.geometry = null;
	animationObjects.material = null;
}

// Handles changes that require recreating the geometry
function handleTorusGeometryChange() {
	if (currentAnimation !== "torus" || !animationObjects.torus) return;

	// Get current parameters
	const thicknessRatio = Number.parseFloat(torusControls.sliderThickness.value);
	const majorRadius = Number.parseFloat(uiElements.torusMajorRadius.value);

	// Update UI
	torusControls.valueThickness.textContent = thicknessRatio.toFixed(2);
	if (uiElements.torusMajorRadiusValue)
		uiElements.torusMajorRadiusValue.textContent = majorRadius.toFixed(1);

	// Dispose old geometry
	if (animationObjects.geometry) animationObjects.geometry.dispose();

	// Create new geometry
	const tubeRadius = majorRadius * thicknessRatio;
	const newGeometry = new THREE.TorusGeometry(majorRadius, tubeRadius, 32, 100);

	// Update mesh
	animationObjects.torus.geometry = newGeometry;

	// Update stored geometry reference
	animationObjects.geometry = newGeometry;
}

// Specific handler for thickness
function handleTorusThicknessChange() {
	handleTorusGeometryChange();
}

// Specific handler for major radius
function handleTorusMajorRadiusChange() {
	handleTorusGeometryChange();
}

// Handles changes to material properties
function handleTorusMaterialChange() {
	if (currentAnimation !== "torus" || !animationObjects.material) return;

	const roughness = Number.parseFloat(torusControls.sliderRoughness.value);
	const metalness = Number.parseFloat(torusControls.sliderMetalness.value);

	// Update UI
	if (uiElements.torusRoughnessValue)
		uiElements.torusRoughnessValue.textContent = roughness.toFixed(2);
	if (uiElements.torusMetalnessValue)
		uiElements.torusMetalnessValue.textContent = metalness.toFixed(2);

	// Update material properties
	animationObjects.material.roughness = roughness;
	animationObjects.material.metalness = metalness;
	animationObjects.material.needsUpdate = true; // Important for some material changes
}

function updateTorusAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.torus) return;

	// Get rotation speed and axis from controls
	const rotationSpeed = Number.parseFloat(torusControls.sliderSpeed.value);
	const rotationAxis = uiElements.torusRotationAxis.value; // Use uiElements directly

	// Apply rotation based on selected axis
	const rotationAmount = deltaTime * rotationSpeed;
	switch (rotationAxis) {
		case "x":
			animationObjects.torus.rotation.x += rotationAmount;
			break;
		case "y":
			animationObjects.torus.rotation.y += rotationAmount;
			break;
		case "z":
			animationObjects.torus.rotation.z += rotationAmount;
			break;
		case "xy":
			animationObjects.torus.rotation.x += rotationAmount * Math.SQRT1_2; // Use Math.SQRT1_2 for 1/sqrt(2)
			animationObjects.torus.rotation.y += rotationAmount * Math.SQRT1_2; // Use Math.SQRT1_2 for 1/sqrt(2)
			break;
		default: // Default to Y
			animationObjects.torus.rotation.y += rotationAmount;
	}
}

function randomizeTorusParameters() {
	console.log("Randomizing Torus parameters...");
	const controls = [
		torusControls.sliderSpeed,
		torusControls.sliderThickness,
		uiElements.torusMajorRadius, // Use uiElements directly
		torusControls.sliderRoughness,
		torusControls.sliderMetalness,
		uiElements.torusRotationAxis, // Use uiElements directly
	];

	for (const control of controls) {
		if (!control) continue; // Skip if element not found

		if (control.type === "range") {
			const min = Number.parseFloat(control.min);
			const max = Number.parseFloat(control.max);
			const step = Number.parseFloat(control.step) || (max - min) / 100;
			const range = max - min;
			const randomSteps = Math.floor(Math.random() * (range / step + 1));
			control.value = min + randomSteps * step;
			control.dispatchEvent(new Event("input", { bubbles: true }));
		} else if (control.tagName === "SELECT") {
			const randomIndex = Math.floor(Math.random() * control.options.length);
			control.selectedIndex = randomIndex;
			control.dispatchEvent(new Event("change", { bubbles: true }));
		}
	}
	// Geometry and material changes are handled by the 'input'/'change' event handlers
}
