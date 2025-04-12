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
    const complexity = uiElements.morphComplexity ? Number.parseInt(uiElements.morphComplexity.value) : 32; // Use const
    let geometries; // Keep let here as it might be reassigned in catch block
    try {
        geometries = createMorphGeometries(complexity);
    } catch (error) {
        console.error("Error creating morph geometries:", error);
        // Fallback or error handling
        const fallbackComplexity = 16; // Use const for fallback value
        geometries = createMorphGeometries(fallbackComplexity);
        if (uiElements.morphComplexity) uiElements.morphComplexity.value = fallbackComplexity;
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

    // Add listener for complexity slider (ensure it calls the correct handler)
    if (uiElements.morphComplexity) {
        // Remove previous listener if any to avoid duplicates during recreation
        uiElements.morphComplexity.removeEventListener('input', handleMorphComplexityChange);
        uiElements.morphComplexity.addEventListener('input', handleMorphComplexityChange);
    }
    // Add listener for color picker
    if (uiElements.morphColorPicker) {
        uiElements.morphColorPicker.removeEventListener('input', handleMorphColorChange); // Avoid duplicates
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

    // Remove listeners during cleanup
    if (uiElements.morphComplexity) {
        uiElements.morphComplexity.removeEventListener('input', handleMorphComplexityChange);
    }
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
    // Ensure control and animationObjects exist
    if (!uiElements.morphComplexity || animationObjects.lastComplexity === undefined) return; // Check existence

    const newComplexity = Number.parseInt(uiElements.morphComplexity.value);
    // Check if complexity actually changed
    if (newComplexity !== animationObjects.lastComplexity) {
        console.log("Morph complexity changed, recreating...");
        // Store the new complexity *before* cleanup/setup to avoid infinite loops if setup fails
        // animationObjects.lastComplexity = newComplexity; // Set this within setup instead
        cleanupMorphAnimation();
        setupMorphAnimation(); // Recreate with new complexity
    } else {
        // If complexity value is the same, just update the display
        updateAllValueDisplays();
    }
}

// Handler for color changes
function handleMorphColorChange() {
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'morph' || !animationObjects.material || !uiElements.morphColorPicker) return;
    // console.log("Morph color changed:", uiElements.morphColorPicker.value); // Uncomment for debugging
    animationObjects.material.color.set(uiElements.morphColorPicker.value);
}

function updateMorphAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.mesh || !animationObjects.geometries || animationObjects.geometries.length < 2 || !morphControls.sliderMorphSpeed || !morphControls.sliderRotationSpeed) {
        // console.warn("Morph update prerequisites not met.");
        return;
    }

    const mesh = animationObjects.mesh;
    const geometries = animationObjects.geometries;
    const morphSpeed = Number.parseFloat(morphControls.sliderMorphSpeed?.value || 1.0);
    const rotationSpeed = Number.parseFloat(morphControls.sliderRotationSpeed?.value || 0.5);
    // Ensure deltaTime is valid, provide fallback
    const dt = (typeof deltaTime === 'number' && deltaTime > 0) ? Math.min(deltaTime, 0.05) : (1/60);

    // --- Debug Log ---
    // console.log(`Morph Update - dt: ${dt.toFixed(4)}, morphSpeed: ${morphSpeed}, rotationSpeed: ${rotationSpeed}, progress: ${animationObjects.morphProgress.toFixed(3)}`); // Uncomment for debugging

    // Update rotation only if speed is non-zero
    if (Math.abs(rotationSpeed) > 0.001) {
        mesh.rotation.x += dt * rotationSpeed * 0.3;
        mesh.rotation.y += dt * rotationSpeed * 0.5;
        mesh.rotation.z += dt * rotationSpeed * 0.2;
        mesh.rotation.x %= (Math.PI * 2);
        mesh.rotation.y %= (Math.PI * 2);
        mesh.rotation.z %= (Math.PI * 2);
    }

    // Update morph progress only if speed is non-zero
    if (Math.abs(morphSpeed) > 0.001) {
        animationObjects.morphProgress += dt * morphSpeed;
    } else {
        // If speed is zero, ensure progress doesn't accidentally advance due to potential dt issues
        // return; // Or just skip the morph logic below
    }

    const progress = animationObjects.morphProgress;
    // const transitionDuration = 1.0 / Math.max(0.1, morphSpeed); // Not directly used in scale logic

    const currentGeomIndex = animationObjects.currentShapeIndex;
    const targetGeomIndex = animationObjects.targetShapeIndex;
    const currentGeom = geometries[currentGeomIndex];
    const targetGeom = geometries[targetGeomIndex];

    if (progress >= 1.0) {
        // Transition complete
        animationObjects.morphProgress = 0; // Reset progress
        animationObjects.currentShapeIndex = targetGeomIndex;
        animationObjects.targetShapeIndex = (targetGeomIndex + 1) % geometries.length;

        // Ensure mesh has the correct final geometry and scale
        if (mesh.geometry !== targetGeom) {
            mesh.geometry = targetGeom;
        }
        mesh.scale.setScalar(1.0);
        mesh.visible = true;
        // console.log(`Morph complete, switched to index ${animationObjects.currentShapeIndex}`); // Debug log

    } else if (progress < 0) {
        // Handle potential negative progress if speed is negative (optional reverse morph)
        animationObjects.morphProgress = 1.0; // Wrap around or clamp
        // Or implement reverse logic if desired
    } else {
        // Mid-transition: Scale down current, scale up target
        const halfProgress = 0.5;
        let scaleFactor = 1.0;
        let activeGeom = currentGeom; // Track which geometry should be active

        if (progress < halfProgress) {
            // Scaling down current shape (progress 0 to 0.5 -> scale 1 to 0)
            scaleFactor = 1.0 - (progress / halfProgress);
            activeGeom = currentGeom;
        } else {
            // Scaling up target shape (progress 0.5 to 1.0 -> scale 0 to 1)
            scaleFactor = (progress - halfProgress) / halfProgress;
            activeGeom = targetGeom;
        }

        // Switch geometry if needed
        if (mesh.geometry !== activeGeom) {
            mesh.geometry = activeGeom;
        }

        // Apply smoothstep for smoother scaling
        const smoothScale = scaleFactor * scaleFactor * (3.0 - 2.0 * scaleFactor);
        mesh.scale.setScalar(Math.max(0.001, smoothScale)); // Apply scale, avoid zero
        mesh.visible = mesh.scale.x > 0.001;
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

    // Ensure complexity slider randomization triggers the input event
    const complexitySlider = morphControls.sliderComplexity;
    if (complexitySlider) {
        // ... (randomize value as before) ...
        complexitySlider.dispatchEvent(new Event("input", { bubbles: true })); // Ensure event is dispatched
    }

    // Randomize color picker
    const colorPicker = uiElements.morphColorPicker;
    if (colorPicker) {
        const randomColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        colorPicker.value = `#${randomColor.getHexString()}`;
        colorPicker.dispatchEvent(new Event("input", { bubbles: true })); // Trigger color change handler
    }
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
    handleColorChange: handleMorphColorChange, // Ensure this is exposed
};