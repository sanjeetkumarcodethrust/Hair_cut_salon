import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import customerPreferenceRoutes from './routes/customerPreferenceRoutes.js';\n"
if "customerPreferenceRoutes" not in content:
    content = content.replace("import ticketRoutes from './routes/ticketRoutes.js';", import_statement + "import ticketRoutes from './routes/ticketRoutes.js';")
    content = content.replace("app.use('/api/tickets', ticketRoutes);", "app.use('/api/tickets', ticketRoutes);\napp.use('/api/preferences', customerPreferenceRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Mounted customerPreferenceRoutes in server.js")
