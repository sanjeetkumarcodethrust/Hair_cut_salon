import re

with open('backend/routes/salonRoutes.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import { protect, authorize } from '../middlewares/authMiddleware.js';", "import { protect, authorize, optionalAuth } from '../middlewares/authMiddleware.js';")
content = content.replace("router.get('/nearby', getNearbySalons);", "router.get('/nearby', optionalAuth, getNearbySalons);")

with open('backend/routes/salonRoutes.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated salonRoutes.js with optionalAuth")
