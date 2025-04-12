import * as THREE from "three"; // Assuming THREE is available globally or via import

// --- Global Variables ---
let scene; // Declare variables separately
let camera;
let renderer;
let clock;
let renderTarget;
let downscaleCanvas;
let downscaleCtx;
let pixelData;
const ASCII_CHARS_MAP = {
	// Added from main.js for charset switching
	dense: "@%#*+=-:. ".split("").reverse().join(""),
	simple: "#=-. ".split("").reverse().join(""),
	blocks: "█▓▒░ ".split("").reverse().join(""),
	complex:
		"$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. "
			.split("")
			.reverse()
			.join(""),
	binary: "10".split("").reverse().join(""),
};
let asciiChars = ASCII_CHARS_MAP.dense; // Default character set
let isPaused = false;
let animationFrameId; // Keep as let, it's reassigned
let currentAnimationType = "lissajous"; // Default animation
// const lastTime = 0; // Unused variable

// --- DOM Elements ---
const uiElements = {
	display: document.getElementById("asciiDisplay"),
	displayContainer: document.getElementById("ascii-output-container"),
	resolution: document.getElementById("resolution-slider"),
	resolutionValue: document.getElementById("resolution-value"),
	charset: document.getElementById("charset-select"),
	brightness: document.getElementById("brightness-slider"), // Use ID from main.js version
	brightnessValue: document.getElementById("brightness-value"), // Added for consistency
	contrast: document.getElementById("contrast-slider"), // Use ID from main.js version
	contrastValue: document.getElementById("contrast-value"), // Added for consistency
	zoom: document.getElementById("zoom-slider"), // Use ID from main.js version
	zoomValue: document.getElementById("zoom-value"), // Added for consistency
	invert: document.getElementById("invert-brightness-checkbox"), // Use ID from main.js version
	renderTargetResolution: document.getElementById("renderTargetResolution"),
	renderTargetResolutionValue: document.getElementById(
		"renderTargetResolutionValue",
	),
	pausePlayButton: document.getElementById("pausePlayButton"),
	randomizeButton: document.getElementById("randomizeButton"),
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
	torusMajorRadius: document.getElementById("torusMajorRadius"),
	torusMajorRadiusValue: document.getElementById("torusMajorRadiusValue"),
	torusRotationAxis: document.getElementById("torusRotationAxis"),
	torusRoughness: document.getElementById("torus-roughness-slider"), // Added
	torusRoughnessValue: document.getElementById("torus-roughness-value"), // Added
	torusMetalness: document.getElementById("torus-metalness-slider"), // Added
	torusMetalnessValue: document.getElementById("torus-metalness-value"), // Added
	// Noise Specific
	noiseScale: document.getElementById("noise-scale-slider"),
	noiseScaleValue: document.getElementById("noise-scale-value"),
	noiseSpeed: document.getElementById("noise-speed-slider"),
	noiseSpeedValue: document.getElementById("noise-speed-value"),
	noiseBrightness: document.getElementById("noise-brightness-slider"),
	noiseBrightnessValue: document.getElementById("noise-brightness-value"),
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
	kaleidoscopeNoiseSpeed: document.getElementById(
		"kaleidoscope-noise-speed-slider",
	),
	kaleidoscopeNoiseSpeedValue: document.getElementById(
		"kaleidoscope-noise-speed-value",
	),
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
		"morph-rotation-speed-value",
	),
	morphComplexity: document.getElementById("morph-complexity-slider"), // Added
	morphComplexityValue: document.getElementById("morph-complexity-value"), // Added
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

// --- Animation Objects (Global container for current animation elements) ---
let animationObjects = {};

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
	sliderSpeed: uiElements.noiseSpeed,
	sliderBrightness: uiElements.noiseBrightness,
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
	sliderNoiseSpeed: uiElements.kaleidoscopeNoiseSpeed,
	sliderNoiseBrightness: uiElements.kaleidoscopeNoiseBrightness,
};

const morphControls = {
	sliderMorphSpeed: uiElements.morphSpeed,
	sliderRotationSpeed: uiElements.morphRotationSpeed,
	sliderComplexity: uiElements.morphComplexity, // Added
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
	valueA: uiElements.lissajousAValue,
	sliderB: uiElements.lissajousB,
	valueB: uiElements.lissajousBValue,
	sliderDelta: uiElements.lissajousDelta,
	valueDelta: uiElements.lissajousDeltaValue,
	sliderAmpA: uiElements.lissajousAmpA,
	valueAmpA: uiElements.lissajousAmpAValue,
	sliderAmpB: uiElements.lissajousAmpB,
	valueAmpB: uiElements.lissajousAmpBValue,
	sliderSpeed: uiElements.lissajousSpeed,
	sliderPoints: uiElements.lissajousPoints,
	valuePoints: uiElements.lissajousPointsValue,
};

// --- Initialization ---
function init() {
	console.log("Initializing ASCII Animator...");

	// Basic Three.js Setup
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000); // Black background
	clock = new THREE.Clock();

	// Camera Setup (Perspective)
	const aspect = 16 / 9; // Initial aspect ratio, will be updated
	camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
	camera.position.z = Number.parseFloat(uiElements.zoom.value) || 15; // Initial zoom from slider

	// Renderer Setup
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	renderer.setSize(512, 512); // Fixed internal size, adjust if needed
	renderer.setPixelRatio(window.devicePixelRatio);
	// Don't add renderer.domElement to the document body

	// Initial Render Target and Downscale Canvas Setup
	setupRenderTargetAndCanvas(); // Depends on renderer being initialized

	// Event Listeners
	setupEventListeners();

	// Initial UI Update
	updateAllValueDisplays();
	// Set initial charset based on dropdown
	asciiChars =
		ASCII_CHARS_MAP[uiElements.charset.value] || ASCII_CHARS_MAP.dense;
	updateUIForAnimationType(currentAnimationType);

	// Start
	switchAnimation(currentAnimationType); // Switch to the default selected animation
	animate();
}

// --- Event Listeners Setup ---
function setupEventListeners() {
	// General Controls
	uiElements.resolution.addEventListener("input", () => {
		uiElements.resolutionValue.textContent = uiElements.resolution.value;
		setupRenderTargetAndCanvas(); // ASCII grid size depends on this
	});
	uiElements.charset.addEventListener("change", (e) => {
		asciiChars = ASCII_CHARS_MAP[e.target.value] || ASCII_CHARS_MAP.dense;
	});
	uiElements.brightness.addEventListener("input", (e) => {
		uiElements.brightnessValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
	});
	uiElements.contrast.addEventListener("input", (e) => {
		uiElements.contrastValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
	});
	uiElements.zoom.addEventListener("input", (e) => {
		const zoomVal = Number.parseFloat(e.target.value);
		uiElements.zoomValue.textContent = zoomVal.toFixed(1);
		if (camera) camera.position.z = zoomVal;
	});
	uiElements.renderTargetResolution.addEventListener("input", (e) => {
		uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		setupRenderTargetAndCanvas(); // Render target size depends on this
	});
	// Invert checkbox has no value display, just checked state

	// Buttons
	uiElements.pausePlayButton.addEventListener("click", togglePause);
	uiElements.randomizeButton.addEventListener("click", randomizeParameters);

	// Animation Type Selector
	uiElements.animationType.addEventListener("change", (e) =>
		switchAnimation(e.target.value),
	);

	// Lighting Controls
	uiElements.ambientIntensity.addEventListener("input", (e) => {
		const intensity = Number.parseFloat(e.target.value);
		uiElements.ambientIntensityValue.textContent = intensity.toFixed(2);
		if (animationObjects.ambientLight) {
			animationObjects.ambientLight.intensity = intensity;
		}
	});
	uiElements.directionalIntensity.addEventListener("input", (e) => {
		const intensity = Number.parseFloat(e.target.value);
		uiElements.directionalIntensityValue.textContent = intensity.toFixed(1);
		if (animationObjects.directionalLight) {
			animationObjects.directionalLight.intensity = intensity;
		}
	});
	const lightPosSliders = [
		uiElements.lightPosX,
		uiElements.lightPosY,
		uiElements.lightPosZ,
	];
	// Use for...of loop
	for (const slider of lightPosSliders) {
		slider.addEventListener("input", () => {
			const x = Number.parseFloat(uiElements.lightPosX.value);
			const y = Number.parseFloat(uiElements.lightPosY.value);
			const z = Number.parseFloat(uiElements.lightPosZ.value);
			uiElements.lightPosXValue.textContent = x.toFixed(1);
			uiElements.lightPosYValue.textContent = y.toFixed(1);
			uiElements.lightPosZValue.textContent = z.toFixed(1);
			if (animationObjects.directionalLight) {
				animationObjects.directionalLight.position.set(x, y, z);
			}
		});
	}

	// --- Add listeners for Animation Specific Controls ---
	// These listeners often call the handle...Change function within the respective module
	// or update UI elements directly. Modules might add their own listeners too.

	// Torus
	uiElements.torusSpeed.addEventListener("input", (e) => {
		uiElements.torusSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		// Speed is read directly in updateTorusAnimation
		window.TORUS_ANIMATION?.handleSpeedChange?.(); // Call module handler if exists
	});
	uiElements.torusThickness.addEventListener("input", (e) => {
		uiElements.torusThicknessValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		window.TORUS_ANIMATION?.handleThicknessChange?.(); // Trigger recreation
	});
	uiElements.torusMajorRadius.addEventListener("input", (e) => {
		uiElements.torusMajorRadiusValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.TORUS_ANIMATION?.handleMajorRadiusChange?.(); // Trigger recreation
	});
	uiElements.torusRoughness.addEventListener("input", (e) => { // Added
		uiElements.torusRoughnessValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		window.TORUS_ANIMATION?.handleMaterialChange?.();
	});
	uiElements.torusMetalness.addEventListener("input", (e) => { // Added
		uiElements.torusMetalnessValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		window.TORUS_ANIMATION?.handleMaterialChange?.();
	});
	uiElements.torusRotationAxis.addEventListener("change", () => {
		// Axis is read directly in updateTorusAnimation
		window.TORUS_ANIMATION?.handleRotationAxisChange?.(); // Call module handler if exists
	});

	// Noise
	uiElements.noiseScale.addEventListener("input", (e) => {
		uiElements.noiseScaleValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.NOISE_ANIMATION?.handleParamChange?.();
	});
	uiElements.noiseSpeed.addEventListener("input", (e) => {
		uiElements.noiseSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Speed is read directly in updateNoiseAnimation
		window.NOISE_ANIMATION?.handleParamChange?.(); // Update uniform via handler
	});
	uiElements.noiseBrightness.addEventListener("input", (e) => {
		uiElements.noiseBrightnessValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.NOISE_ANIMATION?.handleParamChange?.();
	});

	// Particles
	uiElements.particleCount.addEventListener("input", (e) => {
		uiElements.particleCountValue.textContent = e.target.value;
		// Debounce or handle potential performance hit? For now, direct call.
		window.PARTICLES_ANIMATION?.handleCountChange?.(); // Trigger recreation
	});
	uiElements.particleSize.addEventListener("input", (e) => {
		uiElements.particleSizeValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.PARTICLES_ANIMATION?.handleParamChange?.();
	});
	uiElements.particleSpeed.addEventListener("input", (e) => {
		uiElements.particleSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Speed read in update loop
		window.PARTICLES_ANIMATION?.handleParamChange?.(); // Call handler if exists
	});
	uiElements.particleLifespan.addEventListener("input", (e) => {
		uiElements.particleLifespanValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Lifespan read in update loop
		window.PARTICLES_ANIMATION?.handleParamChange?.(); // Call handler if exists
	});
	uiElements.particleEmitterShape.addEventListener("change", () => {
		// Shape read in update loop for resetting particles
		window.PARTICLES_ANIMATION?.handleEmitterChange?.(); // Trigger recreation
	});
	uiElements.particleEmitterSize.addEventListener("input", (e) => {
		uiElements.particleEmitterSizeValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Size read in update loop
		window.PARTICLES_ANIMATION?.handleEmitterChange?.(); // Trigger recreation
	});
	uiElements.particleForceType.addEventListener("change", () => {
		// Force type read in update loop
		window.PARTICLES_ANIMATION?.handleParamChange?.(); // Call handler if exists
	});
	uiElements.particleForceStrength.addEventListener("input", (e) => {
		uiElements.particleForceStrengthValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Force strength read in update loop
		window.PARTICLES_ANIMATION?.handleParamChange?.(); // Call handler if exists
	});

	// Kaleidoscope
	uiElements.kaleidoscopeSegments.addEventListener("input", (e) => {
		uiElements.kaleidoscopeSegmentsValue.textContent = e.target.value;
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.();
	});
	uiElements.kaleidoscopeNoiseScale.addEventListener("input", (e) => {
		uiElements.kaleidoscopeNoiseScaleValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.();
	});
	uiElements.kaleidoscopeNoiseSpeed.addEventListener("input", (e) => {
		uiElements.kaleidoscopeNoiseSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Speed is used in update loop via uniform
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.(); // Update uniform
	});
	uiElements.kaleidoscopeNoiseBrightness.addEventListener("input", (e) => {
		uiElements.kaleidoscopeNoiseBrightnessValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.();
	});

	// Morph
	uiElements.morphSpeed.addEventListener("input", (e) => {
		uiElements.morphSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Speed read in update loop
		window.MORPH_ANIMATION?.handleSpeedChange?.(); // Call handler if exists
	});
	uiElements.morphRotationSpeed.addEventListener("input", (e) => {
		uiElements.morphRotationSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Speed read in update loop
		window.MORPH_ANIMATION?.handleRotationSpeedChange?.(); // Call handler if exists
	});
	if (uiElements.morphComplexity) { // If complexity slider exists
	    uiElements.morphComplexity.addEventListener('input', (e) => {
	        uiElements.morphComplexityValue.textContent = e.target.value;
	        window.MORPH_ANIMATION?.handleComplexityChange?.(); // Trigger recreation
	    });
	}

	// Metaballs
	uiElements.metaballsCount.addEventListener("input", (e) => {
		uiElements.metaballsCountValue.textContent = e.target.value;
		window.METABALLS_ANIMATION?.handleParamChange?.();
	});
	uiElements.metaballsSize.addEventListener("input", (e) => {
		uiElements.metaballsSizeValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.METABALLS_ANIMATION?.handleParamChange?.();
	});
	uiElements.metaballsSpeed.addEventListener("input", (e) => {
		uiElements.metaballsSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.METABALLS_ANIMATION?.handleParamChange?.();
	});
	uiElements.metaballsThreshold.addEventListener("input", (e) => {
		uiElements.metaballsThresholdValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		window.METABALLS_ANIMATION?.handleParamChange?.();
	});
	uiElements.metaballsColor.addEventListener("input", (e) => {
		uiElements.metaballsColorValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		window.METABALLS_ANIMATION?.handleParamChange?.();
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
		slider.addEventListener("input", () => {
			// Update labels (handled by module's handleLissajousParamChange)
			window.LISSAJOUS_ANIMATION?.handleParamChange?.();
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
	const display = uiElements.display;
	const container = uiElements.displayContainer;
	if (!container || !display) {
		console.error("Display elements not found!");
		return;
	}

	const containerWidth = container.clientWidth;
	const containerHeight = container.clientHeight;

	if (containerWidth <= 0 || containerHeight <= 0) {
		// console.warn("Container dimensions not available yet, deferring setup."); // Reduce noise
		requestAnimationFrame(setupRenderTargetAndCanvas); // Try again
		return;
	}
    // console.log(`Container dimensions: ${containerWidth}x${containerHeight}`); // Log dimensions

	// 1. Determine ASCII Grid Size (based on resolution slider and container aspect ratio)
	const asciiWidth = Number.parseInt(uiElements.resolution.value, 10); // Use radix 10
	const charAspectRatio = 0.6; // Estimate: Adjust based on font
	const calculatedHeight = Math.max(
		1,
		Math.round(
			(containerHeight / containerWidth) * asciiWidth * charAspectRatio,
		),
	);
    // console.log(`Calculated ASCII grid: ${asciiWidth}x${calculatedHeight}`); // Log grid size

	// 2. Determine Render Target Size (based on ASCII grid and scale factor)
	const renderScale = Number.parseFloat(
		uiElements.renderTargetResolution.value,
	);
	const renderWidth = Math.max(1, Math.floor(asciiWidth * renderScale));
	const renderHeight = Math.max(1, Math.floor(calculatedHeight * renderScale));

	// 3. Setup Render Target
	if (!renderTarget || renderTarget.width !== renderWidth || renderTarget.height !== renderHeight) {
		if (renderTarget) renderTarget.dispose(); // Dispose old one if exists
		renderTarget = new THREE.WebGLRenderTarget(renderWidth, renderHeight, {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.NearestFilter,
			format: THREE.RGBAFormat,
			type: THREE.UnsignedByteType, // Use UnsignedByteType for readRenderTargetPixels
		});
		console.log(`Render Target resized to: ${renderWidth}x${renderHeight}`);
	}

	// 4. Setup Downscale Canvas (matches ASCII grid size)
	if (!downscaleCanvas) {
		downscaleCanvas = document.createElement("canvas");
		downscaleCtx = downscaleCanvas.getContext("2d", {
			willReadFrequently: true,
		});
	}
	// Resize downscale canvas if needed
	if (downscaleCanvas.width !== asciiWidth || downscaleCanvas.height !== calculatedHeight) {
		downscaleCanvas.width = asciiWidth;
		downscaleCanvas.height = calculatedHeight;
		// Reallocate pixelData buffer if size changed
		pixelData = new Uint8ClampedArray(asciiWidth * calculatedHeight * 4);
		console.log(`Downscale Canvas resized to: ${asciiWidth}x${calculatedHeight}`);
	}


	// 5. Adjust Display Font Size to fit container
	// Calculate font size based on container width and ascii width
	const calculatedFontSizeW = containerWidth / asciiWidth;
	// Calculate font size based on container height and ascii height (considering line height)
	const lineHeight = 1.0; // Match CSS line-height
	const calculatedFontSizeH = containerHeight / (calculatedHeight * lineHeight);

	// Use the smaller of the two calculated font sizes to ensure it fits both ways
	const targetFontSize = Math.min(calculatedFontSizeW, calculatedFontSizeH);

	// Apply the calculated font size (with a minimum size)
	display.style.fontSize = `${Math.max(1, targetFontSize)}px`; // Ensure font size is at least 1px
    // console.log(`Font size set to: ${display.style.fontSize}`); // Log font size

    // Update camera aspect ratio based on container dimensions
    if (camera) {
        camera.aspect = containerWidth / containerHeight;
        camera.updateProjectionMatrix();
    }
}

// --- UI Update Functions ---
function updateAllValueDisplays() {
	// Trigger 'input' or 'change' event on all sliders/selects/checkboxes
	// to update their corresponding value spans using the existing listeners.
	// Use for...of loop
	for (const control of document.querySelectorAll(
		'input[type="range"], select, input[type="checkbox"]',
	)) {
		const eventType =
			control.type === "checkbox" || control.tagName === "SELECT"
				? "change"
				: "input";
		control.dispatchEvent(new Event(eventType, { bubbles: true }));
	}
	console.log("Initial UI values updated.");
}

function updateUIForAnimationType(type) {
	// Hide all animation-specific control sections
	// Use for...of loop
	for (const container of Object.values(controlContainers)) {
		if (container) container.classList.remove("active");
	}

	// Show the controls for the selected animation type
	const activeContainer = controlContainers[type];
	if (activeContainer) {
		activeContainer.classList.add("active");
		console.log(`Activated controls for: ${type}`);
	} else {
		console.warn(`Control container for animation type "${type}" not found.`);
	}

	// Conditionally show/hide lighting controls
	const usesLighting = !["noise", "kaleidoscope", "metaballs"].includes(type);
	if (controlContainers.lighting) {
		if (usesLighting) {
			controlContainers.lighting.classList.add("active");
		} else {
			controlContainers.lighting.classList.remove("active");
		}
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
	// Try calling the cleanup function from the previous animation's module
	const prevAnimationModule = window[`${prevAnimationType.toUpperCase()}_ANIMATION`]; // Use bracket notation
	if (prevAnimationModule?.cleanup) { // Use optional chaining
		try {
			prevAnimationModule.cleanup(scene); // Pass scene if needed
			console.log(`Cleaned up ${prevAnimationType} module.`);
		} catch (error) {
			console.error(
				`Error during ${prevAnimationType} module cleanup: ${error}`, // Use template literal
			);
		}
	} else {
		// Default cleanup if module or cleanup function doesn't exist
		console.log("Performing default scene cleanup.");
		if (scene) {
			// Check if scene exists
			// Use for...of loop for scene children removal
			const childrenToRemove = [...scene.children]; // Create a copy to iterate over
			for (const obj of childrenToRemove) {
				// Don't remove lights managed globally here
				if (obj !== animationObjects.ambientLight && obj !== animationObjects.directionalLight) {
					scene.remove(obj);
					if (obj.geometry) obj.geometry.dispose();
					if (obj.material) {
						if (Array.isArray(obj.material)) {
							for (const m of obj.material) {
								m.dispose();
							}
						} else {
							obj.material.dispose();
						}
					}
					// Dispose textures? Might be needed depending on animation
				}
			}
		}
	}
	animationObjects = {}; // Reset animation objects container

	// --- Setup new animation ---
	if (!scene) {
		// Ensure scene exists before adding lights/objects
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
	if (animationObjects.ambientLight) scene.remove(animationObjects.ambientLight);
	if (animationObjects.directionalLight) scene.remove(animationObjects.directionalLight);

	// Create or update lights and store references
	const ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(
		0xffffff,
		directionalIntensity,
	);
	directionalLight.position.set(lightX, lightY, lightZ);
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
	if (type === "noise" || type === "kaleidoscope") {
		newZoom = 5;
	} else if (type === "morph" || type === "torus" || type === "lissajous") {
		newZoom = 10;
	} else if (type === "metaballs" || type === "particles") { // Grouped similar zoom levels
		newZoom = 15;
	}
	if (camera) {
		camera.position.z = newZoom;
		camera.rotation.set(0, 0, 0); // Reset rotation
		uiElements.zoom.value = newZoom.toString(); // Sync slider
		uiElements.zoomValue.textContent = newZoom.toFixed(1); // Sync label
		camera.updateProjectionMatrix(); // Ensure matrix is updated after position change
	}

	// Update the UI to show the correct controls
	updateUIForAnimationType(type);
}

// --- Specific Animation Setup/Update Functions ---
// Remove placeholder functions like setupTorusAnimation, updateTorusAnimation, etc.
// The logic is now expected to be in the separate module files (torus.js, noise.js, etc.)
// and called via switchAnimation and the main animate loop.

// --- Core Rendering Logic ---

function renderToAscii() {
	if (
		!renderer ||
		!scene ||
		!camera ||
		!renderTarget ||
		!downscaleCtx ||
		!uiElements.display
	) {
		// console.warn("Render components not ready for ASCII conversion."); // Reduce console noise
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
		renderer.readRenderTargetPixels(
			renderTarget,
			0,
			0,
			rtWidth,
			rtHeight,
			buffer,
		);
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
	const tempCanvas = document.createElement("canvas"); // Consider reusing
	tempCanvas.width = rtWidth;
	tempCanvas.height = rtHeight;
	const tempCtx = tempCanvas.getContext("2d");
	const imageData = new ImageData(
		new Uint8ClampedArray(buffer.buffer), // Use buffer.buffer for underlying ArrayBuffer
		rtWidth,
		rtHeight,
	);
	tempCtx.putImageData(imageData, 0, 0);

	// Draw from temp canvas to downscale canvas (performs scaling)
	downscaleCtx.clearRect(0, 0, downscaleCanvas.width, downscaleCanvas.height);
	downscaleCtx.drawImage(
		tempCanvas,
		0,
		0,
		rtWidth,
		rtHeight,
		0,
		0,
		downscaleCanvas.width,
		downscaleCanvas.height,
	);

	// 4. Get pixel data from small canvas
	const smallImageData = downscaleCtx.getImageData(
		0,
		0,
		downscaleCanvas.width,
		downscaleCanvas.height,
	);
	pixelData = smallImageData.data; // Update pixelData reference

	// 5. Convert to ASCII
	const asciiWidth = downscaleCanvas.width;
	const asciiHeight = downscaleCanvas.height;
	let asciiString = "";
	const brightnessOffset = Number.parseFloat(uiElements.brightness.value) - 0.5; // Center offset around 0
	const contrastFactor = Number.parseFloat(uiElements.contrast.value);
	const invert = uiElements.invert.checked;
	const numChars = asciiChars.length; // Use length directly
	// const charLengthFactor = 1 / numChars; // Unused factor

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

			// Apply brightness offset
			brightness += brightnessOffset;

			// Clamp brightness
			brightness = Math.max(0, Math.min(1, brightness));

			// Invert if needed
			if (invert) {
				brightness = 1.0 - brightness;
			}

			// Map brightness to ASCII character
            // Avoid index out of bounds by clamping index calculation result
            const charIndex = Math.min(numChars - 1, Math.floor(brightness * numChars));
			asciiString += asciiChars[charIndex];
		}
		asciiString += "\n"; // Newline for each row
	}

	// 6. Display ASCII
	uiElements.display.textContent = asciiString;
}

// --- Animation Loop ---
function animate() { // Removed currentTime parameter as it's unused
	// Avoid parameter reassignment for currentTime
	const elapsedSeconds = clock.getElapsedTime(); // Use THREE.Clock's elapsed time
	const delta = clock.getDelta(); // Use THREE.Clock's delta time

	if (!isPaused) {
		// Update camera zoom (already handled by slider listener, but ensure matrix is updated)
		// camera.fov = 75 - Number.parseFloat(uiElements.zoom.value); // Adjust FOV based on zoom
		// camera.updateProjectionMatrix(); // FOV change requires projection matrix update

        // Subtle global camera rotation (can be overridden by specific animation updates)
        if (camera && currentAnimationType !== 'lissajous') { // Example: Don't apply global rotation to lissajous
            camera.rotation.y += delta * 0.01; // Slow rotation around Y axis
            camera.rotation.x += delta * 0.005; // Slow rotation around X axis
        }

        // Subtle background hue shift
        if (scene?.background) {
            const baseHue = 0.6; // Blueish base
            const hueShift = Math.sin(elapsedSeconds * 0.05) * 0.05; // Slow oscillation
            scene.background.setHSL((baseHue + hueShift) % 1.0, 0.1, 0.05); // Dark, low saturation
        }


		// Get the update function from the current animation's module
		const currentAnimationModule =
			window[`${currentAnimationType.toUpperCase()}_ANIMATION`]; // Use template literal for key
		if (currentAnimationModule?.update) { // Use optional chaining
			try {
				// Pass delta and elapsedTime (or just rely on global clock if modules use it)
				currentAnimationModule.update(delta, elapsedSeconds);
			} catch (error) {
				console.error(`Error during ${currentAnimationType} update:`, error); // Use template literal and log error object
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
	uiElements.brightness.value = Math.random().toFixed(2);
	uiElements.contrast.value = (0.1 + Math.random() * 4.9).toFixed(1); // Range 0.1 to 5.0
	uiElements.invert.checked = Math.random() < 0.2; // 20% chance of being inverted
	const charsetKeys = Object.keys(ASCII_CHARS_MAP);
	uiElements.charset.value =
		charsetKeys[Math.floor(Math.random() * charsetKeys.length)];
	uiElements.renderTargetResolution.value = (0.5 + Math.random()).toFixed(2); // Range 0.5 to 1.5

	// Randomize Lighting
	uiElements.ambientIntensity.value = (Math.random() * 2).toFixed(2);
	uiElements.directionalIntensity.value = (Math.random() * 3).toFixed(1);
	uiElements.lightPosX.value = (Math.random() * 20 - 10).toFixed(1); // -10 to 10
	uiElements.lightPosY.value = (Math.random() * 20 - 10).toFixed(1);
	uiElements.lightPosZ.value = (Math.random() * 20 - 10).toFixed(1);

	// Trigger events for global controls to update UI/state
	updateAllValueDisplays(); // This should trigger listeners to update values/lights

	// 2. Select a Random Animation Type
	const animationTypes = Object.keys(controlContainers);
	const randomType =
		animationTypes[Math.floor(Math.random() * animationTypes.length)];

	// 3. Call the Randomize Function of the Selected Animation Module
	const randomModule = window[`${randomType.toUpperCase()}_ANIMATION`];
	if (randomModule?.randomize) { // Use optional chaining
		try {
			randomModule.randomize(); // Module handles its own sliders/selects and triggers events
			console.log(`Called randomize for ${randomType} module.`);
		} catch (error) {
			console.error(`Error randomizing ${randomType} module: ${error}`);
		}
	} else {
		console.warn(`Randomize function not found for module ${randomType}.`);
		// Fallback: Manually randomize sliders in the active container if module func missing
		const activeContainer = controlContainers[randomType];
		if (activeContainer) {
			// Use for...of loop
			for (const slider of activeContainer.querySelectorAll('input[type="range"]')) {
				const min = Number.parseFloat(slider.min);
				const max = Number.parseFloat(slider.max);
				const step = Number.parseFloat(slider.step) || (max - min) / 100;
				const randomValue = min + Math.random() * (max - min);
				slider.value = (Math.round(randomValue / step) * step).toFixed(
					step.toString().includes(".")
						? step.toString().split(".")[1].length
						: 0,
				);
				slider.dispatchEvent(new Event("input", { bubbles: true }));
			}
			// Use for...of loop
			for (const select of activeContainer.querySelectorAll("select")) {
				select.selectedIndex = Math.floor(
					Math.random() * select.options.length,
				);
				select.dispatchEvent(new Event("change", { bubbles: true }));
			}
		}
	}

	// 4. Switch to the new animation type AFTER randomizing its parameters
	switchAnimation(randomType);
}

// --- Utility Functions ---
// (debounce, clamp, etc. if needed)

// --- Start ---
// Use DOMContentLoaded to ensure elements are ready, especially display dimensions
document.addEventListener("DOMContentLoaded", init);
