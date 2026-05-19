import assert from "node:assert/strict";
process.env.NODE_ENV = "test";
process.env.VAULTIO_ALLOW_DEMO_TOKENS = "true";
import { describe, it, before, after } from "node:test";
import { INestApplication } from "@nestjs/common";

async function request(baseUrl: string, pathName: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = (await response.json()) as any;
  return { response, body };
}

async function loginAs(baseUrl: string, email: string) {
  const { body } = await request(baseUrl, "/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password: "demo123" }),
  });
  return body.token as string;
}

function authHeaders(token: string) {
  return { authorization: `Bearer ${token}` };
}

describe("Vaultio API", () => {
  let app: INestApplication;
  let baseUrl: string;
  let PrismaServiceToken: any;
  const createdResourceIds: string[] = [];
  const createdCommentIds: string[] = [];

  before(async () => {
    const [{ createNestApp }, { PrismaService }] = await Promise.all([
      import("../src/main.js"),
      import("../src/prisma/prisma.service.js"),
    ]);
    PrismaServiceToken = PrismaService;
    app = await createNestApp();
    await app.listen(0);
    const server = app.getHttpServer();
    const address = server.address();
    const port = typeof address === "object" && address ? address.port : 0;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(async () => {
    const prisma = app.get(PrismaServiceToken);
    if (createdCommentIds.length) {
      await prisma.comments.deleteMany({ where: { id: { in: createdCommentIds } } });
    }
    if (createdResourceIds.length) {
      await prisma.resources.deleteMany({ where: { id: { in: createdResourceIds } } });
    }
    // Limpia ratings/saved creados por tests
    await prisma.ratings.deleteMany({ where: { resource_id: { in: ["33333333-3333-4333-8333-333333333333"] } } });
    await prisma.saved_resources.deleteMany({ where: { resource_id: { in: ["33333333-3333-4333-8333-333333333333"] } } });
    await app.close();
  });

  it("responde health check", async () => {
    const { response, body } = await request(baseUrl, "/health");
    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
  });

  it("expone stats publicas", async () => {
    const { response, body } = await request(baseUrl, "/stats");
    assert.equal(response.status, 200);
    assert.ok(typeof body.users === "number" && body.users >= 0);
    assert.ok(typeof body.resources === "number" && body.resources >= 0);
  });

  it("lista catalogos y cursos por carrera", async () => {
    const careers = await request(baseUrl, "/catalog/careers");
    assert.equal(careers.response.status, 200);
    assert.ok(careers.body.items.length >= 1);

    const courses = await request(baseUrl, "/catalog/careers/1/courses");
    assert.equal(courses.response.status, 200);
    assert.ok(courses.body.items.some((course: any) => course.code === "IC-2001"));
  });

  it("autentica usuario y protege /auth/me", async () => {
    const token = await loginAs(baseUrl, "maria@estudiantec.cr");
    assert.ok(token);

    const me = await request(baseUrl, "/auth/me", { headers: authHeaders(token) });
    assert.equal(me.response.status, 200);
    assert.equal(me.body.user.email, "maria@estudiantec.cr");
  });

  it("rechaza /auth/me sin token", async () => {
    const me = await request(baseUrl, "/auth/me");
    assert.equal(me.response.status, 401);
  });

  it("expone /users/me y permite PATCH propio", async () => {
    const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
    const headers = authHeaders(token);

    const me = await request(baseUrl, "/users/me", { headers });
    assert.equal(me.response.status, 200);
    assert.equal(me.body.user.email, "carlos@estudiantec.cr");

    const patched = await request(baseUrl, "/users/me", {
      method: "PATCH",
      headers,
      body: JSON.stringify({ bio: "Comparto material de Diseño de Software." }),
    });
    assert.equal(patched.response.status, 200);
    assert.equal(patched.body.user.bio, "Comparto material de Diseño de Software.");
  });

  it("lista, detalla y registra descarga de recursos", async () => {
    const token = await loginAs(baseUrl, "maria@estudiantec.cr");

    const resources = await request(baseUrl, "/resources?search=examen");
    assert.equal(resources.response.status, 200);
    assert.ok(resources.body.items.length >= 1);

    const resourceId = resources.body.items[0].id;
    const detail = await request(baseUrl, `/resources/${resourceId}`);
    assert.equal(detail.response.status, 200);

    const download = await request(baseUrl, `/resources/${resourceId}/download`, {
      method: "POST",
      headers: authHeaders(token),
    });
    assert.equal(download.response.status, 200);
    assert.ok(typeof download.body.url === "string" && download.body.url.length > 0);
    assert.ok(download.body.downloads > detail.body.item.downloads);
  });

  it("crea recursos validos con metadata de storage", async () => {
    const token = await loginAs(baseUrl, "carlos@estudiantec.cr");

    const created = await request(baseUrl, "/resources", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        title: "Resumen de Diseno de Software",
        description: "Material de repaso para arquitectura, patrones y pruebas.",
        courseId: 6,
        resourceTypeId: 3,
        academicPeriodId: 3,
        professorId: 1,
        tags: ["diseno", "arquitectura"],
        originalFilename: "resumen-diseno.pdf",
        storageProvider: "minio",
        storageBucket: "vaultio-demo",
        storageKey: "resources/test/resumen-diseno.pdf",
        mimeType: "application/pdf",
        fileSize: 12345,
      }),
    });

    assert.equal(created.response.status, 201);
    createdResourceIds.push(created.body.item.id);
    assert.equal(created.body.item.courseId, 6);
    assert.equal(created.body.item.type, "Resumenes");

    const linkResource = await request(baseUrl, "/resources", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify({
        title: "Repositorio de apoyo",
        description: "Enlace externo con material complementario.",
        courseId: 6,
        resourceTypeId: 1,
        tags: ["link", "repo"],
        externalUrl: `https://example.com/vaultio-test-${Date.now()}`,
      }),
    });

    assert.equal(linkResource.response.status, 201);
    createdResourceIds.push(linkResource.body.item.id);
    assert.equal(linkResource.body.item.storageProvider, "external");
    assert.equal(linkResource.body.item.fileExtension, "link");
  });

  it("guarda y desmarca recursos via /resources/:id/save", async () => {
    const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
    const headers = authHeaders(token);

    const seededResourceId = "33333333-3333-4333-8333-333333333333"; // r-1 del seed
    const save = await request(baseUrl, `/resources/${seededResourceId}/save`, { method: "POST", headers });
    assert.equal(save.response.status, 200);
    assert.equal(save.body.saved, true);

    const list = await request(baseUrl, "/users/me/saved", { headers });
    assert.ok(list.body.items.some((item: any) => item.id === seededResourceId));

    const unsave = await request(baseUrl, `/resources/${seededResourceId}/save`, { method: "DELETE", headers });
    assert.equal(unsave.body.saved, false);
  });

  it("permite calificar y reemplaza rating previo del mismo usuario", async () => {
    const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
    const headers = authHeaders(token);

    const seededResourceId = "33333333-3333-4333-8333-333333333333";
    const first = await request(baseUrl, `/resources/${seededResourceId}/ratings`, {
      method: "POST",
      headers,
      body: JSON.stringify({ stars: 3 }),
    });
    assert.equal(first.response.status, 201);
    assert.equal(first.body.item.stars, 3);

    const second = await request(baseUrl, `/resources/${seededResourceId}/ratings`, {
      method: "POST",
      headers,
      body: JSON.stringify({ stars: 5 }),
    });
    assert.equal(second.body.item.stars, 5);
    assert.equal(first.body.item.id, second.body.item.id);
    assert.ok(second.body.rating >= 1 && second.body.rating <= 5);
  });

  it("comenta sobre un recurso y luego lo lista", async () => {
    const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
    const headers = authHeaders(token);

    const seededResourceId = "44444444-4444-4444-8444-444444444444"; // r-2 del seed
    const created = await request(baseUrl, `/resources/${seededResourceId}/comments`, {
      method: "POST",
      headers,
      body: JSON.stringify({ content: "Excelente apunte, gracias." }),
    });
    assert.equal(created.response.status, 201);
    createdCommentIds.push(created.body.item.id);
    assert.equal(created.body.item.content, "Excelente apunte, gracias.");

    const list = await request(baseUrl, `/resources/${seededResourceId}/comments`);
    assert.ok(list.body.items.some((comment: any) => comment.id === created.body.item.id));
  });

  it("calcula stats del usuario", async () => {
    const token = await loginAs(baseUrl, "maria@estudiantec.cr");
    const headers = authHeaders(token);

    const stats = await request(baseUrl, "/users/me/stats", { headers });
    assert.equal(stats.response.status, 200);
    assert.ok(typeof stats.body.uploads === "number");
    assert.ok(typeof stats.body.avgRatingReceived === "number");
  });
});
