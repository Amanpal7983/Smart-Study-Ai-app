import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Frontend calls /api/*, Vite forwards to the FastAPI backend.
    proxy: { '/api': 'http://localhost:8000' },
  },
})
