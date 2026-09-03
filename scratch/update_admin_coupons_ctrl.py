import re

with open('backend/controllers/adminController.js', 'r', encoding='utf-8') as f:
    content = f.read()

admin_coupons = """
// @desc    Get all coupons
// @route   GET /api/admin/coupons
export const getAdminCoupons = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const Coupon = (await import('../models/Coupon.js')).default;
    const coupons = await Coupon.find({})
      .populate('salon', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Coupon.countDocuments();

    res.status(200).json({ coupons, page, pages: Math.ceil(total / limit), total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
"""

content = content + "\n" + admin_coupons

with open('backend/controllers/adminController.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated adminController.js with Coupons")
