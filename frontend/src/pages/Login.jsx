import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck, Smartphone, UserCheck } from 'lucide-react';
import api from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

const demoAccounts = [
  { label: 'Customer Demo', email: 'customer@demo.com', password: 'password123', name: 'Demo Customer', role: 'customer' },
  { label: 'Owner Demo', email: 'owner@marunji.com', password: 'password123', name: 'Marunji Owner', role: 'owner' },
  { label: 'Barber Demo', email: 'barber@demo.com', password: 'password123', name: 'Demo Barber', role: 'barber' },
];

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (loginEmail, loginPassword, demoMeta = null) => {
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email: loginEmail, password: loginPassword });
      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (err) {
      if (err?.response?.status === 401) {
        if (demoMeta) {
          try {
            const regRes = await api.post('/auth/register', {
              name: demoMeta.name,
              email: demoMeta.email,
              password: demoMeta.password,
              role: demoMeta.role,
            });
            dispatch(setCredentials(regRes.data));
            navigate('/dashboard');
            return;
          } catch (regErr) {
            setError(regErr?.response?.data?.message || 'Unable to register demo account.');
            return;
          }
        }
        setError('Invalid email or password. If you do not have an account yet, please click Register below.');
      } else {
        setError(err?.response?.data?.message || err?.customMessage || 'Unable to sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  const handleDemoLogin = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    handleLogin(account.email, account.password, account);
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

        {/* Demo Quick Login Options */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5"><UserCheck className="h-3.5 w-3.5 text-primary" /> Quick Demo Login</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.label}
                type="button"
                onClick={() => handleDemoLogin(acc)}
                className="rounded-xl border border-primary/20 bg-primary/10 px-2 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white dark:border-primary/30 dark:bg-primary/20"
              >
                {acc.label}
              </button>
            ))}
          </div>
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

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="flex w-full justify-center rounded-full bg-gradient-to-r from-primary to-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

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
