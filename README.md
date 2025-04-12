# asciigen

**Working Title:** asciigen

## Project Overview

`asciigen` is a web-based application that generates animated ASCII art in real-time. It uses Three.js to render various 3D scenes and 2D effects, processes the rendered output, and converts it into corresponding ASCII characters displayed dynamically in a `<pre>` tag. The goal is to create a versatile tool for exploring different generative animations through the unique aesthetic of ASCII art.

## Current Features

* Real-time ASCII Conversion: Renders a Three.js scene, downscales it, analyzes pixel brightness, and maps it to a selected character set.
* Multiple Animation Modules:
  * Rotating Torus
  * Noise Field (Shader-based)
  * Particle System (CPU-based)
  * Kaleidoscope (Shader-based)
  * Shape Morphing (Placeholder/Basic)
  * Metaballs (Placeholder/Basic)
  * Lissajous Curves
* General Controls:
  * ASCII Resolution (Columns)
  * Character Set Selection
  * Brightness Offset & Contrast Adjustment
  * Camera Zoom
  * Invert Brightness Mapping
  * Render Target Resolution Scaling
  * Pause/Play Functionality
  * Randomize Parameters (including animation type)
* Lighting Controls:
  * Ambient Light Intensity
  * Directional Light Intensity & Position (X, Y, Z)
* Animation-Specific Controls: Parameters tailored to each animation type (e.g., Torus thickness, Noise scale/speed, Particle count/lifespan, Lissajous frequencies).
* Modular Architecture: Animations are separated into individual JavaScript files (`js/animations/`) managed by the main `js/script.js`.
* Dynamic UI: Control panels are shown/hidden based on the selected animation type.

## Project Goals (Remaining Tasks)

* Implement New Animation Types:
  * Text Rendering / Scrolling
  * Reaction-Diffusion Simulation
  * Game of Life Simulation
* Presets System:
  * Define default presets.
  * Implement Save/Load functionality for custom presets (using LocalStorage).
* Enhance Existing Animations:
  * **Particles:** Add Flow Field, Attraction/Repulsion forces; color variation; Line/Disc emitters.
  * **Noise/Kaleidoscope:** Add noise complexity controls; independent X/Y speed; different base patterns/rotation for Kaleidoscope.
  * **Torus:** Add material `roughness` and `metalness` controls.
  * **Morph:** Implement selection of Start/End shapes; refine morphing logic.
  * **Lissajous:** Enhance the trail/decay effect.
* Complete Placeholders: Fully implement `metaballs.js` and `morph.js`.
* UI Refinements: Add missing value display spans for all sliders (Done).

## Future Ideas (Shelved for now)

* Interactivity: Mouse controls to influence animations (e.g., particle forces, light position).
* Audio Reactivity: Link animation parameters to audio input using Web Audio API.
* Export: Functionality to export animations (e.g., animated GIF, text sequence).
* Performance: Optimize ASCII conversion (Web Workers?), debounce expensive controls.
* Visuals: ANSI color support, more character sets, background effects.

## Basic Usage (For Humans)

1. Ensure you have a local web server set up (e.g., using Python's `http.server`, Node.js `live-server`, or VS Code Live Server extension).
2. Serve the project directory (`/Users/chase/Library/Mobile Documents/com~apple~CloudDocs/-Projects/Personal Projects/Dev Projects/JS Projects/Ascii v2/`).
3. Open the served `index.html` in your web browser.
4. Use the controls on the left panel to select animation types and adjust parameters. The ASCII animation will update in the right panel.

*(This README is intended to provide context for development and future AI interactions.)*
