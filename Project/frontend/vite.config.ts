import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        //target: 'http://localhost:3000', // Tu backend Express en producción (docker)

        target: 'http://localhost:5000', // Tu backend Express
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
