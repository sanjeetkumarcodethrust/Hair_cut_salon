import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import { startAbandonedHoldJob } from './jobs/abandonedHoldJob.js';\n"

if "startAbandonedHoldJob" not in content:
    content = content.replace("import { startReminderJob } from './jobs/reminderJob.js';", import_statement + "import { startReminderJob } from './jobs/reminderJob.js';")
    content = content.replace("startReminderJob();", "startReminderJob();\nstartAbandonedHoldJob();")

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected abandonedHoldJob into server.js")
