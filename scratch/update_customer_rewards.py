import re

with open('frontend/src/pages/UiPages.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add to Customer Dashboard
dashboard_tabs = """        {['upcoming', 'history', 'saved', 'rewards'].map(tab => ("""
content = re.sub(r"\{\['upcoming', 'history', 'saved'\]\.map\(tab => \(", dashboard_tabs, content)

rewards_state = """  const [rewardHistory, setRewardHistory] = React.useState([]);
"""
content = content.replace("  const [upcoming, setUpcoming] = React.useState([]);", "  const [upcoming, setUpcoming] = React.useState([]);\n" + rewards_state)

rewards_fetch = """      } else if (tab === 'rewards') {
        const res = await api.get('/loyalty/transactions');
        setRewardHistory(res.data);
      }"""
content = re.sub(r"\} else if \(tab === 'saved'\) \{[\s\S]*?setSaved\(res\.data\);\s*\}", "} else if (tab === 'saved') {\n        const res = await api.get('/salons');\n        setSaved(res.data.slice(0,3));\n      }" + rewards_fetch, content)

rewards_ui = """
      ) : activeTab === 'rewards' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-white/80">Loyalty Balance</h2>
            <div className="text-5xl font-black">{user?.loyaltyPoints || 0} <span className="text-2xl font-bold">pts</span></div>
            <p className="mt-4 text-white/90">Share your code <span className="font-mono bg-white/20 px-2 py-1 rounded font-bold">{user?.referralCode}</span> to earn 500 bonus points when friends complete their first booking!</p>
          </div>
          
          <h3 className="text-lg font-bold text-slate-900 mt-8 mb-4">Transaction History</h3>
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {rewardHistory.map(tx => (
              <div key={tx._id} className="p-4 border-b border-slate-100 flex justify-between items-center last:border-0">
                <div>
                  <p className="font-bold text-slate-900">{tx.description}</p>
                  <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`font-black text-lg ${tx.points > 0 ? 'text-green-600' : 'text-slate-900'}`}>
                  {tx.points > 0 ? '+' : ''}{tx.points}
                </div>
              </div>
            ))}
            {rewardHistory.length === 0 && <p className="p-8 text-center text-slate-500">No reward transactions yet.</p>}
          </div>
        </div>
"""
content = content.replace(") : activeTab === 'saved' ? (", rewards_ui + "\n      ) : activeTab === 'saved' ? (")

with open('frontend/src/pages/UiPages.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated Customer Dashboard with Rewards")
