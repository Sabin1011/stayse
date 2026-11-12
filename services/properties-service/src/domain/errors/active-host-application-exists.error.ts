export class ActiveHostApplicationExistsError extends Error {
  constructor() {
    super("You already have an active host application");
    this.name = "ActiveHostApplicationExistsError";
  }
}