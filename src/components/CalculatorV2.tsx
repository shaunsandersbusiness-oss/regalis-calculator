import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Minus, Plus, ChevronDown, Download, Phone, X, ChevronUp } from 'lucide-react';
import { cn } from '../lib/utils';
import { NJ_PRICES, MANHATTAN_PRICES, TIERS, SERVICES_LIST, Market, Tier } from '../data/pricing_v2';
import { calculateQuote, CalculatorState } from '../utils/calculatorLogic_v2';
import { BookingModal } from './BookingModal';
import { generatePDF } from '../utils/pdfGenerator';

export function CalculatorV2() {
  const [view, setView] = useState<'custom' | 'packages'>('custom');
  const [state, setState] = useState<CalculatorState>({
    market: 'NJ',
    tier: 2, // 3501-5000
    photoPackage: 'silver', // Default to Silver as it's "Most Popular"
    selectedServices: new Set(),
    quantities: {},
  });
  const [showClearTooltip, setShowClearTooltip] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const quote = calculateQuote(state);
  const itemCount = quote.items.length;

  // Handlers
  const setMarket = (m: Market) => setState(s => ({ ...s, market: m }));
  const setTier = (t: Tier) => setState(s => ({ ...s, tier: t }));
  
  const setPhotoPackage = (p: CalculatorState['photoPackage']) => {
    setState(s => ({ 
      ...s, 
      photoPackage: s.photoPackage === p ? 'none' : p 
    }));
  };
  
  const toggleService = (id: string) => {
    const newSet = new Set(state.selectedServices);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setState(s => ({ ...s, selectedServices: newSet }));
  };

  const updateQuantity = (id: string, delta: number) => {
    const current = state.quantities[id] || 0;
    const next = Math.max(0, Math.min(20, current + delta));
    
    const newSet = new Set(state.selectedServices);
    if (next > 0) newSet.add(id);
    else newSet.delete(id);

    setState(s => ({
      ...s,
      quantities: { ...s.quantities, [id]: next },
      selectedServices: newSet
    }));
  };

  const removeItem = (id: string) => {
    if (id === 'bronze' || id === 'silver' || id === 'gold') {
      setState(s => ({ ...s, photoPackage: 'none' }));
    } else {
      const newSet = new Set(state.selectedServices);
      newSet.delete(id);
      setState(s => ({ ...s, selectedServices: newSet }));
    }
  };

  const clearAll = () => {
    setState(s => ({
      ...s,
      photoPackage: 'none',
      selectedServices: new Set(),
      quantities: {}
    }));
    setShowClearTooltip(true);
    setTimeout(() => setShowClearTooltip(false), 2000);
  };

  const handlePrint = async () => {
    if (quote.items.length === 0) {
      alert('Please select services to download a quote.');
      return;
    }
    setIsGeneratingPDF(true);
    await generatePDF(quote, state.market, state.tier);
    setIsGeneratingPDF(false);
  };

  const applyPackage = (pkg: string, crownOption?: string) => {
    const newState: CalculatorState = {
      market: state.market,
      tier: state.tier,
      photoPackage: 'none',
      selectedServices: new Set(),
      quantities: {}
    };

    if (pkg === 'Essential') {
      newState.photoPackage = 'silver';
      newState.selectedServices.add('quickTour');
    } else if (pkg === 'Signature') {
      newState.photoPackage = 'gold';
      newState.selectedServices.add('cinematic');
    } else if (pkg === 'Crown') {
      newState.photoPackage = 'gold';
      newState.selectedServices.add('cinematic');
      if (crownOption) newState.selectedServices.add(crownOption);
    }

    setState(newState);
    setIsBookingModalOpen(true);
  };

  const scrollToQuote = () => {
    const quoteElement = document.getElementById('quote-sidebar');
    if (quoteElement) {
      quoteElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-8 md:py-12 pb-24 md:pb-12">
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        quote={quote}
        market={state.market}
        tier={state.tier}
      />

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-[48px] font-bold text-white mb-4 leading-tight">Price Calculator</h1>
        <p className="text-lg text-[#999999]">Build your custom package and see your price instantly.</p>
      </div>

      {/* Top Bar Controls */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        {/* Market Toggle */}
        <div className="bg-[#111] p-1 rounded-full border border-[#222] flex">
          {(['NJ', 'Manhattan'] as Market[]).map(m => (
            <button
              key={m}
              onClick={() => setMarket(m)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all",
                state.market === m
                  ? "bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                  : "text-[#999] hover:text-white"
              )}
            >
              {m === 'NJ' ? 'NJ & Boroughs' : 'Manhattan'}
            </button>
          ))}
        </div>

        {/* Property Size Dropdown */}
        <div className="relative group">
          <select
            value={state.tier}
            onChange={(e) => setTier(Number(e.target.value) as Tier)}
            className="appearance-none bg-[#111] text-white border border-[#222] rounded-lg px-6 py-3 pr-10 font-bold focus:outline-none focus:border-[#c9a84c] focus:ring-1 focus:ring-[#c9a84c] cursor-pointer min-w-[200px]"
          >
            {TIERS.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#c9a84c] pointer-events-none" size={16} />
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex justify-center mb-12">
        <div className="bg-[#111] p-1 rounded-full border border-[#222] flex">
          <button
            onClick={() => setView('custom')}
            className={cn(
              "px-8 py-2 rounded-full text-sm font-bold transition-all",
              view === 'custom'
                ? "bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                : "text-[#999] hover:text-white"
            )}
          >
            CUSTOM BUILD
          </button>
          <button
            onClick={() => setView('packages')}
            className={cn(
              "px-8 py-2 rounded-full text-sm font-bold transition-all",
              view === 'packages'
                ? "bg-[#c9a84c] text-black shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                : "text-[#999] hover:text-white"
            )}
          >
            PACKAGES
          </button>
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {view === 'custom' ? (
          <motion.div
            key="custom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col lg:flex-row gap-8 lg:gap-12"
          >
            {/* Left Column: Services */}
            <div className="w-full lg:w-[60%] space-y-10">
              
              {/* Photos Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-[28px] font-bold text-white mb-2">Photography</h2>
                  <p className="text-[15px] text-[#999]">Choose one photo package</p>
                </div>
                <div className="space-y-4">
                  <PhotoCard 
                    id="bronze"
                    name="Bronze — Photos Only"
                    desc="HDR interior & exterior photos, MLS-ready with window pull & sky replacement"
                    price={state.market === 'NJ' ? NJ_PRICES.bronze[state.tier] : MANHATTAN_PRICES.bronze[state.tier]}
                    selected={state.photoPackage === 'bronze'}
                    onSelect={() => setPhotoPackage('bronze')}
                  />
                  <PhotoCard 
                    id="silver"
                    name="Silver — Photos + Floor Plan"
                    desc="Everything in Bronze + 2D floor plan with measurements (10% Off)"
                    price={state.market === 'NJ' 
                      ? NJ_PRICES.bronze[state.tier] + NJ_PRICES.floorPlan[state.tier] 
                      : MANHATTAN_PRICES.bronze[state.tier] + MANHATTAN_PRICES.floorPlan[state.tier]}
                    selected={state.photoPackage === 'silver'}
                    onSelect={() => setPhotoPackage('silver')}
                    isPopular
                    discountLabel="10% OFF"
                  />
                  <PhotoCard 
                    id="gold"
                    name="Gold — Photos + Floor Plan + Drone + 3D Tour"
                    desc="The complete visual package — photos, floor plan, drone, and Zillow interactive 3D tour (10% Off)"
                    price={state.market === 'NJ'
                      ? NJ_PRICES.bronze[state.tier] + NJ_PRICES.floorPlan[state.tier] + NJ_PRICES.threeDTour[state.tier] + NJ_PRICES.dronePhotoAddon
                      : MANHATTAN_PRICES.bronze[state.tier] + MANHATTAN_PRICES.floorPlan[state.tier] + MANHATTAN_PRICES.threeDTour[state.tier] + MANHATTAN_PRICES.dronePhotoAddon}
                    selected={state.photoPackage === 'gold'}
                    onSelect={() => setPhotoPackage('gold')}
                    discountLabel="10% OFF"
                  />
                </div>
              </section>

              {/* Videos Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-[28px] font-bold text-white mb-2">Videos</h2>
                  <p className="text-[15px] text-[#999]">Add a video to your package</p>
                </div>
                <div className="space-y-4">
                  {SERVICES_LIST.filter(s => s.category === 'video' && !s.manhattanOnly).map(service => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      state={state}
                      toggle={toggleService}
                    />
                  ))}
                  
                  {/* Drone in Video Logic */}
                  {state.market === 'Manhattan' && (
                    <div className="mt-4">
                      <div 
                        onClick={() => toggleService('droneInVideo')}
                        className={cn(
                          "service-card group flex items-center gap-4",
                          state.selectedServices.has('droneInVideo') && "selected"
                        )}
                      >
                        <div className={cn("custom-checkbox", state.selectedServices.has('droneInVideo') && "selected")} />
                        <div className="flex-grow flex justify-between items-center">
                          <span className="text-[17px] font-bold text-white">Drone footage in video</span>
                          <span className="text-[#c9a84c] font-bold text-[20px]">+$100</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* Add-Ons Section */}
              <section>
                <div className="mb-6">
                  <h2 className="text-[28px] font-bold text-white mb-2">Add-Ons</h2>
                  <p className="text-[15px] text-[#999]">Enhance your package</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SERVICES_LIST.filter(s => s.category === 'addon').map(service => {
                    // Conditional Visibility
                    if (service.id === 'floorPlan' && (state.photoPackage === 'silver' || state.photoPackage === 'gold')) return null;
                    if (service.id === 'threeDTour' && state.photoPackage === 'gold') return null;
                    if (service.id === 'dronePhotoAddon' && state.photoPackage === 'gold') return null;
                    if (service.id === 'droneStandalone' && state.photoPackage !== 'none') return null;

                    return (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        state={state}
                        toggle={toggleService}
                        updateQuantity={updateQuantity}
                        compact
                      />
                    );
                  })}
                </div>
              </section>

            </div>

            {/* Right Column: Quote Sidebar */}
            <div className="w-full lg:w-[40%] relative" id="quote-sidebar">
              <div className="sticky top-[100px] bg-[#0a0a0a] border border-[#222] border-t-4 border-t-[#c9a84c] rounded-xl p-6 md:p-8 shadow-2xl">
                
                {/* Clear All Header */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Your Quote</h3>
                  <div className="relative">
                    <button 
                      onClick={clearAll}
                      className="text-xs text-[#999] hover:text-[#ff6b6b] transition-colors"
                    >
                      Clear All
                    </button>
                    <AnimatePresence>
                      {showClearTooltip && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="absolute right-0 top-6 bg-[#333] text-white text-[10px] px-2 py-1 rounded whitespace-nowrap"
                        >
                          All selections cleared
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Discount Badge */}
                <AnimatePresence>
                  {quote.discountName && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 overflow-hidden"
                    >
                      <div className="bg-[#c9a84c] text-black font-bold text-center py-2 rounded-lg mb-2">
                        ⭐ {quote.discountName}: {quote.discountPercent * 100}% OFF
                      </div>
                      <div className="text-center text-[#c9a84c] font-medium">
                        You Save: ${quote.discountAmount} ({quote.discountPercent * 100}%)
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Line Items */}
                <div className="space-y-3 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {quote.items.length === 0 && <p className="text-[#666] italic">Select services...</p>}
                  <AnimatePresence initial={false}>
                    {quote.items.map(item => (
                      <motion.div 
                        key={item.id} 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0, x: -20 }}
                        className="flex justify-between items-center text-sm group"
                      >
                        <span className="text-[#D4D4D4]">{item.name}</span>
                        <div className="flex items-center gap-3">
                          <span className={cn("font-mono", item.isFree ? "text-[#4CAF50]" : "text-[#D4D4D4]")}>
                            {item.isFree ? 'FREE' : `$${item.price}`}
                          </span>
                          {!item.isFree && (
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-[#666] hover:text-[#ff6b6b] transition-colors p-1"
                              aria-label="Remove item"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Complimentary Items Visual Only */}
                  {quote.complimentaryItems.map((item, i) => (
                    <div key={`comp-${i}`} className="flex justify-between text-sm">
                      <span className="text-[#D4D4D4]">{item.replace('(Included)', '')}</span>
                      <span className="text-[#4CAF50] font-mono">FREE</span>
                    </div>
                  ))}
                </div>

                <div className="h-px bg-[#222] my-6" />

                {/* Totals */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-[#999] text-sm">À la carte total</span>
                    <span className="text-[#999] font-mono line-through">${quote.alacarteTotal}</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-[#c9a84c] font-bold text-4xl leading-none">${quote.finalTotal}</span>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-[#111] p-3 rounded-lg text-[11px] text-[#666] mb-6 leading-relaxed">
                  The final quote is calculated by summing the standard prices of all selected services (including add-ons) and then applying the applicable package discount to the entire total. It is NOT calculated as a discounted package price plus separately discounted add-ons.
                </div>

                {/* CTAs */}
                <div className="space-y-3">
                  <button 
                    onClick={() => setIsBookingModalOpen(true)}
                    className="block w-full bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold text-center py-4 rounded-lg transition-colors"
                  >
                    BOOK THIS QUOTE →
                  </button>
                  <button 
                    onClick={handlePrint}
                    disabled={isGeneratingPDF || quote.items.length === 0}
                    className="block w-full border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c]/10 font-bold text-center py-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Download size={18} />
                    {isGeneratingPDF ? 'GENERATING PDF...' : 'DOWNLOAD QUOTE AS PDF'}
                  </button>
                  <div className="text-center text-[#666] text-sm pt-2 flex items-center justify-center gap-2">
                     Or call (917) 683-8034
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="packages"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <PackagesView market={state.market} tier={state.tier} onBook={applyPackage} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Pill */}
      <AnimatePresence>
        {view === 'custom' && itemCount > 0 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden"
          >
            <button
              onClick={scrollToQuote}
              className="bg-[#c9a84c] text-black font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-3"
            >
              <span>View Quote ({itemCount} items)</span>
              <span className="bg-black/10 px-2 py-0.5 rounded text-sm">${quote.finalTotal}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .sticky, .sticky * {
            visibility: visible;
          }
          .sticky {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none;
            box-shadow: none;
          }
          /* Hide buttons in print */
          .sticky button, .sticky a {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

// Sub-components

function PhotoCard({ id, name, desc, price, selected, onSelect, isPopular, discountLabel }: any) {
  const [serviceName, ...taglineParts] = name.split('—');
  const tagline = taglineParts.join('—');

  return (
    <div 
      onClick={onSelect}
      className={cn(
        "service-card group",
        selected && "selected"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 right-6 bg-[#c9a84c] text-black text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg">
          MOST POPULAR
        </div>
      )}
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4 w-full">
          <div className={cn("custom-radio mt-1", selected && "selected")} />
          
          <div className="flex-grow">
            <div className="flex justify-between items-start w-full">
              <div>
                <span className="text-[17px] font-bold text-white">{serviceName.trim()}</span>
                {tagline && <span className="text-[17px] font-normal text-[#999]"> — {tagline.trim()}</span>}
              </div>
              
              <div className="text-right shrink-0 ml-4">
                {discountLabel ? (
                  <div className="flex flex-col items-end">
                    <span className="text-[#c9a84c] font-bold text-[20px]">
                      ${Math.round(price * 0.9 / 5) * 5}
                    </span>
                    <span className="text-[#666] text-[14px] line-through decoration-1">${price}</span>
                  </div>
                ) : (
                  <span className="text-[#c9a84c] font-bold text-[20px]">${price}</span>
                )}
              </div>
            </div>
            
            <p className="text-[14px] text-[#888] leading-[1.5] mt-1.5 max-w-[90%]">{desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({ service, state, toggle, updateQuantity, compact }: any) {
  const isSelected = state.selectedServices.has(service.id);
  
  // Get Price
  const prices = state.market === 'NJ' ? NJ_PRICES : MANHATTAN_PRICES;
  let price = 0;
  // @ts-ignore
  const rawPrice = prices[service.priceKey];
  if (Array.isArray(rawPrice)) price = rawPrice[state.tier];
  else price = rawPrice;

  return (
    <div 
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('.quantity-ctrl')) return;
        toggle(service.id);
        if (!isSelected && service.type === 'quantity') updateQuantity(service.id, 1);
      }}
      className={cn(
        "service-card group",
        isSelected && "selected",
        compact ? "flex flex-col h-full" : ""
      )}
    >
      <div className="flex items-start gap-4 w-full">
        <div className={cn("custom-checkbox mt-1", isSelected && "selected")} />
        
        <div className="flex-grow w-full">
          <div className="flex justify-between items-start w-full">
            <div>
              <span className="text-[17px] font-bold text-white">{service.name}</span>
            </div>
            
            <div className="text-right shrink-0 ml-4">
              <span className="text-[#c9a84c] font-bold text-[20px]">
                ${price}
                {service.type === 'quantity' && <span className="text-[14px] text-[#666] font-normal ml-1">/{service.unit}</span>}
              </span>
            </div>
          </div>

          {!compact && <p className="text-[14px] text-[#888] leading-[1.5] mt-1.5">{service.description}</p>}
          
          {compact && (
            <div className="mt-4 flex justify-between items-end w-full">
               <p className="text-[14px] text-[#888] leading-[1.5] flex-grow pr-4">{service.description}</p>
               {service.type === 'quantity' && isSelected && (
                <div className="quantity-ctrl flex items-center gap-2 bg-[#1a1a1a] rounded px-2 py-1 border border-[#333] shrink-0">
                  <button onClick={() => updateQuantity(service.id, -1)} className="hover:text-[#c9a84c]"><Minus size={12}/></button>
                  <span className="text-xs font-mono w-4 text-center text-white">{state.quantities[service.id] || 1}</span>
                  <button onClick={() => updateQuantity(service.id, 1)} className="hover:text-[#c9a84c]"><Plus size={12}/></button>
                </div>
              )}
            </div>
          )}

          {!compact && service.type === 'quantity' && isSelected && (
             <div className="quantity-ctrl flex items-center gap-2 bg-[#1a1a1a] rounded px-2 py-1 border border-[#333] mt-3 w-fit">
                <button onClick={() => updateQuantity(service.id, -1)} className="hover:text-[#c9a84c]"><Minus size={12}/></button>
                <span className="text-xs font-mono w-4 text-center text-white">{state.quantities[service.id] || 1}</span>
                <button onClick={() => updateQuantity(service.id, 1)} className="hover:text-[#c9a84c]"><Plus size={12}/></button>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PackagesView({ market, tier, onBook }: { market: Market, tier: Tier, onBook: (pkg: string, crownOption?: string) => void }) {
  const [crownVideo, setCrownVideo] = useState<'standard' | 'agentBranding' | 'communitySpotlight'>('standard');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const getPackagePrice = (pkg: string) => {
    let simState: CalculatorState = {
      market,
      tier,
      photoPackage: 'none',
      selectedServices: new Set(),
      quantities: {}
    };

    if (pkg === 'Essential') {
      simState.photoPackage = 'silver';
      simState.selectedServices.add('quickTour');
    } else if (pkg === 'Signature') {
      simState.photoPackage = 'gold';
      simState.selectedServices.add('cinematic');
    } else if (pkg === 'Crown') {
      simState.photoPackage = 'gold';
      simState.selectedServices.add('cinematic');
      simState.selectedServices.add(crownVideo);
    }

    const q = calculateQuote(simState);
    return { price: q.finalTotal, save: q.discountPercent, savings: q.discountAmount };
  };

  const renderDescription = (title: string, desc: string, key: string) => (
    <div className="mb-5">
      <div className="flex items-start gap-3">
        <Check size={16} className="text-[#c9a84c] mt-1 shrink-0" />
        <div>
          <h4 className="text-white font-bold text-base">{title}</h4>
          <div className="text-[#B0B0B0] text-sm leading-relaxed mt-1">
            {expanded[key] ? desc : (
              <>
                {desc.split('.')[0]}.
                <button 
                  onClick={() => toggleExpand(key)}
                  className="text-[#c9a84c] ml-2 hover:underline text-xs uppercase font-bold"
                >
                  Read more
                </button>
              </>
            )}
            {expanded[key] && (
              <button 
                onClick={() => toggleExpand(key)}
                className="text-[#666] block mt-1 hover:text-[#c9a84c] text-xs uppercase font-bold"
              >
                Show less
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const essentialPrice = getPackagePrice('Essential');
  const signaturePrice = getPackagePrice('Signature');
  const crownPrice = getPackagePrice('Crown');

  const handlePackageBook = (pkgName: string, price: number) => {
    // This is a simplified handler. In a real app, you might want to pre-select the package in the main state
    // and then open the modal. For now, we'll just alert or link, but the request asked for the modal.
    // To do this properly, we need to lift the state up or pass a handler to set the main state.
    // However, since we are inside CalculatorV2, we can't easily change the parent state from here without props.
    // But wait, PackagesView is a child of CalculatorV2.
    // Actually, the prompt says "BOOK NOW on each package card -> opens the same booking modal, pre-populated with that package's services".
    // Since we don't have a way to easily pass this data back up without refactoring, 
    // and the user asked for a "Fix", let's just link to the calendar for now in the packages view 
    // OR ideally, we should refactor to allow selecting a package to populate the custom view.
    // Given the constraints and the "Fix" focus on the main buttons, I will leave the package buttons as links 
    // BUT the prompt explicitly asked for it.
    // Let's try to implement a simple alert for now or just keep the link if it's too complex to refactor in one go.
    // Actually, I can pass a handler to PackagesView.
    window.location.href = "https://www.regalisrealtymedia.com/calendar";
  };

  return (
    <div className="space-y-16">
      {/* Package Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* ESSENTIAL */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-8 flex flex-col relative">
          <div className="absolute top-0 right-0 bg-[#c9a84c] text-black text-xs font-bold px-3 py-1 rounded-bl-lg border-l border-b border-[#c9a84c]">
            15% OFF
          </div>
          <h3 className="text-[32px] font-bold text-white mb-1">Essential</h3>
          <p className="text-[#c9a84c] italic text-sm mb-8">Silver Photos + Quick Tour Video + Listing Website</p>
          
          <div className="flex-grow">
            {renderDescription(
              "Silver Photos — Interior & Exterior", 
              "Professional HDR photography covering every room, key exterior angles, and detail shots. Includes window pull, sky replacement, and color correction. MLS-ready delivery within 24 hours. Silver includes your floor plan at a bundled rate.",
              "ess_photos"
            )}
            {renderDescription(
              "Floor Plan — 2D Marketing Layout", 
              "Clean, accurate 2D floor plan with room labels, dimensions, and total square footage. Branded with your information and ready for MLS, print flyers, and digital marketing.",
              "ess_fp"
            )}
            {renderDescription(
              "Quick Tour Video — Social-Ready Walkthrough", 
              "A 15-30 second vertical video walkthrough set to music — designed specifically for Instagram Reels, TikTok, and Facebook Stories. Fast-paced, engaging, and optimized for the way buyers actually scroll. This is NOT a slideshow — it's a professionally shot and edited video.",
              "ess_qt"
            )}
            {renderDescription(
              "Custom Listing Website", 
              "A branded, single-property website with photo gallery, video embed, property details, and agent contact info. Shareable link for social media, email campaigns, and open house sign-in pages. Included FREE with this package.",
              "ess_web"
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#222]">
            <div className="text-[#999] text-xs font-bold uppercase mb-1">PACKAGE PRICE</div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-white font-bold text-4xl">${essentialPrice.price}</span>
              <span className="bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold px-2 py-1 rounded">
                You Save ${essentialPrice.savings}
              </span>
            </div>
            <button 
              onClick={() => onBook('Essential')}
              className="block w-full bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold text-center py-3 rounded-lg transition-colors"
            >
              BOOK NOW →
            </button>
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="bg-[#0a0a0a] border border-[#c9a84c]/40 rounded-xl p-8 flex flex-col relative shadow-[0_8px_32px_rgba(201,168,76,0.1)] transform md:-translate-y-4">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#c9a84c] text-black text-xs font-bold px-4 py-1 rounded-full shadow-lg">
            ⭐ MOST POPULAR
          </div>
          <div className="absolute top-0 right-0 bg-[#c9a84c] text-black text-xs font-bold px-3 py-1 rounded-bl-lg border-l border-b border-[#c9a84c]">
            20% OFF
          </div>
          <h3 className="text-[32px] font-bold text-white mb-1">Signature</h3>
          <p className="text-[#c9a84c] italic text-sm mb-8">Gold Photos + Cinematic Reel + 2 Twilight Exteriors + Listing Website</p>
          
          <div className="flex-grow">
            {renderDescription(
              "Gold Photos — The Complete Visual Package", 
              "Everything in Silver, PLUS drone aerial photography, interactive 3D tour (Zillow-compatible Matterport-style walkthrough), and professional floor plan. This is the full visual toolkit — every angle, every perspective, every format a buyer could want.",
              "sig_photos"
            )}
            {renderDescription(
              "Regalis Cinematic — Premium Listing Film", 
              "A fully produced cinematic listing video (60-90 seconds) with professional camera work, stabilized movement, color grading, bespoke text overlays, branded intro/outro, and custom sound design. Available in horizontal (MLS/YouTube) or vertical (social media) formats. This is the flagship video product — the one that makes agents and listings look extraordinary. Drone footage included in NJ; available as add-on in Manhattan.",
              "sig_cine"
            )}
            {renderDescription(
              "2 Twilight Exterior Photos", 
              "Golden hour exterior photography that transforms the property's curb appeal. Warm sky tones, interior glow, and dramatic lighting that makes every home look like a magazine cover. Included complimentary with this package.",
              "sig_twi"
            )}
            {renderDescription(
              "Custom Listing Website", 
              "Branded single-property website included FREE.",
              "sig_web"
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#222]">
            <div className="text-[#999] text-xs font-bold uppercase mb-1">PACKAGE PRICE</div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-white font-bold text-4xl">${signaturePrice.price}</span>
              <span className="bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold px-2 py-1 rounded">
                You Save ${signaturePrice.savings}
              </span>
            </div>
            <button 
              onClick={() => onBook('Signature')}
              className="block w-full bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold text-center py-3 rounded-lg transition-colors"
            >
              BOOK NOW →
            </button>
          </div>
        </div>

        {/* CROWN */}
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-8 flex flex-col relative">
          <div className="absolute top-0 right-0 bg-[#c9a84c] text-black text-xs font-bold px-3 py-1 rounded-bl-lg border-l border-b border-[#c9a84c]">
            30% OFF
          </div>
          <h3 className="text-[32px] font-bold text-white mb-1">Crown</h3>
          <p className="text-[#c9a84c] italic text-sm mb-8">Gold Photos + Cinematic + Standard OR Branding OR Spotlight + 2 Twilight Exteriors + Website</p>
          
          <div className="flex-grow">
            {renderDescription(
              "Gold Photos — The Complete Visual Package", 
              "Same description as Signature: Bronze photos + drone + 3D tour + floor plan.",
              "crn_photos"
            )}
            {renderDescription(
              "Regalis Cinematic — Premium Listing Film", 
              "Same description as Signature.",
              "crn_cine"
            )}
            
            <div className="mb-5">
              <div className="flex items-start gap-3">
                <Check size={16} className="text-[#c9a84c] mt-1 shrink-0" />
                <div className="w-full">
                  <h4 className="text-white font-bold text-base mb-3">PLUS Choose One Additional Video:</h4>
                  <div className="space-y-2">
                    {[
                      { id: 'standard', title: 'Option A: Regalis Standard', desc: 'Professional Listing Video' },
                      { id: 'agentBranding', title: 'Option B: Agent Branding', desc: 'Your Personal Brand Film' },
                      { id: 'communitySpotlight', title: 'Option C: Community Spotlight', desc: 'Neighborhood Highlight' }
                    ].map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => setCrownVideo(opt.id as any)}
                        className={cn(
                          "p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between",
                          crownVideo === opt.id 
                            ? "bg-[#c9a84c]/10 border-[#c9a84c]" 
                            : "bg-[#111] border-[#222] hover:border-[#444]"
                        )}
                      >
                        <div>
                          <div className="text-sm font-bold text-white">{opt.title}</div>
                          <div className="text-xs text-[#999]">{opt.desc}</div>
                        </div>
                        <div className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center",
                          crownVideo === opt.id ? "border-[#c9a84c] bg-[#c9a84c]" : "border-[#444]"
                        )}>
                          {crownVideo === opt.id && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {renderDescription(
              "2 Twilight Exterior Photos", 
              "Included complimentary.",
              "crn_twi"
            )}
            {renderDescription(
              "Custom Listing Website", 
              "Included FREE.",
              "crn_web"
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[#222]">
            <div className="text-[#999] text-xs font-bold uppercase mb-1">PACKAGE PRICE</div>
            <div className="flex items-end justify-between mb-4">
              <span className="text-white font-bold text-4xl">${crownPrice.price}</span>
              <span className="bg-[#c9a84c]/20 text-[#c9a84c] text-xs font-bold px-2 py-1 rounded">
                You Save ${crownPrice.savings}
              </span>
            </div>
            <button 
              onClick={() => onBook('Crown', crownVideo)}
              className="block w-full bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold text-center py-3 rounded-lg transition-colors"
            >
              BOOK NOW →
            </button>
          </div>
        </div>

      </div>

      {/* Comparison Table */}
      <div className="bg-[#0a0a0a] border border-[#222] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#222] flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-white">All Packages At A Glance</h3>
          <div className="text-[#c9a84c] text-sm font-mono">
            PRICE ({TIERS[tier].label.replace('sqft', 'SF')})
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-[#111] text-[#999] uppercase text-xs">
                <th className="p-4 font-bold">Service</th>
                <th className="p-4 font-bold">Essential</th>
                <th className="p-4 font-bold bg-[#c9a84c]/10 text-[#c9a84c]">Signature</th>
                <th className="p-4 font-bold">Crown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222] text-[#D4D4D4]">
              <tr>
                <td className="p-4 font-medium">Interior & Exterior Photos</td>
                <td className="p-4">Silver (Bronze + FP)</td>
                <td className="p-4 bg-[#c9a84c]/5">Gold (Bronze + FP + Drone + 3D)</td>
                <td className="p-4">Gold (Bronze + FP + Drone + 3D)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Floor Plan (2D Marketing)</td>
                <td className="p-4 text-[#c9a84c]">✓ (Silver)</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#c9a84c]">✓ (Gold)</td>
                <td className="p-4 text-[#c9a84c]">✓ (Gold)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Drone Aerial Stills</td>
                <td className="p-4 text-[#666]">—</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#c9a84c]">✓ (Gold)</td>
                <td className="p-4 text-[#c9a84c]">✓ (Gold)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">3D Tour + Interactive Floor Plan</td>
                <td className="p-4 text-[#666]">—</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#c9a84c]">✓ (Gold)</td>
                <td className="p-4 text-[#c9a84c]">✓ (Gold)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">2 Twilight Exterior Photos</td>
                <td className="p-4 text-[#666]">—</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#c9a84c]">✓ Complimentary</td>
                <td className="p-4 text-[#c9a84c]">✓ Complimentary</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Quick Tour Video</td>
                <td className="p-4 text-[#c9a84c]">✓</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#666]">—</td>
                <td className="p-4 text-[#666]">—</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Regalis Cinematic</td>
                <td className="p-4 text-[#666]">—</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#c9a84c]">✓</td>
                <td className="p-4 text-[#c9a84c]">✓</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Standard, Branding, or Spotlight</td>
                <td className="p-4 text-[#666]">—</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#666]">—</td>
                <td className="p-4 text-[#c9a84c]">✓ (Pick 1)</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Drone in Video</td>
                <td className="p-4">{market === 'NJ' ? 'Included FREE' : '$100 add-on'}</td>
                <td className="p-4 bg-[#c9a84c]/5">{market === 'NJ' ? 'Included FREE' : '$100 add-on'}</td>
                <td className="p-4">{market === 'NJ' ? 'Included FREE' : '$100 add-on'}</td>
              </tr>
              <tr>
                <td className="p-4 font-medium">Custom Listing Website</td>
                <td className="p-4 text-[#c9a84c]">✓ Included</td>
                <td className="p-4 bg-[#c9a84c]/5 text-[#c9a84c]">✓ Included</td>
                <td className="p-4 text-[#c9a84c]">✓ Included</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
