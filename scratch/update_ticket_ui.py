import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Common Ticket View (Detail Modal)
ticket_detail_modal = """
          {selectedTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl rounded-3xl bg-white shadow-xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1">Ticket #{selectedTicket._id.substring(0,8).toUpperCase()} • {selectedTicket.category}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${selectedTicket.status === 'open' ? 'bg-orange-100 text-orange-700' : selectedTicket.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                      {selectedTicket.status}
                    </span>
                    <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 rounded-full">✕</button>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-4">
                  {ticketMessages.map(msg => (
                    <div key={msg._id} className={`flex flex-col ${msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${msg.isInternalNote ? 'bg-amber-100 border border-amber-200 text-amber-900' : (msg.senderRole === (user.role === 'customer' ? 'customer' : (user.role === 'admin' ? 'admin' : 'owner')) ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-900')}`}>
                        {msg.isInternalNote && <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">Internal Note</p>}
                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                      </div>
                      <span className="text-xs text-slate-400 mt-1">{msg.sender?.name} ({msg.senderRole}) • {new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                  {ticketMessages.length === 0 && <p className="text-center text-slate-500">No messages yet.</p>}
                </div>
                
                <div className="p-6 border-t border-slate-100 bg-white rounded-b-3xl">
                  {user.role !== 'customer' && selectedTicket.status !== 'closed' && (
                    <div className="flex gap-2 mb-4">
                      {selectedTicket.status !== 'resolved' && <button onClick={() => handleUpdateTicketStatus('resolved')} className="text-xs font-bold px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200">Mark Resolved</button>}
                      {selectedTicket.status !== 'closed' && <button onClick={() => handleUpdateTicketStatus('closed')} className="text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200">Close Ticket</button>}
                    </div>
                  )}
                  
                  {selectedTicket.status !== 'closed' ? (
                    <form onSubmit={handleReplyTicket}>
                      <textarea
                        required
                        value={replyMessage}
                        onChange={e => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-slate-900 focus:ring-0 min-h-[100px]"
                      ></textarea>
                      <div className="mt-3 flex justify-between items-center">
                        {user.role === 'admin' ? (
                          <label className="flex items-center gap-2 text-sm text-slate-600 font-semibold cursor-pointer">
                            <input type="checkbox" checked={isInternalNote} onChange={e => setIsInternalNote(e.target.checked)} className="rounded border-slate-300 text-amber-600 focus:ring-amber-500" />
                            Private Internal Note
                          </label>
                        ) : <div></div>}
                        <button type="submit" className="px-6 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800">Send Reply</button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-center text-slate-500 font-semibold">This ticket is closed and cannot be replied to.</p>
                  )}
                </div>
              </div>
            </div>
          )}
"""

# CUSTOMER SUPPORT UI
customer_support_ui = """
      ) : activeTab === 'support' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Help & Support</h2>
            <button onClick={() => setShowCreateTicketModal(true)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 text-sm">
              + New Ticket
            </button>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {tickets.map(t => (
              <div key={t._id} onClick={() => handleOpenTicket(t._id)} className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition">
                <div>
                  <h3 className="font-bold text-slate-900">{t.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1">Ticket #{t._id.substring(0,8).toUpperCase()} • {t.category} • {new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-700' : t.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                  <span className="text-slate-400">›</span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="p-10 text-center text-slate-500">No support tickets found.</p>}
          </div>

          {showCreateTicketModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-xl font-bold text-slate-900">Contact Support</h3>
                <form onSubmit={handleCreateTicket} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Category</label>
                    <select required value={ticketForm.category} onChange={e => setTicketForm({...ticketForm, category: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2">
                      <option>Booking Issue</option>
                      <option>Payment Issue</option>
                      <option>Refund Request</option>
                      <option>Shop/Barber Complaint</option>
                      <option>Technical Issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Subject</label>
                    <input type="text" required value={ticketForm.subject} onChange={e => setTicketForm({...ticketForm, subject: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="Brief summary of the issue" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Description</label>
                    <textarea required value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 h-32" placeholder="Please provide details..."></textarea>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowCreateTicketModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white hover:bg-slate-800">Submit Ticket</button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
""" + ticket_detail_modal + """
        </div>
"""
content = content.replace(") : activeTab === 'rewards' ? (", customer_support_ui + "\n      ) : activeTab === 'rewards' ? (")


# OWNER SUPPORT UI
owner_support_ui = """
      ) : activeTab === 'support' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Shop Support Tickets</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {tickets.map(t => (
              <div key={t._id} onClick={() => handleOpenTicket(t._id)} className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition">
                <div>
                  <h3 className="font-bold text-slate-900">{t.subject}</h3>
                  <p className="text-xs text-slate-500 mt-1">Ticket #{t._id.substring(0,8).toUpperCase()} • {t.customer?.name} • {t.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="p-10 text-center text-slate-500">No support tickets for your shop.</p>}
          </div>
""" + ticket_detail_modal + """
        </div>
"""
content = content.replace(") : activeTab === 'offers' ? (", owner_support_ui + "\n      ) : activeTab === 'offers' ? (")


# ADMIN SUPPORT UI
admin_support_ui = """
      ) : activeTab === 'support' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Global Support Queue</h2>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {tickets.map(t => (
              <div key={t._id} onClick={() => handleOpenTicket(t._id)} className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900">{t.subject}</h3>
                    {t.priority === 'high' || t.priority === 'urgent' ? <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-black rounded uppercase">{t.priority}</span> : null}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">#{t._id.substring(0,8).toUpperCase()} • {t.customer?.name} • {t.shop?.name || 'Platform'} • {t.category}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${t.status === 'open' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="p-10 text-center text-slate-500">Queue is empty.</p>}
          </div>
""" + ticket_detail_modal + """
        </div>
"""
content = content.replace(") : activeTab === 'coupons' ? (", admin_support_ui + "\n      ) : activeTab === 'coupons' ? (")


with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Injected Support UI blocks into all dashboards.")
