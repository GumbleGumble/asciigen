# asciigen

A web-based application that generates animated ASCII art from various 3D scenes and effects rendered using Three.js.

## Features

* Real-time ASCII rendering from 3D animations.
* Multiple animation types: Torus, Noise Field, Particle System, Kaleidoscope, Shape Morphing, Metaballs, Lissajous Curves.
* Adjustable parameters:
  * ASCII resolution (width)
  * Character sets
  * Brightness & Contrast
  * Camera Zoom
  * Render Resolution Scale
  * Animation-specific controls (speed, complexity, count, etc.)
  * Lighting controls (ambient, directional)
* Pause/Play functionality.
* Randomize parameters for discovering new visuals.
* Preset saving/loading/deleting using LocalStorage.
* GIF recording (5 seconds).

## Usage

1. Open `index.html` in a modern web browser that supports WebGL.
2. Use the controls on the right to select an animation type and adjust its parameters.
3. Use the global controls below the output to change the ASCII rendering style, lighting, and camera.
4. Save interesting configurations as presets.
5. Click "Record GIF" to capture a 5-second animation.

## Project Structure

* `index.html`: Main HTML file.
* `css/styles.css`: Tailwind CSS and custom styles.
* `js/script.js`: Main application logic, Three.js setup, rendering loop, UI handling.
* `js/animations/`: Modules for each specific animation type (`torus.js`, `noise.js`, etc.). Each module typically exports `setup`, `update`, `cleanup`, `randomize`, and parameter change handler functions.
* `js/libs/`: External libraries (Three.js, simplex-noise.js, gif.js).

## Dependencies

* [Three.js](https://threejs.org/) (loaded via CDN)
* [Tailwind CSS](https://tailwindcss.com/) (loaded via CDN)
* [simplex-noise.js](https://github.com/jwagner/simplex-noise.js) (local copy)
* [gif.js](https://github.com/jnordberg/gif.js) (local copy)
