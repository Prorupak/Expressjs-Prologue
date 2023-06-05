import { NextFunction } from "express";
import configs from "@/config/configs";
import { compare, genSaltSync, hashSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import omit from "lodash.omit";
import { model, Schema } from "mongoose";
import { EGenders, EProviders, User, UserModel } from "./user.types";

const userSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      maxlength: 64,
      validate: {
        validator: (email: string) => {
          const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
          return regex.test(email);
        },
        message: "{value} is not a valid email",
      },
    },
    password: {
      type: String,
      minlength: 8,
      required: true,
      maxlength: 100,
    },

    provider: {
      type: String,
      default: EProviders.PASSWORD,
      enum: Object.values(EProviders),
    },

    provider_id: {
      type: String,
      default: null,
    },

    provider_access_token: String,
    provider_refresh_token: String,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    info: {
      bio: {
        type: String,
        maxlength: 256,
        default: "",
      },
      birthday: {
        type: Date,
      },
      gender: {
        type: String,
        default: EGenders.OTHER,
        enum: Object.values(EGenders),
      },
      links: [
        {
          title: {
            type: String,
            maxlength: 64,
          },
          url: {
            type: String,
            maxlength: 256,
          },
        },
      ],
    },
    profilePicture: {
      //cloudinary
      type: Object,
      default: {},
    },
    coverPhoto: {
      type: Object,
      default: {},
    },

    dateJoined: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.provider_access_token;
        delete ret.provider_refresh_token;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      getters: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.provider_access_token;
        delete ret.provider_refresh_token;
        return ret;
      },
    },
  },
);

// generate username from name or email
userSchema.virtual("username").get(function (this: User) {
  let username = "";
  if (this.name) {
    username = this.name.toLowerCase().replace(/\s+/g, ".");
  } else if (this.email) {
    username = this.email.toLowerCase().replace(/\s+/g, ".");
  }
  return username;
});

userSchema.methods.passwordMatch = function (this: User, password: string, callback: (error: any, match: any) => void) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  compare(password, user.password, function (error: any, isMatch: boolean) {
    if (error) return callback(error, null);
    callback(null, isMatch);
  });
};

userSchema.methods.toUserJSON = function () {
  const user = omit(this.toObject(), ["password", "facebook", "createdAt", "updatedAt", "__v"]);

  return user;
};

userSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    profilePicture: this.profilePicture,
  };
};

userSchema.methods.generateVerificationKey = function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  const userVerificationToken = jwt.sign({ user_id: user._id }, configs.jwt.userVerificationTokenSecret, {
    expiresIn: 1000,
  });

  return userVerificationToken;
};

userSchema.statics.hashPassword = function (password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
};

userSchema.pre("save", async function (this: User, next: NextFunction) {
  if (this.info.gender === null) this.info.gender = EGenders.OTHER;
  if (this.profilePicture === null) this.profilePicture = "";
  if (this.coverPicture === null) this.coverPicture = "";
  if (this.info.birthday === null) this.info.birthday = "";

  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (this.isNew || this.isModified) {
    const salt = genSaltSync(10);
    user.password = hashSync(user.password, salt);
    console.log("pre save", user.password);
    next();
  } else {
    next();
  }
});

const userModel = model<User, UserModel>("User", userSchema);

export default userModel;
