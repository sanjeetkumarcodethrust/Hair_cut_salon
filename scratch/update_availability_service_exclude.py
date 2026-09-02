import re

with open('backend/services/availabilityService.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Change function signature
content = content.replace("export const getAvailableSlots = async (shopId, dateStr, service, timezone = 'Asia/Kolkata') => {", "export const getAvailableSlots = async (shopId, dateStr, service, timezone = 'Asia/Kolkata', excludeBookingId = null) => {")

# Add the exclusion to the query
if "excludeBookingId" not in content.replace("export const getAvailableSlots = async (shopId, dateStr, service, timezone = 'Asia/Kolkata', excludeBookingId = null) => {", ""):
    old_query = """const appointments = await Appointment.find({
    salon: shopId,
    status: { $in: ['pending', 'confirmed'] },
    startTime: { $lt: endOfDay.toDate() },
    endTime: { $gt: startOfDay.toDate() }
  }).lean();"""
    
    new_query = """const query = {
    salon: shopId,
    status: { $in: ['pending', 'confirmed'] },
    startTime: { $lt: endOfDay.toDate() },
    endTime: { $gt: startOfDay.toDate() }
  };
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  const appointments = await Appointment.find(query).lean();"""
    
    content = content.replace(old_query, new_query)
    
with open('backend/services/availabilityService.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated availabilityService.js to support excludeBookingId")
