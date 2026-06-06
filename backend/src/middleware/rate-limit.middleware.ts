import rateLimit from 'express-rate-limit';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 80,
  message: { error: true, message: 'Too many requests, please try again later.' },
});
