import re

with open('frontend/src/pages/BookingDetails.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add handlePayment function
handle_payment_code = """
  const handlePayment = async () => {
    setActionLoading(true);
    try {
      const res = await api.post('/payments/create-checkout-session', {
        appointmentId: id
      });
      if (res.data.payment.url) {
        window.location.href = res.data.payment.url;
      } else {
        // It was already paid or mock mode returned a redirect
        alert("Payment processed");
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setActionLoading(false);
    }
  };

  const isCancellable = ['pending', 'confirmed'].includes(apt.status);
"""

content = content.replace("  const isCancellable = ['pending', 'confirmed'].includes(apt.status);", handle_payment_code)

# Add payment details block before Action Buttons
payment_ui = """
            <div className="pt-6 border-t border-slate-100 mt-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Payment Summary</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-500">Service Total</span>
                <span className="text-sm font-bold text-slate-900">₹{apt.price}</span>
              </div>
              {apt.advanceAmount > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-500">Advance Required</span>
                  <span className="text-sm font-bold text-slate-900">₹{apt.advanceAmount}</span>
                </div>
              )}
              {apt.remainingAmount > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm font-medium text-slate-500">Remaining (Pay at Shop)</span>
                  <span className="text-sm font-bold text-slate-900">₹{apt.remainingAmount}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div>
                  <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</span>
                  <span className={`text-sm font-bold uppercase ${apt.paymentStatus === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                    {apt.paymentStatus === 'paid' ? 'Paid' : 'Pending Payment'}
                  </span>
                </div>
                
                {apt.paymentStatus !== 'paid' && apt.status === 'pending' && (
                  <button
                    onClick={handlePayment}
                    disabled={actionLoading}
                    className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Pay Now'}
                  </button>
                )}
              </div>
            </div>
"""

content = content.replace("""
            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Price</span>
              <span className="text-2xl font-black text-slate-900">₹{apt.price}</span>
            </div>
""", payment_ui)

with open('frontend/src/pages/BookingDetails.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated BookingDetails.jsx for payment")
