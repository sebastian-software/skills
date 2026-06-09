# CSS Integration & Advanced Techniques

How to integrate SVG texture filters into web pages, create grainy gradients, animate textures, and use pure CSS patterns as complements.

## Table of Contents
1. [Embedding Methods](#embedding-methods)
2. [Grainy Gradients Deep Dive](#grainy-gradients-deep-dive)
3. [Animation Techniques](#animation-techniques)
4. [CSS-Only Gradient Patterns](#css-only-gradient-patterns)
5. [Performance Optimization](#performance-optimization)
6. [Useful Tools](#useful-tools)

---

## Embedding Methods

### Method 1: Inline SVG + CSS filter reference

Place the SVG filter in your HTML, apply via CSS. The most flexible approach — allows filter on any HTML element.

```html
<svg width="0" height="0" style="position:absolute">
  <filter id="paper">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5"/>
    <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="2">
      <feDistantLight azimuth="45" elevation="60"/>
    </feDiffuseLighting>
  </filter>
</svg>

<div style="filter: url(#paper); width: 100%; height: 400px;"></div>
```

### Method 2: SVG as CSS background-image (data URI)

Encode the entire SVG texture inline in CSS. No external files needed.

```css
.textured {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
```

URL-encoding rules: `<` → `%3C`, `>` → `%3E`, `#` → `%23`, `"` → `'` (use single quotes inside), `%` → `%25` (in values like `100%`).

### Method 3: External SVG file

Save the SVG as a separate file and reference it.

```css
.textured {
  background-image: url("/textures/noise.svg");
  /* or as filter: */
  filter: url("/textures/filters.svg#paper");
}
```

Benefits: browser caching, CDN delivery, clean markup. Downside: extra HTTP request.

### Method 4: Full SVG element as background

Use a full `<svg>` element with `<rect>` filling the viewport. Good for full-page backgrounds.

```html
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
     style="position:fixed; inset:0; z-index:-1;">
  <filter id="bg-texture">...</filter>
  <rect width="100%" height="100%" filter="url(#bg-texture)"/>
</svg>
```

---

## Grainy Gradients Deep Dive

The technique combines SVG noise with CSS gradients and extreme filter values to create textured, organic gradients.

### Core technique

```css
.grainy {
  position: relative;
  isolation: isolate; /* prevents blend leaking to parent */
}

.grainy::before {
  content: "";
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to bottom right, #6366f1, transparent),
    url("data:image/svg+xml,..."); /* SVG noise */
  filter: contrast(170%) brightness(1000%);
  mix-blend-mode: multiply;
  z-index: -1;
}
```

### How it works
1. The SVG produces multicolored Perlin noise
2. `contrast(170%) brightness(1000%)` pushes the noise to near-pure black or white — this is the grain
3. The gradient provides the color
4. `mix-blend-mode: multiply` lets the dark grain show through the gradient

### Layering for richer effects

Stack multiple pseudo-elements or elements for complex compositions:

```css
/* Grain layer */
.grainy::before {
  background: linear-gradient(20deg, rebeccapurple, transparent), url("noise.svg");
  filter: contrast(170%) brightness(1000%);
  mix-blend-mode: multiply;
}

/* Color overlay */
.grainy::after {
  background: moccasin;
  mix-blend-mode: multiply;
}
```

### Holographic variation

Use `mix-blend-mode: overlay` with high contrast values. The rainbow noise produces iridescent, holographic-foil effects:

```css
.holo::before {
  background: url("noise.svg");
  filter: contrast(300%) brightness(500%);
  mix-blend-mode: overlay;
  opacity: 0.4;
}
```

### Shadow grain

Apply grain to shadow/lighting layers for realistic depth:

```css
.shadow-grain {
  background:
    radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.4), transparent 70%),
    url("noise.svg");
  filter: contrast(150%) brightness(800%);
  mix-blend-mode: multiply;
}
```

---

## Animation Techniques

### CSS @keyframes with multiple seeds

Pre-define filters with different `seed` values, cycle through them:

```xml
<filter id="anim-0"><feTurbulence baseFrequency="0.5" seed="0"/></filter>
<filter id="anim-1"><feTurbulence baseFrequency="0.5" seed="1"/></filter>
<filter id="anim-2"><feTurbulence baseFrequency="0.5" seed="2"/></filter>
```

```css
.animated {
  animation: noise-cycle 0.3s steps(3) infinite;
}
@keyframes noise-cycle {
  0%   { filter: url(#anim-0); }
  33%  { filter: url(#anim-1); }
  66%  { filter: url(#anim-2); }
}
```

### JavaScript attribute animation

Directly modify filter attributes for smooth transitions:

```javascript
const turb = document.querySelector('#myFilter feTurbulence');
let freq = 0.01;

function animate() {
  freq += 0.0001;
  turb.setAttribute('baseFrequency', `0 ${freq}`);
  requestAnimationFrame(animate);
}
animate();
```

### GSAP animation

```javascript
const turbVal = { val: 0.000001 };
const turb = document.querySelector('#noise feTurbulence');

gsap.to(turbVal, {
  val: 0.04,
  duration: 2,
  yoyo: true,
  repeat: -1,
  onUpdate: () => turb.setAttribute('baseFrequency', `0 ${turbVal.val}`)
});
```

### SVG native animate

```xml
<feTurbulence baseFrequency="0.01" numOctaves="2">
  <animate attributeName="baseFrequency"
           values="0.01 0.02;0.02 0.04;0.01 0.02"
           dur="10s" repeatCount="indefinite"/>
</feTurbulence>
```

---

## CSS-Only Gradient Patterns

Pure CSS gradients can create geometric patterns that complement SVG textures. These are very lightweight (no SVG processing) and tile naturally.

### Diagonal stripes
```css
.stripes {
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0,0,0,0.05) 10px,
    rgba(0,0,0,0.05) 20px
  );
}
```

### Dot grid
```css
.dots {
  background-image:
    radial-gradient(circle, #000 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Checkerboard
```css
.checkerboard {
  background-image:
    linear-gradient(45deg, #ccc 25%, transparent 25%),
    linear-gradient(-45deg, #ccc 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #ccc 75%),
    linear-gradient(-45deg, transparent 75%, #ccc 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0;
}
```

### Combining CSS patterns with SVG texture

Layer a CSS gradient pattern over an SVG texture for rich effects:

```css
.rich-texture {
  background:
    repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.02) 5px, rgba(0,0,0,0.02) 10px),
    url("paper-texture.svg");
}
```

---

## Performance Optimization

### General guidelines
- SVG filters render per-frame if animated — keep animated areas small
- `numOctaves` beyond 5 adds computation with minimal visual gain
- Long filter chains (5+ primitives) multiply render cost
- Static textures: consider pre-rendering to PNG/WebP for production
- Use `will-change: filter` sparingly — it can force GPU layer creation

### Pre-rendering technique

Render the SVG to a canvas, export as image:

```javascript
const svg = document.querySelector('#texture-svg');
const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');
const img = new Image();
img.onload = () => {
  ctx.drawImage(img, 0, 0);
  const dataUrl = canvas.toDataURL('image/png');
  // Use dataUrl as CSS background
};
img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.outerHTML);
```

### Mobile considerations
- Avoid full-viewport animated turbulence on mobile devices
- Use lower `numOctaves` (2-3) on mobile
- Test on actual devices — iOS Safari and Android Chrome handle filters differently
- Consider `@media (prefers-reduced-motion)` to disable animated grain

---

## Useful Tools

- **fffuel.co/nnnoise** — Interactive noise texture generator using feTurbulence + feSpecularLighting. Adjusts frequency, octaves, lighting, and exports SVG.
- **Yoksel's SVG Filter Playground** (yoksel.github.io/svg-filters) — Visual, interactive tool for building and experimenting with SVG filter chains.
- **css-pattern.com** — Collection of 157+ pure CSS gradient patterns by Temani Afif.
- **Yoksel's URL-encoder for SVG** — Converts SVG markup to data-URI format for CSS backgrounds.
- **mini-svg-data-uri** (npm) — Node.js tool for efficient SVG-to-data-URI encoding.
