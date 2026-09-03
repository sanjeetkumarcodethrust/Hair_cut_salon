import re

with open('frontend/src/pages/PaymentSuccess.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("await api.post('/appointments/payments/confirm', {", "await api.post('/payments/confirm', {")

# Ensure price is accurate (e.g. advanceAmount vs total)
amount_display_logic = """
              {appointment.price && (
                <div className="flex justify-between text-sm border-t border-white/10 pt-3 mt-3">
                  <span className="text-slate-400">Amount Paid</span>
                  <span className="text-emerald-400 font-bold">₹{appointment.advanceAmount > 0 ? appointment.advanceAmount : appointment.price}</span>
                </div>
              )}
"""

content = re.sub(
    r"\{appointment\.price && \(\s*<div className=\"flex justify-between text-sm border-t border-white/10 pt-3 mt-3\">\s*<span className=\"text-slate-400\">Amount Paid</span>\s*<span className=\"text-emerald-400 font-bold\">₹\{appointment\.price\}</span>\s*</div>\s*\)\}",
    amount_display_logic,
    content
)

with open('frontend/src/pages/PaymentSuccess.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated PaymentSuccess.jsx API route and amount paid")
