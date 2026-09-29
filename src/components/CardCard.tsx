import React from 'react';
import { MasterCard, ProductInventoryItem, Currency, UILanguage } from '../types/tcg';
import { formatPrice } from '../utils/formatters';
import { CONDITION_LABELS, LANGUAGE_METADATA } from '../data/tcgCatalog';
import { Eye, ShoppingBag, ShieldCheck, Sparkles, Clock, AlertCircle } from 'lucide-react';

interface CardCardProps {
  item: ProductInventoryItem;
  masterCard: MasterCard;
  currency: Currency;
  uiLang: UILanguage;
  onInspect: (item: ProductInventoryItem, masterCard: MasterCard) => void;
  onAddToCart: (item: ProductInventoryItem, masterCard: MasterCard) => void;
  isItemInCart: boolean;
}

export const CardCard: React.FC<CardCardProps> = ({
  item,
  masterCard,
  currency,
  uiLang,
  onInspect,
  onAddToCart,
  isItemInCart,
}) => {
  const trans = masterCard.translations[item.language] || masterCard.translations.EN || masterCard.translations.JP;
  const condInfo = CONDITION_LABELS[item.condition] || { th: item.condition, en: item.condition, ja: item.condition, badgeColor: 'bg-slate-600' };
  const langMeta = LANGUAGE_METADATA[item.language] || { label: item.language, flag: '🌐' };

  const isPokemon = masterCard.franchise === 'POKEMON';
  const isSingle = item.productType === 'SINGLE' || item.productType === 'GRADED';
  const isAvailable = item.status === 'AVAILABLE' && item.stockQuantity > 0;
  const isReserved = item.status === 'RESERVED';

  return (
    <div className="group relative bg-slate-800/90 rounded-2xl border border-slate-700/80 overflow-hidden hover:border-rose-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-rose-950/20 flex flex-col justify-between">
      {/* Top Media Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 cursor-pointer" onClick={() => onInspect(item, masterCard)}>
        <img
          src={item.photos.front}
          alt={trans.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Gradient overlays for visual punch */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/40 pointer-events-none"></div>

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          {/* Franchise & Language Flag */}
          <div className="flex items-center gap-1 bg-slate-900/85 backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/70 text-[11px] font-bold text-white shadow">
            <span>{langMeta.flag}</span>
            <span>{item.language}</span>
          </div>

          {/* Condition / Grade Badge */}
          <div className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow ${condInfo.badgeColor}`}>
            {item.condition.replace('_', ' ')}
          </div>
        </div>

        {/* Rarity & Card ID Badge at bottom of image */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none text-xs">
          <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-amber-300 font-bold text-[10px]">
            {masterCard.rarity}
          </span>
          <span className="font-mono text-[10px] text-slate-300 bg-black/60 px-1.5 py-0.5 rounded">
            {masterCard.cardNumber}
          </span>
        </div>

        {/* Quick Inspection Overlay on Hover */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
          <span className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 shadow-lg">
            <Eye className="w-3.5 h-3.5 text-rose-400" /> ตรวจรูปจริง 4 มุม
          </span>
        </div>
      </div>

      {/* Card Content Information */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Set Name */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">{trans.setName}</span>
            <span className="shrink-0 text-[10px] text-slate-500 uppercase">{masterCard.setCode}</span>
          </div>

          {/* Card Name */}
          <h3
            onClick={() => onInspect(item, masterCard)}
            className="text-sm font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-2 mt-1 cursor-pointer leading-snug"
          >
            {trans.name}
          </h3>

          {/* Special Game Attributes preview */}
          <div className="flex flex-wrap gap-1 mt-2 text-[10px] font-semibold text-slate-300">
            {isPokemon ? (
              <>
                {masterCard.attributes.pokemonType && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/60">
                    ⚡ {masterCard.attributes.pokemonType}
                  </span>
                )}
                {masterCard.attributes.hp && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/60 text-emerald-400">
                    HP {masterCard.attributes.hp}
                  </span>
                )}
              </>
            ) : (
              <>
                {masterCard.attributes.color && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/60">
                    🎨 {masterCard.attributes.color}
                  </span>
                )}
                {masterCard.attributes.power && (
                  <span className="px-1.5 py-0.5 rounded bg-slate-700/60 border border-slate-600/60 text-amber-400">
                    ⚔️ {masterCard.attributes.power.toLocaleString()}
                  </span>
                )}
              </>
            )}
            {item.certNumber && (
              <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono">
                Cert #{item.certNumber}
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Section */}
        <div className="pt-2 border-t border-slate-700/70 space-y-2.5">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">ราคาตามสภาพ:</span>
              <span className="text-base font-black text-amber-400">
                {formatPrice(item.calculatedPrice, currency)}
              </span>
            </div>

            {/* Stock quantity badge */}
            <div className="text-right">
              {isReserved ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  <Clock className="w-3 h-3 animate-spin" /> ติดจอง 15 นาที
                </span>
              ) : isAvailable ? (
                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  {item.stockQuantity === 1 ? 'เหลือ 1 ใบเท่านั้น' : `มีสินค้า (${item.stockQuantity} ชิ้น)`}
                </span>
              ) : (
                <span className="text-[10px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                  สินค้าหมด
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onInspect(item, masterCard)}
              className="px-2 py-2 rounded-xl bg-slate-700/70 hover:bg-slate-600 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1 border border-slate-600 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>ตรวจ 4 มุม</span>
            </button>

            <button
              onClick={() => onAddToCart(item, masterCard)}
              disabled={!isAvailable || isReserved || isItemInCart}
              className={`px-2 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow transition-all ${
                isItemInCart
                  ? 'bg-emerald-600 text-white cursor-default'
                  : !isAvailable || isReserved
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white active:scale-95'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{isItemInCart ? 'ในตะกร้าแล้ว' : 'ใส่ตะกร้า'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
