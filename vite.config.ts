
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Replace 'REPLACE_WITH_YOUR_REPO_NAME' with your actual repository name
  // If your URL is https://username.github.io/my-repo/, base should be '/my-repo/'
  base: './', 
});
