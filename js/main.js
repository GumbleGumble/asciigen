// --- Configuration ---
const ASCII_CHARS_MAP = {
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

let currentAsciiChars = ASCII_CHARS_MAP["dense"];
let asciiWidth = 80;
let asciiHeight = 0;
let brightnessThreshold = 0.5;
let contrast = 1.0;
let zoom = 15;
let invertBrightness = false;
let clock = new THREE.Clock();
let isPaused = false;
let animationFrameId = null;
let isInitialized = false; // Flag for initial setup

// --- DOM Elements ---
const asciiOutput = document.getElementById("ascii-output");
const hiddenCanvas = document.getElementById("hidden-canvas");
const hiddenCtx = hiddenCanvas.getContext("2d", { willReadFrequently: true });
const resolutionSlider = document.getElementById("resolution-slider");
const resolutionValueSpan = document.getElementById("resolution-value");
const charsetSelect = document.getElementById("charset-select");
const brightnessSlider = document.getElementById("brightness-slider");
const contrastSlider = document.getElementById("contrast-slider");
const zoomSlider = document.getElementById("zoom-slider");
const invertCheckbox = document.getElementById("invert-brightness-checkbox");
const animationSelect = document.getElementById("animation-select");
const pausePlayButton = document.getElementById("pause-play-button");
const randomizeButton = document.getElementById("randomize-button");

// Control containers and specific controls
const controlContainers = {
	torus: document.getElementById("torus-controls"),
	noise: document.getElementById("noise-controls"),
	particles: document.getElementById("particles-controls"),
	kaleidoscope: document.getElementById("kaleidoscope-controls"),
	morph: document.getElementById("morph-controls"),
	metaballs: document.getElementById("metaballs-controls"),
	lissajous: document.getElementById("lissajous-controls"),
};

// Animation control objects
const torusControls = {
	sliderSpeed: document.getElementById("torus-speed-slider"),
	sliderThickness: document.getElementById("torus-thickness-slider"),
	valueThickness: document.getElementById("torus-thickness-value"),
};

const noiseControls = {
	sliderScale: document.getElementById("noise-scale-slider"),
	sliderSpeed: document.getElementById("noise-speed-slider"),
	sliderBrightness: document.getElementById("noise-brightness-slider"),
};

const particlesControls = {
	sliderCount: document.getElementById("particles-count-slider"),
	valueCount: document.getElementById("particles-count-value"),
	sliderSize: document.getElementById("particles-size-slider"),
	sliderSpeed: document.getElementById("particles-speed-slider"),
	sliderLifespan: document.getElementById("particles-lifespan-slider"),
	selectEmitterShape: document.getElementById("particles-emitter-shape"),
	sliderEmitterSize: document.getElementById("particles-emitter-size-slider"),
	selectForceType: document.getElementById("particles-force-type"),
	sliderForceStrength: document.getElementById(
		"particles-force-strength-slider",
	),
};

const kaleidoscopeControls = {
	sliderSegments: document.getElementById("kaleidoscope-segments-slider"),
	valueSegments: document.getElementById("kaleidoscope-segments-value"),
	sliderNoiseScale: document.getElementById("kaleidoscope-noise-scale-slider"),
	sliderNoiseSpeed: document.getElementById("kaleidoscope-noise-speed-slider"),
	sliderNoiseBrightness: document.getElementById(
		"kaleidoscope-noise-brightness-slider",
	),
};

const morphControls = {
	sliderMorphSpeed: document.getElementById("morph-speed-slider"),
	sliderRotationSpeed: document.getElementById("morph-rotation-slider"),
};

const metaballsControls = {
	sliderCount: document.getElementById("metaballs-count-slider"),
	valueCount: document.getElementById("mb-count-value"),
	sliderSize: document.getElementById("metaballs-size-slider"),
	valueSize: document.getElementById("mb-size-value"),
	sliderSpeed: document.getElementById("metaballs-speed-slider"),
	sliderThreshold: document.getElementById("metaballs-threshold-slider"),
	valueThreshold: document.getElementById("mb-threshold-value"),
	sliderColor: document.getElementById("metaballs-color-slider"),
};

const lissajousControls = {
	sliderA: document.getElementById("lissajous-a-slider"),
	valueA: document.getElementById("lj-a-value"),
	sliderB: document.getElementById("lissajous-b-slider"),
	valueB: document.getElementById("lj-b-value"),
	sliderDelta: document.getElementById("lissajous-delta-slider"),
	valueDelta: document.getElementById("lj-delta-value"),
	sliderAmpA: document.getElementById("lissajous-ampA-slider"),
	valueAmpA: document.getElementById("lj-ampA-value"),
	sliderAmpB: document.getElementById("lissajous-ampB-slider"),
	valueAmpB: document.getElementById("lj-ampB-value"),
	sliderSpeed: document.getElementById("lissajous-speed-slider"),
	sliderPoints: document.getElementById("lissajous-points-slider"),
	valuePoints: document.getElementById("lj-points-value"),
};

const allSliders = document.querySelectorAll('input[type="range"]');
const allSelects = document.querySelectorAll("select");
const allCheckboxes = document.querySelectorAll('input[type="checkbox"]');

// --- Three.js Setup ---
let scene, camera, renderer;
let renderTarget;
let currentAnimation = "lissajous"; // Default animation
let animationObjects = {};

function setupThreeJS() {
	// Create scene
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	// Create camera - perspective for 3D effects
	const outputRect = asciiOutput.getBoundingClientRect();
	const aspect =
		outputRect.width > 0 && outputRect.height > 0
			? outputRect.width / outputRect.height
			: 16 / 9; // Fallback aspect ratio

	camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
	camera.position.z = zoom;

	// Create renderer
	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(512, 512); // Fixed internal resolution, will be downsampled

	// Create a render target to read pixels from
	renderTarget = new THREE.WebGLRenderTarget(512, 512, {
		minFilter: THREE.LinearFilter,
		magFilter: THREE.NearestFilter,
		format: THREE.RGBAFormat,
		type: THREE.UnsignedByteType,
	});

	// Add ambient light
	const ambientLight = new THREE.AmbientLight(0x404040);
	scene.add(ambientLight);

	// Add directional light
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(5, 5, 5);
	scene.add(directionalLight);

	console.log("Three.js setup complete");
}

// --- Animation Switching Logic ---
function clearScene() {
	// Dispose all mesh and material resources
	scene.traverse((object) => {
		if (object.geometry) object.geometry.dispose();
		if (object.material) {
			if (Array.isArray(object.material)) {
				object.material.forEach((material) => material.dispose());
			} else {
				object.material.dispose();
			}
		}
	});

	// Clear the scene
	while (scene.children.length > 0) {
		scene.remove(scene.children[0]);
	}

	// Reset animation objects
	animationObjects = {};

	// Add lights back
	const ambientLight = new THREE.AmbientLight(0x404040);
	scene.add(ambientLight);
	const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.position.set(5, 5, 5);
	scene.add(directionalLight);
}

function switchAnimation(type) {
	clearScene();
	currentAnimation = type;

	document.querySelectorAll('.animation-controls').forEach(el => el.classList.remove('active'));

	if (type === 'torus') { 
		// Use the torus module
		if (window.TORUS_ANIMATION && window.TORUS_ANIMATION.setup) {
			window.TORUS_ANIMATION.setup();
		} else {
			console.error("Torus animation module not found");
		}
		controlContainers.torus.classList.add('active'); 
	} else if (type === 'noise') { 
		// Use the noise module
		if (window.NOISE_ANIMATION && window.NOISE_ANIMATION.setup) {
			window.NOISE_ANIMATION.setup();
		} else {
			console.error("Noise animation module not found");
		}
		controlContainers.noise.classList.add('active'); 
	} else if (type === 'particles') { 
		setupParticleAnimation(); 
		controlContainers.particles.classList.add('active'); 
	} else if (type === 'kaleidoscope') { 
		setupKaleidoscopeAnimation(); 
		controlContainers.kaleidoscope.classList.add('active'); 
	} else if (type === 'morph') { 
		setupMorphAnimation(); 
		controlContainers.morph.classList.add('active'); 
	} else if (type === 'metaballs') { 
		// Use the metaballs module
		if (window.METABALLS_ANIMATION && window.METABALLS_ANIMATION.setup) {
			window.METABALLS_ANIMATION.setup();
		} else {
			console.error("Metaballs animation module not found");
		}
		controlContainers.metaballs.classList.add('active'); 
	} else if (type === 'lissajous') { 
		// Use the lissajous module
		if (window.LISSAJOUS_ANIMATION && window.LISSAJOUS_ANIMATION.setup) {
			window.LISSAJOUS_ANIMATION.setup();
		} else {
			console.error("Lissajous animation module not found");
		}
		controlContainers.lissajous.classList.add('active'); 
	}

	// Adjust camera zoom based on animation type
	if (type === 'noise' || type === 'kaleidoscope') { 
		camera.position.z = 5; 
	} else if (type === 'morph' || type === 'torus' || type === 'lissajous') { 
		camera.position.z = 10; 
	} else if (type === 'metaballs') { 
		camera.position.z = 15; 
	} else { 
		camera.position.z = zoom; // Use global zoom for particles etc.
	}
	
	camera.rotation.set(0, 0, 0); // Reset rotation
	zoomSlider.value = camera.position.z; // Sync slider
}

// --- ASCII Conversion ---
function updateAsciiResolution() {
	// Check if asciiOutput element is ready and has dimensions
	const outputRect = asciiOutput.getBoundingClientRect();
	if (!outputRect || outputRect.width <= 0 || outputRect.height <= 0) {
		console.warn("ASCII output area not ready, deferring resolution update.");
		// Optionally retry after a short delay if needed, or rely on resize event
		if (!isInitialized) {
			// Only retry automatically on first load
			requestAnimationFrame(updateAsciiResolution); // Try again next frame
		}
		return false; // Indicate failure
	}

	asciiWidth = parseInt(resolutionSlider.value);
	resolutionValueSpan.textContent = asciiWidth;
	const charAspectRatio = 0.6; // Estimate character aspect ratio

	// Ensure width is positive before dividing
	if (outputRect.width > 0) {
		asciiHeight = Math.max(
			1,
			Math.round(
				(outputRect.height / outputRect.width) * asciiWidth * charAspectRatio,
			),
		);
	} else {
		asciiHeight = Math.max(
			1,
			Math.round(asciiWidth * charAspectRatio * (9 / 16)),
		); // Fallback aspect ratio
	}

	// Ensure dimensions are valid numbers
	if (
		isNaN(asciiWidth) ||
		isNaN(asciiHeight) ||
		asciiWidth <= 0 ||
		asciiHeight <= 0
	) {
		console.error(
			"Invalid ASCII dimensions calculated:",
			asciiWidth,
			asciiHeight,
		);
		return false; // Indicate failure
	}

	hiddenCanvas.width = asciiWidth;
	hiddenCanvas.height = asciiHeight;

	const baseFontSize = 10;
	const scaleFactor = 80 / asciiWidth;
	asciiOutput.style.fontSize = `${Math.max(4, baseFontSize * scaleFactor)}px`;
	console.log("ASCII Resolution Updated:", asciiWidth, asciiHeight);
	return true; // Indicate success
}

function getAsciiFromImageData(imageData) {
	const pixelData = imageData.data;
	const width = imageData.width;
	const height = imageData.height;
	let result = "";

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const offset = (y * width + x) * 4;
			const r = pixelData[offset];
			const g = pixelData[offset + 1];
			const b = pixelData[offset + 2];

			// Calculate brightness (weighted RGB)
			let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

			// Apply contrast adjustment
			brightness = (brightness - 0.5) * contrast + 0.5;

			// Apply threshold
			brightness = brightness < brightnessThreshold ? 0 : brightness;

			// Clamp to [0, 1]
			brightness = Math.max(0, Math.min(1, brightness));

			// Invert if needed
			if (invertBrightness) brightness = 1 - brightness;

			// Convert to character
			const charIndex = Math.floor(brightness * (currentAsciiChars.length - 1));
			const char = currentAsciiChars[charIndex];

			result += char;
		}
		result += "\n";
	}

	return result.trimEnd(); // Remove trailing newline
}

// --- Animation Loop ---
function animate() {
    if (!isPaused) {
        animationFrameId = requestAnimationFrame(animate);
    }

    const deltaTime = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    if (isPaused) return;

    // Call the appropriate animation update function
    if (currentAnimation === "torus") {
        if (window.TORUS_ANIMATION && window.TORUS_ANIMATION.update) {
            window.TORUS_ANIMATION.update(deltaTime, elapsedTime);
        }
    } else if (currentAnimation === "noise") {
        if (window.NOISE_ANIMATION && window.NOISE_ANIMATION.update) {
            window.NOISE_ANIMATION.update(deltaTime, elapsedTime);
        }
    } else if (currentAnimation === "particles") {
        if (window.PARTICLES_ANIMATION && window.PARTICLES_ANIMATION.update) {
            window.PARTICLES_ANIMATION.update(deltaTime, elapsedTime);
        }
    } else if (currentAnimation === "kaleidoscope") {
        if (window.KALEIDOSCOPE_ANIMATION && window.KALEIDOSCOPE_ANIMATION.update) {
            window.KALEIDOSCOPE_ANIMATION.update(deltaTime, elapsedTime);
        }
    } else if (currentAnimation === "morph") {
        if (window.MORPH_ANIMATION && window.MORPH_ANIMATION.update) {
            window.MORPH_ANIMATION.update(deltaTime, elapsedTime);
        }
    } else if (currentAnimation === "metaballs") {
        if (window.METABALLS_ANIMATION && window.METABALLS_ANIMATION.update) {
            window.METABALLS_ANIMATION.update(deltaTime, elapsedTime);
        }
    } else if (currentAnimation === "lissajous") {
        if (window.LISSAJOUS_ANIMATION && window.LISSAJOUS_ANIMATION.update) {
            window.LISSAJOUS_ANIMATION.update(deltaTime, elapsedTime);
        }
    }

    // Render the scene to the hidden canvas
    renderer.render(scene, camera);
    
    // Get pixel data from renderer
    renderer.domElement.style.display = "none"; // Hide the WebGL canvas
    hiddenCtx.drawImage(
        renderer.domElement,
        0, 0, renderer.domElement.width, renderer.domElement.height,
        0, 0, hiddenCanvas.width, hiddenCanvas.height
    );
    
    const imageData = hiddenCtx.getImageData(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    
    // Convert to ASCII and update display
    const asciiText = getAsciiFromImageData(imageData);
    asciiOutput.textContent = asciiText;
}

// --- Event Listeners ---
function setupEventListeners() {
	resolutionSlider.addEventListener("input", updateAsciiResolution);

	charsetSelect.addEventListener("change", (e) => {
		currentAsciiChars =
			ASCII_CHARS_MAP[e.target.value] || ASCII_CHARS_MAP["dense"];
	});

	brightnessSlider.addEventListener("input", (e) => {
		brightnessThreshold = parseFloat(e.target.value);
	});

	contrastSlider.addEventListener("input", (e) => {
		contrast = parseFloat(e.target.value);
	});

	zoomSlider.addEventListener("input", (e) => {
		zoom = parseFloat(e.target.value);
		camera.position.z = zoom;
	});

	invertCheckbox.addEventListener("change", (e) => {
		invertBrightness = e.target.checked;
	});

	animationSelect.addEventListener("change", (e) => {
		switchAnimation(e.target.value);
	});

	pausePlayButton.addEventListener("click", togglePause);
	randomizeButton.addEventListener("click", randomizeParameters);
}

// --- Pause/Play Logic ---
function togglePause() {
	isPaused = !isPaused;
	if (isPaused) {
		pausePlayButton.textContent = "Play";
		if (animationFrameId) {
			cancelAnimationFrame(animationFrameId);
			animationFrameId = null;
		}
	} else {
		pausePlayButton.textContent = "Pause";
		if (!animationFrameId) {
			animate();
		}
	}
}

// --- Randomize Logic ---
function randomizeParameters() {
	// Randomly select animation type
	const animationTypes = [
		"torus",
		"noise",
		"particles",
		"kaleidoscope",
		"morph",
		"metaballs",
		"lissajous",
	];
	const randomType =
		animationTypes[Math.floor(Math.random() * animationTypes.length)];
	animationSelect.value = randomType;

	// Randomize all visible sliders
	const activeControls = document.querySelector(".animation-controls.active");
	if (activeControls) {
		const sliders = activeControls.querySelectorAll('input[type="range"]');
		sliders.forEach((slider) => {
			const min = parseFloat(slider.min);
			const max = parseFloat(slider.max);
			const value = min + Math.random() * (max - min);
			slider.value = value;
			// Trigger input event to update displays
			const event = new Event("input", { bubbles: true });
			slider.dispatchEvent(event);
		});

		// Randomize selects within active controls
		const selects = activeControls.querySelectorAll("select");
		selects.forEach((select) => {
			const options = select.options;
			const randomIndex = Math.floor(Math.random() * options.length);
			select.selectedIndex = randomIndex;
			// Trigger change event
			const event = new Event("change", { bubbles: true });
			select.dispatchEvent(event);
		});
	}

	// Also randomize global controls (except animation type)
	brightnessSlider.value = Math.random();
	contrastSlider.value = 0.1 + Math.random() * 4.9;
	const charsetKeys = Object.keys(ASCII_CHARS_MAP);
	charsetSelect.value =
		charsetKeys[Math.floor(Math.random() * charsetKeys.length)];

	// Trigger change events
	brightnessSlider.dispatchEvent(new Event("input"));
	contrastSlider.dispatchEvent(new Event("input"));
	charsetSelect.dispatchEvent(new Event("change"));

	// Switch to the new animation type
	switchAnimation(randomType);
}

// --- Initialization ---
function initializeApp() {
	setupThreeJS();
	setupEventListeners();

	// Defer the first resolution update slightly to allow layout calculation
	requestAnimationFrame(() => {
		if (updateAsciiResolution()) {
			// If successful
			// Set initial animation
			switchAnimation(currentAnimation);
			animate(); // Start the animation loop
		} else {
			// If still failing, maybe wait longer or show error
			console.error("Failed to initialize ASCII resolution.");
			asciiOutput.textContent = "Error: Could not initialize display size.";
		}
	});
}

// Resize handler - Debounced
let resizeTimeout;
window.addEventListener("resize", () => {
	clearTimeout(resizeTimeout);
	resizeTimeout = setTimeout(() => {
		console.log("Window resized, updating resolution...");
		updateAsciiResolution(); // Update resolution

		// Update camera aspect ratio
		const outputRect = asciiOutput.getBoundingClientRect();
		if (outputRect.width > 0 && outputRect.height > 0) {
			camera.aspect = outputRect.width / outputRect.height; // Use actual aspect if possible
		} else {
			camera.aspect = 16 / 9; // Fallback
		}
		camera.updateProjectionMatrix();
	}, 150); // Debounce time
});

// Expose animation methods for other scripts
window.ASCII_ANIMATOR = {
	switchAnimation,
	animate,
	togglePause,
	randomizeParameters,
	updateAsciiResolution,
	initializeApp,
};

// Start the application when the window loads
window.addEventListener("load", initializeApp);
