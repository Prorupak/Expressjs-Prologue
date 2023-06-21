import { Server } from "http";
import { Application } from "express";
import { configs } from "@/config";
import { ErrorMiddleware } from "@/middlewares";
import { UserModel } from "@/models";
import { Socket } from "socket.io/dist/socket";

const { ErrorHandler } = ErrorMiddleware;

const socket = (app: Application, server: Server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: configs.cors.origin,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  app.set("io", io);

  io.on("connection", (socket: Socket) => {
    console.log(`⚡️: Connected to ${socket.id}`);

    socket.on("userConnect", (id: string) => {
      UserModel.findById(id)
        .then(user => {
          if (user) {
            socket.join(user._id.toString());
            console.log(`⚡️: ${user.username} Joined to server`);
          }
        })
        .catch((e: any) => {
          console.log("Invalid user ID, cannot join Socket.", e.message);
          return new ErrorHandler(400, e.message);
        });
    });

    socket.on("userDisconnect", userID => {
      console.log(`🔥: Client disconnected`);
      socket.leave(userID);
    });

    socket.on("connect_error", err => {
      console.log(`connect_error due to ${err.message}`);
    });

    socket.on("disconnect", (reason: any) => {
      console.log(`📖: ${reason}`);
    });
  });
};

export default socket;
