import httpStatus from "http-status";
import "./token.service";
import { tokenService, userService } from ".";
import { tokenTypes } from "../../config";
import { TokenModels } from "../../models";
import { User } from "../../models/user/user.types";
import { ApiError } from "../../utils";
import { getUserByEmailOrUsername } from "./user.service";

/**
 * Login with email or username and password
 * @param {string} body
 * @param {string} password
 * @returns {Promise<User>}
 */

type LoginWithEmailAndPassword = {
  body: string;
  password: string;
};

export const loginWithEmailAndPassword = async ({
  body,
  password,
}: LoginWithEmailAndPassword): Promise<User> => {
  const user = await getUserByEmailOrUsername(body);
  if (!user || !(await user.passwordMatch(password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect credentials");
  }
  return user;
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
type Logout = {
  refreshToken: string;
};
export const logout = async ({ refreshToken }: Logout): Promise<any> => {
  const tokenDoc = await TokenModels.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });

  if (!tokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, "session not found");
  }

  await tokenDoc.remove();
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
export const refreshAuth = async (refreshToken: string): Promise<any> => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken({
      token: refreshToken,
      type: tokenTypes.REFRESH,
    });
    const user = await userService.getUserById(refreshTokenDoc.user?._id);
    if (!user) {
      throw new ApiError(httpStatus.NOT_FOUND, "User not found");
    }
    await refreshTokenDoc.remove();
    return tokenService.generateAuthTokens({ user });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};
