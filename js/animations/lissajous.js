// filepath: /Users/chase/Library/Mobile Documents/com~apple~CloudDocs/-Projects/Personal Projects/Dev Projects/JS Projects/Ascii v2/js/animations/lissajous.js
// Lissajous Curves Animation Module
window.LISSAJOUS_ANIMATION = {
    setup: () => { // Use arrow function
        setupLissajousAnimation();
    },
    update: (deltaTime, elapsedTime) => { // Use arrow function
        updateLissajousAnimation(deltaTime, elapsedTime);
    },
    cleanup: () => { // Use arrow function
        // Remove any event listeners when switching to another animation
        cleanupLissajousAnimation();
    },
    randomize: () => { // Use arrow function
        // Randomize parameters for interesting variations
        randomizeLissajousParameters();
    },
    handleParamChange: () => { // Add handleParamChange to the exported object
        handleLissajousParamChange();
    }
};

// Lissajous Curves Animation
function setupLissajousAnimation() {
    const pointCount = Number.parseInt(lissajousControls.sliderPoints.value); // Use Number.parseInt
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
    animationObjects.positions = positions; // Store buffer reference
    animationObjects.pointCount = pointCount; // Store point count
    animationObjects.baseHue = hue; // Store base hue for dynamic color changes

    animationObjects.secondaryLine = secondaryLine;
    animationObjects.secondaryGeometry = secondaryGeometry;
    animationObjects.secondaryMaterial = secondaryMaterial;
    animationObjects.secondaryPositions = secondaryPositions; // Store buffer reference

    animationObjects.tertiaryLine = tertiaryLine;
    animationObjects.tertiaryGeometry = tertiaryGeometry;
    animationObjects.tertiaryMaterial = tertiaryMaterial;
    animationObjects.tertiaryPositions = tertiaryPositions; // Store buffer reference

    animationObjects.lissajousGroup = lissajousGroup; // Store group reference

    // Transition state (optional, for smooth parameter changes)
    animationObjects.transitionState = {
        active: false,
        duration: 1.0, // seconds
        startTime: 0,
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

    // Use for...of loop
    for (const slider of ljSliders) {
        slider.removeEventListener('input', handleLissajousParamChange); // Prevent duplicates
        slider.addEventListener('input', handleLissajousParamChange);
    }

    // Initial update for labels
    handleLissajousParamChange(); // Call once to set initial labels
}

// Cleanup function for Lissajous animation
function cleanupLissajousAnimation() {
    // Remove event listeners (handled centrally in script.js)
    // const ljSliders = [
    //     lissajousControls.sliderA,
    //     lissajousControls.sliderB,
    //     lissajousControls.sliderDelta,
    //     lissajousControls.sliderAmpA,
    //     lissajousControls.sliderAmpB,
    //     lissajousControls.sliderPoints,
    //     lissajousControls.sliderSpeed
    // ];
    // for (const slider of ljSliders) {
    //     slider.removeEventListener('input', handleLissajousParamChange); // Use updated name
    // }

    // Remove objects from scene
    if (animationObjects.lissajousGroup) {
        scene.remove(animationObjects.lissajousGroup);
    }

    // Dispose of geometries and materials
    if (animationObjects.geometry) {
        animationObjects.geometry.dispose();
    }
    if (animationObjects.material) {
        animationObjects.material.dispose();
    }
    if (animationObjects.secondaryGeometry) {
        animationObjects.secondaryGeometry.dispose();
    }
    if (animationObjects.secondaryMaterial) {
        animationObjects.secondaryMaterial.dispose();
    }
    if (animationObjects.tertiaryGeometry) {
        animationObjects.tertiaryGeometry.dispose();
    }
    if (animationObjects.tertiaryMaterial) {
        animationObjects.tertiaryMaterial.dispose();
    }

    // Clear references in animationObjects
    animationObjects.line = null;
    animationObjects.geometry = null;
    animationObjects.material = null;
    animationObjects.positions = null;
    animationObjects.pointCount = null;
    animationObjects.baseHue = null;
    animationObjects.secondaryLine = null;
    animationObjects.secondaryGeometry = null;
    animationObjects.secondaryMaterial = null;
    animationObjects.secondaryPositions = null;
    animationObjects.tertiaryLine = null;
    animationObjects.tertiaryGeometry = null;
    animationObjects.tertiaryMaterial = null;
    animationObjects.tertiaryPositions = null;
    animationObjects.lissajousGroup = null;
    animationObjects.transitionState = null; // Clear transition state
}


// Handler for Lissajous parameter changes
function handleLissajousParamChange() {
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'lissajous') return; // Use currentAnimationType from script.js

    // Update labels
    lissajousControls.valueA.textContent = lissajousControls.sliderA.value;
    lissajousControls.valueB.textContent = lissajousControls.sliderB.value;
    // Use template literal and Number.parseFloat
    lissajousControls.valueDelta.textContent = `${(Number.parseFloat(lissajousControls.sliderDelta.value)/Math.PI).toFixed(2)} PI`;
    lissajousControls.valueAmpA.textContent = Number.parseFloat(lissajousControls.sliderAmpA.value).toFixed(1); // Use Number.parseFloat
    lissajousControls.valueAmpB.textContent = Number.parseFloat(lissajousControls.sliderAmpB.value).toFixed(1); // Use Number.parseFloat
    lissajousControls.valuePoints.textContent = lissajousControls.sliderPoints.value;
    if (uiElements.lissajousSpeedValue) { // Check if speed value element exists
        uiElements.lissajousSpeedValue.textContent = Number.parseFloat(lissajousControls.sliderSpeed.value).toFixed(1);
    }

    // Recreate geometry ONLY if point count changes significantly
    const newPointCount = Number.parseInt(lissajousControls.sliderPoints.value); // Use Number.parseInt
    if (animationObjects.pointCount !== undefined && newPointCount !== animationObjects.pointCount && animationObjects.line) {
        console.log("Lissajous point count changed, recreating...");
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

        // Update line objects with new geometries
        animationObjects.line.geometry = newGeometry;
        animationObjects.secondaryLine.geometry = newSecondaryGeometry;
        animationObjects.tertiaryLine.geometry = newTertiaryGeometry;

        // Update references in animationObjects
        animationObjects.geometry = newGeometry;
        animationObjects.positions = newPositions;
        animationObjects.secondaryGeometry = newSecondaryGeometry;
        animationObjects.secondaryPositions = newSecondaryPositions;
        animationObjects.tertiaryGeometry = newTertiaryGeometry;
        animationObjects.tertiaryPositions = newTertiaryPositions;
        animationObjects.pointCount = newPointCount;

        // Re-initialize positions (optional, could be done in update)
        for (let i = 0; i < newPointCount; i++) {
            newPositions[i * 3] = 0; newPositions[i * 3 + 1] = 0; newPositions[i * 3 + 2] = 0;
            newSecondaryPositions[i * 3] = 0; newSecondaryPositions[i * 3 + 1] = 0; newSecondaryPositions[i * 3 + 2] = 0;
            newTertiaryPositions[i * 3] = 0; newTertiaryPositions[i * 3 + 1] = 0; newTertiaryPositions[i * 3 + 2] = 0;
        }
        newGeometry.attributes.position.needsUpdate = true;
        newSecondaryGeometry.attributes.position.needsUpdate = true;
        newTertiaryGeometry.attributes.position.needsUpdate = true;
    }
    // Other parameters (frequency, amplitude, phase, speed) are handled directly in the animate loop or transition
}

// Function to gradually transition between parameter sets (Optional)
function startLissajousTransition(targetParams) {
    if (!animationObjects.transitionState || !clock) return; // Ensure state and clock exist
    // Start a transition between current parameters and new ones
    const transition = animationObjects.transitionState;
    transition.active = true;
    transition.startTime = clock.getElapsedTime(); // Use clock from script.js

    // Store current parameters as start values
    transition.startParams = {
        freqA: Number.parseFloat(lissajousControls.sliderA.value),
        freqB: Number.parseFloat(lissajousControls.sliderB.value),
        delta: Number.parseFloat(lissajousControls.sliderDelta.value),
        ampA: Number.parseFloat(lissajousControls.sliderAmpA.value),
        ampB: Number.parseFloat(lissajousControls.sliderAmpB.value),
        speed: Number.parseFloat(lissajousControls.sliderSpeed.value)
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

    // Update sliders directly
    lissajousControls.sliderA.value = Math.round(targetParams.freqA);
    lissajousControls.sliderB.value = Math.round(targetParams.freqB);
    lissajousControls.sliderDelta.value = targetParams.delta.toFixed(5);
    lissajousControls.sliderAmpA.value = targetParams.ampA.toFixed(1);
    lissajousControls.sliderAmpB.value = targetParams.ampB.toFixed(1);
    lissajousControls.sliderSpeed.value = targetParams.speed.toFixed(1);
    // Don't randomize point count by default, can be disruptive
    // lissajousControls.sliderPoints.value = ...;

    // Trigger input events to update labels and potentially start transition
    const ljSliders = [
        lissajousControls.sliderA,
        lissajousControls.sliderB,
        lissajousControls.sliderDelta,
        lissajousControls.sliderAmpA,
        lissajousControls.sliderAmpB,
        lissajousControls.sliderSpeed,
        // lissajousControls.sliderPoints // Don't trigger for points here
    ];
    for (const slider of ljSliders) {
        slider.dispatchEvent(new Event("input", { bubbles: true }));
    }

    // Optional: Start a smooth transition instead of snapping
    // startLissajousTransition(targetParams);
}


// Get current parameters with transition blending if active
function getCurrentLissajousParameters(elapsedTime) {
    const transition = animationObjects.transitionState;
    let currentParams = {
        freqA: Number.parseFloat(lissajousControls.sliderA.value),
        freqB: Number.parseFloat(lissajousControls.sliderB.value),
        delta: Number.parseFloat(lissajousControls.sliderDelta.value),
        ampA: Number.parseFloat(lissajousControls.sliderAmpA.value),
        ampB: Number.parseFloat(lissajousControls.sliderAmpB.value),
        speed: Number.parseFloat(lissajousControls.sliderSpeed.value)
    };

    // Use optional chaining here
    if (transition?.active && clock) { // Check if transition and clock exist
        const timeElapsed = elapsedTime - transition.startTime;
        let t = timeElapsed / transition.duration;

        if (t >= 1.0) {
            t = 1.0;
            transition.active = false; // End transition
            currentParams = transition.targetParams; // Snap to target
        } else {
            // Apply easing (e.g., smoothstep)
            t = t * t * (3 - 2 * t);
            // Interpolate each parameter
            currentParams.freqA = lerp(transition.startParams.freqA, transition.targetParams.freqA, t);
            currentParams.freqB = lerp(transition.startParams.freqB, transition.targetParams.freqB, t);
            currentParams.delta = lerp(transition.startParams.delta, transition.targetParams.delta, t);
            currentParams.ampA = lerp(transition.startParams.ampA, transition.targetParams.ampA, t);
            currentParams.ampB = lerp(transition.startParams.ampB, transition.targetParams.ampB, t);
            currentParams.speed = lerp(transition.startParams.speed, transition.targetParams.speed, t);
        }
    }
    return currentParams;
}

// Linear interpolation helper
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Animation update function for Lissajous
function updateLissajousAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.line || !animationObjects.geometry || !animationObjects.material ||
        !animationObjects.secondaryGeometry || !animationObjects.secondaryMaterial ||
        !animationObjects.tertiaryGeometry || !animationObjects.tertiaryMaterial ||
        !animationObjects.lissajousGroup) {
        return; // Don't run if setup hasn't completed or objects are missing
    }

    const { freqA, freqB, delta, ampA, ampB, speed } = getCurrentLissajousParameters(elapsedTime);
    const positions = animationObjects.positions;
    const secondaryPositions = animationObjects.secondaryPositions;
    const tertiaryPositions = animationObjects.tertiaryPositions;
    const pointCount = animationObjects.pointCount;
    const geometry = animationObjects.geometry;
    const secondaryGeometry = animationObjects.secondaryGeometry;
    const tertiaryGeometry = animationObjects.tertiaryGeometry;

    // Dynamic color changes based on parameters and time
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
    // Calculate tStep based on current frequencies to ensure full curve is drawn over pointCount
    const tStep = (Math.PI * 2 * Math.max(freqA, freqB)) / (pointCount - 1);

    let drawnPoints = 0;
    for (let i = 0; i < pointCount; i++) {
        const t = i * tStep; // Parameter t for the curve point

        if (t <= maxT) { // Only calculate points up to the current time
            const i3 = i * 3;

            // Main line - standard Lissajous
            positions[i3 + 0] = ampA * Math.sin(freqA * t + delta); // X
            positions[i3 + 1] = ampB * Math.sin(freqB * t);         // Y
            // Add slight Z variation for visual interest
            positions[i3 + 2] = Math.sin(t * 0.5) * 0.5 + Math.cos(elapsedTime * 0.1 + t * 0.2) * 0.1; // Z (subtle variation)

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
    group.scale.set(
        1.0 + breathingAmount,
        1.0 + breathingAmount,
        1.0 + breathingAmount
    );
    group.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
    group.rotation.y = Math.cos(elapsedTime * 0.07) * 0.1;
}