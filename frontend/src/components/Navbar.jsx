import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { MoonStar, SunMedium } from 'lucide-react';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('salon-theme');
    const initialTheme = storedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    window.localStorage.setItem('salon-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 text-sm font-semibold text-white shadow-lg shadow-primary/25">
            SB
          </div>
          <div>
            <p className="text-sm font-semibold tracking-[0.22em] text-slate-500 dark:text-slate-400">SALONBOOK</p>
            <p className="text-base font-semibold text-slate-900 dark:text-white">Premium Booking</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/landing" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              Landing
            </Link>
            <Link to="/salons" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              Salons
            </Link>
            <Link to="/barbers" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              Barbers
            </Link>
            <Link to="/jobs" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              Jobs
            </Link>
            <Link to="/extras" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
              Extras
            </Link>
          </div>

          {userInfo ? (
            <div className="flex items-center gap-2.5">
              <Link to="/dashboard" className="hidden lg:inline-flex rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
                Dashboard
              </Link>
              {/* Logged in User Identity Card */}
              <Link to="/profile" className="flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 p-1 pr-3 shadow-sm transition hover:bg-primary/10 dark:border-primary/30 dark:bg-primary/15">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-xs font-bold text-white shadow-md shadow-primary/25">
                  {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{userInfo.name || 'User'}</span>
                  <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-primary">
                    {userInfo.role === 'owner' ? 'Salon Owner' : userInfo.role === 'barber' ? 'Barber' : 'Customer'}
                  </span>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                title="Sign out"
                className="rounded-full bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                Login
              </Link>
              <Link to="/register" className="rounded-full bg-gradient-to-r from-primary to-violet-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:opacity-90">
                Register
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200"
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
