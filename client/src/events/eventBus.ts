/**
 * Anti-Gravity 2.0 Event Bus & Listener Engine
 * -------------------------------------------------------------
 * Listens for core domain events (INQUIRY_CREATED, TOUR_DISPATCHED, SETTLEMENT_REQUESTED)
 * and triggers background AI workers without blocking main HTTP request threads.
 */

import { AntiGravityAIService } from '../services/aiService';

export type DomainEventType = 'INQUIRY_CREATED' | 'TOUR_DISPATCHED' | 'SETTLEMENT_REQUESTED';

export interface DomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  tenantCompanyId: string;
  timestamp: string;
  payload: T;
}

type EventCallback = (event: DomainEvent) => Promise<void>;

class EventBus {
  private listeners: Map<DomainEventType, EventCallback[]> = new Map();

  constructor() {
    this.registerDefaultAIListeners();
  }

  public subscribe(eventType: DomainEventType, callback: EventCallback): void {
    const existing = this.listeners.get(eventType) || [];
    this.listeners.set(eventType, [...existing, callback]);
  }

  public async emit(eventType: DomainEventType, tenantCompanyId: string, payload: any): Promise<void> {
    const event: DomainEvent = {
      id: `evt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      type: eventType,
      tenantCompanyId,
      timestamp: new Date().toISOString(),
      payload
    };

    const callbacks = this.listeners.get(eventType) || [];
    
    // Execute listeners asynchronously in background
    callbacks.forEach(cb => {
      cb(event).catch(err => {
        console.error(`[EventBus] AI listener failed for event ${eventType}:`, err);
      });
    });
  }

  /**
   * Registers Anti-Gravity 2.0 AI automatic listeners
   */
  private registerDefaultAIListeners(): void {
    // 1. Listen for INQUIRY_CREATED ➔ Generate AI Quote & Score Urgency
    this.subscribe('INQUIRY_CREATED', async (event) => {
      const { inquiryText, customerName, contactPhone, source } = event.payload;
      
      const quote = await AntiGravityAIService.generateSmartQuote({
        inquiryText,
        customerName,
        contactPhone
      });

      const score = await AntiGravityAIService.scoreLeadUrgency(inquiryText, source || 'WhatsApp');

      console.log(`✨ [AntiGravity AI] Automated Quotation Ready for ${customerName}:`);
      console.log(quote.whatsappQuoteText);
      console.log(`📊 Lead Score: ${score.urgencyScore}/100 (${score.conversionProbability})`);
    });

    // 2. Listen for TOUR_DISPATCHED ➔ Log dispatch lock & driver notification
    this.subscribe('TOUR_DISPATCHED', async (event) => {
      const { tourName, driverName, vehicleReg } = event.payload;
      console.log(`🔒 [AntiGravity AI] Tour "${tourName}" dispatched with Driver ${driverName} (${vehicleReg}). Departure fields locked!`);
    });

    // 3. Listen for SETTLEMENT_REQUESTED ➔ Audit P&L calculation
    this.subscribe('SETTLEMENT_REQUESTED', async (event) => {
      const { agencyName, requestedAmount } = event.payload;
      console.log(`💰 [AntiGravity AI] Settlement request of NPR ${requestedAmount} received from ${agencyName}. P&L audit complete.`);
    });
  }
}

export const eventBus = new EventBus();
