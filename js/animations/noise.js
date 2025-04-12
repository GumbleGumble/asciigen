// Noise Field Animation
function setupNoiseAnimation() {
    console.log("Setting up Noise Field animation");
    
    // Get parameters from controls
    const scale = parseFloat(noiseControls.sliderScale.value);
    const brightness = parseFloat(noiseControls.sliderBrightness.value);
    
    // Create a plane to render the noise on
    const planeGeometry = new THREE.PlaneGeometry(10, 10, 100, 100);
    
    // Shader material for the noise
    const noiseMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 },
            scale: { value: scale },
            brightness: { value: brightness }
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
            uniform float scale;
            uniform float brightness;
            varying vec2 vUv;
            
            // Simplex noise function (from GLSL community snippets)
            vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v -   i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod(i, 289.0);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                    dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            void main() {
                // Adjusted UV coordinates for centered noise field
                vec2 uv = vUv * 2.0 - 1.0;
                
                // Layer multiple noise octaves
                float n1 = snoise((uv * scale) + vec2(time * 0.1, time * 0.08));
                float n2 = snoise((uv * scale * 2.0) + vec2(time * -0.15, time * 0.12));
                float n3 = snoise((uv * scale * 4.0) + vec2(time * 0.2, time * -0.18));
                
                // Combine noise layers with different weights
                float combinedNoise = n1 * 0.5 + n2 * 0.3 + n3 * 0.2;
                
                // Normalize to [0, 1] range 
                float normalizedNoise = (combinedNoise + 1.0) * 0.5;
                
                // Apply brightness adjustment
                normalizedNoise = pow(normalizedNoise, 1.0 / brightness);
                
                // Create some color variation based on position and noise
                vec3 color1 = vec3(0.0, 0.5, 1.0); // Blue
                vec3 color2 = vec3(1.0, 0.2, 0.8); // Magenta
                
                // Mix colors based on UV position and noise
                vec3 finalColor = mix(color1, color2, normalizedNoise);
                
                // Final color with noise as brightness
                gl_FragColor = vec4(finalColor * normalizedNoise, 1.0);
            }
        `
    });
    
    // Create mesh and add to scene
    const plane = new THREE.Mesh(planeGeometry, noiseMaterial);
    scene.add(plane);
    
    // Store references for animation updates
    animationObjects.plane = plane;
    animationObjects.material = noiseMaterial;
    
    // Add listeners for control changes
    noiseControls.sliderScale.addEventListener('input', handleNoiseParamChange);
    noiseControls.sliderBrightness.addEventListener('input', handleNoiseParamChange);
    noiseControls.sliderSpeed.addEventListener('input', handleNoiseParamChange);
}

function handleNoiseParamChange() {
    if (currentAnimation !== 'noise' || !animationObjects.material) return;
    
    // Update shader uniforms
    animationObjects.material.uniforms.scale.value = parseFloat(noiseControls.sliderScale.value);
    animationObjects.material.uniforms.brightness.value = parseFloat(noiseControls.sliderBrightness.value);
}

function updateNoiseAnimation(deltaTime, elapsedTime) {
    if (!animationObjects.material) return;
    
    // Update time uniform for shader animation
    const speed = parseFloat(noiseControls.sliderSpeed.value);
    animationObjects.material.uniforms.time.value = elapsedTime * speed;
}

// Make functions available to the main script
window.NOISE_ANIMATION = {
    setup: setupNoiseAnimation,
    update: updateNoiseAnimation,
    handleParamChange: handleNoiseParamChange
};