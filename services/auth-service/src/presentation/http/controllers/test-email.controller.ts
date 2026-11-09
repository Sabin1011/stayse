import type { Request, Response, NextFunction } from "express";
import type { EmailSender } from "../../../application/interfaces/email/email-sender.interface.js";

export class TestEmailController {
  constructor(private readonly emailSender: EmailSender) {}

  handle = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { email } = req.body;

      if (typeof email !== "string" || !email.includes("@")) {
        res.status(400).json({
          message: "A valid email address is required",
        });
        return;
      }

      await this.emailSender.sendEmail(
        email,
        "Stayse SMTP Test",
        "Hello! This is a test email from the Stayse Auth Service using Nodemailer and Gmail SMTP.",
      );

      res.status(200).json({
        message: "Test email sent successfully",
      });
    } catch (error) {
      next(error);
    }
  };
}