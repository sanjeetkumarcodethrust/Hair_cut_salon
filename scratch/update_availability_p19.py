import re

with open('backend/services/availabilityService.js', 'r', encoding='utf-8') as f:
    content = f.read()

duration_logic = """
  // 5. Generate Slots
  const slots = [];
  let currentTime = shopStart.clone();
  const now = moment().tz(timezone);

  // Phase 19: Calculate total duration if multiple services
  let durationMin = 30;
  let serviceList = [];
  if (Array.isArray(service)) {
    serviceList = service;
    durationMin = service.reduce((acc, s) => acc + (s.duration || 30), 0);
  } else if (service) {
    serviceList = [service];
    durationMin = service.duration || 30;
  }
"""

content = re.sub(
    r"\/\/ 5\. Generate Slots[\s\S]*?const durationMin = service\.duration \|\| 30;",
    duration_logic,
    content
)

barber_compat_logic = """
  const qualifiedBarbers = allBarbers.filter(b => {
    // Check if they work today
    const bHours = b.availability?.[dayOfWeek];
    if (!bHours || !bHours.isWorking) return false;

    // Phase 19: Check compatibility for all requested services
    if (b.services && b.services.length > 0) {
      let requiredServices = [];
      if (Array.isArray(service)) requiredServices = service;
      else if (service) requiredServices = [service];
      
      const canDoAll = requiredServices.every(reqS => 
        b.services.some(bS => bS.name.toLowerCase() === reqS.name.toLowerCase())
      );
      if (!canDoAll) return false;
    }
    return true;
  });
"""

content = re.sub(
    r"const qualifiedBarbers = allBarbers\.filter\(b => \{[\s\S]*?return true;\s*\}\);",
    barber_compat_logic,
    content
)

with open('backend/services/availabilityService.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated availabilityService.js for Phase 19 Multi-Service")
