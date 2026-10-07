// supabaseAuthState.js
// Drop-in replacement for Baileys' useMultiFileAuthState, but persists the
// WhatsApp session to a Supabase table instead of the local filesystem.
//
// Why: on free hosting (e.g. Render free tier), the local disk is wiped
// every time the service restarts after spinning down from inactivity.
// Storing the session in Supabase means it survives restarts/redeploys.
//
// Requires a table (see sql/whatsapp_auth.sql):
//   create table whatsapp_auth (key text primary key, value jsonb, updated_at timestamptz default now());
//
// IMPORTANT — why this keeps an in-memory copy and writes in order:
// The encryption ("signal") keys change with EVERY message. The old version
// wrote them to Supabase in parallel, unordered, and never checked for
// errors, while reads always went back to the database. So a read could get
// an older key than the one just written, or a failed write was silently
// lost. Then the encryption state on our side no longer matched the
// patient's phone, and the patient saw "Waiting for this message. This may
// take a while." instead of the text. Now:
//   - every read/write goes through an in-memory cache (always the latest),
//   - database writes happen one after another in the exact order they were
//     made, retried if Supabase hiccups, and
//   - flush() lets the server finish saving before it shuts down.

const { proto, initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys')

const MISSING = Symbol('missing')

async function useSupabaseAuthState(supabase) {
  const cache = new Map() // key -> value | MISSING
  let writeChain = Promise.resolve()

  async function readFromDb(key) {
    const { data, error } = await supabase
      .from('whatsapp_auth')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (error) throw new Error(`Supabase read failed for ${key}: ${error.message}`)
    if (!data) return null
    return JSON.parse(JSON.stringify(data.value), BufferJSON.reviver)
  }

  async function readData(key) {
    if (cache.has(key)) {
      const v = cache.get(key)
      return v === MISSING ? null : v
    }
    let value = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        value = await readFromDb(key)
        break
      } catch (err) {
        console.error(err.message, `(attempt ${attempt}/3)`)
        if (attempt === 3) return null // don't cache a failed read
        await new Promise((r) => setTimeout(r, 400 * attempt))
      }
    }
    // A write may have landed in the cache while we were reading; keep that.
    if (!cache.has(key)) cache.set(key, value == null ? MISSING : value)
    const v = cache.get(key)
    return v === MISSING ? null : v
  }

  // Queue a DB write behind all earlier ones so they reach Supabase in order.
  function enqueue(label, fn) {
    writeChain = writeChain.then(async () => {
      for (let attempt = 1; attempt <= 4; attempt++) {
        const { error } = await fn()
        if (!error) return
        console.error(`Supabase write failed for ${label}: ${error.message} (attempt ${attempt}/4)`)
        if (attempt < 4) await new Promise((r) => setTimeout(r, 500 * attempt))
      }
    }).catch((err) => console.error(`Supabase write crashed for ${label}:`, err?.message || err))
    return writeChain
  }

  function writeData(key, value) {
    cache.set(key, value)
    const serializable = JSON.parse(JSON.stringify(value, BufferJSON.replacer))
    return enqueue(key, () =>
      supabase.from('whatsapp_auth').upsert({ key, value: serializable, updated_at: new Date().toISOString() })
    )
  }

  function removeData(key) {
    cache.set(key, MISSING)
    return enqueue(key, () => supabase.from('whatsapp_auth').delete().eq('key', key))
  }

  const creds = (await readData('creds')) || initAuthCreds()

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {}
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`)
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value)
              }
              data[id] = value
            })
          )
          return data
        },
        set: async (data) => {
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id]
              const key = `${category}-${id}`
              if (value) writeData(key, value)
              else removeData(key)
            }
          }
          // Cache is already updated synchronously above; the DB catches up in order.
        },
      },
    },
    saveCreds: () => writeData('creds', creds),

    // Copies of messages we sent, so WhatsApp can ask us to re-send one when
    // the patient's phone couldn't decrypt it the first time.
    saveSentMessage: (id, message) => {
      if (!id || !message) return
      writeData(`msg-${id}`, proto.Message.toObject(message, { bytes: Buffer, longs: Number, defaults: false }))
    },
    loadSentMessage: async (id) => {
      const obj = await readData(`msg-${id}`)
      return obj ? proto.Message.fromObject(obj) : undefined
    },
    pruneSentMessages: async (olderThanDays = 14) => {
      const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000).toISOString()
      const { error } = await supabase.from('whatsapp_auth').delete().like('key', 'msg-%').lt('updated_at', cutoff)
      if (error) console.error('Could not prune old stored messages:', error.message)
    },

    // Wait until every queued write has reached Supabase (used on shutdown).
    flush: () => writeChain,

    clearAll: async () => {
      cache.clear()
      await writeChain
      await supabase.from('whatsapp_auth').delete().neq('key', '__never__')
    },
  }
}

module.exports = { useSupabaseAuthState }
