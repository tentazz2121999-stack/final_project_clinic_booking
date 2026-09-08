import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";

function authorize(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden("Bạn không có quyền thực hiện thao tác này"));
    }
    next();
  };
}

export default authorize;
