import { ENDPOINTS } from "@/config/api.config";
import { del, get, post, put, pickEntity } from "@/api/client";

const normalizeCartItem = (item = {}) => ({
  ...item,
  event: item?.event || null,
  ticketType:
    item?.ticketType && typeof item.ticketType === "object"
      ? item.ticketType
      : item?.ticketTypeName
        ? { name: item.ticketTypeName }
        : null,
  unitPrice: Number(item?.unitPrice ?? item?.ticketType?.price ?? 0),
  totalPrice: Number(
    item?.totalPrice ??
      Number(item?.unitPrice ?? item?.ticketType?.price ?? 0) *
        Number(item?.quantity ?? 0),
  ),
  quantity: Number(item?.quantity ?? 0),
});

const normalizeCart = (payload) => {
  const raw = pickEntity("cart")(payload) || payload || {};
  const items = Array.isArray(raw?.items)
    ? raw.items.map(normalizeCartItem)
    : [];
  const subtotal = Number(
    raw?.subtotal ?? items.reduce((sum, item) => sum + item.totalPrice, 0),
  );
  const discount = Number(raw?.discount ?? raw?.discountAmount ?? 0);

  return {
    ...raw,
    items,
    subtotal,
    discount,
    discountAmount: discount,
    promoCode: raw?.promoCode || null,
    itemCount: Number(
      raw?.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0),
    ),
    total: Number(raw?.total ?? Math.max(0, subtotal - discount)),
  };
};

const cartService = {
  getCart: () => get(ENDPOINTS.CART.ROOT, { select: normalizeCart }),
  addItem: (data) => post(ENDPOINTS.CART.ADD, data, { select: normalizeCart }),
  updateItem: (itemId, data) =>
    put(ENDPOINTS.CART.UPDATE(itemId), data, { select: normalizeCart }),
  removeItem: (itemId) =>
    del(ENDPOINTS.CART.REMOVE(itemId), { select: normalizeCart }),
  clearCart: () => del(ENDPOINTS.CART.CLEAR),
  applyPromo: (code) =>
    post(ENDPOINTS.CART.APPLY_PROMO, { code }, { select: normalizeCart }),
  removePromo: () =>
    del(ENDPOINTS.CART.REMOVE_PROMO, { select: normalizeCart }),
  checkout: (data) => post(ENDPOINTS.CART.CHECKOUT, data),
};

export default cartService;
