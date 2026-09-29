import React from 'react';
import { Sparkles, ShieldCheck, Camera, Zap, CheckCircle2 } from 'lucide-react';

interface HeroBannerProps {
  onSelectSet: (tag: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectSet }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ระบบจัดเก็บ & ตรวจสภาพการ์ดระดับสากล ทุกภาษา JP • EN • TH</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              ศูนย์รวมการ์ดหายาก <br />
              <span className="bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 bg-clip-text text-transparent">
                Pokémon & One Piece TCG
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              ดูรูปถ่ายสภาพจริง 4 มุมคมชัดก่อนซื้อ ระบบล็อกสต็อก 15 นาทีระหว่างชำระเงิน ป้องกันสินค้าชนกัน 100% พร้อมการ์ดเกรด PSA 10 / BGS และระบบคำนวณราคาสภาพการ์ดอย่างโปร่งใส
            </p>

            {/* Quick feature tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <Camera className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-xs text-slate-200 font-medium">รูปถ่ายการ์ดจริง 4 มุม</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-slate-200 font-medium">แท้ 100% / PSA Certified</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 p-2.5 rounded-xl col-span-2 sm:col-span-1">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-slate-200 font-medium">ล็อกสต็อก 15 นาที</span>
              </div>
            </div>

            {/* Quick Search Tag Chips */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">ค้นหายอดนิยม:</span>
              {['OP-05 Manga Luffy', 'Van Gogh Pikachu', 'Charizard SAR', 'PSA 10 Slabs', 'Romance Dawn'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSelectSet(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Featured Cards Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm">
              <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-slate-700/80 shadow-2xl shadow-rose-950/40">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 text-xs">
                  <span className="font-bold text-amber-400 flex items-center gap-1">
                    👑 HIGHLIGHT OF THE DAY
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                    PSA 10
                  </span>
                </div>

                <div className="pt-3 flex gap-4 items-center">
                  <div className="w-24 h-34 rounded-lg overflow-hidden bg-slate-950 border border-amber-500/50 shadow-lg relative group shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=400&auto=format&fit=crop&q=80"
                      alt="Monkey D Luffy Manga Rare"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1">
                      <span className="text-[9px] font-bold text-amber-300">OP05-119</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">One Piece TCG • 🇯🇵 JP</span>
                    <h3 className="text-sm font-bold text-white leading-snug">
                      Monkey D. Luffy (Gear 5 Manga Rare)
                    </h3>
                    <div className="text-xs text-slate-300">
                      สภาพ: <span className="font-semibold text-emerald-400">PSA 10 Gem Mint</span>
                    </div>
                    <div className="text-lg font-black text-amber-400">
                      ฿120,000
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> มีสินค้าพร้อมส่ง (1 ใบ)
                  </span>
                  <span>Cert #83921044</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
