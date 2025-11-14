export class ProtectedRouteError extends Error {
  constructor() {
    super(
      "This route is protected. You must provide a valid Authorization header",
    );
  }
}
