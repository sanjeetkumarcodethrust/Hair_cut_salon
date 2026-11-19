import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  MessageCircle,
  Sparkles,
  Send,
  X,
  Star,
  MapPin,
  ExternalLink,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import api from '../services/api';

const DEFAULT_SALON_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';

const QUICK_PROMPTS = [
  { label: '📸 Watch whole salon', prompt: 'watch whole salon' },
  { label: '🏢 Show salon photos', prompt: 'show me images of all the salon' },
  { label: '✂️ Taper fade photo', prompt: 'photo of modern taper fade' },
  { label: '💰 Haircut pricing', prompt: 'What are the haircut prices?' },
];

const CutMateChatbot = ({ embedded = false, onClose = null }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      role: 'ai',
      text: 'Hi there! 👋 I am CutMate AI Assistant. Ask me to "watch whole salon" or "show all salons" to see real photos, ratings, and details of all our salons!',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Lightbox / Photo Viewer Modal state
  const [activeGallerySalon, setActiveGallerySalon] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: promptText,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', { prompt: promptText });
      if (response.data && response.data.success) {
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: response.data.reply || 'Here is what I found for you:',
          image: response.data.imageUrl || null,
          salons: Array.isArray(response.data.salons) ? response.data.salons : null,
          type: response.data.type || 'text',
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: 'ai',
            text: "I'm having a little trouble retrieving the data right now. Please try asking again!",
          },
        ]);
      }
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'ai',
          text: 'Sorry, I ran into an issue connecting to the salon server. Please try again in a moment.',
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const openGallery = (salon, index = 0) => {
    setActiveGallerySalon(salon);
    setActiveImageIndex(index);
  };

  const closeGallery = () => {
    setActiveGallerySalon(null);
    setActiveImageIndex(0);
  };

  const handlePrevImage = () => {
    if (!activeGallerySalon || !activeGallerySalon.images) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? activeGallerySalon.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!activeGallerySalon || !activeGallerySalon.images) return;
    setActiveImageIndex((prev) =>
      prev === activeGallerySalon.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div
      className={`flex flex-col bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
        embedded
          ? 'w-full h-[520px] sm:h-[600px]'
          : isExpanded
          ? 'w-full sm:w-[720px] h-[85vh] max-h-[850px]'
          : 'w-full sm:w-[440px] h-[580px] max-h-[90vh]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-950/80 border-b border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              CutMate AI Assistant
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <p className="text-[11px] text-slate-400">Ask to watch salons, view photos & prices</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!embedded && (
            <button
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Message Bubble */}
            <div
              className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-md shadow-amber-500/10'
                  : 'bg-white/10 text-slate-100 rounded-bl-none border border-white/10 shadow-sm'
              }`}
            >
              {msg.text}
            </div>

            {/* Generated AI Hairstyle Photo */}
            {msg.image && !msg.salons && (
              <div className="mt-2.5 max-w-[85%] rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-slate-950">
                <img
                  src={msg.image}
                  alt="Hairstyle inspiration"
                  className="w-full h-auto max-h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}

            {/* Salons List with Photos and Details */}
            {msg.salons && msg.salons.length > 0 && (
              <div className="mt-3 w-full">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Available Salons ({msg.salons.length})
                  </span>
                  <span className="text-[11px] text-slate-400">Click any card to watch photos</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {msg.salons.map((salon, sIdx) => {
                    const primaryImg =
                      salon.primaryImage ||
                      (Array.isArray(salon.images) && salon.images[0]) ||
                      DEFAULT_SALON_IMAGE;
                    const imagesCount = Array.isArray(salon.images) ? salon.images.length : 1;

                    return (
                      <div
                        key={salon._id || sIdx}
                        className="group rounded-2xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-md hover:border-amber-500/50 hover:shadow-amber-500/10 transition-all flex flex-col"
                      >
                        {/* Salon Image */}
                        <div className="relative h-40 w-full overflow-hidden bg-slate-900 cursor-pointer" onClick={() => openGallery(salon, 0)}>
                          <img
                            src={primaryImg}
                            alt={salon.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = DEFAULT_SALON_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                          {/* Rating Badge */}
                          <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-amber-400 border border-white/10">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{salon.rating || 4.8}</span>
                            <span className="text-[10px] text-slate-300">({salon.totalReviews || 35})</span>
                          </div>

                          {/* Photo Count Tag */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white border border-white/10 group-hover:bg-amber-500 group-hover:text-slate-950 transition">
                            <ImageIcon className="w-3 h-3" />
                            <span>{imagesCount} {imagesCount === 1 ? 'photo' : 'photos'}</span>
                          </div>

                          {/* Active Offer */}
                          {salon.activeOffer && (
                            <div className="absolute bottom-2.5 left-2.5 rounded-md bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold text-slate-950 uppercase tracking-wider shadow">
                              {salon.activeOffer}
                            </div>
                          )}
                        </div>

                        {/* Salon Info */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-amber-400 transition">
                              {salon.name}
                            </h4>
                            <p className="mt-1 flex items-center gap-1 text-xs text-slate-300 line-clamp-1">
                              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span>{salon.address || `${salon.city}, ${salon.state || ''}`}</span>
                            </p>
                            {salon.description && (
                              <p className="mt-1.5 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                                {salon.description}
                              </p>
                            )}
                          </div>

                          {/* Price & Action Buttons */}
                          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Starts at</span>
                              <span className="text-xs font-bold text-amber-400">
                                ₹{salon.startingPrice || 150}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openGallery(salon, 0)}
                                className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/15 text-slate-200 px-2.5 py-1.5 text-xs font-medium transition flex items-center gap-1"
                                title="View full gallery"
                              >
                                <ImageIcon className="w-3 h-3 text-amber-400" />
                                <span>Photos</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onClose) onClose();
                                  navigate(`/salons/${salon._id}`);
                                }}
                                className="rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-xs transition flex items-center gap-1 shadow-md shadow-amber-500/10"
                              >
                                <span>Book</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 w-fit">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-500" />
            <span>Finding salon pictures and details for you...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestions */}
      <div className="px-4 py-2 border-t border-white/5 bg-slate-950/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {QUICK_PROMPTS.map((item) => (
          <button
            key={item.label}
            type="button"
            disabled={loading}
            onClick={() => handleSend(item.prompt)}
            className="shrink-0 text-xs rounded-full border border-white/10 bg-white/5 hover:bg-white/15 hover:border-amber-500/40 px-3 py-1 text-slate-300 hover:text-white transition disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-950 border-t border-white/10 flex items-center gap-2"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask "watch whole salon" or "show photos"...'
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center transition disabled:opacity-40 disabled:hover:bg-amber-500 shadow-md shadow-amber-500/20 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* In-Chat Lightbox / Full Salon Photo Viewer Modal */}
      {activeGallerySalon && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{activeGallerySalon.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
                    ⭐ {activeGallerySalon.rating || 4.8}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{activeGallerySalon.address || activeGallerySalon.city}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeGallery();
                    if (onClose) onClose();
                    navigate(`/salons/${activeGallerySalon._id}`);
                  }}
                  className="rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-1.5 text-xs transition flex items-center gap-1"
                >
                  <span>Book Now</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={closeGallery}
                  className="p-1.5 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/15 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Image Display */}
            <div className="relative h-[320px] sm:h-[450px] w-full bg-black flex items-center justify-center overflow-hidden">
              <img
                src={
                  (activeGallerySalon.images && activeGallerySalon.images[activeImageIndex]) ||
                  activeGallerySalon.primaryImage ||
                  DEFAULT_SALON_IMAGE
                }
                alt={`${activeGallerySalon.name} photo ${activeImageIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {/* Navigation Arrows */}
              {activeGallerySalon.images && activeGallerySalon.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter overlay */}
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-medium text-white border border-white/10">
                {activeImageIndex + 1} / {(activeGallerySalon.images && activeGallerySalon.images.length) || 1}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {activeGallerySalon.images && activeGallerySalon.images.length > 1 && (
              <div className="p-3 bg-slate-950 flex items-center gap-2 overflow-x-auto border-t border-white/10 justify-center">
                {activeGallerySalon.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`h-14 w-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/20'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CutMateChatbot;
