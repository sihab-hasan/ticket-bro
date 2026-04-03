import { ENDPOINTS } from "@/config/api.config";
import {
  del,
  get,
  post,
  pickEntity,
  pickList,
  pickPaginated,
} from "@/api/client";

const pickPayment = pickEntity("payment");
const pickPayments = (payload) => {
  const result = pickPaginated("payments")(payload);
  return {
    payments: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const paymentsService = {
  createIntent: (data) => post(ENDPOINTS.PAYMENTS.INTENT, data),
  verifyPayment: (data) => post(ENDPOINTS.PAYMENTS.VERIFY, data),
  getMyPayments: (params) =>
    get(ENDPOINTS.PAYMENTS.LIST, { params, select: pickPayments }),
  getById: (id) => get(ENDPOINTS.PAYMENTS.DETAIL(id), { select: pickPayment }),
  requestRefund: (id, data) =>
    post(ENDPOINTS.PAYMENTS.REFUND(id), data || {}, { select: pickPayment }),
  getRefundStatus: (id) => get(ENDPOINTS.PAYMENTS.REFUND(id), { select: pickPayment }),
  getPaymentMethods: () => get(ENDPOINTS.PAYMENTS.METHODS, { select: pickList("methods") }),
  removePaymentMethod: (id) => del(ENDPOINTS.PAYMENTS.METHOD(id)),
  getAdminPayments: (params) =>
    get(ENDPOINTS.PAYMENTS.ADMIN_LIST, { params, select: pickPayments }),
  getAdminPaymentById: (id) =>
    get(ENDPOINTS.PAYMENTS.ADMIN_DETAIL(id), { select: pickPayment }),
  adminRefundPayment: (id, data) =>
    post(ENDPOINTS.PAYMENTS.ADMIN_REFUND(id), data || {}, { select: pickPayment }),
};

export default paymentsService;
