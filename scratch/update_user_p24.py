import re

with open('backend/models/User.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("enum: ['customer', 'barber', 'owner', 'admin'],", "enum: ['customer', 'barber', 'owner', 'manager', 'admin'],")

manager_ref = """    managedBranches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Salon'
    }],"""

content = content.replace("password: {", manager_ref + "\n    password: {")

with open('backend/models/User.js', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated User.js')
