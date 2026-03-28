import mongoose from "mongoose";

const rateLimitSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    windowStart: { type: Date, required: true },
    count: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: 120 },
  },
  {
    versionKey: false,
  }
);

rateLimitSchema.index({ key: 1, windowStart: 1 }, { unique: true });

const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", rateLimitSchema);

export default RateLimit;
