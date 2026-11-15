
import type { Request, Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../types/authenticated-request.js";

import {
  ReviewHostApplicationUseCase,
  type HostApplicationReviewAction,
} from "../../application/use-cases/admin/review-host-application.use-case.js";

export class AdminHostApplicationReviewController {
  constructor(
    private readonly reviewHostApplicationUseCase: ReviewHostApplicationUseCase,
  ) {}

  startReview = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return this.handleReview(req, res, next, "START_REVIEW");
  };

  approve = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return this.handleReview(req, res, next, "APPROVE");
  };

  reject = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return this.handleReview(req, res, next, "REJECT");
  };

  requestChanges = (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return this.handleReview(req, res, next, "REQUEST_CHANGES");
  };

  private handleReview = async (
    req: Request,
    res: Response,
    next: NextFunction,
    action: HostApplicationReviewAction,
  ): Promise<void> => {
    try {
      const applicationId = req.params.id;

      if (
        typeof applicationId !== "string" ||
        !applicationId.trim()
      ) {
        res.status(400).json({
          message: "Invalid host application ID",
        });
        return;
      }

      const authenticatedRequest = req as AuthenticatedRequest;
      const adminUserId = authenticatedRequest.auth?.userId;

      if (!adminUserId) {
        res.status(401).json({
          message: "Authentication is required",
        });
        return;
      }

      const note =
        typeof req.body?.note === "string"
          ? req.body.note.trim()
          : undefined;

      if (
        (action === "REJECT" || action === "REQUEST_CHANGES") &&
        !note
      ) {
        res.status(400).json({
          message: "A review note is required for this action",
        });
        return;
      }

      const result = await this.reviewHostApplicationUseCase.execute({
        applicationId,
        adminUserId,
        action,
        note,
      });

      if (!result) {
        res.status(404).json({
          message: "Host application not found",
        });
        return;
      }

      res.status(200).json({
        message: "Host application review updated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
