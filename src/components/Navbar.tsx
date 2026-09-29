import React from 'react';
import { Franchise, Currency, UILanguage, User } from '../types/tcg';
import { Search, ShoppingBag, ShieldCheck, Layers, Globe2, UserCheck, LogOut, Wallet, LogIn } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

interface NavbarProps {
  activeFranchise: Franchise | 'ALL';
  setActiveFranchise: (f: Franchise | 'ALL') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  uiLang: UILanguage;
  setUiLang: (l: UILanguage) => void;
  cartCount: number;
  openCart: () => void;
  activeView: 'SHOP' | 'ADMIN' | 'LOGIN';
  setActiveView: (v: 'SHOP' | 'ADMIN' | 'LOGIN') => void;
  reservationTimeRemaining: number | null;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeFranchise,
  setActiveFranchise,
  searchQuery,
  setSearchQuery,
  currency,
  setCurrency,
  uiLang,
  setUiLang,
  cartCount,
  openCart,
  activeView,
  setActiveView,
  reservationTimeRemaining,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email.toLowerCase() === 'seree999@gmail.com';

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top micro-bar */}
      <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-600 py-1 px-4 text-xs font-medium text-center text-white flex justify-between items-center">
        <span className="hidden sm:inline">
          ✨ เชื่อมต่อ Cloudflare D1 Database • สิทธิ์แอดมิน: seree999@gmail.com • การ์ดแท้ 100%
        </span>
        <div className="flex items-center gap-4 mx-auto sm:mx-0">
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded text-amber-300 font-semibold text-[11px]">
              <Wallet className="w-3 h-3 text-amber-400" />
              <span>Store Credit: ฿{currentUser.store_credit.toLocaleString()}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" />
            <select
              value={uiLang}
              onChange={(e) => setUiLang(e.target.value as UILanguage)}
              className="bg-black/30 text-white rounded px-1.5 py-0.5 text-xs outline-hidden border border-white/20 cursor-pointer"
            >
              <option value="th">ภาษาไทย (TH)</option>
              <option value="en">English (EN)</option>
              <option value="ja">日本語 (JA)</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold">สกุลเงิน:</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="bg-black/30 text-white rounded px-1.5 py-0.5 text-xs outline-hidden border border-white/20 cursor-pointer"
            >
              <option value="THB">THB (฿)</option>
              <option value="USD">USD ($)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('SHOP')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-rose-400 text-xl tracking-tighter">
                CV
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  CardVerse
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded uppercase tracking-wider">
                  TCG Shop
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide">Pokémon & One Piece Multi-Language</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อการ์ด, รหัสชุด (OP-05, SV4a), รหัสการ์ด, มังงะแรร์, SAR..."
                className="w-full bg-slate-800/80 text-sm text-slate-100 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2.5 border border-slate-700/80 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white bg-slate-700 px-1.5 py-0.5 rounded"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Admin Switcher - If Admin or seree999 */}
            {isAdmin && (
              <button
                onClick={() => setActiveView(activeView === 'SHOP' ? 'ADMIN' : 'SHOP')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  activeView === 'ADMIN'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">
                  {activeView === 'SHOP' ? 'จัดการหลังบ้าน (Admin POS)' : 'กลับหน้าร้าน (Shop)'}
                </span>
              </button>
            )}

            {/* Google User Profile or Login Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 px-2.5 py-1.5 rounded-xl text-xs">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px] overflow-hidden">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-semibold text-slate-200 text-xs leading-none flex items-center gap-1">
                    {currentUser.name}
                    {isAdmin && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1 rounded font-bold">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 leading-none mt-0.5 truncate max-w-[110px]">
                    {currentUser.email}
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="ออกจากระบบ"
                  className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-slate-700 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-900 px-3 py-2 rounded-xl text-xs font-bold shadow-md transition active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">เข้าสู่ระบบ Google</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

            {/* Cart Button with 15-min reservation indicator */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">ตะกร้า</span>
              {cartCount > 0 && (
                <span className="bg-white text-rose-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อการ์ด, รหัสชุด, มังงะแรร์..."
              className="w-full bg-slate-800 text-sm text-slate-100 placeholder-slate-400 rounded-xl pl-10 pr-4 py-2 border border-slate-700"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>
        </div>

        {/* Franchise Category Selector */}
        <div className="flex items-center gap-2 pb-2.5 overflow-x-auto text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveFranchise('ALL')}
            className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-all ${
              activeFranchise === 'ALL'
                ? 'bg-slate-100 text-slate-900 shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            🔥 ทั้งหมด (All TCG)
          </button>
          <button
            onClick={() => setActiveFranchise('POKEMON')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeFranchise === 'POKEMON'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-amber-400 hover:bg-slate-800'
            }`}
          >
            ⚡ Pokémon TCG (โปเกมอน)
          </button>
          <button
            onClick={() => setActiveFranchise('ONE_PIECE')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 whitespace-nowrap transition-all ${
              activeFranchise === 'ONE_PIECE'
                ? 'bg-rose-500 text-white shadow'
                : 'text-slate-400 hover:text-rose-400 hover:bg-slate-800'
            }`}
          >
            🏴‍☠️ One Piece Card Game (วันพีช)
          </button>

          {reservationTimeRemaining !== null && reservationTimeRemaining > 0 && (
            <div className="ml-auto flex items-center gap-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-full text-xs animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
              <span>กำลังล็อกสิทธิ์สินค้า: <strong>{formatTime(reservationTimeRemaining)}</strong></span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
