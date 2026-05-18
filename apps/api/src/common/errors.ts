import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";

export function badRequest(message: string, details?: unknown): never {
  throw new BadRequestException({ message, details });
}

export function notFound(message = "Recurso no encontrado"): never {
  throw new NotFoundException({ message });
}

export function unauthorized(message = "No autenticado"): never {
  throw new UnauthorizedException({ message });
}
