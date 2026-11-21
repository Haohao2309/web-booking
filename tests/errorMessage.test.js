import { test } from 'node:test'
import assert from 'node:assert/strict'
import { errorCode, errorMessage } from '../src/api/errorMessage.js'

const failure = (status, body) => ({ response: { status, data: body } })
const envelope = (status, message, code) => ({ success: false, message, data: { code }, status })

test('network failure without a response', () => {
  assert.match(errorMessage(new Error('Network Error')), /Không kết nối được API/)
})

test('locked account shows the backend message instead of a permission error', () => {
  const error = failure(403, envelope(403, 'Tài khoản đã bị khóa', 'ACCOUNT_LOCKED'))
  assert.equal(errorMessage(error), 'Tài khoản đã bị khóa')
  assert.match(errorMessage(failure(403, envelope(403, 'Access denied', 'ACCESS_DENIED_OR_CSRF_INVALID'))), /không có quyền/)
})

test('404 no longer claims the email does not exist', () => {
  assert.equal(errorMessage(failure(404, {})), 'Không tìm thấy dữ liệu.')
  assert.equal(errorMessage(failure(404, envelope(404, 'Không tìm thấy dữ liệu', 'RESOURCE_NOT_FOUND'))), 'Không tìm thấy dữ liệu')
})

test('400 and 409 use the backend message and expose the stable code', () => {
  const invalid = failure(400, envelope(400, 'Mã xác nhận không đúng, đã hết hạn hoặc đã bị khóa', 'INVALID_RESET_CODE'))
  assert.equal(errorMessage(invalid), 'Mã xác nhận không đúng, đã hết hạn hoặc đã bị khóa')
  assert.equal(errorCode(invalid), 'INVALID_RESET_CODE')
  assert.equal(errorMessage(failure(409, envelope(409, 'Email đã được đăng ký', 'EMAIL_ALREADY_REGISTERED'))), 'Email đã được đăng ký')
  assert.equal(errorCode(new Error('x')), undefined)
})

test('non-JSON error body falls back to a generic message', () => {
  assert.equal(errorMessage(failure(502, '<html>Bad gateway</html>')), 'Yêu cầu thất bại. Vui lòng thử lại.')
})
