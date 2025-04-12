import * as THREE from 'three'; // Assuming THREE is available globally or via import

// --- Global Variables ---
let scene, camera, renderer, clock; // Added Three.js core components
let renderTarget;
let downscaleCanvas;
let downscaleCtx;
let pixelData;
const asciiChars = "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5YxjAdPQSVXNWkHM$@%#&B8"; // Use const
let isPaused = false;
let currentAnimationType = 'torus';
let animationFrameId;
// Removed activeAnimationSetup, activeAnimationUpdate, activeAnimationCleanup - will use module functions directly
let activeControls = [];

const display = document.getElementById('asciiDisplay');
const controlsContainer = document.getElementById('controlsContainer');
const pausePlayButton = document.getElementById('pausePlayButton');
const randomizeButton = document.getElementById('randomizeButton');

// UI Elements Map (Ensure all IDs match index.html)
const uiElements = {
    animationType: document.getElementById('animationType'), // Matches <select id="animation-select"> in main.js version? No, use 'animationType' from previous script.js
    resolution: document.getElementById('resolution-slider'), // Use ID from main.js version
    resolutionValue: document.getElementById('resolution-value'), // Use ID from main.js version
    charset: document.getElementById('charset-select'), // Use ID from main.js version
    brightness: document.getElementById('brightness-slider'), // Use ID from main.js version
    brightnessValue: document.getElementById('brightnessValue'), // This ID doesn't exist in main.js HTML, add if needed or remove logic
    contrast: document.getElementById('contrast-slider'), // Use ID from main.js version
    contrastValue: document.getElementById('contrastValue'), // This ID doesn't exist, add if needed or remove logic
    zoom: document.getElementById('zoom-slider'), // Use ID from main.js version
    zoomValue: document.getElementById('zoomValue'), // This ID doesn't exist, add if needed or remove logic
    invert: document.getElementById('invert-brightness-checkbox'), // Use ID from main.js version
    renderTargetResolution: document.getElementById('renderTargetResolution'),
    renderTargetResolutionValue: document.getElementById('renderTargetResolutionValue'),

    // Torus Controls (Ensure IDs match index.html from main.js version)
    torusControls: document.getElementById('torus-controls'),
    torusSpeed: document.getElementById('torus-speed-slider'), // Use ID from main.js version
    torusSpeedValue: document.getElementById('torusSpeedValue'), // This ID doesn't exist
    torusThickness: document.getElementById('torus-thickness-slider'), // Use ID from main.js version
    torusThicknessValue: document.getElementById('torus-thickness-value'), // Use ID from main.js version
    torusMajorRadius: document.getElementById('torusMajorRadius'),
    torusMajorRadiusValue: document.getElementById('torusMajorRadiusValue'),
    torusRotationAxis: document.getElementById('torusRotationAxis'),

    // Noise Controls (Ensure IDs match index.html from main.js version)
    noiseControls: document.getElementById('noise-controls'),
    noiseScale: document.getElementById('noise-scale-slider'), // Use ID from main.js version
    noiseScaleValue: document.getElementById('noiseScaleValue'), // This ID doesn't exist
    noiseSpeed: document.getElementById('noise-speed-slider'), // Use ID from main.js version
    noiseSpeedValue: document.getElementById('noiseSpeedValue'), // This ID doesn't exist
    noiseBrightness: document.getElementById('noise-brightness-slider'), // Use ID from main.js version
    noiseBrightnessValue: document.getElementById('noiseBrightnessValue'), // This ID doesn't exist

    // Particle Controls (Ensure IDs match index.html from main.js version)
    particleControls: document.getElementById('particles-controls'),
    particleCount: document.getElementById('particles-count-slider'), // Use ID from main.js version
    particleCountValue: document.getElementById('particles-count-value'), // Use ID from main.js version
    particleSize: document.getElementById('particles-size-slider'), // Use ID from main.js version
    particleSizeValue: document.getElementById('particleSizeValue'), // This ID doesn't exist
    particleSpeed: document.getElementById('particles-speed-slider'), // Use ID from main.js version
    particleSpeedValue: document.getElementById('particleSpeedValue'), // This ID doesn't exist
    particleLifespan: document.getElementById('particles-lifespan-slider'), // Use ID from main.js version
    particleLifespanValue: document.getElementById('particleLifespanValue'), // This ID doesn't exist
    emitterShape: document.getElementById('particles-emitter-shape'), // Use ID from main.js version
    emitterSize: document.getElementById('particles-emitter-size-slider'), // Use ID from main.js version
    emitterSizeValue: document.getElementById('emitterSizeValue'), // This ID doesn't exist
    forceType: document.getElementById('particles-force-type'), // Use ID from main.js version
    forceStrength: document.getElementById('particles-force-strength-slider'), // Use ID from main.js version
    forceStrengthValue: document.getElementById('forceStrengthValue'), // This ID doesn't exist

    // Kaleidoscope Controls (Ensure IDs match index.html from main.js version)
    kaleidoscopeControls: document.getElementById('kaleidoscope-controls'),
    kaleidoscopeSegments: document.getElementById('kaleidoscope-segments-slider'), // Use ID from main.js version
    kaleidoscopeSegmentsValue: document.getElementById('kaleidoscope-segments-value'), // Use ID from main.js version
    kaleidoscopeBaseNoiseScale: document.getElementById('kaleidoscope-noise-scale-slider'), // Use ID from main.js version
    kaleidoscopeBaseNoiseScaleValue: document.getElementById('kaleidoscopeBaseNoiseScaleValue'), // This ID doesn't exist
    kaleidoscopeBaseNoiseSpeed: document.getElementById('kaleidoscope-noise-speed-slider'), // Use ID from main.js version
    kaleidoscopeBaseNoiseSpeedValue: document.getElementById('kaleidoscopeBaseNoiseSpeedValue'), // This ID doesn't exist
    kaleidoscopeBaseNoiseBrightness: document.getElementById('kaleidoscope-noise-brightness-slider'), // Use ID from main.js version
    kaleidoscopeBaseNoiseBrightnessValue: document.getElementById('kaleidoscopeBaseNoiseBrightnessValue'), // This ID doesn't exist

    // Morph Controls (Ensure IDs match index.html from main.js version)
    morphControls: document.getElementById('morph-controls'),
    morphSpeed: document.getElementById('morph-speed-slider'), // Use ID from main.js version
    morphSpeedValue: document.getElementById('morphSpeedValue'), // This ID doesn't exist
    morphRotationSpeed: document.getElementById('morph-rotation-slider'), // Use ID from main.js version
    morphRotationSpeedValue: document.getElementById('morphRotationSpeedValue'), // This ID doesn't exist

    // Lissajous Controls (Ensure IDs match index.html from main.js version)
    lissajousControls: document.getElementById('lissajous-controls'),
    lissajousA: document.getElementById('lissajous-a-slider'), // Use ID from main.js version
    lissajousAValue: document.getElementById('lj-a-value'), // Use ID from main.js version
    lissajousB: document.getElementById('lissajous-b-slider'), // Use ID from main.js version
    lissajousBValue: document.getElementById('lj-b-value'), // Use ID from main.js version
    lissajousDelta: document.getElementById('lissajous-delta-slider'), // Use ID from main.js version
    lissajousDeltaValue: document.getElementById('lj-delta-value'), // Use ID from main.js version
    lissajousAmpA: document.getElementById('lissajous-ampA-slider'), // Use ID from main.js version
    lissajousAmpAValue: document.getElementById('lj-ampA-value'), // Use ID from main.js version
    lissajousAmpB: document.getElementById('lissajous-ampB-slider'), // Use ID from main.js version
    lissajousAmpBValue: document.getElementById('lj-ampB-value'), // Use ID from main.js version
    lissajousDrawSpeed: document.getElementById('lissajous-speed-slider'), // Use ID from main.js version ('lissajous-speed-slider')
    lissajousDrawSpeedValue: document.getElementById('lissajousDrawSpeedValue'), // This ID doesn't exist
    lissajousPointCount: document.getElementById('lissajous-points-slider'), // Use ID from main.js version
    lissajousPointCountValue: document.getElementById('lj-points-value'), // Use ID from main.js version
};

// --- Global Animation Objects (used by modules) ---
// This mirrors the structure used in main.js and the animation modules
let animationObjects = {};
const torusControls = { // Match structure expected by torus.js
    sliderSpeed: uiElements.torusSpeed,
    sliderThickness: uiElements.torusThickness,
    valueThickness: uiElements.torusThicknessValue,
};
const noiseControls = { // Match structure expected by noise.js
    sliderScale: uiElements.noiseScale,
    sliderSpeed: uiElements.noiseSpeed,
    sliderBrightness: uiElements.noiseBrightness,
};
const particlesControls = { // Match structure expected by particles.js
    sliderCount: uiElements.particleCount,
    valueCount: uiElements.particleCountValue,
    sliderSize: uiElements.particleSize,
    sliderSpeed: uiElements.particleSpeed,
    sliderLifespan: uiElements.particleLifespan,
    selectEmitterShape: uiElements.emitterShape,
    sliderEmitterSize: uiElements.emitterSize,
    selectForceType: uiElements.forceType,
    sliderForceStrength: uiElements.forceStrength,
};
const kaleidoscopeControls = { // Match structure expected by kaleidoscope.js
    sliderSegments: uiElements.kaleidoscopeSegments,
    valueSegments: uiElements.kaleidoscopeSegmentsValue,
    sliderNoiseScale: uiElements.kaleidoscopeBaseNoiseScale,
    sliderNoiseSpeed: uiElements.kaleidoscopeBaseNoiseSpeed,
    sliderNoiseBrightness: uiElements.kaleidoscopeBaseNoiseBrightness,
};
const morphControls = { // Match structure expected by morph.js
    sliderMorphSpeed: uiElements.morphSpeed, // ID mismatch? main.js uses morph-speed-slider
    sliderRotationSpeed: uiElements.morphRotationSpeed, // ID mismatch? main.js uses morph-rotation-slider
    // sliderComplexity is missing in script.js uiElements but used in morph.js
};
const lissajousControls = { // Match structure expected by lissajous.js
    sliderA: uiElements.lissajousA,
    valueA: uiElements.lissajousAValue,
    sliderB: uiElements.lissajousB,
    valueB: uiElements.lissajousBValue,
    sliderDelta: uiElements.lissajousDelta,
    valueDelta: uiElements.lissajousDeltaValue,
    sliderAmpA: uiElements.lissajousAmpA,
    valueAmpA: uiElements.lissajousAmpAValue,
    sliderAmpB: uiElements.lissajousAmpB,
    valueAmpB: uiElements.lissajousAmpBValue,
    sliderSpeed: uiElements.lissajousDrawSpeed,
    sliderPoints: uiElements.lissajousPointCount,
    valuePoints: uiElements.lissajousPointCountValue,
};
// Metaballs controls need to be added if integrating metaballs.js

// --- Initialization ---

function init() {
    if (!display || !display.clientWidth || !display.clientHeight) {
        console.error("Display area not ready or has zero dimensions.");
        setTimeout(init, 100); // Retry after 100ms
        return;
    }

    // Initialize Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000); // Black background
    clock = new THREE.Clock();

    const aspect = display.clientWidth / display.clientHeight;
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    // Initial zoom setting (can be overridden by animation switch)
    camera.position.z = Number.parseFloat(uiElements.zoom.value) || 15;

    // Renderer setup (use a canvas that's not added to DOM directly)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(512, 512); // Initial fixed internal size, adjust if needed

    // Initial Render Target and Downscale Canvas Setup
    setupRenderTargetAndCanvas(); // Depends on renderer being initialized

    // Event Listeners
    setupEventListeners();

    // Initial UI Update
    updateAllValueDisplays();
    updateUIForAnimationType(currentAnimationType);

    // Start
    switchAnimation(currentAnimationType);
    animate();
}

function setupRenderTargetAndCanvas() {
    if (!renderer) return; // Need renderer to exist

    const scale = Number.parseFloat(uiElements.renderTargetResolution.value);
    // Use renderer's current size as the base for scaling, or a default if not set
    const baseWidth = renderer.domElement.width || 512;
    const baseHeight = renderer.domElement.height || 512;
    const renderWidth = Math.max(1, Math.floor(baseWidth * scale));
    const renderHeight = Math.max(1, Math.floor(baseHeight * scale));

    // Update renderer size (internal buffer)
    renderer.setSize(renderWidth, renderHeight, false); // Don't update style

    // Dispose old render target if it exists
    if (renderTarget) {
        renderTarget.dispose();
    }
    renderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight);

    // Create or update downscale canvas
    if (!downscaleCanvas) {
        downscaleCanvas = document.createElement('canvas');
        // Optional: Append to body for debugging
        // downscaleCanvas.style.position = 'absolute';
        // downscaleCanvas.style.top = '0';
        // downscaleCanvas.style.left = '0';
        // downscaleCanvas.style.border = '1px solid red';
        // document.body.appendChild(downscaleCanvas);
    }

    const asciiWidth = Number.parseInt(uiElements.resolution.value, 10);
    const aspectRatio = renderWidth / renderHeight;
    const asciiHeight = Math.max(1, Math.round(asciiWidth / aspectRatio * 0.6)); // Font aspect ratio correction

    downscaleCanvas.width = asciiWidth;
    downscaleCanvas.height = asciiHeight;
    downscaleCtx = downscaleCanvas.getContext('2d', { willReadFrequently: true });

    // Allocate pixel data buffer
    pixelData = new Uint8ClampedArray(asciiWidth * asciiHeight * 4);

    console.log(`Renderer/RT Size: ${renderWidth}x${renderHeight}, Downscale Canvas: ${asciiWidth}x${asciiHeight}`);

    // Update camera aspect ratio
    if (camera) {
        camera.aspect = renderWidth / renderHeight;
        camera.updateProjectionMatrix();
    }
}


// --- Event Listeners ---

function setupEventListeners() {
    // General Controls
    uiElements.resolution.addEventListener('input', (e) => {
        uiElements.resolutionValue.textContent = e.target.value;
        setupRenderTargetAndCanvas(); // ASCII resolution affects downscale canvas
    });
    uiElements.charset.addEventListener('change', (e) => {
        // Logic to update asciiChars based on selection (if using ASCII_CHARS_MAP from main.js)
        // currentAsciiChars = ASCII_CHARS_MAP[e.target.value] || ASCII_CHARS_MAP['dense'];
        console.log("Charset changed to:", e.target.value); // Placeholder
    });
    uiElements.brightness.addEventListener('input', (e) => {
        // uiElements.brightnessValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // If value display exists
    });
    uiElements.contrast.addEventListener('input', (e) => {
        // uiElements.contrastValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // If value display exists
    });
    uiElements.zoom.addEventListener('input', (e) => {
        // uiElements.zoomValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // If value display exists
        if (camera) {
            camera.position.z = Number.parseFloat(e.target.value);
        }
    });
    uiElements.invert.addEventListener('change', (e) => {
        // Invert logic handled in renderToAscii
    });
    uiElements.renderTargetResolution.addEventListener('input', (e) => {
        uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(e.target.value).toFixed(2);
        setupRenderTargetAndCanvas(); // Recreate render target and canvas
    });

    // Animation Type Change
    uiElements.animationType.addEventListener('change', (e) => {
        switchAnimation(e.target.value);
    });

    // Action Buttons
    pausePlayButton.addEventListener('click', togglePause);
    randomizeButton.addEventListener('click', randomizeParameters);

    // --- Animation Specific Listeners ---
    // These might be handled within the animation modules themselves (like in lissajous.js)
    // If modules don't handle listeners, add them here. Example for Torus:
    uiElements.torusSpeed.addEventListener('input', (e) => {
        // uiElements.torusSpeedValue.textContent = Number.parseFloat(e.target.value).toFixed(3); // If value display exists
        // Value read directly in update loop or handled by module's listener
    });
    uiElements.torusThickness.addEventListener('input', (e) => {
        uiElements.torusThicknessValue.textContent = Number.parseFloat(e.target.value).toFixed(2);
        // This might require restarting the animation or calling a specific handler in the module
        if (window.TORUS_ANIMATION && window.TORUS_ANIMATION.handleThicknessChange) {
            window.TORUS_ANIMATION.handleThicknessChange();
        } else {
            // Fallback: restart animation
            // switchAnimation(currentAnimationType);
        }
    });
    uiElements.torusMajorRadius.addEventListener('input', (e) => {
        // uiElements.torusMajorRadiusValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // If value display exists
        // Requires restart or specific handler
        // switchAnimation(currentAnimationType); // Example restart
    });
    uiElements.torusRotationAxis.addEventListener('change', (e) => {
        // Value read directly in update loop or handled by module
    });

    // Add listeners for other controls if not handled by modules...
    // Example: Particle count often requires restart
    uiElements.particleCount.addEventListener('input', (e) => {
        uiElements.particleCountValue.textContent = e.target.value;
        if (window.PARTICLES_ANIMATION && window.PARTICLES_ANIMATION.handleCountChange) {
             window.PARTICLES_ANIMATION.handleCountChange();
        }
    });
    // Example: Lissajous points require restart/handler
    uiElements.lissajousPointCount.addEventListener('input', (e) => {
        uiElements.lissajousPointCountValue.textContent = e.target.value;
        // lissajous.js already has a handler (handleLissajousParamChange) attached internally
    });

    // Window Resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            console.log("Window resized, updating...");
            setupRenderTargetAndCanvas(); // Update render target and canvas sizes
        }, 150); // Debounce
    });
}

// --- UI Update Functions ---

function updateAllValueDisplays() {
    // Update general controls
    uiElements.resolutionValue.textContent = uiElements.resolution.value;
    // uiElements.brightnessValue.textContent = Number.parseFloat(uiElements.brightness.value).toFixed(2); // If exists
    // uiElements.contrastValue.textContent = Number.parseFloat(uiElements.contrast.value).toFixed(1); // If exists
    // uiElements.zoomValue.textContent = Number.parseFloat(uiElements.zoom.value).toFixed(1); // If exists
    uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(uiElements.renderTargetResolution.value).toFixed(2);

    // Update animation-specific controls (ensure elements exist)
    if (uiElements.torusThicknessValue) uiElements.torusThicknessValue.textContent = Number.parseFloat(uiElements.torusThickness.value).toFixed(2);
    if (uiElements.torusMajorRadiusValue) uiElements.torusMajorRadiusValue.textContent = Number.parseFloat(uiElements.torusMajorRadius.value).toFixed(1);
    // if (uiElements.torusSpeedValue) uiElements.torusSpeedValue.textContent = Number.parseFloat(uiElements.torusSpeed.value).toFixed(3);

    if (uiElements.particleCountValue) uiElements.particleCountValue.textContent = uiElements.particleCount.value;
    // ... other particle value displays

    if (uiElements.kaleidoscopeSegmentsValue) uiElements.kaleidoscopeSegmentsValue.textContent = uiElements.kaleidoscopeSegments.value;
    // ... other kaleidoscope value displays

    if (uiElements.lissajousAValue) uiElements.lissajousAValue.textContent = uiElements.lissajousA.value;
    if (uiElements.lissajousBValue) uiElements.lissajousBValue.textContent = uiElements.lissajousB.value;
    if (uiElements.lissajousDeltaValue) uiElements.lissajousDeltaValue.textContent = (Number.parseFloat(uiElements.lissajousDelta.value) / Math.PI).toFixed(2) + " PI";
    if (uiElements.lissajousAmpAValue) uiElements.lissajousAmpAValue.textContent = Number.parseFloat(uiElements.lissajousAmpA.value).toFixed(1);
    if (uiElements.lissajousAmpBValue) uiElements.lissajousAmpBValue.textContent = Number.parseFloat(uiElements.lissajousAmpB.value).toFixed(1);
    if (uiElements.lissajousPointCountValue) uiElements.lissajousPointCountValue.textContent = uiElements.lissajousPointCount.value;
    // ... other lissajous value displays

    // ... update displays for noise, morph, metaballs if they have value spans
}

function updateUIForAnimationType(type) {
    // Hide all animation-specific controls
    // Use for...of loop instead of forEach
    for (const el of document.querySelectorAll('.animation-controls')) {
        el.style.display = 'none'; // Keep assignment separate
    }
    activeControls = []; // Reset active controls

    // Add general controls to activeControls list
    const generalControlIds = [
        'resolution', 'charset', 'brightness', 'contrast', 'zoom', 'invert', 'renderTargetResolution'
    ];
    for (const id of generalControlIds) {
        if (uiElements[id]) {
            activeControls.push(uiElements[id]);
        }
    }

    // Show controls for the selected type and add them to activeControls
    let controlsToShow = null;
    let specificControlIds = [];

    switch (type) {
        case 'torus':
            controlsToShow = uiElements.torusControls;
            specificControlIds = ['torusSpeed', 'torusThickness', 'torusMajorRadius', 'torusRotationAxis'];
            break;
        case 'noise':
            controlsToShow = uiElements.noiseControls;
            specificControlIds = ['noiseScale', 'noiseSpeed', 'noiseBrightness'];
            break;
        case 'particles':
            controlsToShow = uiElements.particleControls;
            specificControlIds = ['particleCount', 'particleSize', 'particleSpeed', 'particleLifespan', 'emitterShape', 'emitterSize', 'forceType', 'forceStrength'];
            break;
        case 'kaleidoscope':
            controlsToShow = uiElements.kaleidoscopeControls;
            specificControlIds = ['kaleidoscopeSegments', 'kaleidoscopeBaseNoiseScale', 'kaleidoscopeBaseNoiseSpeed', 'kaleidoscopeBaseNoiseBrightness'];
            break;
        case 'morph':
            controlsToShow = uiElements.morphControls;
            specificControlIds = ['morphSpeed', 'morphRotationSpeed']; // Add morphComplexity if control exists
            break;
        case 'lissajous':
            controlsToShow = uiElements.lissajousControls;
            specificControlIds = ['lissajousA', 'lissajousB', 'lissajousDelta', 'lissajousAmpA', 'lissajousAmpB', 'lissajousDrawSpeed', 'lissajousPointCount'];
            break;
        // Add case for 'metaballs' if integrating
    }

    if (controlsToShow) {
        controlsToShow.style.display = 'block';
        for (const id of specificControlIds) {
            if (uiElements[id]) {
                activeControls.push(uiElements[id]);
            }
        }
    }
}

// --- Animation Switching ---

function switchAnimation(type) {
    console.log("Switching animation to:", type);
    currentAnimationType = type;
    if (uiElements.animationType) { // Check if element exists
        uiElements.animationType.value = type; // Ensure dropdown matches
    }

    // --- Cleanup previous animation ---
    // Try calling the cleanup function from the previous animation's module
    const prevAnimationModule = window[currentAnimationType.toUpperCase() + '_ANIMATION'];
    if (prevAnimationModule && typeof prevAnimationModule.cleanup === 'function') {
        try {
            prevAnimationModule.cleanup(scene); // Pass scene if needed
        } catch (error) {
            console.error("Error during module cleanup:", error);
        }
    } else {
        // Default cleanup if module or cleanup function doesn't exist
        console.log("Performing default scene cleanup.");
        if (scene) { // Check if scene exists
             while(scene.children.length > 0){
                 const obj = scene.children[0];
                 scene.remove(obj);
                 if (obj.geometry) obj.geometry.dispose();
                 if (obj.material) {
                     if (Array.isArray(obj.material)) {
                         obj.material.forEach(m => m.dispose()); // forEach is okay here for disposal array
                     } else {
                         obj.material.dispose();
                     }
                 }
                 // Dispose textures? Might be needed depending on animation
             }
        }
    }
    animationObjects = {}; // Reset animation objects container

    // --- Setup new animation ---
    if (!scene) { // Ensure scene exists before adding lights/objects
        console.error("Scene not initialized before setting up animation.");
        return;
    }

    // Add basic lighting (modules might add/remove their own)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    // Store lights in animationObjects so they can be potentially removed by cleanup
    animationObjects.ambientLight = ambientLight;
    animationObjects.directionalLight = directionalLight;


    // Get the setup function from the corresponding module
    const currentAnimationModule = window[type.toUpperCase() + '_ANIMATION'];
    if (currentAnimationModule && typeof currentAnimationModule.setup === 'function') {
        try {
            // Call the module's setup function. It might rely on global scene, camera, renderer, clock, controls objects.
            currentAnimationModule.setup();
        } catch (error) {
            console.error(`Error setting up ${type} animation:`, error);
        }
    } else {
        console.error(`Setup function for animation type "${type}" not found.`);
    }

    // Adjust camera zoom based on animation type (similar to main.js logic)
    let newZoom = Number.parseFloat(uiElements.zoom.value) || 15; // Default to slider value
	if (type === 'noise' || type === 'kaleidoscope') {
		newZoom = 5;
	} else if (type === 'morph' || type === 'torus' || type === 'lissajous') {
		newZoom = 10;
	} else if (type === 'metaballs') { // Add if metaballs integrated
		newZoom = 15;
	}
    if (camera) {
        camera.position.z = newZoom;
        camera.rotation.set(0, 0, 0); // Reset rotation
        uiElements.zoom.value = newZoom; // Sync slider
        // updateAllValueDisplays(); // Update zoom value display if it exists
    }


    updateUIForAnimationType(type); // Update UI after setting up
    console.log("Animation setup complete for:", type);
}

// --- Specific Animation Setup/Update Functions ---
// Remove placeholder functions like setupTorusAnimation, updateTorusAnimation, etc.
// The logic is now expected to be in the separate module files (torus.js, noise.js, etc.)
// and called via switchAnimation and the main animate loop.


// --- Core Rendering Logic ---

function renderToAscii() {
    if (!renderer || !scene || !camera || !renderTarget || !downscaleCtx || !display) {
        console.warn("Render components not ready for ASCII conversion.");
        return;
    }

    // 1. Render Three.js scene to offscreen render target
    renderer.setRenderTarget(renderTarget);
    renderer.clear(); // Ensure clean state
    renderer.render(scene, camera);
    renderer.setRenderTarget(null); // Render back to canvas (optional, good practice)

    // 2. Read pixels from render target
    const rtWidth = renderTarget.width;
    const rtHeight = renderTarget.height;
    // Ensure buffer size matches render target dimensions
    const buffer = new Uint8Array(rtWidth * rtHeight * 4);
    try {
        renderer.readRenderTargetPixels(renderTarget, 0, 0, rtWidth, rtHeight, buffer);
    } catch (e) {
        console.error("Error reading render target pixels:", e);
        // Attempt to resize buffer if size mismatch is the issue
        if (e.message.includes("buffer is not large enough")) {
             console.warn("Attempting to resize pixel buffer.");
             // This buffer is created locally, so resizing isn't the fix.
             // The issue might be renderTarget size changing unexpectedly.
             // Re-check setupRenderTargetAndCanvas logic.
        }
        return; // Stop if reading fails
    }


    // 3. Draw to smaller 2D canvas for downscaling
    // Create a temporary canvas to hold the full render target image data
    // Optimization: Reuse a single temporary canvas if possible
    const tempCanvas = document.createElement('canvas'); // Consider reusing
    tempCanvas.width = rtWidth;
    tempCanvas.height = rtHeight;
    const tempCtx = tempCanvas.getContext('2d');
    const imageData = new ImageData(new Uint8ClampedArray(buffer.buffer), rtWidth, rtHeight);
    tempCtx.putImageData(imageData, 0, 0);

    // Draw from temp canvas to downscale canvas (performs scaling)
    downscaleCtx.clearRect(0, 0, downscaleCanvas.width, downscaleCanvas.height);
    downscaleCtx.drawImage(tempCanvas, 0, 0, rtWidth, rtHeight, 0, 0, downscaleCanvas.width, downscaleCanvas.height);

    // 4. Get pixel data from small canvas
    const smallImageData = downscaleCtx.getImageData(0, 0, downscaleCanvas.width, downscaleCanvas.height);
    pixelData = smallImageData.data; // Update pixelData reference

    // 5. Convert to ASCII
    const asciiWidth = downscaleCanvas.width;
    const asciiHeight = downscaleCanvas.height;
    let asciiString = "";
    const brightnessThreshold = Number.parseFloat(uiElements.brightness.value);
    const contrastFactor = Number.parseFloat(uiElements.contrast.value);
    const invert = uiElements.invert.checked;
    const numChars = asciiChars.length - 1; // -1 because we use floor

    for (let y = 0; y < asciiHeight; y++) {
        for (let x = 0; x < asciiWidth; x++) {
            const index = (y * asciiWidth + x) * 4;
            const r = pixelData[index];
            const g = pixelData[index + 1];
            const b = pixelData[index + 2];

            // Calculate brightness (luminance)
            let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255; // Normalized 0-1

            // Apply contrast (adjust midpoint to 0.5 before scaling)
            brightness = (brightness - 0.5) * contrastFactor + 0.5;

            // Apply brightness threshold (acts more like an offset now)
            // This interpretation might differ from main.js's threshold logic
            brightness += brightnessThreshold - 0.5; // Adjust threshold to be centered around 0.5

            // Clamp brightness
            brightness = Math.max(0, Math.min(1, brightness));

            // Invert if needed
            if (invert) {
                brightness = 1.0 - brightness;
            }

            // Map brightness to ASCII character
            const charIndex = Math.floor(brightness * numChars);
            asciiString += asciiChars[charIndex];
        }
        asciiString += "\n"; // Newline for each row
    }

    // 6. Display ASCII
    display.textContent = asciiString;
}

// --- Animation Loop ---
let lastTime = 0;
function animate(currentTime) {
    // Avoid parameter reassignment for currentTime
    const elapsedSeconds = currentTime * 0.001; // convert time to seconds
    const delta = elapsedSeconds - lastTime;
    lastTime = elapsedSeconds;

    if (!isPaused) {
        // Update camera zoom (already handled by slider listener, but ensure matrix is updated)
        // camera.fov = 75 - Number.parseFloat(uiElements.zoom.value); // Adjust FOV based on zoom
        // camera.updateProjectionMatrix(); // FOV change requires projection matrix update

        // Get the update function from the current animation's module
        const currentAnimationModule = window[currentAnimationType.toUpperCase() + '_ANIMATION'];
        if (currentAnimationModule && typeof currentAnimationModule.update === 'function') {
            try {
                // Pass delta and elapsedTime (or just rely on global clock if modules use it)
                currentAnimationModule.update(delta, elapsedSeconds);
            } catch (error) {
                console.error(`Error during ${currentAnimationType} update:`, error);
                // Optionally pause or switch to a default animation on error
                // togglePause();
            }
        } else {
             // console.warn(`Update function for animation type "${currentAnimationType}" not found.`);
        }

        // Render the frame to ASCII
        renderToAscii();
    }

    animationFrameId = requestAnimationFrame(animate);
}

// --- Control Functions ---

function togglePause() {
    isPaused = !isPaused;
    pausePlayButton.textContent = isPaused ? 'Play' : 'Pause';
    console.log(isPaused ? "Animation Paused" : "Animation Resumed");
    if (!isPaused && !animationFrameId) {
        // Restart loop if resuming and loop was fully stopped
        lastTime = performance.now() * 0.001; // Reset time to avoid jump
        animate(performance.now());
    } else if (isPaused && animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function randomizeParameters() {
    console.log("Randomizing parameters...");

    // Randomize animation type first
    const animationTypes = Array.from(uiElements.animationType.options).map(opt => opt.value);
    const randomType = animationTypes[Math.floor(Math.random() * animationTypes.length)];

    // Switch animation only if it changed, to avoid unnecessary setup/cleanup cycles
    const typeChanged = currentAnimationType !== randomType;
    if (typeChanged) {
         switchAnimation(randomType); // This also updates activeControls and UI
    } else {
        // If type didn't change, ensure UI reflects current type
        updateUIForAnimationType(currentAnimationType);
    }

    // Randomize values for currently active controls
    // Use for...of loop
    for (const control of activeControls) {
        if (!control) continue; // Skip if control wasn't found

        if (control.type === 'range') {
            const min = Number.parseFloat(control.min);
            const max = Number.parseFloat(control.max);
            const step = Number.parseFloat(control.step) || (max - min) / 100; // Estimate step
            const range = max - min;
            const randomSteps = Math.floor(Math.random() * (range / step + 1));
            control.value = min + randomSteps * step;
        } else if (control.tagName === 'SELECT') {
            const randomIndex = Math.floor(Math.random() * control.options.length);
            control.selectedIndex = randomIndex;
        } else if (control.type === 'checkbox') {
            control.checked = Math.random() < 0.5;
        }
        // Trigger input/change event to update value displays and potentially the animation
        control.dispatchEvent(new Event('input', { bubbles: true }));
        control.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Check if the current animation module has a specific randomize function
    const currentAnimationModule = window[currentAnimationType.toUpperCase() + '_ANIMATION'];
     if (currentAnimationModule && typeof currentAnimationModule.randomize === 'function') {
         console.log(`Calling randomize for ${currentAnimationType}...`);
         try {
             currentAnimationModule.randomize();
         } catch (error) {
             console.error(`Error during ${currentAnimationType} randomize:`, error);
         }
     }


    // Special handling for controls that require animation restart *if not handled by module listeners/randomizers*
    // This might be redundant if modules handle their own restarts/updates correctly
    // const requiresRestart = ['torusThickness', 'torusMajorRadius', 'particleCount', 'lissajousPointCount', /* ... */ ];
    // let restartNeeded = false;
    // for (const control of activeControls) {
    //     if (requiresRestart.includes(control.id)) {
    //         // Check if the value actually changed
    //         // restartNeeded = true; // Simplified check
    //         break;
    //     }
    // }
    // if (restartNeeded && !typeChanged) {
    //     console.log("Restarting animation due to parameter change:", currentAnimationType);
    //     switchAnimation(currentAnimationType); // Restart current animation
    // }


    updateAllValueDisplays(); // Ensure text values match sliders/selects
    console.log("Randomization complete. Current type:", currentAnimationType);
}


// --- Utility Functions ---
// (debounce, clamp, etc. if needed)

// --- Start ---
// Use DOMContentLoaded to ensure elements are ready, especially display dimensions
document.addEventListener('DOMContentLoaded', init);
