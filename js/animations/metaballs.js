// Metaballs Animation Module

// Shader code (unchanged)
const metaballsVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const metaballsFragmentShader = `
  varying vec2 vUv;
  uniform float u_time;
  uniform int u_ball_count; // Use int
  uniform float u_ball_size;
  uniform float u_speed;
  uniform float u_threshold;
  uniform float u_color_blend; // 0.0 to 1.0

  // Simple pseudo-random generator
  float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  void main() {
    vec2 p = vUv * 10.0 - 5.0; // Scale UVs to -5 to 5 range
    float sum = 0.0;

    for (int i = 0; i < 30; ++i) { // Max balls limit in shader
        if (i >= u_ball_count) break; // Stop if we exceed the requested count

        float fi = float(i);
        // Generate pseudo-random movement patterns
        float timeFactor = u_time * u_speed * 0.2;
        float offsetX = sin(timeFactor * (0.5 + rand(vec2(fi, fi*0.5))) + fi * 2.0) * 3.0;
        float offsetY = cos(timeFactor * (0.5 + rand(vec2(fi*0.5, fi))) + fi * 2.5) * 3.0;
        float offsetZ = sin(timeFactor * (0.3 + rand(vec2(fi, fi))) + fi * 1.5) * 0.5 + 0.5; // Size variation

        vec2 ballPos = vec2(offsetX, offsetY);
        float ballSize = u_ball_size * offsetZ; // Vary size slightly

        float d = length(p - ballPos);
        sum += ballSize / d; // Inverse distance for metaball effect
    }

    // Apply threshold with smoothing
    float intensity = smoothstep(u_threshold - 0.1, u_threshold + 0.1, sum);

    // Basic color blending
    vec3 color1 = vec3(0.1, 0.2, 0.8); // Blue
    vec3 color2 = vec3(0.8, 0.1, 0.2); // Red
    vec3 finalColor = mix(color1, color2, u_color_blend) * intensity;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Define controls mapping if not already in script.js
// Assuming uiElements and metaballsControls exist globally from script.js
// const metaballsControls = { // Already defined in script.js
//     sliderCount: uiElements.metaballsCount,
//     valueCount: uiElements.metaballsCountValue,
//     sliderSize: uiElements.metaballsSize,
//     valueSize: uiElements.metaballsSizeValue,
//     sliderSpeed: uiElements.metaballsSpeed,
//     valueSpeed: uiElements.metaballsSpeedValue,
//     sliderThreshold: uiElements.metaballsThreshold,
//     valueThreshold: uiElements.metaballsThresholdValue,
//     sliderColor: uiElements.metaballsColor,
//     valueColor: uiElements.metaballsColorValue,
// };


function setupMetaballsAnimation() {
    console.log("Setting up Metaballs animation");
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.ShaderMaterial({
        vertexShader: metaballsVertexShader,
        fragmentShader: metaballsFragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_ball_count: { value: Number.parseInt(metaballsControls.sliderCount.value) || 8 },
            u_ball_size: { value: Number.parseFloat(metaballsControls.sliderSize.value) || 1.2 },
            u_speed: { value: Number.parseFloat(metaballsControls.sliderSpeed.value) || 1.0 },
            u_threshold: { value: Number.parseFloat(metaballsControls.sliderThreshold.value) || 1.0 },
            u_color_blend: { value: Number.parseFloat(metaballsControls.sliderColor.value) || 0.5 },
        },
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "metaballsPlane";
    scene.add(mesh);

    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.geometry = geometry;

    // Add listeners (handled in script.js, ensure handleMetaballsParamChange exists)
    // metaballsControls.sliderCount.addEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderSize.addEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderSpeed.addEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderThreshold.addEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderColor.addEventListener('input', handleMetaballsParamChange);
}

function cleanupMetaballsAnimation() {
    console.log("Cleaning up Metaballs animation");
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        if (animationObjects.geometry) animationObjects.geometry.dispose();
        if (animationObjects.material) animationObjects.material.dispose();
    }
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometry = null;

    // Remove listeners (handled centrally in script.js)
    // metaballsControls.sliderCount.removeEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderSize.removeEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderSpeed.removeEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderThreshold.removeEventListener('input', handleMetaballsParamChange);
    // metaballsControls.sliderColor.removeEventListener('input', handleMetaballsParamChange);
}

// Handle changes to metaballs parameters (no recreation needed)
function handleMetaballsParamChange() {
    // Check if currentAnimationType is defined globally (from script.js)
    if (typeof currentAnimationType === 'undefined' || currentAnimationType !== 'metaballs' || !animationObjects.material) return;

    const count = Number.parseInt(metaballsControls.sliderCount.value);
    const size = Number.parseFloat(metaballsControls.sliderSize.value);
    const speed = Number.parseFloat(metaballsControls.sliderSpeed.value);
    const threshold = Number.parseFloat(metaballsControls.sliderThreshold.value);
    const colorBlend = Number.parseFloat(metaballsControls.sliderColor.value);

    animationObjects.material.uniforms.u_ball_count.value = count;
    animationObjects.material.uniforms.u_ball_size.value = size;
    animationObjects.material.uniforms.u_speed.value = speed;
    animationObjects.material.uniforms.u_threshold.value = threshold;
    animationObjects.material.uniforms.u_color_blend.value = colorBlend;

    // Update UI labels (already done in script.js listener)
}

// Animation update function for metaballs
function updateMetaballsAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material) return;
    animationObjects.material.uniforms.u_time.value = elapsedTime;
}

function randomizeMetaballsParameters() {
    console.log("Randomizing Metaballs parameters...");
    const sliders = [
        metaballsControls.sliderCount,
        metaballsControls.sliderSize,
        metaballsControls.sliderSpeed,
        metaballsControls.sliderThreshold,
        metaballsControls.sliderColor,
    ];

    for (const slider of sliders) {
         if (!slider) continue;
        const min = Number.parseFloat(slider.min);
        const max = Number.parseFloat(slider.max);
        const step = Number.parseFloat(slider.step) || (max - min) / 100;
        const randomValue = min + Math.random() * (max - min);
        slider.value = (Math.round(randomValue / step) * step).toFixed(
            step.toString().includes('.') ? step.toString().split('.')[1].length : 0
        );
        // Trigger input event to update uniforms via handleMetaballsParamChange and labels via script.js
        slider.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// Make functions available to the main script
window.METABALLS_ANIMATION = {
    setup: setupMetaballsAnimation,
    update: updateMetaballsAnimation,
    cleanup: cleanupMetaballsAnimation,
    randomize: randomizeMetaballsParameters,
    handleParamChange: handleMetaballsParamChange // Unified handler
};