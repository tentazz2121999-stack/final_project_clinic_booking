import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/apiError";
import { verifyAccessToken } from "../utils/jwt";

function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("Thiếu access token"));
  }
  const token = header.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(ApiError.unauthorized("Access token không hợp lệ hoặc đã hết hạn"));
  }
}

export default authenticate;
