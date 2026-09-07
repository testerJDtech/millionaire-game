import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  // "./" means the built files use relative paths. This lets you copy the
  // dist/ folder anywhere (USB stick, subfolder on a web host) and it still works.
  base: './',

  server: {
    port: 5173,
    // Opens the launcher page automatically when you run `npm run dev`.
    open: true,
  },

  preview: {
    port: 4173,
  },
});
