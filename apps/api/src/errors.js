export class HttpError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function notFound(message = "Recurso no encontrado") {
  return new HttpError(404, message);
}

export function badRequest(message, details) {
  return new HttpError(400, message, details);
}

export function unauthorized(message = "No autenticado") {
  return new HttpError(401, message);
}
