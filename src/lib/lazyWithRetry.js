import { lazy } from 'react'

// React.lazy wrapper for code-split pages.
//
// After a new deploy, the old hashed chunk files no longer exist on the
// server. A tab that was opened before the deploy would then fail to load a
// page it hasn't visited yet ("Failed to fetch dynamically imported module").
// In that case we reload the page once so the visitor gets the new build,
// instead of a blank screen. The sessionStorage flag stops a reload loop.
const RELOAD_FLAG = 'usha_chunk_reload'

export default function lazyWithRetry(importer) {
  return lazy(() =>
    importer()
      .then(mod => {
        try { sessionStorage.removeItem(RELOAD_FLAG) } catch (_) {}
        return mod
      })
      .catch(err => {
        let alreadyReloaded = false
        try { alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === '1' } catch (_) {}
        if (!alreadyReloaded) {
          try { sessionStorage.setItem(RELOAD_FLAG, '1') } catch (_) {}
          window.location.reload()
          // Keep Suspense waiting while the page reloads
          return new Promise(() => {})
        }
        throw err
      })
  )
}
