import { Router } from "express";
import {
  login,
  logout,
  refreshTokens,
  register,
} from "../controllers/v1/auth.controller";
import { AuthMiddleware, validate } from "../middlewares";
import { authSchemas } from "../validations/auth.validations";

const router = Router({ mergeParams: true });

router.post("/register", register);
router.post("/login", login);
router.post("/logout", AuthMiddleware(), logout);
router.post("/refresh-tokens", AuthMiddleware(), refreshTokens);

export default router;
