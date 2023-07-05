import { defineConfig } from "vite";
import { resolve } from "path";
import solidPlugin from "vite-plugin-solid";
import devtools from "solid-devtools/vite";

export default defineConfig(({ command }) => ({
  publicDir: command === "serve" ? "public" : false,
  plugins: [
    devtools({
      /* features options - all disabled by default */
      autoname: true, // e.g. enable autoname
    }),
    solidPlugin(),
  ],
  server: {
    port: 3000,
    open: "/public/index.html",
  },
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "bluefish",
      fileName: (format) => `bluefish.${format}.js`,
    },
    target: "esnext",
    rollupOptions: {
      external: ["solid-js", "solid-js/web"],
      output: {
        globals: {
          "solid-js": "solid",
          "solid-js/web": "solid",
        },
      },
    },
  },
}));
