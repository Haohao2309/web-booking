import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateNewPassword, validateStay } from '../src/utils/validators.js'
import { today } from '../src/utils/formatDate.js'
test('new password follows the backend limits', () => {
  assert.equal(validateNewPassword('new-password-1', 'new-password-1'), '')
  assert.notEqual(validateNewPassword('short', 'short'), '')
  assert.notEqual(validateNewPassword('new-password-1', 'new-password-2'), '')
  // 40 Vietnamese characters with tone marks are under 72 characters but over 72 UTF-8 bytes.
  const accented = 'ệ'.repeat(40)
  assert.notEqual(validateNewPassword(accented, accented), '')
  assert.equal(validateNewPassword('a'.repeat(72), 'a'.repeat(72)), '')
  assert.notEqual(validateNewPassword('a'.repeat(73), 'a'.repeat(73)), '')
})
test('accepts a stay starting today', () => {
  const next = new Date(`${today()}T00:00:00Z`)
  next.setUTCDate(next.getUTCDate() + 1)
  assert.equal(validateStay(today(), next.toISOString().slice(0, 10), 2), '')
})
test('rejects missing, impossible, past, equal and reversed dates', () => {
  for (const [start, end] of [['', '2099-01-02'], ['2099-02-30', '2099-03-03'], ['2020-01-01', '2099-01-02'], ['2099-01-02', '2099-01-02'], ['2099-01-03', '2099-01-02']]) assert.notEqual(validateStay(start, end, 1), '')
})
test('rejects zero, negative, fractional and invalid guest counts', () => {
  for (const guests of [0, -1, 1.5, 'abc', Infinity]) assert.notEqual(validateStay('2099-01-01', '2099-01-02', guests), '')
  assert.equal(validateStay('2099-01-01', '2099-01-02', '2'), '')
})
