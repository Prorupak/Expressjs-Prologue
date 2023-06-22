import { Model } from "mongoose";
import { User } from "../user/user.types";

export enum ETokenTypes {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "resetPassword",
  VERIFY_EMAIL = "verifyEmail",
}

export type Token = Document & {
  token: string;
  user: User;
  type: ETokenTypes;
  expires: Date;
  blacklisted: boolean;
};

export type TokenModel = Model<Token>;
