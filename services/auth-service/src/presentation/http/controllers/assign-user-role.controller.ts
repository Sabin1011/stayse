import type { Request, Response, NextFunction } from "express";
import { AssignUserRole } from "../../../application/use-cases/assign-user-role.use-case.js";

export class AssignUserRoleController {
  constructor(
    private readonly assignUserRole: AssignUserRole,
  ) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { userId } = req.body;

      if (typeof userId !== "string" || !userId.trim()) {
        res.status(400).json({
          message: "Valid userId is required",
        });
        return;
      }

      await this.assignUserRole.execute({ userId });

      res.status(200).json({
        message: "Host role assigned successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}