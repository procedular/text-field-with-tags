
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import path from "path";

export default defineConfig({
	plugins: [svelte()],
  resolve: {
    alias: {
      $lib: path.resolve(__dirname, "src/lib"),
    }
  },
	build: {
    outDir: "build",
    emptyOutDir: true
  },
	server: {
		host: true
	},
  publicDir: "static"
});
