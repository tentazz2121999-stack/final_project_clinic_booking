import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(ApiError.notFound(`Không tìm thấy route: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err: ApiError | Error, req: Request, res: Response, next: NextFunction) {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message = statusCode === 500 ? "Lỗi hệ thống, vui lòng thử lại sau" : err.message;

  if (statusCode === 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(err instanceof ApiError && err.details ? { details: err.details } : {}),
  });
}
