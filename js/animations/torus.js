// Torus Animation
function setupTorusAnimation() {
    console.log("Setting up Torus animation");
    
    // Get the thickness parameter
    const thicknessRatio = parseFloat(torusControls.sliderThickness.value);
    torusControls.valueThickness.textContent = thicknessRatio;
    
    // Create torus geometry with adjustable thickness
    // Parameters: radius, tube radius, radial segments, tubular segments
    const geometry = new THREE.TorusGeometry(3, 3 * thicknessRatio, 16, 100);
    
    // Create material with matcap-like shading
    const material = new THREE.MeshStandardMaterial({
        color: 0x6495ED, // Cornflower blue
        roughness: 0.3,
        metalness: 0.7,
        flatShading: false
    });
    
    // Create mesh and add to scene
    const torus = new THREE.Mesh(geometry, material);
    scene.add(torus);
    
    // Add lighting specifically for the torus
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    
    // Add a second light source from a different angle
    const pointLight2 = new THREE.PointLight(0xffa500, 0.8); // Orange-ish
    pointLight2.position.set(-10, -5, 5);
    scene.add(pointLight2);
    
    // Store references for animation updates
    animationObjects.torus = torus;
    animationObjects.geometry = geometry;
    animationObjects.material = material;
    animationObjects.lights = [pointLight, pointLight2];
    
    // Add event listener for thickness control
    torusControls.sliderThickness.addEventListener('input', handleTorusThicknessChange);
}

function handleTorusThicknessChange() {
    if (currentAnimation !== 'torus' || !animationObjects.torus) return;
    
    // Update the thickness display
    const thicknessRatio = parseFloat(torusControls.sliderThickness.value);
    torusControls.valueThickness.textContent = thicknessRatio;
    
    // Remove current torus
    scene.remove(animationObjects.torus);
    if (animationObjects.geometry) animationObjects.geometry.dispose();
    
    // Create new torus with updated thickness
    const newGeometry = new THREE.TorusGeometry(3, 3 * thicknessRatio, 16, 100);
    const newTorus = new THREE.Mesh(newGeometry, animationObjects.material);
    scene.add(newTorus);
    
    // Update stored references
    animationObjects.torus = newTorus;
    animationObjects.geometry = newGeometry;
}

function updateTorusAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.torus) return;
    
    // Get rotation speed from control
    const rotationSpeed = parseFloat(torusControls.sliderSpeed.value);
    
    // Create rotating animation
    animationObjects.torus.rotation.x = elapsedTime * rotationSpeed * 0.5;
    animationObjects.torus.rotation.y = elapsedTime * rotationSpeed * 0.8;
    animationObjects.torus.rotation.z = elapsedTime * rotationSpeed * 0.2;
    
    // Optional: Move the lights in a circular pattern
    if (animationObjects.lights && animationObjects.lights.length >= 2) {
        const radius = 10;
        const light1 = animationObjects.lights[0];
        light1.position.x = Math.sin(elapsedTime * 0.5) * radius;
        light1.position.z = Math.cos(elapsedTime * 0.5) * radius;
        
        const light2 = animationObjects.lights[1];
        light2.position.x = Math.sin(elapsedTime * 0.3 + Math.PI) * radius;
        light2.position.z = Math.cos(elapsedTime * 0.3 + Math.PI) * radius;
    }
}

// Make functions available to the main script
window.TORUS_ANIMATION = {
    setup: setupTorusAnimation,
    update: updateTorusAnimation,
    handleThicknessChange: handleTorusThicknessChange
};