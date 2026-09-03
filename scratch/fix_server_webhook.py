import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Clean up the previous messy injection
content = content.replace("app.use('/api/payments/webhook', express.raw({ type: 'application/json' }), paymentRoutes);", "")

webhook_route = """
import { handleStripeWebhook } from './controllers/paymentController.js';

// Stripe webhook must process raw body before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);
"""

if "app.post('/api/payments/webhook'" not in content:
    content = content.replace("app.use(express.json());", webhook_route + "\napp.use(express.json());")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed webhook mounting in server.js")
