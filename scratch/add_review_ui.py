import re

with open('frontend/src/pages/BookingDetails.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add Review Component
review_ui = """
          {/* Review Section */}
          {apt.status === 'completed' && (
            <div className="mt-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Rate Your Visit</h3>
              {apt.isReviewed ? (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-200">
                  <p className="font-bold flex items-center gap-2"><CheckCircle className="w-5 h-5" /> You have already reviewed this booking.</p>
                </div>
              ) : (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setActionLoading(true);
                  const formData = new FormData(e.target);
                  const rating = parseInt(formData.get('rating'));
                  const comment = formData.get('comment');
                  
                  try {
                    await api.post('/reviews', { appointmentId: id, rating, comment });
                    alert('Review submitted successfully!');
                    setApt({...apt, isReviewed: true});
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to submit review');
                  } finally {
                    setActionLoading(false);
                  }
                }}>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <label key={star} className="cursor-pointer">
                          <input type="radio" name="rating" value={star} className="peer sr-only" required />
                          <div className="text-3xl text-slate-300 peer-checked:text-yellow-400 hover:scale-110 transition">★</div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Comment (Optional)</label>
                    <textarea 
                      name="comment" 
                      rows="3" 
                      maxLength="500"
                      placeholder="How was your experience?" 
                      className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-slate-900 focus:ring-0 transition resize-none"
                    ></textarea>
                  </div>
                  <button 
                    type="submit" 
                    disabled={actionLoading}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl shadow-md hover:bg-slate-800 transition flex items-center gap-2"
                  >
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
"""

content = content.replace("        </div>\n      </div>\n    </div>\n  );\n};", review_ui + "\n    </div>\n  );\n};")
content = content.replace("import { Calendar, Clock, Scissors, MapPin, Loader2, User, ChevronLeft, AlertCircle } from 'lucide-react';", "import { Calendar, Clock, Scissors, MapPin, Loader2, User, ChevronLeft, AlertCircle, CheckCircle } from 'lucide-react';")

with open('frontend/src/pages/BookingDetails.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated BookingDetails.jsx with Review UI")
