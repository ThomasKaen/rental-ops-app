import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
    plugins: [react()],
    server: { port: 5173 },
    define: { __API__: JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000') }
})