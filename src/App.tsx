import React, { useState, useEffect } from 'react';
import {
  MasterCard,
  ProductInventoryItem,
  CartItem,
  Order,
  Franchise,
  Currency,
  UILanguage,
} from './types/tcg';
import { MASTER_CARDS, INITIAL_INVENTORY } from './data/tcgCatalog';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CardExplorer } from './components/CardExplorer';
import { CardDetailModal } from './components/CardDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminInventoryView } from './components/AdminInventoryView';

export function App() {
  // Master data and Inventory state
  const [masterCards, setMasterCards] = useState<MasterCard[]>(MASTER_CARDS);
  const [inventory, setInventory] = useState<ProductInventoryItem[]>(INITIAL_INVENTORY);
  const [orders, setOrders] = useState<Order[]>([]);

  // Navigation and Filter state
  const [activeFranchise, setActiveFranchise] = useState<Franchise | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currency, setCurrency] = useState<Currency>('THB');
  const [uiLang, setUiLang] = useState<UILanguage>('th');
  const [activeView, setActiveView] = useState<'SHOP' | 'ADMIN'>('SHOP');

  // Modal inspection state
  const [inspectedCard, setInspectedCard] = useState<{
    item: ProductInventoryItem;
    masterCard: MasterCard;
  } | null>(null);

  // Cart & 15-Minute Reservation State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [reservationTimeRemaining, setReservationTimeRemaining] = useState<number | null>(null);

  // 15-Minute Reservation Countdown Loop
  useEffect(() => {
    if (cartItems.length === 0) {
      setReservationTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const earliestExpiry = Math.min(...cartItems.map((i) => i.reservationExpiresAt));
      const now = Date.now();
      const remainingSeconds = Math.max(0, Math.floor((earliestExpiry - now) / 1000));

      if (remainingSeconds <= 0) {
        // Auto-release expired reserved items
        alert('⏰ หมดเวลาการจองสินค้า 15 นาที ระบบได้ทำการปล่อยสต็อกคืนสู่หน้าร้านเรียบร้อยแล้ว');
        
        // Revert status in inventory
        setInventory((prev) =>
          prev.map((item) => {
            const wasInCart = cartItems.some((ci) => ci.inventoryItem.id === item.id);
            if (wasInCart && item.status === 'RESERVED') {
              return { ...item, status: 'AVAILABLE' };
            }
            return item;
          })
        );
        setCartItems([]);
        setReservationTimeRemaining(null);
        setIsCartOpen(false);
        setIsCheckoutOpen(false);
      } else {
        setReservationTimeRemaining(remainingSeconds);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cartItems]);

  // Add Item to Cart & Acquire 15-min Lock
  const handleAddToCart = (item: ProductInventoryItem, masterCard: MasterCard) => {
    // Check if already in cart
    if (cartItems.some((ci) => ci.inventoryItem.id === item.id)) {
      setIsCartOpen(true);
      return;
    }

    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins lock

    // Lock status in inventory
    setInventory((prev) =>
      prev.map((inv) =>
        inv.id === item.id ? { ...inv, status: 'RESERVED', reservedUntil: expiresAt } : inv
      )
    );

    const newCartItem: CartItem = {
      inventoryItem: item,
      masterCard,
      quantity: 1,
      reservationExpiresAt: expiresAt,
    };

    setCartItems((prev) => [...prev, newCartItem]);
    setIsCartOpen(true);
  };

  // Remove Item from Cart & Release Lock
  const handleRemoveFromCart = (skuId: string) => {
    setCartItems((prev) => prev.filter((ci) => ci.inventoryItem.id !== skuId));

    // Release lock in inventory
    setInventory((prev) =>
      prev.map((inv) => (inv.id === skuId ? { ...inv, status: 'AVAILABLE', reservedUntil: undefined } : inv))
    );
  };

  // Order Completed Handler
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Finalize stock deduction in inventory (Zero-oversell confirmed)
    setInventory((prev) =>
      prev.map((item) => {
        const orderedItem = newOrder.items.find((oi) => oi.inventoryItemId === item.id);
        if (orderedItem) {
          const newQty = Math.max(0, item.stockQuantity - orderedItem.quantity);
          return {
            ...item,
            stockQuantity: newQty,
            status: newQty > 0 ? 'AVAILABLE' : 'SOLD',
            reservedUntil: undefined,
          };
        }
        return item;
      })
    );

    setCartItems([]);
    setReservationTimeRemaining(null);
  };

  // Admin Actions
  const handleUpdateStock = (skuId: string, newStock: number) => {
    setInventory((prev) =>
      prev.map((item) =>
        item.id === skuId
          ? {
              ...item,
              stockQuantity: newStock,
              status: newStock > 0 ? 'AVAILABLE' : 'SOLD',
            }
          : item
      )
    );
  };

  const handleAddNewSku = (newSku: ProductInventoryItem) => {
    setInventory((prev) => [newSku, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: status } : o))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeFranchise={activeFranchise}
        setActiveFranchise={setActiveFranchise}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currency={currency}
        setCurrency={setCurrency}
        uiLang={uiLang}
        setUiLang={setUiLang}
        cartCount={cartItems.length}
        openCart={() => setIsCartOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
        reservationTimeRemaining={reservationTimeRemaining}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'SHOP' ? (
          <>
            {/* Hero Showcase Banner */}
            <HeroBanner onSelectSet={(tag) => setSearchQuery(tag)} />

            {/* Faceted Explorer & Catalog Grid */}
            <CardExplorer
              inventory={inventory}
              masterCards={masterCards}
              activeFranchise={activeFranchise}
              searchQuery={searchQuery}
              currency={currency}
              uiLang={uiLang}
              onInspectCard={(item, masterCard) => setInspectedCard({ item, masterCard })}
              onAddToCart={handleAddToCart}
              cartItemIds={cartItems.map((ci) => ci.inventoryItem.id)}
            />
          </>
        ) : (
          /* Staff / Admin Management Hub */
          <AdminInventoryView
            inventory={inventory}
            masterCards={masterCards}
            orders={orders}
            currency={currency}
            onUpdateStock={handleUpdateStock}
            onAddNewSku={handleAddNewSku}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center gap-2 font-bold text-slate-300">
          <span>CardVerse TCG Shop Platform</span>
          <span>•</span>
          <span>Phase 1 Deployment (Cloudflare Pages Ready)</span>
        </div>
        <p>
          Pokémon TCG and One Piece Card Game are registered trademarks of their respective owners. All card images used for catalog inspection demonstration.
        </p>
      </footer>

      {/* 4-Angle Card Detail & Condition Inspection Modal */}
      {inspectedCard && (
        <CardDetailModal
          item={inspectedCard.item}
          masterCard={inspectedCard.masterCard}
          allInventory={inventory}
          currency={currency}
          uiLang={uiLang}
          onClose={() => setInspectedCard(null)}
          onAddToCart={handleAddToCart}
          isItemInCart={cartItems.some((ci) => ci.inventoryItem.id === inspectedCard.item.id)}
        />
      )}

      {/* Cart Drawer with 15-min countdown timer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        currency={currency}
        uiLang={uiLang}
        timeRemaining={reservationTimeRemaining}
      />

      {/* Secure Checkout Modal (PromptPay / Cards) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currency={currency}
        uiLang={uiLang}
        onOrderCompleted={handleOrderCompleted}
        timeRemaining={reservationTimeRemaining}
      />
    </div>
  );
}

export default App;
