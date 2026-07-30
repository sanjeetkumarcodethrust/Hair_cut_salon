import { useSearchParams, Link } from 'react-router-dom';
import { XCircle, RefreshCw, Home } from 'lucide-react';

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] text-white px-6">
      <div className="w-full max-w-md rounded-3xl bg-white/5 border border-white/10 p-10 text-center relative overflow-hidden">
        {/* Red glow */}
        <div className="absolute inset-0 bg-red-600/5 blur-3xl rounded-full scale-150 pointer-events-none" />

        <div className="relative z-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 border border-red-500/30">
            <XCircle className="h-10 w-10 text-red-400" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
          <p className="text-slate-400 text-sm mb-3">
            Your booking was not completed. No charge has been made.
          </p>
          <p className="text-slate-500 text-xs mb-8">
            If this was a mistake, you can try booking again below. Your slot may still be available.
          </p>

          <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-4 mb-8 text-left">
            <p className="text-xs font-semibold text-amber-400 mb-1">What happened?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              You cancelled or closed the payment window before completing checkout. Your appointment has not been confirmed.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/bookings/new"
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 border border-white/20 hover:bg-white/5 text-white px-6 py-3 rounded-full font-semibold transition"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-600">Need help? Contact our support team anytime.</p>
    </div>
  );
};

export default PaymentCancel;
