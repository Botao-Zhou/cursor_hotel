/**
 * 统一接口返回格式：{ code, message, data }
 * code: 0 成功，非 0 为业务错误码
 */
export function success(res, data = null, message = 'success') {
  return res.status(200).json({ code: 0, message, data })
}

export function fail(res, message = 'error', code = 1, statusCode = 200) {
  return res.status(statusCode).json({ code, message, data: null })
}
