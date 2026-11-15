import type { Request, Response, NextFunction } from "express";
import { GetHostApplicationByIdUseCase } from "../../application/use-cases/admin/get-host-application-by-id.use-case.js";

export class AdminHostApplicationDetailsController {
  constructor(
    private readonly getHostApplicationByIdUseCase: GetHostApplicationByIdUseCase,
  ) {}

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const applicationId = req.params.id;

      if (typeof applicationId !== "string" || !applicationId.trim()) {
        res.status(400).json({
            message: "Invalid host application ID",
        });
        return;
      }
      const application =
        await this.getHostApplicationByIdUseCase.execute(applicationId);

      if (!application) {
        res.status(404).json({
          message: "Host application not found",
        });
        return;
      }

      res.status(200).json({
        message: "Host application retrieved successfully",
        data: application,
      });
    } catch (error) {
      next(error);
    }
  };
}