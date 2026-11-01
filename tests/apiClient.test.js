import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AxiosError } from 'axios'
import { createApiClient } from '../src/api/createApiClient.js'

const response = (config, data) => ({ data, status: 200, statusText: 'OK', headers: {}, config })

test('GET unwraps JSON and includes credentials without fetching CSRF', async () => {
  const client = createApiClient({ baseURL: '/api' })
  let calls = 0
  client.defaults.adapter = async (config) => {
    calls++
    assert.equal(config.url, '/rooms')
    assert.equal(config.withCredentials, true)
    return response(config, { items: [] })
  }
  assert.deepEqual(await client.get('/rooms'), { items: [] })
  assert.equal(calls, 1)
})

test('each mutation obtains a fresh CSRF token before sending the request', async () => {
  const client = createApiClient({ baseURL: '/api' })
  const calls = []
  let tokenNumber = 0
  client.defaults.adapter = async (config) => {
    calls.push(config.url)
    if (config.url === '/auth/csrf') return response(config, { headerName: 'X-CSRF-TOKEN', token: `token-${++tokenNumber}` })
    assert.equal(config.headers.get('X-CSRF-TOKEN'), `token-${tokenNumber}`)
    return response(config, { id: 1 })
  }
  await client.post('/auth/login', { email: 'test@example.com', password: 'example' })
  await client.patch('/rooms/1', { name: 'Updated' })
  assert.deepEqual(calls, ['/auth/csrf', '/auth/login', '/auth/csrf', '/rooms/1'])
})

test('does not send a mutation when CSRF bootstrap fails or is malformed', async () => {
  for (const fail of [true, false]) {
    const client = createApiClient({ baseURL: '/api' })
    client.defaults.adapter = async (config) => {
      assert.equal(config.url, '/auth/csrf')
      if (fail) throw new Error('Network unavailable')
      return response(config, { headerName: 'Unexpected', token: '' })
    }
    await assert.rejects(client.post('/bookings', {}))
  }
})

test('401 expires the session on business requests but not failed login', async () => {
  let expired = 0
  const client = createApiClient({ baseURL: '/api', onUnauthorized: () => expired++ })
  client.defaults.adapter = async (config) => {
    if (config.url === '/auth/csrf') return response(config, { headerName: 'X-CSRF-TOKEN', token: 'token' })
    throw new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, { status: 401 })
  }
  await assert.rejects(client.post('/auth/login', {}))
  assert.equal(expired, 0)
  await assert.rejects(client.get('/bookings/me'))
  assert.equal(expired, 1)
})
