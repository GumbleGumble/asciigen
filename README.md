# ASCII Art Generator V2

A web-based ASCII art generator that converts 3D animations into text-based art in real-time. Built with Three.js and custom shaders.

## Features

* **Real-time ASCII Rendering:** Converts 3D scenes to ASCII art using `THREE.AsciiEffect`.
* **Multiple Animation Types:** Choose from various built-in animations:
  * **Lissajous:** Animated Lissajous curves with fading trails.
  * **Torus:** Rotating torus knot with adjustable material properties.
  * **Noise:** Shader-based FBM noise patterns (Simplex/Value).
  * **Particles:** 3D particle system with emitters (box, sphere, point) and forces (gravity, vortex, noise).
  * **Kaleidoscope:** Shader-based kaleidoscope effect using mirrored noise.
  * **Morph:** Smoothly morphing between different 3D shapes.
  * **Metaballs:** 2D metaballs simulation using shaders.
* **Customizable Parameters:** Adjust animation speed, complexity, colors, lighting, ASCII character set, resolution, and more via UI controls.
* **Theming:** Select from various pre-defined UI themes (Dark, Light, Matrix, Solarized, Monokai, Dracula, Nord, Gruvbox, etc.).
* **Theme Editor:** Temporarily customize the background and text color of the ASCII output window.
* **Presets:** Save and load your favorite parameter configurations locally.
* **Pause/Play & Randomize:** Control the animation flow and discover new combinations.
* **(Experimental) GIF Recording:** Attempt to record short GIF clips of the animation (currently requires debugging/improvement).

## How to Use

1. Open `index.html` in a modern web browser that supports WebGL.
2. Use the controls in the right-hand panel to:
    * Select an **Animation Type**.
    * Adjust **General** settings like ASCII resolution, character set, brightness, contrast, and zoom.
    * Modify **Lighting** (ambient and directional).
    * Tune parameters specific to the selected **Animation** (e.g., speed, complexity, colors).
    * Choose a UI **Theme** from the dropdown.
    * Use the **Theme Editor** to tweak output colors.
    * **Pause/Play** the animation.
    * **Randomize** all parameters for surprising results.
    * Manage **Presets** to save/load configurations.
    * (Experimental) Try **Recording a GIF**.

## Controls Overview

* **General Controls:**
  * `Theme`: Select UI color scheme.
  * `Resolution`: Controls the density of the ASCII grid (lower value = denser).
  * `Character Set`: Choose the characters used for rendering.
  * `Brightness`/`Contrast`: Adjust the visual output via CSS filters.
  * `Zoom`: Move the camera closer or further away.
  * `Invert`: Invert the brightness mapping for ASCII characters.
  * `Render Quality`: Adjust the resolution of the underlying 3D render target.
* **Lighting Controls:**
  * `Ambient`/`Directional Intensity`: Control light levels.
  * `Light Position (X/Y/Z)`: Set the direction of the directional light.
* **Animation Specific Controls:** Each animation type reveals its own set of sliders and selectors.
* **Theme Editor:**
  * `Output Background`/`Output Text`: Color pickers for the ASCII display area.
* **Presets:**
  * `Save`: Enter a name and save the current state of all controls.
  * `Load/Delete`: Select a saved preset to load or delete it.
* **Buttons:**
  * `Pause/Play`: Toggle animation updates.
  * `Randomize`: Randomizes global settings, selects a random animation, and randomizes its parameters.
  * `Record GIF`: (Experimental) Start/Stop GIF recording.

## File Structure

* `index.html`: Main HTML file with UI layout.
* `css/styles.css`: CSS for styling the UI and themes.
* `js/script.js`: Main JavaScript file handling Three.js setup, UI logic, animation switching, presets, themes, etc.
* `js/animations/`: Folder containing individual modules for each animation type (`lissajous.js`, `torus.js`, etc.). Each module typically exports `setup`, `update`, `cleanup`, `randomize`, and parameter change handler functions.
* `js/lib/`: Contains external libraries like `three.min.js`, `simplex-noise.min.js`, and `gif.js`.

## Dependencies

* **Three.js (r128):** Core 3D library.
* **Simplex Noise:** Used for noise-based animations (Particles, Noise, Kaleidoscope).
* **gif.js:** (Experimental) Used for GIF recording.

## Known Issues / Future Improvements

* **GIF Recording:** Needs significant improvement for reliability and better capture method (e.g., capturing final ASCII output). Add options for duration, looping, FPS.
* **Performance:** Complex animations or high particle counts might impact performance, especially during GIF recording.
* **Theme Editor Persistence:** Theme editor changes are currently temporary. Could be integrated with the preset system.
* **More Animations:** Add more diverse animation types.
* **Shader Optimizations:** Review and optimize shader code.
* **Mobile Responsiveness:** Improve layout and usability on smaller screens.
