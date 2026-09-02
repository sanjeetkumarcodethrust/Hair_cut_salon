import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import api from '../services/api';

const urlB64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const PushNotificationBanner = () => {
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setSubscribed(!!sub);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert("Push notifications are not supported by your browser.");
        setLoading(false);
        return;
      }

      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        alert("You need to grant permission to receive notifications.");
        setLoading(false);
        return;
      }

      // Register Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Get VAPID key from backend
      const vapidRes = await api.get('/notifications/vapid-key');
      const publicKey = vapidRes.data.publicKey;

      // Subscribe
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(publicKey)
      });

      // Send to backend
      await api.post('/notifications/register', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
        },
        platform: 'web'
      });

      setSubscribed(true);
    } catch (err) {
      console.error("Push registration error:", err);
      alert("Failed to enable notifications. " + (err.message || ''));
    } finally {
      setLoading(false);
    }
  };

  if (permission === 'denied' || subscribed) return null;

  return (
    <div className="mb-8 rounded-2xl bg-indigo-50 border border-indigo-100 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-primary flex items-center justify-center shrink-0">
          <Bell className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-indigo-900 font-bold">Enable Push Notifications</h3>
          <p className="text-indigo-700 text-sm mt-1">Get instant updates for booking confirmations, rescheduling, cancellations, and appointment reminders directly on your device.</p>
        </div>
      </div>
      <button 
        onClick={handleSubscribe} 
        disabled={loading}
        className="shrink-0 px-5 py-2.5 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-indigo-700 transition disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Enable Notifications
      </button>
    </div>
  );
};

export default PushNotificationBanner;
