import React from 'react';
import { Sparkles, ShieldCheck, Camera, Zap, LogIn, ArrowRight } from 'lucide-react';
import { User } from '../types/tcg';

interface HeroBannerProps {
  onSelectSet: (tag: string) => void;
  onOpenLogin: () => void;
  currentUser: User | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectSet, onOpenLogin, currentUser }) => {
  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email.toLowerCase() === 'seree999@gmail.com';

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-b border-slate-800 py-10 px-4 sm:px-6 lg:px-8">
      {/* Background glow accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headline */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ระบบจัดเก็บ & ตรวจสภาพการ์ดระดับสากล ทุกภาษา JP • EN • TH</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium">
                Cloudflare D1 Database
              </span>
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

            {/* Login Call to Action Bar */}
            <div className="pt-1">
              {currentUser ? (
                <div className="p-3 bg-gradient-to-r from-emerald-500/15 to-slate-800/80 border border-emerald-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-sm">
                      ✓
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        เข้าสู่ระบบในชื่อ: {currentUser.name}
                        {isAdmin && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 rounded font-bold border border-amber-500/30">
                            👑 ผู้ดูแลระบบ (ADMIN)
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {currentUser.email} • เครดิตคงเหลือ ฿{currentUser.store_credit.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-rose-600 hover:from-blue-500 hover:to-rose-500 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 transition group active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบด้วย Google / Gmail (หรือสิทธิ์แอดมิน seree999)</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </button>
              )}
            </div>

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
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Featured Card Showcase */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-800/90 to-slate-900/90 p-5 rounded-3xl border border-slate-700/80 shadow-2xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  👑 HIGHLIGHT OF THE DAY
                </span>
                <span className="px-2 py-0.5 bg-rose-500/20 text-rose-300 text-[10px] font-extrabold rounded-md border border-rose-500/30">
                  PSA 10
                </span>
              </div>

              <div className="relative aspect-4/3 rounded-2xl overflow-hidden mb-4 border border-slate-700 bg-slate-950">
                <img
                  src="https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&auto=format&fit=crop&q=80"
                  alt="Manga Luffy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-xs rounded text-[10px] text-amber-400 font-mono font-bold">
                  OP05-119
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 font-medium">ONE PIECE TCG • JP</div>
                <div className="text-base font-extrabold text-white leading-tight">
                  Monkey D. Luffy (Gear 5 Manga Rare)
                </div>
                <div className="text-xs text-emerald-400 font-medium">สภาพ: PSA 10 Gem Mint</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <div>
                  <div className="text-xl font-black text-amber-400">฿120,000</div>
                  <div className="text-[10px] text-slate-400">สต็อกคงเหลือ 1 ใบ</div>
                </div>
                <button
                  onClick={() => onSelectSet('OP-05')}
                  className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 text-white rounded-xl text-xs font-bold hover:shadow-lg hover:shadow-rose-600/30 transition cursor-pointer"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
