import { Router } from "express";

import { hostApplicationController, getMyHostApplicationController } from "../../infrastructure/di/container.js";

import { authenticateMiddleware } from "../../infrastructure/di/container.js";

import { validateRequest } from "../middleware/validate-request.middleware.js";

import { submitHostApplicationSchema } from "../validators/host-application.validator.js";

const router = Router();

router.get(
  "/me",
  authenticateMiddleware.handle,
  getMyHostApplicationController.getMine,
);

router.post(
  "/",
  authenticateMiddleware.handle,
  validateRequest(submitHostApplicationSchema),
  hostApplicationController.submit,
);

export default router;