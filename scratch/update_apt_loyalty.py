import re

with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    content = f.read()

loyalty_fields = """
    loyaltyPointsEarned: {
      type: Number,
      default: 0
    },
    loyaltyDiscountAmount: {
      type: Number,
      default: 0
    },
    pointsRedeemed: {
      type: Number,
      default: 0
    },
"""

if "loyaltyPointsEarned:" not in content:
    content = content.replace("    discountAmount: {", loyalty_fields + "    discountAmount: {")
    with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Appointment.js with loyalty fields")
