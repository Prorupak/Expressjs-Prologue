import { Server } from "http";
import express from "express";
import colors from "colors";
import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import csurf from "csurf";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import createError from "http-errors";
// import httpStatus from "http-status";
import mongoose, { connect } from "mongoose";
import morgan from "morgan";
import passport from "passport";
import xss from "xss-clean";
import configs from "./config/configs";
import connectDB from "./config/db";
import { logger, stream } from "./config/logger";
import { jwtStrategy } from "./config/passport";
import InitSocket from "./config/socket";
import { ErrorMiddleware } from "./middlewares";
import apiRoutes from "./routes/v1/api.routes";

colors.enable();

const { errorMiddleware, errorHandler } = ErrorMiddleware;

class Express {
  public app: express.Application;
  public server: Server;
  public port: number | string;
  public env: string;

  constructor() {
    try {
      this.app = express();
      this.server = new Server(this.app);
      this.env = configs.env || "development";
      this.port = configs.port || 8000;
      this.connectDb();
      InitSocket(this.app, this.server);
      this.initMiddleware();
    } catch (error) {
      console.log(error);
    }
  }

  private initMiddleware() {
    this.app.disable("x-powered-by");
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.set("trust proxy", 1);
    this.app.use(cors(configs.cors));
    this.app.use(helmet());
    this.app.use(xss());
    this.app.use(cookieParser());
    this.app.use(compression());
    this.app.use(mongoSanitize());
    this.app.use(morgan(configs.logs.format, { stream }));
    this.app.use(passport.initialize());
    passport.use("jwt", jwtStrategy);

    this.app.use("/api", apiRoutes);

    // catch 404 and forward to error handler
    this.app.use((req, res, next) => {
      next(createError(404));
    });
    // error handler
    this.app.use(csurf());

    this.app.use(errorMiddleware);
    this.app.use(errorHandler);
  }

  private connectDb() {
    mongoose.set("strictQuery", false);
    connect(connectDB.url, connectDB.options)
      .then(() => {
        logger.info(`🚀 Connected to database`.green);
      })
      .catch(err => {
        logger.error(`❌ Failed to connect to database`.red);
        logger.error(err);
      });
  }

  public listen(): void {
    this.server
      .listen(this.port, () => {
        logger.info(`🚀 Server ready at http://localhost:${this.port}`.green);
      })
      .on("error", (err: any) => {
        console.log(err);
        // process.exit(1);
      });
  }
}

export default Express;
