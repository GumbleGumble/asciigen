// ASCII Art Generator v2 - Main Script

// --- Globals ---
let scene;
let camera;
let renderer;
let clock;
let asciiWidth = 120; // Default width
let calculatedHeight = 30; // Default height, will be calculated
let downscaleCanvas;
let downscaleCtx;
let pixelData; // Uint8ClampedArray for pixel data
let renderTarget;
let animationObjects = {}; // Global container for current animation elements
const ASCII_CHARS_MAP = {
	dense: "@%#*+=-:. ".split("").reverse().join(""),
	standard: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ".split("").reverse().join(""),
	minimal: "#=-. ".split("").reverse().join(""),
	blocks: "█▓▒░ ".split("").reverse().join(""),
	binary: "10".split("").reverse().join(""), // Added
    dots: ".:*#".split("").reverse().join(""), // Added
	complex: "Ñ@#W$9876543210?!abc;:+=-,._ ".split("").reverse().join(""), // Added
    shade: "████▓▓▓▒▒▒░░░   ".split("").reverse().join(""), // Added
    gradient: "█▇▆▅▄▃▂ ".split("").reverse().join(""), // Added
};
let asciiChars = ASCII_CHARS_MAP.dense; // Default character set
let isPaused = false;
let animationFrameId; // Keep as let, it's reassigned
let currentAnimationType = "lissajous"; // Default animation
// const lastTime = 0; // Unused variable

// GIF Recording State
let isRecordingGif = false;
let gifEncoder = null;
let gifRecordStartTime = 0;
const GIF_RECORD_DURATION = 5000; // 5 seconds in milliseconds
const GIF_FRAME_DELAY = 100; // Delay between frames in ms (10 FPS)
let lastGifFrameTime = 0;

// Preset Storage Key
const PRESET_STORAGE_KEY = "asciiGenPresets_v1";


// --- DOM Elements ---
const uiElements = {
	display: document.getElementById("asciiDisplay"),
	displayContainer: document.getElementById("ascii-output-container"),
	resolution: document.getElementById("resolution-slider"),
	resolutionValue: document.getElementById("resolution-value"),
	charset: document.getElementById("charset-select"),
	brightness: document.getElementById("brightness-slider"),
	brightnessValue: document.getElementById("brightness-value"),
	contrast: document.getElementById("contrast-slider"),
	contrastValue: document.getElementById("contrast-value"),
	zoom: document.getElementById("zoom-slider"),
	zoomValue: document.getElementById("zoom-value"),
	invert: document.getElementById("invert-checkbox"),
	renderTargetResolution: document.getElementById("renderTargetResolution"),
	renderTargetResolutionValue: document.getElementById(
		"renderTargetResolutionValue",
	),
	pausePlayButton: document.getElementById("pausePlayButton"),
	randomizeButton: document.getElementById("randomizeButton"),
    recordGifButton: document.getElementById("recordGifButton"), // Added GIF Button
    // --- Preset UI ---
    presetNameInput: document.getElementById("presetName"),
    savePresetButton: document.getElementById("savePresetButton"),
    loadPresetButton: document.getElementById("loadPresetButton"),
    deletePresetButton: document.getElementById("deletePresetButton"),
    presetLoadSelect: document.getElementById("presetLoadSelect"),
    // --- End Preset UI ---
	animationType: document.getElementById("animationType"), // Corrected ID
	// Lighting
	ambientIntensity: document.getElementById("ambient-intensity-slider"),
	ambientIntensityValue: document.getElementById("ambient-intensity-value"),
	directionalIntensity: document.getElementById("directional-intensity-slider"),
	directionalIntensityValue: document.getElementById(
		"directional-intensity-value",
	),
	lightPosX: document.getElementById("light-pos-x-slider"),
	lightPosXValue: document.getElementById("light-pos-x-value"),
	lightPosY: document.getElementById("light-pos-y-slider"),
	lightPosYValue: document.getElementById("light-pos-y-value"),
	lightPosZ: document.getElementById("light-pos-z-slider"),
	lightPosZValue: document.getElementById("light-pos-z-value"),
	// Torus Specific
	torusSpeed: document.getElementById("torus-speed-slider"),
	torusSpeedValue: document.getElementById("torus-speed-value"),
	torusThickness: document.getElementById("torus-thickness-slider"),
	torusThicknessValue: document.getElementById("torus-thickness-value"),
	torusMajorRadius: document.getElementById("torus-major-radius-slider"), // Added
	torusMajorRadiusValue: document.getElementById("torus-major-radius-value"), // Added
	torusRoughness: document.getElementById("torus-roughness-slider"), // Added
	torusRoughnessValue: document.getElementById("torus-roughness-value"), // Added
	torusMetalness: document.getElementById("torus-metalness-slider"), // Added
	torusMetalnessValue: document.getElementById("torus-metalness-value"), // Added
	torusRotationAxis: document.getElementById("torus-rotation-axis-select"), // Added
    torusColorPicker: document.getElementById("torus-color-picker"), // Added
	// Noise Specific
	noiseScale: document.getElementById("noise-scale-slider"),
	noiseScaleValue: document.getElementById("noise-scale-value"),
    noiseSpeedX: document.getElementById("noise-speed-x-slider"), // Changed
    noiseSpeedXValue: document.getElementById("noise-speed-x-value"), // Changed
    noiseSpeedY: document.getElementById("noise-speed-y-slider"), // Added
    noiseSpeedYValue: document.getElementById("noise-speed-y-value"), // Added
	noiseBrightness: document.getElementById("noise-brightness-slider"),
	noiseBrightnessValue: document.getElementById("noise-brightness-value"),
    noiseOctaves: document.getElementById("noise-octaves-slider"), // Added
    noiseOctavesValue: document.getElementById("noise-octaves-value"), // Added
	// Particle Specific
	particleCount: document.getElementById("particles-count-slider"),
	particleCountValue: document.getElementById("particles-count-value"),
	particleSize: document.getElementById("particles-size-slider"),
	particleSizeValue: document.getElementById("particle-size-value"),
	particleSpeed: document.getElementById("particles-speed-slider"),
	particleSpeedValue: document.getElementById("particles-speed-value"),
	particleLifespan: document.getElementById("particles-lifespan-slider"),
	particleLifespanValue: document.getElementById("particles-lifespan-value"),
	particleEmitterShape: document.getElementById("particles-emitter-shape"),
	particleEmitterSize: document.getElementById("particles-emitter-size-slider"),
	particleEmitterSizeValue: document.getElementById(
		"particle-emitter-size-value",
	),
	particleForceType: document.getElementById("particles-force-type"),
	particleForceStrength: document.getElementById(
		"particles-force-strength-slider",
	),
	particleForceStrengthValue: document.getElementById(
		"particle-force-strength-value",
	),
	// Kaleidoscope Specific
	kaleidoscopeSegments: document.getElementById("kaleidoscope-segments-slider"),
	kaleidoscopeSegmentsValue: document.getElementById(
		"kaleidoscope-segments-value",
	),
	kaleidoscopeNoiseScale: document.getElementById(
		"kaleidoscope-noise-scale-slider",
	),
	kaleidoscopeNoiseScaleValue: document.getElementById(
		"kaleidoscope-noise-scale-value",
	),
    kaleidoscopeNoiseSpeedX: document.getElementById("kaleidoscope-noise-speed-x-slider"), // Changed
    kaleidoscopeNoiseSpeedXValue: document.getElementById("kaleidoscope-noise-speed-x-value"), // Changed
    kaleidoscopeNoiseSpeedY: document.getElementById("kaleidoscope-noise-speed-y-slider"), // Added
    kaleidoscopeNoiseSpeedYValue: document.getElementById("kaleidoscope-noise-speed-y-value"), // Added
	kaleidoscopeNoiseBrightness: document.getElementById(
		"kaleidoscope-noise-brightness-slider",
	),
	kaleidoscopeNoiseBrightnessValue: document.getElementById(
		"kaleidoscope-noise-brightness-value",
	),
	// Morph Specific
	morphSpeed: document.getElementById("morph-speed-slider"),
	morphSpeedValue: document.getElementById("morph-speed-value"),
	morphRotationSpeed: document.getElementById("morph-rotation-slider"),
	morphRotationSpeedValue: document.getElementById(
		"morph-rotation-speed-value", // Corrected ID
	),
	morphComplexity: document.getElementById("morph-complexity-slider"), // Added
	morphComplexityValue: document.getElementById("morph-complexity-value"), // Added
    morphColorPicker: document.getElementById("morph-color-picker"), // Added
	// Metaballs Specific
	metaballsCount: document.getElementById("metaballs-count-slider"),
	metaballsCountValue: document.getElementById("mb-count-value"),
	metaballsSize: document.getElementById("metaballs-size-slider"),
	metaballsSizeValue: document.getElementById("mb-size-value"),
	metaballsSpeed: document.getElementById("metaballs-speed-slider"),
	metaballsSpeedValue: document.getElementById("mb-speed-value"),
	metaballsThreshold: document.getElementById("metaballs-threshold-slider"),
	metaballsThresholdValue: document.getElementById("mb-threshold-value"),
	metaballsColor: document.getElementById("metaballs-color-slider"),
	metaballsColorValue: document.getElementById("mb-color-value"),
	// Lissajous Specific
	lissajousA: document.getElementById("lissajous-a-slider"),
	lissajousAValue: document.getElementById("lj-a-value"),
	lissajousB: document.getElementById("lissajous-b-slider"),
	lissajousBValue: document.getElementById("lj-b-value"),
	lissajousDelta: document.getElementById("lissajous-delta-slider"),
	lissajousDeltaValue: document.getElementById("lj-delta-value"),
	lissajousAmpA: document.getElementById("lissajous-ampA-slider"),
	lissajousAmpAValue: document.getElementById("lj-ampA-value"),
	lissajousAmpB: document.getElementById("lissajous-ampB-slider"),
	lissajousAmpBValue: document.getElementById("lj-ampB-value"),
	lissajousSpeed: document.getElementById("lissajous-speed-slider"),
	lissajousSpeedValue: document.getElementById("lj-speed-value"),
	lissajousPoints: document.getElementById("lissajous-points-slider"),
	lissajousPointsValue: document.getElementById("lj-points-value"),
};

// --- Control Containers (Map for easy access in updateUIForAnimationType) ---
const controlContainers = {
	torus: document.getElementById("torus-controls"),
	noise: document.getElementById("noise-controls"),
	particles: document.getElementById("particles-controls"),
	kaleidoscope: document.getElementById("kaleidoscope-controls"),
	morph: document.getElementById("morph-controls"),
	metaballs: document.getElementById("metaballs-controls"),
	lissajous: document.getElementById("lissajous-controls"),
	lighting: document.getElementById("lighting-controls"), // Added reference to lighting section
};

// --- Specific Animation Control Objects (Passed to modules if needed) ---
// These are now mostly accessed via uiElements, but keep separate objects
// if modules expect them in this structure.
const torusControls = {
	sliderSpeed: uiElements.torusSpeed,
	sliderThickness: uiElements.torusThickness,
	valueThickness: uiElements.torusThicknessValue,
	sliderRoughness: uiElements.torusRoughness, // Added
	sliderMetalness: uiElements.torusMetalness, // Added
	// Major Radius and Axis are directly in uiElements
};

const noiseControls = {
	sliderScale: uiElements.noiseScale,
    sliderSpeedX: uiElements.noiseSpeedX, // Changed
    sliderSpeedY: uiElements.noiseSpeedY, // Added
	sliderBrightness: uiElements.noiseBrightness,
    // Octaves slider accessed via uiElements.noiseOctaves
};

const particlesControls = {
	sliderCount: uiElements.particleCount,
	valueCount: uiElements.particleCountValue,
	sliderSize: uiElements.particleSize,
	sliderSpeed: uiElements.particleSpeed,
	sliderLifespan: uiElements.particleLifespan,
	selectEmitterShape: uiElements.particleEmitterShape,
	sliderEmitterSize: uiElements.particleEmitterSize,
	selectForceType: uiElements.particleForceType,
	sliderForceStrength: uiElements.particleForceStrength,
};

const kaleidoscopeControls = {
	sliderSegments: uiElements.kaleidoscopeSegments,
	valueSegments: uiElements.kaleidoscopeSegmentsValue,
	sliderNoiseScale: uiElements.kaleidoscopeNoiseScale,
    sliderNoiseSpeedX: uiElements.kaleidoscopeNoiseSpeedX, // Changed
    sliderNoiseSpeedY: uiElements.kaleidoscopeNoiseSpeedY, // Added
	sliderNoiseBrightness: uiElements.kaleidoscopeNoiseBrightness,
};

const morphControls = {
	sliderMorphSpeed: uiElements.morphSpeed,
	sliderRotationSpeed: uiElements.morphRotationSpeed,
	sliderComplexity: uiElements.morphComplexity, // Added
    // Color picker accessed via uiElements.morphColorPicker
};

const metaballsControls = {
	sliderCount: uiElements.metaballsCount,
	valueCount: uiElements.metaballsCountValue,
	sliderSize: uiElements.metaballsSize,
	valueSize: uiElements.metaballsSizeValue,
	sliderSpeed: uiElements.metaballsSpeed,
	sliderThreshold: uiElements.metaballsThreshold,
	valueThreshold: uiElements.metaballsThresholdValue,
	sliderColor: uiElements.metaballsColor,
};

const lissajousControls = {
	sliderA: uiElements.lissajousA,
	valueA: uiElements.lissajousAValue, // Keep reference for updateAllValueDisplays
	sliderB: uiElements.lissajousB,
	valueB: uiElements.lissajousBValue, // Keep reference
	sliderDelta: uiElements.lissajousDelta,
	valueDelta: uiElements.lissajousDeltaValue, // Keep reference
	sliderAmpA: uiElements.lissajousAmpA,
	valueAmpA: uiElements.lissajousAmpAValue, // Keep reference
	sliderAmpB: uiElements.lissajousAmpB,
	valueAmpB: uiElements.lissajousAmpBValue, // Keep reference
	sliderSpeed: uiElements.lissajousSpeed,
	// valueSpeed: uiElements.lissajousSpeedValue, // Already in uiElements
	sliderPoints: uiElements.lissajousPoints,
	valuePoints: uiElements.lissajousPointsValue, // Keep reference
};

// --- Initialization ---
function init() {
	console.log("Initializing ASCII Animator...");

	// Basic Three.js Setup
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000); // Black background
	clock = new THREE.Clock();
    console.log("Scene and Clock created.");

	// Camera Setup (Perspective)
	const aspect = 16 / 9; // Initial aspect ratio, will be updated
	camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
	camera.position.z = Number.parseFloat(uiElements.zoom.value) || 15; // Initial zoom from slider
    console.log("Camera created.");

	// Renderer Setup
	try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(512, 512); // Fixed internal size, adjust if needed
        renderer.setPixelRatio(window.devicePixelRatio);
        console.log("Renderer created.");
    } catch (error) {
        console.error("Error creating WebGLRenderer:", error);
        alert("Failed to initialize WebGL. Please ensure your browser supports it.");
        return; // Stop initialization if renderer fails
    }
	// Don't add renderer.domElement to the document body

	// Initial Render Target and Downscale Canvas Setup
	// Defer initial setup slightly to ensure container dimensions are available
	requestAnimationFrame(setupRenderTargetAndCanvas);

	// Event Listeners
	setupEventListeners();
    console.log("Event listeners set up.");

    // Load presets into dropdown
    updatePresetList();

	// Initial UI Update
	updateAllValueDisplays();
	// Set initial charset based on dropdown
	asciiChars =
		ASCII_CHARS_MAP[uiElements.charset.value] || ASCII_CHARS_MAP.dense;
	updateUIForAnimationType(currentAnimationType); // Ensure correct controls are shown initially
    console.log("Initial UI updated.");

	// Start
	switchAnimation(currentAnimationType); // Switch to the default selected animation
    console.log("Initial animation switched.");
    console.log("init finished, starting animation loop...");
	animate();
}

// --- Event Listeners Setup ---
function setupEventListeners() {
	// General Controls
	uiElements.resolution.addEventListener("input", () => {
		// uiElements.resolutionValue.textContent = uiElements.resolution.value; // Handled by updateAllValueDisplays
		setupRenderTargetAndCanvas(); // ASCII grid size depends on this
		updateAllValueDisplays(); // Update label immediately
	});
	uiElements.charset.addEventListener("change", (e) => {
		asciiChars = ASCII_CHARS_MAP[e.target.value] || ASCII_CHARS_MAP.dense;
	});
	uiElements.brightness.addEventListener("input", (e) => {
		// uiElements.brightnessValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		updateAllValueDisplays(); // Update label immediately
	});
	uiElements.contrast.addEventListener("input", (e) => {
		// uiElements.contrastValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		updateAllValueDisplays(); // Update label immediately
	});
	uiElements.zoom.addEventListener("input", (e) => {
		const zoomVal = Number.parseFloat(e.target.value);
		// uiElements.zoomValue.textContent = zoomVal.toFixed(1); // Handled by updateAllValueDisplays
		if (camera) camera.position.z = zoomVal;
		updateAllValueDisplays(); // Update label immediately
	});
	uiElements.renderTargetResolution.addEventListener("input", (e) => {
		// uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		setupRenderTargetAndCanvas(); // Render target size depends on this
		updateAllValueDisplays(); // Update label immediately
	});
	// Invert checkbox has no value display, just checked state

	// Buttons
	uiElements.pausePlayButton.addEventListener("click", togglePause);
	uiElements.randomizeButton.addEventListener("click", randomizeParameters);
    uiElements.recordGifButton.addEventListener("click", toggleGifRecording); // Added

    // Preset Buttons
    uiElements.savePresetButton.addEventListener("click", savePreset);
    uiElements.loadPresetButton.addEventListener("click", loadPreset);
    uiElements.deletePresetButton.addEventListener("click", deletePreset);

	// Animation Type Selector
	uiElements.animationType.addEventListener("change", (e) =>
		switchAnimation(e.target.value),
	);

	// Lighting Controls
	uiElements.ambientIntensity.addEventListener("input", (e) => {
		updateAllValueDisplays();
		if (animationObjects.ambientLight) {
			animationObjects.ambientLight.intensity = Number.parseFloat(e.target.value);
		}
	});
	uiElements.directionalIntensity.addEventListener("input", (e) => {
		updateAllValueDisplays();
		if (animationObjects.directionalLight) {
			animationObjects.directionalLight.intensity = Number.parseFloat(e.target.value);
		}
	});
	const lightPosSliders = [
		uiElements.lightPosX,
		uiElements.lightPosY,
		uiElements.lightPosZ,
	];
	// Use for...of loop
	for (const slider of lightPosSliders) {
		if (slider) {
			slider.addEventListener("input", (e) => {
				updateAllValueDisplays();
				if (animationObjects.directionalLight) {
					const x = Number.parseFloat(uiElements.lightPosX.value);
					const y = Number.parseFloat(uiElements.lightPosY.value);
					const z = Number.parseFloat(uiElements.lightPosZ.value);
					animationObjects.directionalLight.position.set(x, y, z);
				}
			});
		}
	}

	// --- Add listeners for Animation Specific Controls ---
	// These listeners call the module handlers. UI updates are triggered
	// by updateAllValueDisplays called from the listener itself or the handler.

	// Torus
    if (uiElements.torusSpeed) uiElements.torusSpeed.addEventListener("input", (e) => {
		// uiElements.torusSpeedValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		window.TORUS_ANIMATION?.handleSpeedChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.torusThickness) uiElements.torusThickness.addEventListener("input", (e) => {
		// uiElements.torusThicknessValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		window.TORUS_ANIMATION?.handleThicknessChange?.(); // Trigger recreation
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.torusMajorRadius) uiElements.torusMajorRadius.addEventListener("input", (e) => {
		// uiElements.torusMajorRadiusValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.TORUS_ANIMATION?.handleMajorRadiusChange?.(); // Trigger recreation
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.torusRoughness) uiElements.torusRoughness.addEventListener("input", (e) => { // Added
		// uiElements.torusRoughnessValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		window.TORUS_ANIMATION?.handleMaterialChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.torusMetalness) uiElements.torusMetalness.addEventListener("input", (e) => { // Added
		// uiElements.torusMetalnessValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		window.TORUS_ANIMATION?.handleMaterialChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.torusRotationAxis) uiElements.torusRotationAxis.addEventListener("change", () => {
		window.TORUS_ANIMATION?.handleRotationAxisChange?.();
        // No label to update directly for select
	});
    if (uiElements.torusColorPicker) uiElements.torusColorPicker.addEventListener("input", () => { // Changed to input for live update
        window.TORUS_ANIMATION?.handleColorChange?.();
        // No label to update
    });

	// Noise
	if (uiElements.noiseScale) uiElements.noiseScale.addEventListener("input", (e) => {
		// uiElements.noiseScaleValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.NOISE_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
    if (uiElements.noiseSpeedX) uiElements.noiseSpeedX.addEventListener("input", (e) => { window.NOISE_ANIMATION?.handleParamChange?.(); updateAllValueDisplays(); }); // Changed
    if (uiElements.noiseSpeedY) uiElements.noiseSpeedY.addEventListener("input", (e) => { window.NOISE_ANIMATION?.handleParamChange?.(); updateAllValueDisplays(); }); // Added
	if (uiElements.noiseBrightness) uiElements.noiseBrightness.addEventListener("input", (e) => {
		// uiElements.noiseBrightnessValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.NOISE_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
    if (uiElements.noiseOctaves) uiElements.noiseOctaves.addEventListener("input", (e) => { // Added
        window.NOISE_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
    });

	// Particles
	if (uiElements.particleCount) uiElements.particleCount.addEventListener("input", (e) => {
		// uiElements.particleCountValue.textContent = e.target.value; // Handled by updateAllValueDisplays
		window.PARTICLES_ANIMATION?.handleCountChange?.(); // Trigger recreation
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.particleSize) uiElements.particleSize.addEventListener("input", (e) => {
		// uiElements.particleSizeValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.PARTICLES_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.particleSpeed) uiElements.particleSpeed.addEventListener("input", (e) => {
		// uiElements.particleSpeedValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.PARTICLES_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.particleLifespan) uiElements.particleLifespan.addEventListener("input", (e) => {
		// uiElements.particleLifespanValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.PARTICLES_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.particleEmitterShape) uiElements.particleEmitterShape.addEventListener("change", () => {
		window.PARTICLES_ANIMATION?.handleEmitterChange?.(); // Trigger recreation
        // No label to update
	});
	if (uiElements.particleEmitterSize) uiElements.particleEmitterSize.addEventListener("input", (e) => {
		// uiElements.particleEmitterSizeValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.PARTICLES_ANIMATION?.handleEmitterChange?.(); // Trigger recreation
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.particleForceType) uiElements.particleForceType.addEventListener("change", () => {
		window.PARTICLES_ANIMATION?.handleParamChange?.();
        // No label to update
	});
	if (uiElements.particleForceStrength) uiElements.particleForceStrength.addEventListener("input", (e) => {
		// uiElements.particleForceStrengthValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.PARTICLES_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});

	// Kaleidoscope
	if (uiElements.kaleidoscopeSegments) uiElements.kaleidoscopeSegments.addEventListener("input", (e) => {
		// uiElements.kaleidoscopeSegmentsValue.textContent = e.target.value; // Handled by updateAllValueDisplays
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.kaleidoscopeNoiseScale) uiElements.kaleidoscopeNoiseScale.addEventListener("input", (e) => {
		// uiElements.kaleidoscopeNoiseScaleValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
    if (uiElements.kaleidoscopeNoiseSpeedX) uiElements.kaleidoscopeNoiseSpeedX.addEventListener("input", (e) => { window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.(); updateAllValueDisplays(); }); // Changed
    if (uiElements.kaleidoscopeNoiseSpeedY) uiElements.kaleidoscopeNoiseSpeedY.addEventListener("input", (e) => { window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.(); updateAllValueDisplays(); }); // Added
	if (uiElements.kaleidoscopeNoiseBrightness) uiElements.kaleidoscopeNoiseBrightness.addEventListener("input", (e) => {
		// uiElements.kaleidoscopeNoiseBrightnessValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});

	// Morph
	if (uiElements.morphSpeed) uiElements.morphSpeed.addEventListener("input", (e) => {
		// uiElements.morphSpeedValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.MORPH_ANIMATION?.handleSpeedChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.morphRotationSpeed) uiElements.morphRotationSpeed.addEventListener("input", (e) => {
		// uiElements.morphRotationSpeedValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.MORPH_ANIMATION?.handleRotationSpeedChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.morphComplexity) { // If complexity slider exists
	    uiElements.morphComplexity.addEventListener('input', (e) => {
	        // uiElements.morphComplexityValue.textContent = e.target.value; // Handled by updateAllValueDisplays
	        window.MORPH_ANIMATION?.handleComplexityChange?.(); // Trigger recreation
            updateAllValueDisplays(); // Update label
	    });
	}
    if (uiElements.morphColorPicker) uiElements.morphColorPicker.addEventListener("input", () => { // Changed to input
        window.MORPH_ANIMATION?.handleColorChange?.();
        // No label to update
    });

	// Metaballs
	if (uiElements.metaballsCount) uiElements.metaballsCount.addEventListener("input", (e) => {
		// uiElements.metaballsCountValue.textContent = e.target.value; // Handled by updateAllValueDisplays
		window.METABALLS_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.metaballsSize) uiElements.metaballsSize.addEventListener("input", (e) => {
		// uiElements.metaballsSizeValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.METABALLS_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.metaballsSpeed) uiElements.metaballsSpeed.addEventListener("input", (e) => {
		// uiElements.metaballsSpeedValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		window.METABALLS_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.metaballsThreshold) uiElements.metaballsThreshold.addEventListener("input", (e) => {
		// uiElements.metaballsThresholdValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		window.METABALLS_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});
	if (uiElements.metaballsColor) uiElements.metaballsColor.addEventListener("input", (e) => {
		// uiElements.metaballsColorValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		window.METABALLS_ANIMATION?.handleParamChange?.();
        updateAllValueDisplays(); // Update label
	});

	// Lissajous
	const lissajousSliders = [ // Create array for loop
		uiElements.lissajousA,
		uiElements.lissajousB,
		uiElements.lissajousDelta,
		uiElements.lissajousAmpA,
		uiElements.lissajousAmpB,
		uiElements.lissajousSpeed,
		uiElements.lissajousPoints,
	];
	// Use for...of loop
	for (const slider of lissajousSliders) {
        if (!slider) continue; // Add check
		slider.addEventListener("input", () => {
				// Call the module handler first
			window.LISSAJOUS_ANIMATION?.handleParamChange?.();
            // Now update all displays, including Lissajous labels
            updateAllValueDisplays();
		});
	}


	// Window Resize
	let resizeTimeout;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			console.log("Window resized, updating layout...");
			setupRenderTargetAndCanvas(); // Update canvas sizes and aspect ratio

			// Update camera aspect ratio
			if (camera && uiElements.displayContainer) {
				const containerWidth = uiElements.displayContainer.clientWidth;
				const containerHeight = uiElements.displayContainer.clientHeight;
				if (containerWidth > 0 && containerHeight > 0) {
					camera.aspect = containerWidth / containerHeight;
					camera.updateProjectionMatrix();
					console.log("Camera aspect ratio updated.");
				}
			}
		}, 150); // Debounce resize event
	});
}

// --- Canvas and Render Target Setup ---
function setupRenderTargetAndCanvas() {
    // console.log("setupRenderTargetAndCanvas called."); // Reduce logging
	const display = uiElements.display;
	const container = uiElements.displayContainer;
	if (!container || !display) {
		console.error("Display elements not found! Cannot setup render target.");
		return;
	}

	const containerWidth = container.clientWidth;
	const containerHeight = container.clientHeight;

	if (containerWidth <= 0 || containerHeight <= 0) {
		// console.warn("Container dimensions not available yet, deferring setup."); // Reduce logging
        // Request again slightly later if dimensions aren't ready
        requestAnimationFrame(setupRenderTargetAndCanvas);
		return;
	}
    // console.log(`Container dimensions: ${containerWidth}x${containerHeight}`); // Reduce logging

	// 1. Determine ASCII Grid Size (based on resolution slider and container aspect ratio)
	asciiWidth = Number.parseInt(uiElements.resolution.value, 10); // Update global
	const charAspectRatio = 0.6; // Estimate: Adjust based on font
	calculatedHeight = Math.max( // Update global
		1,
		Math.round(
			(containerHeight / containerWidth) * asciiWidth * charAspectRatio,
		),
	);
    // console.log(`ASCII Grid: ${asciiWidth}x${calculatedHeight}`); // Reduce logging

	// 2. Adjust Font Size to Fit Container
	const fontSizeW = containerWidth / asciiWidth;
	const fontSizeH = containerHeight / calculatedHeight;
	const fontSize = Math.min(fontSizeW / charAspectRatio, fontSizeH); // Use the smaller dimension to ensure fit
	display.style.fontSize = `${fontSize}px`;
    // console.log(`Calculated font size: ${fontSize}px`); // Reduce logging

	// 3. Setup WebGL Render Target (matches container aspect ratio, scaled by slider)
	const renderScale = Number.parseFloat(uiElements.renderTargetResolution.value);
	// Use a base size and scale it, maintaining aspect ratio
	// const baseRenderWidth = 512; // Or use containerWidth as base? Let's try containerWidth
	const renderWidth = Math.max(1, Math.floor(containerWidth * renderScale));
	const renderHeight = Math.max(1, Math.floor(containerHeight * renderScale));

	if (!renderTarget || renderTarget.width !== renderWidth || renderTarget.height !== renderHeight) {
        if (renderTarget) {
            renderTarget.dispose(); // Dispose old target
            // console.log("Disposed old render target."); // Reduce logging
        }
        try {
            renderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, {
                minFilter: THREE.LinearFilter,
                magFilter: THREE.NearestFilter,
                format: THREE.RGBAFormat,
            });
            console.log(`Render Target resized/created: ${renderWidth}x${renderHeight}`);
        } catch (error) {
            console.error("Error creating WebGLRenderTarget:", error);
            return; // Stop if render target fails
        }
	}

	// 4. Setup Downscale Canvas (matches ASCII grid size)
	if (!downscaleCanvas) {
		downscaleCanvas = document.createElement("canvas");
		downscaleCtx = downscaleCanvas.getContext("2d", {
			willReadFrequently: true,
		});
        console.log("Downscale canvas created.");
	}
	// Resize downscale canvas if needed
	if (downscaleCanvas.width !== asciiWidth || downscaleCanvas.height !== calculatedHeight) {
		downscaleCanvas.width = asciiWidth;
		downscaleCanvas.height = calculatedHeight;
		// Reallocate pixelData buffer if size changed
		// pixelData = new Uint8ClampedArray(asciiWidth * calculatedHeight * 4); // Reallocate in renderToAscii if needed
        console.log(`Downscale canvas resized: ${asciiWidth}x${calculatedHeight}`);
	}

	// 5. Update Camera Aspect Ratio (if camera exists)
	if (camera) {
        if (camera.aspect !== containerWidth / containerHeight) {
            camera.aspect = containerWidth / containerHeight;
            camera.updateProjectionMatrix();
            // console.log("Camera aspect ratio updated in setupRenderTargetAndCanvas."); // Reduce logging
        }
	}
}

// --- UI Update Functions ---
function updateAllValueDisplays() {
    // Update labels for all relevant controls based on their current value
    // General
    if (uiElements.resolutionValue && uiElements.resolution) uiElements.resolutionValue.textContent = uiElements.resolution.value;
    if (uiElements.brightnessValue && uiElements.brightness) uiElements.brightnessValue.textContent = Number.parseFloat(uiElements.brightness.value).toFixed(2);
    if (uiElements.contrastValue && uiElements.contrast) uiElements.contrastValue.textContent = Number.parseFloat(uiElements.contrast.value).toFixed(1);
    if (uiElements.zoomValue && uiElements.zoom) uiElements.zoomValue.textContent = Number.parseFloat(uiElements.zoom.value).toFixed(1);
    if (uiElements.renderTargetResolutionValue && uiElements.renderTargetResolution) uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(uiElements.renderTargetResolution.value).toFixed(2);

    // Lighting
    if (uiElements.ambientIntensityValue && uiElements.ambientIntensity) uiElements.ambientIntensityValue.textContent = Number.parseFloat(uiElements.ambientIntensity.value).toFixed(2);
    if (uiElements.directionalIntensityValue && uiElements.directionalIntensity) uiElements.directionalIntensityValue.textContent = Number.parseFloat(uiElements.directionalIntensity.value).toFixed(1);
    if (uiElements.lightPosXValue && uiElements.lightPosX) uiElements.lightPosXValue.textContent = Number.parseFloat(uiElements.lightPosX.value).toFixed(1);
    if (uiElements.lightPosYValue && uiElements.lightPosY) uiElements.lightPosYValue.textContent = Number.parseFloat(uiElements.lightPosY.value).toFixed(1);
    if (uiElements.lightPosZValue && uiElements.lightPosZ) uiElements.lightPosZValue.textContent = Number.parseFloat(uiElements.lightPosZ.value).toFixed(1);

    // Torus
    if (uiElements.torusSpeedValue && uiElements.torusSpeed) uiElements.torusSpeedValue.textContent = Number.parseFloat(uiElements.torusSpeed.value).toFixed(2);
    if (uiElements.torusThicknessValue && uiElements.torusThickness) uiElements.torusThicknessValue.textContent = Number.parseFloat(uiElements.torusThickness.value).toFixed(2);
    if (uiElements.torusMajorRadiusValue && uiElements.torusMajorRadius) uiElements.torusMajorRadiusValue.textContent = Number.parseFloat(uiElements.torusMajorRadius.value).toFixed(1);
    if (uiElements.torusRoughnessValue && uiElements.torusRoughness) uiElements.torusRoughnessValue.textContent = Number.parseFloat(uiElements.torusRoughness.value).toFixed(2);
    if (uiElements.torusMetalnessValue && uiElements.torusMetalness) uiElements.torusMetalnessValue.textContent = Number.parseFloat(uiElements.torusMetalness.value).toFixed(2);

    // Noise
    if (uiElements.noiseScaleValue && uiElements.noiseScale) uiElements.noiseScaleValue.textContent = Number.parseFloat(uiElements.noiseScale.value).toFixed(1);
    if (uiElements.noiseSpeedXValue && uiElements.noiseSpeedX) uiElements.noiseSpeedXValue.textContent = Number.parseFloat(uiElements.noiseSpeedX.value).toFixed(1); // Changed
    if (uiElements.noiseSpeedYValue && uiElements.noiseSpeedY) uiElements.noiseSpeedYValue.textContent = Number.parseFloat(uiElements.noiseSpeedY.value).toFixed(1); // Added
    if (uiElements.noiseBrightnessValue && uiElements.noiseBrightness) uiElements.noiseBrightnessValue.textContent = Number.parseFloat(uiElements.noiseBrightness.value).toFixed(1);
    if (uiElements.noiseOctavesValue && uiElements.noiseOctaves) uiElements.noiseOctavesValue.textContent = uiElements.noiseOctaves.value; // Added

    // Particles
    if (uiElements.particleCountValue && uiElements.particleCount) uiElements.particleCountValue.textContent = uiElements.particleCount.value;
    if (uiElements.particleSizeValue && uiElements.particleSize) uiElements.particleSizeValue.textContent = Number.parseFloat(uiElements.particleSize.value).toFixed(1);
    if (uiElements.particleSpeedValue && uiElements.particleSpeed) uiElements.particleSpeedValue.textContent = Number.parseFloat(uiElements.particleSpeed.value).toFixed(1);
    if (uiElements.particleLifespanValue && uiElements.particleLifespan) uiElements.particleLifespanValue.textContent = Number.parseFloat(uiElements.particleLifespan.value).toFixed(1);
    if (uiElements.particleEmitterSizeValue && uiElements.particleEmitterSize) uiElements.particleEmitterSizeValue.textContent = Number.parseFloat(uiElements.particleEmitterSize.value).toFixed(1);
    if (uiElements.particleForceStrengthValue && uiElements.particleForceStrength) uiElements.particleForceStrengthValue.textContent = Number.parseFloat(uiElements.particleForceStrength.value).toFixed(1);

    // Kaleidoscope
    if (uiElements.kaleidoscopeSegmentsValue && uiElements.kaleidoscopeSegments) uiElements.kaleidoscopeSegmentsValue.textContent = uiElements.kaleidoscopeSegments.value;
    if (uiElements.kaleidoscopeNoiseScaleValue && uiElements.kaleidoscopeNoiseScale) uiElements.kaleidoscopeNoiseScaleValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseScale.value).toFixed(1);
    if (uiElements.kaleidoscopeNoiseSpeedXValue && uiElements.kaleidoscopeNoiseSpeedX) uiElements.kaleidoscopeNoiseSpeedXValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseSpeedX.value).toFixed(1); // Changed
    if (uiElements.kaleidoscopeNoiseSpeedYValue && uiElements.kaleidoscopeNoiseSpeedY) uiElements.kaleidoscopeNoiseSpeedYValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseSpeedY.value).toFixed(1); // Added
    if (uiElements.kaleidoscopeNoiseBrightnessValue && uiElements.kaleidoscopeNoiseBrightness) uiElements.kaleidoscopeNoiseBrightnessValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseBrightness.value).toFixed(1);

    // Morph
    if (uiElements.morphSpeedValue && uiElements.morphSpeed) uiElements.morphSpeedValue.textContent = Number.parseFloat(uiElements.morphSpeed.value).toFixed(1);
    if (uiElements.morphRotationSpeedValue && uiElements.morphRotationSpeed) uiElements.morphRotationSpeedValue.textContent = Number.parseFloat(uiElements.morphRotationSpeed.value).toFixed(1);
    if (uiElements.morphComplexityValue && uiElements.morphComplexity) uiElements.morphComplexityValue.textContent = uiElements.morphComplexity.value;

    // Metaballs
    if (uiElements.metaballsCountValue && uiElements.metaballsCount) uiElements.metaballsCountValue.textContent = uiElements.metaballsCount.value;
    if (uiElements.metaballsSizeValue && uiElements.metaballsSize) uiElements.metaballsSizeValue.textContent = Number.parseFloat(uiElements.metaballsSize.value).toFixed(1);
    if (uiElements.metaballsSpeedValue && uiElements.metaballsSpeed) uiElements.metaballsSpeedValue.textContent = Number.parseFloat(uiElements.metaballsSpeed.value).toFixed(1);
    if (uiElements.metaballsThresholdValue && uiElements.metaballsThreshold) uiElements.metaballsThresholdValue.textContent = Number.parseFloat(uiElements.metaballsThreshold.value).toFixed(2);
    if (uiElements.metaballsColorValue && uiElements.metaballsColor) uiElements.metaballsColorValue.textContent = Number.parseFloat(uiElements.metaballsColor.value).toFixed(2);

    // Lissajous - Update labels here now
    if (lissajousControls.valueA && lissajousControls.sliderA) lissajousControls.valueA.textContent = lissajousControls.sliderA.value;
    if (lissajousControls.valueB && lissajousControls.sliderB) lissajousControls.valueB.textContent = lissajousControls.sliderB.value;
    if (lissajousControls.valueDelta && lissajousControls.sliderDelta) {
        const deltaVal = Number.parseFloat(lissajousControls.sliderDelta.value);
        lissajousControls.valueDelta.textContent = `${(deltaVal / Math.PI).toFixed(2)} PI`;
    }
    if (lissajousControls.valueAmpA && lissajousControls.sliderAmpA) lissajousControls.valueAmpA.textContent = Number.parseFloat(lissajousControls.sliderAmpA.value).toFixed(1);
    if (lissajousControls.valueAmpB && lissajousControls.sliderAmpB) lissajousControls.valueAmpB.textContent = Number.parseFloat(lissajousControls.sliderAmpB.value).toFixed(1);
    if (uiElements.lissajousSpeedValue && uiElements.lissajousSpeed) uiElements.lissajousSpeedValue.textContent = Number.parseFloat(uiElements.lissajousSpeed.value).toFixed(1);
    if (lissajousControls.valuePoints && lissajousControls.sliderPoints) lissajousControls.valuePoints.textContent = lissajousControls.sliderPoints.value;

	// console.log("UI values updated via updateAllValueDisplays."); // Reduce logging noise
}

// --- UI Update Functions ---
function updateUIForAnimationType(type) {
    console.log(`Updating UI for animation type: ${type}`); // Add logging
	// Hide all animation-specific control sections
	// Use for...of loop
	for (const key in controlContainers) {
        const container = controlContainers[key];
		if (container) { // Check if container exists
            // Always remove active class first
            container.classList.remove("active");
            // console.log(` Deactivated controls for: ${key}`); // Reduce logging
        } else {
            console.warn(` Control container for key "${key}" not found during hide phase.`);
        }
	}

	// Show the controls for the selected animation type
	const activeContainer = controlContainers[type];
	if (activeContainer) {
		activeContainer.classList.add("active");
		console.log(` Activated controls for: ${type}`);
	} else {
		console.warn(` Control container for animation type "${type}" not found.`);
	}

	// Conditionally show/hide lighting controls
	const usesLighting = !["noise", "kaleidoscope", "metaballs"].includes(type);
	if (controlContainers.lighting) {
		if (usesLighting) {
            console.log(" Showing lighting controls.");
			controlContainers.lighting.classList.add("active");
		} else {
            console.log(" Hiding lighting controls.");
			// Ensure it's hidden if not used (it might have been left active)
            controlContainers.lighting.classList.remove("active");
		}
	} else {
        console.warn(" Lighting control container not found.");
    }
}

// --- Animation Switching ---
function switchAnimation(type) {
	console.log(`Switching animation to: ${type}`); // Use template literal
	const prevAnimationType = currentAnimationType; // Store previous type before updating
	currentAnimationType = type;
	if (uiElements.animationType) {
		// Check if element exists
		uiElements.animationType.value = type; // Ensure dropdown matches
	}

	// --- Cleanup previous animation ---
	let cleanedUp = false; // Flag to track if module cleanup ran
	const prevAnimationModule = window[`${prevAnimationType.toUpperCase()}_ANIMATION`]; // Use bracket notation
	if (prevAnimationModule?.cleanup) { // Use optional chaining
		try {
			prevAnimationModule.cleanup(scene); // Pass scene if needed
			console.log(`Cleaned up ${prevAnimationType} module.`);
			cleanedUp = true;
		} catch (error) {
			console.error(
				`Error during ${prevAnimationType} module cleanup: ${error}`, // Use template literal
			);
			// Continue with default cleanup even if module cleanup failed
		}
	}

	// Default cleanup if module or cleanup function doesn't exist OR if it failed
	if (!cleanedUp) {
		console.log(`Performing default cleanup for ${prevAnimationType}.`);
		const objectsToRemove = [];
		for (const child of scene.children) { // Use for...of
			// Keep camera and potentially lights (re-added later)
			if (
				!(child instanceof THREE.Camera) &&
				!(child instanceof THREE.AmbientLight) && // Keep ambient? Re-added anyway.
				!(child instanceof THREE.DirectionalLight) // Keep directional? Re-added anyway.
			) {
				objectsToRemove.push(child);
			}
		}
		for (const child of objectsToRemove) { // Use for...of
			scene.remove(child);
			// Attempt to dispose geometry/material if they exist
			if (child.geometry?.dispose) child.geometry.dispose();
			if (child.material?.dispose) {
				if (Array.isArray(child.material)) {
					for (const m of child.material) { // Use for...of
                        m.dispose();
                    }
				} else {
					child.material.dispose();
				}
			}
		}
		// Reset animation objects container (only if default cleanup runs?)
		// It might be safer to always reset it, or let modules manage their own parts.
		// Let's reset it here for now as a safety measure.
		animationObjects = {};
	}


	// --- Setup new animation ---
	if (!scene) {
		console.error("Scene not initialized before setting up animation.");
		return;
	}
	// Add/Update basic lighting (modules might add/remove their own)
	// Use initial values from sliders
	const ambientIntensity = Number.parseFloat(uiElements.ambientIntensity.value);
	const directionalIntensity = Number.parseFloat(
		uiElements.directionalIntensity.value,
	);
	const lightX = Number.parseFloat(uiElements.lightPosX.value);
	const lightY = Number.parseFloat(uiElements.lightPosY.value);
	const lightZ = Number.parseFloat(uiElements.lightPosZ.value);

	// Remove existing lights before adding/updating to avoid duplicates if module doesn't handle them
	// Check if they exist in animationObjects before removing
	if (animationObjects.ambientLight) {
		scene.remove(animationObjects.ambientLight);
		// No dispose method for lights
		// animationObjects.ambientLight = null; // Clear reference after removing
	}
	if (animationObjects.directionalLight) {
		scene.remove(animationObjects.directionalLight);
		// No dispose method for lights
		// animationObjects.directionalLight = null; // Clear reference after removing
	}
    // Clear references from animationObjects regardless of whether they were in the scene
    // This prevents issues if they were removed by a module's cleanup but still referenced.
    animationObjects.ambientLight = null;
    animationObjects.directionalLight = null;


	// Create or update lights and store references
	const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
	ambientLight.name = "ambientLight"; // Add name for debugging
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(
		0xffffff,
		directionalIntensity,
	);
	directionalLight.position.set(lightX, lightY, lightZ);
	directionalLight.name = "directionalLight"; // Add name for debugging
	scene.add(directionalLight);
	// Store lights in animationObjects so they can be potentially removed by cleanup AND updated by sliders
	animationObjects.ambientLight = ambientLight;
	animationObjects.directionalLight = directionalLight;

	// Get the setup function from the corresponding module
	const currentAnimationModule = window[`${type.toUpperCase()}_ANIMATION`]; // Use template literal for key
	if (currentAnimationModule?.setup) { // Use optional chaining
		try {
			// Call the module's setup function. It might rely on global scene, camera, renderer, clock, controls objects.
			currentAnimationModule.setup();
			console.log(`Setup ${type} module.`);
		} catch (error) {
			console.error(`Error setting up ${type} animation: ${error}`); // Use template literal
		}
	} else {
		console.error(`Setup function for animation type "${type}" not found.`);
	}

	// Adjust camera zoom based on animation type (similar to main.js logic)
	let newZoom = Number.parseFloat(uiElements.zoom.value) || 15; // Default to slider value
	if (type === "noise" || type === "kaleidoscope" || type === "metaballs") { // Added metaballs
		newZoom = 5;
	} else if (type === "morph" || type === "torus" || type === "lissajous") {
		newZoom = 10;
	} else if (type === "particles") { // Grouped similar zoom levels
		newZoom = 15;
	}
	if (camera) {
		camera.position.z = newZoom;
		camera.rotation.set(0, 0, 0); // Reset rotation
		uiElements.zoom.value = newZoom.toString(); // Sync slider
		// uiElements.zoomValue.textContent = newZoom.toFixed(1); // Sync label - Handled by updateAllValueDisplays
		camera.updateProjectionMatrix(); // Ensure matrix is updated after position change
	}

	// Update the UI to show the correct controls
	updateUIForAnimationType(type);
    updateAllValueDisplays(); // Ensure all labels are correct after switching
}

// --- Core Rendering Logic ---

function renderToAscii() {
	if (!renderer || !scene || !camera || !renderTarget || !downscaleCtx || !uiElements.display) {
        // console.warn("RenderToAscii prerequisites not met."); // Can be noisy
        return; // Exit if any required element is missing
    }

	// 1. Render Three.js scene to the render target
	renderer.setRenderTarget(renderTarget);
	renderer.render(scene, camera);
	renderer.setRenderTarget(null); // Reset render target

	// 2. Read pixels from the render target
	try {
        // Ensure pixelData buffer is correctly sized before reading
        const expectedSize = renderTarget.width * renderTarget.height * 4;
        // Use Uint8Array for readRenderTargetPixels
        if (!pixelData || pixelData.length !== expectedSize) {
            // console.warn(`Reallocating pixelData buffer. Expected: ${expectedSize}, Got: ${pixelData?.length}`); // Reduce logging
            pixelData = new Uint8Array(expectedSize);
        }

		renderer.readRenderTargetPixels(
			renderTarget,
			0,
			0,
			renderTarget.width,
			renderTarget.height,
			pixelData, // Read directly into existing buffer
		);

	} catch (error) {
		console.error("Error reading render target pixels:", error);
		return; // Stop if reading pixels fails
	}

    // 3. Draw pixels to downscale canvas (draws the high-res RT onto the low-res canvas)
    // Create a temporary canvas to hold the full render target image data
    // Optimization: Reuse temp canvas if possible? For now, create each frame.
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = renderTarget.width;
    tempCanvas.height = renderTarget.height;
    const tempCtx = tempCanvas.getContext('2d');
    // Ensure pixelData is Uint8ClampedArray for ImageData
    const clampedPixelData = new Uint8ClampedArray(pixelData.buffer, pixelData.byteOffset, pixelData.length);
    const imageData = new ImageData(clampedPixelData, renderTarget.width, renderTarget.height);
    tempCtx.putImageData(imageData, 0, 0);

    // Draw the temporary canvas onto the downscale canvas, effectively downscaling
    downscaleCtx.clearRect(0, 0, downscaleCanvas.width, downscaleCanvas.height); // Clear previous frame
    downscaleCtx.imageSmoothingEnabled = true; // Enable smoothing for better downscaling
    downscaleCtx.imageSmoothingQuality = 'high'; // Use high quality if available
    downscaleCtx.drawImage(tempCanvas, 0, 0, downscaleCanvas.width, downscaleCanvas.height);


	// 4. Get image data from the downscale canvas
	let downscaleImageData;
	try {
		downscaleImageData = downscaleCtx.getImageData(
			0,
			0,
			downscaleCanvas.width,
			downscaleCanvas.height,
		);
	} catch (error) {
		console.error("Error getting image data from downscale canvas:", error);
		return; // Stop if getting image data fails
	}
	const data = downscaleImageData.data;

	// 5. Convert pixels to ASCII characters
	const brightnessFactor = Number.parseFloat(uiElements.brightness.value);
	const contrastFactor = Number.parseFloat(uiElements.contrast.value);
	const invert = uiElements.invert.checked;
	const numChars = asciiChars.length;
	let asciiString = "";

	for (let y = 0; y < downscaleCanvas.height; y++) {
		for (let x = 0; x < downscaleCanvas.width; x++) {
			const i = (y * downscaleCanvas.width + x) * 4;
			// Calculate grayscale brightness (average method)
			let r = data[i];
			let g = data[i + 1];
			let b = data[i + 2];

			// Apply Brightness & Contrast (simplified formula)
			// Adjust brightness first, then contrast around mid-gray (128)
			r = (r - 128) * contrastFactor + 128 * brightnessFactor;
			g = (g - 128) * contrastFactor + 128 * brightnessFactor;
			b = (b - 128) * contrastFactor + 128 * brightnessFactor;

			// Clamp values
			r = Math.max(0, Math.min(255, r));
			g = Math.max(0, Math.min(255, g));
			b = Math.max(0, Math.min(255, b));

			let gray = (r + g + b) / 3;

			// Invert if checked
			if (invert) {
				gray = 255 - gray;
			}

			// Map grayscale value to ASCII character index
			const charIndex = Math.min(
				numChars - 1,
				Math.floor((gray / 255) * numChars),
			);
			asciiString += asciiChars[charIndex];
		}
		asciiString += "\n"; // Newline after each row
	}

	// 6. Update the display element
	uiElements.display.textContent = asciiString;
}

// --- Animation Loop ---
function animate() {
	if (isPaused) {
		// If paused, still request the next frame but don't update/render
		animationFrameId = requestAnimationFrame(animate);
		return;
	}

	animationFrameId = requestAnimationFrame(animate);

	// Get time delta for animation updates
	const deltaTime = clock.getDelta();
	const elapsedTime = clock.getElapsedTime();

    // --- Debug Log for DeltaTime ---
    // console.log(`Animate Loop - deltaTime: ${deltaTime.toFixed(5)}`); // Uncomment for debugging

	// Update current animation
	const currentAnimationModule = window[`${currentAnimationType.toUpperCase()}_ANIMATION`];
	if (currentAnimationModule?.update) {
		try {
			currentAnimationModule.update(deltaTime, elapsedTime);
		} catch (error) {
			console.error(`Error during ${currentAnimationType} update:`, error);
			// Optionally pause or switch to a default animation on error
			// togglePause();
		}
	}

	// Render the scene to ASCII
	renderToAscii();

    // Add frame to GIF if recording
    addFrameToGif(); // Checks internally if recording is active
}

// --- Control Functions ---

function togglePause() {
	isPaused = !isPaused;
	uiElements.pausePlayButton.textContent = isPaused ? "Play" : "Pause";
	if (!isPaused) {
		// If resuming, restart the animation loop
		// clock.start(); // THREE.Clock doesn't have start/stop, getDelta handles pauses automatically
		animate(); // Request the next frame
	} else if (isPaused && animationFrameId) {
		// If pausing and loop is running, stop it
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
		// clock.stop(); // THREE.Clock doesn't have start/stop
	}
	console.log(isPaused ? "Animation Paused" : "Animation Resumed");
}

function randomizeParameters() {
	console.log("Randomizing parameters...");

	// 1. Randomize Global Controls (excluding animation type, resolution, zoom for now)
    if (uiElements.brightness) uiElements.brightness.value = Math.random().toFixed(2);
	if (uiElements.contrast) uiElements.contrast.value = (0.1 + Math.random() * 4.9).toFixed(1); // Range 0.1 to 5.0
	if (uiElements.invert) uiElements.invert.checked = Math.random() < 0.2; // 20% chance of being inverted
	if (uiElements.charset) {
        const charsetKeys = Object.keys(ASCII_CHARS_MAP);
        uiElements.charset.value = charsetKeys[Math.floor(Math.random() * charsetKeys.length)];
        // Update asciiChars immediately after changing select value
        asciiChars = ASCII_CHARS_MAP[uiElements.charset.value] || ASCII_CHARS_MAP.dense;
    }
	if (uiElements.renderTargetResolution) uiElements.renderTargetResolution.value = (0.5 + Math.random()).toFixed(2); // Range 0.5 to 1.5

	// Randomize Lighting
	if (uiElements.ambientIntensity) uiElements.ambientIntensity.value = (Math.random() * 2).toFixed(2);
	if (uiElements.directionalIntensity) uiElements.directionalIntensity.value = (Math.random() * 3).toFixed(1);
	if (uiElements.lightPosX) uiElements.lightPosX.value = (Math.random() * 20 - 10).toFixed(1); // -10 to 10
	if (uiElements.lightPosY) uiElements.lightPosY.value = (Math.random() * 20 - 10).toFixed(1);
	if (uiElements.lightPosZ) uiElements.lightPosZ.value = (Math.random() * 20 - 10).toFixed(1);

	// Trigger events for global controls to update UI/state AFTER setting values
	// Dispatch 'input' or 'change' events on the randomized global controls
    const globalControlsToDispatch = [
        uiElements.brightness, uiElements.contrast, uiElements.invert,
        uiElements.charset, uiElements.renderTargetResolution,
        uiElements.ambientIntensity, uiElements.directionalIntensity,
        uiElements.lightPosX, uiElements.lightPosY, uiElements.lightPosZ
    ];
    for (const control of globalControlsToDispatch) {
        if (control) {
            const eventType = (control.tagName === 'SELECT' || control.type === 'checkbox') ? 'change' : 'input';
            control.dispatchEvent(new Event(eventType, { bubbles: true }));
        }
    }
	updateAllValueDisplays(); // This should trigger listeners to update values/lights

	// 2. Select a Random Animation Type (excluding lighting itself)
    const availableAnimations = Object.keys(controlContainers).filter(key => key !== 'lighting');
	const randomType = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];

	// 3. Call the Randomize Function of the Selected Animation Module
	const randomModule = window[`${randomType.toUpperCase()}_ANIMATION`];
	if (randomModule?.randomize) { // Use optional chaining
		try {
            console.log(`Calling randomize for ${randomType} module...`);
			randomModule.randomize(); // Module handles its own sliders/selects and triggers events/updates
		} catch (error) {
			console.error(`Error randomizing ${randomType} module: ${error}`);
		}
	} else {
		console.warn(`Randomize function not found for module ${randomType}.`);
        // Fallback handled within module randomize functions now (setting values + dispatching)
	}

	// 4. Switch to the new animation type AFTER randomizing its parameters
    // The switchAnimation function calls setup, which should handle initial state
    // and call updateAllValueDisplays if necessary.
	switchAnimation(randomType);
}

// --- GIF Recording Functions ---
const toggleGifRecording = () => {
    if (isRecordingGif) {
        stopGifRecording();
    } else {
        startGifRecording();
    }
};

const startGifRecording = () => {
    if (isRecordingGif) return; // Already recording
    if (!downscaleCanvas || downscaleCanvas.width === 0 || downscaleCanvas.height === 0) {
        alert("Cannot record GIF: Canvas not ready or has zero dimensions.");
        return;
    }


    console.log("Starting GIF recording...");
    isRecordingGif = true;
    gifRecordStartTime = performance.now();
    lastGifFrameTime = gifRecordStartTime; // Initialize last frame time

    // Disable button and update text
    uiElements.recordGifButton.disabled = true;
    uiElements.recordGifButton.textContent = "Recording... (0%)";

    // Initialize GIFEncoder
    gifEncoder = new GIF({
        workers: 2, // Number of web workers to use
        quality: 10, // Lower quality for faster processing (1-30)
        width: downscaleCanvas.width, // Use downscale canvas size
        height: downscaleCanvas.height,
        workerScript: 'js/libs/gif.worker.js', // Verify this path is correct
        background: '#0d1117', // Match container background
        // dither: true, // Optional: Dithering method
    });

    // Add the first frame immediately
    addFrameToGif();

    // Event listener for GIF rendering progress
    gifEncoder.on('progress', (p) => {
        if (uiElements.recordGifButton.textContent.startsWith("Rendering")) {
            uiElements.recordGifButton.textContent = `Rendering... (${Math.round(p * 100)}%)`;
        }
    });

    // Event listener for GIF rendering finished
    gifEncoder.on('finished', (blob) => {
        console.log("GIF rendering finished.");
        const url = URL.createObjectURL(blob);
        // Create a link and trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = `ascii_animation_${Date.now()}.gif`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset button
        uiElements.recordGifButton.disabled = false;
        uiElements.recordGifButton.textContent = "Record GIF (5s)";
        gifEncoder = null; // Clear encoder reference
    });

    // Update button text periodically during recording phase
    const recordingInterval = setInterval(() => {
        if (!isRecordingGif || !uiElements.recordGifButton.textContent.startsWith("Recording")) {
            clearInterval(recordingInterval);
            return;
        }
        const elapsed = performance.now() - gifRecordStartTime;
        const progress = Math.min(100, Math.floor((elapsed / GIF_RECORD_DURATION) * 100));
        uiElements.recordGifButton.textContent = `Recording... (${progress}%)`;
    }, 250); // Update text 4 times per second
};

const addFrameToGif = () => {
    if (!gifEncoder || !downscaleCtx) return;
    // console.log("Adding frame to GIF"); // Can be noisy
    try {
        // Get the current frame from the downscale canvas context
        gifEncoder.addFrame(downscaleCtx, {
            copy: true, // Copy the pixels from the context
            delay: GIF_FRAME_DELAY, // Use the defined frame delay
        });
    } catch (error) {
        console.error("Error adding frame to GIF:", error);
        stopGifRecording(true); // Abort recording on error
    }
};

const stopGifRecording = (forceAbort = false) => {
    if (!isRecordingGif) return; // Not recording

    console.log(forceAbort ? "Aborting GIF recording." : "Stopping GIF recording, starting render...");
    isRecordingGif = false;

    if (forceAbort || !gifEncoder) {
        gifEncoder = null; // Ensure encoder is nullified
        // Reset button immediately if aborting
        uiElements.recordGifButton.disabled = false;
        uiElements.recordGifButton.textContent = "Record GIF (5s)";
        return;
    }

    // Start the rendering process
    uiElements.recordGifButton.textContent = "Rendering... (0%)";
    // Button remains disabled until 'finished' or error

    try {
        gifEncoder.render();
    } catch (error) {
        console.error("Error starting GIF render:", error);
        gifEncoder = null; // Nullify on error
        // Reset button on error
         uiElements.recordGifButton.disabled = false;
         uiElements.recordGifButton.textContent = "Record GIF (5s)";
    } finally {
        // Re-enable button after render attempt (success handled by 'finished' event)
         setTimeout(() => { // Delay slightly to allow 'finished' event to potentially reset first
             if (uiElements.recordGifButton.disabled && !gifEncoder) { // Only reset if still disabled AND encoder is finished/nulled
                 uiElements.recordGifButton.disabled = false;
                 if (uiElements.recordGifButton.textContent.startsWith("Rendering")) {
                    uiElements.recordGifButton.textContent = "Record GIF (5s)";
                 }
             }
         }, 500);
    }
};


// --- Preset Functions ---

function getAllControlValues() {
    const values = {
        // Include global controls
        resolution: uiElements.resolution.value,
        charset: uiElements.charset.value,
        brightness: uiElements.brightness.value,
        contrast: uiElements.contrast.value,
        zoom: uiElements.zoom.value,
        invert: uiElements.invert.checked,
        renderTargetResolution: uiElements.renderTargetResolution.value,
        animationType: currentAnimationType, // Store the type itself

        // Include lighting controls
        ambientIntensity: uiElements.ambientIntensity.value,
        directionalIntensity: uiElements.directionalIntensity.value,
        lightPosX: uiElements.lightPosX.value,
        lightPosY: uiElements.lightPosY.value,
        lightPosZ: uiElements.lightPosZ.value,
    };

    // Include controls for *all* animations, even inactive ones
    const allControls = [
        // Torus
        uiElements.torusSpeed, uiElements.torusThickness, uiElements.torusMajorRadius,
        uiElements.torusRoughness, uiElements.torusMetalness, uiElements.torusRotationAxis, uiElements.torusColorPicker,
        // Noise
        uiElements.noiseScale, uiElements.noiseSpeedX, uiElements.noiseSpeedY, uiElements.noiseBrightness, uiElements.noiseOctaves, // Added octaves
        // Particles
        uiElements.particleCount, uiElements.particleSize, uiElements.particleSpeed,
        uiElements.particleLifespan, uiElements.particleEmitterShape, uiElements.particleEmitterSize,
        uiElements.particleForceType, uiElements.particleForceStrength,
        // Kaleidoscope
        uiElements.kaleidoscopeSegments, uiElements.kaleidoscopeNoiseScale,
        uiElements.kaleidoscopeNoiseSpeedX, uiElements.kaleidoscopeNoiseSpeedY, uiElements.kaleidoscopeNoiseBrightness,
        // Morph
        uiElements.morphSpeed, uiElements.morphRotationSpeed, uiElements.morphComplexity, uiElements.morphColorPicker, // Added color picker
        // Metaballs
        uiElements.metaballsCount, uiElements.metaballsSize, uiElements.metaballsSpeed,
        uiElements.metaballsThreshold, uiElements.metaballsColor,
        // Lissajous
        uiElements.lissajousA, uiElements.lissajousB, uiElements.lissajousDelta,
        uiElements.lissajousAmpA, uiElements.lissajousAmpB, uiElements.lissajousSpeed,
        uiElements.lissajousPoints,
    ];

    for (const control of allControls) {
        if (control?.id) { // Use optional chaining
            values[control.id] = control.type === 'checkbox' ? control.checked : control.value;
        }
    }

    return values;
}

function applyControlValues(values) {
    if (!values) return;

    // Apply global controls first
    if (values.resolution !== undefined) uiElements.resolution.value = values.resolution;
    if (values.charset !== undefined) uiElements.charset.value = values.charset;
    if (values.brightness !== undefined) uiElements.brightness.value = values.brightness;
    if (values.contrast !== undefined) uiElements.contrast.value = values.contrast;
    if (values.zoom !== undefined) uiElements.zoom.value = values.zoom;
    if (values.invert !== undefined) uiElements.invert.checked = values.invert;
    if (values.renderTargetResolution !== undefined) uiElements.renderTargetResolution.value = values.renderTargetResolution;

    // Apply lighting controls
    if (values.ambientIntensity !== undefined) {
        uiElements.ambientIntensity.value = values.ambientIntensity;
        if (animationObjects.ambientLight) {
            animationObjects.ambientLight.intensity = Number.parseFloat(values.ambientIntensity);
        }
    }
    if (values.directionalIntensity !== undefined) {
        uiElements.directionalIntensity.value = values.directionalIntensity;
        if (animationObjects.directionalLight) {
            animationObjects.directionalLight.intensity = Number.parseFloat(values.directionalIntensity);
        }
    }
    if (values.lightPosX !== undefined) uiElements.lightPosX.value = values.lightPosX;
    if (values.lightPosY !== undefined) uiElements.lightPosY.value = values.lightPosY;
    if (values.lightPosZ !== undefined) uiElements.lightPosZ.value = values.lightPosZ;
    // Update directional light position if it exists
    if (animationObjects.directionalLight &&
        values.lightPosX !== undefined &&
        values.lightPosY !== undefined &&
        values.lightPosZ !== undefined) {
        animationObjects.directionalLight.position.set(
            Number.parseFloat(values.lightPosX),
            Number.parseFloat(values.lightPosY),
            Number.parseFloat(values.lightPosZ)
        );
    }


    // Apply animation-specific controls
    const allControls = [ /* ... same list as in getAllControlValues ... */
        // Torus
        uiElements.torusSpeed, uiElements.torusThickness, uiElements.torusMajorRadius,
        uiElements.torusRoughness, uiElements.torusMetalness, uiElements.torusRotationAxis, uiElements.torusColorPicker,
        // Noise
        uiElements.noiseScale, uiElements.noiseSpeedX, uiElements.noiseSpeedY, uiElements.noiseBrightness, uiElements.noiseOctaves, // Added octaves
        // Particles
        uiElements.particleCount, uiElements.particleSize, uiElements.particleSpeed,
        uiElements.particleLifespan, uiElements.particleEmitterShape, uiElements.particleEmitterSize,
        uiElements.particleForceType, uiElements.particleForceStrength,
        // Kaleidoscope
        uiElements.kaleidoscopeSegments, uiElements.kaleidoscopeNoiseScale,
        uiElements.kaleidoscopeNoiseSpeedX, uiElements.kaleidoscopeNoiseSpeedY, uiElements.kaleidoscopeNoiseBrightness,
        // Morph
        uiElements.morphSpeed, uiElements.morphRotationSpeed, uiElements.morphComplexity, uiElements.morphColorPicker, // Added color picker
        // Metaballs
        uiElements.metaballsCount, uiElements.metaballsSize, uiElements.metaballsSpeed,
        uiElements.metaballsThreshold, uiElements.metaballsColor,
        // Lissajous
        uiElements.lissajousA, uiElements.lissajousB, uiElements.lissajousDelta,
        uiElements.lissajousAmpA, uiElements.lissajousAmpB, uiElements.lissajousSpeed,
        uiElements.lissajousPoints,
    ];

    for (const control of allControls) {
        if (control?.id && values[control.id] !== undefined) { // Use optional chaining
            if (control.type === 'checkbox') {
                control.checked = values[control.id];
            } else {
                control.value = values[control.id];
            }
            // Dispatch input/change event to trigger handlers and UI updates
            const eventType = (control.tagName === 'SELECT' || control.type === 'checkbox' || control.type === 'color') ? 'change' : 'input'; // Added color type
            control.dispatchEvent(new Event(eventType, { bubbles: true }));
        }
    }

    // Update global state from loaded values
    if (values.charset !== undefined) {
        uiElements.charset.value = values.charset;
        asciiChars = ASCII_CHARS_MAP[values.charset] || ASCII_CHARS_MAP.dense;
    }
    if (camera && values.zoom !== undefined) camera.position.z = Number.parseFloat(values.zoom);
    setupRenderTargetAndCanvas(); // Update canvas/render target based on resolution

    // Switch to the correct animation type *last*
    if (values.animationType && values.animationType !== currentAnimationType) {
        switchAnimation(values.animationType);
    } else {
        // If type didn't change, ensure UI labels and handlers are updated
        updateAllValueDisplays();
        // Manually trigger param change for the current animation if needed
        // This might be redundant if dispatchEvent above already triggered it,
        // but ensures the module's state is consistent if dispatchEvent wasn't enough.
        const currentModule = window[`${currentAnimationType.toUpperCase()}_ANIMATION`];
        currentModule?.handleParamChange?.(); // Use optional chaining
    }
}


function getPresets() {
    const presetsJson = localStorage.getItem(PRESET_STORAGE_KEY);
    try {
        return presetsJson ? JSON.parse(presetsJson) : {};
    } catch (e) {
        console.error("Error parsing presets from localStorage:", e);
        return {}; // Return empty object on error
    }
}

function savePreset() {
    const presetName = uiElements.presetNameInput.value.trim();
    if (!presetName) {
        alert("Please enter a name for the preset.");
        return;
    }

    const presets = getPresets();
    presets[presetName] = getAllControlValues();

    try {
        localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
        console.log(`Preset "${presetName}" saved.`);
        updatePresetList(); // Refresh dropdown
        uiElements.presetNameInput.value = ""; // Clear input field
    } catch (error) {
        console.error("Error saving preset to localStorage:", error);
        alert("Failed to save preset. LocalStorage might be full or disabled.");
    }
}

function loadPreset() {
    const presetName = uiElements.presetLoadSelect.value;
    if (!presetName) {
        alert("Please select a preset to load.");
        return;
    }

    const presets = getPresets();
    const valuesToLoad = presets[presetName];

    if (valuesToLoad) {
        console.log(`Loading preset "${presetName}"...`);
        applyControlValues(valuesToLoad);
        console.log(`Preset "${presetName}" loaded.`);
    } else {
        alert(`Preset "${presetName}" not found.`);
    }
}

function deletePreset() {
    const presetName = uiElements.presetLoadSelect.value;
    if (!presetName) {
        alert("Please select a preset to delete.");
        return;
    }

    if (!confirm(`Are you sure you want to delete the preset "${presetName}"?`)) {
        return;
    }

    const presets = getPresets();
    if (presets[presetName]) {
        delete presets[presetName];
        try {
            localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(presets));
            console.log(`Preset "${presetName}" deleted.`);
            updatePresetList(); // Refresh dropdown
        } catch (error) {
            console.error("Error deleting preset from localStorage:", error);
            alert("Failed to delete preset.");
        }
    } else {
        alert(`Preset "${presetName}" not found.`);
    }
}

function updatePresetList() {
    const presets = getPresets();
    const select = uiElements.presetLoadSelect;
    if (!select) return; // Guard against missing element

    // Clear existing options (except the default)
    while (select.options.length > 1) {
        select.remove(1);
    }

    // Add options for each saved preset
    for (const name in presets) {
        // No need for hasOwnProperty check with for...in on JSON parsed object
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    }
    console.log("Preset list updated.");
}


// --- Start ---
// Use DOMContentLoaded to ensure all elements are available
document.addEventListener("DOMContentLoaded", init);
