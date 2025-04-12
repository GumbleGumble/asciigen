// Main script for ASCII Art Generator V2

// --- Global Variables ---
let scene;
let camera;
let renderer;
let renderTarget;
let asciiEffect;
let clock; // Keep as let
const animationObjects = { // Centralized store for animation-specific objects - Use const
	mesh: null,
	material: null,
	geometry: null,
	torus: null,
	line: null,
	positions: null,
	colors: null,
	pointCount: null,
	baseHue: null,
	currentPointIndex: null,
	particleSystem: null,
	particlesGeometry: null,
	particlesMaterial: null,
	velocities: null,
	lifespans: null,
	initialLifespans: null,
    sizes: null,
	particleCount: null,
	maxLifespan: null,
	ambientLight: null,
	directionalLight: null,
    metaballData: null,
    metaballVelocities: null,
    maxBalls: null,
    geometries: null, // For morph
    currentShapeIndex: null, // For morph
    targetShapeIndex: null, // For morph
	morphProgress: null, // For morph
	lastComplexity: null, // For morph
};
const ASCII_CHARS_MAP = {
	dense: "@%#*+=-:. ".split("").reverse().join(""),
	simple: "#=-. ".split("").reverse().join(""),
	blocks: "█▓▒░ ".split("").reverse().join(""),
    binary: "10 ".split("").reverse().join(""), // Added
    slashes: "/\\|-_ ".split("").reverse().join(""), // Added
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
// Theme Storage Key
const THEME_STORAGE_KEY = "asciiGenTheme_v1";


// --- DOM Elements ---
const uiElements = {
	display: document.getElementById("asciiDisplay"),
	displayContainer: document.getElementById("ascii-output-container"),
    themeSelect: document.getElementById("theme-select"), // Added Theme Selector
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
	animationType: document.getElementById("animation-type-select"),
	// Lighting Controls
	ambientIntensity: document.getElementById("ambient-intensity-slider"),
	ambientIntensityValue: document.getElementById("ambient-intensity-value"),
	directionalIntensity: document.getElementById("directional-intensity-slider"),
	directionalIntensityValue: document.getElementById("directional-intensity-value"),
	lightPosX: document.getElementById("light-pos-x-slider"),
	lightPosXValue: document.getElementById("light-pos-x-value"),
	lightPosY: document.getElementById("light-pos-y-slider"),
	lightPosYValue: document.getElementById("light-pos-y-value"),
	lightPosZ: document.getElementById("light-pos-z-slider"),
	lightPosZValue: document.getElementById("light-pos-z-value"),
    // Preset Controls
    presetNameInput: document.getElementById("preset-name-input"),
    savePresetButton: document.getElementById("savePresetButton"),
    presetLoadSelect: document.getElementById("preset-load-select"),
    loadPresetButton: document.getElementById("loadPresetButton"),
    deletePresetButton: document.getElementById("deletePresetButton"),
    // Theme Editor Controls
    themeBgOutputPicker: document.getElementById("theme-bg-output-picker"),
    themeTextOutputPicker: document.getElementById("theme-text-output-picker"),
    themeEditorContainer: document.getElementById("theme-editor-controls"), // Container for editor
	// Torus Specific
	torusSpeed: document.getElementById("torus-speed-slider"),
	torusSpeedValue: document.getElementById("torus-speed-value"),
	torusThickness: document.getElementById("torus-thickness-slider"),
	torusThicknessValue: document.getElementById("torus-thickness-value"),
	torusMajorRadius: document.getElementById("torus-major-radius-slider"),
	torusMajorRadiusValue: document.getElementById("torus-major-radius-value"),
	torusRoughness: document.getElementById("torus-roughness-slider"), // Added
	torusRoughnessValue: document.getElementById("torus-roughness-value"), // Added
	torusMetalness: document.getElementById("torus-metalness-slider"), // Added
	torusMetalnessValue: document.getElementById("torus-metalness-value"), // Added
	torusRotationAxis: document.getElementById("torus-rotation-axis"), // Added
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
	particleCountValue: document.getElementById("particle-count-value"),
	particleSize: document.getElementById("particles-size-slider"),
	particleSizeValue: document.getElementById("particle-size-value"),
	particleSpeed: document.getElementById("particles-speed-slider"),
	particleSpeedValue: document.getElementById("particles-speed-value"),
	particleLifespan: document.getElementById("particles-lifespan-slider"),
	particleLifespanValue: document.getElementById("particle-lifespan-value"),
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
	general: document.querySelector('.control-section:not(.animation-controls):not(#preset-controls):not(#theme-editor-controls)'), // Adjust selector
	torus: document.getElementById("torus-controls"),
	noise: document.getElementById("noise-controls"),
	particles: document.getElementById("particles-controls"),
	kaleidoscope: document.getElementById("kaleidoscope-controls"),
	morph: document.getElementById("morph-controls"),
	metaballs: document.getElementById("metaballs-controls"),
	lissajous: document.getElementById("lissajous-controls"),
	lighting: document.getElementById("lighting-controls"), // Added reference to lighting section
    presets: document.getElementById("preset-controls"), // Added presets container
    themeEditor: document.getElementById("theme-editor-controls"), // Added theme editor container
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
	valueSize: uiElements.particleSizeValue,
	sliderSpeed: uiElements.particleSpeed,
	valueSpeed: uiElements.particleSpeedValue,
	sliderLifespan: uiElements.particleLifespan,
	valueLifespan: uiElements.particleLifespanValue,
	selectEmitterShape: uiElements.particleEmitterShape,
	sliderEmitterSize: uiElements.particleEmitterSize,
	valueEmitterSize: uiElements.particleEmitterSizeValue,
	selectForceType: uiElements.particleForceType,
	sliderForceStrength: uiElements.particleForceStrength,
	valueForceStrength: uiElements.particleForceStrengthValue,
};

const kaleidoscopeControls = {
	sliderSegments: uiElements.kaleidoscopeSegments,
	valueSegments: uiElements.kaleidoscopeSegmentsValue,
	sliderNoiseScale: uiElements.kaleidoscopeNoiseScale,
	valueNoiseScale: uiElements.kaleidoscopeNoiseScaleValue,
    sliderNoiseSpeedX: uiElements.kaleidoscopeNoiseSpeedX, // Changed
    valueNoiseSpeedX: uiElements.kaleidoscopeNoiseSpeedXValue, // Changed
    sliderNoiseSpeedY: uiElements.kaleidoscopeNoiseSpeedY, // Added
    valueNoiseSpeedY: uiElements.kaleidoscopeNoiseSpeedYValue, // Added
	sliderNoiseBrightness: uiElements.kaleidoscopeNoiseBrightness,
	valueNoiseBrightness: uiElements.kaleidoscopeNoiseBrightnessValue,
};

const morphControls = {
	sliderMorphSpeed: uiElements.morphSpeed,
	valueMorphSpeed: uiElements.morphSpeedValue,
	sliderRotationSpeed: uiElements.morphRotationSpeed,
	valueRotationSpeed: uiElements.morphRotationSpeedValue,
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

// --- Themes ---
// Theme definitions including specific output colors for dynamic setting/editing
const themes = {
    dark: {
        name: "Dark (Default)",
        bgOutput: "#0d1117",
        textOutput: "#e2e8f0",
    },
    light: {
        name: "Light",
        bgOutput: "#f7fafc",
        textOutput: "#2d3748",
    },
    matrix: {
        name: "Matrix",
        bgOutput: "#000000",
        textOutput: "#00ff00",
    },
    solarized: {
        name: "Solarized Dark",
        bgOutput: "#002b36", // base03
        textOutput: "#839496", // base0
    },
    'solarized-light': { // Use quotes for key with hyphen
        name: "Solarized Light",
        bgOutput: "#fdf6e3", // base3
        textOutput: "#657b83", // base00
    },
    monokai: {
        name: "Monokai",
        bgOutput: "#272822",
        textOutput: "#f8f8f2",
    },
    dracula: {
        name: "Dracula",
        bgOutput: "#282a36",
        textOutput: "#f8f8f2",
    },
    nord: {
        name: "Nord",
        bgOutput: "#2e3440",
        textOutput: "#eceff4",
    },
    'gruvbox-dark': {
        name: "Gruvbox Dark",
        bgOutput: "#282828",
        textOutput: "#ebdbb2",
    },
    'gruvbox-light': {
        name: "Gruvbox Light",
        bgOutput: "#fbf1c7",
        textOutput: "#3c3836",
    },
    'one-dark': {
        name: "One Dark",
        bgOutput: "#282c34",
        textOutput: "#abb2bf",
    },
    'cobalt2': {
        name: "Cobalt2",
        bgOutput: "#002240",
        textOutput: "#ffffff",
    },
    'synthwave': {
        name: "Synthwave '84",
        bgOutput: "#2a2139",
        textOutput: "#f92aad", // Pink text
        // Consider adding glow effect via text-shadow in CSS if desired
    },
    'oceanic-next': {
        name: "Oceanic Next",
        bgOutput: "#1b2b34",
        textOutput: "#cdd3de",
    },
};
let currentThemeName = 'dark'; // Track current theme name


// --- Initialization ---
function init() {
	console.log("Initializing ASCII Art Generator V2");
	// Basic THREE.js setup
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(
		75,
		window.innerWidth / window.innerHeight, // Initial aspect ratio
		0.1,
		1000,
	);
	renderer = new THREE.WebGLRenderer();
	clock = new THREE.Clock(); // Initialize clock

	// Set initial camera position based on slider
	camera.position.z = Number.parseFloat(uiElements.zoom.value);

	// Setup render target and ASCII effect
	setupRenderTargetAndCanvas();

	// Setup lighting
	setupLighting();

	// Setup event listeners for UI controls
	setupEventListeners();

    // Populate theme selector
    populateThemeSelector();

    // Load and apply saved theme or default
    loadAndApplyTheme();

	// Setup initial animation
	switchAnimation(currentAnimationType); // Use default type
	uiElements.animationType.value = currentAnimationType; // Sync dropdown

    // Populate preset list
    updatePresetList();

	// Start the animation loop
	animate();
}

// --- Theme Functions ---
function populateThemeSelector() {
    if (!uiElements.themeSelect) return;
    for (const key in themes) {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = themes[key].name;
        uiElements.themeSelect.appendChild(option);
    }
}

function applyTheme(themeName) {
    if (!themes[themeName]) {
        console.warn(`Theme "${themeName}" not found.`);
        return;
    }
    currentThemeName = themeName;
    console.log(`Applying theme: ${themeName}`);
    // Set data-theme attribute on the root element (html) for global styles
    document.documentElement.setAttribute('data-theme', themeName);

    // Update theme editor pickers to match the selected theme's output colors
    if (uiElements.themeBgOutputPicker) {
        uiElements.themeBgOutputPicker.value = themes[themeName].bgOutput;
    }
    if (uiElements.themeTextOutputPicker) {
        uiElements.themeTextOutputPicker.value = themes[themeName].textOutput;
    }

    // Apply output colors directly via CSS variables on the container
    // This is now handled by CSS rules like `[data-theme="dark"] #ascii-output-container`
    // if (uiElements.displayContainer) {
    //     uiElements.displayContainer.style.setProperty('--bg-output', themes[themeName].bgOutput);
    //     uiElements.displayContainer.style.setProperty('--output-text-color', themes[themeName].textOutput);
    // }

    // Save the selected theme
    try {
        localStorage.setItem(THEME_STORAGE_KEY, themeName);
    } catch (error) {
        console.error("Error saving theme to localStorage:", error);
    }
}

function loadAndApplyTheme() {
    let savedTheme = 'dark'; // Default
    try {
        savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
    } catch (error) {
        console.error("Error loading theme from localStorage:", error);
    }

    if (themes[savedTheme]) {
        uiElements.themeSelect.value = savedTheme;
        applyTheme(savedTheme);
    } else {
        console.warn(`Saved theme "${savedTheme}" not found, applying default.`);
        uiElements.themeSelect.value = 'dark';
        applyTheme('dark');
    }
}


// --- THREE.js and ASCII Effect Setup ---
function setupRenderTargetAndCanvas() {
	const quality = Number.parseFloat(uiElements.renderTargetResolution.value);
	const newWidth = window.innerWidth * quality;
	const newHeight = window.innerHeight * quality;

	// Update renderer size
	renderer.setSize(newWidth, newHeight);
	renderer.setPixelRatio(window.devicePixelRatio); // Consider device pixel ratio

	// Update render target
	if (renderTarget) renderTarget.dispose(); // Dispose old target
	renderTarget = new THREE.WebGLRenderTarget(newWidth, newHeight);

	// Update ASCII Effect
	const resolution = Number.parseFloat(uiElements.resolution.value);
	const calculatedFontSize = calculateFontSize(resolution);
	const asciiOptions = {
		resolution: resolution,
		scale: 1, // Adjust if needed
		invert: uiElements.invert.checked,
		color: false, // Keep false for character-based effect
		block: false, // Keep false for character-based effect
	};

	if (asciiEffect) {
		// Update existing effect if possible, or recreate
		// Note: AsciiEffect might not have public methods to update all options. Recreating might be safer.
        // asciiEffect.setSize(window.innerWidth, window.innerHeight); // Update size
        // asciiEffect.setOptions(asciiOptions); // Assuming a method exists
        asciiEffect?.setCharSet(asciiChars); // Update charset - Use optional chain
        asciiEffect.setInvert(asciiOptions.invert); // Update invert
        // Recreate for simplicity and safety if resolution/scale changes significantly
        // For now, just update charset and invert
        // If recreating:
        // if (uiElements.display && uiElements.display.firstChild) {
        //     uiElements.display.removeChild(uiElements.display.firstChild); // Remove old DOM element
        // }
		// asciiEffect = new THREE.AsciiEffect(renderer, asciiChars, asciiOptions);
	} else {
		asciiEffect = new THREE.AsciiEffect(renderer, asciiChars, asciiOptions);
	}

	asciiEffect.setSize(window.innerWidth, window.innerHeight); // Set effect size based on window
	if (uiElements.display) {
        // Ensure the effect's DOM element is added only once and is the correct one
        if (asciiEffect.domElement && !uiElements.display.contains(asciiEffect.domElement)) {
            // Clear previous content if any
            while (uiElements.display.firstChild) {
                uiElements.display.removeChild(uiElements.display.firstChild);
            }
		    uiElements.display.appendChild(asciiEffect.domElement);
        }
		uiElements.display.style.fontSize = `${calculatedFontSize}px`;
		// Adjust line height based on font size for better fit
		uiElements.display.style.lineHeight = `${calculatedFontSize * 1.0}px`; // Adjust multiplier as needed
	}

	// Update camera aspect ratio
	if (camera) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}

	console.log(
		`Render target/Canvas updated. Quality: ${quality}, Resolution: ${resolution}, Font Size: ${calculatedFontSize.toFixed(2)}px`,
	);
}

function calculateFontSize(resolution) {
	// Adjust base size and factor as needed
	const baseFontSize = 8; // Base font size for a resolution of 0.1
	const factor = 0.8; // How much font size decreases as resolution increases
	// Calculate font size inversely proportional to resolution
	// Ensure resolution is not zero
	const safeResolution = Math.max(0.01, resolution);
	// Experiment with the formula:
	// return baseFontSize / Math.pow(safeResolution / 0.1, factor);
	// Simpler linear scaling might be sufficient:
	return Math.max(1, baseFontSize - (safeResolution - 0.1) * factor * 10); // Ensure minimum size 1px
}

// --- Lighting Setup ---
function setupLighting() {
	// Ambient Light
	const ambientIntensity = Number.parseFloat(uiElements.ambientIntensity.value);
	animationObjects.ambientLight = new THREE.AmbientLight(0xffffff, ambientIntensity);
	scene.add(animationObjects.ambientLight);

	// Directional Light
	const directionalIntensity = Number.parseFloat(uiElements.directionalIntensity.value);
	const lightPosX = Number.parseFloat(uiElements.lightPosX.value);
	const lightPosY = Number.parseFloat(uiElements.lightPosY.value);
	const lightPosZ = Number.parseFloat(uiElements.lightPosZ.value);
	animationObjects.directionalLight = new THREE.DirectionalLight(0xffffff, directionalIntensity);
	animationObjects.directionalLight.position.set(lightPosX, lightPosY, lightPosZ);
	scene.add(animationObjects.directionalLight);
}

// --- Animation Loop ---
function animate() {
	if (isPaused) {
		animationFrameId = requestAnimationFrame(animate); // Keep checking if unpaused
		return;
	}

	animationFrameId = requestAnimationFrame(animate);
	const deltaTime = clock.getDelta();
	const elapsedTime = clock.getElapsedTime();

	// Update current animation
	const animationModule = window[`${currentAnimationType.toUpperCase()}_ANIMATION`];
	if (animationModule && typeof animationModule.update === "function") {
		animationModule.update(deltaTime, elapsedTime);
	}

	// Render the scene to ASCII
	renderToAscii();

    // Handle GIF recording frame capture
    if (isRecordingGif && gifEncoder) {
        const now = performance.now();
        if (now - lastGifFrameTime >= GIF_FRAME_DELAY) {
            lastGifFrameTime = now;
            // Capture frame from the *renderer's canvas* after rendering to target
            // but before AsciiEffect modifies the output display
            // We need the visual output, so capture from the asciiEffect's DOM element?
            // Or render the scene again to a dedicated canvas for GIF?

            // Option 1: Capture from asciiEffect.domElement (might be slow/complex)
            // Requires html2canvas or similar if asciiEffect.domElement isn't a canvas

            // Option 2: Render scene to a dedicated GIF canvas
            // This seems more reliable if AsciiEffect doesn't expose a canvas easily
            // Let's assume we have a gifCanvas and gifRenderer setup elsewhere
            // gifRenderer.render(scene, camera);
            // gifEncoder.addFrame(gifRenderer.domElement, { copy: true, delay: GIF_FRAME_DELAY });

            // Placeholder: Log frame capture intention
            // console.log("Capturing GIF frame...");

            // Check if recording duration exceeded
            if (now - gifRecordStartTime > GIF_RECORD_DURATION) {
                stopGifRecording();
            }
        }
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
	// General Controls
    uiElements.themeSelect.addEventListener("change", (e) => applyTheme(e.target.value)); // Added Theme Listener
	uiElements.resolution.addEventListener("input", () => {
		// uiElements.resolutionValue.textContent = uiElements.resolution.value; // Handled by updateAllValueDisplays
		setupRenderTargetAndCanvas(); // ASCII grid size depends on this
		updateAllValueDisplays(); // Update label immediately
        renderToAscii(); // Re-render immediately
	});
	uiElements.charset.addEventListener("change", (e) => {
		asciiChars = ASCII_CHARS_MAP[e.target.value] || ASCII_CHARS_MAP.dense;
        if (asciiEffect) asciiEffect.setCharSet(asciiChars); // Update effect's charset
        renderToAscii(); // Re-render immediately on charset change
	});
	uiElements.brightness.addEventListener("input", (e) => {
		// uiElements.brightnessValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		updateAllValueDisplays(); // Update label immediately
        renderToAscii(); // Re-render immediately
	});
	uiElements.contrast.addEventListener("input", (e) => {
		// uiElements.contrastValue.textContent = Number.parseFloat(e.target.value).toFixed(1); // Handled by updateAllValueDisplays
		updateAllValueDisplays(); // Update label immediately
        renderToAscii(); // Re-render immediately
	});
	uiElements.zoom.addEventListener("input", (e) => {
		const zoomVal = Number.parseFloat(e.target.value);
		// uiElements.zoomValue.textContent = zoomVal.toFixed(1); // Handled by updateAllValueDisplays
		if (camera) camera.position.z = zoomVal;
		updateAllValueDisplays(); // Update label immediately
        renderToAscii(); // Re-render immediately
	});
	uiElements.renderTargetResolution.addEventListener("input", (e) => {
		// uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(e.target.value).toFixed(2); // Handled by updateAllValueDisplays
		setupRenderTargetAndCanvas(); // Render target size depends on this
		updateAllValueDisplays(); // Update label immediately
        renderToAscii(); // Re-render immediately
	});
	uiElements.invert.addEventListener("change", () => {
        if (asciiEffect) asciiEffect.setInvert(uiElements.invert.checked); // Update effect's invert status
        renderToAscii(); // Re-render immediately on invert change
    });

	// Buttons
	uiElements.pausePlayButton.addEventListener("click", togglePause);
	uiElements.randomizeButton.addEventListener("click", randomizeParameters);
    uiElements.recordGifButton.addEventListener("click", toggleGifRecording); // Added

    // Theme Editor Color Pickers
    if (uiElements.themeBgOutputPicker) {
        uiElements.themeBgOutputPicker.addEventListener('input', (e) => {
            if (uiElements.displayContainer) {
                // Update the CSS variable for the output background
                uiElements.displayContainer.style.setProperty('--bg-output', e.target.value);
                // Optionally update the theme object if you want changes to persist temporarily
                // This requires finding the current theme key and updating themes[currentThemeName]
                if (themes[currentThemeName]) {
                    themes[currentThemeName].bgOutput = e.target.value;
                }
            }
        });
    }
    if (uiElements.themeTextOutputPicker) {
        uiElements.themeTextOutputPicker.addEventListener('input', (e) => {
            // Set variable on container, display will inherit
            if (uiElements.displayContainer) {
                // Update the CSS variable for the output text color
                uiElements.displayContainer.style.setProperty('--output-text-color', e.target.value);
                // Optionally update the theme object
                if (themes[currentThemeName]) {
                    themes[currentThemeName].textOutput = e.target.value;
                }
            }
        });
    }

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

    // --- Collapsible Section Listeners ---
    // Use for...of loop instead of forEach
    for (const header of document.querySelectorAll('.control-section.collapsible .control-section-header')) {
        header.addEventListener('click', () => {
            const section = header.closest('.control-section');
            // const icon = header.querySelector('.toggle-icon'); // Not used directly
            // const content = section.querySelector('.control-section-content'); // Not used directly

            section.classList.toggle('collapsed');

            // // Accessibility: Update aria-expanded attribute
            // const isCollapsed = section.classList.contains('collapsed');
            // header.setAttribute('aria-expanded', !isCollapsed);
            // content.setAttribute('aria-hidden', isCollapsed);
        });
    }

	// Window Resize Listener
	window.addEventListener("resize", onWindowResize);
}

// --- Window Resize Handler ---
function onWindowResize() {
	// Update camera aspect ratio
	if (camera) {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}

	// Update renderer and ASCII effect size/resolution
	setupRenderTargetAndCanvas();

	// Re-render immediately after resize
	renderToAscii();
}

// --- ASCII Rendering ---
function renderToAscii() {
	if (!renderer || !scene || !camera || !renderTarget || !asciiEffect) {
		console.warn("Cannot render ASCII, essential components missing.");
		return;
	}
	// 1. Render the main scene to the render target
	renderer.setRenderTarget(renderTarget);
	renderer.clear(); // Clear the render target
	renderer.render(scene, camera);
	renderer.setRenderTarget(null); // Reset render target

	// 2. Apply ASCII effect using the render target's texture
	// The AsciiEffect internally uses the renderer to draw its output
	// We need to make sure the brightness/contrast adjustments happen *before* the effect reads the texture
    // AsciiEffect doesn't directly support brightness/contrast. We apply it via CSS filter on the output element.

    if (uiElements.display) {
        const brightness = uiElements.brightness.value;
        const contrast = uiElements.contrast.value;
        // Apply filter directly to the display element containing the ASCII output
        uiElements.display.style.filter = `brightness(${brightness}) contrast(${contrast})`;
    }

	// 3. Let AsciiEffect render its output to its own DOM element
	asciiEffect.render(scene, camera); // This updates asciiEffect.domElement
}

// --- UI Update Functions ---
function updateAllValueDisplays() {
	// General
	if (uiElements.resolutionValue && uiElements.resolution) uiElements.resolutionValue.textContent = uiElements.resolution.value;
	if (uiElements.brightnessValue && uiElements.brightness) uiElements.brightnessValue.textContent = Number.parseFloat(uiElements.brightness.value).toFixed(2);
	if (uiElements.contrastValue && uiElements.contrast) uiElements.contrastValue.textContent = Number.parseFloat(uiElements.contrast.value).toFixed(1);
	if (uiElements.zoomValue && uiElements.zoom) uiElements.zoomValue.textContent = Number.parseFloat(uiElements.zoom.value).toFixed(1);
	if (uiElements.renderTargetResolutionValue && uiElements.renderTargetResolution) uiElements.renderTargetResolutionValue.textContent = Number.parseFloat(uiElements.renderTargetResolution.value).toFixed(2);

	// Lighting
	if (uiElements.ambientIntensityValue && uiElements.ambientIntensity) uiElements.ambientIntensityValue.textContent = Number.parseFloat(uiElements.ambientIntensity.value).toFixed(2);
	if (uiElements.directionalIntensityValue && uiElements.directionalIntensity) uiElements.directionalIntensityValue.textContent = Number.parseFloat(uiElements.directionalIntensity.value).toFixed(2);
	if (uiElements.lightPosXValue && uiElements.lightPosX) uiElements.lightPosXValue.textContent = Number.parseFloat(uiElements.lightPosX.value).toFixed(1);
	if (uiElements.lightPosYValue && uiElements.lightPosY) uiElements.lightPosYValue.textContent = Number.parseFloat(uiElements.lightPosY.value).toFixed(1);
	if (uiElements.lightPosZValue && uiElements.lightPosZ) uiElements.lightPosZValue.textContent = Number.parseFloat(uiElements.lightPosZ.value).toFixed(1);

	// Torus
	if (uiElements.torusSpeedValue && uiElements.torusSpeed) uiElements.torusSpeedValue.textContent = Number.parseFloat(uiElements.torusSpeed.value).toFixed(2);
	if (uiElements.torusThicknessValue && uiElements.torusThickness) uiElements.torusThicknessValue.textContent = Number.parseFloat(uiElements.torusThickness.value).toFixed(2);
	if (uiElements.torusMajorRadiusValue && uiElements.torusMajorRadius) uiElements.torusMajorRadiusValue.textContent = Number.parseFloat(uiElements.torusMajorRadius.value).toFixed(1);
	if (uiElements.torusRoughnessValue && uiElements.torusRoughness) uiElements.torusRoughnessValue.textContent = Number.parseFloat(uiElements.torusRoughness.value).toFixed(2); // Added
	if (uiElements.torusMetalnessValue && uiElements.torusMetalness) uiElements.torusMetalnessValue.textContent = Number.parseFloat(uiElements.torusMetalness.value).toFixed(2); // Added

	// Noise
	if (uiElements.noiseScaleValue && uiElements.noiseScale) uiElements.noiseScaleValue.textContent = Number.parseFloat(uiElements.noiseScale.value).toFixed(1);
    if (uiElements.noiseSpeedXValue && uiElements.noiseSpeedX) uiElements.noiseSpeedXValue.textContent = Number.parseFloat(uiElements.noiseSpeedX.value).toFixed(1); // Changed
    if (uiElements.noiseSpeedYValue && uiElements.noiseSpeedY) uiElements.noiseSpeedYValue.textContent = Number.parseFloat(uiElements.noiseSpeedY.value).toFixed(1); // Added
    if (uiElements.noiseBrightnessValue && uiElements.noiseBrightness) uiElements.noiseBrightnessValue.textContent = Number.parseFloat(uiElements.noiseBrightness.value).toFixed(1);
    if (uiElements.noiseOctavesValue && uiElements.noiseOctaves) uiElements.noiseOctavesValue.textContent = uiElements.noiseOctaves.value; // Added

    // Particles - Use optional chaining
    if (uiElements.particleCountValue && uiElements.particleCount) uiElements.particleCountValue.textContent = uiElements.particleCount.value;
    if (uiElements.particleSizeValue && uiElements.particleSize) uiElements.particleSizeValue.textContent = Number.parseFloat(uiElements.particleSize.value).toFixed(1);
    if (uiElements.particleSpeedValue && uiElements.particleSpeed) uiElements.particleSpeedValue.textContent = Number.parseFloat(uiElements.particleSpeed.value).toFixed(1);
    if (uiElements.particleLifespanValue && uiElements.particleLifespan) uiElements.particleLifespanValue.textContent = Number.parseFloat(uiElements.particleLifespan.value).toFixed(1);
    if (uiElements.particleEmitterSizeValue && uiElements.particleEmitterSize) uiElements.particleEmitterSizeValue.textContent = Number.parseFloat(uiElements.particleEmitterSize.value).toFixed(1);
    if (uiElements.particleForceStrengthValue && uiElements.particleForceStrength) uiElements.particleForceStrengthValue.textContent = Number.parseFloat(uiElements.particleForceStrength.value).toFixed(1);

    // Kaleidoscope - Use optional chaining
    if (uiElements.kaleidoscopeSegmentsValue && uiElements.kaleidoscopeSegments) uiElements.kaleidoscopeSegmentsValue.textContent = uiElements.kaleidoscopeSegments.value;
    if (uiElements.kaleidoscopeNoiseScaleValue && uiElements.kaleidoscopeNoiseScale) uiElements.kaleidoscopeNoiseScaleValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseScale.value).toFixed(1);
    if (uiElements.kaleidoscopeNoiseSpeedXValue && uiElements.kaleidoscopeNoiseSpeedX) uiElements.kaleidoscopeNoiseSpeedXValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseSpeedX.value).toFixed(1); // Changed
    if (uiElements.kaleidoscopeNoiseSpeedYValue && uiElements.kaleidoscopeNoiseSpeedY) uiElements.kaleidoscopeNoiseSpeedYValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseSpeedY.value).toFixed(1); // Added
    if (uiElements.kaleidoscopeNoiseBrightnessValue && uiElements.kaleidoscopeNoiseBrightness) uiElements.kaleidoscopeNoiseBrightnessValue.textContent = Number.parseFloat(uiElements.kaleidoscopeNoiseBrightness.value).toFixed(1);

    // Morph - Use optional chaining
    if (uiElements.morphSpeedValue && uiElements.morphSpeed) uiElements.morphSpeedValue.textContent = Number.parseFloat(uiElements.morphSpeed.value).toFixed(1);
    if (uiElements.morphRotationSpeedValue && uiElements.morphRotationSpeed) uiElements.morphRotationSpeedValue.textContent = Number.parseFloat(uiElements.morphRotationSpeed.value).toFixed(1);
    if (uiElements.morphComplexityValue && uiElements.morphComplexity) uiElements.morphComplexityValue.textContent = uiElements.morphComplexity.value;

    // Metaballs - Use optional chaining
    if (uiElements.metaballsCountValue && uiElements.metaballsCount) uiElements.metaballsCountValue.textContent = uiElements.metaballsCount.value;
	if (uiElements.metaballsSizeValue && uiElements.metaballsSize) uiElements.metaballsSizeValue.textContent = Number.parseFloat(uiElements.metaballsSize.value).toFixed(1);
	if (uiElements.metaballsSpeedValue && uiElements.metaballsSpeed) uiElements.metaballsSpeedValue.textContent = Number.parseFloat(uiElements.metaballsSpeed.value).toFixed(1);
	if (uiElements.metaballsThresholdValue && uiElements.metaballsThreshold) uiElements.metaballsThresholdValue.textContent = Number.parseFloat(uiElements.metaballsThreshold.value).toFixed(2);
	if (uiElements.metaballsColorValue && uiElements.metaballsColor) uiElements.metaballsColorValue.textContent = Number.parseFloat(uiElements.metaballsColor.value).toFixed(2);

	// Lissajous - Use optional chaining
	if (uiElements.lissajousAValue && uiElements.lissajousA) uiElements.lissajousAValue.textContent = uiElements.lissajousA.value;
	if (uiElements.lissajousBValue && uiElements.lissajousB) uiElements.lissajousBValue.textContent = uiElements.lissajousB.value;
	if (uiElements.lissajousDeltaValue && uiElements.lissajousDelta) {
		const deltaVal = Number.parseFloat(uiElements.lissajousDelta.value);
		uiElements.lissajousDeltaValue.textContent = `${(deltaVal / Math.PI).toFixed(2)} PI`;
	}
	if (uiElements.lissajousAmpAValue && uiElements.lissajousAmpA) uiElements.lissajousAmpAValue.textContent = Number.parseFloat(uiElements.lissajousAmpA.value).toFixed(1);
	if (uiElements.lissajousAmpBValue && uiElements.lissajousAmpB) uiElements.lissajousAmpBValue.textContent = Number.parseFloat(uiElements.lissajousAmpB.value).toFixed(1);
	if (uiElements.lissajousSpeedValue && uiElements.lissajousSpeed) uiElements.lissajousSpeedValue.textContent = Number.parseFloat(uiElements.lissajousSpeed.value).toFixed(1);
	if (uiElements.lissajousPointsValue && uiElements.lissajousPoints) uiElements.lissajousPointsValue.textContent = uiElements.lissajousPoints.value;
}

function updateUIForAnimationType(type) {
	console.log(`Updating UI for animation type: ${type}`);
	// Hide all animation-specific control sections
	for (const key in controlContainers) {
		// Check if it's an animation control container (not general, lighting, presets, themeEditor)
		if (key !== 'general' && key !== 'lighting' && key !== 'presets' && key !== 'themeEditor') {
			const container = controlContainers[key];
			if (container) {
				container.classList.remove("active");
				container.classList.add("hidden"); // Use hidden for complete removal from layout
			}
		}
	}

	// Show the controls for the selected animation type
	const activeContainer = controlContainers[type];
	if (activeContainer) {
		activeContainer.classList.add("active");
		activeContainer.classList.remove("hidden");
		console.log(`Showing controls for: ${type}`);
	} else {
		console.warn(`Control container for animation type "${type}" not found.`);
	}
}

// --- Animation Switching ---
function switchAnimation(type) {
	console.log(`Switching animation to: ${type}`);

	// 1. Cleanup the current animation
	const oldAnimationModule = window[`${currentAnimationType.toUpperCase()}_ANIMATION`];
	if (oldAnimationModule && typeof oldAnimationModule.cleanup === "function") {
		oldAnimationModule.cleanup();
	} else {
		console.warn(`Cleanup function for animation type "${currentAnimationType}" not found.`);
	}

	// 2. Update the current animation type
	currentAnimationType = type;

	// 3. Setup the new animation
	const newAnimationModule = window[`${currentAnimationType.toUpperCase()}_ANIMATION`];
	if (newAnimationModule && typeof newAnimationModule.setup === "function") {
		newAnimationModule.setup();
	} else {
		console.error(`Setup function for animation type "${currentAnimationType}" not found!`);
		// Handle error - maybe switch to a default animation?
	}

	// 4. Update the UI to show the correct controls
	updateUIForAnimationType(type);

    // 5. Ensure all value displays are correct for the new animation
    updateAllValueDisplays();

    // 6. Perform an initial render
    renderToAscii();
}

// --- Controls ---
function togglePause() {
	isPaused = !isPaused;
	uiElements.pausePlayButton.textContent = isPaused ? "Play" : "Pause";
	console.log(isPaused ? "Animation Paused" : "Animation Resumed");
	if (!isPaused) {
		clock.getDelta(); // Call getDelta once after resuming to avoid large jump
		animate(); // Restart loop if resuming
	}
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
        if (asciiEffect) asciiEffect.setCharSet(asciiChars); // Update effect
    }
    if (uiElements.renderTargetResolution) uiElements.renderTargetResolution.value = (0.5 + Math.random() * 0.7).toFixed(2); // Range 0.5 to 1.2

    // Randomize Lighting
    if (uiElements.ambientIntensity) uiElements.ambientIntensity.value = (Math.random() * 1.5).toFixed(2); // 0.0 to 1.5
    if (uiElements.directionalIntensity) uiElements.directionalIntensity.value = (Math.random() * 2.0).toFixed(2); // 0.0 to 2.0
    if (uiElements.lightPosX) uiElements.lightPosX.value = ((Math.random() - 0.5) * 20).toFixed(1); // -10 to 10
    if (uiElements.lightPosY) uiElements.lightPosY.value = ((Math.random() - 0.5) * 20).toFixed(1); // -10 to 10
    if (uiElements.lightPosZ) uiElements.lightPosZ.value = (Math.random() * 15 + 5).toFixed(1); // 5 to 20

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
	// updateAllValueDisplays(); // This should trigger listeners to update values/lights - Called by event listeners

	// 2. Select a Random Animation Type (excluding lighting itself)
    const availableAnimations = Object.keys(controlContainers).filter(key => key !== 'general' && key !== 'lighting' && key !== 'presets' && key !== 'themeEditor');
	const randomType = availableAnimations[Math.floor(Math.random() * availableAnimations.length)];
	uiElements.animationType.value = randomType; // Update dropdown
	switchAnimation(randomType); // Switch animation type

	// 3. Randomize Parameters for the *newly selected* animation type
	const animationModule = window[`${randomType.toUpperCase()}_ANIMATION`];
	if (animationModule && typeof animationModule.randomize === "function") {
		console.log(`Randomizing parameters for ${randomType}...`);
		animationModule.randomize(); // This should handle dispatching events for its controls
	} else {
		console.warn(`Randomize function for animation type "${randomType}" not found.`);
	}

    // Final update to ensure all labels reflect the randomized state
    updateAllValueDisplays();
    // Final render to reflect changes
    renderToAscii(); // Render immediately after randomization
}

// --- GIF Recording ---
function toggleGifRecording() {
    if (isRecordingGif) {
        stopGifRecording();
    } else {
        startGifRecording();
    }
}

function startGifRecording() {
    // Check if gif.js library is available
    if (typeof GIF !== 'function') {
        alert("GIF library (gif.js) not found. Cannot record GIF.");
        console.error("gif.js not loaded.");
        return;
    }

    console.log("Starting GIF recording...");
    isRecordingGif = true;
    uiElements.recordGifButton.textContent = "Stop Recording";
    uiElements.recordGifButton.classList.add("recording");
    gifRecordStartTime = performance.now();
    lastGifFrameTime = gifRecordStartTime; // Initialize last frame time

    // --- Setup GIF Encoder ---
    // We need a canvas to draw frames onto. Let's use the main renderer's canvas
    // temporarily, or ideally, a dedicated offscreen canvas.
    // For simplicity, let's try using the main renderer's canvas.
    // Note: This might interfere with the live display if not handled carefully.
    const canvas = renderer.domElement;
    const width = canvas.width;
    const height = canvas.height;

    gifEncoder = new GIF({
        workers: 2, // Number of web workers to use
        quality: 10, // Lower quality means faster processing, 10 is default
        width: width,
        height: height,
        workerScript: 'js/lib/gif.worker.js' // Ensure this path is correct
    });

    gifEncoder.on('finished', (blob) => {
        console.log("GIF rendering finished.");
        const url = URL.createObjectURL(blob);
        // Create a link to download the GIF
        const link = document.createElement('a');
        link.href = url;
        link.download = `ascii_animation_${Date.now()}.gif`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); // Clean up blob URL

        // Reset button state
        isRecordingGif = false;
        uiElements.recordGifButton.textContent = "Record GIF";
        uiElements.recordGifButton.classList.remove("recording");
        gifEncoder = null;
    });

    gifEncoder.on('progress', (p) => {
        uiElements.recordGifButton.textContent = `Rendering: ${(p * 100).toFixed(0)}%`;
    });

    // The actual frame adding happens in the animate loop
}

function stopGifRecording() {
    if (!isRecordingGif || !gifEncoder) return;

    console.log("Stopping GIF recording and rendering...");
    isRecordingGif = false; // Stop capturing frames in animate loop
    uiElements.recordGifButton.textContent = "Rendering..."; // Indicate rendering phase
    // gifEncoder.render() will be called automatically by the 'finished' event logic?
    // No, we need to call render() explicitly.
    gifEncoder.render();
}


// --- Preset Functions ---

function getAllControlValues() {
    const values = {};
    // Global Controls
    values.resolution = uiElements.resolution.value;
    values.charset = uiElements.charset.value;
    values.brightness = uiElements.brightness.value;
    values.contrast = uiElements.contrast.value;
    values.zoom = uiElements.zoom.value;
    values.invert = uiElements.invert.checked;
    values.renderTargetResolution = uiElements.renderTargetResolution.value;
    values.animationType = uiElements.animationType.value; // Save current animation type

    // Lighting Controls
    values.ambientIntensity = uiElements.ambientIntensity.value;
    values.directionalIntensity = uiElements.directionalIntensity.value;
    values.lightPosX = uiElements.lightPosX.value;
    values.lightPosY = uiElements.lightPosY.value;
    values.lightPosZ = uiElements.lightPosZ.value;

    // Animation Specific Controls
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
        // Use optional chaining and check if the value exists in the loaded preset
        if (control?.id && values[control.id] !== undefined) {
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
        if (asciiEffect) asciiEffect.setCharSet(asciiChars); // Update effect
    }
    if (values.invert !== undefined && asciiEffect) {
         asciiEffect.setInvert(values.invert); // Update effect
    }
    if (camera && values.zoom !== undefined) camera.position.z = Number.parseFloat(values.zoom);
    setupRenderTargetAndCanvas(); // Update canvas/render target based on resolution

    // Switch to the correct animation type *last*
    if (values.animationType && values.animationType !== currentAnimationType) {
        // Set the dropdown value before switching
        uiElements.animationType.value = values.animationType;
        switchAnimation(values.animationType);
    } else {
        // If type didn't change, ensure UI labels and handlers are updated
        updateAllValueDisplays();
        // Manually trigger handlers for the current animation if needed,
        // as switchAnimation wasn't called. This ensures material/geometry updates.
        const currentModule = window[`${currentAnimationType.toUpperCase()}_ANIMATION`];
        // Call specific handlers first if they exist and handle major changes
        let handled = false;
        if (currentModule?.handleComplexityChange) { currentModule.handleComplexityChange(); handled = true; } // Morph
        if (currentModule?.handleThicknessChange) { currentModule.handleThicknessChange(); handled = true; } // Torus (covers major radius too)
        if (currentModule?.handleCountChange) { currentModule.handleCountChange(); handled = true; } // Particles
        if (currentModule?.handleEmitterChange) { currentModule.handleEmitterChange(); handled = true; } // Particles
        // If no specific handler was called, call the general one
        if (!handled && currentModule?.handleParamChange) {
             currentModule.handleParamChange();
        }
        // Also trigger color/material changes if applicable
        if (currentModule?.handleColorChange) { currentModule.handleColorChange(); } // Morph, Torus
        if (currentModule?.handleMaterialChange) { currentModule.handleMaterialChange(); } // Torus
    }

    // Final render to reflect changes
    renderToAscii();
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
    const presetValues = presets[presetName];

    if (presetValues) {
        console.log(`Loading preset "${presetName}"...`);
        applyControlValues(presetValues);
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

// --- Initial Load ---
document.addEventListener("DOMContentLoaded", init);
