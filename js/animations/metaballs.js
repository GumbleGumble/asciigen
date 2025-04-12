// Metaballs Animation Module - Needs Implementation

// Shader code (unchanged)
const metaballsVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Basic Metaballs Fragment Shader (Example - replace with more robust version)
const metaballsFragmentShader = `
    varying vec2 vUv;
    uniform float u_time;
    uniform int u_num_metaballs; // Max number supported by shader
    uniform vec3 u_metaballs[25]; // Array for position (xy) and radius (z), max 25
    uniform float u_threshold;
    uniform float u_color_blend; // 0 = blue, 1 = red

    void main() {
        float totalInfluence = 0.0;
        vec2 uvCentered = vUv * 2.0 - 1.0; // Center UVs (-1 to 1)
        // Adjust aspect ratio if needed, assuming square for now
        // float aspectRatio = 1.0; // Calculate based on resolution if needed
        // uvCentered.x *= aspectRatio;

        float scaleFactor = 5.0; // Scale UVs to match typical metaball positions

        for (int i = 0; i < 25; ++i) {
            if (i >= u_num_metaballs) break; // Process only active metaballs

            vec2 ballPos = u_metaballs[i].xy;
            float radius = u_metaballs[i].z;
            if (radius <= 0.0) continue; // Skip inactive balls

            vec2 diff = (uvCentered * scaleFactor) - ballPos;
            float distSq = dot(diff, diff);
            // Inverse square falloff
            totalInfluence += (radius * radius) / distSq;
        }

        float intensity = smoothstep(u_threshold - 0.1, u_threshold + 0.1, totalInfluence);

        if (intensity < 0.01) {
             discard; // Discard fragment if below threshold (transparent background)
             // Or set to background color: gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }

        // Simple color blend based on influence or uniform
        vec3 colorA = vec3(0.2, 0.5, 1.0); // Blue
        vec3 colorB = vec3(1.0, 0.3, 0.3); // Red
        vec3 finalColor = mix(colorA, colorB, u_color_blend); // Blend based on slider

        gl_FragColor = vec4(finalColor * intensity, 1.0);
    }
`;


function setupMetaballsAnimation() {
    console.log("Setting up Metaballs animation (Implementation Pending)");
    // TODO: Implement plane, shader material, uniforms, metaball data array
    const geometry = new THREE.PlaneGeometry(10, 10); // Covers view

    // Initialize metaball data array (pos.x, pos.y, radius)
    const maxBalls = 25; // Must match shader array size
    const metaballData = new Float32Array(maxBalls * 3);
    animationObjects.metaballData = metaballData; // Store for updates
    animationObjects.metaballVelocities = new Float32Array(maxBalls * 2); // Store velocities (vx, vy)

    const material = new THREE.ShaderMaterial({
        vertexShader: metaballsVertexShader,
        fragmentShader: metaballsFragmentShader,
        uniforms: {
            u_time: { value: 0.0 },
            u_num_metaballs: { value: Number.parseInt(metaballsControls.sliderCount?.value || 8) },
            u_metaballs: { value: metaballData }, // Pass the array
            u_threshold: { value: Number.parseFloat(metaballsControls.sliderThreshold?.value || 1.0) },
            u_color_blend: { value: Number.parseFloat(metaballsControls.sliderColor?.value || 0.5) },
        },
        transparent: true, // Needed if using discard or alpha
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = "metaballsPlane";
    scene.add(mesh);

    animationObjects.mesh = mesh;
    animationObjects.material = material;
    animationObjects.geometry = geometry;

    // Initialize ball positions and velocities
    initializeMetaballs();

    // Initial UI update handled by script.js
}

function cleanupMetaballsAnimation() {
    console.log("Cleaning up Metaballs animation (Implementation Pending)");
    // TODO: Remove objects, dispose geometry/material
    if (animationObjects.mesh) {
        scene.remove(animationObjects.mesh);
        animationObjects.geometry?.dispose();
        animationObjects.material?.dispose();
    }
    animationObjects.mesh = null;
    animationObjects.material = null;
    animationObjects.geometry = null;
    animationObjects.metaballData = null;
    animationObjects.metaballVelocities = null;
}

function initializeMetaballs() {
    if (!animationObjects.metaballData || !animationObjects.metaballVelocities) return;

    const numBalls = Number.parseInt(metaballsControls.sliderCount?.value || 8);
    const size = Number.parseFloat(metaballsControls.sliderSize?.value || 1.2);
    const speed = Number.parseFloat(metaballsControls.sliderSpeed?.value || 1.0);
    const data = animationObjects.metaballData;
    const velocities = animationObjects.metaballVelocities;
    const bounds = 4.0; // Movement bounds

    for (let i = 0; i < 25; i++) { // Initialize entire array
        const i3 = i * 3;
        const i2 = i * 2;
        if (i < numBalls) {
            // Position (random within bounds)
            data[i3] = (Math.random() - 0.5) * 2 * bounds;
            data[i3 + 1] = (Math.random() - 0.5) * 2 * bounds;
            // Radius
            data[i3 + 2] = size * (0.8 + Math.random() * 0.4); // Slight size variation

            // Velocity (random direction)
            const angle = Math.random() * Math.PI * 2;
            const velMag = speed * (0.5 + Math.random());
            velocities[i2] = Math.cos(angle) * velMag;
            velocities[i2 + 1] = Math.sin(angle) * velMag;
        } else {
            // Deactivate extra balls
            data[i3 + 2] = 0.0; // Set radius to 0
            velocities[i2] = 0.0;
            velocities[i2 + 1] = 0.0;
        }
    }
    // Update uniform count
    if (animationObjects.material) {
        animationObjects.material.uniforms.u_num_metaballs.value = numBalls;
    }
}


function handleMetaballsParamChange() {
    if (currentAnimationType !== 'metaballs' || !animationObjects.material) return;
    console.log("Handling Metaballs parameter change (Implementation Pending)");
    // TODO: Update shader uniforms, potentially re-initialize balls if count/size changes significantly
    const numBalls = Number.parseInt(metaballsControls.sliderCount.value);
    const size = Number.parseFloat(metaballsControls.sliderSize.value);
    const threshold = Number.parseFloat(metaballsControls.sliderThreshold.value);
    const colorBlend = Number.parseFloat(metaballsControls.sliderColor.value);

    // Check if count or size changed enough to warrant re-initialization
    if (animationObjects.material.uniforms.u_num_metaballs.value !== numBalls) {
         console.log("Metaball count changed, re-initializing...");
         initializeMetaballs(); // Re-init positions/velocities/radii
    } else {
        // If only size changed, update radii of existing balls
        const data = animationObjects.metaballData;
        for (let i = 0; i < numBalls; i++) {
            data[i * 3 + 2] = size * (0.8 + Math.random() * 0.4); // Re-randomize slightly based on new size
        }
    }


    animationObjects.material.uniforms.u_num_metaballs.value = numBalls;
    animationObjects.material.uniforms.u_threshold.value = threshold;
    animationObjects.material.uniforms.u_color_blend.value = colorBlend;
    // Speed is read in update loop

    // UI label updates are handled by the main script's event listeners
}

function updateMetaballsAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material || !animationObjects.metaballData || !animationObjects.metaballVelocities) return;
    // TODO: Update metaball positions based on velocities, handle boundary collisions, update time uniform
    const speed = Number.parseFloat(metaballsControls.sliderSpeed.value); // Read current speed
    const data = animationObjects.metaballData;
    const velocities = animationObjects.metaballVelocities;
    const numBalls = animationObjects.material.uniforms.u_num_metaballs.value;
    const bounds = 4.0; // Movement bounds, should match initialization

    for (let i = 0; i < numBalls; i++) {
        const i3 = i * 3;
        const i2 = i * 2;

        // Update position
        data[i3] += velocities[i2] * deltaTime * speed;
        data[i3 + 1] += velocities[i2 + 1] * deltaTime * speed;

        // Boundary collision (simple reflection)
        if (data[i3] > bounds || data[i3] < -bounds) {
            velocities[i2] *= -1;
            data[i3] = Math.sign(data[i3]) * bounds; // Clamp position
        }
        if (data[i3 + 1] > bounds || data[i3 + 1] < -bounds) {
            velocities[i2 + 1] *= -1;
            data[i3 + 1] = Math.sign(data[i3 + 1]) * bounds; // Clamp position
        }
    }

    // Update uniforms
    animationObjects.material.uniforms.u_time.value = elapsedTime;
    animationObjects.material.uniforms.u_metaballs.value = data; // Update the whole array
    animationObjects.material.uniforms.u_metaballs.needsUpdate = true; // Important for arrays? Check Three.js docs. Usually needed for textures.
}

function randomizeMetaballsParameters() {
    console.log("Randomizing Metaballs parameters (Implementation Pending)");
    // TODO: Randomize metaballsControls sliders and trigger 'input' event
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
        const range = max - min;
        const randomSteps = Math.floor(Math.random() * (range / step + 1));
        slider.value = min + randomSteps * step;
        slider.dispatchEvent(new Event('input', { bubbles: true })); // Trigger update
    }
}

// Expose module methods
window.METABALLS_ANIMATION = {
    setup: setupMetaballsAnimation,
    update: updateMetaballsAnimation,
    cleanup: cleanupMetaballsAnimation,
    randomize: randomizeMetaballsParameters,
    handleParamChange: handleMetaballsParamChange
};