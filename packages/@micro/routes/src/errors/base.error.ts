export abstract class BaseError extends Error {
  constructor(public override message: string) {
    super(message);
  }
}