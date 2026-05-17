import { URL } from "node:url";
import { HttpError, badRequest } from "./errors.js";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
};

export async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw badRequest("JSON invalido");
  }
}

export function sendJson(res, status, payload) {
  res.writeHead(status, jsonHeaders);
  res.end(JSON.stringify(payload));
}

export function sendError(res, error) {
  const status = error instanceof HttpError ? error.status : 500;
  sendJson(res, status, {
    error: {
      message: status === 500 ? "Error interno del servidor" : error.message,
      details: error.details,
    },
  });
}

export function parseRequest(req) {
  const url = new URL(req.url || "/", "http://localhost");
  const pathname = url.pathname.replace(/\/+$/, "") || "/";
  return {
    method: req.method || "GET",
    pathname,
    query: Object.fromEntries(url.searchParams.entries()),
  };
}

export function handleOptions(res) {
  res.writeHead(204, jsonHeaders);
  res.end();
}
