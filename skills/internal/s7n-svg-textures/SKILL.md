---
name: s7n-svg-textures
description: >
  Create textured backgrounds and surface effects using SVG filters (feTurbulence, feColorMatrix, feDiffuseLighting, etc.)
  and CSS integration techniques. Use this skill whenever the user wants to create textures, noise backgrounds, grainy gradients,
  paper effects, cloud effects, marble, wood grain, starry skies, watercolor effects, fabric textures, or any organic/natural
  background pattern for web pages. Also use when the user mentions feTurbulence, SVG filters for textures, Perlin noise in CSS/SVG,
  noisy gradients, grain overlay, bump map effects, or procedural texture generation for the web. Even if the user just says
  "textured background" or "add some grain" or "make it look like paper" — this skill applies.
---

# S7N SVG Texture Backgrounds

Generate organic, natural-looking textures for web backgrounds using SVG filter primitives. The core building block is `feTurbulence`, which produces Perlin noise — combined with other filter primitives, it can create paper, clouds, marble, grain, starry skies, wood, fabric, and more.

## Quick Start

The simplest SVG texture — raw noise:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="noise">
    <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#noise)"/>
</svg>
```

Apply to any HTML element:
```css
.textured {
  filter: url(#noise);
  /* or as background-image with inline/external SVG */
}
```

## feTurbulence — The Noise Engine

| Attribute | Values | Effect |
|-----------|--------|--------|
| `type` | `fractalNoise` / `turbulence` | fractalNoise = smooth, cloudy. turbulence = sharp, ripple-like |
| `baseFrequency` | 0.001 – 1.0 (one or two values) | Scale of noise. Lower = larger patterns. Two values = separate X/Y control |
| `numOctaves` | 1 – 5 (integer) | Detail layers. Higher = finer detail. Beyond 5 has diminishing returns |
| `seed` | any integer | Different seed = different pattern. Same seed = reproducible |
| `stitchTiles` | `stitch` / `noStitch` | `stitch` = seamless tiling at edges |

### baseFrequency intuition
- `0.02` — very large, sweeping patterns (clouds, marble veins)
- `0.05` — medium patterns (paper grain, fabric)
- `0.2` — fine grain (film grain, sand)
- `0.65` — very fine noise (subtle grain overlay)
- Two values like `0.01 0.4` stretch noise directionally (wood grain, fabric weave)

### type selection
- **fractalNoise**: Use for smooth, natural textures — clouds, fog, paper, watercolor, soft grain
- **turbulence**: Use for sharp, liquid textures — water ripples, fire, marble veins, distortion

## Texture Types — Which Filter Combination?

| Texture | Primary Filters | Key Technique |
|---------|----------------|---------------|
| **Paper / Parchment** | feTurbulence + feDiffuseLighting | Noise alpha as bump map, lit from above |
| **Clouds / Fog** | feTurbulence (fractalNoise) | Low frequency, high octaves, optionally feColorMatrix for color |
| **Grain Overlay** | feTurbulence + CSS contrast/brightness | SVG noise + extreme CSS filter values |
| **Grainy Gradient** | feTurbulence + CSS gradient + mix-blend-mode | Layered backgrounds with isolation |
| **Starry Sky** | feTurbulence + feColorMatrix | Alpha × 9 − 4 trick for sparse bright dots |
| **Marble** | feTurbulence (turbulence) + feDisplacementMap | Noise displaces a gradient or color |
| **Wood Grain** | feTurbulence (fractalNoise, stretched X/Y) + feColorMatrix | Directional noise with brown palette |
| **Watercolor** | feTurbulence + feDisplacementMap + feGaussianBlur | Soft displacement with blur |
| **Stone / Concrete** | feTurbulence + feDiffuseLighting + feComposite | Rough bump map with specular highlights |
| **Fabric / Canvas** | feTurbulence (stretched) + feDiffuseLighting | Directional bump with soft light |
| **Camouflage** | feTurbulence + feComponentTransfer (discrete) | Step functions on separate channels |
| **Dalmatian Spots** | feTurbulence + feComponentTransfer (discrete on alpha) | Binary alpha threshold |

## Top 5 Ready-to-Use Recipes

### 1. Paper Texture
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="paper" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" seed="1" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="2" result="lit">
      <feDistantLight azimuth="45" elevation="60"/>
    </feDiffuseLighting>
  </filter>
  <rect width="100%" height="100%" filter="url(#paper)"/>
</svg>
```
Variations: Increase `surfaceScale` (3-5) for rougher paper. Lower `baseFrequency` (0.02) for larger grain. Add warm `lighting-color="#f5f0e8"` for aged parchment.

### 2. Clouds / Fog
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="clouds" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="5" result="noise"/>
    <feColorMatrix in="noise" type="matrix"
      values="0 0 0 0 0.53
              0 0 0 0 0.70
              0 0 0 0 0.85
              0 0 0 1 0" result="colored"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#clouds)" fill="white"/>
</svg>
```
The feColorMatrix replaces RGB with a fixed sky-blue tint while preserving the alpha channel for cloud variation. Change the 5th-column values to recolor.

### 3. Grainy Gradient (CSS + SVG Hybrid)
```html
<style>
  .grainy-gradient {
    position: relative;
    isolation: isolate;
  }
  .grainy-gradient::before {
    content: "";
    position: absolute;
    inset: 0;
    background:
      linear-gradient(to bottom right, #4f46e5, transparent),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    filter: contrast(170%) brightness(1000%);
    mix-blend-mode: multiply;
    z-index: -1;
  }
  .grainy-gradient::after {
    content: "";
    position: absolute;
    inset: 0;
    background: #a78bfa;
    mix-blend-mode: multiply;
    z-index: -1;
  }
</style>
```
The extreme `contrast(170%) brightness(1000%)` pushes the noise to pure black/white grain. The gradient and color overlay blend on top.

### 4. Starry Sky
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="stars" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence baseFrequency="0.2" numOctaves="1" seed="42" result="noise"/>
    <feColorMatrix in="noise" type="matrix"
      values="0 0 0 9 -4
              0 0 0 9 -4
              0 0 0 9 -4
              0 0 0 0 1"/>
  </filter>
  <rect width="100%" height="100%" fill="#0a0a2e" filter="url(#stars)"/>
</svg>
```
The matrix multiplies alpha by 9 and subtracts 4, clamping most values to 0 (black) — only the brightest noise peaks survive as white dots (stars). Change `seed` for different star arrangements.

### 5. Watercolor Wash
```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="watercolor" x="-10%" y="-10%" width="120%" height="120%">
    <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" seed="8" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="40" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <rect width="100%" height="100%" fill="url(#wc-gradient)" filter="url(#watercolor)"/>
  <defs>
    <linearGradient id="wc-gradient" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e8d5b7"/>
      <stop offset="50%" stop-color="#b8d4e3"/>
      <stop offset="100%" stop-color="#d4b8d4"/>
    </linearGradient>
  </defs>
</svg>
```
The noise displaces a soft gradient, creating organic watercolor-like bleeding edges. Increase `scale` for more dramatic distortion.

## Deep-Dive References

For more recipes and variations, read these reference files:

- **`references/texture-recipes.md`** — 10+ additional ready-to-use recipes (stone, fabric, wood, camouflage, holographic, etc.) with full SVG code and variation tips
- **`references/filter-primitives.md`** — Detailed reference for each filter primitive (feColorMatrix, feComponentTransfer, feDiffuseLighting, feSpecularLighting, feDisplacementMap, feComposite, feBlend) with attribute tables and how each works with feTurbulence
- **`references/css-integration.md`** — How to embed SVG textures (inline, data-URI, external file), grainy gradient deep-dive, animation techniques, CSS-only gradient patterns, and performance optimization

## Performance Tips

- SVG filters are rendered on the GPU in modern browsers, but complex chains still cost CPU
- Keep animated filters small in area — avoid full-viewport animated turbulence on mobile
- For static textures in production, consider pre-rendering to PNG/WebP if the filter chain is complex
- `numOctaves` beyond 5 adds computation with barely visible improvement
- All filter primitives used here have been baseline-supported across browsers since July 2015
