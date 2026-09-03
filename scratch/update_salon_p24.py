import re

with open('backend/models/Salon.js', 'r', encoding='utf-8') as f:
    content = f.read()

business_ref = """    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business'
    },
    branchName: {
      type: String
    },
    managers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],"""

content = content.replace("owner: {", business_ref + "\n    owner: {")

with open('backend/models/Salon.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated Salon.js')
