import type { Document, Model } from "mongoose";

export enum EProviders {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  PASSWORD = "password",
}

export enum EGenders {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export type User = Document & {
  email?: string;
  password?: string;
  name?: string;
  username?: string;
  provider?: EProviders;
  providerId?: string;
  providerAccessToken?: string;
  providerRefreshToken?: string;
  isEmailVerified?: boolean;
  info?: {
    bio?: string;
    birthday: Date | string;
    gender: EGenders;
    links: Links[];
  };
  role?: string;
  profilePicture?: string;
  coverPicture: string;
  toUserJSON(): User;
  toProfileJSON(): User;
  generateVerificationKey(): string;
  passwordMatch(pw: string, callback: (error: any, match: any) => void): void;
};

export type UserModel = Model<User> & {
  hashPassword(pw: string): string;
};

type Links = {
  title: string;
  url: string;
};
