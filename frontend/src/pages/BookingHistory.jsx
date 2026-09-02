import React, { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Calendar, Clock, Scissors, MapPin, Loader2, ChevronRight, XCircle } from 'lucide-react';
import api from '../services/api';

const BookingHistory = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (!userInfo) return;
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/appointments/my');
        setAppointments(res.data.data || []);
      } catch (err) {
        setError('Failed to load booking history');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [userInfo]);

  if (!userInfo) return <Navigate to="/login" replace />;

  const now = new Date();
  
  const upcoming = appointments.filter(a => 
    ['pending', 'confirmed'].includes(a.status) && new Date(a.date) >= new Date(now.setHours(0,0,0,0))
  );
  
  const completed = appointments.filter(a => a.status === 'completed' || (['pending', 'confirmed'].includes(a.status) && new Date(a.date) < new Date(now.setHours(0,0,0,0))));
  
  const cancelled = appointments.filter(a => a.status === 'cancelled');

  const getFilteredAppointments = () => {
    if (activeTab === 'upcoming') return upcoming;
    if (activeTab === 'completed') return completed;
    if (activeTab === 'cancelled') return cancelled;
    return appointments;
  };

  const filtered = getFilteredAppointments();

  return (
    <div className="min-h-[80vh] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
            <p className="text-slate-500 mt-2">Manage your upcoming appointments and history.</p>
          </div>
        </div>

        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-8 overflow-x-auto">
          {['upcoming', 'completed', 'cancelled', 'all'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 text-sm font-semibold rounded-lg capitalize transition-colors whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No {activeTab} bookings</h3>
            <p className="text-slate-500 mt-1">Your {activeTab} appointments will appear here.</p>
            {activeTab === 'upcoming' && (
               <Link to="/salons" className="inline-block mt-6 px-6 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:opacity-90">Find a Barber</Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(apt => (
              <Link 
                to={`/bookings/${apt._id}`} 
                key={apt._id}
                className="block bg-white border border-slate-200 rounded-3xl p-5 hover:border-slate-300 transition shadow-sm hover:shadow-md group"
              >
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="w-20 h-20 shrink-0 bg-slate-100 rounded-2xl overflow-hidden">
                    <img src={apt.salon?.images?.[0] || 'https://via.placeholder.com/150'} alt="Shop" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-lg text-slate-900 group-hover:text-primary transition">{apt.salon?.name || 'Unknown Salon'}</h4>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" /> {apt.salon?.city || 'Unknown Location'}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${apt.status === 'cancelled' ? 'bg-red-50 text-red-600' : apt.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-primary'}`}>
                        {apt.status}
                      </span>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Calendar className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Date</p>
                          <p className="text-sm font-bold text-slate-900">{new Date(apt.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Clock className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Time</p>
                          <p className="text-sm font-bold text-slate-900">{apt.time}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Scissors className="w-4 h-4" /></div>
                        <div>
                          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Service</p>
                          <p className="text-sm font-bold text-slate-900">{apt.service?.name || apt.snapshots?.serviceName || 'Service'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center pl-2">
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
