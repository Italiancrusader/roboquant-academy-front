
/**
 * Meta Conversions API utility functions for server-side event tracking
 */

export interface ConversionsAPIEventData {
  eventName: string;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    externalId?: string;
    clientIpAddress?: string;
    clientUserAgent?: string;
    fbc?: string;
    fbp?: string;
  };
  customData?: {
    currency?: string;
    value?: number;
    contentName?: string;
    contentCategory?: string;
    contentIds?: string[];
    contents?: Array<{id: string, quantity: number}>;
    numItems?: number;
  };
  eventSourceUrl?: string;
  eventId?: string;
}

/**
 * Get Meta Pixel cookies for better attribution
 */
const getMetaPixelCookies = () => {
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  return {
    fbc: cookies._fbc || undefined,
    fbp: cookies._fbp || undefined,
  };
};

/**
 * Get client information for better attribution
 */
const getClientInfo = () => {
  return {
    clientUserAgent: navigator.userAgent,
    eventSourceUrl: window.location.href,
  };
};

/**
 * Generate a unique event ID for deduplication
 */
const generateEventId = (eventName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  return `${eventName}_${timestamp}_${random}`;
};

/**
 * Send event to Meta Conversions API
 */
const sendConversionsAPIEvent = async (eventData: ConversionsAPIEventData): Promise<boolean> => {
  try {
    console.log(`📊 Sending Meta Conversions API event: ${eventData.eventName}`);

    // Add client info and Meta Pixel cookies
    const clientInfo = getClientInfo();
    const metaCookies = getMetaPixelCookies();
    
    const enrichedEventData = {
      ...eventData,
      eventSourceUrl: eventData.eventSourceUrl || clientInfo.eventSourceUrl,
      eventId: eventData.eventId || generateEventId(eventData.eventName),
      userData: {
        ...eventData.userData,
        clientUserAgent: eventData.userData.clientUserAgent || clientInfo.clientUserAgent,
        fbc: eventData.userData.fbc || metaCookies.fbc,
        fbp: eventData.userData.fbp || metaCookies.fbp,
      },
    };

    const response = await fetch('/functions/v1/meta-conversions-api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(enrichedEventData),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('❌ Meta Conversions API error:', result);
      return false;
    }

    console.log('✅ Meta Conversions API event sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending Meta Conversions API event:', error);
    return false;
  }
};

/**
 * Track Purchase event via Conversions API
 */
export const trackPurchaseConversionsAPI = async (params: {
  value: number;
  currency?: string;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  contentName?: string;
  contentCategory?: string;
  externalId?: string;
}): Promise<boolean> => {
  return sendConversionsAPIEvent({
    eventName: 'Purchase',
    userData: {
      ...params.userData,
      externalId: params.externalId,
    },
    customData: {
      value: params.value,
      currency: params.currency || 'USD',
      contentName: params.contentName,
      contentCategory: params.contentCategory,
    },
  });
};

/**
 * Track Lead event via Conversions API
 */
export const trackLeadConversionsAPI = async (params: {
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  contentName?: string;
  externalId?: string;
}): Promise<boolean> => {
  return sendConversionsAPIEvent({
    eventName: 'Lead',
    userData: {
      ...params.userData,
      externalId: params.externalId,
    },
    customData: {
      contentName: params.contentName,
    },
  });
};

/**
 * Track ViewContent event via Conversions API
 */
export const trackViewContentConversionsAPI = async (params: {
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  contentName?: string;
  contentCategory?: string;
  value?: number;
  currency?: string;
  externalId?: string;
}): Promise<boolean> => {
  return sendConversionsAPIEvent({
    eventName: 'ViewContent',
    userData: {
      ...params.userData,
      externalId: params.externalId,
    },
    customData: {
      contentName: params.contentName,
      contentCategory: params.contentCategory,
      value: params.value,
      currency: params.currency || 'USD',
    },
  });
};

/**
 * Track InitiateCheckout event via Conversions API
 */
export const trackInitiateCheckoutConversionsAPI = async (params: {
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  value?: number;
  currency?: string;
  contentName?: string;
  externalId?: string;
}): Promise<boolean> => {
  return sendConversionsAPIEvent({
    eventName: 'InitiateCheckout',
    userData: {
      ...params.userData,
      externalId: params.externalId,
    },
    customData: {
      value: params.value,
      currency: params.currency || 'USD',
      contentName: params.contentName,
    },
  });
};

/**
 * Track CompleteRegistration event via Conversions API
 */
export const trackCompleteRegistrationConversionsAPI = async (params: {
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  contentName?: string;
  externalId?: string;
}): Promise<boolean> => {
  return sendConversionsAPIEvent({
    eventName: 'CompleteRegistration',
    userData: {
      ...params.userData,
      externalId: params.externalId,
    },
    customData: {
      contentName: params.contentName,
    },
  });
};

/**
 * Track custom event via Conversions API
 */
export const trackCustomEventConversionsAPI = async (params: {
  eventName: string;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  customData?: {
    currency?: string;
    value?: number;
    contentName?: string;
    contentCategory?: string;
  };
  externalId?: string;
}): Promise<boolean> => {
  return sendConversionsAPIEvent({
    eventName: params.eventName,
    userData: {
      ...params.userData,
      externalId: params.externalId,
    },
    customData: params.customData,
  });
};
