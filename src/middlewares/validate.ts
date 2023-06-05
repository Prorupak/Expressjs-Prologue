import { NextFunction, Request, Response } from "express";
import { Pick } from "@/utils";
import httpStatus from "http-status";
import Joi, { Schema, ValidationResult } from "joi";
import ApiError from "../utils/ApiError";

const validate = (schema: Schema) => (req: Request, res: Response, next: NextFunction) => {
  const validSchema = Pick(schema, ["params", "query", "body"]);
  const object = Pick(req, Object.keys(validSchema));
  const { value, error }: ValidationResult<any> = Joi.compile(validSchema)
    .prefs({ errors: { label: "key" }, abortEarly: false })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map(details => details.message).join(", ");
    return next(new ApiError(httpStatus.BAD_REQUEST, errorMessage));
  }
  Object.assign(req, value);
  return next();
};

export default validate;
