import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ADMIN_MENU, MAIN_MENU, ACCOUNT_MENU, menuFor, plannedRoutes } from '../src/constants/navigation.js'

const paths = (items) => items.map((item) => item.to)

test('guest sees only public entries and no admin or account menu', () => {
  const menu = menuFor(undefined)
  assert.deepEqual(paths(menu.main), ['/', '/services', '/suggestions'])
  assert.deepEqual(menu.admin, [])
  assert.deepEqual(menu.account, [])
})

test('each role sees only the screens its routes allow', () => {
  assert.ok(paths(menuFor('CUSTOMER').main).includes('/bookings'))
  assert.ok(!paths(menuFor('CUSTOMER').main).includes('/reception'))
  assert.deepEqual(menuFor('CUSTOMER').admin, [])
  assert.ok(paths(menuFor('RECEPTIONIST').main).includes('/reception'))
  assert.ok(!paths(menuFor('RECEPTIONIST').main).includes('/bookings'))
  assert.deepEqual(menuFor('RECEPTIONIST').admin, [])
  assert.deepEqual(paths(menuFor('ADMIN').admin), paths(ADMIN_MENU))
  for (const role of ['CUSTOMER', 'RECEPTIONIST', 'ADMIN']) assert.deepEqual(paths(menuFor(role).account), ['/account'])
})

test('planned entries keep the same guard as their menu visibility', () => {
  const byPath = Object.fromEntries(plannedRoutes().map((item) => [item.to, item.access]))
  assert.equal(byPath['/services'], 'public')
  assert.equal(byPath['/account'], 'signed-in')
  assert.deepEqual(byPath['/admin/hotels'], ['ADMIN'])
  assert.equal(byPath['/admin/rooms'], undefined, 'finished screens are not planned routes')
})

test('menu paths are unique and planned entries explain what they will do', () => {
  const all = [...MAIN_MENU, ...ADMIN_MENU, ...ACCOUNT_MENU]
  assert.equal(new Set(paths(all)).size, all.length)
  for (const item of all.filter((entry) => !entry.ready)) assert.ok(item.description, item.to)
})
