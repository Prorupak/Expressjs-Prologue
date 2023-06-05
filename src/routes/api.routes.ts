import { Request, Response, Router } from "express";

const router = Router({ mergeParams: true });

const gerUser = (req: Request, res: Response) => {
  res.send("Hello World");
};

router.get("/", gerUser);

export default router;
