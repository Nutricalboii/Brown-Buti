interface RazorpayCheckoutPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayFailurePayload {
  error?: { description?: string; reason?: string };
}

interface RazorpayCheckoutModalOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpayCheckoutPayload) => Promise<void>;
  modal: { ondismiss: () => void };
}

interface RazorpayCheckoutInstance {
  on: (event: 'payment.failed', callback: (response: RazorpayFailurePayload) => void) => void;
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutModalOptions) => RazorpayCheckoutInstance;
  }
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  payment_id?: string;
  amount?: number;
  currency?: string;
}

export interface RazorpayCheckoutOptions {
  items: Array<{ productId: number | string; quantity: number }>;
  name?: string;
  description?: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (response: VerifyPaymentResponse) => void;
  onError?: (error: string) => void;
  onDismiss?: () => void;
}

/**
 * Dynamically load Razorpay checkout script if not already loaded
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initiate Razorpay payment flow:
 * 1. Calls backend /api/create-order
 * 2. Opens Razorpay modal with order_id
 * 3. On payment success, verifies signature via /api/verify-payment
 */
export const initiateRazorpayPayment = async (options: RazorpayCheckoutOptions): Promise<void> => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    options.onError?.('Failed to load Razorpay SDK. Please check your internet connection.');
    return;
  }
  const RazorpayConstructor = window.Razorpay;
  if (!RazorpayConstructor) {
    options.onError?.('Secure checkout could not be loaded. Please try Shopify checkout instead.');
    return;
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    options.onError?.('Razorpay is not configured. Please contact support.');
    return;
  }
  if (!Array.isArray(options.items) || options.items.length === 0) {
    options.onError?.('Your cart is empty. Add an item before checkout.');
    return;
  }

  // STEP 1: Backend - Create Order
  let orderData: CreateOrderResponse;
  try {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: options.items }),
    });

    const responseData = await response.json().catch(() => ({})) as Partial<CreateOrderResponse> & { error?: string };
    if (!response.ok) {
      throw new Error(responseData.error || 'Unable to start secure checkout.');
    }

    if (
      typeof responseData.order_id !== 'string' ||
      typeof responseData.amount !== 'number' || !Number.isSafeInteger(responseData.amount) || responseData.amount < 100 ||
      responseData.currency !== 'INR'
    ) {
      throw new Error('The payment service returned an invalid order.');
    }
    orderData = responseData as CreateOrderResponse;
  } catch (error) {
    options.onError?.(error instanceof Error ? error.message : 'Unable to create payment order. Please try again.');
    return;
  }

  // STEP 2: Open the provider checkout with the server-priced order.
  const razorpayOptions = {
    key: keyId,
    amount: orderData.amount,
    currency: orderData.currency,
    name: options.name || 'Mocha & Mogra',
    description: options.description || 'Stitched in Silk — Sarees & Luxury Couture',
    image: options.image || 'https://res.cloudinary.com/xtrw55ut/image/upload/v1724000000/mnmlogo.png',
    order_id: orderData.order_id,
    prefill: {
      name: options.prefill?.name || '',
      email: options.prefill?.email || '',
      contact: options.prefill?.contact || '',
    },
    theme: {
      color: '#4A2C2A', // Mocha luxury palette
    },
    handler: async (response: RazorpayCheckoutPayload) => {
      // STEP 3: BACKEND - Verify Signature
      try {
        const verifyRes = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          }),
        });

        const verifyData = await verifyRes.json() as VerifyPaymentResponse;

        if (
          verifyRes.ok && verifyData.success &&
          verifyData.order_id === orderData.order_id &&
          verifyData.payment_id === response.razorpay_payment_id &&
          verifyData.currency === 'INR' && verifyData.amount === orderData.amount
        ) {
          options.onSuccess?.(verifyData);
        } else {
          options.onError?.(verifyData.error || 'Payment could not be verified. Please contact support before retrying.');
        }
      } catch {
        options.onError?.('Network error while verifying payment signature.');
      }
    },
    modal: {
      ondismiss: () => {
        options.onDismiss?.();
      },
    },
  };

  try {
    const razorpayInstance = new RazorpayConstructor(razorpayOptions);
    razorpayInstance.on('payment.failed', (failure) => {
      const failureMessage = failure.error?.description || failure.error?.reason;
      options.onError?.(failureMessage || 'Payment was not completed. Please try again or use Shopify checkout.');
    });
    razorpayInstance.open();
  } catch {
    options.onError?.('Secure checkout could not be opened. Please try Shopify checkout instead.');
  }
};
