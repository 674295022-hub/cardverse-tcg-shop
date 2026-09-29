import React from 'react';
import { CartItem, Currency, UILanguage } from '../types/tcg';
import { formatPrice } from '../utils/formatters';
import { CONDITION_LABELS } from '../data/tcgCatalog';
import { X, Trash2, ShieldCheck, Clock, ArrowRight, ShoppingBag, Sparkles, Package } from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (skuId: string) => void;
  onProceedToCheckout: () => void;
  currency: Currency;
  uiLang: UILanguage;
  timeRemaining: number | null;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onProceedToCheckout,
  currency,
  timeRemaining,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.inventoryItem.calculatedPrice * item.quantity, 0);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white shadow-2xl flex flex-col justify-between">
          {/* Drawer Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-rose-500" />
              <h2 className="font-bold text-lg text-white">ตะกร้าสินค้า ({cartItems.length})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 15-Minute Reservation Banner */}
          {cartItems.length > 0 && timeRemaining !== null && (
            <div className="bg-gradient-to-r from-amber-600/20 via-rose-600/20 to-amber-600/20 border-y border-amber-500/30 p-3 px-5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Clock className="w-4 h-4 animate-spin text-amber-400" />
                <span>เวลาจองสิทธิ์สินค้าคงเหลือ:</span>
              </div>
              <span className="font-mono font-bold text-sm text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-500/40">
                {formatCountdown(timeRemaining)}
              </span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                  <Package className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">ยังไม่มีการ์ดในตะกร้า</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  เลือกการ์ดใบเดี่ยวหรือการ์ดเกรดที่คุณชื่นชอบเพื่อล็อกสิทธิ์เป็นเจ้าของได้ทันที
                </p>
              </div>
            ) : (
              cartItems.map((cartItem) => {
                const trans = cartItem.masterCard.translations[cartItem.inventoryItem.language] || cartItem.masterCard.translations.EN;
                const cond = CONDITION_LABELS[cartItem.inventoryItem.condition];
                return (
                  <div
                    key={cartItem.inventoryItem.id}
                    className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex gap-3 items-center justify-between"
                  >
                    <div className="w-14 h-18 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-700">
                      <img
                        src={cartItem.inventoryItem.photos.front}
                        alt={trans.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="font-bold text-rose-400">{cartItem.inventoryItem.language}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 truncate">{cartItem.masterCard.cardNumber}</span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{trans.name}</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-amber-400 font-bold">
                          {formatPrice(cartItem.inventoryItem.calculatedPrice, currency)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {cartItem.inventoryItem.condition.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveItem(cartItem.inventoryItem.id)}
                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-900/90 space-y-4">
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>ยอดรวมสินค้า ({cartItems.length} รายการ):</span>
                  <span className="font-semibold text-slate-200">{formatPrice(subtotal, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>การแพ็คกิ้งการ์ด:</span>
                  <span className="text-emerald-400 font-medium">ใส่ซองแก้ว + ดามหนา ฟรี</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>ยอดสุทธิ (Subtotal):</span>
                  <span className="text-lg font-black text-amber-400">{formatPrice(subtotal, currency)}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                <span>ดำเนินการชำระเงิน (Checkout)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
