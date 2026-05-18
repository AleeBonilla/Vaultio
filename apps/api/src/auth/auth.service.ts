import { Inject, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { createToken, readToken } from "./auth.util";
import { badRequest, unauthorized } from "../common/errors";
import { FirebaseAdminService } from "../firebase/firebase-admin.service";
import { config } from "../config";
import { publicUser } from "../common/serializers";

const userInclude = {
  identities: true,
  user_careers: true,
  user_roles: { include: { roles: true } },
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(FirebaseAdminService) private readonly firebase: FirebaseAdminService,
  ) {}

  async register(input: any) {
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    const firstName = String(input.firstName || "").trim();
    const lastName = String(input.lastName || "").trim();
    const careerId = input.careerId ? Number(input.careerId) : null;
    const requestedUsername = String(input.username || "").trim();

    if (!email || !password || !firstName || !lastName) {
      badRequest("Nombre, apellido, correo y contrasena son requeridos");
    }
    if (config.auth.allowedEmailDomain && !email.endsWith(`@${config.auth.allowedEmailDomain}`)) {
      badRequest(`El correo debe pertenecer al dominio ${config.auth.allowedEmailDomain}`);
    }

    const existing = await this.prisma.identities.findFirst({ where: { email } });
    if (existing) badRequest("Ya existe un usuario con ese correo");

    const username = requestedUsername
      ? await this.ensureAvailableUsername(requestedUsername)
      : await this.uniqueUsername(email.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 24) || "usuario");

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

    const safeUser = publicUser(user);
    return { user: safeUser, token: createToken({ sub: user.id, email }) };
  }

  async login(input: any) {
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    if (!email || !password) unauthorized("Credenciales invalidas");
    if (password !== "demo123") unauthorized("Credenciales invalidas");

    const identity = await this.prisma.identities.findFirst({
      where: { email, provider_name: "demo_password", is_active: true },
      include: { users: { include: userInclude } },
    });

    if (!identity?.users?.is_active) unauthorized("Credenciales invalidas");

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
      user: publicUser(identity.users),
      token: createToken({ sub: identity.user_id, email: identity.email }),
    };
  }

  async me(authorizationHeader?: string) {
    const user = await this.readUserFromAuthorization(authorizationHeader);
    return { user: publicUser(user) };
  }

  async readUserFromAuthorization(authorizationHeader?: string) {
    const bearerToken = this.readBearerToken(authorizationHeader);

    if (config.auth.allowDemoTokens) {
      const demoUser = await this.readDemoUser(bearerToken);
      if (demoUser) return demoUser;
    }

    const decodedToken = await this.firebase.verifyIdToken(bearerToken);
    const email = String(decodedToken.email || "").trim().toLowerCase();
    if (!email) unauthorized("El token de Firebase no contiene correo");
    if (config.auth.allowedEmailDomain && !email.endsWith(`@${config.auth.allowedEmailDomain}`)) {
      unauthorized(`El correo debe pertenecer al dominio ${config.auth.allowedEmailDomain}`);
    }

    return this.syncFirebaseUser({
      firebaseUid: decodedToken.uid,
      email,
      firstName: this.firstNameFromDecodedToken(decodedToken as { name?: string; email?: string }),
      lastName: this.lastNameFromDecodedToken(decodedToken as { name?: string }),
      photoUrl: decodedToken.picture,
    });
  }

  private async uniqueUsername(base: string) {
    let candidate = base.slice(0, 30);
    let suffix = 1;
    while (await this.prisma.users.findUnique({ where: { username: candidate } })) {
      const postfix = String(suffix++);
      candidate = `${base.slice(0, 30 - postfix.length)}${postfix}`;
    }
    return candidate;
  }

  private async ensureAvailableUsername(value: string) {
    const username = value.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      badRequest("El username debe tener 3 a 30 caracteres y solo usar letras, numeros o guion bajo");
    }
    const existing = await this.prisma.users.findUnique({ where: { username } });
    if (existing) badRequest("Ese username ya esta en uso");
    return username;
  }

  private readBearerToken(authorizationHeader?: string) {
    if (!authorizationHeader) unauthorized();
    const [scheme, token] = authorizationHeader.split(" ");
    if (scheme !== "Bearer" || !token) unauthorized("Token invalido");
    return token;
  }

  private async readDemoUser(token: string) {
    try {
      const payload = readToken(`Bearer ${token}`);
      const user = await this.prisma.users.findUnique({ where: { id: payload.sub }, include: userInclude });
      return user?.is_active ? user : null;
    } catch {
      return null;
    }
  }

  private async syncFirebaseUser(input: {
    firebaseUid: string;
    email: string;
    firstName: string;
    lastName: string;
    photoUrl?: string;
  }) {
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
      return this.prisma.users.findUniqueOrThrow({ where: { id: existingIdentity.user_id }, include: userInclude });
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
        update: { email: input.email, user_id: existingEmailIdentity.user_id, last_login: new Date(), is_active: true },
        create: {
          provider_name: "firebase",
          provider_uid: input.firebaseUid,
          email: input.email,
          user_id: existingEmailIdentity.user_id,
        },
      });
      return this.prisma.users.findUniqueOrThrow({ where: { id: existingEmailIdentity.user_id }, include: userInclude });
    }

    const username = await this.uniqueUsername(
      input.email.split("@")[0].replace(/[^a-z0-9_]/gi, "").slice(0, 24) || "usuario",
    );

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

  private firstNameFromDecodedToken(decodedToken: { name?: string; email?: string }) {
    const name = String(decodedToken.name || "").trim();
    if (name) return name.split(/\s+/)[0].slice(0, 30);
    return String(decodedToken.email || "Usuario").split("@")[0].slice(0, 30);
  }

  private lastNameFromDecodedToken(decodedToken: { name?: string }) {
    const parts = String(decodedToken.name || "").trim().split(/\s+/).filter(Boolean);
    return (parts.length > 1 ? parts.slice(1).join(" ") : "Firebase").slice(0, 255);
  }
}
