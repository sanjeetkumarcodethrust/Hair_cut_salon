import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states for tickets
states_injection = """
  // Support Tickets State
  const [tickets, setTickets] = React.useState([]);
  const [selectedTicket, setSelectedTicket] = React.useState(null);
  const [ticketMessages, setTicketMessages] = React.useState([]);
  const [replyMessage, setReplyMessage] = React.useState('');
  const [isInternalNote, setIsInternalNote] = React.useState(false);
  
  const [showCreateTicketModal, setShowCreateTicketModal] = React.useState(false);
  const [ticketForm, setTicketForm] = React.useState({ category: 'Booking Issue', subject: '', description: '', bookingId: '' });
"""
content = content.replace("const [rewardHistory, setRewardHistory] = React.useState([]);", "const [rewardHistory, setRewardHistory] = React.useState([]);\n" + states_injection)


# Fetch logic for customer
customer_fetch = """      } else if (tab === 'support') {
        const res = await api.get('/tickets/customer');
        setTickets(res.data);
      }"""
content = re.sub(
    r"\} else if \(tab === 'rewards'\) \{[\s\S]*?setRewardHistory\(res\.data\);\s*\}",
    "} else if (tab === 'rewards') {\n        const res = await api.get('/loyalty/transactions');\n        setRewardHistory(res.data);\n      }" + customer_fetch,
    content
)

# Fetch logic for owner
owner_fetch = """      } else if (tab === 'support') {
        const res = await api.get(`/tickets/shop/${shopId}`);
        setTickets(res.data);
      }"""
content = re.sub(
    r"\} else if \(tab === 'offers'\) \{[\s\S]*?setCoupons\(res\.data\);\s*\}",
    "} else if (tab === 'offers') {\n        const res = await api.get(`/coupons/shop/${shopId}`);\n        setCoupons(res.data);\n      }" + owner_fetch,
    content
)

# Fetch logic for admin
admin_fetch = """      } else if (tab === 'support') {
        const res = await api.get('/tickets/admin');
        setTickets(res.data);
      }"""
content = re.sub(
    r"\} else if \(tab === 'coupons'\) \{[\s\S]*?setAdminCoupons\(res\.data\.coupons\);\s*\}",
    "} else if (tab === 'coupons') {\n        const res = await api.get('/admin/coupons?limit=50');\n        setAdminCoupons(res.data.coupons);\n      }" + admin_fetch,
    content
)


# Handlers for tickets
ticket_handlers = """
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tickets', ticketForm);
      setShowCreateTicketModal(false);
      setTicketForm({ category: 'Booking Issue', subject: '', description: '', bookingId: '' });
      fetchData('support');
    } catch(err) {
      alert(err.response?.data?.message || 'Error creating ticket');
    }
  };

  const handleOpenTicket = async (id) => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setSelectedTicket(res.data.ticket);
      setTicketMessages(res.data.messages);
    } catch(err) {
      alert('Error fetching ticket details');
    }
  };

  const handleReplyTicket = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    try {
      await api.post(`/tickets/${selectedTicket._id}/messages`, { message: replyMessage, isInternalNote });
      setReplyMessage('');
      setIsInternalNote(false);
      handleOpenTicket(selectedTicket._id);
    } catch(err) {
      alert('Error sending reply');
    }
  };

  const handleUpdateTicketStatus = async (status) => {
    try {
      await api.put(`/tickets/${selectedTicket._id}`, { status });
      setSelectedTicket({ ...selectedTicket, status });
      handleOpenTicket(selectedTicket._id);
    } catch(err) {
      alert('Error updating status');
    }
  };
"""
content = content.replace("const handleLogout = () => {", ticket_handlers + "\n  const handleLogout = () => {")


with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated State and Fetch logic in UiPages.jsx")
