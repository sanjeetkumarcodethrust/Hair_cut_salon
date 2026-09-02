import re

with open('backend/controllers/salonController.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add getShopAvailability function
new_func = """import { getAvailableSlots } from '../services/availabilityService.js';

// @desc    Get real-time availability for a shop
// @route   GET /api/salons/:id/availability?date=&serviceId=
// @access  Public
export const getShopAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, serviceId } = req.query;

    if (!date || !serviceId) {
      return res.status(400).json({ success: false, message: 'Date and serviceId are required' });
    }

    const shop = await Salon.findById(id).lean();
    if (!shop) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }

    // Find the requested service inside the shop
    const service = shop.services.find(s => s._id.toString() === serviceId);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found in this shop' });
    }

    const slots = await getAvailableSlots(id, date, service);

    res.status(200).json({
      success: true,
      shopId: id,
      date,
      service: {
        id: service._id,
        name: service.name,
        duration: service.duration
      },
      slots
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
"""

content = content + "\n" + new_func

with open('backend/controllers/salonController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Added getShopAvailability to salonController.js")


with open('backend/routes/salonRoutes.js', 'r', encoding='utf-8') as f:
    routes = f.read()

routes = routes.replace("getNearbySalons,", "getNearbySalons,\n  getShopAvailability,")
routes = routes.replace("router.get('/nearby', getNearbySalons);", "router.get('/nearby', getNearbySalons);\nrouter.get('/:id/availability', getShopAvailability);")

with open('backend/routes/salonRoutes.js', 'w', encoding='utf-8') as f:
    f.write(routes)
print("Updated salonRoutes.js")
