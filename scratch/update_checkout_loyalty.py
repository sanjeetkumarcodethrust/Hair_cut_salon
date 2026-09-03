import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

points_state = """
    const { user } = useSelector(state => state.auth || {});
    const [redeemPoints, setRedeemPoints] = React.useState(0);
"""
# find the booking states
content = content.replace("const [couponError, setCouponError] = React.useState(null);", points_state + "\n    const [couponError, setCouponError] = React.useState(null);")

points_ui = """
                         {/* Loyalty Points Section */}
                         {user?.loyaltyPoints > 0 && (
                           <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100 flex justify-between items-center">
                             <div>
                               <p className="font-bold text-purple-900">Loyalty Balance: {user.loyaltyPoints} pts</p>
                               <p className="text-xs text-purple-700 mt-1">Use points for extra discount (10 pts = ₹1)</p>
                             </div>
                             <div className="flex items-center gap-2">
                               <input 
                                 type="number" 
                                 max={user.loyaltyPoints} 
                                 min="0"
                                 value={redeemPoints}
                                 onChange={e => setRedeemPoints(Math.min(parseInt(e.target.value) || 0, user.loyaltyPoints))}
                                 className="w-20 px-2 py-1 border border-purple-200 rounded text-center font-bold"
                               />
                               <span className="text-sm font-bold text-purple-900">pts</span>
                             </div>
                           </div>
                         )}

                         {/* Updated Pricing Summary */}
"""

# inject this before appliedCoupon pricing summary
content = content.replace("{appliedCoupon && (", points_ui + "\n                         {(appliedCoupon || redeemPoints > 0) && (")

# update the summary block
updated_summary = """
                           <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex justify-between text-sm text-slate-500 mb-2">
                               <span>Original Price</span>
                               <span className="line-through">₹{appliedCoupon ? appliedCoupon.originalPrice : (activeServices.find(x => x._id === selectedServiceId)?.price || 0)}</span>
                             </div>
                             {appliedCoupon && (
                               <div className="flex justify-between text-sm text-green-600 font-bold mb-2">
                                 <span>Coupon Discount</span>
                                 <span>-₹{appliedCoupon.discountAmount}</span>
                               </div>
                             )}
                             {redeemPoints > 0 && (
                               <div className="flex justify-between text-sm text-purple-600 font-bold mb-3 pb-3 border-b border-slate-200">
                                 <span>Points Redeemed ({redeemPoints})</span>
                                 <span>-₹{Math.floor(redeemPoints / 10)}</span>
                               </div>
                             )}
                             <div className="flex justify-between font-black text-slate-900 text-lg">
                               <span>Total</span>
                               <span>₹{Math.max(0, (appliedCoupon ? appliedCoupon.finalPrice : (activeServices.find(x => x._id === selectedServiceId)?.price || 0)) - Math.floor(redeemPoints / 10))}</span>
                             </div>
                           </div>
"""
content = re.sub(
    r"<div className=\"mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100\">[\s\S]*?<\/div>\s*<\/div>",
    updated_summary + "\n                           </div>",
    content
)

# Pass redeemPoints to backend API calls
content = content.replace(
    "couponCode: appliedCoupon?.coupon?.code,",
    "couponCode: appliedCoupon?.coupon?.code,\n                                 redeemPoints,"
)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Checkout with Loyalty points")
