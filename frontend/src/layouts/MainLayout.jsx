import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="mt-auto border-t border-slate-200/70 bg-white/70 py-6 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 dark:text-slate-400">
          &copy; {new Date().getFullYear()} SalonBooking. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
