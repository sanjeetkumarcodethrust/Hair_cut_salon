import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';
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
} from 'lucide-react';

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
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
  };

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Compass, label: 'Explore', href: '/salons' },
    { icon: Calendar, label: 'Appointments', href: '/customer-dashboard' },
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
          <SidebarItem icon={MoreHorizontal} label="More" href="#" />
        </nav>

        {/* Become a Barber Banner */}
        <div className="mt-10 rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 p-4 relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-sm font-semibold mb-1">Become a Barber</h4>
            <p className="text-xs text-indigo-200 mb-3">Join thousands of barbers</p>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-300 border border-indigo-900" />
                <div className="w-6 h-6 rounded-full bg-slate-400 border border-indigo-900" />
                <div className="w-6 h-6 rounded-full bg-slate-500 border border-indigo-900" />
              </div>
              <span className="text-xs font-semibold">+5K</span>
            </div>
          </div>
          <button className="absolute top-3 right-3 text-indigo-300 hover:text-white">✕</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 z-10 bg-[#0a0a0a]/80 backdrop-blur-md">
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>Mumbai, India</span>
            <span className="text-xs ml-1">▼</span>
          </div>

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search for salon, barber, service..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-amber-500/50 transition"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="text-slate-400 hover:text-white transition">
              <Heart className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-white transition relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-pink-500 rounded-full border border-[#0a0a0a]" />
            </button>

            {userInfo ? (
              <div className="flex items-center gap-3">
                <Link to="/profile" className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 p-1 pr-3 hover:bg-white/10 transition">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-xs text-slate-950">
                    {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold text-white">{userInfo.name || 'User'}</p>
                    <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
                      {userInfo.role === 'owner' ? 'Salon Owner' : userInfo.role === 'barber' ? 'Barber' : 'Customer'}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 rounded-full border border-rose-500/20 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="px-5 py-2 rounded-full border border-white/10 text-sm font-medium hover:bg-white/5 transition">
                Login / Signup
              </Link>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default CutMateLayout;
