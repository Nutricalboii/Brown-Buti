import { createOrderHandler } from '../server/razorpay.js';

export default {
  fetch(request) {
    return createOrderHandler(request);
  },
};
