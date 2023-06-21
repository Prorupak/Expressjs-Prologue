import { NextFunction, Request, Response } from "express";
import { User } from "@/interfaces/user";
import httpStatus from "http-status";
import passport from "passport";
import { roleRights } from "../config/roles";
import ApiError from "../utils/ApiError";

type VerifyCallback = (
  req: Request,
  resolve: () => void,
  reject: (error: ApiError) => void,
  requiredRights: string[],
) => (err: Error | null, user: User, info: unknown) => Promise<void>;

const verifyCallback: VerifyCallback =
  (req, resolve, reject, requiredRights) => async (err, user, info) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate"),
      );
    }
    user = req.user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      const hasRequiredRights = requiredRights.every(requiredRight =>
        userRights.includes(requiredRight),
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights),
      )(req, res, next);
    })
      .then(() => next())
      .catch(err => next(err));
  };

export default auth;
