
import type {Request, Response } from "express";

import type {
  SubmitHostApplicationRequest,
} from "../validators/host-application.validator.js";

import type {
  AuthenticatedRequest,
} from "../types/authenticated-request.js";

import type {
  SubmitHostApplicationUseCase,
} from "../../application/use-cases/submit-host-application.use-case.js";


export class HostApplicationController {
  constructor(
    private readonly submitHostApplicationUseCase: SubmitHostApplicationUseCase,
  ) {}

  submit = async (
    req: Request,
    res: Response,
  ): Promise<void> => {

    const authenticatedRequest = req as AuthenticatedRequest;

    const requestBody =
      req.body as SubmitHostApplicationRequest;

    const result =
        await this.submitHostApplicationUseCase.execute({
            verificationType: requestBody.verificationType,
            applicantDetails: requestBody.applicantDetails,
            documentReferences: requestBody.documentReferences,
            ...(requestBody.businessDetails
            ? { businessDetails: requestBody.businessDetails }
            : {}),
            hostId: authenticatedRequest.auth.userId,
        });

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
  };
}
