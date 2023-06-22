import { Request, Response } from "express";
import { createUser } from "../services";
import { catchAsync } from "../utils";

export const createUserHandler = catchAsync(
  async (req: Request, res: Response) => {
    const user = await createUser(req.body);
    res.status(201).send(user);
  },
);
