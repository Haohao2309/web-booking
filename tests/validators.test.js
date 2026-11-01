import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateStay } from '../src/utils/validators.js'
import { today } from '../src/utils/formatDate.js'
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
