import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

coupon_state = """
    const [couponCode, setCouponCode] = React.useState('');
    const [couponError, setCouponError] = React.useState(null);
    const [appliedCoupon, setAppliedCoupon] = React.useState(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = React.useState(false);
"""

content = content.replace("    const [bookingMode, setBookingMode] = React.useState(null); // 'schedule' or null", "    const [bookingMode, setBookingMode] = React.useState(null);\n" + coupon_state)

apply_coupon_method = """
    const handleApplyCoupon = async () => {
       if (!couponCode.trim()) return;
       setIsApplyingCoupon(true);
       setCouponError(null);
       try {
          const s = activeServices.find(x => x._id === selectedServiceId);
          const res = await api.post('/coupons/validate', {
             code: couponCode,
             salonId: id,
             serviceId: selectedServiceId,
             amount: s?.price || 0
          });
          setAppliedCoupon(res.data);
       } catch (err) {
          setCouponError(err.response?.data?.message || 'Invalid coupon code');
          setAppliedCoupon(null);
       } finally {
          setIsApplyingCoupon(false);
       }
    };
"""

content = content.replace("    React.useEffect(() => {", apply_coupon_method + "\n    React.useEffect(() => {")

coupon_ui = """
                         {/* Coupon Section */}
                         <div className="mt-4 mb-6">
                           {!appliedCoupon ? (
                             <div>
                               <div className="flex gap-2">
                                 <input 
                                   type="text" 
                                   placeholder="Promo code" 
                                   value={couponCode}
                                   onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                   className="flex-1 rounded-xl border border-slate-200 px-4 py-2 uppercase font-bold focus:border-slate-900 focus:ring-0"
                                 />
                                 <button 
                                   onClick={handleApplyCoupon}
                                   disabled={isApplyingCoupon || !couponCode}
                                   className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 disabled:opacity-50"
                                 >
                                   {isApplyingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                 </button>
                               </div>
                               {couponError && <p className="text-red-500 text-xs font-bold mt-2">{couponError}</p>}
                             </div>
                           ) : (
                             <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex justify-between items-center">
                               <div>
                                 <p className="text-green-700 font-bold text-sm flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Code {appliedCoupon.coupon.code} applied!</p>
                                 <p className="text-green-600 text-xs mt-0.5">You save ₹{appliedCoupon.discountAmount}</p>
                               </div>
                               <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
                             </div>
                           )}
                         </div>

                         {appliedCoupon && (
                           <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex justify-between text-sm text-slate-500 mb-2">
                               <span>Original Price</span>
                               <span className="line-through">₹{appliedCoupon.originalPrice}</span>
                             </div>
                             <div className="flex justify-between text-sm text-green-600 font-bold mb-3 pb-3 border-b border-slate-200">
                               <span>Discount</span>
                               <span>-₹{appliedCoupon.discountAmount}</span>
                             </div>
                             <div className="flex justify-between font-black text-slate-900 text-lg">
                               <span>Total</span>
                               <span>₹{appliedCoupon.finalPrice}</span>
                             </div>
                           </div>
                         )}
"""

content = re.sub(
    r"<h4 className=\"font-bold text-slate-900\">\{s\.name\}<\/h4>\s*<p className=\"text-sm font-semibold text-primary mt-1\">₹\{s\.price\} • \{s\.duration\} min<\/p>\s*<\/div>\s*\)\s*:\s*null;",
    "<h4 className=\"font-bold text-slate-900\">{s.name}</h4>\n                         <p className=\"text-sm font-semibold text-primary mt-1\">₹{s.price} • {s.duration} min</p>\n                       </div>\n                     ) : null;\n                   })()}\n" + coupon_ui,
    content
)

content = content.replace(
    "const res = await api.post('/appointments/instant', { shopId: id, serviceId: selectedServiceId });",
    "const res = await api.post('/appointments/instant', { shopId: id, serviceId: selectedServiceId, couponCode: appliedCoupon?.coupon?.code });"
)

content = content.replace(
    "serviceId: selectedServiceId,",
    "serviceId: selectedServiceId,\n                                 couponCode: appliedCoupon?.coupon?.code,"
)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated UiPages.jsx with Coupon UI")
