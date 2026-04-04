'use strict';
const cartRepository = require('./cart.repository');
const { BadRequestError, NotFoundError } = require('../../common/errors/AppError');
const TicketType = require('../tickets/ticketType.model');
const promotionService = require('../promotions/promotion.service');
const bookingService = require('../bookings/booking.service');
const getId = (u) => u?._id || u?.id || u?.userId;

class CartService {
  async getCart(userId) {
    const cart = await cartRepository.findByUserId(userId);
    return cart || { user: userId, items: [], subtotal: 0, total: 0, itemCount: 0 };
  }

  async addItem(userId, { eventId, ticketTypeId, ticketTypeName, quantity, unitPrice }) {
    const ticketType = await TicketType.findOne({
      _id: ticketTypeId,
      event: eventId,
      deletedAt: null,
      isActive: true,
    }).lean();

    if (!ticketType) {
      throw new NotFoundError('Ticket type not found.');
    }

    const cart = await cartRepository.findByUserId(userId) || { user: userId, items: [] };
    const items = cart.items || [];

    if (items.length && String(items[0].event?._id || items[0].event) !== String(eventId)) {
      throw new BadRequestError('Your cart can only contain tickets from one event at a time.');
    }

    const idx = items.findIndex(i => i.ticketType?.toString() === ticketTypeId?.toString());
    if (idx >= 0) {
      const nextQuantity = items[idx].quantity + quantity;
      if (nextQuantity > Number(ticketType.maxPerOrder || 10)) {
        throw new BadRequestError(`Maximum ${ticketType.maxPerOrder || 10} tickets allowed for ${ticketType.name}.`);
      }
      items[idx].quantity = nextQuantity;
      items[idx].unitPrice = Number(ticketType.price || 0);
      items[idx].ticketTypeName = ticketType.name;
      items[idx].totalPrice = items[idx].unitPrice * items[idx].quantity;
    } else {
      if (quantity > Number(ticketType.maxPerOrder || 10)) {
        throw new BadRequestError(`Maximum ${ticketType.maxPerOrder || 10} tickets allowed for ${ticketType.name}.`);
      }

      items.push({
        event: eventId,
        ticketType: ticketTypeId,
        ticketTypeName: ticketType.name,
        quantity,
        unitPrice: Number(ticketType.price || 0),
        totalPrice: Number(ticketType.price || 0) * quantity,
      });
    }
    return cartRepository.upsert(userId, { items });
  }

  async updateItem(userId, itemId, { quantity }) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError('Cart not found.');
    const item = cart.items.id(itemId);
    if (!item) throw new NotFoundError('Cart item not found.');
    if (quantity < 1) throw new BadRequestError('Quantity must be at least 1.');

    const ticketType = await TicketType.findOne({
      _id: item.ticketType,
      deletedAt: null,
      isActive: true,
    }).lean();

    if (!ticketType) {
      throw new NotFoundError('Ticket type not found.');
    }

    if (quantity > Number(ticketType.maxPerOrder || 10)) {
      throw new BadRequestError(`Maximum ${ticketType.maxPerOrder || 10} tickets allowed for ${ticketType.name}.`);
    }

    item.quantity   = quantity;
    item.unitPrice = Number(ticketType.price || item.unitPrice || 0);
    item.ticketTypeName = ticketType.name;
    item.totalPrice = item.unitPrice * quantity;
    await cart.save();
    return cart;
  }

  async removeItem(userId, itemId) {
    const cart = await cartRepository.findByUserId(userId);
    if (!cart) throw new NotFoundError('Cart not found.');
    cart.items = cart.items.filter(i => i._id.toString() !== itemId);
    await cart.save();
    return cart;
  }

  async clearCart(userId) {
    await cartRepository.deleteByUserId(userId);
    return { message: 'Cart cleared.' };
  }

  async applyPromo(userId, code) {
    const cart = await this.getCart(userId);
    if (!cart.items?.length) {
      throw new BadRequestError('Cart is empty.');
    }

    const subtotal = cart.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const eventId = cart.items[0]?.event?._id || cart.items[0]?.event;
    const promo = await promotionService.validateCode(code, { subtotal, eventId });

    return cartRepository.upsert(userId, {
      promoCode: promo.code,
      promoId: promo.promoId,
      discountAmount: promo.discount,
    });
  }

  async removePromo(userId) {
    return cartRepository.upsert(userId, { promoCode: null, promoId: null, discountAmount: 0 });
  }

  async checkout(userId, payload) {
    const cart = await this.getCart(userId);
    if (!cart.items || !cart.items.length) throw new BadRequestError('Cart is empty.');
    return bookingService.createBookingFromCart({
      user: { _id: userId },
      cart,
      ...payload,
    });
  }
}
module.exports = new CartService();
