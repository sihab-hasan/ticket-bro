import { ENDPOINTS } from "@/config/api.config";
import { del, get, post, put } from "@/api/client";

const cartService = {
  getCart: () => get(ENDPOINTS.CART.ROOT),
  addItem: (data) => post(ENDPOINTS.CART.ADD, data),
  updateItem: (itemId, data) => put(ENDPOINTS.CART.UPDATE(itemId), data),
  removeItem: (itemId) => del(ENDPOINTS.CART.REMOVE(itemId)),
  clearCart: () => del(ENDPOINTS.CART.CLEAR),
  applyPromo: (code) => post(ENDPOINTS.CART.APPLY_PROMO, { code }),
  removePromo: () => del(ENDPOINTS.CART.REMOVE_PROMO),
  checkout: (data) => post(ENDPOINTS.CART.CHECKOUT, data),
};

export default cartService;
