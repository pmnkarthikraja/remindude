import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ registerType: 'autoUpdate' }),
    legacy({
      targets: ['defaults', 'not IE 11'] // Adjust this based on your browser support requirements
    })
  ],
  build: {
    outDir: 'dist', // Ensure the output directory is set to 'dist'
  },
})
