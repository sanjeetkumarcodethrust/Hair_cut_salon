import re

with open('frontend/src/pages/Dashboard.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

if "PushNotificationBanner" not in content:
    content = content.replace("import { Navigate, Link } from 'react-router-dom';", "import { Navigate, Link } from 'react-router-dom';\nimport PushNotificationBanner from '../components/PushNotificationBanner.jsx';")

    inject_point = """          <div className="rounded-[2rem] border border-white/70 bg-slate-900 px-6 py-8 text-white shadow-2xl shadow-slate-300/40 sm:px-8">"""
    
    new_inject_point = """          <PushNotificationBanner />\n          <div className="rounded-[2rem] border border-white/70 bg-slate-900 px-6 py-8 text-white shadow-2xl shadow-slate-300/40 sm:px-8">"""
    
    content = content.replace(inject_point, new_inject_point)

    with open('frontend/src/pages/Dashboard.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Injected PushNotificationBanner into Dashboard")
