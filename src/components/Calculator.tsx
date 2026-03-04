import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Minus, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { SERVICES, TIERS, Market, Tier } from '../data/pricing';
import { calculatePrice, SelectionState } from '../utils/calculatorLogic';

export function Calculator() {
  const [state, setState] = useState<SelectionState>({
    market: 'NJ',
    tier: 2, // Default: 3,501–5,000 sqft
    selectedServices: new Set(),
    quantities: {},
  });

  const breakdown = calculatePrice(state);

  const toggleService = (id: string) => {
    const newSelected = new Set(state.selectedServices);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setState({ ...state, selectedServices: newSelected });
  };

  const updateQuantity = (id: string, delta: number) => {
    const current = state.quantities[id] || 0;
    const service = SERVICES.find(s => s.id === id);
    // Limits based on prompt
    const min = 1;
    const max = service?.id === 'addon_virtual_renovation' ? 10 : 50;
    
    const next = Math.min(Math.max(current + delta, min), max);
    
    // If quantity is > 0, ensure service is selected
    const newSelected = new Set(state.selectedServices);
    if (next > 0) newSelected.add(id);
    
    setState({
      ...state,
      quantities: { ...state.quantities, [id]: next },
      selectedServices: newSelected,
    });
  };

  // Helper to get display price for a service in the list
  const getServicePrice = (id: string) => {
    const service = SERVICES.find(s => s.id === id);
    if (!service) return 0;
    
    if (service.type === 'tiered' && service.prices) {
      return service.prices[state.market][state.tier];
    }
    if (service.type === 'fixed' && service.fixedPrice) {
      return service.fixedPrice;
    }
    if (service.type === 'quantity' && service.fixedPrice) {
      return service.fixedPrice;
    }
    return 0;
  };

  // Group services
  const photoServices = SERVICES.filter(s => s.category === 'photo');
  const videoListingServices = SERVICES.filter(s => s.category === 'video');
  const brandServices = SERVICES.filter(s => s.category === 'brand');
  const addonServices = SERVICES.filter(s => s.category === 'addon');

  return (
    <div className="max-w-[1400px] mx-auto px-6 py-12 md:py-20">
      {/* Header */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">Price Calculator</h1>
        <p className="text-lg text-[#999999]">Build your custom package and see your price instantly.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Left Column - Selectors */}
        <div className="w-full lg:w-[60%] space-y-12">
          
          {/* Step 1: Market */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Step 1: Select Market</h2>
            <div className="grid grid-cols-2 gap-4">
              {(['NJ', 'Manhattan'] as Market[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setState({ ...state, market: m })}
                  className={cn(
                    "h-16 rounded-xl text-lg font-bold transition-all duration-200 border",
                    state.market === m
                      ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0a0a] shadow-[0_0_20px_rgba(201,168,76,0.2)]"
                      : "bg-[#0a0a0a] border-[#222] text-[#D4D4D4] hover:border-[#c9a84c]/50"
                  )}
                >
                  {m === 'NJ' ? 'NJ & Boroughs' : 'Manhattan'}
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Property Size */}
          <section>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Step 2: Select Property Size</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {TIERS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setState({ ...state, tier: t.value })}
                  className={cn(
                    "py-4 px-2 rounded-xl text-sm font-bold transition-all duration-200 border flex flex-col items-center justify-center gap-1",
                    state.tier === t.value
                      ? "bg-[#c9a84c] border-[#c9a84c] text-[#0a0a0a] shadow-[0_0_15px_rgba(201,168,76,0.15)]"
                      : "bg-[#0a0a0a] border-[#222] text-[#D4D4D4] hover:border-[#c9a84c]/50"
                  )}
                >
                  <span>{t.label.split(' ')[0]}</span>
                  <span className="text-[10px] opacity-80 uppercase">sqft</span>
                </button>
              ))}
            </div>
          </section>

          {/* Step 3: Services */}
          <section className="space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">Step 3: Select Services</h2>

            {/* Photography */}
            <ServiceGroup 
              title="Photography" 
              services={photoServices} 
              state={state} 
              toggleService={toggleService}
              getDisplayPrice={getServicePrice}
            />

            {/* Video Listing */}
            <ServiceGroup 
              title="Video — Listing Videos" 
              services={videoListingServices} 
              state={state} 
              toggleService={toggleService}
              getDisplayPrice={getServicePrice}
            />

            {/* Video Brand */}
            <ServiceGroup 
              title="Video — Brand & Community" 
              services={brandServices} 
              state={state} 
              toggleService={toggleService}
              getDisplayPrice={getServicePrice}
            />

            {/* Add-Ons */}
            <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6">Add-Ons</h3>
              <div className="space-y-4">
                {addonServices.map((service) => {
                  const isSelected = state.selectedServices.has(service.id);
                  const price = getServicePrice(service.id);
                  const isWebsite = service.id === 'addon_listing_website';
                  const isFree = isWebsite && breakdown.discountTier !== null;

                  return (
                    <div 
                      key={service.id}
                      className={cn(
                        "relative flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border transition-all duration-200 cursor-pointer",
                        isSelected
                          ? "bg-[#c9a84c]/5 border-l-4 border-l-[#c9a84c] border-y-[#c9a84c]/20 border-r-[#c9a84c]/20"
                          : "bg-transparent border border-transparent hover:bg-[#111]"
                      )}
                      onClick={(e) => {
                        // Prevent toggle if clicking quantity controls
                        if ((e.target as HTMLElement).closest('.quantity-control')) return;
                        toggleService(service.id);
                        // Initialize quantity if selecting for first time
                        if (!isSelected && service.type === 'quantity') {
                          updateQuantity(service.id, 1);
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3 md:mb-0">
                        <div className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                          isSelected ? "bg-[#c9a84c] border-[#c9a84c]" : "border-[#444]"
                        )}>
                          {isSelected && <Check size={14} className="text-black" />}
                        </div>
                        <span className="font-medium text-[#D4D4D4]">{service.name}</span>
                      </div>

                      <div className="flex items-center gap-4 pl-8 md:pl-0">
                        {service.type === 'quantity' && isSelected && (
                          <div className="quantity-control flex items-center gap-3 bg-[#1a1a1a] rounded-lg px-2 py-1 border border-[#333]">
                            <button 
                              onClick={() => updateQuantity(service.id, -1)}
                              className="p-1 hover:text-[#c9a84c] transition-colors"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-mono w-4 text-center">{state.quantities[service.id] || 1}</span>
                            <button 
                              onClick={() => updateQuantity(service.id, 1)}
                              className="p-1 hover:text-[#c9a84c] transition-colors"
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        )}
                        
                        <div className="text-right min-w-[80px]">
                          {isFree ? (
                            <span className="text-[#4CAF50] font-bold">FREE</span>
                          ) : (
                            <span className="text-[#c9a84c] font-mono">
                              ${price}
                              {service.type === 'quantity' && <span className="text-xs text-[#666] ml-1">/{service.unit}</span>}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </section>
        </div>

        {/* Right Column - Sticky Summary */}
        <div className="w-full lg:w-[40%] relative">
          <div className="sticky top-[100px]">
            <div className="bg-[#0a0a0a] border border-[#222] border-t-4 border-t-[#c9a84c] rounded-xl p-6 md:p-8 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-6">Your Package</h3>

              {/* Selected Items List */}
              <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {breakdown.items.length === 0 ? (
                  <p className="text-[#666] italic text-sm">Select services to see pricing...</p>
                ) : (
                  breakdown.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-[#D4D4D4]">{item.name}</span>
                      <span className={cn("font-mono", item.isFree ? "text-[#4CAF50]" : "text-[#D4D4D4]")}>
                        {item.isFree ? 'FREE' : `$${item.price}`}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="h-px bg-[#222] my-6" />

              {/* Subtotal */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-[#999] text-sm">Subtotal</span>
                <span className="text-[#D4D4D4] font-mono">${breakdown.subtotal}</span>
              </div>

              {/* Discount Badge */}
              <AnimatePresence>
                {breakdown.discountTier && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex justify-between items-center mb-2 overflow-hidden"
                  >
                    <span className="bg-[#c9a84c] text-black text-xs font-bold px-2 py-1 rounded">
                      {breakdown.discountTier.name} — {breakdown.discountTier.percentage * 100}% Off
                    </span>
                    <span className="text-[#4CAF50] font-mono text-sm">-${breakdown.discountAmount}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Total */}
              <div className="flex justify-between items-end mt-4 mb-2">
                <span className="text-white font-bold text-lg">Total</span>
                <div className="text-right">
                  <span className="text-[#c9a84c] font-bold text-4xl block leading-none">
                    ${breakdown.total}
                  </span>
                </div>
              </div>

              {/* Savings */}
              {breakdown.discountAmount > 0 && (
                <div className="text-right mb-6">
                  <span className="text-[#4CAF50] text-sm font-medium">
                    You Save: ${breakdown.discountAmount}
                  </span>
                </div>
              )}

              {/* Complimentary Items */}
              {breakdown.complimentaryItems.length > 0 && (
                <div className="bg-[#1a1a1a] rounded-lg p-4 mb-6 space-y-2">
                  {breakdown.complimentaryItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#D4D4D4]">
                      <Check size={12} className="text-[#c9a84c]" />
                      <span>{item} — <span className="text-[#4CAF50] font-bold">FREE</span></span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <a 
                href="https://www.regalisrealtymedia.com/calendar"
                className="block w-full bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold text-center py-4 rounded-lg transition-colors duration-200"
              >
                Book Now →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Link */}
      <div className="mt-20 text-center">
        <a 
          href="https://pricing.regalisrealtymedia.com" 
          className="text-[#c9a84c] hover:underline text-sm font-medium"
        >
          View full pricing details →
        </a>
      </div>
    </div>
  );
}

function ServiceGroup({ 
  title, 
  services, 
  state, 
  toggleService, 
  getDisplayPrice 
}: { 
  title: string, 
  services: typeof SERVICES, 
  state: SelectionState, 
  toggleService: (id: string) => void,
  getDisplayPrice: (id: string) => number
}) {
  return (
    <div className="bg-[#0a0a0a] border border-[#222] rounded-xl p-6 md:p-8">
      <h3 className="text-xl font-bold text-white mb-6">{title}</h3>
      <div className="space-y-3">
        {services.map((service) => {
          if (service.manhattanOnly && state.market !== 'Manhattan') return null;
          
          const isSelected = state.selectedServices.has(service.id);
          const price = getDisplayPrice(service.id);

          return (
            <button
              key={service.id}
              onClick={() => toggleService(service.id)}
              className={cn(
                "w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-200 text-left group",
                isSelected
                  ? "bg-[#c9a84c]/5 border-l-4 border-l-[#c9a84c] border-y-[#c9a84c]/20 border-r-[#c9a84c]/20"
                  : "bg-transparent border border-transparent hover:bg-[#111]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                  isSelected ? "bg-[#c9a84c] border-[#c9a84c]" : "border-[#444] group-hover:border-[#666]"
                )}>
                  {isSelected && <Check size={14} className="text-black" />}
                </div>
                <span className="font-medium text-[#D4D4D4]">{service.name}</span>
              </div>
              <span className="text-[#c9a84c] font-mono">${price}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
