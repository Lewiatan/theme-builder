import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths()
  ],
  resolve: {
    alias: {
      // Ensure shared components can resolve dependencies from theme-builder's node_modules
      'react-router-dom': path.resolve(__dirname, 'node_modules/react-router-dom'),
    },
  },
})
