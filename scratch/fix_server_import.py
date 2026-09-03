import re

with open('backend/server.js', 'r', encoding='utf-8') as f:
    content = f.read()

import_statement = "import { startAbandonedHoldJob } from './jobs/abandonedHoldJob.js';\n"

if "startAbandonedHoldJob" not in content[:500]: # check top of file
    content = import_statement + content

with open('backend/server.js', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected import for abandonedHoldJob")
