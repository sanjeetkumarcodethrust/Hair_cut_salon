import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import ticketRoutes from './routes/ticketRoutes.js';\n"
if "ticketRoutes" not in content:
    content = content.replace("import loyaltyRoutes from './routes/loyaltyRoutes.js';", import_statement + "import loyaltyRoutes from './routes/loyaltyRoutes.js';")
    content = content.replace("app.use('/api/loyalty', loyaltyRoutes);", "app.use('/api/loyalty', loyaltyRoutes);\napp.use('/api/tickets', ticketRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Mounted ticketRoutes in server.js")
