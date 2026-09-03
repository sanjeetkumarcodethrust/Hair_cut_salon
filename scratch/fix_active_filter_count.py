import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_block = """  const activeFilterCount = Object.entries(activeFilters).filter(([k, v]) => {
    if (k === 'radius' && v !== 5000) return true;
    if (k === 'offersOnly' && v === true) return true;
    if (k !== 'radius' && k !== 'offersOnly' && v !== '') return true;
    return false;
  });"""

new_block = """  const activeFilterCount = Object.entries(activeFilters).filter(([k, v]) => {
    if (k === 'radius' && v !== 5000) return true;
    if (k === 'offersOnly' && v === true) return true;
    if (k !== 'radius' && k !== 'offersOnly' && v !== '') return true;
    return false;
  }).length;"""

content = content.replace(old_block, new_block)

# Wait, let's verify if there's a `return false;` in the file.
