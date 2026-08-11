// supabaseAuthState.js
// Drop-in replacement for Baileys' useMultiFileAuthState, but persists the
// WhatsApp session to a Supabase table instead of the local filesystem.
//
// Why: on free hosting (e.g. Render free tier), the local disk is wiped
// every time the service restarts after spinning down from inactivity.
// That silently deletes the ./auth folder and forces a fresh QR scan.
// Storing the session in Supabase means it survives restarts/redeploys.
//
// Requires a table (see sql/whatsapp_auth.sql):
//   create table whatsapp_auth (key text primary key, value jsonb, updated_at timestamptz default now());

const { proto } = require('@whiskeysockets/baileys')
const { initAuthCreds, BufferJSON } = require('@whiskeysockets/baileys')

async function useSupabaseAuthState(supabase) {
  async function readData(key) {
    const { data, error } = await supabase
      .from('whatsapp_auth')
      .select('value')
      .eq('key', key)
      .maybeSingle()
    if (error || !data) return null
    try {
      return JSON.parse(JSON.stringify(data.value), BufferJSON.reviver)
    } catch {
      return null
    }
  }

  async function writeData(key, value) {
    const serializable = JSON.parse(JSON.stringify(value, BufferJSON.replacer))
    await supabase.from('whatsapp_auth').upsert({ key, value: serializable, updated_at: new Date().toISOString() })
  }

  async function removeData(key) {
    await supabase.from('whatsapp_auth').delete().eq('key', key)
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
          const tasks = []
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id]
              const key = `${category}-${id}`
              tasks.push(value ? writeData(key, value) : removeData(key))
            }
          }
          await Promise.all(tasks)
        },
      },
    },
    saveCreds: () => writeData('creds', creds),
    clearAll: async () => {
      await supabase.from('whatsapp_auth').delete().neq('key', '__never__')
    },
  }
}

module.exports = { useSupabaseAuthState }
