"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createToken = createToken;
exports.readToken = readToken;
const errors_1 = require("../common/errors");
function createToken(payload) {
    return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}
function readToken(authorizationHeader) {
    if (!authorizationHeader)
        (0, errors_1.unauthorized)();
    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token)
        (0, errors_1.unauthorized)("Token invalido");
    try {
        const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
        if (!payload.sub || !payload.email)
            (0, errors_1.unauthorized)("Token invalido");
        return payload;
    }
    catch {
        (0, errors_1.unauthorized)("Token invalido");
    }
}
