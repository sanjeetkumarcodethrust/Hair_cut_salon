import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import couponRoutes from './routes/couponRoutes.js';\n"

if "couponRoutes" not in content:
    content = content.replace("import adminRoutes from './routes/adminRoutes.js';", import_statement + "import adminRoutes from './routes/adminRoutes.js';")
    content = content.replace("app.use('/api/admin', adminRoutes);", "app.use('/api/admin', adminRoutes);\napp.use('/api/coupons', couponRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected couponRoutes into server.js")
