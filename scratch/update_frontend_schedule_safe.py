import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Date Options
content = content.replace("Array.from({length: 7}).map((_, i) => {", "Array.from({length: 30}).map((_, i) => {")

# Add bookingMode to state
if "const [bookingMode" not in content:
    content = content.replace("const [bookingSuccess, setBookingSuccess] = React.useState(null);", 
                              "const [bookingSuccess, setBookingSuccess] = React.useState(null);\n  const [bookingMode, setBookingMode] = React.useState(null);")

# I need to replace the content inside `selectedServiceId` truthy block.
# Let's find exactly `// Availability View`
availability_view_start = content.find('               // Availability View')
if availability_view_start == -1:
    print("Could not find '// Availability View'")
    exit(1)

# The end is right before `             )}` which matches `{!selectedServiceId ? ...`
end_index = content.find('             )}', availability_view_start)

replacement = """               // Phase 6 / 7 View
               <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                 <button onClick={() => { setSelectedServiceId(null); setBookingMode(null); }} className="text-sm font-bold text-primary flex items-center gap-1 mb-4 hover:opacity-80">
                   ← Back to services
                 </button>
                 
                 {(() => {
                   const s = activeServices.find(x => x._id === selectedServiceId);
                   return s ? (
                     <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                       <h4 className="font-bold text-slate-900">{s.name}</h4>
                       <p className="text-sm font-semibold text-primary mt-1">₹{s.price} • {s.duration} min</p>
                     </div>
                   ) : null;
                 })()}

                 {bookingSuccess ? (
                   <div className="pt-4 border-t border-slate-200 mt-6 animate-in slide-in-from-bottom-4">
                     <div className="p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                       <h4 className="font-bold text-green-700 flex items-center gap-2">✓ Booking {bookingSuccess.bookingType === 'scheduled' ? 'Scheduled' : 'Confirmed'}</h4>
                       <p className="text-sm text-green-600 mt-1">Your appointment is confirmed for {bookingSuccess.date ? new Date(bookingSuccess.date).toLocaleDateString() : selectedDate} at {bookingSuccess.time || selectedSlot}.</p>
                       <p className="text-xs font-bold text-green-700 mt-2">Booking ID: {bookingSuccess._id.substring(0, 8).toUpperCase()}</p>
                     </div>
                     <button onClick={() => navigate('/dashboard')} className="w-full py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800">
                       View My Bookings
                     </button>
                   </div>
                 ) : !bookingMode ? (
                   <div className="mt-6">
                     {bookingError && (
                       <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold flex flex-col gap-2">
                         <span>{bookingError}</span>
                         {bookingError.includes('log in') && (
                            <button onClick={() => navigate('/login')} className="bg-red-600 text-white py-1.5 px-3 rounded-lg w-fit text-xs">Log In Now</button>
                         )}
                       </div>
                     )}
                     <div className="grid grid-cols-2 gap-3">
                       <button 
                         disabled={isBooking}
                         onClick={async () => {
                           if (!user) return setBookingError('Please log in to continue booking.');
                           setIsBooking(true); setBookingError(null);
                           try {
                             const res = await api.post('/appointments/instant', { shopId: id, serviceId: selectedServiceId });
                             setBookingSuccess(res.data.data);
                           } catch (err) {
                             setBookingError(err.response?.data?.message || 'Error creating instant booking.');
                           } finally {
                             setIsBooking(false);
                           }
                         }}
                         className="py-3.5 bg-slate-900 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-slate-800 disabled:opacity-50 transition"
                       >
                         {isBooking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                         Book Now
                       </button>
                       <button 
                         disabled={isBooking}
                         onClick={() => setBookingMode('schedule')}
                         className="py-3.5 bg-white text-slate-900 font-bold border-2 border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition"
                       >
                         Schedule
                       </button>
                     </div>
                     <p className="text-xs text-slate-500 mt-4 text-center font-medium">"Book Now" finds the earliest available slot today.</p>
                   </div>
                 ) : (
                   <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                     <button onClick={() => { setBookingMode(null); setSelectedSlot(null); setBookingError(null); }} className="text-xs font-bold text-slate-500 mb-4 hover:text-slate-700 flex items-center gap-1">← Back to booking options</button>
                     
                     <h3 className="text-lg font-bold text-slate-900 mb-4">Select Date & Time</h3>
                     
                     <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-2 -mx-2 px-2">
                       {dateOptions.map(opt => (
                         <button
                           key={opt.dateString}
                           onClick={() => setSelectedDate(opt.dateString)}
                           className={`shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold border transition whitespace-nowrap ${selectedDate === opt.dateString ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}
                         >
                           {opt.display}
                         </button>
                       ))}
                     </div>

                     <div className="mb-6">
                       {loadingSlots ? (
                         <div className="flex justify-center items-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                       ) : availableSlots.length === 0 ? (
                         <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
                           <p className="text-sm font-bold text-slate-500 mb-1">No availability on this day</p>
                           <p className="text-xs text-slate-400">Please select a different date.</p>
                         </div>
                       ) : (
                         <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                           {availableSlots.map(slot => (
                             <button
                               key={slot.startTime}
                               onClick={() => setSelectedSlot(slot.startTime)}
                               className={`py-2.5 rounded-xl text-sm font-bold border transition ${selectedSlot === slot.startTime ? 'bg-primary text-white border-primary shadow-sm shadow-primary/30' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                             >
                               {slot.startTime}
                             </button>
                           ))}
                         </div>
                       )}
                     </div>

                     <div className="pt-4 border-t border-slate-200">
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
                           if (!user) return setBookingError('Please log in to continue booking.');
                           setIsBooking(true); setBookingError(null);
                           try {
                             const res = await api.post('/appointments/scheduled', {
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
                         {isBooking ? 'Scheduling...' : 'Confirm Schedule'}
                       </button>
                     </div>
                   </div>
                 )}
"""

content = content[:availability_view_start] + replacement + content[end_index:]

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Successfully replaced frontend booking logic.")
