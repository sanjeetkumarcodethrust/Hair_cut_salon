import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ShieldCheck, Lock, UserCheck } from 'lucide-react';
import api from '../services/api';
import { setCredentials } from '../features/auth/authSlice';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Customer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedRole = role === 'SalonOwner' ? 'owner' : role.toLowerCase();
      const { data } = await api.post('/auth/register', {
        name,
        email,
        password,
        role: normalizedRole,
      });

      dispatch(setCredentials(data));
      navigate('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6 rounded-[2rem] border border-white/70 bg-white/70 p-8 shadow-[0_30px_70px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-5 text-3xl font-semibold text-slate-900 dark:text-white">Create your account</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Join the salon community and verify your account in one smooth step.</p>
        </div>
        <form className="space-y-4" onSubmit={submitHandler}>
          <div className="space-y-3">
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <User className="h-4 w-4" />
              <input name="name" type="text" required className="w-full border-none bg-transparent outline-none" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <Mail className="h-4 w-4" />
              <input name="email" type="email" required className="w-full border-none bg-transparent outline-none" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <Lock className="h-4 w-4 shrink-0 text-slate-400" />
              <input name="password" type="password" required className="w-full border-none bg-transparent outline-none" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </label>
            <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              <UserCheck className="h-4 w-4 shrink-0 text-slate-400" />
              <select name="role" value={role} onChange={(e) => setRole(e.target.value)} className="w-full cursor-pointer border-none bg-transparent outline-none dark:bg-slate-900 dark:text-slate-200">
                <option value="Customer">Customer</option>
                <option value="Barber">Barber</option>
                <option value="SalonOwner">Salon Owner</option>
              </select>
            </label>
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-500/10 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="flex w-full justify-center rounded-full bg-gradient-to-r from-primary to-violet-500 px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70">
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <div className="text-center text-sm">
            <span className="text-slate-600 dark:text-slate-300">Already have an account? </span>
            <Link to="/login" className="font-semibold text-primary">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
