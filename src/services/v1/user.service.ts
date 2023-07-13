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

/**
 * getUserByEmailOrUsername
 * @param {string} body
 * @returns {Promise<User>}
 */

export const getUserByEmailOrUsername = async (body: string): Promise<User> => {
  if (!body) {
    throw new ErrorHandler(http.BAD_REQUEST, "Email or username is required");
  }

  console.log("getUserByEmailOrUsername", body.includes("@"));

  const obj: Record<string, string> = {};
  if (body.includes("@")) {
    obj.email = body;
  } else {
    obj.username = body;
  }

  // console.log("getUserByEmailOrUsername", obj);

  const user = await UserModels.findOne(obj);

  console.log({ user });

  if (!user) {
    throw new ApiError(http.NOT_FOUND, "User not found");
  }

  return user;
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
export const getUserById = async (id: string): Promise<User> => {
  return UserModels.findById(id);
};
