import { Router } from "express";

import {
  authenticateMiddleware,
  authorizeAdminMiddleware,
  adminHostApplicationController,
  adminHostApplicationDetailsController,
  adminHostApplicationReviewController,
  adminHostApplicationDocumentController,
} from "../../infrastructure/di/container.js";

const router = Router();

// All routes require authentication and ADMIN role.
router.use(
  authenticateMiddleware.handle,
  authorizeAdminMiddleware.handle,
);

// GET /admin/host-applications
router.get(
  "/",
  adminHostApplicationController.list,  
);

// GET /admin/host-applications/:id
router.get(
  "/:id",
  adminHostApplicationDetailsController.getById,
);

// GET /admin/host-applications/:id/documents/:reference
router.get(
  "/:id/documents/:reference",
  adminHostApplicationDocumentController.download,
);

// PATCH /admin/host-applications/:id/start-review
router.patch(
  "/:id/start-review",
  adminHostApplicationReviewController.startReview,
);

// PATCH /admin/host-applications/:id/approve
router.patch(
  "/:id/approve",
  adminHostApplicationReviewController.approve,
);

// PATCH /admin/host-applications/:id/reject
router.patch(
  "/:id/reject",
  adminHostApplicationReviewController.reject,
);

// PATCH /admin/host-applications/:id/request-changes
router.patch(
  "/:id/request-changes",
  adminHostApplicationReviewController.requestChanges,
);

export default router;