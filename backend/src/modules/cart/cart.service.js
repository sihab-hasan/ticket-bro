"use strict";
const cartRepository = require("./cart.repository");
const bookingService = require("../bookings/booking.service");
const Event = require("../events/event.model");
const ticketRepository = require("../tickets/ticket.repository");
const {
  BadRequestError,
  NotFoundError,
} = require("../../common/errors/AppError");
const getId = (u) => u?._id || u?.id || u?.userId;

class CartService {
  _assertTicketOnSale(ticketType) {
    const now = Date.now();
    const salesStart = ticketType?.salesStart
      ? new Date(ticketType.salesStart).getTime()
      : null;
    const salesEnd = ticketType?.salesEnd
      ? new Date(ticketType.salesEnd).getTime()
      : null;

    if (salesStart && now < salesStart) {
      throw new BadRequestError(`Sales for ${ticketType.name} have not opened yet.`);
    }

    if (salesEnd && now > salesEnd) {
      throw new BadRequestError(`Sales for ${ticketType.name} have ended.`);
    }
  }

  async _validateCartTicket({ eventId, ticketTypeId, quantity }) {
    const parsedQuantity = Number(quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      throw new BadRequestError("Quantity must be at least 1.");
    }

    const [event, ticketType] = await Promise.all([
      Event.findOne({ _id: eventId, deletedAt: null })
        .select("status currency title")
        .lean(),
      ticketRepository.findTypeById(ticketTypeId),
    ]);

    if (!event) {
      throw new NotFoundError("Event not found.");
    }

    if (event.status !== "published") {
      throw new BadRequestError("This event is not available for ticket sales.");
    }

    if (!ticketType || !ticketType.isActive) {
      throw new BadRequestError("Ticket type is not available.");
    }

    if (String(ticketType.event) !== String(eventId)) {
      throw new BadRequestError("Ticket type does not belong to this event.");
    }

    this._assertTicketOnSale(ticketType);

    return {
      event,
      ticketType,
      quantity: parsedQuantity,
    };
  }

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
    const {
      event,
      ticketType,
      quantity: parsedQuantity,
    } = await this._validateCartTicket({
      eventId,
      ticketTypeId,
      quantity,
    });
    const cart = (await cartRepository.findByUserId(userId)) || {
      user: userId,
      items: [],
    };
    const items = cart.items || [];
    const existingEventIds = Array.from(
      new Set(
        items.map((item) => item.event?._id?.toString?.() || item.event?.toString?.() || item.event),
      ),
    ).filter(Boolean);

    if (
      existingEventIds.length
      && existingEventIds.some((id) => String(id) !== String(eventId))
    ) {
      throw new BadRequestError(
        "Your cart can only contain tickets from one event at a time.",
      );
    }

    const idx = items.findIndex(
      (i) =>
        String(i.ticketType?._id?.toString?.() || i.ticketType?.toString?.() || i.ticketType) ===
        String(ticketTypeId),
    );
    const currentQuantity = idx >= 0 ? Number(items[idx].quantity || 0) : 0;
    const nextQuantity = currentQuantity + parsedQuantity;
    const available = Math.max(
      0,
      Number(ticketType.quantity || 0) -
        Number(ticketType.sold || 0) -
        Number(ticketType.reserved || 0),
    );

    if (ticketType.maxPerOrder && nextQuantity > Number(ticketType.maxPerOrder)) {
      throw new BadRequestError(
        `You can only buy up to ${ticketType.maxPerOrder} ${ticketType.name} tickets per order.`,
      );
    }

    if (ticketType.minPerOrder && nextQuantity < Number(ticketType.minPerOrder)) {
      throw new BadRequestError(
        `You must buy at least ${ticketType.minPerOrder} ${ticketType.name} tickets.`,
      );
    }

    if (nextQuantity > available) {
      throw new BadRequestError(
        `Only ${available} ${ticketType.name} tickets are available right now.`,
      );
    }

    if (idx >= 0) {
      items[idx].quantity = nextQuantity;
      items[idx].ticketTypeName = ticketType.name;
      items[idx].unitPrice = Number(ticketType.price || 0);
      items[idx].totalPrice = items[idx].unitPrice * items[idx].quantity;
    } else {
      items.push({
        event: eventId,
        ticketType: ticketTypeId,
        ticketTypeName: ticketType.name || ticketTypeName,
        quantity: parsedQuantity,
        unitPrice: Number(ticketType.price || 0) || unitPrice || 0,
        totalPrice: (Number(ticketType.price || 0) || unitPrice || 0) * parsedQuantity,
      });
    }

    return cartRepository.upsert(userId, { items, currency: event.currency });
  }

  async updateItem(userId, itemId, { quantity }) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError("Cart not found.");
    const item = cart.items.id(itemId);
    if (!item) throw new NotFoundError("Cart item not found.");
    const {
      ticketType,
      quantity: parsedQuantity,
    } = await this._validateCartTicket({
      eventId: item.event?._id || item.event,
      ticketTypeId: item.ticketType?._id || item.ticketType,
      quantity,
    });
    const available = Math.max(
      0,
      Number(ticketType.quantity || 0) -
        Number(ticketType.sold || 0) -
        Number(ticketType.reserved || 0),
    );

    if (ticketType.minPerOrder && parsedQuantity < Number(ticketType.minPerOrder)) {
      throw new BadRequestError(
        `You must buy at least ${ticketType.minPerOrder} ${ticketType.name} tickets.`,
      );
    }

    if (ticketType.maxPerOrder && parsedQuantity > Number(ticketType.maxPerOrder)) {
      throw new BadRequestError(
        `You can only buy up to ${ticketType.maxPerOrder} ${ticketType.name} tickets per order.`,
      );
    }

    if (parsedQuantity > available) {
      throw new BadRequestError(
        `Only ${available} ${ticketType.name} tickets are available right now.`,
      );
    }

    item.quantity = parsedQuantity;
    item.ticketTypeName = ticketType.name;
    item.unitPrice = Number(ticketType.price || 0);
    item.totalPrice = item.unitPrice * parsedQuantity;
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
