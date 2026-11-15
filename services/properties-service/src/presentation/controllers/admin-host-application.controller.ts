import type { Request, Response, NextFunction } from "express";

import type { AuthenticatedRequest } from "../types/authenticated-request.js";

import { GetHostApplicationsUseCase } from "../../application/use-cases/admin/get-host-applications.use-case.js";

import { HostApplicationStatus } from "../../domain/enums/host-application.enum.js";

const validStatuses = Object.values(HostApplicationStatus);

export class AdminHostApplicationController {
  constructor(
    private readonly getHostApplicationsUseCase: GetHostApplicationsUseCase,
  ) {}

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const pageValue = req.query.page ?? "1";
      const limitValue = req.query.limit ?? "10";
      const statusValue = req.query.status;

      if (
        typeof pageValue !== "string" ||
        typeof limitValue !== "string" ||
        (statusValue !== undefined && typeof statusValue !== "string")
      ) {
        res.status(400).json({
          message: "Invalid query parameters",
        });
        return;
      }

      const page = Number(pageValue);
      const limit = Number(limitValue);

      if (
        !Number.isInteger(page) ||
        !Number.isInteger(limit) ||
        page < 1 ||
        limit < 1 ||
        limit > 100
      ) {
        res.status(400).json({
          message: "Page must be a positive integer and limit must be between 1 and 100",
        });
        return;
      }

      let status: HostApplicationStatus | undefined;

      if (statusValue !== undefined) {
        if (!validStatuses.includes(statusValue as HostApplicationStatus)) {
          res.status(400).json({
            message: "Invalid application status",
            allowedStatuses: validStatuses,
          });
          return;
        }

        status = statusValue as HostApplicationStatus;
      }

      const result = await this.getHostApplicationsUseCase.execute({
        page,
        limit,
        ...(status !== undefined && { status }),
      });

      res.status(200).json({
        message: "Host applications retrieved successfully",
        data: result.applications,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  };
}