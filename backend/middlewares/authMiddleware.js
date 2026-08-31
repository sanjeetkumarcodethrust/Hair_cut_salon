import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

// @desc  Verify JWT from HttpOnly cookie and attach user to request
// @alias authenticateUser (exported below)
export const protect = async (req, res, next) => {
  let token = req.cookies?.jwt;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

// @desc  Restrict access to specific roles — must run after protect
// @alias authorizeRoles (exported below)
export const authorize = (...roles) => {
  return (req, res, next) => {
    // Guard: protect must run first
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized, please log in' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

// Aliases matching the spec naming convention
export const authenticateUser = protect;
export const authorizeRoles = authorize;
