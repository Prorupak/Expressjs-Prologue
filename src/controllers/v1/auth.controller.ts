// import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { authService, tokenService, userService } from "../../services/v1";
import { ApiError, catchAsync } from "../../utils";

export const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens({ user });
  res.status(httpStatus.CREATED).send({ user, tokens });
});

export const login = catchAsync(async (req, res) => {
  const { body, password } = req.body;
  const user = await authService.loginWithEmailAndPassword({
    body,
    password,
  });
  const tokens = await tokenService.generateAuthTokens({ user });
  res.send({ user, tokens });
});

// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   try {
//     const { body, password } = req.body;
//     const user = await authService.loginWithEmailAndPassword({
//       body,
//       password,
//     });
//     const tokens = await tokenService.generateAuthTokens({ user });
//     res.send({ user, tokens });
//   } catch (err) {
//     console.log(err);
//     next(err);
//   }
// };

export const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide refresh token");
  }

  await authService.logout({ refreshToken });
  res.status(httpStatus.OK).send({ success: true });
});

export const refreshTokens = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Please provide refresh token");
  }

  const tokens = await authService.refreshAuth(refreshToken);
  res.send({ ...tokens });
});
