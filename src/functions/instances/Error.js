
export default class CustomError extends Error {
  constructor({ status, code, message, meta }) {
    super()

    this.status = status || 400
    this.code = code || 'others/not-defined'
    this.message = message || ''
    this.meta = meta || {}
    this.isCustom = true
  }
}

