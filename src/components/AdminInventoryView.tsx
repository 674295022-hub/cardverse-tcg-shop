import React, { useState } from 'react';
import { MasterCard, ProductInventoryItem, CardCondition, Order, Currency } from '../types/tcg';
import { formatPrice } from '../utils/formatters';
import { CONDITION_LABELS, LANGUAGE_METADATA } from '../data/tcgCatalog';
import { Package, Plus, RefreshCw, Truck, CheckCircle2, ShieldCheck, Camera, Layers, Edit3, Trash2 } from 'lucide-react';

interface AdminInventoryViewProps {
  inventory: ProductInventoryItem[];
  masterCards: MasterCard[];
  orders: Order[];
  currency: Currency;
  onUpdateStock: (skuId: string, newStock: number) => void;
  onAddNewSku: (item: ProductInventoryItem) => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus']) => void;
}

export const AdminInventoryView: React.FC<AdminInventoryViewProps> = ({
  inventory,
  masterCards,
  orders,
  currency,
  onUpdateStock,
  onAddNewSku,
  onUpdateOrderStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'ORDERS' | 'ADD_CARD'>('INVENTORY');

  // Form states for adding new SKU
  const [selectedMasterId, setSelectedMasterId] = useState(masterCards[0]?.id || 'op05-119');
  const [newLanguage, setNewLanguage] = useState<'JP' | 'EN' | 'TH'>('JP');
  const [newCondition, setNewCondition] = useState<CardCondition>('NM');
  const [newBasePrice, setNewBasePrice] = useState<number>(5000);
  const [newStock, setNewStock] = useState<number>(1);
  const [newCertNumber, setNewCertNumber] = useState<string>('');
  const [newNote, setNewNote] = useState<string>('ผ่านการตรวจสอบสภาพกริบ พร้อมซองใส');
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?w=800&auto=format&fit=crop&q=80');

  const handleAddSkuSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSku: ProductInventoryItem = {
      id: `SKU-${Date.now().toString().slice(-6)}`,
      masterCardId: selectedMasterId,
      language: newLanguage,
      productType: newCondition.startsWith('PSA') || newCondition.startsWith('BGS') ? 'GRADED' : 'SINGLE',
      condition: newCondition,
      certNumber: newCertNumber || undefined,
      gradingCompany: newCondition.startsWith('PSA') ? 'PSA' : newCondition.startsWith('BGS') ? 'BGS' : undefined,
      basePrice: newBasePrice,
      calculatedPrice: newBasePrice,
      stockQuantity: newStock,
      status: 'AVAILABLE',
      photos: {
        front: newPhotoUrl,
        back: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80',
        topCorner: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
        bottomCorner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
      },
      note: newNote,
    };

    onAddNewSku(newSku);
    setActiveTab('INVENTORY');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-6">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/80 border border-slate-700 p-6 rounded-3xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold uppercase">
              Staff Portal
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">ระบบจัดการคลังการ์ดและคำสั่งซื้อ</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            ปรับปรุงสต็อกแบบ Zero-Overselling, อัปเดตสภาพการ์ดรายใบ และจัดการการส่งของ
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'INVENTORY' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            📦 คลังสินค้า ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`px-3.5 py-2 rounded-xl transition-all ${
              activeTab === 'ORDERS' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            🧾 รายการสั่งซื้อ ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('ADD_CARD')}
            className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-1 ${
              activeTab === 'ADD_CARD' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มสต็อกการ์ด</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Inventory Table */}
      {activeTab === 'INVENTORY' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-4">SKU / การ์ด</th>
                  <th className="p-4">ภาษา</th>
                  <th className="p-4">สภาพ / เกรด</th>
                  <th className="p-4">ราคาตั้งขาย</th>
                  <th className="p-4">สต็อกปัจจุบัน</th>
                  <th className="p-4">สถานะ</th>
                  <th className="p-4 text-center">ปรับสต็อก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {inventory.map((item) => {
                  const master = masterCards.find((m) => m.id === item.masterCardId);
                  const trans = master?.translations[item.language] || master?.translations.EN;
                  const cond = CONDITION_LABELS[item.condition];
                  const lang = LANGUAGE_METADATA[item.language];
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.photos.front}
                            alt=""
                            className="w-10 h-13 object-cover rounded bg-slate-950 shrink-0 border border-slate-700"
                          />
                          <div>
                            <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                            <div className="font-bold text-white text-xs">{trans?.name || item.masterCardId}</div>
                            <div className="text-[10px] text-slate-400">{master?.cardNumber} • {master?.rarity}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-medium">{lang?.flag} {item.language}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${cond.badgeColor}`}>
                          {item.condition.replace('_', ' ')}
                        </span>
                        {item.certNumber && (
                          <div className="text-[10px] text-indigo-400 font-mono mt-0.5">#{item.certNumber}</div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-amber-400">
                        {formatPrice(item.calculatedPrice, currency)}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        <span className={item.stockQuantity === 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          {item.stockQuantity} ชิ้น
                        </span>
                      </td>
                      <td className="p-4">
                        {item.status === 'AVAILABLE' ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                            พร้อมขาย
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-semibold">
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
                          <button
                            onClick={() => onUpdateStock(item.id, Math.max(0, item.stockQuantity - 1))}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono">{item.stockQuantity}</span>
                          <button
                            onClick={() => onUpdateStock(item.id, item.stockQuantity + 1)}
                            className="w-6 h-6 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Orders List */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-500">
              ยังไม่มีคำสั่งซื้อเข้ามาในระบบ
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
                  <div>
                    <span className="font-mono text-sm font-bold text-amber-400">{order.id}</span>
                    <span className="text-xs text-slate-400 ml-2">สั่งซื้อเมื่อ: {new Date(order.createdAt).toLocaleString('th-TH')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      {order.paymentStatus} ({order.paymentMethod})
                    </span>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => onUpdateOrderStatus(order.id, e.target.value as any)}
                      className="bg-slate-800 text-white text-xs rounded-xl px-2.5 py-1 border border-slate-700 outline-none"
                    >
                      <option value="Processing">กำลังจัดเตรียมสินค้า</option>
                      <option value="Ready to Ship">พร้อมส่ง</option>
                      <option value="Shipped">จัดส่งแล้ว (Shipped)</option>
                      <option value="Cancelled">ยกเลิกคำสั่งซื้อ</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-white">ข้อมูลผู้รับสินค้า:</div>
                    <div className="text-slate-300">{order.customerName} ({order.customerPhone})</div>
                    <div className="text-slate-400">{order.shippingAddress}</div>
                    <div className="text-amber-400 pt-1 font-semibold">การแพ็คกิ้ง: {order.packagingType}</div>
                  </div>

                  <div className="space-y-1 md:text-right">
                    <div className="font-bold text-white">ยอดชำระสุทธิ:</div>
                    <div className="text-xl font-black text-amber-400">{formatPrice(order.totalAmount, currency)}</div>
                    <div className="text-slate-400 font-mono text-[11px]">Tracking: {order.trackingNumber}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 3: Add New Card SKU Form */}
      {activeTab === 'ADD_CARD' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-rose-500" />
            <span>เพิ่มสินค้า / รายการการ์ดใหม่เข้าสู่สต็อก</span>
          </h2>

          <form onSubmit={handleAddSkuSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-bold mb-1">เลือก Master Card:</label>
              <select
                value={selectedMasterId}
                onChange={(e) => setSelectedMasterId(e.target.value)}
                className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
              >
                {masterCards.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.franchise}] {m.cardNumber} - {m.translations.EN?.name || m.translations.JP?.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ภาษาของการ์ด:</label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value as any)}
                  className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
                >
                  <option value="JP">🇯🇵 ภาษาญี่ปุ่น (JP)</option>
                  <option value="EN">🇺🇸 ภาษาอังกฤษ (EN)</option>
                  <option value="TH">🇹🇭 ภาษาไทย (TH)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">สภาพ / เกรด:</label>
                <select
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value as any)}
                  className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
                >
                  <option value="NM">Near Mint (NM)</option>
                  <option value="LP">Lightly Played (LP)</option>
                  <option value="MP">Moderately Played (MP)</option>
                  <option value="PSA_10">PSA 10 Gem Mint</option>
                  <option value="BGS_95">BGS 9.5 Gem Mint</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-bold mb-1">ราคาตั้งขาย (THB):</label>
                <input
                  type="number"
                  value={newBasePrice}
                  onChange={(e) => setNewBasePrice(Number(e.target.value))}
                  className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">จำนวนสต็อก (Quantity):</label>
                <input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
                  min="1"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">เลข Certification (ถ้าเป็นการ์ดเกรด):</label>
              <input
                type="text"
                value={newCertNumber}
                onChange={(e) => setNewCertNumber(e.target.value)}
                placeholder="เช่น 83921044"
                className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">ลิงก์รูปถ่ายด้านหน้า (Front Photo URL):</label>
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">บันทึกประเมินสภาพ:</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full bg-slate-800 p-2.5 rounded-xl border border-slate-700 text-white outline-none"
                rows={2}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 font-bold text-white shadow-lg"
            >
              บันทึกสินค้าลงคลัง
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
