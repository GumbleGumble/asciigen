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
    const pointCount = Number.parseInt(lissajousControls.sliderPoints.value);
    // lissajousControls.valuePoints.textContent = pointCount; // Handled by script.js listener/updateAllValueDisplays
    const positions = new Float32Array(pointCount * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Initialize positions (can be all zero initially)
    for (let i = 0; i < pointCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
    }
    geometry.attributes.position.needsUpdate = true;
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

    const secondaryColor = new THREE.Color().setHSL((hue + 0.5) % 1.0, 0.8, 0.6);
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

    const tertiaryColor = new THREE.Color().setHSL((hue + 0.33) % 1.0, 0.9, 0.4);
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
    animationObjects.positions = positions;
    animationObjects.pointCount = pointCount;
    animationObjects.baseHue = hue;
    animationObjects.secondaryLine = secondaryLine;
    animationObjects.secondaryGeometry = secondaryGeometry;
    animationObjects.secondaryMaterial = secondaryMaterial;
    animationObjects.secondaryPositions = secondaryPositions;
    animationObjects.tertiaryLine = tertiaryLine;
    animationObjects.tertiaryGeometry = tertiaryGeometry;
    animationObjects.tertiaryMaterial = tertiaryMaterial;
    animationObjects.tertiaryPositions = tertiaryPositions;
    animationObjects.lissajousGroup = lissajousGroup;
    // Transition state (optional, for smooth parameter changes)
    animationObjects.transitionState = {
        active: false,
        duration: 1.0,
        startTime: 0,
        startParams: {},
        targetParams: {}
    };
    animationObjects.drawCount = 0; // Track how many points are currently drawn

    scene.add(lissajousGroup);

    // Add listeners for parameter changes - Handled centrally in script.js
    // const ljSliders = [ ... ];
    // for (const slider of ljSliders) { ... }

    // Initial update for labels - Handled by script.js updateAllValueDisplays
    handleLissajousParamChange(); // Call once to set initial derived values if any
}

// Cleanup function for Lissajous animation
function cleanupLissajousAnimation() {
    // Remove event listeners (handled centrally in script.js)
    // ...

    // Remove objects from scene
    if (animationObjects.lissajousGroup) {
        scene.remove(animationObjects.lissajousGroup);
    }

    // Dispose of geometries and materials
    if (animationObjects.geometry) { animationObjects.geometry.dispose(); }
    if (animationObjects.material) { animationObjects.material.dispose(); }
    if (animationObjects.secondaryGeometry) { animationObjects.secondaryGeometry.dispose(); }
    if (animationObjects.secondaryMaterial) { animationObjects.secondaryMaterial.dispose(); }
    if (animationObjects.tertiaryGeometry) { animationObjects.tertiaryGeometry.dispose(); }
    if (animationObjects.tertiaryMaterial) { animationObjects.tertiaryMaterial.dispose(); }

    // Clear references in animationObjects
    animationObjects.line = null;
    animationObjects.geometry = null;
    // ... (clear all other properties added in setup)
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
    animationObjects.transitionState = null;
    animationObjects.drawCount = null;
}


// Handler for Lissajous parameter changes
function handleLissajousParamChange() {
    // Ensure this runs only for the lissajous animation and objects exist
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'lissajous' || !animationObjects.line) {
        return; // Exit if not the active animation or not set up
    }

    // Update labels (This should ideally be done by the central script.js listener)
    // We keep it here as a fallback or if the module needs immediate access to formatted values
    lissajousControls.valueA.textContent = lissajousControls.sliderA.value;
    lissajousControls.valueB.textContent = lissajousControls.sliderB.value;
    const deltaVal = Number.parseFloat(lissajousControls.sliderDelta.value);
    lissajousControls.valueDelta.textContent = `${(deltaVal / Math.PI).toFixed(2)} PI`;
    lissajousControls.valueAmpA.textContent = Number.parseFloat(lissajousControls.sliderAmpA.value).toFixed(1);
    lissajousControls.valueAmpB.textContent = Number.parseFloat(lissajousControls.sliderAmpB.value).toFixed(1);
    lissajousControls.valuePoints.textContent = lissajousControls.sliderPoints.value;
    if (uiElements.lissajousSpeedValue) { // Check if element exists
        uiElements.lissajousSpeedValue.textContent = Number.parseFloat(lissajousControls.sliderSpeed.value).toFixed(1);
    }


    // Recreate geometry ONLY if point count changes significantly
    const newPointCount = Number.parseInt(lissajousControls.sliderPoints.value);
    if (animationObjects.pointCount !== undefined && newPointCount !== animationObjects.pointCount && animationObjects.line) {
        console.log("Lissajous point count changed, recreating...");
        // Store current parameters before cleanup if needed for transition
        cleanupLissajousAnimation();
        setupLissajousAnimation(); // Recreate everything
        return; // Exit after recreation
    }
    // Other parameters (frequency, amplitude, phase, speed) are handled directly in the animate loop or transition
}

// Function to gradually transition between parameter sets (Optional)
function startLissajousTransition(targetParams) {
    if (!animationObjects.transitionState || !clock) {
        console.warn("Transition state or clock not available for Lissajous transition.");
        return; // Exit if state or clock is missing
    }
    // Start a transition between current parameters and new ones
    const transition = animationObjects.transitionState;
    transition.active = true;
    transition.startTime = clock.getElapsedTime();
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
        freqA: Math.floor(Math.random() * 9 + 1), // Integer frequencies often look better
        freqB: Math.floor(Math.random() * 9 + 1),
        delta: Math.random() * Math.PI * 2,
        ampA: Math.random() * 3 + 1,
        ampB: Math.random() * 3 + 1,
        speed: Math.random() * 3 + 0.5
    };

    // Update sliders directly
    lissajousControls.sliderA.value = targetParams.freqA;
    lissajousControls.sliderB.value = targetParams.freqB;
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
    ];
    for (const slider of ljSliders) {
        if (slider) slider.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Optional: Start a smooth transition instead of snapping
    // startLissajousTransition(targetParams);
}


// Get current parameters with transition blending if active
function getCurrentLissajousParameters(elapsedTime) {
    const transition = animationObjects.transitionState;

    // Default to current slider values
    let params = {
        freqA: Number.parseFloat(lissajousControls.sliderA.value),
        freqB: Number.parseFloat(lissajousControls.sliderB.value),
        delta: Number.parseFloat(lissajousControls.sliderDelta.value),
        ampA: Number.parseFloat(lissajousControls.sliderAmpA.value),
        ampB: Number.parseFloat(lissajousControls.sliderAmpB.value),
        speed: Number.parseFloat(lissajousControls.sliderSpeed.value)
    };

    if (transition?.active && transition.startParams && transition.targetParams) {
        const timeSinceStart = elapsedTime - transition.startTime;
        let t = Math.min(1.0, timeSinceStart / transition.duration); // Normalized time 0-1
        t = t * t * (3.0 - 2.0 * t); // Smoothstep interpolation

        // Interpolate each parameter
        params.freqA = lerp(transition.startParams.freqA, transition.targetParams.freqA, t);
        params.freqB = lerp(transition.startParams.freqB, transition.targetParams.freqB, t);
        params.delta = lerp(transition.startParams.delta, transition.targetParams.delta, t);
        params.ampA = lerp(transition.startParams.ampA, transition.targetParams.ampA, t);
        params.ampB = lerp(transition.startParams.ampB, transition.targetParams.ampB, t);
        params.speed = lerp(transition.startParams.speed, transition.targetParams.speed, t);

        // Deactivate transition when done
        if (t >= 1.0) {
            transition.active = false;
            // Optionally update sliders to match final target values
            // lissajousControls.sliderA.value = Math.round(params.freqA);
            // ... etc ...
            // handleLissajousParamChange(); // Update labels if sliders changed
        }
    }
    return params;
}

// Linear interpolation helper
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}

// Animation update function for Lissajous
function updateLissajousAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.line || !animationObjects.positions || !clock) return;

    const params = getCurrentLissajousParameters(elapsedTime); // Get potentially transitioning params
    const positions = animationObjects.positions;
    const secondaryPositions = animationObjects.secondaryPositions;
    const tertiaryPositions = animationObjects.tertiaryPositions;
    const pointCount = animationObjects.pointCount;
    const geometry = animationObjects.geometry;
    const secondaryGeometry = animationObjects.secondaryGeometry;
    const tertiaryGeometry = animationObjects.tertiaryGeometry;

    const freqA = params.freqA;
    const freqB = params.freqB;
    const delta = params.delta;
    const ampA = params.ampA;
    const ampB = params.ampB;
    const speed = params.speed;

    // Calculate how many points to draw based on elapsed time and speed
    // This creates the drawing effect
    const pointsToDraw = Math.min(pointCount, Math.floor(elapsedTime * speed * 100)); // Adjust multiplier for drawing speed
    animationObjects.drawCount = pointsToDraw;

    // Update positions for the visible part of the curve
    for (let i = 0; i < pointsToDraw; i++) {
        const t = (i / (pointCount - 1)) * Math.PI * 2 * Math.max(freqA, freqB); // Parameter t for curve calculation
        const i3 = i * 3;

        // Main line
        positions[i3] = ampA * Math.sin(freqA * t + delta);
        positions[i3 + 1] = ampB * Math.sin(freqB * t);
        positions[i3 + 2] = 0; // Keep it 2D for now

        // Secondary line (e.g., slightly offset in time or parameters)
        const tOffset1 = t - 0.1 / speed; // Small time offset
        secondaryPositions[i3] = ampA * Math.sin(freqA * tOffset1 + delta);
        secondaryPositions[i3 + 1] = ampB * Math.sin(freqB * tOffset1);
        secondaryPositions[i3 + 2] = 0;

        // Tertiary line (e.g., different offset)
        const tOffset2 = t - 0.2 / speed; // Larger time offset
        tertiaryPositions[i3] = ampA * Math.sin(freqA * tOffset2 + delta);
        tertiaryPositions[i3 + 1] = ampB * Math.sin(freqB * tOffset2);
        tertiaryPositions[i3 + 2] = 0;
    }

    // Update buffer attributes
    geometry.attributes.position.needsUpdate = true;
    secondaryGeometry.attributes.position.needsUpdate = true;
    tertiaryGeometry.attributes.position.needsUpdate = true;

    // Update draw range to reveal the curve
    geometry.setDrawRange(0, pointsToDraw);
    secondaryGeometry.setDrawRange(0, pointsToDraw);
    tertiaryGeometry.setDrawRange(0, pointsToDraw);

    // Optional: Update line color hue based on time
    const hueShift = (elapsedTime * 0.05) % 1.0;
    animationObjects.material.color.setHSL((animationObjects.baseHue + hueShift) % 1.0, 1, 0.5);
    animationObjects.secondaryMaterial.color.setHSL((animationObjects.baseHue + 0.5 + hueShift) % 1.0, 0.8, 0.6);
    animationObjects.tertiaryMaterial.color.setHSL((animationObjects.baseHue + 0.33 + hueShift) % 1.0, 0.9, 0.4);
}