import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, Clock, Scissors, MapPin, Loader2, User, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [apt, setApt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  
  // Reschedule State
  const [dateOptions, setDateOptions] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    if (!userInfo) return;
    const fetchApt = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/appointments/${id}`);
        setApt(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };
    fetchApt();
  }, [id, userInfo]);

  useEffect(() => {
    if (showReschedule) {
      const opts = Array.from({length: 30}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i);
        return {
          dateString: d.toISOString().split('T')[0],
          display: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        };
      });
      setDateOptions(opts);
      setSelectedDate(opts[0].dateString);
    }
  }, [showReschedule]);

  useEffect(() => {
    if (selectedDate && apt?.salon?._id && showReschedule) {
      const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
          // Since getAvailableSlots needs service duration, it's computed backend. 
          // But our API endpoint `/salons/:id/availability` is generic. Wait, Phase 5 created this API!
          // GET /api/salons/:id/availability?date=...&serviceId=...
          const res = await api.get(`/salons/${apt.salon._id}/availability?date=${selectedDate}&serviceId=${apt.serviceId}`);
          setAvailableSlots(res.data.slots || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingSlots(false);
        }
      };
      fetchSlots();
    }
  }, [selectedDate, apt, showReschedule]);

  if (!userInfo) return <Navigate to="/login" replace />;

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error || !apt) return <div className="p-4 m-8 bg-red-50 text-red-600 rounded-xl max-w-4xl mx-auto">{error}</div>;

  const handleCancel = async () => {
    setActionLoading(true);
    try {
      await api.put(`/appointments/${id}/cancel`);
      // Reload appointment
      const res = await api.get(`/appointments/${id}`);
      setApt(res.data);
      setShowCancelConfirm(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    setActionLoading(true);
    try {
      await api.put(`/appointments/${id}/reschedule`, {
        rescheduleDate: selectedDate,
        rescheduleTime: selectedSlot
      });
      const res = await api.get(`/appointments/${id}`);
      setApt(res.data);
      setShowReschedule(false);
      setSelectedSlot(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule appointment');
    } finally {
      setActionLoading(false);
    }
  };


  const handlePayment = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/payments/create-checkout-session', {
        appointmentId: id
      });
      if (res.data.payment.url) {
        window.location.href = res.data.payment.url;
      } else {
        // It was already paid or mock mode returned a redirect
        alert("Payment processed");
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setActionLoading(false);
    }
  };

  const isCancellable = ['pending', 'confirmed'].includes(apt.status);

  const isReschedulable = ['pending', 'confirmed'].includes(apt.status);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/bookings" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-900 mb-6 transition">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Bookings
        </Link>
        
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden mb-6">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Booking Details</h1>
                <p className="text-sm font-bold text-slate-400 mt-2">ID: {apt._id.substring(0, 8).toUpperCase()}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${apt.status === 'cancelled' ? 'bg-red-50 text-red-600' : apt.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-primary'}`}>
                {apt.status}
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Appointment Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500"><Calendar className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Date</p>
                        <p className="font-bold text-slate-900">{new Date(apt.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500"><Clock className="w-5 h-5" /></div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Time</p>
                        <p className="font-bold text-slate-900">{apt.time}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Service Details</h3>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500"><Scissors className="w-5 h-5" /></div>
                    <div>
                      <p className="font-bold text-slate-900">{apt.service?.name || apt.snapshots?.serviceName}</p>
                      <p className="text-xs font-semibold text-slate-400">{apt.snapshots?.serviceDuration || apt.service?.duration || 30} mins</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Shop Details</h3>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                      <img src={apt.salon?.images?.[0] || 'https://via.placeholder.com/150'} alt="Shop" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{apt.salon?.name}</p>
                      <p className="text-sm font-medium text-slate-500">{apt.salon?.address}</p>
                      <p className="text-sm font-medium text-slate-500">{apt.salon?.city}</p>
                    </div>
                  </div>
                </div>

                {apt.barber && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Assigned Barber</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden shrink-0">
                        {apt.barber.profilePhoto ? (
                          <img src={apt.barber.profilePhoto} alt="Barber" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400"><User className="w-5 h-5" /></div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{apt.barber.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Payment Summary</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Service Total</span>
                <span className="text-sm font-bold text-slate-900">₹{apt.price}</span>
              </div>
              {apt.advanceAmount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-500">Advance Required</span>
                  <span className="text-sm font-bold text-slate-900">₹{apt.advanceAmount}</span>
                </div>
              )}
              {apt.remainingAmount > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-slate-500">Remaining (Pay at Shop)</span>
                  <span className="text-sm font-bold text-slate-900">₹{apt.remainingAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                  <span className={`text-sm font-bold uppercase ${apt.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                    {apt.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                  </span>
                </div>
                
                {apt.paymentStatus !== 'paid' && apt.status === 'pending' && (
                  <button
                    onClick={handlePayment}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          {isCancellable && !showCancelConfirm && !showReschedule && (
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-3">
              <button 
                onClick={() => setShowReschedule(true)}
                className="flex-1 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition"
              >
                Reschedule
              </button>
              <button 
                onClick={() => setShowCancelConfirm(true)}
                className="flex-1 py-3 bg-white text-red-600 font-bold rounded-xl border border-red-200 hover:bg-red-50 transition"
              >
                Cancel Booking
              </button>
            </div>
          )}

          {/* Cancellation Confirmation UI */}
          {showCancelConfirm && (
            <div className="p-6 bg-red-50 border-t border-red-100 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-start gap-3 mb-6">
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-lg font-bold text-red-900">Cancel Appointment?</h4>
                  <p className="text-red-700 text-sm mt-1">Are you sure you want to cancel your appointment on {new Date(apt.date).toLocaleDateString()} at {apt.time}? This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleCancel}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl shadow-md hover:bg-red-700 disabled:opacity-50 transition"
                >
                  {actionLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Yes, Cancel Appointment'}
                </button>
                <button 
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-white text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Keep Appointment
                </button>
              </div>
            </div>
          )}

          {/* Reschedule UI */}
          {showReschedule && (
            <div className="p-6 bg-indigo-50 border-t border-indigo-100 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-lg font-bold text-slate-900">Reschedule Appointment</h4>
                <button onClick={() => { setShowReschedule(false); setSelectedSlot(null); }} className="text-sm font-bold text-slate-500 hover:text-slate-900">Cancel</button>
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-2 -mx-2 px-2">
                {dateOptions.map(opt => (
                  <button
                    key={opt.dateString}
                    onClick={() => { setSelectedDate(opt.dateString); setSelectedSlot(null); }}
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
                  <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-500">No availability on this day</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
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

              {selectedSlot && (
                <div className="p-4 bg-white rounded-2xl border border-slate-200 mb-6 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">New Appointment</p>
                    <p className="font-bold text-slate-900">{new Date(selectedDate).toLocaleDateString()} at {selectedSlot}</p>
                  </div>
                  <Clock className="w-5 h-5 text-slate-300" />
                </div>
              )}

              <button 
                onClick={handleReschedule}
                disabled={!selectedSlot || actionLoading}
                className={`w-full py-3.5 font-bold rounded-xl shadow-md transition flex justify-center items-center gap-2 ${selectedSlot && !actionLoading ? 'bg-primary text-white hover:opacity-90' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Reschedule'}
              </button>
            </div>
          )}

          {/* Review Section */}
          {apt.status === 'completed' && (
            <div className="mt-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Rate Your Visit</h3>
              {apt.isReviewed ? (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                  <p className="font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> You have already reviewed this booking.</p>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setActionLoading(true);
                  const formData = new FormData(e.target);
                  const rating = parseInt(formData.get('rating'));
                  const comment = formData.get('comment');
                  
                  try {
                    await api.post('/reviews', { appointmentId: id, rating, comment });
                    alert('Review submitted successfully!');
                    setApt({...apt, isReviewed: true});
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to submit review');
                  } finally {
                    setActionLoading(false);
                  }
                }}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <label key={star} className="cursor-pointer">
                          <input type="radio" name="rating" value={star} className="peer sr-only" required />
                          <div className="text-3xl text-slate-300 peer-checked:text-yellow-400 hover:scale-110 transition">★</div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Comment (Optional)</label>
                    <textarea 
                      name="comment" 
                      rows="3" 
                      maxLength="500"
                      placeholder="How was your experience?" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 transition resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default BookingDetails;
