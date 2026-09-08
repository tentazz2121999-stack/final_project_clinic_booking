import { NextFunction, Request, Response } from "express";
import { AnySchema, ValidationError } from "yup";
import { ApiError } from "../utils/apiError";

type ReqPart = "body" | "query" | "params";

function validate(schema: AnySchema, part: ReqPart = "body") {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = await schema.validate(req[part], { abortEarly: false, stripUnknown: true });
      (req as any)[part] = validated;
      next();
    } catch (err) {
      next(ApiError.badRequest("Dữ liệu không hợp lệ", (err as ValidationError).errors));
    }
  };
}

export default validate;
