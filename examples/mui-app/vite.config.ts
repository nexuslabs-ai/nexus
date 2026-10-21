import { createNexusAppearanceBootstrapScript, createNexusAppearanceSnapshotFromState } from '@nxds/core'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

import { APPEARANCE_STORAGE_KEY, defaultAppearance } from './src/appearance-state.ts'

const defaultSnapshot = createNexusAppearanceSnapshotFromState(defaultAppearance)

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'nexus-appearance-bootstrap',
      transformIndexHtml(html) {
        const script = createNexusAppearanceBootstrapScript({ storageKey: APPEARANCE_STORAGE_KEY, defaultSnapshot })
        return html.replace('</head>', `<script data-nexus-appearance>${script}</script></head>`)
      },
    },
  ],
})
