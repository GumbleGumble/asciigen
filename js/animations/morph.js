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
    // Ensure complexity is reasonable for segments/divisions
    const segments = Math.max(4, Math.floor(complexity)); // Min 4 segments
    const boxSegs = Math.max(1, Math.floor(complexity / 4)); // Lower segs for box
    const torusSegs = Math.max(8, Math.floor(complexity / 2));
    const torusTubeSegs = Math.max(16, complexity);

    const sphereGeometry = new THREE.SphereGeometry(5, segments, segments);
    const boxGeometry = new THREE.BoxGeometry(8, 8, 8, boxSegs, boxSegs, boxSegs);
    const torusGeometry = new THREE.TorusGeometry(4, 1.5, torusSegs, torusTubeSegs);
    const coneGeometry = new THREE.ConeGeometry(5, 10, segments, Math.max(1, boxSegs)); // Cone needs radial and height segments

    // IMPORTANT: For smooth morph targets, geometries MUST have the same vertex count.
    // This is hard to guarantee with different geometry types and complexities.
    // We will implement a cross-fade (scale) effect instead of using morph targets.
    return [
        sphereGeometry,
        boxGeometry,
        torusGeometry,
        coneGeometry
    ];
}

function setupMorphAnimation() {
    console.log("Setting up Morph animation");

    const complexity = Number.parseInt(morphControls.sliderComplexity.value);
    const geometries = createMorphGeometries(complexity);

    // Use a material suitable for morphing, wireframe helps visualize
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
        // Dispose current geometry and material
        if (animationObjects.mesh.geometry) animationObjects.mesh.geometry.dispose();
        if (animationObjects.material) animationObjects.material.dispose(); // Dispose material if unique

        // Dispose all stored geometries
        if (animationObjects.geometries) {
            for (const geom of animationObjects.geometries) {
                geom.dispose();
            }
        }
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
    if (currentAnimation !== 'morph') return;
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
            mesh.geometry.dispose(); // Dispose old geometry
            mesh.geometry = geometries[animationObjects.currentShapeIndex];
        }
        mesh.scale.setScalar(1.0); // Ensure final scale is 1

    } else {
        // Mid-transition: Apply scaling effect
        const easeProgress = progress < 0.5 ? 2 * progress : 2 * (1 - progress);
        // Use an easing function (e.g., quadratic in/out)
        const scaleFactor = easeProgress * easeProgress * (3.0 - 2.0 * easeProgress);


        if (progress < 0.5) {
            // Scaling down the current shape
            // Ensure the geometry is the current one
             if (mesh.geometry !== geometries[animationObjects.currentShapeIndex]) {
                mesh.geometry.dispose();
                mesh.geometry = geometries[animationObjects.currentShapeIndex];
            }
            mesh.scale.setScalar(1.0 - scaleFactor);
        } else {
            // Scaling up the target shape
            // Switch geometry exactly at the halfway point
             if (mesh.geometry !== geometries[animationObjects.targetShapeIndex]) {
                mesh.geometry.dispose();
                mesh.geometry = geometries[animationObjects.targetShapeIndex];
            }
            mesh.scale.setScalar(scaleFactor);
        }
         // Ensure visibility (might be needed if scale goes to 0)
        mesh.visible = mesh.scale.x > 0.01;
    }
     // Update geometry if needed (though handled in progress logic)
    mesh.geometry.computeVertexNormals(); // Needed if geometry changes
    mesh.geometry.needsUpdate = true; // May not be necessary but safe
}


function randomizeMorphParameters() {
    console.log("Randomizing Morph parameters...");
    // Randomize sliders
     const controls = [
        morphControls.sliderMorphSpeed,
        morphControls.sliderRotationSpeed,
        morphControls.sliderComplexity,
    ];

    for (const control of controls) {
        if (control && control.type === 'range') {
            const min = Number.parseFloat(control.min);
            const max = Number.parseFloat(control.max);
            const step = Number.parseFloat(control.step) || (max - min) / 100;
            const range = max - min;
            const randomSteps = Math.floor(Math.random() * (range / step + 1));
            control.value = min + randomSteps * step;
            control.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
    // Complexity change will trigger recreation via its handler.
}