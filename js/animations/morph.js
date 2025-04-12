// Shape Morphing Animation

// Expose module methods
window.MORPH_ANIMATION = {
    setup: setupMorphAnimation,
    update: updateMorphAnimation,
    cleanup: cleanupMorphAnimation,
    randomize: randomizeMorphParameters,
    handleComplexityChange: handleMorphComplexityChange, // Specific handler for complexity
    handleSpeedChange: () => {}, // No specific handler needed, read in update
    handleRotationSpeedChange: () => {}, // No specific handler needed, read in update
};

// Helper function to create geometries with specified complexity
function createMorphGeometries(complexity) {
    const segments = Math.max(4, Math.floor(complexity / 2)); // Ensure minimum segments
    return [
        new THREE.BoxGeometry(5, 5, 5, segments, segments, segments),
        new THREE.SphereGeometry(3, segments, segments),
        new THREE.TorusKnotGeometry(2.5, 0.8, segments * 4, segments), // More complex knot
        new THREE.IcosahedronGeometry(3.5, Math.max(1, Math.floor(segments / 8))), // Detail based on complexity
        new THREE.TorusGeometry(3, 1, segments, segments * 2),
    ];
}

function setupMorphAnimation() {
    console.log("Setting up Morph animation");

    // Use complexity slider value if available, otherwise default
    const complexity = uiElements.morphComplexity ? Number.parseInt(uiElements.morphComplexity.value) : 32;
    const geometries = createMorphGeometries(complexity);

    // Use a material suitable for morphing
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ffaa, // Teal color
        roughness: 0.4,
        metalness: 0.1,
        wireframe: false, // Can be toggled for effect
        flatShading: false,
    });

    // Start with the first geometry
    const mesh = new THREE.Mesh(geometries[0], material);
    mesh.name = "morphMesh";
    scene.add(mesh);

    // Store references
    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.geometries = geometries;
    animationObjects.currentShapeIndex = 0;
    animationObjects.targetShapeIndex = 1;
    animationObjects.morphProgress = 0; // 0 to 1 transition progress
    animationObjects.lastComplexity = complexity; // Store complexity

    // Update UI labels
    if (uiElements.morphSpeedValue) uiElements.morphSpeedValue.textContent = Number.parseFloat(morphControls.sliderMorphSpeed.value).toFixed(1);
    if (uiElements.morphRotationSpeedValue) uiElements.morphRotationSpeedValue.textContent = Number.parseFloat(morphControls.sliderRotationSpeed.value).toFixed(1);
    if (uiElements.morphComplexityValue) uiElements.morphComplexityValue.textContent = complexity;
}

function cleanupMorphAnimation() {
    console.log("Cleaning up Morph animation");
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        // Dispose current geometry attached to mesh
        if (animationObjects.mesh.geometry) {
            animationObjects.mesh.geometry.dispose();
        }
        // Dispose all geometries stored in the array
        if (animationObjects.geometries) {
            for (const geom of animationObjects.geometries) {
                geom.dispose();
            }
        }
        // Dispose material
        if (animationObjects.material) {
            animationObjects.material.dispose();
        }
    }
    // Clear animationObjects specific to morph
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometries = null;
    animationObjects.currentShapeIndex = 0;
    animationObjects.targetShapeIndex = 1;
    animationObjects.morphProgress = 0;
    animationObjects.lastComplexity = null;
}

// Handler specifically for complexity changes (requires recreation)
function handleMorphComplexityChange() {
    // Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'morph') return;
    const newComplexity = Number.parseInt(morphControls.sliderComplexity.value);
    if (newComplexity !== animationObjects.lastComplexity) {
        console.log("Morph complexity changed, recreating...");
        cleanupMorphAnimation();
        setupMorphAnimation(); // Recreate with new complexity
    }
}

function updateMorphAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.mesh) return;

    const mesh = animationObjects.mesh;
    const geometries = animationObjects.geometries;
    const morphSpeed = Number.parseFloat(morphControls.sliderMorphSpeed.value);
    const rotationSpeed = Number.parseFloat(morphControls.sliderRotationSpeed.value);

    // Update rotation
    mesh.rotation.x += deltaTime * rotationSpeed * 0.3;
    mesh.rotation.y += deltaTime * rotationSpeed * 0.5;
    mesh.rotation.z += deltaTime * rotationSpeed * 0.2;

    // Update morph progress
    animationObjects.morphProgress += deltaTime * morphSpeed;

    // --- Cross-fade / Scale Transition Logic ---
    const progress = animationObjects.morphProgress;

    if (progress >= 1.0) {
        // Transition complete: Finalize target shape and prepare for next
        animationObjects.morphProgress = 0; // Reset progress
        animationObjects.currentShapeIndex = animationObjects.targetShapeIndex;
        animationObjects.targetShapeIndex = (animationObjects.targetShapeIndex + 1) % geometries.length;

        // Ensure mesh has the correct final geometry and scale
        if (mesh.geometry !== geometries[animationObjects.currentShapeIndex]) {
            // mesh.geometry.dispose(); // Dispose old geometry - Handled in cleanup/setup on complexity change
            mesh.geometry = geometries[animationObjects.currentShapeIndex];
        }
        mesh.scale.setScalar(1.0); // Ensure final scale is 1
        mesh.visible = true; // Ensure visibility

    } else {
        // Mid-transition: Apply scaling effect
        // Use an easing function (e.g., smoothstep)
        const t = progress; // Use linear progress for scale calculation
        const scaleFactor = t < 0.5 ? 1.0 - (t * 2) : (t - 0.5) * 2; // Scale down then up

        if (progress < 0.5) {
            // Scaling down the current shape
            // Ensure the geometry is the current one
             if (mesh.geometry !== geometries[animationObjects.currentShapeIndex]) {
                // mesh.geometry.dispose(); // Handled in cleanup/setup
                mesh.geometry = geometries[animationObjects.currentShapeIndex];
            }
            mesh.scale.setScalar(1.0 - scaleFactor); // Scale down from 1 to 0
        } else {
            // Scaling up the target shape
            // Switch geometry exactly at the halfway point
             if (mesh.geometry !== geometries[animationObjects.targetShapeIndex]) {
                // mesh.geometry.dispose(); // Handled in cleanup/setup
                mesh.geometry = geometries[animationObjects.targetShapeIndex];
            }
            mesh.scale.setScalar(scaleFactor); // Scale up from 0 to 1
        }
         // Ensure visibility (might be needed if scale goes to 0)
        mesh.visible = mesh.scale.x > 0.01; // Hide if scale is near zero
    }
     // Update geometry if needed (though handled in progress logic)
    // mesh.geometry.computeVertexNormals(); // Needed if geometry changes - StandardMaterial does this
    // mesh.geometry.needsUpdate = true; // May not be necessary but safe - Not needed for geometry swap
	animationObjects.material.needsUpdate = true;
}

// Randomize morph parameters
function randomizeMorphParameters() {
	console.log("Randomizing Morph parameters...");
	const sliders = [
		morphControls.sliderMorphSpeed,
		morphControls.sliderRotationSpeed,
		morphControls.sliderComplexity,
	];

	for (const slider of sliders) {
		if (!slider) continue;
		const min = Number.parseFloat(slider.min);
		const max = Number.parseFloat(slider.max);
		const step = Number.parseFloat(slider.step) || (max - min) / 100;
		const range = max - min;
		const randomSteps = Math.floor(Math.random() * (range / step + 1));
		slider.value = min + randomSteps * step;
		// Trigger input event to update labels via script.js and potentially trigger recreation
		slider.dispatchEvent(new Event("input", { bubbles: true }));
	}
	// Complexity change is handled by the 'input' event listener calling handleComplexityChange
}

// Make functions available to the main script
window.MORPH_ANIMATION = {
	setup: setupMorphAnimation,
	update: updateMorphAnimation,
	cleanup: cleanupMorphAnimation,
	randomize: randomizeMorphParameters,
	handleSpeedChange: () => {}, // No specific handler needed, read in update
	handleRotationSpeedChange: () => {}, // No specific handler needed, read in update
	handleComplexityChange: handleMorphComplexityChange, // Specific handler for complexity
};