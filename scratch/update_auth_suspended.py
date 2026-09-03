import re

with open('backend/middlewares/authMiddleware.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add check for suspended user
suspended_logic = """
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'Your account has been suspended' });
    }
"""

content = re.sub(
    r"if \(\!user\) \{\s*return res\.status\(401\)\.json\(\{ success: false, message: 'Not authorized, user not found' \}\);\s*\}",
    suspended_logic,
    content
)

with open('backend/middlewares/authMiddleware.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated authMiddleware.js for suspended users")
