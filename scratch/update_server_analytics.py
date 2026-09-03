import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import
import_str = "import analyticsRoutes from './routes/analyticsRoutes.js';"
if 'analyticsRoutes' not in content:
    content = content.replace("import ticketRoutes from './routes/ticketRoutes.js';", "import ticketRoutes from './routes/ticketRoutes.js';\n" + import_str)

# Add route mount
mount_str = "app.use('/api/analytics', analyticsRoutes);"
if "'/api/analytics'" not in content:
    content = content.replace("app.use('/api/tickets', ticketRoutes);", "app.use('/api/tickets', ticketRoutes);\n" + mount_str)

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated server.js')
