import { ENDPOINTS } from "@/config/api.config";
import {
  del,
  get,
  patch,
  upload,
  pickEntity,
  pickList,
} from "@/api/client";

const pickUser = pickEntity("user");
const pickSessions = pickList("sessions");

const userService = {
  getMe: () => get(ENDPOINTS.USERS.ME, { select: pickUser }),
  updateMe: (data) => patch(ENDPOINTS.USERS.ME, data, { select: pickUser }),
  deleteMe: () => del(ENDPOINTS.USERS.ME),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("avatar", file);
    return upload(ENDPOINTS.USERS.AVATAR, form, { select: pickUser });
  },
  removeAvatar: () => del(ENDPOINTS.USERS.AVATAR, { select: pickUser }),
  getSessions: () => get(ENDPOINTS.USERS.SESSIONS, { select: pickSessions }),
  revokeSession: (id) => del(ENDPOINTS.USERS.SESSION(id)),
  getAllUsers: (params) => get(ENDPOINTS.USERS.LIST, { params }),
  getUserById: (id) => get(ENDPOINTS.USERS.DETAIL(id), { select: pickUser }),
  updateUserById: (id, data) =>
    patch(ENDPOINTS.USERS.DETAIL(id), data, { select: pickUser }),
  deleteUserById: (id) => del(ENDPOINTS.USERS.DETAIL(id)),
  activateUser: (id) => patch(ENDPOINTS.USERS.ACTIVATE(id), {}, { select: pickUser }),
  deactivateUser: (id) =>
    patch(ENDPOINTS.USERS.DEACTIVATE(id), {}, { select: pickUser }),
  changeUserRole: (id, role) =>
    patch(ENDPOINTS.USERS.ROLE(id), { role }, { select: pickUser }),
  getUserStats: () => get(ENDPOINTS.USERS.STATS),
};

export default userService;
