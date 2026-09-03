import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I will use a Regex to match the block accurately.
# It starts with '{selectedServiceIds.length > 0 && ('
# and ends with ')}' right before '</PageShell>' (or just some newlines then </PageShell>)

pattern = r"[ \t]*\{selectedServiceIds\.length > 0 \&\& \([\s\S]*?<\/div>\s*<\/div>\s*\)\}"

cleaned_content = re.sub(pattern, "", content)

# Also remove the one with 'Continue to Book' just in case it's floating around
pattern2 = r"[ \t]*\{\/\* Sticky Cart \/ Checkout Bar for Phase 19 \& 21 \*\/\}[\s\S]*?Continue to Book\s*<\/button>\s*<\/div>\s*\)\}"
cleaned_content = re.sub(pattern2, "", cleaned_content)

# Now, we inject the CORRECT block at the end of SalonDetails
block = """      {/* Sticky Cart / Checkout Bar */}
      {selectedServiceIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between md:justify-center md:gap-8 lg:gap-20">
           <div>
             <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{selectedServiceIds.length} Service{selectedServiceIds.length > 1 ? 's' : ''} Selected</p>
             <p className="text-xl font-black text-slate-900">₹{salon.services.filter(s => selectedServiceIds.includes(s._id)).reduce((acc, curr) => acc + curr.price, 0)}</p>
           </div>
           <div className="flex gap-2">
             {liveQueue?.walkInsEnabled && !liveQueue?.isFull && (
               <button onClick={handleJoinQueue} className="px-4 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-lg text-sm md:text-base">
                  Join Walk-in Queue
               </button>
             )}
             <button onClick={() => navigate('/book', { state: { salon, selectedServiceIds } })} className="px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition shadow-lg text-sm md:text-base">
                Book Appointment
             </button>
           </div>
        </div>
      )}"""

salon_details_idx = cleaned_content.find('export const SalonDetails')
if salon_details_idx != -1:
    end_idx = cleaned_content.find('</PageShell>', salon_details_idx)
    if end_idx != -1:
        final_content = cleaned_content[:end_idx] + block + "\n    " + cleaned_content[end_idx:]
        with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
            f.write(final_content)
        print('Successfully wiped all duplicates and restored ONE in SalonDetails.')
    else:
        print('Could not find </PageShell> in SalonDetails')
else:
    print('Could not find SalonDetails')
