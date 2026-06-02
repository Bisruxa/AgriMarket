const store = new Map();

function chatRateLimiter(maxRequests = 30, windowMs = 60000) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();
    const timestamps = store.get(key) || [];
    const recent = timestamps.filter(t => now - t < windowMs);

    if (recent.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Try again in ${Math.ceil((windowMs - (now - recent[0])) / 1000)}s.`,
      });
    }

    recent.push(now);
    store.set(key, recent);
    next();
  };
}

setInterval(() => {
  const cutoff = Date.now() - 60000;
  for (const [key, timestamps] of store) {
    const fresh = timestamps.filter(t => t > cutoff);
    if (fresh.length === 0) store.delete(key);
    else store.set(key, fresh);
  }
}, 60000);

module.exports = { chatRateLimiter };
