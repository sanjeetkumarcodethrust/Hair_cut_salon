import re

with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    content = f.read()

index_code = """
appointmentSchema.index({ salon: 1, status: 1, startTime: 1, endTime: 1 });
appointmentSchema.index({ customer: 1, date: -1 });
appointmentSchema.index({ barber: 1, status: 1, startTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
"""

content = content.replace("const Appointment = mongoose.model('Appointment', appointmentSchema);", index_code)

with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added indexes to Appointment model")
