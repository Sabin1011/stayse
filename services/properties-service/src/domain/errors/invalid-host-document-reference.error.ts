
export class InvalidHostDocumentReferenceError extends Error {
  constructor() {
    super(
      "One or more document references are invalid or do not belong to the applicant",
    );

    this.name = "InvalidHostDocumentReferenceError";
  }
}
