import React, { useState } from 'react';
import { MasterCard, ProductInventoryItem, Franchise, LanguageCode, CardCondition, ProductType, Currency, UILanguage } from '../types/tcg';
import { CardCard } from './CardCard';
import { LANGUAGE_METADATA } from '../data/tcgCatalog';
import { Filter, SlidersHorizontal, ArrowUpDown, Sparkles, Layers, RefreshCw } from 'lucide-react';

interface CardExplorerProps {
  inventory: ProductInventoryItem[];
  masterCards: MasterCard[];
  activeFranchise: Franchise | 'ALL';
  searchQuery: string;
  currency: Currency;
  uiLang: UILanguage;
  onInspectCard: (item: ProductInventoryItem, masterCard: MasterCard) => void;
  onAddToCart: (item: ProductInventoryItem, masterCard: MasterCard) => void;
  cartItemIds: string[];
}

export const CardExplorer: React.FC<CardExplorerProps> = ({
  inventory,
  masterCards,
  activeFranchise,
  searchQuery,
  currency,
  uiLang,
  onInspectCard,
  onAddToCart,
  cartItemIds,
}) => {
  // Filter States
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | 'ALL'>('ALL');
  const [selectedCondition, setSelectedCondition] = useState<CardCondition | 'ALL'>('ALL');
  const [selectedProductType, setSelectedProductType] = useState<ProductType | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'PRICE_DESC' | 'PRICE_ASC' | 'NEWEST'>('PRICE_DESC');
  const [maxPrice, setMaxPrice] = useState<number>(150000);

  // Map inventory item to its master card
  const getMasterCard = (masterId: string): MasterCard | undefined => {
    return masterCards.find((m) => m.id === masterId);
  };

  // Filter logic
  const filteredItems = inventory.filter((item) => {
    const master = getMasterCard(item.masterCardId);
    if (!master) return false;

    // Franchise filter
    if (activeFranchise !== 'ALL' && master.franchise !== activeFranchise) {
      return false;
    }

    // Language filter
    if (selectedLanguage !== 'ALL' && item.language !== selectedLanguage) {
      return false;
    }

    // Condition filter
    if (selectedCondition !== 'ALL' && item.condition !== selectedCondition) {
      return false;
    }

    // Product Type filter
    if (selectedProductType !== 'ALL' && item.productType !== selectedProductType) {
      return false;
    }

    // Price filter
    if (item.calculatedPrice > maxPrice) {
      return false;
    }

    // Search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchId = master.cardNumber.toLowerCase().includes(q) || master.setCode.toLowerCase().includes(q);
      const matchRarity = master.rarity.toLowerCase().includes(q);
      const matchNames = Object.values(master.translations).some((t) =>
        t.name.toLowerCase().includes(q) || t.setName.toLowerCase().includes(q) || t.effect.toLowerCase().includes(q)
      );
      if (!matchId && !matchRarity && !matchNames) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'PRICE_DESC') {
      return b.calculatedPrice - a.calculatedPrice;
    } else if (sortBy === 'PRICE_ASC') {
      return a.calculatedPrice - b.calculatedPrice;
    } else {
      const masterA = getMasterCard(a.masterCardId);
      const masterB = getMasterCard(b.masterCardId);
      return (masterB?.releaseYear || 0) - (masterA?.releaseYear || 0);
    }
  });

  const resetFilters = () => {
    setSelectedLanguage('ALL');
    setSelectedCondition('ALL');
    setSelectedProductType('ALL');
    setMaxPrice(150000);
    setSortBy('PRICE_DESC');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-rose-500" />
            <span className="font-bold text-sm text-white">ตัวกรองการ์ด (Faceted Filter)</span>
            <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
              พบ {sortedItems.length} รายการ
            </span>
          </div>

          {/* Sort selector */}
          <div className="flex items-center gap-2 text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">จัดเรียงตาม:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-800 text-white rounded-xl px-3 py-1.5 border border-slate-700 outline-none cursor-pointer"
            >
              <option value="PRICE_DESC">ราคาสูงไปต่ำ (High to Low)</option>
              <option value="PRICE_ASC">ราคาต่ำไปสูง (Low to High)</option>
              <option value="NEWEST">ชุดออกใหม่ล่าสุด</option>
            </select>

            <button
              onClick={resetFilters}
              className="ml-2 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>รีเซ็ต</span>
            </button>
          </div>
        </div>

        {/* Filter Badges and Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Language filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">ภาษา (Language):</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as any)}
              className="w-full bg-slate-800 text-white rounded-xl px-2.5 py-2 border border-slate-700 outline-none"
            >
              <option value="ALL">🌐 ทุกภาษา (All Languages)</option>
              <option value="JP">🇯🇵 ญี่ปุ่น (JP)</option>
              <option value="EN">🇺🇸 อังกฤษ (EN)</option>
              <option value="TH">🇹🇭 ไทย (TH)</option>
            </select>
          </div>

          {/* Condition filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">สภาพ / เกรด:</label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as any)}
              className="w-full bg-slate-800 text-white rounded-xl px-2.5 py-2 border border-slate-700 outline-none"
            >
              <option value="ALL">🏷️ ทุกสภาพ (All Conditions)</option>
              <option value="PSA_10">PSA 10 Gem Mint</option>
              <option value="BGS_95">BGS 9.5 Gem Mint</option>
              <option value="NM">Near Mint (NM)</option>
              <option value="LP">Lightly Played (LP)</option>
            </select>
          </div>

          {/* Product Type filter */}
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">ประเภทสินค้า:</label>
            <select
              value={selectedProductType}
              onChange={(e) => setSelectedProductType(e.target.value as any)}
              className="w-full bg-slate-800 text-white rounded-xl px-2.5 py-2 border border-slate-700 outline-none"
            >
              <option value="ALL">📦 ทุกประเภท (All Types)</option>
              <option value="SINGLE">🃏 การ์ดใบเดี่ยว (Single Cards)</option>
              <option value="GRADED">🛡️ การ์ดเกรดกรอบใส (Graded Slabs)</option>
            </select>
          </div>

          {/* Max Price Range Slider */}
          <div>
            <div className="flex justify-between text-[11px] text-slate-400 mb-1">
              <span>ราคาสูงสุด:</span>
              <span className="font-bold text-amber-400">฿{maxPrice.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="150000"
              step="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Cards Showcase Grid */}
      {sortedItems.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/60 rounded-3xl border border-slate-800 space-y-3">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-300">ไม่พบการ์ดที่ตรงตามเงื่อนไข</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            ลองปรับเปลี่ยนตัวกรองภาษา สภาพการ์ด หรือล้างคำค้นหาเพื่อดูสินค้าอื่นๆ ในคลัง
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedItems.map((item) => {
            const master = getMasterCard(item.masterCardId);
            if (!master) return null;
            return (
              <CardCard
                key={item.id}
                item={item}
                masterCard={master}
                currency={currency}
                uiLang={uiLang}
                onInspect={(it, mc) => onInspectCard(it, mc)}
                onAddToCart={(it, mc) => onAddToCart(it, mc)}
                isItemInCart={cartItemIds.includes(item.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
