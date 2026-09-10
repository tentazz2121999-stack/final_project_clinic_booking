export class ApiError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, message, details);
  }
  static unauthorized(message = "Chưa xác thực") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Không có quyền thực hiện") {
    return new ApiError(403, message);
  }
  static notFound(message = "Không tìm thấy dữ liệu") {
    return new ApiError(404, message);
  }
  static conflict(message: string) {
    return new ApiError(409, message);
  }
  static tooManyRequests(message: string) {
    return new ApiError(429, message);
  }
  static serviceUnavailable(message: string) {
    return new ApiError(503, message);
  }
  static gatewayTimeout(message: string) {
    return new ApiError(504, message);
  }
}
