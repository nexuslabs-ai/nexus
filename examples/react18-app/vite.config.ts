import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { nxdsAppearance } from './nxds.vite'

export default defineConfig({
  plugins: [react(), tailwindcss(), nxdsAppearance()],
  resolve: {
    alias: { '@': '/src' },
  },
})
