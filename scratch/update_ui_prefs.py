import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Dashboard "Saved" Tab
saved_fetch = """      } else if (tab === 'saved') {
        const res = await api.get('/preferences/favorites');
        setSaved(res.data.map(f => f.shop));
      }"""
content = re.sub(
    r"\} else if \(tab === 'saved'\) \{[\s\S]*?setSaved\(res\.data\.slice\(0,3\)\);\s*\}",
    saved_fetch,
    content
)

# 2. Book Again Button in History
book_again_fn = """
  const handleBookAgain = (booking) => {
    setSelectedServiceId(booking.serviceId);
    navigate(`/salons/${booking.salon?._id}`);
  };
"""
content = content.replace("const handleLogout = () => {", book_again_fn + "\n  const handleLogout = () => {")

history_ui = """
                        <div className="text-right">
                          <p className="font-bold text-slate-900 mb-2">₹{apt.price}</p>
                          <button onClick={() => handleBookAgain(apt)} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100">Book Again</button>
                        </div>
"""
content = re.sub(
    r"<p className=\"font-bold text-slate-900\">₹\{apt\.price\}<\/p>\s*<\/div>",
    history_ui + "\n                      </div>",
    content
)

# 3. Add to Recently Viewed on Shop Open
open_shop_fn = """
  const handleOpenShop = (id) => {
    // Record view in background if logged in
    if (user) {
      api.post('/preferences/recent', { shopId: id }).catch(console.error);
    }
    navigate(`/salons/${id}`);
  };
"""
content = content.replace("const handleLogout = () => {", open_shop_fn + "\n  const handleLogout = () => {")

# Modify salon card clicks to use handleOpenShop
content = content.replace("onClick={() => navigate(`/salons/${salon._id}`)}", "onClick={() => handleOpenShop(salon._id)}")
content = content.replace("onClick={() => navigate(`/salons/${shop._id}`)}", "onClick={() => handleOpenShop(shop._id)}")

# 4. Favorite Toggle in Shop Details (SalonDetails view)
# Wait, let's inject favorite logic into the UiPages component.
fav_state = """
  const [isFavorite, setIsFavorite] = React.useState(false);
"""
content = content.replace("const [reviews, setReviews] = React.useState([]);", fav_state + "\n  const [reviews, setReviews] = React.useState([]);")

fav_fetch = """
      if (user) {
         api.get('/preferences/favorites').then(res => {
            if (res.data.some(f => f.shop?._id === id)) setIsFavorite(true);
         }).catch(console.error);
      }
"""
content = content.replace("setReviews(resReviews.data.reviews);", "setReviews(resReviews.data.reviews);\n" + fav_fetch)

fav_toggle_fn = """
  const toggleFavorite = async () => {
    if (!user) return alert("Please login first");
    try {
      const res = await api.post('/preferences/favorites/toggle', { shopId: id });
      setIsFavorite(res.data.isFavorite);
    } catch(err) {
      console.error(err);
    }
  };
"""
content = content.replace("const handleApplyCoupon = async () => {", fav_toggle_fn + "\n  const handleApplyCoupon = async () => {")

fav_ui = """
              <div className="flex items-center gap-3">
                <button onClick={toggleFavorite} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition">
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
                <div className="flex gap-2">
"""
content = content.replace("<div className=\"flex items-center gap-3\">\n                <div className=\"flex gap-2\">", fav_ui)
content = content.replace("<div className=\"flex items-center gap-3\">                <div className=\"flex gap-2\">", fav_ui)


with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Favorites, Recently Viewed, and Book Again in UiPages.jsx")
