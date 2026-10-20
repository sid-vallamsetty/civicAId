import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DATA_DIR = path.resolve('data')
const STORE_PATH = path.join(DATA_DIR, 'store.json')
let transaction = Promise.resolve()

async function load() {
  try {
    return JSON.parse(await readFile(STORE_PATH, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return { users: {}, submissions: {}, audit: [] }
    throw error
  }
}

async function save(data) {
  await mkdir(DATA_DIR, { recursive: true })
  const temporary = `${STORE_PATH}.${process.pid}.tmp`
  await writeFile(temporary, JSON.stringify(data), { encoding: 'utf8', mode: 0o600 })
  await rename(temporary, STORE_PATH)
}

export function transact(callback) {
  const result = transaction.then(async () => {
    const data = await load()
    const value = await callback(data)
    await save(data)
    return value
  })
  transaction = result.catch(() => {})
  return result
}

export async function getUser(userId) {
  const data = await load()
  return data.users[userId] || { points: 0, streak: 0 }
}
