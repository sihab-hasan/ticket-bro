import { ENDPOINTS } from "@/config/api.config";
import { download, get, post, pickEntity, pickPaginated } from "@/api/client";

const pickTickets = (payload) => {
  const result = pickPaginated("tickets")(payload);
  return {
    tickets: result.items,
    pagination: result.pagination,
    total: result.total,
  };
};

const ticketsService = {
  getMyTickets: (params) => get(ENDPOINTS.TICKETS.LIST, { params, select: pickTickets }),
  getByCode: (code) => get(ENDPOINTS.TICKETS.DETAIL(code), { select: pickEntity("ticket") }),
  download: (code) => download(ENDPOINTS.TICKETS.DOWNLOAD(code)),
  validate: (code) => post(ENDPOINTS.TICKETS.VALIDATE(code), {}),
  transfer: (code, data) => post(ENDPOINTS.TICKETS.TRANSFER(code), data),
  cancel: (code) => post(ENDPOINTS.TICKETS.CANCEL(code), {}),
};

export default ticketsService;
