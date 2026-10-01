import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

// In `npm run dev`, serve /api/reviews with the same handler Vercel runs in
// production (api/reviews.js), using the keys from .env.local.
function localApi() {
  return {
    name: 'local-api',
    apply: 'serve',
    configureServer(server) {
      Object.assign(process.env, loadEnv('development', process.cwd(), ''))
      server.middlewares.use('/api/reviews', async (req, res) => {
        const { default: handler } = await server.ssrLoadModule('/api/reviews.js')
        const url = new URL(req.url, 'http://localhost')
        const shim = {
          setHeader: (k, v) => res.setHeader(k, v),
          status(code) {
            res.statusCode = code
            return shim
          },
          json(body) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(body))
          },
        }
        await handler({ query: Object.fromEntries(url.searchParams) }, shim)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localApi()],
})
