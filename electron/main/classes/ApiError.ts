export default class ApiError extends Error {
  title: string
  data: Record<string, any>

  constructor(title?: string, message?: string, data?: Record<string, any>) {
    super()
    this.title = title
    this.message = message
    this.data = data
  }
}
