import { useState } from 'react';
import { X, Copy, Check, Calendar } from 'lucide-react';
import { cn } from '../lib/utils';
import { QuoteResult } from '../utils/calculatorLogic_v2';
import { Market, Tier, TIERS } from '../data/pricing_v2';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  quote: QuoteResult;
  market: Market;
  tier: Tier;
}

export function BookingModal({ isOpen, onClose, quote, market, tier }: BookingModalProps) {
  const [step, setStep] = useState<'form' | 'confirmation'>('form');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: 'Morning (8am-12pm)',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!formData.name.trim()) newErrors.name = true;
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = true;
    if (!formData.phone.trim()) newErrors.phone = true;
    if (!formData.address.trim()) newErrors.address = true;
    if (!formData.date) newErrors.date = true;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getEmailBody = () => {
    const marketLabel = market === 'NJ' ? 'NJ & Boroughs' : 'Manhattan';
    const tierLabel = TIERS.find(t => t.value === tier)?.label || '';
    
    const serviceLines = quote.items.map(s => {
      const price = s.isFree ? 'FREE (Complimentary)' : `$${s.price}`;
      return `  • ${s.name}: ${price}`;
    }).join('\n');

    return `
BOOKING REQUEST — REGALIS REALTY MEDIA
========================================

CLIENT INFORMATION
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}

PROPERTY DETAILS
Address: ${formData.address}
Property Size: ${tierLabel}
Market: ${marketLabel}

PREFERRED SCHEDULE
Date: ${new Date(formData.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Time: ${formData.time}

SELECTED SERVICES
${serviceLines}

PRICING
À la carte total: $${quote.alacarteTotal}${quote.discountName ? `\nDiscount: ${quote.discountName} (${quote.discountPercent * 100}% off)` : ''}${quote.discountAmount > 0 ? `\nYou save: $${quote.discountAmount}` : ''}
TOTAL: $${quote.finalTotal}

${formData.notes ? `ADDITIONAL NOTES\n${formData.notes}\n` : ''}
========================================
This is a booking REQUEST — not a confirmed booking.
Please confirm availability and respond to the client.
========================================
    `.trim();
  };

  const handleSend = () => {
    if (!validate()) return;

    const subject = `Booking Request — ${formData.name} — ${formData.address}`;
    const body = getEmailBody();
    const mailtoLink = `mailto:contact@regalisrealtymedia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;
    setStep('confirmation');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmailBody());
    alert('Booking details copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/80 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111] border border-[#222] rounded-2xl w-full max-w-[560px] max-h-[90vh] overflow-y-auto p-6 md:p-9 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#999] hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        {step === 'form' ? (
          <>
            <h2 className="text-[28px] font-bold text-white mb-2">Book Your Shoot</h2>
            <p className="text-[15px] text-[#999] mb-7">
              Your selected services and pricing will be included in the booking request.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-bold text-[#D4D4D4] mb-1.5">Your Name *</label>
                <input
                  type="text"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className={cn(
                    "w-full bg-[#0a0a0a] border rounded-lg px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors",
                    errors.name ? "border-red-500/50" : "border-[#333]"
                  )}
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#D4D4D4] mb-1.5">Email Address *</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className={cn(
                    "w-full bg-[#0a0a0a] border rounded-lg px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors",
                    errors.email ? "border-red-500/50" : "border-[#333]"
                  )}
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#D4D4D4] mb-1.5">Phone Number *</label>
                <input
                  type="tel"
                  placeholder="(555) 555-5555"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className={cn(
                    "w-full bg-[#0a0a0a] border rounded-lg px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors",
                    errors.phone ? "border-red-500/50" : "border-[#333]"
                  )}
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#D4D4D4] mb-1.5">Property Address *</label>
                <input
                  type="text"
                  placeholder="123 Main St, City, State, ZIP"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className={cn(
                    "w-full bg-[#0a0a0a] border rounded-lg px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors",
                    errors.address ? "border-red-500/50" : "border-[#333]"
                  )}
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#D4D4D4] mb-1.5">Preferred Shoot Date *</label>
                <input
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                  className={cn(
                    "w-full bg-[#0a0a0a] border rounded-lg px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors scheme-dark",
                    errors.date ? "border-red-500/50" : "border-[#333]"
                  )}
                />
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#D4D4D4] mb-1.5">Preferred Time</label>
                <select
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors appearance-none cursor-pointer"
                >
                  <option>Morning (8am-12pm)</option>
                  <option>Afternoon (12pm-4pm)</option>
                  <option>Evening / Twilight (4pm-sunset)</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#D4D4D4] mb-1.5">Additional Notes (optional)</label>
                <textarea
                  placeholder="Any special instructions, access codes, staging details, etc."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-4 py-3.5 text-[15px] text-white focus:outline-none focus:border-[#c9a84c] transition-colors min-h-[100px]"
                />
              </div>
            </div>

            <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl p-5 my-6">
              <div className="text-[13px] font-bold text-[#999] uppercase tracking-wider mb-3">Your Quote Summary</div>
              <div className="space-y-1 mb-4">
                {quote.items.map(item => (
                  <div key={item.id} className="flex justify-between text-[14px] text-[#D4D4D4]">
                    <span>{item.name}</span>
                    <span className={item.isFree ? "text-[#4CAF50]" : ""}>{item.isFree ? 'FREE' : `$${item.price}`}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#333] pt-3 mt-3 flex justify-between items-end">
                <span className="text-white font-bold text-lg">Total</span>
                <div className="text-right">
                  {quote.discountAmount > 0 && (
                    <div className="text-[#c9a84c] text-xs mb-1">You save ${quote.discountAmount}</div>
                  )}
                  <span className="text-[#c9a84c] font-bold text-2xl leading-none">${quote.finalTotal}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSend}
              className="w-full bg-[#c9a84c] hover:bg-[#b09342] text-black font-bold text-[16px] py-4 rounded-lg transition-all hover:scale-[1.01] shadow-[0_0_20px_rgba(201,168,76,0.0)] hover:shadow-[0_0_20px_rgba(201,168,76,0.3)]"
            >
              SEND BOOKING REQUEST →
            </button>

            <div className="text-center mt-4 space-y-2">
              <p className="text-[13px] text-[#888]">
                This is a request, not a confirmed booking.<br/>
                We'll respond within 2 hours to confirm availability.
              </p>
              <div className="text-[13px] text-[#888]">
                Or book directly: <a href="https://www.regalisrealtymedia.com/calendar" target="_blank" rel="noreferrer" className="text-[#c9a84c] hover:underline">regalisrealtymedia.com/calendar</a>
                <br/>
                Or call: (917) 683-8034
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#c9a84c]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={32} className="text-[#c9a84c]" />
            </div>
            <h2 className="text-[28px] font-bold text-white mb-4">Booking Request Ready!</h2>
            <p className="text-[#D4D4D4] mb-8 leading-relaxed max-w-[400px] mx-auto">
              Your email client should have opened with your booking request pre-filled. Just hit "Send" in your email app.
            </p>

            <div className="space-y-4 max-w-[300px] mx-auto">
              <button
                onClick={handleCopy}
                className="w-full border border-[#333] hover:border-[#c9a84c] hover:text-[#c9a84c] text-[#D4D4D4] font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Copy size={16} />
                COPY BOOKING DETAILS
              </button>
              
              <p className="text-[13px] text-[#888] pt-4">
                If your email didn't open, copy the details above and email us at <a href="mailto:contact@regalisrealtymedia.com" className="text-[#c9a84c]">contact@regalisrealtymedia.com</a>
              </p>

              <button
                onClick={onClose}
                className="w-full bg-[#222] hover:bg-[#333] text-white font-bold py-3 rounded-lg transition-colors mt-4"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
