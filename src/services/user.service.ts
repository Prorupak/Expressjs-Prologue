import http from "http-status";
import { ErrorMiddleware } from "../middlewares";
import { UserModels } from "../models";
import { User } from "../models/user/user.types";
import { ApiError } from "../utils";

const { ErrorHandler } = ErrorMiddleware;

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
export const createUser = async (userBody: User): Promise<User> => {
  if (await UserModels.isEmailTaken(userBody.email)) {
    throw new ErrorHandler(http.BAD_REQUEST, "Email already taken");
  }

  return UserModels.create(userBody);
};
