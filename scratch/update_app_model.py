import re

with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    content = f.read()

new_fields = """    bookingType: {
      type: String,
      enum: ['instant', 'scheduled'],
      default: 'instant',
    },
    snapshots: {
      serviceName: String,
      originalPrice: Number,
      discountApplied: String,
      finalPrice: Number
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },"""

if "bookingType" not in content:
    content = content.replace("    status: {", new_fields + "\n    status: {")
    with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Appointment.js with bookingType and snapshots")
