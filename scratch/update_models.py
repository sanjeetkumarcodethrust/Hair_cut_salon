import re

with open('backend/models/Salon.js', 'r', encoding='utf-8') as f:
    salon_content = f.read()

# Add verificationStatus, rejectionReason, suspensionReason
salon_fields = """
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending'
    },
    rejectionReason: String,
    suspensionReason: String,
"""

if "verificationStatus" not in salon_content:
    salon_content = salon_content.replace("    rating: {", salon_fields + "    rating: {")
    with open('backend/models/Salon.js', 'w', encoding='utf-8') as f:
        f.write(salon_content)
    print("Updated Salon.js with verification fields")

with open('backend/models/User.js', 'r', encoding='utf-8') as f:
    user_content = f.read()

user_fields = """
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active'
    },
    suspensionReason: String,
"""
if "status:" not in user_content:
    user_content = user_content.replace("    role: {", user_fields + "    role: {")
    with open('backend/models/User.js', 'w', encoding='utf-8') as f:
        f.write(user_content)
    print("Updated User.js with status fields")
