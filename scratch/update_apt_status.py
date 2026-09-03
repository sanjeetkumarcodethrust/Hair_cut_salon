import re

with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("enum: ['pending', 'confirmed', 'completed', 'cancelled']", "enum: ['pending', 'confirmed', 'arrived', 'in_progress', 'completed', 'no_show', 'cancelled']")

with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Appointment.js status enum")
