import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' // Assurez-vous d'importer 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Ajoute un alias @ qui pointe vers le dossier src
      'src': path.resolve(__dirname, './src') // Ajoute également un alias src qui pointe vers le dossier src
    }
  },
  server: {
    port: 5000,
    open: true, // ouvre automatiquement le navigateur au démarrage
    host: true,  // pour accepter les connexions depuis le réseau
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  }
})