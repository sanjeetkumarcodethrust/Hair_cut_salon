import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Define pattern to match the sticky cart block
pattern = r"[ \t]*\{\/\* Sticky Cart \/ Checkout Bar for Phase 19 \& 21 \*\/\}[\s\S]*?Continue to Book\s*<\/button>\s*<\/div>\s*<\/div>\s*\)\}"

# Extract one correct copy of the block just in case, or define it manually
matches = re.findall(pattern, content)
if not matches:
    print("Could not find any matches with the new pattern.")
    # Maybe the trailing )\} doesn't match? Let's use a simpler extraction
    # We will just find the index of the comment and the index of "Continue to Book\n             </button>\n           </div>\n        </div>\n      )}"
    pass

block = """      {/* Sticky Cart / Checkout Bar for Phase 19 & 21 */}
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
               Continue to Book
             </button>
           </div>
        </div>
      )}"""

# We'll iteratively remove the block by searching for the start comment and finding the matching closing
def remove_blocks(text):
    start_marker = "{/* Sticky Cart / Checkout Bar for Phase 19 & 21 */}"
    end_marker = "Continue to Book"
    while start_marker in text:
        start_idx = text.find(start_marker)
        # Find the line start of this block
        line_start = text.rfind('\n', 0, start_idx)
        if line_start == -1: line_start = 0
        
        # Find the end marker
        end_idx = text.find(end_marker, start_idx)
        if end_idx == -1: break
        
        # Find the closing tag `)}` after the end marker
        close_idx = text.find(')}', end_idx)
        if close_idx == -1: break
        
        text = text[:line_start] + text[close_idx+2:]
    return text

cleaned_content = remove_blocks(content)

salon_details_idx = cleaned_content.find('export const SalonDetails')
if salon_details_idx != -1:
    end_idx = cleaned_content.find('</PageShell>', salon_details_idx)
    if end_idx != -1:
        final_content = cleaned_content[:end_idx] + block + "\n    " + cleaned_content[end_idx:]
        with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
            f.write(final_content)
        print('Successfully removed duplicates and inserted ONE block in SalonDetails.')
    else:
        print('Could not find </PageShell> in SalonDetails')
else:
    print('Could not find SalonDetails')
