"use strict";

// backend/src/modules/users/user.routes.js
// NOTE: `authenticate` is already applied in routes.js before this router mounts.

const express = require("express");
const userController = require("./user.controller");
const uploadMiddleware = require("./upload.middleware");
const { validateRequest } = require("../../common/middleware/validation.middleware");
const {
  updateProfileSchema,
  adminUpdateUserSchema,
  statusReasonSchema,
  changeRoleSchema,
  userListQuerySchema,
  mongoIdParamSchema,
  sessionIdParamSchema,
} = require("./user.validation");
const { authorize } = require("../../common/middleware/auth.middleware");
const { ROLES } = require("../../common/constants/roles");

const router = express.Router();

// ══════════════════════════════════════════════════════════════════════════════
// CURRENT USER  —  /api/v1/users/me
// ══════════════════════════════════════════════════════════════════════════════

router.get("/me", userController.getMe);
router.patch("/me", validateRequest(updateProfileSchema), userController.updateMe);
router.delete("/me", userController.deleteMe);

// Avatar — uses Cloudinary via memoryStorage (no disk writes)
router.post("/me/avatar", uploadMiddleware.avatar, userController.uploadAvatar);
router.delete("/me/avatar", userController.removeAvatar);

router.get("/me/sessions", userController.getMySessions);
router.delete(
  "/me/sessions/:sessionId",
  validateRequest(sessionIdParamSchema, "params"),
  userController.revokeSession,
);

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN  —  /api/v1/users
// ══════════════════════════════════════════════════════════════════════════════
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get("/stats", userController.getUserStats);
router.get("/", validateRequest(userListQuerySchema, "query"), userController.getAllUsers);
router.get("/:userId", validateRequest(mongoIdParamSchema, "params"), userController.getUserById);
router.patch(
  "/:userId",
  validateRequest(mongoIdParamSchema, "params"),
  validateRequest(adminUpdateUserSchema),
  userController.updateUserById,
);
router.delete("/:userId", validateRequest(mongoIdParamSchema, "params"), userController.deleteUserById);

router.patch(
  "/:userId/activate",
  validateRequest(mongoIdParamSchema, "params"),
  validateRequest(statusReasonSchema),
  userController.activateUser,
);
router.patch(
  "/:userId/deactivate",
  validateRequest(mongoIdParamSchema, "params"),
  validateRequest(statusReasonSchema),
  userController.deactivateUser,
);
router.patch(
  "/:userId/role",
  validateRequest(mongoIdParamSchema, "params"),
  validateRequest(changeRoleSchema),
  userController.changeUserRole,
);

module.exports = router;
