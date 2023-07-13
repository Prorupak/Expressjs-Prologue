import jwt from "jsonwebtoken";
import moment from "moment";
import { configs, tokenTypes } from "../../config";
import { TokenModels } from "../../models";
import { Token } from "../../models/tokens/token.types";
import { User } from "../../models/user/user.types";
import { getUserByEmailOrUsername } from "./user.service";

/**
 * Generate token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
type GenerateToken = {
  userId: string;
  expires: moment.Moment;
  type: string;
  secret?: string;
};

export const generateToken = ({
  expires,
  type,
  userId,
  secret = configs.jwt.secret,
}: GenerateToken): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
type SaveToken = {
  token: string;
  userId: string;
  expires: moment.Moment;
  type: string;
  blacklisted?: boolean;
};

export const saveToken = async ({
  token,
  userId,
  expires,
  type,
  blacklisted = false,
}: SaveToken): Promise<Token> => {
  const tokenDoc = await TokenModels.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 * @param {string} token
 * @param {string} type
 * @returns {Promise<Token>}
 */
type VerifyToken = {
  token: string;
  type: string;
};

export const verifyToken = async ({ token, type }: VerifyToken) => {
  const payload = jwt.verify(token, configs.jwt.secret);
  const tokenDoc = await TokenModels.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  return tokenDoc;
};

/**
 * Generate auth tokens
 * @param {User} user
 * @returns {Promise<Object>}
 */
type GenerateAuthTokens = {
  user: User;
};

export const generateAuthTokens = async ({
  user,
}: GenerateAuthTokens): Promise<Object> => {
  const accessTokenExpires = moment().add(
    configs.jwt.accessExpirationMinutes,
    "minutes",
  );

  const accessToken = generateToken({
    userId: user._id,
    expires: accessTokenExpires,
    type: tokenTypes.ACCESS,
  });

  const refreshTokenExpires = moment().add(
    configs.jwt.refreshExpirationDays,
    "days",
  );

  const refreshToken = generateToken({
    userId: user._id,
    expires: refreshTokenExpires,
    type: tokenTypes.REFRESH,
  });

  await saveToken({
    token: refreshToken,
    userId: user._id,
    expires: refreshTokenExpires,
    type: tokenTypes.REFRESH,
  });

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} body
 * @returns {Promise<string>}
 */
type GenerateResetPasswordToken = {
  body: string;
};

export const generateResetPasswordToken = async ({
  body,
}: GenerateResetPasswordToken): Promise<string> => {
  console.log("generateResetPasswordToken", body);
  const user = await getUserByEmailOrUsername(body);
  if (!user) {
    throw new Error("No users found with this email");
  }
  const expires = moment().add(
    configs.jwt.resetPasswordExpirationMinutes,
    "minutes",
  );
  const resetPasswordToken = generateToken({
    userId: user._id,
    expires,
    type: tokenTypes.RESET_PASSWORD,
  });
  await saveToken({
    token: resetPasswordToken,
    userId: user._id,
    expires,
    type: tokenTypes.RESET_PASSWORD,
  });
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
type GenerateVerifyEmailToken = {
  user: User;
};

export const generateVerifyEmailToken = async ({
  user,
}: GenerateVerifyEmailToken): Promise<string> => {
  const expires = moment().add(
    configs.jwt.userVerificationTokenExpirationMinutes,
    "minutes",
  );
  const verifyEmailToken = generateToken({
    userId: user._id,
    expires,
    type: tokenTypes.VERIFY_EMAIL,
  });
  await saveToken({
    token: verifyEmailToken,
    userId: user._id,
    expires,
    type: tokenTypes.VERIFY_EMAIL,
  });
  return verifyEmailToken;
};
