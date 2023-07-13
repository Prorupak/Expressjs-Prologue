import { NextFunction } from "express";
import { compare, genSaltSync, hashSync } from "bcryptjs";
import jwt from "jsonwebtoken";
import omit from "lodash.omit";
import { model, Schema } from "mongoose";
import configs from "../../config/configs";
import paginate from "../plugins/paginate.plugin";
import toJSON from "../plugins/toJSON.plugin";
import { EGenders, EProviders, User, UserModel } from "./user.types";

const userSchema: Schema = new Schema(
  {
    name: {
      type: String,
      maxlength: [64, "Name can be maximum 64 characters"],
      minlength: [2, "Name can be minimum 2 characters"],
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      maxlength: 64,
      validate: {
        validator: (email: string) => {
          // eslint-disable-next-line security/detect-unsafe-regex
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
  },
);

// paginate plugin
userSchema.plugin(paginate);
userSchema.plugin(toJSON);

/**
 * Generates a username from the name or email of the user.
 *
 * @returns {string} - The generated username.
 */
userSchema.virtual("username").get(function (this: User) {
  let username = "";
  if (this.name) {
    username = this.name.toLowerCase().replace(/\s+/g, ".");
  } else if (this.email) {
    username = this.email.toLowerCase().replace(/\s+/g, ".");
  }
  return username;
});

/**
 * Check if an email is already taken by another user.
 *
 * @param {string} email - The email address to check.
 * @param {string} excludeUserId - (Optional) The ID of the user to exclude from the check.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating if the email is taken.
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Checks if the provided password matches the user's password.
 *
 * @param {string} password - The password to compare.
 * @param {Function} callback - The callback function to handle the result.
 *                             It has the signature (error: any, match: any) => void.
 *                             If there is an error, `error` will contain the error object,
 *                             otherwise, `match` will be a boolean indicating if the passwords match.
 */
userSchema.methods.passwordMatch = function (this: User, password: string) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;
  return new Promise((resolve, reject) => {
    compare(password, user.password, (err, match) => {
      if (err) {
        reject(err);
      }
      resolve(match);
    });
  });
};

/**
 * Returns a JSON representation of the user object, excluding sensitive information.
 *
 * @returns {Object} - A JSON object representing the user, with sensitive fields omitted.
 */
userSchema.methods.toUserJSON = function () {
  const user = omit(this.toObject(), [
    "password",
    "facebook",
    "createdAt",
    "updatedAt",
    "__v",
  ]);

  return user;
};

/**
 * Returns a JSON representation of the user's profile information.
 *
 * @returns {Object} - A JSON object representing the user's profile information.
 *                     It includes the user's ID, username, name, and profile picture.
 */
userSchema.methods.toProfileJSON = function () {
  return {
    id: this._id,
    username: this.username,
    name: this.name,
    profilePicture: this.profilePicture,
  };
};

/**
 * Generates a verification key (token) for the user.
 *
 * @returns {string} - The generated user verification key (token).
 */
userSchema.methods.generateVerificationKey = function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  const userVerificationToken = jwt.sign(
    { user_id: user._id },
    configs.jwt.userVerificationTokenSecret,
    {
      expiresIn: 1000,
    },
  );

  return userVerificationToken;
};
/**
 * Hashes the provided password using a salt.
 *
 * @param {string} password - The password to hash.
 * @returns {string} - The hashed password.
 */
userSchema.statics.hashPassword = function (password: string) {
  const salt = genSaltSync(10);
  const hash = hashSync(password, salt);

  return hash;
};

/**
 * Middleware function executed before saving a user instance.
 * Sets default values for certain fields and hashes the password if it is new or modified.
 *
 * @param {Function} next - The next function to be called after the middleware execution.
 */
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
