import re

with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    content = f.read()

fields = """
    advanceAmount: {
      type: Number,
      default: 0
    },
    remainingAmount: {
      type: Number,
      default: 0
    },
"""

content = content.replace("    paymentStatus: {", fields + "    paymentStatus: {")

with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Appointment.js with advance/remaining amounts")
