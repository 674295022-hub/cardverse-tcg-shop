import React, { useState } from 'react';
import { CartItem, Currency, Order, UILanguage } from '../types/tcg';
import { formatPrice } from '../utils/formatters';
import { X, QrCode, CreditCard, ShieldCheck, CheckCircle2, Clock, Truck, Sparkles, Copy, Check } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  currency: Currency;
  uiLang: UILanguage;
  onOrderCompleted: (order: Order) => void;
  timeRemaining: number | null;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  currency,
  onOrderCompleted,
  timeRemaining,
}) => {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState<'PromptPay QR' | 'Credit Card' | 'Bank Transfer'>('PromptPay QR');
  const [packagingType, setPackagingType] = useState<'Standard Sleeve' | 'Ultra-Pro Toploader (+฿30)' | 'Magnetic One-Touch Slab (+฿90)'>('Ultra-Pro Toploader (+฿30)');
  
  // Shipping form fields
  const [customerName, setCustomerName] = useState('สมชาย รักการ์ด');
  const [customerPhone, setCustomerPhone] = useState('081-234-5678');
  const [customerEmail, setCustomerEmail] = useState('somchai.tcg@example.com');
  const [shippingAddress, setShippingAddress] = useState('123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110');

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.inventoryItem.calculatedPrice * item.quantity, 0);
  const packagingFee = packagingType.includes('90') ? 90 : packagingType.includes('30') ? 30 : 0;
  const shippingFee = 50; // Standard express EMS shipping
  const totalAmount = subtotal + packagingFee + shippingFee;

  const handleSimulatePayment = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const order: Order = {
        id: `TCG-${Math.floor(100000 + Math.random() * 900000)}`,
        items: cartItems.map((ci) => ({
          inventoryItemId: ci.inventoryItem.id,
          cardName: ci.masterCard.translations[ci.inventoryItem.language]?.name || ci.masterCard.id,
          language: ci.inventoryItem.language,
          condition: ci.inventoryItem.condition,
          price: ci.inventoryItem.calculatedPrice,
          quantity: ci.quantity,
          photoUrl: ci.inventoryItem.photos.front,
        })),
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        packagingType,
        shippingCost: shippingFee + packagingFee,
        subtotal,
        totalAmount,
        paymentMethod,
        paymentStatus: 'PAID',
        orderStatus: 'Processing',
        trackingNumber: `TH-FLASH-${Math.floor(100000000 + Math.random() * 900000000)}`,
        createdAt: new Date().toISOString(),
      };

      setCreatedOrder(order);
      setIsProcessingPayment(false);
      setIsPaymentSuccess(true);
      onOrderCompleted(order);
    }, 1800);
  };

  const copyPromptPay = () => {
    navigator.clipboard.writeText('0812345678');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/90 rounded-3xl shadow-2xl overflow-hidden my-auto text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              {isPaymentSuccess ? 'ยืนยันคำสั่งซื้อสำเร็จ' : 'ดำเนินการชำระเงิน (Secure Checkout)'}
            </h2>
          </div>
          {!isPaymentSuccess && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {isPaymentSuccess && createdOrder ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-18 h-18 rounded-full bg-emerald-500/20 border border-emerald-500/40 mx-auto flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white">ชำระเงินสำเร็จเรียบร้อย!</h3>
                <p className="text-xs text-slate-400">
                  ระบบได้บันทึกคำสั่งซื้อและล็อกสินค้าออกจากสต็อกเรียบร้อยแล้ว
                </p>
              </div>

              <div className="max-w-md mx-auto p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">รหัสคำสั่งซื้อ (Order ID):</span>
                  <span className="font-mono font-bold text-amber-400">{createdOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">เลขพัสดุเตรียมจัดส่ง:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{createdOrder.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ผู้รับ:</span>
                  <span className="text-slate-200">{createdOrder.customerName} ({createdOrder.customerPhone})</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-700 font-bold text-sm">
                  <span>ยอดชำระสุทธิ:</span>
                  <span className="text-amber-400 font-black">{formatPrice(createdOrder.totalAmount, currency)}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-95 text-white font-bold text-sm shadow-xl"
              >
                เสร็จสิ้น / กลับสู่หน้าร้าน
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Left Column: Customer & Packaging Info */}
              <div className="md:col-span-7 space-y-4">
                {/* 15 min lock alert */}
                {timeRemaining !== null && (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 animate-spin" /> ล็อกสต็อกไว้ให้คุณอีก:
                    </span>
                    <strong className="font-mono text-sm bg-black/40 px-2 py-0.5 rounded border border-amber-500/30">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')} นาที
                    </strong>
                  </div>
                )}

                {/* Packaging Type Selector */}
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1.5">
                    📦 รูปแบบการแพ็คกิ้งการ์ดป้องกันความเสียหาย:
                  </label>
                  <div className="space-y-1.5">
                    {[
                      { type: 'Standard Sleeve', desc: 'ซองแก้วหนา + กระดาษจั่วปังดามหน้าหลัง 4 ชั้น (ฟรี)' },
                      { type: 'Ultra-Pro Toploader (+฿30)', desc: 'ใส่ซองใส + กรอบแข็ง Ultra-Pro Toploader ป้องกันการ์ดงอ' },
                      { type: 'Magnetic One-Touch Slab (+฿90)', desc: 'กรอบแม่เหล็กกัน UV 35pt ป้องกันรอยสูงสุดเกรดสะสม' },
                    ].map((opt) => (
                      <label
                        key={opt.type}
                        onClick={() => setPackagingType(opt.type as any)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer text-xs transition-all ${
                          packagingType === opt.type
                            ? 'bg-slate-800 border-rose-500 ring-1 ring-rose-500'
                            : 'bg-slate-800/40 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="packaging"
                          checked={packagingType === opt.type}
                          onChange={() => {}}
                          className="mt-0.5 text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <span className="font-bold text-white block">{opt.type}</span>
                          <span className="text-[11px] text-slate-400">{opt.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Shipping Details Form */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-slate-300 block">
                    📍 ข้อมูลผู้รับและที่อยู่จัดส่ง:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ชื่อ-นามสกุล"
                      className="bg-slate-800 text-xs text-white rounded-xl p-2.5 border border-slate-700 focus:border-rose-500 outline-none"
                    />
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="เบอร์โทรศัพท์"
                      className="bg-slate-800 text-xs text-white rounded-xl p-2.5 border border-slate-700 focus:border-rose-500 outline-none"
                    />
                  </div>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="อีเมลสำหรับรับใบเสร็จ"
                    className="w-full bg-slate-800 text-xs text-white rounded-xl p-2.5 border border-slate-700 focus:border-rose-500 outline-none"
                  />
                  <textarea
                    rows={2}
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="ที่อยู่จัดส่งโดยละเอียด"
                    className="w-full bg-slate-800 text-xs text-white rounded-xl p-2.5 border border-slate-700 focus:border-rose-500 outline-none"
                  ></textarea>
                </div>
              </div>

              {/* Right Column: Payment & Order Summary */}
              <div className="md:col-span-5 space-y-4 flex flex-col justify-between">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-2">
                    💳 ช่องทางการชำระเงิน:
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      onClick={() => setPaymentMethod('PromptPay QR')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'PromptPay QR'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span>PromptPay QR</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('Credit Card')}
                      className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'Credit Card'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>บัตรเครดิต/เดบิต</span>
                    </button>
                  </div>

                  {/* Payment Details Container */}
                  {paymentMethod === 'PromptPay QR' ? (
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-700 text-center space-y-3">
                      <div className="text-[11px] text-slate-400">สแกนชำระผ่านแอปธนาคารทุกแห่ง</div>
                      <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-lg">
                        <img
                          src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PROMPTPAY-0812345678-TCG-SHOP"
                          alt="PromptPay QR Code"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-xs font-semibold text-slate-300 flex items-center justify-center gap-1">
                        <span>พร้อมเพย์: 081-234-5678</span>
                        <button onClick={copyPromptPay} className="text-rose-400 hover:text-rose-300 p-1">
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 space-y-2 text-xs">
                      <input
                        type="text"
                        placeholder="หมายเลขบัตร 16 หลัก"
                        defaultValue="4111 2222 3333 4444"
                        className="w-full bg-slate-900 p-2 rounded-lg border border-slate-700 text-white outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          defaultValue="12/28"
                          className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-white outline-none"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          defaultValue="123"
                          className="bg-slate-900 p-2 rounded-lg border border-slate-700 text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Price Summary */}
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>ราคาสินค้า ({cartItems.length} ใบ):</span>
                    <span>{formatPrice(subtotal, currency)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ค่าแพ็คกิ้งพิเศษ:</span>
                    <span>{packagingFee > 0 ? formatPrice(packagingFee, currency) : 'ฟรี'}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ค่าจัดส่งด่วน (EMS/Flash):</span>
                    <span>{formatPrice(shippingFee, currency)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-700">
                    <span>ยอดชำระทั้งหมด:</span>
                    <span className="text-xl font-black text-amber-400">{formatPrice(totalAmount, currency)}</span>
                  </div>

                  <button
                    onClick={handleSimulatePayment}
                    disabled={isProcessingPayment}
                    className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-98 transition-all"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Clock className="w-4 h-4 animate-spin" />
                        <span>กำลังยืนยันยอดเงินผ่านระบบ...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>จำลองการชำระเงินทันที ({formatPrice(totalAmount, currency)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
