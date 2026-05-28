export type TrackingEventName = 
  | 'CART_UPDATED'
  | 'CHECKOUT_STARTED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'ORDER_CREATED'
  | 'PRODUCT_VIEWED'
  | 'ADD_TO_CART';

export interface TrackingEventPayload {
  [key: string]: string | number | boolean | null | undefined | object;
}

/**
 * Unified Analytics Tracking Hook
 * Provides an isolated, predictable interface for sending events to backend ML algorithms,
 * data warehouses, or third-party pixel tracking without blocking UI threads.
 */
export const trackEvent = (eventName: TrackingEventName, payload?: TrackingEventPayload) => {
  // In a production app, we would wrap this in a non-blocking macro-task (e.g., requestIdleCallback)
  // or use a service worker to guarantee transmission without impacting Core Web Vitals (CLS/INP).
  
  if (typeof window === 'undefined') return;

  try {
    const event = {
      event: eventName,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      payload,
    };

    // 1. Log to console for debugging in dev
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] ${eventName}`, payload);
    }

    // 2. Dispatch a CustomEvent so other React components (like the Mini-Cart) can listen natively
    // without relying on heavy Redux state if they only need fire-and-forget interactions.
    window.dispatchEvent(new CustomEvent('nira6_event', { detail: event }));

    // 3. (Future) Push to dataLayer for GTM / Mixpanel / Custom API
    // window.dataLayer = window.dataLayer || [];
    // window.dataLayer.push(event);

    // 4. (Future) Push to custom Next.js API for ML ingestion
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event) });

  } catch (err) {
    console.error('Analytics error:', err);
  }
};
