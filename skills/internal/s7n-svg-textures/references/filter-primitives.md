# SVG Filter Primitives Reference

Detailed reference for each filter primitive commonly used with `feTurbulence` to build textures. Each section covers what the primitive does, its key attributes, and how it transforms noise into texture.

## Table of Contents
1. [feColorMatrix](#fecolormatrix)
2. [feComponentTransfer](#fecomponenttransfer)
3. [feDiffuseLighting](#fediffuselighting)
4. [feSpecularLighting](#fespecularlighting)
5. [feDisplacementMap](#fedisplacementmap)
6. [feComposite](#fecomposite)
7. [feBlend](#feblend)
8. [feGaussianBlur](#fegaussianblur)
9. [feFlood](#feflood)
10. [feMorphology](#femorphology)

---

## feColorMatrix

Transforms pixel colors via a 5x4 matrix. Each output channel is a weighted sum of all input channels plus a constant.

```
R' = r1*R + r2*G + r3*B + r4*A + r5
G' = g1*R + g2*G + g3*B + g4*A + g5
B' = b1*R + b2*G + b3*B + b4*A + b5
A' = a1*R + a2*G + a3*B + a4*A + a5
```

Values are clamped to 0–1.

### Type shortcuts

| type | values | use case |
|------|--------|----------|
| `matrix` | 20 numbers (4 rows × 5 cols) | Full color transformation |
| `saturate` | 0–1 (single number) | Desaturation (0 = grayscale) |
| `hueRotate` | degrees (0–360) | Shift hue around color wheel |
| `luminanceToAlpha` | none | Convert brightness to transparency |

### With feTurbulence

**Starry sky trick** — multiply alpha by a high factor, subtract to threshold:
```xml
<feColorMatrix values="0 0 0 9 -4  0 0 0 9 -4  0 0 0 9 -4  0 0 0 0 1"/>
```
Only the brightest noise peaks survive as white dots.

**Recolor noise** — replace RGB with fixed values, keep alpha for variation:
```xml
<feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.3  0 0 0 0 0.8  0 0 0 1 0"/>
```
This produces a constant purple tinted by the noise alpha channel.

**Grayscale noise** — collapse all channels to one:
```xml
<feColorMatrix values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"/>
```

---

## feComponentTransfer

Applies independent transfer functions to each channel (R, G, B, A) via child elements `feFuncR`, `feFuncG`, `feFuncB`, `feFuncA`.

### Function types

| type | behavior | key attributes |
|------|----------|----------------|
| `identity` | No change | — |
| `table` | Smooth interpolation between breakpoints | `tableValues` |
| `discrete` | Step function (no interpolation) | `tableValues` |
| `linear` | `output = slope × input + intercept` | `slope`, `intercept` |
| `gamma` | `output = amplitude × input^exponent + offset` | `amplitude`, `exponent`, `offset` |

### With feTurbulence

**Posterize / create blobs** — `discrete` snaps continuous noise to steps:
```xml
<feComponentTransfer>
  <feFuncA type="discrete" tableValues="0 1 0"/>
</feComponentTransfer>
```
Mid-range alpha → opaque, rest → transparent. Creates spot patterns.

**Color ramp** — `table` maps noise to a multi-color gradient:
```xml
<feComponentTransfer>
  <feFuncR type="table" tableValues="0.0 0.2 0.8 1.0"/>
  <feFuncG type="table" tableValues="0.2 0.5 0.3 0.1"/>
  <feFuncB type="table" tableValues="0.4 0.1 0.0 0.0"/>
</feComponentTransfer>
```

**Brightness/contrast** — `linear` adjusts uniformly:
```xml
<feFuncR type="linear" slope="1.5" intercept="-0.25"/>
```

---

## feDiffuseLighting

Uses the input's alpha channel as a bump map (height field) and computes diffuse (Lambertian) shading. This is how you give flat noise a 3D paper/stone/fabric look.

| Attribute | Purpose |
|-----------|---------|
| `surfaceScale` | Height multiplier for the bump map. Higher = deeper ridges |
| `diffuseConstant` | Intensity of the diffuse reflection (0–1+) |
| `lighting-color` | Color of the light source |

### Light sources (child elements)

```xml
<feDistantLight azimuth="45" elevation="60"/>   <!-- Sunlight from angle -->
<fePointLight x="150" y="60" z="20"/>           <!-- Lamp at position -->
<feSpotLight x="100" y="0" z="50" pointsAtX="100" pointsAtY="100" pointsAtZ="0" limitingConeAngle="30"/>
```

### With feTurbulence

The alpha channel of feTurbulence output contains Perlin noise values from 0 to 1 — a natural height field. Lighting this creates realistic surface texture.

```xml
<feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise"/>
<feDiffuseLighting in="noise" lighting-color="white" surfaceScale="2">
  <feDistantLight azimuth="45" elevation="60"/>
</feDiffuseLighting>
```

---

## feSpecularLighting

Like feDiffuseLighting but computes specular (mirror-like) highlights. Use together with diffuse lighting for realistic surfaces.

| Attribute | Purpose |
|-----------|---------|
| `surfaceScale` | Height multiplier for bump map |
| `specularConstant` | Intensity of specular reflection |
| `specularExponent` | Sharpness of highlights (1–128). Higher = tighter, shinier spots |

### Combining diffuse + specular

```xml
<feTurbulence result="noise" .../>
<feDiffuseLighting in="noise" result="diffuse" ...>...</feDiffuseLighting>
<feSpecularLighting in="noise" result="specular" ...>...</feSpecularLighting>
<feComposite in="diffuse" in2="specular" operator="arithmetic" k1="0" k2="1" k3="0.3" k4="0"/>
```
The arithmetic composite adds 30% of the specular highlights on top of the diffuse base.

---

## feDisplacementMap

Shifts pixels of `in` based on color values of `in2`. This is how noise creates organic distortion, warping, water ripples.

| Attribute | Purpose |
|-----------|---------|
| `scale` | Maximum pixel displacement. Higher = more distortion |
| `xChannelSelector` | Which channel of `in2` drives horizontal shift (R, G, B, A) |
| `yChannelSelector` | Which channel of `in2` drives vertical shift |

### With feTurbulence

```xml
<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="3" result="noise"/>
<feDisplacementMap in="SourceGraphic" in2="noise" scale="40" xChannelSelector="R" yChannelSelector="G"/>
```

The noise's R channel displaces horizontally, G displaces vertically. Result: organic, fluid warping.

**Directional displacement** — use asymmetric `baseFrequency`:
```xml
<feTurbulence baseFrequency="0 0.15" result="noise"/>
<feDisplacementMap in="SourceGraphic" in2="noise" scale="20"/>
```
Creates horizontal ripples only (useful for water reflections).

---

## feComposite

Combines two inputs using Porter-Duff operations or arithmetic formula.

| operator | behavior |
|----------|----------|
| `over` | in layered over in2 (default) |
| `in` | in clipped by in2's alpha |
| `out` | in where in2 is transparent |
| `atop` | in over in2, clipped to in2's shape |
| `xor` | non-overlapping parts of both |
| `arithmetic` | `k1*in*in2 + k2*in + k3*in2 + k4` per pixel |

The `arithmetic` operator is especially powerful for combining lighting results:
```xml
<feComposite operator="arithmetic" k1="1" k2="0" k3="0" k4="0"/>
```
This multiplies the two inputs (useful for applying light maps to textures).

---

## feBlend

Blends two inputs using CSS-like blend modes.

| mode | typical use |
|------|-------------|
| `normal` | Standard overlay |
| `multiply` | Darken: great for applying texture to color |
| `screen` | Lighten: good for light/highlight overlays |
| `overlay` | Contrast: combines multiply + screen |
| `darken` / `lighten` | Keep only darker/lighter pixels |

```xml
<feBlend in="texture" in2="color" mode="multiply"/>
```

---

## feGaussianBlur

Applies Gaussian blur. Single value = uniform blur, two values = separate X/Y blur.

```xml
<feGaussianBlur stdDeviation="3"/>      <!-- uniform -->
<feGaussianBlur stdDeviation="0 5"/>    <!-- vertical blur only -->
```

With textures: use after feTurbulence to soften noise, or after feDisplacementMap for watercolor softness.

---

## feFlood

Fills the filter region with a solid color. Used as a building block for compositing.

```xml
<feFlood flood-color="#2a5c3f" flood-opacity="1" result="green"/>
<feComposite in="green" in2="noise-alpha" operator="in"/>
```
This creates green areas shaped by the noise pattern.

---

## feMorphology

Erodes (shrinks) or dilates (expands) shapes. Not directly a texture tool, but useful for creating outlines or thickening noise-based patterns.

| operator | effect |
|----------|--------|
| `erode` | Thin/shrink — darker, smaller shapes |
| `dilate` | Thicken/expand — lighter, larger shapes |

```xml
<feMorphology operator="dilate" radius="2" in="noise-pattern"/>
```
Use after thresholding noise to grow/shrink the resulting blobs.
