# asciigen

A web-based ASCII art generator that converts live 3D animations into text characters in real-time. Built with Three.js for rendering and custom JavaScript for ASCII conversion.

## Features

* **Live 3D Rendering:** Uses Three.js to render various animations.
* **Real-time ASCII Conversion:** Converts the rendered frames into ASCII art on the fly.
* **Multiple Animation Types:** Includes several built-in animations like Torus Knot, Noise Field, Particle System, Kaleidoscope, Shape Morphing, Metaballs, and Lissajous Curves.
* **Customizable Parameters:** Each animation has adjustable parameters (speed, complexity, colors, etc.).
* **ASCII Output Controls:** Adjust resolution, character set, brightness, contrast, and invert colors.
* **Responsive Design:** Adapts to different screen sizes.
* **Pause/Play & Randomize:** Control the animation flow and explore random parameter combinations.

## How It Works

1. **Setup:** Initializes Three.js scene, camera, and renderer. Sets up an offscreen render target and a 2D canvas for downscaling.
2. **Animation Loop:**
    * Updates the current 3D animation based on elapsed time and user-controlled parameters.
    * Renders the Three.js scene to the offscreen `WebGLRenderTarget`.
3. **ASCII Conversion (`renderToAscii` function):**
    * Reads pixel data from the `WebGLRenderTarget`.
    * Draws the pixel data onto a smaller 2D `canvas` element (downscaling).
    * Gets the `ImageData` from the small 2D canvas.
    * Iterates through the pixel data of the downscaled image.
    * Calculates the brightness (luminance) for each pixel.
    * Applies contrast and brightness adjustments based on slider values.
    * Maps the final brightness value to a character from the selected ASCII character set.
    * Constructs the final ASCII string with newlines.
4. **Display:** Updates the content of the `<pre>` tag with the generated ASCII string.

## Project Goals (Remaining Tasks / Future Ideas)

* Implement New Animation Types:
  * Text Rendering / Scrolling
  * Reaction-Diffusion Simulation
  * Game of Life Simulation
* Presets System:
  * Define default presets.
  * Implement Save/Load functionality for custom presets (using LocalStorage).
* Enhance Existing Animations:

  * ### Noise/Kaleidoscope

        Add noise complexity controls (e.g., octaves); independent X/Y speed; different base patterns/rotation for Kaleidoscope.

  * ### Lissajous

        Refine trail/decay effect (e.g., opacity fade).
* Performance Optimizations:
  * Optimize ASCII conversion (Web Workers?).
  * Debounce expensive controls (e.g., particle count, complexity).
  * Optimize shaders where possible.
* Visuals & UI:
  * ANSI color support in ASCII output.
  * More character sets.
  * Background effects/layers.
  * More intuitive UI layout or grouping.
* Interactivity: Mouse controls to influence animations (e.g., particle forces, light position).

## Setup & Running

1. Clone the repository.
2. Open `index.html` in your web browser. (Requires a browser that supports WebGL).

## File Structure
