import React, { useState, useEffect } from 'react';
import {
  MasterCard,
  ProductInventoryItem,
  CartItem,
  Order,
  Franchise,
  Currency,
  UILanguage,
  User,
} from './types/tcg';
import { MASTER_CARDS, INITIAL_INVENTORY } from './data/tcgCatalog';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CardExplorer } from './components/CardExplorer';
import { CardDetailModal } from './components/CardDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminInventoryView } from './components/AdminInventoryView';
import { GoogleAuthModal } from './components/GoogleAuthModal';

export function App() {
  // Master data and Inventory state
  const [masterCards, setMasterCards] = useState<MasterCard[]>(MASTER_CARDS);
  const [inventory, setInventory] = useState<ProductInventoryItem[]>(INITIAL_INVENTORY);
  const [orders, setOrders] = useState<Order[]>([]);

  // User & Google Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cardverse_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Default logged in as Admin seree999@gmail.com for convenient testing
    return {
      id: 'admin-seree999',
      email: 'seree999@gmail.com',
      name: 'Seree (Admin)',
      avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=seree999',
      role: 'ADMIN',
      store_credit: 10000,
    };
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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

  // Persist user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cardverse_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cardverse_user');
    }
  }, [currentUser]);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN' || user.email.toLowerCase() === 'seree999@gmail.com') {
      // Keep or allow switching to Admin
    } else {
      setActiveView('SHOP');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('SHOP');
  };

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

  // Checkout Completed: Deduct stock & create Order
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);

    // Mark purchased items as SOLD in inventory
    const purchasedItemIds = newOrder.items.map((i) => i.inventoryItemId);
    setInventory((prev) =>
      prev.map((inv) =>
        purchasedItemIds.includes(inv.id) ? { ...inv, status: 'SOLD', stockQuantity: 0 } : inv
      )
    );

    // If paid by store credit, deduct user store credit
    if (currentUser && newOrder.paymentMethod === 'Bank Transfer') {
      // demo credit deduct
    }

    // Clear cart
    setCartItems([]);
    setReservationTimeRemaining(null);
  };

  // Staff Inventory / Stock Management Actions
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

  const handleAddNewSku = (newItem: ProductInventoryItem) => {
    setInventory((prev) => [newItem, ...prev]);
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['orderStatus']) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Navbar */}
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
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Body */}
      <main className="flex-1">
        {activeView === 'SHOP' ? (
          <>
            {/* Top promotional banner */}
            <HeroBanner onSelectSet={(tag) => setSearchQuery(tag)} />


            {/* Comprehensive Card Explorer & Live Stock Matrix */}
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
          /* Staff / Admin Management Hub (Restricted / Available for seree999@gmail.com) */
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
          <span>Cloudflare D1 Database & Google OAuth Enabled</span>
        </div>
        <p>
          Pokémon TCG and One Piece Card Game are registered trademarks of their respective owners. All card images used for catalog inspection demonstration.
        </p>
      </footer>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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
