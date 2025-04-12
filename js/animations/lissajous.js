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
    console.log("Setting up Lissajous animation"); // Add log
    // Ensure controls exist
    if (!lissajousControls || !lissajousControls.sliderPoints || !lissajousControls.sliderA || !lissajousControls.sliderB || !lissajousControls.sliderDelta || !lissajousControls.sliderAmpA || !lissajousControls.sliderAmpB || !lissajousControls.sliderSpeed) {
        console.error("Lissajous controls not found!");
        return;
    }

    const pointCount = Number.parseInt(lissajousControls.sliderPoints.value);
    const positions = new Float32Array(pointCount * 3);
    const colors = new Float32Array(pointCount * 3); // Add colors array
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); // Add color attribute

    // Initialize positions and colors (all black/transparent initially)
    for (let i = 0; i < pointCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        colors[i * 3] = 0; // R
        colors[i * 3 + 1] = 0; // G
        colors[i * 3 + 2] = 0; // B
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    // Don't set draw range, we draw all points but fade them

    // Create a color based on time of day for visual interest
    const now = new Date();
    const hue = (now.getHours() % 12) / 12;
    // const startColor = new THREE.Color().setHSL(hue, 1, 0.5); // Color is per-vertex

    // Material now uses vertex colors
    const material = new THREE.LineBasicMaterial({
        // color: startColor, // Color is now per-vertex
        vertexColors: true, // Enable vertex colors
        linewidth: 2
    });

    // Remove secondary/tertiary lines for simplicity with fading trail
    // const secondaryPositions = ...
    // const secondaryGeometry = ...
    // const secondaryMaterial = ...
    // const tertiaryPositions = ...
    // const tertiaryGeometry = ...
    // const tertiaryMaterial = ...

    const line = new THREE.Line(geometry, material);
    line.name = "lissajousLine";

    // Remove group if only one line
    // const lissajousGroup = new THREE.Group();
    // lissajousGroup.name = "lissajousGroup";
    // lissajousGroup.add(line);
    // lissajousGroup.add(secondaryLine);
    // lissajousGroup.add(tertiaryLine);

    animationObjects.line = line;
    animationObjects.geometry = geometry;
    animationObjects.material = material;
    animationObjects.positions = positions;
    animationObjects.colors = colors; // Store colors array
    animationObjects.pointCount = pointCount;
    animationObjects.baseHue = hue;
    animationObjects.currentPointIndex = 0; // Track the current "head" of the line
    // Remove secondary/tertiary objects
    // animationObjects.secondaryLine = ...
    // ...
    // animationObjects.lissajousGroup = lissajousGroup;
    // ... transition state ...
    // animationObjects.drawCount = 0; // No longer needed

    scene.add(line); // Add line directly

    // Add listeners for parameter changes - Handled centrally in script.js
    // const ljSliders = [ ... ];
    // for (const slider of ljSliders) { ... }

    // Initial update for labels - Handled by script.js updateAllValueDisplays
    // handleLissajousParamChange(); // Call once to set initial derived values if any - No longer needed here
    updateAllValueDisplays(); // Ensure script.js updates labels after setup
}

// Cleanup function for Lissajous animation
function cleanupLissajousAnimation() {
    console.log("Cleaning up Lissajous animation"); // Add log
    // Remove event listeners (handled centrally in script.js)
    // ...

    // Remove object from scene
    if (animationObjects.line) {
        scene.remove(animationObjects.line);
    }
    // Remove group if it exists
    // if (animationObjects.lissajousGroup) {
    //     scene.remove(animationObjects.lissajousGroup);
    // }

    // Dispose of geometry and material
    if (animationObjects.geometry?.dispose) { animationObjects.geometry.dispose(); }
    if (animationObjects.material?.dispose) { animationObjects.material.dispose(); }
    // Dispose secondary/tertiary if they existed
    // ...

    // Clear references in animationObjects
    animationObjects.line = null;
    animationObjects.geometry = null;
    animationObjects.material = null;
    animationObjects.positions = null;
    animationObjects.colors = null; // Clear colors
    animationObjects.pointCount = null;
    animationObjects.baseHue = null;
    animationObjects.currentPointIndex = null; // Clear index
    // Clear secondary/tertiary
    // ...
    // animationObjects.lissajousGroup = null;
    // ...
}


// Handler for Lissajous parameter changes
function handleLissajousParamChange() {
    // Ensure this runs only for the lissajous animation and objects exist
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'lissajous' || !animationObjects.line) {
        return; // Exit if not the active animation or not set up
    }
    // Ensure controls exist before accessing them
    if (!lissajousControls || !lissajousControls.sliderPoints || !lissajousControls.sliderA || !lissajousControls.sliderB || !lissajousControls.sliderDelta || !lissajousControls.sliderAmpA || !lissajousControls.sliderAmpB || !lissajousControls.sliderSpeed /*|| !lissajousControls.valueA*/) { // Remove check for valueA as it's updated by script.js
        console.warn("Lissajous controls missing in handleLissajousParamChange.");
        return;
    }


    // Update labels directly here as script.js listener calls this - REMOVED
    // lissajousControls.valueA.textContent = lissajousControls.sliderA.value;
    // lissajousControls.valueB.textContent = lissajousControls.sliderB.value;
    // const deltaVal = Number.parseFloat(lissajousControls.sliderDelta.value);
    // lissajousControls.valueDelta.textContent = `${(deltaVal / Math.PI).toFixed(2)} PI`;
    // lissajousControls.valueAmpA.textContent = Number.parseFloat(lissajousControls.sliderAmpA.value).toFixed(1);
    // lissajousControls.valueAmpB.textContent = Number.parseFloat(lissajousControls.sliderAmpB.value).toFixed(1);
    // lissajousControls.valuePoints.textContent = lissajousControls.sliderPoints.value;
    // // Check if speed value element exists
    // if (uiElements.lissajousSpeedValue) {
    //     uiElements.lissajousSpeedValue.textContent = Number.parseFloat(lissajousControls.sliderSpeed.value).toFixed(1);
    // }


    // Recreate geometry ONLY if point count changes
    const newPointCount = Number.parseInt(lissajousControls.sliderPoints.value);
    // Check if pointCount was stored during setup and if it differs
    if (animationObjects.pointCount !== undefined && newPointCount !== animationObjects.pointCount) {
        console.log("Lissajous point count changed, recreating...");
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
    console.log("Randomizing Lissajous parameters"); // Add log
    // Ensure controls exist
    if (!lissajousControls || !lissajousControls.sliderPoints || !lissajousControls.sliderA || !lissajousControls.sliderB || !lissajousControls.sliderDelta || !lissajousControls.sliderAmpA || !lissajousControls.sliderAmpB || !lissajousControls.sliderSpeed) {
        console.error("Lissajous controls not found for randomization!");
        return;
    }
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

    // Trigger input events AFTER setting all values to update labels and potentially start transition
    const ljSliders = [
        lissajousControls.sliderA,
        lissajousControls.sliderB,
        lissajousControls.sliderDelta,
        lissajousControls.sliderAmpA,
        lissajousControls.sliderAmpB,
        lissajousControls.sliderSpeed,
        // lissajousControls.sliderPoints // Include if point count is randomized
    ];
    for (const slider of ljSliders) {
        if (slider) slider.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Optional: Start a smooth transition instead of snapping
    // startLissajousTransition(targetParams);

    // Explicitly call handler to ensure labels/state are correct immediately after randomization - No longer needed here
    // handleLissajousParamChange();
    // script.js's updateAllValueDisplays will handle labels after the events are dispatched.
}


// Get current parameters with transition blending if active
function getCurrentLissajousParameters(elapsedTime) {
    const transition = animationObjects.transitionState;

    // Default to current slider values
    const params = { // Use const
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
    if (!animationObjects.line || !animationObjects.positions || !animationObjects.colors || !clock || !animationObjects.pointCount) return;

    const dt = Math.min(deltaTime, 0.05); // Clamp delta time

    const params = getCurrentLissajousParameters(elapsedTime);
    const positions = animationObjects.positions;
    const colors = animationObjects.colors;
    const pointCount = animationObjects.pointCount;
    const geometry = animationObjects.geometry;
    const baseHue = animationObjects.baseHue;
    let currentPointIndex = animationObjects.currentPointIndex;

    // Ensure params are valid numbers
    const freqA = Number.isFinite(params.freqA) ? params.freqA : 1;
    const freqB = Number.isFinite(params.freqB) ? params.freqB : 1;
    const delta = Number.isFinite(params.delta) ? params.delta : 0;
    const ampA = Number.isFinite(params.ampA) ? params.ampA : 3;
    const ampB = Number.isFinite(params.ampB) ? params.ampB : 3;
    const speed = Number.isFinite(params.speed) ? params.speed : 1;

    // Calculate how many new points to add this frame based on speed and dt
    // Adjust multiplier based on desired trail length and speed perception
    const pointsPerSecondBase = 100; // Base number of points added per second at speed = 1
    const pointsToAdd = Math.max(1, Math.floor(dt * speed * pointsPerSecondBase));

    const tempColor = new THREE.Color(); // Reuse color object
    const hueShiftSpeed = 0.03; // Slow hue shift over time

    for (let k = 0; k < pointsToAdd; k++) {
        // Calculate the parameter 't' for the Lissajous curve based on the current index
        // We wrap around the buffer cyclically
        const tParam = (currentPointIndex / (pointCount - 1));
        const tRange = Math.PI * 2 * Math.max(1, Math.max(freqA, freqB)); // Ensure full curve is drawn over pointCount
        const t = tParam * tRange; // Use index to determine position on the curve

        const i3 = currentPointIndex * 3;

        // Calculate new position
        positions[i3] = ampA * Math.sin(freqA * t + delta);
        positions[i3 + 1] = ampB * Math.sin(freqB * t);
        // Add subtle Z oscillation based on curve parameter 't' and elapsedTime
        positions[i3 + 2] = Math.sin(t * 0.5 + elapsedTime * 0.2) * 0.5;

        // Set the color of the new point to full brightness (e.g., based on hue)
        const currentHue = (baseHue + (elapsedTime * hueShiftSpeed)) % 1.0; // Slowly shift base hue
        tempColor.setHSL(currentHue, 1, 0.6); // Slightly brighter base lightness
        colors[i3] = tempColor.r;
        colors[i3 + 1] = tempColor.g;
        colors[i3 + 2] = tempColor.b;

        // Move to the next point index, wrapping around
        currentPointIndex = (currentPointIndex + 1) % pointCount;
    }

    // Fade out older points
    // Adjust fadeRate: higher value = faster fade, shorter trail
    const fadeRate = dt * 2.0; // Experiment with this value (e.g., 1.0, 1.5, 2.0, 3.0)
    for (let i = 0; i < pointCount; i++) {
        const i3 = i * 3;
        // Check if this point was just added - skip fading if so (optional optimization)
        let justAdded = false;
        let checkIndex = (currentPointIndex - 1 + pointCount) % pointCount; // Start from the last added point
        for (let k = 0; k < pointsToAdd; k++) {
            if (i === checkIndex) {
                justAdded = true;
                break;
            }
            checkIndex = (checkIndex - 1 + pointCount) % pointCount; // Move backwards
        }
        if (justAdded) continue;

        // Reduce color components towards black
        colors[i3] = Math.max(0, colors[i3] - fadeRate);
        colors[i3 + 1] = Math.max(0, colors[i3 + 1] - fadeRate);
        colors[i3 + 2] = Math.max(0, colors[i3 + 2] - fadeRate);
    }

    // Store the updated index
    animationObjects.currentPointIndex = currentPointIndex;

    // Update buffer attributes
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;

    // No need to set draw range anymore
    // geometry.setDrawRange(0, currentDrawCount);
}