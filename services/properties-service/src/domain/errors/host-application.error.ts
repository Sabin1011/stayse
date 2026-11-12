export class HostApplicationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HostApplicationError";
  }
}