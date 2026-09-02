import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the specific block of JSX in SalonDetails
# We need to find the specific "Continue to Booking" button and replace it with a functional one.

# Since we want to manage booking state (booking, success, error) inside SalonDetails:
# We should add state to SalonDetails.
state_str = """
  const [selectedDate, setSelectedDate] = React.useState(new Date().toISOString().split('T')[0]);
  const [availableSlots, setAvailableSlots] = React.useState([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState(null);
"""
new_state = state_str + """
  const [isBooking, setIsBooking] = React.useState(false);
  const [bookingError, setBookingError] = React.useState(null);
  const [bookingSuccess, setBookingSuccess] = React.useState(null);
  const { user } = useSelector(state => state.auth || {});
  const navigate = useNavigate();
"""
content = content.replace(state_str, new_state)

# Replace the "Continue to Booking" footer
footer_str = """                 {/* Sticky Action Footer */}
                 <div className="pt-4 border-t border-slate-200">
                   <button 
                     disabled={!selectedSlot} 
                     className={`w-full py-3.5 font-bold rounded-xl flex items-center justify-center gap-2 transition ${selectedSlot ? 'bg-slate-900 text-white shadow-md hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                   >
                     <Calendar className="w-4 h-4" /> Continue to Booking
                   </button>
                   {selectedSlot && <p className="text-[10px] font-bold text-center text-amber-500 mt-2 uppercase tracking-wide">Booking opens in Phase 6</p>}
                 </div>"""

new_footer = """                 {/* Phase 6: Instant Booking UI */}
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
                 )}"""
content = content.replace(footer_str, new_footer)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated UiPages.jsx with Phase 6 Booking Flow")
