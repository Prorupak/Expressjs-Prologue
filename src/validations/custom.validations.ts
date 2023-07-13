import { CustomHelpers } from "joi";

export const objectId = (value: string, helpers: CustomHelpers): string => {
  if (!value.match(/^[0-9a-fA-F]{24}$/)) {
    helpers.message({
      custom: "Invalid ObjectId",
    });
  }

  return value;
};

export const password = (value: string, helpers: CustomHelpers): string => {
  if (value.length < 8) {
    helpers.message({ custom: "password must be at least 8 characters" });
  }
  if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
    helpers.message({
      custom: "password must contain at least 1 letter and 1 number",
    });
  }
  return value;
};
