// @ts-check
import { defineConfig } from 'astro/config';

import angular from '@analogjs/astro-angular';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [angular()],
  vite: {
    plugins: [tailwindcss()]
  }
});