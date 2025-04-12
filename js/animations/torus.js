// Torus Animation Module

// Expose module methods
window.TORUS_ANIMATION = {
    setup: setupTorusAnimation,
    update: updateTorusAnimation,
    cleanup: cleanupTorusAnimation,
    randomize: randomizeTorusParameters,
    handleThicknessChange: handleTorusGeometryChange, // Handler for geometry changes
    handleMajorRadiusChange: handleTorusGeometryChange, // Handler for geometry changes
    handleMaterialChange: handleTorusParamChange, // Handler for material changes (roughness, metalness)
    handleColorChange: handleTorusParamChange, // Handler for color changes
    handleRotationAxisChange: () => { /* Axis read in update loop */ }, // No immediate action needed
    handleSpeedChange: () => { updateAllValueDisplays(); }, // Just update label
};

// --- Setup ---
function setupTorusAnimation() {
    console.log("Setting up Torus animation");
    // Ensure controls exist
    if (!torusControls || !torusControls.sliderThickness || !uiElements.torusMajorRadius || !torusControls.sliderRoughness || !torusControls.sliderMetalness || !uiElements.torusColorPicker) {
        console.error("Torus controls not found!");
        return;
    }

    // Get initial parameters
    const radius = Number.parseFloat(uiElements.torusMajorRadius.value) || 3;
    const tube = Number.parseFloat(torusControls.sliderThickness.value) || 1;
    const radialSegments = 16; // Lower for performance
    const tubularSegments = 64; // Lower for performance
    const roughness = Number.parseFloat(torusControls.sliderRoughness.value) || 0.5;
    const metalness = Number.parseFloat(torusControls.sliderMetalness.value) || 0.5;
    const color = uiElements.torusColorPicker.value || '#ff00ff';

    // Create geometry
    const geometry = new THREE.TorusKnotGeometry(radius, tube, tubularSegments, radialSegments); // Use TorusKnot for more interest

    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness,
        // wireframe: true // Optional: for debugging
    });

    // Create mesh
    const torus = new THREE.Mesh(geometry, material);
    torus.name = "torusKnot";
    scene.add(torus);

    // Store references
    animationObjects.torus = torus;
    animationObjects.geometry = geometry; // Store geometry reference
    animationObjects.material = material; // Store material reference

    // Add listeners (handled in script.js)
    // uiElements.torusThickness.addEventListener('input', handleTorusGeometryChange);
    // uiElements.torusMajorRadius.addEventListener('input', handleTorusGeometryChange);
    // uiElements.torusRoughness.addEventListener('input', handleTorusParamChange);
    // uiElements.torusMetalness.addEventListener('input', handleTorusParamChange);
    // uiElements.torusColorPicker.addEventListener('input', handleTorusParamChange);
    // uiElements.torusRotationAxis.addEventListener('change', handleTorusParamChange); // Axis read in update
    // uiElements.torusSpeed.addEventListener('input', handleTorusParamChange); // Speed read in update

    updateAllValueDisplays(); // Call explicitly after setup
}

// --- Cleanup ---
function cleanupTorusAnimation() {
    console.log("Cleaning up Torus animation");
    if (animationObjects.torus) {
        scene.remove(animationObjects.torus);
        animationObjects.geometry?.dispose(); // Use optional chaining
        animationObjects.material?.dispose(); // Use optional chaining
    }
    // Remove listeners (handled in script.js)
    // ...
    animationObjects.torus = null;
    animationObjects.geometry = null;
    animationObjects.material = null;
}

// --- Handlers ---

// Handler for geometry changes (Thickness, Major Radius)
function handleTorusGeometryChange() {
    // Check if currentAnimationType is defined globally (from script.js)
	if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'torus' || !animationObjects.torus) return;
    console.log("Handling Torus geometry change");

    // Ensure controls exist
    if (!torusControls.sliderThickness || !uiElements.torusMajorRadius) {
         console.error("Torus geometry controls not found!");
         return;
    }

    // Get new parameters
    const newRadius = Number.parseFloat(uiElements.torusMajorRadius.value);
    const newTube = Number.parseFloat(torusControls.sliderThickness.value);
    const radialSegments = 16; // Keep consistent
    const tubularSegments = 64; // Keep consistent

    // Dispose old geometry
    animationObjects.geometry?.dispose();

    // Create new geometry
    try {
        animationObjects.geometry = new THREE.TorusKnotGeometry(newRadius, newTube, tubularSegments, radialSegments);
        animationObjects.torus.geometry = animationObjects.geometry; // Assign new geometry to mesh
        console.log(`Torus geometry updated: R=${newRadius}, T=${newTube}`);
    } catch (error) {
        console.error("Error creating new torus geometry:", error);
        // Handle error, maybe revert to old geometry or default?
    }

    // UI label updates are handled by the main script's event listeners calling updateAllValueDisplays
}

// Unified handler for other parameter changes (Speed, Roughness, Metalness, Axis, Color)
function handleTorusParamChange() {
    // Check if currentAnimationType is defined globally (from script.js)
	if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'torus' || !animationObjects.material) return;
    // console.log("Handling Torus parameter change (non-geometry)"); // Debug log

    // Ensure controls exist
    if (!torusControls.sliderRoughness || !torusControls.sliderMetalness || !uiElements.torusColorPicker) {
         console.error("Torus material/color controls not found!");
         return;
    }

    // Update material properties
    animationObjects.material.roughness = Number.parseFloat(torusControls.sliderRoughness.value);
    animationObjects.material.metalness = Number.parseFloat(torusControls.sliderMetalness.value);
    animationObjects.material.color.set(uiElements.torusColorPicker.value); // Update color

    // Speed and Axis are read directly in the update loop
    // UI label updates are handled by the main script's event listeners calling updateAllValueDisplays
}


function updateTorusAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.torus || !torusControls.sliderSpeed || !uiElements.torusRotationAxis) return;

    const speed = Number.parseFloat(torusControls.sliderSpeed.value);
    const axis = uiElements.torusRotationAxis.value;
    // Ensure deltaTime is valid, provide fallback
    const dt = (typeof deltaTime === 'number' && deltaTime > 0) ? Math.min(deltaTime, 0.05) : (1/60);

    // Apply rotation based on selected axis and speed
    const rotationAmount = dt * speed;

    switch (axis) {
        case 'x':
            animationObjects.torus.rotation.x += rotationAmount;
            break;
        case 'y':
            animationObjects.torus.rotation.y += rotationAmount;
            break;
        case 'z':
            animationObjects.torus.rotation.z += rotationAmount;
            break;
        case 'xy':
            animationObjects.torus.rotation.x += rotationAmount * 0.707;
            animationObjects.torus.rotation.y += rotationAmount * 0.707;
            break;
        case 'xz':
            animationObjects.torus.rotation.x += rotationAmount * 0.707;
            animationObjects.torus.rotation.z += rotationAmount * 0.707;
            break;
        case 'yz':
            animationObjects.torus.rotation.y += rotationAmount * 0.707;
            animationObjects.torus.rotation.z += rotationAmount * 0.707;
            break;
        case 'xyz':
            animationObjects.torus.rotation.x += rotationAmount * 0.577;
            animationObjects.torus.rotation.y += rotationAmount * 0.577;
            animationObjects.torus.rotation.z += rotationAmount * 0.577;
            break;
    }

    // Keep rotation within 0 to 2*PI range (optional, helps prevent large numbers)
    animationObjects.torus.rotation.x %= (Math.PI * 2);
    animationObjects.torus.rotation.y %= (Math.PI * 2);
    animationObjects.torus.rotation.z %= (Math.PI * 2);
}

function randomizeTorusParameters() {
	console.log("Randomizing Torus parameters...");
	const controlsToRandomize = [
		torusControls.sliderSpeed,
		torusControls.sliderThickness,
		uiElements.torusMajorRadius,
		torusControls.sliderRoughness,
		torusControls.sliderMetalness,
		uiElements.torusRotationAxis,
        uiElements.torusColorPicker, // Include color picker
	];

	for (const control of controlsToRandomize) {
		if (!control) continue;

		if (control.type === "range") {
			const min = Number.parseFloat(control.min);
			const max = Number.parseFloat(control.max);
			const step = Number.parseFloat(control.step) || 0.1;
			const range = max - min;
			const randomValue = min + Math.random() * range;
			const steppedValue = Math.round(randomValue / step) * step;
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
	// updateAllValueDisplays(); // Called by the dispatched events via script.js listeners
}
