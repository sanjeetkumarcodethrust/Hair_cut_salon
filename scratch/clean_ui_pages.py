with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The garbage is from line 1117 (0-indexed 1116) to 1173 (0-indexed 1172)
# Wait, line 1116 is `)}` which might be closing the `!bookingMode ?` block.
# Let's verify the JSX tags.
# Before 1117, we have:
# 1115: </div>
# 1116: )}
# 1117: )}  <-- this is syntax error.
# If we look at the replacement block I added:
# ...
#                  ) : (
#                    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
# ...
#                      <div className="pt-4 border-t border-slate-200">
#                        ...
#                        <button> ... </button>
#                      </div>
#                    </div>
#                  )}
# Yes, it ends exactly with `)}` at 1116.
# So I should delete line 1117 up to line 1172 (inclusive), which means deleting lines 1117 to 1172.
# Wait, line 1173 is `)}`. Line 1174 is `</div>`. Let's just strip exactly the redundant chunk.
# To be completely safe, let's just find the exact garbage chunk and remove it.

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

garbage = """             )}
                 </div>

                 {/* Phase 6: Instant Booking UI */}
                 {bookingSuccess ? (
                   <div className="pt-4 border-t border-slate-200 mt-6 animate-in slide-in-from-bottom-4">
                     <div className="p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                       <h4 className="font-bold text-green-700 flex items-center gap-2">✓ Booking Confirmed</h4>
                       <p className="text-sm text-green-600 mt-1">Your appointment is confirmed for {selectedDate} at {selectedSlot}.</p>
                       <p className="text-xs font-bold text-green-700 mt-2">Booking ID: {bookingSuccess._id.substring(0, 8).toUpperCase()}</p>
                     </div>
                     <button onClick={() => navigate('/dashboard')} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800">
                       View My Bookings
                     </button>
                   </div>
                 ) : (
                   <div className="pt-4 border-t border-slate-200 mt-6">
                     {bookingError && (
                       <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold flex flex-col gap-2">
                         <span>{bookingError}</span>
                         {bookingError.includes('log in') && (
                            <button onClick={() => navigate('/login')} className="bg-red-600 text-white py-1.5 px-3 rounded-lg w-fit text-xs">Log In Now</button>
                         )}
                       </div>
                     )}
                     <button 
                       disabled={!selectedSlot || isBooking} 
                       onClick={async () => {
                         if (!user) {
                           setBookingError('Please log in to continue booking.');
                           return;
                         }
                         setIsBooking(true);
                         setBookingError(null);
                         try {
                           const res = await api.post('/appointments/instant', {
                             shopId: id,
                             serviceId: selectedServiceId,
                             date: selectedDate,
                             startTime: selectedSlot
                           });
                           setBookingSuccess(res.data.data);
                         } catch (err) {
                           setBookingError(err.response?.data?.message || 'We couldn\\'t complete your booking. Please try again.');
                         } finally {
                           setIsBooking(false);
                         }
                       }}
                       className={`w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition ${selectedSlot && !isBooking ? 'bg-primary text-white shadow-md hover:opacity-90' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                     >
                       {isBooking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-4 h-4" />}
                       {isBooking ? 'Booking...' : 'Book Now'}
                     </button>
                   </div>
                 )}
               </div>"""

if garbage in content:
    content = content.replace(garbage, "")
    with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Cleaned up garbage successfully.")
else:
    print("Garbage not found exactly as requested. We may need to do a regex.")
