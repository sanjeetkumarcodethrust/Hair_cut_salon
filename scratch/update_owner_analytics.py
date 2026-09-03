import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

analytics_state = """    // Phase 22 States
    const [leaveRequests, setLeaveRequests] = React.useState([]);

    // Phase 23 Analytics States
    const [analytics, setAnalytics] = React.useState(null);
    const [topServices, setTopServices] = React.useState([]);"""

content = content.replace("    // Phase 22 States\n    const [leaveRequests, setLeaveRequests] = React.useState([]);", analytics_state)

analytics_fetch = """               api.get(`/workforce/leave/shop/${mySalon._id}`).then(lr => setLeaveRequests(lr.data.leaves)).catch(console.error);
               api.get(`/analytics/shop/${mySalon._id}/overview`).then(ar => setAnalytics(ar.data.stats)).catch(console.error);
               api.get(`/analytics/shop/${mySalon._id}/services`).then(sr => setTopServices(sr.data.services.slice(0,5))).catch(console.error);"""

content = content.replace("               api.get(`/workforce/leave/shop/${mySalon._id}`).then(lr => setLeaveRequests(lr.data.leaves)).catch(console.error);", analytics_fetch)

analytics_ui = """        {analytics && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Business Analytics</h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 mb-1">Net Revenue</p>
                <h3 className="text-2xl font-black text-slate-900">₹{analytics.netRevenue?.toLocaleString()}</h3>
                <p className="text-xs text-emerald-600 mt-2 font-semibold bg-emerald-50 inline-block px-2 py-0.5 rounded-full">Paid only</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Bookings</p>
                <h3 className="text-2xl font-black text-slate-900">{analytics.totalBookings}</h3>
                <p className="text-xs text-slate-500 mt-2">{analytics.completedBookings} completed</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 mb-1">Avg Booking Value</p>
                <h3 className="text-2xl font-black text-slate-900">₹{analytics.avgBookingValue?.toLocaleString()}</h3>
                <p className="text-xs text-slate-500 mt-2">Per completed booking</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-500 mb-1">Cancellations & No-Shows</p>
                <h3 className="text-2xl font-black text-rose-600">{analytics.cancelledBookings + analytics.noShowBookings}</h3>
                <p className="text-xs text-slate-500 mt-2">{analytics.cancelledBookings} cancelled, {analytics.noShowBookings} no-show</p>
              </div>
            </div>

            {topServices.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Top Services (Revenue)</h3>
                <div className="space-y-3">
                  {topServices.map((s, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 border border-slate-100 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-900">{s.name}</p>
                        <p className="text-sm text-slate-500">{s.count} bookings</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-emerald-600">₹{s.revenue?.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}"""

old_ui = """        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 mb-8">
          {['Revenue summary', 'Staff roster', 'Pending bookings'].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">{item}</h3>
              <p className="mt-2 text-sm text-slate-600">This workspace is ready for owner-specific management views.</p>
            </div>
          ))}
        </div>"""

content = content.replace(old_ui, analytics_ui)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("OwnerDashboardPage analytics integrated.")
