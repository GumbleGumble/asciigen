// filepath: /Users/chase/Library/Mobile Documents/com~apple~CloudDocs/-Projects/Personal Projects/Dev Projects/JS Projects/Ascii v2/js/animations/lissajous.js
// Lissajous Curves Animation Module
window.LISSAJOUS_ANIMATION = {
    setup: function() {
        setupLissajousAnimation();
    },
    update: function(deltaTime, elapsedTime) {
        updateLissajousAnimation(deltaTime, elapsedTime);
    },
    cleanup: function() {
        // Remove any event listeners when switching to another animation
        cleanupLissajousAnimation();
    },
    randomize: function() {
        // Randomize parameters for interesting variations
        randomizeLissajousParameters();
    }
};

// Lissajous Curves Animation
function setupLissajousAnimation() {
    const pointCount = parseInt(lissajousControls.sliderPoints.value);
    lissajousControls.valuePoints.textContent = pointCount; // Update label

    const positions = new Float32Array(pointCount * 3); // x, y, z for each point
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Initialize positions (can be all zero initially)
    for (let i = 0; i < pointCount; i++) {
        positions[i * 3 + 0] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
    }
    geometry.attributes.position.needsUpdate = true; // Mark for update

    // Set initial draw range to 0, we'll expand it in the animate loop
    geometry.setDrawRange(0, 0);

    // Create a color based on time of day for visual interest
    const now = new Date();
    const hue = (now.getHours() % 12) / 12;
    const startColor = new THREE.Color().setHSL(hue, 1, 0.5);
    
    // Create a more interesting visual with gradient material
    const material = new THREE.LineBasicMaterial({
        color: startColor,
        linewidth: 2 // Note: linewidth > 1 may not work on all platforms/drivers
    });

    // Add secondary trail for a more dynamic effect
    const secondaryPositions = new Float32Array(pointCount * 3);
    const secondaryGeometry = new THREE.BufferGeometry();
    secondaryGeometry.setAttribute('position', new THREE.BufferAttribute(secondaryPositions, 3));
    secondaryGeometry.setDrawRange(0, 0);
    
    const secondaryColor = new THREE.Color().setHSL((hue + 0.5) % 1.0, 0.8, 0.6); // Complementary color
    const secondaryMaterial = new THREE.LineBasicMaterial({
        color: secondaryColor,
        linewidth: 1,
        opacity: 0.7,
        transparent: true
    });

    // Add a third line for additional visual complexity
    const tertiaryPositions = new Float32Array(pointCount * 3);
    const tertiaryGeometry = new THREE.BufferGeometry();
    tertiaryGeometry.setAttribute('position', new THREE.BufferAttribute(tertiaryPositions, 3));
    tertiaryGeometry.setDrawRange(0, 0);
    
    const tertiaryColor = new THREE.Color().setHSL((hue + 0.33) % 1.0, 0.9, 0.4); // Triadic color
    const tertiaryMaterial = new THREE.LineBasicMaterial({
        color: tertiaryColor,
        linewidth: 1,
        opacity: 0.5,
        transparent: true
    });

    const line = new THREE.Line(geometry, material);
    line.name = "lissajousLine";
    
    const secondaryLine = new THREE.Line(secondaryGeometry, secondaryMaterial);
    secondaryLine.name = "lissajousSecondaryLine";
    
    const tertiaryLine = new THREE.Line(tertiaryGeometry, tertiaryMaterial);
    tertiaryLine.name = "lissajousTertiaryLine";

    // Create a group to hold all lines for easier manipulation
    const lissajousGroup = new THREE.Group();
    lissajousGroup.name = "lissajousGroup";
    lissajousGroup.add(line);
    lissajousGroup.add(secondaryLine);
    lissajousGroup.add(tertiaryLine);

    animationObjects.line = line;
    animationObjects.geometry = geometry;
    animationObjects.material = material;
    animationObjects.positions = positions; // Keep reference to buffer array
    animationObjects.pointCount = pointCount; // Store current point count
    animationObjects.baseHue = hue; // Store the base hue for color animations
    
    // Add secondary line properties
    animationObjects.secondaryLine = secondaryLine;
    animationObjects.secondaryGeometry = secondaryGeometry;
    animationObjects.secondaryMaterial = secondaryMaterial;
    animationObjects.secondaryPositions = secondaryPositions;
    
    // Add tertiary line properties
    animationObjects.tertiaryLine = tertiaryLine;
    animationObjects.tertiaryGeometry = tertiaryGeometry;
    animationObjects.tertiaryMaterial = tertiaryMaterial;
    animationObjects.tertiaryPositions = tertiaryPositions;
    
    // Store the group
    animationObjects.lissajousGroup = lissajousGroup;
    
    // Animation state tracking
    animationObjects.transitionState = {
        active: false,
        startTime: 0,
        duration: 2.0, // transition duration in seconds
        startParams: {},
        targetParams: {}
    };

    scene.add(lissajousGroup);

    // Add listeners for parameter changes
    const ljSliders = [
        lissajousControls.sliderA, 
        lissajousControls.sliderB, 
        lissajousControls.sliderDelta, 
        lissajousControls.sliderAmpA, 
        lissajousControls.sliderAmpB, 
        lissajousControls.sliderPoints,
        lissajousControls.sliderSpeed
    ];
    
    ljSliders.forEach(slider => {
        slider.removeEventListener('input', handleLissajousParamChange); // Prevent duplicates
        slider.addEventListener('input', handleLissajousParamChange);
    });
    
    // Initial update for labels
    handleLissajousParamChange(); // Call once to set initial labels
}

// Cleanup function for Lissajous animation
function cleanupLissajousAnimation() {
    // Remove event listeners to prevent memory leaks
    const ljSliders = [
        lissajousControls.sliderA, 
        lissajousControls.sliderB, 
        lissajousControls.sliderDelta, 
        lissajousControls.sliderAmpA, 
        lissajousControls.sliderAmpB, 
        lissajousControls.sliderPoints,
        lissajousControls.sliderSpeed
    ];
    
    ljSliders.forEach(slider => {
        slider.removeEventListener('input', handleLissajousParamChange);
    });
    
    // Remove objects from scene
    if (animationObjects.lissajousGroup) {
        scene.remove(animationObjects.lissajousGroup);
    }
    
    // Dispose of geometries and materials
    if (animationObjects.geometry) {
        animationObjects.geometry.dispose();
    }
    
    if (animationObjects.secondaryGeometry) {
        animationObjects.secondaryGeometry.dispose();
    }
    
    if (animationObjects.tertiaryGeometry) {
        animationObjects.tertiaryGeometry.dispose();
    }
    
    if (animationObjects.material) {
        animationObjects.material.dispose();
    }
    
    if (animationObjects.secondaryMaterial) {
        animationObjects.secondaryMaterial.dispose();
    }
    
    if (animationObjects.tertiaryMaterial) {
        animationObjects.tertiaryMaterial.dispose();
    }
}

// Handler for Lissajous parameter changes
function handleLissajousParamChange() {
    if (currentAnimation !== 'lissajous') return;

    // Update labels
    lissajousControls.valueA.textContent = lissajousControls.sliderA.value;
    lissajousControls.valueB.textContent = lissajousControls.sliderB.value;
    lissajousControls.valueDelta.textContent = (parseFloat(lissajousControls.sliderDelta.value)/Math.PI).toFixed(2) + " PI";
    lissajousControls.valueAmpA.textContent = parseFloat(lissajousControls.sliderAmpA.value).toFixed(1);
    lissajousControls.valueAmpB.textContent = parseFloat(lissajousControls.sliderAmpB.value).toFixed(1);
    lissajousControls.valuePoints.textContent = lissajousControls.sliderPoints.value;

    const newPointCount = parseInt(lissajousControls.sliderPoints.value);

    // Recreate geometry ONLY if point count changes significantly
    if (newPointCount !== animationObjects.pointCount && animationObjects.line) {
        // Dispose old geometry
        if (animationObjects.geometry) animationObjects.geometry.dispose();
        if (animationObjects.secondaryGeometry) animationObjects.secondaryGeometry.dispose();
        if (animationObjects.tertiaryGeometry) animationObjects.tertiaryGeometry.dispose();

        // Create new buffer and geometry
        const newPositions = new Float32Array(newPointCount * 3);
        const newGeometry = new THREE.BufferGeometry();
        newGeometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
        newGeometry.setDrawRange(0, 0); // Reset draw range

        // Create secondary geometry
        const newSecondaryPositions = new Float32Array(newPointCount * 3);
        const newSecondaryGeometry = new THREE.BufferGeometry();
        newSecondaryGeometry.setAttribute('position', new THREE.BufferAttribute(newSecondaryPositions, 3));
        newSecondaryGeometry.setDrawRange(0, 0);
        
        // Create tertiary geometry
        const newTertiaryPositions = new Float32Array(newPointCount * 3);
        const newTertiaryGeometry = new THREE.BufferGeometry();
        newTertiaryGeometry.setAttribute('position', new THREE.BufferAttribute(newTertiaryPositions, 3));
        newTertiaryGeometry.setDrawRange(0, 0);

        // Update line objects
        animationObjects.line.geometry = newGeometry;
        animationObjects.secondaryLine.geometry = newSecondaryGeometry;
        animationObjects.tertiaryLine.geometry = newTertiaryGeometry;

        // Update stored references
        animationObjects.geometry = newGeometry;
        animationObjects.positions = newPositions;
        animationObjects.secondaryGeometry = newSecondaryGeometry;
        animationObjects.secondaryPositions = newSecondaryPositions;
        animationObjects.tertiaryGeometry = newTertiaryGeometry;
        animationObjects.tertiaryPositions = newTertiaryPositions;
        animationObjects.pointCount = newPointCount;
    }
    // Other parameters (frequency, amplitude, phase) are handled directly in the animate loop
}

// Function to gradually transition between parameter sets
function startLissajousTransition(targetParams) {
    // Start a transition between current parameters and new ones
    const transition = animationObjects.transitionState;
    transition.active = true;
    transition.startTime = clock.getElapsedTime();
    
    // Store current parameters as start values
    transition.startParams = {
        freqA: parseFloat(lissajousControls.sliderA.value),
        freqB: parseFloat(lissajousControls.sliderB.value),
        delta: parseFloat(lissajousControls.sliderDelta.value),
        ampA: parseFloat(lissajousControls.sliderAmpA.value),
        ampB: parseFloat(lissajousControls.sliderAmpB.value),
        speed: parseFloat(lissajousControls.sliderSpeed.value)
    };
    
    // Set target parameters
    transition.targetParams = targetParams;
}

// Function to randomize Lissajous parameters for interesting shapes
function randomizeLissajousParameters() {
    // Generate random values within reasonable bounds
    const targetParams = {
        freqA: Math.random() * 9 + 1, // 1 to 10
        freqB: Math.random() * 9 + 1, // 1 to 10
        delta: Math.random() * Math.PI * 2, // 0 to 2π
        ampA: Math.random() * 3 + 1, // 1 to 4
        ampB: Math.random() * 3 + 1, // 1 to 4
        speed: Math.random() * 3 + 0.5 // 0.5 to 3.5
    };
    
    // Start a smooth transition to the new parameters
    startLissajousTransition(targetParams);
}

// Get current parameters with transition blending if active
function getCurrentLissajousParameters(elapsedTime) {
    const transition = animationObjects.transitionState;
    
    // If no transition is active, return current slider values
    if (!transition.active) {
        return {
            freqA: parseFloat(lissajousControls.sliderA.value),
            freqB: parseFloat(lissajousControls.sliderB.value),
            delta: parseFloat(lissajousControls.sliderDelta.value),
            ampA: parseFloat(lissajousControls.sliderAmpA.value),
            ampB: parseFloat(lissajousControls.sliderAmpB.value),
            speed: parseFloat(lissajousControls.sliderSpeed.value)
        };
    }
    
    // Calculate transition progress (0 to 1)
    const timeInTransition = elapsedTime - transition.startTime;
    let progress = Math.min(timeInTransition / transition.duration, 1.0);
    
    // Use smooth step function for more natural easing
    progress = progress * progress * (3 - 2 * progress);
    
    // If transition is complete, update UI and deactivate transition
    if (progress >= 1.0) {
        // Update slider values directly
        lissajousControls.sliderA.value = transition.targetParams.freqA.toString();
        lissajousControls.sliderB.value = transition.targetParams.freqB.toString();
        lissajousControls.sliderDelta.value = transition.targetParams.delta.toString();
        lissajousControls.sliderAmpA.value = transition.targetParams.ampA.toString();
        lissajousControls.sliderAmpB.value = transition.targetParams.ampB.toString();
        lissajousControls.sliderSpeed.value = transition.targetParams.speed.toString();
        
        // Update labels to match new values
        handleLissajousParamChange();
        
        // Deactivate transition
        transition.active = false;
        
        // Return final parameters
        return transition.targetParams;
    }
    
    // Blend between start and target parameters based on progress
    return {
        freqA: lerp(transition.startParams.freqA, transition.targetParams.freqA, progress),
        freqB: lerp(transition.startParams.freqB, transition.targetParams.freqB, progress),
        delta: lerp(transition.startParams.delta, transition.targetParams.delta, progress),
        ampA: lerp(transition.startParams.ampA, transition.targetParams.ampA, progress),
        ampB: lerp(transition.startParams.ampB, transition.targetParams.ampB, progress),
        speed: lerp(transition.startParams.speed, transition.targetParams.speed, progress)
    };
}

// Linear interpolation helper
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Animation update function for Lissajous curves
function updateLissajousAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.line) return;
    
    const positions = animationObjects.positions;
    const secondaryPositions = animationObjects.secondaryPositions;
    const tertiaryPositions = animationObjects.tertiaryPositions;
    const pointCount = animationObjects.pointCount;
    const geometry = animationObjects.geometry;
    const secondaryGeometry = animationObjects.secondaryGeometry;
    const tertiaryGeometry = animationObjects.tertiaryGeometry;

    // Get current parameters (either from sliders or from transition blend)
    const params = getCurrentLissajousParameters(elapsedTime);
    const freqA = params.freqA;
    const freqB = params.freqB;
    const delta = params.delta;
    const ampA = params.ampA;
    const ampB = params.ampB;
    const speed = params.speed;

    // Animate color based on time and parameters
    const hueShift = (Math.sin(elapsedTime * 0.1) * 0.1) + (freqA / freqB) * 0.1;
    const newHue = (animationObjects.baseHue + hueShift) % 1.0;
    const saturation = 0.8 + Math.sin(elapsedTime * 0.2) * 0.2;
    const lightness = 0.6;
    
    animationObjects.material.color.setHSL(newHue, saturation, lightness);
    
    // Set complementary color for secondary line
    animationObjects.secondaryMaterial.color.setHSL((newHue + 0.5) % 1.0, saturation, lightness);
    
    // Set triadic color for tertiary line
    animationObjects.tertiaryMaterial.color.setHSL((newHue + 0.33) % 1.0, saturation * 0.8, lightness * 0.7);

    const maxT = elapsedTime * speed; // How far along the curve to draw
    const tStep = (Math.PI * 2 * Math.max(freqA, freqB)) / (pointCount - 1); // Time step to cover full cycle range over points

    let drawnPoints = 0;
    for (let i = 0; i < pointCount; i++) {
        const t = i * tStep; // Parameter t for the curve point

        if (t <= maxT) { // Only calculate points up to the current time
            const i3 = i * 3;
            
            // Main line - standard Lissajous
            positions[i3 + 0] = ampA * Math.sin(freqA * t + delta); // X
            positions[i3 + 1] = ampB * Math.sin(freqB * t);         // Y
            
            // Add slight Z variation for visual interest
            positions[i3 + 2] = Math.sin(t * 0.5) * 0.5;           // Z (subtle variation)
            
            // Secondary line - offset phase for trailing effect
            const offset = Math.PI / 4; // 45-degree phase offset
            secondaryPositions[i3 + 0] = ampA * 0.8 * Math.sin(freqA * t + delta + offset); 
            secondaryPositions[i3 + 1] = ampB * 0.8 * Math.sin(freqB * t + offset);
            secondaryPositions[i3 + 2] = -positions[i3 + 2] * 0.5; // Inverse Z for contrast
            
            // Tertiary line - more complex pattern
            const tertOffset = Math.PI / 3; // 60-degree phase offset
            tertiaryPositions[i3 + 0] = ampA * 0.6 * Math.sin(freqA * 1.5 * t + delta + tertOffset);
            tertiaryPositions[i3 + 1] = ampB * 0.6 * Math.sin(freqB * 0.75 * t + tertOffset);
            tertiaryPositions[i3 + 2] = Math.cos(t * 0.3) * 0.8; // Different Z pattern
            
            drawnPoints = i + 1;
        } else {
            // Optimization: if we passed maxT, remaining points are not drawn yet
            break;
        }
    }

    geometry.setDrawRange(0, drawnPoints); // Update draw range to show only calculated points
    geometry.attributes.position.needsUpdate = true;
    
    secondaryGeometry.setDrawRange(0, drawnPoints);
    secondaryGeometry.attributes.position.needsUpdate = true;
    
    tertiaryGeometry.setDrawRange(0, drawnPoints);
    tertiaryGeometry.attributes.position.needsUpdate = true;
    
    // Add dynamic rotation effects to the entire group
    const group = animationObjects.lissajousGroup;
    
    // Create a breathing effect that reacts to the parameters
    const breathingAmount = Math.sin(elapsedTime * 0.2) * 0.1;
    const parameterRatio = freqA / freqB;
    group.scale.set(
        1.0 + breathingAmount,
        1.0 + breathingAmount,
        1.0 + breathingAmount * 2
    );
    
    // Rotation effects based on parameters and time
    group.rotation.x = Math.sin(elapsedTime * 0.05) * 0.1;
    group.rotation.y = Math.cos(elapsedTime * 0.07) * 0.1;
    group.rotation.z = Math.sin(elapsedTime * 0.1) * 0.05 + (delta / (Math.PI * 2)) * 0.05;
}