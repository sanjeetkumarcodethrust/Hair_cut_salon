import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add webhook route before standard body parsers
webhook_route = """
import paymentRoutes from './routes/paymentRoutes.js';

// Stripe webhook must process raw body before express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes);
"""

if "app.use('/api/payments/webhook'" not in content:
    content = content.replace("app.use(express.json());", webhook_route + "\napp.use(express.json());")
    content = content.replace("app.use('/api/dashboard', dashboardRoutes);", "app.use('/api/dashboard', dashboardRoutes);\napp.use('/api/payments', paymentRoutes);")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated server.js to handle Stripe Webhook raw body")
