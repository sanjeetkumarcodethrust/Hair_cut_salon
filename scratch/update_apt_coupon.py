import re

with open('backend/models/Appointment.js', 'r', encoding='utf-8') as f:
    content = f.read()

coupon_fields = """
    originalPrice: {
      type: Number
    },
    discountAmount: {
      type: Number,
      default: 0
    },
    couponCode: {
      type: String
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    },
"""

if "discountAmount:" not in content:
    content = content.replace("    price: {", coupon_fields + "    price: {")
    with open('backend/models/Appointment.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated Appointment.js with discount fields")
