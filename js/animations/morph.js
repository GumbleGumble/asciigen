// Shape Morphing Animation
function setupMorphAnimation() {
    // Create geometries for morphing between
    const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
    const cubeGeometry = new THREE.BoxGeometry(8, 8, 8, 16, 16, 16);
    const torusGeometry = new THREE.TorusGeometry(5, 2, 16, 100);
    const coneGeometry = new THREE.ConeGeometry(5, 10, 32, 20);
    
    // Create morphable mesh by setting morph targets
    // First, convert geometries to BufferGeometry and ensure consistent vertex count
    
    // Create the base mesh with the sphere geometry
    const material = new THREE.MeshNormalMaterial({
        wireframe: true,
        morphTargets: true // Enable morph targets
    });
    
    // Create a mesh with morph target influences
    const mesh = new THREE.Mesh(sphereGeometry, material);
    mesh.morphTargetInfluences = [0, 0, 0]; // Initialize with no influence
    mesh.name = "morphMesh";
    
    // Store geometries for morphing in the animation update
    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.geometries = [
        sphereGeometry,
        cubeGeometry,
        torusGeometry,
        coneGeometry
    ];
    animationObjects.currentShapeIndex = 0;
    animationObjects.targetShapeIndex = 1;
    animationObjects.morphProgress = 0;
    
    scene.add(mesh);
    
    // Add listeners for parameter changes
    const morphSliders = [
        morphControls.sliderSpeed,
        morphControls.sliderRotationSpeed,
        morphControls.sliderComplexity
    ];
    
    morphSliders.forEach(slider => {
        slider.removeEventListener('input', handleMorphParamChange);
        slider.addEventListener('input', handleMorphParamChange);
    });
    
    // Initial update for values
    handleMorphParamChange();
}

// Handler for Morph parameter changes
function handleMorphParamChange() {
    if (currentAnimation !== 'morph') return;
    
    // Update complexity of the morph mesh if complexity slider changed
    const complexity = parseInt(morphControls.sliderComplexity.value);
    const currentMesh = animationObjects.mesh;
    
    if (currentMesh && complexity !== animationObjects.lastComplexity) {
        animationObjects.lastComplexity = complexity;
        
        // Regenerate geometries with new complexity
        scene.remove(currentMesh);
        
        const sphereGeometry = new THREE.SphereGeometry(5, complexity, complexity);
        const cubeGeometry = new THREE.BoxGeometry(8, 8, 8, complexity/2, complexity/2, complexity/2);
        const torusGeometry = new THREE.TorusGeometry(5, 2, complexity/2, complexity*2);
        const coneGeometry = new THREE.ConeGeometry(5, 10, complexity, complexity/2);
        
        const newMesh = new THREE.Mesh(sphereGeometry, animationObjects.material);
        newMesh.name = "morphMesh";
        
        animationObjects.mesh = newMesh;
        animationObjects.geometries = [
            sphereGeometry,
            cubeGeometry,
            torusGeometry,
            coneGeometry
        ];
        
        scene.add(newMesh);
    }
}

// Animation update function for Shape Morphing
function updateMorphAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.mesh) return;
    
    const mesh = animationObjects.mesh;
    const geometries = animationObjects.geometries;
    
    // Get morph speed from slider
    const morphSpeed = parseFloat(morphControls.sliderSpeed.value);
    const rotationSpeed = parseFloat(morphControls.sliderRotationSpeed.value);
    
    // Update rotation
    mesh.rotation.x += deltaTime * rotationSpeed * 0.5;
    mesh.rotation.y += deltaTime * rotationSpeed;
    
    // Update morph progress
    animationObjects.morphProgress += deltaTime * morphSpeed;
    
    // When morphing is complete, switch to the next shape
    if (animationObjects.morphProgress >= 1.0) {
        animationObjects.morphProgress = 0;
        animationObjects.currentShapeIndex = animationObjects.targetShapeIndex;
        animationObjects.targetShapeIndex = (animationObjects.targetShapeIndex + 1) % geometries.length;
        
        // Replace the mesh geometry with the current shape
        mesh.geometry.dispose();
        mesh.geometry = geometries[animationObjects.currentShapeIndex].clone();
    }
    
    // Perform manual interpolation between current and target shape
    const progress = animationObjects.morphProgress;
    const currentGeometry = geometries[animationObjects.currentShapeIndex];
    const targetGeometry = geometries[animationObjects.targetShapeIndex];
    
    // Get position attributes
    const currentPositions = currentGeometry.attributes.position;
    const targetPositions = targetGeometry.attributes.position;
    const currentPositionCount = currentPositions.count;
    const targetPositionCount = targetPositions.count;
    
    // If vertex counts match, we can smoothly interpolate
    if (currentPositionCount === targetPositionCount) {
        const positions = mesh.geometry.attributes.position;
        
        for (let i = 0; i < positions.count; i++) {
            const i3 = i * 3;
            
            // Linear interpolation between current and target positions
            positions.array[i3] = currentPositions.array[i3] * (1 - progress) + targetPositions.array[i3] * progress;
            positions.array[i3 + 1] = currentPositions.array[i3 + 1] * (1 - progress) + targetPositions.array[i3 + 1] * progress;
            positions.array[i3 + 2] = currentPositions.array[i3 + 2] * (1 - progress) + targetPositions.array[i3 + 2] * progress;
        }
        
        positions.needsUpdate = true;
    } else {
        // If vertex counts don't match, we'll do a simple crossfade by replacing the mesh
        mesh.visible = true;
        mesh.scale.setScalar(1.0); // Reset scale
        
        // Apply a "shrink and grow" effect for non-matching geometry morphs
        if (progress < 0.5) {
            // First half: scale down current shape
            mesh.scale.setScalar(1.0 - progress * 2);
        } else {
            // Second half: scale up target shape
            if (mesh.geometry !== targetGeometry) {
                mesh.geometry.dispose();
                mesh.geometry = targetGeometry.clone();
            }
            mesh.scale.setScalar((progress - 0.5) * 2);
        }
    }
}

// Make functions available to the main script
window.MORPH_ANIMATION = {
    setup: setupMorphAnimation,
    update: updateMorphAnimation,
    handleParamChange: handleMorphParamChange
};