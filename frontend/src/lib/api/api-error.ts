export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: unknown,
  ) {
    super(
      typeof detail === "string"
        ? detail
        : `API request failed with status ${status}`,
    );

    this.name = "ApiError";
  }
}
