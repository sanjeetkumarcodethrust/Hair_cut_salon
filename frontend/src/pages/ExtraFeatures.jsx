import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Camera, Gift, MessageCircle, QrCode, Sparkles, Volume2, Languages, Smartphone } from 'lucide-react';
import PageShell from '../components/PageShell';
import aiResponses from '../data/aiResponses.json';
import api from '../services/api';

const recommendationCards = [
  { title: 'Soft textured crop', detail: 'Ideal for oval and heart face shapes', vibe: 'Low-maintenance' },
  { title: 'Modern taper fade', detail: 'Balanced and sharp with a clean finish', vibe: 'Professional' },
  { title: 'Wavy side part', detail: 'Adds movement and volume for thicker hair', vibe: 'Stylish' },
];

const galleryItems = [
  { before: 'Before', after: 'After', title: 'Textured crop', image: 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=400&q=80' },
  { before: 'Before', after: 'After', title: 'Taper fade', image: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=400&q=80' },
  { before: 'Before', after: 'After', title: 'Soft waves', image: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80' },
];

const loyaltyTiers = [
  { name: 'Starter', points: '0-199', reward: '10% off first booking' },
  { name: 'Glow', points: '200-499', reward: 'Free beard trim' },
  { name: 'Elite', points: '500+', reward: 'Priority booking + monthly coupon' },
];

const ExtraFeatures = () => {
  const [otpMode, setOtpMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hi! Need help choosing a service or hairstyle?' }
  ]);
  const [chatInput, setChatInput] = useState('');

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    const currentInput = chatInput.trim();
    setChatInput('');
    
    try {
      const response = await api.post('/ai/chat', { prompt: currentInput });
      if (response.data && response.data.success) {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          text: response.data.reply, 
          image: response.data.imageUrl 
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to my brain. Please try again." }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'ai', text: "An error occurred while thinking. Please try again later." }]);
    }
  };

  const copy = useMemo(() => ({
    en: {
      title: 'AI style concierge',
      subtitle: 'Personalized hairstyle inspiration, loyalty rewards, and smart support built in.',
      otp: 'Secure OTP login',
      verify: 'Email verified',
      chatbot: 'Ask for booking help',
      language: 'Language',
    },
    es: {
      title: 'Asistente de estilo con IA',
      subtitle: 'Inspiración personal de peinados, recompensas de lealtad y soporte inteligente.',
      otp: 'Inicio de sesión seguro por OTP',
      verify: 'Correo verificado',
      chatbot: 'Preguntar por ayuda de reservas',
      language: 'Idioma',
    },
    fr: {
      title: 'Concierge de style IA',
      subtitle: 'Inspiration personnalisée pour coiffures, récompenses de fidélité et assistance intelligente.',
      otp: 'Connexion OTP sécurisée',
      verify: 'Email vérifié',
      chatbot: 'Demander de l’aide pour une réservation',
      language: 'Langue',
    },
  }), []);

  const t = copy[language];

  return (
    <PageShell eyebrow="Premium extras" title={t.title} description={t.subtitle}>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/15 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">AI hairstyle recommendations</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Tailored picks based on your preference, lifestyle, and face shape.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {recommendationCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{card.title}</p>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{card.detail}</p>
                  <span className="mt-3 inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{card.vibe}</span>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 text-emerald-600">
                <Camera className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Before/after hairstyle gallery</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Visual proof of stunning transformations from the salon team.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {galleryItems.map((item) => (
                <div key={item.title} className="rounded-[1.25rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:border-slate-800 dark:from-slate-950/70 dark:to-slate-900">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <span>{item.before}</span>
                    <span>→</span>
                    <span>{item.after}</span>
                  </div>
                  <div className="mt-4 h-32 w-full rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</p>
                </div>
              ))}
            </div>
          </motion.section>
        </div>

        <div className="space-y-6">
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/15 to-orange-500/15 text-amber-600">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Loyalty points & coupons</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">Earn rewards every booking and unlock personal offers.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {loyaltyTiers.map((tier) => (
                <div key={tier.name} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 dark:text-white">{tier.name}</p>
                    <span className="text-sm font-medium text-primary">{tier.points}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{tier.reward}</p>
                </div>
              ))}
            </div>
          </motion.section>

          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-[2rem] border border-white/60 bg-white/70 p-6 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/15 text-sky-600">
                <Smartphone className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Smart support & access</h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">OTP login, secure verification, multilingual experience, and quick check-ins all in one place.</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              <button onClick={() => setOtpMode((value) => !value)} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-left text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                <span>{t.otp}</span>
                <span className="text-primary">{otpMode ? 'On' : 'Off'}</span>
              </button>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                <span className="font-semibold">{t.verify}</span> • A confirmation badge appears after account verification.
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                <span>{t.language}</span>
                <select value={language} onChange={(event) => setLanguage(event.target.value)} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm dark:border-slate-700 dark:bg-slate-900">
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                  <QrCode className="h-4 w-4" /> QR check-in
                </button>
                <button className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/80 px-3 py-3 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200">
                  <Volume2 className="h-4 w-4" /> Push ready
                </button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>

      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 rounded-[2rem] border border-white/60 bg-gradient-to-r from-primary/10 via-white/80 to-violet-500/10 p-6 shadow-[0_25px_60px_-25px_rgba(15,23,42,0.35)] backdrop-blur-xl dark:border-slate-800/80 dark:from-primary/20 dark:via-slate-900/70 dark:to-violet-500/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">AI booking assistance</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">Need help choosing a service?</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Ask the in-app assistant for last-minute recommendations, styling advice, and booking support.</p>
          </div>
          <button onClick={() => setChatOpen((value) => !value)} className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900">
            <MessageCircle className="h-4 w-4" /> {t.chatbot}
          </button>
        </div>
        {chatOpen ? (
          <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-white shadow-lg overflow-hidden flex flex-col h-[350px] dark:border-slate-800 dark:bg-slate-950">
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 dark:bg-slate-900 dark:border-slate-800">
              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" /> AI Assistant
              </p>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col gap-2 max-w-[85%]">
                    <div 
                      className={`rounded-2xl px-4 py-2 text-sm ${msg.role === 'user' ? 'text-black font-medium' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}
                      style={msg.role === 'user' ? { backgroundColor: '#e2e8f0' } : {}}
                    >
                      {msg.text}
                    </div>
                    {msg.image && (
                      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700">
                        <img src={msg.image} alt="Generated AI Photo" className="w-full h-auto object-cover max-h-48" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleSendMessage} className="border-t border-slate-100 p-3 bg-white dark:bg-slate-950 dark:border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something..." 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-primary dark:bg-slate-900 dark:border-slate-800 dark:text-white"
              />
              <button type="submit" className="bg-primary text-white rounded-full p-2 w-9 h-9 flex items-center justify-center hover:bg-primary/90 transition-colors">
                <MessageCircle className="h-4 w-4" />
              </button>
            </form>
          </div>
        ) : null}
      </motion.section>
    </PageShell>
  );
};

export default ExtraFeatures;