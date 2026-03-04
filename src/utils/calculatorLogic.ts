import { SERVICES, Market, Tier } from '../data/pricing';

export interface SelectionState {
  market: Market;
  tier: Tier;
  selectedServices: Set<string>;
  quantities: Record<string, number>;
}

export interface PriceBreakdown {
  items: {
    id: string;
    name: string;
    price: number;
    isFree?: boolean;
  }[];
  subtotal: number;
  discountTier: {
    name: string;
    percentage: number;
  } | null;
  discountAmount: number;
  total: number;
  complimentaryItems: string[];
}

export function calculatePrice(state: SelectionState): PriceBreakdown {
  const { market, tier, selectedServices, quantities } = state;
  let subtotal = 0;
  const items: PriceBreakdown['items'] = [];

  // 1. Calculate base prices for all selected items
  SERVICES.forEach((service) => {
    if (selectedServices.has(service.id)) {
      // Check Manhattan only restriction
      if (service.manhattanOnly && market !== 'Manhattan') return;

      let price = 0;
      if (service.type === 'tiered' && service.prices) {
        price = service.prices[market][tier];
      } else if (service.type === 'fixed' && service.fixedPrice) {
        price = service.fixedPrice;
      } else if (service.type === 'quantity' && service.fixedPrice) {
        const qty = quantities[service.id] || 0;
        price = service.fixedPrice * qty;
      }

      items.push({
        id: service.id,
        name: service.name,
        price,
      });
      subtotal += price;
    }
  });

  // 2. Determine Discount Tier
  // TIER 1 — CROWN (30%): Gold (Bronze + FP + 3D + Drone) + Cinematic + (Standard OR Agent Branding OR Community Spotlight)
  // TIER 2 — GOLD + VIDEO (20%): Gold (Bronze + FP + 3D + Drone) + any video
  // TIER 3 — PHOTO + VIDEO (15%): Bronze + any video
  // TIER 4 — PHOTO BUNDLE (10%): Bronze + any photo add-on (FP, 3D, or Drone) — NO video
  // TIER 5 — NO DISCOUNT (0%)

  const hasBronze = selectedServices.has('bronze_photos');
  const hasFP = selectedServices.has('floor_plan');
  const has3D = selectedServices.has('3d_tour');
  const hasDrone = selectedServices.has('drone_photos');
  
  const hasGoldPackage = hasBronze && hasFP && has3D && hasDrone;

  const videoIds = [
    'video_quick_tour',
    'video_standard',
    'video_cinematic',
    'video_agent_branding',
    'video_community_spotlight'
  ];
  const hasAnyVideo = videoIds.some(id => selectedServices.has(id));
  
  const hasCinematic = selectedServices.has('video_cinematic');
  const hasOtherVideoForCrown = selectedServices.has('video_standard') || 
                                selectedServices.has('video_agent_branding') || 
                                selectedServices.has('video_community_spotlight');

  let discountName = '';
  let discountPercent = 0;

  if (hasGoldPackage && hasCinematic && hasOtherVideoForCrown) {
    discountName = 'Crown Package';
    discountPercent = 0.30;
  } else if (hasGoldPackage && hasAnyVideo) {
    discountName = 'Gold + Video';
    discountPercent = 0.20;
  } else if (hasBronze && hasAnyVideo) { // "Silver + Video" logic covered here too
    discountName = 'Photo + Video';
    discountPercent = 0.15;
  } else if (hasBronze && (hasFP || has3D || hasDrone) && !hasAnyVideo) {
    discountName = 'Photo Bundle';
    discountPercent = 0.10;
  }

  // 3. Apply Discount Rules
  // "When discount active: Website price becomes $0 in the calculation."
  let discountableSubtotal = subtotal;
  const websiteItem = items.find(i => i.id === 'addon_listing_website');
  
  if (discountPercent > 0 && websiteItem) {
    // Make website free
    discountableSubtotal -= websiteItem.price;
    websiteItem.price = 0;
    websiteItem.isFree = true;
  }

  // Calculate discount amount
  // Rounding: Math.round(total × (1 - discount) / 5) × 5
  // Wait, the formula "Math.round(total * (1 - discount) / 5) * 5" calculates the FINAL rounded total.
  // So I should calculate final total then derive discount amount.
  
  let total = discountableSubtotal;
  if (discountPercent > 0) {
    const rawDiscounted = discountableSubtotal * (1 - discountPercent);
    total = Math.round(rawDiscounted / 5) * 5;
  }

  const discountAmount = subtotal - total;

  // 4. Complimentary Items
  const complimentaryItems: string[] = [];
  if (discountPercent >= 0.10) {
    complimentaryItems.push('Listing Website');
  }
  if (discountPercent >= 0.20) {
    complimentaryItems.push('2 Twilight Exterior Photos');
  }

  return {
    items,
    subtotal,
    discountTier: discountPercent > 0 ? { name: discountName, percentage: discountPercent } : null,
    discountAmount,
    total,
    complimentaryItems,
  };
}
