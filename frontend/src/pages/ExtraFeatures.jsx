import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Camera, Gift, MessageCircle, QrCode, Sparkles, Volume2, Languages, Smartphone } from 'lucide-react';
import PageShell from '../components/PageShell';

const recommendationCards = [
  { title: 'Soft textured crop', detail: 'Ideal for oval and heart face shapes', vibe: 'Low-maintenance' },
  { title: 'Modern taper fade', detail: 'Balanced and sharp with a clean finish', vibe: 'Professional' },
  { title: 'Wavy side part', detail: 'Adds movement and volume for thicker hair', vibe: 'Stylish' },
];

const galleryItems = [
  { before: 'Before', after: 'After', title: 'Textured crop' },
  { before: 'Before', after: 'After', title: 'Taper fade' },
  { before: 'Before', after: 'After', title: 'Soft waves' },
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
                  <div className="mt-4 h-24 rounded-2xl bg-gradient-to-br from-primary/15 to-violet-500/10" />
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
          <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-white/80 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-200">
            <p className="font-semibold">Assistant</p>
            <p className="mt-2">I can recommend a sharp taper fade for a polished look or a soft textured crop for a more relaxed style.</p>
          </div>
        ) : null}
      </motion.section>
    </PageShell>
  );
};

export default ExtraFeatures;