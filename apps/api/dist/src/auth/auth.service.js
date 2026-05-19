"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const auth_util_1 = require("./auth.util");
const errors_1 = require("../common/errors");
const firebase_admin_service_1 = require("../firebase/firebase-admin.service");
const config_1 = require("../config");
const serializers_1 = require("../common/serializers");
const userInclude = {
    identities: true,
    user_careers: true,
    user_roles: { include: { roles: true } },
};
let AuthService = class AuthService {
    prisma;
    firebase;
    constructor(prisma, firebase) {
        this.prisma = prisma;
        this.firebase = firebase;
    }
    async register(input) {
        const email = String(input.email || "")
            .trim()
            .toLowerCase();
        const password = String(input.password || "");
        const firstName = String(input.firstName || "").trim();
        const lastName = String(input.lastName || "").trim();
        const careerId = input.careerId ? Number(input.careerId) : null;
        const requestedUsername = String(input.username || "").trim();
        if (!email || !password || !firstName || !lastName) {
            (0, errors_1.badRequest)("Nombre, apellido, correo y contrasena son requeridos");
        }
        if (config_1.config.auth.allowedEmailDomain && !email.endsWith(`@${config_1.config.auth.allowedEmailDomain}`)) {
            (0, errors_1.badRequest)(`El correo debe pertenecer al dominio ${config_1.config.auth.allowedEmailDomain}`);
        }
        const existing = await this.prisma.identities.findFirst({ where: { email } });
        if (existing)
            (0, errors_1.badRequest)("Ya existe un usuario con ese correo");
        const username = requestedUsername
            ? await this.ensureAvailableUsername(requestedUsername)
            : await this.uniqueUsername(email
                .split("@")[0]
                .replace(/[^a-z0-9_]/gi, "")
                .slice(0, 24) || "usuario");
        const user = await this.prisma.$transaction(async (tx) => {
            const createdUser = await tx.users.create({
                data: {
                    username,
                    first_name: firstName,
                    last_name: lastName,
                },
            });
            await tx.identities.create({
                data: {
                    provider_name: "demo_password",
                    provider_uid: email,
                    email,
                    user_id: createdUser.id,
                },
            });
            if (careerId) {
                await tx.user_careers.create({
                    data: {
                        user_id: createdUser.id,
                        career_id: careerId,
                    },
                });
            }
            const role = await tx.roles.upsert({
                where: { name: "estudiante" },
                update: { is_active: true },
                create: { name: "estudiante" },
            });
            await tx.user_roles.create({
                data: {
                    role_id: role.id,
                    user_id: createdUser.id,
                },
            });
            return tx.users.findUniqueOrThrow({ where: { id: createdUser.id }, include: userInclude });
        });
        const safeUser = (0, serializers_1.publicUser)(user);
        return { user: safeUser, token: (0, auth_util_1.createToken)({ sub: user.id, email }) };
    }
    async login(input) {
        const email = String(input.email || "")
            .trim()
            .toLowerCase();
        const password = String(input.password || "");
        if (!email || !password)
            (0, errors_1.unauthorized)("Credenciales invalidas");
        if (password !== "demo123")
            (0, errors_1.unauthorized)("Credenciales invalidas");
        const identity = await this.prisma.identities.findFirst({
            where: { email, provider_name: "demo_password", is_active: true },
            include: { users: { include: userInclude } },
        });
        if (!identity?.users?.is_active)
            (0, errors_1.unauthorized)("Credenciales invalidas");
        await this.prisma.identities.update({
            where: {
                provider_name_provider_uid: {
                    provider_name: identity.provider_name,
                    provider_uid: identity.provider_uid,
                },
            },
            data: { last_login: new Date() },
        });
        return {
            user: (0, serializers_1.publicUser)(identity.users),
            token: (0, auth_util_1.createToken)({ sub: identity.user_id, email: identity.email }),
        };
    }
    async me(authorizationHeader) {
        const user = await this.readUserFromAuthorization(authorizationHeader);
        return { user: (0, serializers_1.publicUser)(user) };
    }
    async readUserFromAuthorization(authorizationHeader) {
        const bearerToken = this.readBearerToken(authorizationHeader);
        if (config_1.config.auth.allowDemoTokens) {
            const demoUser = await this.readDemoUser(bearerToken);
            if (demoUser)
                return demoUser;
        }
        const decodedToken = await this.firebase.verifyIdToken(bearerToken);
        const email = String(decodedToken.email || "")
            .trim()
            .toLowerCase();
        if (!email)
            (0, errors_1.unauthorized)("El token de Firebase no contiene correo");
        if (config_1.config.auth.allowedEmailDomain && !email.endsWith(`@${config_1.config.auth.allowedEmailDomain}`)) {
            (0, errors_1.unauthorized)(`El correo debe pertenecer al dominio ${config_1.config.auth.allowedEmailDomain}`);
        }
        return this.syncFirebaseUser({
            firebaseUid: decodedToken.uid,
            email,
            firstName: this.firstNameFromDecodedToken(decodedToken),
            lastName: this.lastNameFromDecodedToken(decodedToken),
            photoUrl: decodedToken.picture,
        });
    }
    async uniqueUsername(base) {
        let candidate = base.slice(0, 30);
        let suffix = 1;
        while (await this.prisma.users.findUnique({ where: { username: candidate } })) {
            const postfix = String(suffix++);
            candidate = `${base.slice(0, 30 - postfix.length)}${postfix}`;
        }
        return candidate;
    }
    async ensureAvailableUsername(value) {
        const username = value.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,30}$/.test(username)) {
            (0, errors_1.badRequest)("El username debe tener 3 a 30 caracteres y solo usar letras, numeros o guion bajo");
        }
        const existing = await this.prisma.users.findUnique({ where: { username } });
        if (existing)
            (0, errors_1.badRequest)("Ese username ya esta en uso");
        return username;
    }
    readBearerToken(authorizationHeader) {
        if (!authorizationHeader)
            (0, errors_1.unauthorized)();
        const [scheme, token] = authorizationHeader.split(" ");
        if (scheme !== "Bearer" || !token)
            (0, errors_1.unauthorized)("Token invalido");
        return token;
    }
    async readDemoUser(token) {
        try {
            const payload = (0, auth_util_1.readToken)(`Bearer ${token}`);
            const user = await this.prisma.users.findUnique({ where: { id: payload.sub }, include: userInclude });
            return user?.is_active ? user : null;
        }
        catch {
            return null;
        }
    }
    async syncFirebaseUser(input) {
        const existingIdentity = await this.prisma.identities.findUnique({
            where: {
                provider_name_provider_uid: {
                    provider_name: "firebase",
                    provider_uid: input.firebaseUid,
                },
            },
            include: { users: { include: userInclude } },
        });
        if (existingIdentity?.users?.is_active) {
            await this.prisma.identities.update({
                where: {
                    provider_name_provider_uid: {
                        provider_name: "firebase",
                        provider_uid: input.firebaseUid,
                    },
                },
                data: { email: input.email, last_login: new Date(), is_active: true },
            });
            return this.prisma.users.findUniqueOrThrow({
                where: { id: existingIdentity.user_id },
                include: userInclude,
            });
        }
        const existingEmailIdentity = await this.prisma.identities.findFirst({
            where: { email: input.email, is_active: true },
            include: { users: { include: userInclude } },
        });
        if (existingEmailIdentity?.users?.is_active) {
            await this.prisma.identities.upsert({
                where: {
                    provider_name_provider_uid: {
                        provider_name: "firebase",
                        provider_uid: input.firebaseUid,
                    },
                },
                update: {
                    email: input.email,
                    user_id: existingEmailIdentity.user_id,
                    last_login: new Date(),
                    is_active: true,
                },
                create: {
                    provider_name: "firebase",
                    provider_uid: input.firebaseUid,
                    email: input.email,
                    user_id: existingEmailIdentity.user_id,
                },
            });
            return this.prisma.users.findUniqueOrThrow({
                where: { id: existingEmailIdentity.user_id },
                include: userInclude,
            });
        }
        const username = await this.uniqueUsername(input.email
            .split("@")[0]
            .replace(/[^a-z0-9_]/gi, "")
            .slice(0, 24) || "usuario");
        return this.prisma.$transaction(async (tx) => {
            const user = await tx.users.create({
                data: {
                    username,
                    first_name: input.firstName,
                    last_name: input.lastName,
                    photo_url: input.photoUrl,
                },
            });
            await tx.identities.create({
                data: {
                    provider_name: "firebase",
                    provider_uid: input.firebaseUid,
                    email: input.email,
                    user_id: user.id,
                },
            });
            const role = await tx.roles.upsert({
                where: { name: "estudiante" },
                update: { is_active: true },
                create: { name: "estudiante" },
            });
            await tx.user_roles.create({
                data: {
                    role_id: role.id,
                    user_id: user.id,
                },
            });
            return tx.users.findUniqueOrThrow({ where: { id: user.id }, include: userInclude });
        });
    }
    firstNameFromDecodedToken(decodedToken) {
        const name = String(decodedToken.name || "").trim();
        if (name)
            return name.split(/\s+/)[0].slice(0, 30);
        return String(decodedToken.email || "Usuario")
            .split("@")[0]
            .slice(0, 30);
    }
    lastNameFromDecodedToken(decodedToken) {
        const parts = String(decodedToken.name || "")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        return (parts.length > 1 ? parts.slice(1).join(" ") : "Firebase").slice(0, 255);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(firebase_admin_service_1.FirebaseAdminService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        firebase_admin_service_1.FirebaseAdminService])
], AuthService);
