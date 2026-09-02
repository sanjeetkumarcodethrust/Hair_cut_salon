import re

with open('backend/jobs/reminderJob.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_24h = "idemKey = `reminder_24h_${apt._id}`;"
new_24h = "idemKey = `reminder_24h_${apt._id}_${new Date(apt.startTime).getTime()}`;"

old_1h = "idemKey = `reminder_1h_${apt._id}`;"
new_1h = "idemKey = `reminder_1h_${apt._id}_${new Date(apt.startTime).getTime()}`;"

content = content.replace(old_24h, new_24h).replace(old_1h, new_1h)

with open('backend/jobs/reminderJob.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated reminderJob idemKeys to include startTime")
