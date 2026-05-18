import crypto from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { AuthService } from "../auth/auth.service";
import { badRequest, notFound, unauthorized } from "../common/errors";
import { PrismaService } from "../prisma/prisma.service";
import { resourceDetail, serializeComment, summarizeResource } from "../common/serializers";
import { StorageService } from "../storage/storage.service";

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
  comments: {
    include: {
      users: {
        include: {
          identities: true,
          user_careers: true,
          user_roles: { include: { roles: true } },
        },
      },
      comment_votes: true,
    },
    orderBy: { created_at: "asc" as const },
  },
};

const commentInclude = {
  users: {
    include: {
      identities: true,
      user_careers: true,
      user_roles: { include: { roles: true } },
    },
  },
  comment_votes: true,
};

@Injectable()
export class ResourcesService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AuthService) private readonly auth: AuthService,
    @Inject(StorageService) private readonly storage: StorageService,
  ) {}

  async list(query: any) {
    const where: any = { is_active: true };

    if (query.search) {
      const search = String(query.search).trim();
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { tags: { has: search.toLowerCase() } },
      ];
    }

    if (query.courseId) where.course_id = Number(query.courseId);
    if (query.typeId) where.resource_type_id = Number(query.typeId);
    if (query.careerId) {
      where.courses = {
        course_careers: {
          some: { career_id: Number(query.careerId) },
        },
      };
    }

    const items = await this.prisma.resources.findMany({
      where,
      include: resourceInclude,
      orderBy: { created_at: "desc" },
    });

    return { items: items.map(summarizeResource) };
  }

  async detail(id: string, authorizationHeader?: string) {
    const item = await this.prisma.resources.update({
      where: { id },
      data: { views_count: { increment: 1 } },
      include: resourceInclude,
    }).catch(() => null);

    if (!item?.is_active) notFound("Recurso no encontrado");

    let saved = false;
    let userRating: number | null = null;
    let viewerId: string | null = null;
    if (authorizationHeader) {
      try {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        viewerId = user.id;
        saved = await this.isSavedBy(user.id, id);
        const myRating = await this.prisma.ratings.findUnique({
          where: { user_id_resource_id: { user_id: user.id, resource_id: id } },
        });
        userRating = myRating?.stars ?? null;
      } catch {
        saved = false;
      }
    }

    return { item: { ...resourceDetail(item, viewerId), saved, userRating } };
  }

  async create(authorizationHeader: string | undefined, input: any) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const title = String(input.title || "").trim();
    const description = String(input.description || "").trim();
    const courseId = Number(input.courseId);
    const resourceTypeId = Number(input.resourceTypeId);

    if (!title || !description || !courseId || !resourceTypeId) {
      badRequest("Titulo, descripcion, curso y tipo de recurso son requeridos");
    }

    const [course, resourceType] = await Promise.all([
      this.prisma.courses.findFirst({ where: { id: courseId, is_active: true } }),
      this.prisma.resource_types.findUnique({ where: { id: resourceTypeId } }),
    ]);

    if (!course) badRequest("Curso invalido");
    if (!resourceType) badRequest("Tipo de recurso invalido");

    const originalFilename = String(input.originalFilename || "recurso").trim();
    const extension = originalFilename.includes(".")
      ? originalFilename.split(".").pop()?.toLowerCase() || ""
      : "";
    const id = crypto.randomUUID();

    const providedStorageKey = typeof input.storageKey === "string" ? input.storageKey.trim() : "";
    const storageKey = providedStorageKey || `resources/${user.id}/${id}/${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const storageBucket = String(input.storageBucket || this.storage.bucket);
    const storageProvider = String(input.storageProvider || this.storage.provider);
    const fileUrl = String(input.publicUrl || input.fileUrl || this.storage.publicObjectUrl(storageKey));

    const tags = Array.isArray(input.tags)
      ? input.tags.map(String).map((tag: string) => tag.trim().toLowerCase()).filter(Boolean)
      : String(input.tags || "").split(",").map((tag: string) => tag.trim().toLowerCase()).filter(Boolean);

    const item = await this.prisma.resources.create({
      data: {
        id,
        title,
        description,
        tags,
        storage_provider: storageProvider,
        storage_bucket: storageBucket,
        storage_key: storageKey,
        original_filename: originalFilename,
        mime_type: String(input.mimeType || "application/octet-stream"),
        file_url: fileUrl,
        file_size: BigInt(Number(input.fileSize || 0)),
        file_extension: extension || null,
        upload_status: input.uploadStatus ? String(input.uploadStatus) : "ready",
        professor_id: input.professorId ? Number(input.professorId) : null,
        user_id: user.id,
        academic_period_id: input.academicPeriodId ? Number(input.academicPeriodId) : null,
        course_id: courseId,
        resource_type_id: resourceTypeId,
      },
      include: resourceInclude,
    });

    return { item: resourceDetail(item, user.id) };
  }

  async download(authorizationHeader: string | undefined, id: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
    if (!resource) notFound("Recurso no encontrado");

    await this.prisma.user_downloads.create({
      data: {
        user_id: user.id,
        resource_id: id,
      },
    });

    const hasDownloadTrigger = await this.hasDownloadCounterTrigger();
    const updated = hasDownloadTrigger
      ? await this.prisma.resources.findUniqueOrThrow({ where: { id } })
      : await this.prisma.resources.update({
          where: { id },
          data: { downloads_count: { increment: 1 } },
        });

    let signedUrl: string;
    try {
      signedUrl = await this.storage.createDownloadUrl(resource.storage_key, resource.original_filename);
    } catch {
      signedUrl = resource.file_url || this.storage.publicObjectUrl(resource.storage_key);
    }

    return {
      url: signedUrl,
      downloads: Number(updated.downloads_count),
    };
  }

  async rate(authorizationHeader: string | undefined, id: string, input: any) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
    if (!resource) notFound("Recurso no encontrado");

    const stars = Number(input?.stars);
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
      badRequest("La calificacion debe estar entre 1 y 5");
    }

    const rating = await this.prisma.ratings.upsert({
      where: { user_id_resource_id: { user_id: user.id, resource_id: id } },
      update: { stars },
      create: { user_id: user.id, resource_id: id, stars },
    });

    const aggregate = await this.prisma.ratings.aggregate({
      where: { resource_id: id },
      _avg: { stars: true },
      _count: { _all: true },
    });

    return {
      item: {
        id: rating.id,
        stars: rating.stars,
        createdAt: rating.created_at.toISOString(),
      },
      rating: aggregate._avg.stars ? Number(Number(aggregate._avg.stars).toFixed(1)) : 0,
      ratingsCount: aggregate._count._all,
    };
  }

  async isSavedBy(userId: string, resourceId: string) {
    const row = await this.prisma.saved_resources.findUnique({
      where: { user_id_resource_id: { user_id: userId, resource_id: resourceId } },
    });
    return Boolean(row);
  }

  async save(authorizationHeader: string | undefined, id: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
    if (!resource) notFound("Recurso no encontrado");

    await this.prisma.saved_resources.upsert({
      where: { user_id_resource_id: { user_id: user.id, resource_id: id } },
      update: {},
      create: { user_id: user.id, resource_id: id },
    });

    return { saved: true };
  }

  async unsave(authorizationHeader: string | undefined, id: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    await this.prisma.saved_resources.deleteMany({ where: { user_id: user.id, resource_id: id } });
    return { saved: false };
  }

  async comments(id: string) {
    const resource = await this.prisma.resources.findFirst({
      where: { id, is_active: true },
      include: resourceInclude,
    });
    if (!resource) notFound("Recurso no encontrado");
    return { items: resourceDetail(resource).comments };
  }

  async createComment(authorizationHeader: string | undefined, id: string, input: any) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
    if (!resource) notFound("Recurso no encontrado");

    const content = String(input.content || "").trim();
    if (!content) badRequest("El comentario no puede estar vacio");

    const parentId = typeof input.parentId === "string" && input.parentId.trim() ? input.parentId.trim() : null;
    if (parentId) {
      const parent = await this.prisma.comments.findFirst({
        where: { id: parentId, resource_id: id, is_active: true },
      });
      if (!parent) badRequest("El comentario al que intentas responder no existe");
    }

    const comment = await this.prisma.comments.create({
      data: {
        resource_id: id,
        user_id: user.id,
        content,
        parent_id: parentId,
      },
      include: commentInclude,
    });

    return { item: serializeComment(comment, user.id) };
  }

  async voteComment(authorizationHeader: string | undefined, id: string, commentId: string, input: any) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const voteType = Number(input?.voteType);
    if (![1, -1].includes(voteType)) badRequest("El voto debe ser 1 o -1");

    const comment = await this.prisma.comments.findFirst({
      where: { id: commentId, resource_id: id, is_active: true },
    });
    if (!comment) notFound("Comentario no encontrado");

    await this.prisma.comment_votes.upsert({
      where: { user_id_comment_id: { user_id: user.id, comment_id: commentId } },
      update: { vote_type: voteType },
      create: { user_id: user.id, comment_id: commentId, vote_type: voteType },
    });

    const updated = await this.prisma.comments.findUniqueOrThrow({
      where: { id: commentId },
      include: commentInclude,
    });
    return { item: serializeComment(updated, user.id) };
  }

  async unvoteComment(authorizationHeader: string | undefined, id: string, commentId: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const comment = await this.prisma.comments.findFirst({
      where: { id: commentId, resource_id: id },
    });
    if (!comment) notFound("Comentario no encontrado");

    await this.prisma.comment_votes.deleteMany({ where: { user_id: user.id, comment_id: commentId } });

    const updated = await this.prisma.comments.findUniqueOrThrow({
      where: { id: commentId },
      include: commentInclude,
    });
    return { item: serializeComment(updated, user.id) };
  }

  async deleteComment(authorizationHeader: string | undefined, id: string, commentId: string) {
    const user = await this.auth.readUserFromAuthorization(authorizationHeader);
    const comment = await this.prisma.comments.findFirst({
      where: { id: commentId, resource_id: id },
    });
    if (!comment) notFound("Comentario no encontrado");
    if (comment.user_id !== user.id) unauthorized("Solo puedes eliminar tus comentarios");

    const updated = await this.prisma.comments.update({
      where: { id: commentId },
      data: {
        is_active: false,
        content: "[comentario eliminado]",
        updated_at: new Date(),
      },
      include: commentInclude,
    });

    return { item: serializeComment(updated, user.id) };
  }

  private async hasDownloadCounterTrigger() {
    const rows = await this.prisma.$queryRaw<Array<{ exists: boolean }>>`
      SELECT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_user_downloads_count'
      ) AS exists
    `;
    return rows[0]?.exists === true;
  }
}
