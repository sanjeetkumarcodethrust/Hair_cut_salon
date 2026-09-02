import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

imports = """import { emitBookingConfirmed, emitBookingRescheduled, emitBookingCancelled } from '../services/bookingEventEmitter.js';\n"""

content = content.replace("import { getAvailableSlots } from '../services/availabilityService.js';", "import { getAvailableSlots } from '../services/availabilityService.js';\n" + imports)


# Booking Confirmed (Instant)
instant_match = re.search(r'(res\.status\(201\)\.json\(\{\s*success: true,\s*message: \'Booking Confirmed\',\s*data: appointment\[0\]\s*\}\);)', content)
if instant_match:
    content = content.replace(instant_match.group(1), "emitBookingConfirmed(appointment[0], salon);\n    " + instant_match.group(1))

# Booking Confirmed (Scheduled)
scheduled_match = re.search(r'(res\.status\(201\)\.json\(\{\s*success: true,\s*message: \'Booking Scheduled\',\s*data: appointment\[0\]\s*\}\);)', content)
if scheduled_match:
    content = content.replace(scheduled_match.group(1), "emitBookingConfirmed(appointment[0], salon);\n    " + scheduled_match.group(1))

# Cancelled
cancel_match = re.search(r'(res\.status\(200\)\.json\(\{ success: true, message: \'Appointment cancelled\', data: populated \}\);)', content)
if cancel_match:
    content = content.replace(cancel_match.group(1), "const shopCancel = await Salon.findById(appointment.salon);\n    if (shopCancel) emitBookingCancelled(appointment, shopCancel);\n    " + cancel_match.group(1))

# Rescheduled
resched_match = re.search(r'(res\.status\(200\)\.json\(\{ success: true, message: \'Appointment rescheduled successfully\', data: populated \}\);)', content)
if resched_match:
    content = content.replace(resched_match.group(1), "emitBookingRescheduled(appointment, salon);\n    " + resched_match.group(1))

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added booking event emitters to appointmentController.js")
