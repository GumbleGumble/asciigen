# asciigen

A web-based ASCII art generator that converts live 3D animations into text characters in real-time. Built with Three.js for rendering and custom JavaScript for ASCII conversion.

## Features

* **Live 3D Rendering:** Uses Three.js to render various animations.
* **Real-time ASCII Conversion:** Converts the rendered frames into ASCII art on the fly.
* **Multiple Animation Types:** Includes several built-in animations: Rotating Torus, Noise Field, Particle System, Kaleidoscope, Shape Morphing, Metaballs, and Lissajous Curves.
* **Customizable Parameters:** Each animation has adjustable parameters (speed, complexity, colors, etc.). Specific controls are shown/hidden based on the selected animation.
* **ASCII Output Controls:** Adjust resolution, character set, brightness, contrast, and invert colors.
* **Lighting Controls:** Adjust ambient and directional light intensity and position (only shown for relevant animations).
* **Subtle Effects:** Includes a slow background color shift and gentle camera rotation for added visual interest.
* **Responsive Design:** Adapts to different screen sizes.
* **Pause/Play & Randomize:** Control the animation flow and explore random parameter combinations for both global and animation-specific settings.

## How It Works

1. **Setup (`init` in `script.js`):** Initializes Three.js scene, camera, renderer, and clock. Sets up an offscreen `WebGLRenderTarget` and a 2D canvas (`downscaleCanvas`) for processing. Attaches event listeners to UI controls.
2. **Animation Switching (`switchAnimation`):**
    * Cleans up resources (geometry, materials, objects) from the previous animation using the module's `cleanup` function.
    * Resets the `animationObjects` container.
    * Sets up the new animation using the selected module's `setup` function.
    * Adds/updates global lighting (ambient, directional) and stores references.
    * Adjusts camera zoom based on the animation type.
    * Updates the UI (`updateUIForAnimationType`) to show relevant controls (including conditionally showing lighting controls).
3. **Animation Loop (`animate`):**
    * If not paused, calculates delta time using `THREE.Clock`.
    * Calls the current animation module's `update` function, passing delta and elapsed time.
    * Calls `renderToAscii` to perform the conversion and display.
    * Requests the next animation frame using `requestAnimationFrame`.
4. **ASCII Conversion (`renderToAscii`):**
    * Renders the Three.js scene to the offscreen `WebGLRenderTarget`.
    * Reads pixel data from the `WebGLRenderTarget` into a `Uint8Array`.
    * Draws the pixel data onto the smaller `downscaleCanvas` using `drawImage` (performs downscaling).
    * Gets the `ImageData` from the `downscaleCanvas`.
    * Iterates through the pixel data of the downscaled image.
    * Calculates the brightness (luminance) for each pixel.
    * Applies contrast and brightness adjustments based on slider values.
    * Optionally inverts brightness.
    * Clamps the brightness value between 0 and 1.
    * Maps the final brightness value to a character from the selected ASCII character set (`asciiChars`).
    * Constructs the final ASCII string row by row.
5. **Display:** Updates the `textContent` of the `<pre id="asciiDisplay">` tag with the generated ASCII string. The font size of the `pre` tag is dynamically adjusted (`setupRenderTargetAndCanvas`) to fit the container based on the ASCII resolution.

## Project Goals (Remaining Tasks / Future Ideas)

* Implement New Animation Types:
  * Text Rendering / Scrolling
  * Reaction-Diffusion Simulation
  * Game of Life Simulation
* Presets System:
  * Define default presets.
  * Implement Save/Load functionality for custom presets (using LocalStorage).
* Enhance Existing Animations:
  * **Noise/Kaleidoscope:** Add noise complexity controls (e.g., octaves); independent X/Y speed; different base patterns/rotation for Kaleidoscope.
  * **Lissajous:** Refine trail/decay effect (e.g., opacity fade).
* Performance Optimizations:
  * Optimize ASCII conversion (Web Workers?).
  * Debounce expensive controls (e.g., particle count, complexity - *partially done*).
  * Optimize shaders where possible.
* Visuals & UI:
  * ANSI color support in ASCII output.
  * More character sets.
  * Background effects/layers.
  * More intuitive UI layout or grouping.
* Interactivity: Mouse controls to influence animations (e.g., particle forces, light position).

## Setup & Running

1. Clone the repository.
2. Open `index.html` in your web browser. (Requires a browser that supports WebGL and ES Modules). *Alternatively, serve the directory using a local web server.*

## File Structure
