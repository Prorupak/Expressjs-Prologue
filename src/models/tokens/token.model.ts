import { model, Schema } from "mongoose";
import toJSON from "../plugins/toJSON.plugin";
import { ETokenTypes, Token, TokenModel } from "./token.types";

const tokenSchema: Schema = new Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ETokenTypes,
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
tokenSchema.plugin(toJSON);

const TokenModel = model<Token, TokenModel>("Token", tokenSchema);
