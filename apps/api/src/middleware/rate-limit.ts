import rateLimit from "express-rate-limit";

/**
 * Rate limiter for AI-heavy endpoints (Mirror, Spar).
 * 5 requests per minute per user. Uses Clerk userId from auth.
 */
export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use authenticated userId; fall back to IP
    return req.auth?.userId ?? req.ip ?? "unknown";
  },
  handler: (_req, res) => {
    res.status(429).json({
      data: null,
      error: {
        code: "RATE_LIMITED",
        message: "Too many analysis requests. Please wait a moment.",
      },
    });
  },
});
