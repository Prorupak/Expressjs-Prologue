import { Request, Response } from "express";
import { userService } from "../../services/v1";
import { catchAsync } from "../../utils";

export const createUserHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    res.status(201).send(user);
  },
);

export const getUserByEmailOrUsernameHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { body } = req.body;
    const user = await userService.getUserByEmailOrUsername(body);
    res.status(201).send(user);
  },
);
