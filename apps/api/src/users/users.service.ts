import { Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { badRequest } from "../common/errors";
import { PrismaService } from "../prisma/prisma.service";
import { publicUser, serializeCourse, serializeReport, summarizeResource } from "../common/serializers";

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
    if (typeof input.username === "string") {
      const username = this.normalizeUsername(input.username);
      const existing = await this.prisma.users.findFirst({
        where: { username, id: { not: user.id } },
        select: { id: true },
      });
      if (existing) badRequest("Ese username ya esta en uso");
      data.username = username;
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

  async courses(authorizationHeader?: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const courseIds = await this.activeCourseIds(user.id);
    if (courseIds.length === 0) return { items: [] };

    const items = await this.prisma.courses.findMany({
      where: { id: { in: courseIds }, is_active: true },
      include: {
        course_careers: true,
        _count: { select: { resources: true } },
      },
      orderBy: { code: "asc" },
    });
    return { items: items.map(serializeCourse) };
  }

  async updateCourses(authorizationHeader: string | undefined, input: any) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    await this.ensureUserCoursesTable();

    const requested = Array.isArray(input.courseIds) ? input.courseIds.map((id: unknown) => Number(id)) : [];
    const validIds = requested.filter((id: number) => Number.isFinite(id));
    const courses = validIds.length
      ? await this.prisma.courses.findMany({ where: { id: { in: validIds }, is_active: true } })
      : [];
    const allowedIds = [...new Set(courses.map((course) => course.id))];

    await this.prisma.$executeRaw`
      UPDATE user_courses
      SET is_active = false
      WHERE user_id = CAST(${user.id} AS uuid)
    `;

    for (const courseId of allowedIds) {
      await this.prisma.$executeRaw`
        INSERT INTO user_courses (user_id, course_id, is_active)
        VALUES (CAST(${user.id} AS uuid), ${courseId}, true)
        ON CONFLICT (user_id, course_id)
        DO UPDATE SET is_active = true
      `;
    }

    return this.courses(authorizationHeader);
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

  async publicProfile(id: string) {
    const user = await this.prisma.users.findFirst({
      where: { id, is_active: true },
      include: userInclude,
    });
    if (!user) badRequest("Usuario no encontrado");

    const [uploads, stats] = await Promise.all([
      this.publicUploads(id),
      this.publicStatsForUser(id),
    ]);

    return {
      user: publicUser(user),
      stats,
      uploads: uploads.items,
    };
  }

  async publicUploads(id: string) {
    const items = await this.prisma.resources.findMany({
      where: { user_id: id, is_active: true },
      include: resourceInclude,
      orderBy: { created_at: "desc" },
    });
    return { items: items.map(summarizeResource) };
  }

  async reportUser(authorizationHeader: string | undefined, id: string, input: any) {
    const reporter = await this.auth.readUserFromAuthorization(authorizationHeader);
    if (reporter.id === id) badRequest("No puedes reportarte a vos mismo");

    const reportedUser = await this.prisma.users.findFirst({ where: { id, is_active: true } });
    if (!reportedUser) badRequest("Usuario no encontrado");

    const reason = String(input.reason || "").trim();
    if (!reason) badRequest("El motivo del reporte es requerido");

    const report = await this.prisma.reports.create({
      data: {
        reporter_id: reporter.id,
        reported_user_id: id,
        reason: reason.slice(0, 255),
      },
    });

    return { item: serializeReport(report) };
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

  private async publicStatsForUser(userId: string) {
    const [uploadsCount, uploads, downloadsAgg] = await Promise.all([
      this.prisma.resources.count({ where: { user_id: userId, is_active: true } }),
      this.prisma.resources.findMany({
        where: { user_id: userId, is_active: true },
        select: { id: true },
      }),
      this.prisma.resources.aggregate({
        where: { user_id: userId, is_active: true },
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
      saved: 0,
      ratingsGiven: 0,
      avgRatingReceived: ratingsReceivedAgg._avg.stars
        ? Number(Number(ratingsReceivedAgg._avg.stars).toFixed(1))
        : 0,
      ratingsReceived: ratingsReceivedAgg._count._all || 0,
      totalDownloads: Number(downloadsAgg._sum.downloads_count || 0),
      totalViews: Number(downloadsAgg._sum.views_count || 0),
    };
  }

  private async activeCourseIds(userId: string) {
    await this.ensureUserCoursesTable();
    const rows = await this.prisma.$queryRaw<Array<{ course_id: number }>>`
      SELECT course_id
      FROM user_courses
      WHERE user_id = CAST(${userId} AS uuid)
        AND is_active = true
    `;
    return rows.map((row) => Number(row.course_id));
  }

  private async ensureUserCoursesTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS user_courses (
        user_id UUID NOT NULL,
        course_id INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, course_id),
        CONSTRAINT fk_user_courses_user
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_user_courses_course
          FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      )
    `);
    await this.prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_user_courses_user ON user_courses(user_id)");
    await this.prisma.$executeRawUnsafe("CREATE INDEX IF NOT EXISTS idx_user_courses_course ON user_courses(course_id)");
  }

  private normalizeUsername(value: string) {
    const username = value.trim().toLowerCase();
    if (!/^[a-z0-9_]{3,30}$/.test(username)) {
      badRequest("El username debe tener 3 a 30 caracteres y solo usar letras, numeros o guion bajo");
    }
    return username;
  }
}
