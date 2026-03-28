import RateLimit from "../models/RateLimit.js";

const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX) || 100;
const RATE_LIMIT_WINDOW_SECONDS = Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 60;

const rateLimiter = async (req, res, next) => {
  try {
    const key = req.ip || req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
    const now = new Date();
    const windowStart = new Date(
      Math.floor(now.getTime() / (RATE_LIMIT_WINDOW_SECONDS * 1000)) * RATE_LIMIT_WINDOW_SECONDS * 1000
    );

    const entry = await RateLimit.findOneAndUpdate(
      { key, windowStart },
      {
        $inc: { count: 1 },
        $setOnInsert: { createdAt: now },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (entry.count > RATE_LIMIT_MAX) {
      return res.status(429).json({
        message: "Too many requests, please try again later",
      });
    }

    next();
  } catch (error) {
    console.log("Rate limit error", error);
    next(error);
  }
};

export default rateLimiter;

