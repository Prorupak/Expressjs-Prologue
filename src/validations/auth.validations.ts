import { object, string } from "joi";
import { password } from "./custom.validations";

const email = string().email().required();
const pwd = string().required().custom(password);
const name = string().required();

export const authSchemas = {
  register: object()
    .keys({
      email,
      password: pwd,
      name,
    })
    .options({ abortEarly: false }),
};
