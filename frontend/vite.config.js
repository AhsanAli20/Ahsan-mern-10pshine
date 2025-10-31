import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Jab bhi frontend se '/api' par request aayegi, woh is port par forward ho jayegi
      '/api': {
        target: 'http://localhost:5001', // <--- Apni backend ki port yahan daalen
        changeOrigin: true,
        secure: false, // development mein secure false rakhte hain
      },
    },
    },
})
