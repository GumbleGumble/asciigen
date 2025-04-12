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
const lastTime = 0; // For delta time calculation (currently unused, but kept for potential future use)

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

	// Lighting Controls
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

	// Animation Type Selector
	animationType: document.getElementById("animation-select"),

	// Control Buttons
	pausePlayButton: document.getElementById("pause-play-button"),
	randomizeButton: document.getElementById("randomize-button"),

	// Animation Control Sections (Containers)
	torusControls: document.getElementById("torus-controls"),
	noiseControls: document.getElementById("noise-controls"),
	particlesControls: document.getElementById("particles-controls"),
	kaleidoscopeControls: document.getElementById("kaleidoscope-controls"),
	morphControls: document.getElementById("morph-controls"),
	metaballsControls: document.getElementById("metaballs-controls"),
	lissajousControls: document.getElementById("lissajous-controls"),

	// Torus Controls
	torusSpeed: document.getElementById("torus-speed-slider"),
	torusSpeedValue: document.getElementById("torus-speed-value"),
	torusThickness: document.getElementById("torus-thickness-slider"),
	torusThicknessValue: document.getElementById("torus-thickness-value"),
	torusMajorRadius: document.getElementById("torusMajorRadius"), // Slider for major radius
	torusMajorRadiusValue: document.getElementById("torusMajorRadiusValue"), // Span for major radius value
	torusRoughness: document.getElementById("torus-roughness-slider"), // Added
	torusRoughnessValue: document.getElementById("torus-roughness-value"), // Added
	torusMetalness: document.getElementById("torus-metalness-slider"), // Added
	torusMetalnessValue: document.getElementById("torus-metalness-value"), // Added
	torusRotationAxis: document.getElementById("torus-rotation-axis"), // Added

	// Noise Controls
	noiseScale: document.getElementById("noise-scale-slider"),
	noiseScaleValue: document.getElementById("noise-scale-value"),
	noiseSpeed: document.getElementById("noise-speed-slider"),
	noiseSpeedValue: document.getElementById("noise-speed-value"),
	noiseBrightness: document.getElementById("noise-brightness-slider"),
	noiseBrightnessValue: document.getElementById("noise-brightness-value"),

	// Particle Controls
	particleCount: document.getElementById("particles-count-slider"),
	particleCountValue: document.getElementById("particles-count-value"),
	particleSize: document.getElementById("particles-size-slider"),
	particleSizeValue: document.getElementById("particle-size-value"),
	particleSpeed: document.getElementById("particles-speed-slider"),
	particleSpeedValue: document.getElementById("particles-speed-value"),
	particleLifespan: document.getElementById("particles-lifespan-slider"),
	particleLifespanValue: document.getElementById("particles-lifespan-value"),
	emitterShape: document.getElementById("particles-emitter-shape"),
	emitterSize: document.getElementById("particles-emitter-size-slider"),
	particleEmitterSizeValue: document.getElementById(
		"particle-emitter-size-value",
	),
	forceType: document.getElementById("particles-force-type"),
	forceStrength: document.getElementById("particles-force-strength-slider"),
	particleForceStrengthValue: document.getElementById(
		"particle-force-strength-value",
	),

	// Kaleidoscope Controls
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

	// Morph Controls
	morphSpeed: document.getElementById("morph-speed-slider"),
	morphSpeedValue: document.getElementById("morph-speed-value"),
	morphRotationSpeed: document.getElementById("morph-rotation-slider"),
	morphRotationSpeedValue: document.getElementById(
		"morph-rotation-speed-value",
	),
	morphComplexity: document.getElementById("morph-complexity-slider"), // Uncommented
	morphComplexityValue: document.getElementById("morphComplexityValue"), // Uncommented

	// Metaballs Controls
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

	// Lissajous Controls
	lissajousA: document.getElementById("lissajous-a-slider"), // Use ID from main.js version
	lissajousAValue: document.getElementById("lj-a-value"), // Use ID from main.js version
	lissajousB: document.getElementById("lissajous-b-slider"), // Use ID from main.js version
	lissajousBValue: document.getElementById("lj-b-value"), // Use ID from main.js version
	lissajousDelta: document.getElementById("lissajous-delta-slider"), // Use ID from main.js version
	lissajousDeltaValue: document.getElementById("lj-delta-value"), // Use ID from main.js version
	lissajousAmpA: document.getElementById("lissajous-ampA-slider"), // Use ID from main.js version
	lissajousAmpAValue: document.getElementById("lj-ampA-value"), // Use ID from main.js version
	lissajousAmpB: document.getElementById("lissajous-ampB-slider"), // Use ID from main.js version
	lissajousAmpBValue: document.getElementById("lj-ampB-value"), // Use ID from main.js version
	lissajousSpeed: document.getElementById("lissajous-speed-slider"), // Use ID from main.js version ('lissajous-speed-slider')
	lissajousSpeedValue: document.getElementById("lj-speed-value"), // Added
	lissajousPoints: document.getElementById("lissajous-points-slider"), // Use ID from main.js version
	lissajousPointsValue: document.getElementById("lj-points-value"), // Use ID from main.js version
};

// --- Global Animation Objects (used by modules) ---
// This mirrors the structure used in main.js and the animation modules
let animationObjects = {};
const torusControls = {
	// Match structure expected by torus.js
	sliderSpeed: uiElements.torusSpeed,
	sliderThickness: uiElements.torusThickness,
	valueThickness: uiElements.torusThicknessValue,
	sliderRoughness: uiElements.torusRoughness, // Added
	sliderMetalness: uiElements.torusMetalness, // Added
};
const noiseControls = {
	// Match structure expected by noise.js
	sliderScale: uiElements.noiseScale,
	sliderSpeed: uiElements.noiseSpeed,
	sliderBrightness: uiElements.noiseBrightness,
};
const particlesControls = {
	// Match structure expected by particles.js
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
const kaleidoscopeControls = {
	// Match structure expected by kaleidoscope.js
	sliderSegments: uiElements.kaleidoscopeSegments,
	sliderNoiseScale: uiElements.kaleidoscopeNoiseScale,
	sliderNoiseSpeed: uiElements.kaleidoscopeNoiseSpeed,
	sliderNoiseBrightness: uiElements.kaleidoscopeNoiseBrightness,
};
const morphControls = {
	// Match structure expected by morph.js
	sliderMorphSpeed: uiElements.morphSpeed,
	sliderRotationSpeed: uiElements.morphRotationSpeed,
	sliderComplexity: uiElements.morphComplexity, // Uncommented
};
const metaballsControls = {
	// Match structure expected by metaballs.js
	sliderCount: uiElements.metaballsCount,
	valueCount: uiElements.metaballsCountValue,
	sliderSize: uiElements.metaballsSize,
	valueSize: uiElements.metaballsSizeValue,
	sliderSpeed: uiElements.metaballsSpeed,
	valueSpeed: uiElements.metaballsSpeedValue, // Added for consistency
	sliderThreshold: uiElements.metaballsThreshold,
	valueThreshold: uiElements.metaballsThresholdValue,
	sliderColor: uiElements.metaballsColor,
	valueColor: uiElements.metaballsColorValue, // Added for consistency
};
const lissajousControls = {
	// Match structure expected by lissajous.js
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
	sliderSpeed: uiElements.lissajousSpeed, // Renamed from sliderDrawSpeed
	valueSpeed: uiElements.lissajousSpeedValue, // Added
	sliderPoints: uiElements.lissajousPoints, // Renamed from sliderPointCount
	valuePoints: uiElements.lissajousPointsValue, // Renamed from sliderPointCountValue
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
		console.warn("Container dimensions not available yet, deferring setup.");
		requestAnimationFrame(setupRenderTargetAndCanvas); // Try again
		return;
	}

	// 1. Determine ASCII Grid Size (based on resolution slider and container aspect ratio)
	const asciiWidth = Number.parseInt(uiElements.resolution.value);
	const charAspectRatio = 0.6; // Estimate: Adjust based on font
	const calculatedHeight = Math.max(
		1,
		Math.round(
			(containerHeight / containerWidth) * asciiWidth * charAspectRatio,
		),
	);

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
	// Use the smaller font size to ensure the grid fits both horizontally and vertically
	const calculatedFontSize = Math.min(calculatedFontSizeW, calculatedFontSizeH);

	// Apply minimum font size if needed
	const minFontSize = 2; // Prevent excessively small fonts
	display.style.fontSize = `${Math.max(minFontSize, calculatedFontSize)}px`;
	display.style.lineHeight = `${lineHeight}`; // Ensure line height matches calculation

	console.log(
		`Container: ${containerWidth}x${containerHeight}, RenderTarget: ${renderWidth}x${renderHeight}, ASCII Grid: ${asciiWidth}x${calculatedHeight}, Font Size: ${display.style.fontSize}`,
	);

	// Update camera aspect ratio based on render target, not container
	if (camera) {
		camera.aspect = renderWidth / renderHeight;
		camera.updateProjectionMatrix();
	}
}

// --- Event Listeners ---
function setupEventListeners() {
	// General Controls
	uiElements.resolution.addEventListener("input", (e) => {
		uiElements.resolutionValue.textContent = e.target.value;
		// Debounce or directly call setup? Direct call for now.
		setupRenderTargetAndCanvas();
	});
	uiElements.charset.addEventListener("change", (e) => {
		asciiChars = ASCII_CHARS_MAP[e.target.value] || ASCII_CHARS_MAP.dense;
	});
	uiElements.brightness.addEventListener("input", (e) => {
		uiElements.brightnessValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		// Brightness logic handled in renderToAscii
	});
	uiElements.contrast.addEventListener("input", (e) => {
		uiElements.contrastValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Contrast logic handled in renderToAscii
	});
	uiElements.zoom.addEventListener("input", (e) => {
		const zoomValue = Number.parseFloat(e.target.value);
		if (uiElements.zoomValue)
			uiElements.zoomValue.textContent = zoomValue.toFixed(1);
		if (camera) {
			camera.position.z = zoomValue;
		}
	});
	uiElements.invert.addEventListener("change", (e) => {
		// Invert logic handled in renderToAscii
	});
	uiElements.renderTargetResolution.addEventListener("input", (e) => {
		uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		setupRenderTargetAndCanvas(); // Recreate render target and canvas
	});

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
	uiElements.lightPosX.addEventListener("input", (e) => {
		const value = Number.parseFloat(e.target.value);
		uiElements.lightPosXValue.textContent = value.toFixed(1);
		if (animationObjects.directionalLight) {
			animationObjects.directionalLight.position.x = value;
		}
	});
	uiElements.lightPosY.addEventListener("input", (e) => {
		const value = Number.parseFloat(e.target.value);
		uiElements.lightPosYValue.textContent = value.toFixed(1);
		if (animationObjects.directionalLight) {
			animationObjects.directionalLight.position.y = value;
		}
	});
	uiElements.lightPosZ.addEventListener("input", (e) => {
		const value = Number.parseFloat(e.target.value);
		uiElements.lightPosZValue.textContent = value.toFixed(1);
		if (animationObjects.directionalLight) {
			animationObjects.directionalLight.position.z = value;
		}
	});

	// Animation Type Change
	uiElements.animationType.addEventListener("change", (e) => {
		switchAnimation(e.target.value);
	});

	// Control Buttons
	uiElements.pausePlayButton.addEventListener("click", togglePause);
	uiElements.randomizeButton.addEventListener("click", randomizeParameters);

	// Window Resize
	let resizeTimeout;
	window.addEventListener("resize", () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = setTimeout(() => {
			console.log("Window resized, updating layout...");
			setupRenderTargetAndCanvas(); // Recalculate everything based on new container size
		}, 150); // Debounce resize event
	});

	// --- Animation Specific Listeners ---
	// These listeners call the handlers defined in the respective animation modules.

	// Torus
	uiElements.torusSpeed.addEventListener("input", (e) => {
		uiElements.torusSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(2);
		// Speed is read directly in updateTorusAnimation
	});
	uiElements.torusThickness.addEventListener("input", (e) => {
		window.TORUS_ANIMATION?.handleThicknessChange?.(); // Calls geometry update
	});
	uiElements.torusMajorRadius.addEventListener("input", (e) => {
		window.TORUS_ANIMATION?.handleMajorRadiusChange?.(); // Calls geometry update
	});
	uiElements.torusRoughness.addEventListener("input", (e) => {
		window.TORUS_ANIMATION?.handleMaterialChange?.();
	});
	uiElements.torusMetalness.addEventListener("input", (e) => {
		window.TORUS_ANIMATION?.handleMaterialChange?.();
	});
	uiElements.torusRotationAxis.addEventListener("change", (e) => {
		// Axis is read directly in updateTorusAnimation
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
		window.NOISE_ANIMATION?.handleParamChange?.(); // Update speed uniform
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
		// Debounce this? It requires recreating the system.
		// Add debounce if performance is an issue
		window.PARTICLES_ANIMATION?.handleCountChange?.();
	});
	uiElements.particleSize.addEventListener("input", (e) => {
		uiElements.particleSizeValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		window.PARTICLES_ANIMATION?.handleSizeChange?.();
	});
	uiElements.particleSpeed.addEventListener("input", (e) => {
		uiElements.particleSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Speed is read directly in updateParticlesAnimation
	});
	uiElements.particleLifespan.addEventListener("input", (e) => {
		uiElements.particleLifespanValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Lifespan is read directly in updateParticlesAnimation
	});
	uiElements.emitterShape.addEventListener("change", (e) => {
		window.PARTICLES_ANIMATION?.handleEmitterChange?.(); // Requires restart
	});
	uiElements.emitterSize.addEventListener("input", (e) => {
		uiElements.particleEmitterSizeValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Size change also requires restart in current setup
		window.PARTICLES_ANIMATION?.handleEmitterChange?.();
	});
	uiElements.forceType.addEventListener("change", (e) => {
		// Force type is read directly in updateParticlesAnimation
	});
	uiElements.forceStrength.addEventListener("input", (e) => {
		uiElements.particleForceStrengthValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Force strength is read directly in updateParticlesAnimation
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
		window.KALEIDOSCOPE_ANIMATION?.handleParamChange?.(); // Update speed uniform
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
		// Speed read directly in updateMorphAnimation
	});
	uiElements.morphRotationSpeed.addEventListener("input", (e) => {
		uiElements.morphRotationSpeedValue.textContent = Number.parseFloat(
			e.target.value,
		).toFixed(1);
		// Rotation speed read directly in updateMorphAnimation
	});
	uiElements.morphComplexity.addEventListener("input", (e) => {
		uiElements.morphComplexityValue.textContent = e.target.value;
		// Debounce this? Requires recreating geometry.
		window.MORPH_ANIMATION?.handleComplexityChange?.();
	});

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
		window.METABALLS_ANIMATION?.handleParamChange?.(); // Update speed uniform
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
	const lissajousSliders = [
		uiElements.lissajousA,
		uiElements.lissajousB,
		uiElements.lissajousDelta,
		uiElements.lissajousAmpA,
		uiElements.lissajousAmpB,
		uiElements.lissajousSpeed,
		uiElements.lissajousPoints,
	];
	for (const slider of lissajousSliders) {
		slider.addEventListener("input", (e) => {
			// Update corresponding value display
			const valueSpanId = slider.id.replace("-slider", "-value");
			const valueSpan = document.getElementById(valueSpanId);
			if (valueSpan) {
				if (slider === uiElements.lissajousDelta) {
					valueSpan.textContent = `${(Number.parseFloat(e.target.value) / Math.PI).toFixed(2)} PI`;
				} else if (
					slider === uiElements.lissajousAmpA ||
					slider === uiElements.lissajousAmpB ||
					slider === uiElements.lissajousSpeed
				) {
					valueSpan.textContent = Number.parseFloat(e.target.value).toFixed(1);
				} else {
					valueSpan.textContent = e.target.value;
				}
			}
			// Call the central handler in lissajous.js
			window.LISSAJOUS_ANIMATION?.handleParamChange?.();
		});
	}
}

// --- UI Update Functions ---
function updateAllValueDisplays() {
	// Update general controls
	if (uiElements.resolutionValue)
		uiElements.resolutionValue.textContent = uiElements.resolution.value;
	if (uiElements.brightnessValue)
		uiElements.brightnessValue.textContent = Number.parseFloat(
			uiElements.brightness.value,
		).toFixed(2);
	if (uiElements.contrastValue)
		uiElements.contrastValue.textContent = Number.parseFloat(
			uiElements.contrast.value,
		).toFixed(1);
	if (uiElements.zoomValue)
		uiElements.zoomValue.textContent = Number.parseFloat(
			uiElements.zoom.value,
		).toFixed(1);
	if (uiElements.renderTargetResolutionValue)
		uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(
			uiElements.renderTargetResolution.value,
		).toFixed(2);

	// Update lighting controls
	if (uiElements.ambientIntensityValue)
		uiElements.ambientIntensityValue.textContent = Number.parseFloat(
			uiElements.ambientIntensity.value,
		).toFixed(2);
	if (uiElements.directionalIntensityValue)
		uiElements.directionalIntensityValue.textContent = Number.parseFloat(
			uiElements.directionalIntensity.value,
		).toFixed(1);
	if (uiElements.lightPosXValue)
		uiElements.lightPosXValue.textContent = Number.parseFloat(
			uiElements.lightPosX.value,
		).toFixed(1);
	if (uiElements.lightPosYValue)
		uiElements.lightPosYValue.textContent = Number.parseFloat(
			uiElements.lightPosY.value,
		).toFixed(1);
	if (uiElements.lightPosZValue)
		uiElements.lightPosZValue.textContent = Number.parseFloat(
			uiElements.lightPosZ.value,
		).toFixed(1);

	// Update animation-specific controls (ensure elements exist)
	if (uiElements.torusSpeedValue)
		uiElements.torusSpeedValue.textContent = Number.parseFloat(
			uiElements.torusSpeed.value,
		).toFixed(2);
	if (uiElements.torusThicknessValue)
		uiElements.torusThicknessValue.textContent = Number.parseFloat(
			uiElements.torusThickness.value,
		).toFixed(2);
	if (uiElements.torusMajorRadiusValue)
		uiElements.torusMajorRadiusValue.textContent = Number.parseFloat(
			uiElements.torusMajorRadius.value,
		).toFixed(1);
	if (uiElements.torusRoughnessValue)
		uiElements.torusRoughnessValue.textContent = Number.parseFloat(
			uiElements.torusRoughness.value,
		).toFixed(2);
	if (uiElements.torusMetalnessValue)
		uiElements.torusMetalnessValue.textContent = Number.parseFloat(
			uiElements.torusMetalness.value,
		).toFixed(2);


	if (uiElements.noiseScaleValue)
		uiElements.noiseScaleValue.textContent = Number.parseFloat(
			uiElements.noiseScale.value,
		).toFixed(1);
	if (uiElements.noiseSpeedValue)
		uiElements.noiseSpeedValue.textContent = Number.parseFloat(
			uiElements.noiseSpeed.value,
		).toFixed(1);
	if (uiElements.noiseBrightnessValue)
		uiElements.noiseBrightnessValue.textContent = Number.parseFloat(
			uiElements.noiseBrightness.value,
		).toFixed(1);

	if (uiElements.particleCountValue)
		uiElements.particleCountValue.textContent = uiElements.particleCount.value;
	if (uiElements.particleSizeValue)
		uiElements.particleSizeValue.textContent = Number.parseFloat(
			uiElements.particleSize.value,
		).toFixed(1);
	if (uiElements.particleSpeedValue)
		uiElements.particleSpeedValue.textContent = Number.parseFloat(
			uiElements.particleSpeed.value,
		).toFixed(1);
	if (uiElements.particleLifespanValue)
		uiElements.particleLifespanValue.textContent = Number.parseFloat(
			uiElements.particleLifespan.value,
		).toFixed(1);
	if (uiElements.particleEmitterSizeValue)
		uiElements.particleEmitterSizeValue.textContent = Number.parseFloat(
			uiElements.emitterSize.value,
		).toFixed(1);
	if (uiElements.particleForceStrengthValue)
		uiElements.particleForceStrengthValue.textContent = Number.parseFloat(
			uiElements.forceStrength.value,
		).toFixed(1);

	if (uiElements.kaleidoscopeSegmentsValue)
		uiElements.kaleidoscopeSegmentsValue.textContent =
			uiElements.kaleidoscopeSegments.value;
	if (uiElements.kaleidoscopeNoiseScaleValue)
		uiElements.kaleidoscopeNoiseScaleValue.textContent = Number.parseFloat(
			uiElements.kaleidoscopeNoiseScale.value,
		).toFixed(1);
	if (uiElements.kaleidoscopeNoiseSpeedValue)
		uiElements.kaleidoscopeNoiseSpeedValue.textContent = Number.parseFloat(
			uiElements.kaleidoscopeNoiseSpeed.value,
		).toFixed(1);
	if (uiElements.kaleidoscopeNoiseBrightnessValue)
		uiElements.kaleidoscopeNoiseBrightnessValue.textContent = Number.parseFloat(
			uiElements.kaleidoscopeNoiseBrightness.value,
		).toFixed(1);

	if (uiElements.morphSpeedValue)
		uiElements.morphSpeedValue.textContent = Number.parseFloat(
			uiElements.morphSpeed.value,
		).toFixed(1);
	if (uiElements.morphRotationSpeedValue)
		uiElements.morphRotationSpeedValue.textContent = Number.parseFloat(
			uiElements.morphRotationSpeed.value,
		).toFixed(1);
	if (uiElements.morphComplexityValue) uiElements.morphComplexityValue.textContent = uiElements.morphComplexity.value; // If uncommented

	if (uiElements.metaballsCountValue)
		uiElements.metaballsCountValue.textContent =
			uiElements.metaballsCount.value;
	if (uiElements.metaballsSizeValue)
		uiElements.metaballsSizeValue.textContent = Number.parseFloat(
			uiElements.metaballsSize.value,
		).toFixed(1);
	if (uiElements.metaballsSpeedValue)
		uiElements.metaballsSpeedValue.textContent = Number.parseFloat(
			uiElements.metaballsSpeed.value,
		).toFixed(1);
	if (uiElements.metaballsThresholdValue)
		uiElements.metaballsThresholdValue.textContent = Number.parseFloat(
			uiElements.metaballsThreshold.value,
		).toFixed(2);
	if (uiElements.metaballsColorValue)
		uiElements.metaballsColorValue.textContent = Number.parseFloat(
			uiElements.metaballsColor.value,
		).toFixed(2);

	if (uiElements.lissajousAValue)
		uiElements.lissajousAValue.textContent = uiElements.lissajousA.value;
	if (uiElements.lissajousBValue)
		uiElements.lissajousBValue.textContent = uiElements.lissajousB.value;
	if (uiElements.lissajousDeltaValue)
		uiElements.lissajousDeltaValue.textContent = `${(Number.parseFloat(uiElements.lissajousDelta.value) / Math.PI).toFixed(2)} PI`;
	if (uiElements.lissajousAmpAValue)
		uiElements.lissajousAmpAValue.textContent = Number.parseFloat(
			uiElements.lissajousAmpA.value,
		).toFixed(1);
	if (uiElements.lissajousAmpBValue)
		uiElements.lissajousAmpBValue.textContent = Number.parseFloat(
			uiElements.lissajousAmpB.value,
		).toFixed(1);
	if (uiElements.lissajousSpeedValue) // Corrected name
		uiElements.lissajousSpeedValue.textContent = Number.parseFloat(
			uiElements.lissajousSpeed.value, // Corrected name
		).toFixed(1);
	if (uiElements.lissajousPointsValue) // Corrected name
		uiElements.lissajousPointsValue.textContent =
			uiElements.lissajousPoints.value; // Corrected name
}

function updateUIForAnimationType(type) {
	// Hide all animation-specific control sections
	const controlSections = document.querySelectorAll(".animation-controls");
	for (const section of controlSections) {
		section.style.display = "none";
	}

	// Show the controls for the selected animation type
	let controlsToShow = null;
	let specificControlIds = []; // Keep track of active controls for randomization

	switch (type) {
		case "torus":
			controlsToShow = uiElements.torusControls;
			specificControlIds = [
				"torusSpeed",
				"torusThickness",
				"torusMajorRadius",
				"torusRoughness",
				"torusMetalness",
				"torusRotationAxis",
			];
			break;
		case "noise":
			controlsToShow = uiElements.noiseControls;
			specificControlIds = [
				"noiseScale",
				"noiseSpeed",
				"noiseBrightness",
			];
			break;
		case "particles":
			controlsToShow = uiElements.particlesControls;
			specificControlIds = [
				"particleCount",
				"particleSize",
				"particleSpeed",
				"particleLifespan",
				"emitterShape",
				"emitterSize",
				"forceType",
				"forceStrength",
			];
			break;
		case "kaleidoscope":
			controlsToShow = uiElements.kaleidoscopeControls;
			specificControlIds = [
				"kaleidoscopeSegments",
				"kaleidoscopeNoiseScale",
				"kaleidoscopeNoiseSpeed",
				"kaleidoscopeNoiseBrightness",
			];
			break;
		case "morph":
			controlsToShow = uiElements.morphControls;
			specificControlIds = [
				"morphSpeed",
				"morphRotationSpeed",
				"morphComplexity",
			]; // Add morphComplexity if control exists
			break;
		case "metaballs":
			controlsToShow = uiElements.metaballsControls;
			specificControlIds = [
				"metaballsCount",
				"metaballsSize",
				"metaballsSpeed",
				"metaballsThreshold",
				"metaballsColor",
			];
			break;
		case "lissajous":
			controlsToShow = uiElements.lissajousControls;
			specificControlIds = [
				"lissajousA",
				"lissajousB",
				"lissajousDelta",
				"lissajousAmpA",
				"lissajousAmpB",
				"lissajousSpeed", // Corrected name
				"lissajousPoints", // Corrected name
			];
			break;
		// Add case for 'metaballs' if integrating
	}

	if (controlsToShow) {
		controlsToShow.style.display = "block";
		// The activeControls logic seems redundant if randomization calls module functions directly
		// activeControls = []; // Reset active controls
		// for (const id of specificControlIds) {
		//     if (uiElements[id]) {
		//         activeControls.push(uiElements[id]);
		//     }
		// }
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
	const prevAnimationModule =
		window[prevAnimationType.toUpperCase() + "_ANIMATION"]; // Use bracket notation
	if (
		prevAnimationModule &&
		typeof prevAnimationModule.cleanup === "function"
	) {
		try {
			prevAnimationModule.cleanup(scene); // Pass scene if needed
		} catch (error) {
			console.error(
				`Error during ${prevAnimationType} module cleanup: ${error}`,
			); // Use template literal
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

	// Add basic lighting (modules might add/remove their own)
	// Use initial values from sliders
	const ambientIntensity = Number.parseFloat(uiElements.ambientIntensity.value);
	const directionalIntensity = Number.parseFloat(
		uiElements.directionalIntensity.value,
	);
	const lightX = Number.parseFloat(uiElements.lightPosX.value);
	const lightY = Number.parseFloat(uiElements.lightPosY.value);
	const lightZ = Number.parseFloat(uiElements.lightPosZ.value);

	// Remove existing lights before adding new ones to avoid duplicates
	if (animationObjects.ambientLight) scene.remove(animationObjects.ambientLight);
	if (animationObjects.directionalLight) scene.remove(animationObjects.directionalLight);


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
	if (
		currentAnimationModule &&
		typeof currentAnimationModule.setup === "function"
	) {
		try {
			// Call the module's setup function. It might rely on global scene, camera, renderer, clock, controls objects.
			currentAnimationModule.setup();
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
	const charLengthFactor = 1 / numChars; // Precompute factor

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
function animate(currentTime) {
	// Avoid parameter reassignment for currentTime
	const elapsedSeconds = clock.getElapsedTime(); // Use THREE.Clock's elapsed time
	const delta = clock.getDelta(); // Use THREE.Clock's delta time

	if (!isPaused) {
		// Update camera zoom (already handled by slider listener, but ensure matrix is updated)
		// camera.fov = 75 - Number.parseFloat(uiElements.zoom.value); // Adjust FOV based on zoom
		// camera.updateProjectionMatrix(); // FOV change requires projection matrix update

		// Get the update function from the current animation's module
		const currentAnimationModule =
			window[`${currentAnimationType.toUpperCase()}_ANIMATION`]; // Use template literal for key
		if (
			currentAnimationModule &&
			typeof currentAnimationModule.update === "function"
		) {
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
		// clock.start(); // Restart clock? Or just resume animation loop? Resuming loop is usually enough.
		animate(); // Restart animation loop if paused
	} else {
		cancelAnimationFrame(animationFrameId); // Stop loop if pausing
		// clock.stop(); // Stop clock?
	}
	console.log(isPaused ? "Animation Paused" : "Animation Resumed");
}

function randomizeParameters() {
	console.log(`Randomizing parameters for ${currentAnimationType}...`);

	// Call the randomize function from the current animation's module
	const currentAnimationModule =
		window[`${currentAnimationType.toUpperCase()}_ANIMATION`]; // Use template literal for key
	if (
		currentAnimationModule &&
		typeof currentAnimationModule.randomize === "function"
	) {
		try {
			currentAnimationModule.randomize();
		} catch (error) {
			console.error(
				`Error during ${currentAnimationType} randomization:`,
				error,
			);
		}
	} else {
		console.warn(
			`Randomize function for animation type "${currentAnimationType}" not found.`,
		);
		// Optional: Randomize global controls if no specific function exists?
		// Example: Randomize zoom, brightness, contrast
		// uiElements.zoom.value = (Math.random() * 37 + 3).toFixed(1);
		// uiElements.zoom.dispatchEvent(new Event('input', { bubbles: true }));
		// ... etc ...
	}

	// Optionally randomize global/lighting controls as well
	// Example:
	// uiElements.ambientIntensity.value = (Math.random() * 1.5).toFixed(2);
	// uiElements.ambientIntensity.dispatchEvent(new Event('input', { bubbles: true }));
	// uiElements.directionalIntensity.value = (Math.random() * 2.5 + 0.5).toFixed(1);
	// uiElements.directionalIntensity.dispatchEvent(new Event('input', { bubbles: true }));
}

// --- Utility Functions ---
// (debounce, clamp, etc. if needed)

// --- Start ---
// Use DOMContentLoaded to ensure elements are ready, especially display dimensions
document.addEventListener("DOMContentLoaded", init);
