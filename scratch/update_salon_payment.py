import re

with open('backend/models/Salon.js', 'r', encoding='utf-8') as f:
    content = f.read()

payment_fields = """
    paymentPolicy: {
      advanceRequired: { type: Boolean, default: false },
      advancePercentage: { type: Number, default: 20 }, // 20% advance
    },
"""

content = content.replace("    rating: {", payment_fields + "    rating: {")

with open('backend/models/Salon.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Salon.js with paymentPolicy")
