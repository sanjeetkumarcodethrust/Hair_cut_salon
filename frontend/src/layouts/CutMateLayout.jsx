import React, { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import LocationSelector from '../components/LocationSelector';
import api from '../services/api';
import {
  Scissors,
  Home,
  Compass,
  Calendar,
  Heart,
  Briefcase,
  MessageSquare,
  Wallet,
  User,
  MoreHorizontal,
  Search,
  Bell,
  MapPin,
  LogOut,
  X,
  Star,
  Loader2,
  Sparkles,
} from 'lucide-react';
import CutMateChatbot from '../components/CutMateChatbot';

const SidebarItem = ({ icon: Icon, label, href, active }) => (
  <Link
    to={href}
    className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition ${
      active
        ? 'bg-slate-800 text-white'
        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const CutMateLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const [chatWidgetOpen, setChatWidgetOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef(null);

  // Sync search input with URL search param on /salons
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q !== null && location.pathname === '/salons') {
      setSearchQuery(q);
    }
  }, [location.pathname, location.search]);

  // Click outside listener for search suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search suggestions query
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query || query.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get('/salons', {
          params: { search: query, limit: 5 }
        });
        setSuggestions(res.data?.data || []);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    if (!query) {
      navigate('/salons');
      return;
    }
    navigate(`/salons?search=${encodeURIComponent(query)}`);
  };

  useEffect(() => {
    if (!userInfo) return;
    const fetchUnread = async () => {
      try {
        const res = await api.get('/notifications');
        const count = (res.data.data || []).filter((n) => !n.readAt).length;
        setUnreadCount(count);
      } catch {
        // ignore errors silently
      }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 15000);
    return () => clearInterval(interval);
  }, [userInfo]);

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/salons' },
    { icon: Calendar, label: 'Appointments', href: '/bookings' },
    { icon: Heart, label: 'Favorites', href: '/extras' },
    { icon: Briefcase, label: 'Jobs', href: '/jobs' },
    { icon: MessageSquare, label: 'Messages', href: '/notifications' },
    { icon: Wallet, label: 'Wallet', href: '/settings' },
    { icon: User, label: 'Profile', href: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 hidden xl:flex overflow-y-auto custom-scrollbar">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 text-2xl font-bold mb-10">
          <Scissors className="w-8 h-8 text-amber-500" />
          <span>CutMate</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-grow">
          {navItems.map((item) => (
            <SidebarItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              href={item.href}
              active={location.pathname === item.href}
            />
          ))}
          <SidebarItem icon={MoreHorizontal} label="More" href="/more" />
        </nav>

        {/* Become a Barber Banner */}
        <Link
          to="/jobs"
          className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 p-4 relative overflow-hidden block group hover:from-indigo-800 hover:to-purple-800 transition"
        >
          <div className="relative z-10">
            <h4 className="text-sm font-semibold mb-1 text-white">Become a Barber</h4>
            <p className="text-xs text-indigo-200 mb-3">Join top salons & apply for job opportunities</p>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-amber-400 group-hover:underline">Explore Barber Vacancies →</span>
            </div>
          </div>
        </Link>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-4 sm:px-8 border-b border-white/5 z-50 bg-[#0a0a0a]/80 backdrop-blur-md relative">
          {/* Location */}
          <LocationSelector />

          {/* Desktop Search Bar */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim().length >= 2) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowSuggestions(false);
                }}
                placeholder="Search for salon, barber, service..."
                className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-10 text-sm focus:outline-none focus:border-amber-500/50 transition text-white placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-white/5">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 p-4 text-xs text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    Searching salons...
                  </div>
                ) : suggestions.length > 0 ? (
                  <>
                    <div className="py-1">
                      {suggestions.map((salon) => (
                        <button
                          key={salon._id}
                          type="button"
                          onClick={() => {
                            setShowSuggestions(false);
                            navigate(`/salons/${salon._id}`);
                          }}
                          className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/5 transition text-left group"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 font-bold text-xs">
                              ✂️
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-white truncate group-hover:text-amber-400 transition">
                                {salon.name}
                              </p>
                              <p className="text-xs text-slate-400 truncate">
                                {salon.city || salon.address || 'Salon'}
                              </p>
                            </div>
                          </div>
                          {salon.rating > 0 && (
                            <span className="flex items-center gap-1 text-xs text-amber-500 shrink-0 font-semibold ml-2">
                              <Star className="w-3 h-3 fill-current" /> {salon.rating}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="w-full text-center py-2.5 px-4 text-xs font-semibold text-amber-400 hover:bg-white/5 transition"
                    >
                      See all results for &quot;{searchQuery}&quot; →
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs text-slate-400">No matching salons found.</p>
                    <button
                      type="button"
                      onClick={handleSearchSubmit}
                      className="mt-2 text-xs font-semibold text-amber-400 hover:underline"
                    >
                      Search all salons for &quot;{searchQuery}&quot;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              className="md:hidden p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button className="text-slate-400 hover:text-white transition hidden sm:block">
              <Heart className="w-5 h-5" />
            </button>
            <Link to="/notifications" className="text-slate-400 hover:text-white transition relative block">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-[#0a0a0a]" />
              )}
            </Link>

            {userInfo ? (
              <div className="flex items-center gap-2 md:gap-3">
                <Link to="/profile" className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 p-1 sm:pr-3 hover:bg-white/10 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-xs text-slate-950">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <p className="text-xs font-semibold text-white">{userInfo.name || 'User'}</p>
                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                      {userInfo.role === 'owner' ? 'Salon Owner' : userInfo.role === 'barber' ? 'Barber' : 'Customer'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition hidden sm:block"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 rounded-full border border-white/10 text-sm font-medium hover:bg-white/5 transition whitespace-nowrap">
                Login
              </Link>
            )}
          </div>

          {/* Mobile Search Input Overlay */}
          {mobileSearchOpen && (
            <div className="md:hidden absolute top-full left-0 right-0 bg-[#0a0a0a] border-b border-white/10 p-3 z-50">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for salon, barber, service..."
                  className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-amber-500/50 text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setMobileSearchOpen(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pb-20 xl:pb-0">
          <Outlet />
        </div>
        
        {/* Mobile Bottom Navigation */}
        <nav className="xl:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/10 z-50 px-6 py-3 flex justify-between items-center shadow-lg">
          {[
            { icon: Home, label: 'Home', href: '/' },
            { icon: Compass, label: 'Explore', href: '/salons' },
            { icon: Calendar, label: 'Bookings', href: '/bookings' },
            { icon: User, label: 'Profile', href: '/profile' },
            { icon: MoreHorizontal, label: 'More', href: '/more' },
          ].map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link key={item.label} to={item.href} className={`flex flex-col items-center gap-1.5 transition-colors ${active ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}>
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Floating AI Chat Assistant Toggle & Modal */}
        {location.pathname !== '/extras' && (
          <div className="fixed bottom-20 xl:bottom-6 right-4 sm:right-6 z-40">
            {chatWidgetOpen ? (
              <div className="relative animate-in fade-in slide-in-from-bottom-5 duration-200">
                <CutMateChatbot embedded={false} onClose={() => setChatWidgetOpen(false)} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setChatWidgetOpen(true)}
                className="flex items-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 text-slate-950 font-bold text-xs sm:text-sm shadow-xl shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500 hover:scale-105 active:scale-95 transition-all group"
                title="CutMate AI Assistant (Ask to watch salons, view photos & prices)"
              >
                <div className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                </div>
                <span className="hidden sm:inline">Ask AI / Watch Salons</span>
                <span className="sm:hidden font-semibold">AI Assistant</span>
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CutMateLayout;
