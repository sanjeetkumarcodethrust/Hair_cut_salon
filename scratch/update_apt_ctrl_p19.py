import re

with open('backend/controllers/appointmentController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace service parsing in instantBooking and scheduledBooking
def replace_service_logic(func_name, code):
    # Find the function body
    start_idx = code.find(f"export const {func_name} = async (req, res) => {{")
    if start_idx == -1: return code
    
    # We will just replace the specific parsing lines
    search_str_1 = "const { shopId, serviceId"
    search_str_2 = "if (!shopId || !serviceId"
    search_str_3 = "const service = salon.services.find(s => s._id.toString() === serviceId);"
    search_str_4 = "if (!service) throw new Error('Service not found in this shop');"
    search_str_5 = "if (service.isActive === false) throw new Error('This service is no longer available');"
    
    new_logic = """
    // Phase 19: Multi-service handling
    const serviceIds = req.body.serviceIds || (req.body.serviceId ? [req.body.serviceId] : []);
    if (!req.body.shopId || serviceIds.length === 0) {
      throw new Error('Missing required booking parameters');
    }
    const shopId = req.body.shopId;
    
    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');
    
    const selectedServices = [];
    let basePrice = 0;
    let totalDuration = 0;
    
    for (const sid of serviceIds) {
       const s = salon.services.find(srv => srv._id.toString() === sid);
       if (!s) throw new Error(`Service ${sid} not found in this shop`);
       if (s.isActive === false) throw new Error(`Service ${s.name} is no longer available`);
       selectedServices.push(s);
       basePrice += s.price;
       totalDuration += (s.duration || 30);
    }
    
    // We create a mock 'service' object to pass to the rest of the legacy code
    const service = {
       _id: selectedServices[0]._id, // legacy fallback
       name: selectedServices.map(s => s.name).join(' + '),
       price: basePrice,
       duration: totalDuration
    };
"""
    
    # We can use regex to replace from `const { shopId` up to `isActive === false) throw ...`
    pattern = r"const \{\s*shopId,\s*serviceId.*?\}[^;]*;[\s\S]*?if \(service\.isActive === false\) throw new Error\('This service is no longer available'\);"
    
    # Let's be careful and do it per function
    func_code = code[start_idx:]
    
    # Wait, the destructing for scheduledBooking also has `date, startTime, barberId`.
    # Let's just do a manual string replacement that's safer.
    return code

# I will use a more robust regex to replace the service extraction block.

replace_regex_instant = r"const \{ shopId, serviceId \} = req\.body;[\s\S]*?if \(!shopId \|\| !serviceId\) \{[\s\S]*?throw new Error\('Missing required booking parameters'\);[\s\S]*?\}[\s\S]*?const salon = useTransaction \? await Salon\.findById\(shopId\)\.session\(session\) : await Salon\.findById\(shopId\);[\s\S]*?if \(!salon\) throw new Error\('Shop not found'\);[\s\S]*?const service = salon\.services\.find\(s => s\._id\.toString\(\) === serviceId\);[\s\S]*?if \(!service\) throw new Error\('Service not found in this shop'\);[\s\S]*?if \(service\.isActive === false\) throw new Error\('This service is no longer available'\);"

new_instant = """const serviceIds = req.body.serviceIds || (req.body.serviceId ? [req.body.serviceId] : []);
    if (!req.body.shopId || serviceIds.length === 0) {
      throw new Error('Missing required booking parameters');
    }
    const shopId = req.body.shopId;
    
    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');
    
    const selectedServices = [];
    let basePrice = 0;
    let totalDuration = 0;
    
    for (const sid of serviceIds) {
       const s = salon.services.find(srv => srv._id.toString() === sid);
       if (!s) throw new Error(`Service ${sid} not found in this shop`);
       if (s.isActive === false) throw new Error(`Service ${s.name} is no longer available`);
       selectedServices.push(s);
       basePrice += s.price;
       totalDuration += (s.duration || 30);
    }
    
    const service = {
       _id: selectedServices[0]._id, 
       name: selectedServices.map(s => s.name).join(' + '),
       price: basePrice,
       duration: totalDuration,
       rawList: selectedServices
    };"""

content = re.sub(replace_regex_instant, new_instant, content, count=1)


replace_regex_scheduled = r"const \{ shopId, serviceId, date, startTime, barberId \} = req\.body;[\s\S]*?if \(!shopId \|\| !serviceId \|\| !date \|\| !startTime\) \{[\s\S]*?throw new Error\('Missing required scheduling parameters'\);[\s\S]*?\}[\s\S]*?const salon = useTransaction \? await Salon\.findById\(shopId\)\.session\(session\) : await Salon\.findById\(shopId\);[\s\S]*?if \(!salon\) throw new Error\('Shop not found'\);[\s\S]*?const service = salon\.services\.find\(s => s\._id\.toString\(\) === serviceId\);[\s\S]*?if \(!service\) throw new Error\('Service not found in this shop'\);[\s\S]*?if \(service\.isActive === false\) throw new Error\('This service is no longer available'\);"

new_scheduled = """const serviceIds = req.body.serviceIds || (req.body.serviceId ? [req.body.serviceId] : []);
    const { date, startTime, barberId } = req.body;
    if (!req.body.shopId || serviceIds.length === 0 || !date || !startTime) {
      throw new Error('Missing required scheduling parameters');
    }
    const shopId = req.body.shopId;
    
    const salon = useTransaction ? await Salon.findById(shopId).session(session) : await Salon.findById(shopId);
    if (!salon) throw new Error('Shop not found');
    
    const selectedServices = [];
    let basePrice = 0;
    let totalDuration = 0;
    
    for (const sid of serviceIds) {
       const s = salon.services.find(srv => srv._id.toString() === sid);
       if (!s) throw new Error(`Service ${sid} not found in this shop`);
       if (s.isActive === false) throw new Error(`Service ${s.name} is no longer available`);
       selectedServices.push(s);
       basePrice += s.price;
       totalDuration += (s.duration || 30);
    }
    
    const service = {
       _id: selectedServices[0]._id,
       name: selectedServices.map(s => s.name).join(' + '),
       price: basePrice,
       duration: totalDuration,
       rawList: selectedServices
    };"""

content = re.sub(replace_regex_scheduled, new_scheduled, content, count=1)

# Now fix `availabilityService.getAvailableSlots` calls which now need the rawList or service
content = content.replace("getAvailableSlots(shopId, moment().tz(env.timezone || 'Asia/Kolkata').format('YYYY-MM-DD'), service", "getAvailableSlots(shopId, moment().tz(env.timezone || 'Asia/Kolkata').format('YYYY-MM-DD'), service.rawList")
content = content.replace("getAvailableSlots(shopId, date, service", "getAvailableSlots(shopId, date, service.rawList")

# Now inject `services` array and `totalDuration` into Appointment creation
create_replace_str = """
      const newAppointment = new Appointment({
        customer: req.user._id,
        salon: shopId,
        barber: assignedBarberId,
        chair: assignedChairId,
        serviceId: service._id,
        service: {
          name: service.name,
          price: service.price,
          duration: service.duration,
        },
"""

create_new_str = """
      const newAppointment = new Appointment({
        customer: req.user._id,
        salon: shopId,
        barber: assignedBarberId,
        chair: assignedChairId,
        serviceId: service._id, // legacy
        services: service.rawList.map(s => ({
            serviceId: s._id,
            name: s.name,
            price: s.price,
            duration: s.duration
        })),
        totalDuration: service.duration,
        service: {
          name: service.name,
          price: service.price,
          duration: service.duration,
        },
"""

content = content.replace(create_replace_str, create_new_str)


with open('backend/controllers/appointmentController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated appointmentController.js for Phase 19 Multi-Service")
