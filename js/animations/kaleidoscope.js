// Kaleidoscope Animation
function setupKaleidoscopeAnimation() {
    // Create a scene-filling plane for the kaleidoscope shader
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    
    // Create a shader material for the kaleidoscope effect
    const material = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            resolution: { value: new THREE.Vector2(1.0, 1.0) },
            segments: { value: parseInt(kaleidoscopeControls.sliderSegments.value) },
            noiseScale: { value: parseFloat(kaleidoscopeControls.sliderNoiseScale.value) },
            noiseBrightness: { value: parseFloat(kaleidoscopeControls.sliderNoiseBrightness.value) }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform float time;
            uniform vec2 resolution;
            uniform int segments;
            uniform float noiseScale;
            uniform float noiseBrightness;
            varying vec2 vUv;
            
            // Simple noise function
            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }
            
            // Improved noise with smoothing
            float smoothNoise(vec2 p) {
                vec2 ip = floor(p);
                vec2 fp = fract(p);
                
                vec2 u = fp*fp*(3.0-2.0*fp); // Smoothstep
                
                float a = noise(ip);
                float b = noise(ip + vec2(1.0, 0.0));
                float c = noise(ip + vec2(0.0, 1.0));
                float d = noise(ip + vec2(1.0, 1.0));
                
                return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
            }
            
            // Fractal Brownian Motion (fBm) noise
            float fbm(vec2 p) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                for (int i = 0; i < 5; i++) {
                    value += amplitude * smoothNoise(p * frequency);
                    frequency *= 2.0;
                    amplitude *= 0.5;
                }
                return value;
            }
            
            void main() {
                // Center the coordinates
                vec2 uv = vUv * 2.0 - 1.0;
                
                // Calculate angle and distance from center
                float angle = atan(uv.y, uv.x);
                float radius = length(uv);
                
                // Kaleidoscope effect: repeat the angle based on the number of segments
                float segmentAngle = 3.1415926 * 2.0 / float(segments);
                angle = mod(angle, segmentAngle) - segmentAngle / 2.0;
                
                // Convert back to Cartesian coordinates
                vec2 kalUv = vec2(cos(angle), sin(angle)) * radius;
                
                // Animate the noise pattern
                vec2 noiseCoord = kalUv * noiseScale + vec2(time * 0.2);
                float noiseValue = fbm(noiseCoord) * noiseBrightness;
                
                // Create a radial gradient that fades to black at the edges
                float radialGradient = smoothstep(1.0, 0.0, radius);
                
                // Final color
                gl_FragColor = vec4(vec3(noiseValue * radialGradient), 1.0);
            }
        `,
        transparent: true
    });
    
    const plane = new THREE.Mesh(planeGeometry, material);
    plane.name = "kaleidoscopePlane";
    
    // Set initial value displays
    kaleidoscopeControls.valueSegments.textContent = kaleidoscopeControls.sliderSegments.value;
    
    // Store objects for animation
    animationObjects.plane = plane;
    animationObjects.material = material;
    
    scene.add(plane);
    
    // Add listeners for parameter changes
    const kalSliders = [
        kaleidoscopeControls.sliderSegments, 
        kaleidoscopeControls.sliderNoiseScale, 
        kaleidoscopeControls.sliderNoiseSpeed,
        kaleidoscopeControls.sliderNoiseBrightness
    ];
    
    kalSliders.forEach(slider => {
        slider.removeEventListener('input', handleKaleidoscopeParamChange); // Prevent duplicates
        slider.addEventListener('input', handleKaleidoscopeParamChange);
    });
    
    // Initial update
    handleKaleidoscopeParamChange();
}

// Handler for Kaleidoscope parameter changes
function handleKaleidoscopeParamChange() {
    if (currentAnimation !== 'kaleidoscope' || !animationObjects.material) return;
    
    // Update labels
    kaleidoscopeControls.valueSegments.textContent = kaleidoscopeControls.sliderSegments.value;
    
    // Update shader uniforms
    animationObjects.material.uniforms.segments.value = parseInt(kaleidoscopeControls.sliderSegments.value);
    animationObjects.material.uniforms.noiseScale.value = parseFloat(kaleidoscopeControls.sliderNoiseScale.value);
    animationObjects.material.uniforms.noiseBrightness.value = parseFloat(kaleidoscopeControls.sliderNoiseBrightness.value);
}

// Animation update function for Kaleidoscope
function updateKaleidoscopeAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material) return;
    
    // Update shader time uniform for animation
    const speed = parseFloat(kaleidoscopeControls.sliderNoiseSpeed.value);
    animationObjects.material.uniforms.time.value = elapsedTime * speed;
}

// Make functions available to the main script
window.KALEIDOSCOPE_ANIMATION = {
    setup: setupKaleidoscopeAnimation,
    update: updateKaleidoscopeAnimation,
    handleParamChange: handleKaleidoscopeParamChange
};