import type { Request, Response } from "express";
import type { AuthenticatedRequest } from "../types/authenticated-request.js";
import type { GetMyHostApplicationUseCase } from "../../application/use-cases/get-my-host-application.use-case.js";

export class GetMyHostApplicationController {
  constructor(
    private readonly getMyHostApplicationUseCase: GetMyHostApplicationUseCase,
  ) {}

  getMine = async (req: Request, res: Response): Promise<void> => {
    const authenticatedRequest = req as AuthenticatedRequest;

    const application =
      await this.getMyHostApplicationUseCase.execute(
        authenticatedRequest.auth.userId,
      );

    if (!application) {
      res.status(404).json({
        success: false,
        message: "No host application found",
      });
      return;
    }

    const { protectedStorageRef: _privateRef } = {} as {
      protectedStorageRef?: string;
    };

    res.status(200).json({
      success: true,
      data: {
        id: application.props.id,
        verificationType: application.props.verificationType,
        applicantDetails: application.props.applicantDetails,
        businessDetails: application.props.businessDetails,
        documentReferences: application.props.documentReferences.map(
          ({ documentType, uploadedAt }) => ({
            documentType,
            uploadedAt,
          }),
        ),
        status: application.props.status,
        review: application.props.review,
        submittedAt: application.props.submittedAt,
        createdAt: application.props.createdAt,
        updatedAt: application.props.updatedAt,
      },
    });
  };
}