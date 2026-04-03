import { ENDPOINTS } from "@/config/api.config";
import { pickEntity, post } from "@/api/client";

const payoutsService = {
  request: (data) =>
    post(ENDPOINTS.PAYOUTS.REQUEST, data, { select: pickEntity("payout") }),
};

export default payoutsService;
