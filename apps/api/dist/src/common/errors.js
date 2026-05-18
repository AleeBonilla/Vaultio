"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badRequest = badRequest;
exports.notFound = notFound;
exports.unauthorized = unauthorized;
const common_1 = require("@nestjs/common");
function badRequest(message, details) {
    throw new common_1.BadRequestException({ message, details });
}
function notFound(message = "Recurso no encontrado") {
    throw new common_1.NotFoundException({ message });
}
function unauthorized(message = "No autenticado") {
    throw new common_1.UnauthorizedException({ message });
}
