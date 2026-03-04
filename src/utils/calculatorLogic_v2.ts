import { NJ_PRICES, MANHATTAN_PRICES, Market, Tier } from '../data/pricing_v2';

export interface CalculatorState {
  market: Market;
  tier: Tier;
  // "Base" selection: 'none' | 'bronze' | 'silver' | 'gold'
  photoPackage: 'none' | 'bronze' | 'silver' | 'gold';
  selectedServices: Set<string>; // IDs of other selected services
  quantities: Record<string, number>;
}

export interface LineItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number; // For display if needed, though logic says sum alacarte then discount total
  isFree?: boolean;
  isPackage?: boolean;
}

export interface QuoteResult {
  items: LineItem[];
  alacarteTotal: number;
  discountName: string | null;
  discountPercent: number;
  discountAmount: number;
  finalTotal: number;
  complimentaryItems: string[];
}

export function calculateQuote(state: CalculatorState): QuoteResult {
  const { market, tier, photoPackage, selectedServices, quantities } = state;
  const PRICES = market === 'NJ' ? NJ_PRICES : MANHATTAN_PRICES;
  
  const items: LineItem[] = [];
  let alacarteTotal = 0;

  // Helper to get price
  const getPrice = (key: keyof typeof PRICES, isTiered: boolean) => {
    const val = PRICES[key];
    if (Array.isArray(val)) return val[tier];
    return val as number;
  };

  // 1. Add Photo Package
  if (photoPackage === 'bronze') {
    const p = getPrice('bronze', true);
    items.push({ id: 'bronze', name: 'Bronze — Photos Only', price: p });
    alacarteTotal += p;
  } else if (photoPackage === 'silver') {
    // Silver = Bronze + Floor Plan
    const pBronze = getPrice('bronze', true);
    const pFP = getPrice('floorPlan', true);
    items.push({ id: 'silver', name: 'Silver — Photos + Floor Plan', price: pBronze + pFP, isPackage: true });
    alacarteTotal += (pBronze + pFP);
  } else if (photoPackage === 'gold') {
    // Gold = Bronze + FP + 3D + Drone
    const pBronze = getPrice('bronze', true);
    const pFP = getPrice('floorPlan', true);
    const p3D = getPrice('threeDTour', true);
    const pDrone = getPrice('dronePhotoAddon', false);
    items.push({ id: 'gold', name: 'Gold — Photos + Floor Plan + Drone + 3D Tour', price: pBronze + pFP + p3D + pDrone, isPackage: true });
    alacarteTotal += (pBronze + pFP + p3D + pDrone);
  }

  // 2. Add Selected Services
  selectedServices.forEach(id => {
    // Skip if ID is one of the base package components handled above?
    // The UI should prevent selecting "Floor Plan" if Silver is selected.
    // But we should double check here or trust the UI state.
    // We'll trust the UI state for now, but `selectedServices` shouldn't contain 'bronze', 'silver', 'gold'.
    
    let price = 0;
    let name = '';

    // Map IDs to price keys
    switch (id) {
      case 'quickTour':
        price = getPrice('quickTour', false);
        name = 'Quick Tour';
        break;
      case 'standard':
        price = getPrice('standard', true);
        name = 'Regalis Standard';
        break;
      case 'cinematic':
        price = getPrice('cinematic', true);
        name = 'Regalis Cinematic';
        break;
      case 'agentBranding':
        price = getPrice('agentBranding', false);
        name = 'Agent Branding Video';
        break;
      case 'communitySpotlight':
        price = getPrice('communitySpotlight', false);
        name = 'Community Spotlight';
        break;
      case 'droneInVideo':
        if (market === 'Manhattan') {
          price = getPrice('droneInVideo', false);
          name = 'Drone footage in video';
        }
        break;
      case 'twilight':
        price = getPrice('twilight', true);
        name = 'Twilight Photos';
        break;
      case 'virtualTwilight':
        price = getPrice('virtualTwilight', false) * (quantities['virtualTwilight'] || 1);
        name = `Virtual Twilight (${quantities['virtualTwilight'] || 1})`;
        break;
      case 'virtualStaging':
        price = getPrice('virtualStaging', false) * (quantities['virtualStaging'] || 1);
        name = `Virtual Staging (${quantities['virtualStaging'] || 1})`;
        break;
      case 'sameDayDelivery':
        price = getPrice('sameDayDelivery', false);
        name = 'Same-Day Edited Delivery';
        break;
      case 'floorPlan':
        price = getPrice('floorPlan', true);
        name = 'Floor Plan (standalone)';
        break;
      case 'threeDTour':
        price = getPrice('threeDTour', true);
        name = '3D Tour (standalone)';
        break;
      case 'dronePhotoAddon':
        price = getPrice('dronePhotoAddon', false);
        name = 'Drone Photo Add-On';
        break;
      case 'droneStandalone':
        price = getPrice('droneStandalone', false);
        name = 'Drone Standalone';
        break;
      case 'virtualRenovation':
        price = getPrice('virtualRenovation', false) * (quantities['virtualRenovation'] || 1);
        name = `Virtual Renovation (${quantities['virtualRenovation'] || 1})`;
        break;
      case 'listingWebsite':
        price = getPrice('listingWebsite', false);
        name = 'Custom Listing Website';
        break;
    }

    if (name) {
      items.push({ id, name, price });
      alacarteTotal += price;
    }
  });

  // 3. Discount Detection
  const hasBronze = photoPackage !== 'none'; // Bronze, Silver, or Gold
  
  // Check specific components for logic
  const hasFP = photoPackage === 'silver' || photoPackage === 'gold' || selectedServices.has('floorPlan');
  const has3D = photoPackage === 'gold' || selectedServices.has('threeDTour');
  const hasDrone = photoPackage === 'gold' || selectedServices.has('dronePhotoAddon');
  
  const hasAnyPhotoAddon = hasFP || has3D || hasDrone;
  
  const hasQuickTour = selectedServices.has('quickTour');
  const hasStandard = selectedServices.has('standard');
  const hasCinematic = selectedServices.has('cinematic');
  const hasAgentBranding = selectedServices.has('agentBranding');
  const hasSpotlight = selectedServices.has('communitySpotlight');
  
  const hasAnyVideo = hasQuickTour || hasStandard || hasCinematic || hasAgentBranding || hasSpotlight;
  
  const isGold = photoPackage === 'gold' || (photoPackage !== 'none' && hasFP && has3D && hasDrone);

  let discountName: string | null = null;
  let discountPercent = 0;

  // Logic Hierarchy
  if (isGold && hasCinematic && (hasStandard || hasAgentBranding || hasSpotlight)) {
    discountName = 'CROWN';
    discountPercent = 0.30;
  } else if (isGold && hasAnyVideo) {
    discountName = 'GOLD + VIDEO';
    discountPercent = 0.20;
  } else if (hasBronze && hasAnyVideo) {
    discountName = 'PHOTO + VIDEO';
    discountPercent = 0.15;
  } else if (hasBronze && hasAnyPhotoAddon) {
    discountName = 'PHOTO BUNDLE';
    discountPercent = 0.10;
  }

  // 4. Apply Discount Rules
  // Website = $0 if any discount
  let discountableTotal = alacarteTotal;
  const websiteItem = items.find(i => i.id === 'listingWebsite');
  if (discountPercent > 0 && websiteItem) {
    discountableTotal -= websiteItem.price;
    websiteItem.price = 0;
    websiteItem.isFree = true;
    websiteItem.name += ' (Included)';
  }

  // Calculate Final
  const discountedTotal = discountableTotal * (1 - discountPercent);
  const finalTotal = Math.round(discountedTotal / 5) * 5;
  const discountAmount = alacarteTotal - finalTotal;

  // Complimentary Items
  const complimentaryItems: string[] = [];
  if (discountPercent > 0) {
    // Website is already handled in items list as $0, but we also list it in complimentary section
    // "Includes: Custom Listing Website" (for 15% tier)
    // "Includes: Custom Listing Website + 2 Twilight Photos" (for 20%+ tiers)
    
    // Note: The prompt says "2 Twilight Exterior Photos FREE at 20% and 30% tiers only. These display as "$0 / FREE" line items but do NOT subtract from the math (they were never added)."
    // So if the user didn't select Twilight, we add it as a free item?
    // "These display as "$0 / FREE" line items but do NOT subtract from the math (they were never added)."
    // This implies we should add a visual line item if the tier is met, even if not selected?
    // Or does it mean if they selected it, it becomes free?
    // "they were never added" implies they are EXTRA bonuses.
    
    if (discountPercent >= 0.20) {
       complimentaryItems.push('2 Twilight Exterior Photos (Included)');
    }
    complimentaryItems.push('Custom Listing Website (Included)');
  }

  return {
    items,
    alacarteTotal,
    discountName,
    discountPercent,
    discountAmount,
    finalTotal,
    complimentaryItems
  };
}
