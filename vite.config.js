import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Libraries go in their own files. They rarely change, so returning
        // visitors keep them cached across deploys and only re-download our
        // own (small) page code.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/node_modules\/(react|react-dom|scheduler|react-router|react-router-dom|@remix-run|react-helmet-async|react-fast-compare|invariant|shallowequal)\//.test(id)) return 'vendor-react'
          if (id.includes('@supabase')) return 'vendor-supabase'
        },
      },
    },
  },
})
