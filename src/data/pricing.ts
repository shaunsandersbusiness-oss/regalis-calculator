export type Market = 'NJ' | 'Manhattan';

export type Tier = 0 | 1 | 2 | 3 | 4;

export const TIERS = [
  { label: '0–1,500 sqft', value: 0 },
  { label: '1,501–3,500 sqft', value: 1 },
  { label: '3,501–5,000 sqft', value: 2 },
  { label: '5,001–7,000 sqft', value: 3 },
  { label: '7,001–10,000 sqft', value: 4 },
] as const;

export interface ServicePrice {
  id: string;
  name: string;
  category: 'photo' | 'video' | 'brand' | 'addon';
  type: 'tiered' | 'fixed' | 'quantity';
  prices?: {
    NJ: number[];
    Manhattan: number[];
  };
  fixedPrice?: number;
  unit?: string;
  manhattanOnly?: boolean;
}

export const SERVICES: ServicePrice[] = [
  // Photography
  {
    id: 'bronze_photos',
    name: 'Bronze Photos',
    category: 'photo',
    type: 'tiered',
    prices: {
      NJ: [250, 325, 425, 550, 700],
      Manhattan: [350, 450, 575, 725, 900],
    },
  },
  {
    id: 'twilight_photos',
    name: 'Twilight Photos',
    category: 'photo',
    type: 'tiered',
    prices: {
      NJ: [200, 200, 250, 300, 350],
      Manhattan: [250, 250, 300, 350, 400],
    },
  },
  {
    id: 'floor_plan',
    name: 'Floor Plan',
    category: 'photo',
    type: 'tiered',
    prices: {
      NJ: [100, 150, 200, 275, 350],
      Manhattan: [150, 200, 275, 350, 450],
    },
  },
  {
    id: '3d_tour',
    name: '3D Tour',
    category: 'photo',
    type: 'tiered',
    prices: {
      NJ: [200, 300, 450, 600, 800],
      Manhattan: [300, 450, 600, 800, 1000],
    },
  },
  {
    id: 'drone_photos',
    name: 'Drone (Photo Add-On)',
    category: 'photo',
    type: 'tiered',
    prices: {
      NJ: [150, 150, 200, 250, 300],
      Manhattan: [250, 250, 300, 350, 400],
    },
  },
  {
    id: 'drone_standalone',
    name: 'Drone (Standalone)',
    category: 'photo',
    type: 'tiered',
    prices: {
      NJ: [250, 250, 300, 350, 400],
      Manhattan: [350, 350, 400, 450, 500],
    },
  },

  // Video - Listing
  {
    id: 'video_quick_tour',
    name: 'Quick Tour',
    category: 'video',
    type: 'tiered',
    prices: {
      NJ: [300, 400, 500, 650, 800],
      Manhattan: [400, 500, 650, 800, 1000],
    },
  },
  {
    id: 'video_standard',
    name: 'Regalis Standard',
    category: 'video',
    type: 'tiered',
    prices: {
      NJ: [500, 650, 800, 1000, 1250],
      Manhattan: [650, 800, 1000, 1250, 1500],
    },
  },
  {
    id: 'video_cinematic',
    name: 'Regalis Cinematic',
    category: 'video',
    type: 'tiered',
    prices: {
      NJ: [800, 1000, 1250, 1500, 1800],
      Manhattan: [1000, 1250, 1500, 1800, 2200],
    },
  },

  // Video - Brand & Community
  {
    id: 'video_agent_branding',
    name: 'Agent Branding Video',
    category: 'brand',
    type: 'tiered',
    prices: {
      NJ: [400, 400, 400, 400, 400], // Assuming flat across tiers but keeping structure
      Manhattan: [500, 500, 500, 500, 500],
    },
  },
  {
    id: 'video_community_spotlight',
    name: 'Community Spotlight',
    category: 'brand',
    type: 'tiered',
    prices: {
      NJ: [450, 450, 450, 450, 450],
      Manhattan: [550, 550, 550, 550, 550],
    },
  },
  {
    id: 'video_drone_addon',
    name: 'Drone in Video',
    category: 'brand',
    type: 'fixed',
    fixedPrice: 100,
    manhattanOnly: true,
  },

  // Add-Ons
  {
    id: 'addon_virtual_staging',
    name: 'Virtual Staging',
    category: 'addon',
    type: 'quantity',
    fixedPrice: 15,
    unit: 'photo',
  },
  {
    id: 'addon_virtual_twilight',
    name: 'Virtual Twilight',
    category: 'addon',
    type: 'quantity',
    fixedPrice: 25,
    unit: 'photo',
  },
  {
    id: 'addon_same_day',
    name: 'Same-Day Delivery',
    category: 'addon',
    type: 'fixed',
    fixedPrice: 75,
  },
  {
    id: 'addon_virtual_renovation',
    name: 'Virtual Renovation',
    category: 'addon',
    type: 'quantity',
    fixedPrice: 30,
    unit: 'scene',
  },
  {
    id: 'addon_listing_website',
    name: 'Listing Website',
    category: 'addon',
    type: 'fixed',
    fixedPrice: 150,
  },
];
