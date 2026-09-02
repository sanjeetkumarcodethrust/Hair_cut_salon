import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# I will replace the getAvailableSlots call in rescheduleAppointment
old_call = "const slots = await getAvailableSlots(shopId, rescheduleDate, serviceObj, 'Asia/Kolkata');"
new_call = "const slots = await getAvailableSlots(shopId, rescheduleDate, serviceObj, 'Asia/Kolkata', appointment._id);"

content = content.replace(old_call, new_call)

# Now remove the fallback I added:
fallback = """    if (!targetSlot) {
       // Proceed to strict check anyway as getAvailableSlots might block it strictly based on this very appointment
    }"""
new_fallback = """    if (!targetSlot) {
       throw new Error('This time is no longer available. Please choose another time.');
    }"""

content = content.replace(fallback, new_fallback)

with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated appointmentController.js to use excludeBookingId")
