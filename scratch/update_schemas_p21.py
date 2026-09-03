import re

# Update Appointment.js
with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    apt_content = f.read()

apt_content = apt_content.replace("enum: ['instant', 'scheduled']", "enum: ['instant', 'scheduled', 'walk_in']")

with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
    f.write(apt_content)


# Update Salon.js
with open('backend/models/Salon.js', 'r', encoding='utf-8') as f:
    salon_content = f.read()

# Add queue settings inside schema
queue_settings = """
    // Phase 21 Queue settings
    walkInsEnabled: {
      type: Boolean,
      default: true
    },
    maxQueueSize: {
      type: Number,
      default: 10
    },
"""

salon_content = re.sub(
    r"isActive: \{\s*type: Boolean,\s*default: true\s*\},",
    "isActive: { type: Boolean, default: true },\n" + queue_settings,
    salon_content
)

with open('backend/models/Salon.js', 'w', encoding='utf-8') as f:
    f.write(salon_content)

print("Updated Appointment.js and Salon.js for Phase 21")
