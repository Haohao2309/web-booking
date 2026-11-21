import { test } from 'node:test'
import assert from 'node:assert/strict'
import { nightsBetween, readSearch, searchQuery, stayQuery } from '../src/utils/stay.js'

test('nights follow [checkIn, checkOut) and are 0 when the range is not usable', () => {
  assert.equal(nightsBetween('2099-01-10', '2099-01-12'), 2)
  assert.equal(nightsBetween('2099-02-28', '2099-03-01'), 1)
  assert.equal(nightsBetween('2099-01-10', '2099-01-10'), 0)
  assert.equal(nightsBetween('2099-01-12', '2099-01-10'), 0)
  assert.equal(nightsBetween('', '2099-01-10'), 0)
  assert.equal(nightsBetween('10/01/2099', '12/01/2099'), 0)
})

test('search criteria round-trip through the URL and drop empty or unknown keys', () => {
  const criteria = readSearch(new URLSearchParams('checkIn=2099-01-10&checkOut=2099-01-12&guests=2&minPrice=&evil=1&page=3'))
  assert.deepEqual(criteria, { checkIn: '2099-01-10', checkOut: '2099-01-12', guests: '2', page: '3' })
  assert.equal(searchQuery({ ...criteria, page: undefined }), '?checkIn=2099-01-10&checkOut=2099-01-12&guests=2')
  assert.equal(searchQuery({}), '')
})

test('only the stay is carried from the list to the detail page', () => {
  assert.equal(stayQuery({ checkIn: '2099-01-10', checkOut: '2099-01-12', guests: '2', sort: 'price,desc', page: '2' }), '?checkIn=2099-01-10&checkOut=2099-01-12&guests=2')
})
