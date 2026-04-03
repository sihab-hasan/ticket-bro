"use strict";

// backend/src/modules/users/user.routes.js
//
// NOTE: `authenticate` is already applied in routes.js before this router mounts.
// We only apply `authorize` here for admin-only routes.

const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const userController = require("./user.controller");
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

const router = express.Router();

// ── Multer config (single source of truth — do NOT use a separate upload.js) ──
// If you already have a shared upload middleware, import it here instead and
// remove this block. Having TWO multer instances causes file-path mismatches.

const AVATAR_DIR = path.join(process.cwd(), "public", "uploads", "avatars");

// Ensure directory exists at startup
fs.mkdirSync(AVATAR_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const userId = req.user?.id || req.user?._id || "unknown";
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB — must match avatar.service.js
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."), false);
    }
  },
});

// ── Multer error handler (catches file size / type errors) ─────────────────────
const handleUpload = (req, res, next) => {
  upload.single("avatar")(req, res, (err) => {
    if (!err) return next();

    // Multer-specific errors
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(400)
          .json({
            status: "fail",
            message: "File too large. Maximum size is 5MB.",
          });
      }
      return res.status(400).json({ status: "fail", message: err.message });
    }

    // fileFilter rejection
    if (err) {
      return res.status(400).json({ status: "fail", message: err.message });
    }

    next();
  });
};

// ── Load authorize and ROLES ──────────────────────────────────────────────────
const { authorize } = require("../../common/middleware/auth.middleware");
const { ROLES } = require("../../common/constants/roles");

// ══════════════════════════════════════════════════════════════════════════════
// CURRENT USER  —  /api/v1/users/me
// ══════════════════════════════════════════════════════════════════════════════

router.get("/me", userController.getMe);
router.patch("/me", validateRequest(updateProfileSchema), userController.updateMe);
router.delete("/me", userController.deleteMe);

// ✅ FIX: Use handleUpload wrapper so multer errors are caught properly
router.post("/me/avatar", handleUpload, userController.uploadAvatar);
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
// FIX: was hardcoded "admin" string — now uses the ROLES constant
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get("/stats", userController.getUserStats); // must be before /:userId
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
