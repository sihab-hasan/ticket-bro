import { ENDPOINTS } from "@/config/api.config";
import {
  download,
  get,
  post,
  put,
  pickEntity,
  pickPaginated,
} from "@/api/client";

const pickBooking = pickEntity("booking");
const pickBookings = (payload) => {
  const result = pickPaginated("bookings")(payload);
  return {
    bookings: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const bookingService = {
  create: (data) => post(ENDPOINTS.BOOKINGS.CREATE, data, { select: pickBooking }),
  getMyBookings: (params) => get(ENDPOINTS.BOOKINGS.LIST, { params, select: pickBookings }),
  getByRef: (ref) => get(ENDPOINTS.BOOKINGS.DETAIL(ref), { select: pickBooking }),
  cancel: (ref, data) => post(ENDPOINTS.BOOKINGS.CANCEL(ref), data || {}, { select: pickBooking }),
  requestRefund: (ref, data) =>
    post(ENDPOINTS.BOOKINGS.REFUND(ref), data || {}, { select: pickBooking }),
  getTickets: (ref) =>
    get(ENDPOINTS.BOOKINGS.TICKETS(ref), {
      select: (payload) => ({ tickets: Array.isArray(payload?.tickets) ? payload.tickets : [] }),
    }),
  getInvoice: (ref) => download(ENDPOINTS.BOOKINGS.INVOICE(ref)),
  getOrganizerBookings: (params) =>
    get(ENDPOINTS.BOOKINGS.ORGANIZER_LIST, { params, select: pickBookings }),
  checkIn: (ref) =>
    post(ENDPOINTS.BOOKINGS.ORGANIZER_CHECKIN(ref), {}, { select: pickBooking }),
  joinWaitlist: (eventId, data) => post(ENDPOINTS.BOOKINGS.WAITLIST(eventId), data),
  getAdminBookings: (params) => get(ENDPOINTS.BOOKINGS.ADMIN_LIST, { params, select: pickBookings }),
  adminCancel: (ref, data) =>
    put(ENDPOINTS.BOOKINGS.ADMIN_CANCEL(ref), data || {}, { select: pickBooking }),
  adminRefund: (ref, data) =>
    put(ENDPOINTS.BOOKINGS.ADMIN_REFUND(ref), data || {}, { select: pickBooking }),
};

export default bookingService;
