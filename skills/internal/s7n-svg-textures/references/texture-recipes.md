# Texture Recipes — Extended Collection

Complete, copy-paste-ready SVG filter recipes for creating textured backgrounds. Each recipe includes the full SVG, CSS integration, and variation tips.

## Table of Contents
1. [Stone / Concrete](#stone--concrete)
2. [Fabric / Canvas](#fabric--canvas)
3. [Wood Grain](#wood-grain)
4. [Camouflage (ERDL)](#camouflage-erdl)
5. [Dalmatian Spots](#dalmatian-spots)
6. [Marble](#marble)
7. [Holographic Foil](#holographic-foil)
8. [Frosted Glass](#frosted-glass)
9. [Old Film Grain](#old-film-grain)
10. [Topographic Map](#topographic-map)
11. [Lava / Magma](#lava--magma)
12. [Sand / Desert](#sand--desert)

---

## Stone / Concrete

Rough surface with 3D depth via specular + diffuse lighting.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="stone" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="5" seed="3" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#d4cfc4" surfaceScale="3" diffuseConstant="0.8" result="diffuse">
      <feDistantLight azimuth="225" elevation="50"/>
    </feDiffuseLighting>
    <feSpecularLighting in="noise" surfaceScale="2" specularConstant="0.5" specularExponent="20" result="specular">
      <feDistantLight azimuth="225" elevation="50"/>
    </feSpecularLighting>
    <feComposite in="diffuse" in2="specular" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#stone)"/>
</svg>
```
**Variations:** Higher `surfaceScale` (4-6) for rougher stone. Lower `baseFrequency` (0.02) for larger rock formations. Warmer `lighting-color` for sandstone.

---

## Fabric / Canvas

Directional noise creates woven-fabric appearance through stretched frequencies.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="fabric" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.02 0.15" numOctaves="4" seed="12" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#f5f0e0" surfaceScale="1.5" result="lit">
      <feDistantLight azimuth="135" elevation="55"/>
    </feDiffuseLighting>
  </filter>
  <rect width="100%" height="100%" filter="url(#fabric)"/>
</svg>
```
**Variations:** Swap X/Y frequencies (`0.15 0.02`) for horizontal weave. Increase `surfaceScale` for coarser canvas. Use `seed` to vary the weave pattern.

---

## Wood Grain

Stretched horizontal noise with warm brown coloring.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="wood" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.01 0.1" numOctaves="4" seed="7" result="noise"/>
    <feColorMatrix in="noise" type="matrix"
      values="0 0 0 0 0.42
              0 0 0 0 0.28
              0 0 0 0 0.14
              0 0 0 0.6 0.2" result="brown"/>
    <feDiffuseLighting in="noise" lighting-color="#c4a67a" surfaceScale="1" result="lit">
      <feDistantLight azimuth="90" elevation="60"/>
    </feDiffuseLighting>
    <feBlend in="brown" in2="lit" mode="multiply"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#wood)"/>
</svg>
```
**Variations:** More stretch (`0.005 0.15`) for tighter grain. Darker values in the matrix for walnut. Higher `surfaceScale` for rougher, unfinished wood.

---

## Camouflage (ERDL)

Multi-channel discrete thresholding creates overlapping color blobs.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="camo" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" seed="20" result="noise"/>
    <feComponentTransfer in="noise" result="stepped">
      <feFuncR type="discrete" tableValues="0 0 0 0 1 1"/>
      <feFuncG type="discrete" tableValues="0 0 0 1 1"/>
      <feFuncB type="discrete" tableValues="0 1"/>
    </feComponentTransfer>
    <feColorMatrix in="stepped" type="matrix"
      values="0.2 0 0 0 0.15
              0.3 0.4 0 0 0.1
              0 0.1 0.2 0 0.05
              0 0 0 1 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#camo)"/>
</svg>
```
**Variations:** Change `tableValues` step counts for larger/smaller blobs. Adjust the final feColorMatrix for desert camo (sandy tones), winter camo (whites/grays), or urban (grays/blacks).

---

## Dalmatian Spots

Binary alpha threshold on noise creates organic spot patterns.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="spots" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" seed="15" result="noise"/>
    <feComponentTransfer in="noise">
      <feFuncA type="discrete" tableValues="0 1 0"/>
    </feComponentTransfer>
  </filter>
  <rect width="100%" height="100%" fill="white"/>
  <rect width="100%" height="100%" fill="black" filter="url(#spots)"/>
</svg>
```
**Variations:** Lower `baseFrequency` (0.04) for larger spots. Add more steps to `tableValues` like `"0 0 1 0 0"` for sparser spots. Use `seed` to shuffle.

---

## Marble

Turbulence-displaced gradient creates veined marble effect.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <defs>
    <linearGradient id="marble-base" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f0ece4"/>
      <stop offset="30%" stop-color="#d8d0c4"/>
      <stop offset="60%" stop-color="#e8e2d8"/>
      <stop offset="100%" stop-color="#f5f0ea"/>
    </linearGradient>
  </defs>
  <filter id="marble" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="turbulence" baseFrequency="0.02 0.06" numOctaves="4" seed="3" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="80" xChannelSelector="R" yChannelSelector="G"/>
  </filter>
  <rect width="100%" height="100%" fill="url(#marble-base)" filter="url(#marble)"/>
</svg>
```
**Variations:** Higher `scale` (100-150) for more dramatic veining. Use `type="fractalNoise"` for softer veins. Change gradient colors for green marble, black marble, etc.

---

## Holographic Foil

Extreme contrast/brightness on noise creates rainbow iridescence.

```html
<style>
  .holographic {
    position: relative;
    isolation: isolate;
    background: linear-gradient(135deg, #ff6ec7, #7873f5, #4cd6e0, #ffe66d, #ff6ec7);
    background-size: 400% 400%;
  }
  .holographic::before {
    content: "";
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    filter: contrast(300%) brightness(500%);
    mix-blend-mode: overlay;
    opacity: 0.4;
  }
</style>
```
**Variations:** Animate `background-position` for shimmer. Change `mix-blend-mode` to `color-dodge` for more intense highlights. Adjust `opacity` (0.2-0.6) for subtlety.

---

## Frosted Glass

Subtle noise with blur creates translucent frosted-glass look.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="frosted" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="2" result="noise"/>
    <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" result="displaced"/>
    <feGaussianBlur in="displaced" stdDeviation="3"/>
  </filter>
</svg>
```
Apply with `filter: url(#frosted)` on an element overlaying content. Combine with `backdrop-filter: blur(8px)` in CSS for enhanced effect.

---

## Old Film Grain

Animated grain using multiple seed variants for flickering effect.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
  <filter id="grain-0"><feTurbulence type="turbulence" baseFrequency="0.6" numOctaves="3" seed="0"/></filter>
  <filter id="grain-1"><feTurbulence type="turbulence" baseFrequency="0.6" numOctaves="3" seed="1"/></filter>
  <filter id="grain-2"><feTurbulence type="turbulence" baseFrequency="0.6" numOctaves="3" seed="2"/></filter>
  <filter id="grain-3"><feTurbulence type="turbulence" baseFrequency="0.6" numOctaves="3" seed="3"/></filter>
</svg>
<style>
  .film-grain {
    animation: grain 0.3s steps(4) infinite;
  }
  @keyframes grain {
    0%  { filter: url(#grain-0); }
    25% { filter: url(#grain-1); }
    50% { filter: url(#grain-2); }
    75% { filter: url(#grain-3); }
  }
</style>
```
**Variations:** Slower animation (0.5s) for subtler flicker. Lower `baseFrequency` (0.3) for coarser grain. Add `opacity: 0.3` for overlay use.

---

## Topographic Map

Stepped noise creates contour-line effect reminiscent of elevation maps.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="topo" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="10" result="noise"/>
    <feColorMatrix in="noise" type="matrix"
      values="1 0 0 0 0
              1 0 0 0 0
              1 0 0 0 0
              0 0 0 0 1" result="gray"/>
    <feComponentTransfer in="gray">
      <feFuncR type="table" tableValues="0.05 0.15 0.15 0.35 0.35 0.55 0.55 0.75 0.75 0.95"/>
      <feFuncG type="table" tableValues="0.25 0.40 0.40 0.55 0.55 0.65 0.65 0.45 0.45 0.30"/>
      <feFuncB type="table" tableValues="0.15 0.20 0.20 0.25 0.25 0.20 0.20 0.15 0.15 0.10"/>
    </feComponentTransfer>
  </filter>
  <rect width="100%" height="100%" filter="url(#topo)"/>
</svg>
```
**Variations:** More repeated pairs in `tableValues` for more contour lines. Adjust colors for ocean depth maps (blues) or heat maps (red-yellow).

---

## Lava / Magma

Turbulence with fiery color mapping and slight displacement.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="lava" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="4" seed="6" result="noise"/>
    <feComponentTransfer in="noise">
      <feFuncR type="table" tableValues="0.1 0.3 0.8 1.0 1.0"/>
      <feFuncG type="table" tableValues="0.0 0.05 0.2 0.5 0.8"/>
      <feFuncB type="table" tableValues="0.0 0.0 0.0 0.05 0.1"/>
      <feFuncA type="linear" slope="0" intercept="1"/>
    </feComponentTransfer>
  </filter>
  <rect width="100%" height="100%" filter="url(#lava)"/>
</svg>
```
**Variations:** Add `feDisplacementMap` with low scale (15-25) for flowing lava. Animate `seed` via JavaScript for molten movement.

---

## Sand / Desert

Fine-grained noise with warm lighting for sand texture.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <filter id="sand" x="0%" y="0%" width="100%" height="100%">
    <feTurbulence type="fractalNoise" baseFrequency="0.15" numOctaves="5" seed="4" result="noise"/>
    <feDiffuseLighting in="noise" lighting-color="#e8d4a0" surfaceScale="1.2" diffuseConstant="1" result="lit">
      <feDistantLight azimuth="200" elevation="40"/>
    </feDiffuseLighting>
  </filter>
  <rect width="100%" height="100%" filter="url(#sand)"/>
</svg>
```
**Variations:** Higher `baseFrequency` (0.25) for finer sand. Lower elevation (20-30) for longer shadows (dunes). Add feSpecularLighting for wet sand sheen.
