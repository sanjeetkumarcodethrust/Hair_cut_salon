import re

with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_snapshots = """    snapshots: {
      serviceName: String,
      originalPrice: Number,
      discountApplied: String,
      finalPrice: Number
    },"""

new_snapshots = """    snapshots: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },"""

content = content.replace(old_snapshots, new_snapshots)

with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Appointment.js snapshots to Mixed")
