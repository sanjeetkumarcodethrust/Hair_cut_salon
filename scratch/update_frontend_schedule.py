import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# I need to find where the "Select Date & Time" starts, which is around line 984.
# Let's replace the whole SalonDetails component to make it easier, but that's a huge component.
# I will just write a script that updates the specific JSX tree.

state_str = """
  const [isBooking, setIsBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(null);
"""
new_state = """
  const [isBooking, setIsBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(null);
  const [bookingMode, setBookingMode] = React.useState(null); // 'schedule' or null
"""
content = content.replace(state_str, new_state)

# Replace Date Options to 30 days
date_opts_old = """const dateOptions = Array.from({length: 7}).map((_, i) => {"""
date_opts_new = """const dateOptions = Array.from({length: 30}).map((_, i) => {"""
content = content.replace(date_opts_old, date_opts_new)

# Locate the right column where services are selected
# We will inject the logic between `// Selected Service Snippet` and the date picker.

snippet_start = """                 {/* Selected Service Snippet */}
                 {(() => {
                   const s = activeServices.find(x => x._id === selectedServiceId);
                   return s ? (
                     <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-6">
                       <h4 className="font-bold text-slate-900">{s.name}</h4>
                       <p className="text-sm font-semibold text-primary mt-1">₹{s.price} • {s.duration} min</p>
                     </div>
                   ) : null;
                 })()}"""

new_flow = snippet_start + """

                 {bookingSuccess ? (
                   <div className="pt-4 border-t border-slate-200 mt-6 animate-in slide-in-from-bottom-4">
                     <div className="p-4 bg-green-50 border border-green-200 rounded-2xl mb-4">
                       <h4 className="font-bold text-green-700 flex items-center gap-2">✓ Booking Confirmed</h4>
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
                       <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold">
                         {bookingError}
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
                         Schedule Later
                       </button>
                     </div>
                     <p className="text-xs text-slate-500 mt-4 text-center font-medium">"Book Now" finds the earliest available slot today.</p>
                   </div>
                 ) : (
                   <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                     <button onClick={() => setBookingMode(null)} className="text-xs font-bold text-slate-500 mb-4 hover:text-slate-700 flex items-center gap-1">← Back to Options</button>
                     
                     <h3 className="text-lg font-bold text-slate-900 mb-4">Select Date & Time</h3>
"""

# I need to find the snippet start and replace everything below it up to the end of the `) : (` block.
# Wait, replacing chunk by chunk is safer.

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated State and Date Options")
