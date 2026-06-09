# Print Typography for German Text

German-specific print rules. For general print CSS, see the `effective-print-design` skill.

## German Hyphenation Rules

Browsers with `hyphens: auto` and `lang="de"` follow these principles:

1. **Syllable-based**: Break at syllable boundaries (Sil-ben-tren-nung)
2. **Single consonants**: Go to next syllable (tre-ten, not tret-en)
3. **Multiple consonants**: Last consonant goes to next syllable (Wes-pe, Kas-ten)
4. **ck becomes k-k**: Historically Bäk-ker, modern browsers handle this
5. **st stays together**: Fens-ter, not Fen-ster
6. **Compound words**: Break at word boundaries first (Bundes-tag, not Bun-destag)

### Problem Cases

| Word Type       | Issue                         | Solution                   |
| --------------- | ----------------------------- | -------------------------- |
| Foreign words   | May use origin language rules | Use `&shy;` for control    |
| Compound words  | Browser may miss boundaries   | Use `&shy;` at joints      |
| Technical terms | Incorrect automatic breaks    | Manual `&shy;`             |
| Proper nouns    | Should not be hyphenated      | `hyphens: none` on element |

Example: `Donau&shy;dampf&shy;schiff&shy;fahrts&shy;gesellschaft`

## DIN 5008 Margins

German business document standard:

| Margin | Value | Notes                  |
| ------ | ----- | ---------------------- |
| Top    | 27mm  | Space for letterhead   |
| Right  | 20mm  | Standard               |
| Bottom | 25mm  | Space for page numbers |
| Left   | 25mm  | Binding margin         |

```css
@page {
  size: A4;
  margin: 27mm 20mm 25mm 25mm;
}
```

## Fonts for German Text

Fonts with good umlaut (ä, ö, ü), Eszett (ß), and German quotation mark („") support:

- **Serif**: Source Serif Pro, Noto Serif, Crimson Pro, EB Garamond
- **Sans-serif**: Source Sans Pro, Noto Sans, Fira Sans, IBM Plex Sans
