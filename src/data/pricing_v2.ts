export type Market = 'NJ' | 'Manhattan';
export type Tier = 0 | 1 | 2 | 3 | 4;

export const TIERS = [
  { label: '0–1,500 sqft', value: 0 },
  { label: '1,501–3,500 sqft', value: 1 },
  { label: '3,501–5,000 sqft', value: 2 },
  { label: '5,001–7,000 sqft', value: 3 },
  { label: '7,001–10,000 sqft', value: 4 },
] as const;

export const NJ_PRICES = {
  // PHOTOGRAPHY — Main Services
  bronze:     [170, 215, 275, 375, 465],
  twilight:   [200, 225, 275, 325, 375],

  // PHOTOGRAPHY — Add-Ons
  floorPlan:  [75, 75, 125, 195, 275],
  threeDTour: [145, 145, 195, 255, 325],
  dronePhotoAddon: 50,
  droneStandalone: 150,

  // VIDEO — Main Services
  quickTour:        150, // flat
  standard:         [300, 365, 400, 475, 575],
  cinematic:        [500, 560, 600, 685, 815],
  agentBranding:    600,
  communitySpotlight: 500,

  // DRONE IN VIDEO
  droneInVideo:     0,

  // ADD-ONS
  virtualStaging:   15,
  virtualTwilight:  25,
  sameDayDelivery:  75,
  virtualRenovation: 30,
  listingWebsite:   150,
};

export const MANHATTAN_PRICES = {
  // PHOTOGRAPHY — Main Services
  bronze:     [245, 290, 350, 450, 540],
  twilight:   [275, 300, 350, 400, 450],

  // PHOTOGRAPHY — Add-Ons
  floorPlan:  [75, 75, 125, 195, 275],
  threeDTour: [145, 145, 195, 255, 325],
  dronePhotoAddon: 100,
  droneStandalone: 250,

  // VIDEO — Main Services
  quickTour:        225, // flat
  standard:         [375, 440, 475, 550, 650],
  cinematic:        [575, 635, 675, 760, 890],
  agentBranding:    675,
  communitySpotlight: 575,

  // DRONE IN VIDEO
  droneInVideo:     100,

  // ADD-ONS
  virtualStaging:   15,
  virtualTwilight:  25,
  sameDayDelivery:  75,
  virtualRenovation: 30,
  listingWebsite:   150,
};

export interface ServiceDef {
  id: string;
  name: string;
  description?: string;
  category: 'photo' | 'video' | 'addon';
  type: 'tiered' | 'flat' | 'quantity';
  priceKey: keyof typeof NJ_PRICES;
  manhattanPriceKey?: keyof typeof MANHATTAN_PRICES; // If different key needed, usually same
  unit?: string;
  manhattanOnly?: boolean;
  hideIf?: (selected: Set<string>) => boolean;
  showIf?: (selected: Set<string>) => boolean;
}

export const SERVICES_LIST: ServiceDef[] = [
  // Photos (Radio behavior handled in UI, but listed here)
  { id: 'bronze', name: 'Bronze — Photos Only', description: 'HDR interior & exterior photos, MLS-ready with window pull & sky replacement', category: 'photo', type: 'tiered', priceKey: 'bronze' },
  // Silver and Gold are "Packages" of services, but in Custom Build they act as selection shortcuts or distinct items?
  // The prompt says "Radio-select cards". "Bronze", "Silver", "Gold".
  // If Silver is selected, it implies Bronze + Floor Plan.
  // If Gold is selected, it implies Bronze + Floor Plan + Drone + 3D Tour.
  // We will treat them as "Base Packages" in the state.
  
  // Videos
  { id: 'quickTour', name: 'Quick Tour', description: 'Short-form walkthrough (15-30s, vertical, social-media-ready)', category: 'video', type: 'flat', priceKey: 'quickTour' },
  { id: 'standard', name: 'Regalis Standard', description: 'Professional listing video with music, transitions, branded intro/outro', category: 'video', type: 'tiered', priceKey: 'standard' },
  { id: 'cinematic', name: 'Regalis Cinematic', description: 'Premium cinematic listing film with advanced camera work, color grading, storytelling', category: 'video', type: 'tiered', priceKey: 'cinematic' },
  { id: 'agentBranding', name: 'Agent Branding Video', description: 'Personal brand video for agent marketing', category: 'video', type: 'flat', priceKey: 'agentBranding' },
  { id: 'communitySpotlight', name: 'Community Spotlight', description: 'Neighborhood/community highlight video', category: 'video', type: 'flat', priceKey: 'communitySpotlight' },

  // Add-ons
  { id: 'twilight', name: 'Twilight Photos', description: 'On-location golden hour/dusk shoot', category: 'addon', type: 'tiered', priceKey: 'twilight' },
  { id: 'virtualTwilight', name: 'Virtual Twilight', description: 'Daytime exterior digitally converted to twilight', category: 'addon', type: 'quantity', priceKey: 'virtualTwilight', unit: 'photo' },
  { id: 'virtualStaging', name: 'Virtual Staging', description: 'Digitally furnish empty rooms', category: 'addon', type: 'quantity', priceKey: 'virtualStaging', unit: 'photo' },
  { id: 'sameDayDelivery', name: 'Same-Day Edited Delivery', description: 'Photos delivered same day — shoot must be completed by 1:00 PM EST', category: 'addon', type: 'flat', priceKey: 'sameDayDelivery' },
  
  { id: 'floorPlan', name: 'Floor Plan (standalone)', description: '2D floor plan', category: 'addon', type: 'tiered', priceKey: 'floorPlan' },
  { id: 'threeDTour', name: '3D Tour (standalone)', description: 'Interactive 3D walkthrough', category: 'addon', type: 'tiered', priceKey: 'threeDTour' },
  { id: 'dronePhotoAddon', name: 'Drone Photo Add-On', description: 'Aerial shots', category: 'addon', type: 'flat', priceKey: 'dronePhotoAddon' },
  { id: 'droneStandalone', name: 'Drone Standalone', description: 'Aerial photography without a photo package', category: 'addon', type: 'flat', priceKey: 'droneStandalone' },
  
  { id: 'virtualRenovation', name: 'Virtual Renovation', description: 'Digital renovation rendering', category: 'addon', type: 'quantity', priceKey: 'virtualRenovation', unit: 'scene' },
  { id: 'listingWebsite', name: 'Custom Listing Website', description: 'Standalone price', category: 'addon', type: 'flat', priceKey: 'listingWebsite' },
  
  // Special
  { id: 'droneInVideo', name: 'Drone footage in video', description: 'Add-on for Manhattan', category: 'video', type: 'flat', priceKey: 'droneInVideo', manhattanOnly: true },
];
