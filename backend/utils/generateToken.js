import jwt from 'jsonwebtoken';
import env from '../config/env.js';

const generateToken = (res, userId) => {
  // Generate Access Token (short-lived)
  const accessToken = jwt.sign({ userId }, env.jwtSecret, {
    expiresIn: env.accessTokenExpiresIn,
  });

  // Generate Refresh Token (long-lived)
  const refreshToken = jwt.sign({ userId }, env.jwtRefreshSecret || env.jwtSecret, {
    expiresIn: env.refreshTokenExpiresIn,
  });

  // Set Access Token Cookie
  res.cookie('jwt', accessToken, {
    httpOnly: true,
    secure: env.nodeEnv !== 'development',
    sameSite: env.cookieSameSite,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  // Set Refresh Token Cookie
  res.cookie('jwtRefresh', refreshToken, {
    httpOnly: true,
    secure: env.nodeEnv !== 'development',
    sameSite: env.cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export default generateToken;
