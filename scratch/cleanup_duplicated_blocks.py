import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# The exact block that was duplicated
block = """      {/* Sticky Cart / Checkout Bar for Phase 19 & 21 */}
      {selectedServiceIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between md:justify-center md:gap-8 lg:gap-20">
           <div>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{selectedServiceIds.length} Service{selectedServiceIds.length > 1 ? 's' : ''} Selected</p>
             <p className="text-xl font-black text-slate-900">₹{salon.services.filter(s => selectedServiceIds.includes(s._id)).reduce((acc, curr) => acc + curr.price, 0)}</p>
           </div>
           <button onClick={() => navigate('/book', { state: { salon, selectedServiceIds } })} className="px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg text-sm md:text-base">
             Continue to Book
           </button>
        </div>
      )}"""

# Remove ALL occurrences of this block (with some leading whitespace flexibility)
pattern = r"[ \t]*\{\/\* Sticky Cart \/ Checkout Bar for Phase 19 \& 21 \*\/\}[\s\S]*?Continue to Book\s*<\/button>\s*<\/div>\s*\)\}"

cleaned_content = re.sub(pattern, "", content)

# Now, we must re-insert it exactly ONCE at the end of `SalonDetails`.
# Let's find `export const SalonDetails` and find its closing `</PageShell>`
salon_details_idx = cleaned_content.find('export const SalonDetails')
if salon_details_idx != -1:
    # Find the first `</PageShell>` after this
    end_idx = cleaned_content.find('</PageShell>', salon_details_idx)
    if end_idx != -1:
        # Insert the block right before `</PageShell>`
        final_content = cleaned_content[:end_idx] + block + "\n    " + cleaned_content[end_idx:]
        with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
            f.write(final_content)
        print('Cleaned up duplicated Sticky Cart blocks successfully!')
    else:
        print('Could not find </PageShell> in SalonDetails')
else:
    print('Could not find SalonDetails')
