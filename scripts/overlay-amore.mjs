// Script: aplica overlay de texto AMORE na barca de sushi
// Uso: node scripts/overlay-amore.mjs

import sharp from 'sharp'
import { readFileSync } from 'fs'

const INPUT  = 'public/sushi-raw-2k.png'
const OUTPUT = 'public/amore-sushi-story-final.png'

// Pega dimensões da imagem
const meta = await sharp(INPUT).metadata()
const W = meta.width
const H = meta.height

console.log(`Imagem: ${W}x${H}`)

// ── SVG overlay ──────────────────────────────────────────────────────────────
// Texto BARCA DE SUSHI no topo + faixa AMORE no rodapé
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <!-- Gradiente topo: preto transparente -->
    <linearGradient id="topGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="black" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="black" stop-opacity="0"/>
    </linearGradient>
    <!-- Gradiente rodapé: preto -->
    <linearGradient id="botGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%"   stop-color="black" stop-opacity="0"/>
      <stop offset="40%"  stop-color="black" stop-opacity="0.70"/>
      <stop offset="100%" stop-color="black" stop-opacity="0.88"/>
    </linearGradient>
  </defs>

  <!-- Overlay topo (22% da altura) -->
  <rect x="0" y="0" width="${W}" height="${Math.round(H * 0.22)}"
        fill="url(#topGrad)"/>

  <!-- Título BARCA DE SUSHI -->
  <text x="${W / 2}" y="${Math.round(H * 0.10)}"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${Math.round(W * 0.072)}"
        font-style="italic"
        font-weight="bold"
        fill="white"
        filter="drop-shadow(0 2px 12px rgba(0,0,0,0.9))">
    BARCA DE SUSHI
  </text>

  <!-- Overlay rodapé (20% da altura) -->
  <rect x="0" y="${Math.round(H * 0.80)}" width="${W}" height="${Math.round(H * 0.20)}"
        fill="url(#botGrad)"/>

  <!-- Linha separadora dourada -->
  <rect x="${Math.round(W * 0.15)}" y="${Math.round(H * 0.885)}"
        width="${Math.round(W * 0.70)}" height="${Math.round(H * 0.0012)}"
        fill="#C9A227" opacity="0.65"/>

  <!-- AMORE em dourado -->
  <text x="${W / 2}" y="${Math.round(H * 0.925)}"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${Math.round(W * 0.085)}"
        font-weight="bold"
        letter-spacing="${Math.round(W * 0.025)}"
        fill="#C9A227"
        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.8))">
    AMORE
  </text>

  <!-- Tagline -->
  <text x="${W / 2}" y="${Math.round(H * 0.965)}"
        text-anchor="middle" dominant-baseline="middle"
        font-family="Georgia, 'Times New Roman', serif"
        font-size="${Math.round(W * 0.028)}"
        font-style="italic"
        font-weight="normal"
        fill="rgba(201,162,39,0.80)">
    Sabor que une as pessoas
  </text>
</svg>
`

// ── Composita ────────────────────────────────────────────────────────────────
await sharp(INPUT)
  .composite([{
    input:  Buffer.from(svg),
    top: 0,
    left: 0,
  }])
  .png({ quality: 95, compressionLevel: 8 })
  .toFile(OUTPUT)

console.log(`✅ Salvo em ${OUTPUT}`)
