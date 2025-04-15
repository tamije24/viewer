import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '10.250.53.47',  // Set the host to your desired IP
    port: 8000,            // Set the port
    strictPort: true,      // Ensures Vite only uses this port
  }
});

