import React, { useState } from 'react';
import { MasterCard, ProductInventoryItem, CardCondition, LanguageCode, Currency, UILanguage } from '../types/tcg';
import { formatPrice } from '../utils/formatters';
import { CONDITION_LABELS, CONDITION_MULTIPLIERS, LANGUAGE_METADATA } from '../data/tcgCatalog';
import { X, ZoomIn, ShieldCheck, CheckCircle2, AlertTriangle, ExternalLink, ShoppingBag, Sparkles, Layers, Info } from 'lucide-react';

interface CardDetailModalProps {
  item: ProductInventoryItem;
  masterCard: MasterCard;
  allInventory: ProductInventoryItem[];
  currency: Currency;
  uiLang: UILanguage;
  onClose: () => void;
  onAddToCart: (item: ProductInventoryItem, masterCard: MasterCard) => void;
  isItemInCart: boolean;
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  item: initialItem,
  masterCard,
  allInventory,
  currency,
  uiLang,
  onClose,
  onAddToCart,
  isItemInCart,
}) => {
  // Current active item state (allows switching between variant items in modal)
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>(initialItem.language);
  const [selectedCondition, setSelectedCondition] = useState<CardCondition>(initialItem.condition);
  
  // Find if exact matching SKU exists in inventory, else fallback to initialItem
  const currentItem = allInventory.find(
    (inv) => inv.masterCardId === masterCard.id && inv.language === selectedLanguage && inv.condition === selectedCondition
  ) || initialItem;

  // Active angle photo tab
  const [activeAngle, setActiveAngle] = useState<'front' | 'back' | 'topCorner' | 'bottomCorner'>('front');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  const trans = masterCard.translations[selectedLanguage] || masterCard.translations.EN || masterCard.translations.JP;
  const condInfo = CONDITION_LABELS[currentItem.condition] || { th: currentItem.condition, en: currentItem.condition, ja: currentItem.condition, badgeColor: 'bg-slate-600' };
  const currentPhotoUrl = currentItem.photos[activeAngle] || currentItem.photos.front;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const isPokemon = masterCard.franchise === 'POKEMON';

  // Available languages for this master card
  const availableLanguages: LanguageCode[] = Object.keys(masterCard.translations) as LanguageCode[];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto text-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold uppercase">
              {masterCard.franchise.replace('_', ' ')}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
              {trans.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: 4-Angle Photo Inspector */}
          <div className="lg:col-span-6 space-y-4">
            {/* Interactive Zoomable Viewport */}
            <div
              className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-inner group cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <img
                src={currentPhotoUrl}
                alt={trans.name}
                className={`w-full h-full object-cover transition-transform duration-100 ${
                  isZoomed ? 'scale-175' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      }
                    : undefined
                }
              />

              {/* Angle Label Overlay */}
              <div className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-amber-300 border border-slate-700 shadow">
                มุมมอง: {activeAngle === 'front' ? 'รูปด้านหน้า' : activeAngle === 'back' ? 'รูปด้านหลัง' : activeAngle === 'topCorner' ? 'มุมการ์ดด้านบน' : 'มุมการ์ดด้านล่าง'}
              </div>

              {/* Zoom hint badge */}
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-[11px] text-slate-300 flex items-center gap-1.5 pointer-events-none">
                <ZoomIn className="w-3.5 h-3.5 text-rose-400" />
                <span>เลื่อนเมาส์เพื่อซูมส่องรอย</span>
              </div>
            </div>

            {/* 4-Angle Switcher Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setActiveAngle('front')}
                className={`p-1.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  activeAngle === 'front'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                1. ด้านหน้า
              </button>
              <button
                onClick={() => setActiveAngle('back')}
                className={`p-1.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  activeAngle === 'back'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                2. ด้านหลัง
              </button>
              <button
                onClick={() => setActiveAngle('topCorner')}
                className={`p-1.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  activeAngle === 'topCorner'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                3. มุมบน
              </button>
              <button
                onClick={() => setActiveAngle('bottomCorner')}
                className={`p-1.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  activeAngle === 'bottomCorner'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                4. มุมล่าง
              </button>
            </div>

            {currentItem.note && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex gap-2 items-start">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span><strong>บันทึกสภาพจากผู้ตรวจ:</strong> {currentItem.note}</span>
              </div>
            )}
          </div>

          {/* Right Column: Multi-language Selectors & Details */}
          <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              {/* Language Selector Chips */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  🌐 เลือกภาษาของการ์ด (Multi-Language Version):
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableLanguages.map((lang) => {
                    const meta = LANGUAGE_METADATA[lang] || { label: lang, flag: '🌐' };
                    const isSelected = selectedLanguage === lang;
                    return (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <span>{meta.flag}</span>
                        <span>{lang}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Condition / Grade Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  🏷️ เลือกสภาพการ์ด (Condition & Grade):
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['PSA_10', 'BGS_95', 'NM', 'LP', 'MP'] as CardCondition[]).map((cond) => {
                    const info = CONDITION_LABELS[cond];
                    const isSelected = selectedCondition === cond;
                    return (
                      <button
                        key={cond}
                        onClick={() => setSelectedCondition(cond)}
                        className={`p-2 rounded-xl text-left border transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-rose-500 ring-1 ring-rose-500'
                            : 'bg-slate-800/60 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{cond.replace('_', ' ')}</span>
                          <span className="text-[10px] text-amber-400 font-semibold">
                            x{CONDITION_MULTIPLIERS[cond]}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {info.th}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Graded Certificate Verified Box */}
              {currentItem.certNumber && (
                <div className="p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>ผ่านการรับรองจาก {currentItem.gradingCompany}</span>
                    </div>
                    <div className="text-slate-300 font-mono text-[11px]">
                      Cert #{currentItem.certNumber}
                    </div>
                  </div>
                  <a
                    href={`https://www.psacard.com/cert/${currentItem.certNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center gap-1 text-[11px] transition-colors"
                  >
                    <span>ตรวจสอบ</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Game Card Attributes and Effect */}
              <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                  <span>ชุด: {trans.setName}</span>
                  <span>รหัส: {masterCard.cardNumber}</span>
                </div>
                <div className="text-slate-200 leading-relaxed">
                  <strong className="text-amber-400">เอฟเฟกต์การ์ด:</strong> {trans.effect}
                </div>
                <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-700/60">
                  ผู้วาดภาพประกอบ (Illustrator): <span className="text-slate-200 font-medium">{trans.illustrator}</span>
                </div>
              </div>
            </div>

            {/* Bottom Checkout & Add to Cart Action */}
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">ราคาสุทธิ (Net Price):</span>
                  <span className="text-2xl font-black text-amber-400">
                    {formatPrice(currentItem.calculatedPrice, currency)}
                  </span>
                </div>
                <div className="text-right text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                    <CheckCircle2 className="w-4 h-4" /> ล็อกสิทธิ์ 15 นาทีอัตโนมัติ
                  </span>
                  <span className="text-slate-400 text-[10px]">Zero Overselling Guarantee</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onAddToCart(currentItem, masterCard);
                  onClose();
                }}
                disabled={isItemInCart}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2 transition-all ${
                  isItemInCart
                    ? 'bg-emerald-600 text-white cursor-default'
                    : 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:opacity-95 text-white active:scale-98 shadow-rose-600/30'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isItemInCart ? 'สินค้านี้อยู่ในตะกร้าแล้ว' : 'จองสิทธิ์ & เพิ่มลงตะกร้าทันที'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
