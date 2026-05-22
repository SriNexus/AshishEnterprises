import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
<<<<<<< HEAD
=======
import { viteSingleFile } from "vite-plugin-singlefile";
>>>>>>> 6c07e6162634bc17406e2db3be58159f5b2bd6b2

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

<<<<<<< HEAD
export default defineConfig({
  plugins: [react(), tailwindcss()],
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSingleFile()],
>>>>>>> 6c07e6162634bc17406e2db3be58159f5b2bd6b2
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
<<<<<<< HEAD
});
=======
});
>>>>>>> 6c07e6162634bc17406e2db3be58159f5b2bd6b2
