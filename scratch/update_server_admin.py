import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import adminRoutes from './routes/adminRoutes.js';\n"

if "adminRoutes" not in content:
    content = content.replace("import reviewRoutes from './routes/reviewRoutes.js';", import_statement + "import reviewRoutes from './routes/reviewRoutes.js';")
    content = content.replace("app.use('/api/reviews', reviewRoutes);", "app.use('/api/reviews', reviewRoutes);\napp.use('/api/admin', adminRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected adminRoutes into server.js")
