import {
  createTransport,
  type Transporter,
} from "nodemailer";

import type { EmailSender } from "../../application/interfaces/email/email-sender.interface.js";

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getMailPort(): number {
  const port = Number(requiredEnv("MAIL_PORT"));

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("MAIL_PORT must be a valid port number");
  }

  return port;
}

export class NodemailerEmailSender implements EmailSender {
  private readonly transporter: Transporter;
  private readonly mailFrom: string;

  constructor() {
    const host = requiredEnv("MAIL_HOST");
    const port = getMailPort();
    const user = requiredEnv("MAIL_USER");
    const password = requiredEnv("MAIL_PASSWORD");

    this.mailFrom = requiredEnv("MAIL_FROM");

    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass: password,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 20000,
    });
  }

  async sendEmail(
    to: string,
    subject: string,
    body: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: this.mailFrom,
      to,
      subject,
      text: body,
    });
  }

  async verifyConnection(): Promise<void> {
    await this.transporter.verify();
  }
}