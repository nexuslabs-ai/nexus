import { createNxdsAppearanceBootstrapScript, createNxdsAppearanceSnapshotFromState } from '@nxds/core'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './src/appearance-state.ts'

const defaultSnapshot = createNxdsAppearanceSnapshotFromState(defaultAppearance)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'nxds-appearance-bootstrap',
      transformIndexHtml(html) {
        const script = createNxdsAppearanceBootstrapScript({ storageKey: APPEARANCE_STORAGE_KEY, defaultSnapshot })
        return html.replace('</head>', `<script data-nxds-appearance>${script}</script></head>`)
      },
    },
  ],
})
