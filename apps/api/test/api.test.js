import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { createApp } from "../src/app.js";
import { Store } from "../src/store.js";

async function startTestServer() {
  const dir = await mkdtemp(path.join(tmpdir(), "vaultio-api-"));
  const store = new Store(path.join(dir, "db.json"));
  await store.reset();
  const server = createApp(store);
  await new Promise((resolve) => server.listen(0, resolve));
  const { port } = server.address();
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}

async function request(baseUrl, pathName, options = {}) {
  const response = await fetch(`${baseUrl}${pathName}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {}),
    },
  });
  const body = await response.json();
  return { response, body };
}

describe("Vaultio API", () => {
  let api;

  before(async () => {
    api = await startTestServer();
  });

  after(async () => {
    await api.close();
  });

  it("responde health check", async () => {
    const { response, body } = await request(api.baseUrl, "/health");
    assert.equal(response.status, 200);
    assert.equal(body.status, "ok");
  });

  it("lista catalogos y cursos por carrera", async () => {
    const careers = await request(api.baseUrl, "/catalog/careers");
    assert.equal(careers.response.status, 200);
    assert.ok(careers.body.items.length >= 1);

    const courses = await request(api.baseUrl, "/catalog/careers/1/courses");
    assert.equal(courses.response.status, 200);
    assert.ok(courses.body.items.some((course) => course.code === "IC-2001"));
  });

  it("autentica usuario demo y protege /auth/me", async () => {
    const login = await request(api.baseUrl, "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "maria@estudiantec.cr", password: "demo123" }),
    });

    assert.equal(login.response.status, 200);
    assert.ok(login.body.token);

    const me = await request(api.baseUrl, "/auth/me", {
      headers: { authorization: `Bearer ${login.body.token}` },
    });

    assert.equal(me.response.status, 200);
    assert.equal(me.body.user.email, "maria@estudiantec.cr");
    assert.equal(me.body.user.password, undefined);
  });

  it("lista, detalla y registra descarga de recursos", async () => {
    const login = await request(api.baseUrl, "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "maria@estudiantec.cr", password: "demo123" }),
    });

    const resources = await request(api.baseUrl, "/resources?search=examen");
    assert.equal(resources.response.status, 200);
    assert.ok(resources.body.items.length >= 1);

    const resourceId = resources.body.items[0].id;
    const detail = await request(api.baseUrl, `/resources/${resourceId}`);
    assert.equal(detail.response.status, 200);
    assert.equal(detail.body.item.id, resourceId);

    const download = await request(api.baseUrl, `/resources/${resourceId}/download`, {
      method: "POST",
      headers: { authorization: `Bearer ${login.body.token}` },
    });
    assert.equal(download.response.status, 200);
    assert.ok(download.body.downloads > detail.body.item.downloads);
  });

  it("crea recursos validos", async () => {
    const login = await request(api.baseUrl, "/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "carlos@estudiantec.cr", password: "demo123" }),
    });

    const created = await request(api.baseUrl, "/resources", {
      method: "POST",
      headers: { authorization: `Bearer ${login.body.token}` },
      body: JSON.stringify({
        title: "Resumen de Diseno de Software",
        description: "Material de repaso para arquitectura, patrones y pruebas.",
        courseId: 6,
        resourceTypeId: 3,
        academicPeriodId: 3,
        professorId: 1,
        tags: ["diseno", "arquitectura"],
        originalFilename: "resumen-diseno.pdf",
      }),
    });

    assert.equal(created.response.status, 201);
    assert.equal(created.body.item.courseId, 6);
    assert.equal(created.body.item.type, "Resumenes");
  });
});
