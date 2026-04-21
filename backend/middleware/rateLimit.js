const rateLimitStore = new Map();

function createRateLimit(options = {}) {
  const windowMs = Number(options.windowMs || 60 * 1000);
  const maxRequests = Number(options.maxRequests || 15);

  return (req, res, next) => {
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    const now = Date.now();

    const existing = rateLimitStore.get(key);

    if (!existing || now > existing.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (existing.count >= maxRequests) {
      const retryAfterSeconds = Math.ceil((existing.resetAt - now) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      return res.status(429).json({
        message: 'Too many requests. Please try again shortly.',
      });
    }

    existing.count += 1;
    rateLimitStore.set(key, existing);
    return next();
  };
}

module.exports = { createRateLimit };
