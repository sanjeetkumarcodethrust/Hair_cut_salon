import re

with open('backend/controllers/salonController.js', 'r', encoding='utf-8') as f:
    content = f.read()

if "import Review" not in content:
    content = content.replace("import Salon from '../models/Salon.js';", "import Salon from '../models/Salon.js';\nimport Review from '../models/Review.js';")

new_func = """// @desc    Get single salon with profile data (distance, reviews)
// @route   GET /api/salons/:id?latitude=&longitude=
// @access  Public
export const getSalon = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;
    
    // Use lean() for easier manipulation if needed, or just convert to object later.
    const salonDoc = await Salon.findById(req.params.id).populate('owner', 'name email');

    if (!salonDoc) {
      return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    
    const salon = salonDoc.toObject();

    // 1. Calculate Starting Price
    let startingPrice = null;
    if (salon.services && salon.services.length > 0) {
      startingPrice = Math.min(...salon.services.map(s => s.price));
    }
    salon.startingPrice = startingPrice;
    salon.currency = 'INR';

    // 2. Calculate Distance if user location provided
    if (latitude && longitude && salon.location?.coordinates) {
      const lat1 = parseFloat(latitude);
      const lon1 = parseFloat(longitude);
      const lon2 = salon.location.coordinates[0];
      const lat2 = salon.location.coordinates[1];
      
      // Haversine formula
      const R = 6371e3; // metres
      const phi1 = lat1 * Math.PI/180; // φ, λ in radians
      const phi2 = lat2 * Math.PI/180;
      const deltaPhi = (lat2-lat1) * Math.PI/180;
      const deltaLambda = (lon2-lon1) * Math.PI/180;

      const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

      salon.distanceMeters = R * c; // in metres
    }

    // 3. Fetch Preview Reviews (e.g. latest 5)
    const reviews = await Review.find({ salon: salon._id })
      .populate('customer', 'name profilePic')
      .sort({ createdAt: -1 })
      .limit(5);
      
    salon.reviewsPreview = reviews;

    res.status(200).json({ success: true, data: salon });
  } catch (error) {
    if (error.kind === 'ObjectId') {
       return res.status(404).json({ success: false, message: 'Shop not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};"""

start_idx = content.find('export const getSalon = async (req, res) => {')
end_idx = content.find('export const createSalon = async (req, res) => {')

if start_idx != -1 and end_idx != -1:
    # also remove the previous JSDoc for getSalon
    jsdoc_start = content.rfind('// @desc    Get single salon', 0, start_idx)
    content = content[:jsdoc_start] + new_func + '\n\n' + content[end_idx:]
    with open('backend/controllers/salonController.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated getSalon in salonController.js")
else:
    print("Could not find getSalon")
