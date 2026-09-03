import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add import route
route_import = "import businessRoutes from './routes/businessRoutes.js';"
if 'businessRoutes' not in content:
    content = content.replace("import analyticsRoutes from './routes/analyticsRoutes.js';", "import analyticsRoutes from './routes/analyticsRoutes.js';\n" + route_import)

# Mount route
route_mount = "app.use('/api/business', businessRoutes);"
if "'/api/business'" not in content:
    content = content.replace("app.use('/api/analytics', analyticsRoutes);", "app.use('/api/analytics', analyticsRoutes);\n" + route_mount)

# Import migration
migration_import = "import { runBusinessMigration } from './utils/migrateBusiness.js';"
if 'runBusinessMigration' not in content:
    content = content.replace("import connectDB from './config/db.js';", "import connectDB from './config/db.js';\n" + migration_import)

# Call migration
migration_call = "  await runBusinessMigration();"
if 'runBusinessMigration()' not in content:
    content = content.replace("connectDB();", "connectDB().then(async () => {\n" + migration_call + "\n});")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated server.js')
