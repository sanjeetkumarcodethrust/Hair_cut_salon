import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import reviewRoutes from './routes/reviewRoutes.js';\n"

if "reviewRoutes" not in content:
    content = content.replace("import paymentRoutes from './routes/paymentRoutes.js';", import_statement + "import paymentRoutes from './routes/paymentRoutes.js';")
    content = content.replace("app.use('/api/payments', paymentRoutes);", "app.use('/api/payments', paymentRoutes);\napp.use('/api/reviews', reviewRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected reviewRoutes into server.js")
