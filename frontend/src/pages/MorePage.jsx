import React from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/PageShell';
import { Settings, History, HelpCircle, LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const MorePage = () => {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  const panelClasses = 'rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 dark:bg-slate-900 dark:border-slate-800';

  return (
    <PageShell eyebrow="More options" title="More" description="Explore additional settings and features.">
      <div className={panelClasses}>
        <div className="space-y-3">
          <Link to="/settings" className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-3">
              <Settings className="w-5 h-5 text-slate-500" /> Settings
            </span>
            <span className="text-slate-400">→</span>
          </Link>
          <Link to="/bookings" className="flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-3">
              <History className="w-5 h-5 text-slate-500" /> Booking History
            </span>
            <span className="text-slate-400">→</span>
          </Link>
          <button className="w-full flex items-center justify-between rounded-2xl bg-slate-50 dark:bg-slate-800/60 px-4 py-4 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <span className="text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-slate-500" /> Help & Support
            </span>
            <span className="text-slate-400">→</span>
          </button>
          
          <button onClick={handleLogout} className="w-full mt-4 flex items-center justify-between rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-4 py-4 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition">
            <span className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-3">
              <LogOut className="w-5 h-5" /> Sign Out
            </span>
          </button>
        </div>
      </div>
    </PageShell>
  );
};

export default MorePage;
