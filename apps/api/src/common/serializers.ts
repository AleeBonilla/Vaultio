import { config } from "../config";

export function toNumber(value: bigint | number | null | undefined) {
  if (typeof value === "bigint") return Number(value);
  return value ?? undefined;
}

function normalizePhotoUrl(value: string | null | undefined) {
  if (!value) return null;
  const publicPrefix = `${config.storage.publicEndpoint.replace(/\/+$/, "")}/${config.storage.bucket}/`;
  if (value.startsWith(publicPrefix)) {
    const [key] = value.slice(publicPrefix.length).split("?");
    return `${config.publicUrl.replace(/\/+$/, "")}/storage/public?key=${encodeURIComponent(key)}`;
  }
  return value;
}

export function publicUser(user: any) {
  if (!user) return null;
  const email = user.identities?.[0]?.email || user.email || "";
  const role = user.user_roles?.find((item: any) => item.is_active)?.roles?.name || user.role || "estudiante";

  return {
    id: user.id,
    username: user.username,
    firstName: user.first_name ?? user.firstName,
    lastName: user.last_name ?? user.lastName,
    email,
    role,
    careerIds:
      user.user_careers?.filter((item: any) => item.is_active).map((item: any) => item.career_id) ||
      user.careerIds ||
      [],
    courseIds:
      user.user_courses?.filter((item: any) => item.is_active).map((item: any) => item.course_id) ||
      user.courseIds ||
      [],
    reputationScore: user.reputation_score ?? user.reputationScore ?? 0,
    photoUrl: normalizePhotoUrl(user.photo_url),
    bio: user.bio ?? null,
    createdAt: user.created_at instanceof Date ? user.created_at.toISOString() : user.createdAt,
  };
}

export function serializeComment(comment: any, viewerId?: string | null) {
  const votes = comment.comment_votes || [];
  const likes = votes.filter((vote: any) => Number(vote.vote_type) === 1).length;
  const dislikes = votes.filter((vote: any) => Number(vote.vote_type) === -1).length;
  const userVote = viewerId ? (votes.find((vote: any) => vote.user_id === viewerId)?.vote_type ?? 0) : 0;
  const isDeleted = comment.is_active === false;

  return {
    id: comment.id,
    resourceId: comment.resource_id,
    userId: comment.user_id,
    parentId: comment.parent_id ?? null,
    content: isDeleted ? "[comentario eliminado]" : comment.content,
    createdAt: comment.created_at instanceof Date ? comment.created_at.toISOString() : comment.created_at,
    updatedAt: comment.updated_at instanceof Date ? comment.updated_at.toISOString() : comment.updated_at,
    isActive: comment.is_active,
    isDeleted,
    likes,
    dislikes,
    userVote,
    author: isDeleted ? null : publicUser(comment.users),
  };
}

export function serializeReport(report: any) {
  return {
    id: report.id,
    reason: report.reason,
    status: report.status,
    createdAt: report.created_at instanceof Date ? report.created_at.toISOString() : report.created_at,
    reportedUserId: report.reported_user_id,
    resourceId: report.resource_id,
    commentId: report.comment_id,
  };
}

export function serializeCourse(course: any) {
  return {
    id: course.id,
    code: course.code,
    name: course.name,
    careerIds: course.course_careers?.map((item: any) => item.career_id) || course.careerIds || [],
    resourcesCount:
      course.resourcesCount ??
      course._count?.resources ??
      course.resources?.filter((resource: any) => resource.is_active).length,
  };
}

export function summarizeResource(resource: any) {
  const ratings = resource.ratings || [];
  const avgRating = ratings.length
    ? ratings.reduce((sum: number, item: any) => sum + Number(item.stars), 0) / ratings.length
    : 0;

  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    tags: resource.tags || [],
    courseId: resource.course_id,
    courseCode: resource.courses?.code,
    course: resource.courses?.name || "Curso no disponible",
    resourceTypeId: resource.resource_type_id,
    type: resource.resource_types?.name || "Recurso",
    rating: Number(avgRating.toFixed(1)),
    ratingsCount: ratings.length,
    downloads: toNumber(resource.downloads_count) || 0,
    views: toNumber(resource.views_count) || 0,
    author: resource.users
      ? `${resource.users.first_name} ${resource.users.last_name}`
      : "Usuario desconocido",
    authorId: resource.user_id,
    date: resource.created_at instanceof Date ? resource.created_at.toISOString() : resource.created_at,
    professorId: resource.professor_id,
    professor: resource.professors
      ? `${resource.professors.first_name} ${resource.professors.last_name}`
      : null,
    fileExtension: resource.file_extension,
    fileSize: toNumber(resource.file_size),
  };
}

export function resourceDetail(resource: any, viewerId?: string | null) {
  return {
    ...summarizeResource(resource),
    storageProvider: resource.storage_provider,
    storageBucket: resource.storage_bucket,
    storageKey: resource.storage_key,
    originalFilename: resource.original_filename,
    mimeType: resource.mime_type,
    fileUrl: resource.file_url,
    academicPeriod: resource.academic_periods
      ? {
          id: resource.academic_periods.id,
          name: resource.academic_periods.name,
          year: resource.academic_periods.year,
          institutionId: resource.academic_periods.institution_id,
        }
      : null,
    comments: resource.comments?.map((comment: any) => serializeComment(comment, viewerId)) || [],
  };
}
