import { Router } from "express";

import { hostApplicationController, getMyHostApplicationController } from "../../infrastructure/di/container.js";

import { authenticateMiddleware } from "../../infrastructure/di/container.js";

import { validateRequest } from "../middleware/validate-request.middleware.js";

import { submitHostApplicationSchema } from "../validators/host-application.validator.js";

import { uploadHostDocument } from "../middleware/upload-host-document.middleware.js";

import {
  hostApplicationDocumentController,
} from "../../infrastructure/di/container.js";

const router = Router();

router.get(
  "/me",
  authenticateMiddleware.handle,
  getMyHostApplicationController.getMine,
);

router.put(
  "/me",
  authenticateMiddleware.handle,
  validateRequest(submitHostApplicationSchema),
  hostApplicationController.updateAndResubmit,
);

router.post(
  "/",
  authenticateMiddleware.handle,
  validateRequest(submitHostApplicationSchema),
  hostApplicationController.submit,
);

// Upload host application document
router.post(
  "/documents",
  authenticateMiddleware.handle,
  uploadHostDocument,
  hostApplicationDocumentController.upload,
);

// Download host application document
router.get(
  "/documents/:reference",
  authenticateMiddleware.handle,
  hostApplicationDocumentController.download,
);

export default router;