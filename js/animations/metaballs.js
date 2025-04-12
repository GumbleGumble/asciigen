// Metaballs / Gooey Blobs Animation
function setupMetaballsAnimation() {
    // Update UI values
    metaballsControls.valueCount.textContent = metaballsControls.sliderCount.value;
    metaballsControls.valueSize.textContent = parseFloat(metaballsControls.sliderSize.value).toFixed(1);
    metaballsControls.valueThreshold.textContent = parseFloat(metaballsControls.sliderThreshold.value).toFixed(2);

    // Create the metaballs system
    const ballCount = parseInt(metaballsControls.sliderCount.value);
    const ballSize = parseFloat(metaballsControls.sliderSize.value);
    
    // Create shader material with metaball rendering
    const metaballsShader = {
        uniforms: {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(1.0, 1.0) },
            ballPositions: { value: new Float32Array(ballCount * 3) }, // xyz for each ball
            ballRadii: { value: new Float32Array(ballCount) },
            colorBlend: { value: 0.5 },
            threshold: { value: 1.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            uniform vec3 ballPositions[${ballCount}];
            uniform float ballRadii[${ballCount}];
            uniform float colorBlend;
            uniform float threshold;
            varying vec2 vUv;
            
            // Function to calculate metaball field at a point
            float metaball(vec3 point, vec3 center, float radius) {
                float dist = distance(point, center);
                // Inverse square falloff
                return radius * radius / max(dist * dist, 0.000001);
            }
            
            void main() {
                // Transform UV to 3D space (z will be 0)
                vec3 point = vec3(vUv * 2.0 - 1.0, 0.0) * 10.0;
                
                // Calculate metaball field value at this point
                float sum = 0.0;
                for (int i = 0; i < ${ballCount}; i++) {
                    sum += metaball(point, ballPositions[i], ballRadii[i]);
                }
                
                // Apply threshold
                float metaValue = smoothstep(0.0, threshold, sum);
                
                // Create color based on field value 
                vec3 color1 = vec3(0.0, 0.5, 1.0); // Blue
                vec3 color2 = vec3(1.0, 0.2, 0.7); // Magenta
                vec3 color = mix(color1, color2, colorBlend);
                
                // Adjust brightness based on field strength
                float brightness = metaValue;
                
                // Apply coloring for interesting visual effect
                gl_FragColor = vec4(color * brightness, 1.0);
            }
        `
    };

    // Create a plane to render the metaballs on
    const geometry = new THREE.PlaneGeometry(20, 20, 1, 1);
    const material = new THREE.ShaderMaterial({
        uniforms: metaballsShader.uniforms,
        vertexShader: metaballsShader.vertexShader,
        fragmentShader: metaballsShader.fragmentShader,
        transparent: true
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Create initial ball positions and radii
    const positions = new Float32Array(ballCount * 3);
    const radii = new Float32Array(ballCount);
    const velocities = new Float32Array(ballCount * 3); // Store velocities for animation

    // Initialize with random positions, sizes, and velocities
    for (let i = 0; i < ballCount; i++) {
        // Random position within a certain range
        positions[i * 3 + 0] = (Math.random() * 2 - 1) * 6; // x: -6 to 6
        positions[i * 3 + 1] = (Math.random() * 2 - 1) * 6; // y: -6 to 6
        positions[i * 3 + 2] = (Math.random() * 2 - 1) * 2; // z: -2 to 2

        // Random radius
        radii[i] = (Math.random() * 0.5 + 0.5) * ballSize;

        // Random velocity
        velocities[i * 3 + 0] = (Math.random() * 2 - 1) * 2; // vx
        velocities[i * 3 + 1] = (Math.random() * 2 - 1) * 2; // vy
        velocities[i * 3 + 2] = (Math.random() * 2 - 1) * 0.5; // vz (slower in z)
    }

    // Update uniform values
    material.uniforms.ballPositions.value = positions;
    material.uniforms.ballRadii.value = radii;
    material.uniforms.threshold.value = parseFloat(metaballsControls.sliderThreshold.value);
    material.uniforms.colorBlend.value = parseFloat(metaballsControls.sliderColor.value);

    // Store references for animation updates
    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.positions = positions;
    animationObjects.radii = radii;
    animationObjects.velocities = velocities;
    animationObjects.ballCount = ballCount;
    
    // Add event listeners for control changes
    metaballsControls.sliderCount.addEventListener('input', handleMetaballsCountChange);
    metaballsControls.sliderSize.addEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderThreshold.addEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderColor.addEventListener('input', handleMetaballsParamChange);
    
    // Initial update
    handleMetaballsParamChange();
}

// Handle changes to metaballs count (requires recreation)
function handleMetaballsCountChange() {
    if (currentAnimation !== 'metaballs') return;
    
    // Remove current mesh
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        if (animationObjects.material) animationObjects.material.dispose();
        if (animationObjects.mesh.geometry) animationObjects.mesh.geometry.dispose();
    }
    
    // Create new metaballs setup with updated count
    setupMetaballsAnimation();
}

// Handle changes to metaballs parameters (no recreation needed)
function handleMetaballsParamChange() {
    if (currentAnimation !== 'metaballs' || !animationObjects.material) return;
    
    // Update UI display values
    metaballsControls.valueCount.textContent = metaballsControls.sliderCount.value;
    metaballsControls.valueSize.textContent = parseFloat(metaballsControls.sliderSize.value).toFixed(1);
    metaballsControls.valueThreshold.textContent = parseFloat(metaballsControls.sliderThreshold.value).toFixed(2);
    
    // Update shader uniforms
    const ballSize = parseFloat(metaballsControls.sliderSize.value);
    const threshold = parseFloat(metaballsControls.sliderThreshold.value);
    const colorBlend = parseFloat(metaballsControls.sliderColor.value);
    
    // Update radii based on size parameter
    for (let i = 0; i < animationObjects.ballCount; i++) {
        // Keep the relative sizes but scale them all
        const originalRelativeSize = animationObjects.radii[i] / (animationObjects.originalBallSize || 1.0);
        animationObjects.radii[i] = originalRelativeSize * ballSize;
    }
    
    // Store original size for reference
    if (!animationObjects.originalBallSize) {
        animationObjects.originalBallSize = ballSize;
    }
    
    // Update uniforms
    animationObjects.material.uniforms.ballRadii.value = animationObjects.radii;
    animationObjects.material.uniforms.threshold.value = threshold;
    animationObjects.material.uniforms.colorBlend.value = colorBlend;
}

// Animation update function for metaballs
function updateMetaballsAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.mesh) return;

    const positions = animationObjects.positions;
    const velocities = animationObjects.velocities;
    const ballCount = animationObjects.ballCount;
    const movementSpeed = parseFloat(metaballsControls.sliderSpeed.value);
    
    // Update time uniform for shader
    animationObjects.material.uniforms.time.value = elapsedTime;
    
    // Update ball positions based on velocities and time
    for (let i = 0; i < ballCount; i++) {
        const i3 = i * 3;
        
        // Apply velocity
        positions[i3 + 0] += velocities[i3 + 0] * deltaTime * movementSpeed;
        positions[i3 + 1] += velocities[i3 + 1] * deltaTime * movementSpeed;
        positions[i3 + 2] += velocities[i3 + 2] * deltaTime * movementSpeed;
        
        // Boundary checking - bounce off edges
        const bounds = 9.0; // Slightly less than the plane size (10) to ensure visibility
        
        // X bounds
        if (Math.abs(positions[i3 + 0]) > bounds) {
            velocities[i3 + 0] *= -1; // Reverse direction
            // Ensure position is within bounds
            positions[i3 + 0] = Math.sign(positions[i3 + 0]) * bounds;
        }
        
        // Y bounds
        if (Math.abs(positions[i3 + 1]) > bounds) {
            velocities[i3 + 1] *= -1; // Reverse direction
            positions[i3 + 1] = Math.sign(positions[i3 + 1]) * bounds;
        }
        
        // Z bounds - less important for metaballs viewed from front
        if (Math.abs(positions[i3 + 2]) > 3.0) {
            velocities[i3 + 2] *= -1; // Reverse direction
            positions[i3 + 2] = Math.sign(positions[i3 + 2]) * 3.0;
        }
    }
    
    // Update the shader uniform with new positions
    animationObjects.material.uniforms.ballPositions.value = positions;
}

// Make functions available to the main script
window.METABALLS_ANIMATION = {
    setup: setupMetaballsAnimation,
    update: updateMetaballsAnimation,
    handleCountChange: handleMetaballsCountChange,
    handleParamChange: handleMetaballsParamChange
};