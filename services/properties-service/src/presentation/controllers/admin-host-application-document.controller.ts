
import type { Request, Response, NextFunction } from "express";

import type { GetAdminHostApplicationDocumentUseCase } from "../../application/use-cases/admin/get-admin-host-application-document.use-case.js";

export class AdminHostApplicationDocumentController {
  constructor(
    private readonly getDocumentUseCase: GetAdminHostApplicationDocumentUseCase,
  ) {}

  download = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const applicationId = String(req.params.id);
      const reference = String(req.params.reference);

      const result = await this.getDocumentUseCase.execute(
        applicationId,
        reference,
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

      res.setHeader("Content-Type", result.metadata.mimeType);

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="host-document.${extension}"`,
      );

      res.setHeader("X-Content-Type-Options", "nosniff");

      res.send(result.buffer);
    } catch (error) {
      next(error);
    }
  };
}
