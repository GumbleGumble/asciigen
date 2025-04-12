// Metaballs / Gooey Blobs Animation (2D Shader Based)

// Basic Vertex Shader
const metaballsVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Basic Fragment Shader (Metaballs)
const metaballsFragmentShader = `
  varying vec2 vUv;
  uniform float u_time;
  uniform int u_ball_count;
  uniform float u_ball_size;
  uniform float u_speed;
  uniform float u_threshold;
  uniform float u_color_blend; // 0 = blue, 1 = red

  // Simple pseudo-random movement based on index and time
  vec2 getBallPosition(int index, float time) {
    float i = float(index);
    float speed = u_speed * 0.2;
    float angle1 = i * 1.37 + time * speed * (0.5 + fract(i * 0.31));
    float angle2 = i * 2.41 + time * speed * (0.5 + fract(i * 0.73)) * 0.8;
    float radius = 0.3 + 0.1 * sin(i * 0.93 + time * speed * 0.3);
    return vec2(0.5 + cos(angle1) * radius, 0.5 + sin(angle2) * radius * 0.8);
  }

  void main() {
    float sum = 0.0;
    vec2 uv = vUv;

    for (int i = 0; i < 25; ++i) { // Max balls limit in shader
        if (i >= u_ball_count) break; // Use uniform count
        vec2 ballPos = getBallPosition(i, u_time);
        float dist = distance(uv, ballPos);
        sum += u_ball_size / (dist * dist + 0.01); // Additive influence, avoid division by zero
    }

    // Apply threshold and smoothstep for softer edges
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
const metaballsControls = {
    sliderCount: uiElements.metaballsCount,
    valueCount: uiElements.metaballsCountValue,
    sliderSize: uiElements.metaballsSize,
    valueSize: uiElements.metaballsSizeValue,
    sliderSpeed: uiElements.metaballsSpeed,
    valueSpeed: uiElements.metaballsSpeedValue,
    sliderThreshold: uiElements.metaballsThreshold,
    valueThreshold: uiElements.metaballsThresholdValue,
    sliderColor: uiElements.metaballsColor,
    valueColor: uiElements.metaballsColorValue,
};


function setupMetaballsAnimation() {
    console.log("Setting up Metaballs animation (placeholder)");
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

    // Add listeners
    metaballsControls.sliderCount.addEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderSize.addEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderSpeed.addEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderThreshold.addEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderColor.addEventListener('input', handleMetaballsParamChange);
}

function cleanupMetaballsAnimation() {
    console.log("Cleaning up Metaballs animation (placeholder)");
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        if (animationObjects.geometry) animationObjects.geometry.dispose();
        if (animationObjects.material) animationObjects.material.dispose();
    }
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometry = null;

    // Remove listeners
    metaballsControls.sliderCount.removeEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderSize.removeEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderSpeed.removeEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderThreshold.removeEventListener('input', handleMetaballsParamChange);
    metaballsControls.sliderColor.removeEventListener('input', handleMetaballsParamChange);
}

// Handle changes to metaballs parameters (no recreation needed)
function handleMetaballsParamChange() {
    if (currentAnimation !== 'metaballs' || !animationObjects.material) return;

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
    // handleCountChange: handleMetaballsParamChange, // Replaced with single handler
    // handleParamChange: handleMetaballsParamChange // Replaced with single handler
};