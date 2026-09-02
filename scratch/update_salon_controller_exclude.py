import re

with open('backend/controllers/salonController.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_code = """    const { date, serviceId } = req.query;

    if (!date || !serviceId) {"""

new_code = """    const { date, serviceId, excludeBookingId } = req.query;

    if (!date || !serviceId) {"""

content = content.replace(old_code, new_code)

old_call = "const slots = await getAvailableSlots(id, date, service);"
new_call = "const slots = await getAvailableSlots(id, date, service, 'Asia/Kolkata', excludeBookingId);"

content = content.replace(old_call, new_call)

with open('backend/controllers/salonController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated salonController to accept excludeBookingId")
