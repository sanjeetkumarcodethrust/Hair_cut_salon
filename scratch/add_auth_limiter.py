import re

with open('backend/routes/authRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add express-rate-limit
imports = "import { rateLimit } from 'express-rate-limit';\n"

if "import { rateLimit }" not in content:
    content = content.replace("import express from 'express';", "import express from 'express';\n" + imports)

limiter_code = """
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 login/register requests per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts from this IP, please try again after an hour' }
});
"""

if "authLimiter" not in content:
    content = content.replace("const router = express.Router();", "const router = express.Router();\n" + limiter_code)
    
    content = content.replace("router.post('/register', registerUser);", "router.post('/register', authLimiter, registerUser);")
    content = content.replace("router.post('/login', loginUser);", "router.post('/login', authLimiter, loginUser);")

with open('backend/routes/authRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added auth rate limiter")
