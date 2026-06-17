# PCMVerse Project Guide

## Project Structure

```
D:\pcmverse\
├── css\
│   ├── style.css          # Main stylesheet - ALL simulation pages link to this
│   └── all-sim.css        # Not used by simulations (reverted)
├── js\
│   ├── sim-common.js      # Common JS - loaded by ALL simulation pages
│   │                        - Adds fullscreen button
│   │                        - Adds info button + modal
│   │                        - Contains SIM_DATA (from JSON)
│   └── update_js_from_json.cjs  # Node.js script to convert JSON → JS
├── data\
│   ├── physics-sims.json  # Physics simulation data (27 sims)
│   ├── chemistry-sims.json # Chemistry simulation data (7 sims)
│   └── maths-sims.json    # Maths simulation data (6 sims)
├── physics\               # 27 HTML simulation files
├── chemistry\             # 7 HTML simulation files
└── maths\                 # 6 HTML simulation files
```

## CRITICAL RULES

### 1. Navbar Structure (Must be identical across ALL files)
```html
<header>
    <nav class="navbar navbar-sim">
        <img src="../assets/logo.png" alt="Logo" class="site-logo">
        <div class="logo-text"><h1>Pankaj Classes</h1></div>
        <div class="nav-center">
            <h1>[Simulation Name]</h1>
        </div>
        <button class="back-btn" onclick="window.location.href='../index.html#[subject]'">Back to [Subject]</button>
    </nav>
</header>
```

### 2. Main Content Structure (Must be identical)
```html
<main class="sim-page">
    <div class="sim-container">
        <div>
            <div class="canvas-wrapper">
                <canvas id="simCanvas" width="800" height="500"></canvas>
            </div>
            <!-- stats, controls, etc -->
        </div>
        <div class="controls-panel">
            <!-- controls go here -->
        </div>
    </div>
</main>
```

### 3. Script Loading (Must be at end of body)
```html
    <script src="../js/sim-common.js"></script>
</body>
</html>
```

### 4. CSS Loading (Must be in head)
```html
<link rel="stylesheet" href="../css/style.css">
```

## What to NEVER do

- ❌ NEVER edit navbar structure in simulation HTML files
- ❌ NEVER add modal HTML to simulation HTML files (handled by sim-common.js)
- ❌ NEVER add info button HTML to simulation HTML files (handled by sim-common.js)
- ❌ NEVER change the script loading order
- ❌ NEVER use `all-sim.css` for simulation pages (only `style.css` is used)
- ❌ NEVER use `fetch()` to load JSON (use `update_js_from_json.cjs` instead)

## What IS controlled by JS

- Fullscreen button (added by `sim-common.js`)
- Info button (added by `sim-common.js`)
- Info modal HTML (added by `sim-common.js`)
- Info modal content (from JSON → embedded in `sim-common.js`)
- Modal click handlers (added by `sim-common.js`)

## Workflow: Adding/Editing Info Content

1. Edit the JSON file in `data/` folder:
   - `data/physics-sims.json`
   - `data/chemistry-sims.json`
   - `data/maths-sims.json`

2. Run the conversion command:
   ```powershell
   node update_js_from_json.cjs
   ```

3. Refresh browser - changes appear immediately

## Workflow: Adding New Simulation

1. Create HTML file in correct folder (`physics/`, `chemistry/`, or `maths/`)
2. Use EXACT navbar structure (see rules above)
3. Use EXACT main content structure (see rules above)
4. Add `<script src="../js/sim-common.js"></script>` before `</body>`
5. Add `<link rel="stylesheet" href="../css/style.css">` in `<head>`
6. Add entry to corresponding JSON file in `data/` folder
7. Run `node update_js_from_json.cjs`

## Math Formulas in Info Page

The info page supports LaTeX math formulas using **KaTeX**.

### JSON Format
```json
{
    "projectile-motion.html": {
        "title": "Projectile Motion",
        "learn": [
            "Range: $R = \\frac{v_0^2 \\sin(2\\theta)}{g}$",
            "Max height: $H = \\frac{v_0^2 \\sin^2(\\theta)}{2g}$",
            "Time of flight: $T = \\frac{2v_0 \\sin(\\theta)}{g}$"
        ]
    }
}
```

### Syntax
- Inline math: `$...$`
- Block math: `$$...$$`
- Escape backslash: `\\`
- Fractions: `\frac{a}{b}`
- Greek letters: `\alpha`, `\beta`, `\theta`, etc.
- Powers: `x^2`, `x^n`
- Subscripts: `x_i`, `v_0`

### Examples
```
$F = ma$
$E = mc^2$
$\int_0^1 x^2 dx = \frac{1}{3}$
$\sum_{i=1}^n i = \frac{n(n+1)}{2}$
```

## Commands

```powershell
# Convert JSON to JS
node update_js_from_json.cjs

# Start local server for testing (if needed)
python -m http.server 8000

# Check git status
git status --short
```

## Common Mistakes

1. **Info button not appearing**: Check that `sim-common.js` is loaded
2. **Modal not showing**: Check JSON data exists for that simulation filename
3. **Fullscreen button missing**: `sim-common.js` adds it automatically
4. **Layout broken**: Navbar structure must match exactly
5. **Math not rendering**: Use `$...$` for inline, `$$...$$` for block

## File Naming Convention

- JSON keys must match HTML filenames exactly (e.g., `projectile-motion.html`)
- JSON files named by subject: `physics-sims.json`, `chemistry-sims.json`, `maths-sims.json`


## Shorts Mode (YouTube Shorts Layout)

`shorts.html` provides a YouTube Shorts-style vertical layout with 3 stacked panels:

### Layout Percentage Distribution

The layout is controlled by CSS `height` percentages on 3 panels. Edit these in the `<style>` section of `shorts.html`:

```css
/* Controls panel - top section */
.controls-panel { height: 30% !important; }

/* Animation panel - middle section */
.animation-panel { height: 45% !important; }

/* Stats panel - bottom section */
.stats-panel { height: 25% !important; }
```

**Default: Controls 30% + Animation 45% + Stats 25% = 100%**

Adjust these values based on your needs:
- **More animation space**: Increase `animation-panel` height, decrease `controls-panel`
- **More stats visibility**: Increase `stats-panel` height, decrease `animation-panel`
- **More control space**: Increase `controls-panel` height, decrease `animation-panel`

### Canvas Size in Animation Panel

The canvas inside the animation panel is sized independently:

```css
/* Canvas wrapper - full panel width with horizontal scrollbar */
.canvas-wrapper {
    width: 100% !important;
    overflow-x: scroll !important;
}

/* Canvas - wider than panel for horizontal scrolling */
#simCanvas {
    width: 150% !important;
    height: auto !important;
}
```

**Default: Canvas width 150% of animation panel** (allows horizontal scrolling)

Adjust canvas width:
- `100%` - Canvas fits panel exactly, no scrolling
- `150%` - Canvas extends beyond panel, horizontal scrollbar appears
- `200%` - Canvas is double width, more scrolling room
- `auto` - Canvas uses its natural HTML width/height attributes

### Canvas Height

Canvas height is controlled by the animation panel height. The canvas maintains its aspect ratio automatically via `height: auto`.

If you need to force a specific canvas height:
```css
#simCanvas {
    width: 150% !important;
    height: 400px !important;  /* Fixed height */
}
```

### Adjusting for Different Simulations

Some simulations need more space than others:

| Simulation Type | Recommended Layout | Canvas Width |
|----------------|-------------------|--------------|
| Graph-heavy (kinematics) | Controls 25% / Animation 50% / Stats 25% | 150% |
| Trail/path (projectile) | Controls 30% / Animation 45% / Stats 25% | 150% |
| Compact (simple pendulum) | Controls 20% / Animation 55% / Stats 25% | 100% |
| Wide graphs (velocity-time) | Controls 25% / Animation 45% / Stats 30% | 200% |

### Controls Panel Structure

The controls panel is restructured into:
- **Header**: Dropdown selector for switching simulations (no "Controls" text)
- **Body**: Controls organized in horizontal rows:
  - Sliders row (horizontal layout)
  - Checkboxes row (horizontal layout)
  - Buttons row (horizontal layout)

### Stats Panel

- Fixed at bottom, 25% height
- Black scrollbars for dark theme
- Shows simulation data (position, velocity, acceleration, etc.)

### Commands

```powershell
# Test shorts.html locally
python -m http.server 8000
# Then open: http://localhost:8000/shorts.html
```