'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Camera, Shield, Wrench, RefreshCw, Sparkles } from 'lucide-react';
import Logo from '@/components/layout/Logo';

interface ChatMessage {
  sender: 'bot' | 'user';
  text: string;
  time: string;
}

const PRESETS = [
  { text: 'How do I sell used gear?', icon: Camera },
  { text: 'Rentals & Deposits info', icon: Sparkles },
  { text: 'Is my payment secure?', icon: Shield },
  { text: 'Repairs & inspection cost', icon: Wrench },
];

export default function LiveChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'bot',
      text: 'Hey creator! 🎥 I am NIRA, your AI gear technician. Ask me anything about buying, selling, renting, or repairing creator equipment!',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typing]);

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg: ChatMessage = {
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let botResponse = '';
      const q = textToSend.toLowerCase();

      if (q.includes('sell') || q.includes('dslr') || q.includes('camera')) {
        botResponse = 'Selling is effortless! Head to the "Sell" page, select your brand/model, rate your gear\'s grade, and get an instant cash offer. We schedule a free doorstep pickup & verify/pay within 24 hours!';
      } else if (q.includes('rent') || q.includes('deposit') || q.includes('mumbai')) {
        botResponse = 'Rentals are protected under NIRA6 Shield. Pay a low daily/hourly rate + a secure security deposit. All rentals go through clean inspection checks before dispatch.';
      } else if (q.includes('secure') || q.includes('payment') || q.includes('razorpay')) {
        botResponse = 'All transactions are 256-bit SSL encrypted via Razorpay. We support UPI, Cards, Netbanking, Cash on Delivery, and Wallet Credits.';
      } else if (q.includes('repair') || q.includes('inspection') || q.includes('fix')) {
        botResponse = 'NIRA6 Certified Technicians repair DSLR cameras, lenses, and drones. Book a service ticket, and we will pick up, diagnose, send a detailed quote, and return with a 6-month warranty!';
      } else if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
        botResponse = 'Hello! Ready to power up your creator setup? Let me know how I can assist with gear recommendations, order returns, or listings today.';
      } else {
        botResponse = 'Great question! As a certified recommerce platform, NIRA6 ensures all gear is 30-point verified. You can also file a ticket in your user Dashboard under "Support" for direct technician responses!';
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setTyping(false);
    }, 1200);
  };

  return (
    <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 transition-all duration-300">
      <AnimatePresence>
        {!open ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="w-14 h-14 bg-nira-dark/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 cursor-pointer relative group transition-all"
          >
            {/* Idle Breathing Pulse Rings */}
            <span className="absolute inset-0 rounded-full bg-nira-yellow/20 animate-ping opacity-75 -z-10" />
            <span className="absolute -inset-1 rounded-full bg-nira-yellow/10 animate-pulse -z-10" />

            <MessageSquare className="w-6 h-6 text-nira-yellow" />
            
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-nira-yellow border-2 border-nira-dark rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-nira-dark rounded-full animate-ping" />
            </span>
            
            <div className="absolute right-16 bg-nira-dark border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-nira-yellow" /> Ask NIRA AI
            </div>
          </motion.button>
        ) : (
          <motion.div
            initial={{ y: 50, scale: 0.9, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, scale: 0.9, opacity: 0 }}
            className="w-[340px] sm:w-[380px] h-[500px] bg-white/95 backdrop-blur-xl rounded-3xl border border-nira-gray-dark shadow-2xl overflow-hidden flex flex-col"
            style={{ boxShadow: '0 12px 50px rgba(0,0,0,0.15)' }}
          >
            {/* Header */}
            <div className="bg-nira-dark text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex items-center py-1">
                  <Logo theme="dark" height={20} width={80} />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-nira-success border-2 border-nira-dark rounded-full animate-pulse" />
                </div>
                <div className="border-l border-white/10 pl-3">
                  <h4 className="font-heading font-bold text-xs tracking-wide">Support Desk</h4>
                  <p className="text-[9px] text-nira-yellow font-semibold flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 animate-spin-slow" /> AI Tech Active
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-nira-gray/20">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-nira-yellow text-nira-dark font-semibold rounded-tr-none' : 'bg-white text-nira-dark shadow-sm border border-nira-gray-dark rounded-tl-none'}`}>
                    <p className="leading-relaxed text-xs">{m.text}</p>
                    <span className="block text-[8px] text-nira-text-secondary mt-1 text-right">{m.time}</span>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl shadow-sm border border-nira-gray-dark rounded-tl-none flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 text-nira-yellow animate-spin" />
                    <span className="text-[9px] text-nira-text-secondary font-medium">NIRA is analyzing...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Presets Grid */}
            {messages.length === 1 && (
              <div className="p-3 border-t border-nira-gray-dark bg-white">
                <p className="text-[9px] text-nira-text-secondary font-bold uppercase tracking-wider mb-2">Common Inquiries</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p.text)}
                      className="p-2 border border-nira-gray-dark hover:border-nira-yellow hover:bg-nira-yellow/5 rounded-xl text-[9px] font-bold text-left text-nira-dark flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <p.icon className="w-3 h-3 text-nira-yellow flex-shrink-0" />
                      <span>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 border-t border-nira-gray-dark bg-white flex gap-2">
              <input
                type="text"
                placeholder="Ask about gear grading, rentals..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
                className="flex-1 px-4 py-2.5 bg-nira-gray rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nira-yellow border border-transparent focus:border-nira-yellow transition-all"
              />
              <button
                onClick={() => handleSendMessage(input)}
                className="w-10 h-10 bg-nira-dark hover:bg-nira-yellow hover:text-nira-dark rounded-xl flex items-center justify-center text-white transition-colors cursor-pointer flex-shrink-0 shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
