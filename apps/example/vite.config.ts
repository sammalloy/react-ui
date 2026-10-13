import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Deliberately no "source" condition or path aliases: this app consumes the
// built packages exactly as an app in another repo would after `npm install`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
