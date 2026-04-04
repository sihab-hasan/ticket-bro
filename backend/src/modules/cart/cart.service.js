"use strict";
const cartRepository = require("./cart.repository");
const bookingService = require("../bookings/booking.service");
const {
  BadRequestError,
  NotFoundError,
} = require("../../common/errors/AppError");
const getId = (u) => u?._id || u?.id || u?.userId;

class CartService {
  async getCart(userId) {
    const cart = await cartRepository.findByUserId(userId);
    return (
      cart || { user: userId, items: [], subtotal: 0, total: 0, itemCount: 0 }
    );
  }

  async addItem(
    userId,
    { eventId, ticketTypeId, ticketTypeName, quantity, unitPrice },
  ) {
    const cart = (await cartRepository.findByUserId(userId)) || {
      user: userId,
      items: [],
    };
    const items = cart.items || [];
    const idx = items.findIndex(
      (i) => i.ticketType?.toString() === ticketTypeId?.toString(),
    );
    if (idx >= 0) {
      items[idx].quantity += quantity;
      items[idx].totalPrice = items[idx].unitPrice * items[idx].quantity;
    } else {
      items.push({
        event: eventId,
        ticketType: ticketTypeId,
        ticketTypeName,
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
      });
    }
    return cartRepository.upsert(userId, { items });
  }

  async updateItem(userId, itemId, { quantity }) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError("Cart not found.");
    const item = cart.items.id(itemId);
    if (!item) throw new NotFoundError("Cart item not found.");
    if (quantity < 1) throw new BadRequestError("Quantity must be at least 1.");
    item.quantity = quantity;
    item.totalPrice = item.unitPrice * quantity;
    await cart.save();
    return cart;
  }

  async removeItem(userId, itemId) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError("Cart not found.");
    cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
    await cart.save();
    return cart;
  }

  async clearCart(userId) {
    await cartRepository.deleteByUserId(userId);
    return { message: "Cart cleared." };
  }

  async applyPromo(userId, code) {
    // Placeholder — integrate with promotions.service when implemented
    return cartRepository.upsert(userId, {
      promoCode: code.toUpperCase(),
      discountAmount: 0,
    });
  }

  async removePromo(userId) {
    return cartRepository.upsert(userId, {
      promoCode: null,
      promoId: null,
      discountAmount: 0,
    });
  }

  async checkout(user, body = {}) {
    const userId = getId(user);
    const cart = await this.getCart(userId);
    if (!cart.items || !cart.items.length)
      throw new BadRequestError("Cart is empty.");

    const eventIds = Array.from(
      new Set(
        cart.items.map(
          (item) =>
            item.event?._id?.toString?.() ||
            item.event?.toString?.() ||
            item.event,
        ),
      ),
    );

    if (eventIds.length !== 1) {
      throw new BadRequestError(
        "Cart must contain items from a single event. Please checkout one event at a time.",
      );
    }

    const bookingData = {
      eventId: eventIds[0],
      items: cart.items.map((item) => ({
        ticketTypeId: item.ticketType?._id || item.ticketType,
        ticketTypeName: item.ticketTypeName || item.ticketType?.name,
        quantity: item.quantity,
      })),
      contactName: body.contact
        ? `${body.contact.firstName || ""} ${body.contact.lastName || ""}`.trim()
        : undefined,
      contactEmail: body.contact?.email,
      contactPhone: body.contact?.phone,
      promoCode: cart.promoCode,
      cartId: cart._id,
      currency: body.currency || cart.currency || "USD",
    };

    const booking = await bookingService.createBooking(bookingData, user);
    await cartRepository.deleteByUserId(userId);

    return {
      bookingRef: booking.bookingRef,
      bookingId: booking._id,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      paymentStatus: booking.paymentStatus,
    };
  }
}
module.exports = new CartService();
