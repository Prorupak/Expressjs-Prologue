import { Router } from "express";
import {
  createUserHandler,
  getUserByEmailOrUsernameHandler,
} from "../controllers/user.controller";
import { AuthMiddleware } from "../middlewares";

const router = Router({ mergeParams: true });

router.post("/", createUserHandler);

router.get("/", AuthMiddleware(), getUserByEmailOrUsernameHandler);

export default router;
