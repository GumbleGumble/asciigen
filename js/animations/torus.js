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
	handleColorChange: handleTorusColorChange, // Added color handler
	handleSpeedChange: () => {}, // No specific handler needed, read in update
};

function setupTorusAnimation() {
	console.log("Setting up Torus animation");

	// Get parameters
	const thicknessRatio = Number.parseFloat(torusControls.sliderThickness.value);
	const majorRadius = Number.parseFloat(uiElements.torusMajorRadius.value); // Use uiElements directly
	const roughness = Number.parseFloat(torusControls.sliderRoughness.value);
	const metalness = Number.parseFloat(torusControls.sliderMetalness.value);
	const initialColor = uiElements.torusColorPicker ? uiElements.torusColorPicker.value : '#6495ed'; // Get initial color

	// Update UI labels - Handled by script.js updateAllValueDisplays
	// torusControls.valueThickness.textContent = thicknessRatio.toFixed(2);
	// if (uiElements.torusMajorRadiusValue)
	// 	uiElements.torusMajorRadiusValue.textContent = majorRadius.toFixed(1);
	// if (uiElements.torusRoughnessValue)
	// 	uiElements.torusRoughnessValue.textContent = roughness.toFixed(2);
	// if (uiElements.torusMetalnessValue)
	// 	uiElements.torusMetalnessValue.textContent = metalness.toFixed(2);
	// if (uiElements.torusSpeedValue)
	// 	uiElements.torusSpeedValue.textContent = Number.parseFloat(
	// 		torusControls.sliderSpeed.value,
	// 	).toFixed(2);

	// Create torus geometry with adjustable thickness and radius
	// Parameters: radius, tube radius, radial segments, tubular segments
	const tubeRadius = majorRadius * thicknessRatio;
	const geometry = new THREE.TorusGeometry(majorRadius, tubeRadius, 32, 100); // Increased segments

	// Create material with adjustable properties
	const material = new THREE.MeshStandardMaterial({
		color: initialColor, // Use initial color
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
	if (uiElements.torusColorPicker) {
		uiElements.torusColorPicker.addEventListener('input', handleTorusColorChange);
	}

    // Ensure initial labels are correct after setup
    updateAllValueDisplays(); // Call global update to sync labels
}

function cleanupTorusAnimation() {
	console.log("Cleaning up Torus animation");
	if (animationObjects.torus) {
		scene.remove(animationObjects.torus);
		// Dispose geometry and material
		if (animationObjects.geometry) animationObjects.geometry.dispose();
		if (animationObjects.material) animationObjects.material.dispose();
	}
	// Remove color picker listener
	if (uiElements.torusColorPicker) {
		uiElements.torusColorPicker.removeEventListener('input', handleTorusColorChange);
	}
	// Clear animationObjects specific to torus
	animationObjects.torus = null;
	animationObjects.geometry = null;
	animationObjects.material = null;
}

// Handles changes that require recreating the geometry
function handleTorusGeometryChange() {
	if (currentAnimationType !== "torus" || !animationObjects.torus) return; // Use currentAnimationType

	// Get current parameters
	const thicknessRatio = Number.parseFloat(torusControls.sliderThickness.value);
	const majorRadius = Number.parseFloat(uiElements.torusMajorRadius.value);

	// Update UI - Handled by script.js listener
	// torusControls.valueThickness.textContent = thicknessRatio.toFixed(2);
	// if (uiElements.torusMajorRadiusValue)
	// 	uiElements.torusMajorRadiusValue.textContent = majorRadius.toFixed(1);

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
	// Check if currentAnimationType is defined globally (from script.js)
	if (typeof currentAnimationType === 'undefined' || currentAnimationType !== "torus" || !animationObjects.material) return; // Use currentAnimationType

	const roughness = Number.parseFloat(torusControls.sliderRoughness.value);
	const metalness = Number.parseFloat(torusControls.sliderMetalness.value);

	// Update UI - Handled by script.js listener calling updateAllValueDisplays
	// ...

	// Update material properties
	animationObjects.material.roughness = roughness;
	animationObjects.material.metalness = metalness;
	animationObjects.material.needsUpdate = true; // Important for some material changes
}

// Handles changes to color property
function handleTorusColorChange() {
	// Check if torus is the current animation and objects/UI exist
	if (typeof currentAnimationType === 'undefined' || currentAnimationType !== "torus" || !animationObjects.material || !uiElements.torusColorPicker) {
        // console.warn("handleTorusColorChange prerequisites not met."); // Uncomment for debugging
        return;
    }
    try {
        const newColor = uiElements.torusColorPicker.value;
        // console.log("Torus color changed:", newColor); // Uncomment for debugging
	    animationObjects.material.color.set(newColor);
    } catch (error) {
        console.error("Error setting torus color:", error);
    }
}

function updateTorusAnimation(deltaTime, elapsedTime) {
	if (!animationObjects.torus || !torusControls.sliderSpeed || !uiElements.torusRotationAxis) {
        // console.warn("Torus update prerequisites not met."); // Uncomment for debugging
        return;
    }

	// Get rotation speed and axis from controls
	const rotationSpeed = Number.parseFloat(torusControls.sliderSpeed.value);
	const rotationAxis = uiElements.torusRotationAxis.value; // Use uiElements directly

	// Apply rotation based on selected axis
	const rotationAmount = deltaTime * rotationSpeed;
    // console.log(`Torus Update - dt: ${deltaTime.toFixed(4)}, speed: ${rotationSpeed}, axis: ${rotationAxis}, amount: ${rotationAmount.toFixed(4)}`); // Uncomment for debugging

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
		case "xy": // Example: Combined axis
			animationObjects.torus.rotation.x += rotationAmount * Math.SQRT1_2; // Use Math.SQRT1_2 for 1/sqrt(2)
			animationObjects.torus.rotation.y += rotationAmount * Math.SQRT1_2; // Use Math.SQRT1_2 for 1/sqrt(2)
			break;
        case "xyz": // Tumble
            animationObjects.torus.rotation.x += rotationAmount * 0.6; // Adjust multipliers for desired tumble
            animationObjects.torus.rotation.y += rotationAmount * 0.7;
            animationObjects.torus.rotation.z += rotationAmount * 0.8;
            break;
		default: // Default to Y
			animationObjects.torus.rotation.y += rotationAmount;
	}
    // Normalize rotations periodically to prevent potential floating point issues if needed
    // animationObjects.torus.rotation.x %= Math.PI * 2;
    // animationObjects.torus.rotation.y %= Math.PI * 2;
    // animationObjects.torus.rotation.z %= Math.PI * 2;
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
		uiElements.torusColorPicker, // Add color picker
	];

	for (const control of controls) {
		if (!control) continue; // Skip if element not found

		if (control.type === "range") {
			const min = Number.parseFloat(control.min);
			const max = Number.parseFloat(control.max);
			const step = Number.parseFloat(control.step) || 0.01; // Default step
			const range = max - min;
			// Ensure calculations handle potential floating point inaccuracies
            const randomValue = min + Math.random() * range;
            // Round to the nearest step
            const steppedValue = Math.round(randomValue / step) * step;
            // Clamp to min/max and fix precision
            const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
            control.value = Math.min(max, Math.max(min, steppedValue)).toFixed(precision);

			// Dispatch event to trigger handlers (like geometry/material updates)
			control.dispatchEvent(new Event("input", { bubbles: true }));
		} else if (control.tagName === "SELECT") {
			const randomIndex = Math.floor(Math.random() * control.options.length);
			control.selectedIndex = randomIndex;
			// Dispatch event to trigger handlers if any
			control.dispatchEvent(new Event("change", { bubbles: true }));
		} else if (control.type === "color") { // Randomize color
			const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
			control.value = `#${randomColor.getHexString()}`; // Use template literal
			control.dispatchEvent(new Event("input", { bubbles: true })); // Trigger color change handler
		}
	}
	// Geometry and material changes are handled by the 'input'/'change' event handlers triggered above
	// UI label updates are also handled by the listeners triggered by the events.
	// Explicitly call updateAllValueDisplays from script.js after randomization if needed,
	// but the dispatched events should cover it.
}
