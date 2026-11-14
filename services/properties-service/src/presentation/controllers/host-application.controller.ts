
import type { Request, Response } from "express";

import type {
  SubmitHostApplicationRequest,
} from "../validators/host-application.validator.js";

import type {
  AuthenticatedRequest,
} from "../types/authenticated-request.js";

import type {
  SubmitHostApplicationUseCase,
} from "../../application/use-cases/submit-host-application.use-case.js";

import type {
  UpdateAndResubmitHostApplicationUseCase,
} from "../../application/use-cases/update-and-resubmit-host-application.use-case.js";

import {
  ActiveHostApplicationExistsError,
} from "../../domain/errors/active-host-application-exists.error.js";

import {
  InvalidHostDocumentReferenceError,
} from "../../domain/errors/invalid-host-document-reference.error.js";

import {
  HostApplicationError,
} from "../../domain/errors/host-application.error.js";

export class HostApplicationController {
  constructor(
    private readonly submitHostApplicationUseCase: SubmitHostApplicationUseCase,
    private readonly updateAndResubmitUseCase: UpdateAndResubmitHostApplicationUseCase,
  ) {}

  private buildDTO(
    requestBody: SubmitHostApplicationRequest,
    hostId: string,
  ) {
    return {
      verificationType: requestBody.verificationType,
      applicantDetails: requestBody.applicantDetails,
      documentReferences: requestBody.documentReferences,
      ...(requestBody.businessDetails
        ? { businessDetails: requestBody.businessDetails }
        : {}),
      hostId,
    };
  }

  submit = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const authenticatedRequest = req as AuthenticatedRequest;
      const requestBody =
        req.body as SubmitHostApplicationRequest;

      const result =
        await this.submitHostApplicationUseCase.execute(
          this.buildDTO(
            requestBody,
            authenticatedRequest.auth.userId,
          ),
        );

      res.status(201).json({
        success: true,
        message: "Host application submitted successfully",
        data: {
          applicationId: result.props.id,
          status: result.props.status,
          verificationType: result.props.verificationType,
          submittedAt: result.props.submittedAt,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  updateAndResubmit = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const authenticatedRequest = req as AuthenticatedRequest;
      const requestBody =
        req.body as SubmitHostApplicationRequest;

      const result =
        await this.updateAndResubmitUseCase.execute(
          this.buildDTO(
            requestBody,
            authenticatedRequest.auth.userId,
          ),
        );

      res.status(200).json({
        success: true,
        message: "Host application updated and resubmitted successfully",
        data: {
          applicationId: result.props.id,
          status: result.props.status,
          verificationType: result.props.verificationType,
          submittedAt: result.props.submittedAt,
        },
      });
    } catch (error) {
      this.handleError(error, res);
    }
  };

  private handleError(error: unknown, res: Response): void {
    if (
      error instanceof ActiveHostApplicationExistsError ||
      error instanceof HostApplicationError
    ) {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    if (error instanceof InvalidHostDocumentReferenceError) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Host application request failed:", error);

    res.status(500).json({
      success: false,
      message: "Unable to process host application request.",
    });
  }
}
