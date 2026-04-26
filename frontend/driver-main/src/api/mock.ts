import MockAdapter from 'axios-mock-adapter'
import { http } from './http'

// Utility to proxy to public mock JSON via fetch
async function load(path: string) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}`)
  return res.json()
}

export function initMockApi() {
  const mock = new MockAdapter(http, { delayResponse: 300 })

  // Users
  mock.onGet('/api/users').reply(async () => {
    const data = await load('/mock-data/users.json')
    return [200, data]
  })

  // Drivers
  mock.onGet('/api/drivers').reply(async () => {
    const data = await load('/mock-data/drivers.json')
    return [200, data]
  })

  // Alerts
  mock.onGet('/api/alerts').reply(async () => {
    const data = await load('/mock-data/alerts.json')
    return [200, data]
  })

  // Trips
  mock.onGet('/api/trips').reply(async () => {
    const data = await load('/mock-data/trips.json')
    return [200, data]
  })

  // Notifications
  mock.onGet('/api/notifications').reply(async () => {
    const data = await load('/mock-data/notifications.json')
    return [200, data]
  })

  // Profile
  mock.onGet('/api/profile').reply(async () => {
    const data = await load('/mock-data/profile.json')
    return [200, data]
  })

  // Example POST to simulate check-in (echo)
  mock.onPost(/\/api\/trips\/.*\/stops\/.*\/checkin/).reply((config) => {
    return [200, { ok: true, received: config.data ? JSON.parse(config.data) : null }]
  })

  // Auth: login (demo credentials)
  mock.onPost('/api/login').reply((config) => {
    try {
      const body = config.data ? JSON.parse(config.data) : {}
      const { username, password, role } = body || {}
      const demos = [
        { username: 'admin', password: 'admin123', role: 'admin' as const },
        { username: 'driver', password: 'driver123', role: 'driver' as const },
      ]
      const found = demos.find(d => d.username === String(username) && d.password === String(password))
      if (found) return [200, { ok: true, role: found.role }]

      // fallback: if role provided, allow but warn
      if (role === 'admin' || role === 'driver') {
        return [200, { ok: true, role }]
      }
      return [401, { ok: false, message: 'Invalid credentials. Try admin/admin123 or driver/driver123' }]
    } catch {
      return [400, { ok: false, message: 'Invalid request' }]
    }
  })

  // Auth: register (restored)
  mock.onPost('/api/register').reply((config) => {
    try {
      const body = config.data ? JSON.parse(config.data) : {}
      if (!body?.phone || !body?.username || !body?.password) {
        return [400, { ok: false, message: 'Missing fields' }]
      }
      return [200, { ok: true }]
    } catch {
      return [400, { ok: false, message: 'Invalid request' }]
    }
  })
}
