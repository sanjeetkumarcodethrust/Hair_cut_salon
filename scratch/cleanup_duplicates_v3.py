import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

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
    
    while start_marker in text:
        start_idx = text.find(start_marker)
        line_start = text.rfind('\n', 0, start_idx)
        if line_start == -1: line_start = 0
        
        # We know the block ends with "Continue to Book" and some closing tags
        # Let's just find the next "Continue to Book" which should be within 2000 characters
        end_marker = "Continue to Book"
        end_idx = text.find(end_marker, start_idx, start_idx + 2000)
        
        if end_idx == -1:
            print("Warning: Could not find 'Continue to Book' near start marker. Removing just the comment line to avoid infinite loop.")
            text = text[:line_start] + text[text.find('\n', start_idx):]
            continue
            
        close_idx = text.find(')}', end_idx, end_idx + 500)
        if close_idx == -1:
            print("Warning: Could not find ')}' near end marker. Skipping.")
            break
            
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
