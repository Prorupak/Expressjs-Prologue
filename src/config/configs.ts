import path from "path";
import dotenv from "dotenv";
import joi from "joi";

dotenv.config({ path: path.join(__dirname, "../../.env.development.local") });

const environmentVariableNames = {
  NODE_ENV: "Node environment",
  PORT: "Port",
  MONGO_HOST: "Mongo DB host url",
  SEND_GRID_API_KEY: "SendGrid API key",
  LOG_FORMAT: "Log format",
  LOG_DIR: "Log directory path",
  JWT_SECRET: "JWT secret key",
  JWT_ACCESS_EXPIRATION_MINUTES: "JWT access token expiration in minutes",
  JWT_REFRESH_EXPIRATION_DAYS: "JWT refresh token expiration in days",
  JWT_RESET_EMAIL_EXPIRATION_MINUTES:
    "JWT reset email token expiration in minutes",
  USER_VERIFICATION_TOKEN_SECRET: "User verification token secret key",
  CLOUDINARY_NAME: "Cloudinary name",
  CLOUDINARY_API_KEY: "Cloudinary API key",
  CLOUDINARY_API_SECRET: "Cloudinary API secret",
  GOOGLE_CLIENT_ID: "Google client ID",
  GOOGLE_CLIENT_SECRET: "Google client secret",
};

function validateEnvironmentVariables() {
  const envVarsSchema = joi
    .object()
    .keys({
      NODE_ENV: joi
        .string()
        .valid("production", "development", "test")
        .required(),
      PORT: joi.number().default(5000),
      MONGO_HOST: joi
        .string()
        .required()
        .description(environmentVariableNames.MONGO_HOST),
      SEND_GRID_API_KEY: joi
        .string()
        .required()
        .description(environmentVariableNames.SEND_GRID_API_KEY),
      LOG_FORMAT: joi
        .string()
        .valid("combined", "common", "dev", "short", "tiny")
        .default("combined")
        .description(environmentVariableNames.LOG_FORMAT),
      LOG_DIR: joi
        .string()
        .required()
        .description(environmentVariableNames.LOG_DIR),
      JWT_SECRET: joi
        .string()
        .required()
        .description(environmentVariableNames.JWT_SECRET),
      JWT_ACCESS_EXPIRATION_MINUTES: joi
        .number()
        .default(30)
        .description(environmentVariableNames.JWT_ACCESS_EXPIRATION_MINUTES),
      JWT_REFRESH_EXPIRATION_DAYS: joi
        .number()
        .default(30)
        .description(environmentVariableNames.JWT_REFRESH_EXPIRATION_DAYS),
      JWT_RESET_EMAIL_EXPIRATION_MINUTES: joi
        .number()
        .default(10)
        .description(
          environmentVariableNames.JWT_RESET_EMAIL_EXPIRATION_MINUTES,
        ),
      USER_VERIFICATION_TOKEN_SECRET: joi
        .string()
        .required()
        .description(environmentVariableNames.USER_VERIFICATION_TOKEN_SECRET),
      CLOUDINARY_NAME: joi
        .string()
        .required()
        .description(environmentVariableNames.CLOUDINARY_NAME),
      CLOUDINARY_API_KEY: joi
        .string()
        .required()
        .description(environmentVariableNames.CLOUDINARY_API_KEY),
      CLOUDINARY_API_SECRET: joi
        .string()
        .required()
        .description(environmentVariableNames.CLOUDINARY_API_SECRET),
      GOOGLE_CLIENT_ID: joi
        .string()
        .required()
        .description(environmentVariableNames.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: joi
        .string()
        .required()
        .description(environmentVariableNames.GOOGLE_CLIENT_SECRET),
    })
    .unknown();

  const { value: envVars, error } = envVarsSchema
    .prefs({ errors: { label: "key" } })
    .validate(process.env);

  if (error) {
    console.log(error);
    throw new Error(`Config validation error: ${error.message}`);
  }

  return envVars;
}

const envVars = validateEnvironmentVariables();

const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:4173/",
      "http://192.168.1.176:3000",
    ],
    credentials: true,
    preflightContinue: true,
  },
  mongoose: {
    url: envVars.MONGO_HOST,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  },
  sendGrid: {
    apiKey: envVars.SEND_GRID_API_KEY,
  },
  logs: {
    format: envVars.LOG_FORMAT,
    dir: envVars.LOG_DIR,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    accessExpirationMinutes: envVars.JWT_ACCESS_EXPIRATION_MINUTES,
    refreshExpirationDays: envVars.JWT_REFRESH_EXPIRATION_DAYS,
    resetPasswordExpirationMinutes: envVars.JWT_RESET_EMAIL_EXPIRATION_MINUTES,
    userVerificationTokenSecret: envVars.USER_VERIFICATION_TOKEN_SECRET,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  google: {
    clientId: envVars.GOOGLE_CLIENT_ID,
    clientSecret: envVars.GOOGLE_CLIENT_SECRET,
  },
};

export default config;
