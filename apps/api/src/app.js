import crypto from "node:crypto";
import { createServer } from "node:http";
import {
  createResource,
  getResourceOrThrow,
  listResources,
  loginUser,
  publicUser,
  readUserFromToken,
  registerUser,
  resourceDetail,
} from "./domain.js";
import { badRequest, notFound } from "./errors.js";
import { handleOptions, parseRequest, readJson, sendError, sendJson } from "./http.js";

export function createApp(store) {
  return createServer(async (req, res) => {
    try {
      if (req.method === "OPTIONS") return handleOptions(res);

      const data = await store.load();
      const request = parseRequest(req);
      const { method, pathname, query } = request;

      if (method === "GET" && pathname === "/health") {
        return sendJson(res, 200, { status: "ok", service: "vaultio-api" });
      }

      if (method === "POST" && pathname === "/auth/register") {
        const result = registerUser(data, await readJson(req));
        await store.save();
        return sendJson(res, 201, result);
      }

      if (method === "POST" && pathname === "/auth/login") {
        return sendJson(res, 200, loginUser(data, await readJson(req)));
      }

      if (method === "GET" && pathname === "/auth/me") {
        const user = readUserFromToken(data, req.headers.authorization);
        return sendJson(res, 200, { user: publicUser(user) });
      }

      if (method === "GET" && pathname === "/catalog/institutions") {
        return sendJson(res, 200, { items: data.institutions });
      }

      if (method === "GET" && pathname === "/catalog/careers") {
        return sendJson(res, 200, { items: data.careers });
      }

      const careerCoursesMatch = pathname.match(/^\/catalog\/careers\/([^/]+)\/courses$/);
      if (method === "GET" && careerCoursesMatch) {
        const careerId = Number(careerCoursesMatch[1]);
        const items = data.courses
          .filter((course) => course.careerIds.includes(careerId))
          .map((course) => ({
            ...course,
            resourcesCount: data.resources.filter((resource) => resource.courseId === course.id && resource.isActive).length,
          }));
        return sendJson(res, 200, { items });
      }

      if (method === "GET" && pathname === "/catalog/courses") {
        return sendJson(res, 200, { items: data.courses });
      }

      if (method === "GET" && pathname === "/catalog/resource-types") {
        return sendJson(res, 200, { items: data.resourceTypes });
      }

      if (method === "GET" && pathname === "/catalog/academic-periods") {
        return sendJson(res, 200, { items: data.academicPeriods });
      }

      if (method === "GET" && pathname === "/catalog/professors") {
        const courseId = query.courseId ? Number(query.courseId) : null;
        const items = courseId
          ? data.professors.filter((professor) => professor.courseIds.includes(courseId))
          : data.professors;
        return sendJson(res, 200, { items });
      }

      if (method === "GET" && pathname === "/resources") {
        return sendJson(res, 200, { items: listResources(data, query) });
      }

      const resourceMatch = pathname.match(/^\/resources\/([^/]+)$/);
      if (method === "GET" && resourceMatch) {
        const resource = getResourceOrThrow(data, resourceMatch[1]);
        resource.viewsCount += 1;
        await store.save();
        return sendJson(res, 200, { item: resourceDetail(data, resource) });
      }

      if (method === "POST" && pathname === "/resources") {
        const user = readUserFromToken(data, req.headers.authorization);
        const item = createResource(data, user, await readJson(req));
        await store.save();
        return sendJson(res, 201, { item });
      }

      const downloadMatch = pathname.match(/^\/resources\/([^/]+)\/download$/);
      if (method === "POST" && downloadMatch) {
        readUserFromToken(data, req.headers.authorization);
        const resource = getResourceOrThrow(data, downloadMatch[1]);
        resource.downloadsCount += 1;
        await store.save();
        return sendJson(res, 200, { url: resource.fileUrl, downloads: resource.downloadsCount });
      }

      const commentsMatch = pathname.match(/^\/resources\/([^/]+)\/comments$/);
      if (method === "GET" && commentsMatch) {
        getResourceOrThrow(data, commentsMatch[1]);
        const items = data.comments
          .filter((comment) => comment.resourceId === commentsMatch[1] && comment.isActive)
          .map((comment) => ({ ...comment, author: publicUser(data.users.find((user) => user.id === comment.userId)) }));
        return sendJson(res, 200, { items });
      }

      if (method === "POST" && commentsMatch) {
        const user = readUserFromToken(data, req.headers.authorization);
        getResourceOrThrow(data, commentsMatch[1]);
        const body = await readJson(req);
        const content = String(body.content || "").trim();
        if (!content) throw badRequest("El comentario no puede estar vacio");
        const now = new Date().toISOString();
        const comment = {
          id: crypto.randomUUID(),
          resourceId: commentsMatch[1],
          userId: user.id,
          content,
          createdAt: now,
          updatedAt: now,
          isActive: true,
        };
        data.comments.push(comment);
        await store.save();
        return sendJson(res, 201, { item: { ...comment, author: publicUser(user) } });
      }

      throw notFound("Ruta no encontrada");
    } catch (error) {
      sendError(res, error);
    }
  });
}
