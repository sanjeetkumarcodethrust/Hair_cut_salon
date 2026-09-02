import re

# Update Appointment.js
with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    apt_content = f.read()

if 'chair:' not in apt_content:
    new_fields = """    chair: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chair',
    },
    startTime: {
      type: Date,
    },
    endTime: {
      type: Date,
    },"""
    apt_content = apt_content.replace("    salon: {", new_fields + "\n    salon: {")
    with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
        f.write(apt_content)
    print("Updated Appointment.js")


# Update BarberProfile.js
with open('backend/models/BarberProfile.js', 'r', encoding='utf-8') as f:
    barb_content = f.read()

if 'status:' not in barb_content:
    new_fields = """    status: {
      type: String,
      enum: ['active', 'inactive', 'onLeave', 'offline'],
      default: 'active'
    },
    breaks: [
      {
        day: String,
        start: String, // e.g. "14:00"
        end: String    // e.g. "15:00"
      }
    ],"""
    barb_content = barb_content.replace("    availability: {", new_fields + "\n    availability: {")
    with open('backend/models/BarberProfile.js', 'w', encoding='utf-8') as f:
        f.write(barb_content)
    print("Updated BarberProfile.js")
