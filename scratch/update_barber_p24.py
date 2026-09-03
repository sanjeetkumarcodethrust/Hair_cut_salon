import re

with open('backend/models/BarberProfile.js', 'r', encoding='utf-8') as f:
    content = f.read()

assigned_branches_ref = """    assignedBranches: [
      {
        branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon' },
        active: { type: Boolean, default: true },
        role: { type: String, default: 'staff' }
      }
    ],"""

content = content.replace("salon: {", assigned_branches_ref + "\n    salon: {")

with open('backend/models/BarberProfile.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated BarberProfile.js')
