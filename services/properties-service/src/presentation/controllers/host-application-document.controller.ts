
import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../types/authenticated-request.js";

import type { UploadHostApplicationDocumentUseCase } from "../../application/use-cases/upload-host-application-document.use-case.js";

import type { GetHostApplicationDocumentUseCase } from "../../application/use-cases/get-host-application-document.use-case.js";

export class HostApplicationDocumentController {
  constructor(
    private readonly uploadUseCase: UploadHostApplicationDocumentUseCase,
    private readonly getUseCase: GetHostApplicationDocumentUseCase,
  ) {}

  upload = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const authenticatedRequest =
        req as AuthenticatedRequest;

      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: "A document file is required",
        });

        return;
      }

      const document = await this.uploadUseCase.execute({
        ownerUserId: authenticatedRequest.auth.userId,
        documentType: req.body.documentType,
        mimeType: file.mimetype,
        buffer: file.buffer,
      });

      res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        data: {
          documentType: document.documentType,
          protectedStorageRef: document.reference,
          uploadedAt: document.uploadedAt,
        },
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Document upload failed",
      });
    }
  };

  download = async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const authenticatedRequest =
        req as AuthenticatedRequest;

      const reference = String(req.params.reference);

      const result = await this.getUseCase.execute(
        reference,
        authenticatedRequest.auth.userId,
      );

      if (!result) {
        res.status(404).json({
          success: false,
          message: "Document not found",
        });

        return;
      }

      const extension =
        result.metadata.mimeType === "application/pdf"
          ? "pdf"
          : result.metadata.mimeType === "image/jpeg"
            ? "jpg"
            : "png";

      res.setHeader(
        "Content-Type",
        result.metadata.mimeType,
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="host-document.${extension}"`,
      );

      res.setHeader("X-Content-Type-Options", "nosniff");

      res.send(result.buffer);
    } catch {
      res.status(500).json({
        success: false,
        message: "Unable to retrieve document",
      });
    }
  };
}
