import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a function to process refunds
refund_fn = """
  const handleProcessRefund = async () => {
    if (!window.confirm('Are you sure you want to process this refund via Stripe?')) return;
    try {
      await api.post(`/payments/${selectedTicket.booking._id}/refund`);
      alert('Refund processed successfully!');
      handleUpdateTicketStatus('resolved');
      handleOpenTicket(selectedTicket._id);
    } catch(err) {
      alert(err.response?.data?.message || 'Error processing refund');
    }
  };
"""

content = content.replace("const handleUpdateTicketStatus = async (status) => {", refund_fn + "\n  const handleUpdateTicketStatus = async (status) => {")

# Inject the button into the ticket detail modal
refund_ui = """
                    <div className="flex gap-2 mb-4">
                      {user.role === 'admin' && selectedTicket.booking && selectedTicket.category === 'Refund Request' && selectedTicket.booking.paymentStatus === 'paid' && (
                        <button onClick={handleProcessRefund} className="text-xs font-bold px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200">Process Refund</button>
                      )}
"""

content = re.sub(
    r"<div className=\"flex gap-2 mb-4\">\s*\{selectedTicket\.status !== 'resolved'",
    refund_ui + "\n                      {selectedTicket.status !== 'resolved'",
    content
)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected Refund Action into Support UI")
