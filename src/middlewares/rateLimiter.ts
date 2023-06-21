import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2,
  message: "Too many login attempts, please try again after 15 minutes",
  skipSuccessfulRequests: true,
});

export default authLimiter;
