import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";

const router = Router({ mergeParams: true });

const defaultRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
  {
    path: "/auth",
    route: authRoutes,
  },
];

defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

export default router;
