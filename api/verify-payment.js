import { verifyPaymentHandler } from '../server/razorpay.js';

export default {
  fetch(request) {
    return verifyPaymentHandler(request);
  },
};
