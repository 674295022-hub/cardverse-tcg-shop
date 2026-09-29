export type Franchise = 'POKEMON' | 'ONE_PIECE';

export type LanguageCode = 'JP' | 'EN' | 'TH' | 'TC' | 'SC' | 'KR';

export type CardCondition = 'NM' | 'LP' | 'MP' | 'HP' | 'DMG' | 'PSA_10' | 'PSA_9' | 'BGS_95' | 'CGC_10';

export type ProductType = 'SINGLE' | 'GRADED' | 'SEALED_BOX' | 'BOOSTER_PACK' | 'STARTER_DECK';

export type StockStatus = 'AVAILABLE' | 'RESERVED' | 'SOLD';

export interface CardAttributes {
  // Pokemon attributes
  pokemonType?: string; // Fire, Water, Lightning, Psychic, etc.
  stage?: string; // Basic, Stage 1, Stage 2, ex, VSTAR, VMAX
  hp?: number;
  retreatCost?: number;
  
  // One Piece attributes
  color?: 'Red' | 'Green' | 'Blue' | 'Purple' | 'Black' | 'Yellow' | 'Multi';
  cardCategory?: 'Leader' | 'Character' | 'Event' | 'Stage';
  cost?: number;
  power?: number;
  counter?: number;
  slashAttribute?: 'Slash' | 'Strike' | 'Ranged' | 'Special' | 'Wisdom';
}

export interface CardTranslation {
  language: LanguageCode;
  name: string;
  setName: string;
  effect: string;
  flavorText?: string;
  illustrator: string;
}

export interface MasterCard {
  id: string; // Universal ID e.g. "op05-119" or "sv4a-347"
  franchise: Franchise;
  setCode: string; // e.g. "OP-05", "SV4a", "PR-EN"
  cardNumber: string; // e.g. "119", "347/190"
  rarity: string; // "Manga Rare", "SAR", "SEC", "UR", "SR", "AR", "Promo"
  releaseYear: number;
  attributes: CardAttributes;
  translations: Record<LanguageCode, CardTranslation>;
}

export interface ItemPhotos {
  front: string;
  back: string;
  topCorner?: string;
  bottomCorner?: string;
}

export interface ProductInventoryItem {
  id: string; // SKU ID
  masterCardId: string;
  language: LanguageCode;
  productType: ProductType;
  condition: CardCondition;
  certNumber?: string; // For PSA / BGS
  gradingCompany?: 'PSA' | 'BGS' | 'CGC' | 'ARS';
  basePrice: number; // In THB
  calculatedPrice: number; // After condition modifier
  stockQuantity: number;
  status: StockStatus;
  reservedUntil?: number; // Timestamp
  reservedBy?: string; // User ID / Session ID
  photos: ItemPhotos;
  note?: string;
}

export interface CartItem {
  inventoryItem: ProductInventoryItem;
  masterCard: MasterCard;
  quantity: number;
  reservationExpiresAt: number; // Epoch timestamp
}

export interface Order {
  id: string;
  items: {
    inventoryItemId: string;
    cardName: string;
    language: LanguageCode;
    condition: CardCondition;
    price: number;
    quantity: number;
    photoUrl: string;
  }[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  packagingType: 'Standard Sleeve' | 'Ultra-Pro Toploader (+฿30)' | 'Magnetic One-Touch Slab (+฿90)';
  shippingCost: number;
  subtotal: number;
  totalAmount: number;
  paymentMethod: 'PromptPay QR' | 'Credit Card' | 'Bank Transfer';
  paymentStatus: 'PAID' | 'PENDING' | 'EXPIRED';
  orderStatus: 'Processing' | 'Ready to Ship' | 'Shipped' | 'Cancelled';
  trackingNumber?: string;
  createdAt: string;
}

export type Currency = 'THB' | 'USD' | 'JPY';
export type UILanguage = 'th' | 'en' | 'ja';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'ADMIN' | 'CUSTOMER';
  store_credit: number;
}

