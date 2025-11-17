export class DomainError extends Error {
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
  }

  code: string;
}
