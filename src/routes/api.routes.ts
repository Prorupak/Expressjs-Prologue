import { Router } from "express";
import userRoutes from "./user.routes";

const router = Router({ mergeParams: true });

const defaultRoutes = [
  {
    path: "/users",
    route: userRoutes,
  },
];

defaultRoutes.forEach(route => {
  router.use(route.path, route.route);
});

export default router;
