"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const strict_1 = __importDefault(require("node:assert/strict"));
process.env.NODE_ENV = "test";
process.env.VAULTIO_ALLOW_DEMO_TOKENS = "true";
const node_test_1 = require("node:test");
async function request(baseUrl, pathName, options = {}) {
    const response = await fetch(`${baseUrl}${pathName}`, {
        ...options,
        headers: {
            "content-type": "application/json",
            ...(options.headers || {}),
        },
    });
    const body = (await response.json());
    return { response, body };
}
async function loginAs(baseUrl, email) {
    const { body } = await request(baseUrl, "/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password: "demo123" }),
    });
    return body.token;
}
function authHeaders(token) {
    return { authorization: `Bearer ${token}` };
}
(0, node_test_1.describe)("Vaultio API", () => {
    let app;
    let baseUrl;
    let PrismaServiceToken;
    const createdResourceIds = [];
    const createdCommentIds = [];
    (0, node_test_1.before)(async () => {
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
    (0, node_test_1.after)(async () => {
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
    (0, node_test_1.it)("responde health check", async () => {
        const { response, body } = await request(baseUrl, "/health");
        strict_1.default.equal(response.status, 200);
        strict_1.default.equal(body.status, "ok");
    });
    (0, node_test_1.it)("expone stats publicas", async () => {
        const { response, body } = await request(baseUrl, "/stats");
        strict_1.default.equal(response.status, 200);
        strict_1.default.ok(typeof body.users === "number" && body.users >= 0);
        strict_1.default.ok(typeof body.resources === "number" && body.resources >= 0);
    });
    (0, node_test_1.it)("lista catalogos y cursos por carrera", async () => {
        const careers = await request(baseUrl, "/catalog/careers");
        strict_1.default.equal(careers.response.status, 200);
        strict_1.default.ok(careers.body.items.length >= 1);
        const courses = await request(baseUrl, "/catalog/careers/1/courses");
        strict_1.default.equal(courses.response.status, 200);
        strict_1.default.ok(courses.body.items.some((course) => course.code === "IC-2001"));
    });
    (0, node_test_1.it)("autentica usuario y protege /auth/me", async () => {
        const token = await loginAs(baseUrl, "maria@estudiantec.cr");
        strict_1.default.ok(token);
        const me = await request(baseUrl, "/auth/me", { headers: authHeaders(token) });
        strict_1.default.equal(me.response.status, 200);
        strict_1.default.equal(me.body.user.email, "maria@estudiantec.cr");
    });
    (0, node_test_1.it)("rechaza /auth/me sin token", async () => {
        const me = await request(baseUrl, "/auth/me");
        strict_1.default.equal(me.response.status, 401);
    });
    (0, node_test_1.it)("expone /users/me y permite PATCH propio", async () => {
        const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
        const headers = authHeaders(token);
        const me = await request(baseUrl, "/users/me", { headers });
        strict_1.default.equal(me.response.status, 200);
        strict_1.default.equal(me.body.user.email, "carlos@estudiantec.cr");
        const patched = await request(baseUrl, "/users/me", {
            method: "PATCH",
            headers,
            body: JSON.stringify({ bio: "Comparto material de Diseño de Software." }),
        });
        strict_1.default.equal(patched.response.status, 200);
        strict_1.default.equal(patched.body.user.bio, "Comparto material de Diseño de Software.");
    });
    (0, node_test_1.it)("lista, detalla y registra descarga de recursos", async () => {
        const token = await loginAs(baseUrl, "maria@estudiantec.cr");
        const resources = await request(baseUrl, "/resources?search=examen");
        strict_1.default.equal(resources.response.status, 200);
        strict_1.default.ok(resources.body.items.length >= 1);
        const resourceId = resources.body.items[0].id;
        const detail = await request(baseUrl, `/resources/${resourceId}`);
        strict_1.default.equal(detail.response.status, 200);
        const download = await request(baseUrl, `/resources/${resourceId}/download`, {
            method: "POST",
            headers: authHeaders(token),
        });
        strict_1.default.equal(download.response.status, 200);
        strict_1.default.ok(typeof download.body.url === "string" && download.body.url.length > 0);
        strict_1.default.ok(download.body.downloads > detail.body.item.downloads);
    });
    (0, node_test_1.it)("crea recursos validos con metadata de storage", async () => {
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
        strict_1.default.equal(created.response.status, 201);
        createdResourceIds.push(created.body.item.id);
        strict_1.default.equal(created.body.item.courseId, 6);
        strict_1.default.equal(created.body.item.type, "Resumenes");
    });
    (0, node_test_1.it)("guarda y desmarca recursos via /resources/:id/save", async () => {
        const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
        const headers = authHeaders(token);
        const seededResourceId = "33333333-3333-4333-8333-333333333333"; // r-1 del seed
        const save = await request(baseUrl, `/resources/${seededResourceId}/save`, { method: "POST", headers });
        strict_1.default.equal(save.response.status, 200);
        strict_1.default.equal(save.body.saved, true);
        const list = await request(baseUrl, "/users/me/saved", { headers });
        strict_1.default.ok(list.body.items.some((item) => item.id === seededResourceId));
        const unsave = await request(baseUrl, `/resources/${seededResourceId}/save`, { method: "DELETE", headers });
        strict_1.default.equal(unsave.body.saved, false);
    });
    (0, node_test_1.it)("permite calificar y reemplaza rating previo del mismo usuario", async () => {
        const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
        const headers = authHeaders(token);
        const seededResourceId = "33333333-3333-4333-8333-333333333333";
        const first = await request(baseUrl, `/resources/${seededResourceId}/ratings`, {
            method: "POST",
            headers,
            body: JSON.stringify({ stars: 3 }),
        });
        strict_1.default.equal(first.response.status, 201);
        strict_1.default.equal(first.body.item.stars, 3);
        const second = await request(baseUrl, `/resources/${seededResourceId}/ratings`, {
            method: "POST",
            headers,
            body: JSON.stringify({ stars: 5 }),
        });
        strict_1.default.equal(second.body.item.stars, 5);
        strict_1.default.equal(first.body.item.id, second.body.item.id);
        strict_1.default.ok(second.body.rating >= 1 && second.body.rating <= 5);
    });
    (0, node_test_1.it)("comenta sobre un recurso y luego lo lista", async () => {
        const token = await loginAs(baseUrl, "carlos@estudiantec.cr");
        const headers = authHeaders(token);
        const seededResourceId = "44444444-4444-4444-8444-444444444444"; // r-2 del seed
        const created = await request(baseUrl, `/resources/${seededResourceId}/comments`, {
            method: "POST",
            headers,
            body: JSON.stringify({ content: "Excelente apunte, gracias." }),
        });
        strict_1.default.equal(created.response.status, 201);
        createdCommentIds.push(created.body.item.id);
        strict_1.default.equal(created.body.item.content, "Excelente apunte, gracias.");
        const list = await request(baseUrl, `/resources/${seededResourceId}/comments`);
        strict_1.default.ok(list.body.items.some((comment) => comment.id === created.body.item.id));
    });
    (0, node_test_1.it)("calcula stats del usuario", async () => {
        const token = await loginAs(baseUrl, "maria@estudiantec.cr");
        const headers = authHeaders(token);
        const stats = await request(baseUrl, "/users/me/stats", { headers });
        strict_1.default.equal(stats.response.status, 200);
        strict_1.default.ok(typeof stats.body.uploads === "number");
        strict_1.default.ok(typeof stats.body.avgRatingReceived === "number");
    });
});
