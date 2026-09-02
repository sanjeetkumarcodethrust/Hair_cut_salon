import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add express-rate-limit
imports = "import { rateLimit } from 'express-rate-limit';\n"

if "import { rateLimit }" not in content:
    content = content.replace("import helmet from 'helmet';", "import helmet from 'helmet';\n" + imports)

limiter_code = """
// Rate Limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

app.use('/api', apiLimiter);
"""

if "apiLimiter" not in content:
    content = content.replace("app.use('/api/auth', authRoutes);", limiter_code + "\napp.use('/api/auth', authRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added global rate limiter")
