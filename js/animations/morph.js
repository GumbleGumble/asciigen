// Shape Morphing Animation

// Expose module methods
window.MORPH_ANIMATION = {
    setup: setupMorphAnimation,
    update: updateMorphAnimation,
    cleanup: cleanupMorphAnimation,
    randomize: randomizeMorphParameters,
    handleComplexityChange: handleMorphComplexityChange, // Specific handler for complexity
    handleColorChange: handleMorphColorChange, // Added color handler
    handleSpeedChange: () => { updateAllValueDisplays(); }, // Update label on change
    handleRotationSpeedChange: () => { updateAllValueDisplays(); }, // Update label on change
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
    let complexity = uiElements.morphComplexity ? Number.parseInt(uiElements.morphComplexity.value) : 32;
    let geometries;
    try {
        geometries = createMorphGeometries(complexity);
    } catch (error) {
        console.error("Error creating morph geometries:", error);
        // Fallback or error handling
        complexity = 16; // Try lower complexity
        geometries = createMorphGeometries(complexity);
        if (uiElements.morphComplexity) uiElements.morphComplexity.value = complexity;
    }

    // Get initial color from picker
    const initialColor = uiElements.morphColorPicker ? uiElements.morphColorPicker.value : '#00ffaa';

    // Use a material suitable for morphing
    const material = new THREE.MeshStandardMaterial({
        color: initialColor, // Use initial color
        roughness: 0.4,
        metalness: 0.1,
        wireframe: false, // Can be toggled for effect
        flatShading: false,
        side: THREE.DoubleSide // Render both sides, useful for complex shapes
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

    // Add listener for color picker (handled in script.js, ensure handler exists)
    if (uiElements.morphColorPicker) {
        uiElements.morphColorPicker.addEventListener('input', handleMorphColorChange);
    }

    // Update UI labels
    updateAllValueDisplays(); // Ensure labels are correct initially
}

function cleanupMorphAnimation() {
    console.log("Cleaning up Morph animation");
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        // Dispose current geometry attached to mesh
        if (animationObjects.mesh.geometry && typeof animationObjects.mesh.geometry.dispose === 'function') {
            animationObjects.mesh.geometry.dispose();
        }
    }
    // Dispose all geometries stored in the array
    if (animationObjects.geometries) {
        for (const geom of animationObjects.geometries) {
            if (geom && typeof geom.dispose === 'function') {
                geom.dispose();
            }
        }
    }
    // Dispose material
    if (animationObjects.material && typeof animationObjects.material.dispose === 'function') {
        animationObjects.material.dispose();
    }

    // Remove color picker listener
    if (uiElements.morphColorPicker) {
        uiElements.morphColorPicker.removeEventListener('input', handleMorphColorChange);
    }

    // Clear animationObjects specific to morph
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometries = null;
    animationObjects.currentShapeIndex = null;
    animationObjects.targetShapeIndex = null;
    animationObjects.morphProgress = null;
    animationObjects.lastComplexity = null;
}

// Handler specifically for complexity changes (requires recreation)
function handleMorphComplexityChange() {
    // Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'morph') return;
    if (!morphControls.sliderComplexity) return;

    const newComplexity = Number.parseInt(morphControls.sliderComplexity.value);
    if (animationObjects.lastComplexity !== undefined && newComplexity !== animationObjects.lastComplexity) {
        console.log("Morph complexity changed, recreating...");
        cleanupMorphAnimation();
        setupMorphAnimation(); // Recreate with new complexity
    }
    updateAllValueDisplays();
}

// Handler for color changes
function handleMorphColorChange() {
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'morph' || !animationObjects.material || !uiElements.morphColorPicker) return;
    animationObjects.material.color.set(uiElements.morphColorPicker.value);
}

function updateMorphAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.mesh || !animationObjects.geometries || animationObjects.geometries.length === 0) return;

    const mesh = animationObjects.mesh;
    const geometries = animationObjects.geometries;
    const morphSpeed = Number.parseFloat(morphControls.sliderMorphSpeed?.value || 1.0);
    const rotationSpeed = Number.parseFloat(morphControls.sliderRotationSpeed?.value || 0.5);

    // Update rotation
    mesh.rotation.x += deltaTime * rotationSpeed * 0.3;
    mesh.rotation.y += deltaTime * rotationSpeed * 0.5;
    mesh.rotation.z += deltaTime * rotationSpeed * 0.2;

    // Update morph progress
    animationObjects.morphProgress += deltaTime * morphSpeed;

    // --- Corrected Scale Transition Logic ---
    const progress = animationObjects.morphProgress;
    const transitionDuration = 1.0; // Total time for one morph (scale down + scale up)

    if (progress >= transitionDuration) {
        // Transition complete: Finalize target shape and prepare for next
        animationObjects.morphProgress = 0; // Reset progress
        animationObjects.currentShapeIndex = animationObjects.targetShapeIndex;
        animationObjects.targetShapeIndex = (animationObjects.targetShapeIndex + 1) % geometries.length;

        // Ensure mesh has the correct final geometry and scale
        const finalGeometry = geometries[animationObjects.currentShapeIndex];
        if (mesh.geometry !== finalGeometry) {
            // Dispose old geometry before assigning new one IF it's not in the geometries array anymore
            // (Not strictly necessary here as we cycle through the array)
            // if (mesh.geometry && !geometries.includes(mesh.geometry)) {
            //     mesh.geometry.dispose();
            // }
            mesh.geometry = finalGeometry;
        }
        mesh.scale.setScalar(1.0); // Ensure final scale is 1
        mesh.visible = true; // Ensure visibility

    } else {
        // Mid-transition: Apply scaling effect
        const halfDuration = transitionDuration / 2.0;
        let scaleFactor = 1.0;
        let currentGeomIndex = animationObjects.currentShapeIndex;
        let targetGeomIndex = animationObjects.targetShapeIndex;

        if (progress < halfDuration) {
            // Scaling down the current shape (0.0 to halfDuration -> 1.0 to 0.0 scale)
            scaleFactor = 1.0 - (progress / halfDuration);
            if (mesh.geometry !== geometries[currentGeomIndex]) {
                mesh.geometry = geometries[currentGeomIndex];
            }
        } else {
            // Scaling up the target shape (halfDuration to transitionDuration -> 0.0 to 1.0 scale)
            scaleFactor = (progress - halfDuration) / halfDuration;
            if (mesh.geometry !== geometries[targetGeomIndex]) {
                mesh.geometry = geometries[targetGeomIndex];
            }
        }

        // Apply scale using smoothstep for smoother transition
        const smoothScale = scaleFactor * scaleFactor * (3.0 - 2.0 * scaleFactor);
        mesh.scale.setScalar(Math.max(0.001, smoothScale)); // Apply scale, avoid zero scale
        mesh.visible = mesh.scale.x > 0.001; // Hide if scale is effectively zero
    }
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
        const step = Number.parseFloat(slider.step) || (slider.id.includes('complexity') ? 1 : 0.1); // Step 1 for complexity
        const range = max - min;
        const randomValue = min + Math.random() * range;
        const steppedValue = Math.round(randomValue / step) * step;
        const precision = step.toString().includes('.') ? step.toString().split('.')[1].length : 0;
        slider.value = Math.min(max, Math.max(min, steppedValue)).toFixed(precision);

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
    handleSpeedChange: () => { updateAllValueDisplays(); },
    handleRotationSpeedChange: () => { updateAllValueDisplays(); },
    handleComplexityChange: handleMorphComplexityChange,
    handleColorChange: handleMorphColorChange, // Added
};