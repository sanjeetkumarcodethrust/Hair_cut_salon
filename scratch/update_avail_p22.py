import re

with open('backend/services/availabilityService.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add LeaveRequest import
if "import LeaveRequest" not in content:
    content = content.replace("import Appointment from '../models/Appointment.js';", "import Appointment from '../models/Appointment.js';\nimport LeaveRequest from '../models/LeaveRequest.js';")

# Fetch approved leaves for the day
leave_fetch_logic = """
  // 3. Fetch Chairs
  const chairs = await Chair.find({ shopId, status: 'available', active: true }).lean();
  
  // Phase 22: Fetch Approved Leaves for this shop on this date
  const startOfDay = reqDate.clone().startOf('day');
  const endOfDay = reqDate.clone().endOf('day');
  
  const approvedLeaves = await LeaveRequest.find({
      shopId,
      status: 'APPROVED',
      startDate: { $lte: endOfDay.toDate() },
      endDate: { $gte: startOfDay.toDate() }
  }).lean();
  
  const onLeaveBarberIds = approvedLeaves.map(l => l.staffId.toString());
"""
content = re.sub(
    r"\/\/ 3\. Fetch Chairs[\s\S]*?const chairs = await Chair\.find\(\{ shopId, status: 'available', active: true \}\)\.lean\(\);",
    leave_fetch_logic,
    content
)

# Filter out on-leave barbers
barber_leave_filter = """
    // Phase 22: Is barber on leave today?
    if (onLeaveBarberIds.includes(barber._id.toString())) {
        return false;
    }

    // Phase 19: Check compatibility for all requested services
"""
content = content.replace("// Phase 19: Check compatibility for all requested services", barber_leave_filter)

with open('backend/services/availabilityService.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated availabilityService.js for Phase 22")
