import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, PlusCircle, MapPin, Phone, Mail, Building2, AlignLeft } from 'lucide-react';
import api from '../services/api';

const AddSalon = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    setError('');

    try {
      const response = await api.post('/salons', formData);
      setMessage('🎉 Salon registered successfully!');
      setTimeout(() => {
        navigate(`/salons/${response.data._id}`);
      }, 2000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to register salon. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClasses = "w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-10 py-3.5 text-white text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-500";
  const labelClasses = "text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 block";
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl relative">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-purple-600/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 bg-white/5 border border-white/10 rounded-[2rem] p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-purple-900/10">
          
          <div className="text-center mb-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 mb-6 shadow-lg shadow-purple-500/30">
              <PlusCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Register Your Salon</h1>
            <p className="text-slate-400 text-sm">Join the network and start accepting appointments.</p>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center text-sm font-medium text-emerald-400">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-center text-sm font-medium text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="col-span-1 md:col-span-2">
                <label className={labelClasses}>Salon Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Luxe Cuts Studio"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className={labelClasses}>Description</label>
                <div className="relative">
                  <AlignLeft className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about your services, specialties, and vibe..."
                    rows={3}
                    className={`${inputClasses} pl-10 resize-none`}
                    required
                  />
                </div>
              </div>

              <div className="col-span-1 md:col-span-2">
                <label className={labelClasses}>Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 210 Market Street, Downtown"
                    className={inputClasses}
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-500 mt-2">City and State default to Pune, Maharashtra for this initial release.</p>
              </div>

              <div>
                <label className={labelClasses}>Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +91 98765 43210"
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@yoursalon.com"
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-8 w-full rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-purple-900/30 transition hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register Salon'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSalon;
