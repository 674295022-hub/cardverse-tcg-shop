import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User as UserIcon, Sparkles, RefreshCw, ShoppingBag, ShieldCheck } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'สวัสดีครับ! ยินดีต้อนรับสู่ CardVerse TCG Shop ⚡ ผม CardBot ผู้ช่วย AI ยินดีให้คำแนะนำสต็อกการ์ด, สภาพการ์ด PSA 10, หรือระบบสั่งซื้อครับ มีอะไรให้ผมช่วยเหลือไหมครับ?',
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsLoading(true);

    try {
      // Build conversation history payload
      const payloadMessages = messages
        .filter((m) => m.id !== 'welcome')
        .concat(userMsg)
        .map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          message: text,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json() as { success: boolean; reply: string };
      const botMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'ขออภัยครับ ไม่สามารถรับคำตอบได้ในขณะนี้',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.warn('Chat API error fallback:', err);
      // Client-side fallback if offline
      let localReply = 'ขออภัยครับ ระบบแชทกำลังเชื่อมต่อฐานข้อมูล กรุณาลองใหม่อีกครั้ง';
      const lower = text.toLowerCase();
      if (lower.includes('สต็อก') || lower.includes('การ์ด')) {
        localReply = 'ปัจจุบันร้านเรามีการ์ดเด่น เช่น Monkey D. Luffy Gear 5 Manga Rare (PSA 10), Charizard ex SAR (SV4a) และ Pikachu Van Gogh พร้อมส่งครับ!';
      } else if (lower.includes('สภาพ') || lower.includes('psa')) {
        localReply = 'เราถ่ายภาพการ์ดจริง 4 มุมคมชัดทุกใบ สภาพมีตั้งแต่ PSA 10, NM (Near Mint), LP จนถึงการ์ดเกรดพร้อมใบเซอร์ครับ';
      }

      const fallbackMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        sender: 'bot',
        text: localReply,
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    '🔥 เช็คสต็อกการ์ดเด่น',
    '✨ มาตรฐานสภาพการ์ด PSA / NM',
    '⏱️ ระบบล็อกสต็อก 15 นาทีคืออะไร?',
    '💰 ขายการ์ด Buy-list ได้โบนัสเท่าไหร่?',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group flex items-center gap-2.5 bg-gradient-to-r from-rose-600 via-amber-500 to-indigo-600 p-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all text-white cursor-pointer"
          title="คุยกับ CardBot (AI Assistant)"
        >
          <div className="relative">
            <Bot className="w-7 h-7" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="hidden md:inline font-bold text-xs pr-1 tracking-wide">
            แชทกับ CardBot AI
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-700 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900/40 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Bot className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="font-extrabold text-sm flex items-center gap-1.5 leading-tight">
                  CardBot AI Assistant
                  <span className="px-1.5 py-0.2 bg-emerald-500/30 text-emerald-300 text-[10px] rounded-full border border-emerald-400/40">
                    Online
                  </span>
                </div>
                <div className="text-[11px] text-white/80">
                  Cloudflare Workers AI & D1 Database
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/20 transition cursor-pointer text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/80 scrollbar-thin scrollbar-thumb-slate-800">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-rose-600 text-white rounded-tr-none shadow-md'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-tl-none whitespace-pre-line shadow'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`block text-[9px] mt-1 text-right ${
                      m.sender === 'user' ? 'text-rose-200' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 text-xs text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>CardBot กำลังคิดและประมวลผล...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ''))}
                className="shrink-0 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition active:scale-95 cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="พิมพ์ถามเกี่ยวกับการ์ด, สต็อก, สภาพ..."
                disabled={isLoading}
                className="flex-1 bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
