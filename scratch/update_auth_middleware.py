import re

with open('backend/middlewares/authMiddleware.js', 'r', encoding='utf-8') as f:
    content = f.read()

optional_auth = """
export const optionalAuth = async (req, res, next) => {
  let token = req.cookies?.jwt;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return next();
  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId).select('-password');
    if (user && user.status !== 'suspended') {
      req.user = user;
    }
  } catch (error) {}
  next();
};
"""

content = content + "\n" + optional_auth

with open('backend/middlewares/authMiddleware.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added optionalAuth to authMiddleware.js")
