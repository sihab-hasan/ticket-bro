import { ENDPOINTS } from "@/config/api.config";
import { post } from "@/api/client";

const supportService = {
  sendContactMessage: (data) => post(ENDPOINTS.SUPPORT.CONTACT, data),
};

export default supportService;
