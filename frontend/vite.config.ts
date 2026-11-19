/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Same routing the Kubernetes ingress uses in AWS: /api/<service>/... goes to that service.
const services = { policy: 8081, document: 8082, audit: 8083 }

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: Object.fromEntries(
      Object.entries(services).map(([name, port]) => [
        `/api/${name}`,
        {
          target: `http://localhost:${port}`,
          rewrite: (path: string) => path.replace(`/api/${name}`, ''),
        },
      ]),
    ),
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
