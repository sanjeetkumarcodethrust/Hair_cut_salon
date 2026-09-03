import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add badge in BarberDiscovery card
verification_badge_card = """
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <h3 className="text-lg font-bold text-slate-900 truncate" title={salon.name}>{salon.name}</h3>
                          {salon.verificationStatus === 'approved' && (
                            <div className="flex items-center gap-1 bg-green-50 text-green-700 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full shrink-0 border border-green-200">
                              <CheckCircle className="w-3 h-3" /> Verified
                            </div>
                          )}
                        </div>
"""

content = content.replace("                      <div className=\"flex justify-between items-start mb-2\">\n                        <h3 className=\"text-lg font-bold text-slate-900 truncate pr-2\" title={salon.name}>{salon.name}</h3>", verification_badge_card)

# Add badge in SalonDetails title block
verification_badge_details = """
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">{salon.name}</h2>
                  {salon.verificationStatus === 'approved' && (
                    <div className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs uppercase font-black tracking-wider px-3 py-1 rounded-full border border-green-200 shadow-sm">
                      <CheckCircle className="w-4 h-4" /> Verified Shop
                    </div>
                  )}
                </div>
"""

content = content.replace("                <h2 className=\"text-2xl font-bold text-slate-900 mb-6\">{salon.name}</h2>", verification_badge_details)

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated BarberDiscovery and SalonDetails with Verified Badge")
