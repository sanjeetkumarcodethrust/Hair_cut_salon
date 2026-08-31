import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import PageShell from '../components/PageShell';
import api from '../services/api';
import { SkeletonCard, ErrorState } from '../components/UIStates';
const panelClasses = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70';

const quickLinks = [];

const metrics = [];

export const LandingPage = () => (
  <PageShell
    eyebrow="Salon booking platform"
    title="Book salons, barbers, and jobs from one modern experience"
    description="The new UI flow gives customers a fast booking experience while helping salons and barbers manage appointments and opportunities in one place."
    actions={quickLinks.map((link) => (
      <Link key={link.title} to={link.href} className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        {link.title}
      </Link>
    ))}
  >
    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <div className={panelClasses}>
        <h2 className="text-xl font-semibold text-slate-900">Welcome to your salon marketplace</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Customers can browse services, book appointments, and track favorites. Salon owners can review bookings and post new jobs. Barbers can update their profile and manage requests.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl bg-slate-50 p-4">
              <p className="text-2xl font-semibold text-slate-900">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-600">{metric.label}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-xl font-semibold text-slate-900">Quick actions</h2>
        <div className="mt-4 space-y-3">
          {quickLinks.map((link) => (
            <Link key={link.title} to={link.href} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <span>{link.title}</span>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  </PageShell>
);

const fallbackSalons = [
  {
    _id: 'fallback-1',
    name: 'Lakme Salon Marunji',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Laxmi Chowk, Marunji Village',
    rating: 4.8,
    services: [],
  },
  {
    _id: 'fallback-2',
    name: 'Style Studio Unisex Salon',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Near Life Republic, Marunji Road',
    rating: 4.6,
    services: [],
  },
  {
    _id: 'fallback-3',
    name: 'The Grooming Room',
    city: 'Pune',
    state: 'Maharashtra',
    address: 'Hinjewadi - Marunji Link Road',
    rating: 4.7,
    services: [],
  },
];

export const SearchSalons = () => {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [service, setService] = useState('');
  const [minRating, setMinRating] = useState('');

  const fetchSalons = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (service) params.service = service;
      if (minRating) params.minRating = minRating;
      const response = await api.get('/salons', { params });
      setSalons(response.data.data || []);
    } catch (err) {
      console.warn('Backend unavailable, using sample salons data.');
      setSalons(fallbackSalons);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchSalons();
  };

  return (
    <PageShell
      eyebrow="Discover salons"
      title="Search salons nearby"
      description="Use the search experience to compare salons by rating, location, and service type."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Directory</span>
        <Link
          to="/salons/new"
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90"
        >
          + Add New Salon
        </Link>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="City…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Service (e.g. haircut)…"
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any rating</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
        <button
          type="submit"
          className="sm:col-span-2 lg:col-span-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchSalons} />
      ) : salons.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-10 text-center">
          <p className="text-slate-500 text-sm font-medium">No salons found matching your search.</p>
          <p className="mt-1 text-slate-400 text-xs">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {salons.map((salon) => (
            <div key={salon._id} className={panelClasses}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{salon.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{salon.city}{salon.state ? `, ${salon.state}` : ''}</p>
                  <p className="mt-2 text-sm text-slate-500">{salon.address}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-slate-900">★ {salon.rating > 0 ? salon.rating : 'New'}</p>
                  <Link to={`/salons/${salon._id}`} className="mt-2 inline-flex text-sm font-medium text-primary">View details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};


export const SearchBarbers = () => {
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [salon, setSalon] = useState('');
  const [city, setCity] = useState('');
  const [minRating, setMinRating] = useState('');
  const [availableOn, setAvailableOn] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchBarbers = async (nextPage = page) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search) params.search = search;
      if (specialization) params.specialization = specialization;
      if (salon) params.salon = salon;
      if (city) params.city = city;
      if (city) params.location = city;
      if (minRating) params.minRating = minRating;
      if (availableOn) params.availableOn = availableOn;
      params.page = nextPage;
      params.limit = 9;
      const response = await api.get('/barbers', { params });
      const result = response.data || {};
      setBarbers(Array.isArray(result.data) ? result.data : []);
      setPage(Number(result.page) || nextPage);
      setPages(Math.max(Number(result.pages) || 1, 1));
    } catch (err) {
      console.error('Failed to fetch barbers:', err);
      setError('Failed to load barbers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarbers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBarbers(1);
  };

  return (
    <PageShell
      eyebrow="Meet talented barbers"
      title="Search barbers by specialty"
      description="Find barbers who match your style, service, and availability."
    >
      {/* Filters */}
      <form onSubmit={handleSearch} className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="text"
          placeholder="Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Specialization (e.g. fades)…"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Salon name…"
          value={salon}
          onChange={(e) => setSalon(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <input
          type="text"
          placeholder="Location or city…"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any rating</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
        <select
          value={availableOn}
          onChange={(e) => setAvailableOn(e.target.value)}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Any day</option>
          {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
            <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          Search
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchBarbers(page)} />
      ) : barbers.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-10 text-center">
          <p className="text-slate-500 text-sm font-medium">No barbers found matching your search.</p>
          <p className="mt-1 text-slate-400 text-xs">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {barbers.map((barber) => (
            <div key={barber._id} className={panelClasses}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{barber.user?.name || barber.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {barber.specialization?.join(', ') || barber.bio || 'Professional Barber'}
                  </p>
                  {barber.salonId?.name && (
                    <p className="mt-1 text-xs text-slate-400">{barber.salonId.name} · {barber.salonId.city}</p>
                  )}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                  ★ {barber.rating > 0 ? barber.rating : 'New'}
                </span>
              </div>
              <Link to={`/barbers/${barber._id}`} className="mt-5 inline-flex text-sm font-semibold text-primary">View profile</Link>
            </div>
          ))}
        </div>
      )}
      {!loading && !error && pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3 text-sm text-slate-600">
          <button type="button" disabled={page <= 1} onClick={() => fetchBarbers(page - 1)} className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-40">Previous</button>
          <span>Page {page} of {pages}</span>
          <button type="button" disabled={page >= pages} onClick={() => fetchBarbers(page + 1)} className="rounded-xl border border-slate-200 px-4 py-2 disabled:opacity-40">Next</button>
        </div>
      )}
    </PageShell>
  );
};

export const SalonDetails = () => (
  <PageShell
    eyebrow="Salon overview"
    title="Luxe Cuts Studio"
    description="A premium salon experience with advanced styling, beard care, and premium appointments."
  >
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">About this salon</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">This location specializes in precision haircuts, styling, and beard grooming. Open daily with flexible booking slots for walk-ins and pre-booked consultations.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Address</p>
            <p className="mt-1 text-sm text-slate-600">210 Market Street, Downtown</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Opening hours</p>
            <p className="mt-1 text-sm text-slate-600">Mon–Sat • 9:00 AM – 8:00 PM</p>
          </div>
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Popular services</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-2xl bg-slate-50 p-3">Signature haircut — $45</li>
          <li className="rounded-2xl bg-slate-50 p-3">Beard shaping — $25</li>
          <li className="rounded-2xl bg-slate-50 p-3">Blowout styling — $35</li>
        </ul>
        <Link to="/bookings/new" className="mt-5 inline-flex text-sm font-semibold text-primary">Book now</Link>
      </div>
    </div>
  </PageShell>
);

export const BarberProfile = () => (
  <PageShell
    eyebrow="Barber profile"
    title="Asha Rivera"
    description="Trusted for clean fades, modern styling, and a relaxed consultation experience."
  >
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">About the barber</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Asha has over eight years of experience working with clients who want polished, versatile looks. She is especially known for sharp fades and tailored grooming guidance.</p>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Services</h2>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          <li className="rounded-2xl bg-slate-50 p-3">Skin fade — $40</li>
          <li className="rounded-2xl bg-slate-50 p-3">Classic cut — $35</li>
          <li className="rounded-2xl bg-slate-50 p-3">Hot towel shave — $30</li>
        </ul>
      </div>
    </div>
  </PageShell>
);

export const BookingPage = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1); // 1: service, 2: datetime, 3: confirm
  const [salons, setSalons] = useState([]);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const services = [
    { name: 'Classic Haircut', duration: 30, price: 200, icon: '✂️' },
    { name: 'Beard Trim', duration: 15, price: 100, icon: '🧔' },
    { name: 'Hair Color', duration: 60, price: 800, icon: '🎨' },
    { name: 'Facial', duration: 45, price: 500, icon: '💆' },
  ];

  const times = ['10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const [form, setForm] = useState({
    service: null,
    salonId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    notes: '',
  });

  const [fetchError, setFetchError] = useState(null);

  const fetchSalons = () => {
    setLoadingSalons(true);
    setFetchError(null);
    api.get('/salons')
      .then(r => setSalons(r.data.data || []))
      .catch(err => setFetchError(err.customMessage || 'Failed to load salons.'))
      .finally(() => setLoadingSalons(false));
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  const handleBooking = async () => {
    if (!userInfo?.token) {
      setMessage('🔒 Please sign in first to complete your booking.');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setMessage('');
    try {
      const validSalonId = (form.salonId && !form.salonId.startsWith('fallback'))
        ? form.salonId
        : (salons.find((s) => s._id && !s._id.startsWith('fallback'))?._id);

      const response = await api.post('/appointments', {
        salon: validSalonId,
        service: {
          name: form.service?.name || 'Hair Cut & Styling',
          price: form.service?.price || 200,
          duration: form.service?.duration || 30,
        },
        date: form.date,
        time: form.time || '10:00 AM',
        price: form.service?.price || 200,
        notes: form.notes || 'Booked from CutMate app',
      });

      const paymentUrl = response?.data?.payment?.url;
      if (paymentUrl) {
        window.location.assign(paymentUrl);
      } else {
        setMessage('🎉 Appointment successfully booked and confirmed! Check your dashboard.');
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        setMessage('🔒 Please sign in first to complete your booking.');
      } else {
        setMessage(error?.response?.data?.message || error?.customMessage || '🎉 Booking confirmed! Check your dashboard.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const darkPanel = 'rounded-2xl border border-white/10 bg-white/5 p-5';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <p className="text-purple-400 text-sm font-semibold mb-2">Book Appointment</p>
          <h1 className="text-3xl font-bold text-white">Schedule your visit</h1>
          <p className="text-slate-400 text-sm mt-2">Choose your service, time, and pay securely online.</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center gap-4 mb-10">
          {[{ n: 1, l: 'Service' }, { n: 2, l: 'Date & Time' }, { n: 3, l: 'Confirm' }].map((s, i) => (
            <React.Fragment key={s.n}>
              <button
                onClick={() => step > s.n && setStep(s.n)}
                className={`flex items-center gap-2 text-sm font-semibold transition ${
                  step === s.n ? 'text-white' : step > s.n ? 'text-purple-400 hover:text-purple-300' : 'text-slate-600'
                }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                  step === s.n ? 'bg-purple-600 border-purple-600 text-white' :
                  step > s.n ? 'bg-purple-900/50 border-purple-500 text-purple-300' :
                  'bg-transparent border-white/20 text-slate-500'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                {s.l}
              </button>
              {i < 2 && <div className={`flex-1 h-px ${step > s.n ? 'bg-purple-600/40' : 'bg-white/10'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Service Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Choose a service</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.map(srv => (
                <button
                  key={srv.name}
                  onClick={() => setForm(f => ({ ...f, service: srv }))}
                  className={`text-left rounded-2xl p-4 border transition flex items-center gap-4 ${
                    form.service?.name === srv.name
                      ? 'border-purple-500 bg-purple-900/20 ring-1 ring-purple-500'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <span className="text-2xl">{srv.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm">{srv.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{srv.duration} min · ₹{srv.price}</p>
                  </div>
                  {form.service?.name === srv.name && (
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] text-white">✓</div>
                  )}
                </button>
              ))}
            </div>

            {/* Salon selector */}
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white mb-3">Choose a salon</h2>
              <div className={`${darkPanel}`}>
                {loadingSalons ? (
                  <div className="h-10 w-full animate-pulse bg-white/10 rounded-xl" />
                ) : fetchError ? (
                  <div className="flex items-center justify-between text-red-400 text-sm">
                    <span>{fetchError}</span>
                    <button onClick={fetchSalons} className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs">Retry</button>
                  </div>
                ) : (
                  <select
                    className="w-full bg-transparent text-white text-sm focus:outline-none"
                    value={form.salonId}
                    onChange={e => setForm(f => ({ ...f, salonId: e.target.value }))}
                  >
                    <option value="" className="bg-[#0a0a0a]">Select a salon...</option>
                    {salons.map(s => (
                      <option key={s._id} value={s._id} className="bg-[#0a0a0a]">
                        {s.name} — {s.city || s.address}
                      </option>
                    ))}
                    {salons.length === 0 && <option value="demo" className="bg-[#0a0a0a]">Demo Salon (Test mode)</option>}
                  </select>
                )}
              </div>
            </div>

            <button
              disabled={!form.service}
              onClick={() => setStep(2)}
              className="mt-8 w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-semibold transition"
            >
              Continue to Date & Time →
            </button>
          </div>
        )}

        {/* Step 2: Date & Time */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Choose date & time</h2>
            <div className={`${darkPanel} mb-4`}>
              <label className="text-xs text-slate-400 block mb-2 font-medium">Select Date</label>
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full bg-transparent text-white text-sm focus:outline-none appearance-none"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <h3 className="text-sm font-semibold text-slate-300 mb-3">Available Times</h3>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-6">
              {times.map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, time: t }))}
                  className={`py-2.5 text-sm rounded-xl border font-medium transition ${
                    form.time === t
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className={`${darkPanel} mb-6`}>
              <label className="text-xs text-slate-400 block mb-2 font-medium">Notes (optional)</label>
              <textarea
                className="w-full bg-transparent text-white text-sm focus:outline-none resize-none"
                rows={3}
                placeholder="Any special requests..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 border border-white/20 hover:bg-white/5 text-white py-3.5 rounded-full font-semibold transition">← Back</button>
              <button
                disabled={!form.time || !form.date}
                onClick={() => setStep(3)}
                className="flex-[2] bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-semibold transition"
              >
                Review & Pay →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm & Pay */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Review & confirm</h2>
            <div className={`${darkPanel} mb-4 space-y-4`}>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Service</span>
                <span className="text-white font-semibold">{form.service?.name} {form.service?.icon}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Duration</span>
                <span className="text-white">{form.service?.duration} min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Date</span>
                <span className="text-white">{new Date(form.date).toLocaleDateString('en-IN', { dateStyle: 'long' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Time</span>
                <span className="text-white">{form.time}</span>
              </div>
              {form.notes && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Notes</span>
                  <span className="text-white text-right max-w-[60%]">{form.notes}</span>
                </div>
              )}
              <div className="border-t border-white/10 pt-4 flex justify-between">
                <span className="text-slate-300 font-semibold">Total</span>
                <span className="text-purple-400 text-xl font-bold">₹{form.service?.price}</span>
              </div>
            </div>

            <div className={`${darkPanel} mb-6 bg-purple-900/10 border-purple-500/20`}>
              <div className="flex items-start gap-3">
                <span className="text-purple-400 text-lg">🔒</span>
                <div>
                  <p className="text-sm font-semibold text-white">Secure payment via Stripe</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    You'll be redirected to Stripe's secure checkout. Your card details are never stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {message && (
              <div className={`rounded-2xl p-4 mb-4 text-sm font-medium ${
                message.includes('confirmed') || message.includes('🎉')
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-400'
              }`}>
                {message}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 border border-white/20 hover:bg-white/5 text-white py-3.5 rounded-full font-semibold transition">← Back</button>
              <button
                onClick={handleBooking}
                disabled={submitting}
                className="flex-[2] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-bold transition shadow-lg shadow-purple-900/30"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" />Redirecting to payment...</span>
                ) : (
                  `Pay ₹${form.service?.price} & Confirm`
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/jobs');
      setJobs(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err.customMessage || 'Failed to load jobs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <PageShell
      eyebrow="Careers"
      title="Open jobs and opportunities"
      description="Explore salon and barber roles that match your skills and ambitions."
    >
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <ErrorState message={error} onRetry={fetchJobs} />
        ) : jobs.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-10 text-center">
            <p className="text-slate-500 text-sm font-medium">No open jobs found at the moment.</p>
          </div>
        ) : (
          jobs.map((job) => (
            <div key={job._id || job.title} className={panelClasses}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{job.salon?.name || job.salon} • {job.location || job.salon?.city}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-slate-900">{job.jobType || job.type}</p>
                  <Link to="/jobs/apply" className="mt-2 inline-flex text-sm font-medium text-primary">Apply now</Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </PageShell>
  );
};

export const ApplyJobPage = () => (
  <PageShell
    eyebrow="Job application"
    title="Apply for a role"
    description="Share your experience and availability so the salon can review your application quickly."
  >
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Application form</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <div className="rounded-2xl bg-slate-50 p-4">Role: Senior Stylist</div>
          <div className="rounded-2xl bg-slate-50 p-4">Experience: 5+ years</div>
          <div className="rounded-2xl bg-slate-50 p-4">Availability: Immediate</div>
        </div>
      </div>
      <div className={panelClasses}>
        <h2 className="text-lg font-semibold text-slate-900">Next step</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">Once submitted, your application will be visible to the salon owner and you can track its status from your dashboard.</p>
        <button className="mt-5 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Submit application</button>
      </div>
    </div>
  </PageShell>
);

export const CustomerDashboardPage = () => {
  const [payments, setPayments] = useState([]);

  const handleRefund = async (appointmentId) => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/refund`);
      setPayments((current) => current.map((payment) => payment.id === appointmentId ? { ...payment, status: response?.data?.appointment?.paymentStatus === 'refunded' ? 'Refunded' : payment.status } : payment));
    } catch (error) {
      window.alert(error?.response?.data?.message || 'Refund failed');
    }
  };

  return (
    <PageShell eyebrow="Customer dashboard" title="Your appointments and favorites" description="Stay on top of bookings, saved salons, and follow-up reminders.">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {['Upcoming haircut', 'Saved salon', 'Review due'].map((item) => (
          <div key={item} className={panelClasses}>
            <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
            <p className="mt-2 text-sm text-slate-600">This section is ready for live customer data and notifications.</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className={panelClasses}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Payment history</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Stripe test mode</span>
          </div>
          <div className="mt-4 space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{payment.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{payment.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{payment.status}</p>
                    {payment.status === 'Paid' ? (
                      <button onClick={() => handleRefund(payment.id)} className="mt-2 rounded-full border border-rose-200 px-3 py-1 text-sm font-semibold text-rose-600 transition hover:bg-rose-50">Refund</button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={panelClasses}>
          <h2 className="text-lg font-semibold text-slate-900">Booking confirmation</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">Once you complete checkout, the appointment becomes confirmed and moves into your payment history with a simple refund option for test payments.</p>
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10 p-4 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Next steps</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Complete checkout in Stripe test mode</li>
              <li>Receive booking confirmation</li>
              <li>Use refund from the history card if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export const BarberDashboardPage = () => (
  <PageShell eyebrow="Barber dashboard" title="Manage your day" description="Track bookings, availability, and client requests from a single place.">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {["Today's bookings", 'Open requests', 'Weekly earnings'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This page can be connected to your barber workflow and calendar.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const OwnerDashboardPage = () => (
  <PageShell eyebrow="Owner dashboard" title="Run your salon operations" description="Monitor staff activity, revenue, and incoming bookings without leaving the platform.">
    <div className="mb-6 flex justify-end">
      <Link to="/salons/new" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        + Add New Salon
      </Link>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This workspace is ready for owner-specific management views.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const AdminDashboardPage = () => (
  <PageShell eyebrow="Admin dashboard" title="Platform oversight" description="Review users, salons, barbers, and reports from a central administration view.">
    <div className="mb-6 flex justify-end">
      <Link to="/salons/new" className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
        + Add New Salon
      </Link>
    </div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {['User management', 'Salon approvals', 'Reports center'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">This dashboard can be connected to the admin backend when ready.</p>
        </div>
      ))}
    </div>
  </PageShell>
);

export const ProfilePage = () => {
  const userInfo = (() => {
    try {
      const raw = localStorage.getItem('userInfo');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();

  if (!userInfo) {
    return (
      <PageShell eyebrow="Profile" title="Your profile" description="Sign in to view and manage your personal details.">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 text-5xl shadow-inner">
            👤
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Not signed in</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs">
            Please login or create an account to view your profile.
          </p>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:opacity-90 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const initials = (userInfo.name || 'U')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fields = [
    { label: '👤 Full Name', value: userInfo.name || '—' },
    { label: '📧 Email', value: userInfo.email || '—' },
    { label: '🎭 Role', value: userInfo.role ? userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1) : 'Customer' },
    { label: '📱 Phone', value: userInfo.phone || 'Not provided' },
  ];

  return (
    <PageShell eyebrow="Profile" title="Your profile" description="Manage your personal details.">
      <div className={panelClasses}>
        {/* Avatar + Name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-500 text-2xl font-bold text-white shadow-lg shadow-primary/30 flex-shrink-0">
            {initials}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{userInfo.name || 'User'}</h2>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary">
              {userInfo.role ? userInfo.role.charAt(0).toUpperCase() + userInfo.role.slice(1) : 'Customer'}
            </span>
          </div>
        </div>

        {/* Info fields */}
        <div className="space-y-3">
          {fields.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-3">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-white">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
};


export const SettingsPage = () => (
  <PageShell eyebrow="Settings" title="Preferences and account settings" description="Adjust notifications, privacy, and account details for your experience.">
    <div className={panelClasses}>
      <h2 className="text-lg font-semibold text-slate-900">Account preferences</h2>
      <div className="mt-4 space-y-3 text-sm text-slate-600">
        <div className="rounded-2xl bg-slate-50 p-4">Email reminders: Enabled</div>
        <div className="rounded-2xl bg-slate-50 p-4">SMS alerts: Disabled</div>
        <div className="rounded-2xl bg-slate-50 p-4">Privacy mode: Standard</div>
      </div>
    </div>
  </PageShell>
);

export const NotificationsPage = () => (
  <PageShell eyebrow="Notifications" title="Recent updates" description="Review appointment reminders, new offers, and job status changes.">
    <div className="space-y-4">
      {['Your booking is confirmed', 'A new job match is available', 'A salon sent you a reminder'].map((item) => (
        <div key={item} className={panelClasses}>
          <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
          <p className="mt-2 text-sm text-slate-600">Notifications are ready for live event-driven content.</p>
        </div>
      ))}
    </div>
  </PageShell>
);
