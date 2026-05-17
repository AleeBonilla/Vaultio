import crypto from "node:crypto";
import { badRequest, notFound, unauthorized } from "./errors.js";

export function publicUser(user) {
  if (!user) return null;
  const { password: _password, ...safeUser } = user;
  return safeUser;
}

export function createToken(user) {
  return Buffer.from(JSON.stringify({ sub: user.id, email: user.email }), "utf8").toString("base64url");
}

export function readUserFromToken(data, authorizationHeader) {
  if (!authorizationHeader) throw unauthorized();
  const [scheme, token] = authorizationHeader.split(" ");
  if (scheme !== "Bearer" || !token) throw unauthorized("Token invalido");

  try {
    const payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
    const user = data.users.find((candidate) => candidate.id === payload.sub);
    if (!user) throw unauthorized("Usuario no encontrado");
    return user;
  } catch {
    throw unauthorized("Token invalido");
  }
}

export function summarizeResource(data, resource) {
  const course = data.courses.find((item) => item.id === resource.courseId);
  const type = data.resourceTypes.find((item) => item.id === resource.resourceTypeId);
  const professor = data.professors.find((item) => item.id === resource.professorId);
  const author = data.users.find((item) => item.id === resource.userId);
  const ratings = data.ratings.filter((item) => item.resourceId === resource.id);
  const avgRating = ratings.length ? ratings.reduce((sum, item) => sum + item.stars, 0) / ratings.length : 0;

  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    tags: resource.tags,
    courseId: resource.courseId,
    courseCode: course?.code,
    course: course?.name || "Curso no disponible",
    resourceTypeId: resource.resourceTypeId,
    type: type?.name || "Recurso",
    rating: Number(avgRating.toFixed(1)),
    ratingsCount: ratings.length,
    downloads: resource.downloadsCount,
    views: resource.viewsCount,
    author: author ? `${author.firstName} ${author.lastName}` : "Usuario desconocido",
    authorId: resource.userId,
    date: resource.createdAt,
    professor: professor ? `${professor.firstName} ${professor.lastName}` : null,
    fileExtension: resource.fileExtension,
    fileSize: resource.fileSize,
  };
}

export function resourceDetail(data, resource) {
  const period = data.academicPeriods.find((item) => item.id === resource.academicPeriodId);
  const comments = data.comments
    .filter((comment) => comment.resourceId === resource.id && comment.isActive)
    .map((comment) => ({
      ...comment,
      author: publicUser(data.users.find((user) => user.id === comment.userId)),
    }));

  return {
    ...summarizeResource(data, resource),
    storageProvider: resource.storageProvider,
    storageBucket: resource.storageBucket,
    storageKey: resource.storageKey,
    originalFilename: resource.originalFilename,
    mimeType: resource.mimeType,
    fileUrl: resource.fileUrl,
    academicPeriod: period || null,
    comments,
  };
}

export function listResources(data, query) {
  let resources = data.resources.filter((resource) => resource.isActive);

  if (query.search) {
    const search = String(query.search).toLowerCase();
    resources = resources.filter((resource) => {
      return [
        resource.title,
        resource.description,
        ...(resource.tags || []),
      ].some((value) => String(value).toLowerCase().includes(search));
    });
  }

  if (query.courseId) resources = resources.filter((resource) => String(resource.courseId) === String(query.courseId));
  if (query.careerId) {
    const courseIds = data.courses
      .filter((course) => course.careerIds.includes(Number(query.careerId)))
      .map((course) => course.id);
    resources = resources.filter((resource) => courseIds.includes(resource.courseId));
  }
  if (query.typeId) resources = resources.filter((resource) => String(resource.resourceTypeId) === String(query.typeId));

  return resources
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
    .map((resource) => summarizeResource(data, resource));
}

export function getResourceOrThrow(data, resourceId) {
  const resource = data.resources.find((item) => item.id === resourceId && item.isActive);
  if (!resource) throw notFound("Recurso no encontrado");
  return resource;
}

export function registerUser(data, input) {
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const firstName = String(input.firstName || "").trim();
  const lastName = String(input.lastName || "").trim();

  if (!email || !password || !firstName || !lastName) {
    throw badRequest("Nombre, apellido, correo y contrasena son requeridos");
  }
  if (!email.endsWith("@estudiantec.cr")) {
    throw badRequest("El correo debe pertenecer al dominio estudiantec.cr");
  }
  if (data.users.some((user) => user.email.toLowerCase() === email)) {
    throw badRequest("Ya existe un usuario con ese correo");
  }

  const user = {
    id: crypto.randomUUID(),
    username: email.split("@")[0],
    firstName,
    lastName,
    email,
    password,
    role: "estudiante",
    careerIds: input.careerId ? [Number(input.careerId)] : [],
    reputationScore: 0,
    createdAt: new Date().toISOString(),
  };

  data.users.push(user);
  return { user: publicUser(user), token: createToken(user) };
}

export function loginUser(data, input) {
  const email = String(input.email || "").trim().toLowerCase();
  const password = String(input.password || "");
  const user = data.users.find((candidate) => candidate.email.toLowerCase() === email && candidate.password === password);
  if (!user) throw unauthorized("Credenciales invalidas");
  return { user: publicUser(user), token: createToken(user) };
}

export function createResource(data, user, input) {
  const title = String(input.title || "").trim();
  const description = String(input.description || "").trim();
  const courseId = Number(input.courseId);
  const resourceTypeId = Number(input.resourceTypeId);

  if (!title || !description || !courseId || !resourceTypeId) {
    throw badRequest("Titulo, descripcion, curso y tipo de recurso son requeridos");
  }
  if (!data.courses.some((course) => course.id === courseId)) throw badRequest("Curso invalido");
  if (!data.resourceTypes.some((type) => type.id === resourceTypeId)) throw badRequest("Tipo de recurso invalido");

  const now = new Date().toISOString();
  const originalFilename = String(input.originalFilename || "recurso.pdf").trim();
  const extension = originalFilename.includes(".") ? originalFilename.split(".").pop().toLowerCase() : "pdf";
  const id = crypto.randomUUID();
  const storageKey = `resources/${id}/${originalFilename}`;
  const tags = Array.isArray(input.tags)
    ? input.tags.map(String).map((tag) => tag.trim()).filter(Boolean)
    : String(input.tags || "").split(",").map((tag) => tag.trim()).filter(Boolean);

  const resource = {
    id,
    title,
    description,
    tags,
    storageProvider: "firebase_storage",
    storageBucket: String(input.storageBucket || "vaultio-demo"),
    storageKey,
    originalFilename,
    mimeType: String(input.mimeType || "application/pdf"),
    fileUrl: String(input.fileUrl || `https://example.com/${storageKey}`),
    fileSize: Number(input.fileSize || 1),
    fileExtension: extension,
    viewsCount: 0,
    downloadsCount: 0,
    createdAt: now,
    updatedAt: now,
    isActive: true,
    professorId: input.professorId ? Number(input.professorId) : null,
    userId: user.id,
    academicPeriodId: input.academicPeriodId ? Number(input.academicPeriodId) : null,
    courseId,
    resourceTypeId,
  };

  data.resources.push(resource);
  return resourceDetail(data, resource);
}
