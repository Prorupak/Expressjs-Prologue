import { User } from "../user";

declare global {
  namespace Express {
    interface SessionData {
      cookie: any;
    }
  }
}

declare module "express" {
  export interface Request {
    user: User;
    file: any;
    files: any;
    query: any;
  }
}
