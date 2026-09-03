import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add a generic ReviewsList component
reviews_component = """
const ReviewsList = ({ salonId }) => {
  const [reviews, setReviews] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/reviews/salon/${salonId}`);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [salonId]);

  if (loading) return <div className="py-4 text-slate-500">Loading reviews...</div>;
  if (reviews.length === 0) return <div className="py-4 text-slate-500">No reviews yet.</div>;

  return (
    <div className="space-y-4">
      {reviews.map(r => (
        <div key={r._id} className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-slate-900">{r.customer?.name || 'Customer'}</p>
              <p className="text-xs text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => (
                <Star key={s} className={`w-4 h-4 ${s <= r.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
              ))}
            </div>
          </div>
          {r.serviceName && <p className="text-xs font-semibold text-primary mb-2">{r.serviceName}</p>}
          {r.comment && <p className="text-sm text-slate-700">{r.comment}</p>}
        </div>
      ))}
    </div>
  );
};
"""

content = content.replace("export const SalonDetails = () => {", reviews_component + "\nexport const SalonDetails = () => {")

# Append it to SalonDetails UI
salon_details_reviews = """
                 <div className="mt-8 border-t border-slate-100 pt-8">
                   <h2 className="text-xl font-bold text-slate-900 mb-6">Customer Reviews</h2>
                   <ReviewsList salonId={salon._id} />
                 </div>
               </div>
"""

content = content.replace("               </div>\n\n               <div className=\"bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 h-fit sticky top-24\">", salon_details_reviews + "\n               <div className=\"bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 h-fit sticky top-24\">")

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated UiPages.jsx with ReviewsList")
