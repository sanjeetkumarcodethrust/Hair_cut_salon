import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import loyaltyRoutes from './routes/loyaltyRoutes.js';\n"
if "loyaltyRoutes" not in content:
    content = content.replace("import couponRoutes from './routes/couponRoutes.js';", import_statement + "import couponRoutes from './routes/couponRoutes.js';")
    content = content.replace("app.use('/api/coupons', couponRoutes);", "app.use('/api/coupons', couponRoutes);\napp.use('/api/loyalty', loyaltyRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Mounted loyaltyRoutes in server.js")
