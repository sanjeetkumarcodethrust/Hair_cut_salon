import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

owner_dashboard_tabs = """        {['dashboard', 'appointments', 'services', 'offers'].map(tab => ("""
content = re.sub(r"\{\['dashboard', 'appointments', 'services'\]\.map\(tab => \(", owner_dashboard_tabs, content)

owner_states = """  const [coupons, setCoupons] = React.useState([]);
  const [showCouponModal, setShowCouponModal] = React.useState(false);
  const [couponForm, setCouponForm] = React.useState({ code: '', discountType: 'percentage', discountValue: '', minOrderValue: '', usageLimit: '' });
"""
content = content.replace("  const [services, setServices] = React.useState([]);", "  const [services, setServices] = React.useState([]);\n" + owner_states)

owner_fetch = """      } else if (tab === 'offers') {
        const res = await api.get(`/coupons/shop/${shopId}`);
        setCoupons(res.data);
      }"""
content = re.sub(r"\} else if \(tab === 'services'\) \{[\s\S]*?setServices\(res\.data\);\s*\}", "} else if (tab === 'services') {\n        const res = await api.get(`/salons/${shopId}`);\n        setServices(res.data.services);\n      }" + owner_fetch, content)

owner_save_coupon = """
  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.post('/coupons', { ...couponForm, salonId: shopId });
      setShowCouponModal(false);
      fetchData('offers');
    } catch(err) {
      alert(err.response?.data?.message || 'Error saving coupon');
    }
  };

  const handleUpdateCoupon = async (id, payload) => {
    try {
      await api.put(`/coupons/${id}`, payload);
      fetchData('offers');
    } catch(err) {
      alert(err.response?.data?.message || 'Error updating coupon');
    }
  };
"""
content = content.replace("  const handleLogout = () => {", owner_save_coupon + "\n  const handleLogout = () => {")

owner_coupon_render = """
      ) : activeTab === 'offers' ? (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Discount Coupons</h2>
            <button onClick={() => setShowCouponModal(true)} className="px-4 py-2 bg-slate-900 text-white font-bold rounded-full hover:bg-slate-800 text-sm">
              + Create Coupon
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map(c => (
              <div key={c._id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-black text-slate-900">{c.code}</h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${c.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                  </div>
                  <p className="text-primary font-bold text-sm mb-4">
                    {c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`}
                  </p>
                  <p className="text-xs text-slate-500 mb-1">Min Order: ₹{c.minOrderValue}</p>
                  <p className="text-xs text-slate-500">Usage: {c.usageCount} / {c.usageLimit || 'Unlimited'}</p>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                  {c.status === 'active' ? (
                    <button onClick={() => handleUpdateCoupon(c._id, { status: 'paused' })} className="text-xs font-bold text-orange-600 hover:underline">Pause</button>
                  ) : (
                    <button onClick={() => handleUpdateCoupon(c._id, { status: 'active' })} className="text-xs font-bold text-green-600 hover:underline">Activate</button>
                  )}
                </div>
              </div>
            ))}
            {coupons.length === 0 && <p className="text-slate-500 col-span-3 text-center py-10">No coupons created yet.</p>}
          </div>

          {showCouponModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
              <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
                <h3 className="mb-4 text-lg font-bold text-slate-900">Create Promo Code</h3>
                <form onSubmit={handleSaveCoupon} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Code</label>
                    <input type="text" required value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 font-bold uppercase" placeholder="e.g. SAVE20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Type</label>
                      <select value={couponForm.discountType} onChange={e => setCouponForm({...couponForm, discountType: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2 bg-white">
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed (₹)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Value</label>
                      <input type="number" required value={couponForm.discountValue} onChange={e => setCouponForm({...couponForm, discountValue: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder={couponForm.discountType === 'percentage' ? '20' : '100'} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Min Order (₹)</label>
                      <input type="number" value={couponForm.minOrderValue} onChange={e => setCouponForm({...couponForm, minOrderValue: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="0" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Usage Limit</label>
                      <input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm({...couponForm, usageLimit: e.target.value})} className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2" placeholder="Unlimited" />
                    </div>
                  </div>
                  <div className="mt-6 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowCouponModal(false)} className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-50 rounded-xl">Cancel</button>
                    <button type="submit" className="rounded-xl bg-slate-900 px-6 py-2 font-bold text-white hover:bg-slate-800">Create</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
"""
content = content.replace(") : null}", owner_coupon_render + "\n      ) : null}")

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Owner Dashboard with Coupon Management")
