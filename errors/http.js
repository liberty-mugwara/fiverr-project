export class HttpError extends Error {
  constructor({ message, statusCode } = {}) {
    super(message);
    this.statusCode = statusCode;
  }
}

export function throw200(message = "Ok") {
  throw new HttpError({
    statusCode: 200,
    message,
  });
}

export function throw201(message = "Created!") {
  throw new HttpError({
    statusCode: 201,
    message,
  });
}

export function throw400(message = "Bad Request!") {
  throw new HttpError({
    statusCode: 400,
    message,
  });
}

export function throw401(message = "Not Authorized! Please Login.") {
  throw new HttpError({
    statusCode: 401,
    message,
  });
}
export function throw403(
  message = "Forbidden! You are not authorized to access this resource."
) {
  throw new HttpError({
    statusCode: 403,
    message,
  });
}
