import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import devtools from 'vite-plugin-react-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  base: "",
  root: "./"
})
