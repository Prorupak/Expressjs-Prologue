import { Router } from "express";
import { createUserHandler } from "../controllers/user.controller";

const router = Router({ mergeParams: true });

router.post("/", createUserHandler);

export default router;
