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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesService = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../auth/auth.service");
const errors_1 = require("../common/errors");
const prisma_service_1 = require("../prisma/prisma.service");
const serializers_1 = require("../common/serializers");
const storage_service_1 = require("../storage/storage.service");
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
        orderBy: { created_at: "asc" },
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
let ResourcesService = class ResourcesService {
    prisma;
    auth;
    storage;
    constructor(prisma, auth, storage) {
        this.prisma = prisma;
        this.auth = auth;
        this.storage = storage;
    }
    async list(query) {
        const where = { is_active: true };
        if (query.search) {
            const search = String(query.search).trim();
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { tags: { has: search.toLowerCase() } },
            ];
        }
        if (query.courseId)
            where.course_id = Number(query.courseId);
        if (query.typeId)
            where.resource_type_id = Number(query.typeId);
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
        return { items: items.map(serializers_1.summarizeResource) };
    }
    async detail(id, authorizationHeader) {
        const item = await this.prisma.resources.update({
            where: { id },
            data: { views_count: { increment: 1 } },
            include: resourceInclude,
        }).catch(() => null);
        if (!item?.is_active)
            (0, errors_1.notFound)("Recurso no encontrado");
        let saved = false;
        let userRating = null;
        let viewerId = null;
        if (authorizationHeader) {
            try {
                const user = await this.auth.readUserFromAuthorization(authorizationHeader);
                viewerId = user.id;
                saved = await this.isSavedBy(user.id, id);
                const myRating = await this.prisma.ratings.findUnique({
                    where: { user_id_resource_id: { user_id: user.id, resource_id: id } },
                });
                userRating = myRating?.stars ?? null;
            }
            catch {
                saved = false;
            }
        }
        return { item: { ...(0, serializers_1.resourceDetail)(item, viewerId), saved, userRating } };
    }
    async create(authorizationHeader, input) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const title = String(input.title || "").trim();
        const description = String(input.description || "").trim();
        const courseId = Number(input.courseId);
        const resourceTypeId = Number(input.resourceTypeId);
        if (!title || !description || !courseId || !resourceTypeId) {
            (0, errors_1.badRequest)("Titulo, descripcion, curso y tipo de recurso son requeridos");
        }
        const [course, resourceType] = await Promise.all([
            this.prisma.courses.findFirst({ where: { id: courseId, is_active: true } }),
            this.prisma.resource_types.findUnique({ where: { id: resourceTypeId } }),
        ]);
        if (!course)
            (0, errors_1.badRequest)("Curso invalido");
        if (!resourceType)
            (0, errors_1.badRequest)("Tipo de recurso invalido");
        const originalFilename = String(input.originalFilename || "recurso").trim();
        const extension = originalFilename.includes(".")
            ? originalFilename.split(".").pop()?.toLowerCase() || ""
            : "";
        const id = node_crypto_1.default.randomUUID();
        const providedStorageKey = typeof input.storageKey === "string" ? input.storageKey.trim() : "";
        const storageKey = providedStorageKey || `resources/${user.id}/${id}/${originalFilename.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const storageBucket = String(input.storageBucket || this.storage.bucket);
        const storageProvider = String(input.storageProvider || this.storage.provider);
        const fileUrl = String(input.publicUrl || input.fileUrl || this.storage.publicObjectUrl(storageKey));
        const tags = Array.isArray(input.tags)
            ? input.tags.map(String).map((tag) => tag.trim().toLowerCase()).filter(Boolean)
            : String(input.tags || "").split(",").map((tag) => tag.trim().toLowerCase()).filter(Boolean);
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
        return { item: (0, serializers_1.resourceDetail)(item, user.id) };
    }
    async download(authorizationHeader, id) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
        if (!resource)
            (0, errors_1.notFound)("Recurso no encontrado");
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
        let signedUrl;
        try {
            signedUrl = await this.storage.createDownloadUrl(resource.storage_key, resource.original_filename);
        }
        catch {
            signedUrl = resource.file_url || this.storage.publicObjectUrl(resource.storage_key);
        }
        return {
            url: signedUrl,
            downloads: Number(updated.downloads_count),
        };
    }
    async rate(authorizationHeader, id, input) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
        if (!resource)
            (0, errors_1.notFound)("Recurso no encontrado");
        const stars = Number(input?.stars);
        if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
            (0, errors_1.badRequest)("La calificacion debe estar entre 1 y 5");
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
    async isSavedBy(userId, resourceId) {
        const row = await this.prisma.saved_resources.findUnique({
            where: { user_id_resource_id: { user_id: userId, resource_id: resourceId } },
        });
        return Boolean(row);
    }
    async save(authorizationHeader, id) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
        if (!resource)
            (0, errors_1.notFound)("Recurso no encontrado");
        await this.prisma.saved_resources.upsert({
            where: { user_id_resource_id: { user_id: user.id, resource_id: id } },
            update: {},
            create: { user_id: user.id, resource_id: id },
        });
        return { saved: true };
    }
    async unsave(authorizationHeader, id) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        await this.prisma.saved_resources.deleteMany({ where: { user_id: user.id, resource_id: id } });
        return { saved: false };
    }
    async comments(id) {
        const resource = await this.prisma.resources.findFirst({
            where: { id, is_active: true },
            include: resourceInclude,
        });
        if (!resource)
            (0, errors_1.notFound)("Recurso no encontrado");
        return { items: (0, serializers_1.resourceDetail)(resource).comments };
    }
    async createComment(authorizationHeader, id, input) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const resource = await this.prisma.resources.findFirst({ where: { id, is_active: true } });
        if (!resource)
            (0, errors_1.notFound)("Recurso no encontrado");
        const content = String(input.content || "").trim();
        if (!content)
            (0, errors_1.badRequest)("El comentario no puede estar vacio");
        const parentId = typeof input.parentId === "string" && input.parentId.trim() ? input.parentId.trim() : null;
        if (parentId) {
            const parent = await this.prisma.comments.findFirst({
                where: { id: parentId, resource_id: id, is_active: true },
            });
            if (!parent)
                (0, errors_1.badRequest)("El comentario al que intentas responder no existe");
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
        return { item: (0, serializers_1.serializeComment)(comment, user.id) };
    }
    async voteComment(authorizationHeader, id, commentId, input) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const voteType = Number(input?.voteType);
        if (![1, -1].includes(voteType))
            (0, errors_1.badRequest)("El voto debe ser 1 o -1");
        const comment = await this.prisma.comments.findFirst({
            where: { id: commentId, resource_id: id, is_active: true },
        });
        if (!comment)
            (0, errors_1.notFound)("Comentario no encontrado");
        await this.prisma.comment_votes.upsert({
            where: { user_id_comment_id: { user_id: user.id, comment_id: commentId } },
            update: { vote_type: voteType },
            create: { user_id: user.id, comment_id: commentId, vote_type: voteType },
        });
        const updated = await this.prisma.comments.findUniqueOrThrow({
            where: { id: commentId },
            include: commentInclude,
        });
        return { item: (0, serializers_1.serializeComment)(updated, user.id) };
    }
    async unvoteComment(authorizationHeader, id, commentId) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const comment = await this.prisma.comments.findFirst({
            where: { id: commentId, resource_id: id },
        });
        if (!comment)
            (0, errors_1.notFound)("Comentario no encontrado");
        await this.prisma.comment_votes.deleteMany({ where: { user_id: user.id, comment_id: commentId } });
        const updated = await this.prisma.comments.findUniqueOrThrow({
            where: { id: commentId },
            include: commentInclude,
        });
        return { item: (0, serializers_1.serializeComment)(updated, user.id) };
    }
    async deleteComment(authorizationHeader, id, commentId) {
        const user = await this.auth.readUserFromAuthorization(authorizationHeader);
        const comment = await this.prisma.comments.findFirst({
            where: { id: commentId, resource_id: id },
        });
        if (!comment)
            (0, errors_1.notFound)("Comentario no encontrado");
        if (comment.user_id !== user.id)
            (0, errors_1.unauthorized)("Solo puedes eliminar tus comentarios");
        const updated = await this.prisma.comments.update({
            where: { id: commentId },
            data: {
                is_active: false,
                content: "[comentario eliminado]",
                updated_at: new Date(),
            },
            include: commentInclude,
        });
        return { item: (0, serializers_1.serializeComment)(updated, user.id) };
    }
    async hasDownloadCounterTrigger() {
        const rows = await this.prisma.$queryRaw `
      SELECT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_user_downloads_count'
      ) AS exists
    `;
        return rows[0]?.exists === true;
    }
};
exports.ResourcesService = ResourcesService;
exports.ResourcesService = ResourcesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_service_1.PrismaService)),
    __param(1, (0, common_1.Inject)(auth_service_1.AuthService)),
    __param(2, (0, common_1.Inject)(storage_service_1.StorageService)),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        auth_service_1.AuthService,
        storage_service_1.StorageService])
], ResourcesService);
