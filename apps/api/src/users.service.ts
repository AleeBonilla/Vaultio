import { Inject, Injectable } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { badRequest } from "./errors";
import { PrismaService } from "./prisma.service";
import { publicUser, summarizeResource } from "./serializers";

const userInclude = {
  identities: true,
  user_careers: true,
  user_roles: { include: { roles: true } },
};

const resourceInclude = {
  courses: true,
  resource_types: true,
  professors: true,
  academic_periods: true,
  users: {
    include: {
      identities: true,
      user_careers: true,
      user_roles: { include: { roles: true } },
    },
  },
  ratings: true,
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

  async me(authorizationHeader?: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    return { user: publicUser(user) };
  }

  async updateMe(authorizationHeader: string | undefined, input: any) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const data: Record<string, unknown> = {};

    if (typeof input.firstName === "string") {
      const value = input.firstName.trim();
      if (!value) badRequest("El nombre no puede estar vacio");
      data.first_name = value.slice(0, 80);
    }
    if (typeof input.lastName === "string") {
      data.last_name = input.lastName.trim().slice(0, 80);
    }
    if (typeof input.bio === "string") {
      data.bio = input.bio.trim().slice(0, 280);
    }
    if (typeof input.photoUrl === "string") {
      data.photo_url = input.photoUrl.trim();
    }

    if (Object.keys(data).length > 0) {
      await this.prisma.users.update({ where: { id: user.id }, data });
    }

    if (Array.isArray(input.careerIds) || input.careerId !== undefined) {
      const requested = Array.isArray(input.careerIds)
        ? input.careerIds.map((id: unknown) => Number(id))
        : input.careerId !== undefined && input.careerId !== null
        ? [Number(input.careerId)]
        : [];
      const validIds = requested.filter((id: number) => Number.isFinite(id));

      const careers = validIds.length
        ? await this.prisma.careers.findMany({ where: { id: { in: validIds }, is_active: true } })
        : [];
      const allowedIds = careers.map((career) => career.id);

      await this.prisma.user_careers.updateMany({
        where: { user_id: user.id, is_active: true },
        data: { is_active: false },
      });
      for (const careerId of allowedIds) {
        await this.prisma.user_careers.upsert({
          where: { user_id_career_id: { user_id: user.id, career_id: careerId } },
          update: { is_active: true },
          create: { user_id: user.id, career_id: careerId, is_active: true },
        });
      }
    }

    const refreshed = await this.prisma.users.findUniqueOrThrow({
      where: { id: user.id },
      include: userInclude,
    });
    return { user: publicUser(refreshed) };
  }

  async uploads(authorizationHeader?: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const items = await this.prisma.resources.findMany({
      where: { user_id: user.id, is_active: true },
      include: resourceInclude,
      orderBy: { created_at: "desc" },
    });
    return { items: items.map(summarizeResource) };
  }

  async saved(authorizationHeader?: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const rows = await this.prisma.saved_resources.findMany({
      where: { user_id: user.id, resources: { is_active: true } },
      include: { resources: { include: resourceInclude } },
      orderBy: { created_at: "desc" },
    });
    const items = rows
      .map((row) => row.resources)
      .filter(Boolean)
      .map((resource) => summarizeResource(resource));
    return { items };
  }

  async stats(authorizationHeader?: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);

    const [uploadsCount, savedCount, ratingsGiven, uploads, downloadsAgg] = await Promise.all([
      this.prisma.resources.count({ where: { user_id: user.id, is_active: true } }),
      this.prisma.saved_resources.count({ where: { user_id: user.id } }),
      this.prisma.ratings.count({ where: { user_id: user.id } }),
      this.prisma.resources.findMany({
        where: { user_id: user.id, is_active: true },
        select: { id: true },
      }),
      this.prisma.resources.aggregate({
        where: { user_id: user.id, is_active: true },
        _sum: { downloads_count: true, views_count: true },
      }),
    ]);

    const uploadIds = uploads.map((upload) => upload.id);
    const ratingsReceivedAgg = uploadIds.length
      ? await this.prisma.ratings.aggregate({
          where: { resource_id: { in: uploadIds } },
          _avg: { stars: true },
          _count: { _all: true },
        })
      : { _avg: { stars: null }, _count: { _all: 0 } };

    return {
      uploads: uploadsCount,
      saved: savedCount,
      ratingsGiven,
      avgRatingReceived: ratingsReceivedAgg._avg.stars
        ? Number(Number(ratingsReceivedAgg._avg.stars).toFixed(1))
        : 0,
      ratingsReceived: ratingsReceivedAgg._count._all || 0,
      totalDownloads: Number(downloadsAgg._sum.downloads_count || 0),
      totalViews: Number(downloadsAgg._sum.views_count || 0),
    };
  }

  async publicStats() {
    const [users, resources, courses, careers] = await Promise.all([
      this.prisma.users.count({ where: { is_active: true } }),
      this.prisma.resources.count({ where: { is_active: true } }),
      this.prisma.courses.count({ where: { is_active: true } }),
      this.prisma.careers.count({ where: { is_active: true } }),
    ]);
    return { users, resources, courses, careers };
  }
}
