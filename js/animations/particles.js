// Particle System Animation
function setupParticleAnimation() {
    console.log("Setting up Particle System animation");
    
    // Get parameters from controls
    const particleCount = parseInt(particlesControls.sliderCount.value);
    const particleSize = parseFloat(particlesControls.sliderSize.value);
    const emitterShape = particlesControls.selectEmitterShape.value;
    const emitterSize = parseFloat(particlesControls.sliderEmitterSize.value);
    
    // Update display values
    particlesControls.valueCount.textContent = particleCount;
    
    // Create particle geometry - simple points
    const particlesGeometry = new THREE.BufferGeometry();
    
    // Create arrays to hold particle positions and attributes
    const positions = new Float32Array(particleCount * 3); // x, y, z
    const velocities = new Float32Array(particleCount * 3);
    const lifespans = new Float32Array(particleCount);
    const initialLifespans = new Float32Array(particleCount);
    
    // Initialize particle positions based on emitter shape
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Generate position based on emitter shape
        if (emitterShape === 'box') {
            positions[i3] = (Math.random() * 2 - 1) * emitterSize; // x
            positions[i3 + 1] = (Math.random() * 2 - 1) * emitterSize; // y
            positions[i3 + 2] = (Math.random() * 2 - 1) * emitterSize; // z
        } else if (emitterShape === 'sphere') {
            // Generate points on a sphere surface
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            positions[i3] = Math.sin(phi) * Math.cos(theta) * emitterSize;
            positions[i3 + 1] = Math.sin(phi) * Math.sin(theta) * emitterSize;
            positions[i3 + 2] = Math.cos(phi) * emitterSize;
        } else if (emitterShape === 'point') {
            // All particles start at origin
            positions[i3] = 0;
            positions[i3 + 1] = 0;
            positions[i3 + 2] = 0;
        }
        
        // Generate random velocities (direction from center if point emitter)
        if (emitterShape === 'point') {
            // Direction away from center
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(Math.random() * 2 - 1);
            velocities[i3] = Math.sin(phi) * Math.cos(theta);
            velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta);
            velocities[i3 + 2] = Math.cos(phi);
        } else {
            // Random directions for box/sphere emitters
            velocities[i3] = Math.random() * 2 - 1;
            velocities[i3 + 1] = Math.random() * 2 - 1;
            velocities[i3 + 2] = Math.random() * 2 - 1;
        }
        
        // Normalize velocity vectors
        const vLength = Math.sqrt(
            velocities[i3] * velocities[i3] + 
            velocities[i3 + 1] * velocities[i3 + 1] + 
            velocities[i3 + 2] * velocities[i3 + 2]
        );
        
        if (vLength > 0) {
            velocities[i3] /= vLength;
            velocities[i3 + 1] /= vLength;
            velocities[i3 + 2] /= vLength;
        }
        
        // Randomize initial state of lifespan
        const lifespan = parseFloat(particlesControls.sliderLifespan.value);
        const initialLifespan = Math.random() * lifespan;
        lifespans[i] = initialLifespan;
        initialLifespans[i] = lifespan; // Store max lifespan
    }
    
    // Add the positions to the particle geometry
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create particle material
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x88ccff,
        size: particleSize,
        transparent: true,
        opacity: 0.8,
        vertexColors: false,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    // Create particle system and add to scene
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particleSystem);
    
    // Store references for animation updates
    animationObjects.particleSystem = particleSystem;
    animationObjects.particlesGeometry = particlesGeometry;
    animationObjects.particlesMaterial = particlesMaterial;
    animationObjects.positions = positions;
    animationObjects.velocities = velocities;
    animationObjects.lifespans = lifespans;
    animationObjects.initialLifespans = initialLifespans;
    animationObjects.emitterShape = emitterShape;
    animationObjects.emitterSize = emitterSize;
    animationObjects.particleCount = particleCount;
    
    // Add event listeners for control changes
    particlesControls.sliderCount.addEventListener('input', handleParticleCountChange);
    particlesControls.sliderSize.addEventListener('input', handleParticleParamChange);
    particlesControls.selectEmitterShape.addEventListener('change', handleParticleEmitterChange);
    particlesControls.sliderEmitterSize.addEventListener('input', handleParticleEmitterChange);
}

function handleParticleCountChange() {
    if (currentAnimation !== 'particles') return;
    
    // Recreate the particle system with new count
    scene.remove(animationObjects.particleSystem);
    if (animationObjects.particlesGeometry) animationObjects.particlesGeometry.dispose();
    if (animationObjects.particlesMaterial) animationObjects.particlesMaterial.dispose();
    
    setupParticleAnimation();
}

function handleParticleParamChange() {
    if (currentAnimation !== 'particles' || !animationObjects.particlesMaterial) return;
    
    // Update material with new size
    const size = parseFloat(particlesControls.sliderSize.value);
    animationObjects.particlesMaterial.size = size;
}

function handleParticleEmitterChange() {
    if (currentAnimation !== 'particles') return;
    
    // Need to recreate particles with new emitter properties
    handleParticleCountChange();
}

function updateParticlesAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.particleSystem) return;
    
    const positions = animationObjects.positions;
    const velocities = animationObjects.velocities;
    const lifespans = animationObjects.lifespans;
    const initialLifespans = animationObjects.initialLifespans;
    const particleCount = animationObjects.particleCount;
    const speed = parseFloat(particlesControls.sliderSpeed.value);
    const forceType = particlesControls.selectForceType.value;
    const forceStrength = parseFloat(particlesControls.sliderForceStrength.value);
    
    // Update each particle
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Update lifespan
        lifespans[i] -= deltaTime;
        
        // If particle has died, respawn it
        if (lifespans[i] <= 0) {
            lifespans[i] = initialLifespans[i];
            
            // Respawn based on emitter shape
            if (animationObjects.emitterShape === 'box') {
                positions[i3] = (Math.random() * 2 - 1) * animationObjects.emitterSize;
                positions[i3 + 1] = (Math.random() * 2 - 1) * animationObjects.emitterSize;
                positions[i3 + 2] = (Math.random() * 2 - 1) * animationObjects.emitterSize;
            } else if (animationObjects.emitterShape === 'sphere') {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                positions[i3] = Math.sin(phi) * Math.cos(theta) * animationObjects.emitterSize;
                positions[i3 + 1] = Math.sin(phi) * Math.sin(theta) * animationObjects.emitterSize;
                positions[i3 + 2] = Math.cos(phi) * animationObjects.emitterSize;
            } else if (animationObjects.emitterShape === 'point') {
                positions[i3] = 0;
                positions[i3 + 1] = 0;
                positions[i3 + 2] = 0;
            }
            
            // Generate new velocities for respawned particles
            if (animationObjects.emitterShape === 'point') {
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(Math.random() * 2 - 1);
                velocities[i3] = Math.sin(phi) * Math.cos(theta);
                velocities[i3 + 1] = Math.sin(phi) * Math.sin(theta);
                velocities[i3 + 2] = Math.cos(phi);
            } else {
                velocities[i3] = Math.random() * 2 - 1;
                velocities[i3 + 1] = Math.random() * 2 - 1;
                velocities[i3 + 2] = Math.random() * 2 - 1;
            }
            
            // Normalize velocity vectors
            const vLength = Math.sqrt(
                velocities[i3] * velocities[i3] + 
                velocities[i3 + 1] * velocities[i3 + 1] + 
                velocities[i3 + 2] * velocities[i3 + 2]
            );
            
            if (vLength > 0) {
                velocities[i3] /= vLength;
                velocities[i3 + 1] /= vLength;
                velocities[i3 + 2] /= vLength;
            }
        } else {
            // Apply forces
            if (forceType === 'gravity') {
                // Simple gravity pulls toward negative Y
                velocities[i3 + 1] -= forceStrength * deltaTime;
            } else if (forceType === 'vortex') {
                // Vortex/swirl effect
                const posX = positions[i3];
                const posZ = positions[i3 + 2];
                const dist = Math.sqrt(posX * posX + posZ * posZ);
                if (dist > 0.01) {
                    const vx = -posZ / dist;
                    const vz = posX / dist;
                    
                    velocities[i3] += vx * forceStrength * deltaTime;
                    velocities[i3 + 2] += vz * forceStrength * deltaTime;
                    
                    // Normalize velocity after force applied
                    const vLength = Math.sqrt(
                        velocities[i3] * velocities[i3] + 
                        velocities[i3 + 1] * velocities[i3 + 1] + 
                        velocities[i3 + 2] * velocities[i3 + 2]
                    );
                    
                    if (vLength > 0) {
                        velocities[i3] /= vLength;
                        velocities[i3 + 1] /= vLength;
                        velocities[i3 + 2] /= vLength;
                    }
                }
            }
            
            // Update positions based on velocities
            positions[i3] += velocities[i3] * speed * deltaTime;
            positions[i3 + 1] += velocities[i3 + 1] * speed * deltaTime;
            positions[i3 + 2] += velocities[i3 + 2] * speed * deltaTime;
            
            // Optional: boundary checking - remove or bounce particles that go too far
            const maxDistance = 20;
            const distance = Math.sqrt(
                positions[i3] * positions[i3] + 
                positions[i3 + 1] * positions[i3 + 1] + 
                positions[i3 + 2] * positions[i3 + 2]
            );
            
            if (distance > maxDistance) {
                // Option 1: Kill the particle (reset lifespan to trigger respawn)
                lifespans[i] = 0; 
                
                // Option 2: Bounce back (reflect velocity)
                // const bounceDirection = -0.8; // Dampen the bounce
                // velocities[i3] *= bounceDirection;
                // velocities[i3 + 1] *= bounceDirection;
                // velocities[i3 + 2] *= bounceDirection;
            }
        }
    }
    
    // Update particle alpha based on remaining lifespan
    const geometry = animationObjects.particlesGeometry;
    geometry.attributes.position.needsUpdate = true;
}

// Make functions available to the main script
window.PARTICLES_ANIMATION = {
    setup: setupParticleAnimation,
    update: updateParticlesAnimation,
    handleCountChange: handleParticleCountChange,
    handleParamChange: handleParticleParamChange,
    handleEmitterChange: handleParticleEmitterChange
};