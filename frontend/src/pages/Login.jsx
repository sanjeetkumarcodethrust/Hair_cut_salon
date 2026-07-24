import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldCheck, Smartphone } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const submitHandler = (e) => {
    e.preventDefault();
    setOtpSent(true);
  };

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white">Sign in securely</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use your email or verify with a one-time passcode.</p>
        </div>
        <form className="space-y-4" onSubmit={submitHandler}>
          <div className="space-y-3">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <Mail className="h-4 w-4" />
              <input
                name="email"
                type="email"
                required
                className="w-full border-none bg-transparent outline-none"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <Smartphone className="h-4 w-4" />
              <input
                name="password"
                type="password"
                required
                className="w-full border-none bg-transparent outline-none"
                placeholder="Password or OTP"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
          </div>

          <button type="submit" className="flex w-full justify-center rounded-full bg-gradient-to-r from-primary to-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90">
            {otpSent ? 'OTP sent — continue' : 'Sign in'}
          </button>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-500/10 dark:text-emerald-300">
            Email verification, OTP login, and secure delivery are ready for the next backend integration.
          </div>

          <div className="text-center text-sm">
            <span className="text-slate-600 dark:text-slate-300">Don’t have an account? </span>
            <Link to="/register" className="font-semibold text-primary">Register here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
